import React from 'react';
import { CheckCircle2, AlertTriangle, X, ArrowRight, RefreshCw, Copy, Check } from 'lucide-react';

export default function StatusBanner({ status, onDismiss, onRetry }) {
  const [copied, setCopied] = React.useState(false);

  if (!status) return null;

  const isSuccess = status.type === 'success';

  const copyCurl = () => {
    if (status.curlCommand) {
      navigator.clipboard.writeText(status.curlCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`rounded-xl p-4 sm:p-5 mb-8 border transition-all animate-in fade-in slide-in-from-top-3 duration-200 shadow-xs ${
        isSuccess
          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
          : 'bg-rose-50/90 border-rose-200 text-rose-950'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2 rounded-lg mt-0.5 shrink-0 border ${
              isSuccess 
                ? 'bg-white text-emerald-700 border-emerald-200' 
                : 'bg-white text-rose-700 border-rose-200'
            }`}
          >
            {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              {status.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              {status.message}
            </p>

            {status.details && (
              <div className="mt-3 p-3 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-700 shadow-2xs">
                {status.details}
              </div>
            )}

            {/* Client-friendly troubleshooting */}
            {!isSuccess && status.showHelp && (
              <div className="mt-3 text-xs space-y-1.5 text-slate-700 bg-white p-3.5 rounded-lg border border-rose-200 shadow-2xs">
                <p className="font-bold text-rose-700">Troubleshooting Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Please check your network connection and ensure your search query is valid.</li>
                  <li>Retry the operation in a few moments.</li>
                  <li>If the issue continues, please contact your account support administrator.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
