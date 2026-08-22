import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles } from 'lucide-react';
import { RiskLevel } from '../types';

interface WhatIfSimulatorProps {
  initialIncome: number;
  initialExpenses: number;
  initialSavings: number;
  initialRisk: RiskLevel;
  initialEquity: number;
  onSimulate: (params: {
    income: number;
    expenses: number;
    savings: number;
    risk: RiskLevel;
    portfolio_equity: number;
  }) => Promise<void>;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  initialIncome,
  initialExpenses,
  initialSavings,
  initialRisk,
  initialEquity,
  onSimulate,
}) => {
  const [simIncome, setSimIncome] = useState<number>(initialIncome);
  const [simExpenses, setSimExpenses] = useState<number>(initialExpenses);
  const [simSavings, setSimSavings] = useState<number>(initialSavings);
  const [simEquity, setSimEquity] = useState<number>(initialEquity);
  const [refreshing, setRefreshing] = useState(false);

  // Sync initial values if they change (e.g. user logs in or data loads later)
  useEffect(() => {
    setSimIncome(initialIncome);
    setSimExpenses(initialExpenses);
    setSimSavings(initialSavings);
    setSimEquity(initialEquity);
  }, [initialIncome, initialExpenses, initialSavings, initialEquity]);

  const currentSavingsRate = simIncome > 0 ? (((simIncome - simExpenses) / simIncome) * 100).toFixed(0) : '0';
  const runwayMonths = simExpenses > 0 ? (simSavings / simExpenses).toFixed(1) : '0';

  const applyPresetScenario = (type: 'trim_dining' | 'increase_sip' | 'windfall') => {
    if (type === 'trim_dining') {
      setSimExpenses((prev) => Math.max(100, prev - 28000));
    } else if (type === 'increase_sip') {
      setSimEquity((prev) => prev + 800000);
    } else if (type === 'windfall') {
      setSimSavings((prev) => prev + 1200000);
    }
  };

  const handleSimulate = async () => {
    setRefreshing(true);
    await onSimulate({
      income: simIncome,
      expenses: simExpenses,
      savings: simSavings,
      risk: initialRisk,
      portfolio_equity: simEquity,
    });
    setRefreshing(false);
  };

  return (
    <div className="rounded-2xl bg-white/50 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 p-5 sm:p-6 shadow-sm transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              "What-If" Financial Scenario Simulator
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 pl-9 sm:pl-0">
            Adjust variables to see how AI recommendations dynamically evolve.
          </p>
        </div>

        {/* Quick preset buttons */}
        <div className="flex flex-wrap gap-2 pl-9 sm:pl-0">
          <button
            type="button"
            onClick={() => applyPresetScenario('trim_dining')}
            className="px-3 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
          >
            Cut Expenses -₹350
          </button>
          <button
            type="button"
            onClick={() => applyPresetScenario('increase_sip')}
            className="px-3 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
          >
            +₹8L Portfolio
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Monthly Income (₹)
          </label>
          <input
            type="number"
            step="10000"
            value={simIncome}
            onChange={(e) => setSimIncome(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono shadow-inner outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Monthly Expenses (₹)
          </label>
          <input
            type="number"
            step="10000"
            value={simExpenses}
            onChange={(e) => setSimExpenses(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono shadow-inner outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Emergency Savings (₹)
          </label>
          <input
            type="number"
            step="50000"
            value={simSavings}
            onChange={(e) => setSimSavings(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono shadow-inner outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Portfolio Equity (₹)
          </label>
          <input
            type="number"
            step="100000"
            value={simEquity}
            onChange={(e) => setSimEquity(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono shadow-inner outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            Savings Rate: 
            <strong className="font-mono text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{currentSavingsRate}%</strong>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="flex items-center gap-1.5">
            Runway: 
            <strong className="font-mono text-sm text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">{runwayMonths} Mo</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={handleSimulate}
          disabled={refreshing}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <Sparkles className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Recalculating...' : 'Recalculate AI Strategy'}</span>
        </button>
      </div>
    </div>
  );
};
