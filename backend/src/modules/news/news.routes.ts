import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createNewsSchema, updateNewsSchema } from './news.schema';
import * as controller from './news.controller';

const router = Router();

router.use(verifyToken);

router.get('/', requireRole('TUTOR', 'SPORTS_REP'), controller.listNews);

router.get('/:id', controller.getNews);

router.post(
  '/',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(createNewsSchema),
  controller.createNews
);

router.patch(
  '/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateNewsSchema),
  controller.updateNews
);

router.delete(
  '/:id',
  requireRole('TUTOR'),
  controller.deleteNews
);

export { router as newsRouter };
