import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
} from '../controllers/event.controller';

const router = Router();
router.use(authMiddleware);

// GET /api/events — List events for user's college
router.get('/', getEvents);

// GET /api/events/:id — Get event details
router.get('/:id', getEventById);

// POST /api/events — Create event (admin only)
router.post('/', adminMiddleware, createEvent);

// POST /api/events/:id/register — Register for event
router.post('/:id/register', registerForEvent);

export default router;
