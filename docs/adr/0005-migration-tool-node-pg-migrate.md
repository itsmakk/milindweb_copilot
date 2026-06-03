# ADR-0005 — DB migration tool: `node-pg-migrate` (raw SQL when possible)

- **Status**: Accepted
- **Date**: 2026-06-04
- **Deciders**: project lead

## Context

We need a migration tool that:
- Works against raw PostgreSQL (no ORM).
- Is portable (runs on Coolify, in CI, in a one-off Docker container, locally).
- Reads as SQL first, with JS escape hatch for the rare programmatic migration.
- Has first-class down-migrations for safe rollback during dev.
- Is small and dependency-light.

`prompt.md` rule 13 (data portability) plus the multi-schema layout (ADR-0003) makes this important.

## Decision

**`node-pg-migrate`**, with raw SQL files whenever possible, JS only when SQL is genuinely awkward (e.g. data backfill with loops).

## Options considered

| Option                  | Verdict   | Reason                                                                                  |
|-------------------------|-----------|-----------------------------------------------------------------------------------------|
| `node-pg-migrate`       | **chosen**| Lean, SQL-first, runs as plain Node script, multi-schema friendly, down-migrations.    |
| Raw `.sql` + custom runner | rejected | Reinvents the runner, ordering, locking, and down-migrations.                          |
| Prisma Migrate          | rejected  | Tied to Prisma ORM; we deliberately chose no ORM (ADR-0001).                           |
| Knex migrations         | rejected  | Heavier; less SQL-first; we'd be using 10% of it.                                       |
| Drizzle Kit             | deferred  | Good fit, but TypeScript-first; we want SQL-first for ops-friendliness.                |
| Sqitch                  | rejected  | Excellent, but Perl-based; adds a system dependency we don't need.                      |
| Flyway / Liquibase      | rejected  | JVM-based; massive overkill.                                                            |

## Consequences

- (+) SQL files are diff-friendly, reviewable by any dev, executable by any DBA.
- (+) Migrations are versioned by timestamp (`1699999999999_init.js`) — never reordered.
- (+) Per-schema folder layout maps cleanly to the multi-schema DB.
- (+) `node-pg-migrate down` works for dev; for prod we always roll forward.
- (–) No native dry-run → we add our own pre-flight check in CI.
- (–) Some advanced Postgres features (e.g. publication for logical replication) need the JS escape hatch.

## Implementation notes

- Migration files: `db/migrations/<schema>/<timestamp>-<name>.{js,sql}`.
- `db/package.json` scripts:
  - `migrate:up` → `node-pg-migrate -m migrations -j sql up`
  - `migrate:down` → `node-pg-migrate -m migrations down 1`
  - `migrate:redo` → `node-pg-migrate -m migrations redo`
  - `migrate:status` → `node-pg-migrate -m migrations status`
- Per-schema isolation: each module's deploy runs `node-pg-migrate -m migrations/<schema>`.
- CI: `ci-db.yml` spins up an ephemeral Postgres and runs `migrate:up` + a quick `SELECT 1` sanity check.
- The API image runs `migrate:up` on container start **only** in dev. In prod, migrations are run by the deploy job (Coolify "release command" pattern).
