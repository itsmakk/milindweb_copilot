import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    authId: z.ZodString;
    email: z.ZodString;
    displayName: z.ZodString;
    avatarUrl: z.ZodNullable<z.ZodString>;
    role: z.ZodEnum<["super_admin", "portfolio_admin", "portfolio_editor", "seniority_admin", "seniority_editor", "seniority_viewer", "hospital_admin", "hospital_doctor", "hospital_receptionist", "hospital_nurse", "hospital_pharmacist", "hospital_lab_staff", "hospital_radiology_staff", "hospital_accountant", "hospital_viewer"]>;
    tenant: z.ZodUnion<[z.ZodEnum<["portfolio", "seniority", "hospital"]>, z.ZodNull]>;
    isActive: z.ZodBoolean;
    lastLoginAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    email: string;
    authId: string;
    displayName: string;
    avatarUrl: string | null;
    role: "super_admin" | "portfolio_admin" | "portfolio_editor" | "seniority_admin" | "seniority_editor" | "seniority_viewer" | "hospital_admin" | "hospital_doctor" | "hospital_receptionist" | "hospital_nurse" | "hospital_pharmacist" | "hospital_lab_staff" | "hospital_radiology_staff" | "hospital_accountant" | "hospital_viewer";
    tenant: "portfolio" | "seniority" | "hospital" | null;
    lastLoginAt: string | null;
}, {
    id: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    email: string;
    authId: string;
    displayName: string;
    avatarUrl: string | null;
    role: "super_admin" | "portfolio_admin" | "portfolio_editor" | "seniority_admin" | "seniority_editor" | "seniority_viewer" | "hospital_admin" | "hospital_doctor" | "hospital_receptionist" | "hospital_nurse" | "hospital_pharmacist" | "hospital_lab_staff" | "hospital_radiology_staff" | "hospital_accountant" | "hospital_viewer";
    tenant: "portfolio" | "seniority" | "hospital" | null;
    lastLoginAt: string | null;
}>;
export type User = z.infer<typeof UserSchema>;
export declare const PublicUserSchema: z.ZodObject<Pick<{
    id: z.ZodString;
    authId: z.ZodString;
    email: z.ZodString;
    displayName: z.ZodString;
    avatarUrl: z.ZodNullable<z.ZodString>;
    role: z.ZodEnum<["super_admin", "portfolio_admin", "portfolio_editor", "seniority_admin", "seniority_editor", "seniority_viewer", "hospital_admin", "hospital_doctor", "hospital_receptionist", "hospital_nurse", "hospital_pharmacist", "hospital_lab_staff", "hospital_radiology_staff", "hospital_accountant", "hospital_viewer"]>;
    tenant: z.ZodUnion<[z.ZodEnum<["portfolio", "seniority", "hospital"]>, z.ZodNull]>;
    isActive: z.ZodBoolean;
    lastLoginAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "id" | "isActive" | "email" | "displayName" | "avatarUrl" | "role" | "tenant" | "lastLoginAt">, "strip", z.ZodTypeAny, {
    id: string;
    isActive: boolean;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    role: "super_admin" | "portfolio_admin" | "portfolio_editor" | "seniority_admin" | "seniority_editor" | "seniority_viewer" | "hospital_admin" | "hospital_doctor" | "hospital_receptionist" | "hospital_nurse" | "hospital_pharmacist" | "hospital_lab_staff" | "hospital_radiology_staff" | "hospital_accountant" | "hospital_viewer";
    tenant: "portfolio" | "seniority" | "hospital" | null;
    lastLoginAt: string | null;
}, {
    id: string;
    isActive: boolean;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    role: "super_admin" | "portfolio_admin" | "portfolio_editor" | "seniority_admin" | "seniority_editor" | "seniority_viewer" | "hospital_admin" | "hospital_doctor" | "hospital_receptionist" | "hospital_nurse" | "hospital_pharmacist" | "hospital_lab_staff" | "hospital_radiology_staff" | "hospital_accountant" | "hospital_viewer";
    tenant: "portfolio" | "seniority" | "hospital" | null;
    lastLoginAt: string | null;
}>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
//# sourceMappingURL=user.d.ts.map