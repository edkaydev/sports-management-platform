import { Router } from 'express';
import multer from 'multer';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createAcademicRecordSchema, updateAcademicRecordSchema } from './academic.schema';
import * as controller from './academic.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(verifyToken);

// CSV Import — must be before /:id to avoid route conflict
router.post(
  '/import',
  requireRole('TUTOR', 'SPORTS_REP'),
  upload.single('file'),
  controller.importAcademicRecords
);

// List
router.get(
  '/',
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.listAcademicRecords
);

// Get single
router.get(
  '/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.getAcademicRecord
);

// Create
router.post(
  '/',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(createAcademicRecordSchema),
  controller.createAcademicRecord
);

// Update
router.patch(
  '/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateAcademicRecordSchema),
  controller.updateAcademicRecord
);

export { router as academicRouter };
