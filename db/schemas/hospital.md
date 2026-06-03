# Hospital schema

Local pointer. The canonical schema is in `db/migrations/hospital/1717000002000_init.js`.

## Tables

| Table | Purpose |
|---|---|
| `hospital.departments` | Department master, self-referential, with default symptom list per dept |
| `hospital.doctors`      | Doctor master, unique by `lower(name)` while live |
| `hospital.patients`     | Patient master with UHID, demographics, medical history (JSONB arrays) |
| `hospital.opd_visits`   | One row per OPD visit. OPD no is unique. Cascade-delete prescriptions. |
| `hospital.prescriptions`| Medicine line items linked to a visit |
| `hospital.audit_log`    | Append-only audit trail (same shape as other modules) |

## Common columns

Every writeable table has:
- `is_deleted boolean NOT NULL DEFAULT false`
- `deleted_at timestamptz NULL`
- `deleted_by citext NULL`
- `created_at` / `updated_at` (auto via `hospital.set_updated_at()` trigger)
- `created_by` / `updated_by citext NOT NULL DEFAULT 'system'`

## Out of scope (deferred)

The full HMS spec in `1 hms.md` covers pharmacy, lab, radiology, billing, document upload, appointments, and an OPD-2-Doctor scheduler. The MVP in this migration covers **only** the OPD registration workflow that the old `form.html` performed. Future migrations will add:

- `hospital.appointments` (scheduler)
- `hospital.billing_invoices` + `hospital.billing_items`
- `hospital.medicines` (pharmacy master) + `hospital.stock_movements`
- `hospital.lab_tests` + `hospital.lab_orders` + `hospital.lab_reports`
- `hospital.radiology_orders` + `hospital.radiology_reports`
- `hospital.documents` (file attachments via STORAGE_DRIVER)

## Seed order

1. `db/seeds/auth_role_catalog.sql`
2. `db/seeds/hospital_doctors_and_departments.sql`  ← this file
3. `db/seeds/seniority_departments.sql`

## FHIR mapping (future)

- Patient → `Patient` resource
- OPDVisit → `Encounter` (class = `AMB`, type = OPD)
- Prescription → `MedicationRequest`
- Doctor → `Practitioner`
- Department → `Organization` (department)
