import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkPasswordStrength } from '../utils/passwordValidator';
import LeadAgentLogo from '../components/LeadAgentLogo';

export default function AuthPage({ initialMode = 'signin', onBackToHome, onNavigateLegal }) {
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/60 via-[#f8fafc] to-[#f8fafc] text-slate-900 font-sans flex flex-col justify-between selection:bg-emerald-600 selection:text-white relative overflow-hidden">
      {/* 1. Top Bar: Brand Logo & Title on Left (Clickable to Home) */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 py-4 sm:py-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 sm:gap-3 group cursor-pointer transition-transform active:scale-95 focus:outline-none shrink-0"
          title="Return to LeadAgent24 Home"
        >
          <LeadAgentLogo className="w-7 h-7 sm:w-9 sm:h-9 shadow-xs group-hover:scale-105 transition-transform shrink-0" />
          <div className="text-left">
            <span className="font-black text-sm min-[360px]:text-base sm:text-xl text-slate-900 tracking-tight block leading-none group-hover:text-emerald-700 transition-colors whitespace-nowrap">
              LeadAgent<span className="text-emerald-600">24</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 hidden sm:block mt-0.5">
              Autonomous B2B Lead Engine
            </span>
          </div>
        </button>

        {/* Dedicated Mobile / Desktop Return Button */}
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to Platform</span>
          <span className="sm:hidden">Back</span>
        </button>
      </header>

      {/* 2. Main Content: Centered Auth Card with Left Baseline Typography */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-4 sm:py-6 my-auto flex items-center justify-center">
        
        {/* Left Architectural Typographic Showcase - Exactly on the same level as card bottom */}
        <div className="hidden xl:flex flex-col justify-end absolute left-6 xl:left-12 2xl:left-16 bottom-0 max-w-[290px] select-none">
          {/* Stacked Large Words */}
          <div className="space-y-0.5">
            <div className="font-black text-2xl xl:text-3xl tracking-tight leading-[1.08] text-slate-900">
              <span className="block text-slate-300 transition-all duration-300 hover:text-slate-500 hover:translate-x-1.5 transform cursor-default">
                24/7
              </span>
              <span className="block text-slate-400 transition-all duration-300 hover:text-slate-600 hover:translate-x-1.5 transform cursor-default">
                Autonomous
              </span>
              <span className="block text-slate-800/90 transition-all duration-300 hover:text-emerald-700 hover:translate-x-1.5 transform cursor-default">
                B2B Prospecting
              </span>
              <span className="block text-slate-400 transition-all duration-300 hover:text-slate-600 hover:translate-x-1.5 transform cursor-default">
                & Outbound
              </span>
              <span className="block text-emerald-600/90 transition-all duration-300 hover:text-emerald-700 hover:translate-x-1.5 transform cursor-default">
                Intelligence.
              </span>
            </div>
          </div>
        </div>

        {/* Centered Auth Card */}
        <div className="w-full max-w-md mx-auto relative z-10">
          <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-9 border border-slate-200/90 shadow-2xl shadow-slate-200/70">
          {/* Card Title & Subtitle */}
          <div className="text-center pb-5 border-b border-slate-100">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {mode === 'signin' ? 'Sign In to LeadAgent24' : 'Create Your Account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {mode === 'signin'
                ? 'Access your saved campaigns, qualified leads, and outbound engine'
                : 'Deploy 24/7 autonomous prospecting with your dedicated sender identity'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In / Create Account) */}
          <div className="mt-5 p-1 bg-slate-100/80 rounded-2xl flex gap-1 border border-slate-200/70">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
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
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
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
                <div className="space-y-1.5 pt-2 animate-in fade-in duration-150">
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

            {/* Legal notice when creating account */}
            {mode === 'signup' && (
              <p className="text-[11px] text-slate-500 text-center leading-relaxed pt-1">
                By creating an account, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => onNavigateLegal ? onNavigateLegal('/terms') : null}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => onNavigateLegal ? onNavigateLegal('/privacy') : null}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Privacy Policy
                </button>.
              </p>
            )}

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
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

          {/* Clear prompt inside the card to switch between Sign In and Create Account */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); }}
                    className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer ml-1"
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError(null); }}
                    className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer ml-1"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Security Trust Guarantees */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Dedicated PostgreSQL database per tenant</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Row-Level Security (RLS) enabled</span>
            </div>
          </div>

          {/* Legal Links & Copyright Inside the Auth Card */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => onNavigateLegal ? onNavigateLegal('/privacy') : null}
              className="hover:text-slate-700 hover:underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => onNavigateLegal ? onNavigateLegal('/terms') : null}
              className="hover:text-slate-700 hover:underline transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span className="text-slate-300">•</span>
            <span>&copy; {new Date().getFullYear()} LeadAgent24</span>
          </div>
        </div>
      </div>
    </main>

      {/* 3. Bottom Minimal Bar (Responsive Stacking to prevent broken wrapping) */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-[11px] text-slate-400 text-center sm:text-left">
        <button
          type="button"
          onClick={onBackToHome}
          className="hover:text-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Back to Platform Overview</span>
        </button>
        <span className="select-none font-mono text-[10px] text-slate-400">AES-256 Vault • Multi-Tenant Isolation</span>
      </footer>
    </div>
  );
}
