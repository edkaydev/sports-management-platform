import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';

const ENTITY_LABELS: Record<string, string> = {
  athletes: 'Athlete',
  sports: 'Sport',
  teams: 'Team',
  seasons: 'Season',
  'academic-records': 'Academic record',
  scholarships: 'Scholarship',
  contracts: 'Contract',
  recruitment: 'Recruitment',
  documents: 'Document',
  events: 'Event',
  matches: 'Match',
  performances: 'Performance',
  'training-sessions': 'Training session',
  reports: 'Report',
  equipment: 'Equipment',
  news: 'News',
  slides: 'Slider',
  users: 'User',
  prospects: 'Prospect',
  trials: 'Trial',
  activity: 'Activity',
};

const PATH_SUMMARIES: { predicate: (p: string) => boolean; summary: string }[] = [
  { predicate: (p) => p.includes('/matches/') && p.endsWith('/result'), summary: 'Recorded match result' },
  { predicate: (p) => p.includes('/matches/') && p.endsWith('/events'), summary: 'Recorded match events' },
  { predicate: (p) => p.includes('/equipment/') && p.endsWith('/return'), summary: 'Returned borrowed equipment' },
  { predicate: (p) => p.includes('/equipment/') && p.includes('/assign'), summary: 'Assigned equipment' },
  { predicate: (p) => p.includes('/recruitment/trials/') && p.endsWith('/assessments'), summary: 'Submitted trial assessment' },
  { predicate: (p) => p.includes('/recruitment/prospects/') && p.endsWith('/status'), summary: 'Updated prospect status' },
  { predicate: (p) => p.includes('/documents') && p.includes('/upload'), summary: 'Uploaded document' },
  { predicate: (p) => p.includes('/scholarships/') && p.includes('/award'), summary: 'Awarded scholarship' },
];

export function isMutating(method: string): boolean {
  return ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method.toUpperCase());
}

export function actionFor(method: string): 'create' | 'update' | 'delete' {
  switch (method.toUpperCase()) {
    case 'POST':
    case 'PUT':
      return 'create';
    case 'DELETE':
      return 'delete';
    default:
      return 'update';
  }
}

export function summarize(method: string, path: string): { summary: string; entityType?: string } {
  const [prefix] = path.split('/').filter(Boolean); // e.g. "api", "athletes"
  const entitySegment = path.split('/')[2]; // "athletes" from /api/athletes/...

  for (const rule of PATH_SUMMARIES) {
    if (rule.predicate(path)) {
      return { summary: rule.summary, entityType: entitySegment };
    }
  }

  const verb = (() => {
    switch (actionFor(method)) {
      case 'create':
        return entitySegment === 'recruitment' ? 'Added' : 'Created';
      case 'delete':
        return 'Deleted';
      default:
        return 'Updated';
    }
  })();

  const label = ENTITY_LABELS[entitySegment ?? ''] ?? (entitySegment ?? 'Record');
  return { summary: `${verb} ${label}`, entityType: entitySegment };
}

export function isSkipped(path: string, method: string): boolean {
  if (!isMutating(method)) return true;
  if (path === '/uploads' || path.startsWith('/uploads/')) return true;
  const segments = path.split('/').filter(Boolean);
  const area = segments[1]; // e.g. auth, activity
  if (area === 'auth' || area === 'activity' || area === 'health' || area === 'uploads') return true;
  // Reading a notification is not meaningful activity
  if (area === 'notifications' && method === 'PATCH' && path.endsWith('/read')) return true;
  return false;
}

export function getEntityId(req: Request): string | undefined {
  const match = req.url.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i);
  return match ? match[0] : undefined;
}

export function fileUrlFromRequest(req: Request): { fileUrl?: string; fileName?: string } {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file || !file.filename) return {};
  const subdir = (req as any).uploadSubdir ?? 'files';
  return { fileUrl: `/uploads/${subdir}/${file.filename}`, fileName: file.originalname };
}