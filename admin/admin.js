/* =========================================================
   MilindWeb Admin SPA — shared controller
   ---------------------------------------------------------
   - Auth guard: redirects to /auth/login.html if not signed in
     or if the user lacks one of the required roles.
   - API client: thin wrapper around MW_AUTH.fetch that
     normalises errors and unwraps { data, error } envelopes.
   - UI helpers: toast, modal, escapeHtml, slugify, fmtDate.
   - Entity registry: per-entity field metadata used by the
     generic CRUD renderer.

   Pages opt in with <body data-entity="services"> and import
   this single file. Keeps the SPA framework-free.
   ========================================================= */
(function () {
  'use strict';

  const CFG = window.MW_CONFIG || {};
  const API_BASE = (CFG.apiBaseUrl || '/api/v1').replace(/\/$/, '');
  const RETURN_TO_KEY = 'mw.admin.returnTo';

  // -----------------------------------------------------------------
  // 1. Auth guard
  // -----------------------------------------------------------------
  async function requireRole(allowedRoles) {
    const allowed = new Set(allowedRoles || []);
    const auth = window.MW_AUTH;
    if (!auth) {
      console.error('MW_AUTH not loaded — include /auth/oidc-client.js before admin.js');
      return null;
    }
    await auth.ready();
    const session = auth.getSession();
    if (!session) {
      // Not signed in — bounce to login
      sessionStorage.setItem(RETURN_TO_KEY, location.pathname + location.search);
      location.replace('/auth/login.html');
      return null;
    }
    // /auth/me is the source of truth for role + groups
    let me = null;
    try {
      const r = await auth.fetch(API_BASE + '/auth/me');
      me = await r.json();
    } catch (e) {
      console.warn('admin guard: /auth/me failed', e);
    }
    const role = me?.data?.role || (me && me.role);
    const groups = me?.data?.groups || (me && me.groups) || [];
    if (!role) {
      showScreen('forbidden', 'No role assigned. Contact an administrator.');
      return null;
    }
    if (allowed.size > 0 && !allowed.has(role) && !groups.some(g => allowed.has(g))) {
      showScreen('forbidden', `This page requires one of: ${[...allowed].join(', ')}. Your role: ${role}.`);
      return null;
    }
    return { session, me: me.data || me, role, groups };
  }

  function showScreen(kind, msg) {
    const root = document.getElementById('adminApp') || document.body;
    root.innerHTML = `
      <div class="admin-screen">
        <i class="fas ${kind === 'forbidden' ? 'fa-lock' : 'fa-spinner fa-spin'}" aria-hidden="true"></i>
        <h1>${escapeHtml(kind === 'forbidden' ? 'Access denied' : 'Loading…')}</h1>
        <p>${escapeHtml(msg || '')}</p>
        ${kind === 'forbidden' ? '<p><a class="btn btn--ghost" href="/auth/me.html">Go to my profile</a> <a class="btn btn--ghost" href="/index.html">Back to site</a></p>' : ''}
      </div>
    `;
  }

  // -----------------------------------------------------------------
  // 2. API client
  // -----------------------------------------------------------------
  const api = {
    async request(path, opts) {
      const auth = window.MW_AUTH;
      if (!auth) throw new Error('MW_AUTH missing');
      const r = await auth.fetch(API_BASE + path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
      const text = await r.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch (_) { /* non-JSON */ }
      if (!r.ok) {
        const message = (json && (json.message || (json.error && json.error.message))) || ('HTTP ' + r.status);
        const err = new Error(Array.isArray(message) ? message.join('; ') : message);
        err.status = r.status;
        err.body = json;
        throw err;
      }
      return json && json.data !== undefined ? json.data : json;
    },
    list(entity) { return this.request(`/portfolio/admin/${entity}`); },
    get(entity, id) { return this.request(`/portfolio/admin/${entity}/${id}`); },
    create(entity, body) { return this.request(`/portfolio/admin/${entity}`, { method: 'POST', body: JSON.stringify(body) }); },
    update(entity, id, body) { return this.request(`/portfolio/admin/${entity}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); },
    remove(entity, id) { return this.request(`/portfolio/admin/${entity}/${id}`, { method: 'DELETE' }); },
  };

  // -----------------------------------------------------------------
  // 3. UI helpers
  // -----------------------------------------------------------------
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  function slugify(s) {
    return String(s || '').toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  function fmtDate(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString(); } catch (_) { return iso; }
  }
  function el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach((k) => {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'style') e.style.cssText = attrs[k];
      else if (k === 'dataset') Object.assign(e.dataset, attrs[k]);
      else if (k.startsWith('on') && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else if (k in e && typeof attrs[k] !== 'string') e[k] = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    children.flat().forEach((c) => {
      if (c == null) return;
      e.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
    });
    return e;
  }

  // Toast
  let toastTimer = null;
  function toast(message, kind = 'info', ms = 3000) {
    let host = document.getElementById('adminToast');
    if (!host) {
      host = el('div', { id: 'adminToast', class: 'admin-toast-host', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(host);
    }
    host.innerHTML = '';
    const t = el('div', { class: 'admin-toast admin-toast--' + kind }, message);
    host.appendChild(t);
    requestAnimationFrame(() => t.classList.add('admin-toast--in'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove('admin-toast--in');
      setTimeout(() => { t.remove(); }, 200);
    }, ms);
  }

  // Modal (single instance, replaced each call)
  function confirmModal({ title = 'Are you sure?', body = '', confirmLabel = 'Delete', confirmKind = 'danger' } = {}) {
    return new Promise((resolve) => {
      const host = el('div', { class: 'admin-modal-host' });
      const overlay = el('div', { class: 'admin-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
      const card = el('div', { class: 'admin-modal__card' },
        el('h2', { class: 'admin-modal__title' }, title),
        el('p', { class: 'admin-modal__body' }, body),
      );
      const actions = el('div', { class: 'admin-modal__actions' });
      const cancel = el('button', { type: 'button', class: 'btn btn--ghost' }, 'Cancel');
      const ok = el('button', { type: 'button', class: 'btn btn--' + (confirmKind === 'danger' ? 'danger' : 'primary') }, confirmLabel);
      cancel.addEventListener('click', () => { close(false); });
      ok.addEventListener('click', () => { close(true); });
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
      function close(v) { overlay.remove(); document.removeEventListener('keydown', onKey); resolve(v); }
      function onKey(e) { if (e.key === 'Escape') close(false); else if (e.key === 'Enter') close(true); }
      document.addEventListener('keydown', onKey);
      actions.append(cancel, ok);
      card.appendChild(actions);
      overlay.appendChild(card);
      host.appendChild(overlay);
      document.body.appendChild(host);
      setTimeout(() => ok.focus(), 30);
    });
  }

  // -----------------------------------------------------------------
  // 4. Entity registry (per-page field metadata)
  // -----------------------------------------------------------------
  // Each entry: { label, listFields, formFields, defaults, fromForm, toRow }
  // - listFields: ordered array of { key, label, render?(value, item) }
  // - formFields: ordered array of field descriptors (used by renderForm)
  // - fromForm(formEl) -> { ... } (object to POST/PATCH)
  // - toRow(item) -> string (row primary text for the listing page subtitle)
  const ENTITIES = {
    services: {
      label: 'Services',
      icon: 'fa-concierge-bell',
      listFields: [
        { key: 'title', label: 'Title' },
        { key: 'code', label: 'Code' },
        { key: 'slug', label: 'Slug' },
        { key: 'sortOrder', label: 'Order' },
        { key: 'isActive', label: 'Active', render: (v) => v ? '✅' : '—' },
      ],
      formFields: [
        { name: 'code', label: 'Code', required: true, help: 'Short identifier (e.g. web, photo).' },
        { name: 'title', label: 'Title', required: true },
        { name: 'slug', label: 'Slug', help: 'URL fragment. Auto-derived from title if blank.' },
        { name: 'icon', label: 'Font Awesome class', placeholder: 'fa-code' },
        { name: 'tagline', label: 'Tagline' },
        { name: 'summary', label: 'Summary', kind: 'textarea' },
        { name: 'bullets', label: 'Bullets (one per line)', kind: 'textarea' },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
        { name: 'isActive', label: 'Active', kind: 'checkbox' },
      ],
      fromForm: (fd) => ({
        code: fd.code.trim(),
        title: fd.title.trim(),
        slug: (fd.slug || '').trim() || slugify(fd.title),
        icon: fd.icon || null,
        tagline: fd.tagline || null,
        summary: fd.summary || null,
        bullets: splitLines(fd.bullets),
        sortOrder: numOr(fd.sortOrder, 0),
        isActive: !!fd.isActive,
      }),
    },

    projects: {
      label: 'Projects',
      icon: 'fa-diagram-project',
      listFields: [
        { key: 'title', label: 'Title' },
        { key: 'client', label: 'Client' },
        { key: 'category', label: 'Category' },
        { key: 'isPublished', label: 'Live', render: (v) => v ? '✅' : '—' },
        { key: 'completedAt', label: 'Completed', render: fmtDate },
      ],
      formFields: [
        { name: 'title', label: 'Title', required: true },
        { name: 'slug', label: 'Slug', help: 'URL fragment. Auto-derived from title if blank.' },
        { name: 'client', label: 'Client' },
        { name: 'category', label: 'Category' },
        { name: 'tags', label: 'Tags (comma-separated)', kind: 'textarea' },
        { name: 'summary', label: 'Summary', kind: 'textarea' },
        { name: 'bodyMd', label: 'Body (Markdown)', kind: 'textarea', rows: 12 },
        { name: 'coverImage', label: 'Cover image URL' },
        { name: 'gallery', label: 'Gallery URLs (one per line)', kind: 'textarea', rows: 6 },
        { name: 'externalUrl', label: 'External URL' },
        { name: 'completedAt', label: 'Completed on (YYYY-MM-DD)', type: 'date' },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
        { name: 'isPublished', label: 'Published', kind: 'checkbox' },
      ],
      fromForm: (fd) => ({
        title: fd.title.trim(),
        slug: (fd.slug || '').trim() || slugify(fd.title),
        client: fd.client || null,
        category: fd.category || null,
        tags: splitCsv(fd.tags),
        summary: fd.summary || null,
        bodyMd: fd.bodyMd || null,
        coverImage: fd.coverImage || null,
        gallery: splitLines(fd.gallery),
        externalUrl: fd.externalUrl || null,
        completedAt: fd.completedAt || null,
        sortOrder: numOr(fd.sortOrder, 0),
        isPublished: !!fd.isPublished,
      }),
    },

    posts: {
      label: 'Blog posts',
      icon: 'fa-newspaper',
      listFields: [
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'publishedAt', label: 'Published', render: fmtDate },
        { key: 'isPublished', label: 'Live', render: (v) => v ? '✅' : '—' },
      ],
      formFields: [
        { name: 'title', label: 'Title', required: true },
        { name: 'slug', label: 'Slug', help: 'URL fragment. Auto-derived from title if blank.' },
        { name: 'category', label: 'Category' },
        { name: 'tags', label: 'Tags (comma-separated)', kind: 'textarea' },
        { name: 'description', label: 'Description (SEO + card)', kind: 'textarea' },
        { name: 'bodyMd', label: 'Body (Markdown)', kind: 'textarea', rows: 12 },
        { name: 'coverImage', label: 'Cover image URL' },
        { name: 'readingMinutes', label: 'Reading time (min)', type: 'number' },
        { name: 'publishedAt', label: 'Published on (YYYY-MM-DD)', type: 'date' },
        { name: 'isPublished', label: 'Published', kind: 'checkbox' },
      ],
      fromForm: (fd) => ({
        title: fd.title.trim(),
        slug: (fd.slug || '').trim() || slugify(fd.title),
        category: fd.category || null,
        tags: splitCsv(fd.tags),
        description: fd.description || null,
        bodyMd: fd.bodyMd || null,
        coverImage: fd.coverImage || null,
        readingMinutes: numOr(fd.readingMinutes, 5),
        publishedAt: fd.publishedAt || null,
        isPublished: !!fd.isPublished,
      }),
    },

    testimonials: {
      label: 'Testimonials',
      icon: 'fa-quote-left',
      listFields: [
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'rating', label: 'Rating', render: (v) => '★'.repeat(v) + '☆'.repeat(5 - v) },
        { key: 'sortOrder', label: 'Order' },
      ],
      formFields: [
        { name: 'name', label: 'Name', required: true },
        { name: 'role', label: 'Role / company' },
        { name: 'quote', label: 'Quote', kind: 'textarea', required: true },
        { name: 'initials', label: 'Initials (avatar fallback)', help: '1–3 letters, e.g. AK.' },
        { name: 'rating', label: 'Rating (1–5)', type: 'number', min: 1, max: 5 },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
      ],
      fromForm: (fd) => ({
        name: fd.name.trim(),
        role: fd.role || null,
        quote: fd.quote.trim(),
        initials: fd.initials || null,
        rating: Math.max(1, Math.min(5, numOr(fd.rating, 5))),
        sortOrder: numOr(fd.sortOrder, 0),
      }),
    },

    faq: {
      label: 'FAQ',
      icon: 'fa-circle-question',
      listFields: [
        { key: 'question', label: 'Question' },
        { key: 'sortOrder', label: 'Order' },
      ],
      formFields: [
        { name: 'question', label: 'Question', required: true, kind: 'textarea' },
        { name: 'answer', label: 'Answer', required: true, kind: 'textarea', rows: 6 },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
      ],
      fromForm: (fd) => ({
        question: fd.question.trim(),
        answer: fd.answer.trim(),
        sortOrder: numOr(fd.sortOrder, 0),
      }),
    },

    team: {
      label: 'Team',
      icon: 'fa-users',
      listFields: [
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'sortOrder', label: 'Order' },
      ],
      formFields: [
        { name: 'name', label: 'Name', required: true },
        { name: 'role', label: 'Role' },
        { name: 'bio', label: 'Bio', kind: 'textarea' },
        { name: 'avatar', label: 'Avatar initials / emoji' },
        { name: 'avatarUrl', label: 'Avatar image URL' },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
      ],
      fromForm: (fd) => ({
        name: fd.name.trim(),
        role: fd.role || null,
        bio: fd.bio || null,
        avatar: fd.avatar || null,
        avatarUrl: fd.avatarUrl || null,
        sortOrder: numOr(fd.sortOrder, 0),
      }),
    },

    profile: {
      label: 'Profile',
      icon: 'fa-id-badge',
      isSingleton: true,
      // Profile is a singleton — no list, only an edit form.
      listFields: [],
      formFields: [
        { name: 'brandName', label: 'Brand name', required: true },
        { name: 'brandShortName', label: 'Short brand name' },
        { name: 'tagline', label: 'Tagline' },
        { name: 'description', label: 'Description', kind: 'textarea' },
        { name: 'logoMark', label: 'Logo mark (single character)' },
        { name: 'foundedYear', label: 'Founded year', type: 'number' },
        { name: 'language', label: 'Language code', placeholder: 'en' },
        { name: 'locale', label: 'Locale', placeholder: 'en_IN' },
        { name: 'contact', label: 'Contact (JSON)', kind: 'json', rows: 8, help: 'Edit contact info as JSON.' },
        { name: 'social', label: 'Social (JSON)', kind: 'json', rows: 6 },
        { name: 'seo', label: 'SEO (JSON)', kind: 'json', rows: 6 },
        { name: 'analytics', label: 'Analytics (JSON)', kind: 'json', rows: 4 },
        { name: 'theme', label: 'Theme (JSON)', kind: 'json', rows: 4 },
      ],
      fromForm: (fd) => {
        const out = {
          brandName: fd.brandName.trim(),
          brandShortName: fd.brandShortName || null,
          tagline: fd.tagline || null,
          description: fd.description || null,
          logoMark: fd.logoMark || null,
          foundedYear: fd.foundedYear ? numOr(fd.foundedYear, null) : null,
          language: fd.language || 'en',
          locale: fd.locale || 'en_IN',
        };
        ['contact', 'social', 'seo', 'analytics', 'theme'].forEach((k) => {
          const raw = (fd[k] || '').trim();
          if (!raw) { out[k] = {}; return; }
          try { out[k] = JSON.parse(raw); }
          catch (_) { throw new Error(`Field "${k}" is not valid JSON`); }
        });
        return out;
      },
    },
  };

  function splitLines(s) { return (s || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean); }
  function splitCsv(s) { return (s || '').split(',').map((x) => x.trim()).filter(Boolean); }
  function numOr(v, fallback) {
    if (v === '' || v == null) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  // -----------------------------------------------------------------
  // 5. Generic CRUD page renderer
  // -----------------------------------------------------------------
  async function boot() {
    const entity = document.body.dataset.entity;
    const ctx = await requireRole(['portfolio_admin', 'portfolio_editor', 'super_admin']);
    if (!ctx) return;
    renderHeader(ctx);
    if (entity === '__dashboard__') {
      return renderDashboard(ctx);
    }
    if (!entity || !ENTITIES[entity]) {
      document.getElementById('adminMain').innerHTML =
        '<p class="admin-screen">Unknown entity: ' + escapeHtml(entity || '') + '</p>';
      return;
    }
    if (entity === 'profile') {
      renderSingletonForm(entity);
    } else {
      renderListPage(entity, ctx);
    }
  }

  async function renderDashboard(ctx) {
    const main = document.getElementById('adminMain');
    main.innerHTML = `
      <section class="admin-section">
        <div class="admin-section__head">
          <h1><i class="fas fa-gauge-high" aria-hidden="true"></i> Dashboard</h1>
          <div class="admin-section__actions">
            <span class="muted" style="color:var(--text-muted)">Signed in as <strong>${escapeHtml(ctx.role)}</strong></span>
          </div>
        </div>
        <p style="color:var(--text-muted);margin-bottom:18px">
          Pick a section to manage. Counts below come from the public API;
          changes via this admin SPA are written through the <code>/portfolio/admin/*</code> endpoints.
        </p>
        <div class="admin-dash" id="adminDash">
          <div class="admin-loading"><i class="fas fa-spinner fa-spin"></i> Loading counts…</div>
        </div>
        <h2 style="margin-top:30px">Quick actions</h2>
        <div class="admin-dash">
          <a class="admin-dash__card" href="/admin/profile.html"><i class="fas fa-id-badge"></i><strong>Profile</strong><span>Brand, contact, SEO</span></a>
          <a class="admin-dash__card" href="/admin/services.html"><i class="fas fa-concierge-bell"></i><strong>Services</strong><span>What you offer</span></a>
          <a class="admin-dash__card" href="/admin/projects.html"><i class="fas fa-diagram-project"></i><strong>Projects</strong><span>Case studies</span></a>
          <a class="admin-dash__card" href="/admin/posts.html"><i class="fas fa-newspaper"></i><strong>Blog posts</strong><span>Writing &amp; tutorials</span></a>
          <a class="admin-dash__card" href="/admin/testimonials.html"><i class="fas fa-quote-left"></i><strong>Testimonials</strong><span>Client quotes</span></a>
          <a class="admin-dash__card" href="/admin/faq.html"><i class="fas fa-circle-question"></i><strong>FAQ</strong><span>Frequently asked</span></a>
          <a class="admin-dash__card" href="/admin/team.html"><i class="fas fa-users"></i><strong>Team</strong><span>People behind MilindWeb</span></a>
        </div>
      </section>
    `;
    const dash = document.getElementById('adminDash');
    const targets = [
      { entity: 'services',     label: 'Services',     icon: 'fa-concierge-bell' },
      { entity: 'projects',     label: 'Projects',     icon: 'fa-diagram-project' },
      { entity: 'posts',        label: 'Blog posts',   icon: 'fa-newspaper' },
      { entity: 'testimonials', label: 'Testimonials', icon: 'fa-quote-left' },
      { entity: 'faq',          label: 'FAQ',          icon: 'fa-circle-question' },
      { entity: 'team',         label: 'Team',         icon: 'fa-users' },
    ];
    const results = await Promise.allSettled(targets.map((t) => api.list(t.entity)));
    dash.innerHTML = targets.map((t, i) => {
      const r = results[i];
      const count = r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value.length : 0) : '!';
      const ok = r.status === 'fulfilled';
      return `
        <a class="admin-dash__card" href="/admin/${t.entity}.html">
          <i class="fas ${t.icon}"></i>
          <strong>${ok ? count : '—'}</strong>
          <span>${escapeHtml(t.label)}</span>
        </a>
      `;
    }).join('');
  }

  function renderHeader(ctx) {
    const entity = document.body.dataset.entity;
    const meta = ENTITIES[entity] || {};
    const root = document.getElementById('adminApp');
    root.innerHTML = `
      <header class="admin-bar">
        <a class="admin-bar__brand" href="/admin/">
          <i class="fas fa-shield-halved" aria-hidden="true"></i>
          <span>MilindWeb Admin</span>
        </a>
        <nav class="admin-bar__nav" aria-label="Admin sections">
          <a href="/admin/"        >Dashboard</a>
          <a href="/admin/profile.html"        class="${entity === 'profile' ? 'is-current' : ''}">Profile</a>
          <a href="/admin/services.html"       class="${entity === 'services' ? 'is-current' : ''}">Services</a>
          <a href="/admin/projects.html"       class="${entity === 'projects' ? 'is-current' : ''}">Projects</a>
          <a href="/admin/posts.html"          class="${entity === 'posts' ? 'is-current' : ''}">Posts</a>
          <a href="/admin/testimonials.html"   class="${entity === 'testimonials' ? 'is-current' : ''}">Testimonials</a>
          <a href="/admin/faq.html"            class="${entity === 'faq' ? 'is-current' : ''}">FAQ</a>
          <a href="/admin/team.html"           class="${entity === 'team' ? 'is-current' : ''}">Team</a>
        </nav>
        <div class="admin-bar__user">
          <span title="${escapeHtml(ctx.role)}"><i class="fas fa-user-shield"></i> ${escapeHtml(ctx.me?.name || ctx.me?.email || 'admin')}</span>
          <a href="/auth/me.html">Profile</a>
          <button type="button" id="adminSignOut" class="btn btn--ghost btn--sm">Sign out</button>
        </div>
      </header>
      <main class="admin-main" id="adminMain">
        <div class="admin-loading"><i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Loading ${escapeHtml(meta.label || entity)}…</div>
      </main>
    `;
    document.getElementById('adminSignOut').addEventListener('click', async () => {
      try { await window.MW_AUTH.logout(); } finally { location.href = '/index.html'; }
    });
  }

  async function renderListPage(entity, ctx) {
    const meta = ENTITIES[entity];
    const main = document.getElementById('adminMain');
    main.innerHTML = `
      <section class="admin-section">
        <div class="admin-section__head">
          <h1><i class="fas ${meta.icon}" aria-hidden="true"></i> ${escapeHtml(meta.label)}</h1>
          <div class="admin-section__actions">
            <input type="search" id="adminSearch" placeholder="Filter…" aria-label="Filter list">
            <button type="button" class="btn btn--primary" id="adminAddBtn"><i class="fas fa-plus" aria-hidden="true"></i> New ${escapeHtml(meta.label.slice(0, -1))}</button>
          </div>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>${meta.listFields.map((f) => `<th scope="col">${escapeHtml(f.label)}</th>`).join('')}<th class="admin-table__actions">Actions</th></tr>
            </thead>
            <tbody id="adminTbody"><tr><td colspan="${meta.listFields.length + 1}" class="admin-table__empty">Loading…</td></tr></tbody>
          </table>
        </div>
      </section>
    `;
    const tbody = document.getElementById('adminTbody');
    const search = document.getElementById('adminSearch');
    let all = [];
    try {
      all = await api.list(entity);
    } catch (e) {
      main.innerHTML = `<div class="admin-screen"><i class="fas fa-triangle-exclamation"></i><h1>Could not load ${escapeHtml(meta.label)}</h1><p>${escapeHtml(e.message)}</p></div>`;
      return;
    }
    let view = all.slice();
    function paint() {
      const q = (search.value || '').toLowerCase();
      const filtered = q ? view.filter((row) => JSON.stringify(row).toLowerCase().includes(q)) : view;
      if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="${meta.listFields.length + 1}" class="admin-table__empty">No ${escapeHtml(meta.label).toLowerCase()} found.</td></tr>`;
        return;
      }
      tbody.innerHTML = filtered.map((row) => {
        const tds = meta.listFields.map((f) => {
          const v = row[f.key];
          const text = f.render ? f.render(v, row) : (v == null ? '—' : String(v));
          return `<td>${escapeHtml(text)}</td>`;
        }).join('');
        return `
          <tr data-id="${row.id}">
            ${tds}
            <td class="admin-table__actions">
              <button type="button" class="btn btn--ghost btn--sm" data-act="edit"  data-id="${row.id}"><i class="fas fa-pen" aria-hidden="true"></i></button>
              <button type="button" class="btn btn--danger btn--sm" data-act="del"   data-id="${row.id}"><i class="fas fa-trash" aria-hidden="true"></i></button>
            </td>
          </tr>
        `;
      }).join('');
    }
    search.addEventListener('input', paint);
    document.getElementById('adminAddBtn').addEventListener('click', () => openForm(entity, null, all, paint));
    tbody.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.act === 'edit') {
        try {
          const item = await api.get(entity, id);
          openForm(entity, item, all, paint);
        } catch (err) { toast(err.message, 'error'); }
      } else if (btn.dataset.act === 'del') {
        const ok = await confirmModal({
          title: 'Delete this ' + meta.label.slice(0, -1).toLowerCase() + '?',
          body: 'This will soft-delete the record. You can restore it later from the database.',
          confirmLabel: 'Delete',
        });
        if (!ok) return;
        try {
          await api.remove(entity, id);
          toast('Deleted', 'success');
          all = all.filter((x) => x.id !== id);
          paint();
        } catch (err) { toast(err.message, 'error'); }
      }
    });
    paint();
  }

  // -----------------------------------------------------------------
  // 6. Form drawer
  // -----------------------------------------------------------------
  function openForm(entity, item, all, onSaved) {
    const meta = ENTITIES[entity];
    const overlay = el('div', { class: 'admin-modal' });
    const card = el('div', { class: 'admin-modal__card admin-modal__card--wide' });
    card.innerHTML = `
      <header class="admin-modal__head">
        <h2>${item ? 'Edit' : 'New'} ${escapeHtml(meta.label.slice(0, -1))}</h2>
        <button type="button" class="admin-modal__close" aria-label="Close"><i class="fas fa-times"></i></button>
      </header>
      <form class="admin-form" id="adminEntityForm" novalidate>
        <div class="admin-form__grid">
          ${meta.formFields.map((f) => renderField(f, item?.[f.name])).join('')}
        </div>
        <footer class="admin-form__foot">
          <button type="button" class="btn btn--ghost" data-act="cancel">Cancel</button>
          <button type="submit" class="btn btn--primary"><i class="fas fa-floppy-disk"></i> ${item ? 'Save changes' : 'Create'}</button>
        </footer>
      </form>
    `;
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('admin-modal--in'), 10);

    function close() { overlay.classList.remove('admin-modal--in'); setTimeout(() => overlay.remove(), 150); }
    card.querySelector('.admin-modal__close').addEventListener('click', close);
    card.querySelector('[data-act="cancel"]').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    // Auto-slug from title (only if slug field present and empty)
    const titleEl = card.querySelector('input[name="title"]');
    const slugEl = card.querySelector('input[name="slug"]');
    if (titleEl && slugEl && !slugEl.value) {
      titleEl.addEventListener('input', () => {
        if (!slugEl.dataset.touched) slugEl.value = slugify(titleEl.value);
      });
      slugEl.addEventListener('input', () => { slugEl.dataset.touched = '1'; });
    }

    card.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = {};
      new FormData(e.currentTarget).forEach((v, k) => { fd[k] = v; });
      // Checkboxes: if unchecked, FormData omits them
      card.querySelectorAll('input[type="checkbox"]').forEach((cb) => { if (!(cb.name in fd)) fd[cb.name] = ''; });
      let body;
      try { body = meta.fromForm(fd); }
      catch (err) { toast(err.message, 'error'); return; }
      try {
        if (item) {
          const updated = await api.update(entity, item.id, body);
          toast('Saved', 'success');
          const idx = all.findIndex((x) => x.id === item.id);
          if (idx >= 0) all[idx] = updated;
        } else {
          const created = await api.create(entity, body);
          toast('Created', 'success');
          all.unshift(created);
        }
        close();
        onSaved && onSaved();
      } catch (err) { toast(err.message, 'error'); }
    });
  }

  function renderField(f, value) {
    const v = value == null ? '' : value;
    const id = 'f-' + f.name;
    const helpId = f.help ? id + '-help' : null;
    const required = f.required ? ' required aria-required="true"' : '';
    let inputHtml = '';
    if (f.kind === 'textarea') {
      inputHtml = `<textarea name="${f.name}" id="${id}" rows="${f.rows || 3}" ${required}${f.help ? ' aria-describedby="' + helpId + '"' : ''}>${escapeHtml(v)}</textarea>`;
    } else if (f.kind === 'checkbox') {
      inputHtml = `
        <label class="admin-check">
          <input type="checkbox" name="${f.name}" id="${id}" ${v ? 'checked' : ''}>
          <span>${escapeHtml(f.label)}</span>
        </label>
      `;
    } else if (f.kind === 'json') {
      const pretty = (v && typeof v === 'object') ? JSON.stringify(v, null, 2) : (v || '');
      inputHtml = `<textarea name="${f.name}" id="${id}" rows="${f.rows || 4}" class="admin-form__json" ${required}${f.help ? ' aria-describedby="' + helpId + '"' : ''}>${escapeHtml(pretty)}</textarea>`;
    } else {
      const type = f.type || 'text';
      const minmax = (f.min != null ? ' min="' + f.min + '"' : '') + (f.max != null ? ' max="' + f.max + '"' : '');
      inputHtml = `<input type="${type}" name="${f.name}" id="${id}" value="${escapeHtml(v)}"${f.placeholder ? ' placeholder="' + escapeHtml(f.placeholder) + '"' : ''}${required}${minmax}${f.help ? ' aria-describedby="' + helpId + '"' : ''}>`;
    }
    if (f.kind === 'checkbox') {
      return `<div class="admin-field admin-field--full">${inputHtml}${f.help ? `<small id="${helpId}" class="admin-field__help">${escapeHtml(f.help)}</small>` : ''}</div>`;
    }
    return `
      <div class="admin-field">
        <label for="${id}">${escapeHtml(f.label)}${f.required ? ' <span class="admin-req">*</span>' : ''}</label>
        ${inputHtml}
        ${f.help ? `<small id="${helpId}" class="admin-field__help">${escapeHtml(f.help)}</small>` : ''}
      </div>
    `;
  }

  // -----------------------------------------------------------------
  // 7. Singleton form (profile)
  // -----------------------------------------------------------------
  async function renderSingletonForm(entity) {
    const meta = ENTITIES[entity];
    const main = document.getElementById('adminMain');
    main.innerHTML = `
      <section class="admin-section">
        <div class="admin-section__head">
          <h1><i class="fas ${meta.icon}" aria-hidden="true"></i> ${escapeHtml(meta.label)}</h1>
          <div class="admin-section__actions">
            <button type="button" class="btn btn--ghost" id="adminReload"><i class="fas fa-rotate"></i> Reload</button>
          </div>
        </div>
        <div id="adminProfileSlot"><div class="admin-loading"><i class="fas fa-spinner fa-spin"></i> Loading…</div></div>
      </section>
    `;
    const slot = document.getElementById('adminProfileSlot');
    document.getElementById('adminReload').addEventListener('click', renderSingletonForm.bind(null, entity));
    let current = null;
    try { current = await api.request('/portfolio/profile'); }
    catch (e) { slot.innerHTML = `<p>Could not load profile: ${escapeHtml(e.message)}</p>`; return; }
    const fakeAll = [current];
    const fakeItem = current;
    const wrap = el('div');
    slot.innerHTML = '';
    slot.appendChild(wrap);
    // Build a form directly (singleton: no separate "add" button).
    const overlay = el('div', { class: 'admin-modal admin-modal--inline' });
    const card = el('div', { class: 'admin-modal__card admin-modal__card--wide' });
    card.innerHTML = `
      <header class="admin-modal__head">
        <h2>${escapeHtml(meta.label)}</h2>
      </header>
      <form class="admin-form" id="adminEntityForm" novalidate>
        <div class="admin-form__grid">
          ${meta.formFields.map((f) => renderField(f, fakeItem?.[f.name])).join('')}
        </div>
        <footer class="admin-form__foot">
          <button type="submit" class="btn btn--primary"><i class="fas fa-floppy-disk"></i> Save changes</button>
        </footer>
      </form>
    `;
    overlay.appendChild(card);
    wrap.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('admin-modal--in'));

    card.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = {};
      new FormData(e.currentTarget).forEach((v, k) => { fd[k] = v; });
      let body;
      try { body = meta.fromForm(fd); }
      catch (err) { toast(err.message, 'error'); return; }
      try {
        const updated = await api.request('/portfolio/admin/profile', { method: 'PATCH', body: JSON.stringify(body) });
        toast('Profile saved', 'success');
        // Reload from server to pick up server-side fields
        const fresh = await api.request('/portfolio/profile');
        Object.assign(fakeItem, fresh);
        renderSingletonForm(entity);
      } catch (err) { toast(err.message, 'error'); }
    });
  }

  // -----------------------------------------------------------------
  // 8. Public surface
  // -----------------------------------------------------------------
  window.MW_ADMIN = { boot, api, ENTITIES, escapeHtml, toast, confirmModal, requireRole };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
