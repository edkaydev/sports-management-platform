import { MatchStatus, Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { createNotificationsBulk } from '../notifications/notifications.service';
import type { CreateMatchInput, UpdateMatchInput } from './matches.schema';

function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  return new Date(value);
}

const matchInclude = {
  event: { select: { id: true, name: true } },
  sport: { select: { id: true, name: true } },
  season: { select: { id: true, name: true } },
  homeTeam: { select: { id: true, name: true, shortName: true } },
  awayTeam: { select: { id: true, name: true, shortName: true } },
  lineups: { include: { entries: true } },
  events: true,
  results: true,
  report: true,
} as const;

export async function listMatches(filters: {
  eventId?: string;
  status?: string;
  teamId?: string;
}) {
  const where: Prisma.MatchWhereInput = {};
  if (filters.eventId) where.eventId = filters.eventId;
  if (filters.status) where.status = filters.status as MatchStatus;
  if (filters.teamId) {
    where.OR = [{ homeTeamId: filters.teamId }, { awayTeamId: filters.teamId }];
  }

  return prisma.match.findMany({
    where,
    include: matchInclude,
    orderBy: [{ scheduledDate: 'asc' }],
  });
}

export async function getMatch(id: string) {
  const match = await prisma.match.findUnique({
    where: { id },
    include: matchInclude,
  });
  if (!match) throw new AppError(404, 'NOT_FOUND', 'Match not found');
  return match;
}

export async function createMatch(data: CreateMatchInput, createdBy: string) {
  const event = await prisma.event.findUnique({ where: { id: data.eventId } });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found');

  const sport = await prisma.sport.findUnique({ where: { id: data.sportId } });
  if (!sport) throw new AppError(404, 'NOT_FOUND', 'Sport not found');

  if (data.homeTeamId) {
    const team = await prisma.team.findUnique({ where: { id: data.homeTeamId } });
    if (!team) throw new AppError(404, 'NOT_FOUND', 'Home team not found');
  }
  if (data.awayTeamId) {
    const team = await prisma.team.findUnique({ where: { id: data.awayTeamId } });
    if (!team) throw new AppError(404, 'NOT_FOUND', 'Away team not found');
  }
  if (data.homeTeamId && data.awayTeamId && data.homeTeamId === data.awayTeamId) {
    throw new AppError(400, 'VALIDATION', 'Home and away teams must be different');
  }

  return prisma.match.create({
    data: {
      eventId: data.eventId,
      sportId: data.sportId,
      seasonId: data.seasonId,
      matchNumber: data.matchNumber,
      round: data.round,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      homeIndividualId: data.homeIndividualId,
      awayIndividualId: data.awayIndividualId,
      venue: data.venue,
      scheduledDate: toDate(data.scheduledDate)!,
      scheduledTime: data.scheduledTime,
      status: data.status,
      matchType: data.matchType,
      notes: data.notes,
      createdBy,
    },
  });
}

export async function updateMatch(id: string, data: UpdateMatchInput) {
  const existing = await prisma.match.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Match not found');

  return prisma.match.update({
    where: { id },
    data: {
      eventId: data.eventId,
      sportId: data.sportId,
      seasonId: data.seasonId,
      matchNumber: data.matchNumber,
      round: data.round,
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      venue: data.venue,
      scheduledDate: toDate(data.scheduledDate),
      scheduledTime: data.scheduledTime,
      status: data.status,
      matchType: data.matchType,
      notes: data.notes,
    },
  });
}

export async function updateMatchStatus(id: string, status: MatchStatus) {
  const existing = await prisma.match.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Match not found');

  const match = await prisma.match.update({
    where: { id },
    data: { status, actualStartTime: status === 'IN_PROGRESS' ? new Date() : undefined },
  });

  if (status === 'COMPLETED') {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['TUTOR', 'SPORTS_REP'] } },
      select: { id: true },
    });
    if (admins.length > 0) {
      await createNotificationsBulk(
        admins.map((a) => ({
          type: 'MATCH_RESULT_PENDING',
          title: 'Match result pending',
          message: `Match completed — please record the result.`,
          recipientUserId: a.id,
          relatedEntityType: 'MATCH',
          relatedEntityId: match.id,
        }))
      );
    }
  }

  return match;
}

export async function submitLineup(
  matchId: string,
  teamId: string,
  entries: Array<{
    athleteId: string;
    jerseyNumber?: number;
    position?: string;
    isStarter?: boolean;
    isCaptain?: boolean;
    order?: number;
  }>,
  userId: string
) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new AppError(404, 'NOT_FOUND', 'Match not found');
  if (match.homeTeamId !== teamId && match.awayTeamId !== teamId) {
    throw new AppError(400, 'VALIDATION', 'Team is not part of this match');
  }

  const existing = await prisma.matchLineup.findUnique({
    where: { matchId_teamId: { matchId, teamId } },
  });

  const lineup = await prisma.matchLineup.upsert({
    where: { matchId_teamId: { matchId, teamId } },
    create: {
      matchId,
      teamId,
      submittedBy: userId,
      entries: {
        create: entries.map((e) => ({
          athleteId: e.athleteId,
          jerseyNumber: e.jerseyNumber,
          position: e.position,
          isStarter: e.isStarter ?? false,
          isCaptain: e.isCaptain ?? false,
          order: e.order,
        })),
      },
    },
    update: {
      submittedBy: userId,
      entries: {
        deleteMany: {},
        create: entries.map((e) => ({
          athleteId: e.athleteId,
          jerseyNumber: e.jerseyNumber,
          position: e.position,
          isStarter: e.isStarter ?? false,
          isCaptain: e.isCaptain ?? false,
          order: e.order,
        })),
      },
    },
    include: { entries: true },
  });

  if (!existing) {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['TUTOR', 'SPORTS_REP'] } },
      select: { id: true },
    });
    if (admins.length > 0) {
      await createNotificationsBulk(
        admins.map((a) => ({
          type: 'LINEUP_DUE',
          title: 'Lineup submitted',
          message: `A lineup was submitted for match ${match.matchNumber ?? ''}.`,
          recipientUserId: a.id,
          relatedEntityType: 'MATCH',
          relatedEntityId: match.id,
        }))
      );
    }
  }

  return lineup;
}

export async function getLineups(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new AppError(404, 'NOT_FOUND', 'Match not found');

  return prisma.matchLineup.findMany({
    where: { matchId },
    include: {
      team: { select: { id: true, name: true, shortName: true } },
      entries: {
        include: {
          athlete: {
            select: { id: true, fullName: true, registrationNumber: true },
          },
        },
      },
    },
  });
}

export async function recordMatchEvent(
  matchId: string,
  data: {
    eventType: string;
    minute?: number;
    teamId?: string;
    athleteId?: string;
    secondaryAthleteId?: string;
    details?: string;
  },
  userId: string
) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new AppError(404, 'NOT_FOUND', 'Match not found');

  return prisma.matchEvent.create({
    data: {
      matchId,
      eventType: data.eventType,
      minute: data.minute,
      teamId: data.teamId,
      athleteId: data.athleteId,
      secondaryAthleteId: data.secondaryAthleteId,
      details: data.details,
      recordedBy: userId,
    },
  });
}

export async function recordResult(
  matchId: string,
  data: {
    homeScore: number;
    awayScore: number;
    resultType: 'HOME_WIN' | 'AWAY_WIN' | 'DRAW';
    homePenalties?: number;
    awayPenalties?: number;
    walkover?: boolean;
  },
  userId: string
) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new AppError(404, 'NOT_FOUND', 'Match not found');

  const winnerTeamId =
    data.resultType === 'HOME_WIN'
      ? match.homeTeamId
      : data.resultType === 'AWAY_WIN'
        ? match.awayTeamId
        : null;

  const result = await prisma.matchResult.upsert({
    where: { matchId },
    create: {
      matchId,
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      winnerTeamId,
      resultType: data.resultType,
      homePenalties: data.homePenalties,
      awayPenalties: data.awayPenalties,
      walkover: data.walkover ?? false,
      verifiedBy: userId,
      verifiedAt: new Date(),
    },
    update: {
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      winnerTeamId,
      resultType: data.resultType,
      homePenalties: data.homePenalties,
      awayPenalties: data.awayPenalties,
      walkover: data.walkover ?? false,
      verifiedBy: userId,
      verifiedAt: new Date(),
    },
  });

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore: data.homeScore, awayScore: data.awayScore, status: 'COMPLETED' },
  });

  return result;
}

export async function submitMatchReport(
  matchId: string,
  data: {
    summary?: string;
    mvpAthleteId?: string;
    attendanceCount?: number;
    notableIncidents?: string;
    coachingNotes?: string;
  },
  userId: string
) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new AppError(404, 'NOT_FOUND', 'Match not found');

  return prisma.matchReport.upsert({
    where: { matchId },
    create: {
      matchId,
      submittedBy: userId,
      summary: data.summary,
      mvpAthleteId: data.mvpAthleteId,
      attendanceCount: data.attendanceCount,
      notableIncidents: data.notableIncidents,
      coachingNotes: data.coachingNotes,
    },
    update: {
      submittedBy: userId,
      summary: data.summary,
      mvpAthleteId: data.mvpAthleteId,
      attendanceCount: data.attendanceCount,
      notableIncidents: data.notableIncidents,
      coachingNotes: data.coachingNotes,
    },
  });
}

export async function deleteMatch(id: string) {
  const existing = await prisma.match.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Match not found');
  await prisma.match.delete({ where: { id } });
  return { message: 'Match deleted' };
}
