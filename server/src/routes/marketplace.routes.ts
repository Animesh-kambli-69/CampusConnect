import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createListing,
  getListings,
  getListingById,
  markAsSold,
} from '../controllers/marketplace.controller';

const router = Router();
router.use(authMiddleware);

// GET /api/marketplace — List active listings
router.get('/', getListings);

// GET /api/marketplace/:id — Get listing details
router.get('/:id', getListingById);

// POST /api/marketplace — Create listing
router.post('/', createListing);

// PATCH /api/marketplace/:id/sold — Mark as sold
router.patch('/:id/sold', markAsSold);

export default router;
