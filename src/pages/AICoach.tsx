import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AICoachResponse, RiskLevel } from '../types';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Calendar,
  Zap,
  Info,
  RefreshCw,
  Lightbulb,
  Sliders,
} from 'lucide-react';

export const AICoach: React.FC = () => {
  const { user } = useAuth();
  const [advice, setAdvice] = useState<AICoachResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Scenario Simulator Inputs
  const [simIncome, setSimIncome] = useState<number>(user?.monthlyIncome || 7500);
  const [simExpenses, setSimExpenses] = useState<number>(user?.monthlyExpenses || 4100);
  const [simSavings, setSimSavings] = useState<number>(user?.existingSavings || 24000);
  const [simRisk, setSimRisk] = useState<RiskLevel>(user?.riskLevel || 'Aggressive');
  const [simEquity, setSimEquity] = useState<number>(user?.investmentAmount || 58000);

  const fetchAdvice = async (overrideParams?: any) => {
    try {
      const data = await api.getAICoachAdvice(overrideParams);
      setAdvice(data);
    } catch (err) {
      console.error('Failed to load AI Coach advice:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [user]);

  const handleSimulate = async () => {
    setRefreshing(true);
    await fetchAdvice({
      income: simIncome,
      expenses: simExpenses,
      savings: simSavings,
      risk: simRisk,
      portfolio_equity: simEquity,
    });
  };

  const applyPresetScenario = (type: 'trim_dining' | 'increase_sip' | 'windfall') => {
    if (type === 'trim_dining') {
      setSimExpenses((prev) => Math.max(1000, prev - 350));
    } else if (type === 'increase_sip') {
      setSimEquity((prev) => prev + 10000);
    } else if (type === 'windfall') {
      setSimSavings((prev) => prev + 15000);
    }
  };

  if (loading || !advice) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentSavingsRate = simIncome > 0 ? (((simIncome - simExpenses) / simIncome) * 100).toFixed(0) : '0';
  const runwayMonths = simExpenses > 0 ? (simSavings / simExpenses).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 p-3 sm:p-5 lg:p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Personalized Financial Intelligence
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>FinWise AI Wealth Coach</span>
              <span className="px-2 py-0.5 text-[9px] uppercase font-extrabold rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                LLM Ready
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Algorithmic narrative analysis consuming <code>/api/ai-coach</code> contract.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                fetchAdvice();
              }}
              disabled={refreshing}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
              <span>Regenerate Summary</span>
            </button>
          </div>
        </div>

        {/* Narrative Summary Hero Card */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/60 border border-emerald-500/30 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 dark:text-emerald-400">
                Executive Synthesis
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Comprehensive Financial Health Assessment
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal mb-3">
            {advice.summary}
          </p>

          <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block text-[11px] uppercase tracking-wide">Algorithmic Diagnosis</strong>
              <span className="mt-0.5 block">{advice.healthDiagnosis}</span>
            </div>
          </div>
        </div>

        {/* Strengths & Vulnerabilities Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Key Strengths */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Primary Financial Strengths
              </h3>
            </div>

            <div className="space-y-2.5">
              {advice.topStrengths.map((str, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Vulnerabilities */}
          <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="p-1 rounded bg-amber-500/10 text-amber-500">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Optimization Opportunities
              </h3>
            </div>

            <div className="space-y-2.5">
              {advice.keyVulnerabilities.map((vuln, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-snug">{vuln}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 3-Month Execution Roadmap */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              3-Month Strategic Execution Roadmap
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {advice.monthlyRoadmap.map((item, idx) => (
              <div
                key={item.month}
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold bg-emerald-500/10 text-emerald-500">
                    {item.month}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1.5 mb-1">
                    {item.focus}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.action}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[9px] text-slate-400 font-mono">
                  Milestone Phase {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Scenario Simulator */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  "What-If" Financial Scenario Simulator
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Adjust variables to see how AI recommendations evolve.
              </p>
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPresetScenario('trim_dining')}
                className="px-2 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                Cut Expenses -$350
              </button>
              <button
                type="button"
                onClick={() => applyPresetScenario('increase_sip')}
                className="px-2 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                +$10k Portfolio
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Income ($)
              </label>
              <input
                type="number"
                step="100"
                value={simIncome}
                onChange={(e) => setSimIncome(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Expenses ($)
              </label>
              <input
                type="number"
                step="100"
                value={simExpenses}
                onChange={(e) => setSimExpenses(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Savings ($)
              </label>
              <input
                type="number"
                step="500"
                value={simSavings}
                onChange={(e) => setSimSavings(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Portfolio Equity ($)
              </label>
              <input
                type="number"
                step="1000"
                value={simEquity}
                onChange={(e) => setSimEquity(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Savings Rate: <strong className="font-mono text-emerald-500">{currentSavingsRate}%</strong></span>
              <span>Runway: <strong className="font-mono text-slate-900 dark:text-white">{runwayMonths} Mo</strong></span>
            </div>

            <button
              type="button"
              onClick={handleSimulate}
              disabled={refreshing}
              className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{refreshing ? 'Recalculating...' : 'Recalculate AI Strategy'}</span>
            </button>
          </div>
        </div>

        {/* Educational Disclaimer Banner */}
        <div className="p-3 rounded-lg bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
          <span>{advice.educationalNote}</span>
        </div>

      </div>
    </div>
  );
};
