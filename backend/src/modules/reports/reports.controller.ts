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
    format: (query.format as 'json' | 'csv' | 'pdf' | undefined) ?? 'json',
  };
}

function sendPdf(
  res: Response,
  title: string,
  columns: service.PdfColumn[],
  rows: Record<string, unknown>[],
  filename: string,
) {
  const subtitle = `UMU Sports Department · Generated ${new Date().toLocaleString()}`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  service.toPdfExport(title, subtitle, columns, rows).pipe(res);
}

export async function departmentOverview(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await service.departmentOverview();
    if (_req.query.format === 'pdf') {
      const rows = [
        { Metric: 'Season', Value: data.season ?? '—' },
        { Metric: 'Total athletes', Value: data.totalAthletes },
        { Metric: 'Active teams', Value: data.activeTeams },
        { Metric: 'Active scholarships', Value: data.activeScholarships },
        { Metric: 'Scholarships expiring in 30 days', Value: data.expiringScholarships },
        { Metric: 'Total documents', Value: data.totalDocuments },
        ...data.bySport.map((s) => ({ Metric: `Athletes — ${s.sport}`, Value: s.count })),
        ...data.byGender.map((g) => ({ Metric: `Gender — ${g.gender}`, Value: g.count })),
        ...data.byAthleteType.map((t) => ({ Metric: `Type — ${t.type}`, Value: t.count })),
        ...data.academicStanding.map((s) => ({ Metric: `Standing — ${s.standing}`, Value: s.count })),
      ];
      return sendPdf(res, 'Department Overview', [
        { label: 'Metric', key: 'Metric' },
        { label: 'Value', key: 'Value' },
      ], rows, 'department-overview.pdf');
    }
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
    if (req.query.format === 'pdf') {
      return sendPdf(res, 'Student-Athlete Report', [
        { label: 'Name', key: 'name' },
        { label: 'Reg No', key: 'registrationNumber' },
        { label: 'Programme', key: 'programme' },
        { label: 'Year', key: 'yearOfStudy' },
        { label: 'Gender', key: 'gender' },
        { label: 'Sports', key: 'sports' },
        { label: 'GPA', key: 'gpa' },
        { label: 'Standing', key: 'academicStanding' },
        { label: 'Teams', key: 'teams' },
      ], data.athletes as unknown as Record<string, unknown>[], 'athletes.pdf');
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
    if (req.query.format === 'pdf') {
      return sendPdf(res, 'Academic Standing Report', [
        { label: 'Name', key: 'name' },
        { label: 'Reg No', key: 'registrationNumber' },
        { label: 'Faculty', key: 'faculty' },
        { label: 'Year', key: 'year' },
        { label: 'Semester', key: 'semester' },
        { label: 'GPA', key: 'gpa' },
        { label: 'Failed', key: 'failedUnits' },
        { label: 'Standing', key: 'standing' },
      ], data.records as unknown as Record<string, unknown>[], 'academic-standing.pdf');
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
    if (_req.query.format === 'pdf') {
      return sendPdf(res, 'Scholarship Report', [
        { label: 'Athlete', key: 'athlete' },
        { label: 'Reg No', key: 'registrationNumber' },
        { label: 'Type', key: 'type' },
        { label: 'Sponsor', key: 'sponsor' },
        { label: 'Coverage %', key: 'coverage' },
        { label: 'Start', key: 'startDate' },
        { label: 'End', key: 'endDate' },
        { label: 'Status', key: 'status' },
      ], data.records as unknown as Record<string, unknown>[], 'scholarships.pdf');
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
    if (_req.query.format === 'pdf') {
      return sendPdf(res, 'Contract Report', [
        { label: 'Athlete', key: 'athlete' },
        { label: 'Reg No', key: 'registrationNumber' },
        { label: 'Type', key: 'type' },
        { label: 'Start', key: 'startDate' },
        { label: 'End', key: 'endDate' },
        { label: 'Status', key: 'status' },
        { label: 'Scholarship', key: 'withScholarship' },
      ], data.records as unknown as Record<string, unknown>[], 'contracts.pdf');
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
    if (req.query.format === 'pdf') {
      return sendPdf(res, 'Fixture Schedule Report', [
        { label: 'Event', key: 'name' },
        { label: 'Type', key: 'type' },
        { label: 'Sport', key: 'sport' },
        { label: 'Venue', key: 'venue' },
        { label: 'Start', key: 'startDate' },
        { label: 'End', key: 'endDate' },
        { label: 'Status', key: 'status' },
      ], data.events as unknown as Record<string, unknown>[], 'fixture-schedule.pdf');
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
