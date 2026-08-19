import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './slides.service';

export async function listSlides(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const slides = await service.listSlides();
    res.json({ success: true, data: slides });
  } catch (err) {
    next(err);
  }
}

export async function getSlide(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const slide = await service.getSlide(req.params.id);
    res.json({ success: true, data: slide });
  } catch (err) {
    next(err);
  }
}

export async function createSlide(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const slide = await service.createSlide(req.body);
    res.status(201).json({ success: true, data: slide });
  } catch (err) {
    next(err);
  }
}

export async function updateSlide(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const slide = await service.updateSlide(req.params.id, req.body);
    res.json({ success: true, data: slide });
  } catch (err) {
    next(err);
  }
}

export async function deleteSlide(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.deleteSlide(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function activeSlides(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const slides = await service.listActiveSlides();
    res.json({ success: true, data: slides });
  } catch (err) {
    next(err);
  }
}
