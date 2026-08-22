import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { RISK_QUESTIONS, calculateRiskScoreAndLevel, getTargetAllocationForRisk } from '../utils/financialCalculations';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  TrendingUp,
  User,
  DollarSign,
  PieChart,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile, updateUserContext } = useAuth();

  // Current Step: 1 = Financial Profile, 2 = Risk Quiz, 3 = Calculated Profile Reveal
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || 'Alex Morgan',
    age: user?.age || 28,
    monthlyIncome: user?.monthlyIncome || 7500,
    monthlyExpenses: user?.monthlyExpenses || 4100,
    existingSavings: user?.existingSavings || 24000,
    investmentAmount: user?.investmentAmount || 58000,
    financialGoal: user?.financialGoal || 'Buy a Home & Retire Early at 55',
  });

  // Risk Quiz Answers (indexes matching question id - 1)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(6).fill(null));
  const [quizIndex, setQuizIndex] = useState<number>(0);

  // Computed results after submission
  const [result, setResult] = useState<{
    riskScore: number;
    riskLevel: string;
    recommendedAllocation: Record<string, number>;
    initialHealthScore: number;
  } | null>(null);

  const handleNextToQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSelectOption = (score: number) => {
    const nextAnswers = [...answers];
    nextAnswers[quizIndex] = score;
    setAnswers(nextAnswers);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await api.submitOnboarding({
        name: formData.name,
        age: Number(formData.age),
        monthlyIncome: Number(formData.monthlyIncome),
        monthlyExpenses: Number(formData.monthlyExpenses),
        existingSavings: Number(formData.existingSavings),
        investmentAmount: Number(formData.investmentAmount),
        financialGoal: formData.financialGoal,
        answers: answers.map(a => a === null ? 0 : a),
      });

      setResult(response);
      setStep(3);

      updateUserContext({
        name: formData.name,
        age: Number(formData.age),
        monthlyIncome: Number(formData.monthlyIncome),
        monthlyExpenses: Number(formData.monthlyExpenses),
        existingSavings: Number(formData.existingSavings),
        investmentAmount: Number(formData.investmentAmount),
        financialGoal: formData.financialGoal,
        riskScore: response.riskScore,
        riskLevel: response.riskLevel,
        isOnboarded: true,
      });

      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#06B6D4', '#D4AF37'],
        });
      } catch {}
    } catch (err) {
      console.error('Failed to submit onboarding:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = RISK_QUESTIONS[quizIndex];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Step Indicator Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            <span>Step {step} of 3</span>
            <span>
              {step === 1
                ? 'Financial Baseline'
                : step === 2
                ? `Risk Questionnaire (${quizIndex + 1}/6)`
                : 'Profile Analysis'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{
                width:
                  step === 1
                    ? '33%'
                    : step === 2
                    ? `${33 + ((quizIndex + 1) / 6) * 33}%`
                    : '100%',
              }}
            />
          </div>
        </div>

        {/* STEP 1: FINANCIAL BASELINE FORM */}
        {step === 1 && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Your Financial Baseline
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Input your core numbers to calibrate your Financial Health Score.
                </p>
              </div>
            </div>

            <form onSubmit={handleNextToQuiz} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Monthly Take-Home Income ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Monthly Expenses ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={formData.monthlyExpenses}
                    onChange={(e) => setFormData({ ...formData, monthlyExpenses: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Liquid Cash & Emergency Savings ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.existingSavings}
                    onChange={(e) => setFormData({ ...formData, existingSavings: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Total Investments ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.investmentAmount}
                    onChange={(e) => setFormData({ ...formData, investmentAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Financial Goal
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buy a Home & Achieve Financial Independence"
                  value={formData.financialGoal}
                  onChange={(e) => setFormData({ ...formData, financialGoal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  id="onboarding-to-quiz-btn"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Risk Questionnaire (6 Qs)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: 6-QUESTION RISK ASSESSMENT */}
        {step === 2 && currentQuestion && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold font-mono">
                  Question {quizIndex + 1} of {RISK_QUESTIONS.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (quizIndex > 0) setQuizIndex(quizIndex - 1);
                  else setStep(1);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 leading-snug">
              {currentQuestion.question}
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[quizIndex] === opt.score;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleSelectOption(opt.score)}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {opt.label}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                        {opt.text}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation inside quiz */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Calculates risk tolerance: Conservative &rarr; Very Aggressive
              </span>

              {quizIndex === RISK_QUESTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={submitting || answers[quizIndex] === null}
                  id="submit-onboarding-btn"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Calculating Profile...' : 'Complete & Generate Profile'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setQuizIndex(quizIndex + 1)}
                  disabled={answers[quizIndex] === null}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: RESULT PROFILE REVEAL */}
        {step === 3 && result && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-400">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-3">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Your Financial Blueprint is Ready!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Calibrated across your savings rate, runway buffer, and risk temperament.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Risk Score Card */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs uppercase font-bold text-slate-400">Risk Profile</span>
                <div className="my-2 text-3xl font-black text-emerald-500 dark:text-emerald-400">
                  {result.riskLevel}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Tolerance Score: <strong className="text-slate-900 dark:text-white">{result.riskScore}/100</strong>
                </div>
              </div>

              {/* Initial Health Score Card */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs uppercase font-bold text-slate-400">Initial Health Score</span>
                <div className="my-2 text-3xl font-black text-amber-500 dark:text-[#D4AF37] font-mono">
                  {result.initialHealthScore}<span className="text-base text-slate-400">/100</span>
                </div>
                <div className="text-xs text-emerald-500 font-semibold">
                  Solid Foundation Active
                </div>
              </div>
            </div>

            {/* Recommended Allocation Bar */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Recommended Asset Allocation Benchmark:
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(result.recommendedAllocation).map(([type, pct]) => (
                  <span
                    key={type}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <strong>{type}:</strong> <span className="font-mono text-emerald-500">{pct}%</span>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              id="enter-dashboard-btn"
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Financial Health Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
