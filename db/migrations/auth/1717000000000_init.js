/* eslint-disable camelcase */

/**
 * 1717000000000 — auth schema: extensions, users mirror, role permissions, audit log.
 *
 * Idempotent: safe to re-run on a partially-migrated DB.
 * Forward-only in production (no `down` for prod).
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // citext for case-insensitive email
  pgm.createExtension('citext', { ifNotExists: true });
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createSchema('auth', { ifNotExists: true });

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS auth.users (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      auth_id         text NOT NULL UNIQUE,
      email           citext NOT NULL UNIQUE,
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

    CREATE INDEX IF NOT EXISTS idx_auth_users_email     ON auth.users (email);
    CREATE INDEX IF NOT EXISTS idx_auth_users_tenant    ON auth.users (tenant) WHERE is_deleted = false;
    CREATE INDEX IF NOT EXISTS idx_auth_users_role      ON auth.users (role)   WHERE is_deleted = false;
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS auth.role_permissions (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      role        text NOT NULL,
      resource    text NOT NULL,
      action      text NOT NULL,
      constraint uq_auth_role_perm UNIQUE (role, resource, action)
    );
  `);

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS auth.audit_log (
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
  `);

  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_auth_audit_occurred_at ON auth.audit_log (occurred_at DESC);`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_auth_audit_actor       ON auth.audit_log (actor_id) WHERE actor_id IS NOT NULL;`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_auth_audit_action      ON auth.audit_log (action);`);

  // Generic updated_at trigger
  pgm.sql(`
    CREATE OR REPLACE FUNCTION auth.set_updated_at() RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auth_users_updated_at') THEN
        CREATE TRIGGER trg_auth_users_updated_at
          BEFORE UPDATE ON auth.users
          FOR EACH ROW EXECUTE FUNCTION auth.set_updated_at();
      END IF;
    END $$;
  `);

  // Seed the default role/permission matrix
  pgm.sql(`
    INSERT INTO auth.role_permissions (role, resource, action) VALUES
      -- super_admin: everything
      ('super_admin', '*', '*'),
      -- portfolio
      ('portfolio_admin',  'service',     '*'),
      ('portfolio_admin',  'project',     '*'),
      ('portfolio_admin',  'testimonial', '*'),
      ('portfolio_admin',  'faq',         '*'),
      ('portfolio_admin',  'blog_post',   '*'),
      ('portfolio_admin',  'link',        '*'),
      ('portfolio_editor', 'service',     'read'),
      ('portfolio_editor', 'service',     'update'),
      ('portfolio_editor', 'project',     'read'),
      ('portfolio_editor', 'project',     'update'),
      ('portfolio_editor', 'testimonial', 'read'),
      ('portfolio_editor', 'testimonial', 'update'),
      ('portfolio_editor', 'faq',         'read'),
      ('portfolio_editor', 'faq',         'update'),
      ('portfolio_editor', 'blog_post',   'read'),
      ('portfolio_editor', 'blog_post',   'update'),
      ('portfolio_editor', 'link',        'read'),
      ('portfolio_editor', 'link',        'update'),
      -- seniority
      ('seniority_admin',  'employee',    '*'),
      ('seniority_admin',  'leave',       '*'),
      ('seniority_admin',  'export',      '*'),
      ('seniority_editor', 'employee',    'read'),
      ('seniority_editor', 'employee',    'create'),
      ('seniority_editor', 'employee',    'update'),
      ('seniority_editor', 'leave',       'read'),
      ('seniority_editor', 'leave',       'update'),
      ('seniority_viewer', 'employee',    'read'),
      ('seniority_viewer', 'leave',       'read'),
      -- hospital
      ('hospital_admin',       'patient',          '*'),
      ('hospital_admin',       'doctor',           '*'),
      ('hospital_admin',       'opd_visit',        '*'),
      ('hospital_admin',       'prescription',     '*'),
      ('hospital_admin',       'investigation',    '*'),
      ('hospital_admin',       'bill',             '*'),
      ('hospital_admin',       'payment',          '*'),
      ('hospital_admin',       'medicine',         '*'),
      ('hospital_admin',       'lab_result',       '*'),
      ('hospital_admin',       'radiology_report', '*'),
      ('hospital_doctor',      'patient',          'read'),
      ('hospital_doctor',      'patient',          'update'),
      ('hospital_doctor',      'opd_visit',        '*'),
      ('hospital_doctor',      'prescription',     'create'),
      ('hospital_doctor',      'prescription',     'read'),
      ('hospital_doctor',      'prescription',     'update'),
      ('hospital_doctor',      'investigation',    'create'),
      ('hospital_doctor',      'investigation',    'read'),
      ('hospital_receptionist','patient',          'create'),
      ('hospital_receptionist','patient',          'read'),
      ('hospital_receptionist','patient',          'update'),
      ('hospital_receptionist','opd_visit',        'create'),
      ('hospital_receptionist','opd_visit',        'read'),
      ('hospital_receptionist','bill',             'create'),
      ('hospital_receptionist','bill',             'read'),
      ('hospital_receptionist','payment',          'create'),
      ('hospital_receptionist','payment',          'read'),
      ('hospital_nurse',       'patient',          'read'),
      ('hospital_nurse',       'opd_visit',        'read'),
      ('hospital_nurse',       'opd_visit',        'update'),
      ('hospital_pharmacist',  'medicine',         'read'),
      ('hospital_pharmacist',  'medicine',         'update'),
      ('hospital_pharmacist',  'prescription',     'read'),
      ('hospital_lab_staff',   'investigation',    '*'),
      ('hospital_lab_staff',   'lab_result',       '*'),
      ('hospital_radiology_staff','investigation', '*'),
      ('hospital_radiology_staff','radiology_report','*'),
      ('hospital_accountant',  'bill',             'read'),
      ('hospital_accountant',  'bill',             'update'),
      ('hospital_accountant',  'payment',          '*'),
      ('hospital_viewer',      'patient',          'read'),
      ('hospital_viewer',      'doctor',           'read')
    ON CONFLICT (role, resource, action) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_auth_users_updated_at ON auth.users;`);
  pgm.sql(`DROP FUNCTION IF EXISTS auth.set_updated_at();`);
  pgm.dropTable('auth.audit_log', { ifExists: true });
  pgm.dropTable('auth.role_permissions', { ifExists: true });
  pgm.dropTable('auth.users', { ifExists: true });
  pgm.dropSchema('auth', { ifExists: true, cascade: true });
};
