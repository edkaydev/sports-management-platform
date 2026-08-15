import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';
import * as controller from './reports.controller';

const router = Router();

router.use(verifyToken, requireRole('SPORTS_ADMIN', 'SUPER_ADMIN', 'ACADEMIC', 'UNI_ADMIN'));

router.get('/overview', controller.departmentOverview);

router.get('/athletes', controller.athleteReport);

router.get('/academic-standing', controller.academicStandingReport);

router.get('/scholarships', controller.scholarshipReport);

router.get('/contracts', controller.contractReport);

router.get('/fixtures', controller.fixtureScheduleReport);

export { router as reportsRouter };
