"use strict";
/**
 * Shared types + Zod validators for MilindWeb.
 * Consumed by both the NestJS API and the static FE.
 *
 * Naming note: seniority.ts and hospital.ts both define their own
 * `Department`, `CreateDepartment`, etc. (different schemas). The seniority
 * names are re-exported as the "default" `Department` for convenience; the
 * hospital variants are re-exported under the `Hospital*` prefix.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HospitalPatientListQuerySchema = exports.HospitalDoctorListQuerySchema = exports.HospitalOpdVisitListQuerySchema = exports.HospitalPrescriptionSchema = exports.HospitalOpdVisitSchema = exports.HospitalUpdatePatientSchema = exports.HospitalCreatePatientSchema = exports.HospitalPatientSchema = exports.HospitalUpdateDoctorSchema = exports.HospitalCreateDoctorSchema = exports.HospitalDoctorSchema = exports.HospitalDepartmentListQuerySchema = exports.HospitalUpdateDepartmentSchema = exports.HospitalCreateDepartmentSchema = exports.HospitalDepartmentSchema = exports.HospitalEffectAfterTreatmentSchema = exports.HospitalMaritalStatusSchema = exports.HospitalGenderSchema = void 0;
__exportStar(require("./roles"), exports);
__exportStar(require("./user"), exports);
__exportStar(require("./seniority"), exports);
// Re-export hospital types under a `Hospital*` namespace to avoid clashing
// with seniority's identically-named types.
var hospital_1 = require("./hospital");
Object.defineProperty(exports, "HospitalGenderSchema", { enumerable: true, get: function () { return hospital_1.GenderSchema; } });
Object.defineProperty(exports, "HospitalMaritalStatusSchema", { enumerable: true, get: function () { return hospital_1.MaritalStatusSchema; } });
Object.defineProperty(exports, "HospitalEffectAfterTreatmentSchema", { enumerable: true, get: function () { return hospital_1.EffectAfterTreatmentSchema; } });
Object.defineProperty(exports, "HospitalDepartmentSchema", { enumerable: true, get: function () { return hospital_1.DepartmentSchema; } });
Object.defineProperty(exports, "HospitalCreateDepartmentSchema", { enumerable: true, get: function () { return hospital_1.CreateDepartmentSchema; } });
Object.defineProperty(exports, "HospitalUpdateDepartmentSchema", { enumerable: true, get: function () { return hospital_1.UpdateDepartmentSchema; } });
Object.defineProperty(exports, "HospitalDepartmentListQuerySchema", { enumerable: true, get: function () { return hospital_1.DepartmentListQuerySchema; } });
Object.defineProperty(exports, "HospitalDoctorSchema", { enumerable: true, get: function () { return hospital_1.DoctorSchema; } });
Object.defineProperty(exports, "HospitalCreateDoctorSchema", { enumerable: true, get: function () { return hospital_1.CreateDoctorSchema; } });
Object.defineProperty(exports, "HospitalUpdateDoctorSchema", { enumerable: true, get: function () { return hospital_1.UpdateDoctorSchema; } });
Object.defineProperty(exports, "HospitalPatientSchema", { enumerable: true, get: function () { return hospital_1.PatientSchema; } });
Object.defineProperty(exports, "HospitalCreatePatientSchema", { enumerable: true, get: function () { return hospital_1.CreatePatientSchema; } });
Object.defineProperty(exports, "HospitalUpdatePatientSchema", { enumerable: true, get: function () { return hospital_1.UpdatePatientSchema; } });
Object.defineProperty(exports, "HospitalOpdVisitSchema", { enumerable: true, get: function () { return hospital_1.OpdVisitSchema; } });
Object.defineProperty(exports, "HospitalPrescriptionSchema", { enumerable: true, get: function () { return hospital_1.PrescriptionSchema; } });
Object.defineProperty(exports, "HospitalOpdVisitListQuerySchema", { enumerable: true, get: function () { return hospital_1.OpdVisitListQuerySchema; } });
Object.defineProperty(exports, "HospitalDoctorListQuerySchema", { enumerable: true, get: function () { return hospital_1.DoctorListQuerySchema; } });
Object.defineProperty(exports, "HospitalPatientListQuerySchema", { enumerable: true, get: function () { return hospital_1.PatientListQuerySchema; } });
__exportStar(require("./portfolio"), exports);
//# sourceMappingURL=index.js.map