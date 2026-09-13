import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  Check, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  X, 
  Building2, 
  Mail, 
  Database,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function ProspectingProgressModal({
  session,
  onMinimize,
  onRestore,
  onClose
}) {
  if (!session || !session.isActive) return null;

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (session.isCompleted) return;

    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - session.startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [session.startTime, session.isCompleted]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine realistic customer-oriented stage based on elapsed time or completion
  let currentStage = 1;
  let stageHeadline = `Scanning verified business registries for "${session.targetQuery}"...`;
  let stageDescription = `Targeting companies in ${session.targetLocation} matching your qualification criteria.`;

  if (session.isCompleted) {
    currentStage = 4;
    stageHeadline = `Prospecting Complete! Verified leads saved to database.`;
    stageDescription = `Successfully enriched and recorded ${session.newLeadsFound} new prospect${session.newLeadsFound === 1 ? '' : 's'} into your campaign database.`;
  } else if (seconds >= 25) {
    currentStage = 3;
    stageHeadline = `Validating emails, deliverability & social channels...`;
    stageDescription = `Verifying direct contact channels and preparing structured records for database synchronization.`;
  } else if (seconds >= 10) {
    currentStage = 2;
    stageHeadline = `Extracting key decision-makers, direct phones & addresses...`;
    stageDescription = `Gathering direct phone numbers, Google reviews, and primary business contacts.`;
  }

  // Calculate dynamic progress percentage
  let progressPercent = 15;
  if (session.isCompleted) {
    progressPercent = 100;
  } else if (seconds < 10) {
    progressPercent = 15 + Math.min(seconds * 3, 20);
  } else if (seconds < 25) {
    progressPercent = 35 + Math.min((seconds - 10) * 3, 35);
  } else {
    progressPercent = Math.min(70 + (seconds - 25) * 1, 95);
  }

  // =========================================================================
  // VIEW 1: MINIMIZED FLOATING BADGE (Non-intrusive bottom-right widget)
  // =========================================================================
  if (session.isMinimized) {
    return createPortal(
      <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 duration-200">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 flex items-center gap-3.5 max-w-md">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
            {session.isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-in zoom-in" />
            ) : (
              <>
                <span className="absolute w-full h-full rounded-xl bg-emerald-400/30 animate-ping opacity-60" />
                <Search className="w-5 h-5 animate-pulse relative z-10 text-emerald-600" />
              </>
            )}
          </div>

          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                session.isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {session.isCompleted ? 'Completed' : 'Prospecting Active'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {formatTime(seconds)}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
              {session.isCompleted 
                ? `+${session.newLeadsFound} new leads recorded!` 
                : `Searching for ${session.targetQuery}...`}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-100">
            <button
              type="button"
              onClick={onRestore}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              {session.isCompleted ? 'View Leads' : 'Expand'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // =========================================================================
  // VIEW 2: FULL USER-FRIENDLY PROSPECTING MODAL
  // =========================================================================
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0 shadow-2xs mt-0.5">
              {session.isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-in zoom-in" />
              ) : (
                <>
                  <span className="absolute w-full h-full rounded-2xl bg-emerald-400/20 animate-ping opacity-60" />
                  <Search className="w-6 h-6 animate-pulse relative z-10 text-emerald-600" />
                </>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                  session.isCompleted 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                }`}>
                  {session.isCompleted ? '✅ Prospecting Completed' : 'AI Prospecting Engine Active'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Target: {session.targetLeadCount} verified records
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {session.isCompleted
                  ? `Found & Recorded ${session.newLeadsFound} New Leads!`
                  : `Finding "${session.targetQuery}" in ${session.targetLocation}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onMinimize}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Minimize to background"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            {session.isCompleted && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close window"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Real-time Status Banner */}
          <div className={`p-4 rounded-2xl border transition-all ${
            session.isCompleted 
              ? 'bg-emerald-50/80 border-emerald-200' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${session.isCompleted ? 'text-emerald-600' : 'text-amber-500'}`} />
                  <span>{stageHeadline}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {stageDescription}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Duration
                </div>
                <div className="text-sm font-mono font-extrabold text-slate-800">
                  {formatTime(seconds)}
                </div>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="mt-4 pt-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                <span>Discovery Progress</span>
                <span className="font-mono text-emerald-700">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-out rounded-full ${
                    session.isCompleted 
                      ? 'bg-emerald-600' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Business Prospecting Milestones (Client-Friendly, No Technical Terms) */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Automated Discovery Stages:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Stage 1 */}
              <div className={`p-3 rounded-xl border text-xs transition-all ${
                currentStage >= 1 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="font-bold flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    currentStage >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentStage > 1 ? '✓' : '1'}
                  </div>
                  <span>1. Targeted Market Scan</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  Matching verified businesses in {session.targetLocation}
                </p>
              </div>

              {/* Stage 2 */}
              <div className={`p-3 rounded-xl border text-xs transition-all ${
                currentStage >= 2 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="font-bold flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    currentStage >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentStage > 2 ? '✓' : '2'}
                  </div>
                  <span>2. Contact Details Extraction</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  Extracting direct phone numbers & company address
                </p>
              </div>

              {/* Stage 3 */}
              <div className={`p-3 rounded-xl border text-xs transition-all ${
                currentStage >= 3 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="font-bold flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    currentStage >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentStage > 3 ? '✓' : '3'}
                  </div>
                  <span>3. Email & Social Verification</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  Discovering deliverable emails & social profiles
                </p>
              </div>

              {/* Stage 4 */}
              <div className={`p-3 rounded-xl border text-xs transition-all ${
                currentStage >= 4 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 ring-1 ring-emerald-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="font-bold flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    currentStage >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {currentStage >= 4 ? '✓' : '4'}
                  </div>
                  <span>4. Database Registration</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  {session.isCompleted 
                    ? 'Records saved to your database table!' 
                    : 'Awaiting new records in database'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 sm:p-6 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {session.isCompleted ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                Results are saved and ready in your leads table.
              </span>
            ) : (
              <span>This window will automatically finish once results are recorded in the database.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!session.isCompleted ? (
              <button
                type="button"
                onClick={onMinimize}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                Run in Background
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Prospects in Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
