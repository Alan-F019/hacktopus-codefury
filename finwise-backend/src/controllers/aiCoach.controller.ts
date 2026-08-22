import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { generateAICoachAdvice } from '../services/aiCoach.service.js';

export const aiCoachSchema = z.object({
  income: z.number().min(0, 'Income must be non-negative'),
  expenses: z.number().min(0, 'Expenses must be non-negative'),
  savings: z.number().min(0, 'Savings must be non-negative'),
  risk: z.string().optional().default('Aggressive'),
  portfolio_equity: z.number().min(0, 'Portfolio equity must be non-negative'),
});

export const getAICoachAdvice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { income, expenses, savings, risk, portfolio_equity } = req.body;

    const advice = await generateAICoachAdvice({
      income,
      expenses,
      savings,
      risk,
      portfolio_equity,
    });

    res.status(200).json(advice);
  } catch (error) {
    next(error);
  }
};
