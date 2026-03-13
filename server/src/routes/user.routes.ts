import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getMyProfile, getUserById, searchUsers } from '../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// GET /api/users/me — Get current user profile
router.get('/me', getMyProfile);

// GET /api/users/search?skill=<skill> — Search users by skill
router.get('/search', searchUsers);

// GET /api/users/:id — Get user by ID
router.get('/:id', getUserById);

export default router;
