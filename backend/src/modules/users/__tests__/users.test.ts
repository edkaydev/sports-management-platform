import request from 'supertest';
import prisma from '../../../config/database';
import app from '../../../app';
import { hashPassword } from '../../auth/auth.service';
import { UserRole } from '@prisma/client';

const ADMIN_USERNAME = 'users.test.admin';
const ADMIN_EMAIL = 'users.test.admin@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let adminToken: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);
  await prisma.user.create({
    data: { username: ADMIN_USERNAME, email: ADMIN_EMAIL, fullName: 'Users Test Admin', passwordHash: hash, role: UserRole.TUTOR },
  });
  const login = await request(app).post('/api/auth/login').send({ username: ADMIN_USERNAME, password: TEST_PASSWORD });
  adminToken = login.body.data.accessToken;
});

afterAll(async () => {
  const users = await prisma.user.findMany({
    where: { username: { startsWith: 'users.test' } },
    select: { id: true },
  });
  const userIds = users.map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

describe('GET /api/users', () => {
  it('requires TUTOR role', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('lists users for an authenticated TUTOR', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.some((u: { username: string }) => u.username === ADMIN_USERNAME)).toBe(true);
  });
});

describe('POST /api/users', () => {
  it('creates a user that must change their password on first login', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'users.test.assistant', fullName: 'Assistant', password: 'Assistant@2025' });
    expect(res.status).toBe(201);
    expect(res.body.data.isActive).toBe(true);
    expect(res.body.data.mustChangePassword).toBe(true);
    expect(res.body.data.username).toBe('users.test.assistant');
  });

  it('rejects a duplicate username', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'users.test.assistant', fullName: 'Assistant', password: 'Assistant@2025' });
    expect(res.status).toBe(409);
  });

  it('rejects a weak password', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'users.test.weak', fullName: 'Weak', password: 'weak' });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/users/:id/reset-password', () => {
  it('resets password and forces a change on next login', async () => {
    const created = await prisma.user.findUnique({ where: { username: 'users.test.assistant' } });
    const res = await request(app)
      .post(`/api/users/${created!.id}/reset-password`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ newPassword: 'ResetPass@2025' });
    expect(res.status).toBe(200);

    const after = await prisma.user.findUnique({ where: { id: created!.id } });
    expect(after!.mustChangePassword).toBe(true);
  });
});

describe('DELETE /api/users/:id', () => {
  it('deactivates a user (soft delete)', async () => {
    const created = await prisma.user.create({
      data: { username: 'users.test.remove', fullName: 'Remove Me', passwordHash: await hashPassword(TEST_PASSWORD), role: UserRole.SPORTS_REP },
    });
    const res = await request(app)
      .delete(`/api/users/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const after = await prisma.user.findUnique({ where: { id: created.id } });
    expect(after!.deletedAt).not.toBeNull();
  });
});