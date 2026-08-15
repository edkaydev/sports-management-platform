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
  AcademicStanding,
  Semester,
  ScholarshipType,
} from '@prisma/client';

const ADMIN_EMAIL = 'reports.test.admin@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let adminToken: string;
let adminId: string;
let sportId: string;
let athleteId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);
  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      fullName: 'Reports Test Admin',
      passwordHash: hash,
      role: UserRole.SPORTS_ADMIN,
    },
  });
  adminId = admin.id;

  const sport = await prisma.sport.create({
    data: { name: `Tennis ${Date.now()}`, gender: Gender.FEMALE, category: SportCategory.INDIVIDUAL },
  });
  sportId = sport.id;

  const athlete = await prisma.studentAthlete.create({
    data: {
      fullName: 'Reports Test Athlete',
      registrationNumber: `RPT-TEST-${Date.now()}`,
      gender: Gender.FEMALE,
    },
  });
  athleteId = athlete.id;

  await prisma.sportAffiliation.create({
    data: { athleteId, sportId },
  });

  await prisma.academicRecord.create({
    data: {
      athleteId,
      academicYear: '2025/2026',
      semester: Semester.SEM1,
      gpa: 2.1,
      failedUnits: 2,
      academicStanding: AcademicStanding.WARNING,
    },
  });

  await prisma.scholarship.create({
    data: {
      athleteId,
      scholarshipType: ScholarshipType.PARTIAL,
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-08-31'),
      status: 'ACTIVE',
      coveragePercentage: 50,
      awardedBy: adminId,
    },
  });

  await prisma.event.create({
    data: {
      name: `Campus Cup ${Date.now()}`,
      type: EventType.TOURNAMENT,
      level: EventLevel.CAMPUS,
      sportId,
      startDate: new Date('2026-10-01'),
      status: 'PLANNED',
      format: EventFormat.ROUND_ROBIN,
      createdBy: adminId,
    },
  });

  const login = await request(app).post('/api/auth/login').send({
    email: ADMIN_EMAIL,
    password: TEST_PASSWORD,
  });
  adminToken = login.body.data.accessToken;
});

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { recipientUserId: adminId } });
  await prisma.event.deleteMany({ where: { createdBy: adminId } });
  await prisma.sportAffiliation.deleteMany({ where: { athleteId } });
  await prisma.scholarship.deleteMany({ where: { athleteId } });
  await prisma.academicRecord.deleteMany({ where: { athleteId } });
  await prisma.studentAthlete.deleteMany({ where: { id: athleteId } });
  await prisma.sport.deleteMany({ where: { id: sportId } });
  const userIds = (
    await prisma.user.findMany({ where: { email: ADMIN_EMAIL }, select: { id: true } })
  ).map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
});

describe('GET /api/reports/overview', () => {
  it('returns department overview', async () => {
    const res = await request(app)
      .get('/api/reports/overview')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalAthletes).toBeGreaterThanOrEqual(1);
    expect(res.body.data.activeScholarships).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/reports/athletes', () => {
  it('returns athlete report filtered by sport', async () => {
    const res = await request(app)
      .get(`/api/reports/athletes?sport=${sportId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.count).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/reports/academic-standing', () => {
  it('returns academic standing report', async () => {
    const res = await request(app)
      .get('/api/reports/academic-standing?season=2025/2026')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/reports/scholarships', () => {
  it('returns scholarship report', async () => {
    const res = await request(app)
      .get('/api/reports/scholarships')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.active).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/reports/contracts', () => {
  it('returns contract report', async () => {
    const res = await request(app)
      .get('/api/reports/contracts')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(0);
  });
});

describe('GET /api/reports/fixtures', () => {
  it('returns fixture schedule report', async () => {
    const res = await request(app)
      .get(`/api/reports/fixtures?sport=${sportId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/reports/athletes CSV export', () => {
  it('returns CSV', async () => {
    const res = await request(app)
      .get('/api/reports/athletes?format=csv')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('name');
  });
});
