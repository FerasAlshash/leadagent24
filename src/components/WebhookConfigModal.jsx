import React, { useState } from 'react';
import { X, Check, Globe, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';

export default function WebhookConfigModal({ 
  isOpen, 
  onClose, 
  webhookUrl, 
  onSave 
}) {
  const [currentUrl, setCurrentUrl] = useState(webhookUrl);
  const [pingStatus, setPingStatus] = useState(null); // 'loading' | 'success' | 'error' | null
  const [pingMessage, setPingMessage] = useState('');

  if (!isOpen) return null;

  const handlePresetSelect = (url) => {
    setCurrentUrl(url);
  };

  const handleSave = () => {
    onSave(currentUrl);
    onClose();
  };

  const handlePing = async () => {
    setPingStatus('loading');
    setPingMessage('Sending ping request to n8n webhook...');

    try {
      const response = await fetch(currentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ping: true,
          timestamp: new Date().toISOString(),
          source: 'Lead Machine Web App Ping Test'
        })
      });

      if (response.ok) {
        setPingStatus('success');
        setPingMessage(`Webhook reachable! HTTP ${response.status} ${response.statusText}`);
      } else {
        setPingStatus('error');
        setPingMessage(`Webhook returned HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setPingStatus('error');
      setPingMessage(
        err.name === 'TypeError'
          ? 'CORS error or n8n test webhook not currently listening. If using test URL, click "Test step" in n8n first.'
          : err.message
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">n8n Webhook Settings</h3>
              <p className="text-xs text-slate-500">Configure target workflow trigger endpoint</p>
            </div>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Available Environments
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePresetSelect('https://n8n.inexlify.com/webhook-test/lead-machine')}
                className={`px-3 py-2.5 text-left rounded-xl text-xs font-medium border transition-colors ${
                  currentUrl.includes('webhook-test')
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-semibold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Test Webhook
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">webhook-test/lead-machine</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('https://n8n.inexlify.com/webhook/lead-machine')}
                className={`px-3 py-2.5 text-left rounded-xl text-xs font-medium border transition-colors ${
                  !currentUrl.includes('webhook-test') && currentUrl.includes('inexlify.com')
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Production Webhook
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">webhook/lead-machine</div>
              </button>
            </div>
          </div>

          {/* Webhook Input Field */}
          <div>
            <label htmlFor="webhook-url-input" className="text-xs font-semibold text-slate-700 block mb-1.5">
              Webhook URL Endpoint
            </label>
            <input
              id="webhook-url-input"
              type="url"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              placeholder="https://n8n.inexlify.com/webhook/..."
              className="w-full form-input px-3.5 py-2.5 text-xs font-mono text-slate-800"
            />
          </div>

          {/* Note Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              When using the <strong>Test Webhook</strong>, n8n requires clicking <em>"Test step" / "Listen for event"</em> in the n8n editor before dispatching.
            </p>
          </div>

          {/* Ping Results */}
          {pingStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                pingStatus === 'loading'
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : pingStatus === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {pingStatus === 'loading' && <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 text-slate-500" />}
              {pingStatus === 'success' && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              {pingStatus === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
              <span className="text-[11px] font-medium">{pingMessage}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            id="ping-webhook-btn"
            onClick={handlePing}
            disabled={!currentUrl || pingStatus === 'loading'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pingStatus === 'loading' ? 'animate-spin' : ''}`} />
            Test Connection
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="save-webhook-btn"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              Save Endpoint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
