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
  EventStatus,
  EventFormat,
} from '@prisma/client';

const ADMIN_EMAIL = 'events.test.admin@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let adminToken: string;
let adminId: string;
let sportId: string;
let teamId: string;
let athleteId: string;
let eventId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);
  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      fullName: 'Events Test Admin',
      passwordHash: hash,
      role: UserRole.TUTOR,
    },
  });
  adminId = admin.id;

  const sport = await prisma.sport.create({
    data: { name: `Football ${Date.now()}`, gender: Gender.MALE, category: SportCategory.TEAM },
  });
  sportId = sport.id;

  const team = await prisma.team.create({
    data: { name: `FC Test ${Date.now()}`, sportId: sport.id, gender: Gender.MALE },
  });
  teamId = team.id;

  const athlete = await prisma.studentAthlete.create({
    data: {
      fullName: 'Events Test Athlete',
      registrationNumber: `EVT-TEST-${Date.now()}`,
      gender: Gender.MALE,
    },
  });
  athleteId = athlete.id;

  const login = await request(app).post('/api/auth/login').send({
    email: ADMIN_EMAIL,
    password: TEST_PASSWORD,
  });
  adminToken = login.body.data.accessToken;
});

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { recipientUserId: adminId } });
  await prisma.eventParticipant.deleteMany({ where: { event: { createdBy: adminId } } });
  await prisma.event.deleteMany({ where: { createdBy: adminId } });
  await prisma.studentAthlete.deleteMany({ where: { id: athleteId } });
  await prisma.team.deleteMany({ where: { id: teamId } });
  await prisma.sport.deleteMany({ where: { id: sportId } });
  const userIds = (
    await prisma.user.findMany({ where: { email: ADMIN_EMAIL }, select: { id: true } })
  ).map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
});

describe('POST /api/events', () => {
  it('creates an event', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Inter-University Gala',
        type: EventType.GALA,
        level: EventLevel.NATIONAL,
        sportId,
        venue: 'Main Stadium',
        startDate: '2026-09-01T09:00:00.000Z',
        endDate: '2026-09-05T18:00:00.000Z',
        format: EventFormat.ROUND_ROBIN,
        maxTeams: 16,
        status: EventStatus.PLANNED,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe('Inter-University Gala');
    eventId = res.body.data.id;
  });

  it('rejects invalid payload', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'X', type: 'NOT_A_TYPE' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/events', () => {
  it('lists events', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/events/:id', () => {
  it('gets a single event', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(eventId);
  });
});

describe('PATCH /api/events/:id', () => {
  it('updates an event', async () => {
    const res = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: EventStatus.ACTIVE, venue: 'Updated Venue' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(EventStatus.ACTIVE);
  });
});

describe('POST /api/events/:id/participants', () => {
  it('registers a team participant', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/participants`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ participantType: 'TEAM', teamId });
    expect(res.status).toBe(201);
    expect(res.body.data.participantType).toBe('TEAM');
  });

  it('rejects duplicate registration', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/participants`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ participantType: 'TEAM', teamId });
    expect(res.status).toBe(409);
  });

  it('registers an individual athlete', async () => {
    const res = await request(app)
      .post(`/api/events/${eventId}/participants`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ participantType: 'INDIVIDUAL', athleteId });
    expect(res.status).toBe(201);
    expect(res.body.data.participantType).toBe('INDIVIDUAL');
  });
});

describe('GET /api/events/:id/participants', () => {
  it('lists participants', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/participants`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });
});
