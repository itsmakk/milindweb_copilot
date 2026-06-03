# API Conventions

> Companion: `docs/architecture.md` §8, `docs/auth-flow.md`, `docs/database-schema.md`.

This document is the source of truth for every HTTP endpoint the API exposes. If you add an endpoint that doesn't follow these rules, this doc is wrong — update it in the same PR.

---

## 1. Versioning

- **URL-segment**: `/api/v1/...`
- Breaking change → bump to `/api/v2/...`; old version keeps working for at least 6 months.
- Non-breaking additions (new optional fields, new endpoints) stay on the same version.

---

## 2. Resources & URL shape

- Plural nouns: `/employees`, `/patients`, `/prescriptions`.
- Nesting is shallow (max 2 levels): `/patients/:id/visits` is fine; `/patients/:id/visits/:vid/prescriptions/:pid/items` is not.
- Actions that don't fit CRUD go under `/<resource>:action`: `/auth:login`, `/exports:generate`.
- IDs are **UUIDs** in URLs (`/employees/3f0a…`). Business-facing codes (UHID, emp_code) go in query params, not the path.
- No file extensions in URLs.

```
GET    /api/v1/seniority/employees
GET    /api/v1/seniority/employees/:id
POST   /api/v1/seniority/employees
PATCH  /api/v1/seniority/employees/:id
DELETE /api/v1/seniority/employees/:id           # soft delete

GET    /api/v1/hospital/patients
GET    /api/v1/hospital/patients/:id
GET    /api/v1/hospital/patients/:id/timeline
POST   /api/v1/hospital/patients:search          # complex search
```

---

## 3. Request format

- `Content-Type: application/json; charset=utf-8`
- Body shape matches the Zod schema in `shared/validators/`.
- `Accept: application/json` is implicit; the API does not negotiate other formats.
- All timestamps in the body are **ISO-8601** in UTC (`2026-06-04T10:15:00Z`).
- All money values are **numbers** in major units (INR ₹ 123.45), not strings, not minor units.

---

## 4. Response format

Success (single resource):
```json
{
  "data": { "id": "…", "fullName": "…", … }
}
```

Success (collection):
```json
{
  "data": [ { "id": "…" }, … ],
  "meta": {
    "page": 1,
    "pageSize": 50,
    "total": 123,
    "totalPages": 3
  }
}
```

Error (RFC 7807):
```json
{
  "type": "https://errors.milindweb.invalid/validation_failed",
  "title": "Validation failed",
  "status": 422,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/seniority/employees",
  "errors": [
    { "path": "email", "code": "invalid_string", "message": "Invalid email" }
  ]
}
```

Standard status codes used:

| Code | When                                                             |
|------|------------------------------------------------------------------|
| 200  | Successful read or update.                                       |
| 201  | Successful create; `Location` header points to the new resource. |
| 204  | Successful delete (no body).                                     |
| 207  | Multi-status (batch operations).                                 |
| 400  | Malformed request.                                               |
| 401  | Missing/invalid token.                                           |
| 403  | Authenticated but not allowed.                                   |
| 404  | Resource not found.                                              |
| 409  | Conflict (duplicate, version mismatch).                          |
| 422  | Validation failed.                                               |
| 429  | Rate limited.                                                    |
| 500  | Server error (logged with `requestId`).                          |
| 503  | Maintenance / DB unreachable.                                    |

---

## 5. Filtering, sorting, pagination

- Filter: `?filter[status]=active&filter[department]=ICU`
- Sort: `?sort=-createdAt,name`  ( `-` prefix = descending, comma-separated)
- Page: `?page=1&pageSize=50`  (max `pageSize=200`)
- Sparse fieldsets (optional, later): `?fields[patient]=id,fullName,uhid`
- Search: `?q=milind` (full-text when applicable)

---

## 6. Headers

Request:
- `Authorization: Bearer <jwt>` — required for non-public endpoints.
- `Idempotency-Key: <uuid>` — required for `POST` and `PATCH` to make retries safe.
- `X-Request-Id: <uuid>` — optional; if absent, the server generates one and returns it in the response.

Response:
- `X-Request-Id` — always present; useful for support.
- `Cache-Control: no-store` on auth/PHI endpoints.
- `Content-Security-Policy`, `Strict-Transport-Security`, etc. set by helmet.

---

## 7. Rate limiting

- `@nestjs/throttler` with two tiers:
  - Per IP: 100 req / 1 min (anonymous endpoints).
  - Per user: 600 req / 1 min (authenticated).
- A `429` response includes `Retry-After` (seconds) and `X-RateLimit-*` headers.

---

## 8. Idempotency

`POST /api/v1/hospital/patients` with `Idempotency-Key: 5b1f…` will:
- On first call: process normally, return 201.
- On replay within 24h: return the **same** 201 response (cached in Redis *or* DB).
- On conflict (same key, different body): return 409.

Implemented at the controller level via `IdempotencyInterceptor`.

---

## 9. Soft delete

- `DELETE /api/v1/hospital/patients/:id` sets `is_deleted=true, deleted_at=now(), deleted_by=actor.id`.
- Subsequent reads filter `is_deleted=false` by default.
- `GET /api/v1/hospital/patients/:id?includeDeleted=true` returns even soft-deleted rows (admin only).
- `POST /api/v1/hospital/patients/:id/restore` clears the soft-delete fields.

---

## 10. File uploads

- Multipart only, via `POST /api/v1/uploads?bucket=patient-docs`.
- Max 25 MB per file; configurable per bucket.
- Returns `{ "url": "https://…", "key": "patient-docs/abc.pdf", "size": 12345, "contentType": "application/pdf" }`.
- Storage backend is **InsForge Storage** in dev / **S3-compatible** (B2, R2, MinIO) in prod — see `api/src/storage/`.

---

## 11. OpenAPI / Swagger

- Generated by `@nestjs/swagger` from controllers + Zod-to-OpenAPI helpers.
- Served at `GET /api/docs` (HTML) and `GET /api/docs-json` (machine-readable).
- Schemas in `shared/validators/` are the single source; both the spec and the runtime validation derive from them.
- The frontend's TypeScript client (`shared/types/`) is also generated from the same Zod schemas.

---

## 12. Versioning of breaking changes (cheat-sheet)

| Change                                                       | Breaking? | Action                              |
|--------------------------------------------------------------|-----------|-------------------------------------|
| Add a new optional field in the response                     | No        | Same version.                       |
| Add a new endpoint                                           | No        | Same version.                       |
| Add a new enum value                                         | No        | Same version; clients ignore unknown values. |
| Rename a field                                               | **Yes**   | Bump to v2 (or use a field alias for 6 months). |
| Remove a field                                               | **Yes**   | Bump to v2.                         |
| Change a field's type                                        | **Yes**   | Bump to v2.                         |
| Tighten validation (reject what was previously accepted)      | **Yes**   | Bump to v2.                         |
| Loosen validation (accept more)                              | No        | Same version.                       |

---

## 13. Health & readiness

- `GET /api/v1/health/live` — 200 if the process is up.
- `GET /api/v1/health/ready` — 200 only if DB is reachable and Authentik JWKS is fetchable.
- `GET /api/v1/metrics` — Prometheus exposition.
- `GET /api/docs` — Swagger UI.
- `GET /api/docs-json` — OpenAPI 3.1 JSON.

These four are unauthenticated.
