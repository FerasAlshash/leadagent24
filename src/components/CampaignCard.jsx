import React, { useMemo } from 'react';
import { 
  Building2, 
  Trash2, 
  Calendar,
  User,
  Sliders,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { parseLocationFromAddress } from '../utils/locationParser';

export default function CampaignCard({
  campaign,
  leads = [],
  onOpen,
  onDelete
}) {
  const totalLeads = campaign.total_leads || 0;
  const sentLeads = campaign.sent_leads || 0;
  const rawTitle = campaign.company_name || campaign.title || campaign.business_type || 'Untitled Campaign';
  
  // Defensively strip any geographic location suffix (e.g. "Marketing Agencies in London" -> "Marketing Agencies")
  let displayTitle = rawTitle;
  if (campaign.location) {
    const locRegex = new RegExp(`\\s+in\\s+${campaign.location}\\s*$`, 'i');
    displayTitle = displayTitle.replace(locRegex, '').trim();
  }
  displayTitle = displayTitle.replace(/\s+in\s+[A-Za-z\s,.-]+$/i, '').trim() || rawTitle;
  
  const coverageRate = totalLeads > 0 ? Math.round((sentLeads / totalLeads) * 100) : 0;
  const formattedDate = campaign.created_at 
    ? new Date(campaign.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) 
    : 'Active';

  // Resolve whether the campaign operates in a single geographic region or Multi-Region
  const displayLocation = useMemo(() => {
    const rawLoc = (campaign.location || '').trim();

    // 1. Explicit multi-region keyword check
    if (rawLoc.toLowerCase() === 'multi-region' || rawLoc.toLowerCase() === 'multi-location') {
      return 'Multi-Region';
    }

    // 2. If multiple comma-separated search locations exist in campaign.location (e.g. "Germany, UK" or "London, Manchester")
    const splitLocs = rawLoc.split(',').map(s => s.trim()).filter(Boolean);
    if (splitLocs.length > 1) {
      return 'Multi-Region';
    }

    // 3. Check actual leads associated with this campaign
    if (leads && leads.length > 0) {
      const distinctCountries = new Set();
      const distinctCities = new Set();

      leads.forEach(l => {
        const rawAddr = l.Address || l.address || l.city || '';
        const parsed = parseLocationFromAddress(rawAddr);
        if (parsed.country && parsed.country !== 'Unknown Country') {
          distinctCountries.add(parsed.country.toLowerCase());
        }
        if (parsed.city && parsed.city !== 'Unknown City') {
          distinctCities.add(parsed.city.toLowerCase());
        }
      });

      // If leads span across 2 or more distinct countries -> definitely Multi-Region
      if (distinctCountries.size > 1) {
        return 'Multi-Region';
      }

      // If no location was recorded on campaign, resolve from leads
      if (!rawLoc) {
        if (distinctCities.size > 1 || distinctCountries.size > 1) {
          return 'Multi-Region';
        }
        if (distinctCities.size === 1) {
          const c = [...distinctCities][0];
          return c.charAt(0).toUpperCase() + c.slice(1);
        }
        if (distinctCountries.size === 1) {
          const c = [...distinctCountries][0];
          return c.charAt(0).toUpperCase() + c.slice(1);
        }
        return 'Multi-Region';
      }
    }

    // 4. Single location from campaign.location (properly capitalized)
    if (rawLoc) {
      return rawLoc.charAt(0).toUpperCase() + rawLoc.slice(1);
    }

    return null;
  }, [campaign.location, leads]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(campaign)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(campaign);
        }
      }}
      className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-150 flex flex-col justify-between p-5 sm:p-6 group cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-slate-200"
    >
      <div>
        {/* 1. Header: Category Tag & Status & Date / Delete */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold truncate">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{campaign.business_type || 'B2B Outbound'}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
            <span className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{formattedDate}</span>
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(campaign.id);
              }}
              className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
              title="Delete Campaign"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Campaign / Company Title */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight truncate">
            {displayTitle}
          </h3>
        </div>

        {/* 3. Metadata Tags (Sender, Tone, Location) */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
            <User className="w-3 h-3 text-slate-400" />
            <span>Sender: <strong className="text-slate-700 font-semibold">{campaign.sender_name || 'Alex'}</strong></span>
          </span>

          {campaign.email_style && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              <Sliders className="w-3 h-3 text-slate-400" />
              <span>{campaign.email_style} tone</span>
            </span>
          )}

          {displayLocation && (
            <span 
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border truncate max-w-[150px] ${
                displayLocation === 'Multi-Region'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-600 border-slate-100'
              }`}
              title={displayLocation}
            >
              <MapPin className={`w-3 h-3 shrink-0 ${displayLocation === 'Multi-Region' ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className="truncate">{displayLocation}</span>
            </span>
          )}
        </div>

        {/* 4. Visual Dispatch Velocity / Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Dispatch Velocity</span>
            </span>
            <span className="font-bold text-emerald-700 font-mono">{coverageRate}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${Math.min(coverageRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Bottom Metrics & Open Action */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3.5 text-xs w-full sm:w-auto px-1 sm:px-0">
          <div className="text-center sm:text-left flex-1 sm:flex-none">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Scoped</span>
            <span className="font-black text-slate-900 text-sm font-mono">{totalLeads}</span>
          </div>

          <div className="h-5 w-px bg-slate-200 shrink-0" />

          <div className="text-center sm:text-left flex-1 sm:flex-none">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Dispatched</span>
            <span className="font-black text-emerald-700 text-sm font-mono">{sentLeads}</span>
          </div>

          <div className="h-5 w-px bg-slate-200 shrink-0" />

          <div className="text-center sm:text-left flex-1 sm:flex-none">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Remaining</span>
            <span className="font-black text-slate-600 text-sm font-mono">{Math.max(0, totalLeads - sentLeads)}</span>
          </div>
        </div>

        <div className="w-full sm:w-auto inline-flex items-center justify-center py-2 sm:py-1.5 px-3.5 rounded-xl text-xs font-bold bg-slate-50 group-hover:bg-emerald-600 text-slate-600 group-hover:text-white border border-slate-200 group-hover:border-emerald-600 shadow-2xs transition-all">
          <span>Open</span>
        </div>
      </div>
    </div>
  );
}
