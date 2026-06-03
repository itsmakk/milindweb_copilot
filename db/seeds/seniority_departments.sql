-- Idempotent seed for the seniority schema.
-- Initial departments (NAD = North American Diocese, per the existing UI title).

INSERT INTO seniority.departments (code, name) VALUES
    ('GEN',   'General Administration'),
    ('FIN',   'Finance & Accounts'),
    ('EDU',   'Education'),
    ('HLT',   'Health'),
    ('SOC',   'Social Service'),
    ('AGR',   'Agriculture'),
    ('ENG',   'Engineering'),
    ('IT',    'Information Technology'),
    ('LEG',   'Legal'),
    ('PR',    'Public Relations'),
    ('HR',    'Human Resources'),
    ('PRO',   'Procurement')
ON CONFLICT (code) DO NOTHING;
