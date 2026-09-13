import React from 'react';
import { Settings, Code } from 'lucide-react';

export default function Navbar({ 
  webhookUrl, 
  onOpenSettings, 
  onOpenPayload 
}) {
  const isTestMode = webhookUrl.includes('webhook-test');

  return (
    <header className="w-full border-b border-slate-800 bg-[#0b101d] sticky top-0 z-40">
      <div className="w-full px-6 sm:px-10 lg:px-12 h-20 flex items-center justify-between gap-6">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-11 h-11 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            LM
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-xl text-white tracking-tight">
                Lead Machine
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded bg-slate-800 border border-slate-700 text-slate-300">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5 hidden sm:block">
              Automated B2B Lead Discovery & Outreach Engine
            </p>
          </div>
        </div>

        {/* Right: Actions & Webhook Status */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Active Webhook Status */}
          <button
            id="open-settings-badge-btn"
            onClick={onOpenSettings}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            title="Configure Target Webhook"
          >
            <span className={`w-2 h-2 rounded-full ${isTestMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className="font-mono text-xs hidden md:inline">
              {isTestMode ? 'Test Endpoint' : 'Production Endpoint'}
            </span>
            <span className="text-slate-500 hidden md:inline">|</span>
            <span className="text-xs text-blue-400 font-semibold">Change</span>
          </button>

          {/* Inspect Payload Button */}
          <button
            id="view-payload-btn"
            onClick={onOpenPayload}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Code className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Inspect</span> JSON
          </button>

          {/* Settings Trigger */}
          <button
            id="settings-trigger-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
