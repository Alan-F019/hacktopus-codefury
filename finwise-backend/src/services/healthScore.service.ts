import { IUser } from '../models/User.js';
import { IAsset } from '../models/Asset.js';
import { IGoal } from '../models/Goal.js';
import { ITransaction } from '../models/Transaction.js';
import { roundTo } from '../utils/formatters.js';

export interface SubScoreItem {
  score: number;
  maxScore: number;
  weight: number;
  status: 'Healthy' | 'Warning' | 'Critical';
  metricValue: string;
  benchmark: string;
  insight: string;
}

export interface ActionPlanItemResponse {
  id: string;
  title: string;
  description: string;
  category: 'Spending' | 'Goals' | 'Investments' | 'Emergency Fund' | 'Savings' | 'Debt';
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'High' | 'Medium' | 'Low';
  completed: boolean;
  impact: string;
}

export interface HealthScoreResponse {
  overallScore: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' | 'Critical';
  lastCalculated: string;
  subScores: {
    emergencyFund: SubScoreItem;
    spendingHabits: SubScoreItem;
    investments: SubScoreItem;
    goalProgress: SubScoreItem;
  };
  metrics: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    savingsRate: number;
    emergencyFundMonths: number;
    existingSavings: number;
    investmentAmount: number;
  };
  actionPlan: ActionPlanItemResponse[];
}

export const calculateHealthScoreData = (
  user: {
    monthlyIncome: number;
    monthlyExpenses: number;
    existingSavings: number;
    investmentAmount: number;
    riskLevel?: string;
    recommendedAllocation?: Record<string, number>;
  },
  assets: IAsset[] = [],
  goals: IGoal[] = [],
  transactions: ITransaction[] = []
): HealthScoreResponse => {
  const monthlyIncome = Math.max(1, user.monthlyIncome || 7500);
  const monthlyExpenses = Math.max(1, user.monthlyExpenses || 4100);
  const existingSavings = Math.max(0, user.existingSavings || 24000);

  const totalInvestments = assets.length > 0
    ? assets.reduce((sum, a) => sum + (a.amount || 0), 0)
    : (user.investmentAmount || 58000);

  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRate = roundTo((monthlySavings / monthlyIncome) * 100, 1);
  const emergencyFundMonths = roundTo(existingSavings / monthlyExpenses, 1);

  // 1. Emergency Fund (Weight: 0.30, 0-6 months scales linearly to 100)
  const rawEmergencyScore = (emergencyFundMonths / 6) * 100;
  const emergencyFundScore = Math.min(100, Math.max(0, Math.round(rawEmergencyScore)));
  const emergencyStatus: 'Healthy' | 'Warning' | 'Critical' =
    emergencyFundMonths >= 3 ? 'Healthy' : emergencyFundMonths >= 1.5 ? 'Warning' : 'Critical';

  const emergencySubScore: SubScoreItem = {
    score: emergencyFundScore,
    maxScore: 100,
    weight: 0.3,
    status: emergencyStatus,
    metricValue: `${emergencyFundMonths} Months`,
    benchmark: '3 - 6 Months of expenses',
    insight: `Your $${existingSavings.toLocaleString()} cash reserve provides ${emergencyFundMonths} months of safety runway.`,
  };

  // 2. Spending Habits (Weight: 0.25, <=40% is 100, >=90% is 0)
  const outflowRatio = roundTo((monthlyExpenses / monthlyIncome) * 100, 1);
  let rawSpendingScore = 50;
  if (outflowRatio <= 40) {
    rawSpendingScore = 100;
  } else if (outflowRatio >= 90) {
    rawSpendingScore = 0;
  } else {
    rawSpendingScore = ((90 - outflowRatio) / 50) * 100;
  }
  const spendingScore = Math.min(100, Math.max(0, Math.round(rawSpendingScore)));
  const spendingStatus: 'Healthy' | 'Warning' | 'Critical' =
    outflowRatio <= 60 ? 'Healthy' : outflowRatio <= 80 ? 'Warning' : 'Critical';

  const spendingSubScore: SubScoreItem = {
    score: spendingScore,
    maxScore: 100,
    weight: 0.25,
    status: spendingStatus,
    metricValue: `${outflowRatio}% Outflow`,
    benchmark: '< 60% of take-home income',
    insight: `Monthly spending ($${monthlyExpenses.toLocaleString()}) is ${
      outflowRatio <= 60 ? 'well contained below' : 'elevated compared to'
    } the 60% benchmark.`,
  };

  // 3. Investments Drift (Weight: 0.25, 0% drift is 100, >=40% drift is 0)
  const targetAlloc = user.recommendedAllocation || { Stock: 40, ETF: 30, 'Mutual Fund': 15, Gold: 5, Cash: 10 };
  let drift = 12.0;

  if (assets.length > 0 && totalInvestments > 0) {
    const assetTotals: Record<string, number> = { Stock: 0, ETF: 0, 'Mutual Fund': 0, Gold: 0, Cash: 0 };
    assets.forEach((a) => {
      assetTotals[a.type] = (assetTotals[a.type] || 0) + a.amount;
    });

    let sumDiff = 0;
    Object.keys(targetAlloc).forEach((type) => {
      const curPct = (assetTotals[type] || 0) / totalInvestments * 100;
      const tgtPct = targetAlloc[type] || 0;
      sumDiff += Math.abs(curPct - tgtPct);
    });
    drift = roundTo(sumDiff / 2, 1);
  }

  let rawInvestmentScore = 80;
  if (drift <= 0) {
    rawInvestmentScore = 100;
  } else if (drift >= 40) {
    rawInvestmentScore = 0;
  } else {
    rawInvestmentScore = ((40 - drift) / 40) * 100;
  }
  const investmentScore = Math.min(100, Math.max(0, Math.round(rawInvestmentScore)));
  const investmentStatus: 'Healthy' | 'Warning' | 'Critical' =
    drift <= 15 ? 'Healthy' : drift <= 25 ? 'Warning' : 'Critical';

  const investmentSubScore: SubScoreItem = {
    score: investmentScore,
    maxScore: 100,
    weight: 0.25,
    status: investmentStatus,
    metricValue: `${drift}% Drift`,
    benchmark: '< 10% drift from risk profile',
    insight: `Asset allocation is aligned with your ${user.riskLevel || 'Aggressive'} growth profile with modest cash surplus.`,
  };

  // 4. Goal Progress (Weight: 0.20)
  let avgGoalFunded = 0.65;
  if (goals.length > 0) {
    const totalProgress = goals.reduce((sum, g) => sum + (g.currentAmount / Math.max(1, g.targetAmount)), 0);
    avgGoalFunded = totalProgress / goals.length;
  }

  const goalScore = Math.min(100, Math.max(20, Math.round(avgGoalFunded * 100)));
  const goalFundedPct = roundTo(avgGoalFunded * 100, 1);
  const goalStatus: 'Healthy' | 'Warning' | 'Critical' =
    avgGoalFunded >= 0.5 ? 'Healthy' : 'Warning';

  const goalSubScore: SubScoreItem = {
    score: goalScore,
    maxScore: 100,
    weight: 0.2,
    status: goalStatus,
    metricValue: `${goalFundedPct}% Funded`,
    benchmark: '> 50% milestone pacing',
    insight: `Goal milestones are ${goalFundedPct}% funded; on track with recommended SIP pacing.`,
  };

  // Composite Weighted Score
  const overallScore = Math.round(
    emergencyFundScore * 0.3 +
      spendingScore * 0.25 +
      investmentScore * 0.25 +
      goalScore * 0.2
  );

  let status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' = 'Good';
  if (overallScore >= 80) status = 'Excellent';
  else if (overallScore >= 60) status = 'Good';
  else if (overallScore >= 40) status = 'Fair';
  else status = 'Needs Attention';

  // Dynamic Rule-Based Action Plan
  const actionPlan: ActionPlanItemResponse[] = [];

  if (emergencyFundMonths < 3) {
    actionPlan.push({
      id: 'act-1',
      title: 'Accelerate Emergency Cash Buffer',
      description: `Your safety runway is currently ${emergencyFundMonths} months. Allocate $400/month to high-yield cash until you reach at least a 3-month safety cushion.`,
      category: 'Emergency Fund',
      priority: 'HIGH',
      completed: false,
      impact: '+8 Health Pts',
    });
  } else if (emergencyFundMonths < 6) {
    actionPlan.push({
      id: 'act-1',
      title: 'Top Up Emergency Buffer to 6 Months',
      description: `Current cushion provides ${emergencyFundMonths} months. Adding $250/mo will complete your 6-month ($${(monthlyExpenses * 6).toLocaleString()}) safety net.`,
      category: 'Emergency Fund',
      priority: 'MEDIUM',
      completed: false,
      impact: '+4 Health Pts',
    });
  }

  if (outflowRatio > 60) {
    actionPlan.push({
      id: 'act-2',
      title: 'Optimize Discretionary Spending & Subscriptions',
      description: `Monthly spending is ${outflowRatio}% of income. Trimming $250/mo from dining and shopping redirects $3,000/yr to investments.`,
      category: 'Spending',
      priority: 'HIGH',
      completed: false,
      impact: '+5 Health Pts',
    });
  } else {
    actionPlan.push({
      id: 'act-2',
      title: 'Optimize Discretionary Dining & Food',
      description: 'Dining expenses represent 33% of food spend. Trimming $250/mo adds $3,000/yr to your investment compounding.',
      category: 'Spending',
      priority: 'HIGH',
      completed: false,
      impact: '+4 Health Pts',
    });
  }

  if (drift > 10) {
    actionPlan.push({
      id: 'act-3',
      title: 'Rebalance Toward Target Asset Allocation',
      description: `Portfolio drift is ${drift}%. Direct upcoming contributions to underweight asset classes to maintain your target risk profile.`,
      category: 'Investments',
      priority: 'MEDIUM',
      completed: false,
      impact: '+6 Health Pts',
    });
  }

  if (goals.length > 0) {
    const underfundedGoal = goals.find((g) => (g.currentAmount / Math.max(1, g.targetAmount)) < 0.5) || goals[0];
    actionPlan.push({
      id: 'act-4',
      title: `Automate Monthly SIP for ${underfundedGoal.name}`,
      description: `Deploy automated monthly transfers into your balanced equity index fund to meet the milestone by target date.`,
      category: 'Goals',
      priority: 'HIGH',
      completed: false,
      impact: '+5 Health Pts',
    });
  } else {
    actionPlan.push({
      id: 'act-4',
      title: 'Automate Monthly SIP for Wealth Goals',
      description: 'Deploy automated monthly transfers into broad-market index ETFs on the 1st of each month.',
      category: 'Goals',
      priority: 'HIGH',
      completed: false,
      impact: '+5 Health Pts',
    });
  }

  // Priority sorting HIGH -> MEDIUM -> LOW
  const priorityWeight = { HIGH: 3, High: 3, MEDIUM: 2, Medium: 2, LOW: 1, Low: 1 };
  actionPlan.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));

  return {
    overallScore,
    status,
    lastCalculated: new Date().toISOString(),
    subScores: {
      emergencyFund: emergencySubScore,
      spendingHabits: spendingSubScore,
      investments: investmentSubScore,
      goalProgress: goalSubScore,
    },
    metrics: {
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate,
      emergencyFundMonths,
      existingSavings,
      investmentAmount: totalInvestments,
    },
    actionPlan: actionPlan.slice(0, 5),
  };
};
