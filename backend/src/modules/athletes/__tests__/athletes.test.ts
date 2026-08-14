import request from 'supertest';
import prisma from '../../../config/database';
import app from '../../../app';
import { hashPassword } from '../../auth/auth.service';
import { UserRole, Gender, SportCategory } from '@prisma/client';

const TEST_ADMIN_EMAIL = 'athletes.test.admin@umu.ac.ug';
const TEST_COACH_EMAIL = 'athletes.test.coach@umu.ac.ug';
const TEST_PASSWORD = 'Admin@2025';

let adminToken: string;
let coachToken: string;
let sportId: string;
let teamId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);

  await prisma.user.create({
    data: { email: TEST_ADMIN_EMAIL, fullName: 'Athletes Test Admin', passwordHash: hash, role: UserRole.SUPER_ADMIN },
  });
  await prisma.user.create({
    data: { email: TEST_COACH_EMAIL, fullName: 'Athletes Test Coach', passwordHash: hash, role: UserRole.COACH },
  });

  const sport = await prisma.sport.create({
    data: { name: 'Test Football', gender: Gender.MALE, category: SportCategory.TEAM },
  });
  sportId = sport.id;
  const team = await prisma.team.create({
    data: { name: 'Test FC', shortName: 'TFC', sportId, gender: Gender.MALE },
  });
  teamId = team.id;

  const adminLogin = await request(app).post('/api/auth/login').send({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD });
  adminToken = adminLogin.body.data.accessToken;

  const coachLogin = await request(app).post('/api/auth/login').send({ email: TEST_COACH_EMAIL, password: TEST_PASSWORD });
  coachToken = coachLogin.body.data.accessToken;
});

afterAll(async () => {
  const athletes = await prisma.studentAthlete.findMany({
    where: { email: { startsWith: 'athlete.test.' } },
    select: { id: true },
  });
  const athleteIds = athletes.map((a) => a.id);

  await prisma.sportAffiliation.deleteMany({ where: { athleteId: { in: athleteIds } } });
  await prisma.medicalDeclaration.deleteMany({ where: { athleteId: { in: athleteIds } } });
  await prisma.studentAthlete.deleteMany({ where: { id: { in: athleteIds } } });
  await prisma.team.deleteMany({ where: { id: teamId } });
  await prisma.sport.deleteMany({ where: { id: sportId } });

  const testUsers = await prisma.user.findMany({
    where: { email: { in: [TEST_ADMIN_EMAIL, TEST_COACH_EMAIL] } },
    select: { id: true },
  });
  const userIds = testUsers.map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

function athletePayload(overrides: Record<string, unknown> = {}) {
  return {
    fullName: 'Test Athlete',
    registrationNumber: `2025/ATH/${Date.now()}`,
    gender: Gender.MALE,
    email: `athlete.test.${Date.now()}@umu.ac.ug`,
    phoneNumber: '0700000000',
    yearOfStudy: 2,
    programme: 'BSc Computer Science',
    faculty: 'Faculty of Science',
    ...overrides,
  };
}

describe('GET /api/athletes', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/athletes');
    expect(res.status).toBe(401);
  });

  it('lists athletes with pagination', async () => {
    const create = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(athletePayload());
    expect(create.status).toBe(201);

    const res = await request(app)
      .get('/api/athletes')
      .set('Authorization', `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toMatchObject({ page: 1, pageSize: 20 });
    expect(res.body.data).toEqual(expect.any(Array));
  });

  it('filters by athlete type and status', async () => {
    await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(athletePayload({ athleteType: 'SCHOLARSHIP', status: 'INJURED' }));

    const res = await request(app)
      .get('/api/athletes?athleteType=SCHOLARSHIP&status=INJURED')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    for (const athlete of res.body.data) {
      expect(athlete.athleteType).toBe('SCHOLARSHIP');
      expect(athlete.status).toBe('INJURED');
    }
  });

  it('filters by sport via affiliations', async () => {
    await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(athletePayload({ affiliations: [{ sportId, teamId, position: 'Midfielder' }] }));

    const res = await request(app)
      .get(`/api/athletes?sport=${sportId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].affiliations.length).toBeGreaterThan(0);
  });
});

describe('POST /api/athletes', () => {
  it('creates an athlete with medical declaration and affiliations', async () => {
    const res = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(
        athletePayload({
          medicalDeclaration: { hasCondition: true, conditionDescription: 'Asthma' },
          affiliations: [{ sportId, teamId, position: 'Goalkeeper', jerseyNumber: 1, isCaptain: true }],
        })
      );
    expect(res.status).toBe(201);
    expect(res.body.data.registrationNumber).toBeDefined();
    expect(res.body.data.medicalDeclaration.hasCondition).toBe(true);
    expect(res.body.data.affiliations[0]).toMatchObject({ position: 'Goalkeeper', isCaptain: true });
  });

  it('rejects a duplicate registration number with 409', async () => {
    const reg = `2025/DUP/${Date.now()}`;
    await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(athletePayload({ registrationNumber: reg }));

    const res = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(athletePayload({ registrationNumber: reg }));
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('CONFLICT');
  });

  it('rejects invalid input with 422', async () => {
    const res = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: '', registrationNumber: '', gender: 'UNKNOWN' });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('rejects a non-existent sport in affiliation with 422', async () => {
    const res = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(athletePayload({ affiliations: [{ sportId: '00000000-0000-0000-0000-000000000000' }] }));
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('forbids a coach from creating athletes', async () => {
    const res = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${coachToken}`)
      .send(athletePayload());
    expect(res.status).toBe(403);
  });
});

describe('GET /api/athletes/:id', () => {
  it('fetches a single athlete', async () => {
    const create = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(athletePayload());
    const id = create.body.data.id;

    const res = await request(app)
      .get(`/api/athletes/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it('returns 404 for an unknown athlete', async () => {
    const res = await request(app)
      .get('/api/athletes/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });
});

describe('GET /api/athletes/:id/profile', () => {
  it('returns the 360° profile', async () => {
    const create = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(athletePayload());
    const id = create.body.data.id;

    const res = await request(app)
      .get(`/api/athletes/${id}/profile`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.athlete.id).toBe(id);
    expect(res.body.data.academicRecords).toEqual([]);
    expect(res.body.data.scholarships).toEqual([]);
    expect(res.body.data.contracts).toEqual([]);
    expect(res.body.data.documents).toEqual([]);
  });
});

describe('PATCH /api/athletes/:id', () => {
  it('updates an athlete', async () => {
    const create = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(athletePayload());
    const id = create.body.data.id;

    const res = await request(app)
      .patch(`/api/athletes/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ yearOfStudy: 3, programme: 'BSc Information Technology', athleteType: 'CONTRACT' });
    expect(res.status).toBe(200);
    expect(res.body.data.yearOfStudy).toBe(3);
    expect(res.body.data.programme).toBe('BSc Information Technology');
    expect(res.body.data.athleteType).toBe('CONTRACT');
  });

  it('replaces affiliations when provided', async () => {
    const create = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(athletePayload({ affiliations: [{ sportId, position: 'Forward' }] }));
    const id = create.body.data.id;
    expect(create.body.data.affiliations).toHaveLength(1);

    const res = await request(app)
      .patch(`/api/athletes/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ affiliations: [{ sportId, teamId, position: 'Defender' }] });
    expect(res.status).toBe(200);
    expect(res.body.data.affiliations).toHaveLength(1);
    expect(res.body.data.affiliations[0]).toMatchObject({ position: 'Defender', teamId });
  });

  it('forbids a coach from updating athletes', async () => {
    const res = await request(app)
      .patch('/api/athletes/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ yearOfStudy: 4 });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/athletes/:id', () => {
  it('soft deletes an athlete', async () => {
    const create = await request(app)
      .post('/api/athletes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(athletePayload());
    const id = create.body.data.id;

    const res = await request(app)
      .delete(`/api/athletes/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const missing = await request(app)
      .get(`/api/athletes/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(missing.status).toBe(404);

    const deleted = await prisma.studentAthlete.findUnique({ where: { id } });
    expect(deleted!.deletedAt).not.toBeNull();
  });
});
