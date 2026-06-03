/**
 * Shared types + Zod validators for MilindWeb.
 * Consumed by both the NestJS API and the static FE.
 *
 * Naming note: seniority.ts and hospital.ts both define their own
 * `Department`, `CreateDepartment`, etc. (different schemas). The seniority
 * names are re-exported as the "default" `Department` for convenience; the
 * hospital variants are re-exported under the `Hospital*` prefix.
 */

export * from './roles';
export * from './user';
export * from './seniority';

// Re-export hospital types under a `Hospital*` namespace to avoid clashing
// with seniority's identically-named types.
export {
  GenderSchema as HospitalGenderSchema,
  MaritalStatusSchema as HospitalMaritalStatusSchema,
  EffectAfterTreatmentSchema as HospitalEffectAfterTreatmentSchema,
  DepartmentSchema as HospitalDepartmentSchema,
  CreateDepartmentSchema as HospitalCreateDepartmentSchema,
  UpdateDepartmentSchema as HospitalUpdateDepartmentSchema,
  DepartmentListQuerySchema as HospitalDepartmentListQuerySchema,
  DoctorSchema as HospitalDoctorSchema,
  CreateDoctorSchema as HospitalCreateDoctorSchema,
  UpdateDoctorSchema as HospitalUpdateDoctorSchema,
  PatientSchema as HospitalPatientSchema,
  CreatePatientSchema as HospitalCreatePatientSchema,
  UpdatePatientSchema as HospitalUpdatePatientSchema,
  OpdVisitSchema as HospitalOpdVisitSchema,
  CreateOpdVisitSchema as HospitalCreateOpdVisitSchema,
  UpdateOpdVisitSchema as HospitalUpdateOpdVisitSchema,
  PrescriptionSchema as HospitalPrescriptionSchema,
  CreatePrescriptionSchema as HospitalCreatePrescriptionSchema,
  UpdatePrescriptionSchema as HospitalUpdatePrescriptionSchema,
  OpdVisitListQuerySchema as HospitalOpdVisitListQuerySchema,
  DoctorListQuerySchema as HospitalDoctorListQuerySchema,
  PatientListQuerySchema as HospitalPatientListQuerySchema,
} from './hospital';

export type {
  Department as HospitalDepartment,
  CreateDepartment as HospitalCreateDepartment,
  UpdateDepartment as HospitalUpdateDepartment,
  DepartmentListQuery as HospitalDepartmentListQuery,
  Doctor as HospitalDoctor,
  CreateDoctor as HospitalCreateDoctor,
  UpdateDoctor as HospitalUpdateDoctor,
  Patient as HospitalPatient,
  CreatePatient as HospitalCreatePatient,
  UpdatePatient as HospitalUpdatePatient,
  OpdVisit as HospitalOpdVisit,
  CreateOpdVisit as HospitalCreateOpdVisit,
  UpdateOpdVisit as HospitalUpdateOpdVisit,
  Prescription as HospitalPrescription,
  CreatePrescription as HospitalCreatePrescription,
  UpdatePrescription as HospitalUpdatePrescription,
  Symptom as HospitalSymptom,
  OpdVisitListQuery as HospitalOpdVisitListQuery,
  DoctorListQuery as HospitalDoctorListQuery,
  PatientListQuery as HospitalPatientListQuery,
} from './hospital';

export * from './portfolio';
