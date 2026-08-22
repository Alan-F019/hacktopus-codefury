import { ITransaction } from '../models/Transaction.js';
import { CATEGORY_COLORS } from '../utils/csvParser.js';
import { roundTo } from '../utils/formatters.js';

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  amount: number;
  budget: number;
}

export interface ExpenseDataResponse {
  period: string;
  totalSpending: number;
  itemCount: number;
  categories: CategoryBreakdown[];
  monthlyTrends: MonthlyTrend[];
  recentTransactions: {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
  }[];
  dynamicInsights: string[];
}

export const calculateExpensesData = (
  transactions: ITransaction[],
  userMonthlyBudget: number = 4200
): ExpenseDataResponse => {
  if (!transactions || transactions.length === 0) {
    return {
      period: 'Current Month',
      totalSpending: 0,
      itemCount: 0,
      categories: [],
      monthlyTrends: [],
      recentTransactions: [],
      dynamicInsights: ['No expense records uploaded yet. Upload a statement CSV to unlock automated analytics.'],
    };
  }

  // Sort descending by date
  const sortedTx = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Aggregate monthly totals
  const monthlyMap: Record<string, { total: number; categories: Record<string, number> }> = {};

  sortedTx.forEach((tx) => {
    const monthKey = tx.date.substring(0, 7) || 'Current'; // YYYY-MM
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { total: 0, categories: {} };
    }
    monthlyMap[monthKey].total += tx.amount;
    monthlyMap[monthKey].categories[tx.category] = (monthlyMap[monthKey].categories[tx.category] || 0) + tx.amount;
  });

  const sortedMonthKeys = Object.keys(monthlyMap).sort();
  const currentMonthKey = sortedMonthKeys[sortedMonthKeys.length - 1];
  const previousMonthKey = sortedMonthKeys.length >= 2 ? sortedMonthKeys[sortedMonthKeys.length - 2] : null;

  // Filter transactions for the latest active month
  const currentMonthTx = sortedTx.filter((tx) => tx.date.startsWith(currentMonthKey));
  const activeTxList = currentMonthTx.length > 0 ? currentMonthTx : sortedTx;

  const totalSpending = roundTo(activeTxList.reduce((sum, tx) => sum + tx.amount, 0), 2);

  // Category breakdown for current period
  const categoryMap: Record<string, { amount: number; count: number }> = {};
  activeTxList.forEach((tx) => {
    if (!categoryMap[tx.category]) {
      categoryMap[tx.category] = { amount: 0, count: 0 };
    }
    categoryMap[tx.category].amount += tx.amount;
    categoryMap[tx.category].count += 1;
  });

  const categories: CategoryBreakdown[] = Object.entries(categoryMap)
    .map(([cat, val]) => ({
      category: cat,
      amount: roundTo(val.amount, 2),
      percentage: totalSpending > 0 ? roundTo((val.amount / totalSpending) * 100, 1) : 0,
      color: CATEGORY_COLORS[cat] || '#64748B',
      count: val.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Monthly trends (up to last 4 months)
  const recentMonthKeys = sortedMonthKeys.slice(-4);
  const monthlyTrends: MonthlyTrend[] = recentMonthKeys.map((m) => {
    let monthLabel = m;
    try {
      const [year, month] = m.split('-');
      if (year && month) {
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
        monthLabel = dateObj.toLocaleString('en-US', { month: 'short' });
      }
    } catch {
      monthLabel = m;
    }

    const amt = roundTo(monthlyMap[m].total, 2);
    return {
      month: monthLabel,
      amount: amt,
      budget: userMonthlyBudget || Math.round(amt * 1.05),
    };
  });

  // Recent transactions (last 15)
  const recentTransactions = sortedTx.slice(0, 15).map((tx) => ({
    id: (tx as any)._id?.toString() || tx.id || `tx-${Date.now()}`,
    date: tx.date,
    description: tx.description,
    amount: tx.amount,
    category: tx.category,
  }));

  // Dynamic insights
  const dynamicInsights: string[] = [];

  if (categories.length > 0) {
    const largest = categories[0];
    dynamicInsights.push(
      `${largest.category} represents ${largest.percentage}% of total monthly expenses ($${largest.amount.toLocaleString()}).`
    );
  }

  // MoM variance
  if (previousMonthKey && monthlyMap[previousMonthKey] && monthlyMap[currentMonthKey]) {
    const prevAmt = monthlyMap[previousMonthKey].total;
    const currAmt = monthlyMap[currentMonthKey].total;
    if (prevAmt > 0) {
      const diffPct = roundTo(((currAmt - prevAmt) / prevAmt) * 100, 1);
      if (diffPct > 0) {
        dynamicInsights.push(`Total outflow increased by ${diffPct}% compared to previous month.`);
      } else {
        dynamicInsights.push(`Total spending decreased by ${Math.abs(diffPct)}% compared to previous month.`);
      }
    }

    // Check individual category increase > 15%
    const prevCat = monthlyMap[previousMonthKey].categories;
    const currCat = monthlyMap[currentMonthKey].categories;
    Object.keys(currCat).forEach((c) => {
      if (prevCat[c] && prevCat[c] > 0) {
        const catDiff = roundTo(((currCat[c] - prevCat[c]) / prevCat[c]) * 100, 1);
        if (catDiff >= 15 && dynamicInsights.length < 3) {
          dynamicInsights.push(`${c} spending increased ${catDiff}% vs previous month.`);
        }
      }
    });
  }

  // Discretionary spend check (Food, Entertainment, Shopping, Travel)
  const discretionarySum = categories
    .filter((c) => ['Entertainment', 'Shopping', 'Food', 'Travel'].includes(c.category))
    .reduce((sum, c) => sum + c.amount, 0);
  const discretionaryPct = totalSpending > 0 ? roundTo((discretionarySum / totalSpending) * 100, 1) : 0;

  if (discretionaryPct > 35) {
    dynamicInsights.push(
      `Discretionary spending accounts for ${discretionaryPct}% of expenses. Keeping this below 30% accelerates safety buffer targets.`
    );
  } else {
    dynamicInsights.push(`Discretionary spending is well contained below 30% of total outflow.`);
  }

  // Period label
  let periodLabel = 'Current Month';
  if (currentMonthKey) {
    try {
      const [year, month] = currentMonthKey.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
      periodLabel = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      periodLabel = currentMonthKey;
    }
  }

  return {
    period: periodLabel,
    totalSpending,
    itemCount: activeTxList.length,
    categories,
    monthlyTrends,
    recentTransactions,
    dynamicInsights: dynamicInsights.slice(0, 4),
  };
};
