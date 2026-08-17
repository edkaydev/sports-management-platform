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

router.get('/', requireRole('TUTOR', 'SPORTS_REP'), controller.listContracts);

router.get('/:id', requireRole('TUTOR', 'SPORTS_REP'), controller.getContract);

router.post(
  '/',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(createContractSchema),
  controller.createContract
);

router.patch(
  '/:id',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(updateContractSchema),
  controller.updateContract
);

router.post(
  '/:id/terminate',
  requireRole('TUTOR', 'SPORTS_REP'),
  validate(terminateContractSchema),
  controller.terminateContract
);

export { router as contractsRouter };
