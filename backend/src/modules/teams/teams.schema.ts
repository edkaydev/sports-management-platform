import { z } from "zod";
import { Gender, TeamStaffRole, SquadMemberStatus } from "@prisma/client";

export const createTeamSchema = z.object({
  name: z.string().min(1).max(255),
  shortName: z.string().max(20).optional().nullable(),
  sportId: z.string().uuid(),
  seasonId: z.string().uuid().optional().nullable(),
  gender: z.nativeEnum(Gender),
  logoUrl: z.string().url().optional().nullable(),
  homeVenue: z.string().max(255).optional().nullable(),
  foundingYear: z.number().int().min(1800).max(2100).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateTeamSchema = createTeamSchema.partial();

export const listTeamsQuerySchema = z.object({
  sport: z.string().uuid().optional(),
  season: z.string().uuid().optional(),
  isActive: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const addSquadMemberSchema = z.object({
  athleteId: z.string().uuid(),
  seasonId: z.string().uuid(),
  jerseyNumber: z.number().int().min(0).max(999).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  isCaptain: z.boolean().optional(),
  isViceCaptain: z.boolean().optional(),
  joinedDate: z.string().datetime({ offset: true }).optional().nullable(),
  status: z.nativeEnum(SquadMemberStatus).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const assignStaffSchema = z.object({
  userId: z.string().uuid(),
  role: z.nativeEnum(TeamStaffRole),
  assignedDate: z.string().datetime({ offset: true }).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type ListTeamsQuery = z.infer<typeof listTeamsQuerySchema>;
export type AddSquadMemberInput = z.infer<typeof addSquadMemberSchema>;
export type AssignStaffInput = z.infer<typeof assignStaffSchema>;
