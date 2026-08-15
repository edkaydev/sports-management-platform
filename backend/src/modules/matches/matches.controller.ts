import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './matches.service';

export async function listMatches(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const matches = await service.listMatches({
      eventId: req.query.eventId as string | undefined,
      status: req.query.status as string | undefined,
      teamId: req.query.teamId as string | undefined,
    });
    res.json({ success: true, data: matches });
  } catch (err) {
    next(err);
  }
}

export async function getMatch(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const match = await service.getMatch(req.params.id);
    res.json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
}

export async function createMatch(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const match = await service.createMatch(req.body, req.user!.id);
    res.status(201).json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
}

export async function updateMatch(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const match = await service.updateMatch(req.params.id, req.body);
    res.json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const match = await service.updateMatchStatus(req.params.id, req.body.status);
    res.json({ success: true, data: match });
  } catch (err) {
    next(err);
  }
}

export async function submitLineup(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const lineup = await service.submitLineup(
      req.params.id,
      req.body.teamId,
      req.body.entries,
      req.user!.id
    );
    res.status(201).json({ success: true, data: lineup });
  } catch (err) {
    next(err);
  }
}

export async function getLineups(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const lineups = await service.getLineups(req.params.id);
    res.json({ success: true, data: lineups });
  } catch (err) {
    next(err);
  }
}

export async function recordMatchEvent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const matchEvent = await service.recordMatchEvent(req.params.id, req.body, req.user!.id);
    res.status(201).json({ success: true, data: matchEvent });
  } catch (err) {
    next(err);
  }
}

export async function recordResult(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.recordResult(req.params.id, req.body, req.user!.id);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function submitMatchReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const report = await service.submitMatchReport(req.params.id, req.body, req.user!.id);
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

export async function deleteMatch(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.deleteMatch(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
