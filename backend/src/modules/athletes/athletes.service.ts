import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import {
  CreateAthleteInput,
  UpdateAthleteInput,
  ListAthletesQuery,
  AffiliationInput,
} from './athletes.schema';

const ATHLETE_INCLUDE = {
  affiliations: {
    include: { sport: true, team: true },
  },
  medicalDeclaration: true,
} satisfies Prisma.StudentAthleteInclude;

const DEFAULTS = {
  page: 1,
  pageSize: 20,
} as const;

export function normalizeRegistrationNumber(value: string): string {
  return value.trim().toUpperCase();
}

export async function listAthletes(query: ListAthletesQuery) {
  const page = query.page ?? DEFAULTS.page;
  const pageSize = query.pageSize ?? DEFAULTS.pageSize;

  const where: Prisma.StudentAthleteWhereInput = {
    deletedAt: null,
  };

  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search } },
      { registrationNumber: { contains: query.search.toUpperCase() } },
      { email: { contains: query.search } },
    ];
  }
  if (query.athleteType) where.athleteType = query.athleteType;
  if (query.status) where.status = query.status;
  if (query.gender) where.gender = query.gender;
  if (query.yearOfStudy) where.yearOfStudy = query.yearOfStudy;
  if (query.faculty) where.faculty = { contains: query.faculty };
  if (query.sport || query.team) {
    where.affiliations = {
      some: {
        ...(query.sport ? { sportId: query.sport } : {}),
        ...(query.team ? { teamId: query.team } : {}),
      },
    };
  }

  const [athletes, total] = await Promise.all([
    prisma.studentAthlete.findMany({
      where,
      include: ATHLETE_INCLUDE,
      orderBy: { fullName: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.studentAthlete.count({ where }),
  ]);

  return {
    athletes,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getAthleteById(id: string) {
  const athlete = await prisma.studentAthlete.findFirst({
    where: { id, deletedAt: null },
    include: ATHLETE_INCLUDE,
  });

  if (!athlete) {
    throw new AppError(404, 'NOT_FOUND', 'Athlete not found');
  }

  return athlete;
}

export async function getAthleteProfile(id: string) {
  const athlete = await getAthleteById(id);

  return {
    athlete,
    academicRecords: [], // populated in Phase 5
    scholarships: [],    // populated in Phase 6
    contracts: [],       // populated in Phase 6
    documents: [],       // populated in Phase 10
  };
}

export async function createAthlete(input: CreateAthleteInput) {
  await validateAffiliations(input.affiliations);

  try {
    return await prisma.studentAthlete.create({
      data: {
        userId: input.userId ?? null,
        fullName: input.fullName,
        registrationNumber: normalizeRegistrationNumber(input.registrationNumber),
        gender: input.gender,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        email: input.email?.toLowerCase() ?? null,
        phoneNumber: input.phoneNumber ?? null,
        yearOfStudy: input.yearOfStudy ?? null,
        programme: input.programme ?? null,
        faculty: input.faculty ?? null,
        athleteType: input.athleteType ?? 'REGULAR',
        status: input.status ?? 'ACTIVE',
        profilePhotoUrl: input.profilePhotoUrl ?? null,
        medicalDeclaration: input.medicalDeclaration
          ? {
              create: {
                hasCondition: input.medicalDeclaration.hasCondition,
                conditionDescription: input.medicalDeclaration.conditionDescription ?? null,
              },
            }
          : undefined,
        affiliations: input.affiliations?.length
          ? {
              create: input.affiliations.map((a) => toAffiliationData(a)),
            }
          : undefined,
      },
      include: ATHLETE_INCLUDE,
    });
  } catch (err) {
    throw mapPrismaError(err);
  }
}

export async function updateAthlete(id: string, input: UpdateAthleteInput) {
  await getAthleteById(id);
  await validateAffiliations(input.affiliations);

  try {
    return await prisma.$transaction(async (tx) => {
      const { medicalDeclaration, affiliations, ...rest } = input;

      const athlete = await tx.studentAthlete.update({
        where: { id },
        data: {
          ...rest,
          ...(rest.registrationNumber
            ? { registrationNumber: normalizeRegistrationNumber(rest.registrationNumber) }
            : {}),
          ...(rest.email !== undefined ? { email: rest.email?.toLowerCase() ?? null } : {}),
          ...(rest.dateOfBirth !== undefined
            ? { dateOfBirth: rest.dateOfBirth ? new Date(rest.dateOfBirth) : null }
            : {}),
          athleteType: rest.athleteType,
          status: rest.status,
        },
        include: ATHLETE_INCLUDE,
      });

      if (medicalDeclaration) {
        await tx.medicalDeclaration.upsert({
          where: { athleteId: id },
          update: {
            hasCondition: medicalDeclaration.hasCondition,
            conditionDescription: medicalDeclaration.conditionDescription ?? null,
          },
          create: {
            athleteId: id,
            hasCondition: medicalDeclaration.hasCondition,
            conditionDescription: medicalDeclaration.conditionDescription ?? null,
          },
        });
      }

      if (affiliations) {
        await tx.sportAffiliation.deleteMany({ where: { athleteId: id } });
        if (affiliations.length) {
          await tx.sportAffiliation.createMany({
            data: affiliations.map((a) => ({ athleteId: id, ...toAffiliationData(a) })),
          });
        }
      }
      return tx.studentAthlete.findUnique({
        where: { id },
        include: ATHLETE_INCLUDE,
      });
    });
  } catch (err) {
    throw mapPrismaError(err);
  }
}

export async function deleteAthlete(id: string): Promise<void> {
  await getAthleteById(id);
  await prisma.studentAthlete.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

async function validateAffiliations(affiliations?: AffiliationInput[] | null): Promise<void> {
  if (!affiliations?.length) return;

  const sportIds = [...new Set(affiliations.map((a) => a.sportId))];
  const sportCount = await prisma.sport.count({
    where: { id: { in: sportIds }, isActive: true },
  });
  if (sportCount !== sportIds.length) {
    throw new AppError(422, 'VALIDATION_ERROR', 'One or more sports do not exist or are inactive');
  }

  const teamIds = [...new Set(affiliations.map((a) => a.teamId).filter((t): t is string => !!t))];
  if (teamIds.length) {
    const teams = await prisma.team.findMany({
      where: { id: { in: teamIds }, isActive: true, deletedAt: null },
    });
    if (teams.length !== teamIds.length) {
      throw new AppError(422, 'VALIDATION_ERROR', 'One or more teams do not exist or are inactive');
    }
    for (const a of affiliations) {
      if (a.teamId && !teams.some((t) => t.id === a.teamId && t.sportId === a.sportId)) {
        throw new AppError(
          422,
          'VALIDATION_ERROR',
          `Team ${a.teamId} does not belong to sport ${a.sportId}`
        );
      }
    }
  }
}

type AffiliationCreateData = Omit<Prisma.SportAffiliationUncheckedCreateInput, 'athleteId'>;

function toAffiliationData(a: AffiliationInput): AffiliationCreateData {
  return {
    sportId: a.sportId,
    teamId: a.teamId ?? null,
    position: a.position ?? null,
    jerseyNumber: a.jerseyNumber ?? null,
    isCaptain: a.isCaptain ?? false,
    isViceCaptain: a.isViceCaptain ?? false,
    joinedDate: a.joinedDate ? new Date(a.joinedDate) : null,
    status: a.status ?? 'ACTIVE',
    notes: a.notes ?? null,
  };
}

function mapPrismaError(err: unknown): Error {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = err.meta?.target;
      const fields = Array.isArray(target) ? target.join(', ') : typeof target === 'string' ? target : 'record';
      return new AppError(409, 'CONFLICT', `An athlete with this ${fields} already exists`);
    }
  }
  return err as Error;
}
