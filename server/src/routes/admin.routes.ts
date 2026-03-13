import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import {
  getCollegeUsers,
  toggleBanUser,
  deleteListing,
} from '../controllers/admin.controller';

const router = Router();
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/users — List college users
router.get('/users', getCollegeUsers);

// PATCH /api/admin/users/:id/ban — Ban/unban user
router.patch('/users/:id/ban', toggleBanUser);

// DELETE /api/admin/listings/:id — Delete listing
router.delete('/listings/:id', deleteListing);

export default router;
