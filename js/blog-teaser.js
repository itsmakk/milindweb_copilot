/* ===========================================================================
 *  blog-teaser.js — render the homepage blog teaser from MW_LANDING.posts
 *  Graceful fallback: if no posts arrive within 6s, show nothing
 *  (so the page doesn't show broken cards).
 * ========================================================================== */

(function () {
  'use strict';

  function fmtDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (_) { return ''; }
  }

  function card(p) {
    const a = document.createElement('a');
    a.className = 'card card--post reveal';
    a.href = p.url || `blog.html?post=${encodeURIComponent(p.slug)}`;
    a.setAttribute('aria-label', p.title);
    a.innerHTML = `
      <div class="card__media" aria-hidden="true">
        ${p.coverImage
          ? `<img loading="lazy" src="${window.MW?.absUrl ? window.MW.absUrl(p.coverImage) : p.coverImage}" alt="">`
          : '<div class="card__media-placeholder"><i class="fas fa-newspaper"></i></div>'}
      </div>
      <div class="card__body">
        ${p.category ? `<span class="chip chip--sm">${window.MW?.escapeHtml ? window.MW.escapeHtml(p.category) : p.category}</span>` : ''}
        <h3 class="card__title">${window.MW?.escapeHtml ? window.MW.escapeHtml(p.title) : p.title}</h3>
        ${p.description ? `<p class="card__desc">${window.MW?.escapeHtml ? window.MW.escapeHtml(p.description) : p.description}</p>` : ''}
        <div class="card__meta">
          ${p.publishedAt ? `<time>${fmtDate(p.publishedAt)}</time>` : ''}
          ${p.readingMinutes ? `<span aria-hidden="true">·</span><span>${p.readingMinutes} min read</span>` : ''}
        </div>
      </div>
    `;
    return a;
  }

  function render() {
    const root = document.getElementById('blogTeaser');
    if (!root) return;
    const landing = window.MW?.getLanding?.();
    const posts = (landing?.posts || []).slice(0, 3);
    if (!posts.length) {
      // No posts (yet) — show a friendly empty state only if the API
      // actually responded with no posts; if it's still loading, leave
      // the skeleton alone (CSS will animate it).
      if (landing && landing._from === 'api') {
        root.innerHTML = '<p class="muted" style="text-align:center;padding:24px 0">No posts yet — check back soon.</p>';
      }
      return;
    }
    root.innerHTML = '';
    posts.forEach((p) => root.appendChild(card(p)));
    // Re-trigger any reveal-on-scroll animation that was watching new nodes
    document.dispatchEvent(new CustomEvent('mw:content-rendered', { detail: { section: 'blog-teaser' } }));
  }

  // Wait for MW.escapeHtml / MW.absUrl (from app.js) and then render
  function start() {
    if (!window.MW?.onLanding) {
      return setTimeout(start, 100);
    }
    window.MW.onLanding(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
