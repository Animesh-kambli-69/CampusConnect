import { Server, Socket } from 'socket.io';
import prisma from '../config/db';
import { logger } from '../utils/logger';

// Debounce timers for board saves
const saveTimers = new Map<string, NodeJS.Timeout>();

/**
 * Handle whiteboard-related Socket.IO events.
 */
export function handleWhiteboardEvents(io: Server, socket: Socket): void {
  const user = (socket as any).user;

  /**
   * join-board — Join a team's whiteboard room
   */
  socket.on('join-board', async ({ teamId }: { teamId: string }) => {
    try {
      socket.join(`board:${teamId}`);

      // Load current board state
      const board = await prisma.board.findUnique({ where: { teamId } });
      if (board) {
        socket.emit('board-state', {
          teamId,
          elements: JSON.parse(board.state),
        });
      }

      logger.debug('User joined board', { userId: user.id, teamId });
    } catch (error) {
      logger.error('Error joining board', { error });
    }
  });

  /**
   * board-update — Broadcast whiteboard changes to team members.
   * Debounced save to database every 5 seconds.
   */
  socket.on('board-update', ({ teamId, elements }: { teamId: string; elements: any[] }) => {
    // Broadcast to all OTHER members in the board room
    socket.to(`board:${teamId}`).emit('board-sync', { elements });

    // Debounced save — save at most once every 5 seconds per team
    if (saveTimers.has(teamId)) {
      clearTimeout(saveTimers.get(teamId)!);
    }

    saveTimers.set(
      teamId,
      setTimeout(async () => {
        try {
          await prisma.board.upsert({
            where: { teamId },
            create: { teamId, state: JSON.stringify(elements) },
            update: { state: JSON.stringify(elements) },
          });
          logger.debug('Board state saved', { teamId });
        } catch (error) {
          logger.error('Error saving board state', { error });
        }
        saveTimers.delete(teamId);
      }, 5000)
    );
  });

  /**
   * leave-board — Leave whiteboard room
   */
  socket.on('leave-board', ({ teamId }: { teamId: string }) => {
    socket.leave(`board:${teamId}`);
  });
}
