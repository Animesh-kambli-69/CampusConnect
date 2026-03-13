import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../services/auth.service';
import { logger } from '../utils/logger';
import { handleChatEvents } from './chat.socket';
import { handleWhiteboardEvents } from './whiteboard.socket';

let io: Server;

/**
 * Initialize Socket.IO server with JWT authentication.
 */
export function initializeSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for socket connections
  io.use((socket: Socket, next: (err?: Error) => void) => {
    try {
      const authToken: string | undefined =
        socket.handshake.auth?.token as string | undefined;
      const headerToken: string | undefined =
        (socket.handshake.headers?.authorization as string | undefined)?.split(' ')[1];

      const token = authToken || headerToken;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyToken(token);
      (socket as any).user = decoded;
      next();
    } catch (err: unknown) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info('Socket connected', { userId: user.id, socketId: socket.id });

    // Register event handlers
    handleChatEvents(io, socket);
    handleWhiteboardEvents(io, socket);

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { userId: user.id, socketId: socket.id });
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
