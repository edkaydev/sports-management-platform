import request from 'supertest';
import prisma from '../../../config/database';
import app from '../../../app';
import { hashPassword } from '../../auth/auth.service';
import { UserRole, Gender, AthleteType } from '@prisma/client';

const ADMIN_EMAIL = 'scho.test.admin@umu.ac.ug';
const COACH_EMAIL = 'scho.test.coach@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let adminToken: string;
let coachToken: string;
let athleteId: string;
let scholarshipId: string;
let contractId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);

  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      fullName: 'Scholarship Test Admin',
      passwordHash: hash,
      role: UserRole.SPORTS_ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      email: COACH_EMAIL,
      fullName: 'Scholarship Test Coach',
      passwordHash: hash,
      role: UserRole.COACH,
    },
  });

  const athlete = await prisma.studentAthlete.create({
    data: {
      fullName: 'Scholarship Test Athlete',
      registrationNumber: `SCHO-TEST-${Date.now()}`,
      gender: Gender.MALE,
      athleteType: AthleteType.SCHOLARSHIP,
    },
  });
  athleteId = athlete.id;

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
  await prisma.scholarshipRenewal.deleteMany({ where: { scholarshipId } });
  await prisma.athleteContract.deleteMany({ where: { athleteId } });
  await prisma.scholarship.deleteMany({ where: { athleteId } });
  await prisma.studentAthlete.deleteMany({ where: { id: athleteId } });
  const userIds = (
    await prisma.user.findMany({
      where: { email: { in: [ADMIN_EMAIL, COACH_EMAIL] } },
      select: { id: true },
    })
  ).map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
});

describe('POST /api/scholarships', () => {
  it('creates a scholarship', async () => {
    const res = await request(app)
      .post('/api/scholarships')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        athleteId,
        scholarshipType: 'FULL',
        sponsorName: 'UMU',
        coverageDescription: 'Full tuition and accommodation',
        coveragePercentage: 100,
        startDate: '2025-08-01',
        endDate: '2026-07-31',
        renewable: true,
        academicRequirementGpa: 2.5,
        notes: 'First year scholarship',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scholarshipType).toBe('FULL');
    expect(res.body.data.status).toBe('PENDING');
    scholarshipId = res.body.data.id;
  });

  it('returns 403 for COACH', async () => {
    const res = await request(app)
      .post('/api/scholarships')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        athleteId,
        scholarshipType: 'PARTIAL',
        startDate: '2025-08-01',
        endDate: '2026-07-31',
      });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/scholarships', () => {
  it('lists scholarships', async () => {
    const res = await request(app)
      .get('/api/scholarships')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('filters by athlete', async () => {
    const res = await request(app)
      .get(`/api/scholarships?athleteId=${athleteId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('GET /api/scholarships/:id', () => {
  it('returns a single scholarship', async () => {
    const res = await request(app)
      .get(`/api/scholarships/${scholarshipId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(scholarshipId);
  });
});

describe('PATCH /api/scholarships/:id', () => {
  it('updates scholarship', async () => {
    const res = await request(app)
      .patch(`/api/scholarships/${scholarshipId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ sponsorName: 'UMU Sports Fund' });
    expect(res.status).toBe(200);
    expect(res.body.data.sponsorName).toBe('UMU Sports Fund');
  });
});

describe('POST /api/scholarships/:id/renew', () => {
  it('renews scholarship', async () => {
    const res = await request(app)
      .post(`/api/scholarships/${scholarshipId}/renew`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newEndDate: '2027-07-31', notes: 'Renewed for second year' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RENEWED');
    expect(res.body.data.renewalCount).toBe(1);
  });
});

describe('POST /api/scholarships/:id/revoke', () => {
  it('revokes scholarship', async () => {
    const res = await request(app)
      .post(`/api/scholarships/${scholarshipId}/revoke`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Academic underperformance' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('REVOKED');
    expect(res.body.data.revocationReason).toBe('Academic underperformance');
  });
});

describe('GET /api/scholarships/dashboard', () => {
  it('returns dashboard summary', async () => {
    const res = await request(app)
      .get('/api/scholarships/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeDefined();
  });
});

describe('Contracts', () => {
  it('creates a contract', async () => {
    const res = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        athleteId,
        contractType: 'PLAYING',
        startDate: '2025-08-01',
        endDate: '2026-07-31',
        termsSummary: 'First team player',
        signedByAthlete: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.contractType).toBe('PLAYING');
    contractId = res.body.data.id;
  });

  it('lists contracts', async () => {
    const res = await request(app)
      .get('/api/contracts')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('terminates a contract', async () => {
    const res = await request(app)
      .post(`/api/contracts/${contractId}/terminate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Contract expired by agreement' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('TERMINATED');
  });
});
