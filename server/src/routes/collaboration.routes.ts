import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createTask,
  getTeamTasks,
  updateTask,
  getBoard,
  saveBoard,
} from '../controllers/collaboration.controller';

const router = Router();
router.use(authMiddleware);

// --- Tasks ---
// POST /api/collaboration/tasks — Create task
router.post('/tasks', createTask);

// GET /api/collaboration/tasks/team/:teamId — Get team tasks
router.get('/tasks/team/:teamId', getTeamTasks);

// PATCH /api/collaboration/tasks/:id — Update task
router.patch('/tasks/:id', updateTask);

// --- Boards ---
// GET /api/collaboration/boards/:teamId — Get whiteboard state
router.get('/boards/:teamId', getBoard);

// POST /api/collaboration/boards/save — Save whiteboard state
router.post('/boards/save', saveBoard);

export default router;
