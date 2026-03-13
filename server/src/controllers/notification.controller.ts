import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

/**
 * GET /notifications — Get user's notifications (unread first)
 */
export async function getNotifications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [{ read: 'asc' }, { createdAt: 'desc' }],
      take: 50,
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /notifications/:id/read — Mark notification as read
 */
export async function markAsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw AppError.notFound('Notification');
    if (notification.userId !== userId) throw AppError.forbidden('Access denied');

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /notifications/read-all — Mark all notifications as read
 */
export async function markAllAsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (error) {
    next(error);
  }
}
