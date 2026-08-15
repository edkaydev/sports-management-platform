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
  requireRole('SPORTS_ADMIN', 'UNI_ADMIN', 'ATHLETE'),
  controller.listScholarships
);

router.get('/dashboard', requireRole('SPORTS_ADMIN', 'UNI_ADMIN'), controller.getDashboard);

router.get('/:id', requireRole('SPORTS_ADMIN', 'UNI_ADMIN', 'ATHLETE'), controller.getScholarship);

router.post(
  '/',
  requireRole('SPORTS_ADMIN'),
  validate(createScholarshipSchema),
  controller.createScholarship
);

router.patch(
  '/:id',
  requireRole('SPORTS_ADMIN'),
  validate(updateScholarshipSchema),
  controller.updateScholarship
);

router.post(
  '/:id/renew',
  requireRole('SPORTS_ADMIN'),
  validate(renewScholarshipSchema),
  controller.renewScholarship
);

router.post(
  '/:id/revoke',
  requireRole('SPORTS_ADMIN'),
  validate(revokeScholarshipSchema),
  controller.revokeScholarship
);

export { router as scholarshipsRouter };
