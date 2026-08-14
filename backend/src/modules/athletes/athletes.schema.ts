import { z } from 'zod';
import { AthleteType, AthleteStatus, Gender } from '@prisma/client';

const genderEnum = z.nativeEnum(Gender);
const athleteTypeEnum = z.nativeEnum(AthleteType);
const athleteStatusEnum = z.nativeEnum(AthleteStatus);

export const medicalDeclarationSchema = z.object({
  hasCondition: z.boolean(),
  conditionDescription: z.string().max(1000).optional().nullable(),
}).optional();

export const affiliationSchema = z.object({
  sportId: z.string().uuid(),
  teamId: z.string().uuid().optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  jerseyNumber: z.number().int().min(0).max(999).optional().nullable(),
  isCaptain: z.boolean().optional(),
  isViceCaptain: z.boolean().optional(),
  joinedDate: z.string().datetime({ offset: true }).optional().nullable(),
  status: athleteStatusEnum.optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const createAthleteSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  fullName: z.string().min(1).max(255),
  registrationNumber: z.string().min(1).max(50),
  gender: genderEnum,
  dateOfBirth: z.string().datetime({ offset: true }).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string().max(20).optional().nullable(),
  yearOfStudy: z.number().int().min(1).max(5).optional().nullable(),
  programme: z.string().max(255).optional().nullable(),
  faculty: z.string().max(255).optional().nullable(),
  athleteType: athleteTypeEnum.optional(),
  status: athleteStatusEnum.optional(),
  profilePhotoUrl: z.string().url().optional().nullable(),
  medicalDeclaration: medicalDeclarationSchema,
  affiliations: z.array(affiliationSchema).max(10).optional(),
});

export const updateAthleteSchema = createAthleteSchema.partial();

export const listAthletesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sport: z.string().uuid().optional(),
  team: z.string().uuid().optional(),
  athleteType: athleteTypeEnum.optional(),
  status: athleteStatusEnum.optional(),
  gender: genderEnum.optional(),
  yearOfStudy: z.coerce.number().int().min(1).max(5).optional(),
  faculty: z.string().optional(),
});

export type CreateAthleteInput = z.infer<typeof createAthleteSchema>;
export type UpdateAthleteInput = z.infer<typeof updateAthleteSchema>;
export type ListAthletesQuery = z.infer<typeof listAthletesQuerySchema>;
export type AffiliationInput = z.infer<typeof affiliationSchema>;
export type MedicalDeclarationInput = z.infer<typeof medicalDeclarationSchema>;
