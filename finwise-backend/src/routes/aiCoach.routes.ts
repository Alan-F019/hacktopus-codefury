import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import { getAICoachAdvice, aiCoachSchema } from '../controllers/aiCoach.controller.js';

const router = Router();

router.post('/', authenticate, strictLimiter, validateBody(aiCoachSchema), getAICoachAdvice);

export default router;
