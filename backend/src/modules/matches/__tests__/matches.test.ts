import request from 'supertest';
import prisma from '../../../config/database';
import app from '../../../app';
import { hashPassword } from '../../auth/auth.service';
import {
  UserRole,
  Gender,
  SportCategory,
  EventType,
  EventLevel,
  EventFormat,
  MatchStatus,
  MatchType,
} from '@prisma/client';

const ADMIN_EMAIL = 'matches.test.admin@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let adminToken: string;
let adminId: string;
let sportId: string;
let teamHomeId: string;
let teamAwayId: string;
let athleteId: string;
let eventId: string;
let matchId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);
  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      fullName: 'Matches Test Admin',
      passwordHash: hash,
      role: UserRole.SPORTS_ADMIN,
    },
  });
  adminId = admin.id;

  const sport = await prisma.sport.create({
    data: { name: `Basketball ${Date.now()}`, gender: Gender.MALE, category: SportCategory.TEAM },
  });
  sportId = sport.id;

  const home = await prisma.team.create({
    data: { name: `Home Team ${Date.now()}`, sportId: sport.id, gender: Gender.MALE },
  });
  teamHomeId = home.id;
  const away = await prisma.team.create({
    data: { name: `Away Team ${Date.now()}`, sportId: sport.id, gender: Gender.MALE },
  });
  teamAwayId = away.id;

  const athlete = await prisma.studentAthlete.create({
    data: {
      fullName: 'Matches Test Athlete',
      registrationNumber: `MCH-TEST-${Date.now()}`,
      gender: Gender.MALE,
    },
  });
  athleteId = athlete.id;

  const event = await prisma.event.create({
    data: {
      name: `League ${Date.now()}`,
      type: EventType.LEAGUE,
      level: EventLevel.UNIVERSITY,
      sportId: sport.id,
      status: 'ACTIVE',
      format: EventFormat.LEAGUE,
      createdBy: adminId,
    },
  });
  eventId = event.id;

  const login = await request(app).post('/api/auth/login').send({
    email: ADMIN_EMAIL,
    password: TEST_PASSWORD,
  });
  adminToken = login.body.data.accessToken;
});

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { recipientUserId: adminId } });
  await prisma.matchReport.deleteMany({ where: { match: { eventId } } });
  await prisma.matchResult.deleteMany({ where: { match: { eventId } } });
  await prisma.matchEvent.deleteMany({ where: { match: { eventId } } });
  await prisma.matchLineupEntry.deleteMany({ where: { lineup: { match: { eventId } } } });
  await prisma.matchLineup.deleteMany({ where: { match: { eventId } } });
  await prisma.match.deleteMany({ where: { eventId } });
  await prisma.eventParticipant.deleteMany({ where: { eventId } });
  await prisma.event.deleteMany({ where: { id: eventId } });
  await prisma.studentAthlete.deleteMany({ where: { id: athleteId } });
  await prisma.team.deleteMany({ where: { id: { in: [teamHomeId, teamAwayId] } } });
  await prisma.sport.deleteMany({ where: { id: sportId } });
  const userIds = (
    await prisma.user.findMany({ where: { email: ADMIN_EMAIL }, select: { id: true } })
  ).map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
});

describe('POST /api/matches', () => {
  it('creates a match', async () => {
    const res = await request(app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        eventId,
        sportId,
        matchNumber: 1,
        homeTeamId: teamHomeId,
        awayTeamId: teamAwayId,
        venue: 'Court 1',
        scheduledDate: '2026-09-10T15:00:00.000Z',
        status: MatchStatus.SCHEDULED,
        matchType: MatchType.LEAGUE,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    matchId = res.body.data.id;
  });

  it('rejects same home and away team', async () => {
    const res = await request(app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        eventId,
        sportId,
        homeTeamId: teamHomeId,
        awayTeamId: teamHomeId,
        scheduledDate: '2026-09-10T15:00:00.000Z',
      });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/matches', () => {
  it('lists matches filtered by event', async () => {
    const res = await request(app)
      .get(`/api/matches?eventId=${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('POST /api/matches/:id/lineups', () => {
  it('submits a lineup for the home team', async () => {
    const res = await request(app)
      .post(`/api/matches/${matchId}/lineups`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        teamId: teamHomeId,
        entries: [
          { athleteId, jerseyNumber: 7, position: 'Forward', isStarter: true, isCaptain: true, order: 1 },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.entries.length).toBe(1);
  });
});

describe('GET /api/matches/:id/lineups', () => {
  it('lists lineups', async () => {
    const res = await request(app)
      .get(`/api/matches/${matchId}/lineups`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('POST /api/matches/:id/events', () => {
  it('records a match event', async () => {
    const res = await request(app)
      .post(`/api/matches/${matchId}/events`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        eventType: 'GOAL',
        minute: 23,
        teamId: teamHomeId,
        athleteId,
        details: 'Solo run',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.eventType).toBe('GOAL');
  });
});

describe('POST /api/matches/:id/result', () => {
  it('records a match result', async () => {
    const res = await request(app)
      .post(`/api/matches/${matchId}/result`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ homeScore: 2, awayScore: 1, resultType: 'HOME_WIN' });
    expect(res.status).toBe(201);
    expect(res.body.data.resultType).toBe('HOME_WIN');
  });
});

describe('POST /api/matches/:id/report', () => {
  it('submits a match report', async () => {
    const res = await request(app)
      .post(`/api/matches/${matchId}/report`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ summary: 'Great match', attendanceCount: 120, mvpAthleteId: athleteId });
    expect(res.status).toBe(201);
    expect(res.body.data.summary).toBe('Great match');
  });
});
