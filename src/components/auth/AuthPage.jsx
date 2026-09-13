import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage({ initialMode = 'signin', onBackToHome }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        // Seamless login: try to immediately establish session without email confirmation
        try {
          await signIn(email, password);
        } catch (signInErr) {
          // If Supabase has email confirmation still enabled on project side
          console.warn('Immediate signin notice:', signInErr);
        }
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

      {/* Main Card */}
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
            New Account
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
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="form-input w-full pl-10 pr-3.5 py-2.5 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
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
                className="form-input w-full pl-10 pr-10 py-2.5 text-xs text-slate-900"
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
            {mode === 'signup' && (
              <p className="text-[11px] text-slate-500 mt-1">Must be at least 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Dashboard</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create SaaS Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            {mode === 'signin' ? (
              <>
                New to Lead Machine?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
