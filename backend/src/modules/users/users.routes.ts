import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createUserSchema, updateUserSchema, resetPasswordSchema } from './users.schema';
import * as controller from './users.controller';

const router = Router();

router.use(verifyToken, requireRole('TUTOR'));

router.get('/', controller.listUsers);

router.get('/:id', controller.getUser);

router.post('/', validate(createUserSchema), controller.createUser);

router.patch('/:id', validate(updateUserSchema), controller.updateUser);

router.post('/:id/reset-password', validate(resetPasswordSchema), controller.resetPassword);

router.delete('/:id', controller.deleteUser);

export { router as usersRouter };