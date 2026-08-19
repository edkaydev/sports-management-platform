import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createSlideSchema, updateSlideSchema } from './slides.schema';
import * as controller from './slides.controller';

const router = Router();

router.use(verifyToken);

router.get('/', requireRole('TUTOR', 'SPORTS_REP'), controller.listSlides);

router.get('/active', controller.activeSlides);

router.get('/:id', controller.getSlide);

router.post(
  '/',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(createSlideSchema),
  controller.createSlide
);

router.patch(
  '/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateSlideSchema),
  controller.updateSlide
);

router.delete(
  '/:id',
  requireRole('TUTOR'),
  controller.deleteSlide
);

export { router as slidesRouter };
