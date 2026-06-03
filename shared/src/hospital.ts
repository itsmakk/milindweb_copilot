import { z } from 'zod';

// ---------------------------------------------------------------------------
//  Enums
// ---------------------------------------------------------------------------
export const GenderSchema = z.enum(['Male', 'Female', 'Other']);
export const MaritalStatusSchema = z.enum(['Single', 'Married', 'Divorced', 'Widowed']);
export const EffectAfterTreatmentSchema = z.enum(['Recovered', 'No Change', 'Worsened', 'Follow-up Required', 'NA']);

// ---------------------------------------------------------------------------
//  Department
// ---------------------------------------------------------------------------
export const DepartmentSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  parentId: z.string().uuid().nullable(),
  defaultSymptoms: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  isDeleted: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  updatedBy: z.string(),
});
export type Department = z.infer<typeof DepartmentSchema>;

export const CreateDepartmentSchema = DepartmentSchema.omit({
  id: true, isDeleted: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true,
}).partial({ parentId: true, defaultSymptoms: true, isActive: true, sortOrder: true });
export type CreateDepartment = z.infer<typeof CreateDepartmentSchema>;

export const UpdateDepartmentSchema = CreateDepartmentSchema.partial();
export type UpdateDepartment = z.infer<typeof UpdateDepartmentSchema>;

export const DepartmentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(50),
  q: z.string().optional(),
  active: z.coerce.boolean().optional(),
});
export type DepartmentListQuery = z.infer<typeof DepartmentListQuerySchema>;

// ---------------------------------------------------------------------------
//  Doctor
// ---------------------------------------------------------------------------
export const DoctorSchema = z.object({
  id: z.string().uuid(),
  code: z.string().nullable(),
  name: z.string().min(1).max(120),
  qualification: z.string().nullable(),
  registrationNo: z.string().nullable(),
  departmentId: z.string().uuid().nullable(),
  specialization: z.string().nullable(),
  mobile: z.string().nullable(),
  email: z.string().email().nullable(),
  consultationFee: z.number().nullable(),
  signatureUrl: z.string().url().nullable(),
  isActive: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  updatedBy: z.string(),
});
export type Doctor = z.infer<typeof DoctorSchema>;

export const CreateDoctorSchema = DoctorSchema.omit({
  id: true, isDeleted: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true,
}).partial({
  code: true, qualification: true, registrationNo: true, departmentId: true,
  specialization: true, mobile: true, email: true, consultationFee: true,
  signatureUrl: true, isActive: true,
});
export type CreateDoctor = z.infer<typeof CreateDoctorSchema>;

export const UpdateDoctorSchema = CreateDoctorSchema.partial();
export type UpdateDoctor = z.infer<typeof UpdateDoctorSchema>;

export const DoctorListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(50),
  q: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  active: z.coerce.boolean().optional(),
});
export type DoctorListQuery = z.infer<typeof DoctorListQuerySchema>;

// ---------------------------------------------------------------------------
//  Patient
// ---------------------------------------------------------------------------
const SymptomSchema = z.object({
  name: z.string().min(1),
  duration: z.string().optional(),
  notes: z.string().optional(),
});
export const Symptom = SymptomSchema;
export type Symptom = z.infer<typeof SymptomSchema>;

export const PatientSchema = z.object({
  id: z.string().uuid(),
  uhid: z.string().min(1).max(40),
  fullName: z.string().min(1).max(120),
  gender: GenderSchema,
  dob: z.string().nullable(),
  age: z.number().int().nullable(),
  mobile: z.string().nullable(),
  email: z.string().email().nullable(),
  address: z.string().nullable(),
  bloodGroup: z.string().nullable(),
  occupation: z.string().nullable(),
  aadhaar: z.string().nullable(),
  emergencyContact: z.string().nullable(),
  maritalStatus: MaritalStatusSchema.nullable(),
  allergies: z.array(z.string()).default([]),
  chronicDiseases: z.array(z.string()).default([]),
  familyHistory: z.array(z.string()).default([]),
  surgicalHistory: z.array(z.string()).default([]),
  currentMedications: z.array(z.string()).default([]),
  isDeleted: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  updatedBy: z.string(),
});
export type Patient = z.infer<typeof PatientSchema>;

export const CreatePatientSchema = PatientSchema.omit({
  id: true, isDeleted: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true,
}).partial({
  dob: true, age: true, mobile: true, email: true, address: true, bloodGroup: true,
  occupation: true, aadhaar: true, emergencyContact: true, maritalStatus: true,
  allergies: true, chronicDiseases: true, familyHistory: true,
  surgicalHistory: true, currentMedications: true,
});
export type CreatePatient = z.infer<typeof CreatePatientSchema>;

export const UpdatePatientSchema = CreatePatientSchema.partial();
export type UpdatePatient = z.infer<typeof UpdatePatientSchema>;

export const PatientListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(50),
  q: z.string().optional(),                // matches name / mobile / uhid
  gender: GenderSchema.optional(),
});
export type PatientListQuery = z.infer<typeof PatientListQuerySchema>;

// ---------------------------------------------------------------------------
//  OPD Visit
// ---------------------------------------------------------------------------
export const OpdVisitSchema = z.object({
  id: z.string().uuid(),
  opdNo: z.string().min(1).max(40),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid().nullable(),
  departmentId: z.string().uuid().nullable(),
  visitDate: z.string(),                   // YYYY-MM-DD
  weightKg: z.number().nullable(),
  bp: z.string().nullable(),
  pulse: z.number().int().nullable(),
  respiratoryRate: z.number().int().nullable(),
  spo2: z.number().int().nullable(),
  tempF: z.number().nullable(),
  sugarMgDl: z.number().int().nullable(),
  chiefComplaints: z.array(SymptomSchema).default([]),
  provisionalDiagnosis: z.string().nullable(),
  investigationsAdvised: z.string().nullable(),
  investigationReports: z.string().nullable(),
  finalDiagnosis: z.string().nullable(),
  advice: z.string().nullable(),
  effectAfterTreatment: EffectAfterTreatmentSchema.nullable(),
  doctorFee: z.number().nullable(),
  doctorRemarks: z.string().nullable(),
  isDeleted: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  updatedBy: z.string(),
});
export type OpdVisit = z.infer<typeof OpdVisitSchema>;

export const CreateOpdVisitSchema = OpdVisitSchema.omit({
  id: true, opdNo: true, isDeleted: true,
  createdAt: true, updatedAt: true, createdBy: true, updatedBy: true,
}).partial({
  doctorId: true, departmentId: true,
  weightKg: true, bp: true, pulse: true, respiratoryRate: true, spo2: true,
  tempF: true, sugarMgDl: true, chiefComplaints: true,
  provisionalDiagnosis: true, investigationsAdvised: true, investigationReports: true,
  finalDiagnosis: true, advice: true, effectAfterTreatment: true,
  doctorFee: true, doctorRemarks: true,
});
export type CreateOpdVisit = z.infer<typeof CreateOpdVisitSchema>;

export const UpdateOpdVisitSchema = CreateOpdVisitSchema.partial();
export type UpdateOpdVisit = z.infer<typeof UpdateOpdVisitSchema>;

export const OpdVisitListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(200).default(50),
  patientId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  from: z.string().optional(),             // YYYY-MM-DD
  to: z.string().optional(),
});
export type OpdVisitListQuery = z.infer<typeof OpdVisitListQuerySchema>;

// ---------------------------------------------------------------------------
//  Prescription
// ---------------------------------------------------------------------------
export const PrescriptionSchema = z.object({
  id: z.string().uuid(),
  visitId: z.string().uuid(),
  medicineName: z.string().min(1).max(160),
  genericName: z.string().nullable(),
  brandName: z.string().nullable(),
  strength: z.string().nullable(),
  dosage: z.string().nullable(),
  frequency: z.string().nullable(),
  duration: z.string().nullable(),
  route: z.string().nullable(),
  instructions: z.string().nullable(),
  sortOrder: z.number().int().default(0),
  isDeleted: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  updatedBy: z.string(),
});
export type Prescription = z.infer<typeof PrescriptionSchema>;

export const CreatePrescriptionSchema = PrescriptionSchema.omit({
  id: true, isDeleted: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true,
}).partial({
  genericName: true, brandName: true, strength: true, dosage: true,
  frequency: true, duration: true, route: true, instructions: true, sortOrder: true,
});
export type CreatePrescription = z.infer<typeof CreatePrescriptionSchema>;

export const UpdatePrescriptionSchema = CreatePrescriptionSchema.partial();
export type UpdatePrescription = z.infer<typeof UpdatePrescriptionSchema>;
