import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import { submitOnboarding, onboardingSchema } from '../controllers/onboarding.controller.js';

const router = Router();

router.post(
  '/',
  authenticate,
  strictLimiter,
  validateBody(onboardingSchema, 'INVALID_ONBOARDING_PAYLOAD'),
  submitOnboarding
);

export default router;
