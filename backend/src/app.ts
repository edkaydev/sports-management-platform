import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';

import { healthRouter } from './modules/health/health.routes';
import { authRouter } from './modules/auth/auth.routes';
import { athletesRouter } from './modules/athletes/athletes.routes';
import { seasonsRouter } from './modules/seasons/seasons.routes';
import { sportsRouter } from './modules/sports/sports.routes';
import { teamsRouter } from './modules/teams/teams.routes';
import { academicRouter } from './modules/academic/academic.routes';
import { scholarshipsRouter } from './modules/scholarships/scholarships.routes';
import { contractsRouter } from './modules/scholarships/contracts.routes';
import { recruitmentRouter } from './modules/recruitment/recruitment.routes';
import { documentsRouter } from './modules/documents/documents.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';
import { eventsRouter } from './modules/events/events.routes';
import { matchesRouter } from './modules/matches/matches.routes';
import { performanceRouter } from './modules/performance/performance.routes';
import { reportsRouter } from './modules/reports/reports.routes';
import { newsRouter } from './modules/news/news.routes';
import { publicRouter } from './modules/public/public.routes';
import { equipmentRouter } from './modules/equipment/equipment.routes';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting on all routes
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Serve uploaded documents
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'))
);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter);
app.use('/api/athletes', athletesRouter);
app.use('/api/seasons', seasonsRouter);
app.use('/api/sports', sportsRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/academic-records', academicRouter);
app.use('/api/scholarships', scholarshipsRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/recruitment', recruitmentRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api', performanceRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/news', newsRouter);
app.use('/api/equipment', equipmentRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
