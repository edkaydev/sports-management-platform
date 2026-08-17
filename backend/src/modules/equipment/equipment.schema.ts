import { z } from "zod";
import {
  EquipmentCategory,
  EquipmentCondition,
  EquipmentStatus,
  EquipmentAssignmentType,
} from "@prisma/client";

const dateSchema = z.string().datetime({ offset: true }).or(z.string().date());

export const createEquipmentSchema = z.object({
  name: z.string().min(1).max(150),
  category: z.nativeEnum(EquipmentCategory),
  assetNumber: z.string().max(50).optional().nullable(),
  serialNumber: z.string().max(100).optional().nullable(),
  quantity: z.number().int().min(1).max(10000).optional(),
  condition: z.nativeEnum(EquipmentCondition).optional(),
  status: z.nativeEnum(EquipmentStatus).optional(),
  sportId: z.string().uuid().optional().nullable(),
  storageLocation: z.string().max(150).optional().nullable(),
  purchasedDate: dateSchema.optional().nullable(),
  purchaseCost: z.coerce.number().min(0).max(99999999).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateEquipmentSchema = createEquipmentSchema.partial();

export const listEquipmentQuerySchema = z.object({
  category: z.nativeEnum(EquipmentCategory).optional(),
  status: z.nativeEnum(EquipmentStatus).optional(),
  condition: z.nativeEnum(EquipmentCondition).optional(),
  sportId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const assignEquipmentSchema = z
  .object({
    assignedToType: z.nativeEnum(EquipmentAssignmentType),
    athleteId: z.string().uuid().optional().nullable(),
    teamId: z.string().uuid().optional().nullable(),
    quantity: z.number().int().min(1).max(10000).optional(),
    dueDate: dateSchema.optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) =>
      data.assignedToType === EquipmentAssignmentType.ATHLETE
        ? !!data.athleteId
        : !!data.teamId,
    {
      message: "athleteId or teamId is required for the assignment type",
    },
  );

export const returnEquipmentSchema = z.object({
  conditionOnReturn: z.nativeEnum(EquipmentCondition).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
export type ListEquipmentQuery = z.infer<typeof listEquipmentQuerySchema>;
export type AssignEquipmentInput = z.infer<typeof assignEquipmentSchema>;
export type ReturnEquipmentInput = z.infer<typeof returnEquipmentSchema>;
