import request from 'supertest';
import prisma from '../../../config/database';
import app from '../../../app';
import { hashPassword } from '../../auth/auth.service';
import { UserRole } from '@prisma/client';

const ADMIN_EMAIL = 'news.test.admin@umu.ac.ug';
const COACH_EMAIL = 'news.test.coach@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let adminToken: string;
let coachToken: string;
let postId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);

  await prisma.user.create({
    data: { email: ADMIN_EMAIL, fullName: 'News Test Admin', passwordHash: hash, role: UserRole.TUTOR },
  });
  await prisma.user.create({
    data: { email: COACH_EMAIL, fullName: 'News Test Coach', passwordHash: hash, role: UserRole.SPORTS_REP },
  });

  const adminLogin = await request(app).post('/api/auth/login').send({ email: ADMIN_EMAIL, password: TEST_PASSWORD });
  adminToken = adminLogin.body.data.accessToken;
  const coachLogin = await request(app).post('/api/auth/login').send({ email: COACH_EMAIL, password: TEST_PASSWORD });
  coachToken = coachLogin.body.data.accessToken;
});

afterAll(async () => {
  await prisma.newsPost.deleteMany({});
  const userIds = (
    await prisma.user.findMany({
      where: { email: { in: [ADMIN_EMAIL, COACH_EMAIL] } },
      select: { id: true },
    })
  ).map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe('POST /api/news', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/news').send({ title: 'No auth', content: 'x'.repeat(20) });
    expect(res.status).toBe(401);
  });

  it('allows a SPORTS_REP to create news', async () => {
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ title: 'Allowed', content: 'x'.repeat(20) });
    expect(res.status).toBe(201);
  });

  it('creates a draft news post', async () => {
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'UMU Saints Win Big', content: 'A great performance from the team.', status: 'DRAFT' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('umu-saints-win-big');
    expect(res.body.data.status).toBe('DRAFT');
    postId = res.body.data.id;
  });

  it('rejects duplicate slugs', async () => {
    const res = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'UMU Saints Win Big', content: 'Another body.' });
    expect(res.status).toBe(409);
  });
});

describe('PATCH /api/news/:id', () => {
  it('publishes the post', async () => {
    const res = await request(app)
      .patch(`/api/news/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PUBLISHED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PUBLISHED');
    expect(res.body.data.publishedAt).toBeDefined();
  });
});

describe('GET /api/news', () => {
  it('lists posts for admins', async () => {
    const res = await request(app).get('/api/news').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('DELETE /api/news/:id', () => {
  it('deletes the post', async () => {
    const res = await request(app).delete(`/api/news/${postId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
