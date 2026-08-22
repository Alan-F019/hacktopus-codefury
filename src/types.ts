export type RiskLevel = 'Conservative' | 'Moderate' | 'Aggressive' | 'Very Aggressive';

export type AssetType = 'Stock' | 'ETF' | 'Mutual Fund' | 'Gold' | 'Cash' | 'Crypto' | 'Real Estate';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  age?: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingSavings: number;
  investmentAmount: number;
  financialGoal: string;
  riskScore: number;
  riskLevel: RiskLevel;
  isOnboarded: boolean;
  photoURL?: string;
}

export interface RiskQuestion {
  id: number;
  question: string;
  options: {
    label: string;
    text: string;
    score: number;
  }[];
}

export interface OnboardingPayload {
  name: string;
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingSavings: number;
  investmentAmount: number;
  financialGoal: string;
  answers: number[]; // question scores
}

export interface OnboardingResponse {
  riskScore: number;
  riskLevel: RiskLevel;
  recommendedAllocation: Record<string, number>;
  initialHealthScore: number;
  message: string;
}

export interface SubScores {
  emergencyFund: number; // 0-100
  spendingControl: number; // 0-100
  investmentsRate: number; // 0-100
  goalProgress: number; // 0-100
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  category: 'Spending' | 'Savings' | 'Investment' | 'Debt' | 'Goal';
  priority: 'High' | 'Medium' | 'Low';
  impact: string; // e.g. "+5 Health Pts", "Saves ₹19,000/mo"
  completed?: boolean;
}

export interface HealthScoreData {
  overallScore: number; // 0-100
  status: 'Critical' | 'Fair' | 'Good' | 'Excellent';
  subScores: SubScores;
  metrics: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    savingsRate: number; // percentage e.g. 28%
    totalInvestments: number;
    emergencyFundMonths: number;
    debtToIncomeRatio?: number;
  };
  actionPlan: ActionPlanItem[];
  lastCalculated: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  amount: number;
  allocationPercent?: number;
  purchaseDate?: string;
  ticker?: string;
  returnsYTD?: number;
}

export interface PortfolioAllocation {
  type: AssetType;
  amount: number;
  currentPercent: number;
  targetPercent: number;
  status: 'optimal' | 'underweight' | 'overweight';
  difference: number;
}

export interface PortfolioData {
  totalValue: number;
  assets: Asset[];
  allocations: PortfolioAllocation[];
  riskProfile: RiskLevel;
  educationalInsights: string[];
}

export interface ExpenseItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface MonthlyExpenseTrend {
  month: string;
  amount: number;
  budget: number;
}

export interface ExpenseData {
  totalSpending: number;
  itemCount: number;
  period: string;
  categories: CategoryBreakdown[];
  monthlyTrends: MonthlyExpenseTrend[];
  dynamicInsights: string[];
  recentTransactions: ExpenseItem[];
}

export interface Goal {
  id: string;
  name: string;
  category: 'Emergency' | 'Retirement' | 'House' | 'Vehicle' | 'Travel' | 'Education' | 'Other';
  targetAmount: number;
  currentAmount: number;
  timeHorizonYears: number;
  targetDate: string;
  requiredMonthlySavings: number;
  progressPercent: number;
  expectedAnnualReturn: number;
  sipMonthlyRequired: number;
}

export interface AICoachResponse {
  summary: string;
  healthDiagnosis: string;
  topStrengths: string[];
  keyVulnerabilities: string[];
  monthlyRoadmap: {
    month: string;
    focus: string;
    action: string;
  }[];
  educationalNote: string;
}
