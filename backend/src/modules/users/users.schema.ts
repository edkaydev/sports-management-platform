import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { passwordSchema } from '../auth/auth.schema';

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, dashes and underscores'),
  fullName: z.string().trim().min(1, 'Full name is required').max(255),
  password: passwordSchema,
  role: z.nativeEnum(UserRole).optional(),
  email: z.string().email().max(255).optional().or(z.literal('').transform(() => undefined)),
});

export const updateUserSchema = z
  .object({
    fullName: z.string().trim().min(1).max(255).optional(),
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.boolean().optional(),
  })
  .partial();

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;