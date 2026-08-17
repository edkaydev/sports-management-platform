import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createMatchSchema,
  updateMatchSchema,
  submitLineupSchema,
  recordMatchEventSchema,
  recordResultSchema,
  submitMatchReportSchema,
} from './matches.schema';
import * as controller from './matches.controller';

const router = Router();

router.use(verifyToken);

router.get('/', controller.listMatches);

router.get('/:id', controller.getMatch);

router.get('/:id/lineups', controller.getLineups);

router.post(
  '/',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(createMatchSchema),
  controller.createMatch
);

router.patch(
  '/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateMatchSchema),
  controller.updateMatch
);

router.patch(
  '/:id/status',
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.updateStatus
);

router.post(
  '/:id/lineups',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(submitLineupSchema),
  controller.submitLineup
);

router.post(
  '/:id/events',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(recordMatchEventSchema),
  controller.recordMatchEvent
);

router.post(
  '/:id/result',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(recordResultSchema),
  controller.recordResult
);

router.post(
  '/:id/report',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(submitMatchReportSchema),
  controller.submitMatchReport
);

router.delete(
  '/:id',
  requireRole('TUTOR'),
  controller.deleteMatch
);

export { router as matchesRouter };
