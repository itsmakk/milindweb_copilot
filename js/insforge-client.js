/**
 * InsForge client wrapper for the static site.
 *
 * Loaded as a classic <script src="js/insforge-client.js" defer></script>.
 * Exposes `window.MW_INS` with login, signup, logout, fetch, user.
 *
 * The client is bootstrapped on first call to `init()`, which fetches
 * /api/v1/auth/discovery to get the InsForge base URL + anon key.
 *
 * Usage:
 *   const user = await MW_INS.user();
 *   await MW_INS.signIn('me@example.com', 'hunter2');
 *   const data = await MW_INS.fetch('/portfolio/landing');
 *   await MW_INS.signOut();
 */
(function () {
  'use strict';

  /** @type {Promise<{baseUrl:string, anonKey:string}>|null} */
  let configPromise = null;
  /** @type {string|null} */
  let accessToken = null;
  /** @type {{id:string,email:string,name?:string}|null} */
  let userCache = null;

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function storageSet(key, val) {
    try { if (val == null) localStorage.removeItem(key); else localStorage.setItem(key, val); } catch (_) {}
  }

  async function getConfig() {
    if (configPromise) return configPromise;
    configPromise = (async () => {
      const r = await fetch('/api/v1/auth/discovery', { credentials: 'include' });
      if (!r.ok) throw new Error('Failed to load auth config (' + r.status + ')');
      const json = await r.json();
      const d = json.data || json;
      if (d.driver !== 'insforge') {
        throw new Error("Auth driver is '" + d.driver + "', not 'insforge' — set AUTH_DRIVER=insforge on the API");
      }
      if (!d.base_url || !d.anon_key) {
        throw new Error('Discovery did not return base_url / anon_key');
      }
      return { baseUrl: d.base_url.replace(/\/$/, ''), anonKey: d.anon_key };
    })();
    return configPromise;
  }

  /**
   * Sign in with email + password against the InsForge REST API.
   * Stores access_token in localStorage and caches the user.
   */
  async function signIn(email, password) {
    const { baseUrl, anonKey } = await getConfig();
    const r = await fetch(baseUrl + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anonKey },
      body: JSON.stringify({ email, password }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = body.error_description || body.error || body.message || ('HTTP ' + r.status);
      throw new Error('Sign-in failed: ' + msg);
    }
    accessToken = body.access_token;
    storageSet('mw_ins_access_token', accessToken);
    if (body.refresh_token) storageSet('mw_ins_refresh_token', body.refresh_token);
    if (body.expires_in) storageSet('mw_ins_expires_at', String(Date.now() + body.expires_in * 1000));
    userCache = body.user || null;
    return userCache;
  }

  /** Sign up with email + password. Calls /auth/v1/signup. */
  async function signUp(email, password, metadata) {
    const { baseUrl, anonKey } = await getConfig();
    const r = await fetch(baseUrl + '/auth/v1/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anonKey },
      body: JSON.stringify({ email, password, data: metadata || {} }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = body.error_description || body.error || body.message || ('HTTP ' + r.status);
      throw new Error('Sign-up failed: ' + msg);
    }
    // Some InsForge plans auto-confirm; some require email verification.
    if (body.access_token) {
      accessToken = body.access_token;
      storageSet('mw_ins_access_token', accessToken);
      if (body.refresh_token) storageSet('mw_ins_refresh_token', body.refresh_token);
      if (body.expires_in) storageSet('mw_ins_expires_at', String(Date.now() + body.expires_in * 1000));
      userCache = body.user || null;
    }
    return body;
  }

  /** OAuth sign-in — redirects the browser to InsForge's OAuth provider URL. */
  async function signInWithOAuth(provider) {
    const { baseUrl, anonKey } = await getConfig();
    const redirectTo = window.location.origin + '/auth/callback.html';
    const r = await fetch(baseUrl + '/auth/v1/authorize?provider=' + encodeURIComponent(provider), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anonKey },
      body: JSON.stringify({ redirect_to: redirectTo }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      throw new Error('OAuth init failed: ' + (body.error || r.status));
    }
    if (body.url) {
      window.location.href = body.url;
    } else {
      throw new Error('OAuth provider did not return a URL');
    }
  }

  /** Sign out — clear local state and call the API to revoke the token. */
  async function signOut() {
    const { baseUrl, anonKey } = await getConfig();
    const tok = accessToken || storageGet('mw_ins_access_token');
    if (tok) {
      try {
        await fetch(baseUrl + '/auth/v1/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: anonKey, Authorization: 'Bearer ' + tok },
        });
      } catch (_) { /* best-effort */ }
    }
    accessToken = null;
    userCache = null;
    storageSet('mw_ins_access_token', null);
    storageSet('mw_ins_refresh_token', null);
    storageSet('mw_ins_expires_at', null);
  }

  /** Return the current user (cached) or null. */
  function user() {
    if (userCache) return userCache;
    const tok = accessToken || storageGet('mw_ins_access_token');
    if (!tok) return null;
    // Decode the JWT payload (no signature check — the API verifies).
    try {
      const parts = tok.split('.');
      if (parts.length === 3) {
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '==='.slice((b64.length + 3) % 4);
        const payload = JSON.parse(atob(padded));
        userCache = {
          id: payload.sub,
          email: payload.email,
          name: payload.name || payload.email,
          role: payload.role,
        };
        return userCache;
      }
    } catch (_) { /* fall through */ }
    return null;
  }

  /**
   * Fetch wrapper — adds Authorization header and handles 401 by clearing
   * the local session. Returns parsed JSON.
   */
  async function fetchJSON(path, init) {
    const tok = accessToken || storageGet('mw_ins_access_token');
    const headers = Object.assign({}, init && init.headers ? init.headers : {}, tok ? { Authorization: 'Bearer ' + tok } : {});
    if (init && init.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    const r = await fetch(path, Object.assign({}, init || {}, { headers, credentials: 'include' }));
    if (r.status === 401) {
      await signOut();
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }
    if (!r.ok) {
      let msg = 'HTTP ' + r.status;
      try { const j = await r.json(); msg = j.error || j.message || msg; } catch (_) {}
      const err = new Error(msg);
      err.status = r.status;
      throw err;
    }
    const ct = r.headers.get('content-type') || '';
    if (ct.indexOf('application/json') !== -1) return r.json();
    return r.text();
  }

  window.MW_INS = {
    getConfig,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    user,
    fetch: fetchJSON,
  };
})();
