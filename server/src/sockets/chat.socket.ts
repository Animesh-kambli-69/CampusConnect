import { Server, Socket } from 'socket.io';
import prisma from '../config/db';
import { logger } from '../utils/logger';

/**
 * Handle chat-related Socket.IO events.
 */
export function handleChatEvents(io: Server, socket: Socket): void {
  const user = (socket as any).user;

  /**
   * join-room — Join a team's chat room
   */
  socket.on('join-room', async ({ teamId }: { teamId: string }) => {
    try {
      // Verify team membership
      const member = await prisma.teamMember.findUnique({
        where: { userId_teamId: { userId: user.id, teamId } },
      });

      if (!member) {
        socket.emit('error', { message: 'Not a team member' });
        return;
      }

      socket.join(`team:${teamId}`);

      // Load last 100 messages
      const messages = await prisma.message.findMany({
        where: { teamId },
        orderBy: { createdAt: 'asc' },
        take: 100,
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
      });

      socket.emit('chat-history', messages);

      // Notify room that user joined
      socket.to(`team:${teamId}`).emit('user-joined', {
        userId: user.id,
        userName: user.name || user.email,
      });

      logger.debug('User joined room', { userId: user.id, teamId });
    } catch (error) {
      logger.error('Error joining room', { error });
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  /**
   * send-message — Send a message to team chat
   */
  socket.on('send-message', async ({ teamId, content }: { teamId: string; content: string }) => {
    try {
      if (!content || !content.trim()) return;

      // Save message to database
      const message = await prisma.message.create({
        data: {
          content: content.trim(),
          senderId: user.id,
          teamId,
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
      });

      // Broadcast to all in room (including sender)
      io.to(`team:${teamId}`).emit('receive-message', message);
    } catch (error) {
      logger.error('Error sending message', { error });
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  /**
   * leave-room — Leave a team's chat room
   */
  socket.on('leave-room', ({ teamId }: { teamId: string }) => {
    socket.leave(`team:${teamId}`);
    socket.to(`team:${teamId}`).emit('user-left', { userId: user.id });
  });
}
