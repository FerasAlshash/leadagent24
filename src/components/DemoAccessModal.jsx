import React from 'react';
import { createPortal } from 'react-dom';
import { 
  Lock, 
  X, 
  ExternalLink, 
  GitBranch, 
  ShieldAlert, 
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function DemoAccessModal({ 
  isOpen, 
  onClose, 
  message 
}) {
  if (!isOpen) return null;

  const defaultMessage = "Demo Mode: Live search is currently available for authorized accounts only. You can explore all features freely, contact the administrator to request search access for your account, or run your own pipeline using our open-source GitHub repository!";
  const displayMessage = message || defaultMessage;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-[130] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Live Search Restricted
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                  Demo Mode
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Autonomous prospecting is reserved for authorized accounts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Highlighted Notice Message */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 leading-relaxed space-y-2 relative z-10 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Search Access Notice</span>
          </div>
          <p className="text-[12px] text-amber-900/90 font-medium leading-relaxed">
            {displayMessage}
          </p>
        </div>

        {/* Two Available Action Cards */}
        <div className="space-y-3 relative z-10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            How to run searches:
          </span>

          {/* Option 1: Open Source GitHub */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-colors flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <GitBranch className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-900">
                  Open-Source GitHub Repository
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                  Free & Open
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                Deploy the complete autonomous pipeline on your own server or locally with your own API credentials.
              </p>
            </div>
          </div>

          {/* Option 2: Request Access on LinkedIn */}
          <a
            href="https://www.linkedin.com/in/ferasalshash"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-start gap-3 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0077b5] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.88a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#0077b5] transition-colors">
                  Contact Founder on LinkedIn
                </span>
                <span className="text-[10px] font-semibold text-[#0077b5] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 flex items-center gap-1 shrink-0">
                  <span>Connect</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#0077b5]" />
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                Message on LinkedIn (<span className="text-[#0077b5] font-semibold underline decoration-blue-300">linkedin.com/in/ferasalshash</span>) to request live search access for your account.
              </p>
            </div>
          </a>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <a
            href="https://github.com/FerasAlshash/leadagent24"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>View GitHub Repository</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
