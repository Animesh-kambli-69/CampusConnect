import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

const createTeamSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

/**
 * POST /teams — Create a new team
 */
export async function createTeam(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createTeamSchema.parse(req.body);
    const { id: userId, collegeId } = req.user!;

    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        leaderId: userId,
        collegeId,
        members: {
          create: {
            userId,
            role: 'Leader',
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /teams — List user's teams
 */
export async function getMyTeams(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const teams = await prisma.team.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { members: true, messages: true, tasks: true } },
      },
    });

    res.json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /teams/:id — Get team details
 */
export async function getTeamById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                skills: { select: { name: true } },
              },
            },
          },
        },
        _count: { select: { messages: true, tasks: true } },
      },
    });

    if (!team) throw AppError.notFound('Team');

    // Verify membership
    const isMember = team.members.some((m: any) => m.userId === userId);
    if (!isMember) throw AppError.forbidden('You are not a member of this team');

    res.json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /teams/:id/join — Join a team
 */
export async function joinTeam(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: teamId } = req.params;
    const { id: userId, collegeId } = req.user!;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw AppError.notFound('Team');
    if (team.collegeId !== collegeId) throw AppError.forbidden('Team is from a different college');

    // Check if already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: { userId, teamId },
    });
    if (existingMember) throw AppError.conflict('Already a member of this team');

    const member = await prisma.teamMember.create({
      data: { userId, teamId, role: 'Member' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    next(error);
  }
}
