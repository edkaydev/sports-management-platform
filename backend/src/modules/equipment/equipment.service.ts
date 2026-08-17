import { Prisma, EquipmentStatus } from "@prisma/client";
import prisma from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import {
  CreateEquipmentInput,
  UpdateEquipmentInput,
  ListEquipmentQuery,
  AssignEquipmentInput,
  ReturnEquipmentInput,
} from "./equipment.schema";

function toDate(value: string | Date | null | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  return new Date(value);
}

export async function listEquipment(query: ListEquipmentQuery) {
  const where: Prisma.EquipmentItemWhereInput = {};

  if (query.category) where.category = query.category;
  if (query.status) where.status = query.status;
  if (query.condition) where.condition = query.condition;
  if (query.sportId) where.sportId = query.sportId;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { assetNumber: { contains: query.search } },
      { serialNumber: { contains: query.search } },
      { storageLocation: { contains: query.search } },
    ];
  }

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;

  const [total, items] = await Promise.all([
    prisma.equipmentItem.count({ where }),
    prisma.equipmentItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        sport: { select: { id: true, name: true } },
        assignments: {
          where: { returnedAt: null },
          select: {
            id: true,
            assignedToType: true,
            athleteId: true,
            teamId: true,
            quantity: true,
            assignedAt: true,
            dueDate: true,
            athlete: { select: { id: true, fullName: true } },
            team: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getEquipmentById(id: string) {
  const item = await prisma.equipmentItem.findUnique({
    where: { id },
    include: {
      sport: { select: { id: true, name: true } },
      assignments: {
        orderBy: { assignedAt: "desc" },
        include: {
          athlete: { select: { id: true, fullName: true } },
          team: { select: { id: true, name: true } },
          assignedByUser: { select: { id: true, fullName: true } },
        },
      },
    },
  });
  if (!item) throw new AppError(404, "NOT_FOUND", "Equipment item not found");
  return item;
}

export async function createEquipment(
  input: CreateEquipmentInput,
  userId: string,
) {
  const data: Prisma.EquipmentItemCreateInput = {
    name: input.name,
    category: input.category,
    assetNumber: input.assetNumber ?? null,
    serialNumber: input.serialNumber ?? null,
    quantity: input.quantity ?? 1,
    condition: input.condition,
    status: input.status,
    storageLocation: input.storageLocation ?? null,
    purchasedDate: toDate(input.purchasedDate) ?? null,
    purchaseCost: input.purchaseCost ?? null,
    notes: input.notes ?? null,
    sport: input.sportId
      ? { connect: { id: input.sportId } }
      : undefined,
    createdByUser: userId ? { connect: { id: userId } } : undefined,
  };

  try {
    return await prisma.equipmentItem.create({ data });
  } catch (err) {
    throw mapPrismaError(err, "An equipment item with this asset number already exists");
  }
}

export async function updateEquipment(
  id: string,
  input: UpdateEquipmentInput,
) {
  await getEquipmentById(id);

  const data: Prisma.EquipmentItemUpdateInput = {
    name: input.name,
    category: input.category,
    assetNumber: input.assetNumber,
    serialNumber: input.serialNumber,
    quantity: input.quantity,
    condition: input.condition,
    status: input.status,
    storageLocation: input.storageLocation,
    purchasedDate: toDate(input.purchasedDate),
    purchaseCost: input.purchaseCost,
    notes: input.notes,
    sport: input.sportId !== undefined
      ? input.sportId
        ? { connect: { id: input.sportId } }
        : { disconnect: true }
      : undefined,
  };

  try {
    return await prisma.equipmentItem.update({ where: { id }, data });
  } catch (err) {
    throw mapPrismaError(err, "An equipment item with this asset number already exists");
  }
}

export async function deleteEquipment(id: string): Promise<void> {
  await getEquipmentById(id);
  await prisma.equipmentItem.delete({ where: { id } });
}

export async function assignEquipment(
  equipmentId: string,
  input: AssignEquipmentInput,
  userId: string,
) {
  const item = await getEquipmentById(equipmentId);
  const quantity = input.quantity ?? 1;

  if (item.status === EquipmentStatus.RETIRED) {
    throw new AppError(409, "CONFLICT", "Retired equipment cannot be assigned");
  }

  const activeAssignments = await prisma.equipmentAssignment.aggregate({
    where: { equipmentId, returnedAt: null },
    _sum: { quantity: true },
  });
  const currentlyOut = activeAssignments._sum.quantity ?? 0;
  const available = item.quantity - currentlyOut;

  if (quantity > available) {
    throw new AppError(
      409,
      "CONFLICT",
      `Only ${available} of "${item.name}" are available`,
    );
  }

  if (
    input.assignedToType === "ATHLETE" &&
    !(await prisma.studentAthlete.findUnique({ where: { id: input.athleteId! } }))
  ) {
    throw new AppError(404, "NOT_FOUND", "Athlete not found");
  }
  if (
    input.assignedToType === "TEAM" &&
    !(await prisma.team.findUnique({ where: { id: input.teamId! } }))
  ) {
    throw new AppError(404, "NOT_FOUND", "Team not found");
  }

  const assignment = await prisma.equipmentAssignment.create({
    data: {
      equipmentId,
      assignedToType: input.assignedToType,
      athleteId: input.assignedToType === "ATHLETE" ? input.athleteId! : null,
      teamId: input.assignedToType === "TEAM" ? input.teamId! : null,
      quantity,
      assignedBy: userId,
      dueDate: toDate(input.dueDate) ?? null,
      notes: input.notes ?? null,
    },
  });

  if (available - quantity <= 0) {
    await prisma.equipmentItem.update({
      where: { id: equipmentId },
      data: { status: EquipmentStatus.ISSUED },
    });
  }

  return assignment;
}

export async function returnEquipment(
  assignmentId: string,
  input: ReturnEquipmentInput,
) {
  const assignment = await prisma.equipmentAssignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment) {
    throw new AppError(404, "NOT_FOUND", "Assignment not found");
  }
  if (assignment.returnedAt) {
    throw new AppError(409, "CONFLICT", "This assignment was already returned");
  }

  const updated = await prisma.equipmentAssignment.update({
    where: { id: assignmentId },
    data: {
      returnedAt: new Date(),
      conditionOnReturn: input.conditionOnReturn ?? null,
      notes: input.notes ?? assignment.notes,
    },
  });

  await syncItemStatus(assignment.equipmentId);
  return updated;
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
  const assignment = await prisma.equipmentAssignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment) {
    throw new AppError(404, "NOT_FOUND", "Assignment not found");
  }
  await prisma.equipmentAssignment.delete({ where: { id: assignmentId } });
  await syncItemStatus(assignment.equipmentId);
}

async function syncItemStatus(equipmentId: string): Promise<void> {
  const openAssignments = await prisma.equipmentAssignment.count({
    where: { equipmentId, returnedAt: null },
  });
  const item = await prisma.equipmentItem.findUnique({ where: { id: equipmentId } });
  if (!item) return;

  if (item.status !== EquipmentStatus.RETIRED && item.status !== EquipmentStatus.UNDER_MAINTENANCE) {
    const nextStatus =
      openAssignments > 0
        ? EquipmentStatus.ISSUED
        : item.quantity > 0
          ? EquipmentStatus.AVAILABLE
          : EquipmentStatus.RETIRED;
    if (nextStatus !== item.status) {
      await prisma.equipmentItem.update({
        where: { id: equipmentId },
        data: { status: nextStatus },
      });
    }
  }
}

export async function getAssignments(equipmentId: string) {
  await getEquipmentById(equipmentId);
  return prisma.equipmentAssignment.findMany({
    where: { equipmentId },
    orderBy: { assignedAt: "desc" },
    include: {
      athlete: { select: { id: true, fullName: true } },
      team: { select: { id: true, name: true } },
      assignedByUser: { select: { id: true, fullName: true } },
    },
  });
}

function mapPrismaError(err: unknown, conflictMessage: string): Error {
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    return new AppError(409, "CONFLICT", conflictMessage);
  }
  return err as Error;
}
