import { MatchStatus, NewsStatus } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

function parseQuery(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim() !== '') return value.trim();
  return undefined;
}

function parseLimit(value: unknown): number {
  const parsed = parseInt(String(value ?? '50'), 10);
  if (Number.isNaN(parsed)) return 50;
  return Math.min(Math.max(parsed, 1), 100);
}

export async function listFixtures(query: Record<string, unknown>) {
  const sportId = parseQuery(query.sportId);
  return prisma.match.findMany({
    where: {
      status: { in: ['SCHEDULED', 'IN_PROGRESS', 'POSTPONED'] },
      sportId: sportId ?? undefined,
    },
    include: {
      sport: { select: { id: true, name: true } },
      event: { select: { id: true, name: true } },
      homeTeam: { select: { id: true, name: true, shortName: true } },
      awayTeam: { select: { id: true, name: true, shortName: true } },
      homeIndividual: { select: { id: true, fullName: true } },
      awayIndividual: { select: { id: true, fullName: true } },
    },
    orderBy: [{ scheduledDate: 'asc' }],
    take: parseLimit(query.limit),
  });
}

export async function listResults(query: Record<string, unknown>) {
  const sportId = parseQuery(query.sportId);
  return prisma.match.findMany({
    where: { status: MatchStatus.COMPLETED, sportId: sportId ?? undefined },
    include: {
      sport: { select: { id: true, name: true } },
      event: { select: { id: true, name: true } },
      homeTeam: { select: { id: true, name: true, shortName: true } },
      awayTeam: { select: { id: true, name: true, shortName: true } },
      homeIndividual: { select: { id: true, fullName: true } },
      awayIndividual: { select: { id: true, fullName: true } },
      results: {
        select: {
          homeScore: true,
          awayScore: true,
          resultType: true,
          winnerTeamId: true,
          homePenalties: true,
          awayPenalties: true,
          walkover: true,
        },
      },
    },
    orderBy: [{ scheduledDate: 'desc' }],
    take: parseLimit(query.limit),
  });
}

export async function listSports() {
  return prisma.sport.findMany({
    where: { isActive: true },
    include: { _count: { select: { teams: true, matches: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function getPublicSport(identifier: string) {
  const candidates = await prisma.sport.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });
  const match = candidates.find(
    (s) => s.id === identifier || s.name.toLowerCase() === identifier.toLowerCase()
  );
  if (!match) throw new AppError(404, 'NOT_FOUND', 'Sport not found');

  const sport = await prisma.sport.findUnique({
    where: { id: match.id },
    include: { _count: { select: { teams: true, matches: true } } },
  });
  if (!sport) throw new AppError(404, 'NOT_FOUND', 'Sport not found');

  const [teams, fixtures, results, events] = await Promise.all([
    prisma.team.findMany({
      where: { sportId: sport.id, isActive: true },
      include: { _count: { select: { squadEntries: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.match.findMany({
      where: {
        sportId: sport.id,
        status: { in: ['SCHEDULED', 'IN_PROGRESS', 'POSTPONED'] },
      },
      include: {
        event: { select: { id: true, name: true } },
        homeTeam: { select: { id: true, name: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, shortName: true } },
        homeIndividual: { select: { id: true, fullName: true } },
        awayIndividual: { select: { id: true, fullName: true } },
      },
      orderBy: [{ scheduledDate: 'asc' }],
      take: 10,
    }),
    prisma.match.findMany({
      where: { sportId: sport.id, status: MatchStatus.COMPLETED },
      include: {
        event: { select: { id: true, name: true } },
        homeTeam: { select: { id: true, name: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, shortName: true } },
        homeIndividual: { select: { id: true, fullName: true } },
        awayIndividual: { select: { id: true, fullName: true } },
        results: {
          select: {
            homeScore: true,
            awayScore: true,
            resultType: true,
            winnerTeamId: true,
          },
        },
      },
      orderBy: [{ scheduledDate: 'desc' }],
      take: 10,
    }),
    prisma.event.findMany({
      where: {
        sportId: sport.id,
        status: { in: ['PLANNED', 'ACTIVE', 'POSTPONED'] },
      },
      include: { _count: { select: { participants: true, matches: true } } },
      orderBy: [{ startDate: 'asc' }],
      take: 10,
    }),
  ]);

  return { sport, teams, fixtures, results, events };
}

export async function listTeams() {
  return prisma.team.findMany({
    where: { isActive: true },
    include: {
      sport: { select: { id: true, name: true, gender: true } },
      _count: { select: { squadEntries: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getPublicTeam(identifier: string) {
  const team = await prisma.team.findFirst({
    where: { id: identifier, isActive: true },
    include: {
      sport: { select: { id: true, name: true, gender: true } },
      _count: { select: { squadEntries: true, homeMatches: true, awayMatches: true } },
    },
  });
  if (!team) throw new AppError(404, 'NOT_FOUND', 'Team not found');

  const [squad, fixtures, results] = await Promise.all([
    prisma.teamSquad.findMany({
      where: { teamId: team.id, status: { not: 'RELEASED' } },
      include: {
        athlete: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            athleteType: true,
          },
        },
      },
      orderBy: [{ isCaptain: 'desc' }, { athlete: { fullName: 'asc' } }],
    }),
    prisma.match.findMany({
      where: {
        status: { in: ['SCHEDULED', 'IN_PROGRESS', 'POSTPONED'] },
        OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
      },
      include: {
        sport: { select: { id: true, name: true } },
        event: { select: { id: true, name: true } },
        homeTeam: { select: { id: true, name: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, shortName: true } },
      },
      orderBy: [{ scheduledDate: 'asc' }],
      take: 10,
    }),
    prisma.match.findMany({
      where: {
        status: 'COMPLETED',
        OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
      },
      include: {
        sport: { select: { id: true, name: true } },
        event: { select: { id: true, name: true } },
        homeTeam: { select: { id: true, name: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, shortName: true } },
        results: {
          select: {
            homeScore: true,
            awayScore: true,
            resultType: true,
            homePenalties: true,
            awayPenalties: true,
          },
        },
      },
      orderBy: [{ scheduledDate: 'desc' }],
      take: 10,
    }),
  ]);

  return { team, squad, fixtures, results };
}

export async function getPublicEvent(identifier: string) {
  const event = await prisma.event.findFirst({
    where: { id: identifier },
    include: {
      sport: { select: { id: true, name: true } },
      _count: { select: { participants: true, matches: true } },
    },
  });
  if (!event) throw new AppError(404, 'NOT_FOUND', 'Event not found');

  const [participants, fixtures, results, allResults] = await Promise.all([
    prisma.eventParticipant.findMany({
      where: { eventId: event.id },
      include: {
        team: { select: { id: true, name: true, shortName: true, gender: true, logoUrl: true } },
        athlete: { select: { id: true, fullName: true, gender: true } },
      },
      orderBy: [{ team: { name: 'asc' } }, { athlete: { fullName: 'asc' } }],
    }),
    prisma.match.findMany({
      where: {
        eventId: event.id,
        status: { in: ['SCHEDULED', 'IN_PROGRESS', 'POSTPONED'] },
      },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, shortName: true } },
        homeIndividual: { select: { id: true, fullName: true } },
        awayIndividual: { select: { id: true, fullName: true } },
      },
      orderBy: [{ scheduledDate: 'asc' }],
      take: 20,
    }),
    prisma.match.findMany({
      where: { eventId: event.id, status: 'COMPLETED' },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, shortName: true } },
        homeIndividual: { select: { id: true, fullName: true } },
        awayIndividual: { select: { id: true, fullName: true } },
        results: {
          select: {
            homeScore: true,
            awayScore: true,
            resultType: true,
            homePenalties: true,
            awayPenalties: true,
            walkover: true,
          },
        },
      },
      orderBy: [{ scheduledDate: 'desc' }],
      take: 20,
    }),
    prisma.match.findMany({
      where: { eventId: event.id, status: 'COMPLETED' },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        results: {
          select: { homeScore: true, awayScore: true, resultType: true, winnerTeamId: true },
        },
      },
    }),
  ]);

  return { event, participants, fixtures, results, standings: computeStandings(allResults) };
}

function computeStandings(
  matches: Array<{
    homeTeamId: string | null;
    awayTeamId: string | null;
    homeScore: number | null;
    awayScore: number | null;
    results: { homeScore: number; awayScore: number; resultType: string; winnerTeamId: string | null } | null;
  }>
) {
  const table = new Map<
    string,
    { teamId: string; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number }
  >();

  for (const m of matches) {
    if (!m.homeTeamId || !m.awayTeamId) continue;
    const home = m.results?.homeScore ?? m.homeScore ?? 0;
    const away = m.results?.awayScore ?? m.awayScore ?? 0;

    const homeRow = table.get(m.homeTeamId) ?? { teamId: m.homeTeamId, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    const awayRow = table.get(m.awayTeamId) ?? { teamId: m.awayTeamId, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };

    homeRow.played += 1;
    awayRow.played += 1;
    homeRow.goalsFor += home;
    homeRow.goalsAgainst += away;
    awayRow.goalsFor += away;
    awayRow.goalsAgainst += home;

    if (home > away) {
      homeRow.won += 1;
      awayRow.lost += 1;
      homeRow.points += 3;
    } else if (home < away) {
      awayRow.won += 1;
      homeRow.lost += 1;
      awayRow.points += 3;
    } else {
      homeRow.drawn += 1;
      awayRow.drawn += 1;
      homeRow.points += 1;
      awayRow.points += 1;
    }

    table.set(m.homeTeamId, homeRow);
    table.set(m.awayTeamId, awayRow);
  }

  return [...table.values()].sort((a, b) => {
    const diffA = a.goalsFor - a.goalsAgainst;
    const diffB = b.goalsFor - b.goalsAgainst;
    return b.points - a.points || diffB - diffA || b.goalsFor - a.goalsFor;
  });
}

export async function listEvents(query: Record<string, unknown>) {
  const sportId = parseQuery(query.sportId);
  return prisma.event.findMany({
    where: {
      status: { in: ['PLANNED', 'ACTIVE', 'POSTPONED'] },
      sportId: sportId ?? undefined,
    },
    include: {
      sport: { select: { id: true, name: true } },
      _count: { select: { participants: true, matches: true } },
    },
    orderBy: [{ startDate: 'asc' }],
    take: parseLimit(query.limit),
  });
}

export async function listPublishedNews(query: Record<string, unknown>) {
  const page = Math.max(parseInt(String(query.page ?? '1'), 10) || 1, 1);
  const pageSize = parseLimit(query.limit);
  const where = { status: NewsStatus.PUBLISHED };

  const [posts, total] = await Promise.all([
    prisma.newsPost.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        featured: true,
        publishedAt: true,
        author: { select: { id: true, fullName: true } },
      },
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.newsPost.count({ where }),
  ]);

  return {
    news: posts,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getPublishedNewsBySlug(slug: string) {
  const post = await prisma.newsPost.findFirst({
    where: { slug, status: NewsStatus.PUBLISHED },
    include: { author: { select: { id: true, fullName: true } } },
  });
  if (!post) throw new AppError(404, 'NOT_FOUND', 'News post not found');
  return post;
}
