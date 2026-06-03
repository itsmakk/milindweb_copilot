-- ============================================================================
--  hospital_doctors_and_departments.sql
--  Seeds the doctors + departments that the old form.html used, plus a few
--  common departments from data/dept.json.
--  Idempotent: re-runs safely (ON CONFLICT DO NOTHING).
-- ============================================================================

INSERT INTO hospital.departments (code, name, sort_order) VALUES
  ('MED',  'General Medicine',     10),
  ('CARD', 'Cardiology',           20),
  ('ENT',  'ENT',                  30),
  ('EYE',  'Ophthalmology',        40),
  ('DENT', 'Dental',               50),
  ('ORTHO','Orthopedics',          60),
  ('GYNAE','Obstetrics & Gynecology', 70),
  ('PEDI', 'Pediatrics',           80),
  ('SURG', 'General Surgery',      90),
  ('DERM', 'Dermatology',          100),
  ('EMER', 'Casualty / Emergency', 110),
  ('CHEST','Pulmonology / Chest',  120),
  ('ENDO', 'Endocrinology',        130),
  ('GASTRO','Gastroenterology',    140),
  ('NEPH', 'Nephrology',           150),
  ('NEURO','Neurology',            160),
  ('RAD',  'Radiology',            170),
  ('LAB',  'Laboratory',           180),
  ('PHARM','Pharmacy',             190)
ON CONFLICT (code) DO NOTHING;

-- Doctors from the original form.html dropdown
INSERT INTO hospital.doctors (name) VALUES
  ('Dr. Girkar'),
  ('Dr. Nerekar'),
  ('Dr. Sathe'),
  ('Dr. Hajari'),
  ('Dr. Gargi Hospital'),
  ('Dr. INHS Sandhani - Gyne'),
  ('Dr. INHS Sandhani - General'),
  ('Dr. Terna Hospital'),
  ('Dr. JJ Hospital'),
  ('Dr. KEM Hospital')
ON CONFLICT (lower(name)) WHERE is_deleted = false DO NOTHING;
