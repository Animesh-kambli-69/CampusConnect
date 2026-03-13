import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

// --- TASK MANAGEMENT ---

const createTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  assigneeId: z.string().uuid().optional(),
  teamId: z.string().uuid(),
});

const updateTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
});

/**
 * Helper: Verify user is a team member
 */
async function verifyTeamMembership(userId: string, teamId: string): Promise<void> {
  const member = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });
  if (!member) throw AppError.forbidden('You are not a member of this team');
}

/**
 * POST /tasks — Create a task
 */
export async function createTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createTaskSchema.parse(req.body);
    const userId = req.user!.id;

    await verifyTeamMembership(userId, data.teamId);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        teamId: data.teamId,
      },
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /tasks/team/:teamId — Get all tasks for a team
 */
export async function getTeamTasks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const teamId = req.params.teamId as string;
    const userId = req.user!.id;

    await verifyTeamMembership(userId, teamId);

    const tasks = await prisma.task.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /tasks/:id — Update a task
 */
export async function updateTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updates = updateTaskSchema.parse(req.body);
    const userId = req.user!.id;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw AppError.notFound('Task');

    await verifyTeamMembership(userId, task.teamId);

    const updated = await prisma.task.update({
      where: { id },
      data: updates,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

// --- BOARD / WHITEBOARD ---

/**
 * GET /boards/:teamId — Get whiteboard state
 */
export async function getBoard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const teamId = req.params.teamId as string;
    const userId = req.user!.id;

    await verifyTeamMembership(userId, teamId);

    const board = await prisma.board.findUnique({ where: { teamId } });

    res.json({
      success: true,
      data: board ? { ...board, state: JSON.parse(board.state) } : null,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /boards/save — Save whiteboard state
 */
export async function saveBoard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { teamId, state } = req.body;
    if (!teamId || !state) throw AppError.badRequest('teamId and state are required');

    const userId = req.user!.id;
    await verifyTeamMembership(userId, teamId);

    const board = await prisma.board.upsert({
      where: { teamId },
      create: {
        teamId,
        state: JSON.stringify(state),
      },
      update: {
        state: JSON.stringify(state),
      },
    });

    res.json({ success: true, data: { id: board.id, teamId: board.teamId } });
  } catch (error) {
    next(error);
  }
}
