import { RiskLevel, RiskQuestion, SubScores, ActionPlanItem } from '../types';

export const RISK_QUESTIONS: RiskQuestion[] = [
  {
    id: 1,
    question: 'If your investment portfolio drops 15% in a single month due to market volatility, what is your immediate reaction?',
    options: [
      { label: 'A', text: 'Panic and sell everything immediately to prevent further loss.', score: 0 },
      { label: 'B', text: 'Sell a portion to move into safer cash/fixed deposits.', score: 8 },
      { label: 'C', text: 'Do nothing, wait it out and let the market recover.', score: 16 },
      { label: 'D', text: 'See it as a discount sale and invest more capital.', score: 20 },
    ],
  },
  {
    id: 2,
    question: 'What is your primary investment time horizon for major accumulated wealth?',
    options: [
      { label: 'A', text: 'Less than 1 year (Need fast liquid access)', score: 0 },
      { label: 'B', text: '1 to 3 years (Medium-short term goals)', score: 5 },
      { label: 'C', text: '3 to 7 years (Medium-long term growth)', score: 12 },
      { label: 'D', text: '7+ years / Decades (Long-term compounding)', score: 18 },
    ],
  },
  {
    id: 3,
    question: 'How would you describe your financial knowledge and market experience?',
    options: [
      { label: 'A', text: 'Novice / Beginner (I keep money mostly in bank accounts)', score: 0 },
      { label: 'B', text: 'Basic (I know mutual funds, gold, and simple ETFs)', score: 5 },
      { label: 'C', text: 'Competent (I understand stocks, diversification, and market cycles)', score: 12 },
      { label: 'D', text: 'Advanced (I actively manage equities, derivatives, and macro trends)', score: 16 },
    ],
  },
  {
    id: 4,
    question: 'What balance of risk vs return aligns best with your mindset?',
    options: [
      { label: 'A', text: 'Capital preservation: Minimum risk, modest returns (3-5% p.a.)', score: 0 },
      { label: 'B', text: 'Cautious growth: Low-to-moderate risk, beating inflation (6-8% p.a.)', score: 6 },
      { label: 'C', text: 'Balanced wealth creation: Moderate risk, solid growth (9-12% p.a.)', score: 12 },
      { label: 'D', text: 'Aggressive maximization: High risk for maximum compound growth (14%+ p.a.)', score: 16 },
    ],
  },
  {
    id: 5,
    question: 'How secure and predictable is your primary monthly income source?',
    options: [
      { label: 'A', text: 'Unpredictable / Freelance with significant monthly swings', score: 0 },
      { label: 'B', text: 'Moderate stability with occasional variable income', score: 5 },
      { label: 'C', text: 'Stable salaried employment with standard growth', score: 10 },
      { label: 'D', text: 'Highly secure, dual-income household or recession-resilient career', score: 15 },
    ],
  },
  {
    id: 6,
    question: 'How many months of basic living expenses do you currently hold in liquid cash/emergency funds?',
    options: [
      { label: 'A', text: 'Zero or less than 1 month', score: 0 },
      { label: 'B', text: '1 to 3 months of emergency cushion', score: 5 },
      { label: 'C', text: '3 to 6 months fully funded emergency reserve', score: 10 },
      { label: 'D', text: '6+ months in high-yield liquid safety accounts', score: 15 },
    ],
  },
];

export const calculateRiskScoreAndLevel = (answers: number[]): { score: number; level: RiskLevel } => {
  const totalScore = answers.reduce((sum, current) => sum + (current || 0), 0);
  const normalizedScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  let level: RiskLevel = 'Moderate';
  if (normalizedScore < 25) {
    level = 'Conservative';
  } else if (normalizedScore < 55) {
    level = 'Moderate';
  } else if (normalizedScore < 80) {
    level = 'Aggressive';
  } else {
    level = 'Very Aggressive';
  }

  return { score: normalizedScore, level };
};

export const getTargetAllocationForRisk = (riskLevel: RiskLevel): Record<string, number> => {
  switch (riskLevel) {
    case 'Conservative':
      return {
        Cash: 25,
        Gold: 15,
        'Mutual Fund': 35,
        ETF: 15,
        Stock: 10,
      };
    case 'Moderate':
      return {
        Cash: 15,
        Gold: 10,
        'Mutual Fund': 35,
        ETF: 25,
        Stock: 15,
      };
    case 'Aggressive':
      return {
        Cash: 10,
        Gold: 5,
        'Mutual Fund': 25,
        ETF: 35,
        Stock: 25,
      };
    case 'Very Aggressive':
      return {
        Cash: 5,
        Gold: 5,
        'Mutual Fund': 15,
        ETF: 35,
        Stock: 40,
      };
    default:
      return {
        Cash: 15,
        Gold: 10,
        'Mutual Fund': 35,
        ETF: 25,
        Stock: 15,
      };
  }
};

export const calculateHealthScore = (params: {
  monthlyIncome: number;
  monthlyExpenses: number;
  existingSavings: number;
  investmentAmount: number;
  goalsCount?: number;
  goalsAchievedRate?: number;
}): {
  overallScore: number;
  status: 'Critical' | 'Fair' | 'Good' | 'Excellent';
  subScores: SubScores;
  metrics: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    savingsRate: number;
    totalInvestments: number;
    emergencyFundMonths: number;
  };
  actionPlan: ActionPlanItem[];
} => {
  const { monthlyIncome = 6500, monthlyExpenses = 3800, existingSavings = 18000, investmentAmount = 45000 } = params;

  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  const emergencyFundMonths = monthlyExpenses > 0 ? Number((existingSavings / monthlyExpenses).toFixed(1)) : 0;

  // 1. Emergency Fund Sub-Score (Target: 6 months = 100 pts)
  const emergencyFundScore = Math.min(100, Math.round((emergencyFundMonths / 6) * 100));

  // 2. Spending Control Sub-Score (Target: Expenses <= 50% of income = 100, if 80% = 50, if 100%+ = 20)
  const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 100;
  let spendingControlScore = 50;
  if (expenseRatio <= 40) spendingControlScore = 100;
  else if (expenseRatio <= 50) spendingControlScore = 90;
  else if (expenseRatio <= 65) spendingControlScore = 75;
  else if (expenseRatio <= 80) spendingControlScore = 55;
  else if (expenseRatio <= 95) spendingControlScore = 35;
  else spendingControlScore = 15;

  // 3. Investments Sub-Score (Target: Total investments >= 12x monthly income or high monthly rate)
  const investmentRatio = monthlyIncome > 0 ? investmentAmount / (monthlyIncome * 12) : 0;
  const investmentScore = Math.min(100, Math.round(investmentRatio * 60 + Math.min(40, savingsRate)));

  // 4. Goal Progress Sub-Score
  const goalProgressScore = Math.min(100, Math.max(30, Math.round((params.goalsAchievedRate || 0.65) * 100)));

  // Overall Weighted Score: Emergency (30%), Spending (25%), Investments (25%), Goals (20%)
  const overallScore = Math.min(
    100,
    Math.max(
      10,
      Math.round(
        emergencyFundScore * 0.3 +
          spendingControlScore * 0.25 +
          investmentScore * 0.25 +
          goalProgressScore * 0.2
      )
    )
  );

  let status: 'Critical' | 'Fair' | 'Good' | 'Excellent' = 'Good';
  if (overallScore >= 80) status = 'Excellent';
  else if (overallScore >= 65) status = 'Good';
  else if (overallScore >= 45) status = 'Fair';
  else status = 'Critical';

  // Dynamic Action Plan based on weakest metrics
  const actionPlan: ActionPlanItem[] = [];

  if (emergencyFundMonths < 6) {
    actionPlan.push({
      id: 'act-1',
      title: 'Top Up Emergency Buffer',
      description: `Current cushion is ${emergencyFundMonths} months. Allocate $350/month to high-yield cash until you reach a 6-month ($${(monthlyExpenses * 6).toLocaleString()}) safety net.`,
      category: 'Savings',
      priority: emergencyFundMonths < 3 ? 'High' : 'Medium',
      impact: '+8 Health Pts',
      completed: false,
    });
  }

  if (expenseRatio > 55) {
    actionPlan.push({
      id: 'act-2',
      title: 'Trim Discretionary Subscriptions & Dining',
      description: `Expenses are ${expenseRatio.toFixed(0)}% of income. Reducing non-essential dining/subscriptions by 15% will free up ~$${Math.round(monthlyExpenses * 0.15)} monthly.`,
      category: 'Spending',
      priority: 'High',
      impact: 'Saves $270/mo',
      completed: false,
    });
  }

  if (savingsRate >= 20) {
    actionPlan.push({
      id: 'act-3',
      title: 'Automate SIP & Index Dollar-Cost Averaging',
      description: `Your ${savingsRate.toFixed(0)}% savings rate is healthy. Set up auto-debit on the 1st of each month into broad-market index ETFs.`,
      category: 'Investment',
      priority: 'Medium',
      impact: '+$42k in 5 Yrs',
      completed: true,
    });
  } else {
    actionPlan.push({
      id: 'act-3-alt',
      title: 'Increase Monthly Investment Contribution by 5%',
      description: 'Bump automatic monthly SIP by just $150 to accelerate compounding towards your retirement baseline.',
      category: 'Investment',
      priority: 'High',
      impact: '+6 Health Pts',
      completed: false,
    });
  }

  actionPlan.push({
    id: 'act-4',
    title: 'Review Asset Allocation Drift',
    description: 'Quarterly check: Rebalance any equity assets that deviated more than 5% from your target risk profile.',
    category: 'Goal',
    priority: 'Low',
    impact: 'Reduces Risk',
    completed: false,
  });

  return {
    overallScore,
    status,
    subScores: {
      emergencyFund: emergencyFundScore,
      spendingControl: spendingControlScore,
      investmentsRate: investmentScore,
      goalProgress: goalProgressScore,
    },
    metrics: {
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate: Number(savingsRate.toFixed(1)),
      totalInvestments: investmentAmount,
      emergencyFundMonths,
    },
    actionPlan,
  };
};

/**
 * Calculates Required Monthly Savings to reach a Target Amount in N Years
 * with compound interest: FV = P * (((1+r)^n - 1) / r) * (1+r) + PV * (1+r)^n
 */
export const calculateSipProjection = (params: {
  monthlyInvestment: number;
  expectedAnnualReturn: number; // e.g. 10 for 10%
  tenureYears: number;
  initialInvestment?: number;
}) => {
  const { monthlyInvestment, expectedAnnualReturn, tenureYears, initialInvestment = 0 } = params;
  const monthlyRate = expectedAnnualReturn / 100 / 12;
  const totalMonths = tenureYears * 12;

  const data: { year: number; invested: number; totalValue: number; returns: number }[] = [];

  let currentInvested = initialInvestment;
  let currentTotalValue = initialInvestment;

  for (let year = 1; year <= tenureYears; year++) {
    for (let month = 1; month <= 12; month++) {
      currentInvested += monthlyInvestment;
      currentTotalValue = (currentTotalValue + monthlyInvestment) * (1 + monthlyRate);
    }
    data.push({
      year,
      invested: Math.round(currentInvested),
      totalValue: Math.round(currentTotalValue),
      returns: Math.round(currentTotalValue - currentInvested),
    });
  }

  const finalInvested = initialInvestment + monthlyInvestment * totalMonths;
  const finalValue = Math.round(currentTotalValue);
  const totalGains = Math.round(finalValue - finalInvested);

  return {
    finalInvested,
    finalValue,
    totalGains,
    yearlyBreakdown: data,
  };
};

/**
 * Calculates monthly savings required to hit a goal target given PV, FV, years, and return rate
 */
export const calculateRequiredMonthlySaving = (
  targetAmount: number,
  currentSavings: number,
  timeHorizonYears: number,
  expectedAnnualReturn: number = 8
): number => {
  if (timeHorizonYears <= 0) return 0;
  const totalMonths = timeHorizonYears * 12;
  const remainingTarget = targetAmount - currentSavings * Math.pow(1 + expectedAnnualReturn / 100, timeHorizonYears);

  if (remainingTarget <= 0) return 0;

  const monthlyRate = expectedAnnualReturn / 100 / 12;
  if (monthlyRate === 0) {
    return Math.round(remainingTarget / totalMonths);
  }

  // Monthly annuity formula
  const factor = (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
  const monthlyRequired = remainingTarget / factor;

  return Math.max(10, Math.round(monthlyRequired));
};
