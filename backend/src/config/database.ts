import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'warn', 'error']
    : ['warn', 'error'],
});

prisma.$connect()
  .then(() => logger.info('Database connected'))
  .catch((err: Error) => {
    logger.error('Database connection failed', err);
    process.exit(1);
  });

export default prisma;
