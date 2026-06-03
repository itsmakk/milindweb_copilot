-- reference data for the auth schema.
-- Idempotent; safe to re-run.

-- The set of roles that can be assigned to a user.
-- (Kept as a check in code; this table is for documentation/UI selection.)
CREATE TABLE IF NOT EXISTS auth.role_catalog (
    role        text PRIMARY KEY,
    tenant      text CHECK (tenant IN ('portfolio','seniority','hospital') OR tenant IS NULL),
    label       text NOT NULL,
    description text,
    sort_order  int  NOT NULL DEFAULT 0
);

INSERT INTO auth.role_catalog (role, tenant, label, description, sort_order) VALUES
    ('super_admin',              NULL,        'Super Admin',              'Full access across all tenants', 0),
    ('portfolio_admin',          'portfolio', 'Portfolio Admin',          'Manages public site content',    100),
    ('portfolio_editor',         'portfolio', 'Portfolio Editor',         'Edits content, cannot publish',  110),
    ('seniority_admin',          'seniority', 'Seniority Admin',          'Manages employees, rules, exports', 200),
    ('seniority_editor',         'seniority', 'Seniority Editor',         'Edits records',                  210),
    ('seniority_viewer',         'seniority', 'Seniority Viewer',         'Read-only',                      220),
    ('hospital_admin',           'hospital',  'Hospital Admin',           'Full hospital access',           300),
    ('hospital_doctor',          'hospital',  'Doctor',                   'Consultations, prescriptions',   310),
    ('hospital_receptionist',    'hospital',  'Receptionist',             'Registrations, billing intake',  320),
    ('hospital_nurse',           'hospital',  'Nurse',                    'Vitals, follow-up updates',      330),
    ('hospital_pharmacist',      'hospital',  'Pharmacist',               'Pharmacy stock + sales',         340),
    ('hospital_lab_staff',       'hospital',  'Lab Staff',                'Lab tests + results',            350),
    ('hospital_radiology_staff', 'hospital',  'Radiology Staff',          'Radiology orders + reports',     360),
    ('hospital_accountant',      'hospital',  'Accountant',               'Billing, payments',              370),
    ('hospital_viewer',          'hospital',  'Hospital Viewer',          'Read-only',                      380)
ON CONFLICT (role) DO NOTHING;
