import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createNewsSchema, updateNewsSchema } from './news.schema';
import * as controller from './news.controller';

const router = Router();

router.use(verifyToken);

router.get('/', requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'UNI_ADMIN', 'ACADEMIC'), controller.listNews);

router.get('/:id', controller.getNews);

router.post(
  '/',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'UNI_ADMIN'),
  validate(createNewsSchema),
  controller.createNews
);

router.patch(
  '/:id',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'UNI_ADMIN'),
  validate(updateNewsSchema),
  controller.updateNews
);

router.delete(
  '/:id',
  requireRole('SPORTS_ADMIN', 'SUPER_ADMIN'),
  controller.deleteNews
);

export { router as newsRouter };
