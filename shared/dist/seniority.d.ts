import { z } from 'zod';
export declare const GENDERS: readonly ["male", "female", "other"];
export declare const EMPLOYEE_STATUSES: readonly ["active", "on_leave", "suspended", "retired", "resigned", "terminated"];
export declare const LEAVE_TYPES: readonly ["casual", "sick", "earned", "unpaid", "compensatory", "maternity", "paternity", "other"];
export declare const LEAVE_STATUSES: readonly ["pending", "approved", "rejected", "cancelled"];
export declare const EXPORT_FORMATS: readonly ["csv", "xlsx", "pdf"];
export declare const DepartmentSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    parentId: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    code: string;
    name: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
}, {
    id: string;
    code: string;
    name: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
}>;
export type Department = z.infer<typeof DepartmentSchema>;
export declare const CreateDepartmentSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    parentId?: string | null | undefined;
}, {
    code: string;
    name: string;
    parentId?: string | null | undefined;
}>;
export type CreateDepartment = z.infer<typeof CreateDepartmentSchema>;
export declare const UpdateDepartmentSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    code?: string | undefined;
    name?: string | undefined;
    parentId?: string | null | undefined;
}, {
    code?: string | undefined;
    name?: string | undefined;
    parentId?: string | null | undefined;
}>;
export type UpdateDepartment = z.infer<typeof UpdateDepartmentSchema>;
export declare const QualificationSchema: z.ZodObject<{
    degree: z.ZodString;
    institution: z.ZodString;
    year: z.ZodOptional<z.ZodNumber>;
    specialization: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    degree: string;
    institution: string;
    specialization?: string | undefined;
    year?: number | undefined;
}, {
    degree: string;
    institution: string;
    specialization?: string | undefined;
    year?: number | undefined;
}>;
export type Qualification = z.infer<typeof QualificationSchema>;
export declare const EmployeeSchema: z.ZodObject<{
    id: z.ZodString;
    empCode: z.ZodString;
    fullName: z.ZodString;
    gender: z.ZodNullable<z.ZodEnum<["male", "female", "other"]>>;
    dob: z.ZodNullable<z.ZodString>;
    doj: z.ZodString;
    dateOfRegular: z.ZodNullable<z.ZodString>;
    dateOfRetirement: z.ZodNullable<z.ZodString>;
    departmentId: z.ZodString;
    departmentCode: z.ZodOptional<z.ZodString>;
    departmentName: z.ZodOptional<z.ZodString>;
    designation: z.ZodString;
    grade: z.ZodNullable<z.ZodString>;
    cadre: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["active", "on_leave", "suspended", "retired", "resigned", "terminated"]>;
    email: z.ZodNullable<z.ZodString>;
    phone: z.ZodNullable<z.ZodString>;
    address: z.ZodNullable<z.ZodString>;
    qualifications: z.ZodArray<z.ZodObject<{
        degree: z.ZodString;
        institution: z.ZodString;
        year: z.ZodOptional<z.ZodNumber>;
        specialization: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        degree: string;
        institution: string;
        specialization?: string | undefined;
        year?: number | undefined;
    }, {
        degree: string;
        institution: string;
        specialization?: string | undefined;
        year?: number | undefined;
    }>, "many">;
    seniorityNumber: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "active" | "on_leave" | "suspended" | "retired" | "resigned" | "terminated";
    createdAt: string;
    updatedAt: string;
    departmentId: string;
    email: string | null;
    fullName: string;
    gender: "male" | "female" | "other" | null;
    dob: string | null;
    address: string | null;
    empCode: string;
    doj: string;
    dateOfRegular: string | null;
    dateOfRetirement: string | null;
    designation: string;
    grade: string | null;
    cadre: string | null;
    phone: string | null;
    qualifications: {
        degree: string;
        institution: string;
        specialization?: string | undefined;
        year?: number | undefined;
    }[];
    seniorityNumber: number | null;
    departmentCode?: string | undefined;
    departmentName?: string | undefined;
}, {
    id: string;
    status: "active" | "on_leave" | "suspended" | "retired" | "resigned" | "terminated";
    createdAt: string;
    updatedAt: string;
    departmentId: string;
    email: string | null;
    fullName: string;
    gender: "male" | "female" | "other" | null;
    dob: string | null;
    address: string | null;
    empCode: string;
    doj: string;
    dateOfRegular: string | null;
    dateOfRetirement: string | null;
    designation: string;
    grade: string | null;
    cadre: string | null;
    phone: string | null;
    qualifications: {
        degree: string;
        institution: string;
        specialization?: string | undefined;
        year?: number | undefined;
    }[];
    seniorityNumber: number | null;
    departmentCode?: string | undefined;
    departmentName?: string | undefined;
}>;
export type Employee = z.infer<typeof EmployeeSchema>;
export declare const CreateEmployeeSchema: z.ZodObject<{
    empCode: z.ZodString;
    fullName: z.ZodString;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    dob: z.ZodOptional<z.ZodString>;
    doj: z.ZodString;
    dateOfRegular: z.ZodOptional<z.ZodString>;
    dateOfRetirement: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodString;
    designation: z.ZodString;
    grade: z.ZodOptional<z.ZodString>;
    cadre: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["active", "on_leave", "suspended", "retired", "resigned", "terminated"]>>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    qualifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
        degree: z.ZodString;
        institution: z.ZodString;
        year: z.ZodOptional<z.ZodNumber>;
        specialization: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        degree: string;
        institution: string;
        specialization?: string | undefined;
        year?: number | undefined;
    }, {
        degree: string;
        institution: string;
        specialization?: string | undefined;
        year?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "on_leave" | "suspended" | "retired" | "resigned" | "terminated";
    departmentId: string;
    fullName: string;
    empCode: string;
    doj: string;
    designation: string;
    qualifications: {
        degree: string;
        institution: string;
        specialization?: string | undefined;
        year?: number | undefined;
    }[];
    email?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    dob?: string | undefined;
    address?: string | undefined;
    dateOfRegular?: string | undefined;
    dateOfRetirement?: string | undefined;
    grade?: string | undefined;
    cadre?: string | undefined;
    phone?: string | undefined;
}, {
    departmentId: string;
    fullName: string;
    empCode: string;
    doj: string;
    designation: string;
    status?: "active" | "on_leave" | "suspended" | "retired" | "resigned" | "terminated" | undefined;
    email?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    dob?: string | undefined;
    address?: string | undefined;
    dateOfRegular?: string | undefined;
    dateOfRetirement?: string | undefined;
    grade?: string | undefined;
    cadre?: string | undefined;
    phone?: string | undefined;
    qualifications?: {
        degree: string;
        institution: string;
        specialization?: string | undefined;
        year?: number | undefined;
    }[] | undefined;
}>;
export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
export declare const UpdateEmployeeSchema: z.ZodObject<{
    empCode: z.ZodOptional<z.ZodString>;
    fullName: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>>;
    dob: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    doj: z.ZodOptional<z.ZodString>;
    dateOfRegular: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    dateOfRetirement: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    departmentId: z.ZodOptional<z.ZodString>;
    designation: z.ZodOptional<z.ZodString>;
    grade: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    cadre: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["active", "on_leave", "suspended", "retired", "resigned", "terminated"]>>>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    qualifications: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        degree: z.ZodString;
        institution: z.ZodString;
        year: z.ZodOptional<z.ZodNumber>;
        specialization: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        degree: string;
        institution: string;
        specialization?: string | undefined;
        year?: number | undefined;
    }, {
        degree: string;
        institution: string;
        specialization?: string | undefined;
        year?: number | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "on_leave" | "suspended" | "retired" | "resigned" | "terminated" | undefined;
    departmentId?: string | undefined;
    email?: string | undefined;
    fullName?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    dob?: string | undefined;
    address?: string | undefined;
    empCode?: string | undefined;
    doj?: string | undefined;
    dateOfRegular?: string | undefined;
    dateOfRetirement?: string | undefined;
    designation?: string | undefined;
    grade?: string | undefined;
    cadre?: string | undefined;
    phone?: string | undefined;
    qualifications?: {
        degree: string;
        institution: string;
        specialization?: string | undefined;
        year?: number | undefined;
    }[] | undefined;
}, {
    status?: "active" | "on_leave" | "suspended" | "retired" | "resigned" | "terminated" | undefined;
    departmentId?: string | undefined;
    email?: string | undefined;
    fullName?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    dob?: string | undefined;
    address?: string | undefined;
    empCode?: string | undefined;
    doj?: string | undefined;
    dateOfRegular?: string | undefined;
    dateOfRetirement?: string | undefined;
    designation?: string | undefined;
    grade?: string | undefined;
    cadre?: string | undefined;
    phone?: string | undefined;
    qualifications?: {
        degree: string;
        institution: string;
        specialization?: string | undefined;
        year?: number | undefined;
    }[] | undefined;
}>;
export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;
export declare const EmployeeListQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    q: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "on_leave", "suspended", "retired", "resigned", "terminated"]>>;
    cadre: z.ZodOptional<z.ZodString>;
    grade: z.ZodOptional<z.ZodString>;
    includeDeleted: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodLiteral<"true">, z.ZodLiteral<"false">]>, boolean, "true" | "false">>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    sort?: string | undefined;
    status?: "active" | "on_leave" | "suspended" | "retired" | "resigned" | "terminated" | undefined;
    q?: string | undefined;
    departmentId?: string | undefined;
    grade?: string | undefined;
    cadre?: string | undefined;
    includeDeleted?: boolean | undefined;
}, {
    sort?: string | undefined;
    status?: "active" | "on_leave" | "suspended" | "retired" | "resigned" | "terminated" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    q?: string | undefined;
    departmentId?: string | undefined;
    grade?: string | undefined;
    cadre?: string | undefined;
    includeDeleted?: "true" | "false" | undefined;
}>;
export type EmployeeListQuery = z.infer<typeof EmployeeListQuerySchema>;
export declare const LeaveSchema: z.ZodObject<{
    id: z.ZodString;
    employeeId: z.ZodString;
    leaveType: z.ZodEnum<["casual", "sick", "earned", "unpaid", "compensatory", "maternity", "paternity", "other"]>;
    fromDate: z.ZodString;
    toDate: z.ZodString;
    days: z.ZodNumber;
    reason: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["pending", "approved", "rejected", "cancelled"]>;
    approvedBy: z.ZodNullable<z.ZodString>;
    approvedAt: z.ZodNullable<z.ZodString>;
    decisionNote: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "approved" | "rejected" | "cancelled";
    createdAt: string;
    updatedAt: string;
    employeeId: string;
    leaveType: "other" | "casual" | "sick" | "earned" | "unpaid" | "compensatory" | "maternity" | "paternity";
    fromDate: string;
    toDate: string;
    days: number;
    reason: string | null;
    approvedBy: string | null;
    approvedAt: string | null;
    decisionNote: string | null;
}, {
    id: string;
    status: "pending" | "approved" | "rejected" | "cancelled";
    createdAt: string;
    updatedAt: string;
    employeeId: string;
    leaveType: "other" | "casual" | "sick" | "earned" | "unpaid" | "compensatory" | "maternity" | "paternity";
    fromDate: string;
    toDate: string;
    days: number;
    reason: string | null;
    approvedBy: string | null;
    approvedAt: string | null;
    decisionNote: string | null;
}>;
export type Leave = z.infer<typeof LeaveSchema>;
export declare const CreateLeaveSchema: z.ZodEffects<z.ZodObject<{
    employeeId: z.ZodString;
    leaveType: z.ZodEnum<["casual", "sick", "earned", "unpaid", "compensatory", "maternity", "paternity", "other"]>;
    fromDate: z.ZodString;
    toDate: z.ZodString;
    days: z.ZodOptional<z.ZodNumber>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    leaveType: "other" | "casual" | "sick" | "earned" | "unpaid" | "compensatory" | "maternity" | "paternity";
    fromDate: string;
    toDate: string;
    days?: number | undefined;
    reason?: string | undefined;
}, {
    employeeId: string;
    leaveType: "other" | "casual" | "sick" | "earned" | "unpaid" | "compensatory" | "maternity" | "paternity";
    fromDate: string;
    toDate: string;
    days?: number | undefined;
    reason?: string | undefined;
}>, {
    employeeId: string;
    leaveType: "other" | "casual" | "sick" | "earned" | "unpaid" | "compensatory" | "maternity" | "paternity";
    fromDate: string;
    toDate: string;
    days?: number | undefined;
    reason?: string | undefined;
}, {
    employeeId: string;
    leaveType: "other" | "casual" | "sick" | "earned" | "unpaid" | "compensatory" | "maternity" | "paternity";
    fromDate: string;
    toDate: string;
    days?: number | undefined;
    reason?: string | undefined;
}>;
export type CreateLeave = z.infer<typeof CreateLeaveSchema>;
export declare const DecideLeaveSchema: z.ZodObject<{
    status: z.ZodEnum<["approved", "rejected"]>;
    decisionNote: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "approved" | "rejected";
    decisionNote?: string | undefined;
}, {
    status: "approved" | "rejected";
    decisionNote?: string | undefined;
}>;
export type DecideLeave = z.infer<typeof DecideLeaveSchema>;
export declare const LeaveListQuerySchema: z.ZodObject<{
    employeeId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected", "cancelled"]>>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    status?: "pending" | "approved" | "rejected" | "cancelled" | undefined;
    employeeId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    status?: "pending" | "approved" | "rejected" | "cancelled" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    employeeId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export type LeaveListQuery = z.infer<typeof LeaveListQuerySchema>;
export declare const ALLOWED_FORMULA_FIELDS: readonly ["full_name", "doj", "date_of_regular", "dob", "grade", "cadre", "designation", "seniority_number", "emp_code"];
export type AllowedFormulaField = (typeof ALLOWED_FORMULA_FIELDS)[number];
export declare const SeniorityRuleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    formula: z.ZodString;
    isActive: z.ZodBoolean;
    effectiveFrom: z.ZodString;
    effectiveTo: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    description: string | null;
    formula: string;
    effectiveFrom: string;
    effectiveTo: string | null;
}, {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    description: string | null;
    formula: string;
    effectiveFrom: string;
    effectiveTo: string | null;
}>;
export type SeniorityRule = z.infer<typeof SeniorityRuleSchema>;
export declare const CreateSeniorityRuleSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    formula: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
    effectiveFrom: z.ZodString;
    effectiveTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    formula: string;
    effectiveFrom: string;
    description?: string | undefined;
    effectiveTo?: string | undefined;
}, {
    name: string;
    formula: string;
    effectiveFrom: string;
    isActive?: boolean | undefined;
    description?: string | undefined;
    effectiveTo?: string | undefined;
}>;
export type CreateSeniorityRule = z.infer<typeof CreateSeniorityRuleSchema>;
export declare const UpdateSeniorityRuleSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    formula: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    effectiveFrom: z.ZodOptional<z.ZodString>;
    effectiveTo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    formula?: string | undefined;
    effectiveFrom?: string | undefined;
    effectiveTo?: string | undefined;
}, {
    name?: string | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    formula?: string | undefined;
    effectiveFrom?: string | undefined;
    effectiveTo?: string | undefined;
}>;
export type UpdateSeniorityRule = z.infer<typeof UpdateSeniorityRuleSchema>;
export declare const ExportRequestSchema: z.ZodObject<{
    format: z.ZodEnum<["csv", "xlsx", "pdf"]>;
    filter: z.ZodOptional<z.ZodObject<{
        page: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        pageSize: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        q: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        sort: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        departmentId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        status: z.ZodOptional<z.ZodOptional<z.ZodEnum<["active", "on_leave", "suspended", "retired", "resigned", "terminated"]>>>;
        cadre: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        grade: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        includeDeleted: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodLiteral<"true">, z.ZodLiteral<"false">]>, boolean, "true" | "false">>>;
    }, "strip", z.ZodTypeAny, {
        sort?: string | undefined;
        status?: "active" | "on_leave" | "suspended" | "retired" | "resigned" | "terminated" | undefined;
        page?: number | undefined;
        pageSize?: number | undefined;
        q?: string | undefined;
        departmentId?: string | undefined;
        grade?: string | undefined;
        cadre?: string | undefined;
        includeDeleted?: boolean | undefined;
    }, {
        sort?: string | undefined;
        status?: "active" | "on_leave" | "suspended" | "retired" | "resigned" | "terminated" | undefined;
        page?: number | undefined;
        pageSize?: number | undefined;
        q?: string | undefined;
        departmentId?: string | undefined;
        grade?: string | undefined;
        cadre?: string | undefined;
        includeDeleted?: "true" | "false" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    format: "csv" | "xlsx" | "pdf";
    filter?: {
        sort?: string | undefined;
        status?: "active" | "on_leave" | "suspended" | "retired" | "resigned" | "terminated" | undefined;
        page?: number | undefined;
        pageSize?: number | undefined;
        q?: string | undefined;
        departmentId?: string | undefined;
        grade?: string | undefined;
        cadre?: string | undefined;
        includeDeleted?: boolean | undefined;
    } | undefined;
}, {
    format: "csv" | "xlsx" | "pdf";
    filter?: {
        sort?: string | undefined;
        status?: "active" | "on_leave" | "suspended" | "retired" | "resigned" | "terminated" | undefined;
        page?: number | undefined;
        pageSize?: number | undefined;
        q?: string | undefined;
        departmentId?: string | undefined;
        grade?: string | undefined;
        cadre?: string | undefined;
        includeDeleted?: "true" | "false" | undefined;
    } | undefined;
}>;
export type ExportRequest = z.infer<typeof ExportRequestSchema>;
export declare const ExportRecordSchema: z.ZodObject<{
    id: z.ZodString;
    generatedBy: z.ZodString;
    format: z.ZodEnum<["csv", "xlsx", "pdf"]>;
    filter: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    rowCount: z.ZodNullable<z.ZodNumber>;
    fileUrl: z.ZodNullable<z.ZodString>;
    byteSize: z.ZodNullable<z.ZodNumber>;
    status: z.ZodEnum<["pending", "ready", "failed", "expired"]>;
    error: z.ZodNullable<z.ZodString>;
    generatedAt: z.ZodString;
    expiresAt: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    filter: Record<string, unknown>;
    status: "pending" | "ready" | "failed" | "expired";
    format: "csv" | "xlsx" | "pdf";
    generatedBy: string;
    rowCount: number | null;
    fileUrl: string | null;
    byteSize: number | null;
    error: string | null;
    generatedAt: string;
    expiresAt: string | null;
}, {
    id: string;
    filter: Record<string, unknown>;
    status: "pending" | "ready" | "failed" | "expired";
    format: "csv" | "xlsx" | "pdf";
    generatedBy: string;
    rowCount: number | null;
    fileUrl: string | null;
    byteSize: number | null;
    error: string | null;
    generatedAt: string;
    expiresAt: string | null;
}>;
export type ExportRecord = z.infer<typeof ExportRecordSchema>;
//# sourceMappingURL=seniority.d.ts.map