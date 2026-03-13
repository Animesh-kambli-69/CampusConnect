import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

/**
 * POST /connections — Send connection request
 */
export async function sendConnectionRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: senderId, collegeId } = req.user!;
    const { receiverId } = req.body;

    if (!receiverId) throw AppError.badRequest('receiverId is required');
    if (senderId === receiverId) throw AppError.badRequest('Cannot connect with yourself');

    // Verify receiver exists and is from same college
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) throw AppError.notFound('User');
    if (receiver.collegeId !== collegeId) {
      throw AppError.forbidden('Can only connect with users from your college');
    }

    // Check if connection already exists (in either direction)
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });
    if (existing) throw AppError.conflict('Connection already exists');

    const connection = await prisma.connection.create({
      data: { senderId, receiverId },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'CONNECTION_REQUEST',
        title: 'New Connection Request',
        message: `${req.user!.name} wants to connect with you`,
        metadata: { connectionId: connection.id, senderId },
      },
    });

    res.status(201).json({ success: true, data: connection });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /connections — Get user's connections
 */
export async function getConnections(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: connections });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /connections/:id/accept — Accept connection request
 */
export async function acceptConnection(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection) throw AppError.notFound('Connection');
    if (connection.receiverId !== userId) {
      throw AppError.forbidden('Only the receiver can accept this request');
    }
    if (connection.status !== 'PENDING') {
      throw AppError.badRequest('Connection is not pending');
    }

    const updated = await prisma.connection.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /connections/:id/reject — Reject connection request
 */
export async function rejectConnection(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const connection = await prisma.connection.findUnique({ where: { id } });
    if (!connection) throw AppError.notFound('Connection');
    if (connection.receiverId !== userId) {
      throw AppError.forbidden('Only the receiver can reject this request');
    }

    const updated = await prisma.connection.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}
