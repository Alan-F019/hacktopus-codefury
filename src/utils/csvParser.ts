import Papa from 'papaparse';
import { ExpenseItem, CategoryBreakdown, MonthlyExpenseTrend, ExpenseData } from '../types';

export const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#10B981', // Emerald
  Food: '#F59E0B', // Amber
  Groceries: '#84CC16', // Lime
  Transportation: '#3B82F6', // Blue
  Utilities: '#06B6D4', // Cyan
  Entertainment: '#EC4899', // Pink
  Shopping: '#8B5CF6', // Purple
  Health: '#EF4444', // Red
  Education: '#14B8A6', // Teal
  Travel: '#F97316', // Orange
  Other: '#64748B', // Slate
};

export const DEFAULT_SAMPLE_CSV = `Date,Description,Amount,Category
2026-08-01,Apartment Rent,1450.00,Housing
2026-08-02,Whole Foods Groceries,142.50,Food
2026-08-03,Metro Transit Pass,85.00,Transportation
2026-08-04,Electric & Gas Utility,110.20,Utilities
2026-08-05,Trader Joe's Supermarket,94.30,Food
2026-08-07,Netflix & Spotify Subscriptions,34.98,Entertainment
2026-08-08,Downtown Sushi Dinner,78.50,Food
2026-08-10,Amazon Tech Gadgets,129.99,Shopping
2026-08-12,Pharmacy & Vitamins,45.00,Health
2026-08-14,Gym Membership,65.00,Health
2026-08-15,Uber Rides,48.20,Transportation
2026-08-17,Dinner with Colleagues,92.00,Food
2026-08-19,Home Internet Fiber,70.00,Utilities
2026-08-20,Clothing Store,145.00,Shopping
2026-08-22,Gasoline Refuel,55.00,Transportation
2026-08-24,Online Course Certification,120.00,Education
2026-08-26,Weekend Coffee & Bakery,32.40,Food
2026-08-28,Concert Tickets,110.00,Entertainment
2026-08-29,Mobile Phone Bill,60.00,Utilities
2026-08-30,Organic Farmers Market,88.40,Food
2026-07-01,Apartment Rent,1450.00,Housing
2026-07-03,Supermarket Essentials,135.00,Food
2026-07-06,Electric & Water,125.00,Utilities
2026-07-09,Italian Bistro,85.00,Food
2026-07-12,Metro Card Reload,85.00,Transportation
2026-07-15,Streaming Services,34.98,Entertainment
2026-07-18,Weekend Getaway Train,140.00,Travel
2026-07-22,Department Store,85.50,Shopping
2026-07-25,Health Clinic Co-pay,35.00,Health
2026-07-29,Dining Out,62.00,Food
2026-06-01,Apartment Rent,1450.00,Housing
2026-06-04,Groceries Bulk,160.00,Food
2026-06-10,Utilities Energy,95.00,Utilities
2026-06-15,Transit Pass,85.00,Transportation
2026-06-20,Dinner & Drinks,70.00,Food
2026-06-25,Cinema & Snacks,42.00,Entertainment
2026-06-28,New Shoes,90.00,Shopping`;

export const parseExpenseCSV = (csvText: string): ExpenseData => {
  const parsed = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  const transactions: ExpenseItem[] = [];
  const categoryTotals: Record<string, { amount: number; count: number }> = {};
  const monthlyTotals: Record<string, number> = {};

  let totalSpending = 0;

  parsed.data.forEach((row, idx) => {
    // Flexible header mapping (handles case-insensitive columns)
    const dateKey = Object.keys(row).find((k) => /date/i.test(k)) || 'Date';
    const descKey = Object.keys(row).find((k) => /desc|merchant|item|title|name/i.test(k)) || 'Description';
    const amountKey = Object.keys(row).find((k) => /amount|price|cost|val/i.test(k)) || 'Amount';
    const catKey = Object.keys(row).find((k) => /cat|type/i.test(k)) || 'Category';

    const rawAmount = row[amountKey]?.replace(/[^0-9.-]+/g, '');
    const amount = Math.abs(parseFloat(rawAmount) || 0);
    const date = row[dateKey] || new Date().toISOString().split('T')[0];
    const description = row[descKey] || 'Uncategorized Expense';
    let category = row[catKey]?.trim() || 'Other';

    // Normalize category capitalizations
    category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    if (category === 'Dining' || category === 'Groceries' || category === 'Restaurants') category = 'Food';

    if (amount > 0) {
      totalSpending += amount;
      transactions.push({
        id: `tx-${idx}-${Date.now()}`,
        date,
        description,
        amount,
        category,
      });

      // Category aggregation
      if (!categoryTotals[category]) {
        categoryTotals[category] = { amount: 0, count: 0 };
      }
      categoryTotals[category].amount += amount;
      categoryTotals[category].count += 1;

      // Month aggregation (YYYY-MM or short month)
      const monthKey = date.substring(0, 7) || 'Current';
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + amount;
    }
  });

  // Calculate Category Breakdowns
  const categories: CategoryBreakdown[] = Object.entries(categoryTotals)
    .map(([cat, data]) => ({
      category: cat,
      amount: Number(data.amount.toFixed(2)),
      count: data.count,
      percentage: totalSpending > 0 ? Number(((data.amount / totalSpending) * 100).toFixed(1)) : 0,
      color: CATEGORY_COLORS[cat] || '#64748B',
    }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate Monthly Trends sorted chronologically
  const sortedMonths = Object.keys(monthlyTotals).sort();
  const monthlyTrends: MonthlyExpenseTrend[] = sortedMonths.map((m) => {
    let monthLabel = m;
    try {
      const [year, month] = m.split('-');
      if (year && month) {
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
        monthLabel = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      }
    } catch {
      monthLabel = m;
    }
    const val = Number(monthlyTotals[m].toFixed(2));
    return {
      month: monthLabel,
      amount: val,
      budget: Math.round(val * 0.95), // Estimated target baseline
    };
  });

  // Dynamic Insights Generator (strictly calculated from parsed data)
  const insights: string[] = [];

  if (categories.length > 0) {
    const topCat = categories[0];
    insights.push(
      `Your largest expense category is ${topCat.category}, accounting for ₹${topCat.amount.toLocaleString('en-IN')} (${topCat.percentage}% of total spend).`
    );
  }

  // Month-over-Month calculation
  if (sortedMonths.length >= 2) {
    const lastMonthKey = sortedMonths[sortedMonths.length - 1];
    const prevMonthKey = sortedMonths[sortedMonths.length - 2];
    const lastAmount = monthlyTotals[lastMonthKey];
    const prevAmount = monthlyTotals[prevMonthKey];

    if (prevAmount > 0) {
      const diffPercent = ((lastAmount - prevAmount) / prevAmount) * 100;
      if (diffPercent > 0) {
        insights.push(
          `Overall spending increased by ${diffPercent.toFixed(1)}% in the latest period compared to the previous month.`
        );
      } else {
        insights.push(
          `Great job! Your spending decreased by ${Math.abs(diffPercent).toFixed(1)}% in the latest period compared to the previous month.`
        );
      }
    }
  }

  // Find category with highest transaction count
  const highestFreqCat = [...categories].sort((a, b) => b.count - a.count)[0];
  if (highestFreqCat && highestFreqCat.category !== categories[0]?.category) {
    insights.push(
      `${highestFreqCat.category} is your highest frequency expense category with ${highestFreqCat.count} recorded transactions.`
    );
  }

  // Discretionary check (Entertainment + Shopping + Food)
  const discretionarySum = categories
    .filter((c) => ['Entertainment', 'Shopping', 'Food', 'Travel'].includes(c.category))
    .reduce((s, c) => s + c.amount, 0);
  const discretionaryPct = totalSpending > 0 ? (discretionarySum / totalSpending) * 100 : 0;

  if (discretionaryPct > 40) {
    insights.push(
      `Discretionary spending (Food, Shopping, Entertainment) constitutes ${discretionaryPct.toFixed(1)}% of your expenses. Target keeping this below 30% for higher savings velocity.`
    );
  } else {
    insights.push(
      `Healthy discipline: Discretionary expenses represent ${discretionaryPct.toFixed(1)}% of total cash outflows, well within safe budgeting thresholds.`
    );
  }

  return {
    totalSpending: Number(totalSpending.toFixed(2)),
    itemCount: transactions.length,
    period: sortedMonths.length > 0 ? `${sortedMonths[0]} to ${sortedMonths[sortedMonths.length - 1]}` : 'Current Month',
    categories,
    monthlyTrends,
    dynamicInsights: insights,
    recentTransactions: transactions.slice(0, 30),
  };
};
