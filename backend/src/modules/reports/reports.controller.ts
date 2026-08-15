import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './reports.service';
import type { ReportsQuery } from './reports.schema';

function parseQuery(query: AuthRequest['query']): ReportsQuery {
  return {
    sport: query.sport as string | undefined,
    team: query.team as string | undefined,
    event: query.event as string | undefined,
    season: query.season as string | undefined,
    semester: query.semester as never,
    from: query.from as string | undefined,
    to: query.to as string | undefined,
    format: (query.format as 'json' | 'csv' | undefined) ?? 'json',
  };
}

export async function departmentOverview(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await service.departmentOverview();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function athleteReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await service.athleteReport(parseQuery(req.query));
    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="athletes.csv"');
      return res.send(service.toCsvExport(data.athletes as unknown as Record<string, unknown>[]));
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function academicStandingReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await service.academicStandingReport(parseQuery(req.query));
    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="academic-standing.csv"');
      return res.send(service.toCsvExport(data.records as unknown as Record<string, unknown>[]));
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function scholarshipReport(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await service.scholarshipReport();
    if (_req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="scholarships.csv"');
      return res.send(service.toCsvExport(data.records as unknown as Record<string, unknown>[]));
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function contractReport(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await service.contractReport();
    if (_req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="contracts.csv"');
      return res.send(service.toCsvExport(data.records as unknown as Record<string, unknown>[]));
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function fixtureScheduleReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await service.fixtureScheduleReport(parseQuery(req.query));
    if (req.query.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="fixture-schedule.csv"');
      return res.send(service.toCsvExport(data.events as unknown as Record<string, unknown>[]));
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
