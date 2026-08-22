import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Goal, GoalCategory } from '../models/Goal.js';
import { calculateGoalMetrics } from '../services/goals.service.js';

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  category: z.enum(['Emergency', 'Retirement', 'House', 'Vehicle', 'Travel', 'Education', 'Other']),
  targetAmount: z.number().min(1, 'Target amount must be greater than 0'),
  currentAmount: z.number().min(0, 'Current amount must be non-negative').default(0),
  timeHorizonYears: z.number().min(0.1, 'Time horizon must be at least 0.1 years'),
  expectedAnnualReturn: z.number().optional().default(8.0),
});

export const depositGoalSchema = z.object({
  amount: z.number().min(1, 'Deposit amount must be greater than 0'),
});

export const getGoals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

    const formatted = goals.map((g) => calculateGoalMetrics(g));

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const {
      name,
      category,
      targetAmount,
      currentAmount = 0,
      timeHorizonYears,
      expectedAnnualReturn = 8.0,
    } = req.body;

    const totalMonths = Math.max(1, Math.round(timeHorizonYears * 12));
    const now = new Date();
    const futureDate = new Date(now.setMonth(now.getMonth() + totalMonths));
    const targetDate = futureDate.toISOString().split('T')[0];

    const goal = await Goal.create({
      userId,
      name,
      category,
      targetAmount,
      currentAmount,
      timeHorizonYears,
      targetDate,
      expectedAnnualReturn,
    });

    const formatted = calculateGoalMetrics(goal);

    res.status(201).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const depositGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { amount } = req.body;

    const goal = await Goal.findOne({ _id: id, userId });

    if (!goal) {
      res.status(404).json({
        error: 'GOAL_NOT_FOUND',
        message: 'Goal not found or not owned by user.',
      });
      return;
    }

    goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
    await goal.save();

    const formatted = calculateGoalMetrics(goal);

    res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, userId });

    if (!goal) {
      res.status(404).json({
        error: 'GOAL_NOT_FOUND',
        message: 'Goal not found or not owned by user.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
