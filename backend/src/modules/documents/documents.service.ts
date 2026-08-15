import { Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import type {
  ListDocumentsQuery,
  UpdateDocumentInput,
} from './documents.schema';

const UPLOAD_DIR =
  process.env.UPLOAD_DIR ??
  path.join(__dirname, '..', '..', '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

function mimeToFileType(mime: string): 'PDF' | 'JPEG' | 'PNG' | 'DOCX' | 'XLSX' | 'OTHER' {
  if (mime === 'application/pdf') return 'PDF';
  if (mime === 'image/jpeg') return 'JPEG';
  if (mime === 'image/png') return 'PNG';
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
  if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'XLSX';
  return 'OTHER';
}

export async function listDocuments(query: ListDocumentsQuery) {
  const where: Prisma.DocumentWhereInput = {};
  if (query.athleteId) where.athleteId = query.athleteId;
  if (query.category) where.category = query.category;
  if (query.status) where.status = query.status;
  if (query.ownerType) where.ownerType = query.ownerType;
  if (query.teamId) where.teamId = query.teamId;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search } },
      { fileName: { contains: query.search } },
      { athlete: { fullName: { contains: query.search } } },
      { athlete: { registrationNumber: { contains: query.search } } },
    ];
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: {
        athlete: {
          select: { id: true, fullName: true, registrationNumber: true },
        },
        team: { select: { id: true, name: true } },
        uploadedByUser: { select: { id: true, fullName: true } },
        verifiedByUser: { select: { id: true, fullName: true } },
      },
      orderBy: { uploadedAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.document.count({ where }),
  ]);

  return {
    documents,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
}

export async function getDocument(id: string) {
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      athlete: {
        select: { id: true, fullName: true, registrationNumber: true },
      },
      team: { select: { id: true, name: true } },
      uploadedByUser: { select: { id: true, fullName: true } },
      verifiedByUser: { select: { id: true, fullName: true } },
    },
  });
  if (!document) throw new AppError(404, 'NOT_FOUND', 'Document not found');
  return document;
}

export async function uploadDocument(
  file: Express.Multer.File,
  metadata: {
    title: string;
    category: string;
    ownerType: string;
    athleteId?: string;
    teamId?: string;
    expiryDate?: string;
    notes?: string;
  },
  userId: string
) {
  const title = metadata.title?.trim();
  if (!title) throw new AppError(422, 'VALIDATION_ERROR', 'title is required');

  const ownerType = metadata.ownerType as never;
  if (!['ATHLETE', 'TEAM', 'EVENT', 'MATCH', 'TRIAL', 'DEPARTMENT'].includes(ownerType)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid ownerType');
  }

  if (metadata.athleteId) {
    const athlete = await prisma.studentAthlete.findUnique({
      where: { id: metadata.athleteId },
    });
    if (!athlete) throw new AppError(422, 'VALIDATION_ERROR', 'Athlete does not exist');
  }
  if (metadata.teamId) {
    const team = await prisma.team.findUnique({ where: { id: metadata.teamId } });
    if (!team) throw new AppError(422, 'VALIDATION_ERROR', 'Team does not exist');
  }

  const ext = path.extname(file.originalname) || '';
  const storedName = `${randomUUID()}${ext}`;
  const absolutePath = path.join(UPLOAD_DIR, storedName);
  fs.writeFileSync(absolutePath, file.buffer);

  const fileType = mimeToFileType(file.mimetype);

  return prisma.document.create({
    data: {
      title,
      category: metadata.category as never,
      fileUrl: `/uploads/${storedName}`,
      fileName: file.originalname,
      fileType,
      fileSizeBytes: file.size,
      ownerType: metadata.ownerType as never,
      athleteId: metadata.athleteId,
      teamId: metadata.teamId,
      expiryDate: metadata.expiryDate ? new Date(metadata.expiryDate) : undefined,
      uploadedBy: userId,
      notes: metadata.notes,
    },
    include: {
      athlete: { select: { id: true, fullName: true, registrationNumber: true } },
      team: { select: { id: true, name: true } },
    },
  });
}

export async function updateDocument(id: string, input: UpdateDocumentInput) {
  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Document not found');

  return prisma.document.update({
    where: { id },
    data: {
      title: input.title,
      category: input.category,
      status: input.status,
      expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
      notes: input.notes,
    },
  });
}

export async function verifyDocument(id: string, isVerified: boolean, userId: string) {
  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Document not found');

  return prisma.document.update({
    where: { id },
    data: {
      isVerified,
      verifiedBy: userId,
      verifiedAt: isVerified ? new Date() : null,
    },
  });
}

export async function deleteDocument(id: string) {
  const existing = await prisma.document.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Document not found');

  const storedName = path.basename(existing.fileUrl);
  const absolutePath = path.join(UPLOAD_DIR, storedName);
  if (fs.existsSync(absolutePath)) {
    try {
      fs.unlinkSync(absolutePath);
    } catch {
      // best-effort cleanup
    }
  }

  await prisma.document.delete({ where: { id } });
}

export async function getAthleteDocumentChecklist(athleteId: string) {
  const athlete = await prisma.studentAthlete.findUnique({
    where: { id: athleteId },
  });
  if (!athlete) throw new AppError(404, 'NOT_FOUND', 'Athlete not found');

  const documents = await prisma.document.findMany({
    where: { athleteId, status: { not: 'ARCHIVED' } },
    orderBy: { uploadedAt: 'desc' },
  });

  return {
    athlete: {
      id: athlete.id,
      fullName: athlete.fullName,
      registrationNumber: athlete.registrationNumber,
    },
    documents,
  };
}
