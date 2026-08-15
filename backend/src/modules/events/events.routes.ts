import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createEventSchema, updateEventSchema, registerParticipantSchema } from './events.schema';
import * as controller from './events.controller';

const router = Router();

router.use(verifyToken);

router.get('/', controller.listEvents);

router.get('/:id', controller.getEvent);

router.get('/:id/participants', controller.listParticipants);

router.post(
  '/',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'COACH'),
  validate(createEventSchema),
  controller.createEvent
);

router.patch(
  '/:id',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN'),
  validate(updateEventSchema),
  controller.updateEvent
);

router.patch(
  '/:id/status',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN'),
  controller.updateStatus
);

router.delete(
  '/:id',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN'),
  controller.deleteEvent
);

router.post(
  '/:id/participants',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'COACH'),
  validate(registerParticipantSchema),
  controller.registerParticipant
);

export { router as eventsRouter };
