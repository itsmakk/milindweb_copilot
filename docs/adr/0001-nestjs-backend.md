# ADR-0001 — Backend framework: NestJS (TypeScript, Express adapter)

- **Status**: Accepted
- **Date**: 2026-06-04
- **Deciders**: project lead
- **Context**: Phase 4 architecture, replacing the deferred pages (`Seniariity_*.html`, `form.html`) with a real backend.

## Context

We need a backend that:
- Speaks HTTP REST and WebSocket (realtime later).
- Has first-class support for module boundaries (one per product area).
- Enforces role-based access control declaratively.
- Generates OpenAPI for the frontend.
- Is testable end-to-end.
- Runs on any VPS, in Coolify, on InsForge, anywhere Node 20 runs.

Per `1 hms.md` the preferred stack is **NestJS** or Express-TypeScript.

## Decision

**NestJS 10** on the **Express** adapter, **TypeScript strict mode**, **pnpm workspaces**.

## Options considered

| Option                       | Verdict   | Reason                                                              |
|------------------------------|-----------|---------------------------------------------------------------------|
| NestJS + Express             | **chosen**| DI, modules, guards, pipes, OpenAPI all built-in; matches hms.md.  |
| NestJS + Fastify             | deferred  | Faster but breaks hms.md preference; not worth the friction yet.   |
| Raw Express                  | rejected  | Hand-rolling DI, validation, RBAC is reinventing NestJS poorly.     |
| Fastify                      | rejected  | Same as above; ecosystem is smaller for our needs.                  |
| Hono / Elysia                | rejected  | Newer, smaller ecosystem, no first-class OpenAPI.                   |

## Consequences

- (+) Modules map 1:1 to product schemas → clean isolation.
- (+) `@nestjs/swagger` gives us `/api/docs` for free.
- (+) `@nestjs/throttler`, `helmet`, `passport-jwt` all have official Nest recipes.
- (+) Easy to hire for — large pool of Nest devs.
- (–) Slightly heavier than raw Express; acceptable on our target hardware.
- (–) Opinionated framework; we accept the convention.

## Implementation notes

- `api/src/main.ts`: `helmet`, `cors` (allowlist), `ValidationPipe` (Zod), global `ExceptionFilter`, Swagger.
- `api/src/common/`: decorators, guards, filters, pipes, middleware — one folder, no per-module copies.
- Each feature module: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, `entities/`, optional `guards/`.
- Tests: `jest` for units, `supertest` for e2e. CI runs both.
