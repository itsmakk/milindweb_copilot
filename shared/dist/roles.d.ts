import { z } from 'zod';
export declare const ROLES: readonly ["super_admin", "portfolio_admin", "portfolio_editor", "seniority_admin", "seniority_editor", "seniority_viewer", "hospital_admin", "hospital_doctor", "hospital_receptionist", "hospital_nurse", "hospital_pharmacist", "hospital_lab_staff", "hospital_radiology_staff", "hospital_accountant", "hospital_viewer"];
export type Role = (typeof ROLES)[number];
export declare const TENANTS: readonly ["portfolio", "seniority", "hospital"];
export type Tenant = (typeof TENANTS)[number] | null;
export declare const RoleSchema: z.ZodEnum<["super_admin", "portfolio_admin", "portfolio_editor", "seniority_admin", "seniority_editor", "seniority_viewer", "hospital_admin", "hospital_doctor", "hospital_receptionist", "hospital_nurse", "hospital_pharmacist", "hospital_lab_staff", "hospital_radiology_staff", "hospital_accountant", "hospital_viewer"]>;
export declare const TenantSchema: z.ZodUnion<[z.ZodEnum<["portfolio", "seniority", "hospital"]>, z.ZodNull]>;
//# sourceMappingURL=roles.d.ts.map