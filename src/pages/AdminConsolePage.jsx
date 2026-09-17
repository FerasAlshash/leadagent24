import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Server, 
  Database, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Code2, 
  Clock, 
  Users, 
  Layers,
  ArrowUpRight,
  Globe,
  Check,
  Copy,
  Zap,
  Radio,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import PageHeader from '../components/PageHeader';

const FASTAPI_URL = "http://127.0.0.1:8000";

export default function AdminConsolePage({ 
  onOpenPayload, 
  currentWebhookUrl,
  onWebhookUpdated 
}) {
  const { session } = useAuth();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);

  // Webhook Environment Configuration State
  const [webhookMode, setWebhookMode] = useState('test'); // 'test' | 'production'
  const [testUrl, setTestUrl] = useState('https://n8n.inexlify.com/webhook-test/lead-machine');
  const [prodUrl, setProdUrl] = useState('https://n8n.inexlify.com/webhook/lead-machine');
  const [dispatchCallbackUrl, setDispatchCallbackUrl] = useState('http://127.0.0.1:8000/api/campaigns/dispatch-email');
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Ping Testing State
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  const fetchAdminStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = session?.access_token;
      const res = await fetch(`${FASTAPI_URL}/api/admin/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP error ${res.status}`);
      }

      const result = await res.json();
      setData(result);

      // Populate webhook configuration from server
      if (result?.webhook) {
        setWebhookMode(result.webhook.mode || 'test');
        if (result.webhook.test_url) setTestUrl(result.webhook.test_url);
        if (result.webhook.production_url) setProdUrl(result.webhook.production_url);
        if (result.webhook.dispatch_callback_url) setDispatchCallbackUrl(result.webhook.dispatch_callback_url);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchAdminStatus();
    }
  }, [session?.user?.id]);

  // Handle Webhook Save / Mode Switch
  const handleSaveWebhook = async (modeOverride = null) => {
    const targetMode = modeOverride || webhookMode;
    setSavingWebhook(true);
    setSaveSuccess(false);

    try {
      const token = session?.access_token;
      const res = await fetch(`${FASTAPI_URL}/api/admin/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mode: targetMode,
          test_url: testUrl.trim(),
          production_url: prodUrl.trim(),
          dispatch_callback_url: dispatchCallbackUrl.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to update webhook configuration');
      }

      const result = await res.json();
      setSaveSuccess(true);

      // Inform parent app state to instantly synchronize without page reload
      if (onWebhookUpdated && result?.config?.active_url) {
        onWebhookUpdated(result.config.active_url);
      }

      setTimeout(() => setSaveSuccess(false), 3000);
      await fetchAdminStatus();
    } catch (err) {
      alert('Error updating webhook: ' + err.message);
    } finally {
      setSavingWebhook(false);
    }
  };

  // Switch mode directly
  const handleModeChange = (newMode) => {
    setWebhookMode(newMode);
  };

  // Ping Webhook
  const handlePingWebhook = async (customTarget = null) => {
    setPinging(true);
    setPingResult(null);
    try {
      const token = session?.access_token;
      const target = customTarget || (webhookMode === 'production' ? prodUrl : testUrl);
      const res = await fetch(`${FASTAPI_URL}/api/admin/test-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ target_url: target })
      });
      const result = await res.json();
      setPingResult(result);
    } catch (err) {
      setPingResult({ success: false, error: err.message });
    } finally {
      setPinging(false);
    }
  };

  // Copy Active URL to Clipboard
  const handleCopyActiveUrl = (urlToCopy) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Auto-derive URL helper
  const handleAutoDeriveProd = () => {
    if (testUrl.includes('webhook-test')) {
      setProdUrl(testUrl.replace('webhook-test', 'webhook'));
    }
  };

  const handleAutoDeriveTest = () => {
    if (prodUrl.includes('/webhook/')) {
      setTestUrl(prodUrl.replace('/webhook/', '/webhook-test/'));
    }
  };

  const handleClearData = async (target) => {
    const ok = await confirm({
      title: `Clear ${target}`,
      message: `Are you sure you want to completely wipe ${target}? This cannot be undone.`,
      confirmText: `Clear ${target}`,
      isDanger: true
    });
    if (!ok) return;
    setClearing(true);
    try {
      const token = session?.access_token;
      const res = await fetch(`${FASTAPI_URL}/api/admin/clear-test-data?target=${target}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert(`Successfully cleared ${target}!`);
        fetchAdminStatus();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert('Failed to clear: ' + (errData.detail || res.statusText));
      }
    } catch (err) {
      alert('Error clearing data: ' + err.message);
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold text-slate-500">Loading Admin Automation Console...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>Access Restricted</span>
        </div>
        <p className="text-xs mt-2 text-rose-700 leading-relaxed">
          {error}
        </p>
        <p className="text-xs text-rose-600 mt-2 font-semibold">
          This console is strictly restricted to platform administrators.
        </p>
      </div>
    );
  }

  const { system, webhook } = data || {};
  const activeUrl = webhookMode === 'production' ? prodUrl : testUrl;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Super Admin Status Banner */}
      <PageHeader
        icon={ShieldCheck}
        title="Admin Automation & Webhook Control"
        subtitle="Real-time pipeline monitoring, webhook environment routing, and multi-tenant telemetry."
        badges={
          <>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span>👑</span>
              <span>Super Admin Console</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
              {data?.admin_email}
            </span>
          </>
        }
        actions={
          <button
            type="button"
            onClick={fetchAdminStatus}
            className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>
        }
      />

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Registered SaaS Users</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{system?.total_users || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Multi-tenant accounts</div>
        </div>

        {/* Total Campaigns */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Campaigns Created</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{system?.total_campaigns || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all user workspaces</div>
        </div>

        {/* Total Leads */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Scraped Places / Leads</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{system?.total_leads || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Stored in Supabase database</div>
        </div>

        {/* Total Emails Sent */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Cold Outreach Success</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 flex items-baseline gap-2">
            <span>{system?.total_emails_sent || 0} Sent</span>
            <span className="text-xs font-semibold text-slate-500">({system?.outreach_success_rate})</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Confirmed with ✅ status</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WEBHOOK ENVIRONMENT & ROUTING CONTROLLER (FULL-WIDTH EXECUTIVE CARD)      */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6">
        {/* Header with Title & Active Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  n8n Webhook Environment & Routing Engine
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  webhookMode === 'production' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {webhookMode === 'production' ? '🚀 Production Active' : '🧪 Test Sandbox Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Switch instantly between Sandbox Testing and Production webhook listeners, customize endpoint URLs, and verify connectivity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
              webhook?.status === 'active' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${webhook?.status === 'active' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`} />
              <span>Listener: {webhook?.status || 'Active'}</span>
              {webhook?.latency_ms && (
                <span className="text-[11px] font-mono text-slate-400">({webhook.latency_ms} ms)</span>
              )}
            </span>
          </div>
        </div>

        {/* 1. Interactive Environment Mode Selector */}
        <div>
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
            Select Active Target Environment:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Test Mode Option */}
            <button
              type="button"
              onClick={() => handleModeChange('test')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                webhookMode === 'test'
                  ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🧪</span>
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      Test Webhook Environment
                    </div>
                    <span className="text-[11px] font-mono text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                      /webhook-test/...
                    </span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  webhookMode === 'test' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                }`}>
                  {webhookMode === 'test' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Directs campaign dispatches to n8n's <strong>Test Webhook listener</strong>. Essential when debugging or building workflows inside n8n with "Listen for test event".
              </p>
            </button>

            {/* Production Mode Option */}
            <button
              type="button"
              onClick={() => handleModeChange('production')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                webhookMode === 'production'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🚀</span>
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      Production Webhook Environment
                    </div>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                      /webhook/...
                    </span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  webhookMode === 'production' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                }`}>
                  {webhookMode === 'production' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                Directs campaign dispatches to n8n's <strong>Production Webhook trigger</strong>. Used when the n8n workflow toggle is switched to <strong>Active (Production)</strong>.
              </p>
            </button>
          </div>
        </div>

        {/* 2. Endpoint URL Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
          {/* Test URL Config */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            webhookMode === 'test' ? 'bg-amber-50/20 border-amber-300/80' : 'bg-slate-50/50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="test-webhook-url-input" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>🧪 Test Webhook URL</span>
                {webhookMode === 'test' && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">ACTIVE</span>
                )}
              </label>
              <button
                type="button"
                onClick={handleAutoDeriveTest}
                className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                title="Derive from production URL"
              >
                Auto-derive from Prod
              </button>
            </div>

            <input
              id="test-webhook-url-input"
              type="url"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://your-n8n.com/webhook-test/lead-machine"
              className="w-full form-input px-3.5 py-2.5 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Default path for test event listening
              </span>
              <button
                type="button"
                onClick={() => handlePingWebhook(testUrl)}
                disabled={pinging}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <Activity className="w-3 h-3" />
                <span>Ping Test URL</span>
              </button>
            </div>
          </div>

          {/* Production URL Config */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            webhookMode === 'production' ? 'bg-emerald-50/20 border-emerald-300/80' : 'bg-slate-50/50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="prod-webhook-url-input" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>🚀 Production Webhook URL</span>
                {webhookMode === 'production' && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">ACTIVE</span>
                )}
              </label>
              <button
                type="button"
                onClick={handleAutoDeriveProd}
                className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                title="Derive from test URL"
              >
                Auto-derive from Test
              </button>
            </div>

            <input
              id="prod-webhook-url-input"
              type="url"
              value={prodUrl}
              onChange={(e) => setProdUrl(e.target.value)}
              placeholder="https://your-n8n.com/webhook/lead-machine"
              className="w-full form-input px-3.5 py-2.5 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Live trigger when workflow is active
              </span>
              <button
                type="button"
                onClick={() => handlePingWebhook(prodUrl)}
                disabled={pinging}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <Activity className="w-3 h-3" />
                <span>Ping Prod URL</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Dynamic Backend Dispatch Callback URL Card */}
        <div className="p-4 sm:p-5 rounded-2xl border border-purple-200 bg-purple-50/20 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label htmlFor="dispatch-callback-url-input" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-purple-600" />
                <span>Backend Dispatch Callback URL (Dynamic n8n Return Address)</span>
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                This endpoint is injected automatically into every n8n payload. When n8n generates each AI email, its HTTP Request node calls this URL to dispatch via the user's active provider (Resend, Brevo, SendGrid, etc.). When deploying to VPS, simply change this to your production API domain.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 shrink-0 self-start sm:self-auto">
              Auto-injected into n8n
            </span>
          </div>

          <div className="relative mt-1">
            <input
              id="dispatch-callback-url-input"
              type="url"
              value={dispatchCallbackUrl}
              onChange={(e) => setDispatchCallbackUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000/api/campaigns/dispatch-email"
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-purple-200 bg-white text-slate-800 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-medium"
            />
          </div>
        </div>

        {/* 3. Active URL Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-600 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Current Live Dispatch Target ({webhookMode.toUpperCase()}):</span>
            </div>
            <div className="font-mono text-xs font-semibold text-emerald-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 mt-1.5 truncate select-all">
              {activeUrl}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleCopyActiveUrl(activeUrl)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
            </button>
          </div>
        </div>

        {/* 4. Action Controls & Ping Results */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveWebhook()}
              disabled={savingWebhook}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingWebhook ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving & Updating...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Settings Saved & Applied!</span>
                </>
              ) : (
                <>
                  <SaveIcon className="w-3.5 h-3.5" />
                  <span>Save & Activate Configuration</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handlePingWebhook(activeUrl)}
              disabled={pinging}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <Activity className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
              <span>Ping Active Webhook</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPayload && (
              <button
                type="button"
                onClick={onOpenPayload}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Inspect Payload Schema</span>
              </button>
            )}
          </div>
        </div>

        {/* Ping Diagnostics Result Alert */}
        {pingResult && (
          <div className={`p-4 rounded-2xl text-xs font-mono border animate-in fade-in duration-150 ${
            pingResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-sm flex items-center gap-1.5 mb-1">
                  {pingResult.success ? '✅ Webhook Ping Successful' : '❌ Webhook Ping Failed'}
                </div>
                <div className="text-[11px] text-slate-600">
                  Target: <span className="underline">{pingResult.target_url || activeUrl}</span>
                </div>
                {pingResult.latency_ms && (
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Roundtrip Latency: <strong>{pingResult.latency_ms} ms</strong> | HTTP Code: <strong>{pingResult.status_code}</strong>
                  </div>
                )}
                {pingResult.response_text && (
                  <div className="mt-2 p-2 bg-white/80 rounded border border-slate-200 text-[11px] text-slate-700 truncate max-w-2xl">
                    Response: {pingResult.response_text}
                  </div>
                )}
                {pingResult.error && (
                  <div className="text-[11px] text-rose-700 mt-1 font-semibold">
                    Error details: {pingResult.error}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPingResult(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DATABASE HYGIENE & SYSTEM RESET CONTROLS                                  */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-base text-slate-900">Database Hygiene & Testing Reset</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">public.leads & public.campaigns</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          Use these controls during development or client onboarding testing to purge mock runs, test webhooks, or clear leads without affecting authentication tables.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-xs text-slate-900">Purge Leads Table</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Deletes all extracted places, contact emails, and outbound delivery statuses.
            </p>
            <button
              type="button"
              onClick={() => handleClearData('leads')}
              disabled={clearing}
              className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Leads (Reset to 0)</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-xs text-slate-900">Purge Campaigns Table</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Deletes all user campaign configurations and targeting history.
            </p>
            <button
              type="button"
              onClick={() => handleClearData('campaigns')}
              disabled={clearing}
              className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Campaigns</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveIcon({ className }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" 
      />
    </svg>
  );
}
