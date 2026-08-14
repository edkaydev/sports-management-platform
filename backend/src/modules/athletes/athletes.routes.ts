import { Router } from 'express';
import * as athletesController from './athletes.controller';
import { createAthleteSchema, updateAthleteSchema } from './athletes.schema';
import { validate } from '../../middleware/validate.middleware';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

export const athletesRouter = Router();

athletesRouter.use(verifyToken);

athletesRouter.get('/', athletesController.listAthletes);
athletesRouter.get('/:id/profile', athletesController.getAthleteProfile);
athletesRouter.get('/:id', athletesController.getAthlete);

athletesRouter.post(
  '/',
  requireRole(UserRole.SPORTS_ADMIN),
  validate(createAthleteSchema),
  athletesController.createAthlete
);
athletesRouter.patch(
  '/:id',
  requireRole(UserRole.SPORTS_ADMIN),
  validate(updateAthleteSchema),
  athletesController.updateAthlete
);
athletesRouter.delete('/:id', requireRole(UserRole.SPORTS_ADMIN), athletesController.deleteAthlete);
