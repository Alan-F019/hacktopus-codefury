import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: LucideIcon;
  actionElement?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badge,
  icon: Icon,
  actionElement,
  children,
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <div>
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-500 border border-slate-200/60 dark:border-slate-700">
                <Icon className="w-3.5 h-3.5" />
              </div>
            )}
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            {badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {actionElement && <div className="flex-shrink-0">{actionElement}</div>}
      </div>

      <div className="flex-1 w-full">{children}</div>
    </div>
  );
};
