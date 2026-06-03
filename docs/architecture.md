# MilindWeb — Architecture

> **Status**: Phase 4 (Backend / DB / Auth) — *design approved, scaffolding in progress.*
> **Audience**: senior devs, ops, future maintainers.
> **Source of truth** for stack, layout, schemas, auth, deployment, and ADRs.
> Everything else (`README.md`, `status.md`, module READMEs) should defer to this file.

---

## 1. Goals & non-goals

### Goals
- One repo, one deployment pipeline, many products.
- **Loose coupling** between frontend, backend, database, auth, and storage.
- **Replaceable** components: swap Authentik for Keycloak, NestJS for Fastify, PostgreSQL for any SQL DB without rewriting business code.
- **Logical multi-tenancy** via PostgreSQL schemas — one DB, many product areas.
- **Self-hostable** on a single Ubuntu VPS via Coolify; **cloud-portable** to any Docker host.
- **Quick prototyping** via InsForge.dev, with the same code path that runs in self-hosted prod.
- **Zero hardcoded** business data — config-driven (frontend runtime config + backend env).

### Non-goals
- Microservices (single deployable API; modules are NestJS feature modules, not services).
- Serverless-only deployment (we can run on it, but not optimized for it).
- Multi-region active/active (single region, single primary DB).
- Real-time collaboration (realtime is *available* via InsForge/WebSocket but not a first-class requirement yet).

---

## 2. High-level topology

```
┌──────────────────────────────────────────────────────────────────────┐
│                       Ubuntu Server (VPS / bare metal)               │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                       Coolify  (Docker orchestrator + UI)      │  │
│  │                                                                │  │
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐   │  │
│  │  │   Frontend   │   │   Backend    │   │   PostgreSQL 16  │   │  │
│  │  │  (nginx +     │──▶│  (NestJS)    │──▶│  ─ auth schema   │   │  │
│  │  │   static SPA) │   │  TS REST API │   │  ─ portfolio     │   │  │
│  │  │  :80 / :443   │   │  :3000       │   │  ─ seniority     │   │  │
│  │  └──────────────┘   └──────┬───────┘   │  ─ hospital      │   │  │
│  │                            │           │  ─ _future_      │   │  │
│  │                            │           └──────────────────┘   │  │
│  │                            ▼                                   │  │
│  │                     ┌──────────────┐                           │  │
│  │                     │  Authentik   │  (OIDC IdP + user mgmt)   │  │
│  │                     │  :9000       │                           │  │
│  │                     └──────────────┘                           │  │
│  │                                                                │  │
│  │  Persistent volumes:                                           │  │
│  │   pgdata, authentik-media, authentik-templates, nginx-cache    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Edge: Cloudflare (DNS + optional proxy + DDoS)                      │
│  Backups: pg_dump cron → S3-compatible (B2 / R2 / MinIO)             │
└──────────────────────────────────────────────────────────────────────┘
```

### Parallel quickstart path (dev / demos)

```
┌──────────────────────────────────────────┐
│  InsForge.dev  (hosted BaaS)             │
│  ┌────────────┐  ┌──────────────────┐    │
│  │  Postgres  │  │  Auth (built-in) │    │
│  │  Storage   │  │  Edge functions  │    │
│  │  Realtime  │  │  Sites (hosting) │    │
│  └────────────┘  └──────────────────┘    │
│                                          │
│  Frontend served as InsForge "Site"      │
│  Backend uses @insforge/sdk instead of   │
│  raw pg + custom Authentik verifier      │
└──────────────────────────────────────────┘
```

The same `api/src` code can target either backend via a `DB_DRIVER` env switch
(`pg` for self-hosted, `insforge` for InsForge). See ADR-0007.

---

## 3. Repository layout

```
milindweb/
├── api/                          # ★ NestJS backend
│   ├── src/
│   │   ├── main.ts               # bootstrap, helmet, cors, swagger
│   │   ├── app.module.ts
│   │   ├── config/               # Zod-validated env (single source)
│   │   │   ├── env.ts
│   │   │   └── database.ts       # schema-aware pg pool factory
│   │   ├── database/             # pg pool + per-schema repositories
│   │   │   ├── pool.ts
│   │   │   ├── base.repository.ts
│   │   │   └── schema-switch.ts  # SET search_path helper
│   │   ├── common/               # cross-cutting
│   │   │   ├── decorators/       # @CurrentUser, @Roles, @Tenant
│   │   │   ├── guards/           # JwtGuard, RolesGuard, TenantGuard
│   │   │   ├── filters/          # AllExceptionsFilter
│   │   │   ├── interceptors/     # LoggingInterceptor, TimeoutInterceptor
│   │   │   ├── pipes/            # ZodValidationPipe
│   │   │   └── middleware/       # request-id, cors
│   │   ├── modules/
│   │   │   ├── auth/             # OIDC verifier, JWKS cache, claims → local user
│   │   │   ├── users/            # local user mirror, role/tenant
│   │   │   ├── portfolio/        # services, projects, faq, testimonials, blog
│   │   │   ├── seniority/        # employees, departments, leave, rules, exports
│   │   │   ├── hospital/         # patients, doctors, OPD, billing, lab, pharmacy
│   │   │   └── health/           # /health, /ready, /metrics
│   │   └── shared/
│   │       └── types/            # @milindweb/shared/types re-exports
│   ├── test/                     # e2e (supertest) + unit (jest)
│   ├── ormconfig.ts              # (only if Prisma is ever reintroduced)
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── package.json
│   ├── .eslintrc.cjs
│   ├── .prettierrc
│   └── Dockerfile                # multi-stage, distroless final
│
├── db/                           # ★ DB schema, migrations, seeds
│   ├── migrations/               # node-pg-migrate .js files
│   ├── seeds/                    # reference data SQL
│   ├── schemas/                  # per-domain ER + docs
│   │   ├── auth.md
│   │   ├── portfolio.md
│   │   ├── seniority.md
│   │   └── hospital.md
│   ├── package.json              # pg-migrate scripts
│   └── README.md
│
├── shared/                       # ★ Used by both FE and BE
│   ├── types/                    # TS types (built, .d.ts for FE)
│   ├── validators/               # Zod schemas (one schema, used both sides)
│   └── package.json
│
├── infra/                        # ★ deployment & infra config
│   ├── docker/
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.prod.yml
│   │   ├── Dockerfile.web
│   │   └── Dockerfile.api
│   ├── coolify/
│   │   ├── docker-compose.coolify.yml
│   │   └── README.md
│   ├── authentik/
│   │   ├── blueprints/           # Authentik blueprint YAMLs (tenants, providers)
│   │   ├── providers/            # OIDC provider exports
│   │   └── README.md
│   ├── nginx/
│   │   ├── web.conf
│   │   └── api.conf
│   └── README.md
│
├── docs/                         # ★ living documentation
│   ├── architecture.md           # ← this file
│   ├── database-schema.md
│   ├── auth-flow.md
│   ├── api.md
│   ├── deployment.md
│   ├── operations.md
│   ├── adr/                      # Architecture Decision Records
│   │   ├── 0001-nestjs-backend.md
│   │   ├── 0002-authentik-oidc.md
│   │   ├── 0003-postgres-schema-separation.md
│   │   ├── 0004-monorepo-structure.md
│   │   ├── 0005-migration-tool-node-pg-migrate.md
│   │   ├── 0006-coolify-deployment.md
│   │   ├── 0007-insforge-parity.md
│   │   └── 0008-shared-validators-zod.md
│   └── diagrams/                 # Mermaid sources + rendered SVGs
│
├── scripts/                      # existing + new utility scripts
│   ├── audit.py
│   ├── build_assets.py
│   ├── inject_favicons.py
│   └── ...
│
├── .github/workflows/
│   ├── ci-frontend.yml           # HTML/CSS/JS lint, lighthouse
│   ├── ci-backend.yml            # tsc, eslint, jest, build image
│   ├── ci-db.yml                 # node-pg-migrate dry-run
│   └── ci-deploy.yml             # push image, trigger Coolify webhook
│
├── (existing static site — untouched at root)
│   ├── index.html
│   ├── contact.html
│   ├── ...
│   ├── css/
│   ├── js/
│   ├── img/
│   ├── data/
│   ├── fonts/
│   └── config.js                 # runtime FE config (brand, contact, social, services)
│
├── .env.example
├── .editorconfig
├── .gitignore
├── docker-compose.yml            # alias → infra/docker/docker-compose.dev.yml
├── package.json                  # workspace root
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── README.md
├── prompt.md
├── status.md
└── LICENSE
```

> **Rule**: the **static site at root must keep working unchanged.** All new code lives under `api/`, `db/`, `shared/`, `infra/`, `docs/`.

---

## 4. Stack decisions (summary)

| Concern        | Choice                                                 | Why                                                                                |
|----------------|--------------------------------------------------------|------------------------------------------------------------------------------------|
| Frontend       | Vanilla HTML / CSS / JS, served by nginx               | Matches `prompt.md`; zero build; config-driven; perfect for content-first sites.  |
| Backend        | **NestJS 10 + TypeScript** (Express adapter)           | First-class DI, modules, guards, OpenAPI; `1 hms.md` prefers NestJS.               |
| ORM/DB driver  | **`pg` (node-postgres)** + raw SQL, no ORM             | Multi-schema clarity; node-pg-migrate fits; ORM is overkill & ties to one schema. |
| Migrations     | **node-pg-migrate**                                    | Lean, SQL-first, no ORM lock-in.                                                  |
| Validation     | **Zod** (shared FE/BE), NestJS `ValidationPipe`        | Same schema validates form (FE) and request (BE); one source of truth.            |
| Auth           | **Authentik** (OIDC) — backend is a Resource Server    | Offload user mgmt, MFA, OAuth, social login; no password storage in our DB.      |
| Auth in API    | JWKS-based JWT validation (`jose`), no local sessions   | Stateless; scales horizontally; supports immediate revocation via introspection.  |
| Database       | **PostgreSQL 16** with logical schemas                 | One DB, many product areas; one backup; one connection pool.                      |
| Cache / Queue  | None at MVP; add Redis later if needed                 | YAGNI.                                                                              |
| Object storage | **InsForge Storage** in dev; **S3-compatible** in prod  | Same SDK swap pattern as the DB.                                                  |
| Reverse proxy  | **Caddy** in Coolify (auto-TLS) — or nginx if preferred | TLS, HTTP/2, HSTS, gzip, brotli — all declarative.                                |
| Orchestration  | **Coolify on Ubuntu 24.04 LTS**                        | Per user stack; one `docker-compose.yml` per service; Git-driven deploys.          |
| CI             | **GitHub Actions** (lint, test, build, Lighthouse)     | Free tier, matrix builds, Coolify webhook on `main`.                              |
| Quickstart     | **InsForge.dev** (optional, dev/demo)                  | Same code path, faster MVP.                                                       |

Full rationale per item in `docs/adr/`.

---

## 5. PostgreSQL — logical schema separation

One database (`milindweb`), multiple schemas. Each schema is one product area.

| Schema       | Owner of                           | Owned by module         | Notes                                                          |
|--------------|------------------------------------|-------------------------|----------------------------------------------------------------|
| `auth`       | `users` (local mirror)             | `users`                 | FK target for tenant tables. Authentik is the *real* auth.    |
| `portfolio`  | services, projects, faq, testimonials, blog, links, calendar_holidays | `portfolio` | Drives the public site from API.                              |
| `seniority`  | employees, departments, leave, seniority_rules, exports, audit_log | `seniority` | Targets `Seniariity_*.html` pages.                             |
| `hospital`   | patients, doctors, OPD, billing, pharmacy, lab, radiology, audit | `hospital` | Targets `form.html` (Hospital Manager).                       |
| `_future_`   | (placeholder)                      | (per-app module)        | Add a new schema + a new NestJS module — no touching others.   |

Rules:
- **No cross-schema joins** in business code. If you need to share data, expose it via API or replicate.
- All tables get: `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`, `is_deleted boolean default false`, `deleted_at timestamptz null`, `deleted_by uuid null` (soft-delete only — per `1 hms.md`).
- Audit columns on every writeable table: `created_by uuid`, `updated_by uuid`.
- Migrations are namespaced per schema folder: `db/migrations/portfolio/`, `db/migrations/seniority/`, etc.

Per-schema detail: `docs/database-schema.md`.

---

## 6. Auth — Authentik OIDC

### Why Authentik
- Battle-tested open-source IdP (Apache 2.0).
- OIDC / OAuth2 / SAML / LDAP out of the box.
- Built-in flows: login, registration, password reset, MFA (TOTP, WebAuthn), social login, invitations.
- Admin UI for users, groups, applications, providers.
- Embeds into Coolify self-hosted stack with no extra moving parts.

### Flow (Authorization Code + PKCE)

```
[User] → [FE] → (redirect) → [Authentik /authorize] → [login] → [Authentik] → (302 + code) → [FE /callback] → (POST code) → [API /auth/exchange] → (verify w/ Authentik /token) → (returns our session JWT) → [FE] → (Bearer on every API call) → [API validates via JWKS]
```

Detail: `docs/auth-flow.md`.

### Local user mirror
- `auth.users` table mirrors the Authentik subject (`auth_id text unique`) plus our `email`, `display_name`, `tenant`, `role`, `is_active`, timestamps.
- First login → auto-provision. Source of truth for role/tenant is **our** table; Authentik is the identity store.
- Group → role mapping is configurable in `config/role-mapping.ts`.

### RBAC
- Role list: `super_admin`, `portfolio_admin`, `portfolio_editor`, `seniority_admin`, `seniority_editor`, `seniority_viewer`, `hospital_admin`, `hospital_doctor`, `hospital_receptionist`, `hospital_nurse`, `hospital_pharmacist`, `hospital_lab_staff`, `hospital_radiology_staff`, `hospital_accountant`, `hospital_viewer`.
- Permissions per role are configurable: `auth.role_permissions(role, resource, action)`.
- Enforced with `@Roles('hospital_admin')` + `RolesGuard` + `TenantGuard` decorators.
- Tenancy: `users.tenant in ('seniority' | 'hospital' | 'portfolio' | null)`. A user can belong to one tenant; cross-tenant access requires `super_admin`.

---

## 7. Backend module map (NestJS)

```
AppModule
├── ConfigModule        (Zod env, global)
├── DatabaseModule      (pg pool, schema router)
├── CommonModule        (guards, decorators, filters, pipes)
├── AuthModule          (OIDC, JWKS, claims, exchange)
├── UsersModule         (local mirror, RBAC)
├── PortfolioModule     (schema: portfolio)
├── SeniorityModule     (schema: seniority)
├── HospitalModule      (schema: hospital)
└── HealthModule        (liveness/readiness)
```

Each product module exposes versioned REST under `/api/v1/<module>/...` and ships its own OpenAPI definition.

---

## 8. API conventions

- **Versioning**: URL-segment (`/api/v1`).
- **Resources**: plural nouns (`/seniority/employees`).
- **JSON**: snake_case in DB, **camelCase** in API (transform at the repository boundary).
- **Errors**: RFC 7807 (`application/problem+json`) with `{type, title, status, detail, instance, errors[]}`.
- **Pagination**: `?page=1&pageSize=50` → `{data, meta:{page,pageSize,total,totalPages}}`.
- **Filtering**: `?filter[status]=active&filter[department]=ICU`.
- **Sorting**: `?sort=-createdAt,name`.
- **Idempotency**: `Idempotency-Key` header on POST / PUT.
- **Auth**: `Authorization: Bearer <jwt>`; tokens are short-lived (5 min) with silent refresh.

Full spec: `docs/api.md`.

---

## 9. Frontend ↔ Backend integration

Two integration modes, switched by `window.MW.apiMode` (set in `config.js`):

| Mode         | Use case              | Auth header                                     | Endpoint base             |
|--------------|-----------------------|-------------------------------------------------|---------------------------|
| `static`     | current behavior      | none (Google Apps Script for forms)             | n/a                       |
| `readonly`   | site content from API | none (public endpoints only)                    | `/api/v1/portfolio/...`   |
| `auth`       | logged-in dashboards  | `Authorization: Bearer <jwt>` (Authentik-issued)| `/api/v1/...`             |

For now, the static site continues to work. The Seniority and Hospital sections become real authenticated apps — they will live at `/seniority/*` and `/hospital/*` and be served by the same nginx as the static site, but as separate SPAs (or thin shells that render into the static layout).

---

## 10. Deployment — Coolify on Ubuntu

High level:

1. **VPS**: Ubuntu 24.04 LTS, 2 vCPU / 4 GB RAM minimum (8 GB recommended for prod).
2. **Coolify**: installed via official script (`curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`).
3. **Resources in Coolify**:
   - **PostgreSQL 16** (managed by Coolify, persistent volume, daily pg_dump to S3).
   - **Authentik** (PostgreSQL + Redis + Server + Worker; persistent media/templates volumes).
   - **API** (built image pushed to GHCR; env injected; connects to Postgres + Authentik).
   - **Frontend** (nginx image; env-injected `config.js`).
4. **DNS**: Cloudflare → VPS, A/AAAA records, proxy optional.
5. **TLS**: Coolify's Caddy auto-issues Let's Encrypt certs.
6. **Backups**: cron `pg_dumpall` + `rclone` to Backblaze B2 / Cloudflare R2.
7. **Monitoring**: Uptime Kuma (free) for ping + `/health` checks.

Step-by-step: `docs/deployment.md`.

---

## 11. Local development

```bash
# 1. clone
git clone https://github.com/itsmakk/milindweb && cd milindweb

# 2. env
cp .env.example .env
$EDITOR .env

# 3. infra
docker compose -f infra/docker/docker-compose.dev.yml up -d

# 4. migrate
pnpm --filter @milindweb/db migrate:up

# 5. seed (optional)
pnpm --filter @milindweb/db seed

# 6. API
pnpm --filter @milindweb/api dev    # http://localhost:3000/api/v1
pnpm --filter @milindweb/api swagger # http://localhost:3000/api/docs

# 7. FE (existing)
pnpm --filter @milindweb/web dev    # http://localhost:8080
```

Tooling: **Node 20 LTS**, **pnpm 9** (workspaces), **ESLint + Prettier**, **Jest + Supertest**, **Husky + lint-staged**.

---

## 12. CI/CD

| Pipeline           | Triggers         | Steps                                                                                            |
|--------------------|------------------|--------------------------------------------------------------------------------------------------|
| `ci-frontend.yml`  | PR + push        | html5 validator, `scripts/audit.py`, Lighthouse, link check                                     |
| `ci-backend.yml`   | PR + push        | `pnpm install`, `tsc --noEmit`, `eslint`, `jest`, build image, push to GHCR on `main`           |
| `ci-db.yml`        | PR + push        | `node-pg-migrate up` against ephemeral PG, verify rollback                                      |
| `ci-deploy.yml`    | push to `main`   | notify Coolify webhook → Coolify pulls new image → runs migrate → zero-downtime restart          |

Coolify webhook = `https://<coolify>/api/v1/webhooks/<uuid>` per service.

---

## 13. Security baseline

- HTTPS only, HSTS `max-age=31536000; includeSubDomains; preload`.
- CORS: allowlist via `CORS_ORIGINS` env, no wildcard.
- CSRF: cookie-based sessions get double-submit; pure-JWT flows are CSRF-safe by design.
- Rate limiting: `@nestjs/throttler` per IP and per-user.
- Input: Zod everywhere; never trust `req.body`/`req.query` without a schema.
- Output: response payloads filtered by DTOs (never leak `password_hash` etc.).
- Logs: structured (`pino`), redacted (no tokens, no PII beyond `user_id`).
- Secrets: only in Coolify env / `.env` (gitignored); never in code.
- Backups: encrypted at rest, offsite, restore-tested monthly.
- Audit log: append-only `*.audit_log` tables; never DELETE.

---

## 14. Observability

- `/health` (liveness, 200 if process is up).
- `/ready` (readiness, 200 if DB + Authentik JWKS reachable).
- `/metrics` (Prometheus via `@willsoto/nestjs-prometheus`).
- Logs to stdout; Coolify captures to Loki (or external).
- Tracing: OpenTelemetry SDK, OTLP exporter (Tempo / Jaeger / Honeycomb).

---

## 15. Roadmap (post Phase 4)

| Phase   | Title                       | Outcome                                                          |
|---------|-----------------------------|------------------------------------------------------------------|
| 4.1     | Authentik bootstrapping     | OIDC up, admin user, FE PKCE login works, API accepts JWT        |
| 4.2     | Seniority MVP               | `seniority` schema + module; replaces `Seniariity_*.html`        |
| 4.3     | Hospital MVP                | `hospital` schema + module; replaces `form.html`                 |
| 4.4     | Portfolio API               | `portfolio` schema + module; site reads from API                 |
| 4.5     | InsForge parity             | `DB_DRIVER=insforge` works end-to-end                            |
| 4.6     | Backups + monitoring         | cron, Kuma, Grafana                                              |
| 4.7     | Polish                      | blog teaser, lightbox, print styles, SRI hashes                  |

---

## 16. References

- `prompt.md` — global rules.
- `1 hms.md`, `2.Seniarity.md` — domain specs (Hospital + Seniority).
- `status.md` — phase tracker.
- `docs/adr/*` — decisions, with context and consequences.
- [Authentik docs](https://docs.goauthentik.io/)
- [NestJS docs](https://docs.nestjs.com/)
- [node-pg-migrate](https://github.com/salsita/node-pg-migrate)
- [Coolify docs](https://coolify.io/docs)
- [InsForge docs](https://docs.insforge.dev/)
