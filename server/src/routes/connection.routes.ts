import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  sendConnectionRequest,
  getConnections,
  acceptConnection,
  rejectConnection,
} from '../controllers/connection.controller';

const router = Router();
router.use(authMiddleware);

// GET /api/connections — Get user's connections
router.get('/', getConnections);

// POST /api/connections — Send connection request
router.post('/', sendConnectionRequest);

// PATCH /api/connections/:id/accept — Accept connection
router.patch('/:id/accept', acceptConnection);

// PATCH /api/connections/:id/reject — Reject connection
router.patch('/:id/reject', rejectConnection);

export default router;
