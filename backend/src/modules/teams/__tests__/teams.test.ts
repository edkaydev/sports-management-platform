import request from "supertest";
import prisma from "../../../config/database";
import app from "../../../app";
import { hashPassword } from "../../auth/auth.service";
import { UserRole, Gender, SportCategory, TeamStaffRole } from "@prisma/client";

const TEST_ADMIN_EMAIL = "teams.test.admin@umu.ac.ug";
const TEST_COACH_EMAIL = "teams.test.coach@umu.ac.ug";
const TEST_PASSWORD = "Admin@2025";

let adminToken: string;
let coachToken: string;
let coachUserId: string;
let sportId: string;
let seasonId: string;
let athleteId: string;

const teamIds: string[] = [];

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);

  const admin = await prisma.user.create({
    data: {
      email: TEST_ADMIN_EMAIL,
      fullName: "Teams Test Admin",
      passwordHash: hash,
      role: UserRole.TUTOR,
    },
  });
  const coach = await prisma.user.create({
    data: {
      email: TEST_COACH_EMAIL,
      fullName: "Teams Test Coach",
      passwordHash: hash,
      role: UserRole.SPORTS_REP,
    },
  });
  coachUserId = coach.id;

  const sport = await prisma.sport.create({
    data: {
      name: `Test Teams Sport ${Date.now()}`,
      gender: Gender.MALE,
      category: SportCategory.TEAM,
    },
  });
  sportId = sport.id;

  const season = await prisma.season.create({
    data: {
      name: `Test Teams Season ${Date.now()}`,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2027-07-31"),
      isCurrent: false,
      createdBy: admin.id,
    },
  });
  seasonId = season.id;

  const athlete = await prisma.studentAthlete.create({
    data: {
      fullName: "Teams Test Athlete",
      registrationNumber: `2026/TM/${Date.now()}`,
      gender: Gender.MALE,
      email: `teams.test.athlete.${Date.now()}@umu.ac.ug`,
    },
  });
  athleteId = athlete.id;

  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD });
  adminToken = adminLogin.body.data.accessToken;

  const coachLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: TEST_COACH_EMAIL, password: TEST_PASSWORD });
  coachToken = coachLogin.body.data.accessToken;
});

afterAll(async () => {
  await prisma.teamSquad.deleteMany({ where: { teamId: { in: teamIds } } });
  await prisma.teamStaff.deleteMany({ where: { teamId: { in: teamIds } } });
  await prisma.sportAffiliation.deleteMany({ where: { athleteId } });
  await prisma.team.deleteMany({ where: { id: { in: teamIds } } });
  await prisma.studentAthlete.deleteMany({ where: { id: athleteId } });
  await prisma.sport.deleteMany({ where: { id: sportId } });
  await prisma.season.deleteMany({ where: { id: seasonId } });

  const testUsers = await prisma.user.findMany({
    where: { email: { in: [TEST_ADMIN_EMAIL, TEST_COACH_EMAIL] } },
    select: { id: true },
  });
  const userIds = testUsers.map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

function teamPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: `Test Team ${Date.now()}`,
    shortName: "TT",
    sportId,
    seasonId,
    gender: Gender.MALE,
    homeVenue: "Nkozi",
    foundingYear: 2000,
    ...overrides,
  };
}

async function createTeam(
  token: string,
  overrides: Record<string, unknown> = {},
) {
  const res = await request(app)
    .post("/api/teams")
    .set("Authorization", `Bearer ${token}`)
    .send(teamPayload(overrides));
  if (res.status === 201) teamIds.push(res.body.data.id);
  return res;
}

describe("GET /api/teams", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/teams");
    expect(res.status).toBe(401);
  });

  it("lists teams with pagination", async () => {
    await createTeam(adminToken, { name: `List Team ${Date.now()}` });

    const res = await request(app)
      .get("/api/teams")
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toMatchObject({ page: 1, pageSize: 20 });
    expect(res.body.data).toEqual(expect.any(Array));
  });

  it("filters by sport and search", async () => {
    const name = `Search Team ${Date.now()}`;
    await createTeam(adminToken, { name });

    const bySport = await request(app)
      .get(`/api/teams?sport=${sportId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(bySport.status).toBe(200);
    for (const team of bySport.body.data) {
      expect(team.sportId).toBe(sportId);
    }

    const bySearch = await request(app)
      .get(`/api/teams?search=${encodeURIComponent(name)}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(bySearch.status).toBe(200);
    expect(
      bySearch.body.data.some((t: { name: string }) => t.name === name),
    ).toBe(true);
  });
});

describe("POST /api/teams", () => {
  it("creates a team", async () => {
    const res = await createTeam(adminToken);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ sportId, seasonId, gender: "MALE" });
    expect(res.body.data.sport).toBeDefined();
    expect(res.body.data.season).toBeDefined();
  });

  it("rejects a team gender incompatible with the sport with 422", async () => {
    const res = await createTeam(adminToken, {
      name: `Wrong Gender ${Date.now()}`,
      gender: Gender.FEMALE,
    });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("rejects a non-existent sport with 422", async () => {
    const res = await createTeam(adminToken, {
      name: `Bad Sport ${Date.now()}`,
      sportId: "00000000-0000-0000-0000-000000000000",
    });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("rejects invalid input with 422", async () => {
    const res = await request(app)
      .post("/api/teams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "", gender: "UNKNOWN" });
    expect(res.status).toBe(422);
  });

  it("allows a SPORTS_REP to create teams", async () => {
    const res = await createTeam(coachToken);
    expect(res.status).toBe(201);
  });
});

describe("GET /api/teams/:id", () => {
  it("fetches a single team with squad and staff", async () => {
    const create = await createTeam(adminToken, {
      name: `Detail Team ${Date.now()}`,
    });
    const id = create.body.data.id;

    const res = await request(app)
      .get(`/api/teams/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
    expect(res.body.data.squadEntries).toEqual([]);
    expect(res.body.data.staff).toEqual([]);
  });

  it("returns 404 for an unknown team", async () => {
    const res = await request(app)
      .get("/api/teams/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT_FOUND");
  });
});

describe("PATCH /api/teams/:id", () => {
  it("updates a team", async () => {
    const create = await createTeam(adminToken, {
      name: `Patch Team ${Date.now()}`,
    });
    const id = create.body.data.id;

    const res = await request(app)
      .patch(`/api/teams/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ homeVenue: "Kampala", foundingYear: 2005 });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      homeVenue: "Kampala",
      foundingYear: 2005,
    });
  });

  it("allows a SPORTS_REP to update teams", async () => {
    const create = await createTeam(coachToken);
    const res = await request(app)
      .patch(`/api/teams/${create.body.data.id}`)
      .set("Authorization", `Bearer ${coachToken}`)
      .send({ name: "Updated" });
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/teams/:id", () => {
  it("soft deletes a team", async () => {
    const create = await createTeam(adminToken, {
      name: `Delete Team ${Date.now()}`,
    });
    const id = create.body.data.id;

    const res = await request(app)
      .delete(`/api/teams/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const missing = await request(app)
      .get(`/api/teams/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(missing.status).toBe(404);

    const deleted = await prisma.team.findUnique({ where: { id } });
    expect(deleted!.deletedAt).not.toBeNull();
  });
});

describe("Team squad", () => {
  it("adds an athlete to the squad", async () => {
    const create = await createTeam(adminToken, {
      name: `Squad Team ${Date.now()}`,
    });
    const id = create.body.data.id;

    const res = await request(app)
      .post(`/api/teams/${id}/squad`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        athleteId,
        seasonId,
        jerseyNumber: 10,
        position: "Midfielder",
        isCaptain: true,
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      athleteId,
      jerseyNumber: 10,
      position: "Midfielder",
    });
  });

  it("lists the squad", async () => {
    const create = await createTeam(adminToken, {
      name: `Squad List ${Date.now()}`,
    });
    const id = create.body.data.id;

    await request(app)
      .post(`/api/teams/${id}/squad`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ athleteId, seasonId });

    const res = await request(app)
      .get(`/api/teams/${id}/squad`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ athleteId, seasonId });
    expect(res.body.data[0].athlete).toBeDefined();
  });

  it("lets a coach add athletes to a squad", async () => {
    const create = await createTeam(adminToken, {
      name: `Coach Squad ${Date.now()}`,
    });
    const id = create.body.data.id;

    const res = await request(app)
      .post(`/api/teams/${id}/squad`)
      .set("Authorization", `Bearer ${coachToken}`)
      .send({ athleteId, seasonId });
    expect(res.status).toBe(201);
  });

  it("rejects a duplicate squad entry with 409", async () => {
    const create = await createTeam(adminToken, {
      name: `Dup Squad ${Date.now()}`,
    });
    const id = create.body.data.id;

    const first = await request(app)
      .post(`/api/teams/${id}/squad`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ athleteId, seasonId });
    expect(first.status).toBe(201);

    const res = await request(app)
      .post(`/api/teams/${id}/squad`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ athleteId, seasonId });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("CONFLICT");
  });

  it("rejects a non-existent athlete with 422", async () => {
    const create = await createTeam(adminToken, {
      name: `Bad Athlete ${Date.now()}`,
    });
    const id = create.body.data.id;

    const res = await request(app)
      .post(`/api/teams/${id}/squad`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ athleteId: "00000000-0000-0000-0000-000000000000", seasonId });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("removes an athlete from the squad", async () => {
    const create = await createTeam(adminToken, {
      name: `Remove Squad ${Date.now()}`,
    });
    const id = create.body.data.id;

    await request(app)
      .post(`/api/teams/${id}/squad`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ athleteId, seasonId });

    const res = await request(app)
      .delete(`/api/teams/${id}/squad/${athleteId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const squad = await request(app)
      .get(`/api/teams/${id}/squad`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(squad.body.data).toHaveLength(0);
  });
});

describe("Team staff", () => {
  it("assigns staff to a team", async () => {
    const create = await createTeam(adminToken, {
      name: `Staff Team ${Date.now()}`,
    });
    const id = create.body.data.id;

    const res = await request(app)
      .post(`/api/teams/${id}/staff`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ userId: coachUserId, role: TeamStaffRole.HEAD_COACH });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      teamId: id,
      userId: coachUserId,
      role: "HEAD_COACH",
    });
  });

  it("lists team staff", async () => {
    const create = await createTeam(adminToken, {
      name: `Staff List ${Date.now()}`,
    });
    const id = create.body.data.id;

    await request(app)
      .post(`/api/teams/${id}/staff`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ userId: coachUserId, role: TeamStaffRole.ASSISTANT_COACH });

    const res = await request(app)
      .get(`/api/teams/${id}/staff`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ role: "ASSISTANT_COACH" });
    expect(res.body.data[0].user).toBeDefined();
  });

  it("removes staff from a team", async () => {
    const create = await createTeam(adminToken, {
      name: `Staff Remove ${Date.now()}`,
    });
    const id = create.body.data.id;

    const assigned = await request(app)
      .post(`/api/teams/${id}/staff`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ userId: coachUserId, role: TeamStaffRole.PHYSIO });
    expect(assigned.status).toBe(201);

    const res = await request(app)
      .delete(`/api/teams/${id}/staff/${assigned.body.data.id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const staff = await request(app)
      .get(`/api/teams/${id}/staff`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(staff.body.data).toHaveLength(0);
  });

  it("allows a SPORTS_REP to assign staff", async () => {
    const create = await createTeam(adminToken, {
      name: `Staff Coach ${Date.now()}`,
    });
    const id = create.body.data.id;

    const res = await request(app)
      .post(`/api/teams/${id}/staff`)
      .set("Authorization", `Bearer ${coachToken}`)
      .send({ userId: coachUserId, role: TeamStaffRole.HEAD_COACH });
    expect(res.status).toBe(201);
  });
});
