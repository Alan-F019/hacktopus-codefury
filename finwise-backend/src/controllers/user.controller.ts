import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';

export const getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    let user = await User.findOne({ firebaseUid: userId });

    if (!user) {
      user = await User.create({
        firebaseUid: userId,
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

    res.status(200).json({
      uid: user.firebaseUid,
      name: user.name,
      email: user.email,
      age: user.age,
      monthlyIncome: user.monthlyIncome,
      monthlyExpenses: user.monthlyExpenses,
      existingSavings: user.existingSavings,
      investmentAmount: user.investmentAmount,
      financialGoal: user.financialGoal,
      riskScore: user.riskScore,
      riskLevel: user.riskLevel,
      isOnboarded: user.isOnboarded,
      photoURL: user.photoURL,
    });
  } catch (error) {
    next(error);
  }
};
