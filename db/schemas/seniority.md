# `seniority` schema — reference

See `docs/database-schema.md` §5 for the canonical reference. This file is the local pointer.

## Tables in this schema

| Table              | Purpose                                                            |
|--------------------|--------------------------------------------------------------------|
| `departments`      | Org tree. Self-referential via `parent_id`.                        |
| `employees`        | Master record. Carries the seniority-relevant dates + grade/cadre. |
| `leave`            | Leave requests, approval workflow.                                 |
| `seniority_rules`  | At most one `is_active = true` (partial unique index).             |
| `exports`          | History of generated exports (CSV/XLSX/PDF).                       |
| `audit_log`        | Append-only audit trail of seniority operations.                   |

## Seniority formula

The active rule's `formula` is a string of comma-separated `field DIRECTION` pairs.

Allowed fields: `full_name`, `doj`, `date_of_regular`, `dob`, `grade`, `cadre`, `designation`, `seniority_number`, `emp_code`.

Example: `doj ASC, grade DESC, dob ASC, full_name ASC` — oldest date of joining first, then by grade descending, then by date of birth ascending, then name.

The API enforces the whitelist in `api/src/modules/seniority/employees/seniority.engine.ts` so users cannot inject arbitrary SQL.
