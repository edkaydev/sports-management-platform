import { Prisma, NotificationType, NotificationSeverity } from '@prisma/client';
import nodemailer from 'nodemailer';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { emitNotificationNew, emitToAll, emitToRole } from '../../config/socket';
import type { ListNotificationsQuery } from './notifications.schema';

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function listNotifications(userId: string, query: ListNotificationsQuery) {
  const where: Prisma.NotificationWhereInput = { recipientUserId: userId };
  if (query.isRead !== undefined) where.isRead = query.isRead === 'true';
  if (query.severity) where.severity = query.severity;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        relatedAthlete: {
          select: { id: true, fullName: true, registrationNumber: true },
        },
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { recipientUserId: userId, isRead: false },
    }),
  ]);

  return {
    notifications,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
    unreadCount,
  };
}

export async function getNotification(id: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id, recipientUserId: userId },
  });
  if (!notification) throw new AppError(404, 'NOT_FOUND', 'Notification not found');
  return notification;
}

export async function markAsRead(id: string, userId: string) {
  const existing = await prisma.notification.findFirst({
    where: { id, recipientUserId: userId },
  });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Notification not found');

  return prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { recipientUserId: userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return { updated: result.count };
}

// ─── Creation helper (used by other modules / rules engine) ───────────────────

export async function createNotification(input: {
  type: NotificationType;
  severity?: NotificationSeverity;
  title: string;
  message: string;
  recipientUserId: string;
  relatedAthleteId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  expiresAt?: Date;
}) {
  const notification = await prisma.notification.create({
    data: {
      type: input.type,
      severity: input.severity ?? NotificationSeverity.INFO,
      title: input.title,
      message: input.message,
      recipientUserId: input.recipientUserId,
      relatedAthleteId: input.relatedAthleteId,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
      expiresAt: input.expiresAt,
    },
  });

  // Push real-time update to recipient
  emitNotificationNew(input.recipientUserId, {
    id: notification.id,
    type: notification.type,
    severity: notification.severity,
    title: notification.title,
    message: notification.message,
  });

  return notification;
}

export async function createNotificationsBulk(
  inputs: Array<{
    type: NotificationType;
    severity?: NotificationSeverity;
    title: string;
    message: string;
    recipientUserId: string;
    relatedAthleteId?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }>
) {
  if (inputs.length === 0) return { created: 0 };
  const result = await prisma.notification.createMany({
    data: inputs.map((i) => ({
      type: i.type,
      severity: i.severity ?? NotificationSeverity.INFO,
      title: i.title,
      message: i.message,
      recipientUserId: i.recipientUserId,
      relatedAthleteId: i.relatedAthleteId,
      relatedEntityType: i.relatedEntityType,
      relatedEntityId: i.relatedEntityId,
    })),
  });
  return { created: result.count };
}

// ─── Rule-based generation ────────────────────────────────────────────────────

export async function runAcademicChecks() {
  const currentYear = '2025/2026';
  const warnings = await prisma.academicRecord.findMany({
    where: {
      academicYear: currentYear,
      OR: [
        { academicStanding: 'WARNING' },
        { academicStanding: 'PROBATION' },
        { attendancePercentage: { lt: 75 } },
      ],
    },
    include: { athlete: { select: { id: true, fullName: true } } },
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ['TUTOR', 'SPORTS_REP'] } },
    select: { id: true },
  });

  const notifications: Array<{
    type: NotificationType;
    severity: NotificationSeverity;
    title: string;
    message: string;
    recipientUserId: string;
    relatedAthleteId: string;
  }> = [];

  for (const record of warnings) {
    const severity =
      record.academicStanding === 'PROBATION'
        ? NotificationSeverity.CRITICAL
        : NotificationSeverity.WARNING;
    const type =
      record.academicStanding === 'PROBATION'
        ? NotificationType.ACADEMIC_PROBATION
        : record.attendancePercentage !== null && Number(record.attendancePercentage) < 75
          ? NotificationType.LOW_ATTENDANCE
          : NotificationType.ACADEMIC_WARNING;

    for (const admin of admins) {
      notifications.push({
        type,
        severity,
        title: `${record.athlete.fullName} — academic alert`,
        message: `GPA ${record.gpa ?? 'N/A'}, standing ${record.academicStanding}.`,
        recipientUserId: admin.id,
        relatedAthleteId: record.athlete.id,
      });
    }
  }

  return createNotificationsBulk(notifications);
}

export async function runScholarshipExpiryChecks() {
  const today = new Date();
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);

  const expiring = await prisma.scholarship.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { gte: today, lte: in30 },
    },
    include: { athlete: { select: { id: true, fullName: true } } },
  });

  const expired = await prisma.scholarship.findMany({
    where: { status: 'ACTIVE', endDate: { lt: today } },
    include: { athlete: { select: { id: true, fullName: true } } },
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ['TUTOR', 'SPORTS_REP'] } },
    select: { id: true },
  });

  const notifications: Array<{
    type: NotificationType;
    severity: NotificationSeverity;
    title: string;
    message: string;
    recipientUserId: string;
    relatedAthleteId: string;
  }> = [];

  for (const s of expiring) {
    for (const admin of admins) {
      notifications.push({
        type: NotificationType.SCHOLARSHIP_EXPIRING,
        severity: NotificationSeverity.WARNING,
        title: `Scholarship expiring — ${s.athlete.fullName}`,
        message: `Scholarship expires ${s.endDate.toISOString().slice(0, 10)}.`,
        recipientUserId: admin.id,
        relatedAthleteId: s.athlete.id,
      });
    }
  }

  for (const s of expired) {
    await prisma.scholarship.update({ where: { id: s.id }, data: { status: 'EXPIRED' } });
    for (const admin of admins) {
      notifications.push({
        type: NotificationType.SCHOLARSHIP_EXPIRED,
        severity: NotificationSeverity.CRITICAL,
        title: `Scholarship expired — ${s.athlete.fullName}`,
        message: `Scholarship expired on ${s.endDate.toISOString().slice(0, 10)}.`,
        recipientUserId: admin.id,
        relatedAthleteId: s.athlete.id,
      });
    }
  }

  return createNotificationsBulk(notifications);
}

export async function runDocumentExpiryChecks() {
  const today = new Date();
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);

  const expiring = await prisma.document.findMany({
    where: { status: 'ACTIVE', expiryDate: { gte: today, lte: in30 } },
    include: { athlete: { select: { id: true, fullName: true } } },
  });

  const expired = await prisma.document.findMany({
    where: { status: 'ACTIVE', expiryDate: { lt: today } },
    include: { athlete: { select: { id: true, fullName: true } } },
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ['TUTOR', 'SPORTS_REP'] } },
    select: { id: true },
  });

  const notifications: Array<{
    type: NotificationType;
    severity: NotificationSeverity;
    title: string;
    message: string;
    recipientUserId: string;
    relatedAthleteId?: string;
  }> = [];

  for (const d of expiring) {
    for (const admin of admins) {
      notifications.push({
        type: NotificationType.DOCUMENT_EXPIRING,
        severity: NotificationSeverity.WARNING,
        title: `Document expiring — ${d.title}`,
        message: `${d.title} expires ${d.expiryDate!.toISOString().slice(0, 10)}.`,
        recipientUserId: admin.id,
        relatedAthleteId: d.athleteId ?? undefined,
      });
    }
  }

  for (const d of expired) {
    await prisma.document.update({ where: { id: d.id }, data: { status: 'EXPIRED' } });
    for (const admin of admins) {
      notifications.push({
        type: NotificationType.DOCUMENT_EXPIRED,
        severity: NotificationSeverity.CRITICAL,
        title: `Document expired — ${d.title}`,
        message: `${d.title} expired on ${d.expiryDate!.toISOString().slice(0, 10)}.`,
        recipientUserId: admin.id,
        relatedAthleteId: d.athleteId ?? undefined,
      });
    }
  }

  return createNotificationsBulk(notifications);
}

// ─── Broadcast (staff-initiated) ──────────────────────────────────────────────

export async function broadcastNotification(input: {
  title: string;
  message: string;
  type?: NotificationType;
  targetRole?: string;
}) {
  const where = input.targetRole
    ? { role: input.targetRole as any, isActive: true }
    : { isActive: true };

  const users = await prisma.user.findMany({ where, select: { id: true } });

  const notifications = await createNotificationsBulk(
    users.map((u) => ({
      type: input.type ?? NotificationType.SYSTEM,
      severity: NotificationSeverity.INFO,
      title: input.title,
      message: input.message,
      recipientUserId: u.id,
    }))
  );

  // Push real-time event to all (or role room)
  if (input.targetRole) {
    emitToRole(input.targetRole, 'notification:new', { title: input.title, message: input.message });
  } else {
    emitToAll('notification:new', { title: input.title, message: input.message });
  }

  return { ...notifications, recipientCount: users.length };
}

// ─── Email (nodemailer) ───────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmailNotification(input: {
  subject: string;
  body: string;
  recipientRole?: string;
  recipientEmails?: string[];
  html?: boolean;
}) {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@umu.ac.ug';

  let emails: string[] = input.recipientEmails ?? [];

  if (input.recipientRole) {
    const users = await prisma.user.findMany({
      where: { role: input.recipientRole as any, isActive: true },
      select: { email: true },
    });
    emails = [...emails, ...users.map((u) => u.email)];
  }

  if (emails.length === 0) {
    throw new AppError(400, 'BAD_REQUEST', 'No recipient emails resolved');
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `UMU Sports <${from}>`,
    to: emails.join(','),
    subject: input.subject,
    ...(input.html ? { html: input.body } : { text: input.body }),
  });

  return { sent: emails.length, to: emails };
}
