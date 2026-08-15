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
  MatchType,
  TrainingStatus,
  AttendanceStatus,
} from '@prisma/client';

const ADMIN_EMAIL = 'perf.test.admin@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let adminToken: string;
let adminId: string;
let sportId: string;
let teamId: string;
let athleteId: string;
let eventId: string;
let matchId: string;
let sessionId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);
  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      fullName: 'Performance Test Admin',
      passwordHash: hash,
      role: UserRole.SPORTS_ADMIN,
    },
  });
  adminId = admin.id;

  const sport = await prisma.sport.create({
    data: { name: `Rugby ${Date.now()}`, gender: Gender.MALE, category: SportCategory.TEAM },
  });
  sportId = sport.id;

  const team = await prisma.team.create({
    data: { name: `Rugby Team ${Date.now()}`, sportId: sport.id, gender: Gender.MALE },
  });
  teamId = team.id;

  const athlete = await prisma.studentAthlete.create({
    data: {
      fullName: 'Performance Test Athlete',
      registrationNumber: `PRF-TEST-${Date.now()}`,
      gender: Gender.MALE,
    },
  });
  athleteId = athlete.id;

  const event = await prisma.event.create({
    data: {
      name: `Rugby Cup ${Date.now()}`,
      type: EventType.TOURNAMENT,
      level: EventLevel.UNIVERSITY,
      sportId: sport.id,
      status: 'ACTIVE',
      format: EventFormat.KNOCKOUT,
      createdBy: adminId,
    },
  });
  eventId = event.id;

  const match = await prisma.match.create({
    data: {
      eventId: event.id,
      sportId: sport.id,
      homeTeamId: teamId,
      scheduledDate: new Date(),
      status: 'COMPLETED',
      matchType: MatchType.KNOCKOUT,
      createdBy: adminId,
    },
  });
  matchId = match.id;

  const login = await request(app).post('/api/auth/login').send({
    email: ADMIN_EMAIL,
    password: TEST_PASSWORD,
  });
  adminToken = login.body.data.accessToken;
});

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { recipientUserId: adminId } });
  await prisma.trainingAttendance.deleteMany({ where: { session: { sportId } } });
  await prisma.trainingSession.deleteMany({ where: { sportId } });
  await prisma.playerMatchPerformance.deleteMany({ where: { matchId } });
  await prisma.match.deleteMany({ where: { id: matchId } });
  await prisma.event.deleteMany({ where: { id: eventId } });
  await prisma.studentAthlete.deleteMany({ where: { id: athleteId } });
  await prisma.team.deleteMany({ where: { id: teamId } });
  await prisma.sport.deleteMany({ where: { id: sportId } });
  const userIds = (
    await prisma.user.findMany({ where: { email: ADMIN_EMAIL }, select: { id: true } })
  ).map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
});

describe('POST /api/performances', () => {
  it('records match performance', async () => {
    const res = await request(app)
      .post('/api/performances')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        matchId,
        athleteId,
        teamId,
        minutesPlayed: 90,
        goals: 2,
        assists: 1,
        tackles: 5,
        rating: 8.5,
        distanceCoveredKm: 11.2,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.athleteId).toBe(athleteId);
    expect(res.body.data.minutesPlayed).toBe(90);
  });
});

describe('GET /api/matches/:matchId/performances', () => {
  it('lists performances for a match', async () => {
    const res = await request(app)
      .get(`/api/matches/${matchId}/performances`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

describe('GET /api/athletes/:athleteId/performances', () => {
  it('returns athlete performance summary', async () => {
    const res = await request(app)
      .get(`/api/athletes/${athleteId}/performances`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.summary.appearances).toBe(1);
    expect(res.body.data.summary.totalGoals).toBe(2);
  });
});

describe('POST /api/training-sessions', () => {
  it('creates a training session', async () => {
    const res = await request(app)
      .post('/api/training-sessions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sportId,
        teamId,
        title: 'Morning Skills Session',
        sessionDate: '2026-09-12T08:00:00.000Z',
        location: 'Training Grounds',
        intensity: 'Medium',
        status: TrainingStatus.SCHEDULED,
      });
    expect(res.status).toBe(201);
    sessionId = res.body.data.id;
  });
});

describe('GET /api/training-sessions', () => {
  it('lists training sessions filtered by team', async () => {
    const res = await request(app)
      .get(`/api/training-sessions?teamId=${teamId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('POST /api/training-sessions/:id/attendance', () => {
  it('records attendance', async () => {
    const res = await request(app)
      .post(`/api/training-sessions/${sessionId}/attendance`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        records: [
          { athleteId, status: AttendanceStatus.PRESENT, notes: 'On time' },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe(AttendanceStatus.PRESENT);
  });
});
