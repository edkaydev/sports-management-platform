import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import type { RecordPerformanceInput } from './performance.schema';

// ─── Player match performance ─────────────────────────────────────────────────

export async function recordPerformance(data: RecordPerformanceInput, userId: string) {
  const match = await prisma.match.findUnique({ where: { id: data.matchId } });
  if (!match) throw new AppError(404, 'NOT_FOUND', 'Match not found');

  const athlete = await prisma.studentAthlete.findUnique({ where: { id: data.athleteId } });
  if (!athlete) throw new AppError(404, 'NOT_FOUND', 'Student-athlete not found');

  const team = await prisma.team.findUnique({ where: { id: data.teamId } });
  if (!team) throw new AppError(404, 'NOT_FOUND', 'Team not found');

  if (match.homeTeamId !== data.teamId && match.awayTeamId !== data.teamId) {
    throw new AppError(400, 'VALIDATION', 'Team is not part of this match');
  }

  const inMatch =
    match.homeTeamId === data.teamId
      ? match.homeTeamId
      : match.awayTeamId === data.teamId
        ? match.awayTeamId
        : null;

  if (data.athleteId && !inMatch) {
    throw new AppError(400, 'VALIDATION', 'Team is not part of this match');
  }

  return prisma.playerMatchPerformance.upsert({
    where: { matchId_athleteId: { matchId: data.matchId, athleteId: data.athleteId } },
    create: {
      matchId: data.matchId,
      athleteId: data.athleteId,
      teamId: data.teamId,
      minutesPlayed: data.minutesPlayed,
      points: data.points ?? 0,
      assists: data.assists ?? 0,
      rebounds: data.rebounds ?? 0,
      steals: data.steals ?? 0,
      blocks: data.blocks ?? 0,
      goals: data.goals ?? 0,
      shotsOnTarget: data.shotsOnTarget,
      saves: data.saves ?? 0,
      tackles: data.tackles ?? 0,
      interceptions: data.interceptions ?? 0,
      passesCompleted: data.passesCompleted,
      passesAttempted: data.passesAttempted,
      fouls: data.fouls ?? 0,
      yellowCards: data.yellowCards ?? 0,
      redCards: data.redCards ?? 0,
      sprints: data.sprints ?? 0,
      distanceCoveredKm: data.distanceCoveredKm,
      maxSpeedKph: data.maxSpeedKph,
      rating: data.rating,
      notes: data.notes,
      recordedBy: userId,
    },
    update: {
      teamId: data.teamId,
      minutesPlayed: data.minutesPlayed,
      points: data.points,
      assists: data.assists,
      rebounds: data.rebounds,
      steals: data.steals,
      blocks: data.blocks,
      goals: data.goals,
      shotsOnTarget: data.shotsOnTarget,
      saves: data.saves,
      tackles: data.tackles,
      interceptions: data.interceptions,
      passesCompleted: data.passesCompleted,
      passesAttempted: data.passesAttempted,
      fouls: data.fouls,
      yellowCards: data.yellowCards,
      redCards: data.redCards,
      sprints: data.sprints,
      distanceCoveredKm: data.distanceCoveredKm,
      maxSpeedKph: data.maxSpeedKph,
      rating: data.rating,
      notes: data.notes,
    },
  });
}

export async function listMatchPerformances(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new AppError(404, 'NOT_FOUND', 'Match not found');

  return prisma.playerMatchPerformance.findMany({
    where: { matchId },
    include: {
      athlete: { select: { id: true, fullName: true, registrationNumber: true } },
      team: { select: { id: true, name: true, shortName: true } },
    },
    orderBy: { rating: 'desc' },
  });
}

export async function listAthletePerformances(athleteId: string) {
  const athlete = await prisma.studentAthlete.findUnique({ where: { id: athleteId } });
  if (!athlete) throw new AppError(404, 'NOT_FOUND', 'Student-athlete not found');

  const performances = await prisma.playerMatchPerformance.findMany({
    where: { athleteId },
    include: {
      match: {
        select: {
          id: true,
          matchNumber: true,
          scheduledDate: true,
          event: { select: { name: true } },
        },
      },
      team: { select: { id: true, name: true, shortName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totals = performances.reduce(
    (acc, p) => {
      acc.minutes += p.minutesPlayed;
      acc.goals += p.goals ?? 0;
      acc.assists += p.assists ?? 0;
      acc.points += p.points ?? 0;
      acc.appearances += 1;
      if (p.rating) {
        acc.ratingSum += Number(p.rating);
        acc.ratedGames += 1;
      }
      return acc;
    },
    { minutes: 0, goals: 0, assists: 0, points: 0, appearances: 0, ratingSum: 0, ratedGames: 0 }
  );

  return {
    athlete: { id: athlete.id, fullName: athlete.fullName, registrationNumber: athlete.registrationNumber },
    summary: {
      appearances: totals.appearances,
      totalMinutes: totals.minutes,
      totalGoals: totals.goals,
      totalAssists: totals.assists,
      totalPoints: totals.points,
      averageRating: totals.ratedGames > 0 ? Math.round((totals.ratingSum / totals.ratedGames) * 10) / 10 : null,
    },
    performances,
  };
}

export async function getPerformance(id: string) {
  const performance = await prisma.playerMatchPerformance.findUnique({
    where: { id },
    include: {
      match: { select: { id: true, matchNumber: true, scheduledDate: true } },
      athlete: { select: { id: true, fullName: true, registrationNumber: true } },
      team: { select: { id: true, name: true, shortName: true } },
    },
  });
  if (!performance) throw new AppError(404, 'NOT_FOUND', 'Performance record not found');
  return performance;
}

// ─── Training sessions ────────────────────────────────────────────────────────

export async function createTrainingSession(data: {
  sportId: string;
  teamId?: string;
  seasonId?: string;
  title: string;
  location?: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  focusAreas?: string;
  intensity?: string;
  status?: string;
}, userId: string) {
  const sport = await prisma.sport.findUnique({ where: { id: data.sportId } });
  if (!sport) throw new AppError(404, 'NOT_FOUND', 'Sport not found');
  if (data.teamId) {
    const team = await prisma.team.findUnique({ where: { id: data.teamId } });
    if (!team) throw new AppError(404, 'NOT_FOUND', 'Team not found');
  }

  return prisma.trainingSession.create({
    data: {
      sportId: data.sportId,
      teamId: data.teamId,
      seasonId: data.seasonId,
      title: data.title,
      location: data.location,
      sessionDate: new Date(data.sessionDate),
      startTime: data.startTime,
      endTime: data.endTime,
      focusAreas: data.focusAreas,
      intensity: data.intensity,
      status: data.status as never ?? 'SCHEDULED',
      createdBy: userId,
    },
  });
}

export async function listTrainingSessions(filters: { teamId?: string; sportId?: string }) {
  const where: Prisma.TrainingSessionWhereInput = {};
  if (filters.teamId) where.teamId = filters.teamId;
  if (filters.sportId) where.sportId = filters.sportId;

  return prisma.trainingSession.findMany({
    where,
    include: {
      sport: { select: { id: true, name: true } },
      team: { select: { id: true, name: true, shortName: true } },
      _count: { select: { attendance: true } },
    },
    orderBy: { sessionDate: 'desc' },
  });
}

export async function getTrainingSession(id: string) {
  const session = await prisma.trainingSession.findUnique({
    where: { id },
    include: {
      sport: { select: { id: true, name: true } },
      team: { select: { id: true, name: true, shortName: true } },
      attendance: {
        include: {
          athlete: { select: { id: true, fullName: true, registrationNumber: true } },
        },
      },
    },
  });
  if (!session) throw new AppError(404, 'NOT_FOUND', 'Training session not found');
  return session;
}

export async function updateTrainingSession(id: string, data: Record<string, unknown>) {
  const existing = await prisma.trainingSession.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Training session not found');

  return prisma.trainingSession.update({
    where: { id },
    data: {
      sportId: data.sportId as string | undefined,
      teamId: data.teamId as string | undefined,
      seasonId: data.seasonId as string | undefined,
      title: data.title as string | undefined,
      location: data.location as string | undefined,
      sessionDate: data.sessionDate ? new Date(data.sessionDate as string) : undefined,
      startTime: data.startTime as string | undefined,
      endTime: data.endTime as string | undefined,
      focusAreas: data.focusAreas as string | undefined,
      intensity: data.intensity as string | undefined,
      status: data.status as never,
    },
  });
}

export async function recordAttendance(
  sessionId: string,
  records: Array<{ athleteId: string; status: string; notes?: string }>,
  userId: string
) {
  const session = await prisma.trainingSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new AppError(404, 'NOT_FOUND', 'Training session not found');

  const athleteIds = records.map((r) => r.athleteId);
  const athletes = await prisma.studentAthlete.findMany({
    where: { id: { in: athleteIds } },
    select: { id: true },
  });
  if (athletes.length !== new Set(athleteIds).size) {
    throw new AppError(404, 'NOT_FOUND', 'One or more athletes not found');
  }

  for (const record of records) {
    await prisma.trainingAttendance.upsert({
      where: { sessionId_athleteId: { sessionId, athleteId: record.athleteId } },
      create: {
        sessionId,
        athleteId: record.athleteId,
        status: record.status as never,
        notes: record.notes,
        recordedBy: userId,
      },
      update: {
        status: record.status as never,
        notes: record.notes,
        recordedBy: userId,
      },
    });
  }

  return prisma.trainingAttendance.findMany({
    where: { sessionId },
    include: {
      athlete: { select: { id: true, fullName: true, registrationNumber: true } },
    },
  });
}
