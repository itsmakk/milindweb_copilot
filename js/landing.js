/* ===========================================================================
 *  landing.js — fetch /api/v1/portfolio/landing and expose to the static site
 *  ----------------------------------------------------------------------------
 *  Pages can:
 *    await MW.bootLanding()                   -> returns the Landing payload
 *    subscribe to MW.onLanding(cb)            -> cb called when data arrives
 *
 *  Behaviour:
 *    1. Tries the API (MW_CONFIG.apiBaseUrl || '/api/v1')
 *    2. If the request fails or the response is not 2xx, falls back to the
 *       static `config.js` (no UI breakage).
 *    3. Re-fires any registered callbacks once the data is ready.
 *
 *  Pages that need dynamic content (homepage, blog, services) call
 *    MW.bootLanding().then(landing => renderHomepageBlog(landing.posts))
 *  in their own JS, after DOMContentLoaded.
 * ========================================================================== */

(function () {
  'use strict';

  const listeners = new Set();
  let cached = null;
  let inFlight = null;

  function getApiBase() {
    const cfg = window.MW_CONFIG || {};
    if (cfg.apiBaseUrl) return cfg.apiBaseUrl.replace(/\/$/, '');
    // Default: same-origin /api/v1 (works in dev and behind a reverse proxy
    // that routes /api to the NestJS service).
    return '/api/v1';
  }

  function fallback() {
    // Build a minimal landing from the static config.js so pages never
    // crash when the API is unreachable.
    const cfg = window.MW_CONFIG || {};
    return {
      profile: {
        brandName: cfg.brand?.name || 'MilindWeb',
        brandShortName: cfg.brand?.shortName || 'MilindWeb',
        tagline: cfg.brand?.tagline || '',
        description: cfg.brand?.description || '',
        logoMark: cfg.brand?.logoMark || 'M',
        foundedYear: cfg.brand?.foundedYear || null,
        language: cfg.brand?.language || 'en',
        locale: cfg.brand?.locale || 'en_IN',
        contact: cfg.contact || {},
        social: cfg.social || {},
        seo: cfg.seo || {},
        analytics: cfg.analytics || {},
        theme: cfg.theme || {},
      },
      services: (cfg.services || []).map((s) => ({
        id: s.id,
        slug: s.slug,
        code: s.id,
        title: s.title,
        icon: s.icon,
        tagline: s.tagline,
        summary: s.summary,
        bullets: s.bullets || [],
        sortOrder: 0,
        isActive: true,
      })),
      projects: [],
      posts: [],
      testimonials: cfg.testimonials || [],
      faq: cfg.faq || [],
      team: cfg.team || [],
      _from: 'fallback',
    };
  }

  async function bootLanding() {
    if (cached) return cached;
    if (inFlight) return inFlight;

    inFlight = (async () => {
      try {
        const r = await fetch(getApiBase() + '/portfolio/landing', {
          headers: { Accept: 'application/json' },
          // 5 s is generous — we don't want a slow API to delay the page.
          signal: AbortSignal.timeout(5000),
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const json = await r.json();
        cached = Object.assign({}, json.data, { _from: 'api' });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[landing] API unreachable, using static config.js', e);
        cached = fallback();
      }

      // Patch the global CONFIG so header/footer pick up API values if they
      // choose to re-read. The header/footer already rendered from the
      // static config — calling MW.refreshHeader() will re-render.
      if (window.MW_CONFIG) {
        const c = cached;
        if (c.services?.length) {
          window.MW_CONFIG.services = c.services.map((s) => ({
            id: s.code, slug: s.slug, title: s.title, icon: s.icon,
            tagline: s.tagline, summary: s.summary, bullets: s.bullets,
          }));
        }
        if (c.profile) {
          window.MW_CONFIG.brand = {
            ...window.MW_CONFIG.brand,
            name: c.profile.brandName,
            shortName: c.profile.brandShortName || window.MW_CONFIG.brand.shortName,
            tagline: c.profile.tagline || window.MW_CONFIG.brand.tagline,
            description: c.profile.description || window.MW_CONFIG.brand.description,
          };
          window.MW_CONFIG.contact = c.profile.contact || window.MW_CONFIG.contact;
          window.MW_CONFIG.social = c.profile.social || window.MW_CONFIG.social;
          window.MW_CONFIG.seo = c.profile.seo || window.MW_CONFIG.seo;
        }
        if (c.team?.length) window.MW_CONFIG.team = c.team.map((m) => ({ name: m.name, role: m.role, bio: m.bio, avatar: m.avatar }));
        if (c.testimonials?.length) window.MW_CONFIG.testimonials = c.testimonials;
        if (c.faq?.length) window.MW_CONFIG.faq = c.faq;
      }

      listeners.forEach((cb) => {
        try { cb(cached); } catch (_) { /* ignore listener errors */ }
      });

      return cached;
    })();

    return inFlight;
  }

  function onLanding(cb) {
    listeners.add(cb);
    if (cached) {
      // fire immediately, async, so the caller can still attach handlers
      Promise.resolve().then(() => cb(cached));
    }
    return () => listeners.delete(cb);
  }

  // Expose
  window.MW = window.MW || {};
  window.MW.bootLanding = bootLanding;
  window.MW.onLanding = onLanding;
  window.MW.getLanding = () => cached;

  // Auto-boot so the data is ready by the time the page finishes parsing
  // dynamic content sections (homepage blog teaser, project cards, etc.).
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { void bootLanding(); });
  } else {
    void bootLanding();
  }
})();
