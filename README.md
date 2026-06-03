# MilindWeb

> **Multi-service digital platform** — Digital Marketing, Web Development, Business Automation, Engineering Projects, Photography, Graphics, Electrical, and Automotive services.

Production-ready, multi-client, config-driven, vanilla HTML/CSS/JS for the public site, with a NestJS API for the Seniority and Hospital sections. Deployed on a **fully free stack**: InsForge (DB + Auth + Storage) + Render (NestJS API) + Cloudflare Pages (static site) + Cloudflare Worker (reverse proxy for `/api/*`).

**Production**: https://mk9.in (after deploy — see `docs/deploy-mk9in.md`)

> **📐 Architecture**: see **[`docs/architecture.md`](docs/architecture.md)** for the full backend / DB / auth design, ADRs, schema map, and deployment runbook.

---

## Project Structure

```
/
├── config.js              # Central config (brand, contact, services, SEO)
├── index.html             # Homepage
├── header.html            # Shared header
├── footer.html            # Shared footer
├── contact.html           # Contact + legal info
├── contactform.html       # Inline contact form (reused in pages)
├── blog.html              # Blog (deferred to Phase 4)
├── project.html           # Engineering projects
├── workshop.html          # Workshops
├── freelance_seo_*.html   # Digital marketing service
├── graphics.html          # Graphics & branding
├── website-tech-*.html    # Web development service
├── Seniariity_*.html      # Seniority management (deferred)
├── calendar.html          # Holiday calendar
├── links.html             # Useful links
├── form.html              # Hospital Manager (deferred)
│
├── css/
│   ├── theme.css          # ★ Design system (dark-first, glassmorphism)
│   ├── headerfooter.css   # Header & footer styles
│   ├── blog.css           # Blog styles
│   └── ...
│
├── js/
│   ├── app.js             # ★ Config applier + utilities
│   ├── headerfooter.js    # Loads header/footer, theme toggle
│   ├── form-handler.js    # Contact form (Google Apps Script)
│   └── ...
│
├── scripts/
│   ├── build_assets.py    # Generate OG image + favicon set
│   ├── inject_favicons.py # Wire favicon links into HTML pages
│   └── audit.py           # Manual Lighthouse-style audit
│
├── data/                  # JSON content
├── img/                   # Brand images (OG, favicons)
├── fonts/                 # Font Awesome + Glyphicons
│
├── site.webmanifest       # PWA manifest
├── humans.txt             # Credits
├── .well-known/
│   └── security.txt       # Vulnerability disclosure
│
├── robots.txt
├── sitemap.xml
├── nginx.conf             # Server config for Docker
├── Dockerfile             # nginx-based container
├── docker-compose.yml
├── .dockerignore
├── .lighthouserc.json     # CI audit thresholds
├── .github/workflows/ci.yml
├── status.md              # ★ Project tracker
├── audit-report.json      # Latest audit run
│
├── api/                   # ★ NestJS backend (Phase 4)
├── db/                    # ★ Migrations + seeds + schema docs
├── shared/                # ★ TS types + Zod validators (FE/BE shared)
├── infra/                 # ★ Docker, Coolify, Authentik, nginx
├── docs/                  # ★ Architecture, ADRs, schema, auth, deploy
│
└── README.md              # This file
```

### New (Phase 4) — backend, DB, auth

```
api/                  NestJS 10 + TypeScript (Express adapter)
db/
  migrations/         node-pg-migrate (per-schema folders)
  seeds/              idempotent reference SQL
  schemas/            per-domain ER + docs
shared/               Zod validators + inferred TS types (used by FE & BE)
infra/
  docker/             docker-compose.dev.yml, Dockerfile.api
  authentik/          Authentik stack + blueprints
  nginx/              reverse proxy snippets
  coolify/            Coolify-specific compose
docs/
  architecture.md     ★ master plan
  adr/                8 ADRs (NestJS, Authentik, schemas, …)
  database-schema.md  per-schema breakdown
  auth-flow.md        Authentik OIDC + PKCE
  api.md              REST conventions
  deployment.md       Coolify + Ubuntu
```

---

## Architecture Principles

1. **No hardcoded values** — All brand, contact, social, services, and SEO defaults live in `config.js`. Change once, update everywhere.
2. **No build step** — Plain HTML/CSS/JS. Edit, save, refresh.
3. **Multi-client ready** — Same codebase, swap `config.js` to rebrand for a new client.
4. **Pluggable** — Add/remove pages without breaking others.
5. **Accessible** — Semantic HTML, ARIA, keyboard-friendly, reduced-motion support.
6. **Performant** — Preconnect, lazy load, defer scripts, zero external CSS/JS dependencies (Font Awesome via CDN optional).
7. **Themeable** — CSS custom properties drive both dark and light themes; user choice persisted in `localStorage`.

---

## Configuration

`config.js` is the **single source of truth**. Edit it to:

- Change the brand name, tagline, description
- Update phone, email, WhatsApp, address
- Add/remove social profiles
- Add/remove services (homepage + nav update automatically)
- Update team members
- Override theme colors via CSS variable tokens
- Add analytics IDs (Google Analytics, Facebook Pixel, Clarity)
- Toggle feature flags (theme toggle, breadcrumbs, search, etc.)

Example — rebrand for a new client:

```js
brand: {
  name: "Acme Studio",
  shortName: "Acme",
  tagline: "Design that converts.",
  // ...
},
contact: {
  email: "hello@acme.com",
  phone: "+1 555 0100",
  // ...
},
social: {
  instagram: "https://instagram.com/acme",
  // ...
}
```

No other files need to change.

---

## Running Locally

```bash
# Just open index.html in a browser, or:
python3 -m http.server 8000
# Then visit http://localhost:8000
```

The site is fully static — no server-side runtime needed.

---

## Deployment

### GitHub Pages
1. Push to `main` branch
2. Settings → Pages → Source: `main` / `(root)`
3. Site is live at `https://<user>.github.io/<repo>`

### Cloudflare Pages
1. Connect repository
2. Build command: *(none)*
3. Build output: `/`
4. Deploy

### Vercel / Netlify
Same as Cloudflare — no build needed. Just import the repo.

### Docker / Self-hosted
```bash
docker compose up --build
# Site is live at http://localhost:8080
```

The `Dockerfile` uses `nginx:alpine` with `nginx.conf` providing:
- Gzip for all text assets
- 1-year cache for hashed/static assets, 1-hour for HTML
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- SPA-friendly fallback to `index.html`
- Block on hidden files (except `.well-known/`)

---

## Tech Stack

### Frontend (public site, unchanged)

| Layer        | Choice                                | Why                          |
|--------------|---------------------------------------|------------------------------|
| Markup       | Semantic HTML5                        | Accessible, future-proof     |
| Styling      | Hand-written CSS + custom properties  | Zero build, fully themable   |
| Behavior     | Vanilla JS (ES2017+)                  | No framework lock-in         |
| Animation    | CSS keyframes + IntersectionObserver  | Native, lightweight          |
| Icons        | Font Awesome 6 (CDN)                  | Industry standard            |
| Forms        | Google Apps Script (existing)         | User requirement             |
| Data         | Static JSON files                     | No database needed           |

### Backend + data + auth (Phase 4, new)

| Layer        | Choice                                | Why                          |
|--------------|---------------------------------------|------------------------------|
| API          | **NestJS 10 + TypeScript**            | DI, modules, OpenAPI, RBAC   |
| Validation   | **Zod** (shared FE/BE)                | One schema, two consumers    |
| DB           | **PostgreSQL 16** (logical schemas)   | One DB, many product areas   |
| Migrations   | **node-pg-migrate** (raw SQL)         | SQL-first, no ORM lock-in    |
| Auth (IdP)   | **Authentik** (OIDC, self-hosted)     | MFA, social, admin UI        |
| Auth (API)   | JWKS-validated JWT, no local passwords| Stateless, replaceable       |
| Hosting      | **Coolify on Ubuntu 24.04**           | Per user stack               |
| Quickstart   | **InsForge.dev** (parity via `DB_DRIVER` / `AUTH_DRIVER`) | Same code, two backends |

Full ADRs: `docs/adr/*.md`.

---

## Accessibility (WCAG 2.1 AA target)

- Skip-to-content link
- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`)
- Focus-visible outlines
- Color contrast: text on glass meets 4.5:1 minimum
- `prefers-reduced-motion` honored
- `prefers-color-scheme` for auto theme
- Keyboard-navigable mobile menu (Esc to close)
- All interactive elements have accessible names

---

## Performance (Lighthouse 95+ target)

- Zero render-blocking CSS
- Scripts loaded with `defer`
- `preconnect` to Font Awesome CDN
- `loading="lazy"` on images
- CSS variables → no theme-flash JS
- No web fonts (system font stack) → zero font swap CLS

---

## Extending the Site

### Add a new service
1. Add an entry to `config.services` in `config.js`:
   ```js
   {
     id: "new-service",
     slug: "new-service.html",
     title: "New Service",
     icon: "fa-icon-name",
     summary: "...",
     bullets: ["...", "..."]
   }
   ```
2. Create `new-service.html` (copy from existing service page as template).
3. The homepage service grid and the nav dropdown auto-populate from `config.services`.

### Add a new page
1. Create `new-page.html`
2. Include the same `<head>` and loader scripts as existing pages.
3. Add to `sitemap.xml`.

### Add a new team member
1. Append to `config.team` in `config.js`.

---

## License

Proprietary — © MilindWeb. All rights reserved.

---

## Configurable Features

The  object toggles page-level features. All default to on:

```js
features: {
  themeToggle:     true,
  skipLink:        true,
  scrollReveal:    true,
  cookieBanner:    true,
  backToTop:       true,
  readingProgress: true
}
```

Additionally, , , and  provide content
for the cookie banner, testimonials carousel, and FAQ accordion respectively. Edit
once in ; every page reflects the change automatically.

## 404 / Error Pages

The site ships with  (animated orbit, search, popular destinations, contextual WhatsApp CTA). nginx is configured to serve it via:

```nginx
error_page 404 /404.html;
```

For GitHub Pages or other static hosts, custom error pages must be configured per platform (Cloudflare Pages:  or Pages Functions; Netlify: ).

## Build & Maintenance Scripts

| Script | Purpose |
|---|---|
| `scripts/build_assets.py` | Regenerate `img/og-cover.jpg` + full favicon set from brand colors. Run after major brand changes. |
| `scripts/inject_favicons.py` | One-time patch to add `<link rel="manifest">` and PNG/ICO favicons to all HTML pages. |
| `scripts/audit.py` | Local Lighthouse-style audit (perf / a11y / best-practices / SEO). Use when Chrome isn't available. |

```bash
# Regenerate brand assets
python3 scripts/build_assets.py

# Audit
python3 -m http.server 8000 &
python3 scripts/audit.py > audit-report.json
```

CI runs the same audit (and a real Lighthouse via `treosh/lighthouse-ci-action`) on every push — see `.github/workflows/ci.yml`.
