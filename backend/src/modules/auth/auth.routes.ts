import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { loginSchema, changePasswordSchema } from './auth.schema';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { verifyToken } from '../../middleware/auth.middleware';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many login attempts. Try again later.' },
});

authRouter.post('/login', loginLimiter, validate(loginSchema), authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', verifyToken, authController.logout);
authRouter.get('/me', verifyToken, authController.getMe);
authRouter.post('/change-password', verifyToken, validate(changePasswordSchema), authController.changePassword);
authRouter.post('/force-change-password', verifyToken, validate(changePasswordSchema), authController.forceChangePassword);
