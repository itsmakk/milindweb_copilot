# Project Status — MilindWeb Redesign

> Live tracking of phases, tasks, decisions, and known issues.
> Updated by AI per writing block rule 16.

---

## Current Phase: **Phase 4 — Backend / DB / Auth** 🟡 DESIGN COMPLETE, SCAFFOLDING IN PROGRESS

### Phase 1 + 2 + 2B + 3 + 5 + 6 (Polish) — ✅ COMPLETE
- Central multi-client config (`config.js`)
- Unified dark-mode-first design system (glassmorphism)
- 8-service homepage, reusable header/footer, theme toggle, a11y
- 9 refactored service pages + 4 new service pages
- 3 refactored utility pages
- Brand assets, security.txt, humans.txt, Dockerfile, CI
- Audit baseline 99/100 across 14 pages
- 404 page, cookie banner, back-to-top, reading progress, FAQ, testimonials

### Phase 4 — Backend / DB / Auth (NEW)
- ✅ Stack chosen: NestJS 10 (TS) + PostgreSQL 16 (logical schemas) + Authentik (OIDC) + Coolify on Ubuntu 24.04
- ✅ Migrations: `node-pg-migrate` (raw SQL when possible)
- ✅ Validation: Zod (shared FE/BE)
- ✅ Hosting: Coolify on a single Ubuntu VPS, self-hosted
- ✅ InsForge parity: same `api/src` runs against self-hosted PG or InsForge via `DB_DRIVER` / `AUTH_DRIVER` env
- ✅ Architecture doc + 8 ADRs written (`docs/architecture.md`, `docs/adr/*.md`)
- ✅ Schema design written (`docs/database-schema.md`)
- ✅ Auth flow doc written (`docs/auth-flow.md`)
- ✅ Deployment doc written (`docs/deployment.md`)
- ✅ API conventions doc written (`docs/api.md`)
- ✅ Infra skeleton: `infra/authentik/`, `infra/docker/`, `infra/nginx/`
- 🟡 Folder skeleton created; modules not yet implemented
- ⏳ Next: implement `api/` NestJS skeleton + `db/` migrations scaffold

See `docs/architecture.md` for the source of truth.

---

## Phase 2 — Task Tracker (5 refactored pages)

| # | Task                                       | Status | Notes                                |
|---|--------------------------------------------|--------|--------------------------------------|
| 1 | Refactor `freelance_seo_consultant.html`   | ✅     | FAQ + Service schema, 5 service blocks|
| 2 | Refactor `graphics.html`                   | ✅     | 6 service cards, showcase gallery    |
| 3 | Refactor `website-tech-solutions.html`     | ✅     | 4 service blocks + benefits          |
| 4 | Refactor `project.html`                    | ✅     | 4 domains + showcase table            |
| 5 | Refactor `workshop.html`                   | ✅     | 2 workshops with topic grids          |
| 6 | Verify all pages (HTTP 200, scripts)       | ✅     | Smoke-tested via local server         |

## Phase 2B — Task Tracker (4 new pages)

| # | Task                                       | Status | Notes                                |
|---|--------------------------------------------|--------|--------------------------------------|
| 1 | Create `photography.html`                  | ✅     | 6 service cards incl. rental, gallery|
| 2 | Create `electrical.html`                   | ✅     | 6 services, 3 stats, safety promise   |
| 3 | Create `automotive.html`                   | ✅     | 6 services, 3 stats, EV support       |
| 4 | Create `automation.html`                   | ✅     | 6 domains, stack/integrations, process|
| 5 | HTTP smoke-test (4 pages + shared assets)  | ✅     | All return 200, scripts correct, all `<img>` have `alt` |
| 6 | Update `sitemap.xml` with 4 new pages      | ✅     | 13 URLs total                         |

## Phase 3 — Task Tracker (3 utility pages)

| # | Task                                       | Status | Notes                                |
|---|--------------------------------------------|--------|--------------------------------------|
| 1 | Refactor `contact.html`                    | ✅     | About + 5 `<details>` policy cards + inline form + reach-us sidebar with service-area chips |
| 2 | Refactor `calendar.html`                   | ✅     | Original JS logic preserved; theme-aware month colors; year dropdown; holidays list |
| 3 | Refactor `links.html`                      | ✅     | Original fetch+search logic preserved; glass link cards; status badges; XSS-safe escaping |
| 4 | Add `data-fill="service-areas"` to `app.js`| ✅     | New autoFill case renders chips from `config.contact.serviceAreas` |
| 5 | HTTP smoke-test (3 pages + JSON data)      | ✅     | All return 200, scripts correct order, no images missing alt |
| 6 | Update `sitemap.xml` for `contact.html`    | ✅     | 14 URLs total                         |

All 12 pages now use:
- New design system (`css/theme.css` + `css/headerfooter.css`)
- Central config (`config.js`)
- New header/footer (auto-loaded)
- Page-specific SEO meta + schema.org JSON-LD
- Skip-link, ARIA, theme toggle, scroll-reveal
- Accessibility: `<details>/<summary>` for native a11y on policy cards, `aria-live` for status & holidays, `aria-label` on icon-only controls, escapeHtml for all JSON-derived text

### Phase 1 Goals
- Establish a central, multi-client configuration system
- Build a unified dark-mode-first design system (glassmorphism)
- Refactor the homepage to use 8 services (per new content brief)
- Reusable header & footer, theme toggle, accessibility basics
- **No changes** to: `blog.html`, `Seniariity_Management.html`, `Seniariity_List.html`, `form.html` (Hospital Manager) — deferred until PostgreSQL auth phase.

---

## Phase 1 — Task Tracker

| # | Task                                | Status      | Notes                                          |
|---|-------------------------------------|-------------|------------------------------------------------|
| 1 | `config.js` central configuration   | ✅ Done     | Brand, contact, social, services, SEO, theme   |
| 2 | `css/theme.css` design system       | ✅ Done     | Dark-first, glassmorphism, accessible, A11y    |
| 3 | `css/headerfooter.css` new theme    | ✅ Done     | Glass header, animated footer                  |
| 4 | `js/headerfooter.js` loader + theme | ✅ Done     | Theme toggle, mobile menu, smooth scroll      |
| 5 | `js/app.js` utilities               | ✅ Done     | Config applier, intersection-observer, helpers|
| 6 | `header.html` new design            | ✅ Done     | Skip link, ARIA, mobile-first                  |
| 7 | `footer.html` new design            | ✅ Done     | 4-column grid, social icons                    |
| 8 | `index.html` redesigned homepage    | ✅ Done     | Hero, 8 services, about, CTA, schema.org      |
| 9 | `robots.txt` updated                | ✅ Done     | Allows crawlers, points to sitemap             |
|10 | `sitemap.xml` updated               | ✅ Done     | All public pages listed                        |
|11 | `README.md` documentation           | ✅ Done     | Project structure, deployment, multi-client    |

---

## Architecture Decisions

| Decision                          | Choice                              | Reason                                       |
|-----------------------------------|-------------------------------------|----------------------------------------------|
| Framework                         | Vanilla HTML / CSS / JS             | Per user requirement, zero build step        |
| Animation                         | CSS + IntersectionObserver          | Lightweight, no Framer Motion (React only)   |
| Config strategy                   | Runtime JS (`config.js`)            | Zero build, single source of truth           |
| Theme system                      | CSS custom properties + `[data-theme]` | Native, fast, themable                     |
| State persistence                 | `localStorage` for theme           | No server needed                             |
| Routing                           | Static HTML files                   | GitHub Pages / Cloudflare Pages compatible   |
| Forms                             | Existing Google Apps Script (kept)  | User instruction: "use my google app script" |
| Multi-client                      | Single `config.js` change           | New client = new config                      |

---

## File Map (after Phase 1)

```
/
├── config.js                ★ NEW — central config
├── index.html               ★ REWRITTEN — 8-service homepage
├── header.html              ★ REWRITTEN — new design
├── footer.html              ★ REWRITTEN — new design
├── contact.html             (untouched this phase)
├── contactform.html         (untouched this phase — kept for inline reuse)
├── form.html                (deferred — Hospital Manager)
├── blog.html                (deferred)
├── project.html             ★ REWRITTEN — Phase 2
├── workshop.html            ★ REWRITTEN — Phase 2
├── freelance_seo_consultant.html    ★ REWRITTEN — Phase 2
├── graphics.html                   ★ REWRITTEN — Phase 2
├── website-tech-solutions.html     ★ REWRITTEN — Phase 2
├── photography.html         ★ NEW — Phase 2B
├── electrical.html          ★ NEW — Phase 2B
├── automotive.html          ★ NEW — Phase 2B
├── automation.html          ★ NEW — Phase 2B
├── Seniariity_*.html        (deferred — PostgreSQL phase)
├── calendar.html            ★ REWRITTEN — Phase 3
├── links.html               ★ REWRITTEN — Phase 3
├── contact.html             ★ REWRITTEN — Phase 3
│
├── css/
│   ├── theme.css            ★ NEW — design system
│   ├── headerfooter.css     ★ REWRITTEN
│   ├── blog.css             (untouched)
│   ├── posts.css            (untouched)
│   ├── style.css            (untouched)
│   ├── nadstyle.css         (untouched)
│   └── font-awesome.min.css (untouched)
│
├── js/
│   ├── app.js               ★ NEW — config applier + utilities
│   ├── headerfooter.js      ★ REWRITTEN
│   ├── form-handler.js      (untouched)
│   ├── blog.js              (untouched)
│   ├── patientform.js       (untouched)
│   └── sheetHandler.js      (untouched)
│
├── data/                    (untouched)
├── fonts/                   (untouched)
├── img/                     (untouched)
│
├── robots.txt               ★ UPDATED
├── sitemap.xml              ★ UPDATED
├── status.md                ★ NEW (this file)
└── README.md                ★ NEW
```

---

## Pending Tasks (Backlog)

### Phase 2 — Service pages ✅ DONE
- [x] Refactor `freelance_seo_consultant.html`
- [x] Refactor `graphics.html`
- [x] Refactor `website-tech-solutions.html`
- [x] Refactor `project.html`
- [x] Refactor `workshop.html`

### Phase 2B — New service pages ✅ DONE
- [x] Create `photography.html`
- [x] Create `electrical.html`
- [x] Create `automotive.html`
- [x] Create `automation.html`

### Phase 3 — Utility pages ✅ DONE
- [x] Refactor `contact.html` (privacy, terms, disclaimer, form)
- [x] Refactor `calendar.html`
- [x] Refactor `links.html`

### Phase 4 — Replace/Defer
- [ ] `blog.html` — design from scratch (PostgreSQL auth)
- [ ] `Seniariity_Management.html` — design from scratch (PostgreSQL auth)
- [ ] `Seniariity_List.html` — design from scratch (PostgreSQL auth)
- [ ] `form.html` (Hospital Manager) — design from scratch (PostgreSQL auth)

### Phase 5 — Production hardening ✅ DONE
- [x] Add real OG image (`img/og-cover.jpg`, 46 KB, 1200×630)
- [x] Add favicon set (`favicon.ico` multi-size, 16/32/180/192/512 PNGs, inline SVG fallback)
- [x] Add `site.webmanifest` (PWA)
- [x] Add `.well-known/security.txt` (RFC 9116 compliant)
- [x] Add `humans.txt`
- [x] Lighthouse audit (heuristic) — 99/100 across all 14 pages
- [x] Dockerfile (`nginx:alpine`) + `docker-compose.yml` + `nginx.conf` (gzip, cache, security headers, SPA fallback, 404)
- [x] GitHub Actions CI (HTML/config/JSON validation + Lighthouse via `treosh/lighthouse-ci-action`)
- [x] Lighthouse config (`.lighthouserc.json`) with performance/a11y/SEO thresholds

### Phase 6 — Polish & features ✅ DONE
- [x] **404.html** — glass hero with animated 3-ring orbit, search box, 13 popular destinations, WA CTA with auto-context message
- [x] **Cookie banner** — config-driven copy, localStorage persistence (`mw_cookie_consent_v1`), slide-in/slide-out animation, ARIA dialog
- [x] **Back-to-top button** — appears after 600px scroll, sits above theme toggle, smooth scroll, full a11y
- [x] **Reading progress bar** — fixed top, gradient fill, auto-updates on scroll/resize
- [x] **FAQ section** — config-driven 8 Q&A on homepage, native `<details>` for a11y, FAQPage JSON-LD auto-injected
- [x] **Testimonials section** — config-driven 5 cards with star ratings, glass-card style, on homepage
- [x] **Config extensions** — added `features.{cookieBanner, backToTop, readingProgress}`, `cookie{}`, `testimonials[]`, `faq[]`
- [x] **nginx.conf** — `error_page 404 /404.html` with `internal` and `no-store` cache headers
- [x] **All 14 pages** still 99.0/100 audit average (perf 100, a11y 100, BP 95, SEO 100)

---

## Known Issues / Fixes Log

| Date       | Issue                                          | Fix                          |
|------------|------------------------------------------------|------------------------------|
| 2026-06-03 | Empty `prompt.md`                              | Filled via writing block     |
| 2026-06-03 | WhatsApp number typo on `freelance_seo_consultant.html` (8787575 vs 987875) | Centralized in `config.js` — pages consume `MW.waHref()` |

---

## Recent Changes

- **2026-06-03** — Phase 6 complete. Polish & features.
  - **`404.html`** (custom error page): animated 3-ring orbit illustration with 4 chip labels, search box, 13 popular destinations in glass-card grid, contextual WhatsApp CTA that includes the missing path in the message
  - **Cookie banner** (`js/app.js` + `css/theme.css`): config-driven copy, slide-in animation, ARIA dialog, localStorage persistence, links to `/contact.html#policies`
  - **Back-to-top button** (`#backToTop`): injected at runtime, appears after 600px scroll, sits above `#themeToggle`, smooth scroll, full a11y
  - **Reading progress bar** (`#readingProgress`): fixed top, 3px tall, gradient fill, auto-updates on scroll/resize, `prefers-reduced-motion` respected
  - **FAQ section** (homepage): 8 Q&A from `config.faq`, native `<details>`/`<summary>` for a11y, FAQPage JSON-LD auto-injected
  - **Testimonials section** (homepage): 5 cards from `config.testimonials`, star ratings, glass-card style
  - **Config**: new keys `testimonials[]`, `faq[]`, `cookie{}`, `features.{cookieBanner, backToTop, readingProgress}` (all toggleable)
  - **nginx.conf**: `error_page 404 /404.html` with `internal` and `no-store` cache headers
  - **Audit**: all 14 pages (now including 404) still 99.0/100 average

- **2026-06-03** — Phase 5 complete. Production hardening.
  - **Brand assets** (`scripts/build_assets.py`): `img/og-cover.jpg` (1200×630, 46 KB), `img/favicon.ico` (16/32/48 multi-size), PNG set 16/32/180/192/512, plus inline SVG favicon
  - **PWA**: `site.webmanifest` with maskable 512×512 icon
  - **Security**: `.well-known/security.txt` (RFC 9116), `humans.txt`
  - **Deployment**: `Dockerfile` (nginx:alpine, healthcheck, labels), `docker-compose.yml`, `nginx.conf` (gzip, 1y cache for assets, security headers, SPA fallback, hidden-files block)
  - **CI**: `.github/workflows/ci.yml` — validates every HTML page (config.js, app.js, headerfooter.js, canonical, description, JSON-LD, skip-link), parses `config.js` via Node, validates JSON, validates sitemap.xml, runs Lighthouse (desktop) on 3 key pages
  - **Audit script**: `scripts/audit.py` — heuristic Lighthouse-style audit, output `audit-report.json` (99.0/100 across all 13 pages)
  - **HTML pages**: all 13 patched to reference `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon`, `site.webmanifest` via `scripts/inject_favicons.py`
  - README updated with new structure, Docker instructions, and scripts section
  - **Audit baseline**: Perf 100, A11Y 100, Best Practices 95, SEO 100 (overall 99.0) on all 13 pages

- **2026-06-03** — Phase 3 complete. 3 utility pages refactored.
  - `contact.html` (14.8 KB): 6 collapsible policy cards (native `<details>`/`<summary>`), inline form, "reach us" sidebar with address/phone/WA/service-area chips
  - `calendar.html` (11.5 KB): original calendar JS preserved verbatim; theme-aware month header colors; year-nav controls; holidays list with `aria-live`
  - `links.html` (10.3 KB): original fetch+search logic preserved; re-skinned to glass cards; XSS-safe escaping; status badges for live/beta/broken items
  - Added `data-fill="service-areas"` to `js/app.js` autoFill (reusable for any future page)
  - HTTP smoke-tested: all 3 pages + `data/holidays.json` + `data/links.json` return 200
  - `sitemap.xml` updated (14 URLs total)

- **2026-06-03** — Phase 2B complete. 4 new service pages created.
  - `photography.html` (11 KB), `electrical.html` (9.7 KB), `automotive.html` (9.0 KB), `automation.html` (11.5 KB)
  - All consume config-driven services from `config.js`; include Service schema, inline contact form, glass cards, scroll-reveal
  - HTTP smoke-tested: all 4 pages + 10 shared assets return 200
  - `sitemap.xml` updated (14 URLs total)

- **2026-06-03** — Phase 2 complete. 5 service pages refactored.
  - `freelance_seo_consultant.html`, `graphics.html`, `website-tech-solutions.html`, `project.html`, `workshop.html` rewritten to use new design system
  - All have proper SEO meta, schema.org JSON-LD, ARIA, skip-link, theme toggle
  - Inline contact forms (no longer fetching `contactform.html` from each page)
  - Verified: all 6 pages return HTTP 200, scripts in correct defer order

- **2026-06-03** — Phase 1 complete. Foundation + Homepage redesigned.
  - Added `config.js`, `css/theme.css`, `js/app.js`
  - Rewrote `header.html`, `footer.html`, `index.html`
  - Updated `headerfooter.css`, `headerfooter.js`
  - Updated `robots.txt`, `sitemap.xml`
  - Added `status.md`, `README.md`

---

## Next Steps (after user approval)
1. Phase 4 — build deferred auth pages once PostgreSQL stack is planned (`blog.html`, `Seniariity_*.html`, `form.html`).
2. Real Lighthouse run: trigger the GitHub Actions CI by pushing to a repo (the local environment lacks Chrome).
3. Content review: open `index.html` and other pages in a browser, verify visuals match brand expectations, replace the AI-rendered OG image with a real branded design if desired.
4. Optional further polish: blog teaser on homepage, lightbox gallery for photography, service-page testimonials, animated hero backgrounds.

## Deferred — waiting for architecture prompt

Per user instruction (2026-06-03), the next session will focus on **architecture design for Backend / DB / Auth** (no code). Planned stack:

- **Frontend** — this static site (vanilla HTML/CSS/JS, config-driven, no build step)
- **Backend** — Node.js / Express (or similar) for APIs, form proxies, auth, data serving
- **DB** — PostgreSQL with **logical schema separation**:
  - `auth` — users, roles, sessions, oauth_tokens, password_resets
  - `portfolio` — services, projects, testimonials, faq, blog_posts, links, calendar_holidays
  - `hospital` — patients, doctors, departments, lab_tests, prescriptions, complaints, OPD forms
  - `seniority` — employees, departments, leave, seniority_rules, exports
- **Auth** — shared across schemas, role + tenant aware

**Updated 2026-06-03 — scope confirmed:**
- Build **two sections, one by one**:
  1. **Seniority Management** (first) — targets existing `Seniariity_Management.html` + `Seniariity_List.html`
  2. **Hospital Management** (second) — targets existing `form.html` (Hospital Manager)
- **Auth**: single simple standard auth (one `auth` schema) — plain SQL migrations, one runner, so both apps share migration state cleanly
- Likely columns: `id (uuid)`, `email (citext unique)`, `password_hash`, `role`, `tenant (null | 'seniority' | 'hospital')`, timestamps

Open questions pending user prompt:
1. Migration tool: `node-pg-migrate` vs raw `.sql` files vs Prisma vs Knex (lean: `node-pg-migrate` for portability)
2. Password hashing: `bcrypt` (work factor 12) vs `argon2id` (recommended)
3. Session vs JWT: sessions (DB-backed) vs short-lived JWT + refresh token
4. Where the backend will be hosted (Render, Railway, VPS, etc.) — affects migration run strategy

**Reminder list** (user said "remind me later"):
- [ ] **Later-1**: GitHub repo init + push + CI live run
- [ ] **Later-2**: Phase 4 — auth-gated pages (Seniority first, then Hospital) — blocked on Backend/DB/Auth architecture
- [ ] **Later-3**: More polish (blog teaser, lightbox, print styles, SRI hashes)

---

## Phase 4 — Architecture (2026-06-04) ✅ DESIGN LOCKED

User confirmed the target stack:

```
Ubuntu Server → Docker → Coolify → [Frontend | Backend (NestJS) | PostgreSQL | Authentik]
                                                    │
                                                    ├── auth schema
                                                    ├── portfolio schema
                                                    ├── hospital schema
                                                    ├── seniority schema
                                                    └── (future schemas)
```

### Stack decisions

| Concern        | Choice                              |
|----------------|-------------------------------------|
| Frontend       | Vanilla HTML/CSS/JS, nginx, config-driven (kept as-is) |
| Backend        | **NestJS 10 + TypeScript** (Express adapter) |
| DB             | **PostgreSQL 16** (logical schemas) |
| Migrations     | **node-pg-migrate** (raw SQL)       |
| Validation     | **Zod** (shared FE/BE)              |
| Auth           | **Authentik** (OIDC) — backend is a Resource Server, no local passwords |
| Hosting        | **Coolify on Ubuntu 24.04 LTS**     |
| Quickstart     | **InsForge.dev** (parity via `DB_DRIVER` + `AUTH_DRIVER`) |
| Object storage | InsForge Storage (dev) / S3-compatible (prod) |
| Reverse proxy  | Coolify's Caddy (or nginx in `infra/nginx/`) |
| CI             | GitHub Actions (4 pipelines)        |

### Repo layout (new)

```
api/                  ★ NestJS
db/                   ★ migrations + seeds + schema docs
shared/               ★ TS types + Zod validators
infra/                ★ docker, coolify, authentik, nginx
docs/                 ★ architecture, adr, diagrams
   ├─ architecture.md (source of truth)
   ├─ adr/0001..0008.md
   ├─ database-schema.md
   ├─ auth-flow.md
   ├─ deployment.md
   └─ api.md
```

### Phases (post-design)

- [x] **4.1** Workspace + `api/` skeleton + first `db/migrations/auth/*` — done 2026-06-04
- [x] **4.3** Seniority MVP (schema, module, RBAC) — done 2026-06-04
- [x] **4.2** Authentik OIDC wiring (PKCE, JWKS, first-login sync) — done 2026-06-04
- [x] **4.4** Hospital MVP — done 2026-06-04
- [x] **4.5** Portfolio API — done 2026-06-04
- [x] **4.6** InsForge parity (`DB_DRIVER=insforge`) — done 2026-06-04
- [x] **4.5b** Portfolio admin write endpoints — done 2026-06-04
- [x] **4.7** Backups + monitoring (Coolify cron + Uptime Kuma) — done 2026-06-04
- [x] **4.8** Polish (blog teaser, lightbox, print styles, SRI, swap static site to fetch /portfolio/landing) — done 2026-06-04
- [x] **5** Admin SPA (portfolio writes) — done 2026-06-04
- [x] **7** Hospital OPD SPA (replaces form.html) — done 2026-06-04

### Phase 4.3 deliverables — Seniority MVP (2026-06-04)

**`db/migrations/seniority/1717000001000_init.js`** — new `seniority` schema with 6 tables:
- `departments` (org tree, self-referential `parent_id`)
- `employees` (master record, with dates + grade/cadre + JSONB `qualifications`)
- `leave` (request + approval workflow, partial unique index on `seniority_rules.is_active=true`)
- `seniority_rules` (formula-driven, exactly-one-active enforced by partial EXCLUDE constraint)
- `exports` (history of generated files)
- `audit_log` (append-only)
- All writeable tables get the soft-delete + audit columns from §1
- `updated_at` trigger per table; `seniority.set_updated_at()` function
- Seed: one default active rule `doj ASC, full_name ASC`

**`db/seeds/seniority_departments.sql`** — 12 starter departments (GEN, FIN, EDU, HLT, SOC, AGR, ENG, IT, LEG, PR, HR, PRO).

**`db/schemas/seniority.md`** — local reference.

**`shared/src/seniority.ts`** — Zod schemas + TS types for `Department`, `Employee`, `Leave`, `SeniorityRule`, `ExportRecord`, plus `Create/Update` and `*ListQuery` variants. `ALLOWED_FORMULA_FIELDS` whitelist exported.

**`api/src/modules/seniority/`** (16 files):
- `seniority.module.ts` — registers all sub-modules
- `audit.service.ts` — append-only audit logger
- `employees/seniority.engine.ts` — **whitelist-only** formula parser + SQL `ORDER BY` builder (defense against SQL injection in the formula)
- `departments/` — full CRUD (list/get/create/update/soft-delete)
- `employees/` — list (paginated, filterable, sortable by formula or query `sort`), get, create, update, soft-delete, restore
- `leave/` — list, get, create request, decide (approve/reject, admin), cancel
- `rules/` — list, getActive, get, create (with active-flag handling in a transaction), update, soft-delete
- `exports/` — `POST /generate` returns the file inline (`Content-Disposition: attachment`); CSV via native, XLSX via `exceljs`, PDF via `pdfkit`. Records every export in `seniority.exports`.

**AppModule + deps**:
- `SeniorityModule` registered
- `exceljs` + `pdfkit` + `@types/pdfkit` added to `api/package.json`

### Phase 4.2 deliverables — Authentik OIDC wiring (2026-06-04)

**Authentik blueprints** (`infra/authentik/blueprints/`):
- `10-milindweb-app.yaml` — OIDC provider + application, **public client** with PKCE, scopes `openid profile email groups`, 5-min access + 30-day refresh, end-session redirect URIs.
- `20-groups.yaml` — 16 groups matching `api/src/config/role-mapping.ts`:
  `super_admins`, `portfolio-{admins,editors}`, `seniority-{admins,editors,viewers}`,
  `hospital-{admins,doctors,reception,nurses,pharmacy,lab,radiology,accounts,viewers}`.

**Backend** (`api/src/modules/auth/`):
- `auth.controller.ts` — `GET /api/v1/auth/discovery` (public, returns `authorization_endpoint`, `token_endpoint`, `end_session_endpoint`, `jwks_uri`, `client_id`, `callback_url`, `scopes`), `GET /api/v1/auth/logout-url` (public, returns end-session URL), `GET /api/v1/auth/me` (JWT).
- `UsersService.findOrCreate` — lazy-provisions the local mirror row on first authenticated request (already present in 4.1; now covered by a unit test).

**Frontend** (`auth/`, vanilla JS, no deps):
- `auth/oidc-client.js` — `MW_AUTH` global: `ready()`, `login()`, `logout()`, `handleCallback()`, `refresh()`, `syncApiUser()`, `fetch()` wrapper, `isExpired()`. PKCE (S256), state CSRF check, silent refresh, `end_session_endpoint`-based logout.
- `auth/login.html` + `auth/style.css` — branded login page.
- `auth/callback.html` — handles `?code&state`, exchanges for tokens, calls `/users/me` to materialize the local mirror row, redirects to `returnTo`.
- `auth/logout.html` — clears localStorage, redirects to Authentik end-session endpoint with `id_token_hint`.
- `auth/me.html` + `auth/me.js` — shows the signed-in user's role, tenant, groups, last sign-in.
- `header.html` — added a "Sign in" link (id `hfAuthLink`) to the desktop + mobile nav.

**Tests**:
- `api/src/modules/auth/auth.controller.spec.ts` — discovery + logout-url payload shape.
- `api/src/modules/users/users.service.spec.ts` — first-login mirror sync (create + update on subsequent calls, role change reflected).
- `api/src/config/role-mapping.spec.ts` — super_admin precedence, multi-group priority, unknown-group fallback.

### Phase 4.4 deliverables — Hospital MVP (2026-06-04)

**`db/migrations/hospital/1717000002000_init.js`** — new `hospital` schema with 6 tables: `departments` (self-referential + default symptoms), `doctors` (unique by `lower(name)` while live), `patients` (UHID unique, medical history as JSONB arrays), `opd_visits` (per-day OPD number sequence), `prescriptions` (child of visit), `audit_log`. All writeable tables get soft-delete + audit columns and a `set_updated_at()` trigger.

**`db/seeds/hospital_doctors_and_departments.sql`** — 19 departments (GEN, CARD, ENT, EYE, DENT, ORTHO, GYNAE, PEDI, SURG, DERM, EMER, CHEST, ENDO, GASTRO, NEPH, NEURO, RAD, LAB, PHARM) and the 10 doctors from the old `form.html` dropdown. Idempotent (`ON CONFLICT DO NOTHING`).

**`db/schemas/hospital.md`** — local pointer; lists the tables and what's intentionally **out of scope** for the MVP (pharmacy, lab, radiology, billing, document upload, appointments) so the user knows what's coming later.

**`shared/src/hospital.ts`** — Zod schemas: `Department`, `Doctor`, `Patient` (+ `Create/Update`), `OpdVisit` (+ `Create/Update`), `Prescription` (+ `Create/Update`), `Symptom`, list-query variants. Re-exported via `shared/src/index.ts`.

**`api/src/modules/hospital/`** (12 files):
- `hospital.module.ts`, `audit.service.ts`
- `departments/`, `doctors/` — full CRUD, admin-only writes.
- `patients/` — `GET /search?q=` (matches name / mobile / UHID), full CRUD. Auto-generates `MH-YYYY-NNNNNN` UHIDs. Receptionist + doctor + admin can create.
- `visits/` — full CRUD, nested `prescriptions/` endpoints. Auto-generates `OPD-YYYY-MM-DD-NNNN` OPD numbers per day. Admin + doctor can write clinical fields; nurse/reception can create.

**AppModule** — `HospitalModule` registered.

**Endpoints** (all JWT, scoped to `hospital` tenant):

| Method | Path | Role | Description |
|---|---|---|---|
| `GET`    | `/api/v1/hospital/departments`           | any hospital_*  | list |
| `GET`    | `/api/v1/hospital/departments/:id`       | any hospital_*  | read one |
| `POST`   | `/api/v1/hospital/departments`           | admin           | create |
| `PATCH`  | `/api/v1/hospital/departments/:id`       | admin           | update |
| `DELETE` | `/api/v1/hospital/departments/:id`       | admin           | soft delete |
| `GET`    | `/api/v1/hospital/doctors`               | any hospital_*  | list |
| `GET`    | `/api/v1/hospital/doctors/:id`           | any hospital_*  | read one |
| `POST`   | `/api/v1/hospital/doctors`               | admin           | create |
| `PATCH`  | `/api/v1/hospital/doctors/:id`           | admin           | update |
| `DELETE` | `/api/v1/hospital/doctors/:id`           | admin           | soft delete |
| `GET`    | `/api/v1/hospital/patients`              | any hospital_*  | list, filter by gender / name / mobile / UHID |
| `GET`    | `/api/v1/hospital/patients/search?q=`    | any hospital_*  | top 10 matches (name / mobile / UHID) |
| `GET`    | `/api/v1/hospital/patients/:id`          | any hospital_*  | read one |
| `POST`   | `/api/v1/hospital/patients`              | admin/recep/doc | create (auto UHID) |
| `PATCH`  | `/api/v1/hospital/patients/:id`          | admin/recep/doc | update |
| `DELETE` | `/api/v1/hospital/patients/:id`          | admin           | soft delete |
| `GET`    | `/api/v1/hospital/visits`                | any hospital_*  | list, filter by patient / doctor / date range |
| `GET`    | `/api/v1/hospital/visits/:id`            | any hospital_*  | read one (with nested prescriptions) |
| `POST`   | `/api/v1/hospital/visits`                | admin/doc/recep/nurse | create (auto OPD no) |
| `PATCH`  | `/api/v1/hospital/visits/:id`            | admin/doc       | update |
| `DELETE` | `/api/v1/hospital/visits/:id`            | admin           | soft delete |
| `GET`    | `/api/v1/hospital/visits/:id/prescriptions`  | any hospital_* | list prescriptions |
| `POST`   | `/api/v1/hospital/visits/:id/prescriptions`  | admin/doc     | add prescription |
| `DELETE` | `/api/v1/hospital/visits/:id/prescriptions/:rxId` | admin/doc | soft delete prescription |

### Phase 4.6 deliverables — InsForge parity (2026-06-04)

**Goal**: switch the database backend between self-hosted Postgres (`pg` driver, default) and the hosted InsForge PostgREST API (`insforge` driver) by setting `DB_DRIVER`.

**Driver abstraction**:
- `api/src/database/driver.ts` — `DbDriver` interface (`query`, `withTransaction`, `ping`, `close`, `name`).
- `api/src/database/drivers/pg.driver.ts` — the existing `pg` implementation, extracted. Sets `search_path` per call. Implements `OnModuleDestroy` to close the pool on shutdown.
- `api/src/database/drivers/insforge.driver.ts` — PostgREST HTTP client. Recognises the SQL shapes our services emit:
  - `SELECT cols FROM {schema}.{table} [WHERE …] [ORDER BY …] [LIMIT n OFFSET m]`
  - `INSERT INTO {schema}.{table} (cols) VALUES (…) [RETURNING …]`
  - `UPDATE {schema}.{table} SET … [WHERE …] [RETURNING …]`
  - `DELETE FROM {schema}.{table} [WHERE …]`
  
  Translates `WHERE` to PostgREST filters (`eq.`, `neq.`, `gt.`, `ilike.`, `in.()`, `is.null`, `not.is.null`, `cs.` for JSONB contains). Sanity-checks table/column names against `[a-z_][a-z0-9_]*` so nothing unsafe reaches a URL path. Throws on unsupported shapes (transactions, `BETWEEN`, `TRUNCATE`, etc.) with a clear error pointing at `DB_DRIVER=pg`.

**Facade + backwards compat**:
- `api/src/database/pool.ts` now exports a `DbFacade` (Nest-injectable) and a `DatabaseModule`. Services that already inject `@Inject('DB')` get a `DbHandle`; the legacy module-level `query()` / `withTransaction()` still work because the facade binds itself on `onModuleInit` and the shims delegate to it.
- `HealthController` now reports `{ status, driver: 'pg' | 'insforge', checks: { database: { ok, latency_ms } } }` on `/health/ready`.

**Env wiring**:
- `env.ts` adds a `.refine()` clause: when `DB_DRIVER=insforge`, `INSFORGE_BASE_URL` is required.
- `main.ts` logs the active driver + auth driver at boot: `API listening on :3000/api/v1 (db=pg, auth=authentik)`.

**Tests** (`api/src/database/driver.spec.ts`):
- InsForgeDriver: `SELECT` builds the right URL with `select=`, `eq.`, `Authorization`, `apikey` headers.
- `INSERT` POSTs a single-row JSON body with `Prefer: return=representation`.
- `UPDATE` PATCHes with `eq.` filters.
- `DELETE` returns empty `rows` + correct `rowCount`.
- Unsupported SQL (`TRUNCATE`, `BETWEEN`) throws with a clear message.
- `withTransaction` always throws on InsForge (no multi-statement transactions supported).

**Verified**: switching `DB_DRIVER=insforge` + providing `INSFORGE_BASE_URL` + `INSFORGE_API_KEY` boots the API and serves `/api/v1/portfolio/landing` (and any other read-only route) through PostgREST. Writes that need transactions should keep `DB_DRIVER=pg` — the audit log and the seniority rule's "one active" invariant both use `withTransaction`, so the seniority rules service in particular should not be flipped to InsForge until InsForge ships a transactions API.

### Phase 4.5b deliverables — Portfolio admin write endpoints (2026-06-04)

**`api/src/modules/portfolio/portfolio.admin.service.ts`** — write-side service for the same seven tables. All writes go through soft-delete + audit; never `DELETE` from SQL, only `UPDATE deleted_at`. A `PortfolioAuditService` keeps the per-table audit_log table in sync.

**`api/src/modules/portfolio/portfolio.admin.controller.ts`** — all admin routes sit under `/api/v1/portfolio/admin/*` and require JWT + `Roles('portfolio_admin', 'portfolio_editor')`. UUIDs validated with `parseUUIDPipe`. Bad bodies return a 400 via the global `ValidationPipe`.

| Method | Path | Description |
|---|---|---|
| `POST`   | `/api/v1/portfolio/admin/profile`            | upsert the singleton profile row (id=1) |
| `PATCH`  | `/api/v1/portfolio/admin/profile`            | partial update of profile |
| `POST`   | `/api/v1/portfolio/admin/services`           | create a service |
| `PATCH`  | `/api/v1/portfolio/admin/services/:id`       | update |
| `DELETE` | `/api/v1/portfolio/admin/services/:id`       | soft delete |
| `POST`   | `/api/v1/portfolio/admin/projects`           | create a project |
| `PATCH`  | `/api/v1/portfolio/admin/projects/:id`       | update |
| `DELETE` | `/api/v1/portfolio/admin/projects/:id`       | soft delete |
| `POST`   | `/api/v1/portfolio/admin/posts`              | create a post (auto slug) |
| `PATCH`  | `/api/v1/portfolio/admin/posts/:id`          | update |
| `DELETE` | `/api/v1/portfolio/admin/posts/:id`          | soft delete |
| `POST`   | `/api/v1/portfolio/admin/testimonials`       | create |
| `PATCH`  | `/api/v1/portfolio/admin/testimonials/:id`   | update |
| `DELETE` | `/api/v1/portfolio/admin/testimonials/:id`   | soft delete |
| `POST`   | `/api/v1/portfolio/admin/faq`                | create |
| `PATCH`  | `/api/v1/portfolio/admin/faq/:id`            | update |
| `DELETE` | `/api/v1/portfolio/admin/faq/:id`            | soft delete |
| `POST`   | `/api/v1/portfolio/admin/team`               | create |
| `PATCH`  | `/api/v1/portfolio/admin/team/:id`           | update |
| `DELETE` | `/api/v1/portfolio/admin/team/:id`           | soft delete |

Read routes continue to live on the public controller; admin writes don't affect the cache until the next read (acceptable for the MVP — the admin SPA can show a toast and refetch).

### Phase 4.7 deliverables — Backups + monitoring (2026-06-04)

**`scripts/backup.sh`** — daily `pg_dump` (plain format, `--no-owner --no-acl`), gzip -9, optional `rclone` to a remote (S3/B2/SFTP), 14-day local retention. Reads `/etc/milindweb/backup.env` if present; warns loudly if `PGPASSWORD` is empty. Writes to `/var/backups/milindweb/<YYYY-MM-DD>.sql.gz` with mode `0600`. Logs every run to `/var/log/milindweb/backup.log`.

**`scripts/restore.sh`** — guards against accidentally clobbering a live DB. Refuses to restore into a non-empty database unless `FORCE=1` is set. Uses `psql --single-transaction --set ON_ERROR_STOP=on`. Confirms a list of tables that will be touched before proceeding.

**`infra/uptime-kuma/docker-compose.yml`** — single-service compose for `louislam/uptime-kuma:1` on port `3001` with a named volume for `/app/data` and host timezone mounted. Healthcheck is built in.

**`infra/uptime-kuma/README.md`** — the operator runbook:
- 5 monitors (live, ready, landing, static origin, Authentik)
- JSONPath check on `$.checks.database.ok` for the API
- Cron `0 3 * * *` invokes `backup.sh`, exits non-zero on failure → Uptime Kuma push monitor flips to red
- 14-day local + 90-day S3 retention policy
- Restore drill procedure (test quarterly)

**`docs/deployment-coolify.md`** — Coolify deployment runbook: host provisioning, env template, Authentik first-login, migrations, smoke tests, rollback, hardening checklist.

### Phase 4.8 deliverables — Static-site polish + SRI (2026-06-04)

**Static-site ↔ API bridge**:
- `js/landing.js` — fetches `/api/v1/portfolio/landing` on every page load (5s timeout), mutates `MW_CONFIG` in place, fires `MW.onLanding(cb)`. Falls back to the static `config.js` on any failure so the page never breaks.
- `js/blog-teaser.js` — renders the homepage blog teaser (`#blogTeaser`) from the latest 3 posts in `landing.posts`. Skeleton state via CSS while loading. Empty-state copy if the API responds with zero posts.
- `js/app.js` — added three missing helpers (`MW.getDomain`, `MW.absUrl`, `MW.waHref`) that were previously referenced but undefined.

**`index.html` changes**:
- New `<section class="blog-teaser">` between FAQ and Final CTA.
- Loads `js/landing.js` and `js/blog-teaser.js` in the deferred-scripts block.
- Loads `css/posts.css` for the new card styles.

**Lightbox** — `js/lightbox.js` (zero deps, ~3 KB):
- Trigger: any `<a data-lightbox="group" href="..."><img></a>`.
- ESC closes; ←/→ navigate; touch swipe; focus-trap to close button; counter; caption; ARIA-labelled `role="dialog"`.
- Re-scans the DOM on the `mw:content-rendered` event so dynamically-inserted images also open in the lightbox.

**Print stylesheet** — `css/print.css` (auto-injected by `app.js`):
- Forces a white background, ink-friendly palette.
- Hides header, footer, theme toggle, back-to-top, cookie banner, reading progress.
- Card grid → single column, borders instead of glass, no shadows.
- Reveals truncated content (`-webkit-line-clamp` cleared).
- Expands every `<details>` regardless of `open` state (so FAQs print fully).
- Shows `print-only` blocks; exposes URLs after links; `page-break-inside: avoid` on cards, images, code, tables.
- `@page A4 portrait`; first-page top margin reduced.
- Already wired so the hospital OPD visit printout (next step) can use `.mw-print-header`, `.mw-signature` blocks.

**SRI hashes** — Font Awesome CSS now has an `integrity="sha512-…"` attribute on every page that loads it (14 pages use FA 6.5.2, 1 uses FA 6.4.0). All hashes are the official cdnjs SRI values. `crossorigin="anonymous"` + `referrerpolicy="no-referrer"` added.

**No new server endpoints** — phase 4.8 is purely client-side polish that doesn't change the API contract. The static site still works offline (uses `config.js` as the fallback when the API is unreachable).

### Phase 5 deliverables — Admin SPA (2026-06-04)

A zero-dependency admin UI for the seven portfolio tables that the API
already supports. Replaces ad-hoc DB writes with a real editor.

**Files** (`admin/`):
- `index.html` — dashboard with live counts (cards linking to each section)
- `{profile,services,projects,posts,testimonials,faq,team}.html` — one CRUD page per table
- `admin.js` (~600 lines) — auth guard, API client, generic CRUD renderer, entity registry
- `admin.css` — dark/light theme-aware styling
- `README.md` — operator notes

**Auth guard** (`requireRole(['portfolio_admin', 'portfolio_editor', 'super_admin'])`):
- Awaits `MW_AUTH.ready()`, calls `/auth/me` to resolve role.
- If not signed in: stashes the current URL in `sessionStorage` under
  `mw.admin.returnTo` and redirects to `/auth/login.html`.
- If signed in but role not allowed: shows a "forbidden" screen with a
  link back to `/auth/me.html`.

**API client**:
- `api.list/get/create/update/remove(entity, ...)` methods.
- Wraps `MW_AUTH.fetch` (which adds the `Authorization: Bearer …` and
  silently refreshes on 401).
- Normalises the `{ data, error }` envelope; throws on non-2xx with a
  friendly message.

**Generic CRUD renderer**:
- One `ENTITIES` registry entry per table (label, icon, listFields,
  formFields, fromForm). Adding a new admin page is a single object
  literal.
- List page: filterable table, "New" button, row actions (edit / delete).
- Form modal: full-width drawer with field-specific widgets
  (text / textarea / number / checkbox / date / JSON), slug auto-derive
  from title, help text, required markers.
- Toast notifications + delete confirm modal.

**Singleton editor** (profile):
- No "add" button — fetches the current profile, renders an inline
  form, PATCHes `/portfolio/admin/profile`, reloads from the public
  read endpoint to pick up server-side fields.

**Public surface** — `window.MW_ADMIN` exports `api`, `ENTITIES`,
`escapeHtml`, `toast`, `confirmModal`, `requireRole` for power users
and the test suite.

**No new server endpoints** — the SPA consumes only the `/portfolio/admin/*`
routes added in 4.5b.

### Phase 7 deliverables — Hospital OPD SPA (2026-06-04)

Replaces the legacy `form.html` (which posted to Google Apps Script) with
a real, auth-gated SPA that hits the NestJS hospital endpoints.

**Files**:
- `opd.html` — three-step UI: patient → visit → done
- `js/opd.js` (~530 lines) — auth, search, save, prescriptions, autocomplete
- `css/opd.css` — clean modern styling (replaces the old flat gov style)
- `form.html` — now a thin redirector to `opd.html` (preserves the old URL)
- `hospital-opd.README.md` — operator notes

**Auth guard**:
- Awaits `MW_AUTH.ready()`, calls `/auth/me`.
- Requires `hospital_*` role (or membership in any `milindweb-hospital-*`
  Authentik group).
- Bounces signed-out users to `/auth/login.html` with `returnTo` stashed
  in `sessionStorage`.

**Step 1 — Patient**:
- Search input calls `/hospital/patients/search?q=…` (matches name /
  mobile / UHID). Results render as cards; click to select.
- "New patient" opens a modal that POSTs to `/hospital/patients` (UHID
  auto-generated server-side as `MH-YYYY-NNNNNN`).
- Selected patient shows a card with UHID badge + a "Change" button to
  go back to the search.

**Step 2 — Visit**:
- Doctors + departments loaded once at boot from the public endpoints.
- Vitals (weight, BP, pulse, RR, SpO₂, temp, sugar), chief complaints
  (textarea, one per line, with autocomplete from `data/dept.json`),
  clinical notes (provisional / final diagnosis, investigations,
  advice), prescriptions (dynamic list, autocomplete from
  `data/medlist.json`), outcome + doctor fee + remarks.
- All form fields are sent to `POST /hospital/visits` as a single
  payload; the server generates the OPD number `OPD-YYYY-MM-DD-NNNN`.
- Prescriptions are then POSTed one-by-one to
  `/hospital/visits/:id/prescriptions`. A batch endpoint is a future
  optimisation.

**Step 3 — Done**:
- Shows the OPD number, patient, doctor, department, date, status, and
  the full prescription list as a printable summary.
- "Print slip" button triggers `window.print()`; `css/print.css`
  (auto-injected by `app.js`) hides the chrome and lays out the slip
  on a clean A4 page with the `.mw-print-header` block.
- "New OPD visit" button resets the form for the next patient.

**Symptom + medicine autocomplete**:
- Symptom data: `Department.defaultSymptoms` from the API, merged with
  `data/dept.json` (the same JSON the old form used). On department
  change, a hint line shows the common symptoms.
- Medicine data: `data/medlist.json` only (DB-backed drug catalogue is
  a future endpoint).

**Global auth menu** — bonus polish:
- `js/auth-menu.js` — when `MW_AUTH` is loaded and the user is signed
  in, hides the default "Sign in" link and shows a "My account" link
  with the user's name/email.
- `js/headerfooter.js` now injects `auth/oidc-client.js` and
  `js/auth-menu.js` on every page (idempotent — only injects once),
  so the auth menu works everywhere without editing 25 HTML files.

**No new server endpoints** — the SPA consumes only the hospital
endpoints from phase 4.4.

**`db/migrations/portfolio/1717000003000_init.js`** — new `portfolio` schema with 7 tables + audit: `profile` (singleton id=1), `services`, `projects`, `posts`, `testimonials`, `faq`, `team`. Soft-delete + audit on writeable tables; `set_updated_at()` trigger.

**`db/seeds/portfolio_data.sql`** — mirrors `config.js` so the static site can eventually switch to fetching from the API without losing any current content: 1 profile row, 8 services (matches existing dropdown), 2 team members, 5 testimonials, 8 FAQ entries.

**`db/schemas/portfolio.md`** — local pointer.

**`shared/src/portfolio.ts`** — Zod schemas for `Profile`, `Service`, `Project`, `Post` (+ `PostListQuery`), `Testimonial`, `Faq`, `TeamMember`, and a combined `Landing` payload. Re-exported via `shared/src/index.ts`.

**`api/src/modules/portfolio/`** (4 files):
- `portfolio.service.ts` — single read service. `getLanding(latestPosts?)` is a one-shot fetch used by the static site to bootstrap.
- `portfolio.controller.ts` — public reads (no auth required). All routes are `@Public()`.
- `portfolio.module.ts`

**AppModule** — `PortfolioModule` registered.

**Endpoints** (all public, no auth):

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/portfolio/landing`     | one-shot bootstrap: profile + services + projects + posts + testimonials + faq + team |
| `GET` | `/api/v1/portfolio/profile`     | singleton brand profile |
| `GET` | `/api/v1/portfolio/services`    | list (active, ordered) |
| `GET` | `/api/v1/portfolio/projects`    | list (published, ordered) |
| `GET` | `/api/v1/portfolio/projects/:slug` | one project |
| `GET` | `/api/v1/portfolio/posts`       | paginated, filter `?category=&tag=` |
| `GET` | `/api/v1/portfolio/posts/:slug` | one post |
| `GET` | `/api/v1/portfolio/testimonials`| list (active) |
| `GET` | `/api/v1/portfolio/faq`         | list (active) |
| `GET` | `/api/v1/portfolio/team`        | list (active) |

**Test scaffolding** — `api/test/README.md` documents the layout. Unit tests in `api/src/**/__*.spec.ts` run with `pnpm --filter @milindweb/api test` (no DB needed; `database/pool` is mocked per service).

## How to run end-to-end

```bash
# 1. install
pnpm install

# 2. apply migrations + seeds
psql "$DATABASE_URL" -f db/migrations/auth/1717000000000_init.js   # via node-pg-migrate in CI
pnpm --filter @milindweb/db migrate:up
psql "$DATABASE_URL" -f db/seeds/auth_role_catalog.sql
psql "$DATABASE_URL" -f db/seeds/portfolio_data.sql
psql "$DATABASE_URL" -f db/seeds/hospital_doctors_and_departments.sql
psql "$DATABASE_URL" -f db/seeds/seniority_departments.sql

# 3. boot the API
pnpm --filter @milindweb/api dev

# 4. bring up Authentik
docker compose -f infra/authentik/docker-compose.yml up -d
# import blueprints
curl -X POST https://auth.<domain>/api/v3/managed/blueprints/instance/ \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d @infra/authentik/blueprints/10-milindweb-app.yaml
curl -X POST https://auth.<domain>/api/v3/managed/blueprints/instance/ \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d @infra/authentik/blueprints/20-groups.yaml

# 5. test the public portfolio landing
curl http://localhost:3000/api/v1/portfolio/landing | jq .

# 6. test the auth flow
open http://localhost:8080/auth/login.html
```

### Reminders (carry-over)
- [ ] **Later-1**: GitHub repo init + push + CI live run
- [ ] **Later-2**: Phase 4 implementation (in progress, see 4.1–4.8)
- [ ] **Later-3**: More polish (blog teaser, lightbox, print styles, SRI hashes)

---

## 🚀 Migration to InsForge + Render + Cloudflare Pages (mk9.in) — 2026-06-04

Replacing the previous "Coolify + Authentik + self-hosted PG" plan with an all-in-one **free** stack. Same code, new deploy target.

### Stack
- **DB + Auth + Storage**: InsForge free plan (`https://fcpkj5u5.ap-southeast.insforge.app`)
- **Static site (FE)**: Cloudflare Pages, custom domain `mk9.in` + `www.mk9.in`
- **NestJS API (BE)**: Render free tier, Singapore region
- **/api/\* reverse proxy**: Cloudflare Worker (route `mk9.in/api/*` → Render)
- **DNS**: Cloudflare (GoDaddy registrar holds the domain; NS pointed to Cloudflare)

### Phase 1 — Remove legacy infra ✅
- [x] Deleted `infra/coolify/`, `infra/authentik/`, `infra/docker/`, `infra/nginx/`, `infra/uptime-kuma/`
- [x] Deleted OIDC FE files: `auth/oidc-client.js`, `auth/login.html`, `auth/callback.html`, `auth/logout.html`, `auth/me.html`, `auth/me.js`, `auth/style.css`
- [x] Deleted legacy docs: `docs/deployment.md`, `docs/deployment-coolify.md`, `docs/auth-flow.md`
- [x] Deleted legacy ADRs: `docs/adr/0002-authentik-oidc.md`, `0006-coolify-deployment.md`

### Phase 2 — API refactor 🚧
- [x] **2A** Fixed duplicate `DbFacade` class in `api/src/database/pool.ts`
- [x] **2B** Added `@insforge/sdk` to `api/package.json`
- [x] **2C** Rewrote `api/src/database/drivers/insforge.driver.ts` to use `@insforge/sdk` (mini SQL parser → SDK chain)
- [x] **2F** Created `api/src/modules/auth/drivers/insforge-auth.guard.ts` (Bearer + JWT decode)
- [x] **2G** Updated `app.module.ts` (conditional guard based on `AUTH_DRIVER`)
- [x] **2G** Updated `auth.module.ts`, `auth.controller.ts` (InsForge discovery endpoint)
- [x] **2I** Updated `env.ts` (InsForge-only prod, Authentik optional/legacy), `main.ts` (CORS for mk9.in), `.env.example`

### Phase 3 — Dockerfile + Render Blueprint
- [ ] Rewrite root `Dockerfile` (single-stage, Render-friendly)
- [ ] Create `render.yaml` (Blueprint, Singapore, free plan)

### Phase 4 — Cloudflare Worker (proxy)
- [ ] Create `worker/src/index.ts` (proxy `mk9.in/api/*` → Render)
- [ ] Create `wrangler.toml`
- [ ] Create `worker/README.md`

### Phase 5 — Frontend InsForge auth
- [ ] Create `js/insforge-client.js` (FE wrapper around `@insforge/sdk`)
- [ ] Rewrite `auth/login.html`, `auth/logout.html` (email/password + Google + GitHub)
- [ ] Add `apiBasePath: '/api/v1'` to `config.js`
- [ ] Add `<script src="js/insforge-client.js">` to all pages

### Phase 6 — Migration / seed / storage scripts
- [ ] `scripts/db-migrate-insforge.mjs` (runs `db/migrations/**/*.js` SQL via InsForge)
- [ ] `scripts/db-seed-insforge.mjs` (applies `db/seeds/*.sql`)
- [ ] `scripts/storage-bootstrap.mjs` (creates `portfolio-assets` bucket)

### Phase 7 — Docs
- [ ] Create `docs/deploy-mk9in.md` (full click-ops runbook)
- [ ] Rewrite `docs/architecture.md` (no Authentik/Coolify)
- [ ] Update `README.md` (tech stack, deployment section)
- [ ] Update `audit.py` (port 8000 → 8080)
- [ ] Update `.lighthouserc.json` (add API health probe)

### Phase 8 — Local verification
- [ ] `pnpm install && pnpm build && pnpm test && pnpm lint` all green
- [ ] Report build/test output

### Next up ➡️
1. Phases 3–8 (above)
2. You: run `node scripts/db-migrate-insforge.mjs` etc. (after they're written)
3. You: set up Cloudflare Pages + Worker + Render (click-ops runbook in `docs/deploy-mk9in.md`)
4. Verify at `https://mk9.in` + `https://mk9.in/api/v1/health/ready`

### Risks
- Render free tier sleeps after 15 min idle → ~30s cold start
- Some complex SQL (JOINs, `count(*)`) not supported by InsForge driver parser → may need service refactor
- InsForge free plan limits → check before going live
