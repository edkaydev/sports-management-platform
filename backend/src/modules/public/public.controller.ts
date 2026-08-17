import { Request, Response, NextFunction } from 'express';
import * as service from './public.service';

export async function fixtures(req: Request, res: Response, next: NextFunction) {
  try {
    const matches = await service.listFixtures(req.query);
    res.json({ success: true, data: matches });
  } catch (err) {
    next(err);
  }
}

export async function results(req: Request, res: Response, next: NextFunction) {
  try {
    const matches = await service.listResults(req.query);
    res.json({ success: true, data: matches });
  } catch (err) {
    next(err);
  }
}

export async function sports(_req: Request, res: Response, next: NextFunction) {
  try {
    const sports = await service.listSports();
    res.json({ success: true, data: sports });
  } catch (err) {
    next(err);
  }
}

export async function sportDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const detail = await service.getPublicSport(req.params.id);
    res.json({ success: true, data: detail });
  } catch (err) {
    next(err);
  }
}

export async function teams(_req: Request, res: Response, next: NextFunction) {
  try {
    const teams = await service.listTeams();
    res.json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
}

export async function teamDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const detail = await service.getPublicTeam(req.params.id);
    res.json({ success: true, data: detail });
  } catch (err) {
    next(err);
  }
}

export async function eventDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const detail = await service.getPublicEvent(req.params.id);
    res.json({ success: true, data: detail });
  } catch (err) {
    next(err);
  }
}

export async function events(req: Request, res: Response, next: NextFunction) {
  try {
    const events = await service.listEvents(req.query);
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
}

export async function news(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listPublishedNews(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function newsBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await service.getPublishedNewsBySlug(req.params.slug);
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}
