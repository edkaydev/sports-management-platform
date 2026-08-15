import { z } from 'zod';
import { ScholarshipType, ScholarshipStatus, ContractType, ContractStatus } from '@prisma/client';

const dateSchema = z.string().datetime({ offset: true }).or(z.string().date());

export const createScholarshipSchema = z.object({
  athleteId: z.string().uuid(),
  scholarshipType: z.nativeEnum(ScholarshipType),
  sponsorName: z.string().max(255).optional(),
  coverageDescription: z.string().optional(),
  coveragePercentage: z.number().min(0).max(100).optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  renewable: z.boolean().optional(),
  academicRequirementGpa: z.number().min(0).max(5).optional(),
  sportsRequirement: z.string().optional(),
  status: z.nativeEnum(ScholarshipStatus).optional(),
  notes: z.string().optional(),
});

export const updateScholarshipSchema = z.object({
  scholarshipType: z.nativeEnum(ScholarshipType).optional(),
  sponsorName: z.string().max(255).optional(),
  coverageDescription: z.string().optional(),
  coveragePercentage: z.number().min(0).max(100).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  renewable: z.boolean().optional(),
  academicRequirementGpa: z.number().min(0).max(5).optional(),
  sportsRequirement: z.string().optional(),
  status: z.nativeEnum(ScholarshipStatus).optional(),
  notes: z.string().optional(),
});

export const listScholarshipsQuerySchema = z.object({
  athleteId: z.string().uuid().optional(),
  status: z.nativeEnum(ScholarshipStatus).optional(),
  type: z.nativeEnum(ScholarshipType).optional(),
  expiringWithin: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const renewScholarshipSchema = z.object({
  newEndDate: dateSchema,
  notes: z.string().optional(),
});

export const revokeScholarshipSchema = z.object({
  reason: z.string().min(1),
});

export const createContractSchema = z.object({
  athleteId: z.string().uuid(),
  contractType: z.nativeEnum(ContractType),
  startDate: dateSchema,
  endDate: dateSchema,
  termsSummary: z.string().optional(),
  hasAccompanyingScholarship: z.boolean().optional(),
  scholarshipId: z.string().uuid().optional(),
  signedByAthlete: z.boolean().optional(),
  signedAt: dateSchema.optional(),
  status: z.nativeEnum(ContractStatus).optional(),
  notes: z.string().optional(),
});

export const updateContractSchema = z.object({
  contractType: z.nativeEnum(ContractType).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  termsSummary: z.string().optional(),
  hasAccompanyingScholarship: z.boolean().optional(),
  scholarshipId: z.string().uuid().optional(),
  signedByAthlete: z.boolean().optional(),
  signedAt: dateSchema.optional(),
  status: z.nativeEnum(ContractStatus).optional(),
  notes: z.string().optional(),
});

export const listContractsQuerySchema = z.object({
  athleteId: z.string().uuid().optional(),
  status: z.nativeEnum(ContractStatus).optional(),
  expiringWithin: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const terminateContractSchema = z.object({
  terminationDate: dateSchema.optional(),
  reason: z.string().min(1),
});

export type CreateScholarshipInput = z.infer<typeof createScholarshipSchema>;
export type UpdateScholarshipInput = z.infer<typeof updateScholarshipSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
