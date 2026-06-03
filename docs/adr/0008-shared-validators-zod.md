# ADR-0008 — Validation: Zod everywhere, one schema shared by FE and BE

- **Status**: Accepted
- **Date**: 2026-06-04
- **Deciders**: project lead

## Context

`1 hms.md` and `2.Seniarity.md` define dozens of entities with strict shapes. Today the static site has hand-written JS validation. Tomorrow the API will receive these same payloads.

We need one source of truth for: "what does a valid `Patient` look like?"

## Decision

**Zod** schemas in `shared/validators/`. Both the static FE (loaded as ESM bundle or via CDN) and the NestJS API (via `ZodValidationPipe`) consume the same schema. The same schema also drives the OpenAPI spec (via `@nestjs/swagger` + a Zod-to-OpenAPI helper).

## Options considered

| Option                | Verdict    | Reason                                                                                  |
|-----------------------|------------|-----------------------------------------------------------------------------------------|
| Zod (shared)          | **chosen** | Best DX, small bundle, runs in browser and Node, great inference, huge community.       |
| Yup                   | rejected   | Slower, less type-safe, no first-class Nest integration.                               |
| Joi                   | rejected   | Server-only, not in the FE bundle.                                                      |
| class-validator       | rejected   | Requires TS decorators on classes; clashes with the FE which has no build step.        |
| Hand-rolled           | rejected   | Drift inevitable.                                                                       |

## Consequences

- (+) One schema → one truth. No "what changed in validation?" PRs.
- (+) FE gets inline error messages without a roundtrip.
- (+) BE rejects bad payloads at the controller boundary.
- (+) OpenAPI stays in sync automatically.
- (–) FE bundle grows by ~12 KB gzipped (Zod). Acceptable.
- (–) Devs must learn Zod. Worth it.

## Implementation notes

- `shared/validators/<entity>.ts` exports both `ZodSchema` and the inferred TS type.
- Build step for FE: `tsc` emits `.d.ts` + a small ESM bundle (`shared/dist/`). Loaded by `js/validators.js` (or inlined per-page if small).
- BE: `ZodValidationPipe` in `api/src/common/pipes/`. Each controller method uses `@Body(schema)`, `@Query(schema)`, `@Param(schema)`.
- OpenAPI: use `@anatine/zod-openapi` or roll a tiny mapper.
