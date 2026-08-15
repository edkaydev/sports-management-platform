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
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'COACH', 'OFFICIAL'),
  validate(recordPerformanceSchema),
  controller.recordPerformance
);

router.post(
  '/training-sessions',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'COACH'),
  validate(createTrainingSessionSchema),
  controller.createTrainingSession
);

router.patch(
  '/training-sessions/:id',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'COACH'),
  validate(updateTrainingSessionSchema),
  controller.updateTrainingSession
);

router.post(
  '/training-sessions/:id/attendance',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'COACH'),
  validate(recordAttendanceSchema),
  controller.recordAttendance
);

export { router as performanceRouter };
