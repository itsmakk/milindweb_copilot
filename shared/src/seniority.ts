import { z } from 'zod';

/* =========================================================
 *  Enums
 * ========================================================= */

export const GENDERS = ['male', 'female', 'other'] as const;
export const EMPLOYEE_STATUSES = [
  'active',
  'on_leave',
  'suspended',
  'retired',
  'resigned',
  'terminated',
] as const;
export const LEAVE_TYPES = [
  'casual',
  'sick',
  'earned',
  'unpaid',
  'compensatory',
  'maternity',
  'paternity',
  'other',
] as const;
export const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const;
export const EXPORT_FORMATS = ['csv', 'xlsx', 'pdf'] as const;

/* =========================================================
 *  Departments
 * ========================================================= */

export const DepartmentSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(128),
  parentId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Department = z.infer<typeof DepartmentSchema>;

export const CreateDepartmentSchema = z.object({
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(128),
  parentId: z.string().uuid().nullable().optional(),
});
export type CreateDepartment = z.infer<typeof CreateDepartmentSchema>;

export const UpdateDepartmentSchema = CreateDepartmentSchema.partial();
export type UpdateDepartment = z.infer<typeof UpdateDepartmentSchema>;

/* =========================================================
 *  Employees
 * ========================================================= */

export const QualificationSchema = z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  year: z.number().int().min(1900).max(2100).optional(),
  specialization: z.string().optional(),
});
export type Qualification = z.infer<typeof QualificationSchema>;

export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  empCode: z.string().min(1).max(32),
  fullName: z.string().min(1).max(128),
  gender: z.enum(GENDERS).nullable(),
  dob: z.string().date().nullable(),
  doj: z.string().date(),
  dateOfRegular: z.string().date().nullable(),
  dateOfRetirement: z.string().date().nullable(),
  departmentId: z.string().uuid(),
  departmentCode: z.string().optional(),
  departmentName: z.string().optional(),
  designation: z.string().min(1).max(128),
  grade: z.string().nullable(),
  cadre: z.string().nullable(),
  status: z.enum(EMPLOYEE_STATUSES),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  qualifications: z.array(QualificationSchema),
  seniorityNumber: z.number().int().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Employee = z.infer<typeof EmployeeSchema>;

export const CreateEmployeeSchema = z.object({
  empCode: z.string().min(1).max(32),
  fullName: z.string().min(1).max(128),
  gender: z.enum(GENDERS).optional(),
  dob: z.string().date().optional(),
  doj: z.string().date(),
  dateOfRegular: z.string().date().optional(),
  dateOfRetirement: z.string().date().optional(),
  departmentId: z.string().uuid(),
  designation: z.string().min(1).max(128),
  grade: z.string().max(32).optional(),
  cadre: z.string().max(32).optional(),
  status: z.enum(EMPLOYEE_STATUSES).default('active'),
  email: z.string().email().optional(),
  phone: z.string().max(32).optional(),
  address: z.string().max(512).optional(),
  qualifications: z.array(QualificationSchema).default([]),
});
export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial();
export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;

export const EmployeeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
  q: z.string().trim().max(128).optional(),
  sort: z.string().trim().max(64).optional(),
  departmentId: z.string().uuid().optional(),
  status: z.enum(EMPLOYEE_STATUSES).optional(),
  cadre: z.string().max(32).optional(),
  grade: z.string().max(32).optional(),
  includeDeleted: z
    .union([z.literal('true'), z.literal('false')])
    .transform((v) => v === 'true')
    .optional(),
});
export type EmployeeListQuery = z.infer<typeof EmployeeListQuerySchema>;

/* =========================================================
 *  Leave
 * ========================================================= */

export const LeaveSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().uuid(),
  leaveType: z.enum(LEAVE_TYPES),
  fromDate: z.string().date(),
  toDate: z.string().date(),
  days: z.number().nonnegative(),
  reason: z.string().nullable(),
  status: z.enum(LEAVE_STATUSES),
  approvedBy: z.string().uuid().nullable(),
  approvedAt: z.string().datetime().nullable(),
  decisionNote: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Leave = z.infer<typeof LeaveSchema>;

export const CreateLeaveSchema = z
  .object({
    employeeId: z.string().uuid(),
    leaveType: z.enum(LEAVE_TYPES),
    fromDate: z.string().date(),
    toDate: z.string().date(),
    days: z.number().nonnegative().optional(),
    reason: z.string().max(512).optional(),
  })
  .refine((v) => v.fromDate <= v.toDate, {
    message: 'fromDate must be on or before toDate',
    path: ['toDate'],
  });
export type CreateLeave = z.infer<typeof CreateLeaveSchema>;

export const DecideLeaveSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  decisionNote: z.string().max(512).optional(),
});
export type DecideLeave = z.infer<typeof DecideLeaveSchema>;

export const LeaveListQuerySchema = z.object({
  employeeId: z.string().uuid().optional(),
  status: z.enum(LEAVE_STATUSES).optional(),
  fromDate: z.string().date().optional(),
  toDate: z.string().date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});
export type LeaveListQuery = z.infer<typeof LeaveListQuerySchema>;

/* =========================================================
 *  Seniority rules
 * ========================================================= */

export const ALLOWED_FORMULA_FIELDS = [
  'full_name',
  'doj',
  'date_of_regular',
  'dob',
  'grade',
  'cadre',
  'designation',
  'seniority_number',
  'emp_code',
] as const;
export type AllowedFormulaField = (typeof ALLOWED_FORMULA_FIELDS)[number];

export const SeniorityRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(128),
  description: z.string().nullable(),
  formula: z.string().min(1),
  isActive: z.boolean(),
  effectiveFrom: z.string().date(),
  effectiveTo: z.string().date().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type SeniorityRule = z.infer<typeof SeniorityRuleSchema>;

export const CreateSeniorityRuleSchema = z.object({
  name: z.string().min(1).max(128),
  description: z.string().max(512).optional(),
  formula: z.string().min(3).max(512),
  isActive: z.boolean().default(false),
  effectiveFrom: z.string().date(),
  effectiveTo: z.string().date().optional(),
});
export type CreateSeniorityRule = z.infer<typeof CreateSeniorityRuleSchema>;

export const UpdateSeniorityRuleSchema = CreateSeniorityRuleSchema.partial();
export type UpdateSeniorityRule = z.infer<typeof UpdateSeniorityRuleSchema>;

/* =========================================================
 *  Exports
 * ========================================================= */

export const ExportRequestSchema = z.object({
  format: z.enum(EXPORT_FORMATS),
  filter: EmployeeListQuerySchema.partial().optional(),
});
export type ExportRequest = z.infer<typeof ExportRequestSchema>;

export const ExportRecordSchema = z.object({
  id: z.string().uuid(),
  generatedBy: z.string().uuid(),
  format: z.enum(EXPORT_FORMATS),
  filter: z.record(z.unknown()),
  rowCount: z.number().int().nullable(),
  fileUrl: z.string().nullable(),
  byteSize: z.number().int().nullable(),
  status: z.enum(['pending', 'ready', 'failed', 'expired']),
  error: z.string().nullable(),
  generatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
});
export type ExportRecord = z.infer<typeof ExportRecordSchema>;
