import React, { useState } from 'react';
import { Globe, RefreshCw, Check, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';

export default function WebhookConsolePage({ 
  webhookUrl, 
  onSaveWebhook, 
  currentPayload 
}) {
  const [urlInput, setUrlInput] = useState(webhookUrl);
  const [pingStatus, setPingStatus] = useState(null);
  const [pingMessage, setPingMessage] = useState('');
  const [pingLatency, setPingLatency] = useState(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const isTestMode = urlInput.includes('webhook-test');

  const handleSave = () => {
    onSaveWebhook(urlInput);
  };

  const handlePing = async () => {
    setPingStatus('loading');
    setPingMessage('Dispatching handshake payload to n8n...');
    const startTime = performance.now();

    try {
      const response = await fetch(urlInput, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ping: true,
          timestamp: new Date().toISOString(),
          source: 'Lead Machine Web Console Diagnostic'
        })
      });

      const endTime = performance.now();
      setPingLatency(Math.round(endTime - startTime));

      if (response.ok) {
        setPingStatus('success');
        setPingMessage(`Webhook reachable! HTTP ${response.status} ${response.statusText}`);
      } else {
        setPingStatus('error');
        setPingMessage(`Webhook responded with HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setPingStatus('error');
      setPingMessage(
        err.name === 'TypeError'
          ? 'Network / CORS Error or Test Webhook not listening. If using test URL, click "Test step" in n8n first.'
          : err.message
      );
    }
  };

  const curlCommand = `curl -X POST "${urlInput}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(currentPayload, null, 2)}'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const schemaFields = [
    { field: "Business Type", type: "string", required: true, desc: "Target industry or business niche (e.g. 'Recruitment Agency')." },
    { field: "Location", type: "string", required: true, desc: "Target city/region query for business discovery (e.g. 'London, UK')." },
    { field: "Lead Number", type: "number", required: true, desc: "Maximum target business records to discover and return." },
    { field: "Email Style", type: "string", required: true, desc: "Outreach tone and copywriting voice ('Professional', 'Friendly', 'Concise')." },
    { field: "Your Name", type: "string", required: true, desc: "Sender's full name used in generated email sign-offs." },
    { field: "Your Company/Agency Name", type: "string", required: false, desc: "Platform or agency name representing the sender." },
    { field: "What does your company do?", type: "string", required: false, desc: "Core value proposition used by AI to generate targeted cold outreach copy." }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            System & Connectivity
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            n8n Webhook Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure endpoints, test transmission latency, inspect schema payloads, and debug connectivity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isTestMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <span className="text-xs font-semibold text-slate-800">
            {isTestMode ? 'Test Mode Active' : 'Production Mode Active'}
          </span>
        </div>
      </div>

      {/* Target Endpoint Configuration Card */}
      <div className="section-card p-6 sm:p-8 bg-white border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 mb-1">Target Webhook Endpoint</h2>
        <p className="text-xs text-slate-500 mb-5">
          Select between your testing webhook or production workflow listener.
        </p>

        {/* Quick Environments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setUrlInput('https://n8n.inexlify.com/webhook-test/lead-machine')}
            className={`p-3.5 rounded-xl text-left border transition-all ${
              urlInput.includes('webhook-test')
                ? 'bg-amber-50/80 border-amber-300 text-slate-900 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                n8n Test Webhook
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">Testing Mode</span>
            </div>
            <div className="font-mono text-xs text-slate-700 mt-2 truncate">
              https://n8n.inexlify.com/webhook-test/lead-machine
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Requires clicking "Test step" inside the n8n editor before running.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setUrlInput('https://n8n.inexlify.com/webhook/lead-machine')}
            className={`p-3.5 rounded-xl text-left border transition-all ${
              !urlInput.includes('webhook-test') && urlInput.includes('inexlify.com')
                ? 'bg-emerald-50/80 border-emerald-300 text-slate-900 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                n8n Production Webhook
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">Production Mode</span>
            </div>
            <div className="font-mono text-xs text-slate-700 mt-2 truncate">
              https://n8n.inexlify.com/webhook/lead-machine
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Runs automatically 24/7 whenever the workflow is toggled Active in n8n.
            </p>
          </button>
        </div>

        {/* Input & Action buttons */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Endpoint URL
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://n8n.inexlify.com/webhook/..."
                className="form-input flex-1 px-4 py-2.5 text-xs font-mono text-slate-800"
              />
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0 shadow-2xs"
              >
                Save Endpoint
              </button>
              <button
                type="button"
                onClick={handlePing}
                disabled={pingStatus === 'loading'}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pingStatus === 'loading' ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>
          </div>

          {/* Ping Diagnostic Output */}
          {pingStatus && (
            <div className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
              pingStatus === 'loading' 
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : pingStatus === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              {pingStatus === 'loading' && <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5 text-slate-500" />}
              {pingStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {pingStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <div>
                <div className="font-semibold">{pingMessage}</div>
                {pingLatency && (
                  <div className="text-[11px] text-slate-600 mt-0.5">Roundtrip Latency: {pingLatency}ms</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payload Schema Documentation */}
      <div className="section-card p-6 sm:p-8 bg-white border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 mb-1">Payload Schema Specification</h2>
        <p className="text-xs text-slate-500 mb-5">
          These 7 standardized JSON fields are dispatched on every run and read by downstream n8n nodes:
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Field Key</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Requirement</th>
                <th className="py-3 px-4">Description & Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {schemaFields.map((item) => (
                <tr key={item.field} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    "{item.field}"
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {item.type}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.required ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.required ? 'Required' : 'Optional'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 text-xs">
                    {item.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal cURL Generator */}
      <div className="section-card p-6 sm:p-8 bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Manual Terminal Trigger (cURL)</h2>
            <p className="text-xs text-slate-500">Copy this command to test the workflow directly from your shell or backend</p>
          </div>
          <button
            type="button"
            onClick={handleCopyCurl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 overflow-x-auto shadow-2xs">
          <pre><code>{curlCommand}</code></pre>
        </div>
      </div>
    </div>
  );
}
