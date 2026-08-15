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
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'COACH'),
  validate(createMatchSchema),
  controller.createMatch
);

router.patch(
  '/:id',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN'),
  validate(updateMatchSchema),
  controller.updateMatch
);

router.patch(
  '/:id/status',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN'),
  controller.updateStatus
);

router.post(
  '/:id/lineups',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'COACH', 'TEAM_MANAGER'),
  validate(submitLineupSchema),
  controller.submitLineup
);

router.post(
  '/:id/events',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'COACH', 'OFFICIAL'),
  validate(recordMatchEventSchema),
  controller.recordMatchEvent
);

router.post(
  '/:id/result',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'COACH', 'OFFICIAL'),
  validate(recordResultSchema),
  controller.recordResult
);

router.post(
  '/:id/report',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'COACH'),
  validate(submitMatchReportSchema),
  controller.submitMatchReport
);

router.delete(
  '/:id',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN'),
  controller.deleteMatch
);

export { router as matchesRouter };
