import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { verifyAccessToken, AccessTokenPayload } from '../config/jwt';
import { AppError } from './error.middleware';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

const REFRESH_COOKIE_NAME = 'refreshToken';

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export function getRefreshCookie(req: Request): string | undefined {
  return (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE_NAME];
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifyToken(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing access token');
    }

    let payload: AccessTokenPayload;
    try {
      payload = verifyAccessToken(header.slice('Bearer '.length));
    } catch {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired access token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive || user.deletedAt) {
      throw new AppError(401, 'UNAUTHORIZED', 'User is not active');
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const { user } = req;
    if (!user) {
      next(new AppError(401, 'UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'SPORTS_ADMIN';
    if (isAdmin || allowedRoles.includes(user.role)) {
      next();
      return;
    }

    next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions for this action'));
  };
}
