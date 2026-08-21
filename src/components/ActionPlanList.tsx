import React, { useState } from 'react';
import { ActionPlanItem } from '../types';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingDown,
  PiggyBank,
  TrendingUp,
  Compass,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface ActionPlanListProps {
  initialItems: ActionPlanItem[];
}

export const ActionPlanList: React.FC<ActionPlanListProps> = ({ initialItems }) => {
  const [items, setItems] = useState<ActionPlanItem[]>(initialItems);

  const toggleComplete = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.completed;
          if (nextState) {
            // Trigger confetti effect
            try {
              confetti({
                particleCount: 30,
                spread: 45,
                origin: { y: 0.7 },
                colors: ['#10B981', '#34D399', '#D4AF37'],
              });
            } catch {}
          }
          return { ...item, completed: nextState };
        }
        return item;
      })
    );
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / Math.max(1, items.length)) * 100);

  const getCategoryIcon = (cat: ActionPlanItem['category']) => {
    switch (cat) {
      case 'Spending':
        return <TrendingDown className="w-4 h-4 text-rose-500" />;
      case 'Savings':
        return <PiggyBank className="w-4 h-4 text-cyan-500" />;
      case 'Investment':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      default:
        return <Compass className="w-4 h-4 text-amber-500" />;
    }
  };

  const getNavigationRoute = (cat: ActionPlanItem['category']) => {
    switch (cat) {
      case 'Spending':
        return '/expenses';
      case 'Investment':
        return '/portfolio';
      case 'Savings':
        return '/goals';
      default:
        return '/goals';
    }
  };

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
      {/* Header section with standout high-density blueprint framing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-wide uppercase mb-1">
            <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" />
            Monthly High-Impact Blueprint
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            This Month You Should:
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Prioritized financial action steps algorithmically designed to boost your health score.
          </p>
        </div>

        {/* Completion Progress Bar */}
        <div className="sm:text-right bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between sm:justify-end gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="text-[11px]">Execution Rate</span>
            <span className="text-emerald-500 font-bold font-mono text-xs">{completedCount}/{items.length} Done</span>
          </div>
          <div className="w-32 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Numbered Action Items */}
      <div className="mt-3.5 space-y-2">
        {items.map((item, idx) => {
          const isDone = item.completed;
          return (
            <div
              key={item.id}
              className={`group relative flex flex-col md:flex-row md:items-center justify-between p-3 sm:p-3.5 rounded-lg border transition-all duration-150 ${
                isDone
                  ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/40 dark:border-slate-800/40 opacity-75'
                  : 'bg-slate-50/40 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Number Badge with check capability */}
                <button
                  onClick={() => toggleComplete(item.id)}
                  aria-label={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                  className="mt-0.5 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform"
                >
                  {isDone ? (
                    <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {idx + 1}
                    </div>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isDone
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </span>

                    {/* Category pill */}
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </span>

                    {/* Priority Tag */}
                    <span
                      className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded ${
                        item.priority === 'High'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : item.priority === 'Medium'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <p
                    className={`text-xs leading-relaxed ${
                      isDone ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action payoff badge & navigation */}
              <div className="mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 flex items-center justify-between md:justify-end gap-2.5 flex-shrink-0">
                <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold font-mono">
                  {item.impact}
                </div>

                <Link
                  to={getNavigationRoute(item.category)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>Execute</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
