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
