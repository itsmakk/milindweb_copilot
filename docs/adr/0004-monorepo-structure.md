# ADR-0004 — Repository layout: monorepo with pnpm workspaces, FE at root, BE under `api/`

- **Status**: Accepted
- **Date**: 2026-06-04
- **Deciders**: project lead

## Context

We have a working static site (Phases 1–6 done) at the repo root. We are adding:
- NestJS API (`api/`)
- DB migrations & seeds (`db/`)
- Shared TS types/validators (`shared/`)
- Infrastructure config (`infra/`)
- Documentation (`docs/`)

`prompt.md` rule 9 demands removing a page must not break other pages, and the new code must not regress the static site.

## Decision

**Single repo, pnpm workspaces.** Packages:

```
.
├── api/             # NestJS
├── db/              # migrations, seeds, schema docs
├── shared/          # types + zod validators (consumed by both FE and BE)
├── infra/           # docker, coolify, authentik, nginx
├── docs/            # architecture, adr, diagrams
├── scripts/         # audit, build, inject
└── (root)           # static site (existing)
```

Workspaces are declared in `pnpm-workspace.yaml`:
```yaml
packages:
  - "api"
  - "db"
  - "shared"
  - "scripts"
```

The static site at the root is intentionally **not** a workspace package — it ships as-is, served by nginx.

## Options considered

| Option                                  | Verdict    | Reason                                                                                 |
|-----------------------------------------|------------|----------------------------------------------------------------------------------------|
| Monorepo, FE at root, BE in `api/`      | **chosen** | Zero disruption to existing static site; clean separation.                             |
| Monorepo, everything moved into `apps/` | rejected   | Breaks the 14 working static pages, GitHub Pages deploy path, current SEO.             |
| Polyrepo (separate repos)               | rejected   | Cross-cutting PRs painful; shared `validators` duplicated; one CI per repo.            |
| Single-package NestJS + static          | rejected   | No clean place for shared types; no separate versioning.                              |

## Consequences

- (+) Existing static site deploy path (GH Pages / nginx) keeps working untouched.
- (+) New code lives in well-defined, additive folders.
- (+) `shared/` holds one Zod schema used by both Angular-style form validation (FE) and NestJS request validation (BE).
- (+) `pnpm --filter @milindweb/api test` runs only the API tests — fast feedback.
- (–) Root `package.json` is a workspace orchestrator; build tooling must understand that.
- (–) Coolify deploy must build the right artifact per service.

## Implementation notes

- Root `package.json` (workspace root): scripts `dev`, `build`, `test`, `lint`, `format` that fan out via `pnpm -r`.
- `tsconfig.base.json` at root: `target: ES2022`, `module: NodeNext`, `strict: true`, `paths` for `@milindweb/shared/*`.
- Each workspace has its own `package.json` with its own `tsconfig.json` extending the base.
- `.npmrc`: `node-linker=hoisted` (default for Coolify/CI simplicity).
- Root `.gitignore` covers all workspaces.
