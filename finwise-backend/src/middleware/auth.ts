import { Request, Response, NextFunction } from 'express';
import { getFirebaseAdmin } from '../config/firebase.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export const DEMO_USER_ID = 'user-demo-42';

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authorization token required. Send "Authorization: Bearer <token>".',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();

  if (!token) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Empty authorization token provided.',
    });
    return;
  }

  // 1. Check Demo Sandbox Token
  if (token === env.DEMO_TOKEN || token === 'demo-sandbox-token' || token === 'test-token') {
    req.userId = DEMO_USER_ID;

    // Ensure Demo User exists in Mongo
    try {
      let user = await User.findOne({ firebaseUid: DEMO_USER_ID });
      if (!user) {
        user = await User.create({
          firebaseUid: DEMO_USER_ID,
          name: 'Alex Morgan',
          email: 'alex.morgan@finwise.demo',
          age: 28,
          monthlyIncome: 7500,
          monthlyExpenses: 4100,
          existingSavings: 24000,
          investmentAmount: 58000,
          financialGoal: 'Buy a Home & Retire Early at 55',
          riskScore: 72,
          riskLevel: 'Aggressive',
          recommendedAllocation: {
            Stock: 40,
            ETF: 30,
            'Mutual Fund': 15,
            Gold: 5,
            Cash: 10,
          },
          isOnboarded: true,
        });
      }
    } catch (err) {
      console.error('Error finding/creating demo user:', err);
    }

    next();
    return;
  }

  // 2. Verify with Firebase Admin SDK
  const firebaseAdmin = getFirebaseAdmin();
  if (firebaseAdmin) {
    try {
      const decoded = await firebaseAdmin.auth().verifyIdToken(token);
      req.userId = decoded.uid;

      // Find or create user doc keyed by firebaseUid
      let user = await User.findOne({ firebaseUid: decoded.uid });
      if (!user) {
        user = await User.create({
          firebaseUid: decoded.uid,
          email: decoded.email || `${decoded.uid}@finwise.user`,
          name: decoded.name || 'FinWise User',
          monthlyIncome: 6500,
          monthlyExpenses: 3800,
          existingSavings: 18000,
          investmentAmount: 45000,
          financialGoal: 'Long-term Wealth Building',
          riskScore: 60,
          riskLevel: 'Moderate',
          recommendedAllocation: {
            Stock: 25,
            ETF: 35,
            'Mutual Fund': 25,
            Gold: 5,
            Cash: 10,
          },
          isOnboarded: false,
        });
      }

      next();
      return;
    } catch (firebaseErr: any) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: firebaseErr.message || 'Firebase ID token verification failed.',
      });
      return;
    }
  }

  // 3. Fallback when Firebase Admin is not configured but a token is provided in test/dev
  if (env.NODE_ENV === 'test' || env.NODE_ENV === 'development') {
    req.userId = token.length > 5 ? token : DEMO_USER_ID;
    next();
    return;
  }

  res.status(401).json({
    error: 'UNAUTHORIZED',
    message: 'Firebase Admin not configured and token is not a recognized sandbox token.',
  });
};
