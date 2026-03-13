import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import {
  parseResume,
  generateEventAnnouncement,
  getTeamRecommendations,
} from '../controllers/ai.controller';

const router = Router();
router.use(authMiddleware);

// POST /api/ai/parse-resume — Parse resume with AI
router.post('/parse-resume', parseResume);

// POST /api/ai/event-announcement — Generate event announcement (admin)
router.post('/event-announcement', adminMiddleware, generateEventAnnouncement);

// POST /api/ai/team-match — Get team recommendations
router.post('/team-match', getTeamRecommendations);

export default router;
