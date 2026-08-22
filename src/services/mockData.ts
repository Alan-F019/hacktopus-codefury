import {
  UserProfile,
  HealthScoreData,
  PortfolioData,
  Goal,
  AICoachResponse,
  RiskLevel,
  Asset,
  PortfolioAllocation,
} from '../types';
import { parseExpenseCSV, DEFAULT_SAMPLE_CSV } from '../utils/csvParser';
import { getTargetAllocationForRisk, calculateHealthScore } from '../utils/financialCalculations';

export const INITIAL_MOCK_USER: UserProfile = {
  uid: 'user-demo-42',
  name: 'Alex Morgan',
  email: 'alex.morgan@finwise.demo',
  age: 29,
  monthlyIncome: 600000,
  monthlyExpenses: 328000,
  existingSavings: 1920000,
  investmentAmount: 4640000,
  financialGoal: 'Buy a Home & Retire Early at 55',
  riskScore: 68,
  riskLevel: 'Aggressive',
  isOnboarded: true,
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const INITIAL_MOCK_ASSETS: Asset[] = [
  { id: 'ast-1', name: 'Vanguard Total World Stock (VT)', type: 'ETF', amount: 1760000, ticker: 'VT', returnsYTD: 14.2 },
  { id: 'ast-2', name: 'S&P 500 Index Fund (VOO)', type: 'ETF', amount: 1280000, ticker: 'VOO', returnsYTD: 18.5 },
  { id: 'ast-3', name: 'Apple Inc. (AAPL)', type: 'Stock', amount: 680000, ticker: 'AAPL', returnsYTD: 9.4 },
  { id: 'ast-4', name: 'Fidelity Blue Chip Growth', type: 'Mutual Fund', amount: 520000, ticker: 'FBGRX', returnsYTD: 12.1 },
  { id: 'ast-5', name: 'Physical Gold Sovereign ETF', type: 'Gold', amount: 200000, ticker: 'GLD', returnsYTD: 8.7 },
  { id: 'ast-6', name: 'High-Yield Liquid Cash Reserve', type: 'Cash', amount: 200000, returnsYTD: 4.8 },
];

export const generatePortfolioData = (assets: Asset[], riskLevel: RiskLevel): PortfolioData => {
  const totalValue = assets.reduce((sum, a) => sum + a.amount, 0);
  const targetMap = getTargetAllocationForRisk(riskLevel);

  // Group by type
  const typeTotals: Record<string, number> = {};
  assets.forEach((a) => {
    typeTotals[a.type] = (typeTotals[a.type] || 0) + a.amount;
  });

  const allTypes = Array.from(new Set([...Object.keys(typeTotals), ...Object.keys(targetMap)]));

  const allocations: PortfolioAllocation[] = allTypes.map((type) => {
    const amount = typeTotals[type] || 0;
    const currentPercent = totalValue > 0 ? Number(((amount / totalValue) * 100).toFixed(1)) : 0;
    const targetPercent = targetMap[type] || 0;
    const difference = Number((currentPercent - targetPercent).toFixed(1));

    let status: 'optimal' | 'underweight' | 'overweight' = 'optimal';
    if (difference > 5) status = 'overweight';
    else if (difference < -5) status = 'underweight';

    return {
      type: type as any,
      amount,
      currentPercent,
      targetPercent,
      difference,
      status,
    };
  });

  // Generate educational insights
  const insights: string[] = [];
  const overweight = allocations.find((a) => a.status === 'overweight');
  const underweight = allocations.find((a) => a.status === 'underweight');

  if (overweight) {
    insights.push(
      `Educational Note: Your allocation in ${overweight.type} is ${overweight.currentPercent}%, which is ${overweight.difference}% above your target ${riskLevel} model benchmark (${overweight.targetPercent}%).`
    );
  }
  if (underweight) {
    insights.push(
      `Educational Note: Your ${underweight.type} weighting (${underweight.currentPercent}%) is currently trailing your benchmark target of ${underweight.targetPercent}%.`
    );
  }
  insights.push(
    `Important Disclaimer: All allocation metrics and comparisons are educational insights designed for financial literacy, and do not constitute direct buy, sell, or tailored investment recommendations.`
  );

  return {
    totalValue,
    assets,
    allocations,
    riskProfile: riskLevel,
    educationalInsights: insights,
  };
};

export const INITIAL_MOCK_GOALS: Goal[] = [
  {
    id: 'goal-1',
    name: 'Home Down Payment',
    category: 'House',
    targetAmount: 6000000,
    currentAmount: 2560000,
    timeHorizonYears: 3,
    targetDate: '2029-08-01',
    requiredMonthlySavings: 980,
    progressPercent: 42.6,
    expectedAnnualReturn: 7.5,
    sipMonthlyRequired: 920,
  },
  {
    id: 'goal-2',
    name: '6-Month Emergency Safety Fund',
    category: 'Emergency',
    targetAmount: 2000000,
    currentAmount: 1920000,
    timeHorizonYears: 0.5,
    targetDate: '2027-02-01',
    requiredMonthlySavings: 200,
    progressPercent: 96.0,
    expectedAnnualReturn: 4.5,
    sipMonthlyRequired: 195,
  },
  {
    id: 'goal-3',
    name: 'Early Financial Independence (FIRE)',
    category: 'Retirement',
    targetAmount: 60000000,
    currentAmount: 4640000,
    timeHorizonYears: 18,
    targetDate: '2044-08-01',
    requiredMonthlySavings: 1450,
    progressPercent: 7.7,
    expectedAnnualReturn: 10.0,
    sipMonthlyRequired: 1180,
  },
  {
    id: 'goal-4',
    name: 'European Sabbatical Trip',
    category: 'Travel',
    targetAmount: 640000,
    currentAmount: 384000,
    timeHorizonYears: 1,
    targetDate: '2027-08-01',
    requiredMonthlySavings: 260,
    progressPercent: 60.0,
    expectedAnnualReturn: 5.0,
    sipMonthlyRequired: 255,
  },
];

export const INITIAL_MOCK_EXPENSES = parseExpenseCSV(DEFAULT_SAMPLE_CSV);

export const generateAICoachAdvice = (params: {
  income: number;
  expenses: number;
  savings: number;
  risk: RiskLevel;
  portfolio_equity: number;
}): AICoachResponse => {
  const savingsRate = params.income > 0 ? (((params.income - params.expenses) / params.income) * 100).toFixed(1) : '0';
  const runwayMonths = params.expenses > 0 ? (params.savings / params.expenses).toFixed(1) : '0';

  return {
    summary: `Based on your monthly cash inflow of ₹${params.income.toLocaleString('en-IN')} and outflow of ₹${params.expenses.toLocaleString('en-IN')}, you maintain a solid ${savingsRate}% net savings rate. Your investment portfolio stands at ₹${params.portfolio_equity.toLocaleString('en-IN')}, aligned with your ${params.risk} risk profile.`,
    healthDiagnosis: `Your liquidity buffer is robust at ${runwayMonths} months of expense runway. Your primary growth lever is optimizing discretionary subscription leakage and channeling that surplus into tax-advantaged compounding index assets.`,
    topStrengths: [
      `Consistent ${(parseFloat(savingsRate)).toFixed(0)}% positive cash flow generation month-over-month.`,
      `Liquid emergency reserve is in the upper quartile (${runwayMonths} months vs standard 3-6 month recommendation).`,
      `Clear portfolio alignment with a ${params.risk} equity/fixed income balance.`,
    ],
    keyVulnerabilities: [
      `Discretionary lifestyle spend (Food, Shopping, Entertainment) accounts for ~38% of total expenses.`,
      `Single-stock concentration risk in individual tech equities could add unnecessary short-term beta.`,
      `Inflation drag on non-yielding checking balances exceeding emergency requirements.`,
    ],
    monthlyRoadmap: [
      {
        month: 'Month 1',
        focus: 'Cash Flow Hygiene',
        action: 'Audit and cap monthly restaurant and subscription spending to ₹36,000 total.',
      },
      {
        month: 'Month 2',
        focus: 'Systematic Investment Plan',
        action: 'Increase recurring SIP into broad-market index ETFs by ₹20,000 on paycheck day.',
      },
      {
        month: 'Month 3',
        focus: 'Tax & Goal Optimization',
        action: 'Verify maximum contributions to Roth IRA / 401(k) to minimize tax liability.',
      },
    ],
    educationalNote: 'Educational insight generated by FinWise algorithmic financial intelligence. Always evaluate your personal tax and estate considerations with a certified financial planner.',
  };
};
