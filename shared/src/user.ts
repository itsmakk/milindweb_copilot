import { z } from 'zod';
import { RoleSchema, TenantSchema } from './roles';

export const UserSchema = z.object({
  id: z.string().uuid(),
  authId: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  avatarUrl: z.string().url().nullable(),
  role: RoleSchema,
  tenant: TenantSchema,
  isActive: z.boolean(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const PublicUserSchema = UserSchema.pick({
  id: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  role: true,
  tenant: true,
  isActive: true,
  lastLoginAt: true,
});

export type PublicUser = z.infer<typeof PublicUserSchema>;
