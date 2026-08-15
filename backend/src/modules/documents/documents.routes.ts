import { Router } from 'express';
import multer from 'multer';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { verifyDocumentSchema, updateDocumentSchema } from './documents.schema';
import * as controller from './documents.controller';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(verifyToken);

router.get(
  '/',
  requireRole('SPORTS_ADMIN', 'COACH', 'ATHLETE'),
  controller.listDocuments
);

router.get(
  '/athletes/:athleteId/checklist',
  requireRole('SPORTS_ADMIN', 'COACH'),
  controller.getChecklist
);

router.get('/:id', requireRole('SPORTS_ADMIN', 'COACH', 'ATHLETE'), controller.getDocument);

router.post(
  '/',
  requireRole('SPORTS_ADMIN', 'COACH', 'ATHLETE'),
  upload.single('file'),
  controller.uploadDocument
);

router.patch(
  '/:id',
  requireRole('SPORTS_ADMIN', 'COACH'),
  validate(updateDocumentSchema),
  controller.updateDocument
);

router.patch(
  '/:id/verify',
  requireRole('SPORTS_ADMIN'),
  validate(verifyDocumentSchema),
  controller.verifyDocument
);

router.delete('/:id', requireRole('SPORTS_ADMIN'), controller.deleteDocument);

export { router as documentsRouter };
