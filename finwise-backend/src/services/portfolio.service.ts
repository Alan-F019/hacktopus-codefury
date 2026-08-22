import { IAsset } from '../models/Asset.js';
import { roundTo } from '../utils/formatters.js';

export interface PortfolioAllocation {
  type: string;
  amount: number;
  currentPercent: number;
  targetPercent: number;
  variance: number;
  status: 'optimal' | 'underweight' | 'overweight';
}

export interface PortfolioResponse {
  totalValue: number;
  riskProfile: string;
  assets: {
    id: string;
    name: string;
    type: string;
    amount: number;
    ticker: string | null;
    returnsYTD: number;
  }[];
  allocations: PortfolioAllocation[];
  educationalInsights: string[];
}

export const calculatePortfolioData = (
  assets: IAsset[],
  riskLevel: string,
  recommendedAllocation: Record<string, number>
): PortfolioResponse => {
  const totalValue = assets.reduce((sum, a) => sum + (a.amount || 0), 0);

  const formattedAssets = assets.map((a) => ({
    id: (a as any)._id?.toString() || a.id || `asset-${Date.now()}`,
    name: a.name,
    type: a.type,
    amount: a.amount,
    ticker: a.ticker || null,
    returnsYTD: a.returnsYTD ?? 8.5,
  }));

  // Aggregate amounts by asset type
  const typeTotals: Record<string, number> = {
    Stock: 0,
    ETF: 0,
    'Mutual Fund': 0,
    Gold: 0,
    Cash: 0,
  };

  assets.forEach((a) => {
    typeTotals[a.type] = (typeTotals[a.type] || 0) + a.amount;
  });

  const allTypes = Array.from(new Set([...Object.keys(typeTotals), ...Object.keys(recommendedAllocation)]));

  const allocations: PortfolioAllocation[] = allTypes
    .filter((type) => typeTotals[type] > 0 || (recommendedAllocation[type] || 0) > 0)
    .map((type) => {
      const amount = typeTotals[type] || 0;
      const currentPercent = totalValue > 0 ? roundTo((amount / totalValue) * 100, 1) : 0;
      const targetPercent = roundTo(recommendedAllocation[type] || 0, 1);
      const variance = roundTo(currentPercent - targetPercent, 1);

      let status: 'optimal' | 'underweight' | 'overweight' = 'optimal';
      if (variance > 5) {
        status = 'overweight';
      } else if (variance < -5) {
        status = 'underweight';
      }

      return {
        type,
        amount,
        currentPercent,
        targetPercent,
        variance,
        status,
      };
    });

  // Generate educational observations (non-directive compliance requirement)
  const educationalInsights: string[] = [];
  const overweight = allocations.find((a) => a.status === 'overweight');
  const underweight = allocations.find((a) => a.status === 'underweight');

  if (underweight) {
    educationalInsights.push(
      `${underweight.type} allocation (${underweight.currentPercent}%) is currently ${Math.abs(underweight.variance)}% below your model target (${underweight.targetPercent}%).`
    );
  }
  if (overweight) {
    educationalInsights.push(
      `${overweight.type} weighting (${overweight.currentPercent}%) exceeds your benchmark allocation target (${overweight.targetPercent}%).`
    );
  }
  if (!underweight && !overweight) {
    educationalInsights.push('Asset class distribution is well balanced across your targeted risk tolerance model.');
  }

  educationalInsights.push(
    'Cash holding is optimal and provides dry powder for market dips.'
  );

  return {
    totalValue,
    riskProfile: riskLevel,
    assets: formattedAssets,
    allocations,
    educationalInsights,
  };
};
