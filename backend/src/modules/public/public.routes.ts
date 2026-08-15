import { Router } from 'express';
import * as controller from './public.controller';

const router = Router();

router.get('/fixtures', controller.fixtures);

router.get('/results', controller.results);

router.get('/sports', controller.sports);

router.get('/teams', controller.teams);

router.get('/events', controller.events);

router.get('/news/:slug', controller.newsBySlug);

router.get('/news', controller.news);

export { router as publicRouter };
