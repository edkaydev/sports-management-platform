import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import {
  createActivity,
  listActivity,
  activityStats,
  deleteActivity,
  evidenceUpload,
} from './activity.controller';

const router = Router();

router.use(verifyToken);

router.get('/', listActivity);
router.get('/stats', activityStats);
router.post('/', evidenceUpload.single('file'), createActivity);
router.delete('/:id', deleteActivity);

export { router as activityRouter };