import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createTeam, getMyTeams, getTeamById, joinTeam } from '../controllers/team.controller';

const router = Router();
router.use(authMiddleware);

// GET /api/teams — List user's teams
router.get('/', getMyTeams);

// GET /api/teams/:id — Get team details
router.get('/:id', getTeamById);

// POST /api/teams — Create a new team
router.post('/', createTeam);

// POST /api/teams/:id/join — Join a team
router.post('/:id/join', joinTeam);

export default router;
