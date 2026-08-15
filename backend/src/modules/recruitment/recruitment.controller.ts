import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './recruitment.service';

// ─── Prospects ─────────────────────────────────────────────────────────────────

export async function listProspects(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.listProspects({
      sport: req.query.sport as string | undefined,
      status: req.query.status as never,
      search: req.query.search as string | undefined,
      page: parseInt((req.query.page as string) ?? '1', 10),
      pageSize: parseInt((req.query.pageSize as string) ?? '20', 10),
    });
    res.json({ success: true, data: result.prospects, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getProspect(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const prospect = await service.getProspect(req.params.id);
    res.json({ success: true, data: prospect });
  } catch (err) {
    next(err);
  }
}

export async function createProspect(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const prospect = await service.createProspect(req.body, req.user!.id);
    res.status(201).json({ success: true, data: prospect, message: 'Prospect created' });
  } catch (err) {
    next(err);
  }
}

export async function updateProspect(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const prospect = await service.updateProspect(req.params.id, req.body);
    res.json({ success: true, data: prospect, message: 'Prospect updated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteProspect(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.deleteProspect(req.params.id);
    res.json({ success: true, message: 'Prospect deleted' });
  } catch (err) {
    next(err);
  }
}

// ─── Trials ────────────────────────────────────────────────────────────────────

export async function listTrials(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.listTrials({
      sport: req.query.sport as string | undefined,
      status: req.query.status as never,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      page: parseInt((req.query.page as string) ?? '1', 10),
      pageSize: parseInt((req.query.pageSize as string) ?? '20', 10),
    });
    res.json({ success: true, data: result.trials, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getTrial(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trial = await service.getTrial(req.params.id);
    res.json({ success: true, data: trial });
  } catch (err) {
    next(err);
  }
}

export async function createTrial(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trial = await service.createTrial(req.body, req.user!.id);
    res.status(201).json({ success: true, data: trial, message: 'Trial created' });
  } catch (err) {
    next(err);
  }
}

export async function updateTrial(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trial = await service.updateTrial(req.params.id, req.body);
    res.json({ success: true, data: trial, message: 'Trial updated' });
  } catch (err) {
    next(err);
  }
}

export async function addParticipants(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trial = await service.addTrialParticipants(req.params.id, req.body.prospectIds);
    res.json({ success: true, data: trial, message: 'Participants added' });
  } catch (err) {
    next(err);
  }
}

export async function recordAttendance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trial = await service.updateTrialAttendance(req.params.id, req.body.attendance);
    res.json({ success: true, data: trial, message: 'Attendance recorded' });
  } catch (err) {
    next(err);
  }
}

// ─── Assessments ───────────────────────────────────────────────────────────────

export async function submitAssessment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const assessment = await service.submitAssessment(
      req.params.id,
      req.body,
      req.user!.id
    );
    res.json({ success: true, data: assessment, message: 'Assessment submitted' });
  } catch (err) {
    next(err);
  }
}

// ─── Enrollment ────────────────────────────────────────────────────────────────

export async function enrollProspect(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.enrollProspect(
      req.params.id,
      req.body,
      req.user!.id
    );
    res.status(201).json({
      success: true,
      data: result,
      message: 'Prospect enrolled as student-athlete',
    });
  } catch (err) {
    next(err);
  }
}

export async function getReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const report = await service.getRecruitmentReport();
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}
