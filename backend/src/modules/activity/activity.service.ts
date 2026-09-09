import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export interface ActivityRecordInput {
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'note';
  summary: string;
  entityType?: string;
  entityId?: string;
  fileUrl?: string;
  fileName?: string;
  note?: string;
}

export async function record(input: ActivityRecordInput) {
  return prisma.activityLog.create({
    data: {
      userId: input.userId,
      userName: input.userName,
      action: input.action,
      summary: input.summary,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      fileUrl: input.fileUrl ?? null,
      fileName: input.fileName ?? null,
      note: input.note ?? null,
    },
  });
}

export async function listRecent(limit: number, entityType?: string) {
  return prisma.activityLog.findMany({
    where: entityType ? { entityType } : undefined,
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 200),
    select: {
      id: true,
      action: true,
      summary: true,
      entityType: true,
      entityId: true,
      fileUrl: true,
      fileName: true,
      note: true,
      createdAt: true,
      user: { select: { fullName: true, username: true } },
    },
  });
}

export interface ActivityStats {
  totals: { create: number; update: number; delete: number; note: number };
  total: number;
  today: number;
  filesUploaded: number;
  daily: { date: string; count: number }[];
}

export async function getStats(days: number) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const groups = await prisma.activityLog.groupBy({
    by: ['action'],
    _count: { _all: true },
  });

  const createdSince = await prisma.activityLog.count({
    where: { createdAt: { gte: since } },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const today = await prisma.activityLog.count({
    where: { createdAt: { gte: todayStart } },
  });

  const filesUploaded = await prisma.activityLog.count({
    where: { fileUrl: { not: null } },
  });

  const daily = await prisma.activityLog.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: since } },
    _count: { _all: true },
  });

  const totals = { create: 0, update: 0, delete: 0, note: 0 };
  for (const g of groups) {
    const key = g.action as keyof typeof totals;
    if (key in totals) totals[key] = g._count._all;
  }

  const dayMap = new Map<string, number>();
  for (const d of daily) {
    const key = d.createdAt.toISOString().slice(0, 10);
    dayMap.set(key, (dayMap.get(key) ?? 0) + d._count._all);
  }

  const out: { date: string; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const dt = new Date(todayStart);
    dt.setDate(dt.getDate() - (days - 1 - i));
    const key = dt.toISOString().slice(0, 10);
    out.push({ date: key, count: dayMap.get(key) ?? 0 });
  }

  return {
    totals,
    total: groups.reduce((acc, g) => acc + g._count._all, 0),
    createdSince,
    today,
    filesUploaded,
    daily: out,
  };
}

export async function remove(id: string) {
  try {
    await prisma.activityLog.delete({ where: { id } });
  } catch {
    throw new AppError(404, 'NOT_FOUND', 'Activity entry not found');
  }
}