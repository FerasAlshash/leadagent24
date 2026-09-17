import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Zap,
  Mail,
  Key,
  Server,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowLeft,
  ChevronRight,
  Shield,
  HelpCircle,
  AlertCircle,
  Info,
  Clock,
  Globe,
  RefreshCw,
  Lock,
  Layers,
  FileText,
  Check,
  XCircle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function DocumentationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const providerParam = searchParams.get('provider') || 'brevo';
  const [activeTab, setActiveTab] = useState(providerParam);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchParams.get('provider')) {
      setActiveTab(searchParams.get('provider'));
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ provider: tabId });
  };

  const navTopics = [
    {
      id: 'brevo',
      name: 'Brevo (Sendinblue)',
      subtitle: '300 emails/day free • Recommended',
      icon: Zap,
      tag: 'Recommended'
    },
    {
      id: 'sendgrid',
      name: 'Twilio SendGrid',
      subtitle: '100 emails/day free • Enterprise',
      icon: Mail,
      tag: 'Twilio'
    },
    {
      id: 'resend',
      name: 'Resend API',
      subtitle: '3,000 emails/mo • Modern REST API',
      icon: Key,
      tag: 'Modern'
    },
    {
      id: 'smtp',
      name: 'Custom SMTP & Gmail',
      subtitle: 'Google App Passwords, cPanel & TLS',
      icon: Server,
      tag: 'Universal'
    },
    {
      id: 'deliverability',
      name: 'Deliverability & DNS',
      subtitle: 'SPF, DKIM & DMARC inbox placement',
      icon: ShieldCheck,
      tag: 'Best Practices'
    },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200 pb-16">
      
      {/* 1. Page Header Hero Card */}
      <PageHeader
        icon={BookOpen}
        title="Integration Guides & Troubleshooting"
        subtitle="Detailed walkthroughs, API credential guides, and security setup for your outbound email dispatchers."
        badges={
          <>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              Knowledge Base & Integrations
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600">
              DNS & API Setup
            </span>
          </>
        }
      />

      {/* 2. Main Two-Column Layout (No Horizontal Scroll, Full Spacious Width) */}
      <div className="flex flex-col lg:flex-row items-start gap-8 w-full">
        
        {/* Left Sidebar Menu (Vertical Navigation) */}
        <aside className="w-full lg:w-80 shrink-0 space-y-4">
          
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics & error codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs transition-all"
            />
          </div>

          {/* Vertical Menu Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 p-3 shadow-2xs space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Email Dispatch Providers
            </div>

            {navTopics.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs truncate">{item.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        isActive ? 'bg-emerald-700/60 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.tag}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 truncate ${
                      isActive ? 'text-emerald-100' : 'text-slate-400'
                    }`}>
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div className="p-4 rounded-3xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Multi-Tenant Cold Mail</span>
            </div>
            <p className="text-[11px] text-emerald-800/90 leading-relaxed">
              Every client workspace can connect its own corporate email provider. All campaigns dispatch securely using your verified sender reputation.
            </p>
          </div>
        </aside>

        {/* Right Main Content Area (Spacious & Full Width) */}
        <main className="flex-1 min-w-0 space-y-6 w-full">
          
          {/* ============================================================
              1. BREVO GUIDE
             ============================================================ */}
          {activeTab === 'brevo' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Overview Hero Card */}
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-slate-900">Brevo (formerly Sendinblue)</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                      Recommended Provider
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    Brevo offers <strong>300 free emails per day</strong> (approx. 9,000/month) with zero credit card required. Fast delivery, high inbox rates, and real-time logs make it the top choice for automated business prospecting.
                  </p>
                </div>

                <a
                  href="https://app.brevo.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-colors shadow-2xs"
                >
                  <span>Open Brevo Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 3 Steps in Wide Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Step 1 */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
                      1
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Get REST API v3 Key</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      In your Brevo console, click your Profile Avatar → <strong>SMTP & API</strong> → <strong>API Keys</strong> tab.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div className="font-bold text-slate-800">Must start with:</div>
                      <code className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block truncate">
                        xkeysib-...
                      </code>
                      <span className="text-[10px] text-rose-600 block">Do not copy SMTP password (xsmtpsib-)</span>
                    </div>
                  </div>
                  <a
                    href="https://app.brevo.com/settings/keys/api"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline pt-2"
                  >
                    <span>Direct Link to API Keys ↗</span>
                  </a>
                </div>

                {/* Step 2 */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
                      2
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Verify Sender Email</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Navigate to <strong>Senders & IP</strong> → <strong>Senders</strong>. Add the exact email address you want your cold emails to arrive from.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                      Brevo sends a quick verification link to your inbox. Click it to authorize outgoing emails from that address.
                    </div>
                  </div>
                  <a
                    href="https://app.brevo.com/senders"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline pt-2"
                  >
                    <span>Direct Link to Senders ↗</span>
                  </a>
                </div>

                {/* Step 3 */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
                      3
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Test & Save in SaaS</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Go to <strong>Account Settings → Outbound Email</strong>.
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Select Brevo, enter your verified email and API key, and test delivery with <strong>Send Test Email</strong>. Once green, click Save!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline pt-2 cursor-pointer"
                  >
                    <span>Open Account Settings ↗</span>
                  </button>
                </div>

              </div>

              {/* Troubleshooting: IP Whitelist Solution */}
              <div id="brevo-ip-whitelist" className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900">Critical Brevo Security Rules & Solutions</h3>
                </div>

                <div className="p-6 rounded-3xl bg-white border-2 border-amber-300 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                        IP Whitelisting
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        Error: &ldquo;We have detected you are using an unrecognised IP address&rdquo;
                      </h4>
                    </div>
                    <a
                      href="https://app.brevo.com/security/authorised_ips"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-2xs"
                    >
                      <span>Open Brevo IP Security Settings</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Brevo accounts often have &ldquo;Authorized IPs&rdquo; active. If an API request originates from a network IP not on your list, Brevo blocks it. Because dynamic internet connections (and cloud servers) change IPs, this will trigger a verification failure.
                  </p>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 text-xs">
                    <div className="font-bold text-slate-900">Two Fast Ways to Solve This:</div>
                    <div className="space-y-2 text-slate-700 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold shrink-0 text-xs">A</span>
                        <div>
                          <strong>Method A (Recommended):</strong> Go to{' '}
                          <a href="https://app.brevo.com/security/authorised_ips" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">
                            Brevo Security → Authorized IPs
                          </a>{' '}
                          and disable IP whitelisting. This allows your key to function smoothly from any computer or cloud server.
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold shrink-0 text-xs">B</span>
                        <div>
                          <strong>Method B:</strong> Whenever Brevo detects a new IP, it sends an automated security email with the title <em>&ldquo;Authorize new IP address&rdquo;</em>. Open that email and click <strong>Authorize</strong>.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================
              2. SENDGRID GUIDE
             ============================================================ */}
          {activeTab === 'sendgrid' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header Banner */}
              <div className="p-6 rounded-3xl bg-blue-50/80 border border-blue-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-slate-900">Twilio SendGrid Setup</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                      100 Free/Day Forever
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
                      Enterprise Standard
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    Twilio SendGrid is an industry benchmark for deliverability. The free tier gives 100 emails/day forever with deep analytics, robust bounce processing, and global ISP relationships.
                  </p>
                </div>

                <a
                  href="https://app.sendgrid.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-colors shadow-2xs"
                >
                  <span>Open SendGrid Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 3 Steps in Wide Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Step 1 */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                      1
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Create API Key with Mail Send</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      In SendGrid, go to <strong>Settings → API Keys → Create API Key</strong>. Choose <strong>Full Access</strong> (or Restricted Access with <strong>Mail Send</strong> toggled to Full Access).
                    </p>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div className="font-bold text-slate-800">Must start with:</div>
                      <code className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block truncate">
                        SG.xxxxxxxxxxxx...
                      </code>
                      <span className="text-[10px] text-amber-600 block">Copy immediately: SendGrid shows this secret key only once!</span>
                    </div>
                  </div>
                  <a
                    href="https://app.sendgrid.com/settings/api_keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline pt-2"
                  >
                    <span>Go to SendGrid API Keys ↗</span>
                  </a>
                </div>

                {/* Step 2 */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                      2
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Authenticate Sender Identity</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      SendGrid strictly blocks dispatches from unverified addresses. Go to <strong>Settings → Sender Authentication</strong>.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-2">
                      <div>
                        <strong className="text-slate-800 block font-semibold">Option A (Fastest): Single Sender</strong>
                        Verify an individual address (e.g. <code>you@domain.com</code>) via email confirmation link.
                      </div>
                      <div className="pt-1 border-t border-slate-200">
                        <strong className="text-slate-800 block font-semibold">Option B (Best Deliverability): Domain Auth</strong>
                        Add 3 CNAME records in your DNS manager to remove the <em>&ldquo;via sendgrid.net&rdquo;</em> tag.
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://app.sendgrid.com/settings/sender_auth"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline pt-2"
                  >
                    <span>Go to Sender Authentication ↗</span>
                  </a>
                </div>

                {/* Step 3 */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                      3
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Test & Connect in LeadAgent</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Navigate to <strong>Account Settings → Outbound Email Accounts</strong>.
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Select SendGrid, enter your verified sender email and <code>SG.</code> key. Click <strong>Send Test Email</strong> to verify authentication before saving.
                    </p>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                      ✓ Instant confirmation of API validity, sender match, and 100/day quota.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline pt-2 cursor-pointer"
                  >
                    <span>Open Account Settings ↗</span>
                  </button>
                </div>

              </div>

              {/* Troubleshooting: SendGrid Common Errors & Solutions */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900">SendGrid Troubleshooting & Error Solutions</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Error Card 1 */}
                  <div className="p-5 rounded-3xl bg-white border-2 border-rose-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                        Error 403 Forbidden
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">from_address_unverified</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">
                      &ldquo;The from address does not match a verified Sender Identity&rdquo;
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Why it happens:</strong> You entered a sender email in LeadAgent that hasn&apos;t been verified in SendGrid&apos;s Single Sender list or Domain Authentication.
                    </p>
                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-[11px] text-rose-900 space-y-1">
                      <div className="font-bold">Resolution:</div>
                      <div>1. Open SendGrid → Settings → Sender Authentication.</div>
                      <div>2. Click &ldquo;Verify a Single Sender&rdquo;, input your email, and click the confirmation link in your inbox.</div>
                    </div>
                    <a
                      href="https://app.sendgrid.com/settings/sender_auth"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline pt-1"
                    >
                      <span>Verify Sender Identity in SendGrid ↗</span>
                    </a>
                  </div>

                  {/* Error Card 2 */}
                  <div className="p-5 rounded-3xl bg-white border-2 border-amber-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                        Error 403 Forbidden
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">access_forbidden_scope</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">
                      &ldquo;Access Forbidden: You do not have permission to access this resource&rdquo;
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Why it happens:</strong> The API key was generated with &ldquo;Restricted Access&rdquo; but the <strong>Mail Send</strong> permission was set to &ldquo;No Access&rdquo; or &ldquo;Read Access&rdquo;.
                    </p>
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                      <div className="font-bold">Resolution:</div>
                      <div>Create a new API Key in SendGrid, and select <strong>Full Access</strong> (or ensure &ldquo;Mail Send&rdquo; is set to Full Access).</div>
                    </div>
                    <a
                      href="https://app.sendgrid.com/settings/api_keys"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline pt-1"
                    >
                      <span>Re-create API Key with Mail Send ↗</span>
                    </a>
                  </div>

                  {/* Error Card 3 */}
                  <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 uppercase">
                        Error 401 Unauthorized
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">invalid_grant</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">
                      &ldquo;The provided authorization grant is invalid, expired, or revoked&rdquo;
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Why it happens:</strong> Incomplete API key copied, extra whitespace, or the key was revoked in SendGrid.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
                      <div className="font-bold">Resolution:</div>
                      <div>SendGrid API keys are 69 characters long and always start with <code className="font-bold">SG.</code>. Ensure no leading or trailing spaces are present.</div>
                    </div>
                  </div>

                  {/* Error Card 4 */}
                  <div className="p-5 rounded-3xl bg-white border-2 border-blue-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                        Account Security Hold
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">account_under_review</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">
                      New Account Temporary Hold (&ldquo;Account Under Review&rdquo;)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Why it happens:</strong> Twilio SendGrid frequently places brand-new free accounts in an automated security review for 12–24 hours to curb spam.
                    </p>
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-[11px] text-blue-900 space-y-1">
                      <div className="font-bold">Resolution:</div>
                      <div>Check your email for a verification request from Twilio Support, or click &ldquo;Contact Support&rdquo; in your SendGrid dashboard to activate your sending capabilities immediately.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deliverability Pro-Tips for SendGrid */}
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-900">SendGrid Outbound Deliverability Best Practices</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 pt-1">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800">Avoid Free Webmail Senders</div>
                    <p className="text-[11px] text-slate-500">Never use free <code>@gmail.com</code> or <code>@yahoo.com</code> as your sender on SendGrid. DMARC will block or spam your messages. Use a custom domain.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800">Complete 3 CNAME Records</div>
                    <p className="text-[11px] text-slate-500">Domain Authentication adds automated DKIM keys and custom Return-Path, removing <em>&ldquo;via sendgrid.net&rdquo;</em> from recipient headers.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800">Warm Up Gradually</div>
                    <p className="text-[11px] text-slate-500">Don&apos;t blast 100 emails on minute one. Start your campaigns with 15–25 emails/day for the first 3 days to build an immaculate sender reputation.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================
              3. RESEND GUIDE
             ============================================================ */}
          {activeTab === 'resend' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header Banner */}
              <div className="p-6 rounded-3xl bg-violet-50/80 border border-violet-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-slate-900">Resend API Integration</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-600 text-white uppercase tracking-wider">
                      3,000 Free/Mo (100/day)
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200 uppercase tracking-wider">
                      Modern Developer Platform
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    Resend provides 3,000 free emails/month (100/day) with ultra-fast sub-second dispatch speeds, modern REST architecture, and clean DNS verification for high-performing cold outreach.
                  </p>
                </div>

                <a
                  href="https://resend.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-colors shadow-2xs"
                >
                  <span>Open Resend Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 3 Steps in Wide Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Step 1 */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold text-sm border border-violet-200">
                      1
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Generate Resend API Key</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      In your Resend dashboard, click <strong>API Keys → Create API Key</strong>. Choose permission: <strong>Sending access</strong> (or Full access) on <strong>All Domains</strong>.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div className="font-bold text-slate-800">Must start with:</div>
                      <code className="font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200 block truncate">
                        re_xxxxxxxxxxxx...
                      </code>
                      <span className="text-[10px] text-slate-400 block">Keys are immediately active across all your verified domains.</span>
                    </div>
                  </div>
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 hover:underline pt-2"
                  >
                    <span>Go to Resend Keys ↗</span>
                  </a>
                </div>

                {/* Step 2 */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold text-sm border border-violet-200">
                      2
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Add & Verify Custom Domain</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Go to <strong>Domains → Add Domain</strong>. Enter your domain (e.g. <code>yourcompany.com</code>). Resend generates DKIM, SPF, and MX return-path records.
                    </p>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div className="font-bold text-slate-800">Mandatory Requirement:</div>
                      <div>Add the 3 DNS records in Cloudflare, GoDaddy, or Namecheap, then click <strong>Verify DNS Records</strong>.</div>
                    </div>
                  </div>
                  <a
                    href="https://resend.com/domains"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 hover:underline pt-2"
                  >
                    <span>Go to Resend Domains ↗</span>
                  </a>
                </div>

                {/* Step 3 */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold text-sm border border-violet-200">
                      3
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">Connect & Test in LeadAgent</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Navigate to <strong>Account Settings → Outbound Email Accounts</strong>.
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Select Resend, enter your <code>re_...</code> API key and verified custom domain sender (e.g. <code>contact@yourcompany.com</code>), and click <strong>Send Test Email</strong>.
                    </p>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                      ✓ Lightning fast dispatch verified with zero header overhead.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 hover:underline pt-2 cursor-pointer"
                  >
                    <span>Open Account Settings ↗</span>
                  </button>
                </div>

              </div>

              {/* Troubleshooting: Resend Gotchas & Common Errors */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900">Resend Troubleshooting & Critical Gotchas</h3>
                </div>

                {/* Critical Sandbox Trap Banner */}
                <div className="p-6 rounded-3xl bg-white border-2 border-amber-300 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                        #1 Most Common Resend Error
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        &ldquo;You can only send to your own email address while using onboarding@resend.dev&rdquo;
                      </h4>
                    </div>
                    <a
                      href="https://resend.com/domains"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-2xs"
                    >
                      <span>Add Custom Domain in Resend</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Resend provides a sandbox sender <code>onboarding@resend.dev</code> for initial experimentation. However, Resend <strong>strictly prohibits</strong> sending cold outreach or emailing external clients from <code>onboarding@resend.dev</code>. It will reject every outreach dispatch with a 403 error unless you add your own custom domain.
                  </p>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-slate-800 space-y-1.5">
                    <div className="font-bold text-amber-950">How to unlock real outreach on Resend:</div>
                    <div>1. Go to Resend → <strong>Domains → Add Domain</strong> (e.g. <code>mycompany.com</code>).</div>
                    <div>2. Add the 3 DNS records provided by Resend to your domain registrar.</div>
                    <div>3. Use <code>sales@mycompany.com</code> as your Sender Email Address in LeadAgent. Outreach will now deliver to any external recipient worldwide.</div>
                  </div>
                </div>

                {/* Additional Resend Errors Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Error 1 */}
                  <div className="p-5 rounded-3xl bg-white border-2 border-rose-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                        Error 403
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">domain_not_found</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">
                      &ldquo;Domain not found or not verified&rdquo;
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Occurs if you enter a sender email whose domain hasn&apos;t finished DNS propagation or failed verification in Resend.
                    </p>
                    <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 text-[10px] text-rose-900 font-medium">
                      Fix: Check Resend Domains. Click &ldquo;Verify DNS Records&rdquo; and confirm the green &ldquo;Verified&rdquo; badge.
                    </div>
                  </div>

                  {/* Error 2 */}
                  <div className="p-5 rounded-3xl bg-white border-2 border-blue-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 uppercase">
                        Error 429
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">rate_limit_exceeded</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">
                      &ldquo;Rate limit exceeded (2 req/sec)&rdquo;
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Resend free accounts enforce a 2 request per second burst limit. Rapid successive testing can trigger this.
                    </p>
                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 text-[10px] text-blue-900 font-medium">
                      Notice: LeadAgent&apos;s campaign outreach engine automatically paces dispatches to respect this ceiling cleanly.
                    </div>
                  </div>

                  {/* Error 3 */}
                  <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 uppercase">
                        Error 403
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">restricted_api_key</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">
                      &ldquo;Restricted Key Domain Mismatch&rdquo;
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      If you created an API key restricted specifically to <code>domainA.com</code>, you cannot dispatch emails from <code>domainB.com</code>.
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-700 font-medium">
                      Fix: In Resend API Keys, generate a key with &ldquo;All Domains&rdquo; access.
                    </div>
                  </div>
                </div>
              </div>

              {/* Resend DNS Reference Cheat Sheet */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-violet-600" />
                    <h4 className="text-sm font-bold text-slate-900">Resend DNS Records Quick Reference</h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Standard configuration for Cloudflare / Namecheap / GoDaddy</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Host / Name</th>
                        <th className="py-2.5 px-3">Value / Target</th>
                        <th className="py-2.5 px-3">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-mono">
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-violet-700">TXT / CNAME</td>
                        <td className="py-2.5 px-3">resend._domainkey</td>
                        <td className="py-2.5 px-3 truncate max-w-xs text-slate-500">dkey.resend.com...</td>
                        <td className="py-2.5 px-3 font-sans text-[11px] text-slate-600">DKIM cryptographic signature (Mandatory for Gmail/Yahoo inbox placement)</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-violet-700">TXT</td>
                        <td className="py-2.5 px-3">send (or @)</td>
                        <td className="py-2.5 px-3 text-slate-500">v=spf1 include:amazonses.com ~all</td>
                        <td className="py-2.5 px-3 font-sans text-[11px] text-slate-600">SPF authorization allowing Resend infrastructure to send for your domain</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-violet-700">MX</td>
                        <td className="py-2.5 px-3">send (or feedback-smtp)</td>
                        <td className="py-2.5 px-3 text-slate-500">feedback-smtp.resend.com (Priority 10)</td>
                        <td className="py-2.5 px-3 font-sans text-[11px] text-slate-600">Custom Return-Path routing for automated bounce telemetry</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================
              4. CUSTOM SMTP & GMAIL
             ============================================================ */}
          {activeTab === 'smtp' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Google Workspace & Gmail */}
              <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-amber-950">Google Workspace & Gmail Configuration</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900 uppercase">
                      App Passwords Required
                    </span>
                  </div>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-2xs"
                  >
                    <span>Generate Google App Password</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-5 rounded-2xl bg-white/90 border border-amber-200 space-y-3 text-xs text-slate-700">
                  <p className="font-bold text-slate-900 text-sm">
                    ⚠️ Crucial: Do NOT use your regular Gmail password!
                  </p>
                  <p>
                    Google prohibits third-party SMTP logins using your standard Google account password. You <strong>MUST</strong> generate a 16-character <strong>App Password</strong>:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-800">
                    <li>Ensure <strong>2-Step Verification</strong> is turned on in your Google Account.</li>
                    <li>
                      Visit{' '}
                      <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">
                        https://myaccount.google.com/apppasswords ↗
                      </a>
                    </li>
                    <li>Enter an app name (e.g. <em>&ldquo;Lead Machine SaaS&rdquo;</em>) and click <strong>Create</strong>.</li>
                    <li>Copy the 16-character code (e.g. <code className="font-mono font-bold">abcd efgh ijkl mnop</code>) and paste it into the <strong>SMTP Password</strong> field in Account Settings.</li>
                  </ol>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">SMTP Host</span>
                    <span className="font-bold text-slate-800 text-xs">smtp.gmail.com</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Port</span>
                    <span className="font-bold text-slate-800 text-xs">587</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Encryption</span>
                    <span className="font-bold text-slate-800 text-xs">STARTTLS</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Username</span>
                    <span className="font-bold text-slate-800 text-xs">your@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* cPanel / Hostinger */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900">Custom Domain Webmail (cPanel, Plesk, Hostinger)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Use the outbound mail settings found in cPanel under <strong>Email Accounts → Connect Devices</strong>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">SMTP Host</span>
                    <span className="font-bold text-slate-800 text-xs">mail.yourdomain.com</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Port</span>
                    <span className="font-bold text-slate-800 text-xs">587 (TLS) or 465 (SSL)</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Username</span>
                    <span className="font-bold text-slate-800 text-xs">contact@yourdomain.com</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================
              5. DELIVERABILITY & DNS
             ============================================================ */}
          {activeTab === 'deliverability' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Primary Inbox Placement: 100% Deliverability</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  Major inbox providers (Gmail, Outlook, Yahoo) require cryptographic domain records to confirm authentic senders. Configuring SPF and DKIM ensures your cold outreach emails land in the primary Inbox instead of Spam.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="font-bold text-sm text-slate-900">1. SPF (Sender Policy Framework)</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    A TXT record in your DNS specifying which mail servers are permitted to send emails for your domain.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[10px] text-slate-700 break-all">
                    v=spf1 include:spf.brevo.com ~all
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="font-bold text-sm text-slate-900">2. DKIM (DomainKeys Identified Mail)</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Cryptographically signs each outgoing email, proving it wasn&apos;t modified during delivery.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[10px] text-slate-700">
                    Generated inside Brevo, SendGrid, or Resend.
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="font-bold text-sm text-slate-900">3. DMARC Policy</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Instructs recipient servers on how to handle emails that fail SPF/DKIM verification.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[10px] text-slate-700 break-all">
                    v=DMARC1; p=none; sp=none;
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
