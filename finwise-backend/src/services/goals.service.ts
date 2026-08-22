import { IGoal } from '../models/Goal.js';
import { roundTo } from '../utils/formatters.js';

export interface FormattedGoalResponse {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  timeHorizonYears: number;
  targetDate: string;
  progressPercent: number;
  requiredMonthlySavings: number;
  expectedAnnualReturn: number;
  sipMonthlyRequired: number;
}

export const calculateGoalMetrics = (
  goal: IGoal | {
    name: string;
    category: string;
    targetAmount: number;
    currentAmount: number;
    timeHorizonYears: number;
    expectedAnnualReturn?: number;
    targetDate?: string;
    _id?: any;
    id?: string;
  }
): FormattedGoalResponse => {
  const targetAmount = goal.targetAmount;
  const currentAmount = Math.min(targetAmount, Math.max(0, goal.currentAmount || 0));
  const timeHorizonYears = Math.max(0.1, goal.timeHorizonYears || 1);
  const expectedAnnualReturn = goal.expectedAnnualReturn ?? 8.0;

  const remaining = Math.max(0, targetAmount - currentAmount);
  const totalMonths = Math.max(1, Math.round(timeHorizonYears * 12));

  // 1. Simple linear required monthly savings (no growth)
  const requiredMonthlySavings = roundTo(remaining / totalMonths, 2);

  // 2. Compounding SIP monthly required
  const r = expectedAnnualReturn / 100 / 12; // monthly rate
  let sipMonthlyRequired = requiredMonthlySavings;
  if (r > 0 && remaining > 0) {
    const factor = Math.pow(1 + r, totalMonths) - 1;
    if (factor > 0) {
      sipMonthlyRequired = roundTo((remaining * r) / factor, 2);
    }
  }

  // Progress percent
  const progressPercent = targetAmount > 0 ? roundTo((currentAmount / targetAmount) * 100, 1) : 0;

  // Compute target date if not already provided
  let targetDate = goal.targetDate;
  if (!targetDate) {
    const now = new Date();
    const futureDate = new Date(now.setMonth(now.getMonth() + totalMonths));
    targetDate = futureDate.toISOString().split('T')[0];
  }

  const id = (goal as any)._id?.toString() || (goal as any).id || `goal-${Date.now()}`;

  return {
    id,
    name: goal.name,
    category: goal.category,
    targetAmount,
    currentAmount,
    timeHorizonYears,
    targetDate,
    progressPercent,
    requiredMonthlySavings,
    expectedAnnualReturn,
    sipMonthlyRequired,
  };
};
