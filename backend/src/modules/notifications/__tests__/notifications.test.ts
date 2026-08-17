import request from 'supertest';
import prisma from '../../../config/database';
import app from '../../../app';
import { hashPassword } from '../../auth/auth.service';
import { UserRole, Gender, AthleteType } from '@prisma/client';

const ADMIN_EMAIL = 'notif.test.admin@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let adminToken: string;
let adminId: string;
let athleteId: string;
let notificationId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);

  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      fullName: 'Notification Test Admin',
      passwordHash: hash,
      role: UserRole.TUTOR,
    },
  });
  adminId = admin.id;

  const athlete = await prisma.studentAthlete.create({
    data: {
      fullName: 'Notification Test Athlete',
      registrationNumber: `NOTIF-TEST-${Date.now()}`,
      gender: Gender.MALE,
      athleteType: AthleteType.REGULAR,
    },
  });
  athleteId = athlete.id;

  const notification = await prisma.notification.create({
    data: {
      type: 'SYSTEM',
      severity: 'INFO',
      title: 'Welcome to UMU Sports',
      message: 'System is ready',
      recipientUserId: adminId,
    },
  });
  notificationId = notification.id;

  const login = await request(app).post('/api/auth/login').send({
    email: ADMIN_EMAIL,
    password: TEST_PASSWORD,
  });
  adminToken = login.body.data.accessToken;
});

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { recipientUserId: adminId } });
  await prisma.studentAthlete.deleteMany({ where: { id: athleteId } });
  const userIds = (
    await prisma.user.findMany({
      where: { email: ADMIN_EMAIL },
      select: { id: true },
    })
  ).map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
});

describe('GET /api/notifications', () => {
  it('lists notifications with unread count', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.unreadCount).toBeGreaterThanOrEqual(1);
  });

  it('filters by isRead', async () => {
    const res = await request(app)
      .get('/api/notifications?isRead=false')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('PATCH /api/notifications/:id/read', () => {
  it('marks a notification as read', async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isRead).toBe(true);
  });

  it('returns 404 for another users notification', async () => {
    const other = await prisma.user.create({
      data: {
        email: 'notif.other@umu.ac.ug',
        fullName: 'Other User',
        passwordHash: await hashPassword(TEST_PASSWORD),
        role: UserRole.SPORTS_REP,
      },
    });
    const otherNotification = await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        title: 'For other',
        message: 'private',
        recipientUserId: other.id,
      },
    });
    const res = await request(app)
      .patch(`/api/notifications/${otherNotification.id}/read`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    await prisma.notification.delete({ where: { id: otherNotification.id } });
    await prisma.refreshToken.deleteMany({ where: { userId: other.id } });
    await prisma.user.delete({ where: { id: other.id } });
  });
});

describe('PATCH /api/notifications/read-all', () => {
  it('marks all notifications as read', async () => {
    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.updated).toBeGreaterThanOrEqual(0);
  });
});

describe('POST /api/notifications/run-checks', () => {
  it('runs academic check and generates alerts', async () => {
    await prisma.academicRecord.create({
      data: {
        athleteId,
        academicYear: '2025/2026',
        semester: 'SEM1',
        gpa: 2.0,
        failedUnits: 1,
      },
    });

    const res = await request(app)
      .post('/api/notifications/run-checks')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.academic).toBeDefined();
  });
});
