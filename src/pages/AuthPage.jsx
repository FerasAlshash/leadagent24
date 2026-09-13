import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, ArrowLeft, ShieldCheck, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkPasswordStrength } from '../utils/passwordValidator';

export default function AuthPage({ initialMode = 'signin', onBackToHome }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const strength = checkPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Enforce strong password policy on account creation
    if (mode === 'signup') {
      const { isValid, criteria } = checkPasswordStrength(password);
      if (!isValid) {
        const unmet = criteria.filter(c => !c.met).map(c => c.label).join(' • ');
        setError(`Please meet all password requirements: ${unmet}`);
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col justify-center py-12 px-6 sm:px-10">
      {/* Back to Home Link */}
      <div className="max-w-md w-full mx-auto mb-6">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </button>
      </div>

      {/* Main Auth Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl p-7 sm:p-9 border border-slate-200 shadow-xl">
        {/* Brand Header */}
        <div className="text-center pb-6 border-b border-slate-200">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center mx-auto mb-3 shadow-sm">
            LM
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {mode === 'signin' ? 'Sign In to Lead Machine' : 'Create Your SaaS Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signin'
              ? 'Access your saved campaigns and private lead database'
              : 'Deploy campaigns and automate cold outreach with your identity'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="mt-6 p-1 bg-slate-100 rounded-xl flex gap-1 border border-slate-200">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-colors font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-slate-500" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>

            {/* In Sign Up mode: Professional Single Bar Indicator with dynamic hint */}
            {mode === 'signup' ? (
              <div className="space-y-1.5 pt-1.5 animate-in fade-in duration-150">
                {/* 1. Single Sleek Continuous Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      password.length === 0
                        ? 'w-0'
                        : strength.score <= 1
                        ? 'w-1/4 bg-rose-500'
                        : strength.score === 2
                        ? 'w-2/4 bg-amber-500'
                        : strength.score === 3
                        ? 'w-3/4 bg-blue-500'
                        : 'w-full bg-emerald-500'
                    }`}
                  />
                </div>

                {/* 2. Elegant Dynamic Feedback Note */}
                <div className="flex items-center justify-between text-[11px] px-0.5 min-h-[18px]">
                  <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                    {strength.isValid ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>All security requirements met</span>
                      </span>
                    ) : password.length > 0 ? (
                      <span className="text-amber-700 font-medium flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="truncate">{strength.hint}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 truncate">
                        8+ chars with uppercase, number & symbol
                      </span>
                    )}
                  </div>

                  {password.length > 0 && (
                    <span className={`font-bold shrink-0 ml-2 ${strength.textColor}`}>
                      {strength.label}
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Workspace</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account & Enter</span>
              </>
            )}
          </button>
        </form>

        {/* Feature Guarantees */}
        <div className="mt-6 pt-5 border-t border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Dedicated PostgreSQL database per tenant</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Row-Level Security (RLS) enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
