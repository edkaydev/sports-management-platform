import { z } from "zod";
import { Gender, SportCategory } from "@prisma/client";

export const createSportSchema = z.object({
  name: z.string().min(1).max(100),
  gender: z.nativeEnum(Gender),
  category: z.nativeEnum(SportCategory),
  description: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateSportSchema = createSportSchema.partial();

export const listSportsQuerySchema = z.object({
  isActive: z.string().optional(),
  category: z.nativeEnum(SportCategory).optional(),
  gender: z.nativeEnum(Gender).optional(),
});

export type CreateSportInput = z.infer<typeof createSportSchema>;
export type UpdateSportInput = z.infer<typeof updateSportSchema>;
export type ListSportsQuery = z.infer<typeof listSportsQuerySchema>;
