import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/[0-9]/, 'Password must include at least one number');

export const loginSchema = z
  .object({
    username: z.string().trim().min(1, 'Username is required').optional(),
    email: z.string().trim().min(1).optional(),
    password: z.string().min(1),
  })
  .refine((data) => data.username || data.email, {
    message: 'Username is required',
    path: ['username'],
  });

export const refreshSchema = z.object({});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForceChangePasswordInput = z.infer<typeof changePasswordSchema>;