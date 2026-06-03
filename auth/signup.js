/**
 * signup.js — create a new account via the InsForge SDK.
 *
 * InsForge sends a confirmation email. Until the user clicks the link,
 * /users/me will return 401. We tell the user about it on success.
 */

import { boot, showError, setBusy, redirectAfterAuth } from './auth.js';

const form = document.getElementById('signup-form');
const errEl = document.getElementById('form-error');
const btn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError(errEl, '');

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirm').value;

  if (!name || !email || !password) {
    showError(errEl, 'All fields are required.');
    return;
  }
  if (password.length < 8) {
    showError(errEl, 'Password must be at least 8 characters.');
    return;
  }
  if (password !== confirm) {
    showError(errEl, 'Passwords do not match.');
    return;
  }

  setBusy(btn, true);
  try {
    const client = await boot();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      name,
    });
    if (error) {
      showError(errEl, error.message || 'Could not create the account.');
      return;
    }
    if (data && data.accessToken) {
      localStorage.setItem('mw.session', JSON.stringify({
        accessToken: data.accessToken,
        user: data.user || null,
        ts: Date.now(),
      }));
      redirectAfterAuth();
    } else {
      showError(
        errEl,
        'Account created. Check your email to confirm, then sign in.',
      );
    }
  } catch (err) {
    showError(errEl, err && err.message ? err.message : 'Sign up failed.');
  } finally {
    setBusy(btn, false);
  }
});
