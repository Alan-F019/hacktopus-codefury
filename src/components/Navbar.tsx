import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  LayoutDashboard,
  PieChart,
  Receipt,
  Target,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Compass,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, loginAsDemoUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Portfolio', path: '/portfolio', icon: PieChart },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'AI Coach', path: '/ai-coach', icon: Sparkles, badge: 'AI' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Status */}
          <div className="flex items-center gap-6">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Fin<span className="text-emerald-500">Wise</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5"></span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {user && (
              <nav className="hidden md:flex items-center gap-0.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all ${
                        active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider rounded bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Live Indicator Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SYNCD</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              id="theme-toggle-btn"
              aria-label="Toggle theme"
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  id="user-profile-menu-btn"
                  className="flex items-center gap-2 p-1 pl-2.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/90 transition-all"
                >
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium font-mono">
                      {user.riskLevel || 'Moderate'}
                    </span>
                  </div>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Risk Profile: <strong className="text-emerald-500">{user.riskLevel}</strong></span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/onboarding"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Compass className="w-4 h-4 text-slate-400" />
                        <span>Retake Risk Assessment</span>
                      </Link>
                      <button
                        onClick={async () => {
                          await loginAsDemoUser();
                          navigate('/dashboard');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-400" />
                        <span>Reset Demo Data</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  id="nav-login-btn"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/onboarding"
                  id="nav-get-started-btn"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium ${
                    active
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500 text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
