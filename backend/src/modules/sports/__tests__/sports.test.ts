import request from "supertest";
import prisma from "../../../config/database";
import app from "../../../app";
import { hashPassword } from "../../auth/auth.service";
import { UserRole, Gender, SportCategory } from "@prisma/client";

const TEST_ADMIN_EMAIL = "sports.test.admin@umu.ac.ug";
const TEST_COACH_EMAIL = "sports.test.coach@umu.ac.ug";
const TEST_PASSWORD = "Admin@2025";

let adminToken: string;
let coachToken: string;
let createdSportId: string;

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);

  await prisma.user.create({
    data: {
      email: TEST_ADMIN_EMAIL,
      fullName: "Sports Test Admin",
      passwordHash: hash,
      role: UserRole.SUPER_ADMIN,
    },
  });
  await prisma.user.create({
    data: {
      email: TEST_COACH_EMAIL,
      fullName: "Sports Test Coach",
      passwordHash: hash,
      role: UserRole.COACH,
    },
  });

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
  await prisma.sport.deleteMany({ where: { name: { startsWith: "Test " } } });
  if (createdSportId) {
    await prisma.sport.deleteMany({ where: { id: createdSportId } });
  }

  const testUsers = await prisma.user.findMany({
    where: { email: { in: [TEST_ADMIN_EMAIL, TEST_COACH_EMAIL] } },
    select: { id: true },
  });
  const userIds = testUsers.map((u) => u.id);
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.$disconnect();
});

function sportPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: `Test Sport ${Date.now()}`,
    gender: Gender.MALE,
    category: SportCategory.TEAM,
    description: "Created by tests",
    ...overrides,
  };
}

describe("GET /api/sports", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/sports");
    expect(res.status).toBe(401);
  });

  it("lists sports", async () => {
    const create = await request(app)
      .post("/api/sports")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sportPayload());
    expect(create.status).toBe(201);
    createdSportId = create.body.data.id;

    const res = await request(app)
      .get("/api/sports")
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(expect.any(Array));
    expect(
      res.body.data.some((s: { id: string }) => s.id === createdSportId),
    ).toBe(true);
  });

  it("filters by category and gender", async () => {
    const res = await request(app)
      .get("/api/sports?category=TEAM&gender=MALE")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    for (const sport of res.body.data) {
      expect(sport.category).toBe("TEAM");
      expect(sport.gender).toBe("MALE");
    }
  });
});

describe("POST /api/sports", () => {
  it("creates a sport", async () => {
    const res = await request(app)
      .post("/api/sports")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sportPayload({ name: `Test Create ${Date.now()}` }));
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBeDefined();
    expect(res.body.data.isActive).toBe(true);
  });

  it("rejects a duplicate name with 409", async () => {
    const name = `Test Dup ${Date.now()}`;
    const first = await request(app)
      .post("/api/sports")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sportPayload({ name }));
    expect(first.status).toBe(201);
    createdSportId = first.body.data.id;

    const res = await request(app)
      .post("/api/sports")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sportPayload({ name }));
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("CONFLICT");
  });

  it("rejects invalid input with 422", async () => {
    const res = await request(app)
      .post("/api/sports")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "", gender: "UNKNOWN" });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("forbids a coach from creating sports", async () => {
    const res = await request(app)
      .post("/api/sports")
      .set("Authorization", `Bearer ${coachToken}`)
      .send(sportPayload());
    expect(res.status).toBe(403);
  });
});

describe("GET /api/sports/:id", () => {
  it("fetches a single sport", async () => {
    const create = await request(app)
      .post("/api/sports")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sportPayload());
    const id = create.body.data.id;

    const res = await request(app)
      .get(`/api/sports/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it("returns 404 for an unknown sport", async () => {
    const res = await request(app)
      .get("/api/sports/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT_FOUND");
  });
});

describe("PATCH /api/sports/:id", () => {
  it("updates a sport", async () => {
    const create = await request(app)
      .post("/api/sports")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sportPayload());
    const id = create.body.data.id;

    const res = await request(app)
      .patch(`/api/sports/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ description: "Updated description" });
    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe("Updated description");
  });

  it("forbids a coach from updating sports", async () => {
    const res = await request(app)
      .patch("/api/sports/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${coachToken}`)
      .send({ description: "nope" });
    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/sports/:id", () => {
  it("deactivates a sport", async () => {
    const create = await request(app)
      .post("/api/sports")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(sportPayload());
    const id = create.body.data.id;

    const res = await request(app)
      .delete(`/api/sports/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const fetched = await prisma.sport.findUnique({ where: { id } });
    expect(fetched!.isActive).toBe(false);
  });
});
