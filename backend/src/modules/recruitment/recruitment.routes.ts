import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createProspectSchema,
  updateProspectSchema,
  createTrialSchema,
  updateTrialSchema,
  addTrialParticipantsSchema,
  updateAttendanceSchema,
  submitAssessmentSchema,
  enrollProspectSchema,
} from './recruitment.schema';
import * as controller from './recruitment.controller';

const router = Router();

router.use(verifyToken);

// Report must be registered before /:id to avoid conflicts
router.get('/report', requireRole('TUTOR', 'SPORTS_REP'), controller.getReport);

// ─── Prospects ─────────────────────────────────────────────────────────────────

router.get(
  '/prospects',
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.listProspects
);

router.get(
  '/prospects/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.getProspect
);

router.post(
  '/prospects',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(createProspectSchema),
  controller.createProspect
);

router.patch(
  '/prospects/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateProspectSchema),
  controller.updateProspect
);

router.delete(
  '/prospects/:id',
  requireRole('TUTOR'),
  controller.deleteProspect
);

router.post(
  '/prospects/:id/enroll',
  requireRole('TUTOR'),
  validate(enrollProspectSchema),
  controller.enrollProspect
);

// ─── Trials ────────────────────────────────────────────────────────────────────

router.get(
  '/trials',
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.listTrials
);

router.get(
  '/trials/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.getTrial
);

router.post(
  '/trials',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(createTrialSchema),
  controller.createTrial
);

router.patch(
  '/trials/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateTrialSchema),
  controller.updateTrial
);

router.post(
  '/trials/:id/participants',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(addTrialParticipantsSchema),
  controller.addParticipants
);

router.post(
  '/trials/:id/attendance',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateAttendanceSchema),
  controller.recordAttendance
);

router.post(
  '/trials/:id/assessments',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(submitAssessmentSchema),
  controller.submitAssessment
);

export { router as recruitmentRouter };
