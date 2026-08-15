import { z } from 'zod';
import { NotificationSeverity } from '@prisma/client';

export const listNotificationsQuerySchema = z.object({
  isRead: z.enum(['true', 'false']).optional(),
  severity: z.nativeEnum(NotificationSeverity).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
