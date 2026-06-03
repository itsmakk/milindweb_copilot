/* eslint-disable camelcase */
'use strict';

exports.shorthands = undefined;

/**
 * Hospital MVP — replaces form.html (OPD registration).
 * Scope: doctors, departments, patients, OPD visits, prescriptions.
 * Out of scope (deferred to later phases): pharmacy, lab, radiology,
 * billing, appointments, document upload.
 */
exports.up = (pgm) => {
  pgm.createSchema('hospital', { ifNotExists: true });
  pgm.createExtension('citext', { ifNotExists: true });
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  // -----------------------------------------------------------------------
  //  updated_at trigger function (per-schema to keep ownership clean)
  // -----------------------------------------------------------------------
  pgm.createFunction(
    'hospital',
    'set_updated_at',
    [],
    { returns: 'trigger', language: 'plpgsql', replace: true },
    'BEGIN NEW.updated_at = now(); RETURN NEW; END;',
  );

  // -----------------------------------------------------------------------
  //  departments — same 12 as form.html dropdown + extra hospital departments
  // -----------------------------------------------------------------------
  pgm.createTable(
    { schema: 'hospital', name: 'departments' },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      code: { type: 'citext', notNull: true, unique: true },
      name: { type: 'citext', notNull: true },
      parent_id: { type: 'uuid', references: '"hospital".departments(id)', onDelete: 'SET NULL' },
      default_symptoms: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      is_active: { type: 'boolean', notNull: true, default: true },
      sort_order: { type: 'integer', notNull: true, default: 0 },
      // soft-delete + audit
      is_deleted: { type: 'boolean', notNull: true, default: false },
      deleted_at: { type: 'timestamptz' },
      deleted_by: { type: 'citext' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      created_by: { type: 'citext', notNull: true, default: 'system' },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_by: { type: 'citext', notNull: true, default: 'system' },
    },
    { ifNotExists: true },
  );
  pgm.createIndex({ schema: 'hospital', name: 'departments' }, 'is_active', { where: 'is_deleted = false', name: 'idx_hosp_dept_active' });

  pgm.sql(`
    CREATE TRIGGER trg_hosp_dept_updated_at
    BEFORE UPDATE ON hospital.departments
    FOR EACH ROW EXECUTE FUNCTION hospital.set_updated_at();
  `);

  // -----------------------------------------------------------------------
  //  doctors — seeded from form.html's hard-coded list + drname.json
  // -----------------------------------------------------------------------
  pgm.createTable(
    { schema: 'hospital', name: 'doctors' },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      code: { type: 'citext' },                                         // optional short code
      name: { type: 'citext', notNull: true },
      qualification: { type: 'citext' },
      registration_no: { type: 'citext' },
      department_id: { type: 'uuid', references: '"hospital".departments(id)', onDelete: 'SET NULL' },
      specialization: { type: 'citext' },
      mobile: { type: 'citext' },
      email: { type: 'citext' },
      consultation_fee: { type: 'numeric(10, 2)' },
      signature_url: { type: 'text' },
      is_active: { type: 'boolean', notNull: true, default: true },
      // soft-delete + audit
      is_deleted: { type: 'boolean', notNull: true, default: false },
      deleted_at: { type: 'timestamptz' },
      deleted_by: { type: 'citext' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      created_by: { type: 'citext', notNull: true, default: 'system' },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_by: { type: 'citext', notNull: true, default: 'system' },
    },
    { ifNotExists: true },
  );
  // Unique doctor name within the live (non-deleted) set
  pgm.createIndex(
    { schema: 'hospital', name: 'doctors' },
    'lower(name)',
    { unique: true, where: 'is_deleted = false', name: 'uq_hosp_doctors_name_live' },
  );
  pgm.createIndex({ schema: 'hospital', name: 'doctors' }, 'department_id', { name: 'idx_hosp_doctors_dept' });

  pgm.sql(`
    CREATE TRIGGER trg_hosp_doctors_updated_at
    BEFORE UPDATE ON hospital.doctors
    FOR EACH ROW EXECUTE FUNCTION hospital.set_updated_at();
  `);

  // -----------------------------------------------------------------------
  //  patients — master, soft-delete only
  // -----------------------------------------------------------------------
  pgm.createTable(
    { schema: 'hospital', name: 'patients' },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      uhid: { type: 'citext', notNull: true, unique: true },           // human-readable, e.g. MH-2024-000123
      full_name: { type: 'citext', notNull: true },
      gender: { type: 'citext', notNull: true, check: "gender IN ('Male','Female','Other')" },
      dob: { type: 'date' },
      age: { type: 'integer' },                                          // stored if DOB unknown
      mobile: { type: 'citext' },
      email: { type: 'citext' },
      address: { type: 'text' },
      blood_group: { type: 'citext' },
      occupation: { type: 'citext' },
      aadhaar: { type: 'citext' },                                       // optional
      emergency_contact: { type: 'citext' },
      marital_status: { type: 'citext', check: "marital_status IS NULL OR marital_status IN ('Single','Married','Divorced','Widowed')" },
      // medical history (JSON arrays)
      allergies: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      chronic_diseases: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      family_history: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      surgical_history: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      current_medications: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      // soft-delete + audit
      is_deleted: { type: 'boolean', notNull: true, default: false },
      deleted_at: { type: 'timestamptz' },
      deleted_by: { type: 'citext' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      created_by: { type: 'citext', notNull: true, default: 'system' },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_by: { type: 'citext', notNull: true, default: 'system' },
    },
    { ifNotExists: true },
  );
  pgm.createIndex({ schema: 'hospital', name: 'patients' }, 'uhid', { name: 'idx_hosp_patients_uhid' });
  pgm.createIndex({ schema: 'hospital', name: 'patients' }, 'mobile', { where: 'mobile IS NOT NULL', name: 'idx_hosp_patients_mobile' });
  pgm.createIndex({ schema: 'hospital', name: 'patients' }, 'full_name', { name: 'idx_hosp_patients_name' });
  pgm.sql(`CREATE INDEX idx_hosp_patients_search ON "hospital".patients USING GIN (full_name gin_trgm_ops) WHERE is_deleted = false;`).catch?.(() => undefined);
  // GIN trgm may not exist; fallback is the btree above.

  pgm.sql(`
    CREATE TRIGGER trg_hosp_patients_updated_at
    BEFORE UPDATE ON hospital.patients
    FOR EACH ROW EXECUTE FUNCTION hospital.set_updated_at();
  `);

  // -----------------------------------------------------------------------
  //  opd_visits — one row per visit. OPD number is unique per day.
  // -----------------------------------------------------------------------
  pgm.createTable(
    { schema: 'hospital', name: 'opd_visits' },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      opd_no: { type: 'citext', notNull: true, unique: true },         // e.g. OPD-2024-01-15-0042
      patient_id: { type: 'uuid', notNull: true, references: '"hospital".patients(id)', onDelete: 'RESTRICT' },
      doctor_id: { type: 'uuid', references: '"hospital".doctors(id)', onDelete: 'SET NULL' },
      department_id: { type: 'uuid', references: '"hospital".departments(id)', onDelete: 'SET NULL' },
      visit_date: { type: 'date', notNull: true, default: pgm.func('current_date') },
      // Vitals
      weight_kg: { type: 'numeric(5, 2)' },
      bp: { type: 'citext' },                                          // e.g. "120/80"
      pulse: { type: 'integer' },
      respiratory_rate: { type: 'integer' },
      spo2: { type: 'integer' },
      temp_f: { type: 'numeric(4, 1)' },
      sugar_mg_dl: { type: 'integer' },
      // Clinical
      chief_complaints: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
      provisional_diagnosis: { type: 'text' },
      investigations_advised: { type: 'text' },
      investigation_reports: { type: 'text' },
      final_diagnosis: { type: 'text' },
      advice: { type: 'text' },
      effect_after_treatment: { type: 'citext', check: "effect_after_treatment IS NULL OR effect_after_treatment IN ('Recovered','No Change','Worsened','Follow-up Required','NA')" },
      doctor_fee: { type: 'numeric(10, 2)' },
      doctor_remarks: { type: 'text' },
      // soft-delete + audit
      is_deleted: { type: 'boolean', notNull: true, default: false },
      deleted_at: { type: 'timestamptz' },
      deleted_by: { type: 'citext' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      created_by: { type: 'citext', notNull: true, default: 'system' },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_by: { type: 'citext', notNull: true, default: 'system' },
    },
    { ifNotExists: true },
  );
  pgm.createIndex({ schema: 'hospital', name: 'opd_visits' }, 'patient_id', { name: 'idx_hosp_visits_patient' });
  pgm.createIndex({ schema: 'hospital', name: 'opd_visits' }, 'visit_date', { name: 'idx_hosp_visits_date' });
  pgm.createIndex({ schema: 'hospital', name: 'opd_visits' }, 'doctor_id', { name: 'idx_hosp_visits_doctor' });

  pgm.sql(`
    CREATE TRIGGER trg_hosp_visits_updated_at
    BEFORE UPDATE ON hospital.opd_visits
    FOR EACH ROW EXECUTE FUNCTION hospital.set_updated_at();
  `);

  // -----------------------------------------------------------------------
  //  prescriptions — child of a visit
  // -----------------------------------------------------------------------
  pgm.createTable(
    { schema: 'hospital', name: 'prescriptions' },
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      visit_id: { type: 'uuid', notNull: true, references: '"hospital".opd_visits(id)', onDelete: 'CASCADE' },
      medicine_name: { type: 'citext', notNull: true },
      generic_name: { type: 'citext' },
      brand_name: { type: 'citext' },
      strength: { type: 'citext' },                                     // e.g. "500 mg"
      dosage: { type: 'citext' },                                       // e.g. "1+0+1"
      frequency: { type: 'citext' },                                    // e.g. "BD", "TDS"
      duration: { type: 'citext' },                                     // e.g. "5 days"
      route: { type: 'citext' },                                        // e.g. "Oral"
      instructions: { type: 'text' },
      sort_order: { type: 'integer', notNull: true, default: 0 },
      // soft-delete + audit
      is_deleted: { type: 'boolean', notNull: true, default: false },
      deleted_at: { type: 'timestamptz' },
      deleted_by: { type: 'citext' },
      created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      created_by: { type: 'citext', notNull: true, default: 'system' },
      updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
      updated_by: { type: 'citext', notNull: true, default: 'system' },
    },
    { ifNotExists: true },
  );
  pgm.createIndex({ schema: 'hospital', name: 'prescriptions' }, 'visit_id', { name: 'idx_hosp_rx_visit' });

  pgm.sql(`
    CREATE TRIGGER trg_hosp_rx_updated_at
    BEFORE UPDATE ON hospital.prescriptions
    FOR EACH ROW EXECUTE FUNCTION hospital.set_updated_at();
  `);

  // -----------------------------------------------------------------------
  //  audit_log — same shape as other modules
  // -----------------------------------------------------------------------
  pgm.createTable(
    { schema: 'hospital', name: 'audit_log' },
    {
      id: { type: 'bigserial', primaryKey: true },
      actor_id: { type: 'citext' },
      actor_role: { type: 'citext' },
      tenant: { type: 'citext' },
      action: { type: 'citext', notNull: true },
      entity: { type: 'citext', notNull: true },
      entity_id: { type: 'citext' },
      meta: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
      ip: { type: 'inet' },
      user_agent: { type: 'text' },
      request_id: { type: 'citext' },
      at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    { ifNotExists: true },
  );
  pgm.createIndex({ schema: 'hospital', name: 'audit_log' }, ['entity', 'entity_id'], { name: 'idx_hosp_audit_entity' });
  pgm.createIndex({ schema: 'hospital', name: 'audit_log' }, 'at', { name: 'idx_hosp_audit_at' });
};

exports.down = (pgm) => {
  pgm.dropTable({ schema: 'hospital', name: 'audit_log' }, { ifExists: true });
  pgm.dropTable({ schema: 'hospital', name: 'prescriptions' }, { ifExists: true });
  pgm.dropTable({ schema: 'hospital', name: 'opd_visits' }, { ifExists: true });
  pgm.dropTable({ schema: 'hospital', name: 'patients' }, { ifExists: true });
  pgm.dropTable({ schema: 'hospital', name: 'doctors' }, { ifExists: true });
  pgm.dropTable({ schema: 'hospital', name: 'departments' }, { ifExists: true });
  pgm.dropFunction({ schema: 'hospital', name: 'set_updated_at' }, [], { ifExists: true });
  pgm.dropSchema('hospital', { ifExists: true, cascade: true });
};
