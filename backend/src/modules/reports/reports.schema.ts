import { z } from 'zod';
import { AcademicStanding, ScholarshipStatus } from '@prisma/client';

export const reportsQuerySchema = z.object({
  sport: z.string().uuid().optional(),
  team: z.string().uuid().optional(),
  event: z.string().uuid().optional(),
  season: z.string().optional(),
  semester: z.enum(['SEM1', 'SEM2', 'RESIT']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  format: z.enum(['json', 'csv']).optional().default('json'),
});

export type ReportsQuery = z.infer<typeof reportsQuerySchema>;

export const academicStandingSchema = z.object({
  standing: z.nativeEnum(AcademicStanding).optional(),
});

export const scholarshipStatusSchema = z.object({
  status: z.nativeEnum(ScholarshipStatus).optional(),
});
