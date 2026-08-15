import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './events.service';

export async function listEvents(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const events = await service.listEvents();
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
}

export async function getEvent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const event = await service.getEvent(req.params.id);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const event = await service.createEvent(req.body, req.user!.id);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const event = await service.updateEvent(req.params.id, req.body);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.deleteEvent(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function registerParticipant(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const participant = await service.registerParticipant(
      req.params.id,
      req.body,
      req.user!.id
    );
    res.status(201).json({ success: true, data: participant });
  } catch (err) {
    next(err);
  }
}

export async function listParticipants(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const participants = await service.listParticipants(req.params.id);
    res.json({ success: true, data: participants });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const event = await service.updateEventStatus(req.params.id, req.body.status);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}
