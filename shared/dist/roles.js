"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantSchema = exports.RoleSchema = exports.TENANTS = exports.ROLES = void 0;
const zod_1 = require("zod");
exports.ROLES = [
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
];
exports.TENANTS = ['portfolio', 'seniority', 'hospital'];
exports.RoleSchema = zod_1.z.enum(exports.ROLES);
exports.TenantSchema = zod_1.z.union([zod_1.z.enum(exports.TENANTS), zod_1.z.null()]);
//# sourceMappingURL=roles.js.map