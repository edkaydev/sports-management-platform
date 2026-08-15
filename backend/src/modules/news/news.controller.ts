import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './news.service';

export async function listNews(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const posts = await service.listNews();
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
}

export async function getNews(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const post = await service.getNews(req.params.id);
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function createNews(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const post = await service.createNews(req.body, req.user!.id);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function updateNews(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const post = await service.updateNews(req.params.id, req.body);
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function deleteNews(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.deleteNews(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
