# ADR-0007 — InsForge parity: same `api/src` runs against self-hosted PG or InsForge

- **Status**: Accepted
- **Date**: 2026-06-04
- **Deciders**: project lead

## Context

The user currently uses **InsForge.dev** for prototyping and demos. We want the production stack (Coolify + Authentik + self-hosted PG) to be the gold standard, but we also want a **zero-friction** dev/demo path that uses InsForge's hosted backend (Postgres, storage, edge functions, auth) without rewriting our NestJS code.

The two backends have different primitives:
- Self-hosted: raw `pg` pool, manual SQL, Authentik OIDC.
- InsForge: REST SDK `@insforge/sdk`, built-in auth.

## Decision

Introduce a **driver layer** in `api/src/database/` and `api/src/modules/auth/`:

- `api/src/database/pool.ts` — exports a `query(text, params)` function.
  - **Driver `pg`** (default): uses `pg.Pool` against `DATABASE_URL`. Sets `search_path` per request.
  - **Driver `insforge`**: uses `@insforge/sdk` to call InsForge's REST endpoints and returns a normalized shape.
- `api/src/modules/auth/` — exports `verifyBearer(token)`.
  - **Driver `authentik`**: JWKS verify via `jose`.
  - **Driver `insforge`**: InsForge's built-in JWT verify endpoint.

The driver is selected by `DB_DRIVER` and `AUTH_DRIVER` env vars. The rest of the application code is **identical** for both.

## Options considered

| Option                              | Verdict    | Reason                                                                       |
|-------------------------------------|------------|------------------------------------------------------------------------------|
| Driver layer + env switch           | **chosen** | Same code, both backends; the only divergence is the two drivers.            |
| Two separate codebases              | rejected   | Doubles maintenance; bug fixes diverge.                                      |
| InsForge as the only backend        | rejected   | Production should be self-hosted for cost, data residency, lock-in.          |
| Adapter pattern with full interfaces | overkill  | We only diverge in two places (DB query, auth verify); a thin driver is enough. |
| Skip InsForge, self-host always     | rejected   | Loses the user's current prototyping workflow.                               |

## Consequences

- (+) Local dev can be against InsForge for instant setup, against Docker for fidelity.
- (+) Production stays on self-hosted Coolify stack.
- (+) If InsForge shuts down or pivots, we switch the driver to `pg` + `authentik` and continue.
- (–) Two drivers to keep in sync; mitigated by an integration test suite that runs both.
- (–) Some Postgres-specific features (e.g. `gen_random_uuid()`, `jsonb_path_query`) won't translate to InsForge's hosted DB. We use only the common subset and document it.

## Implementation notes

- Both drivers expose the same `QueryResult<T>` shape: `{ rows: T[], rowCount: number }`.
- Migrations are written as **PostgreSQL SQL** and run against self-hosted PG; for the InsForge path we use InsForge's own migration tool (it speaks SQL too) and skip the local `node-pg-migrate` runner.
- Feature flag: `DRIVER=insforge` triggers the InsForge codepath, `DRIVER=selfhosted` (default) triggers the local one.
- `shared/` validators are the same in both modes.
- `docs/auth-flow.md` and `docs/database-schema.md` call out which behaviors are driver-specific.
