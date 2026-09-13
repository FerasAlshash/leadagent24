import React, { useState, useEffect } from 'react';
import { Loader2, Clock, Globe, Database } from 'lucide-react';

export default function ExecutionTimer({ targetQuery, targetLocation, leadCount }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine active stage based on elapsed time
  let currentStage = 1;
  let stageText = "Initiating intelligent lead discovery...";
  if (seconds >= 3 && seconds < 15) {
    currentStage = 2;
    stageText = `Discovering verified business listings for "${targetQuery}" in "${targetLocation}"...`;
  } else if (seconds >= 15 && seconds < 30) {
    currentStage = 3;
    stageText = `Verifying direct phone numbers, addresses & contact channels...`;
  } else if (seconds >= 30) {
    currentStage = 4;
    stageText = `Finalizing lead qualification and synchronizing to campaign...`;
  }

  return (
    <div className="section-card p-6 sm:p-8 mb-8 border border-emerald-200 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Spinner & Active Status */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800">
                Automated Prospecting in Progress
              </span>
              <span className="text-xs text-slate-500">
                Target: {leadCount} records
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5">
              {stageText}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Contact verification and qualification typically takes 15–40 seconds to ensure high accuracy.
            </p>
          </div>
        </div>

        {/* Right: Live Timer Badge */}
        <div className="flex items-center gap-3 self-start md:self-center px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
          <Clock className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Elapsed Time
            </div>
            <div className="font-mono text-xl font-extrabold text-slate-900 tracking-wider">
              {formatTime(seconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-3 rounded-xl border text-xs ${currentStage >= 1 ? "bg-emerald-50/60 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
          <div className="font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            1. Geographic Directory Scan
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Matching target businesses in location</p>
        </div>

        <div className={`p-3 rounded-xl border text-xs ${currentStage >= 2 ? "bg-emerald-50/60 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
          <div className="font-semibold flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${currentStage >= 2 ? "bg-emerald-600 animate-pulse" : "bg-slate-400"}`}></span>
            2. Contact Details & Phones
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Extracting direct phone numbers & addresses</p>
        </div>

        <div className={`p-3 rounded-xl border text-xs ${currentStage >= 3 ? "bg-emerald-50/60 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
          <div className="font-semibold flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${currentStage >= 3 ? "bg-emerald-600 animate-pulse" : "bg-slate-400"}`}></span>
            3. Email & Workspace Sync
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Validating deliverability and recording to database</p>
        </div>
      </div>
    </div>
  );
}
