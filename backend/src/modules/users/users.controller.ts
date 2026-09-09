import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './users.service';

export async function listUsers(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = await service.listUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await service.getUser(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await service.createUser(req.body);
    res.status(201).json({ success: true, data: user, message: 'User created. They must set a password on first login.' });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await service.updateUser(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.resetPassword(req.params.id, req.body);
    res.json({ success: true, message: 'Password reset. The user must set a new password on next login.' });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await service.deleteUser(req.params.id);
    res.json({ success: true, data: user, message: 'User deactivated and removed.' });
  } catch (err) {
    next(err);
  }
}