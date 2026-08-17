import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import * as controller from './reports.controller';

const router = Router();

router.use(verifyToken, requireRole('TUTOR', 'SPORTS_REP'));

router.get('/overview', controller.departmentOverview);

router.get('/athletes', controller.athleteReport);

router.get('/academic-standing', controller.academicStandingReport);

router.get('/scholarships', controller.scholarshipReport);

router.get('/contracts', controller.contractReport);

router.get('/fixtures', controller.fixtureScheduleReport);

export { router as reportsRouter };
