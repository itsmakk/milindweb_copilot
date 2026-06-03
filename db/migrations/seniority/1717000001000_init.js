/* eslint-disable camelcase */

/**
 * 1717000001000 — seniority schema: departments, employees, leave, rules, exports, audit.
 *
 * Forward-only in production. Idempotent enough for safe re-runs in dev.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createSchema('seniority', { ifNotExists: true });

  // ----- updated_at trigger function (re-usable per schema) -----
  pgm.sql(`
    CREATE OR REPLACE FUNCTION seniority.set_updated_at() RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // ----- departments -----
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS seniority.departments (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      code        text NOT NULL UNIQUE,
      name        text NOT NULL,
      parent_id   uuid REFERENCES seniority.departments(id),
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now(),
      created_by  uuid,
      updated_by  uuid,
      is_deleted  boolean NOT NULL DEFAULT false,
      deleted_at  timestamptz,
      deleted_by  uuid
    );
  `);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_departments_parent ON seniority.departments(parent_id);`);

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_seniority_departments_updated_at') THEN
        CREATE TRIGGER trg_seniority_departments_updated_at
          BEFORE UPDATE ON seniority.departments
          FOR EACH ROW EXECUTE FUNCTION seniority.set_updated_at();
      END IF;
    END $$;
  `);

  // ----- employees -----
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS seniority.employees (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      emp_code        text NOT NULL UNIQUE,
      full_name       text NOT NULL,
      gender          text CHECK (gender IN ('male','female','other')),
      dob             date,
      doj             date NOT NULL,
      date_of_regular date,
      date_of_retirement date,
      department_id   uuid NOT NULL REFERENCES seniority.departments(id),
      designation     text NOT NULL,
      grade           text,
      cadre           text,
      status          text NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','on_leave','suspended','retired','resigned','terminated')),
      email           citext,
      phone           text,
      address         text,
      qualifications  jsonb NOT NULL DEFAULT '[]'::jsonb,
      seniority_number int,
      created_at      timestamptz NOT NULL DEFAULT now(),
      updated_at      timestamptz NOT NULL DEFAULT now(),
      created_by      uuid,
      updated_by      uuid,
      is_deleted      boolean NOT NULL DEFAULT false,
      deleted_at      timestamptz,
      deleted_by      uuid
    );
  `);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_employees_dept       ON seniority.employees(department_id) WHERE is_deleted = false;`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_employees_status     ON seniority.employees(status)        WHERE is_deleted = false;`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_employees_doj        ON seniority.employees(doj);`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_employees_full_name  ON seniority.employees(full_name);`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_employees_grade      ON seniority.employees(grade) WHERE grade IS NOT NULL;`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_employees_cadre      ON seniority.employees(cadre) WHERE cadre IS NOT NULL;`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_employees_email      ON seniority.employees(email) WHERE email IS NOT NULL;`);

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_seniority_employees_updated_at') THEN
        CREATE TRIGGER trg_seniority_employees_updated_at
          BEFORE UPDATE ON seniority.employees
          FOR EACH ROW EXECUTE FUNCTION seniority.set_updated_at();
      END IF;
    END $$;
  `);

  // ----- leave -----
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS seniority.leave (
      id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id   uuid NOT NULL REFERENCES seniority.employees(id),
      leave_type    text NOT NULL CHECK (leave_type IN ('casual','sick','earned','unpaid','compensatory','maternity','paternity','other')),
      from_date     date NOT NULL,
      to_date       date NOT NULL,
      days          numeric(5,2) NOT NULL CHECK (days >= 0),
      reason        text,
      status        text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected','cancelled')),
      approved_by   uuid,
      approved_at   timestamptz,
      decision_note text,
      created_at    timestamptz NOT NULL DEFAULT now(),
      updated_at    timestamptz NOT NULL DEFAULT now(),
      created_by    uuid,
      updated_by    uuid,
      is_deleted    boolean NOT NULL DEFAULT false,
      deleted_at    timestamptz,
      deleted_by    uuid
    );
  `);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_leave_employee ON seniority.leave(employee_id) WHERE is_deleted = false;`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_leave_status   ON seniority.leave(status)        WHERE is_deleted = false;`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_leave_dates    ON seniority.leave(from_date, to_date);`);

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_seniority_leave_updated_at') THEN
        CREATE TRIGGER trg_seniority_leave_updated_at
          BEFORE UPDATE ON seniority.leave
          FOR EACH ROW EXECUTE FUNCTION seniority.set_updated_at();
      END IF;
    END $$;
  `);

  // ----- seniority_rules -----
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS seniority.seniority_rules (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name            text NOT NULL,
      description     text,
      -- Formula is a comma-separated list of "field DIRECTION" pairs.
      -- Allowed fields: full_name, doj, date_of_regular, dob, grade, cadre, designation, seniority_number, emp_code
      formula         text NOT NULL,
      is_active       boolean NOT NULL DEFAULT false,
      effective_from  date NOT NULL,
      effective_to    date,
      created_at      timestamptz NOT NULL DEFAULT now(),
      updated_at      timestamptz NOT NULL DEFAULT now(),
      created_by      uuid,
      updated_by      uuid,
      is_deleted      boolean NOT NULL DEFAULT false,
      deleted_at      timestamptz,
      deleted_by      uuid,
      CONSTRAINT uq_seniority_rules_one_active EXCLUDE (is_active WITH =) WHERE (is_active = true AND is_deleted = false)
    );
  `);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_rules_active ON seniority.seniority_rules(is_active) WHERE is_deleted = false;`);

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_seniority_rules_updated_at') THEN
        CREATE TRIGGER trg_seniority_rules_updated_at
          BEFORE UPDATE ON seniority.seniority_rules
          FOR EACH ROW EXECUTE FUNCTION seniority.set_updated_at();
      END IF;
    END $$;
  `);

  // ----- exports -----
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS seniority.exports (
      id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      generated_by  uuid NOT NULL,
      format        text NOT NULL CHECK (format IN ('csv','xlsx','pdf')),
      filter        jsonb NOT NULL DEFAULT '{}'::jsonb,
      row_count     int,
      file_url      text,
      byte_size     int,
      status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready','failed','expired')),
      error         text,
      generated_at  timestamptz NOT NULL DEFAULT now(),
      expires_at    timestamptz
    );
  `);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_exports_user ON seniority.exports(generated_by, generated_at DESC);`);

  // ----- audit_log (append-only) -----
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS seniority.audit_log (
      id          bigserial PRIMARY KEY,
      occurred_at timestamptz NOT NULL DEFAULT now(),
      actor_id    uuid,
      actor_email text,
      action      text NOT NULL,
      resource    text NOT NULL,
      resource_id text,
      ip          inet,
      user_agent  text,
      meta        jsonb
    );
  `);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_audit_occurred_at ON seniority.audit_log(occurred_at DESC);`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_audit_action      ON seniority.audit_log(action);`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_seniority_audit_resource    ON seniority.audit_log(resource, resource_id);`);

  // ----- seed: one default active rule -----
  pgm.sql(`
    INSERT INTO seniority.seniority_rules (name, description, formula, is_active, effective_from)
    VALUES (
      'Default (date of joining)',
      'Order by date of joining (oldest first), then full name.',
      'doj ASC, full_name ASC',
      true,
      current_date
    )
    ON CONFLICT DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('seniority.audit_log',     { ifExists: true, cascade: true });
  pgm.dropTable('seniority.exports',       { ifExists: true, cascade: true });
  pgm.dropTable('seniority.seniority_rules', { ifExists: true, cascade: true });
  pgm.dropTable('seniority.leave',         { ifExists: true, cascade: true });
  pgm.dropTable('seniority.employees',     { ifExists: true, cascade: true });
  pgm.dropTable('seniority.departments',   { ifExists: true, cascade: true });
  pgm.sql(`DROP FUNCTION IF EXISTS seniority.set_updated_at();`);
  pgm.dropSchema('seniority', { ifExists: true, cascade: true });
};
