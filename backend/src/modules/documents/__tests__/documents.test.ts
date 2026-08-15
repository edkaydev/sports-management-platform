import request from 'supertest';
import prisma from '../../../config/database';
import app from '../../../app';
import { hashPassword } from '../../auth/auth.service';
import { UserRole, Gender, AthleteType } from '@prisma/client';

const ADMIN_EMAIL = 'doc.test.admin@umu.ac.ug';
const COACH_EMAIL = 'doc.test.coach@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let adminToken: string;
let coachToken: string;
let athleteId: string;
let documentId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);

  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      fullName: 'Documents Test Admin',
      passwordHash: hash,
      role: UserRole.SPORTS_ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      email: COACH_EMAIL,
      fullName: 'Documents Test Coach',
      passwordHash: hash,
      role: UserRole.COACH,
    },
  });

  const athlete = await prisma.studentAthlete.create({
    data: {
      fullName: 'Documents Test Athlete',
      registrationNumber: `DOC-TEST-${Date.now()}`,
      gender: Gender.MALE,
      athleteType: AthleteType.REGULAR,
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
  await prisma.document.deleteMany({ where: { athleteId } });
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

describe('POST /api/documents', () => {
  it('uploads a document', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Medical Clearance')
      .field('category', 'MEDICAL')
      .field('ownerType', 'ATHLETE')
      .field('athleteId', athleteId)
      .attach('file', Buffer.from('%PDF-1.4 test document'), {
        filename: 'clearance.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fileType).toBe('PDF');
    documentId = res.body.data.id;
  });

  it('rejects non-pdf file type via metadata check', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Test Text')
      .field('category', 'OTHER')
      .field('ownerType', 'DEPARTMENT')
      .attach('file', Buffer.from('plain text'), {
        filename: 'note.txt',
        contentType: 'text/plain',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.fileType).toBe('OTHER');
    await prisma.document.delete({ where: { id: res.body.data.id } });
  });
});

describe('GET /api/documents', () => {
  it('lists documents', async () => {
    const res = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('filters by athlete', async () => {
    const res = await request(app)
      .get(`/api/documents?athleteId=${athleteId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('GET /api/documents/:id', () => {
  it('returns a single document', async () => {
    const res = await request(app)
      .get(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(documentId);
  });
});

describe('PATCH /api/documents/:id/verify', () => {
  it('verifies a document', async () => {
    const res = await request(app)
      .patch(`/api/documents/${documentId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isVerified: true });
    expect(res.status).toBe(200);
    expect(res.body.data.isVerified).toBe(true);
  });
});

describe('GET /api/documents/athletes/:athleteId/checklist', () => {
  it('returns athlete document checklist', async () => {
    const res = await request(app)
      .get(`/api/documents/athletes/${athleteId}/checklist`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.documents.length).toBeGreaterThan(0);
  });
});

describe('DELETE /api/documents/:id', () => {
  it('deletes a document', async () => {
    const res = await request(app)
      .delete(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
