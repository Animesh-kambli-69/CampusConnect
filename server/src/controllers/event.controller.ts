import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  date: z.string().transform((val) => new Date(val)),
  location: z.string().min(2).max(200),
  bannerUrl: z.string().url().optional(),
});

/**
 * POST /events — Create event (admin only)
 */
export async function createEvent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createEventSchema.parse(req.body);
    const { collegeId, id: userId } = req.user!;

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        location: data.location,
        bannerUrl: data.bannerUrl,
        collegeId,
        createdBy: userId,
      },
    });

    // Create notifications for all students in the college
    const collegeUsers = await prisma.user.findMany({
      where: { collegeId, banned: false, id: { not: userId } },
      select: { id: true },
    });

    if (collegeUsers.length > 0) {
      await Promise.all(
        collegeUsers.map((u: any) =>
          prisma.notification.create({
            data: {
              userId: u.id,
              type: 'EVENT',
              title: 'New Event',
              message: `New event: ${event.title}`,
              metadata: { eventId: event.id },
            },
          })
        )
      );
    }

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /events — List events for user's college
 */
export async function getEvents(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { collegeId } = req.user!;

    const events = await prisma.event.findMany({
      where: { collegeId },
      orderBy: { date: 'asc' },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /events/:id — Get event details
 */
export async function getEventById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { collegeId, id: userId } = req.user!;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          select: {
            user: { select: { id: true, name: true, email: true } },
            registeredAt: true,
          },
        },
        _count: { select: { registrations: true } },
      },
    });

    if (!event) throw AppError.notFound('Event');
    if (event.collegeId !== collegeId) throw AppError.forbidden('Access denied');

    // Check if current user is registered
    const isRegistered = event.registrations.some((r: any) => r.user.id === userId);

    res.json({
      success: true,
      data: { ...event, isRegistered },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /events/:id/register — Register for an event
 */
export async function registerForEvent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: eventId } = req.params;
    const { id: userId, collegeId } = req.user!;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw AppError.notFound('Event');
    if (event.collegeId !== collegeId) throw AppError.forbidden('Access denied');

    // Check if already registered
    const existing = await prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (existing) throw AppError.conflict('Already registered for this event');

    const registration = await prisma.eventRegistration.create({
      data: { userId, eventId },
    });

    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
}
