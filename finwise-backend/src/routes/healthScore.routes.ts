import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getHealthScore } from '../controllers/healthScore.controller.js';

const router = Router();

router.get('/', authenticate, getHealthScore);

export default router;
