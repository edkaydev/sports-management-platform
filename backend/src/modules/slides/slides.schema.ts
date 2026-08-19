import { z } from 'zod';

export const createSlideSchema = z.object({
  title: z.string().min(1).max(255),
  subtitle: z.string().max(500).optional(),
  imageUrl: z.string().url().max(1024),
  linkUrl: z.string().url().max(1024).optional(),
  linkLabel: z.string().max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateSlideSchema = createSlideSchema.partial();

export type CreateSlideInput = z.infer<typeof createSlideSchema>;
export type UpdateSlideInput = z.infer<typeof updateSlideSchema>;
