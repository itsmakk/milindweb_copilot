"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePrescriptionSchema = exports.CreatePrescriptionSchema = exports.PrescriptionSchema = exports.OpdVisitListQuerySchema = exports.UpdateOpdVisitSchema = exports.CreateOpdVisitSchema = exports.OpdVisitSchema = exports.PatientListQuerySchema = exports.UpdatePatientSchema = exports.CreatePatientSchema = exports.PatientSchema = exports.Symptom = exports.DoctorListQuerySchema = exports.UpdateDoctorSchema = exports.CreateDoctorSchema = exports.DoctorSchema = exports.DepartmentListQuerySchema = exports.UpdateDepartmentSchema = exports.CreateDepartmentSchema = exports.DepartmentSchema = exports.EffectAfterTreatmentSchema = exports.MaritalStatusSchema = exports.GenderSchema = void 0;
const zod_1 = require("zod");
// ---------------------------------------------------------------------------
//  Enums
// ---------------------------------------------------------------------------
exports.GenderSchema = zod_1.z.enum(['Male', 'Female', 'Other']);
exports.MaritalStatusSchema = zod_1.z.enum(['Single', 'Married', 'Divorced', 'Widowed']);
exports.EffectAfterTreatmentSchema = zod_1.z.enum(['Recovered', 'No Change', 'Worsened', 'Follow-up Required', 'NA']);
// ---------------------------------------------------------------------------
//  Department
// ---------------------------------------------------------------------------
exports.DepartmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string().min(1).max(40),
    name: zod_1.z.string().min(1).max(120),
    parentId: zod_1.z.string().uuid().nullable(),
    defaultSymptoms: zod_1.z.array(zod_1.z.string()).default([]),
    isActive: zod_1.z.boolean().default(true),
    sortOrder: zod_1.z.number().int().default(0),
    isDeleted: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    createdBy: zod_1.z.string(),
    updatedBy: zod_1.z.string(),
});
exports.CreateDepartmentSchema = exports.DepartmentSchema.omit({
    id: true, isDeleted: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true,
}).partial({ parentId: true, defaultSymptoms: true, isActive: true, sortOrder: true });
exports.UpdateDepartmentSchema = exports.CreateDepartmentSchema.partial();
exports.DepartmentListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    pageSize: zod_1.z.coerce.number().int().positive().max(200).default(50),
    q: zod_1.z.string().optional(),
    active: zod_1.z.coerce.boolean().optional(),
});
// ---------------------------------------------------------------------------
//  Doctor
// ---------------------------------------------------------------------------
exports.DoctorSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string().nullable(),
    name: zod_1.z.string().min(1).max(120),
    qualification: zod_1.z.string().nullable(),
    registrationNo: zod_1.z.string().nullable(),
    departmentId: zod_1.z.string().uuid().nullable(),
    specialization: zod_1.z.string().nullable(),
    mobile: zod_1.z.string().nullable(),
    email: zod_1.z.string().email().nullable(),
    consultationFee: zod_1.z.number().nullable(),
    signatureUrl: zod_1.z.string().url().nullable(),
    isActive: zod_1.z.boolean().default(true),
    isDeleted: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    createdBy: zod_1.z.string(),
    updatedBy: zod_1.z.string(),
});
exports.CreateDoctorSchema = exports.DoctorSchema.omit({
    id: true, isDeleted: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true,
}).partial({
    code: true, qualification: true, registrationNo: true, departmentId: true,
    specialization: true, mobile: true, email: true, consultationFee: true,
    signatureUrl: true, isActive: true,
});
exports.UpdateDoctorSchema = exports.CreateDoctorSchema.partial();
exports.DoctorListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    pageSize: zod_1.z.coerce.number().int().positive().max(200).default(50),
    q: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().uuid().optional(),
    active: zod_1.z.coerce.boolean().optional(),
});
// ---------------------------------------------------------------------------
//  Patient
// ---------------------------------------------------------------------------
const SymptomSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    duration: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.Symptom = SymptomSchema;
exports.PatientSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    uhid: zod_1.z.string().min(1).max(40),
    fullName: zod_1.z.string().min(1).max(120),
    gender: exports.GenderSchema,
    dob: zod_1.z.string().nullable(),
    age: zod_1.z.number().int().nullable(),
    mobile: zod_1.z.string().nullable(),
    email: zod_1.z.string().email().nullable(),
    address: zod_1.z.string().nullable(),
    bloodGroup: zod_1.z.string().nullable(),
    occupation: zod_1.z.string().nullable(),
    aadhaar: zod_1.z.string().nullable(),
    emergencyContact: zod_1.z.string().nullable(),
    maritalStatus: exports.MaritalStatusSchema.nullable(),
    allergies: zod_1.z.array(zod_1.z.string()).default([]),
    chronicDiseases: zod_1.z.array(zod_1.z.string()).default([]),
    familyHistory: zod_1.z.array(zod_1.z.string()).default([]),
    surgicalHistory: zod_1.z.array(zod_1.z.string()).default([]),
    currentMedications: zod_1.z.array(zod_1.z.string()).default([]),
    isDeleted: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    createdBy: zod_1.z.string(),
    updatedBy: zod_1.z.string(),
});
exports.CreatePatientSchema = exports.PatientSchema.omit({
    id: true, isDeleted: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true,
}).partial({
    dob: true, age: true, mobile: true, email: true, address: true, bloodGroup: true,
    occupation: true, aadhaar: true, emergencyContact: true, maritalStatus: true,
    allergies: true, chronicDiseases: true, familyHistory: true,
    surgicalHistory: true, currentMedications: true,
});
exports.UpdatePatientSchema = exports.CreatePatientSchema.partial();
exports.PatientListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    pageSize: zod_1.z.coerce.number().int().positive().max(200).default(50),
    q: zod_1.z.string().optional(), // matches name / mobile / uhid
    gender: exports.GenderSchema.optional(),
});
// ---------------------------------------------------------------------------
//  OPD Visit
// ---------------------------------------------------------------------------
exports.OpdVisitSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    opdNo: zod_1.z.string().min(1).max(40),
    patientId: zod_1.z.string().uuid(),
    doctorId: zod_1.z.string().uuid().nullable(),
    departmentId: zod_1.z.string().uuid().nullable(),
    visitDate: zod_1.z.string(), // YYYY-MM-DD
    weightKg: zod_1.z.number().nullable(),
    bp: zod_1.z.string().nullable(),
    pulse: zod_1.z.number().int().nullable(),
    respiratoryRate: zod_1.z.number().int().nullable(),
    spo2: zod_1.z.number().int().nullable(),
    tempF: zod_1.z.number().nullable(),
    sugarMgDl: zod_1.z.number().int().nullable(),
    chiefComplaints: zod_1.z.array(SymptomSchema).default([]),
    provisionalDiagnosis: zod_1.z.string().nullable(),
    investigationsAdvised: zod_1.z.string().nullable(),
    investigationReports: zod_1.z.string().nullable(),
    finalDiagnosis: zod_1.z.string().nullable(),
    advice: zod_1.z.string().nullable(),
    effectAfterTreatment: exports.EffectAfterTreatmentSchema.nullable(),
    doctorFee: zod_1.z.number().nullable(),
    doctorRemarks: zod_1.z.string().nullable(),
    isDeleted: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    createdBy: zod_1.z.string(),
    updatedBy: zod_1.z.string(),
});
exports.CreateOpdVisitSchema = exports.OpdVisitSchema.omit({
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
exports.UpdateOpdVisitSchema = exports.CreateOpdVisitSchema.partial();
exports.OpdVisitListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    pageSize: zod_1.z.coerce.number().int().positive().max(200).default(50),
    patientId: zod_1.z.string().uuid().optional(),
    doctorId: zod_1.z.string().uuid().optional(),
    from: zod_1.z.string().optional(), // YYYY-MM-DD
    to: zod_1.z.string().optional(),
});
// ---------------------------------------------------------------------------
//  Prescription
// ---------------------------------------------------------------------------
exports.PrescriptionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    visitId: zod_1.z.string().uuid(),
    medicineName: zod_1.z.string().min(1).max(160),
    genericName: zod_1.z.string().nullable(),
    brandName: zod_1.z.string().nullable(),
    strength: zod_1.z.string().nullable(),
    dosage: zod_1.z.string().nullable(),
    frequency: zod_1.z.string().nullable(),
    duration: zod_1.z.string().nullable(),
    route: zod_1.z.string().nullable(),
    instructions: zod_1.z.string().nullable(),
    sortOrder: zod_1.z.number().int().default(0),
    isDeleted: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    createdBy: zod_1.z.string(),
    updatedBy: zod_1.z.string(),
});
exports.CreatePrescriptionSchema = exports.PrescriptionSchema.omit({
    id: true, isDeleted: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true,
}).partial({
    genericName: true, brandName: true, strength: true, dosage: true,
    frequency: true, duration: true, route: true, instructions: true, sortOrder: true,
});
exports.UpdatePrescriptionSchema = exports.CreatePrescriptionSchema.partial();
//# sourceMappingURL=hospital.js.map