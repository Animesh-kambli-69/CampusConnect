import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller';

const router = Router();
router.use(authMiddleware);

// GET /api/notifications — Get user's notifications
router.get('/', getNotifications);

// PATCH /api/notifications/read-all — Mark all as read
router.patch('/read-all', markAllAsRead);

// PATCH /api/notifications/:id/read — Mark as read
router.patch('/:id/read', markAsRead);

export default router;
