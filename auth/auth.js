/**
 * auth.js — shared bootstrap for /auth/login.html and /auth/signup.html.
 *
 * Responsibilities:
 *   1. Read the InsForge config (baseUrl + anonKey) from the API at boot.
 *      We never inline the anon key in HTML; we ask the API for it.
 *   2. Create a single `insforge` client and expose it on `window.MW.auth`.
 *   3. Wire form submission helpers (`bindForm`) for login + signup pages.
 *
 * The anon key is publishable — it identifies the *app*, not the user.
 * Authenticated calls add `Authorization: Bearer <accessToken>` from the
 * SDK's session.
 */

const API_BASE =
  (window.MW && window.MW.apiBase) ||
  (location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : location.origin);

let _client = null;
let _bootPromise = null;

async function fetchAuthConfig() {
  const res = await fetch(`${API_BASE}/api/v1/auth/discovery`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Could not load auth config: HTTP ${res.status}`);
  }
  const json = await res.json();
  if (!json || !json.data || json.data.driver !== 'insforge') {
    throw new Error('API is not configured for InsForge auth');
  }
  return json.data;
}

async function boot() {
  if (_client) return _client;
  if (_bootPromise) return _bootPromise;

  _bootPromise = (async () => {
    const cfg = await fetchAuthConfig();
    if (!cfg.base_url || !cfg.anon_key) {
      throw new Error('API returned an empty InsForge config');
    }
    // Dynamic import — the SDK lives in a CDN-style path injected by the
    // static site. For this static-only build we use the bundled path.
    const mod = await import('https://cdn.jsdelivr.net/npm/@insforge/sdk@latest/dist/index.js');
    const { createClient } = mod;
    _client = createClient({ baseUrl: cfg.base_url, anonKey: cfg.anon_key });
    return _client;
  })();

  return _bootPromise;
}

function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.hidden = !msg;
}

function setBusy(btn, busy) {
  if (!btn) return;
  btn.disabled = busy;
  btn.dataset.busy = busy ? '1' : '';
}

function redirectAfterAuth() {
  const next = new URLSearchParams(location.search).get('next') || '/';
  location.assign(next);
}

window.MW = window.MW || {};
window.MW.auth = {
  boot,
  getClient: () => _client,
  redirectAfterAuth,
  showError,
  setBusy,
};

export { boot, getClient, showError, setBusy, redirectAfterAuth };
