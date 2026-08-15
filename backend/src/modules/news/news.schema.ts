import { z } from 'zod';
import { NewsStatus } from '@prisma/client';

export const createNewsSchema = z.object({
  title: z.string().min(3).max(255),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens').optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(10),
  coverImage: z.string().url().optional(),
  tags: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.nativeEnum(NewsStatus).default(NewsStatus.DRAFT),
  publishedAt: z.string().optional(),
});

export const updateNewsSchema = createNewsSchema.partial();

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
