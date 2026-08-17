import { Prisma, ProspectStatus, TrialStatus, SelectionOutcome } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import type {
  CreateProspectInput,
  UpdateProspectInput,
  CreateTrialInput,
  UpdateTrialInput,
  SubmitAssessmentInput,
} from './recruitment.schema';

function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  return new Date(value);
}

function toDecimal(value?: number | null): Decimal | undefined {
  return value !== null && value !== undefined ? new Decimal(value) : undefined;
}

// ─── Prospects ─────────────────────────────────────────────────────────────────

export async function listProspects(filters: {
  sport?: string;
  status?: ProspectStatus;
  search?: string;
  page: number;
  pageSize: number;
}) {
  const where: Prisma.ProspectWhereInput = {};
  if (filters.sport) where.sportId = filters.sport;
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search } },
      { email: { contains: filters.search } },
      { schoolOrInstitution: { contains: filters.search } },
    ];
  }

  const [prospects, total] = await Promise.all([
    prisma.prospect.findMany({
      where,
      include: {
        sport: { select: { id: true, name: true, gender: true } },
        trialEntries: { include: { trial: true } },
        assessments: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.prospect.count({ where }),
  ]);

  return {
    prospects,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}

export async function getProspect(id: string) {
  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: {
      sport: true,
      trialEntries: { include: { trial: true } },
      assessments: {
        include: { trial: { select: { id: true, trialDate: true, venue: true } } },
      },
      recruitment: true,
    },
  });
  if (!prospect) throw new AppError(404, 'NOT_FOUND', 'Prospect not found');
  return prospect;
}

export async function createProspect(input: CreateProspectInput, userId: string) {
  const sport = await prisma.sport.findUnique({ where: { id: input.sportId } });
  if (!sport || !sport.isActive) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Sport does not exist or is inactive');
  }

  return prisma.prospect.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth ? toDate(input.dateOfBirth) : undefined,
      schoolOrInstitution: input.schoolOrInstitution,
      programmeApplied: input.programmeApplied,
      sportId: input.sportId,
      position: input.position,
      previousLevel: input.previousLevel,
      previousClubs: input.previousClubs,
      previousAchievements: input.previousAchievements,
      referredBy: input.referredBy,
      source: input.source,
      status: input.status,
      notes: input.notes,
      createdBy: userId,
    },
    include: { sport: true },
  });
}

export async function updateProspect(id: string, input: UpdateProspectInput) {
  const existing = await prisma.prospect.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Prospect not found');

  return prisma.prospect.update({
    where: { id },
    data: {
      fullName: input.fullName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth ? toDate(input.dateOfBirth) : undefined,
      schoolOrInstitution: input.schoolOrInstitution,
      programmeApplied: input.programmeApplied,
      sportId: input.sportId,
      position: input.position,
      previousLevel: input.previousLevel,
      previousClubs: input.previousClubs,
      previousAchievements: input.previousAchievements,
      referredBy: input.referredBy,
      source: input.source,
      status: input.status,
      notes: input.notes,
    },
    include: { sport: true },
  });
}

export async function deleteProspect(id: string) {
  const existing = await prisma.prospect.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Prospect not found');
  await prisma.prospect.delete({ where: { id } });
}

// ─── Trials ────────────────────────────────────────────────────────────────────

export async function listTrials(filters: {
  sport?: string;
  status?: TrialStatus;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}) {
  const where: Prisma.TrialWhereInput = {};
  if (filters.sport) where.sportId = filters.sport;
  if (filters.status) where.status = filters.status;
  if (filters.from || filters.to) {
    where.trialDate = {
      ...(filters.from ? { gte: toDate(filters.from) } : {}),
      ...(filters.to ? { lte: toDate(filters.to) } : {}),
    };
  }

  const [trials, total] = await Promise.all([
    prisma.trial.findMany({
      where,
      include: {
        sport: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
        season: { select: { id: true, name: true } },
        conductedByUser: { select: { id: true, fullName: true } },
        _count: { select: { participants: true, assessments: true } },
      },
      orderBy: { trialDate: 'desc' },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.trial.count({ where }),
  ]);

  return {
    trials,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}

export async function getTrial(id: string) {
  const trial = await prisma.trial.findUnique({
    where: { id },
    include: {
      sport: true,
      team: true,
      season: true,
      conductedByUser: { select: { id: true, fullName: true } },
      participants: {
        include: { prospect: { include: { sport: true } } },
      },
      assessments: {
        include: {
          prospect: { select: { id: true, fullName: true } },
          assessedByUser: { select: { id: true, fullName: true } },
        },
      },
    },
  });
  if (!trial) throw new AppError(404, 'NOT_FOUND', 'Trial not found');
  return trial;
}

export async function createTrial(input: CreateTrialInput, userId: string) {
  const sport = await prisma.sport.findUnique({ where: { id: input.sportId } });
  if (!sport || !sport.isActive) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Sport does not exist or is inactive');
  }

  const data: Prisma.TrialUncheckedCreateInput = {
    sportId: input.sportId,
    teamId: input.teamId,
    trialDate: toDate(input.trialDate),
    startTime: input.startTime,
    venue: input.venue,
    conductedBy: input.conductedBy,
    seasonId: input.seasonId,
    description: input.description,
    status: input.status,
    createdBy: userId,
  };

  if (input.prospectIds && input.prospectIds.length > 0) {
    data.participants = {
      create: input.prospectIds.map((prospectId) => ({ prospectId })),
    };
  }

  return prisma.trial.create({
    data,
    include: { sport: true, participants: true },
  });
}

export async function updateTrial(id: string, input: UpdateTrialInput) {
  const existing = await prisma.trial.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Trial not found');

  return prisma.trial.update({
    where: { id },
    data: {
      trialDate: input.trialDate ? toDate(input.trialDate) : undefined,
      startTime: input.startTime,
      venue: input.venue,
      conductedBy: input.conductedBy,
      description: input.description,
      status: input.status,
    },
    include: { sport: true },
  });
}

export async function addTrialParticipants(id: string, prospectIds: string[]) {
  const trial = await prisma.trial.findUnique({ where: { id } });
  if (!trial) throw new AppError(404, 'NOT_FOUND', 'Trial not found');

  const validProspects = await prisma.prospect.count({
    where: { id: { in: prospectIds } },
  });
  if (validProspects !== prospectIds.length) {
    throw new AppError(422, 'VALIDATION_ERROR', 'One or more prospects do not exist');
  }

  await prisma.trialParticipant.createMany({
    data: prospectIds.map((prospectId) => ({ trialId: id, prospectId })),
    skipDuplicates: true,
  });

  return getTrial(id);
}

export async function updateTrialAttendance(
  id: string,
  attendance: { prospectId: string; attended: boolean }[]
) {
  const trial = await prisma.trial.findUnique({ where: { id } });
  if (!trial) throw new AppError(404, 'NOT_FOUND', 'Trial not found');

  for (const entry of attendance) {
    await prisma.trialParticipant.update({
      where: { trialId_prospectId: { trialId: id, prospectId: entry.prospectId } },
      data: { attended: entry.attended },
    });
  }

  return getTrial(id);
}

// ─── Assessments ───────────────────────────────────────────────────────────────

export async function submitAssessment(
  trialId: string,
  input: SubmitAssessmentInput,
  userId: string
) {
  const participant = await prisma.trialParticipant.findUnique({
    where: { trialId_prospectId: { trialId, prospectId: input.prospectId } },
  });
  if (!participant) {
    throw new AppError(
      422,
      'VALIDATION_ERROR',
      'Prospect is not a participant in this trial'
    );
  }

  const scores = [
    input.scoreTechnical,
    input.scorePhysical,
    input.scoreSpeed,
    input.scoreTactical,
    input.scoreTeamwork,
    input.scoreDiscipline,
    input.scoreAcademic,
  ].filter((s): s is number => s !== null && s !== undefined);

  const overall = scores.length > 0
    ? new Decimal(scores.reduce((a, b) => a + b, 0) / scores.length).toDecimalPlaces(1)
    : undefined;

  const assessment = await prisma.trialAssessment.upsert({
    where: { trialId_prospectId: { trialId, prospectId: input.prospectId } },
    update: {
      assessedBy: userId,
      scoreTechnical: toDecimal(input.scoreTechnical),
      scorePhysical: toDecimal(input.scorePhysical),
      scoreSpeed: toDecimal(input.scoreSpeed),
      scoreTactical: toDecimal(input.scoreTactical),
      scoreTeamwork: toDecimal(input.scoreTeamwork),
      scoreDiscipline: toDecimal(input.scoreDiscipline),
      scoreAcademic: toDecimal(input.scoreAcademic),
      overallScore: overall,
      recommendedPosition: input.recommendedPosition,
      recommendation: input.recommendation,
      selectionOutcome: input.selectionOutcome,
      coachNotes: input.coachNotes,
    },
    create: {
      trialId,
      prospectId: input.prospectId,
      assessedBy: userId,
      scoreTechnical: toDecimal(input.scoreTechnical),
      scorePhysical: toDecimal(input.scorePhysical),
      scoreSpeed: toDecimal(input.scoreSpeed),
      scoreTactical: toDecimal(input.scoreTactical),
      scoreTeamwork: toDecimal(input.scoreTeamwork),
      scoreDiscipline: toDecimal(input.scoreDiscipline),
      scoreAcademic: toDecimal(input.scoreAcademic),
      overallScore: overall,
      recommendedPosition: input.recommendedPosition,
      recommendation: input.recommendation,
      selectionOutcome: input.selectionOutcome,
      coachNotes: input.coachNotes,
    },
    include: { prospect: { select: { id: true, fullName: true } } },
  });

  if (input.selectionOutcome === SelectionOutcome.SELECTED) {
    await prisma.prospect.update({
      where: { id: input.prospectId },
      data: { status: ProspectStatus.SELECTED },
    });
  } else if (input.selectionOutcome === SelectionOutcome.REJECTED) {
    await prisma.prospect.update({
      where: { id: input.prospectId },
      data: { status: ProspectStatus.REJECTED },
    });
  }

  return assessment;
}

// ─── Enrollment ────────────────────────────────────────────────────────────────

export async function enrollProspect(
  prospectId: string,
  input: { registrationNumber: string; yearOfStudy?: number; programme?: string; faculty?: string },
  userId: string
) {
  const prospect = await prisma.prospect.findUnique({
    where: { id: prospectId },
    include: { sport: true, assessments: true },
  });
  if (!prospect) throw new AppError(404, 'NOT_FOUND', 'Prospect not found');

  const existingReg = await prisma.studentAthlete.findUnique({
    where: { registrationNumber: input.registrationNumber },
  });
  if (existingReg) {
    throw new AppError(409, 'CONFLICT', 'Registration number already in use');
  }

  const existingUser = prospect.email
    ? await prisma.user.findUnique({ where: { email: prospect.email } })
    : null;

  const user = existingUser;

  const assessment = prospect.assessments[0];

  const result = await prisma.$transaction(async (tx) => {
    const athlete = await tx.studentAthlete.create({
      data: {
        userId: user?.id,
        fullName: prospect.fullName,
        registrationNumber: input.registrationNumber,
        gender: prospect.gender,
        dateOfBirth: prospect.dateOfBirth,
        email: prospect.email,
        phoneNumber: prospect.phoneNumber,
        yearOfStudy: input.yearOfStudy,
        programme: input.programme ?? prospect.programmeApplied,
        faculty: input.faculty,
        athleteType: 'REGULAR',
      },
    });

    await tx.sportAffiliation.create({
      data: {
        athleteId: athlete.id,
        sportId: prospect.sportId,
        position: prospect.position,
      },
    });

    const recruitment = await tx.recruitmentRecord.create({
      data: {
        athleteId: athlete.id,
        prospectId: prospect.id,
        trialId: assessment?.trialId,
        assessmentId: assessment?.id,
        enrolledDate: new Date(),
        enrolledBy: userId,
      },
    });

    await tx.prospect.update({
      where: { id: prospectId },
      data: { status: ProspectStatus.ENROLLED },
    });

    return { athlete, recruitment };
  });

  return result;
}

export async function getRecruitmentReport() {
  const [prospectsByStatus, trialsConducted, selected, enrolled, totalProspects, totalTrials] =
    await Promise.all([
      prisma.prospect.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.trial.count(),
      prisma.prospect.count({ where: { status: ProspectStatus.SELECTED } }),
      prisma.prospect.count({ where: { status: ProspectStatus.ENROLLED } }),
      prisma.prospect.count(),
      prisma.trial.count(),
    ]);

  return {
    totalProspects,
    totalTrials,
    trialsConducted,
    selected,
    enrolled,
    conversionRate: totalProspects > 0 ? (enrolled / totalProspects) * 100 : 0,
    byStatus: prospectsByStatus,
  };
}
