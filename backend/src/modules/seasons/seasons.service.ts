import prisma from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import {
  CreateSeasonInput,
  UpdateSeasonInput,
  ListSeasonsQuery,
} from "./seasons.schema";
import { Prisma } from "@prisma/client";

export async function listSeasons(query: ListSeasonsQuery) {
  const page = query.page;
  const pageSize = query.pageSize;

  const where =
    query.isCurrent !== undefined
      ? { isCurrent: query.isCurrent === "true" }
      : {};

  const [seasons, total] = await Promise.all([
    prisma.season.findMany({
      where,
      orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.season.count({ where }),
  ]);

  return {
    seasons,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getSeasonById(id: string) {
  const season = await prisma.season.findUnique({ where: { id } });
  if (!season) throw new AppError(404, "NOT_FOUND", "Season not found");
  return season;
}

export async function createSeason(
  input: CreateSeasonInput,
  createdBy: string,
) {
  const isCurrent = input.isCurrent ?? false;

  if (isCurrent) {
    await prisma.season.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
  }

  try {
    return await prisma.season.create({
      data: {
        name: input.name,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        isCurrent,
        createdBy,
      },
    });
  } catch (err) {
    throw mapPrismaError(err);
  }
}

export async function updateSeason(id: string, input: UpdateSeasonInput) {
  const season = await getSeasonById(id);

  const effectiveStart =
    input.startDate !== undefined
      ? new Date(input.startDate)
      : season.startDate;
  const effectiveEnd =
    input.endDate !== undefined ? new Date(input.endDate) : season.endDate;
  if (effectiveEnd <= effectiveStart) {
    throw new AppError(
      422,
      "VALIDATION_ERROR",
      "endDate must be after startDate",
    );
  }

  if (input.isCurrent) {
    await prisma.season.updateMany({
      where: { isCurrent: true, NOT: { id } },
      data: { isCurrent: false },
    });
  }

  const data = {
    ...input,
    ...(input.startDate !== undefined
      ? { startDate: new Date(input.startDate) }
      : {}),
    ...(input.endDate !== undefined
      ? { endDate: new Date(input.endDate) }
      : {}),
  };

  try {
    return await prisma.season.update({ where: { id }, data });
  } catch (err) {
    throw mapPrismaError(err);
  }
}

export async function deleteSeason(id: string): Promise<void> {
  const season = await getSeasonById(id);
  if (season.isCurrent) {
    throw new AppError(409, "CONFLICT", "Cannot delete the current season");
  }
  await prisma.season.delete({ where: { id } });
}

function mapPrismaError(err: unknown): Error {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    return new AppError(
      409,
      "CONFLICT",
      "A season with this name already exists",
    );
  }
  return err as Error;
}
