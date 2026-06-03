-- ============================================================================
--  schema-insforge.sql
--  Idempotent DDL for the InsForge-hosted Postgres.
--
--  InsForge exposes a single public schema via PostgREST. We use prefixed
--  table names (auth_*, seniority_*, hospital_*, portfolio_*) instead of
--  PostgreSQL schemas so the API driver can target them through the
--  standard PostgREST grammar.
--
--  Every statement is safe to re-run (IF NOT EXISTS, ON CONFLICT DO NOTHING).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----- 1. auth.users (local mirror) ------------------------------------------
CREATE TABLE IF NOT EXISTS auth_users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id         text NOT NULL UNIQUE,
  email           text NOT NULL UNIQUE,
  display_name    text NOT NULL,
  avatar_url      text,
  tenant          text CHECK (tenant IN ('portfolio','seniority','hospital') OR tenant IS NULL),
  role            text NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  last_login_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  updated_by      uuid,
  is_deleted      boolean NOT NULL DEFAULT false,
  deleted_at      timestamptz,
  deleted_by      uuid
);
CREATE INDEX IF NOT EXISTS idx_auth_users_email  ON auth_users (email);
CREATE INDEX IF NOT EXISTS idx_auth_users_tenant ON auth_users (tenant) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_auth_users_role   ON auth_users (role)   WHERE is_deleted = false;

-- ----- 2. auth.role_permissions ---------------------------------------------
CREATE TABLE IF NOT EXISTS auth_role_permissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role        text NOT NULL,
  resource    text NOT NULL,
  action      text NOT NULL,
  constraint uq_auth_role_perm UNIQUE (role, resource, action)
);

-- ----- 3. auth.audit_log (append-only) --------------------------------------
CREATE TABLE IF NOT EXISTS auth_audit_log (
  id          bigserial PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_id    uuid,
  actor_email text,
  tenant      text,
  action      text NOT NULL,
  resource    text,
  resource_id text,
  ip          inet,
  user_agent  text,
  meta        jsonb
);
CREATE INDEX IF NOT EXISTS idx_auth_audit_occurred_at ON auth_audit_log (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_audit_actor       ON auth_audit_log (actor_id) WHERE actor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_auth_audit_action      ON auth_audit_log (action);

-- ----- 4. portfolio.* -------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio_services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  title       text NOT NULL,
  summary     text,
  body        text,
  icon        text,
  sort_order  int NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  title       text NOT NULL,
  client      text,
  summary     text,
  body        text,
  cover_url   text,
  tags        text[],
  is_featured boolean NOT NULL DEFAULT false,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_testimonials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_role text,
  body        text NOT NULL,
  rating      int CHECK (rating BETWEEN 1 AND 5),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_faqs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question    text NOT NULL,
  answer      text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_blog_posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  title       text NOT NULL,
  excerpt     text,
  body        text,
  cover_url   text,
  tags        text[],
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label       text NOT NULL,
  url         text NOT NULL,
  category    text,
  sort_order  int NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS portfolio_calendar_holidays (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_date date NOT NULL,
  label       text NOT NULL,
  region      text NOT NULL DEFAULT 'IN',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ----- 5. seniority.* -------------------------------------------------------
CREATE TABLE IF NOT EXISTS seniority_departments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  code        text,
  head_emp_id uuid,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seniority_employees (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emp_code      text NOT NULL UNIQUE,
  full_name     text NOT NULL,
  email         text,
  phone         text,
  department_id uuid REFERENCES seniority_departments(id) ON DELETE SET NULL,
  designation   text,
  date_of_joining date,
  date_of_leaving  date,
  seniority_years numeric(6,2) NOT NULL DEFAULT 0,
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active','on_leave','retired','terminated')),
  photo_url     text,
  notes         text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seniority_leave (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emp_id      uuid NOT NULL REFERENCES seniority_employees(id) ON DELETE CASCADE,
  leave_type  text NOT NULL,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  days        numeric(5,1) NOT NULL,
  reason      text,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  approver_id uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seniority_rules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key    text NOT NULL UNIQUE,
  rule_value  jsonb NOT NULL,
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ----- 6. hospital.* --------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospital_patients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uhid        text NOT NULL UNIQUE,
  full_name   text NOT NULL,
  dob         date,
  gender      text CHECK (gender IN ('M','F','O') OR gender IS NULL),
  phone       text,
  email       text,
  address     text,
  blood_group text,
  allergies   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hospital_doctors (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text NOT NULL,
  department  text,
  designation text,
  reg_no      text,
  phone       text,
  email       text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hospital_opd_visits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  uuid NOT NULL REFERENCES hospital_patients(id) ON DELETE CASCADE,
  doctor_id   uuid REFERENCES hospital_doctors(id) ON DELETE SET NULL,
  visit_date  timestamptz NOT NULL DEFAULT now(),
  chief_complaint text,
  diagnosis   text,
  notes       text,
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','referred')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hospital_medicines (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  form        text,
  strength    text,
  unit_price  numeric(10,2) NOT NULL DEFAULT 0,
  stock       int NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS hospital_prescriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id    uuid NOT NULL REFERENCES hospital_opd_visits(id) ON DELETE CASCADE,
  doctor_id   uuid REFERENCES hospital_doctors(id),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hospital_prescription_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES hospital_prescriptions(id) ON DELETE CASCADE,
  medicine_id     uuid REFERENCES hospital_medicines(id),
  dosage          text,
  duration_days   int,
  qty             int NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS hospital_investigations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id    uuid NOT NULL REFERENCES hospital_opd_visits(id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('lab','radiology')),
  name        text NOT NULL,
  status      text NOT NULL DEFAULT 'ordered' CHECK (status IN ('ordered','in_progress','completed','cancelled')),
  ordered_at  timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS hospital_lab_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid NOT NULL UNIQUE REFERENCES hospital_investigations(id) ON DELETE CASCADE,
  result          jsonb,
  report_url      text,
  released_at     timestamptz
);

CREATE TABLE IF NOT EXISTS hospital_radiology_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id uuid NOT NULL UNIQUE REFERENCES hospital_investigations(id) ON DELETE CASCADE,
  findings        text,
  impression      text,
  image_url       text,
  released_at     timestamptz
);

CREATE TABLE IF NOT EXISTS hospital_bills (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  uuid NOT NULL REFERENCES hospital_patients(id) ON DELETE CASCADE,
  visit_id    uuid REFERENCES hospital_opd_visits(id) ON DELETE SET NULL,
  total       numeric(10,2) NOT NULL DEFAULT 0,
  paid        numeric(10,2) NOT NULL DEFAULT 0,
  status      text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','partial','paid','cancelled')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hospital_payments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id     uuid NOT NULL REFERENCES hospital_bills(id) ON DELETE CASCADE,
  amount      numeric(10,2) NOT NULL,
  method      text,
  reference   text,
  paid_at     timestamptz NOT NULL DEFAULT now()
);

-- ----- 7. updated_at trigger ------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auth_users_updated_at') THEN
    CREATE TRIGGER trg_auth_users_updated_at
      BEFORE UPDATE ON auth_users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_seniority_employees_updated_at') THEN
    CREATE TRIGGER trg_seniority_employees_updated_at
      BEFORE UPDATE ON seniority_employees
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_seniority_leave_updated_at') THEN
    CREATE TRIGGER trg_seniority_leave_updated_at
      BEFORE UPDATE ON seniority_leave
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_portfolio_services_updated_at') THEN
    CREATE TRIGGER trg_portfolio_services_updated_at
      BEFORE UPDATE ON portfolio_services
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_portfolio_projects_updated_at') THEN
    CREATE TRIGGER trg_portfolio_projects_updated_at
      BEFORE UPDATE ON portfolio_projects
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_portfolio_blog_posts_updated_at') THEN
    CREATE TRIGGER trg_portfolio_blog_posts_updated_at
      BEFORE UPDATE ON portfolio_blog_posts
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_hospital_patients_updated_at') THEN
    CREATE TRIGGER trg_hospital_patients_updated_at
      BEFORE UPDATE ON hospital_patients
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;
