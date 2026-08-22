import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { HealthScoreData, AICoachResponse, RiskLevel } from '../types';
import { calculateHealthScore } from '../utils/financialCalculations';

export const Landing: React.FC = () => {
  const { loginAsDemoUser } = useAuth();
  const navigate = useNavigate();

  const [healthScore, setHealthScore] = useState<HealthScoreData | null>(null);
  const [advice, setAdvice] = useState<AICoachResponse | null>(null);

  useEffect(() => {
    // Fetch initial mock data for the landing page
    const fetchLandingData = async () => {
      const scoreData = await api.getHealthScore();
      setHealthScore(scoreData);
      
      const adviceData = await api.getAICoachAdvice({
        income: 600000,
        expenses: 328000,
        savings: 1920000,
        risk: 'Aggressive',
        portfolio_equity: 4640000,
      });
      setAdvice(adviceData);
    };
    fetchLandingData();
  }, []);

  const handleInstantDemo = async () => {
    await loginAsDemoUser();
    navigate('/dashboard');
  };

  const handleSimulate = async (params: any) => {
    const updatedAdvice = await api.getAICoachAdvice(params);
    setAdvice(updatedAdvice);

    const simulatedHealth = calculateHealthScore({
      monthlyIncome: params.income,
      monthlyExpenses: params.expenses,
      existingSavings: params.savings,
      investmentAmount: params.portfolio_equity,
      goalsCount: 2,
      goalsAchievedRate: 0.7,
    });
    
    setHealthScore((prev) => 
      prev ? { ...prev, ...simulatedHealth } : ({ ...simulatedHealth, lastCalculated: new Date().toISOString() } as HealthScoreData)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-emerald-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
        {/* Glow Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Your financial health, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">quantified.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300/80 leading-relaxed font-medium max-w-2xl mx-auto">
              Upload your finances, understand your financial health, and get clear actions that improve your money.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/onboarding"
                id="hero-get-started-cta"
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-lg shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.03] hover:-translate-y-1 flex items-center justify-center gap-2 group"
              >
                <span>Try FinWise</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>

              <button
                onClick={handleInstantDemo}
                id="hero-instant-demo-cta"
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-lg border border-slate-200 dark:border-slate-700/50 shadow-lg transition-all hover:scale-[1.03] hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <span>View Dashboard</span>
              </button>
            </div>

            {/* Privacy Note */}
            <div className="pt-2 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400/80 font-medium">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Your financial data stays on your device</span>
            </div>

          </div>

          {/* Interactive Product Showcase - Glassmorphism Dashboard Window */}
          <div className="mt-16 sm:mt-24 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            
            <div className="rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 shadow-2xl overflow-hidden relative">
              {/* Subtle inner highlight */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none" />
              
              {/* Window Controls Header */}
              <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/50 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <div className="ml-4 text-[10px] sm:text-xs font-bold text-slate-400/80 font-mono tracking-widest">
                  FINWISE_INTELLIGENCE_DASHBOARD
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 sm:p-6 space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  
                  {/* Score Snapshot */}
                  <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-700/50 shadow-sm text-center flex-1 h-full flex flex-col justify-center relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-300">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <span className="text-[11px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest relative z-10">
                      Financial Health Score
                    </span>
                    
                    <div className="my-4 text-6xl sm:text-7xl font-black text-slate-900 dark:text-white font-mono tracking-tighter relative z-10">
                      {healthScore ? healthScore.overallScore : '...'}<span className="text-2xl text-emerald-500/80">/100</span>
                    </div>
                    
                    <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold border border-emerald-500/20 self-center relative z-10 backdrop-blur-md">
                      {healthScore ? healthScore.status : 'Loading...'}
                    </div>
                  </div>

                  {/* Action Plan Snapshot */}
                  <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-500/20 shadow-sm flex-1 h-full flex flex-col relative overflow-hidden group">
                    
                    <div className="flex items-center justify-between mb-5 relative z-10">
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          <Zap className="w-3.5 h-3.5 fill-current" />
                        </div>
                        This Month You Should:
                      </span>
                      <span className="px-2 py-1 rounded bg-slate-900/5 dark:bg-black/20 text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400">High Priority</span>
                    </div>
                    
                    <div className="space-y-3 flex-1 flex flex-col justify-center relative z-10">
                      {advice ? (
                        advice.monthlyRoadmap.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-3 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-500/30 transition-all duration-300">
                            <div className="flex items-start sm:items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.focus}</span>
                            </div>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm font-mono sm:text-right pl-9 sm:pl-0">
                              {item.action}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="animate-pulse flex flex-col gap-3">
                          <div className="h-16 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50"></div>
                          <div className="h-16 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50"></div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* What-If Simulator embedded */}
                <div>
                  <WhatIfSimulator
                    initialIncome={600000}
                    initialExpenses={328000}
                    initialSavings={1920000}
                    initialRisk={'Aggressive' as RiskLevel}
                    initialEquity={4640000}
                    onSimulate={handleSimulate}
                  />
                </div>
                
              </div>
            </div>
            
          </div>

        </div>
      </section>

      {/* Feature Value Grid */}
      <section className="py-24 bg-white dark:bg-slate-900/30 border-t border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Engineered for Complete Wealth Clarity
            </h2>
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mt-4">
              Every tool designed to guide you from foundational emergency safety to aggressive compounding wealth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Dynamic Health Scoring
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Evaluates emergency cushion, 50/30/20 spending discipline, investment pace, and milestone velocity into one unified 0-100 metric.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Risk-Aligned Portfolio Analysis
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Detects asset drift across stocks, ETFs, mutual funds, gold, and cash, alerting you to portfolio imbalances with educational insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Client-Side Privacy & Intelligence
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Drag-and-drop CSV statement parsing with zero server upload. 🔒 Your financial data stays on your device.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 font-medium">
        <p>&copy; {new Date().getFullYear()} FinWise &bull; Educational Financial Analytics</p>
      </footer>

    </div>
  );
};
