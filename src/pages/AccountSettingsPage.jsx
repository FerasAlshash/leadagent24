import React, { useState, useEffect, useRef } from 'react';
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
  Eye,
  EyeOff,
  Send,
  Server,
  Check,
  ExternalLink,
  BookOpen,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit2,
  Key,
  RefreshCw,
  X,
  Search,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import { checkPasswordStrength } from '../utils/passwordValidator';
import { diagnoseEmailError } from '../utils/emailDiagnostics';
import { getProviderVisual, ResendLogo, BrevoLogo, SendGridLogo, SmtpLogo } from '../components/ProviderLogos';
import PageHeader from '../components/PageHeader';

const PROVIDER_GUIDES = {
  resend: {
    name: 'Resend',
    checklist: [
      {
        step: '1. Resend DNS Authentication',
        badge: 'TXT & MX Records',
        desc: 'In Resend Dashboard > Domains, add the provided SPF TXT (include:amazonses.com) and DKIM TXT (resend._domainkey) records into your DNS provider (Cloudflare, Namecheap, GoDaddy).'
      },
      {
        step: '2. Generate API Key',
        badge: 'Starts with re_',
        desc: 'Go to Resend > API Keys. Create an API key with "Sending Access" or "Full Access", copy the token (begins with re_), and save it securely in this vault.'
      },
      {
        step: '3. In-Campaign Usage',
        badge: 'Verified Domain',
        desc: 'Inside any campaign, select this Resend credential and set your sender address using your verified domain (e.g. outreach@yourcompany.com).'
      }
    ]
  },
  brevo: {
    name: 'Brevo',
    checklist: [
      {
        step: '1. Brevo DNS & Code Verification',
        badge: 'TXT & DKIM',
        desc: 'In Brevo > Senders & IP > Domains, add the Brevo verification code (brevo-code=...) alongside the DKIM (mail._domainkey) and SPF TXT records to achieve "Authenticated" status.'
      },
      {
        step: '2. Generate v3 API Key',
        badge: 'Starts with xkeysib-',
        desc: 'Navigate to your Brevo Account > SMTP & API > API Keys tab. Generate a new v3 API key (begins with xkeysib-), copy it, and paste it into this vault.'
      },
      {
        step: '3. In-Campaign Usage',
        badge: 'Validated Sender',
        desc: 'Ensure your sender email is added and verified under Brevo Senders before launching outreach campaigns to avoid 400 Sender Validation errors.'
      }
    ]
  },
  sendgrid: {
    name: 'SendGrid',
    checklist: [
      {
        step: '1. Automated Security CNAMEs',
        badge: '3 CNAME Records',
        desc: 'In SendGrid > Settings > Sender Authentication > Domain Authentication, copy the 3 generated CNAME records (emXXXX, s1, s2._domainkey) into your DNS management console.'
      },
      {
        step: '2. Generate Restricted API Key',
        badge: 'Starts with SG.',
        desc: 'In Settings > API Keys, generate a key with "Restricted Access > Mail Send: Full Access" (or Full Access). Copy the key (starts with SG.) immediately as it is only shown once.'
      },
      {
        step: '3. In-Campaign Usage',
        badge: 'Authenticated Sender',
        desc: 'Verify Single Sender or Domain Authentication is verified in SendGrid, then link this credential to any outbound campaign sequence.'
      }
    ]
  },
  smtp: {
    name: 'Custom SMTP',
    checklist: [
      {
        step: '1. Host & Port Configuration',
        badge: 'Host:Port 587/465',
        desc: 'Enter your mail host (e.g. smtp.gmail.com, smtp.office365.com, or private Postfix/Haraka). Use Port 587 (STARTTLS) or Port 465 (SSL/TLS).'
      },
      {
        step: '2. App Password (No API Key)',
        badge: 'App-Specific Password',
        desc: 'Do not use your main account password! For Google Workspace or Microsoft 365, generate a dedicated 16-character "App Password" in your account security center.'
      },
      {
        step: '3. In-Campaign Usage',
        badge: 'Matching Sender Email',
        desc: 'The campaign sender email address must strictly match your authenticated SMTP username to satisfy mail server relay policies and anti-spoofing rules.'
      }
    ]
  }
};

export default function AccountSettingsPage({ leadsCount = 0, campaignsCount = 0 }) {
  const { user, profile, loading: authLoading, updatePassword, signOut } = useAuth();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = (user?.email || '').toLowerCase() === 'ferasalshash@gmail.com';

  // =========================================================================
  // TAB NAVIGATION STATE (Credentials Vault vs. User Profile & Security)
  // =========================================================================
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'credentials');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Password update form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  const passwordStrength = checkPasswordStrength(newPassword);

  // =========================================================================
  // CREDENTIALS VAULT STATE & FILTERS
  // =========================================================================
  const [credentialsList, setCredentialsList] = useState([]);
  const [loadingCredentials, setLoadingCredentials] = useState(true);
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [editingCredId, setEditingCredId] = useState(null);
  const [savingCred, setSavingCred] = useState(false);
  const [credStatus, setCredStatus] = useState(null);

  // Search, Filter & Sort for credentials
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Custom Dropdown UI State & Click-Outside Refs
  const providerDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (providerDropdownRef.current && !providerDropdownRef.current.contains(e.target)) {
        setProviderDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAndSortedCredentials = credentialsList
    .filter(cred => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (cred.name || '').toLowerCase().includes(q) ||
        (cred.provider || '').toLowerCase().includes(q) ||
        (cred.smtp_host || '').toLowerCase().includes(q);
      const matchesProvider = providerFilter === 'all' || (cred.provider || '').toLowerCase() === providerFilter.toLowerCase();
      return matchesSearch && matchesProvider;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  const [credForm, setCredForm] = useState({
    name: '',
    provider: 'resend',
    apiKey: '',
    showApiKey: false,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    showSmtpPass: false
  });

  // Test Email state
  const [testModalCred, setTestModalCred] = useState(null);
  const [testRecipient, setTestRecipient] = useState(user?.email || '');
  const [testSenderEmail, setTestSenderEmail] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showRawError, setShowRawError] = useState(false);

  // Guide state
  const [guideProvider, setGuideProvider] = useState('resend');

  const fetchCredentials = async () => {
    setLoadingCredentials(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('http://127.0.0.1:8000/api/email-integrations/credentials', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCredentialsList(data.credentials || []);
      }
    } catch (err) {
      console.warn('Could not fetch credentials:', err);
    } finally {
      setLoadingCredentials(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, [user]);

  const handleOpenAddCredModal = () => {
    setEditingCredId(null);
    setCredForm({
      name: '',
      provider: 'resend',
      apiKey: '',
      showApiKey: false,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      showSmtpPass: false
    });
    setCredStatus(null);
    setIsCredModalOpen(true);
  };

  const handleOpenEditCredModal = (cred) => {
    setEditingCredId(cred.id);
    setCredForm({
      name: cred.name || '',
      provider: cred.provider || 'resend',
      apiKey: cred.api_key_masked || '',
      showApiKey: false,
      smtpHost: cred.smtp_host || '',
      smtpPort: cred.smtp_port || 587,
      smtpUser: cred.smtp_user || '',
      smtpPass: '',
      showSmtpPass: false
    });
    setCredStatus(null);
    setIsCredModalOpen(true);
  };

  const handleSaveCredential = async (e) => {
    e.preventDefault();
    if (!credForm.name.trim()) {
      setCredStatus({ type: 'error', message: 'Please provide a name for this credential.' });
      return;
    }
    setSavingCred(true);
    setCredStatus(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const payload = {
        id: editingCredId || undefined,
        name: credForm.name.trim(),
        provider: credForm.provider,
        api_key: credForm.apiKey ? credForm.apiKey.trim() : undefined,
        smtp_host: credForm.smtpHost ? credForm.smtpHost.trim() : undefined,
        smtp_port: Number(credForm.smtpPort) || 587,
        smtp_user: credForm.smtpUser ? credForm.smtpUser.trim() : undefined,
        smtp_pass: credForm.smtpPass ? credForm.smtpPass : undefined
      };

      const res = await fetch('http://127.0.0.1:8000/api/email-integrations/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Failed to save credential.');
      }

      await fetchCredentials();
      setIsCredModalOpen(false);
    } catch (err) {
      setCredStatus({ type: 'error', message: err.message });
    } finally {
      setSavingCred(false);
    }
  };

  const handleDeleteCredential = async (credId, credName) => {
    const ok = await confirm({
      title: 'Delete Credential',
      message: `Are you sure you want to delete credential "${credName}" from your Vault? Any campaigns currently bound to it will need to be reconfigured.`,
      confirmText: 'Delete Credential',
      isDanger: true
    });
    if (!ok) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`http://127.0.0.1:8000/api/email-integrations/credentials/${credId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        setCredentialsList(prev => prev.filter(c => c.id !== credId));
      }
    } catch (err) {
      alert('Failed to delete credential: ' + err.message);
    }
  };

  const handleOpenTestModal = (cred) => {
    setTestModalCred(cred);
    setTestSenderEmail('');
    setTestResult(null);
    setShowRawError(false);
  };

  const handleRunTestDispatch = async () => {
    if (!testSenderEmail.trim()) {
      alert('Please enter an authorized Sender Email to test dispatch.');
      return;
    }
    setTestingConnection(true);
    setTestResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const payload = {
        credential_id: testModalCred.id,
        provider: testModalCred.provider,
        sender_email: testSenderEmail.trim(),
        sender_name: 'LeadAgent Prospecting Team',
        test_recipient: testRecipient || user?.email || 'test@example.com'
      };

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
          message: data.message || `Test email dispatched successfully via ${testModalCred.name}!`
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

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 8) {
      setPasswordStatus({
        type: 'error',
        message: 'Password must be at least 8 characters long.'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'Passwords do not match. Please re-enter.'
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
        message: 'Your password was updated successfully.'
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
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Page Header Card */}
      <PageHeader
        icon={Key}
        title="Account Settings & Infrastructure"
        subtitle="Manage provider credentials vault, security policies, and cold email deliverability."
        badges={
          <>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              Credentials Vault
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600">
              Security & Deliverability
            </span>
          </>
        }
        actions={
          <button
            type="button"
            onClick={() => navigate('/docs?tab=overview')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Integration & Security Docs</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
          </button>
        }
      />

      {/* Navigation Tabs (n8n Style) */}
      <div className="flex items-center gap-6 border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleTabChange('credentials')}
          className={`pb-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all relative cursor-pointer ${
            activeTab === 'credentials'
              ? 'text-emerald-700 border-b-2 border-emerald-600 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Credentials Vault</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            activeTab === 'credentials' 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            {credentialsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('user')}
          className={`pb-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all relative cursor-pointer ${
            activeTab === 'user'
              ? 'text-emerald-700 border-b-2 border-emerald-600 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>User Profile & Security</span>
        </button>
      </div>

      {/* ================================================================
          1. TAB 1: PROVIDER CREDENTIALS VAULT (n8n-STYLE HORIZONTAL ROWS)
         ================================================================ */}
      {activeTab === 'credentials' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Top Search, Filter, Sort & Action Toolbar (n8n Header) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search credentials by name, provider, host..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Provider Filter & Sort Custom Dropdowns */}
              <div className="flex items-center gap-2">
                {/* Provider Filter Dropdown */}
                <div className="relative" ref={providerDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setProviderDropdownOpen(prev => !prev);
                      setSortDropdownOpen(false);
                    }}
                    className={`h-[38px] px-3 text-xs font-semibold rounded-xl border bg-white hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                      providerDropdownOpen
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-800'
                        : providerFilter !== 'all'
                          ? 'border-emerald-300 text-slate-900 bg-emerald-50/40'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {providerFilter === 'all' ? (
                      <>
                        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>All Providers</span>
                      </>
                    ) : (
                      (() => {
                        const pMeta = getProviderVisual(providerFilter);
                        const PLogo = pMeta.LogoComponent;
                        return (
                          <>
                            <div className={`w-4 h-4 rounded-md ${pMeta.bg} flex items-center justify-center shrink-0 shadow-2xs`}>
                              <PLogo className="w-2.5 h-2.5" />
                            </div>
                            <span className="font-bold text-slate-900">{pMeta.shortName}</span>
                          </>
                        );
                      })()
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ml-0.5 ${providerDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>

                  {/* Provider Dropdown Popover */}
                  {providerDropdownOpen && (
                    <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Filter by Provider
                      </div>

                      {/* Option: All Providers */}
                      <button
                        type="button"
                        onClick={() => {
                          setProviderFilter('all');
                          setProviderDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                          providerFilter === 'all' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                            <Filter className="w-3 h-3" />
                          </div>
                          <span>All Providers</span>
                        </div>
                        {providerFilter === 'all' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      {/* Provider Options */}
                      {['resend', 'brevo', 'sendgrid', 'smtp'].map((pId) => {
                        const pMeta = getProviderVisual(pId);
                        const PLogo = pMeta.LogoComponent;
                        const isSelected = providerFilter === pId;
                        return (
                          <button
                            key={pId}
                            type="button"
                            onClick={() => {
                              setProviderFilter(pId);
                              setProviderDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                              isSelected ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-5 h-5 rounded-md ${pMeta.bg} flex items-center justify-center shadow-2xs shrink-0`}>
                                <PLogo className="w-3 h-3" />
                              </div>
                              <span className="font-semibold">{pMeta.shortName}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({pMeta.tag})</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sort Order Dropdown */}
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setSortDropdownOpen(prev => !prev);
                      setProviderDropdownOpen(false);
                    }}
                    className={`h-[38px] px-3 text-xs font-semibold rounded-xl border bg-white hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                      sortDropdownOpen
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-800'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {sortBy === 'newest' && 'Sort: Newest'}
                      {sortBy === 'oldest' && 'Sort: Oldest'}
                      {sortBy === 'name' && 'Sort: Name (A-Z)'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ml-0.5 ${sortDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>

                  {/* Sort Dropdown Popover */}
                  {sortDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Sort Order
                      </div>

                      {[
                        { id: 'newest', label: 'Newest First' },
                        { id: 'oldest', label: 'Oldest First' },
                        { id: 'name', label: 'Name (A-Z)' }
                      ].map((option) => {
                        const isSelected = sortBy === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setSortBy(option.id);
                              setSortDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                              isSelected ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                            }`}
                          >
                            <span>{option.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <button
              type="button"
              onClick={handleOpenAddCredModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Connect New Provider</span>
            </button>
          </div>

          {/* Credentials Horizontal List */}
          {loadingCredentials ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-400 flex flex-col items-center gap-2 shadow-2xs">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading credentials vault...</span>
            </div>
          ) : credentialsList.length === 0 ? (
            <div className="p-10 rounded-3xl border-2 border-dashed border-slate-200 bg-white text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                <Key className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-sm font-bold text-slate-800">No Email Provider Credentials Added Yet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connect your Resend, Brevo, SendGrid, or SMTP server keys here once. You can then attach them effortlessly to any outbound prospecting campaign.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddCredModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect Your First Provider Key</span>
              </button>
            </div>
          ) : filteredAndSortedCredentials.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2 shadow-2xs">
              <p className="text-xs font-bold text-slate-700">No credentials match your search filter</p>
              <p className="text-[11px] text-slate-400">Try adjusting your search term or clearing the provider filter.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setProviderFilter('all'); }}
                className="text-xs font-bold text-emerald-600 hover:underline pt-1 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredAndSortedCredentials.map((cred) => {
                const meta = getProviderVisual(cred.provider);
                return (
                  <div 
                    key={cred.id} 
                    className="p-4 sm:p-4.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    {/* Left: Provider Logo & Identity */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl ${meta.bg} flex items-center justify-center shrink-0 shadow-2xs`}>
                        {meta.icon}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate" title={cred.name}>
                            {cred.name}
                          </h3>
                          <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${meta.badge}`}>
                            {cred.provider}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                          <span className="font-medium text-slate-700">{meta.name}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-[11px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                            {cred.provider === 'smtp' ? `${cred.smtp_host || 'Custom SMTP'}:${cred.smtp_port || 587}` : (cred.api_key_masked || '••••••••••••••••')}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-400">
                            Created {cred.created_at ? new Date(cred.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Saved'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Metadata Badges & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shadow-2xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 ml-1">
                        <button
                          type="button"
                          onClick={() => handleOpenTestModal(cred)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Test</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditCredModal(cred)}
                          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Credential"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCredential(cred.id, cred.name)}
                          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Credential"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Integration Guides & Troubleshooting Accordion / Banner */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Integration Guides & DNS Verification Assistance</h4>
                  <p className="text-[11px] text-slate-500">
                    Step-by-step guides for domain authentication (SPF, DKIM, DMARC) and API key generation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {['resend', 'brevo', 'sendgrid', 'smtp'].map((p) => {
                  const pMeta = getProviderVisual(p);
                  const PLogo = pMeta.LogoComponent;
                  const isActive = guideProvider === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setGuideProvider(p)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <PLogo className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{pMeta.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Guide Card - Dynamically Tailored per Provider */}
            {(() => {
              const currentGuide = PROVIDER_GUIDES[guideProvider] || PROVIDER_GUIDES.resend;
              return (
                <div className="p-4 rounded-2xl border border-slate-200 bg-white text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      {currentGuide.name.toUpperCase()} Integration Checklist
                    </span>
                    <a 
                      href={`/docs?provider=${guideProvider}`}
                      className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <span>Open Full Documentation</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px]">
                    {currentGuide.checklist.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-slate-800 block">{item.step}</span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-slate-500 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* ================================================================
          2. CONNECT / EDIT CREDENTIAL MODAL
         ================================================================ */}
      {isCredModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingCredId ? 'Edit Provider Credential' : 'Connect New Provider Credential'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure API key or server authentication for outbound delivery.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCredModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {credStatus && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-start gap-2 ${
                credStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {credStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <span>{credStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredential} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Credential Name / Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hireley Resend Master or Agency Brevo"
                  value={credForm.name}
                  onChange={(e) => setCredForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Email Service Provider</span>
                  {editingCredId && (
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Fixed Provider</span>
                    </span>
                  )}
                </label>

                {editingCredId ? (
                  // Locked Read-Only Provider for Edit Mode
                  (() => {
                    const currentMeta = getProviderVisual(credForm.provider);
                    const ProviderLogo = currentMeta.LogoComponent;
                    return (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl ${currentMeta.bg} flex items-center justify-center shrink-0 shadow-2xs`}>
                            <ProviderLogo className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{currentMeta.name}</span>
                              <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md border ${currentMeta.pill}`}>
                                {credForm.provider}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              Provider is locked for this credential. To use another service, connect a new provider.
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 shadow-2xs">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Locked</span>
                        </span>
                      </div>
                    );
                  })()
                ) : (
                  // Selectable Providers for Add Mode
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['resend', 'brevo', 'sendgrid', 'smtp'].map((providerId) => {
                      const p = getProviderVisual(providerId);
                      const PLogo = p.LogoComponent;
                      const isSelected = credForm.provider === providerId;
                      return (
                        <button
                          key={providerId}
                          type="button"
                          onClick={() => setCredForm(prev => ({ ...prev, provider: providerId }))}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`w-6 h-6 rounded-lg ${p.bg} flex items-center justify-center shrink-0 shadow-2xs`}>
                              <PLogo className="w-3.5 h-3.5" />
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs leading-tight">{p.shortName}</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">{p.tag}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {credForm.provider !== 'smtp' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {credForm.provider.toUpperCase()} API Key <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={credForm.showApiKey ? 'text' : 'password'}
                      required
                      placeholder={
                        credForm.provider === 'resend' ? 're_123456789...' :
                        credForm.provider === 'sendgrid' ? 'SG.xxxxxxxxxxxx...' :
                        'xkeysib-xxxxxxxxxxxx...'
                      }
                      value={credForm.apiKey}
                      onChange={(e) => setCredForm(prev => ({ ...prev, apiKey: e.target.value }))}
                      className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setCredForm(prev => ({ ...prev, showApiKey: !prev.showApiKey }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {credForm.showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Key will be verified with {credForm.provider.toUpperCase()} upon saving.</span>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">SMTP Host</label>
                    <input
                      type="text"
                      placeholder="smtp.domain.com"
                      value={credForm.smtpHost}
                      onChange={(e) => setCredForm(prev => ({ ...prev, smtpHost: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Port</label>
                    <input
                      type="number"
                      placeholder="587"
                      value={credForm.smtpPort}
                      onChange={(e) => setCredForm(prev => ({ ...prev, smtpPort: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Username</label>
                    <input
                      type="text"
                      placeholder="user@domain.com"
                      value={credForm.smtpUser}
                      onChange={(e) => setCredForm(prev => ({ ...prev, smtpUser: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={credForm.smtpPass}
                      onChange={(e) => setCredForm(prev => ({ ...prev, smtpPass: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCredModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCred}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {savingCred && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingCredId ? 'Update Credential' : 'Save & Verify Key'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          3. TEST DISPATCH MODAL
         ================================================================ */}
      {testModalCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                {(() => {
                  const pMeta = getProviderVisual(testModalCred.provider);
                  const PLogo = pMeta.LogoComponent;
                  return (
                    <div className={`w-8 h-8 rounded-xl ${pMeta.bg} flex items-center justify-center shrink-0 shadow-2xs`}>
                      <PLogo className="w-4 h-4" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Test Dispatch: {testModalCred.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {getProviderVisual(testModalCred.provider).name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTestModalCred(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Authorized Sender Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. partners@hireley.net or tamer@merotix.com"
                  value={testSenderEmail}
                  onChange={(e) => setTestSenderEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-medium"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Must be an authenticated domain or verified sender in your {testModalCred.provider.toUpperCase()} account.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Test Recipient Email
                </label>
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-medium"
                />
              </div>

              {testResult && (
                <div className={`p-2.5 rounded-xl border text-[11px] font-semibold flex items-start gap-2 ${
                  testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                  <span className="leading-relaxed">{testResult.message || testResult.error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTestModalCred(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleRunTestDispatch}
                  disabled={testingConnection || !testSenderEmail}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {testingConnection && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>Dispatch Verification Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          2. TAB 2: PROFILE, QUOTAS & SECURITY (3 BALANCED COLUMNS)
         ================================================================ */}
      {activeTab === 'user' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          
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
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
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
      )}

    </div>
  );
}
