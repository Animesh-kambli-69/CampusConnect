import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

/**
 * GET /users/me — Get current user's profile
 */
export async function getMyProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        collegeId: true,
        resumeUrl: true,
        createdAt: true,
        college: {
          select: { id: true, name: true, domain: true },
        },
        skills: {
          select: { id: true, name: true },
        },
        teams: {
          select: {
            team: {
              select: { id: true, name: true, description: true },
            },
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('User');
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /users/:id — Get another user's profile (same college only)
 */
export async function getUserById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const currentCollegeId = req.user!.collegeId;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        collegeId: true,
        resumeUrl: true,
        createdAt: true,
        college: {
          select: { id: true, name: true, domain: true },
        },
        skills: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      throw AppError.notFound('User');
    }

    // College isolation — only allow viewing profiles from same college
    if (user.collegeId !== currentCollegeId) {
      throw AppError.forbidden('You can only view profiles from your college');
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /users?skill=<skill> — Search users by skill (same college)
 */
export async function searchUsers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const collegeId = req.user!.collegeId;
    const skillQuery = req.query.skill as string | undefined;

    const where: any = { collegeId, banned: false };

    if (skillQuery) {
      where.skills = {
        some: {
          name: {
            contains: skillQuery,
            mode: 'insensitive',
          },
        },
      };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        resumeUrl: true,
        skills: {
          select: { id: true, name: true },
        },
      },
      take: 50,
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}
