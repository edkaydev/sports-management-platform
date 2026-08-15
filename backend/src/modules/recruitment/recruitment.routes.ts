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
router.get('/report', requireRole('SPORTS_ADMIN', 'RECRUITER'), controller.getReport);

// ─── Prospects ─────────────────────────────────────────────────────────────────

router.get(
  '/prospects',
  requireRole('SPORTS_ADMIN', 'RECRUITER'),
  controller.listProspects
);

router.get(
  '/prospects/:id',
  requireRole('SPORTS_ADMIN', 'RECRUITER', 'COACH'),
  controller.getProspect
);

router.post(
  '/prospects',
  requireRole('SPORTS_ADMIN', 'RECRUITER'),
  validate(createProspectSchema),
  controller.createProspect
);

router.patch(
  '/prospects/:id',
  requireRole('SPORTS_ADMIN', 'RECRUITER'),
  validate(updateProspectSchema),
  controller.updateProspect
);

router.delete(
  '/prospects/:id',
  requireRole('SPORTS_ADMIN'),
  controller.deleteProspect
);

router.post(
  '/prospects/:id/enroll',
  requireRole('SPORTS_ADMIN'),
  validate(enrollProspectSchema),
  controller.enrollProspect
);

// ─── Trials ────────────────────────────────────────────────────────────────────

router.get(
  '/trials',
  requireRole('SPORTS_ADMIN', 'RECRUITER', 'COACH'),
  controller.listTrials
);

router.get(
  '/trials/:id',
  requireRole('SPORTS_ADMIN', 'RECRUITER', 'COACH'),
  controller.getTrial
);

router.post(
  '/trials',
  requireRole('SPORTS_ADMIN', 'RECRUITER'),
  validate(createTrialSchema),
  controller.createTrial
);

router.patch(
  '/trials/:id',
  requireRole('SPORTS_ADMIN', 'RECRUITER'),
  validate(updateTrialSchema),
  controller.updateTrial
);

router.post(
  '/trials/:id/participants',
  requireRole('SPORTS_ADMIN', 'RECRUITER', 'COACH'),
  validate(addTrialParticipantsSchema),
  controller.addParticipants
);

router.post(
  '/trials/:id/attendance',
  requireRole('SPORTS_ADMIN', 'RECRUITER', 'COACH'),
  validate(updateAttendanceSchema),
  controller.recordAttendance
);

router.post(
  '/trials/:id/assessments',
  requireRole('SPORTS_ADMIN', 'RECRUITER', 'COACH'),
  validate(submitAssessmentSchema),
  controller.submitAssessment
);

export { router as recruitmentRouter };
