import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createScholarshipSchema,
  updateScholarshipSchema,
  renewScholarshipSchema,
  revokeScholarshipSchema,
} from './scholarships.schema';
import * as controller from './scholarships.controller';

const router = Router();

router.use(verifyToken);

router.get(
  '/',
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.listScholarships
);

router.get('/dashboard', requireRole('TUTOR', 'SPORTS_REP'), controller.getDashboard);

router.get('/:id', requireRole('TUTOR', 'SPORTS_REP'), controller.getScholarship);

router.post(
  '/',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(createScholarshipSchema),
  controller.createScholarship
);

router.patch(
  '/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateScholarshipSchema),
  controller.updateScholarship
);

router.post(
  '/:id/renew',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(renewScholarshipSchema),
  controller.renewScholarship
);

router.post(
  '/:id/revoke',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(revokeScholarshipSchema),
  controller.revokeScholarship
);

export { router as scholarshipsRouter };
