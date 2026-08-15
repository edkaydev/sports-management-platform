import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createContractSchema,
  updateContractSchema,
  terminateContractSchema,
} from './scholarships.schema';
import * as controller from './scholarships.controller';

const router = Router();

router.use(verifyToken);

router.get('/', requireRole('SPORTS_ADMIN', 'ATHLETE'), controller.listContracts);

router.get('/:id', requireRole('SPORTS_ADMIN', 'ATHLETE'), controller.getContract);

router.post(
  '/',
  requireRole('SPORTS_ADMIN'),
  validate(createContractSchema),
  controller.createContract
);

router.patch(
  '/:id',
  requireRole('SPORTS_ADMIN'),
  validate(updateContractSchema),
  controller.updateContract
);

router.post(
  '/:id/terminate',
  requireRole('SPORTS_ADMIN'),
  validate(terminateContractSchema),
  controller.terminateContract
);

export { router as contractsRouter };
