import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as academicService from './academic.service';

export async function listAcademicRecords(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { athleteId, academicYear, semester, standing, page, pageSize } = req.query as Record<
      string,
      string
    >;
    const result = await academicService.listAcademicRecords({
      athleteId,
      academicYear,
      semester: semester as 'SEM1' | 'SEM2' | 'RESIT' | undefined,
      standing,
      page: parseInt(page ?? '1', 10),
      pageSize: parseInt(pageSize ?? '20', 10),
    });
    res.json({ success: true, data: result.records, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getAcademicRecord(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const record = await academicService.getAcademicRecord(req.params.id);
    if (!record) {
      res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Record not found' });
      return;
    }
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}

export async function createAcademicRecord(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const record = await academicService.createAcademicRecord(req.body, req.user!.id);
    res.status(201).json({ success: true, data: record, message: 'Academic record created' });
  } catch (err) {
    next(err);
  }
}

export async function updateAcademicRecord(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const record = await academicService.updateAcademicRecord(req.params.id, req.body);
    res.json({ success: true, data: record, message: 'Academic record updated' });
  } catch (err) {
    next(err);
  }
}

export async function importAcademicRecords(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'VALIDATION_ERROR', message: 'CSV file required' });
      return;
    }
    const result = await academicService.importAcademicRecordsFromCsv(
      req.file.buffer,
      req.user!.id
    );
    res.json({ success: true, data: result, message: `Imported ${result.imported} records` });
  } catch (err) {
    next(err);
  }
}
