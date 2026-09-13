import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Zap, 
  CreditCard, 
  Sliders, 
  Mail, 
  Calendar,
  Layers,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { checkPasswordStrength } from '../utils/passwordValidator';

export default function AccountSettingsPage({ leadsCount = 0, campaignsCount = 0 }) {
  const { user } = useAuth();
  const isAdmin = (user?.email || '').toLowerCase() === 'ferasalshash@gmail.com';

  // Password update form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null); // { type: 'success'|'error', message: '' }

  const passwordStrength = checkPasswordStrength(newPassword);

  // Preferences
  const [defaultTone, setDefaultTone] = useState('Professional');
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    const { isValid, hint } = checkPasswordStrength(newPassword);
    if (!isValid) {
      setPasswordStatus({
        type: 'error',
        message: `Password requirement missing: ${hint}`
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'Passwords do not match. Please verify.'
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPasswordStatus({
        type: 'success',
        message: 'Your password has been securely updated!'
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordStatus({
        type: 'error',
        message: err.message || 'Failed to update password.'
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
      {/* 1. Page Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <User className="w-4 h-4" />
          <span>Tenant Management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
          Account Settings & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your credentials, authentication security, subscription quota, and outbound defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Profile Overview Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              {user?.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">User Profile</h2>
              <span className="text-xs text-slate-500">{user?.email}</span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Account Status & Role
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isAdmin ? 'Super Administrator (Root Access)' : 'Verified SaaS Tenant'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Tenant UUID
              </span>
              <span className="font-mono text-[11px] text-slate-600 mt-1 block truncate">
                {user?.id}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Member Since
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) : 'Active'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Subscription & Usage Quota */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Plan & Usage Quota</h2>
                <p className="text-xs text-slate-500">Early Adopter Tier</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              Active Tier
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between font-semibold mb-1">
                <span className="text-slate-700">Scraped Prospects Used</span>
                <span className="font-bold text-slate-900">{leadsCount} / 5,000</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full" 
                  style={{ width: `${Math.min(100, Math.round((leadsCount / 5000) * 100))}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between font-semibold mb-1">
                <span className="text-slate-700">Active Business Campaigns</span>
                <span className="font-bold text-slate-900">{campaignsCount} / Unlimited</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-violet-600 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mt-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Unlimited High-Intent Business Discovery</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your account is currently provisioned with unlimited automated prospecting queries, AI pitch enrichment, and multi-channel contact resolution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Password Update & Security Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Security & Password Update</h2>
            <p className="text-xs text-slate-500">Update your account authentication credentials</p>
          </div>
        </div>

        {passwordStatus && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
            passwordStatus.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}>
            {passwordStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{passwordStatus.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="Min 8 chars, mixed"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors"
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Live Single Progress Bar in Account Settings */}
          {newPassword.length > 0 && (
            <div className="space-y-1.5 pt-1 animate-in fade-in duration-150">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    passwordStrength.score <= 1
                      ? 'w-1/4 bg-rose-500'
                      : passwordStrength.score === 2
                      ? 'w-2/4 bg-amber-500'
                      : passwordStrength.score === 3
                      ? 'w-3/4 bg-blue-500'
                      : 'w-full bg-emerald-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] px-0.5 min-h-[18px]">
                <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                  {passwordStrength.isValid ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>All security requirements met</span>
                    </span>
                  ) : (
                    <span className="text-amber-700 font-medium flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">{passwordStrength.hint}</span>
                    </span>
                  )}
                </div>

                <span className={`font-bold shrink-0 ml-2 ${passwordStrength.textColor}`}>
                  {passwordStrength.label}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={updatingPassword}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all disabled:opacity-50"
          >
            {updatingPassword && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>Update Account Password</span>
          </button>
        </form>
      </div>
    </div>
  );
}
