import { Navigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PortfolioData, Asset, AssetType } from '../types';
import { AllocationComparison } from '../components/AllocationComparison';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  PieChart as PieIcon,
  Plus,
  Trash2,
  TrendingUp,
  ShieldCheck,
  IndianRupee,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const ASSET_TYPE_COLORS: Record<string, string> = {
  ETF: '#10B981', // Emerald
  Stock: '#3B82F6', // Blue
  'Mutual Fund': '#8B5CF6', // Purple
  Gold: '#D4AF37', // Gold
  Cash: '#06B6D4', // Cyan
  Crypto: '#F59E0B', // Amber
  'Real Estate': '#EC4899', // Pink
};

export const Portfolio: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  // Asset Entry Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState<{
    name: string;
    type: AssetType;
    amount: number;
    ticker: string;
  }>({
    name: '',
    type: 'ETF',
    amount: 1000,
    ticker: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPortfolio = async () => {
    try {
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name.trim() || newAsset.amount <= 0) return;
    setIsSubmitting(true);
    try {
      await api.addAsset({
        name: newAsset.name,
        type: newAsset.type,
        amount: Number(newAsset.amount),
        ticker: newAsset.ticker.toUpperCase() || undefined,
      });
      setShowAddModal(false);
      setNewAsset({ name: '', type: 'ETF', amount: 1000, ticker: '' });
      await fetchPortfolio();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await api.deleteAsset(id);
      await fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !portfolio) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Chart data preparation
  const chartData = portfolio.allocations
    .filter((a) => a.amount > 0)
    .map((a) => ({
      name: a.type,
      value: a.amount,
      color: ASSET_TYPE_COLORS[a.type] || '#64748B',
      percentage: a.currentPercent,
    }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 p-3 sm:p-5 lg:p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Wealth Allocation & Risk Alignment
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Investment Portfolio Analyzer
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compare your asset class distribution against your target{' '}
              <strong className="text-emerald-500 font-mono">{user?.riskLevel || 'Moderate'}</strong> benchmark.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              id="add-asset-btn"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Holding</span>
            </button>
          </div>
        </div>

        {/* Top Valuation Metric Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Portfolio Value</span>
            <div className="my-1 text-2xl font-black text-slate-900 dark:text-white font-mono">
              {formatCurrency(portfolio.totalValue)}
            </div>
            <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Tracked across {portfolio.assets.length} assets
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Risk Profile</span>
            <div className="my-1 text-2xl font-black text-emerald-500 dark:text-emerald-400 font-mono">
              {user?.riskLevel || 'Aggressive'}
            </div>
            <span className="text-[11px] text-slate-500">
              Model asset tolerance: {user?.riskScore || 68}/100
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Model Drift Status</span>
            <div className="my-1 text-2xl font-black text-slate-900 dark:text-white font-mono">
              {portfolio.allocations.filter((a) => a.status !== 'optimal').length === 0
                ? 'Balanced 🟢'
                : `${portfolio.allocations.filter((a) => a.status !== 'optimal').length} Drifting`}
            </div>
            <span className="text-[11px] text-slate-500">
              Quarterly rebalancing recommended
            </span>
          </div>
        </div>

        {/* Donut Chart & Allocation Breakdown Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Donut Chart Column */}
          <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-500">
                  <PieIcon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Allocation Breakdown
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Capital distribution across asset classes.
              </p>

              <div className="h-56 sm:h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-xl border border-slate-700">
                              <p className="font-bold">{data.name}</p>
                              <p className="text-emerald-400 font-mono mt-0.5">
                                {formatCurrency(data.value)} ({formatPercent(data.percentage)})
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      formatter={(value) => (
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
              Total Capital: <strong className="font-mono text-slate-900 dark:text-white">{formatCurrency(portfolio.totalValue)}</strong>
            </div>
          </div>

          {/* Allocation Comparison against Risk Profile Column */}
          <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
              Risk Profile Alignment Benchmarking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Compares your current weights with the recommended {portfolio.riskProfile} target asset mix.
            </p>

            <AllocationComparison
              allocations={portfolio.allocations}
              riskProfile={portfolio.riskProfile}
              educationalInsights={portfolio.educationalInsights}
            />
          </div>

        </div>

        {/* Manual Holdings Table */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Individual Asset Holdings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage, add, or remove manual investment positions.
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono font-medium">
              {portfolio.assets.length} Positions
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Asset Name</th>
                  <th className="py-2.5 px-3 font-bold">Class</th>
                  <th className="py-2.5 px-3 font-bold text-right">Holding Value</th>
                  <th className="py-2.5 px-3 font-bold text-right">Weight</th>
                  <th className="py-2.5 px-3 font-bold text-right">Returns YTD</th>
                  <th className="py-2.5 px-3 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {portfolio.assets.map((asset) => {
                  const weight = portfolio.totalValue > 0 ? (asset.amount / portfolio.totalValue) * 100 : 0;
                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {asset.name}
                        </div>
                        {asset.ticker && (
                          <span className="text-[9px] font-mono text-slate-400 uppercase">
                            Ticker: {asset.ticker}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${ASSET_TYPE_COLORS[asset.type]}15`,
                            color: ASSET_TYPE_COLORS[asset.type],
                          }}
                        >
                          {asset.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-900 dark:text-white font-mono font-bold">
                        {formatCurrency(asset.amount)}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-500 dark:text-slate-400 font-mono">
                        {formatPercent(weight)}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-emerald-500 font-mono font-semibold">
                        +{asset.returnsYTD || 8.5}%
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          aria-label={`Delete ${asset.name}`}
                          className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Manual Asset Position
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Asset / Fund Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vanguard Total Stock Market ETF"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Asset Class
                  </label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as AssetType })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="ETF">ETF</option>
                    <option value="Stock">Individual Stock</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="Gold">Gold / Commodity</option>
                    <option value="Cash">Cash / Liquid</option>
                    <option value="Crypto">Crypto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ticker (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VTI, AAPL"
                    value={newAsset.ticker}
                    onChange={(e) => setNewAsset({ ...newAsset, ticker: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white uppercase font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Holding Amount (? INR)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="10"
                  value={newAsset.amount}
                  onChange={(e) => setNewAsset({ ...newAsset, amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Add Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
