import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  accentColor?: 'emerald' | 'blue' | 'amber' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  accentColor = 'emerald',
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'blue':
        return {
          iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
          border: 'hover:border-blue-500/30',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          border: 'hover:border-amber-500/30',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
          border: 'hover:border-purple-500/30',
        };
      default:
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          border: 'hover:border-emerald-500/30',
        };
    }
  };

  const styles = getAccentStyles();

  return (
    <div
      className={`rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 ${styles.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-1.5 rounded-md ${styles.iconBg}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums font-mono">
          {value}
        </span>
      </div>

      {(trend || subtext) && (
        <div className="mt-2 flex items-center justify-between text-[11px]">
          {trend && (
            <div
              className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded ${
                trend.isPositive
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{trend.value}</span>
              {trend.label && (
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  {trend.label}
                </span>
              )}
            </div>
          )}
          {subtext && !trend && (
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">{subtext}</span>
          )}
        </div>
      )}
    </div>
  );
};
