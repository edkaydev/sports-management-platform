import request from 'supertest';
import prisma from '../../../config/database';
import app from '../../../app';
import { hashPassword } from '../../auth/auth.service';
import { UserRole, Gender, SportCategory, MatchStatus } from '@prisma/client';

const ADMIN_EMAIL = 'public.test.admin@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let sportId: string;
let teamId: string;
let eventId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);
  await prisma.user.create({
    data: { email: ADMIN_EMAIL, fullName: 'Public Test Admin', passwordHash: hash, role: UserRole.SPORTS_ADMIN },
  });

  const sport = await prisma.sport.create({
    data: { name: `Public Sport ${Date.now()}`, gender: Gender.MALE, category: SportCategory.TEAM },
  });
  sportId = sport.id;

  const team = await prisma.team.create({
    data: { name: 'Public Test FC', shortName: 'PFC', sportId, gender: Gender.MALE },
  });
  teamId = team.id;

  const event = await prisma.event.create({
    data: { name: 'Public Test Cup', type: 'TOURNAMENT', level: 'NATIONAL', sportId, status: 'ACTIVE' },
  });
  eventId = event.id;

  await prisma.match.createMany({
    data: [
      {
        eventId,
        sportId,
        matchNumber: 1,
        homeTeamId: teamId,
        scheduledDate: new Date('2026-10-01T14:00:00.000Z'),
        status: MatchStatus.SCHEDULED,
      },
      {
        eventId,
        sportId,
        matchNumber: 2,
        homeTeamId: teamId,
        scheduledDate: new Date('2026-08-01T14:00:00.000Z'),
        status: MatchStatus.COMPLETED,
        homeScore: 2,
        awayScore: 1,
      },
    ],
  });

  await prisma.newsPost.create({
    data: {
      title: 'Public Announcement',
      slug: 'public-announcement',
      content: 'Welcome to UMU Sports.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });
});

afterAll(async () => {
  await prisma.match.deleteMany({ where: { eventId } });
  await prisma.newsPost.deleteMany({});
  await prisma.event.deleteMany({ where: { id: eventId } });
  await prisma.team.deleteMany({ where: { id: teamId } });
  await prisma.sport.deleteMany({ where: { id: sportId } });

  const users = await prisma.user.findMany({
    where: { email: ADMIN_EMAIL },
    select: { id: true },
  });
  const userIds = users.map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe('Public endpoints (no auth)', () => {
  it('GET /api/public/sports lists sports', async () => {
    const res = await request(app).get('/api/public/sports');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/public/teams lists teams', async () => {
    const res = await request(app).get('/api/public/teams');
    expect(res.status).toBe(200);
    expect(res.body.data.some((t: { id: string }) => t.id === teamId)).toBe(true);
  });

  it('GET /api/public/fixtures lists upcoming matches', async () => {
    const res = await request(app).get('/api/public/fixtures');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((m: { status: string }) => m.status !== 'COMPLETED')).toBe(true);
  });

  it('GET /api/public/results lists completed matches', async () => {
    const res = await request(app).get('/api/public/results');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].status).toBe('COMPLETED');
  });

  it('GET /api/public/events lists events', async () => {
    const res = await request(app).get('/api/public/events');
    expect(res.status).toBe(200);
    expect(res.body.data.some((e: { id: string }) => e.id === eventId)).toBe(true);
  });

  it('GET /api/public/news lists published posts only', async () => {
    const res = await request(app).get('/api/public/news');
    expect(res.status).toBe(200);
    expect(res.body.data.news.length).toBeGreaterThan(0);
    expect(res.body.data.pagination.total).toBeGreaterThan(0);
  });

  it('GET /api/public/news/:slug returns a published post', async () => {
    const res = await request(app).get('/api/public/news/public-announcement');
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Public Announcement');
  });

  it('GET /api/public/news/:slug returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/public/news/not-real');
    expect(res.status).toBe(404);
  });
});
