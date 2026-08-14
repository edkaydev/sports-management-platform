import { Prisma } from "@prisma/client";
import prisma from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import {
  CreateSportInput,
  UpdateSportInput,
  ListSportsQuery,
} from "./sports.schema";

export async function listSports(query: ListSportsQuery) {
  const where: Prisma.SportWhereInput = {};

  if (query.isActive !== undefined) where.isActive = query.isActive === "true";
  if (query.category) where.category = query.category;
  if (query.gender) where.gender = query.gender;

  const sports = await prisma.sport.findMany({
    where,
    orderBy: { name: "asc" },
  });
  return sports;
}

export async function getSportById(id: string) {
  const sport = await prisma.sport.findUnique({ where: { id } });
  if (!sport) throw new AppError(404, "NOT_FOUND", "Sport not found");
  return sport;
}

export async function createSport(input: CreateSportInput) {
  try {
    return await prisma.sport.create({ data: input });
  } catch (err) {
    throw mapPrismaError(err);
  }
}

export async function updateSport(id: string, input: UpdateSportInput) {
  await getSportById(id);
  try {
    return await prisma.sport.update({ where: { id }, data: input });
  } catch (err) {
    throw mapPrismaError(err);
  }
}

export async function deleteSport(id: string): Promise<void> {
  await getSportById(id);
  await prisma.sport.update({ where: { id }, data: { isActive: false } });
}

function mapPrismaError(err: unknown): Error {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    return new AppError(
      409,
      "CONFLICT",
      "A sport with this name already exists",
    );
  }
  return err as Error;
}
