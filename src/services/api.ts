import axios from 'axios';
import {
  UserProfile,
  OnboardingPayload,
  OnboardingResponse,
  HealthScoreData,
  PortfolioData,
  Asset,
  Goal,
  ExpenseData,
  AICoachResponse,
  RiskLevel,
} from '../types';
import {
  INITIAL_MOCK_USER,
  INITIAL_MOCK_ASSETS,
  INITIAL_MOCK_GOALS,
  INITIAL_MOCK_EXPENSES,
  generatePortfolioData,
  generateAICoachAdvice,
} from './mockData';
import {
  calculateRiskScoreAndLevel,
  getTargetAllocationForRisk,
  calculateHealthScore,
  calculateRequiredMonthlySaving,
} from '../utils/financialCalculations';
import { parseExpenseCSV } from '../utils/csvParser';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'; // default true for standalone hackathon demo

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Attach Authorization token if available in storage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('finwise_auth_token') || 'demo-sandbox-token';
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Local reactive storage for seamless standalone frontend demoing
class LocalStore {
  user: UserProfile;
  assets: Asset[];
  goals: Goal[];
  expenses: ExpenseData;

  constructor() {
    const savedUser = localStorage.getItem('finwise_demo_user');
    this.user = savedUser ? JSON.parse(savedUser) : { ...INITIAL_MOCK_USER };

    const savedAssets = localStorage.getItem('finwise_demo_assets');
    this.assets = savedAssets ? JSON.parse(savedAssets) : [...INITIAL_MOCK_ASSETS];

    const savedGoals = localStorage.getItem('finwise_demo_goals');
    this.goals = savedGoals ? JSON.parse(savedGoals) : [...INITIAL_MOCK_GOALS];

    const savedExpenses = localStorage.getItem('finwise_demo_expenses');
    this.expenses = savedExpenses ? JSON.parse(savedExpenses) : { ...INITIAL_MOCK_EXPENSES };
  }

  save() {
    localStorage.setItem('finwise_demo_user', JSON.stringify(this.user));
    localStorage.setItem('finwise_demo_assets', JSON.stringify(this.assets));
    localStorage.setItem('finwise_demo_goals', JSON.stringify(this.goals));
    localStorage.setItem('finwise_demo_expenses', JSON.stringify(this.expenses));
  }

  reset() {
    this.user = { ...INITIAL_MOCK_USER };
    this.assets = [...INITIAL_MOCK_ASSETS];
    this.goals = [...INITIAL_MOCK_GOALS];
    this.expenses = { ...INITIAL_MOCK_EXPENSES };
    this.save();
  }
}

export const localStore = new LocalStore();

/**
 * Single API Service Layer matching backend contract 1:1
 */
export const api = {
  // 1. User & Onboarding
  getUserProfile: async (): Promise<UserProfile> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 120));
      return { ...localStore.user };
    }
    const res = await apiClient.get<UserProfile>('/user/profile');
    return res.data;
  },

  submitOnboarding: async (payload: OnboardingPayload): Promise<OnboardingResponse> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      const { score, level } = calculateRiskScoreAndLevel(payload.answers);
      const recommendedAllocation = getTargetAllocationForRisk(level);

      localStore.user = {
        ...localStore.user,
        name: payload.name,
        age: payload.age,
        monthlyIncome: payload.monthlyIncome,
        monthlyExpenses: payload.monthlyExpenses,
        existingSavings: payload.existingSavings,
        investmentAmount: payload.investmentAmount,
        financialGoal: payload.financialGoal,
        riskScore: score,
        riskLevel: level,
        isOnboarded: true,
      };
      localStore.save();

      const health = calculateHealthScore({
        monthlyIncome: payload.monthlyIncome,
        monthlyExpenses: payload.monthlyExpenses,
        existingSavings: payload.existingSavings,
        investmentAmount: payload.investmentAmount,
      });

      return {
        riskScore: score,
        riskLevel: level,
        recommendedAllocation,
        initialHealthScore: health.overallScore,
        message: 'Onboarding completed successfully. Risk profile computed.',
      };
    }
    const res = await apiClient.post<OnboardingResponse>('/onboarding', payload);
    return res.data;
  },

  // 2. Health Score Endpoint
  getHealthScore: async (): Promise<HealthScoreData> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 100));
      const totalGoalProgress =
        localStore.goals.length > 0
          ? localStore.goals.reduce((sum, g) => sum + g.currentAmount / Math.max(1, g.targetAmount), 0) /
            localStore.goals.length
          : 0.7;

      const health = calculateHealthScore({
        monthlyIncome: localStore.user.monthlyIncome,
        monthlyExpenses: localStore.user.monthlyExpenses,
        existingSavings: localStore.user.existingSavings,
        investmentAmount: localStore.assets.reduce((sum, a) => sum + a.amount, 0),
        goalsCount: localStore.goals.length,
        goalsAchievedRate: totalGoalProgress,
      });

      return {
        ...health,
        lastCalculated: new Date().toISOString(),
      };
    }
    const res = await apiClient.get<HealthScoreData>('/health-score');
    return res.data;
  },

  // 3. Portfolio Endpoints
  getPortfolio: async (): Promise<PortfolioData> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 100));
      return generatePortfolioData(localStore.assets, localStore.user.riskLevel || 'Moderate');
    }
    const res = await apiClient.get<PortfolioData>('/portfolio');
    return res.data;
  },

  addAsset: async (asset: Omit<Asset, 'id'>): Promise<Asset> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 150));
      const newAsset: Asset = {
        ...asset,
        id: `ast-${Date.now()}`,
        returnsYTD: Number((Math.random() * 14 + 2).toFixed(1)),
      };
      localStore.assets.unshift(newAsset);
      localStore.save();
      return newAsset;
    }
    const res = await apiClient.post<Asset>('/portfolio/asset', asset);
    return res.data;
  },

  deleteAsset: async (assetId: string): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 100));
      localStore.assets = localStore.assets.filter((a) => a.id !== assetId);
      localStore.save();
      return { success: true };
    }
    const res = await apiClient.delete<{ success: boolean }>(`/portfolio/asset/${assetId}`);
    return res.data;
  },

  // 4. Expenses & CSV Endpoint
  getExpenses: async (): Promise<ExpenseData> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 100));
      return { ...localStore.expenses };
    }
    const res = await apiClient.get<ExpenseData>('/expenses');
    return res.data;
  },

  uploadExpenseCSV: async (csvText: string): Promise<ExpenseData> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 250));
      const parsedData = parseExpenseCSV(csvText);
      localStore.expenses = parsedData;
      // Also adjust user monthly expenses estimate
      if (parsedData.totalSpending > 0) {
        localStore.user.monthlyExpenses = Math.round(parsedData.totalSpending / Math.max(1, parsedData.monthlyTrends.length || 1));
      }
      localStore.save();
      return parsedData;
    }

    // For real backend upload:
    const formData = new FormData();
    const blob = new Blob([csvText], { type: 'text/csv' });
    formData.append('file', blob, 'expenses.csv');
    const res = await apiClient.post<ExpenseData>('/expenses/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // 5. Goals Endpoints
  getGoals: async (): Promise<Goal[]> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 100));
      return [...localStore.goals];
    }
    const res = await apiClient.get<Goal[]>('/goals');
    return res.data;
  },

  createGoal: async (goalData: {
    name: string;
    category: Goal['category'];
    targetAmount: number;
    currentAmount: number;
    timeHorizonYears: number;
    expectedAnnualReturn?: number;
  }): Promise<Goal> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 150));
      const returnRate = goalData.expectedAnnualReturn || 7.5;
      const targetYear = new Date().getFullYear() + goalData.timeHorizonYears;
      const targetDate = `${targetYear}-12-31`;

      const monthlyRequired = calculateRequiredMonthlySaving(
        goalData.targetAmount,
        goalData.currentAmount,
        goalData.timeHorizonYears,
        0
      );

      const sipRequired = calculateRequiredMonthlySaving(
        goalData.targetAmount,
        goalData.currentAmount,
        goalData.timeHorizonYears,
        returnRate
      );

      const progress = Number(((goalData.currentAmount / Math.max(1, goalData.targetAmount)) * 100).toFixed(1));

      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        name: goalData.name,
        category: goalData.category,
        targetAmount: goalData.targetAmount,
        currentAmount: goalData.currentAmount,
        timeHorizonYears: goalData.timeHorizonYears,
        targetDate,
        requiredMonthlySavings: monthlyRequired,
        sipMonthlyRequired: sipRequired,
        progressPercent: progress,
        expectedAnnualReturn: returnRate,
      };

      localStore.goals.push(newGoal);
      localStore.save();
      return newGoal;
    }
    const res = await apiClient.post<Goal>('/goals', goalData);
    return res.data;
  },

  updateGoalDeposit: async (goalId: string, addedAmount: number): Promise<Goal> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 100));
      const goal = localStore.goals.find((g) => g.id === goalId);
      if (!goal) throw new Error('Goal not found');

      goal.currentAmount += addedAmount;
      goal.progressPercent = Number(((goal.currentAmount / goal.targetAmount) * 100).toFixed(1));
      localStore.save();
      return { ...goal };
    }
    const res = await apiClient.patch<Goal>(`/goals/${goalId}/deposit`, { amount: addedAmount });
    return res.data;
  },

  deleteGoal: async (goalId: string): Promise<{ success: boolean }> => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 100));
      localStore.goals = localStore.goals.filter((g) => g.id !== goalId);
      localStore.save();
      return { success: true };
    }
    const res = await apiClient.delete<{ success: boolean }>(`/goals/${goalId}`);
    return res.data;
  },

  // 6. AI Coach Endpoint
  getAICoachAdvice: async (params?: {
    income?: number;
    expenses?: number;
    savings?: number;
    risk?: RiskLevel;
    portfolio_equity?: number;
  }): Promise<AICoachResponse> => {
    const payload = {
      income: params?.income ?? localStore.user.monthlyIncome,
      expenses: params?.expenses ?? localStore.user.monthlyExpenses,
      savings: params?.savings ?? localStore.user.existingSavings,
      risk: params?.risk ?? localStore.user.riskLevel ?? 'Moderate',
      portfolio_equity:
        params?.portfolio_equity ?? localStore.assets.reduce((sum, a) => sum + a.amount, 0),
    };

    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 350));
      return generateAICoachAdvice(payload);
    }
    const res = await apiClient.post<AICoachResponse>('/ai-coach', payload);
    return res.data;
  },
};
