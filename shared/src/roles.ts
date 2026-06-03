import { z } from 'zod';

export const ROLES = [
  'super_admin',
  'portfolio_admin',
  'portfolio_editor',
  'seniority_admin',
  'seniority_editor',
  'seniority_viewer',
  'hospital_admin',
  'hospital_doctor',
  'hospital_receptionist',
  'hospital_nurse',
  'hospital_pharmacist',
  'hospital_lab_staff',
  'hospital_radiology_staff',
  'hospital_accountant',
  'hospital_viewer',
] as const;

export type Role = (typeof ROLES)[number];

export const TENANTS = ['portfolio', 'seniority', 'hospital'] as const;
export type Tenant = (typeof TENANTS)[number] | null;

export const RoleSchema = z.enum(ROLES);
export const TenantSchema = z.union([z.enum(TENANTS), z.null()]);
