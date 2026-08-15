import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './scholarships.service';

// ─── Scholarships ──────────────────────────────────────────────────────────────

export async function listScholarships(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.listScholarships({
      athleteId: req.query.athleteId as string | undefined,
      status: req.query.status as never,
      type: req.query.type as string | undefined,
      expiringWithin: req.query.expiringWithin
        ? parseInt(req.query.expiringWithin as string, 10)
        : undefined,
      page: parseInt((req.query.page as string) ?? '1', 10),
      pageSize: parseInt((req.query.pageSize as string) ?? '20', 10),
    });
    res.json({ success: true, data: result.scholarships, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getScholarship(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const scholarship = await service.getScholarship(req.params.id);
    res.json({ success: true, data: scholarship });
  } catch (err) {
    next(err);
  }
}

export async function createScholarship(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const scholarship = await service.createScholarship(req.body, req.user!.id);
    res.status(201).json({ success: true, data: scholarship, message: 'Scholarship created' });
  } catch (err) {
    next(err);
  }
}

export async function updateScholarship(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const scholarship = await service.updateScholarship(req.params.id, req.body);
    res.json({ success: true, data: scholarship, message: 'Scholarship updated' });
  } catch (err) {
    next(err);
  }
}

export async function renewScholarship(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const scholarship = await service.renewScholarship(req.params.id, req.body, req.user!.id);
    res.json({ success: true, data: scholarship, message: 'Scholarship renewed' });
  } catch (err) {
    next(err);
  }
}

export async function revokeScholarship(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const scholarship = await service.revokeScholarship(
      req.params.id,
      req.body.reason,
      req.user!.id
    );
    res.json({ success: true, data: scholarship, message: 'Scholarship revoked' });
  } catch (err) {
    next(err);
  }
}

export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await service.getScholarshipDashboard();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ─── Contracts ─────────────────────────────────────────────────────────────────

export async function listContracts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.listContracts({
      athleteId: req.query.athleteId as string | undefined,
      status: req.query.status as never,
      expiringWithin: req.query.expiringWithin
        ? parseInt(req.query.expiringWithin as string, 10)
        : undefined,
      page: parseInt((req.query.page as string) ?? '1', 10),
      pageSize: parseInt((req.query.pageSize as string) ?? '20', 10),
    });
    res.json({ success: true, data: result.contracts, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getContract(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const contract = await service.getContract(req.params.id);
    res.json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
}

export async function createContract(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const contract = await service.createContract(req.body, req.user!.id);
    res.status(201).json({ success: true, data: contract, message: 'Contract created' });
  } catch (err) {
    next(err);
  }
}

export async function updateContract(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const contract = await service.updateContract(req.params.id, req.body);
    res.json({ success: true, data: contract, message: 'Contract updated' });
  } catch (err) {
    next(err);
  }
}

export async function terminateContract(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const contract = await service.terminateContract(req.params.id, req.body, req.user!.id);
    res.json({ success: true, data: contract, message: 'Contract terminated' });
  } catch (err) {
    next(err);
  }
}
