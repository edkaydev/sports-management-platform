import bcrypt from 'bcrypt';
import prisma from '../../config/database';
import { signAccessToken, generateRefreshToken, sha256 } from '../../config/jwt';
import { AppError } from '../../middleware/error.middleware';
import { LoginInput, ChangePasswordInput, ForceChangePasswordInput } from './auth.schema';
import { UserRole } from '@prisma/client';

const BCRYPT_COST = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });

  if (!user || !user.isActive || user.deletedAt) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const retryAfterMs = user.lockedUntil.getTime() - Date.now();
    throw new AppError(423, 'ACCOUNT_LOCKED', 'Account is locked. Try again later.');
  }

  const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordValid) {
    await registerFailedAttempt(user.id);
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const now = new Date();
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: now, failedLoginAttempts: 0, lockedUntil: null },
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refresh = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refresh.tokenHash,
      expiresAt: refresh.expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: refresh.token,
    user: publicUser(user),
  };
}

async function registerFailedAttempt(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const attempts = user.failedLoginAttempts + 1;
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
      },
    });
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: attempts },
  });
}

export async function refresh(refreshToken: string) {
  const tokenHash = sha256(refreshToken);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!record || record.revoked || record.expiresAt <= new Date()) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user || !user.isActive || user.deletedAt) {
    throw new AppError(401, 'UNAUTHORIZED', 'User is not active');
  }

  await prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } });

  const nextRefresh = generateRefreshToken();
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: nextRefresh.tokenHash, expiresAt: nextRefresh.expiresAt },
  });

  return {
    accessToken: signAccessToken({ sub: user.id, role: user.role }),
    refreshToken: nextRefresh.token,
    user: publicUser(user),
  };
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;
  const tokenHash = sha256(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  const currentValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!currentValid) {
    throw new AppError(400, 'INVALID_PASSWORD', 'Current password is incorrect');
  }

  if (input.currentPassword === input.newPassword) {
    throw new AppError(422, 'VALIDATION_ERROR', 'New password must be different from current password');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(input.newPassword) },
    }),
    prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } }),
  ]);
}

export async function forceChangePassword(userId: string, input: ForceChangePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  if (!user.mustChangePassword) {
    throw new AppError(400, 'INVALID_REQUEST', 'Password change is not required for this account');
  }

  if (input.newPassword === input.currentPassword) {
    throw new AppError(422, 'VALIDATION_ERROR', 'New password must be different from current password');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(input.newPassword), mustChangePassword: false },
    }),
    prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } }),
  ]);
}

export function publicUser(user: {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
}): AuthUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
}
