# ADR-0003 — PostgreSQL logical schema separation (one DB, many product areas)

- **Status**: Accepted
- **Date**: 2026-06-04
- **Deciders**: project lead

## Context

The app will host multiple product areas — `portfolio` (public site content), `seniority` (employee seniority management), `hospital` (hospital/clinic management) — plus future products. `1 hms.md` and `2.Seniarity.md` both prescribe schema-per-domain: `auth`, `master`, `patients`, `opd`, `billing`, `pharmacy`, `laboratory`, `radiology`, `documents`, `audit`, `reports`, `settings`.

## Decision

**One PostgreSQL database, one logical pool, multiple schemas.** Schemas are first-class tenants of the application.

| Schema       | Owner of (excerpt)                                                                                | Backed by module |
|--------------|---------------------------------------------------------------------------------------------------|------------------|
| `auth`       | `users` (local mirror), `role_permissions`, `audit_log`                                          | `users`, `auth`  |
| `portfolio`  | `services`, `projects`, `testimonials`, `faq`, `blog_posts`, `links`, `calendar_holidays`         | `portfolio`      |
| `seniority`  | `employees`, `departments`, `leave`, `seniority_rules`, `exports`, `audit_log`                    | `seniority`      |
| `hospital`   | `patients`, `doctors`, `departments`, `opd_visits`, `prescriptions`, `lab_tests`, `billings`, `audit_log` | `hospital` |
| `_future_`   | (placeholder for any new product)                                                                 | (new module)     |

## Options considered

| Option                                 | Verdict     | Reason                                                                  |
|----------------------------------------|-------------|-------------------------------------------------------------------------|
| One DB, many schemas                   | **chosen**  | Single backup, single pool, simple ops, fits `1 hms.md` requirement.  |
| Many databases (one per product)       | rejected    | Operational overhead; cross-product queries impossible; no real win.   |
| One DB, one schema, table prefixes     | rejected    | Hard to reason about; weaker than real namespaces; no `GRANT` isolation. |
| Separate Postgres clusters per product | rejected    | Premature; only justified at huge scale.                              |

## Consequences

- (+) One `pg_dump` covers everything; one restore.
- (+) Per-schema `GRANT`s in the future (least-privilege per app role).
- (+) Migrations namespaced per schema → predictable blast radius.
- (–) A bug in the pool config could touch the wrong schema → mitigated by per-module repositories that always `SET search_path`.
- (–) Cross-schema joins forbidden → may force denormalization or API composition. Acceptable for our size.

## Implementation notes

- Migration files live under `db/migrations/<schema>/<timestamp>-<name>.js`.
- Each NestJS feature module gets a repository that **always** does `SET LOCAL search_path TO <schema>, public` on every checked-out client.
- The pool is configured with `application_name=milindweb-<module>` for per-module log filtering.
- A `db/seeds/` directory holds idempotent reference data (departments, role names, etc.).
- Soft-delete columns (`is_deleted`, `deleted_at`, `deleted_by`) on **every** writeable table (per `1 hms.md`).
- Audit triggers (or application-level audit service) write to `*.audit_log` — append-only, no UPDATE, no DELETE.

See `docs/database-schema.md` for the per-schema breakdown.
