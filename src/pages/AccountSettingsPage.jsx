import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Mail, 
  Calendar,
  Sparkles,
  Eye,
  EyeOff,
  Send,
  Server,
  Check,
  ExternalLink,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { checkPasswordStrength } from '../utils/passwordValidator';
import { diagnoseEmailError } from '../utils/emailDiagnostics';

export default function AccountSettingsPage({ leadsCount = 0, campaignsCount = 0 }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = (user?.email || '').toLowerCase() === 'ferasalshash@gmail.com';

  // Password update form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  const passwordStrength = checkPasswordStrength(newPassword);

  // Outbound Email Provider (BYOK) State
  const [savedIntegration, setSavedIntegration] = useState(null);
  const [provider, setProvider] = useState('brevo'); // 'brevo', 'sendgrid', 'resend', 'smtp'

  const [providerConfigs, setProviderConfigs] = useState({
    brevo: {
      apiKey: '',
      showApiKey: false,
      senderEmail: '',
      senderName: ''
    },
    sendgrid: {
      apiKey: '',
      showApiKey: false,
      senderEmail: '',
      senderName: ''
    },
    resend: {
      apiKey: '',
      showApiKey: false,
      senderEmail: '',
      senderName: ''
    },
    smtp: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      showSmtpPass: false,
      senderEmail: '',
      senderName: ''
    }
  });

  const currentConfig = providerConfigs[provider] || {};
  const senderEmail = currentConfig.senderEmail || '';
  const senderName = currentConfig.senderName || '';
  const apiKey = currentConfig.apiKey || '';

  const updateCurrentConfig = (field, value) => {
    setProviderConfigs(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  const [testRecipient, setTestRecipient] = useState(user?.email || '');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savingIntegration, setSavingIntegration] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showRawError, setShowRawError] = useState(false);

  useEffect(() => {
    async function loadIntegration() {
      if (!user) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const res = await fetch('http://127.0.0.1:8000/api/email-integrations/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.configured && data.integration) {
            setIsConfigured(true);
            setSavedIntegration(data.integration);
            const activeProv = data.integration.provider || 'brevo';
            setProvider(activeProv);
            setProviderConfigs(prev => ({
              ...prev,
              [activeProv]: {
                ...prev[activeProv],
                apiKey: data.integration.api_key_masked || '',
                senderEmail: data.integration.sender_email || '',
                senderName: data.integration.sender_name || '',
                smtpHost: data.integration.smtp_host || '',
                smtpPort: data.integration.smtp_port || 587,
                smtpUser: data.integration.smtp_user || '',
                smtpPass: ''
              }
            }));
          }
        }
      } catch (err) {
        console.warn('Could not load email integration:', err);
      }
    }
    loadIntegration();
  }, [user]);

  const handleProviderSwitch = (newProvider) => {
    setProvider(newProvider);
    setTestResult(null);
    setSaveStatus(null);
    setShowRawError(false);
  };

  const handleTestEmail = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const payload = {
        provider,
        api_key: currentConfig.apiKey || '',
        sender_email: currentConfig.senderEmail || '',
        sender_name: currentConfig.senderName || '',
        test_recipient: testRecipient || user?.email,
        smtp_host: currentConfig.smtpHost || null,
        smtp_port: Number(currentConfig.smtpPort) || 587,
        smtp_user: currentConfig.smtpUser || null,
        smtp_pass: currentConfig.smtpPass || null
      };

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('http://127.0.0.1:8000/api/email-integrations/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || `Test email dispatched successfully via ${provider.toUpperCase()}!`
        });
      } else {
        setTestResult({
          success: false,
          error: data.error || 'Failed to dispatch verification email.'
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        error: `Could not connect to backend server: ${err.message}`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveIntegration = async () => {
    setSavingIntegration(true);
    setSaveStatus(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('You must be logged in to save settings.');

      const payload = {
        provider,
        api_key: currentConfig.apiKey || '',
        sender_email: currentConfig.senderEmail || '',
        sender_name: currentConfig.senderName || '',
        smtp_host: currentConfig.smtpHost || null,
        smtp_port: Number(currentConfig.smtpPort) || 587,
        smtp_user: currentConfig.smtpUser || null,
        smtp_pass: currentConfig.smtpPass || null
      };

      const res = await fetch('http://127.0.0.1:8000/api/email-integrations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Failed to save.');

      setSaveStatus({
        type: 'success',
        message: `Your ${provider.toUpperCase()} email integration is active and saved successfully!`
      });
      setIsConfigured(true);
      setSavedIntegration({
        ...payload,
        api_key_masked: data.data?.api_key_masked || currentConfig.apiKey
      });
      if (data.data?.api_key_masked) {
        updateCurrentConfig('apiKey', data.data.api_key_masked);
      }
    } catch (err) {
      setSaveStatus({
        type: 'error',
        message: err.message
      });
    } finally {
      setSavingIntegration(false);
    }
  };

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
    <div className="w-full space-y-8 animate-in fade-in duration-200 pb-12">
      
      {/* 1. Page Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <User className="w-4 h-4" />
            <span>Tenant Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Account Settings & Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your credentials, authentication security, subscription quota, and outbound email dispatchers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/docs')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50/60 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Integration Guides</span>
          <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
        </button>
      </div>

      {/* ================================================================
          1. OUTBOUND EMAIL ACCOUNTS (BYOK) - TOP HERO CARD
         ================================================================ */}
      <div className="space-y-6">
        {/* Outbound Email Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6">
            
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-slate-900">Outbound Email Accounts (BYOK)</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                      Bring Your Own Key
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dispatch automated cold campaigns directly through your official company domain and email provider.
                  </p>
                </div>
              </div>

              <div>
                {savedIntegration ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Active: {(savedIntegration?.provider || provider || 'BREVO').toUpperCase()}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Not Connected</span>
                  </span>
                )}
              </div>
            </div>

            {/* Elegant Documentation Callout Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Need step-by-step assistance setting up {provider.toUpperCase()} or resolving security restrictions?
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/docs?provider=${provider}`)}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer shrink-0"
              >
                <span>Read {provider.toUpperCase()} Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Provider Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Email Service Provider
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'brevo', name: 'Brevo', subtext: '300 free/day', tag: 'Recommended' },
                  { id: 'sendgrid', name: 'SendGrid', subtext: '100 free/day', tag: 'Twilio' },
                  { id: 'resend', name: 'Resend', subtext: '3,000 free/mo', tag: 'Modern API' },
                  { id: 'smtp', name: 'Custom SMTP', subtext: 'GSuite / cPanel', tag: 'Universal' },
                ].map(item => {
                  const isSelected = provider === item.id;
                  const isSaved = savedIntegration?.provider === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleProviderSwitch(item.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-xs text-slate-900">{item.name}</span>
                          {isSaved ? (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full" title="Currently Active Provider">
                              <Check className="w-2.5 h-2.5 text-emerald-700" />
                              <span>Active</span>
                            </span>
                          ) : isSelected ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Selected for setup" />
                          ) : null}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">{item.subtext}</p>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-emerald-200/60 text-emerald-900' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.tag}
                        </span>
                        {isSelected && !isSaved && (
                          <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Editing
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider Credentials Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sender Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Sales Team or John Doe"
                  value={currentConfig.senderName || ''}
                  onChange={(e) => updateCurrentConfig('senderName', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium placeholder:text-slate-400 placeholder:font-normal"
                />
                <p className="text-[10px] text-slate-400 mt-1">The name recipients will see in their inbox</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sender Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. contact@yourcompany.com"
                  value={currentConfig.senderEmail || ''}
                  onChange={(e) => updateCurrentConfig('senderEmail', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono font-medium placeholder:text-slate-400 placeholder:font-normal"
                />
                <p className="text-[10px] text-slate-400 mt-1">Must be an authorized/verified sender in your {provider.toUpperCase()} account</p>
              </div>

              {/* API Key for Brevo, SendGrid, Resend */}
              {provider !== 'smtp' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {provider.toUpperCase()} API Key <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={currentConfig.showApiKey ? "text" : "password"}
                      placeholder={provider === 'brevo' ? 'xkeysib-...' : provider === 'sendgrid' ? 'SG.xxxxxxxxxxxxxxxxxxxxxx...' : 're_xxxxxxxxxxxxxxxxxxxxxx...'}
                      value={currentConfig.apiKey || ''}
                      onChange={(e) => updateCurrentConfig('apiKey', e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono font-medium placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => updateCurrentConfig('showApiKey', !currentConfig.showApiKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors cursor-pointer"
                      title={currentConfig.showApiKey ? "Hide API key" : "Show API key"}
                    >
                      {currentConfig.showApiKey ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Custom SMTP Fields */}
              {provider === 'smtp' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      SMTP Host Server <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. smtp.gmail.com or mail.yourdomain.com"
                      value={currentConfig.smtpHost || ''}
                      onChange={(e) => updateCurrentConfig('smtpHost', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs font-medium placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      SMTP Port <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="587"
                      value={currentConfig.smtpPort || 587}
                      onChange={(e) => updateCurrentConfig('smtpPort', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs font-medium placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      SMTP Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. user@yourdomain.com"
                      value={currentConfig.smtpUser || ''}
                      onChange={(e) => updateCurrentConfig('smtpUser', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs font-medium placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      SMTP Password / App Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={currentConfig.showSmtpPass ? "text" : "password"}
                        placeholder="Enter SMTP password or 16-char App Password"
                        value={currentConfig.smtpPass || ''}
                        onChange={(e) => updateCurrentConfig('smtpPass', e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs font-medium placeholder:text-slate-400 placeholder:font-normal"
                      />
                      <button
                        type="button"
                        onClick={() => updateCurrentConfig('showSmtpPass', !currentConfig.showSmtpPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors cursor-pointer"
                      >
                        {currentConfig.showSmtpPass ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Verification & Test Dispatch Section */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900">Verify & Test Connection</span>
                </div>
                <span className="text-[11px] text-slate-400">Dispatches an immediate live test email</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <input
                  type="email"
                  placeholder="Recipient email for testing"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium bg-white"
                />
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingConnection || !senderEmail}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  {testingConnection ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Test Email</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Feedback & Smart Diagnostic Alert */}
              {testResult && (
                testResult.success ? (
                  <div className="p-3.5 rounded-xl text-xs font-medium flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in fade-in duration-150">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold">Verification Succeeded: </span>
                      <span>{testResult.message || `Test email dispatched successfully via ${provider.toUpperCase()}!`}</span>
                    </div>
                  </div>
                ) : (() => {
                  const diagnostic = diagnoseEmailError(testResult.error, provider);
                  if (diagnostic) {
                    return (
                      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-amber-950">{diagnostic.title}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 border border-amber-300 uppercase tracking-wider">
                                {diagnostic.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-amber-900/90 mt-1 leading-relaxed">
                              {diagnostic.summary}
                            </p>
                          </div>
                        </div>

                        {/* Detected IP if applicable */}
                        {diagnostic.detectedIp && (
                          <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 text-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                            <span className="text-slate-600 text-[11px]">Detected Connection IP:</span>
                            <code className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                              {diagnostic.detectedIp}
                            </code>
                          </div>
                        )}

                        {/* Quick Steps */}
                        <div className="bg-white/85 p-3 rounded-xl border border-amber-200 space-y-1.5 text-xs text-slate-800">
                          <span className="font-bold text-slate-900 block text-[11px]">Recommended Solution:</span>
                          <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                            {diagnostic.steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {diagnostic.actionUrl && (
                            <a
                              href={diagnostic.actionUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-2xs"
                            >
                              <span>{diagnostic.actionText}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate(`/docs?provider=${diagnostic.guideTab || provider}`)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                          >
                            <BookOpen className="w-3 h-3 text-emerald-600" />
                            <span>View Full Guide in Docs ↗</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRawError(!showRawError)}
                            className="text-[11px] text-slate-500 hover:text-slate-700 underline ml-auto cursor-pointer"
                          >
                            {showRawError ? 'Hide Technical Log' : 'View Technical Log'}
                          </button>
                        </div>

                        {showRawError && (
                          <div className="p-3 rounded-xl bg-slate-100 text-slate-700 font-mono text-[10px] break-all border border-slate-200">
                            {testResult.error}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="p-3.5 rounded-xl text-xs font-medium flex flex-col gap-2 bg-rose-50 border border-rose-200 text-rose-800 animate-in fade-in duration-150">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-bold">Verification Failed: </span>
                          <span>{testResult.error}</span>
                        </div>
                      </div>
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/docs?provider=${provider}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-rose-200 text-rose-900 font-bold text-[11px] hover:bg-rose-100/50 transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3 text-rose-700" />
                          <span>Open {provider.toUpperCase()} Guide in Docs</span>
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Save Status Banner */}
            {saveStatus && (
              <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150 ${
                saveStatus.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveStatus.message}</span>
              </div>
            )}

            {/* Save Configuration Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveIntegration}
                disabled={savingIntegration || !senderEmail}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {savingIntegration && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Save Email Provider Settings</span>
              </button>
            </div>
          </div>
        </div>

      {/* ================================================================
          2. PROFILE, QUOTAS & SECURITY (3 BALANCED SIDE-BY-SIDE COLUMNS)
         ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: User Profile */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                {user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">User Profile</h2>
                <span className="text-xs text-slate-500 truncate block max-w-[180px]">{user?.email}</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs pt-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Account Status & Role
                </span>
                <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{isAdmin ? 'Super Admin (Root)' : 'Verified SaaS Tenant'}</span>
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
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : 'Active'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Plan & Usage Quota */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Plan & Usage</h2>
                  <p className="text-xs text-slate-500">Early Adopter Tier</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active Tier
              </span>
            </div>

            <div className="space-y-4 text-xs pt-4">
              <div>
                <div className="flex items-center justify-between font-semibold mb-1.5">
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
                <div className="flex items-center justify-between font-semibold mb-1.5">
                  <span className="text-slate-700">Active Campaigns</span>
                  <span className="font-bold text-slate-900">{campaignsCount} / Unlimited</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 mt-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Unlimited B2B Prospecting</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Provisioned with unlimited automated queries, AI pitch generation, and contact resolution.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Security & Password */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Update Password</h2>
                <p className="text-xs text-slate-500">Security compliance credentials</p>
              </div>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-3 pt-4 text-xs">
              {passwordStatus && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150 ${
                  passwordStatus.type === 'success' 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {passwordStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="text-[11px]">{passwordStatus.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, symbol & number"
                    className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Password strength meter */}
              {newPassword && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Strength</span>
                    <span className={`font-bold ${passwordStrength.textColor}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300`} 
                      style={{ width: `${passwordStrength.score}%` }} 
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer mt-2"
              >
                {updatingPassword && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
