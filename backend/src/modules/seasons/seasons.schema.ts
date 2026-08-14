import { z } from "zod";

const seasonBaseSchema = z.object({
  name: z.string().min(1).max(20),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
  isCurrent: z.boolean().optional(),
});

export const createSeasonSchema = seasonBaseSchema.refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: "endDate must be after startDate",
    path: ["endDate"],
  },
);

export const updateSeasonSchema = seasonBaseSchema.partial().refine(
  (data) => {
    if (data.startDate === undefined || data.endDate === undefined) return true;
    return new Date(data.endDate) > new Date(data.startDate);
  },
  { message: "endDate must be after startDate", path: ["endDate"] },
);

export const listSeasonsQuerySchema = z.object({
  isCurrent: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>;
export type ListSeasonsQuery = z.infer<typeof listSeasonsQuerySchema>;
