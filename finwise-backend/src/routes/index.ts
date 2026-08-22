import { Router } from 'express';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';
import onboardingRoutes from './onboarding.routes.js';
import healthScoreRoutes from './healthScore.routes.js';
import portfolioRoutes from './portfolio.routes.js';
import expensesRoutes from './expenses.routes.js';
import goalsRoutes from './goals.routes.js';
import aiCoachRoutes from './aiCoach.routes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/user', userRoutes);
apiRouter.use('/onboarding', onboardingRoutes);
apiRouter.use('/health-score', healthScoreRoutes);
apiRouter.use('/portfolio', portfolioRoutes);
apiRouter.use('/expenses', expensesRoutes);
apiRouter.use('/goals', goalsRoutes);
apiRouter.use('/ai-coach', aiCoachRoutes);

export default apiRouter;
