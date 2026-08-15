import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import * as service from './documents.service';

export async function listDocuments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.listDocuments({
      athleteId: req.query.athleteId as string | undefined,
      category: req.query.category as never,
      status: req.query.status as never,
      ownerType: req.query.ownerType as never,
      teamId: req.query.teamId as string | undefined,
      search: req.query.search as string | undefined,
      page: parseInt((req.query.page as string) ?? '1', 10),
      pageSize: parseInt((req.query.pageSize as string) ?? '20', 10),
    });
    res.json({ success: true, data: result.documents, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

export async function getDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const document = await service.getDocument(req.params.id);
    res.json({ success: true, data: document });
  } catch (err) {
    next(err);
  }
}

export async function uploadDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res
        .status(400)
        .json({ success: false, error: 'VALIDATION_ERROR', message: 'File is required' });
      return;
    }
    const document = await service.uploadDocument(req.file, req.body, req.user!.id);
    res.status(201).json({ success: true, data: document, message: 'Document uploaded' });
  } catch (err) {
    next(err);
  }
}

export async function updateDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const document = await service.updateDocument(req.params.id, req.body);
    res.json({ success: true, data: document, message: 'Document updated' });
  } catch (err) {
    next(err);
  }
}

export async function verifyDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const document = await service.verifyDocument(
      req.params.id,
      req.body.isVerified,
      req.user!.id
    );
    res.json({ success: true, data: document, message: 'Document verification updated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteDocument(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.deleteDocument(req.params.id);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getChecklist(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.getAthleteDocumentChecklist(req.params.athleteId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
