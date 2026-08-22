import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ExpenseData, ExpenseItem } from '../types';
import { ExpenseUploader } from '../components/ExpenseUploader';
import { ChartCard } from '../components/ChartCard';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import {
  Receipt,
  PieChart as PieIcon,
  BarChart3,
  TrendingDown,
  Sparkles,
  Info,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  FileCheck,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

export const ExpenseAnalyzer: React.FC = () => {
  const { theme } = useTheme();
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  const fetchExpenses = async () => {
    try {
      const data = await api.getExpenses();
      setExpenseData(data);
    } catch (err) {
      console.error('Failed to load expense data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCsvUpload = async (csvContent: string) => {
    setUploading(true);
    try {
      const updated = await api.uploadExpenseCSV(csvContent);
      setExpenseData(updated);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const isDark = theme === 'dark';

  if (loading || !expenseData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter transactions
  const filteredTransactions = expenseData.recentTransactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'ALL' || tx.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 p-3 sm:p-5 lg:p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Cash Outflow & Statement Forensics
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Expense Intelligence Analyzer
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Client-side CSV parsing with automated categorization and variance detection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-xs flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{expenseData.itemCount} Transactions Analyzed</span>
            </div>
          </div>
        </div>

        {/* CSV Statement Uploader Component */}
        <ExpenseUploader onUpload={handleCsvUpload} isLoading={uploading} />

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Analyzed Outflow</span>
            <div className="my-1 text-2xl font-black text-slate-900 dark:text-white font-mono">
              {formatCurrency(expenseData.totalSpending)}
            </div>
            <span className="text-[11px] text-slate-500">Period: {expenseData.period}</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Top Spend Driver</span>
            <div className="my-1 text-2xl font-black text-amber-500 dark:text-amber-400 truncate font-mono">
              {expenseData.categories[0]?.category || 'Housing'}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {formatCurrency(expenseData.categories[0]?.amount || 0)} ({expenseData.categories[0]?.percentage || 0}%)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Discretionary Ratio</span>
            <div className="my-1 text-2xl font-black text-emerald-500 font-mono">
              {formatPercent(
                (expenseData.categories
                  .filter((c) => ['Food', 'Shopping', 'Entertainment'].includes(c.category))
                  .reduce((s, c) => s + c.amount, 0) /
                  Math.max(1, expenseData.totalSpending)) *
                  100
              )}
            </div>
            <span className="text-[11px] text-slate-500">Target: &lt; 30% of total budget</span>
          </div>
        </div>

        {/* Dynamic Computed Insights Cards */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-emerald-500/20 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Algorithmic Expense Observations
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {expenseData.dynamicInsights.map((insight, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <p className="leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Chart 1: Pie by Category */}
          <ChartCard
            title="Spending by Category"
            subtitle="Distribution of parsed statements"
            icon={PieIcon}
          >
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {expenseData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-xl border border-slate-700">
                            <p className="font-bold">{data.category}</p>
                            <p className="text-emerald-400 font-mono">
                              {formatCurrency(data.amount)} ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-[10px] text-slate-600 dark:text-slate-400">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Chart 2: Bar Chart Monthly vs Budget */}
          <ChartCard
            title="Monthly Cash Outflow"
            subtitle="Actual spend vs estimated target"
            icon={BarChart3}
          >
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData.monthlyTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
                  <XAxis dataKey="month" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} />
                  <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} tickFormatter={(v) => formatCurrency(v, true)} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-xl border border-slate-700">
                            <p className="font-bold">{d.month}</p>
                            <p className="text-emerald-400 font-mono">Spent: {formatCurrency(d.amount)}</p>
                            <p className="text-slate-400 font-mono">Budget: {formatCurrency(d.budget)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" fill="#10B981" radius={[3, 3, 0, 0]} name="Actual Spend" />
                  <Bar dataKey="budget" fill="#64748B" radius={[3, 3, 0, 0]} opacity={0.4} name="Budget Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Chart 3: Line Chart Trend */}
          <ChartCard
            title="Spending Velocity Curve"
            subtitle="Trajectory across recording window"
            icon={TrendingDown}
          >
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expenseData.monthlyTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
                  <XAxis dataKey="month" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} />
                  <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} tickFormatter={(v) => formatCurrency(v, true)} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-xl border border-slate-700">
                            <p className="font-bold">{d.month}</p>
                            <p className="text-amber-400 font-mono">{formatCurrency(d.amount)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    dot={{ fill: '#F59E0B', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

        </div>

        {/* Category Breakdown Table & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Category Breakdown Table (5 cols) */}
          <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Category Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="py-2">Category</th>
                    <th className="py-2 text-right">Amount</th>
                    <th className="py-2 text-right">% Total</th>
                    <th className="py-2 text-center">Txns</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {expenseData.categories.map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{cat.category}</span>
                      </td>
                      <td className="py-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(cat.amount)}
                      </td>
                      <td className="py-2 text-right font-mono text-slate-500 dark:text-slate-400">
                        {formatPercent(cat.percentage)}
                      </td>
                      <td className="py-2 text-center text-slate-400 text-[11px] font-mono">
                        {cat.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Parsed Transaction Explorer (7 cols) */}
          <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Parsed Statements Feed
                </h3>
                <p className="text-xs text-slate-500">Search and filter individual line items.</p>
              </div>

              {/* Search & Category Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search merchant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 pr-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  {expenseData.categories.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-y-auto max-h-80 rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredTransactions.slice(0, 25).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {item.description}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
