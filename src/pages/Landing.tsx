import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  PieChart,
  Receipt,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const { user, loginAsDemoUser } = useAuth();
  const navigate = useNavigate();

  const handleInstantDemo = async () => {
    await loginAsDemoUser();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-emerald-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-xs animate-in fade-in slide-in-from-top-4 duration-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FinTech Intelligence &bull; Codefury 9.0</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              FinWise: Understand your money.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-[#D4AF37]">
                Make smarter decisions.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              A personal financial health system featuring 0-100 wellness scoring, automated expense categorization, risk-aligned portfolio rebalancing, and high-impact monthly action blueprints.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/onboarding"
                id="hero-get-started-cta"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Get Started (Free Assessment)</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <button
                onClick={handleInstantDemo}
                id="hero-instant-demo-cta"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-base border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-[#D4AF37]" />
                <span>Explore Interactive Demo</span>
              </button>
            </div>

            {/* Micro proof points */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Backend Needed for Demo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Firebase Authentication</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Client-side CSV Privacy</span>
              </div>
            </div>

          </div>

          {/* Interactive Preview Mockup Box */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">finwise.app/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                  Live Preview Mode
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* Score Snapshot */}
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Financial Health Score
                </span>
                <div className="my-3 text-5xl font-black text-slate-900 dark:text-white font-mono">
                  82<span className="text-xl text-amber-500">/100</span>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                  Strong Resilience (Tier 1)
                </div>
              </div>

              {/* Action Plan Snapshot */}
              <div className="md:col-span-2 p-6 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> This Month You Should:
                  </span>
                  <span className="text-xs font-mono text-slate-400">High Priority</span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">1. Increase Monthly Index SIP by $150</span>
                    <span className="text-emerald-500 font-bold font-mono">+$42k in 5 Yrs</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">2. Trim dining out to keep discretionary &lt; 30%</span>
                    <span className="text-emerald-500 font-bold font-mono">Saves $270/mo</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Feature Value Grid */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Engineered for Complete Wealth Clarity
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Every tool designed to guide you from foundational emergency safety to aggressive compounding wealth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Dynamic Health Scoring
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Evaluates emergency cushion, 50/30/20 spending discipline, investment pace, and milestone velocity into one unified 0-100 metric.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Risk-Aligned Portfolio Analysis
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Detects asset drift across stocks, ETFs, mutual funds, gold, and cash, alerting you to portfolio imbalances with educational insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Client-Side Expense Intelligence
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Drag-and-drop CSV statement parsing with zero server upload. Instant category breakdowns and month-over-month variance charts.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} FinWise &bull; Codefury 9.0 WealthTech Track &bull; Educational Financial Analytics</p>
      </footer>

    </div>
  );
};
