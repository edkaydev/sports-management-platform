import { Prisma, Gender } from "@prisma/client";
import prisma from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import {
  CreateTeamInput,
  UpdateTeamInput,
  ListTeamsQuery,
  AddSquadMemberInput,
  AssignStaffInput,
} from "./teams.schema";

const TEAM_INCLUDE = {
  sport: true,
  season: true,
  squadEntries: { include: { athlete: true }, orderBy: { joinedDate: "asc" } },
  staff: { include: { user: true } },
} satisfies Prisma.TeamInclude;

export async function listTeams(query: ListTeamsQuery) {
  const page = query.page;
  const pageSize = query.pageSize;

  const where: Prisma.TeamWhereInput = { deletedAt: null };

  if (query.sport) where.sportId = query.sport;
  if (query.season) where.seasonId = query.season;
  if (query.gender) where.gender = query.gender;
  if (query.isActive !== undefined) where.isActive = query.isActive === "true";
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { shortName: { contains: query.search } },
    ];
  }

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      include: {
        sport: true,
        season: true,
        _count: { select: { squadEntries: true, staff: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.team.count({ where }),
  ]);

  return {
    teams,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getTeamById(id: string) {
  const team = await prisma.team.findFirst({
    where: { id, deletedAt: null },
    include: TEAM_INCLUDE,
  });
  if (!team) throw new AppError(404, "NOT_FOUND", "Team not found");
  return team;
}

export async function createTeam(input: CreateTeamInput) {
  const sport = await prisma.sport.findUnique({ where: { id: input.sportId } });
  if (!sport || !sport.isActive) {
    throw new AppError(
      422,
      "VALIDATION_ERROR",
      "Sport does not exist or is inactive",
    );
  }
  if (input.seasonId) {
    await ensureSeason(input.seasonId);
  }
  assertGenderCompatible(input.gender, sport.gender);

  try {
    return await prisma.team.create({
      data: {
        name: input.name,
        shortName: input.shortName ?? null,
        sportId: input.sportId,
        seasonId: input.seasonId ?? null,
        gender: input.gender,
        logoUrl: input.logoUrl ?? null,
        homeVenue: input.homeVenue ?? null,
        foundingYear: input.foundingYear ?? null,
        isActive: input.isActive ?? true,
      },
      include: TEAM_INCLUDE,
    });
  } catch (err) {
    throw mapPrismaError(err);
  }
}

export async function updateTeam(id: string, input: UpdateTeamInput) {
  await getTeamById(id);
  if (input.sportId) {
    const sport = await prisma.sport.findUnique({
      where: { id: input.sportId },
    });
    if (!sport || !sport.isActive) {
      throw new AppError(
        422,
        "VALIDATION_ERROR",
        "Sport does not exist or is inactive",
      );
    }
  }
  if (input.seasonId) {
    await ensureSeason(input.seasonId);
  }

  try {
    return await prisma.team.update({
      where: { id },
      data: {
        ...input,
        seasonId: input.seasonId ?? null,
        logoUrl: input.logoUrl ?? null,
        homeVenue: input.homeVenue ?? null,
      },
      include: TEAM_INCLUDE,
    });
  } catch (err) {
    throw mapPrismaError(err);
  }
}

export async function deleteTeam(id: string): Promise<void> {
  await getTeamById(id);
  await prisma.team.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}

export async function getTeamSquad(id: string) {
  await getTeamById(id);
  const squad = await prisma.teamSquad.findMany({
    where: { teamId: id },
    include: { athlete: true, season: true },
    orderBy: { joinedDate: "asc" },
  });
  return squad;
}

export async function addSquadMember(
  teamId: string,
  input: AddSquadMemberInput,
) {
  const team = await getTeamById(teamId);

  const athlete = await prisma.studentAthlete.findFirst({
    where: { id: input.athleteId, deletedAt: null },
  });
  if (!athlete)
    throw new AppError(422, "VALIDATION_ERROR", "Athlete does not exist");
  await ensureSeason(input.seasonId);

  try {
    return await prisma.$transaction(async (tx) => {
      const entry = await tx.teamSquad.create({
        data: {
          teamId,
          athleteId: input.athleteId,
          seasonId: input.seasonId,
          jerseyNumber: input.jerseyNumber ?? null,
          position: input.position ?? null,
          isCaptain: input.isCaptain ?? false,
          isViceCaptain: input.isViceCaptain ?? false,
          joinedDate: input.joinedDate ? new Date(input.joinedDate) : null,
          status: input.status ?? "ACTIVE",
          notes: input.notes ?? null,
        },
        include: { athlete: true },
      });

      await tx.sportAffiliation.upsert({
        where: {
          athleteId_sportId_teamId: {
            athleteId: input.athleteId,
            sportId: team.sportId,
            teamId,
          },
        },
        update: {
          position: input.position,
          jerseyNumber: input.jerseyNumber,
          isCaptain: input.isCaptain,
          isViceCaptain: input.isViceCaptain,
        },
        create: {
          athleteId: input.athleteId,
          sportId: team.sportId,
          teamId,
          position: input.position ?? null,
          jerseyNumber: input.jerseyNumber ?? null,
          isCaptain: input.isCaptain ?? false,
          isViceCaptain: input.isViceCaptain ?? false,
          joinedDate: input.joinedDate ? new Date(input.joinedDate) : null,
          status: athlete.status,
        },
      });

      return entry;
    });
  } catch (err) {
    throw mapPrismaError(err);
  }
}

export async function removeSquadMember(
  teamId: string,
  athleteId: string,
): Promise<void> {
  await getTeamById(teamId);
  await prisma.teamSquad.deleteMany({ where: { teamId, athleteId } });
}

export async function getTeamStaff(teamId: string) {
  await getTeamById(teamId);
  return prisma.teamStaff.findMany({
    where: { teamId },
    include: { user: true },
    orderBy: { assignedDate: "asc" },
  });
}

export async function assignStaff(teamId: string, input: AssignStaffInput) {
  await getTeamById(teamId);

  const user = await prisma.user.findFirst({
    where: { id: input.userId, deletedAt: null },
  });
  if (!user) throw new AppError(422, "VALIDATION_ERROR", "User does not exist");

  try {
    return await prisma.teamStaff.create({
      data: {
        teamId,
        userId: input.userId,
        role: input.role,
        assignedDate: input.assignedDate ? new Date(input.assignedDate) : null,
        notes: input.notes ?? null,
      },
      include: { user: true },
    });
  } catch (err) {
    throw mapPrismaError(err);
  }
}

export async function removeStaff(staffId: string): Promise<void> {
  const staff = await prisma.teamStaff.findUnique({ where: { id: staffId } });
  if (!staff)
    throw new AppError(404, "NOT_FOUND", "Staff assignment not found");
  await prisma.teamStaff.delete({ where: { id: staffId } });
}

async function ensureSeason(seasonId: string): Promise<void> {
  const season = await prisma.season.findUnique({ where: { id: seasonId } });
  if (!season)
    throw new AppError(422, "VALIDATION_ERROR", "Season does not exist");
}

function assertGenderCompatible(teamGender: Gender, sportGender: Gender): void {
  if (sportGender === Gender.MIXED) return;
  if (teamGender === Gender.MIXED) return;
  if (teamGender !== sportGender) {
    throw new AppError(
      422,
      "VALIDATION_ERROR",
      `Team gender ${teamGender} is not compatible with sport gender ${sportGender}`,
    );
  }
}

function mapPrismaError(err: unknown): Error {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = err.meta?.target;
      const fields = Array.isArray(target)
        ? target.join(", ")
        : typeof target === "string"
          ? target
          : "record";
      return new AppError(
        409,
        "CONFLICT",
        `A team record with these ${fields} already exists`,
      );
    }
  }
  return err as Error;
}
