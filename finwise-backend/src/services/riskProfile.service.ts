import riskAllocationTable from '../data/riskAllocationTable.json';

export type RiskLevel = 'Conservative' | 'Moderate' | 'Aggressive' | 'Very Aggressive';

export interface RiskProfileResult {
  riskScore: number;
  riskLevel: RiskLevel;
  recommendedAllocation: {
    Stock: number;
    ETF: number;
    'Mutual Fund': number;
    Gold: number;
    Cash: number;
  };
}

export const calculateRiskProfile = (answers: number[]): RiskProfileResult => {
  const sum = answers.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  const normalizedScore = Math.min(100, Math.max(0, Math.round(sum)));

  let riskLevel: RiskLevel = 'Moderate';
  if (normalizedScore <= 30) {
    riskLevel = 'Conservative';
  } else if (normalizedScore <= 60) {
    riskLevel = 'Moderate';
  } else if (normalizedScore <= 80) {
    riskLevel = 'Aggressive';
  } else {
    riskLevel = 'Very Aggressive';
  }

  const recommendedAllocation = (riskAllocationTable as Record<string, any>)[riskLevel] || {
    Stock: 40,
    ETF: 30,
    'Mutual Fund': 15,
    Gold: 5,
    Cash: 10,
  };

  return {
    riskScore: normalizedScore,
    riskLevel,
    recommendedAllocation,
  };
};
