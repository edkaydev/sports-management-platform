import request from "supertest";
import prisma from "../../../config/database";
import app from "../../../app";
import { hashPassword } from "../../auth/auth.service";
import {
  UserRole,
  Gender,
  SportCategory,
  EquipmentCategory,
  EquipmentCondition,
} from "@prisma/client";

const TUTOR_EMAIL = "equipment.test.tutor@umu.ac.ug";
const REP_EMAIL = "equipment.test.rep@umu.ac.ug";
const TEST_PASSWORD = "Admin@2025";

let tutorToken: string;
let repToken: string;
let sportId: string;
let teamId: string;
let athleteId: string;
let createdItemId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);

  await prisma.user.create({
    data: {
      email: TUTOR_EMAIL,
      fullName: "Equipment Test Tutor",
      passwordHash: hash,
      role: UserRole.TUTOR,
    },
  });
  await prisma.user.create({
    data: {
      email: REP_EMAIL,
      fullName: "Equipment Test Rep",
      passwordHash: hash,
      role: UserRole.SPORTS_REP,
    },
  });

  const sport = await prisma.sport.create({
    data: {
      name: `Equipment Sport ${Date.now()}`,
      gender: Gender.MALE,
      category: SportCategory.TEAM,
    },
  });
  sportId = sport.id;

  const team = await prisma.team.create({
    data: {
      name: `Equipment Team ${Date.now()}`,
      sportId,
      gender: Gender.MALE,
    },
  });
  teamId = team.id;

  const athlete = await prisma.studentAthlete.create({
    data: {
      fullName: "Equipment Test Athlete",
      registrationNumber: `EQ${Date.now()}`,
      gender: Gender.MALE,
      email: "equipment.test.athlete@umu.ac.ug",
    },
  });
  athleteId = athlete.id;

  const tutorLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: TUTOR_EMAIL, password: TEST_PASSWORD });
  tutorToken = tutorLogin.body.data.accessToken;

  const repLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: REP_EMAIL, password: TEST_PASSWORD });
  repToken = repLogin.body.data.accessToken;
});

afterAll(async () => {
  try {
    await prisma.equipmentAssignment.deleteMany({
      where: { equipment: { sportId } },
    });
    await prisma.equipmentItem.deleteMany({ where: { sportId } });
    if (athleteId) await prisma.studentAthlete.deleteMany({ where: { id: athleteId } });
    if (teamId) await prisma.team.deleteMany({ where: { id: teamId } });
    if (sportId) await prisma.sport.deleteMany({ where: { id: sportId } });
  } catch {
    // best-effort cleanup
  }

  const userIds = (
    await prisma.user.findMany({
      where: { email: { in: [TUTOR_EMAIL, REP_EMAIL] } },
      select: { id: true },
    })
  ).map((u) => u.id);
  await prisma.notification.deleteMany({ where: { recipientUserId: { in: userIds } } });
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

function itemPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: `Match Ball ${Date.now()}`,
    category: EquipmentCategory.BALL,
    assetNumber: `EQ-${Date.now()}`,
    quantity: 10,
    condition: EquipmentCondition.GOOD,
    sportId,
    storageLocation: "Store A",
    notes: "Created by tests",
    ...overrides,
  };
}

describe("GET /api/equipment", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/equipment");
    expect(res.status).toBe(401);
  });

  it("forbids a SPORTS_REP", async () => {
    const res = await request(app)
      .get("/api/equipment")
      .set("Authorization", `Bearer ${repToken}`);
    expect(res.status).toBe(403);
  });

  it("lists equipment for a TUTOR", async () => {
    const create = await request(app)
      .post("/api/equipment")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send(itemPayload());
    expect(create.status).toBe(201);
    createdItemId = create.body.data.id;

    const res = await request(app)
      .get("/api/equipment")
      .set("Authorization", `Bearer ${tutorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.items).toEqual(expect.any(Array));
    expect(
      res.body.items.some((i: { id: string }) => i.id === createdItemId),
    ).toBe(true);
  });

  it("searches by asset number", async () => {
    const res = await request(app)
      .get(`/api/equipment?search=EQ-${Date.now()}`)
      .set("Authorization", `Bearer ${tutorToken}`);
    expect(res.status).toBe(200);
  });
});

describe("POST /api/equipment", () => {
  it("creates an item", async () => {
    const res = await request(app)
      .post("/api/equipment")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send(itemPayload());
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBeDefined();
  });

  it("rejects a duplicate asset number", async () => {
    const payload = itemPayload();
    await request(app)
      .post("/api/equipment")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send(payload);
    const res = await request(app)
      .post("/api/equipment")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send(payload);
    expect(res.status).toBe(409);
  });

  it("validates the body", async () => {
    const res = await request(app)
      .post("/api/equipment")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({ name: "" });
    expect(res.status).toBe(422);
  });

  it("forbids a SPORTS_REP", async () => {
    const res = await request(app)
      .post("/api/equipment")
      .set("Authorization", `Bearer ${repToken}`)
      .send(itemPayload());
    expect(res.status).toBe(403);
  });
});

describe("GET /api/equipment/:id", () => {
  it("returns an item with assignments", async () => {
    const res = await request(app)
      .get(`/api/equipment/${createdItemId}`)
      .set("Authorization", `Bearer ${tutorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.assignments).toEqual(expect.any(Array));
  });

  it("returns 404 for a missing item", async () => {
    const res = await request(app)
      .get("/api/equipment/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${tutorToken}`);
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/equipment/:id", () => {
  it("updates an item", async () => {
    const res = await request(app)
      .patch(`/api/equipment/${createdItemId}`)
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({ quantity: 20, storageLocation: "Store B" });
    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(20);
  });
});

describe("Assignments", () => {
  it("assigns equipment to an athlete", async () => {
    const res = await request(app)
      .post(`/api/equipment/${createdItemId}/assign`)
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({
        assignedToType: "ATHLETE",
        athleteId,
        quantity: 2,
        notes: "Kits issued",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.athleteId).toBe(athleteId);
  });

  it("forbids a SPORTS_REP from assigning", async () => {
    const res = await request(app)
      .post(`/api/equipment/${createdItemId}/assign`)
      .set("Authorization", `Bearer ${repToken}`)
      .send({ assignedToType: "TEAM", teamId });
    expect(res.status).toBe(403);
  });

  it("rejects assignment beyond available quantity", async () => {
    const res = await request(app)
      .post(`/api/equipment/${createdItemId}/assign`)
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({ assignedToType: "TEAM", teamId, quantity: 9999 });
    expect(res.status).toBe(409);
  });

  it("lists assignments for an item", async () => {
    const res = await request(app)
      .get(`/api/equipment/${createdItemId}/assignments`)
      .set("Authorization", `Bearer ${tutorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("records a return", async () => {
    const list = await request(app)
      .get(`/api/equipment/${createdItemId}/assignments`)
      .set("Authorization", `Bearer ${tutorToken}`);
    const assignmentId = list.body.data[0].id;

    const res = await request(app)
      .post(`/api/equipment/assignments/${assignmentId}/return`)
      .set("Authorization", `Bearer ${tutorToken}`)
      .send({ conditionOnReturn: "FAIR", notes: "Returned after gala" });
    expect(res.status).toBe(200);
    expect(res.body.data.returnedAt).toBeDefined();
  });
});

describe("DELETE /api/equipment/:id", () => {
  it("forbids a SPORTS_REP", async () => {
    const res = await request(app)
      .delete(`/api/equipment/${createdItemId}`)
      .set("Authorization", `Bearer ${repToken}`);
    expect(res.status).toBe(403);
  });

  it("deletes an item", async () => {
    const create = await request(app)
      .post("/api/equipment")
      .set("Authorization", `Bearer ${tutorToken}`)
      .send(itemPayload({ assetNumber: `EQ-DEL-${Date.now()}` }));
    const id = create.body.data.id;

    const res = await request(app)
      .delete(`/api/equipment/${id}`)
      .set("Authorization", `Bearer ${tutorToken}`);
    expect(res.status).toBe(200);
  });
});
