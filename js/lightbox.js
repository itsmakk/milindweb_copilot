/* =========================================================
   MilindWeb — Lightweight Lightbox
   Zero deps. Trigger: any <a data-lightbox="group" href="...">img</a>
   with an <img> child. ESC to close, arrows to navigate, swipe on touch.
   ========================================================= */
(function () {
  'use strict';

  if (window.MW_LIGHTBOX_INSTALLED) return;
  window.MW_LIGHTBOX_INSTALLED = true;

  const STYLE = `
    .mw-lightbox {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.88);
      display: none; align-items: center; justify-content: center;
      flex-direction: column; padding: 16px;
      opacity: 0; transition: opacity 0.18s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .mw-lightbox--open { display: flex; opacity: 1; }
    .mw-lightbox__img {
      max-width: 96vw; max-height: 84vh;
      object-fit: contain;
      box-shadow: 0 12px 48px rgba(0,0,0,0.6);
      border-radius: 4px;
      user-select: none; -webkit-user-drag: none;
    }
    .mw-lightbox__caption {
      color: #fff; margin-top: 14px; text-align: center;
      font-size: 0.95rem; max-width: 80vw; opacity: 0.9;
    }
    .mw-lightbox__btn {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(255,255,255,0.08); color: #fff;
      border: 0; cursor: pointer; width: 48px; height: 48px;
      border-radius: 999px; font-size: 1.2rem;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s ease;
    }
    .mw-lightbox__btn:hover { background: rgba(255,255,255,0.18); }
    .mw-lightbox__btn--prev { left: 16px; }
    .mw-lightbox__btn--next { right: 16px; }
    .mw-lightbox__close {
      position: absolute; top: 16px; right: 16px;
      background: rgba(255,255,255,0.08); color: #fff;
      border: 0; cursor: pointer; width: 40px; height: 40px;
      border-radius: 999px; font-size: 1rem;
    }
    .mw-lightbox__counter {
      position: absolute; top: 18px; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,0.7); font-size: 0.85rem;
      background: rgba(0,0,0,0.4); padding: 4px 12px; border-radius: 999px;
    }
    .mw-lightbox[hidden] { display: none !important; }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  let groups = {};
  let current = { group: null, index: 0 };

  function ensureDom() {
    let box = document.getElementById('mwLightbox');
    if (box) return box;
    box = document.createElement('div');
    box.id = 'mwLightbox';
    box.className = 'mw-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML = `
      <button class="mw-lightbox__close" type="button" aria-label="Close (Esc)"><i class="fas fa-times" aria-hidden="true"></i></button>
      <span class="mw-lightbox__counter" aria-live="polite"></span>
      <button class="mw-lightbox__btn mw-lightbox__btn--prev" type="button" aria-label="Previous image"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>
      <img class="mw-lightbox__img" alt="">
      <button class="mw-lightbox__btn mw-lightbox__btn--next" type="button" aria-label="Next image"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>
      <div class="mw-lightbox__caption"></div>
    `;
    document.body.appendChild(box);

    box.addEventListener('click', (e) => {
      if (e.target === box) close();
    });
    box.querySelector('.mw-lightbox__close').addEventListener('click', close);
    box.querySelector('.mw-lightbox__btn--prev').addEventListener('click', () => step(-1));
    box.querySelector('.mw-lightbox__btn--next').addEventListener('click', () => step(1));

    // Touch swipe
    let startX = null;
    box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
      startX = null;
    });

    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('mw-lightbox--open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
    return box;
  }

  function step(delta) {
    const g = groups[current.group];
    if (!g || g.length < 2) return;
    current.index = (current.index + delta + g.length) % g.length;
    render();
  }

  function render() {
    const box = ensureDom();
    const g = groups[current.group];
    if (!g || !g.length) return close();
    const item = g[current.index];
    const img = box.querySelector('.mw-lightbox__img');
    const cap = box.querySelector('.mw-lightbox__caption');
    const counter = box.querySelector('.mw-lightbox__counter');
    img.src = item.src;
    img.alt = item.alt || '';
    cap.textContent = item.alt || '';
    cap.style.display = item.alt ? '' : 'none';
    counter.textContent = (current.index + 1) + ' / ' + g.length;
    box.querySelector('.mw-lightbox__btn--prev').style.display = g.length > 1 ? '' : 'none';
    box.querySelector('.mw-lightbox__btn--next').style.display = g.length > 1 ? '' : 'none';
  }

  function open(group, index) {
    current = { group, index: index || 0 };
    render();
    const box = ensureDom();
    box.classList.add('mw-lightbox--open');
    document.body.style.overflow = 'hidden';
    box.querySelector('.mw-lightbox__close').focus();
  }

  function close() {
    const box = document.getElementById('mwLightbox');
    if (!box) return;
    box.classList.remove('mw-lightbox--open');
    document.body.style.overflow = '';
  }

  function scan() {
    const anchors = document.querySelectorAll('a[data-lightbox]');
    anchors.forEach((a) => {
      if (a.dataset.mwLbInit) return;
      a.dataset.mwLbInit = '1';
      const group = a.getAttribute('data-lightbox') || 'default';
      const src = a.getAttribute('href') || '';
      if (!src || /^javascript:/i.test(src)) return;
      const img = a.querySelector('img');
      const alt = (img && img.getAttribute('alt')) || a.getAttribute('aria-label') || a.getAttribute('title') || '';
      if (!groups[group]) groups[group] = [];
      groups[group].push({ src, alt });
      const index = groups[group].length - 1;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        open(group, index);
      });
    });
  }

  // Re-scan when content changes (e.g. blog teaser inserted by JS)
  document.addEventListener('mw:content-rendered', scan);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }
})();
