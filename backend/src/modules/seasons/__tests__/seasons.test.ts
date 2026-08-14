import request from "supertest";
import prisma from "../../../config/database";
import app from "../../../app";
import { hashPassword } from "../../auth/auth.service";
import { UserRole } from "@prisma/client";

const TEST_ADMIN_EMAIL = "seasons.test.admin@umu.ac.ug";
const TEST_COACH_EMAIL = "seasons.test.coach@umu.ac.ug";
const TEST_PASSWORD = "Admin@2025";

let adminToken: string;
let coachToken: string;
let originalCurrentSeasonId: string | null = null;

const createdSeasonIds: string[] = [];

beforeAll(async () => {
  const hash = await hashPassword(TEST_PASSWORD);

  const originalCurrent = await prisma.season.findFirst({
    where: { isCurrent: true },
  });
  originalCurrentSeasonId = originalCurrent?.id ?? null;

  await prisma.user.create({
    data: {
      email: TEST_ADMIN_EMAIL,
      fullName: "Seasons Test Admin",
      passwordHash: hash,
      role: UserRole.SUPER_ADMIN,
    },
  });
  await prisma.user.create({
    data: {
      email: TEST_COACH_EMAIL,
      fullName: "Seasons Test Coach",
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
  await prisma.season.deleteMany({ where: { id: { in: createdSeasonIds } } });

  if (originalCurrentSeasonId) {
    await prisma.season.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
    await prisma.season.update({
      where: { id: originalCurrentSeasonId },
      data: { isCurrent: true },
    });
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

function seasonPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: `T${Date.now()}`,
    startDate: new Date("2026-08-01T00:00:00.000Z").toISOString(),
    endDate: new Date("2027-07-31T00:00:00.000Z").toISOString(),
    ...overrides,
  };
}

describe("GET /api/seasons", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/seasons");
    expect(res.status).toBe(401);
  });

  it("lists seasons with pagination", async () => {
    const create = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(seasonPayload());
    expect(create.status).toBe(201);
    createdSeasonIds.push(create.body.data.id);

    const res = await request(app)
      .get("/api/seasons")
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toMatchObject({ page: 1, pageSize: 50 });
    expect(res.body.data).toEqual(expect.any(Array));
  });
});

describe("POST /api/seasons", () => {
  it("creates a season", async () => {
    const res = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(seasonPayload());
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBeDefined();
    createdSeasonIds.push(res.body.data.id);
  });

  it("rejects endDate before startDate with 422", async () => {
    const res = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(
        seasonPayload({
          startDate: new Date("2027-08-01T00:00:00.000Z").toISOString(),
        }),
      );
    expect(res.status).toBe(422);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("rejects a duplicate name with 409", async () => {
    const name = `Dup${Date.now()}`;
    const first = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(seasonPayload({ name }));
    expect(first.status).toBe(201);
    createdSeasonIds.push(first.body.data.id);

    const res = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(seasonPayload({ name }));
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("CONFLICT");
  });

  it("forbids a coach from creating seasons", async () => {
    const res = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${coachToken}`)
      .send(seasonPayload());
    expect(res.status).toBe(403);
  });

  it("keeps a single current season when marked current", async () => {
    const first = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(seasonPayload({ isCurrent: true }));
    expect(first.status).toBe(201);
    createdSeasonIds.push(first.body.data.id);

    const second = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(seasonPayload({ isCurrent: true }));
    expect(second.status).toBe(201);
    createdSeasonIds.push(second.body.data.id);

    const firstReload = await prisma.season.findUnique({
      where: { id: first.body.data.id },
    });
    const secondReload = await prisma.season.findUnique({
      where: { id: second.body.data.id },
    });
    expect(firstReload!.isCurrent).toBe(false);
    expect(secondReload!.isCurrent).toBe(true);
  });
});

describe("GET /api/seasons/:id", () => {
  it("fetches a single season", async () => {
    const create = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(seasonPayload());
    const id = create.body.data.id;
    createdSeasonIds.push(id);

    const res = await request(app)
      .get(`/api/seasons/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it("returns 404 for an unknown season", async () => {
    const res = await request(app)
      .get("/api/seasons/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT_FOUND");
  });
});

describe("PATCH /api/seasons/:id", () => {
  it("updates a single field without validation error", async () => {
    const create = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(seasonPayload());
    const id = create.body.data.id;
    createdSeasonIds.push(id);

    const res = await request(app)
      .patch(`/api/seasons/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isCurrent: true });
    expect(res.status).toBe(200);
    expect(res.body.data.isCurrent).toBe(true);
  });

  it("updates dates and validates the range", async () => {
    const create = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(seasonPayload());
    const id = create.body.data.id;
    createdSeasonIds.push(id);

    const good = await request(app)
      .patch(`/api/seasons/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ startDate: new Date("2026-09-01T00:00:00.000Z").toISOString() });
    expect(good.status).toBe(200);

    const bad = await request(app)
      .patch(`/api/seasons/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ startDate: new Date("2028-01-01T00:00:00.000Z").toISOString() });
    expect(bad.status).toBe(422);
    expect(bad.body.error).toBe("VALIDATION_ERROR");
  });

  it("forbids a coach from updating seasons", async () => {
    const res = await request(app)
      .patch("/api/seasons/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${coachToken}`)
      .send({ name: "nope" });
    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/seasons/:id", () => {
  it("deletes a non-current season", async () => {
    const create = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(seasonPayload());
    const id = create.body.data.id;

    const res = await request(app)
      .delete(`/api/seasons/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const missing = await request(app)
      .get(`/api/seasons/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(missing.status).toBe(404);
  });

  it("forbids deleting the current season with 409", async () => {
    const create = await request(app)
      .post("/api/seasons")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(seasonPayload({ isCurrent: true }));
    expect(create.status).toBe(201);
    createdSeasonIds.push(create.body.data.id);

    const res = await request(app)
      .delete(`/api/seasons/${create.body.data.id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("CONFLICT");
  });

  it("forbids a coach from deleting seasons", async () => {
    const res = await request(app)
      .delete("/api/seasons/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${coachToken}`);
    expect(res.status).toBe(403);
  });
});
