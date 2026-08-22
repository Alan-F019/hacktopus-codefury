import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  getGoals,
  createGoal,
  depositGoal,
  deleteGoal,
  createGoalSchema,
  depositGoalSchema,
} from '../controllers/goals.controller.js';

const router = Router();

router.get('/', authenticate, getGoals);
router.post('/', authenticate, validateBody(createGoalSchema), createGoal);
router.post('/:id/deposit', authenticate, validateBody(depositGoalSchema), depositGoal);
router.patch('/:id/deposit', authenticate, validateBody(depositGoalSchema), depositGoal);
router.delete('/:id', authenticate, deleteGoal);

export default router;
