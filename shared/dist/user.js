"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicUserSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
const roles_1 = require("./roles");
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    authId: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    displayName: zod_1.z.string().min(1),
    avatarUrl: zod_1.z.string().url().nullable(),
    role: roles_1.RoleSchema,
    tenant: roles_1.TenantSchema,
    isActive: zod_1.z.boolean(),
    lastLoginAt: zod_1.z.string().datetime().nullable(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.PublicUserSchema = exports.UserSchema.pick({
    id: true,
    email: true,
    displayName: true,
    avatarUrl: true,
    role: true,
    tenant: true,
    isActive: true,
    lastLoginAt: true,
});
//# sourceMappingURL=user.js.map