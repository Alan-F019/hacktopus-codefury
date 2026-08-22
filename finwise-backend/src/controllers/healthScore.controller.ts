import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Asset } from '../models/Asset.js';
import { Goal } from '../models/Goal.js';
import { Transaction } from '../models/Transaction.js';
import { calculateHealthScoreData } from '../services/healthScore.service.js';

export const getHealthScore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;

    const [user, assets, goals, transactions] = await Promise.all([
      User.findOne({ firebaseUid: userId }),
      Asset.find({ userId }),
      Goal.find({ userId }),
      Transaction.find({ userId }),
    ]);

    const userProfile = user || {
      monthlyIncome: 7500,
      monthlyExpenses: 4100,
      existingSavings: 24000,
      investmentAmount: 58000,
      riskLevel: 'Aggressive',
      recommendedAllocation: {
        Stock: 40,
        ETF: 30,
        'Mutual Fund': 15,
        Gold: 5,
        Cash: 10,
      },
    };

    const healthData = calculateHealthScoreData(
      userProfile,
      assets,
      goals,
      transactions
    );

    res.status(200).json(healthData);
  } catch (error) {
    next(error);
  }
};
