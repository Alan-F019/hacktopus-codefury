import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getUserProfile } from '../controllers/user.controller.js';

const router = Router();

router.get('/profile', authenticate, getUserProfile);

export default router;
