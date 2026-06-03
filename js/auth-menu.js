/* ===========================================================================
 *  auth-menu.js — global header user menu
 *  ----------------------------------------------------------------------------
 *  Runs on every page (loaded from app.js). Checks MW_AUTH.getSession().
 *  If signed in:
 *    - hides the default "Sign in" link
 *    - shows a "My account" link with the user's name / email
 *  Does NOT inject role-specific links here (those live in /admin/ and
 *  /opd.html). The /auth/me.html page lists the role and the available
 *  apps.
 * ========================================================================== */

(function () {
  'use strict';

  function setSignedIn(me) {
    const signInDesktop = document.getElementById('hfAuthLink');
    const signInMobile = document.getElementById('hfAuthLinkMobile');
    if (signInDesktop) signInDesktop.parentElement.hidden = true;
    if (signInMobile) signInMobile.parentElement.hidden = true;
    const slotD = document.getElementById('hfUserMenuSlot');
    const linkD = document.getElementById('hfUserMenuLink');
    const slotM = document.getElementById('hfUserMenuSlotMobile');
    const linkM = document.getElementById('hfUserMenuLinkMobile');
    const label = me.name || me.email || 'My account';
    if (linkD) { linkD.textContent = label; }
    if (linkM) { linkM.textContent = label; }
    if (slotD) slotD.hidden = false;
    if (slotM) slotM.parentElement.hidden = false;
  }

  async function start() {
    const auth = window.MW_AUTH;
    if (!auth) return; // not loaded on this page — fine
    await auth.ready();
    const session = auth.getSession();
    if (!session) return;
    try {
      const r = await auth.fetch((window.MW_CONFIG?.apiBaseUrl || '/api/v1') + '/auth/me');
      if (!r.ok) return;
      const json = await r.json();
      const me = json.data || json;
      if (me) setSignedIn(me);
    } catch (_) {
      // Offline / 5xx / no API — leave the "Sign in" link visible.
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else { start(); }
})();
