import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';

import { healthRouter } from './modules/health/health.routes';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { logger } from './config/logger';

const app = express();
const PORT = process.env.PORT ?? 3000;

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

// Routes
app.use('/api/health', healthRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

export default app;
