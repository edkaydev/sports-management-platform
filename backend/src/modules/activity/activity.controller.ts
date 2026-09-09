import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';
import * as service from './activity.service';

const UPLOAD_BASE = process.env.UPLOAD_DIR ?? path.join(__dirname, '../../../uploads');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const evidenceStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(UPLOAD_BASE, 'evidence');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, safe);
  },
});

export const evidenceUpload = multer({
  storage: evidenceStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

export async function createActivity(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    if (!user.id) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');

    const file = (req as Request).file as Express.Multer.File | undefined;
    const summary = String(req.body?.summary ?? '').trim();
    const note = String(req.body?.note ?? '').trim();
    const entityType = String(req.body?.entityType ?? '').trim() || 'general';

    if (!summary && !note && !file) {
      throw new AppError(400, 'BAD_REQUEST', 'Add a note, a summary or an evidence file');
    }

    const entry = await service.record({
      userId: user.id,
      userName: String(req.body?.userName ?? '') || (user as any).fullName || 'User',
      action: 'note',
      summary: summary || (file ? `Uploaded evidence: ${file.originalname}` : 'Daily note'),
      entityType,
      fileUrl: file ? `/uploads/evidence/${file.filename}` : undefined,
      fileName: file?.originalname,
      note: note || undefined,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
}

export async function listActivity(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = Number(req.query.limit ?? 50);
    const entityType = typeof req.query.entityType === 'string' ? req.query.entityType : undefined;
    const entries = await service.listRecent(limit, entityType);
    res.json({ success: true, data: entries });
  } catch (err) {
    next(err);
  }
}

export async function activityStats(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await service.getStats(120);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

export async function deleteActivity(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.remove(req.params.id);
    res.json({ success: true, message: 'Activity entry removed' });
  } catch (err) {
    next(err);
  }
}