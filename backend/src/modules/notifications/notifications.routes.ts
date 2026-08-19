import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import * as controller from './notifications.controller';

const router = Router();

router.use(verifyToken);

router.get('/', controller.listNotifications);

router.get('/:id', controller.getNotification);

router.patch('/read-all', controller.markAllAsRead);

router.patch('/:id/read', controller.markAsRead);

router.post(
  '/run-checks',
  requireRole('TUTOR'),
  controller.runChecks
);

router.post(
  '/broadcast',
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.broadcastNotification
);

router.post(
  '/email',
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.sendEmailNotification
);

export { router as notificationsRouter };
