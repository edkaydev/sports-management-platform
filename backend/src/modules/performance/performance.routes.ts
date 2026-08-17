import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  recordPerformanceSchema,
  createTrainingSessionSchema,
  updateTrainingSessionSchema,
  recordAttendanceSchema,
} from './performance.schema';
import * as controller from './performance.controller';

const router = Router();

router.use(verifyToken);

router.get('/matches/:matchId/performances', controller.listMatchPerformances);

router.get('/athletes/:athleteId/performances', controller.listAthletePerformances);

router.get('/performances/:id', controller.getPerformance);

router.get('/training-sessions', controller.listTrainingSessions);

router.get('/training-sessions/:id', controller.getTrainingSession);

router.post(
  '/performances',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(recordPerformanceSchema),
  controller.recordPerformance
);

router.post(
  '/training-sessions',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(createTrainingSessionSchema),
  controller.createTrainingSession
);

router.patch(
  '/training-sessions/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateTrainingSessionSchema),
  controller.updateTrainingSession
);

router.post(
  '/training-sessions/:id/attendance',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(recordAttendanceSchema),
  controller.recordAttendance
);

export { router as performanceRouter };
