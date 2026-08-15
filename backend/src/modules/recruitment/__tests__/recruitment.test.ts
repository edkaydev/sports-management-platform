import request from 'supertest';
import prisma from '../../../config/database';
import app from '../../../app';
import { hashPassword } from '../../auth/auth.service';
import { UserRole, Gender, AthleteType } from '@prisma/client';

const ADMIN_EMAIL = 'recr.test.admin@umu.ac.ug';
const COACH_EMAIL = 'recr.test.coach@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let adminToken: string;
let coachToken: string;
let sportId: string;
let prospectId: string;
let trialId: string;
let athleteId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);

  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      fullName: 'Recruitment Test Admin',
      passwordHash: hash,
      role: UserRole.SPORTS_ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      email: COACH_EMAIL,
      fullName: 'Recruitment Test Coach',
      passwordHash: hash,
      role: UserRole.COACH,
    },
  });

  const sport = await prisma.sport.create({
    data: { name: `Recruitment Sport ${Date.now()}`, gender: Gender.MALE, category: 'TEAM' },
  });
  sportId = sport.id;

  const adminLogin = await request(app).post('/api/auth/login').send({
    email: ADMIN_EMAIL,
    password: TEST_PASSWORD,
  });
  adminToken = adminLogin.body.data.accessToken;

  const coachLogin = await request(app).post('/api/auth/login').send({
    email: COACH_EMAIL,
    password: TEST_PASSWORD,
  });
  coachToken = coachLogin.body.data.accessToken;
});

afterAll(async () => {
  await prisma.recruitmentRecord.deleteMany({});
  await prisma.trialAssessment.deleteMany({ where: { trialId } });
  await prisma.trialParticipant.deleteMany({ where: { trialId } });
  await prisma.trial.deleteMany({ where: { id: trialId } });
  await prisma.prospect.deleteMany({ where: { id: prospectId } });

  const athletes = await prisma.studentAthlete.findMany({
    where: { email: { startsWith: 'prospect.' } },
    select: { id: true },
  });
  const athleteIds = athletes.map((a) => a.id);
  await prisma.sportAffiliation.deleteMany({ where: { athleteId: { in: athleteIds } } });
  await prisma.studentAthlete.deleteMany({ where: { id: { in: athleteIds } } });

  await prisma.sport.deleteMany({ where: { id: sportId } });
  const userIds = (
    await prisma.user.findMany({
      where: { email: { in: [ADMIN_EMAIL, COACH_EMAIL, 'prospect.one@example.com'] } },
      select: { id: true },
    })
  ).map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe('POST /api/recruitment/prospects', () => {
  it('creates a prospect', async () => {
    const res = await request(app)
      .post('/api/recruitment/prospects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Trial Prospect One',
        email: 'prospect.one@example.com',
        gender: 'MALE',
        sportId,
        previousLevel: 'DISTRICT',
        source: 'SCOUT',
        position: 'Striker',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PROSPECT');
    prospectId = res.body.data.id;
  });

  it('returns 403 for COACH', async () => {
    const res = await request(app)
      .post('/api/recruitment/prospects')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ fullName: 'Denied', gender: 'MALE', sportId });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/recruitment/prospects', () => {
  it('lists prospects', async () => {
    const res = await request(app)
      .get('/api/recruitment/prospects')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('Trials', () => {
  it('creates a trial with participants', async () => {
    const res = await request(app)
      .post('/api/recruitment/trials')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sportId,
        trialDate: '2026-09-05',
        startTime: '09:00',
        venue: 'UMU Sports Ground',
        description: 'First team selection trial',
        prospectIds: [prospectId],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.participants).toHaveLength(1);
    trialId = res.body.data.id;
  });

  it('lists trials', async () => {
    const res = await request(app)
      .get('/api/recruitment/trials')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('records attendance', async () => {
    const res = await request(app)
      .post(`/api/recruitment/trials/${trialId}/attendance`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ attendance: [{ prospectId, attended: true }] });
    expect(res.status).toBe(200);
  });

  it('submits an assessment', async () => {
    const res = await request(app)
      .post(`/api/recruitment/trials/${trialId}/assessments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        prospectId,
        scoreTechnical: 8,
        scorePhysical: 7.5,
        scoreSpeed: 8.5,
        scoreTactical: 7,
        scoreTeamwork: 9,
        scoreDiscipline: 9,
        scoreAcademic: 7,
        recommendation: 'RECOMMEND',
        selectionOutcome: 'SELECTED',
        coachNotes: 'Strong on the ball, good work rate',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.overallScore).toBeDefined();
  });
});

describe('POST /api/recruitment/prospects/:id/enroll', () => {
  it('enrolls a selected prospect as athlete', async () => {
    const res = await request(app)
      .post(`/api/recruitment/prospects/${prospectId}/enroll`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        registrationNumber: `UMU-RECR-${Date.now()}`,
        yearOfStudy: 1,
        programme: 'BSc Computer Science',
        faculty: 'Faculty of ICT',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.athlete).toBeDefined();
    expect(res.body.data.recruitment).toBeDefined();
    athleteId = res.body.data.athlete.id;
  });

  it('marks prospect as ENROLLED', async () => {
    const prospect = await prisma.prospect.findUnique({ where: { id: prospectId } });
    expect(prospect?.status).toBe('ENROLLED');
  });
});
