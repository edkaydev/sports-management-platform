import { Router } from 'express';
import * as athletesController from './athletes.controller';
import { createAthleteSchema, updateAthleteSchema } from './athletes.schema';
import { validate } from '../../middleware/validate.middleware';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';

export const athletesRouter = Router();

athletesRouter.use(verifyToken);

athletesRouter.get('/', athletesController.listAthletes);
athletesRouter.get('/:id/profile', athletesController.getAthleteProfile);
athletesRouter.get('/:id', athletesController.getAthlete);

athletesRouter.post(
  '/',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(createAthleteSchema),
  athletesController.createAthlete
);
athletesRouter.patch(
  '/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateAthleteSchema),
  athletesController.updateAthlete
);
athletesRouter.delete('/:id', requireRole('TUTOR'), athletesController.deleteAthlete);
