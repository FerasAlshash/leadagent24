import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * Standardized PageHeader Hero Card
 * Enforces identical size, padding, roundedness, and layout across all SaaS pages.
 * On subpages, displays a dedicated, professional back button row separated from badges/metadata.
 */
export default function PageHeader({
  icon: Icon,
  iconBg = 'bg-emerald-600 text-white',
  title,
  titleBadge = null,
  subtitle = null,
  badges = null,
  metadata = null,
  onBack = null,
  backLabel = 'Back',
  actions = null,
  className = ''
}) {
  return (
    <div className={`p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${className}`}>
      {/* Left: Icon + Text / Navigation / Metadata */}
      <div className="flex items-start gap-4 min-w-0 flex-1">
        {Icon && (
          <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center font-bold text-xl shadow-xs shrink-0 mt-0.5`}>
            {React.isValidElement(Icon) ? Icon : <Icon className="w-7 h-7 text-white" />}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          {/* Top Badges Row (Categories / Tags) */}
          {badges && (
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {badges}
            </div>
          )}

          {/* Main Page Title & Optional Title Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight break-words">
              {title}
            </h1>
            {titleBadge}
          </div>

          {/* Subtitle Description */}
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Structured Metadata Ribbon (e.g. Campaign Details Chips) */}
          {metadata && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {metadata}
            </div>
          )}

          {/* Dedicated Subpage Back Button - At bottom of card */}
          {onBack && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/90 hover:border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs group shrink-0"
                title={backLabel}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-0.5 shrink-0" />
                <span>{backLabel}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions Controls */}
      {actions && (
        <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
