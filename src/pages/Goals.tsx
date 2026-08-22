import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Goal } from '../types';
import { SipCalculator } from '../components/SipCalculator';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  Target,
  Plus,
  Trash2,
  TrendingUp,
  Calendar,
  Sparkles,
  IndianRupee,
  PiggyBank,
  CheckCircle2,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(500);

  // New Goal Form State
  const [newGoal, setNewGoal] = useState({
    name: '',
    category: 'House' as Goal['category'],
    targetAmount: 50000,
    currentAmount: 10000,
    timeHorizonYears: 3,
    expectedAnnualReturn: 8,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name.trim() || newGoal.targetAmount <= 0) return;
    setSubmitting(true);
    try {
      await api.createGoal(newGoal);
      setShowAddModal(false);
      setNewGoal({
        name: '',
        category: 'House',
        targetAmount: 50000,
        currentAmount: 10000,
        timeHorizonYears: 3,
        expectedAnnualReturn: 8,
      });
      await fetchGoals();
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForDeposit || depositAmount <= 0) return;
    try {
      await api.updateGoalDeposit(selectedGoalForDeposit.id, depositAmount);
      setSelectedGoalForDeposit(null);
      setDepositAmount(500);
      await fetchGoals();
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await api.deleteGoal(id);
      await fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 p-3 sm:p-5 lg:p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Wealth Milestones & Target Horizons
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Financial Goals & SIP Planner
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Calculate exact monthly required savings with compound interest simulation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            id="create-goal-btn"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Milestone</span>
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Accumulated Goal Capital</span>
            <div className="my-1 text-2xl font-black text-slate-900 dark:text-white font-mono">
              {formatCurrency(totalSaved)}
            </div>
            <span className="text-[11px] text-slate-500">Across {goals.length} active milestones</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Milestones Target</span>
            <div className="my-1 text-2xl font-black text-emerald-500 font-mono">
              {formatCurrency(totalTarget)}
            </div>
            <span className="text-[11px] text-slate-500">Aggregate target capital</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Overall Progress</span>
            <div className="my-1 text-2xl font-black text-amber-500 font-mono">
              {formatPercent(overallProgress)}
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, overallProgress)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Goals Grid Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-500" />
              Active Milestones
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {goals.length} Goals in Progress
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const isAchieved = goal.currentAmount >= goal.targetAmount;
              return (
                <div
                  key={goal.id}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {goal.category}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                          {goal.name}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        aria-label={`Delete ${goal.name}`}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress Bar & Amount numbers */}
                    <div className="my-3">
                      <div className="flex justify-between items-baseline text-xs mb-1">
                        <span className="text-slate-500">
                          Current: <strong className="text-slate-900 dark:text-white font-mono">{formatCurrency(goal.currentAmount)}</strong>
                        </span>
                        <span className="font-bold text-emerald-500 font-mono text-xs">
                          {goal.progressPercent}% Target
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>Target: {formatCurrency(goal.targetAmount)}</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {goal.timeHorizonYears} Yrs ({goal.targetDate.substring(0, 4)})
                        </span>
                      </div>
                    </div>

                    {/* Monthly Required vs SIP Compounded Required */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 mb-3 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase font-semibold">Cash Savings Rate:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-xs">
                          {formatCurrency(goal.requiredMonthlySavings)}/mo
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-semibold uppercase">
                          SIP @ {goal.expectedAnnualReturn}% ROI:
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                          {formatCurrency(goal.sipMonthlyRequired)}/mo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {isAchieved ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Achieved!
                        </span>
                      ) : (
                        `Left: ${formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}`
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedGoalForDeposit(goal)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Contribute</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Embedded Interactive SIP Calculator Section */}
        <SipCalculator defaultMonthly={650} defaultYears={10} defaultReturn={12} />

      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Create New Financial Milestone
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dream Home Down Payment"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="House">House / Real Estate</option>
                    <option value="Emergency">Emergency Buffer</option>
                    <option value="Retirement">Retirement (FIRE)</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Travel">Travel & Sabbatical</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time Horizon (Years)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="40"
                    step="0.5"
                    value={newGoal.timeHorizonYears}
                    onChange={(e) => setNewGoal({ ...newGoal, timeHorizonYears: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Goal Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="100"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Savings (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, currentAmount: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Investment Return (% p.a.)
                </label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  step="0.5"
                  value={newGoal.expectedAnnualReturn}
                  onChange={(e) => setNewGoal({ ...newGoal, expectedAnnualReturn: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Contribution Modal */}
      {selectedGoalForDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5">
              Deposit Contribution
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Add savings towards: <strong>{selectedGoalForDeposit.name}</strong>
            </p>

            <form onSubmit={handleDeposit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contribution Amount (? INR)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  step="10"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-1.5">
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className="flex-1 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-mono"
                  >
                    +${amt}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForDeposit(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                >
                  Save Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
