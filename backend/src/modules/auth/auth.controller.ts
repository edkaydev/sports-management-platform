import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { LoginInput, ChangePasswordInput, ForceChangePasswordInput } from './auth.schema';
import {
  AuthRequest,
  getRefreshCookie,
  setRefreshCookie,
  clearRefreshCookie,
} from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';

async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as LoginInput;
    const { accessToken, refreshToken, user } = await authService.login(input);

    setRefreshCookie(res, refreshToken);
    res.status(200).json({ success: true, data: { accessToken, user }, message: 'Login successful' });
  } catch (err) {
    next(err);
  }
}

async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = getRefreshCookie(req);
    if (!refreshToken) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing refresh token');
    }

    const result = await authService.refresh(refreshToken);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ success: true, data: { accessToken: result.accessToken }, message: 'Token refreshed' });
  } catch (err) {
    next(err);
  }
}

async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = getRefreshCookie(req);
    await authService.logout(refreshToken);
    clearRefreshCookie(res);

    res.status(200).json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as ChangePasswordInput;
    await authService.changePassword(req.user!.id, input);

    res.status(200).json({ success: true, message: 'Password changed' });
  } catch (err) {
    next(err);
  }
}

async function forceChangePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as ForceChangePasswordInput;
    await authService.forceChangePassword(req.user!.id, input);

    res.status(200).json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    next(err);
  }
}

export { login, refresh, logout, changePassword, forceChangePassword };
