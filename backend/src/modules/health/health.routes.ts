import { Router, Request, Response } from 'express';
import prisma from '../../config/database';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  try {
    // Ping the database
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        service: 'UMU Sports API',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    res.status(503).json({
      success: false,
      error: 'SERVICE_UNAVAILABLE',
      data: {
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      },
    });
  }
});
