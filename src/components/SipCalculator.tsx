import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { calculateSipProjection } from '../utils/financialCalculations';
import { formatCurrency } from '../utils/formatters';
import { Calculator, TrendingUp, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SipCalculatorProps {
  defaultMonthly?: number;
  defaultYears?: number;
  defaultReturn?: number;
}

export const SipCalculator: React.FC<SipCalculatorProps> = ({
  defaultMonthly = 500,
  defaultYears = 10,
  defaultReturn = 12,
}) => {
  const { theme } = useTheme();
  const [monthlyInvestment, setMonthlyInvestment] = useState(defaultMonthly);
  const [tenureYears, setTenureYears] = useState(defaultYears);
  const [expectedReturn, setExpectedReturn] = useState(defaultReturn);

  const projection = useMemo(() => {
    return calculateSipProjection({
      monthlyInvestment,
      expectedAnnualReturn: expectedReturn,
      tenureYears,
    });
  }, [monthlyInvestment, tenureYears, expectedReturn]);

  const isDark = theme === 'dark';

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              SIP & Compound Growth Engine
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Simulate monthly compounding wealth accumulation over your target time horizon.
          </p>
        </div>

        <div className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-[#D4AF37] text-[11px] font-bold font-mono">
          {tenureYears}Y Projection
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Interactive Sliders Column */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Monthly Investment Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span className="text-slate-700 dark:text-slate-300">Monthly Contribution</span>
              <span className="text-xs font-bold text-emerald-500 tabular-nums font-mono">
                {formatCurrency(monthlyInvestment)}/mo
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>₹50</span>
              <span>₹2,500</span>
              <span>₹5,000</span>
            </div>
          </div>

          {/* Expected Return Rate Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span className="text-slate-700 dark:text-slate-300">Expected Annual Return</span>
              <span className="text-xs font-bold text-amber-500 dark:text-[#D4AF37] tabular-nums font-mono">
                {expectedReturn}% p.a.
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="22"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>4% (Bonds)</span>
              <span>12% (Equities)</span>
              <span>20% (Aggressive)</span>
            </div>
          </div>

          {/* Time Horizon Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
              <span className="text-slate-700 dark:text-slate-300">Time Horizon</span>
              <span className="text-xs font-bold text-blue-500 tabular-nums font-mono">
                {tenureYears} Years
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>1 Yr</span>
              <span>15 Yrs</span>
              <span>30 Yrs</span>
            </div>
          </div>

          {/* Output Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">
                Total Invested
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                {formatCurrency(projection.finalInvested)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                Estimated Wealth
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
                {formatCurrency(projection.finalValue)}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px]">Compound Gains:</span>
            </div>
            <strong className="font-mono font-bold text-xs">{formatCurrency(projection.totalGains)}</strong>
          </div>

        </div>

        {/* Growth Visualizer Chart Column */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projection.yearlyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#1E293B' : '#E2E8F0'}
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  stroke={isDark ? '#64748B' : '#94A3B8'}
                  fontSize={11}
                  tickFormatter={(yr) => `Yr ${yr}`}
                />
                <YAxis
                  stroke={isDark ? '#64748B' : '#94A3B8'}
                  fontSize={11}
                  tickFormatter={(val) => formatCurrency(val, true)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl border border-slate-700">
                          <p className="font-bold text-slate-200">Year {data.year}</p>
                          <p className="text-emerald-400 font-mono mt-1">
                            Portfolio: {formatCurrency(data.totalValue)}
                          </p>
                          <p className="text-slate-400 font-mono">
                            Principal: {formatCurrency(data.invested)}
                          </p>
                          <p className="text-[#D4AF37] font-mono">
                            Returns: +{formatCurrency(data.returns)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalValue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Total Portfolio Value"
                />
                <Area
                  type="monotone"
                  dataKey="invested"
                  stroke="#64748B"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorInvested)"
                  name="Invested Principal"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Future Wealth (with Compounding)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400 border border-dashed border-slate-600" />
              <span>Invested Capital</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
