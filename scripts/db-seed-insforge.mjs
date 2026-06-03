/**
 * db-seed-insforge.mjs
 *
 * Seeds the role/permission matrix and a small portfolio data set into
 * the InsForge database. Idempotent: re-runs only insert rows that
 * don't already exist.
 *
 * Usage:
 *   node scripts/db-seed-insforge.mjs
 *
 * Reads INSFORGE_BASE_URL and INSFORGE_API_KEY (service role) from .env.
 * The service role key is required because seed inserts bypass RLS.
 */

import { createClient } from '@insforge/sdk';
import { pathToFileURL } from 'node:url';
import { loadDotenv } from './_load-dotenv.mjs';

loadDotenv();

// ---------------------------------------------------------------------------
//  1. Role / permission matrix
// ---------------------------------------------------------------------------
const ROLE_PERMISSIONS = [
  // super_admin: everything
  ['super_admin', '*', '*'],
  // portfolio
  ['portfolio_admin',  'service',     '*'],
  ['portfolio_admin',  'project',     '*'],
  ['portfolio_admin',  'testimonial', '*'],
  ['portfolio_admin',  'faq',         '*'],
  ['portfolio_admin',  'blog_post',   '*'],
  ['portfolio_admin',  'link',        '*'],
  ['portfolio_editor', 'service',     'read'],
  ['portfolio_editor', 'service',     'update'],
  ['portfolio_editor', 'project',     'read'],
  ['portfolio_editor', 'project',     'update'],
  ['portfolio_editor', 'testimonial', 'read'],
  ['portfolio_editor', 'testimonial', 'update'],
  ['portfolio_editor', 'faq',         'read'],
  ['portfolio_editor', 'faq',         'update'],
  ['portfolio_editor', 'blog_post',   'read'],
  ['portfolio_editor', 'blog_post',   'update'],
  ['portfolio_editor', 'link',        'read'],
  ['portfolio_editor', 'link',        'update'],
  // seniority
  ['seniority_admin',  'employee',    '*'],
  ['seniority_admin',  'leave',       '*'],
  ['seniority_admin',  'export',      '*'],
  ['seniority_editor', 'employee',    'read'],
  ['seniority_editor', 'employee',    'create'],
  ['seniority_editor', 'employee',    'update'],
  ['seniority_editor', 'leave',       'read'],
  ['seniority_editor', 'leave',       'update'],
  ['seniority_viewer', 'employee',    'read'],
  ['seniority_viewer', 'leave',       'read'],
  // hospital
  ['hospital_admin',           'patient',          '*'],
  ['hospital_admin',           'doctor',           '*'],
  ['hospital_admin',           'opd_visit',        '*'],
  ['hospital_admin',           'prescription',     '*'],
  ['hospital_admin',           'investigation',    '*'],
  ['hospital_admin',           'bill',             '*'],
  ['hospital_admin',           'payment',          '*'],
  ['hospital_admin',           'medicine',         '*'],
  ['hospital_admin',           'lab_result',       '*'],
  ['hospital_admin',           'radiology_report', '*'],
  ['hospital_doctor',          'patient',          'read'],
  ['hospital_doctor',          'patient',          'update'],
  ['hospital_doctor',          'opd_visit',        '*'],
  ['hospital_doctor',          'prescription',     'create'],
  ['hospital_doctor',          'prescription',     'read'],
  ['hospital_doctor',          'prescription',     'update'],
  ['hospital_doctor',          'investigation',    'create'],
  ['hospital_doctor',          'investigation',    'read'],
  ['hospital_receptionist',    'patient',          'create'],
  ['hospital_receptionist',    'patient',          'read'],
  ['hospital_receptionist',    'patient',          'update'],
  ['hospital_receptionist',    'opd_visit',        'create'],
  ['hospital_receptionist',    'opd_visit',        'read'],
  ['hospital_receptionist',    'bill',             'create'],
  ['hospital_receptionist',    'bill',             'read'],
  ['hospital_receptionist',    'payment',          'create'],
  ['hospital_receptionist',    'payment',          'read'],
  ['hospital_nurse',           'patient',          'read'],
  ['hospital_nurse',           'opd_visit',        'read'],
  ['hospital_nurse',           'opd_visit',        'update'],
  ['hospital_pharmacist',      'medicine',         'read'],
  ['hospital_pharmacist',      'medicine',         'update'],
  ['hospital_pharmacist',      'prescription',     'read'],
  ['hospital_lab_staff',       'investigation',    '*'],
  ['hospital_lab_staff',       'lab_result',       '*'],
  ['hospital_radiology_staff', 'investigation',    '*'],
  ['hospital_radiology_staff', 'radiology_report','*'],
  ['hospital_accountant',      'bill',             'read'],
  ['hospital_accountant',      'bill',             'update'],
  ['hospital_accountant',      'payment',          '*'],
  ['hospital_viewer',          'patient',          'read'],
  ['hospital_viewer',          'doctor',           'read'],
];

// ---------------------------------------------------------------------------
//  2. Seniority: default departments
// ---------------------------------------------------------------------------
const DEPARTMENTS = [
  { name: 'Cardiology',    code: 'CARD' },
  { name: 'Orthopedics',   code: 'ORTH' },
  { name: 'Pediatrics',    code: 'PED' },
  { name: 'General OPD',   code: 'OPD' },
  { name: 'Radiology',     code: 'RAD' },
  { name: 'Pathology',     code: 'LAB' },
  { name: 'Pharmacy',      code: 'PHM' },
  { name: 'Administration',code: 'ADM' },
];

// ---------------------------------------------------------------------------
//  3. Portfolio: minimal sample content
// ---------------------------------------------------------------------------
const SERVICES = [
  { slug: 'web-development',  title: 'Web Development',     summary: 'Static sites and SPAs that load instantly.', sort_order: 1 },
  { slug: 'seo-consulting',   title: 'SEO Consulting',      summary: 'Audit, keywords, and content strategy.',   sort_order: 2 },
  { slug: 'graphic-design',   title: 'Graphic Design',      summary: 'Brand identity, social, and print.',         sort_order: 3 },
  { slug: 'hospital-it',      title: 'Hospital IT',         summary: 'OPD, billing, pharmacy, lab modules.',       sort_order: 4 },
  { slug: 'photography',      title: 'Photography',         summary: 'Product, event, and portfolio shoots.',      sort_order: 5 },
  { slug: 'workshop',         title: 'Workshops',           summary: 'Hands-on training for students and teams.',  sort_order: 6 },
  { slug: 'automation',       title: 'Automation',          summary: 'Scripts, bots, and workflow tools.',         sort_order: 7 },
  { slug: 'automotive',       title: 'Automotive Content',  summary: 'EV reviews, comparisons, buying guides.',    sort_order: 8 },
  { slug: 'electrical',       title: 'Electrical',          summary: 'Wiring tutorials, energy-saving guides.',    sort_order: 9 },
];

function getClient() {
  const BASE_URL = (process.env.INSFORGE_BASE_URL ?? '').replace(/\/$/, '');
  const API_KEY  = process.env.INSFORGE_API_KEY ?? '';
  if (!BASE_URL || !API_KEY) {
    throw new Error('INSFORGE_BASE_URL and INSFORGE_API_KEY must be set in .env');
  }
  return createClient({ baseUrl: BASE_URL, anonKey: API_KEY });
}

async function tableExists(db, name) {
  const { data, error } = await db.database
    .from(name)
    .select('*')
    .limit(1);
  if (error) return false;
  return Array.isArray(data);
}

async function seedRolePermissions(db) {
  console.log(`→ role_permissions (${ROLE_PERMISSIONS.length} rows)`);
  if (!(await tableExists(db, 'auth_role_permissions'))) {
    console.error('  ! run db-migrate-insforge.mjs first');
    return 0;
  }
  const CHUNK = 25;
  let attempted = 0;
  for (let i = 0; i < ROLE_PERMISSIONS.length; i += CHUNK) {
    const chunk = ROLE_PERMISSIONS.slice(i, i + CHUNK).map(([role, resource, action]) => ({
      role, resource, action,
    }));
    const { error } = await db.database.from('auth_role_permissions').insert(chunk);
    if (error) {
      if (/duplicate|unique|conflict|already/i.test(error.message)) {
        attempted += chunk.length; // already there
        continue;
      }
      console.error(`  ! chunk failed: ${error.message}`);
    } else {
      attempted += chunk.length;
    }
  }
  console.log(`  ✓ processed ${attempted} (duplicates skipped)`);
  return attempted;
}

async function seedDepartments(db) {
  console.log(`→ seniority_departments (${DEPARTMENTS.length} rows)`);
  if (!(await tableExists(db, 'seniority_departments'))) {
    console.error('  ! table missing — run migrate first');
    return 0;
  }
  const { data, error } = await db.database.from('seniority_departments').insert(DEPARTMENTS).select();
  if (error && !/duplicate|unique|conflict|already/i.test(error.message)) {
    console.error(`  ! ${error.message}`);
    return 0;
  }
  return Array.isArray(data) ? data.length : DEPARTMENTS.length;
}

async function seedServices(db) {
  console.log(`→ portfolio_services (${SERVICES.length} rows)`);
  if (!(await tableExists(db, 'portfolio_services'))) {
    console.error('  ! table missing — run migrate first');
    return 0;
  }
  const { data, error } = await db.database.from('portfolio_services').insert(SERVICES).select();
  if (error && !/duplicate|unique|conflict|already/i.test(error.message)) {
    console.error(`  ! ${error.message}`);
    return 0;
  }
  return Array.isArray(data) ? data.length : SERVICES.length;
}

export async function runSeed() {
  console.log('db-seed-insforge starting…');
  try {
    const db = getClient();
    await seedRolePermissions(db);
    await seedDepartments(db);
    await seedServices(db);
    console.log('All seeds done.');
  } catch (err) {
    console.error('FATAL:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isMain) {
  runSeed();
}
