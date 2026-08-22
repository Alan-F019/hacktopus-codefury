import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HealthScoreData, PortfolioData, Goal } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { StatCard } from '../components/StatCard';
import { ActionPlanList } from '../components/ActionPlanList';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  DollarSign,
  Receipt,
  PiggyBank,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  Clock,
  Compass,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<HealthScoreData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [hData, pData, gData] = await Promise.all([
          api.getHealthScore(),
          api.getPortfolio(),
          api.getGoals(),
        ]);
        setHealthData(hData);
        setPortfolio(pData);
        setGoals(gData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading || !healthData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Calculating Financial Health Metrics...
          </p>
        </div>
      </div>
    );
  }

  const metrics = healthData.metrics || {
    monthlyIncome: 7500,
    monthlyExpenses: 4100,
    monthlySavings: 3400,
    savingsRate: 45.3,
    emergencyFundMonths: 5.8,
    existingSavings: 24000,
    investmentAmount: 58000,
  };
  const subScores = healthData.subScores || {};
  const totalNetWorth = metrics.existingSavings !== undefined 
    ? Number(metrics.existingSavings || 0) + Number(portfolio?.totalValue || 0)
    : Number(user?.existingSavings || 24000) + Number(portfolio?.totalValue || 58000);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 p-3 sm:p-5 lg:p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Top Greeting & Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Financial Health Command Center
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {getTimeOfDayGreeting()},{' '}
              <span className="text-emerald-600 dark:text-emerald-400">
                {user?.name || 'Investor'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target:{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {user?.financialGoal || 'Achieve Long-Term Wealth & Homeownership'}
              </strong>
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <span>Risk: <strong className="text-emerald-500 font-mono">{user?.riskLevel || 'Aggressive'}</strong></span>
            </div>

            <Link
              to="/ai-coach"
              id="dash-ai-coach-btn"
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Coach Review</span>
            </Link>
          </div>
        </div>

        {/* 4 Financial Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            title="Monthly Income"
            value={formatCurrency(metrics.monthlyIncome)}
            subtext="Primary Take-home"
            icon={DollarSign}
            accentColor="emerald"
          />
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(metrics.monthlyExpenses)}
            subtext={`${formatPercent((metrics.monthlyExpenses / Math.max(1, metrics.monthlyIncome)) * 100, 0)} of Income`}
            icon={Receipt}
            accentColor="amber"
          />
          <StatCard
            title="Monthly Savings"
            value={formatCurrency(metrics.monthlySavings)}
            trend={{
              value: `${metrics.savingsRate}% Rate`,
              isPositive: metrics.savingsRate >= 20,
              label: 'Target: 20%+',
            }}
            icon={PiggyBank}
            accentColor="blue"
          />
          <StatCard
            title="Total Assets / Net Wealth"
            value={formatCurrency(totalNetWorth)}
            trend={{
              value: `${metrics.emergencyFundMonths} Mo Cushion`,
              isPositive: metrics.emergencyFundMonths >= 3,
              label: 'Runway',
            }}
            icon={TrendingUp}
            accentColor="purple"
          />
        </div>

        {/* Financial Health Score Large Gauge Component */}
        <ScoreGauge
          score={healthData.overallScore}
          status={healthData.status}
          subScores={subScores}
          lastUpdated={healthData.lastCalculated}
        />

        {/* KILLER FEATURE: "This Month You Should:" Action Plan List */}
        <ActionPlanList initialItems={healthData.actionPlan || []} />

        {/* Bottom Split: Quick Portfolio Allocation Snapshot + Goals Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Portfolio Snapshot Card */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Portfolio Allocation by Class
                  </h3>
                </div>
                <Link
                  to="/portfolio"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {portfolio && (
                <div className="space-y-2">
                  {(portfolio.allocations || []).slice(0, 4).map((alloc) => (
                    <div key={alloc.type} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{alloc.type}</span>
                        <span className="text-slate-400 text-[11px]">({formatPercent(alloc.currentPercent)})</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-slate-900 dark:text-white font-medium">
                          {formatCurrency(alloc.amount)}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            alloc.status === 'optimal'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : alloc.status === 'overweight'
                              ? 'bg-rose-500/10 text-rose-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {alloc.status === 'optimal' ? '🟢 Target' : alloc.status === 'overweight' ? '🔴 +Over' : '🟡 -Under'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Total Portfolio: <strong className="font-mono text-slate-900 dark:text-white">{formatCurrency(portfolio?.totalValue || 0)}</strong></span>
              <span>Aligned with {user?.riskLevel || 'Aggressive'}</span>
            </div>
          </div>

          {/* Goals Progress Snapshot Card */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Milestone Goal Trackers
                  </h3>
                </div>
                <Link
                  to="/goals"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  View All Goals <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {(goals || []).slice(0, 3).map((goal) => (
                  <div key={goal.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-900 dark:text-white">{goal.name}</span>
                      <span className="font-mono text-emerald-500 font-bold">{goal.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>{formatCurrency(goal.currentAmount)} saved</span>
                      <span>Target: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>{goals.length} Active Goals Tracked</span>
              <span className="text-emerald-500 font-semibold font-mono">On-Track</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
