import { Prisma, ScholarshipStatus, ContractStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import type {
  CreateScholarshipInput,
  UpdateScholarshipInput,
  CreateContractInput,
  UpdateContractInput,
} from './scholarships.schema';

function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  return new Date(value);
}

function toDecimal(value?: number): Decimal | undefined {
  return value !== undefined ? new Decimal(value) : undefined;
}

// ─── Scholarships ──────────────────────────────────────────────────────────────

export async function listScholarships(filters: {
  athleteId?: string;
  status?: ScholarshipStatus;
  type?: string;
  expiringWithin?: number;
  page: number;
  pageSize: number;
}) {
  const where: Prisma.ScholarshipWhereInput = {};
  if (filters.athleteId) where.athleteId = filters.athleteId;
  if (filters.status) where.status = filters.status;
  if (filters.type) where.scholarshipType = filters.type as never;
  if (filters.expiringWithin !== undefined) {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + filters.expiringWithin);
    where.AND = [{ endDate: { gte: from } }, { endDate: { lte: to } }];
  }

  const [scholarships, total] = await Promise.all([
    prisma.scholarship.findMany({
      where,
      include: {
        athlete: {
          select: {
            id: true,
            fullName: true,
            registrationNumber: true,
            faculty: true,
            programme: true,
          },
        },
        renewals: { orderBy: { renewalNumber: 'desc' } },
      },
      orderBy: { endDate: 'asc' },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.scholarship.count({ where }),
  ]);

  return {
    scholarships,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}

export async function getScholarship(id: string) {
  const scholarship = await prisma.scholarship.findUnique({
    where: { id },
    include: {
      athlete: {
        select: {
          id: true,
          fullName: true,
          registrationNumber: true,
          faculty: true,
          programme: true,
          status: true,
        },
      },
      renewals: {
        orderBy: { renewalNumber: 'desc' },
        include: { renewedByUser: { select: { id: true, fullName: true } } },
      },
      contracts: true,
    },
  });
  if (!scholarship) throw new AppError(404, 'NOT_FOUND', 'Scholarship not found');
  return scholarship;
}

export async function createScholarship(input: CreateScholarshipInput, userId: string) {
  const athlete = await prisma.studentAthlete.findUnique({
    where: { id: input.athleteId },
  });
  if (!athlete) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Athlete does not exist');
  }

  const scholarship = await prisma.scholarship.create({
    data: {
      athleteId: input.athleteId,
      scholarshipType: input.scholarshipType,
      sponsorName: input.sponsorName,
      coverageDescription: input.coverageDescription,
      coveragePercentage: toDecimal(input.coveragePercentage),
      startDate: toDate(input.startDate),
      endDate: toDate(input.endDate),
      renewable: input.renewable ?? false,
      academicRequirementGpa: toDecimal(input.academicRequirementGpa),
      sportsRequirement: input.sportsRequirement,
      status: input.status ?? ScholarshipStatus.PENDING,
      awardedBy: userId,
      notes: input.notes,
    },
    include: { athlete: { select: { id: true, fullName: true } } },
  });

  return scholarship;
}

export async function updateScholarship(id: string, input: UpdateScholarshipInput) {
  const existing = await prisma.scholarship.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Scholarship not found');

  return prisma.scholarship.update({
    where: { id },
    data: {
      scholarshipType: input.scholarshipType,
      sponsorName: input.sponsorName,
      coverageDescription: input.coverageDescription,
      coveragePercentage: toDecimal(input.coveragePercentage),
      startDate: input.startDate ? toDate(input.startDate) : undefined,
      endDate: input.endDate ? toDate(input.endDate) : undefined,
      renewable: input.renewable,
      academicRequirementGpa: toDecimal(input.academicRequirementGpa),
      sportsRequirement: input.sportsRequirement,
      status: input.status,
      notes: input.notes,
    },
    include: { athlete: { select: { id: true, fullName: true } } },
  });
}

export async function renewScholarship(
  id: string,
  input: { newEndDate: string | Date; notes?: string },
  userId: string
) {
  const scholarship = await prisma.scholarship.findUnique({ where: { id } });
  if (!scholarship) throw new AppError(404, 'NOT_FOUND', 'Scholarship not found');

  const newEndDate = toDate(input.newEndDate);
  const renewalNumber = scholarship.renewalCount + 1;

  const renewal = await prisma.$transaction(async (tx) => {
    await tx.scholarshipRenewal.create({
      data: {
        scholarshipId: id,
        previousEndDate: scholarship.endDate,
        newEndDate,
        renewedBy: userId,
        gpaAtRenewal: scholarship.academicRequirementGpa,
        notes: input.notes,
        renewalNumber,
      },
    });

    return tx.scholarship.update({
      where: { id },
      data: {
        endDate: newEndDate,
        status: ScholarshipStatus.RENEWED,
        renewalCount: renewalNumber,
      },
      include: { athlete: { select: { id: true, fullName: true } } },
    });
  });

  return renewal;
}

export async function revokeScholarship(id: string, reason: string, userId: string) {
  const scholarship = await prisma.scholarship.findUnique({ where: { id } });
  if (!scholarship) throw new AppError(404, 'NOT_FOUND', 'Scholarship not found');

  return prisma.scholarship.update({
    where: { id },
    data: {
      status: ScholarshipStatus.REVOKED,
      revokedBy: userId,
      revokedAt: new Date(),
      revocationReason: reason,
    },
    include: { athlete: { select: { id: true, fullName: true } } },
  });
}

export async function getScholarshipDashboard() {
  const today = new Date();
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);

  const [active, expiring, activeScholarships, revokedThisSemester, total] =
    await Promise.all([
      prisma.scholarship.count({ where: { status: ScholarshipStatus.ACTIVE } }),
      prisma.scholarship.count({
        where: {
          status: ScholarshipStatus.ACTIVE,
          endDate: { gte: today, lte: in30 },
        },
      }),
      prisma.scholarship.findMany({
        where: { status: ScholarshipStatus.ACTIVE },
        select: {
          academicRequirementGpa: true,
          athlete: {
            select: {
              academicRecords: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { gpa: true },
              },
            },
          },
        },
      }),
      prisma.scholarship.count({ where: { status: ScholarshipStatus.REVOKED } }),
      prisma.scholarship.count(),
    ]);

  const atRisk = activeScholarships.filter((s) => {
    const min = Number(s.academicRequirementGpa ?? 2.0);
    const latestGpa = s.athlete.academicRecords[0]?.gpa;
    return latestGpa !== null && latestGpa !== undefined && Number(latestGpa) < min;
  }).length;

  return {
    active,
    expiringWithin30Days: expiring,
    atAcademicRisk: atRisk,
    revokedThisSemester,
    total,
  };
}

// ─── Contracts ─────────────────────────────────────────────────────────────────

export async function listContracts(filters: {
  athleteId?: string;
  status?: ContractStatus;
  expiringWithin?: number;
  page: number;
  pageSize: number;
}) {
  const where: Prisma.AthleteContractWhereInput = {};
  if (filters.athleteId) where.athleteId = filters.athleteId;
  if (filters.status) where.status = filters.status;
  if (filters.expiringWithin !== undefined) {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + filters.expiringWithin);
    where.AND = [{ endDate: { gte: from } }, { endDate: { lte: to } }];
  }

  const [contracts, total] = await Promise.all([
    prisma.athleteContract.findMany({
      where,
      include: {
        athlete: {
          select: {
            id: true,
            fullName: true,
            registrationNumber: true,
            faculty: true,
          },
        },
        scholarship: { select: { id: true, scholarshipType: true, sponsorName: true } },
      },
      orderBy: { endDate: 'asc' },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.athleteContract.count({ where }),
  ]);

  return {
    contracts,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}

export async function getContract(id: string) {
  const contract = await prisma.athleteContract.findUnique({
    where: { id },
    include: {
      athlete: { select: { id: true, fullName: true, registrationNumber: true } },
      scholarship: true,
      createdByUser: { select: { id: true, fullName: true } },
      terminatedByUser: { select: { id: true, fullName: true } },
    },
  });
  if (!contract) throw new AppError(404, 'NOT_FOUND', 'Contract not found');
  return contract;
}

export async function createContract(input: CreateContractInput, userId: string) {
  const athlete = await prisma.studentAthlete.findUnique({
    where: { id: input.athleteId },
  });
  if (!athlete) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Athlete does not exist');
  }

  if (input.scholarshipId) {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: input.scholarshipId },
    });
    if (!scholarship || scholarship.athleteId !== input.athleteId) {
      throw new AppError(
        422,
        'VALIDATION_ERROR',
        'Scholarship does not exist or belongs to a different athlete'
      );
    }
  }

  return prisma.athleteContract.create({
    data: {
      athleteId: input.athleteId,
      contractType: input.contractType,
      startDate: toDate(input.startDate),
      endDate: toDate(input.endDate),
      termsSummary: input.termsSummary,
      hasAccompanyingScholarship: input.hasAccompanyingScholarship ?? false,
      scholarshipId: input.scholarshipId,
      signedByAthlete: input.signedByAthlete ?? false,
      signedAt: input.signedAt ? toDate(input.signedAt) : undefined,
      status: input.status ?? ContractStatus.ACTIVE,
      createdBy: userId,
      notes: input.notes,
    },
    include: { athlete: { select: { id: true, fullName: true } } },
  });
}

export async function updateContract(id: string, input: UpdateContractInput) {
  const existing = await prisma.athleteContract.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Contract not found');

  if (input.scholarshipId && input.scholarshipId !== existing.scholarshipId) {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: input.scholarshipId },
    });
    if (!scholarship || scholarship.athleteId !== existing.athleteId) {
      throw new AppError(
        422,
        'VALIDATION_ERROR',
        'Scholarship does not exist or belongs to a different athlete'
      );
    }
  }

  return prisma.athleteContract.update({
    where: { id },
    data: {
      contractType: input.contractType,
      startDate: input.startDate ? toDate(input.startDate) : undefined,
      endDate: input.endDate ? toDate(input.endDate) : undefined,
      termsSummary: input.termsSummary,
      hasAccompanyingScholarship: input.hasAccompanyingScholarship,
      scholarshipId: input.scholarshipId,
      signedByAthlete: input.signedByAthlete,
      signedAt: input.signedAt ? toDate(input.signedAt) : undefined,
      status: input.status,
      notes: input.notes,
    },
    include: { athlete: { select: { id: true, fullName: true } } },
  });
}

export async function terminateContract(
  id: string,
  input: { terminationDate?: string | Date; reason: string },
  userId: string
) {
  const contract = await prisma.athleteContract.findUnique({ where: { id } });
  if (!contract) throw new AppError(404, 'NOT_FOUND', 'Contract not found');

  return prisma.athleteContract.update({
    where: { id },
    data: {
      status: ContractStatus.TERMINATED,
      terminatedBy: userId,
      terminationDate: input.terminationDate ? toDate(input.terminationDate) : new Date(),
      terminationReason: input.reason,
    },
    include: { athlete: { select: { id: true, fullName: true } } },
  });
}
