import { z } from 'zod';
import {
  ProspectStatus,
  ProspectSource,
  PreviousLevel,
  TrialStatus,
  Recommendation,
  SelectionOutcome,
} from '@prisma/client';

const dateSchema = z.string().datetime({ offset: true }).or(z.string().date());

export const createProspectSchema = z.object({
  fullName: z.string().min(1).max(255),
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string().max(20).optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE']),
  dateOfBirth: dateSchema.optional().nullable(),
  schoolOrInstitution: z.string().optional().nullable(),
  programmeApplied: z.string().optional().nullable(),
  sportId: z.string().uuid(),
  position: z.string().optional().nullable(),
  previousLevel: z.nativeEnum(PreviousLevel).optional().nullable(),
  previousClubs: z.string().optional().nullable(),
  previousAchievements: z.string().optional().nullable(),
  referredBy: z.string().optional().nullable(),
  source: z.nativeEnum(ProspectSource).optional(),
  status: z.nativeEnum(ProspectStatus).optional(),
  notes: z.string().optional().nullable(),
});

export const updateProspectSchema = createProspectSchema.partial();

export const createTrialSchema = z.object({
  sportId: z.string().uuid(),
  teamId: z.string().uuid().optional().nullable(),
  trialDate: dateSchema,
  startTime: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  conductedBy: z.string().uuid().optional().nullable(),
  seasonId: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TrialStatus).optional(),
  prospectIds: z.array(z.string().uuid()).optional(),
});

export const updateTrialSchema = z.object({
  trialDate: dateSchema.optional(),
  startTime: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  conductedBy: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TrialStatus).optional(),
});

export const addTrialParticipantsSchema = z.object({
  prospectIds: z.array(z.string().uuid()).min(1),
});

export const updateAttendanceSchema = z.object({
  attendance: z.array(
    z.object({ prospectId: z.string().uuid(), attended: z.boolean() })
  ),
});

export const submitAssessmentSchema = z.object({
  prospectId: z.string().uuid(),
  scoreTechnical: z.number().min(0).max(10).optional().nullable(),
  scorePhysical: z.number().min(0).max(10).optional().nullable(),
  scoreSpeed: z.number().min(0).max(10).optional().nullable(),
  scoreTactical: z.number().min(0).max(10).optional().nullable(),
  scoreTeamwork: z.number().min(0).max(10).optional().nullable(),
  scoreDiscipline: z.number().min(0).max(10).optional().nullable(),
  scoreAcademic: z.number().min(0).max(10).optional().nullable(),
  recommendedPosition: z.string().optional().nullable(),
  recommendation: z.nativeEnum(Recommendation).optional(),
  selectionOutcome: z.nativeEnum(SelectionOutcome).optional(),
  coachNotes: z.string().optional().nullable(),
});

export const enrollProspectSchema = z.object({
  registrationNumber: z.string().min(1),
  yearOfStudy: z.number().int().min(1).max(8).optional().nullable(),
  programme: z.string().optional().nullable(),
  faculty: z.string().optional().nullable(),
});

export const listProspectsQuerySchema = z.object({
  sport: z.string().uuid().optional(),
  status: z.nativeEnum(ProspectStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const listTrialsQuerySchema = z.object({
  sport: z.string().uuid().optional(),
  status: z.nativeEnum(TrialStatus).optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProspectInput = z.infer<typeof createProspectSchema>;
export type UpdateProspectInput = z.infer<typeof updateProspectSchema>;
export type CreateTrialInput = z.infer<typeof createTrialSchema>;
export type UpdateTrialInput = z.infer<typeof updateTrialSchema>;
export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>;
