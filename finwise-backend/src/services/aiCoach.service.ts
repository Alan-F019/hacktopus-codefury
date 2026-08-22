import { env } from '../config/env.js';
import { roundTo } from '../utils/formatters.js';

export interface AICoachInput {
  income: number;
  expenses: number;
  savings: number;
  risk: string;
  portfolio_equity: number;
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

export const EDUCATIONAL_DISCLAIMER =
  'Educational insight only. FinWise provides algorithmic financial data simulations and does not offer regulated investment advice.';

export const generateRuleBasedAICoach = (input: AICoachInput): AICoachResponse => {
  const income = Math.max(1, input.income || 7500);
  const expenses = Math.max(1, input.expenses || 4100);
  const savings = Math.max(0, input.savings || 24000);
  const risk = input.risk || 'Aggressive';
  const portfolioEquity = Math.max(0, input.portfolio_equity || 58000);

  const monthlySavings = Math.max(0, income - expenses);
  const savingsRate = roundTo((monthlySavings / income) * 100, 1);
  const emergencyMonths = roundTo(savings / expenses, 1);

  const summary = `Your financial profile reflects disciplined savings habits with a ${savingsRate}% savings rate and $${monthlySavings.toLocaleString()} monthly surplus. Your $${savings.toLocaleString()} liquid reserves grant a healthy ${emergencyMonths}-month emergency cushion, providing resilient protection against unforeseen market shocks while ${
    risk === 'Aggressive' || risk === 'Very Aggressive' ? 'aggressively pursuing capital growth' : 'prudently compounding assets'
  }.`;

  const healthDiagnosis = emergencyMonths >= 4
    ? `Strong Liquidity & Growth Phase — Optimal runway buffer (${emergencyMonths} mo) allows higher disciplined asset allocation with low liquidity stress.`
    : `Stabilization Phase — Focus on building cash runway toward the recommended 6-month safety standard before ramping speculative exposure.`;

  const topStrengths = [
    `Robust ${savingsRate}% Net Monthly Savings Rate ($${monthlySavings.toLocaleString()}/mo surplus)`,
    `${emergencyMonths} Months of Liquid Emergency Runway ($${savings.toLocaleString()} safety buffer)`,
    `Established $${portfolioEquity.toLocaleString()} Core Investment Portfolio aligned with ${risk} profile`,
  ];

  const keyVulnerabilities = [
    `Discretionary spending variance in dining and lifestyle outflows (~${roundTo((expenses / income) * 100, 0)}% of income)`,
    `Cash allocation vs risk-adjusted model benchmark drift in volatile cycles`,
    `Opportunity to automate monthly systematic transfers for long-term compounding`,
  ];

  const monthlyRoadmap = [
    {
      month: 'Month 1',
      focus: 'Automated Deployment',
      action: 'Set up recurring auto-debit of $650/mo into low-cost broad index ETFs on paycheck arrival.',
    },
    {
      month: 'Month 2',
      focus: 'Budget Re-calibration',
      action: 'Cap discretionary dining and entertainment to divert an additional $250 toward down payment milestones.',
    },
    {
      month: 'Month 3',
      focus: 'Portfolio Rebalancing',
      action: `Review and rebalance individual asset classes to strictly adhere to your target ${risk} asset distribution.`,
    },
  ];

  return {
    summary,
    healthDiagnosis,
    topStrengths,
    keyVulnerabilities,
    monthlyRoadmap,
    educationalNote: EDUCATIONAL_DISCLAIMER,
  };
};

export const generateAICoachAdvice = async (input: AICoachInput): Promise<AICoachResponse> => {
  // 1. LLM Integration if configured
  if (env.AI_COACH_PROVIDER === 'openai' && env.AI_COACH_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.AI_COACH_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are a senior algorithmic financial health coach. Return valid JSON only with keys: summary, healthDiagnosis, topStrengths (array of 3 strings), keyVulnerabilities (array of 3 strings), monthlyRoadmap (array of 3 objects with month, focus, action). Never provide specific buy/sell stock advice.',
            },
            {
              role: 'user',
              content: JSON.stringify(input),
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const json: any = await response.json();
        const parsed = JSON.parse(json?.choices?.[0]?.message?.content || '{}');
        if (parsed.summary && parsed.topStrengths && parsed.monthlyRoadmap) {
          return {
            summary: parsed.summary,
            healthDiagnosis: parsed.healthDiagnosis || 'Balanced Financial Growth',
            topStrengths: parsed.topStrengths,
            keyVulnerabilities: parsed.keyVulnerabilities || [],
            monthlyRoadmap: parsed.monthlyRoadmap,
            educationalNote: EDUCATIONAL_DISCLAIMER,
          };
        }
      }
    } catch (err) {
      console.warn('OpenAI AI Coach call failed, falling back to rule-based engine:', err);
    }
  }

  // 2. Guaranteed Rule-Based Fallback
  return generateRuleBasedAICoach(input);
};
