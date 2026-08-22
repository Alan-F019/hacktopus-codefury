import React from 'react';
import { PortfolioAllocation, RiskLevel } from '../types';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface AllocationComparisonProps {
  allocations: PortfolioAllocation[];
  riskProfile: RiskLevel;
  educationalInsights: string[];
}

export const AllocationComparison: React.FC<AllocationComparisonProps> = ({
  allocations,
  riskProfile,
  educationalInsights,
}) => {
  return (
    <div className="space-y-4">
      {/* Allocation Variance Table / Comparison List */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3 font-bold">Asset Class</th>
              <th className="py-2.5 px-3 font-bold text-right">Holdings (₹)</th>
              <th className="py-2.5 px-3 font-bold text-right">Current %</th>
              <th className="py-2.5 px-3 font-bold text-right">Target {riskProfile} %</th>
              <th className="py-2.5 px-3 font-bold text-center">Risk Alignment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {allocations.map((item) => {
              const isOptimal = item.status === 'optimal';
              const isOver = item.status === 'overweight';
              return (
                <tr
                  key={item.type}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                    {item.type}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300 font-mono">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-900 dark:text-white font-mono font-bold">
                    {formatPercent(item.currentPercent)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-500 dark:text-slate-400 font-mono">
                    {formatPercent(item.targetPercent)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="inline-flex items-center justify-center">
                      {isOptimal ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Target (🟢)</span>
                        </span>
                      ) : isOver ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[11px] font-semibold font-mono">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          <span>Over +{item.difference}% (🔴)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[11px] font-semibold font-mono">
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                          <span>Under {item.difference}% (🟡)</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Educational Insight Cards & Warnings */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-500" />
          Algorithmic Allocation Insights
        </h4>

        {educationalInsights.map((insight, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
            <span>{insight}</span>
          </div>
        ))}

        {/* Mandatory Educational Disclaimer */}
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300/90 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>
            <strong>Educational Insight Policy:</strong> All model allocations reflect generic risk-tolerance benchmarks. These observations do not represent licensed investment advice or solicitations to buy or sell securities.
          </span>
        </div>
      </div>
    </div>
  );
};
