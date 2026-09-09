import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { hashPassword } from '../auth/auth.service';
import { AppError } from '../../middleware/error.middleware';
import { CreateUserInput, UpdateUserInput, ResetPasswordInput } from './users.schema';

const publicSelect = {
  id: true,
  fullName: true,
  username: true,
  email: true,
  role: true,
  isActive: true,
  mustChangePassword: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export async function listUsers() {
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: publicSelect,
    orderBy: { createdAt: 'asc' },
  });
}

export async function getUser(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: publicSelect,
  });
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }
  return user;
}

export async function createUser(input: CreateUserInput) {
  const username = input.username.trim().toLowerCase();

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email: input.email ?? undefined }] },
    select: { username: true, email: true },
  });
  if (existing) {
    if (existing.username === username) {
      throw new AppError(409, 'CONFLICT', 'Username is already taken');
    }
    throw new AppError(409, 'CONFLICT', 'Email is already in use');
  }

  return prisma.user.create({
    data: {
      username,
      fullName: input.fullName.trim(),
      email: input.email ?? null,
      passwordHash: await hashPassword(input.password),
      role: input.role ?? 'SPORTS_REP',
      mustChangePassword: true,
    },
    select: publicSelect,
  });
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const user = await getUser(userId);
  if (!input.role && input.isActive === undefined && input.fullName === undefined) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Nothing to update');
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      ...(input.fullName !== undefined && { fullName: input.fullName.trim() }),
      ...(input.role !== undefined && { role: input.role }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
    select: publicSelect,
  });
}

export async function resetPassword(userId: string, input: ResetPasswordInput) {
  const user = await getUser(userId);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(input.newPassword), mustChangePassword: true },
    }),
    prisma.refreshToken.updateMany({ where: { userId: user.id }, data: { revoked: true } }),
  ]);
}

export async function deleteUser(userId: string) {
  const user = await getUser(userId);

  return prisma.user.update({
    where: { id: user.id },
    data: { deletedAt: new Date(), isActive: false },
    select: publicSelect,
  });
}