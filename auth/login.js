/**
 * login.js — sign in with email + password via the InsForge SDK.
 *
 * On success we store the access token in localStorage so other pages can
 * read it. We also ping the API's /users/me to make sure the local mirror
 * is provisioned before we redirect.
 */

import { boot, showError, setBusy, redirectAfterAuth } from './auth.js';

const form = document.getElementById('login-form');
const errEl = document.getElementById('form-error');
const btn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError(errEl, '');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showError(errEl, 'Email and password are required.');
    return;
  }

  setBusy(btn, true);
  try {
    const client = await boot();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      showError(errEl, error.message || 'Invalid email or password.');
      return;
    }
    if (!data || !data.accessToken) {
      showError(errEl, 'Sign in succeeded but no session token was returned.');
      return;
    }
    // Persist the session for other pages.
    localStorage.setItem('mw.session', JSON.stringify({
      accessToken: data.accessToken,
      user: data.user || null,
      ts: Date.now(),
    }));
    // Warm the local mirror so /users/me works on the next page.
    try {
      await fetch(`${API_BASE_FOR_AUTH()}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });
    } catch (_) { /* non-fatal */ }
    redirectAfterAuth();
  } catch (err) {
    showError(errEl, err && err.message ? err.message : 'Sign in failed.');
  } finally {
    setBusy(btn, false);
  }
});

function API_BASE_FOR_AUTH() {
  if (window.MW && window.MW.apiBase) return window.MW.apiBase;
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  return location.origin;
}
