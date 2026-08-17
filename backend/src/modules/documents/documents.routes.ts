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
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.listDocuments
);

router.get(
  '/athletes/:athleteId/checklist',
  requireRole('TUTOR', 'SPORTS_REP'),
  controller.getChecklist
);

router.get('/:id', requireRole('TUTOR', 'SPORTS_REP'), controller.getDocument);

router.post(
  '/',
  requireRole('TUTOR', 'SPORTS_REP'),
  upload.single('file'),
  controller.uploadDocument
);

router.patch(
  '/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateDocumentSchema),
  controller.updateDocument
);

router.patch(
  '/:id/verify',
  requireRole('TUTOR'),
  validate(verifyDocumentSchema),
  controller.verifyDocument
);

router.delete('/:id', requireRole('TUTOR'), controller.deleteDocument);

export { router as documentsRouter };
