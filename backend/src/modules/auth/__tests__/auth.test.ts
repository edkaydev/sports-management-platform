import request from 'supertest';
import bcrypt from 'bcrypt';
import prisma from '../../../config/database';
import app from '../../../app';
import { hashPassword } from '../auth.service';
import { UserRole } from '@prisma/client';

const TEST_ADMIN_EMAIL = 'auth.test.admin@umu.ac.ug';
const TEST_ADMIN_PASSWORD = 'Admin@2025';
const TEST_COACH_EMAIL = 'auth.test.coach@umu.ac.ug';

let adminUserId: string;
let coachUserId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_ADMIN_PASSWORD);
  const admin = await prisma.user.create({
    data: { email: TEST_ADMIN_EMAIL, fullName: 'Auth Test Admin', passwordHash: hash, role: UserRole.TUTOR },
  });
  adminUserId = admin.id;

  const coach = await prisma.user.create({
    data: { email: TEST_COACH_EMAIL, fullName: 'Auth Test Coach', passwordHash: hash, role: UserRole.SPORTS_REP },
  });
  coachUserId = coach.id;
});

afterAll(async () => {
  await prisma.refreshToken.deleteMany({ where: { userId: { in: [adminUserId, coachUserId] } } });
  await prisma.user.deleteMany({ where: { email: { in: [TEST_ADMIN_EMAIL, TEST_COACH_EMAIL] } } });
  await prisma.$disconnect();
});

describe('POST /api/auth/login', () => {
  it('rejects an invalid email/password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: TEST_ADMIN_EMAIL,
      password: 'wrong-password',
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UNAUTHORIZED');
  });

  it('rejects missing fields with 422', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('logs in with valid credentials and sets a refresh cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user).toMatchObject({ email: TEST_ADMIN_EMAIL, role: 'TUTOR' });
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('refreshToken');
  });
});

describe('POST /api/auth/refresh', () => {
  it('refreshes the access token using the cookie', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    });

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', login.headers['set-cookie'][0].split(';')[0]);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects a missing refresh token with 401', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UNAUTHORIZED');
  });

  it('rejects a revoked refresh token with 401', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    });
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    await request(app).post('/api/auth/logout').set('Cookie', cookie).set('Authorization', `Bearer ${login.body.data.accessToken}`);

    const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UNAUTHORIZED');
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the refresh cookie and revokes the token', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    });
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .set('Authorization', `Bearer ${login.body.data.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toContain('refreshToken=;');
  });

  it('rejects logout without a token', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/change-password', () => {
  it('changes the password and revokes existing sessions', async () => {
    const login = await request(app).post('/api/auth/login').send({
      email: TEST_COACH_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    });
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', cookie)
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .send({ currentPassword: TEST_ADMIN_PASSWORD, newPassword: 'NewPass@2025' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const user = await prisma.user.findUnique({ where: { id: coachUserId } });
    expect(await bcrypt.compare('NewPass@2025', user!.passwordHash)).toBe(true);

    const tokenCount = await prisma.refreshToken.count({ where: { userId: coachUserId, revoked: false } });
    expect(tokenCount).toBe(0);
  });

  it('rejects a wrong current password', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${await getCoachToken('NewPass@2025')}`)
      .send({ currentPassword: 'wrong', newPassword: 'Another@2025' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_PASSWORD');
  });

  it('rejects a weak new password with 422', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${await getCoachToken('NewPass@2025')}`)
      .send({ currentPassword: 'NewPass@2025', newPassword: 'weakpass' });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .send({ currentPassword: 'NewPass@2025', newPassword: 'Another@2025' });
    expect(res.status).toBe(401);
  });
});

describe('Account lockout', () => {
  it('locks the account after 5 consecutive failed attempts', async () => {
    const email = `lockout.${Date.now()}@umu.ac.ug`;
    const user = await prisma.user.create({
      data: { email, fullName: 'Lockout User', passwordHash: await hashPassword('Admin@2025'), role: UserRole.SPORTS_REP },
    });

    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/api/auth/login').send({ email, password: 'wrong-pass' });
      expect(res.status).toBe(401);
    }

    const res = await request(app).post('/api/auth/login').send({ email, password: 'Admin@2025' });
    expect(res.status).toBe(423);
    expect(res.body.error).toBe('ACCOUNT_LOCKED');

    await prisma.user.delete({ where: { id: user.id } });
  });
});

async function getCoachToken(password: string): Promise<string> {
  const login = await request(app).post('/api/auth/login').send({
    email: TEST_COACH_EMAIL,
    password,
  });
  return login.body.data.accessToken;
}
