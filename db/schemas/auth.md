# `auth` schema — reference

See `docs/database-schema.md` §3 for the canonical reference. This file is the local pointer.

## Tables in this schema

| Table              | Owner module     | Purpose                                              |
|--------------------|------------------|------------------------------------------------------|
| `users`            | `users`          | Local mirror of Authentik users (FK target).         |
| `role_permissions` | `auth`           | Role → (resource, action) matrix.                    |
| `role_catalog`     | `auth` (seeds)   | Human-readable role metadata (label, sort order).    |
| `audit_log`        | `auth`           | Append-only audit trail of security-relevant events. |

## Conventions

- All writeable tables include the soft-delete + audit columns defined in `docs/database-schema.md` §1.
- An `updated_at` trigger (`auth.set_updated_at`) maintains `updated_at` on `auth.users`.
- `audit_log` is append-only — no UPDATE / DELETE allowed by app code.
