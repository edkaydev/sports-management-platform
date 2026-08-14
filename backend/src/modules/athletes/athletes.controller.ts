import { Request, Response, NextFunction } from 'express';
import * as athletesService from './athletes.service';
import {
  CreateAthleteInput,
  UpdateAthleteInput,
  listAthletesQuerySchema,
} from './athletes.schema';
import { AuthRequest } from '../../middleware/auth.middleware';

async function listAthletes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listAthletesQuerySchema.parse(req.query);
    const result = await athletesService.listAthletes(query);
    res.status(200).json({
      success: true,
      data: result.athletes,
      pagination: result.pagination,
      message: 'Athletes fetched',
    });
  } catch (err) {
    next(err);
  }
}

async function getAthlete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const athlete = await athletesService.getAthleteById(req.params.id);
    res.status(200).json({ success: true, data: athlete, message: 'Athlete fetched' });
  } catch (err) {
    next(err);
  }
}

async function getAthleteProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await athletesService.getAthleteProfile(req.params.id);
    res.status(200).json({ success: true, data: profile, message: 'Athlete profile fetched' });
  } catch (err) {
    next(err);
  }
}

async function createAthlete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as CreateAthleteInput;
    const athlete = await athletesService.createAthlete(input);
    res.status(201).json({ success: true, data: athlete, message: 'Athlete created' });
  } catch (err) {
    next(err);
  }
}

async function updateAthlete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as UpdateAthleteInput;
    const athlete = await athletesService.updateAthlete(req.params.id, input);
    res.status(200).json({ success: true, data: athlete, message: 'Athlete updated' });
  } catch (err) {
    next(err);
  }
}

async function deleteAthlete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await athletesService.deleteAthlete(req.params.id);
    res.status(200).json({ success: true, message: 'Athlete deleted' });
  } catch (err) {
    next(err);
  }
}

export { listAthletes, getAthlete, getAthleteProfile, createAthlete, updateAthlete, deleteAthlete };
