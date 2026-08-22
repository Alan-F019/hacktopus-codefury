import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { calculateRiskProfile } from '../services/riskProfile.service.js';
import { calculateHealthScoreData } from '../services/healthScore.service.js';

export const onboardingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(1, 'Age must be greater than 0'),
  monthlyIncome: z.number().min(0, 'Monthly income must be non-negative'),
  monthlyExpenses: z.number().min(0, 'Monthly expenses must be non-negative'),
  existingSavings: z.number().min(0, 'Existing savings must be non-negative'),
  investmentAmount: z.number().min(0, 'Investment amount must be non-negative'),
  financialGoal: z.string().default('Wealth Accumulation'),
  answers: z.array(z.number()).min(1, 'At least one risk questionnaire answer is required'),
});

export const submitOnboarding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name,
      age,
      monthlyIncome,
      monthlyExpenses,
      existingSavings,
      investmentAmount,
      financialGoal,
      answers,
    } = req.body;

    const userId = req.userId!;

    // 1. Calculate risk profile & recommended asset allocation
    const { riskScore, riskLevel, recommendedAllocation } = calculateRiskProfile(answers);

    // 2. Persist / update User document
    let user = await User.findOne({ firebaseUid: userId });
    if (user) {
      user.name = name;
      user.age = age;
      user.monthlyIncome = monthlyIncome;
      user.monthlyExpenses = monthlyExpenses;
      user.existingSavings = existingSavings;
      user.investmentAmount = investmentAmount;
      user.financialGoal = financialGoal;
      user.riskScore = riskScore;
      user.riskLevel = riskLevel;
      user.recommendedAllocation = recommendedAllocation;
      user.isOnboarded = true;
      await user.save();
    } else {
      user = await User.create({
        firebaseUid: userId,
        email: `${userId}@finwise.user`,
        name,
        age,
        monthlyIncome,
        monthlyExpenses,
        existingSavings,
        investmentAmount,
        financialGoal,
        riskScore,
        riskLevel,
        recommendedAllocation,
        isOnboarded: true,
      });
    }

    // 3. Compute initial health score
    const healthData = calculateHealthScoreData({
      monthlyIncome,
      monthlyExpenses,
      existingSavings,
      investmentAmount,
      riskLevel,
      recommendedAllocation,
    });

    res.status(200).json({
      riskScore,
      riskLevel,
      recommendedAllocation,
      initialHealthScore: healthData.overallScore,
      message: 'Onboarding completed successfully. Risk profile computed.',
    });
  } catch (error) {
    next(error);
  }
};
