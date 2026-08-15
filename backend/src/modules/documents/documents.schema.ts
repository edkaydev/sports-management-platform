import { z } from 'zod';
import {
  DocumentCategory,
  DocumentOwnerType,
  DocumentStatus,
} from '@prisma/client';

const dateSchema = z.string().datetime({ offset: true }).or(z.string().date());

export const listDocumentsQuerySchema = z.object({
  athleteId: z.string().uuid().optional(),
  category: z.nativeEnum(DocumentCategory).optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  ownerType: z.nativeEnum(DocumentOwnerType).optional(),
  teamId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const verifyDocumentSchema = z.object({
  isVerified: z.boolean(),
  notes: z.string().optional().nullable(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  category: z.nativeEnum(DocumentCategory).optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  expiryDate: dateSchema.optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
