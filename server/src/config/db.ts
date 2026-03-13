import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Use a global variable to prevent multiple instances in development (hot reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { level: 'query', emit: 'event' },
            { level: 'warn', emit: 'stdout' },
            { level: 'error', emit: 'stdout' },
          ]
        : [{ level: 'error', emit: 'stdout' }],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test connection on startup
prisma
  .$connect()
  .then(() => {
    logger.info('Database connected successfully');
  })
  .catch((err: Error) => {
    logger.error('Database connection failed', { error: err.message });
    process.exit(1);
  });

export default prisma;
