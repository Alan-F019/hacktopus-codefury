import React from 'react';
import { SubScores } from '../types';
import { ShieldCheck, Flame, TrendingUp, PiggyBank, Award } from 'lucide-react';

interface ScoreGaugeProps {
  score: number; // 0 - 100
  status: 'Critical' | 'Fair' | 'Good' | 'Excellent';
  subScores: SubScores;
  lastUpdated?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  status,
  subScores,
}) => {
  // SVG Circular arc calculation
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Arc angle: 260 degrees arc for speedometer feel
  const arcPercentage = 0.75;
  const totalArcLength = circumference * arcPercentage;
  const strokeDashoffset = totalArcLength - (score / 100) * totalArcLength;

  const getStatusBadge = () => {
    switch (status) {
      case 'Excellent':
        return {
          bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500',
          desc: 'Peak financial resilience & compounding efficiency',
        };
      case 'Good':
        return {
          bg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
          dot: 'bg-teal-500',
          desc: 'Strong foundation with minor optimization potential',
        };
      case 'Fair':
        return {
          bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
          desc: 'Action recommended to plug spending or safety gaps',
        };
      default:
        return {
          bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
          dot: 'bg-rose-500',
          desc: 'Immediate emergency fund & debt attention needed',
        };
    }
  };

  const badge = getStatusBadge();

  const subScoreItems = [
    {
      name: 'Emergency Cushion',
      score: subScores.emergencyFund,
      icon: PiggyBank,
      color: 'from-blue-500 to-cyan-500',
      barColor: 'bg-cyan-500',
      benchmark: '6 Mo Target',
    },
    {
      name: 'Spending Discipline',
      score: subScores.spendingControl,
      icon: Flame,
      color: 'from-emerald-500 to-teal-500',
      barColor: 'bg-emerald-500',
      benchmark: '50/30/20 Rule',
    },
    {
      name: 'Investment Rate',
      score: subScores.investmentsRate,
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500',
      barColor: 'bg-indigo-500',
      benchmark: 'Wealth Velocity',
    },
    {
      name: 'Goal Milestones',
      score: subScores.goalProgress,
      icon: Award,
      color: 'from-amber-500 to-yellow-500',
      barColor: 'bg-amber-500',
      benchmark: 'Target Horizon',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs">
      {/* Decorative Subtle Accent Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-amber-500/5 dark:bg-amber-400/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
        
        {/* Main Circular Gauge */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="relative flex items-center justify-center">
            <svg
              className="transform -rotate-135 w-44 h-44 sm:w-48 sm:h-48 drop-shadow-xs"
              viewBox="0 0 160 160"
            >
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={normalizedRadius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={`${totalArcLength} ${circumference}`}
                strokeLinecap="round"
                className="text-slate-200 dark:text-slate-800"
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="60%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>
              </defs>

              {/* Progress Arc */}
              <circle
                cx="80"
                cy="80"
                r={normalizedRadius}
                fill="none"
                stroke="url(#scoreGaugeGrad)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${totalArcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Centered Score Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Health Score
              </span>
              <div className="flex items-baseline justify-center">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums font-mono">
                  {score}
                </span>
                <span className="text-sm font-bold text-amber-500 dark:text-[#D4AF37] ml-0.5 font-mono">/100</span>
              </div>
              <div className={`mt-0.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                {status}
              </div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-center text-slate-500 dark:text-slate-400 max-w-xs">
            {badge.desc}
          </p>
        </div>

        {/* Sub-Scores Grid */}
        <div className="w-full flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Financial Health Pillars
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Live Algorithmic Assessment
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {subScoreItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="p-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/30 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                        <Icon className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {item.benchmark}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                      {item.score}%
                    </span>
                  </div>

                  {/* Linear Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${item.barColor}`}
                      style={{ width: `${Math.min(100, Math.max(5, item.score))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
