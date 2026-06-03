"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportRecordSchema = exports.ExportRequestSchema = exports.UpdateSeniorityRuleSchema = exports.CreateSeniorityRuleSchema = exports.SeniorityRuleSchema = exports.ALLOWED_FORMULA_FIELDS = exports.LeaveListQuerySchema = exports.DecideLeaveSchema = exports.CreateLeaveSchema = exports.LeaveSchema = exports.EmployeeListQuerySchema = exports.UpdateEmployeeSchema = exports.CreateEmployeeSchema = exports.EmployeeSchema = exports.QualificationSchema = exports.UpdateDepartmentSchema = exports.CreateDepartmentSchema = exports.DepartmentSchema = exports.EXPORT_FORMATS = exports.LEAVE_STATUSES = exports.LEAVE_TYPES = exports.EMPLOYEE_STATUSES = exports.GENDERS = void 0;
const zod_1 = require("zod");
/* =========================================================
 *  Enums
 * ========================================================= */
exports.GENDERS = ['male', 'female', 'other'];
exports.EMPLOYEE_STATUSES = [
    'active',
    'on_leave',
    'suspended',
    'retired',
    'resigned',
    'terminated',
];
exports.LEAVE_TYPES = [
    'casual',
    'sick',
    'earned',
    'unpaid',
    'compensatory',
    'maternity',
    'paternity',
    'other',
];
exports.LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];
exports.EXPORT_FORMATS = ['csv', 'xlsx', 'pdf'];
/* =========================================================
 *  Departments
 * ========================================================= */
exports.DepartmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string().min(1).max(32),
    name: zod_1.z.string().min(1).max(128),
    parentId: zod_1.z.string().uuid().nullable(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.CreateDepartmentSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).max(32),
    name: zod_1.z.string().min(1).max(128),
    parentId: zod_1.z.string().uuid().nullable().optional(),
});
exports.UpdateDepartmentSchema = exports.CreateDepartmentSchema.partial();
/* =========================================================
 *  Employees
 * ========================================================= */
exports.QualificationSchema = zod_1.z.object({
    degree: zod_1.z.string().min(1),
    institution: zod_1.z.string().min(1),
    year: zod_1.z.number().int().min(1900).max(2100).optional(),
    specialization: zod_1.z.string().optional(),
});
exports.EmployeeSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    empCode: zod_1.z.string().min(1).max(32),
    fullName: zod_1.z.string().min(1).max(128),
    gender: zod_1.z.enum(exports.GENDERS).nullable(),
    dob: zod_1.z.string().date().nullable(),
    doj: zod_1.z.string().date(),
    dateOfRegular: zod_1.z.string().date().nullable(),
    dateOfRetirement: zod_1.z.string().date().nullable(),
    departmentId: zod_1.z.string().uuid(),
    departmentCode: zod_1.z.string().optional(),
    departmentName: zod_1.z.string().optional(),
    designation: zod_1.z.string().min(1).max(128),
    grade: zod_1.z.string().nullable(),
    cadre: zod_1.z.string().nullable(),
    status: zod_1.z.enum(exports.EMPLOYEE_STATUSES),
    email: zod_1.z.string().email().nullable(),
    phone: zod_1.z.string().nullable(),
    address: zod_1.z.string().nullable(),
    qualifications: zod_1.z.array(exports.QualificationSchema),
    seniorityNumber: zod_1.z.number().int().nullable(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.CreateEmployeeSchema = zod_1.z.object({
    empCode: zod_1.z.string().min(1).max(32),
    fullName: zod_1.z.string().min(1).max(128),
    gender: zod_1.z.enum(exports.GENDERS).optional(),
    dob: zod_1.z.string().date().optional(),
    doj: zod_1.z.string().date(),
    dateOfRegular: zod_1.z.string().date().optional(),
    dateOfRetirement: zod_1.z.string().date().optional(),
    departmentId: zod_1.z.string().uuid(),
    designation: zod_1.z.string().min(1).max(128),
    grade: zod_1.z.string().max(32).optional(),
    cadre: zod_1.z.string().max(32).optional(),
    status: zod_1.z.enum(exports.EMPLOYEE_STATUSES).default('active'),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().max(32).optional(),
    address: zod_1.z.string().max(512).optional(),
    qualifications: zod_1.z.array(exports.QualificationSchema).default([]),
});
exports.UpdateEmployeeSchema = exports.CreateEmployeeSchema.partial();
exports.EmployeeListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(200).default(50),
    q: zod_1.z.string().trim().max(128).optional(),
    sort: zod_1.z.string().trim().max(64).optional(),
    departmentId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(exports.EMPLOYEE_STATUSES).optional(),
    cadre: zod_1.z.string().max(32).optional(),
    grade: zod_1.z.string().max(32).optional(),
    includeDeleted: zod_1.z
        .union([zod_1.z.literal('true'), zod_1.z.literal('false')])
        .transform((v) => v === 'true')
        .optional(),
});
/* =========================================================
 *  Leave
 * ========================================================= */
exports.LeaveSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    employeeId: zod_1.z.string().uuid(),
    leaveType: zod_1.z.enum(exports.LEAVE_TYPES),
    fromDate: zod_1.z.string().date(),
    toDate: zod_1.z.string().date(),
    days: zod_1.z.number().nonnegative(),
    reason: zod_1.z.string().nullable(),
    status: zod_1.z.enum(exports.LEAVE_STATUSES),
    approvedBy: zod_1.z.string().uuid().nullable(),
    approvedAt: zod_1.z.string().datetime().nullable(),
    decisionNote: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.CreateLeaveSchema = zod_1.z
    .object({
    employeeId: zod_1.z.string().uuid(),
    leaveType: zod_1.z.enum(exports.LEAVE_TYPES),
    fromDate: zod_1.z.string().date(),
    toDate: zod_1.z.string().date(),
    days: zod_1.z.number().nonnegative().optional(),
    reason: zod_1.z.string().max(512).optional(),
})
    .refine((v) => v.fromDate <= v.toDate, {
    message: 'fromDate must be on or before toDate',
    path: ['toDate'],
});
exports.DecideLeaveSchema = zod_1.z.object({
    status: zod_1.z.enum(['approved', 'rejected']),
    decisionNote: zod_1.z.string().max(512).optional(),
});
exports.LeaveListQuerySchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(exports.LEAVE_STATUSES).optional(),
    fromDate: zod_1.z.string().date().optional(),
    toDate: zod_1.z.string().date().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(200).default(50),
});
/* =========================================================
 *  Seniority rules
 * ========================================================= */
exports.ALLOWED_FORMULA_FIELDS = [
    'full_name',
    'doj',
    'date_of_regular',
    'dob',
    'grade',
    'cadre',
    'designation',
    'seniority_number',
    'emp_code',
];
exports.SeniorityRuleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(128),
    description: zod_1.z.string().nullable(),
    formula: zod_1.z.string().min(1),
    isActive: zod_1.z.boolean(),
    effectiveFrom: zod_1.z.string().date(),
    effectiveTo: zod_1.z.string().date().nullable(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.CreateSeniorityRuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(128),
    description: zod_1.z.string().max(512).optional(),
    formula: zod_1.z.string().min(3).max(512),
    isActive: zod_1.z.boolean().default(false),
    effectiveFrom: zod_1.z.string().date(),
    effectiveTo: zod_1.z.string().date().optional(),
});
exports.UpdateSeniorityRuleSchema = exports.CreateSeniorityRuleSchema.partial();
/* =========================================================
 *  Exports
 * ========================================================= */
exports.ExportRequestSchema = zod_1.z.object({
    format: zod_1.z.enum(exports.EXPORT_FORMATS),
    filter: exports.EmployeeListQuerySchema.partial().optional(),
});
exports.ExportRecordSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    generatedBy: zod_1.z.string().uuid(),
    format: zod_1.z.enum(exports.EXPORT_FORMATS),
    filter: zod_1.z.record(zod_1.z.unknown()),
    rowCount: zod_1.z.number().int().nullable(),
    fileUrl: zod_1.z.string().nullable(),
    byteSize: zod_1.z.number().int().nullable(),
    status: zod_1.z.enum(['pending', 'ready', 'failed', 'expired']),
    error: zod_1.z.string().nullable(),
    generatedAt: zod_1.z.string().datetime(),
    expiresAt: zod_1.z.string().datetime().nullable(),
});
//# sourceMappingURL=seniority.js.map