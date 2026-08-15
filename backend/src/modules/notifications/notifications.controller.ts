import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './notifications.service';

export async function listNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.listNotifications(req.user!.id, {
      isRead: req.query.isRead as 'true' | 'false' | undefined,
      severity: req.query.severity as never,
      page: parseInt((req.query.page as string) ?? '1', 10),
      pageSize: parseInt((req.query.pageSize as string) ?? '20', 10),
    });
    res.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function getNotification(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notification = await service.getNotification(req.params.id, req.user!.id);
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notification = await service.markAsRead(req.params.id, req.user!.id);
    res.json({ success: true, data: notification, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.markAllAsRead(req.user!.id);
    res.json({ success: true, data: result, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

export async function runChecks(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const academic = await service.runAcademicChecks();
    const scholarships = await service.runScholarshipExpiryChecks();
    const documents = await service.runDocumentExpiryChecks();
    res.json({
      success: true,
      data: { academic, scholarships, documents },
      message: 'Alert checks completed',
    });
  } catch (err) {
    next(err);
  }
}
