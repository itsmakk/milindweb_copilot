# Portfolio schema

Local pointer. The canonical schema is in `db/migrations/portfolio/1717000003000_init.js`.

## Tables

| Table | Purpose |
|---|---|
| `portfolio.profile`     | Singleton (id=1). Brand, contact, social, SEO, analytics, theme tokens. |
| `portfolio.services`    | Service catalogue — drives the home + nav dropdown. `code` is a stable id; `slug` is the target HTML page. |
| `portfolio.projects`    | Portfolio / case studies. `is_published` gates public read. |
| `portfolio.posts`       | Blog posts. `is_published` + `published_at` gate public read. |
| `portfolio.testimonials`| Customer quotes. |
| `portfolio.faq`         | FAQ entries. |
| `portfolio.team`        | Team members. |
| `portfolio.audit_log`   | Admin actions (creates/updates/deletes). |

## Read-mostly design

All public reads bypass auth and return only `is_published = true` (or `is_active = true`) and `is_deleted = false` rows. Writes require `portfolio_admin` or `portfolio_editor`.

## `landing` convenience endpoint

`GET /api/v1/portfolio/landing` returns profile + services + projects + posts + testimonials + faq + team in one shot — useful for the static site to bootstrap from a single fetch.

## Seed order

1. `db/seeds/auth_role_catalog.sql`
2. `db/seeds/portfolio_data.sql`  ← this file (mirror of `config.js`)
3. `db/seeds/hospital_doctors_and_departments.sql`
4. `db/seeds/seniority_departments.sql`

## Mirroring `config.js`

The seed above mirrors the values in `config.js`. After 4.8, the static site will fetch `/api/v1/portfolio/landing` on boot and fall back to `config.js` if the API is unreachable.
