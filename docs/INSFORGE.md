# InsForge Integration Notes

## Why InsForge

- One provider for Postgres (PostgREST), auth, and S3-style storage.
- The hosted plan replaces our self-hosted PostgreSQL + Authentik stack
  with zero code changes at the service layer (the NestJS API's
  `DB_DRIVER=insforge` and `AUTH_DRIVER=insforge` paths do the swap).
- Local dev still works with `DB_DRIVER=pg` against a real Postgres if
  you don't want to hit the cloud during development.

## What lives where

| Layer       | Production                              | Local dev (optional)         |
|-------------|-----------------------------------------|------------------------------|
| Database    | InsForge Postgres (PostgREST)           | `pg` driver + Docker Postgres |
| Auth        | InsForge Auth (email/password)          | `authentik` (legacy)          |
| Storage     | InsForge Storage buckets                | `local` (./uploads)           |
| Migrations  | `pnpm migrate:insforge` → admin SQL     | node-pg-migrate (existing)    |
| Seeding     | `pnpm seed:insforge` → SDK inserts      | SQL files in db/seeds         |
| Buckets     | `pnpm storage:bootstrap` → admin API    | filesystem                   |

## Driver architecture (NestJS API)

The API keeps a single `query()` / `withTransaction()` façade. The
`DatabaseModule` chooses a driver at boot based on `DB_DRIVER`:

```
DbFacade.query(schema, sql, params)
        │
        ├── PG driver            (raw SQL, multi-schema)
        └── InsForge driver      (PostgREST grammar, single public schema)
```

The InsForge driver implements a tiny SQL parser sufficient for the
query shapes the services use (`SELECT ... FROM schema.table WHERE
col = $1`, `INSERT/UPDATE/DELETE` with the same conventions). Anything
more exotic (CTEs, joins, subqueries) keeps the pg driver.

## Schema translation

The self-hosted stack uses PostgreSQL **schemas** (`auth.users`,
`portfolio.services`, …). PostgREST exposes the **public** schema by
default, so the InsForge variant uses **prefixed table names** in the
public schema (`auth_users`, `portfolio_services`, …). Both layouts
appear in the codebase:

- Self-hosted: `db/migrations/{schema}/{timestamp}_init.js`
- InsForge:   `scripts/schema-insforge.sql` (single SQL file)

## Auth integration

- `InsForgeAuthGuard` accepts a Bearer token from the InsForge session.
  The guard decodes the JWT payload (it trusts the FE to send a real
  one — fine for the free plan; production should switch to InsForge's
  verify endpoint when it is exposed).
- `auth.controller.ts#discovery` exposes the InsForge base URL + anon
  key to the FE on boot so the SDK can be initialized without inline
  secrets in HTML.
- `INSFORGE_ADMIN_EMAILS` (comma-separated) maps those emails to
  `super_admin` on the local mirror (`auth_users` table).

## Known limits on the free plan

- No multi-statement transactions via the PostgREST driver (a service
  needing atomicity should keep `DB_DRIVER=pg`).
- Token verification is signature-trust-the-client (no `/auth/v1/verify`
  endpoint exposed on free).
- No scheduled backups; the cloud Postgres is provider-managed.

## Running the bootstrap

```bash
pnpm bootstrap:insforge
```

runs `db-migrate-insforge` → `db-seed-insforge` → `storage-bootstrap`
in that order. All three are idempotent.

If your plan does not expose `/api/database/execute`, the migration
script falls back to printing the SQL — paste it into the InsForge SQL
editor and re-run `pnpm seed:insforge` and `pnpm storage:bootstrap`.

## Switching back to self-hosted

1. Set `DB_DRIVER=pg` and `AUTH_DRIVER=authentik` in `.env`.
2. Restore the `pg` driver config block in `db/migrations/*`.
3. Re-run `node-pg-migrate up`.
4. Point the API at the self-hosted Postgres and Authentik.

The application code does not change.
