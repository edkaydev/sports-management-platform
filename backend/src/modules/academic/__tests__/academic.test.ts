import request from 'supertest';
import prisma from '../../../config/database';
import app from '../../../app';
import { hashPassword } from '../../auth/auth.service';
import { UserRole, Gender, AthleteType, AthleteStatus, Semester } from '@prisma/client';

const ADMIN_EMAIL = 'academic.test.admin@umu.ac.ug';
const COACH_EMAIL = 'academic.test.coach@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let adminToken: string;
let coachToken: string;
let athleteId: string;
let recordId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);

  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      fullName: 'Academic Test Admin',
      passwordHash: hash,
      role: UserRole.TUTOR,
    },
  });

  const coach = await prisma.user.create({
    data: {
      email: COACH_EMAIL,
      fullName: 'Academic Test Coach',
      passwordHash: hash,
      role: UserRole.SPORTS_REP,
    },
  });

  const athlete = await prisma.studentAthlete.create({
    data: {
      fullName: 'Academic Test Athlete',
      registrationNumber: `ACAD-TEST-${Date.now()}`,
      gender: Gender.MALE,
      athleteType: AthleteType.REGULAR,
      status: AthleteStatus.ACTIVE,
    },
  });
  athleteId = athlete.id;

  // Login
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
    await prisma.academicCourseResult.deleteMany({
      where: { academicRecord: { athleteId } },
    });
    await prisma.academicRecord.deleteMany({ where: { athleteId } });
    await prisma.studentAthlete.delete({ where: { id: athleteId } });
    const userIds = (
      await prisma.user.findMany({
        where: { email: { in: [ADMIN_EMAIL, COACH_EMAIL] } },
        select: { id: true },
      })
    ).map((u) => u.id);
    await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  });

describe('POST /api/academic-records', () => {
  it('creates an academic record', async () => {
    const res = await request(app)
      .post('/api/academic-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        athleteId,
        academicYear: '2025/2026',
        semester: 'SEM1',
        yearOfStudy: 2,
        gpa: 3.5,
        cgpa: 3.4,
        totalCreditUnitsTaken: 18,
        totalCreditUnitsPassed: 18,
        failedUnits: 0,
        attendancePercentage: 92,
        notes: 'Good performance',
        courseResults: [
          {
            courseCode: 'CSC2101',
            courseName: 'Data Structures',
            creditUnits: 4,
            marks: 78,
            grade: 'B+',
            result: 'PASS',
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.academicStanding).toBe('GOOD_STANDING');
    expect(res.body.data.courseResults).toHaveLength(1);
    recordId = res.body.data.id;
  });

  it('returns 409 on duplicate record', async () => {
    const res = await request(app)
      .post('/api/academic-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        athleteId,
        academicYear: '2025/2026',
        semester: 'SEM1',
        gpa: 3.0,
        failedUnits: 0,
      });
    expect(res.status).toBe(409);
  });

  it('allows a SPORTS_REP to create records', async () => {
    const res = await request(app)
      .post('/api/academic-records')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({
        athleteId,
        academicYear: '2023/2024',
        semester: 'SEM1',
        yearOfStudy: 1,
        gpa: 3.0,
        cgpa: 2.9,
        totalCreditUnitsTaken: 15,
        totalCreditUnitsPassed: 15,
      });
    expect(res.status).toBe(201);
  });
});

describe('GET /api/academic-records', () => {
  it('lists records', async () => {
    const res = await request(app)
      .get('/api/academic-records')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('filters by athleteId', async () => {
    const res = await request(app)
      .get(`/api/academic-records?athleteId=${athleteId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].athleteId).toBe(athleteId);
  });
});

describe('GET /api/academic-records/:id', () => {
  it('returns a single record', async () => {
    const res = await request(app)
      .get(`/api/academic-records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(recordId);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .get('/api/academic-records/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/academic-records/:id', () => {
  it('updates standing when GPA drops', async () => {
    const res = await request(app)
      .patch(`/api/academic-records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ gpa: 2.0, failedUnits: 2 });
    expect(res.status).toBe(200);
    expect(res.body.data.academicStanding).toBe('WARNING');
  });
});

describe('POST /api/academic-records/import', () => {
  it('imports records from CSV', async () => {
    // Need reg number from our test athlete
    const athlete = await prisma.studentAthlete.findUnique({ where: { id: athleteId } });
    const csv = `registration_number,academic_year,semester,gpa,cgpa,failed_units,attendance\n${athlete!.registrationNumber},2024/2025,SEM2,3.2,3.1,0,88`;

    const res = await request(app)
      .post('/api/academic-records/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(csv), { filename: 'records.csv', contentType: 'text/csv' });

    expect(res.status).toBe(200);
    expect(res.body.data.imported).toBe(1);
  });
});
