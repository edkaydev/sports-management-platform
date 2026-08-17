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
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(createEventSchema),
  controller.createEvent
);

router.patch(
  '/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateEventSchema),
  controller.updateEvent
);

router.patch(
  '/:id/status',
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.updateStatus
);

router.delete(
  '/:id',
  requireRole('TUTOR'),
  controller.deleteEvent
);

router.post(
  '/:id/participants',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(registerParticipantSchema),
  controller.registerParticipant
);

export { router as eventsRouter };
