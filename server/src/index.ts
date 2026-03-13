import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { initializeSocket } from './sockets';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT || '5000', 10);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    env: process.env.NODE_ENV || 'development',
    url: `http://localhost:${PORT}`,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason });
});

export default server;
