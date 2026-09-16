import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Mail,
  Users,
  MessageSquare,
  ChevronDown,
  Check,
  CheckCircle2,
  AlertCircle,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  Send,
  Trash2,
  ShieldCheck,
  Server,
  X,
  BookOpen,
  Sparkles,
  ChevronRight,
  Save,
  Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useConfirm } from '../context/ConfirmContext';
import { TONE_OPTIONS, findToneOption } from '../data/emailTones';

// Helper to compute industry-standard Cold Outreach Sender Display Name: "{Persona} from {Company}"
const computeAutoSenderDisplayName = (persona, company) => {
  const p = (persona || '').trim();
  const c = (company || '').trim();
  if (p && c) return `${p} from ${c}`;
  if (p) return p;
  if (c) return c;
  return '';
};

// Error Guidance & Troubleshooting mapper
const getTroubleshootingGuidance = (errorMessage, provider = 'resend') => {
  const prov = (provider || 'resend').toLowerCase();
  const lowerErr = (errorMessage || '').toLowerCase();

  const providerLinks = {
    resend: {
      name: 'Resend',
      dashboardUrl: 'https://resend.com/domains',
      keysUrl: 'https://resend.com/api-keys',
      docHash: 'resend',
      domainLabel: 'Resend Domains Dashboard',
      keyLabel: 'Resend API Keys Dashboard'
    },
    brevo: {
      name: 'Brevo',
      dashboardUrl: 'https://app.brevo.com/senders',
      keysUrl: 'https://app.brevo.com/settings/keys/api',
      docHash: 'brevo',
      domainLabel: 'Brevo Senders & Domains',
      keyLabel: 'Brevo API Keys Dashboard'
    },
    sendgrid: {
      name: 'SendGrid',
      dashboardUrl: 'https://app.sendgrid.com/settings/sender_auth',
      keysUrl: 'https://app.sendgrid.com/settings/api_keys',
      docHash: 'sendgrid',
      domainLabel: 'SendGrid Sender Auth',
      keyLabel: 'SendGrid API Keys Dashboard'
    },
    smtp: {
      name: 'Custom SMTP',
      dashboardUrl: null,
      keysUrl: null,
      docHash: 'smtp',
      domainLabel: null,
      keyLabel: null
    }
  };

  const info = providerLinks[prov] || providerLinks.resend;

  if (lowerErr.includes('domain') || lowerErr.includes('verified') || lowerErr.includes('not verified') || lowerErr.includes('unverified')) {
    return {
      type: 'domain',
      title: `Domain Authorization Required on ${info.name}`,
      steps: [
        `Verify that your Sender Email Address domain matches what you registered in ${info.name}.`,
        `Add your domain to ${info.name} and configure DNS TXT records (SPF and DKIM).`,
        `Confirm that the domain status in ${info.name} shows 'Verified' before dispatching emails.`
      ],
      actionUrl: info.dashboardUrl,
      actionLabel: `Open ${info.domainLabel} ↗`,
      docUrl: `/docs?provider=${info.docHash}`
    };
  }

  if (lowerErr.includes('api key') || lowerErr.includes('authentication') || lowerErr.includes('auth failed') || lowerErr.includes('invalid') || lowerErr.includes('unauthorized') || lowerErr.includes('401') || lowerErr.includes('403')) {
    return {
      type: 'auth',
      title: `Invalid or Unauthorized ${info.name} API Key`,
      steps: [
        `Ensure your API Key is copied cleanly with no leading or trailing whitespace.`,
        `Confirm that the key has 'Sending Access' or 'Full Access' enabled in your ${info.name} dashboard.`,
        `If the error persists, generate a fresh API key in ${info.name} and update your vault.`
      ],
      actionUrl: info.keysUrl,
      actionLabel: `Open ${info.keyLabel} ↗`,
      docUrl: `/docs?provider=${info.docHash}`
    };
  }

  if (prov === 'smtp' || lowerErr.includes('smtp')) {
    return {
      type: 'smtp',
      title: 'SMTP Server Connection Failed',
      steps: [
        'Check that the SMTP Host, Port (587 TLS or 465 SSL), and username are correct.',
        'If using Gmail / Google Workspace, generate and use an App Password rather than your account password.',
        'Ensure your hosting firewall does not block outgoing mail connections on port 587.'
      ],
      actionUrl: null,
      actionLabel: null,
      docUrl: '/docs?provider=smtp'
    };
  }

  return {
    type: 'general',
    title: `How to resolve ${info.name} connection issues`,
    steps: [
      `Review your ${info.name} provider credentials and domain authentication settings.`,
      `Ensure that you have available sending quota in your account.`,
      `Consult the built-in documentation for step-by-step setup assistance.`
    ],
    actionUrl: info.dashboardUrl,
    actionLabel: info.domainLabel ? `Open ${info.domainLabel} ↗` : null,
    docUrl: `/docs?provider=${info.docHash}`
  };
};

// UI Component for Error Troubleshooting
function TroubleshootingGuideBox({ error, provider, onOpenDocs }) {
  const guidance = getTroubleshootingGuidance(error, provider);
  if (!guidance) return null;

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-white/95 border border-rose-200/90 shadow-2xs space-y-2.5 text-left text-slate-800">
      <div className="flex items-center justify-between gap-2 border-b border-rose-100 pb-2">
        <span className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{guidance.title}</span>
        </span>
        <button
          type="button"
          onClick={() => onOpenDocs(guidance.docUrl)}
          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>Setup Docs</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed font-normal">
        {guidance.steps.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ol>

      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
        {guidance.actionUrl && (
          <a
            href={guidance.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-all shadow-2xs"
          >
            <span>{guidance.actionLabel}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <button
          type="button"
          onClick={() => onOpenDocs(guidance.docUrl)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer"
        >
          <BookOpen className="w-3 h-3 text-slate-500" />
          <span>Troubleshooting Guide</span>
        </button>
      </div>
    </div>
  );
}

export default function CampaignSettingsPage({
  campaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onBack
}) {
  const navigate = useNavigate();
  const params = useParams();
  const campaignId = campaign?.id || params?.id;
  const { confirm } = useConfirm();

  // ---------------------------------------------------------------------------
  // 1. Company Profile Form State
  // ---------------------------------------------------------------------------
  const [companyName, setCompanyName] = useState(campaign?.company_name || campaign?.title || '');
  const [senderName, setSenderName] = useState(campaign?.sender_name || '');
  const [businessType, setBusinessType] = useState(campaign?.business_type || '');
  const [emailStyle, setEmailStyle] = useState(campaign?.email_style || 'Professional');
  const [companyPitch, setCompanyPitch] = useState(campaign?.company_pitch || '');
  const [isToneOpen, setIsToneOpen] = useState(false);
  const toneDropdownRef = useRef(null);

  // ---------------------------------------------------------------------------
  // 2. Outbound Infrastructure State
  // ---------------------------------------------------------------------------
  const [campaignEmailData, setCampaignEmailData] = useState(null);
  const [loadingEmailData, setLoadingEmailData] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(''); // Empty by default! Unconfigured until user chooses.
  
  // Credential selection: ID of a saved vault credential, OR 'new' to enter a new key
  const [selectedCredMode, setSelectedCredMode] = useState('existing'); // 'existing' | 'new'
  const [selectedCredId, setSelectedCredId] = useState('');
  const [isCredDropdownOpen, setIsCredDropdownOpen] = useState(false);
  const credDropdownRef = useRef(null);

  // Per-provider isolated new credential input states (PREVENTS ANY KEY LEAKAGE!)
  const [newCredForms, setNewCredForms] = useState({
    resend: { name: '', key: '', showKey: false },
    brevo: { name: '', key: '', showKey: false },
    sendgrid: { name: '', key: '', showKey: false },
    smtp: { name: '', host: '', port: 587, user: '', pass: '', showPass: false }
  });

  // Dedicated inline credential saving state
  const [savingNewCred, setSavingNewCred] = useState(false);
  const [newCredFeedback, setNewCredFeedback] = useState(null);

  // Sender Identity for this Campaign (Auto-generates as "{Persona} from {Company}" but fully customizable)
  const [outboundSenderName, setOutboundSenderName] = useState(
    computeAutoSenderDisplayName(campaign?.sender_name, campaign?.company_name || campaign?.title)
  );
  const [isSenderNameCustomized, setIsSenderNameCustomized] = useState(false);
  const [outboundSenderEmail, setOutboundSenderEmail] = useState('');

  // Live Test State
  const [testRecipient, setTestRecipient] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Overall saving & feedback state
  const [savingAll, setSavingAll] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);

  // Auto-dismiss success feedback after 5 seconds
  useEffect(() => {
    if (statusBanner?.type === 'success') {
      const timer = setTimeout(() => {
        setStatusBanner(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusBanner]);

  // Sync campaign profile whenever campaign prop changes
  useEffect(() => {
    if (campaign) {
      const cName = campaign.company_name || campaign.title || '';
      const sName = campaign.sender_name || '';
      setCompanyName(cName);
      setSenderName(sName);
      setBusinessType(campaign.business_type || '');
      setEmailStyle(campaign.email_style || 'Professional');
      setCompanyPitch(campaign.company_pitch || '');
      if (!isSenderNameCustomized) {
        setOutboundSenderName(computeAutoSenderDisplayName(sName, cName));
      }
    }
  }, [campaign]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (toneDropdownRef.current && !toneDropdownRef.current.contains(e.target)) {
        setIsToneOpen(false);
      }
      if (credDropdownRef.current && !credDropdownRef.current.contains(e.target)) {
        setIsCredDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Auto-dismiss success notification after 6 seconds
  useEffect(() => {
    if (statusBanner && statusBanner.type === 'success') {
      const timer = setTimeout(() => {
        setStatusBanner(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [statusBanner]);

  // ---------------------------------------------------------------------------
  // Fetch Campaign Outbound Integration and Vault Credentials
  // ---------------------------------------------------------------------------
  const fetchOutboundData = async () => {
    if (!campaignId) return;
    setLoadingEmailData(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!testRecipient && session?.user?.email) {
        setTestRecipient(session.user.email);
      }

      const res = await fetch(`http://127.0.0.1:8000/api/email-integrations/campaign/${campaignId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const data = await res.json();
        setCampaignEmailData(data);

        const availableCreds = data.available_credentials || [];

        if (data.configured && data.integration) {
          const integ = data.integration;
          const prov = integ.provider || '';
          setSelectedProvider(prov);
          setOutboundSenderEmail(integ.sender_email || '');

          if (integ.sender_name) {
            setOutboundSenderName(integ.sender_name);
            const currentAuto = computeAutoSenderDisplayName(
              campaign?.sender_name || senderName, 
              campaign?.company_name || campaign?.title || companyName
            );
            if (integ.sender_name !== currentAuto) {
              setIsSenderNameCustomized(true);
            }
          } else {
            const autoDisplayName = computeAutoSenderDisplayName(
              campaign?.sender_name || senderName, 
              campaign?.company_name || campaign?.title || companyName
            );
            setOutboundSenderName(autoDisplayName);
          }

          if (integ.credential_id) {
            setSelectedCredMode('existing');
            setSelectedCredId(integ.credential_id);
          } else {
            // It was a direct custom key
            setSelectedCredMode('new');
            setSelectedCredId('');
            if (integ.api_key_masked && prov !== 'smtp') {
              setNewCredForms(prev => ({
                ...prev,
                [prov]: { ...prev[prov], key: integ.api_key_masked }
              }));
            }
          }
        } else {
          // Unconfigured campaign: STRICTLY ZERO OUT PROVIDER AND SENDER EMAIL!
          setSelectedProvider('');
          setOutboundSenderEmail('');
          setSelectedCredId('');
          setSelectedCredMode('existing');
          
          const currentCampaignAutoName = computeAutoSenderDisplayName(
            campaign?.sender_name || senderName,
            campaign?.company_name || campaign?.title || companyName
          );
          setOutboundSenderName(currentCampaignAutoName);
          setIsSenderNameCustomized(false);
        }
      }
    } catch (err) {
      console.warn('Failed to load campaign email integration:', err);
    } finally {
      setLoadingEmailData(false);
    }
  };

  useEffect(() => {
    fetchOutboundData();
  }, [campaignId]);

  // When switching provider tabs, choose appropriate credential mode
  const handleSelectProvider = (provId) => {
    setSelectedProvider(provId);
    setTestResult(null);
    setVerificationResult(null);
    setStatusBanner(null);
    setIsCredDropdownOpen(false);
    setNewCredFeedback(null);

    const credsForProv = (campaignEmailData?.available_credentials || []).filter(c => c.provider === provId);
    if (credsForProv.length > 0) {
      setSelectedCredMode('existing');
      // If this campaign already has a credential bound with this provider, keep it; otherwise leave empty for deliberate selection!
      const alreadyBoundCredId = campaignEmailData?.integration?.provider === provId ? campaignEmailData?.integration?.credential_id : '';
      setSelectedCredId(alreadyBoundCredId || '');
    } else {
      setSelectedCredMode('new');
      setSelectedCredId('');
    }
  };

  // Helper to update isolated new credential form
  const updateNewCredForm = (prov, field, value) => {
    setNewCredForms(prev => ({
      ...prev,
      [prov]: {
        ...prev[prov],
        [field]: value
      }
    }));
  };

  // Dedicated action to verify & save credential to Vault permanently
  const handleSaveNewCredToVault = async () => {
    setNewCredFeedback(null);
    const currentForm = newCredForms[selectedProvider] || {};
    const credName = (currentForm.name || '').trim();
    
    if (!credName) {
      setNewCredFeedback({
        type: 'error',
        message: `Please provide a name/label for this ${selectedProvider.toUpperCase()} credential (e.g. "${companyName || 'My Company'} Key").`
      });
      return;
    }

    if (selectedProvider !== 'smtp' && !currentForm.key?.trim()) {
      setNewCredFeedback({
        type: 'error',
        message: `Please enter the ${selectedProvider.toUpperCase()} API Key.`
      });
      return;
    }

    if (selectedProvider === 'smtp') {
      if (!currentForm.host?.trim() || !currentForm.user?.trim() || !currentForm.pass?.trim()) {
        setNewCredFeedback({
          type: 'error',
          message: 'Please fill in SMTP Host, Username, and Password.'
        });
        return;
      }
    }

    setSavingNewCred(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const payload = {
        name: credName,
        provider: selectedProvider,
        api_key: selectedProvider !== 'smtp' ? currentForm.key.trim() : undefined,
        smtp_host: selectedProvider === 'smtp' ? currentForm.host.trim() : undefined,
        smtp_port: selectedProvider === 'smtp' ? Number(currentForm.port) || 587 : undefined,
        smtp_user: selectedProvider === 'smtp' ? currentForm.user.trim() : undefined,
        smtp_pass: selectedProvider === 'smtp' ? currentForm.pass : undefined,
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
        throw new Error(data.detail || data.error || 'Failed to verify and save credential.');
      }

      // Re-fetch outbound and vault credentials
      await fetchOutboundData();

      // Automatically select the newly created credential and switch mode
      const savedCredId = data.credential?.id;
      if (savedCredId) {
        setSelectedCredId(savedCredId);
      }
      setSelectedCredMode('existing');
      setIsCredDropdownOpen(false);

      // Reset form
      updateNewCredForm(selectedProvider, 'name', '');
      updateNewCredForm(selectedProvider, 'key', '');
      if (selectedProvider === 'smtp') {
        updateNewCredForm('smtp', 'host', '');
        updateNewCredForm('smtp', 'user', '');
        updateNewCredForm('smtp', 'pass', '');
      }

      setNewCredFeedback({
        type: 'success',
        message: `Credential "${credName}" verified and saved to your Vault! It is now selected for this campaign.`
      });
    } catch (err) {
      setNewCredFeedback({
        type: 'error',
        message: err.message || 'Failed to authenticate credential with provider.'
      });
    } finally {
      setSavingNewCred(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Independent Connection & Domain Authorization Verification (No email sent!)
  // ---------------------------------------------------------------------------
  const [isVerifyingConnection, setIsVerifyingConnection] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerifyConnection = async () => {
    if (!selectedProvider) {
      setVerificationResult({ success: false, error: 'Please select an email delivery provider first.' });
      return;
    }
    if (selectedCredMode === 'existing' && !selectedCredId) {
      setVerificationResult({ success: false, error: `Please select a saved ${selectedProvider.toUpperCase()} credential from the list, or switch to "+ Add New Key".` });
      return;
    }
    if (selectedCredMode === 'new') {
      const currentForm = newCredForms[selectedProvider] || {};
      if (selectedProvider !== 'smtp' && !currentForm.key?.trim()) {
        setVerificationResult({ success: false, error: `Please enter an API Key for ${selectedProvider.toUpperCase()}.` });
        return;
      }
    }
    if (!outboundSenderEmail.trim()) {
      setVerificationResult({ success: false, error: 'Please enter a Sender Email Address to verify domain authorization.' });
      return;
    }

    setIsVerifyingConnection(true);
    setVerificationResult(null);
    setStatusBanner(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const currentForm = newCredForms[selectedProvider] || {};
      const payload = {
        provider: selectedProvider,
        credential_id: selectedCredMode === 'existing' && selectedCredId ? selectedCredId : undefined,
        api_key: selectedCredMode === 'new' && selectedProvider !== 'smtp' ? (currentForm.key || '').trim() : undefined,
        sender_email: outboundSenderEmail.trim(),
        smtp_host: selectedProvider === 'smtp' && selectedCredMode === 'new' ? (currentForm.host || '').trim() : undefined,
        smtp_port: selectedProvider === 'smtp' && selectedCredMode === 'new' ? Number(currentForm.port) || 587 : undefined,
        smtp_user: selectedProvider === 'smtp' && selectedCredMode === 'new' ? (currentForm.user || '').trim() : undefined,
        smtp_pass: selectedProvider === 'smtp' && selectedCredMode === 'new' ? currentForm.pass : undefined,
      };

      const res = await fetch('http://127.0.0.1:8000/api/email-integrations/verify-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.detail || data.error || 'Connection verification failed.';
        setVerificationResult({ success: false, error: errMsg });
      } else {
        setVerificationResult({
          success: true,
          message: data.message || 'Provider connection and domain verified successfully!'
        });
      }
    } catch (err) {
      setVerificationResult({ success: false, error: err.message });
    } finally {
      setIsVerifyingConnection(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Live Pre-flight Test Dispatch (Optional)
  // ---------------------------------------------------------------------------
  const handleRunLiveTest = async () => {
    if (!outboundSenderEmail.trim()) {
      alert('Please enter a Sender Email Address to test outbound dispatch.');
      return;
    }
    setTestingConnection(true);
    setTestResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const currentForm = newCredForms[selectedProvider] || {};
      const payload = {
        provider: selectedProvider,
        credential_id: selectedCredMode === 'existing' && selectedCredId ? selectedCredId : undefined,
        api_key: selectedCredMode === 'new' && selectedProvider !== 'smtp' ? (currentForm.key || '').trim() : undefined,
        sender_email: outboundSenderEmail.trim(),
        sender_name: outboundSenderName.trim() || senderName.trim() || 'Outbound Team',
        test_recipient: testRecipient.trim() || session?.user?.email || 'test@example.com',
        smtp_host: selectedProvider === 'smtp' && selectedCredMode === 'new' ? (currentForm.host || '').trim() : undefined,
        smtp_port: selectedProvider === 'smtp' && selectedCredMode === 'new' ? Number(currentForm.port) || 587 : undefined,
        smtp_user: selectedProvider === 'smtp' && selectedCredMode === 'new' ? (currentForm.user || '').trim() : undefined,
        smtp_pass: selectedProvider === 'smtp' && selectedCredMode === 'new' ? currentForm.pass : undefined,
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
          message: data.message || `Test email dispatched successfully via ${selectedProvider.toUpperCase()}!`
        });
      } else {
        setTestResult({
          success: false,
          error: data.error || data.detail || 'Failed to dispatch verification email.'
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

  // ---------------------------------------------------------------------------
  // Disconnect Outbound Provider
  // ---------------------------------------------------------------------------
  const handleDisconnectProvider = async () => {
    const ok = await confirm({
      title: 'Disconnect Provider',
      message: 'Disconnect outbound email provider from this campaign? Automated cold email outreach will be paused until a provider is reconnected.',
      confirmText: 'Disconnect Provider',
      isDanger: true
    });
    if (!ok) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      await fetch(`http://127.0.0.1:8000/api/email-integrations/campaign/${campaignId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      await fetchOutboundData();
      setStatusBanner({
        type: 'success',
        message: 'Outbound email provider disconnected successfully.'
      });
    } catch (err) {
      setStatusBanner({ type: 'error', message: err.message });
    }
  };

  // ---------------------------------------------------------------------------
  // Unified Save: Company Profile & Outbound Settings in one shot!
  // ---------------------------------------------------------------------------
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    if (!companyName.trim()) {
      setStatusBanner({ type: 'error', message: 'Company Name is required.' });
      return;
    }

    setSavingAll(true);
    setStatusBanner(null);

    try {
      // Step 1: Update Campaign Profile (Company details, persona, pitch)
      if (onUpdateCampaign) {
        await onUpdateCampaign(campaignId, {
          id: campaignId,
          title: companyName.trim(),
          company_name: companyName.trim(),
          sender_name: senderName.trim(),
          business_type: businessType.trim(),
          email_style: emailStyle,
          company_pitch: companyPitch.trim()
        });
      }

      // Step 2: If provider is chosen, verify and bind outbound configuration
      if (selectedProvider && outboundSenderEmail.trim()) {
        if (selectedCredMode === 'existing' && !selectedCredId) {
          throw new Error(`Please select a saved ${selectedProvider.toUpperCase()} credential from the list, or choose "+ Add New Key".`);
        }
        const currentForm = newCredForms[selectedProvider] || {};
        if (selectedCredMode === 'new' && selectedProvider !== 'smtp' && !currentForm.key?.trim()) {
          throw new Error(`Please enter an API Key for ${selectedProvider.toUpperCase()}.`);
        }

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const outboundPayload = {
          provider: selectedProvider,
          credential_id: selectedCredMode === 'existing' && selectedCredId ? selectedCredId : undefined,
          credential_name: selectedCredMode === 'new' ? (currentForm.name || '').trim() : undefined,
          sender_email: outboundSenderEmail.trim(),
          sender_name: outboundSenderName.trim() || senderName.trim() || 'Marketing Team',
          api_key: selectedCredMode === 'new' && selectedProvider !== 'smtp' ? (currentForm.key || '').trim() : undefined,
          smtp_host: selectedProvider === 'smtp' && selectedCredMode === 'new' ? (currentForm.host || '').trim() : undefined,
          smtp_port: selectedProvider === 'smtp' && selectedCredMode === 'new' ? Number(currentForm.port) || 587 : undefined,
          smtp_user: selectedProvider === 'smtp' && selectedCredMode === 'new' ? (currentForm.user || '').trim() : undefined,
          smtp_pass: selectedProvider === 'smtp' && selectedCredMode === 'new' ? currentForm.pass : undefined,
        };

        const res = await fetch(`http://127.0.0.1:8000/api/email-integrations/campaign/${campaignId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(outboundPayload)
        });

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.detail || resData.error || 'Failed to save outbound email provider.');
        }
      } else if (selectedProvider && !outboundSenderEmail.trim()) {
        throw new Error(`Please enter a verified Sender Email Address to bind ${selectedProvider.toUpperCase()} to this campaign.`);
      }

      await fetchOutboundData();
      setStatusBanner({
        type: 'success',
        message: selectedProvider && outboundSenderEmail.trim()
          ? 'Campaign profile and outbound email configuration saved and verified successfully!'
          : 'Campaign profile saved successfully!'
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        message: err.message
      });
    } finally {
      setSavingAll(false);
    }
  };

  const handleBackToLeads = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(`/campaigns/${campaignId}`);
    }
  };

  // Credentials for the currently active tab
  const matchingVaultCreds = (campaignEmailData?.available_credentials || []).filter(
    c => c.provider === selectedProvider
  );
  const activeSelectedCred = matchingVaultCreds.find(c => c.id === selectedCredId);

  return (
    <div className="space-y-6 w-full pb-20 animate-in fade-in duration-150">
      {/* Top Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <button
            type="button"
            onClick={handleBackToLeads}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Campaign Leads & Overview</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Campaign Settings & Outbound Architecture
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold shrink-0">
              {companyName || 'Campaign'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Configure company identity, AI personalization pitch, and dedicated cold email provider settings on this single page.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleBackToLeads}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={savingAll}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {savingAll && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Floating Status Feedback Banner (Floats at top of screen wherever the user is scrolled) */}
      {statusBanner && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-200">
          <div className={`p-4 rounded-2xl border text-xs font-bold flex flex-col gap-2 shadow-2xl backdrop-blur-md ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-950/10'
              : 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-950/10'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {statusBanner.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed flex-1 min-w-0">
                  <strong className="block text-sm font-bold">
                    {statusBanner.type === 'success' ? 'Success' : 'Error saving settings'}
                  </strong>
                  <p className="font-normal text-xs leading-relaxed mt-0.5 break-words">
                    {statusBanner.message}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-banner Troubleshooting & Actionable Help */}
            {statusBanner.type === 'error' && (
              <TroubleshootingGuideBox
                error={statusBanner.message}
                provider={selectedProvider}
                onOpenDocs={(url) => navigate(url)}
              />
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: COMPANY PROFILE & VALUE PITCH */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              1. Company Profile & AI Value Pitch
            </h2>
            <p className="text-xs text-slate-500">
              Company targeting persona, default email tone, and value proposition used by AI to generate outreach.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Company / Agency Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hireley Solutions"
              value={companyName}
              onChange={(e) => {
                const val = e.target.value;
                setCompanyName(val);
                if (!isSenderNameCustomized) {
                  setOutboundSenderName(computeAutoSenderDisplayName(senderName, val));
                }
              }}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sign-off Sender Name (Persona)
              </label>
              <input
                type="text"
                placeholder="e.g. Feras or Tamer"
                value={senderName}
                onChange={(e) => {
                  const val = e.target.value;
                  setSenderName(val);
                  if (!isSenderNameCustomized) {
                    setOutboundSenderName(computeAutoSenderDisplayName(val, companyName));
                  }
                }}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Used in email body sign-off signature (e.g. "Best regards, Feras").
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Niche / Category
              </label>
              <input
                type="text"
                placeholder="e.g. IT Staffing, B2B SaaS, Marketing Agency"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Helps contextually filter leads and write industry-tailored messages.
              </p>
            </div>
          </div>

          {/* Email Tone Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Default Outreach Email Tone
            </label>
            <div className="relative" ref={toneDropdownRef}>
              <button
                type="button"
                onClick={() => setIsToneOpen(prev => !prev)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:outline-hidden focus:border-emerald-500 font-medium flex items-center justify-between text-left transition-all shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-bold text-slate-900">
                    {findToneOption(emailStyle).label}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                    • {findToneOption(emailStyle).subtitle}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-2 transition-transform ${isToneOpen ? 'rotate-180' : ''}`} />
              </button>

              {isToneOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {TONE_OPTIONS.map(opt => {
                    const isSelected = (emailStyle || 'Professional') === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setEmailStyle(opt.id);
                          setIsToneOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{opt.label}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-normal">{opt.subtitle}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Company Pitch Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              What does your company do? (Value Proposition & Pitch)
            </label>
            <textarea
              rows="4"
              value={companyPitch}
              onChange={(e) => setCompanyPitch(e.target.value)}
              placeholder="Explain your core services, target clients, and key benefits (e.g. 'We help enterprise software firms hire top remote engineering talent within 48 hours')..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 leading-relaxed font-normal"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This pitch is used directly by the AI model to generate hyper-personalized value-first cold outreach.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: DEDICATED OUTBOUND EMAIL PROVIDER & SENDER IDENTITY */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              2. Outbound Email Dispatcher & Sender Authentication
            </h2>
            <p className="text-xs text-slate-500">
              Connect a dedicated delivery provider, choose a saved Vault Credential, and verify your brand sender domain.
            </p>
          </div>
        </div>

        {/* Active Dispatcher Banner */}
        {campaignEmailData?.configured && campaignEmailData?.integration ? (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-950">Active Outbound Dispatcher</span>
                  <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                    {campaignEmailData.integration.provider}
                  </span>
                </div>
                <p className="text-xs font-medium text-emerald-900 mt-0.5">
                  Sending as <strong className="font-bold">{campaignEmailData.integration.sender_name || 'Sign-off Persona'}</strong> &lt;<span className="font-mono">{campaignEmailData.integration.sender_email}</span>&gt;
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDisconnectProvider}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-100/60 px-3 py-1.5 rounded-xl border border-rose-200/80 transition-all cursor-pointer self-start sm:self-center shrink-0"
            >
              Disconnect Provider
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-amber-950">Outbound Provider Setup Required</strong>
              <span>Cold email outreach will remain paused for this campaign until you select a provider and verified sender email below.</span>
            </div>
          </div>
        )}

        {/* Step A: Select Delivery Provider Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            Step A: Select Email Delivery Provider
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'resend', name: 'Resend', subtext: '3,000 free/mo', tag: 'Modern' },
              { id: 'brevo', name: 'Brevo', subtext: '300 free/day', tag: 'High Quota' },
              { id: 'sendgrid', name: 'SendGrid', subtext: '100 free/day', tag: 'Twilio' },
              { id: 'smtp', name: 'Custom SMTP', subtext: 'cPanel / GSuite', tag: 'Universal' }
            ].map((prov) => {
              const isSelected = selectedProvider === prov.id;
              const countInVault = (campaignEmailData?.available_credentials || []).filter(c => c.provider === prov.id).length;
              return (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => handleSelectProvider(prov.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-slate-900">{prov.name}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{prov.subtext}</p>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-emerald-200/60 text-emerald-900' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {prov.tag}
                    </span>
                    {countInVault > 0 && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded">
                        {countInVault} in Vault
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step B, C, D: Connection Credential, Sender Identity & Pre-flight Test */}
        {!selectedProvider ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">
              No Delivery Provider Selected
            </h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Please click on one of the providers above (Resend, Brevo, SendGrid, or Custom SMTP) to configure your connection credentials and sender identity.
            </p>
          </div>
        ) : (
          <>
            {/* Step B: Credential Selection (Clean Vault Selector vs Add New) */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Step B: Connection Credential for {selectedProvider.toUpperCase()}</span>
                </label>
                <a
                  href="/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                >
                  <span>Manage Credentials Vault</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

          {/* Mode Selector: Choose Saved Credential or Enter New */}
          {matchingVaultCreds.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCredMode('existing')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCredMode === 'existing'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Use Saved Vault Credential ({matchingVaultCreds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCredMode('new')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCredMode === 'new'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  + Add New {selectedProvider.toUpperCase()} Key
                </button>
              </div>

              {selectedCredMode === 'existing' && (
                <div className="space-y-3">
                  {/* Custom Styled Credential Dropdown */}
                  <div className="relative" ref={credDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCredDropdownOpen(prev => !prev)}
                      className={`w-full px-4 py-3 text-xs rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer shadow-2xs ${
                        isCredDropdownOpen
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white'
                          : selectedCredId && activeSelectedCred
                          ? 'border-emerald-300 bg-white hover:border-emerald-400'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedCredId && activeSelectedCred
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Key className="w-4 h-4" />
                        </div>
                        {selectedCredId && activeSelectedCred ? (
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{activeSelectedCred.name}</span>
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                                {activeSelectedCred.api_key_masked || activeSelectedCred.host || 'Saved'}
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-medium">Selected Vault Credential</span>
                          </div>
                        ) : (
                          <div className="text-slate-400 font-medium">
                            <span>Select a saved {selectedProvider.toUpperCase()} credential from Vault...</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {selectedCredId && activeSelectedCred && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCredDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                      </div>
                    </button>

                    {/* Floating Dropdown Menu */}
                    {isCredDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden py-1.5 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                          <span>Saved {selectedProvider.toUpperCase()} Credentials ({matchingVaultCreds.length})</span>
                          <span className="text-slate-400 font-normal normal-case text-[10px]">Click to select</span>
                        </div>

                        <div className="py-1">
                          {matchingVaultCreds.map(c => {
                            const isSelected = c.id === selectedCredId;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setSelectedCredId(c.id);
                                  setIsCredDropdownOpen(false);
                                }}
                                className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-50/80 text-emerald-950 font-semibold'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    <Key className="w-3 h-3" />
                                  </div>
                                  <div className="truncate">
                                    <div className="text-xs font-bold text-slate-900">{c.name}</div>
                                    <div className="text-[11px] font-mono text-slate-500">
                                      {c.api_key_masked || c.host || 'Verified Key'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                    Verified
                                  </span>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCredMode('new');
                              setIsCredDropdownOpen(false);
                            }}
                            className="w-full py-1.5 px-3 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>+ Enter a new key instead</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedCredId && activeSelectedCred ? (
                    <div className="p-3.5 rounded-2xl bg-white border border-emerald-200/90 flex items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">"{activeSelectedCred.name}"</span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">Active for this campaign</span>
                          </div>
                          <span className="text-[10px] text-slate-500">Stored safely in your Supabase Vault and reusable across campaigns.</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCredId('')}
                        className="text-[11px] font-medium text-slate-400 hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
                      >
                        Deselect
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2 text-xs text-amber-800">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Please select a saved credential from the menu above to use for this campaign, or switch to <strong>+ Add New {selectedProvider.toUpperCase()} Key</strong>.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block mb-0.5">
                No saved credentials found for {selectedProvider.toUpperCase()} in your Vault.
              </span>
              <span>Enter your connection details below. Once verified, it will be saved to your Vault for cross-campaign reuse.</span>
            </div>
          )}

          {/* New Credential Input Form (Rendered ONLY when selectedCredMode === 'new' or when no vault credentials exist) */}
          {(selectedCredMode === 'new' || matchingVaultCreds.length === 0) && (
            <div className="pt-2 space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 block">
                  Enter New {selectedProvider.toUpperCase()} Connection Details
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Will be saved to Vault
                </span>
              </div>

              {selectedProvider !== 'smtp' ? (
                <div className="space-y-3">
                  {/* Credential Name / Label */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Credential Name / Label <span className="text-slate-400 font-normal">(for your Vault)</span>
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. ${companyName ? `${companyName} ` : ''}${selectedProvider.toUpperCase()} Key`}
                      value={newCredForms[selectedProvider]?.name || ''}
                      onChange={(e) => updateNewCredForm(selectedProvider, 'name', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-500 font-medium text-slate-900"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      A descriptive name to identify this key when reusing it in other campaigns from your Vault.
                    </p>
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {selectedProvider.toUpperCase()} API Key <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={newCredForms[selectedProvider]?.showKey ? 'text' : 'password'}
                        placeholder={
                          selectedProvider === 'resend'
                            ? 're_123456789...'
                            : selectedProvider === 'sendgrid'
                            ? 'SG.xxxxxxxxxxxx...'
                            : 'xkeysib-xxxxxxxxxxxx...'
                        }
                        value={newCredForms[selectedProvider]?.key || ''}
                        onChange={(e) => updateNewCredForm(selectedProvider, 'key', e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => updateNewCredForm(selectedProvider, 'showKey', !newCredForms[selectedProvider]?.showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {newCredForms[selectedProvider]?.showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* SMTP Credential Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Credential Name / Label <span className="text-slate-400 font-normal">(for your Vault)</span>
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. ${companyName ? `${companyName} ` : ''}SMTP Account`}
                      value={newCredForms.smtp?.name || ''}
                      onChange={(e) => updateNewCredForm('smtp', 'name', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-500 font-medium text-slate-900"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      A descriptive name to identify this SMTP configuration in your Vault.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">SMTP Host <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        placeholder="mail.yourdomain.com"
                        value={newCredForms.smtp?.host || ''}
                        onChange={(e) => updateNewCredForm('smtp', 'host', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">SMTP Port <span className="text-rose-500">*</span></label>
                      <input
                        type="number"
                        placeholder="587"
                        value={newCredForms.smtp?.port || 587}
                        onChange={(e) => updateNewCredForm('smtp', 'port', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">SMTP User <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        placeholder="contact@yourdomain.com"
                        value={newCredForms.smtp?.user || ''}
                        onChange={(e) => updateNewCredForm('smtp', 'user', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">SMTP Password <span className="text-rose-500">*</span></label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={newCredForms.smtp?.pass || ''}
                        onChange={(e) => updateNewCredForm('smtp', 'pass', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Credential to Vault Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveNewCredToVault}
                  disabled={savingNewCred}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {savingNewCred ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save</span>
                </button>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Authenticates with {selectedProvider.toUpperCase()} and permanently saves this credential into your Vault for this and future campaigns.
                </p>
              </div>

              {/* Inline Feedback for Credential Saving */}
              {newCredFeedback && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  newCredFeedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border border-rose-200 text-rose-900'
                }`}>
                  {newCredFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="font-semibold block">{newCredFeedback.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewCredFeedback(null)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step C: Campaign Sender Identity (Persona & Brand Domain Email) */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-800">
            Step C: Campaign Sender Identity & Domain Authentication
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Sender Display Name <span className="text-rose-500">*</span>
                </label>
                {(() => {
                  const autoFormula = computeAutoSenderDisplayName(senderName, companyName);
                  if (outboundSenderName === autoFormula && autoFormula) {
                    return (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span>⚡ Auto: {autoFormula}</span>
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
              <input
                type="text"
                placeholder={computeAutoSenderDisplayName(senderName, companyName) || "e.g. Feras from Hireley"}
                value={outboundSenderName}
                onChange={(e) => {
                  const val = e.target.value;
                  setOutboundSenderName(val);
                  const autoFormula = computeAutoSenderDisplayName(senderName, companyName);
                  if (!val.trim() || val.trim() === autoFormula) {
                    setIsSenderNameCustomized(false);
                  } else {
                    setIsSenderNameCustomized(true);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-medium"
              />
              <div className="flex items-center justify-between mt-1 gap-2">
                <p className="text-[11px] text-slate-400">
                  Appears in recipient inbox before opening.
                </p>
                {(() => {
                  const autoFormula = computeAutoSenderDisplayName(senderName, companyName);
                  if (autoFormula && outboundSenderName !== autoFormula) {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setOutboundSenderName(autoFormula);
                          setIsSenderNameCustomized(false);
                        }}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer"
                        title={`Reset to default format: "${autoFormula}"`}
                      >
                        Reset to "{autoFormula}"
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sender Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder={`e.g. team@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'yourbrand'}.com`}
                value={outboundSenderEmail}
                onChange={(e) => setOutboundSenderEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-medium font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The domain must be verified in your {selectedProvider.toUpperCase()} dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Step D: Standalone Pre-Flight Connection & Domain Authorization Verification */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Step D: Verify Credentials & Domain Authorization</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Independent check to confirm your {selectedProvider.toUpperCase()} credentials and sender domain are valid and authenticated before dispatching emails or saving.
              </p>
            </div>
            <button
              type="button"
              onClick={handleVerifyConnection}
              disabled={isVerifyingConnection || !outboundSenderEmail.trim()}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isVerifyingConnection ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Checking Authorization...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Connection & Domain</span>
                </>
              )}
            </button>
          </div>

          {/* Inline Verification Status Banner */}
          {verificationResult && (
            <div className={`p-3.5 rounded-xl border text-xs font-semibold ${
              verificationResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-start gap-2.5">
                {verificationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="leading-relaxed flex-1">
                  <span className="font-bold block mb-0.5">
                    {verificationResult.success ? 'Verification Succeeded' : 'Verification Failed'}
                  </span>
                  <span>{verificationResult.message || verificationResult.error}</span>
                </div>
              </div>

              {/* Troubleshooting Guidance Box */}
              {!verificationResult.success && (
                <TroubleshootingGuideBox
                  error={verificationResult.error}
                  provider={selectedProvider}
                  onOpenDocs={(url) => navigate(url)}
                />
              )}
            </div>
          )}
        </div>

        {/* Step E: Live Outbound Test Email (Optional Pre-Flight Test) */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-slate-600" />
              <span>Step E: Send Live Test Email to Inbox (Optional)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Deliverability Check</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="email"
              placeholder="your.email@gmail.com"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-500 font-medium"
            />
            <button
              type="button"
              onClick={handleRunLiveTest}
              disabled={testingConnection || !outboundSenderEmail.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {testingConnection ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email</span>
                </>
              )}
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl border text-xs font-semibold ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-start gap-2.5">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{testResult.message || testResult.error}</span>
              </div>

              {!testResult.success && (
                <TroubleshootingGuideBox
                  error={testResult.error}
                  provider={selectedProvider}
                  onOpenDocs={(url) => navigate(url)}
                />
              )}
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-30">
        <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
            {statusBanner?.type === 'success' ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Changes saved and active</span>
              </span>
            ) : statusBanner?.type === 'error' ? (
              <span className="text-rose-700 font-bold flex items-center gap-1.5 truncate">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Save failed — please review errors</span>
              </span>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">All campaign & outbound settings will be saved and validated together.</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleBackToLeads}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={savingAll}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {savingAll && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>Save All Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Marginal Collapsible Danger Zone (Moved to discreet bottom area away from primary workflow) */}
      <div className="pt-6">
        <details className="group rounded-2xl border border-slate-200/90 bg-slate-50/50 overflow-hidden transition-all">
          <summary className="px-5 py-3.5 text-xs font-bold text-slate-500 hover:text-rose-700 flex items-center justify-between cursor-pointer select-none">
            <span className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
              <span>Advanced Workspace Options: Delete Campaign</span>
            </span>
            <span className="text-[10px] text-slate-400 group-hover:text-rose-600 transition-colors">
              Click to reveal
            </span>
          </summary>
          <div className="px-5 pb-5 pt-3 border-t border-slate-200/60 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-rose-800">
                Danger Zone: Permanently Delete this Campaign
              </h4>
              <p className="text-[11px] text-slate-500">
                Permanently deletes "{companyName || 'this campaign'}", AI persona pitch, and all attached leads. This action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!onDeleteCampaign) return;
                const ok = await confirm({
                  title: 'Delete Campaign',
                  message: `Are you sure you want to permanently delete "${companyName || 'this campaign'}"? All campaign configurations, pitch settings, and attached leads will be deleted. This cannot be undone.`,
                  confirmText: 'Delete Campaign',
                  isDanger: true
                });
                if (ok) onDeleteCampaign(campaignId, true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition-colors cursor-pointer self-start sm:self-center shrink-0"
            >
              Delete Campaign
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}
