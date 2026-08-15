import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './performance.service';

export async function recordPerformance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const performance = await service.recordPerformance(req.body, req.user!.id);
    res.status(201).json({ success: true, data: performance });
  } catch (err) {
    next(err);
  }
}

export async function listMatchPerformances(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const performances = await service.listMatchPerformances(req.params.matchId);
    res.json({ success: true, data: performances });
  } catch (err) {
    next(err);
  }
}

export async function listAthletePerformances(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.listAthletePerformances(req.params.athleteId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getPerformance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const performance = await service.getPerformance(req.params.id);
    res.json({ success: true, data: performance });
  } catch (err) {
    next(err);
  }
}

export async function createTrainingSession(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await service.createTrainingSession(req.body, req.user!.id);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function listTrainingSessions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sessions = await service.listTrainingSessions({
      teamId: req.query.teamId as string | undefined,
      sportId: req.query.sportId as string | undefined,
    });
    res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
}

export async function getTrainingSession(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await service.getTrainingSession(req.params.id);
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function updateTrainingSession(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await service.updateTrainingSession(req.params.id, req.body);
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function recordAttendance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const attendance = await service.recordAttendance(
      req.params.id,
      req.body.records,
      req.user!.id
    );
    res.status(201).json({ success: true, data: attendance });
  } catch (err) {
    next(err);
  }
}
