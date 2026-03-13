import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

/**
 * GET /admin/users — List all users from admin's college
 */
export async function getCollegeUsers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { collegeId } = req.user!;

    const users = await prisma.user.findMany({
      where: { collegeId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        createdAt: true,
        _count: {
          select: { skills: true, teams: true, listings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /admin/users/:id/ban — Ban or unban a user
 */
export async function toggleBanUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { collegeId } = req.user!;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw AppError.notFound('User');
    if (user.collegeId !== collegeId) throw AppError.forbidden('Can only manage users from your college');
    if (user.role === 'ADMIN') throw AppError.forbidden('Cannot ban another admin');

    const updated = await prisma.user.update({
      where: { id },
      data: { banned: !user.banned },
    });

    logger.info(`Admin ${req.user!.id} ${updated.banned ? 'banned' : 'unbanned'} user ${id}`);

    res.json({
      success: true,
      data: {
        id: updated.id,
        banned: updated.banned,
        message: updated.banned ? 'User has been banned' : 'User has been unbanned',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /admin/listings/:id — Delete a marketplace listing
 */
export async function deleteListing(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { collegeId } = req.user!;

    const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
    if (!listing) throw AppError.notFound('Listing');
    if (listing.collegeId !== collegeId) throw AppError.forbidden('Can only manage listings from your college');

    await prisma.marketplaceListing.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    logger.info(`Admin ${req.user!.id} deleted listing ${id}`);

    res.json({ success: true, data: { message: 'Listing deleted' } });
  } catch (error) {
    next(error);
  }
}
