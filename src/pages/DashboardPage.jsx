import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  PlusCircle, 
  RefreshCw, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  Building2, 
  ExternalLink,
  ChevronRight,
  Layers,
  MapPin,
  PieChart
} from 'lucide-react';
import MetricsGrid from '../components/analytics/MetricsGrid';
import AnalyticsCharts from '../components/analytics/AnalyticsCharts';
import { parseLocationFromAddress } from '../utils/locationParser';
import PageHeader from '../components/PageHeader';

export default function DashboardPage({
  leads = [],
  campaigns = [],
  onOpenCampaign,
  onCreateCampaign,
  onRefresh,
  loading = false
}) {
  const [locationMode, setLocationMode] = useState('city'); // 'city' | 'country'

  // Location Distribution (100% Real Database Aggregation by City or Country)
  const locationStats = useMemo(() => {
    const counts = {};
    leads.forEach(l => {
      const rawLoc = l.city || l.Address || l.address || '';
      const parsed = parseLocationFromAddress(rawLoc);
      const key = locationMode === 'country' ? parsed.country : parsed.city;
      if (key && key !== 'Unknown City' && key !== 'Unknown Country') {
        counts[key] = (counts[key] || 0) + 1;
      } else {
        const fallback = locationMode === 'country' ? 'Other Countries' : 'Other Regions';
        counts[fallback] = (counts[fallback] || 0) + 1;
      }
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);

    return sorted.map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / (leads.length || 1)) * 100)
    }));
  }, [leads, locationMode]);

  // Industry / Niche Distribution (100% Real Database Aggregation)
  const nicheStats = useMemo(() => {
    const counts = {};
    leads.forEach(l => {
      const cat = l.Category || l.categoryName || 'General B2B';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);

    return sorted.map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / (leads.length || 1)) * 100)
    }));
  }, [leads]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Grand Dashboard Hero Card */}
      <PageHeader
        icon={Activity}
        title="Outbound Intelligence Dashboard"
        subtitle="Cross-campaign prospecting metrics, contact discovery distribution, and live outreach performance."
        badges={
          <>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              Executive Performance & Analytics
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600">
              Real-Time Telemetry
            </span>
          </>
        }
        actions={
          <button
            type="button"
            onClick={onCreateCampaign}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        }
      />

      {/* 2. Key Multi-Channel Metrics (8 KPI Cards) */}
      <MetricsGrid leads={leads} campaigns={campaigns} />

      {/* 3. Visual Charts (Growth Velocity + Geo & Niche Distribution) */}
      <AnalyticsCharts leads={leads} campaigns={campaigns} />

      {/* 4. Audience & Market Intelligence (50% / 50% Clean Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* 4.1 Top Targeted Locations (50%) */}
        <div className="p-4 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between min-h-[380px] sm:h-[400px] group">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Top Targeted Locations
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Geographic distribution of captured prospects
                  </p>
                </div>
              </div>

              {/* City vs Country Toggle Switch */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setLocationMode('city')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    locationMode === 'city'
                      ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Group leads by City"
                >
                  City
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode('country')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    locationMode === 'country'
                      ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Group leads by Country"
                >
                  Country
                </button>
              </div>
            </div>

            {/* List of Locations (Height locked to exactly 246px = exactly 4 items of 54px + 3 gaps of 10px) */}
            <div className="mt-3.5 h-[246px] min-h-[246px] max-h-[246px] overflow-y-auto pr-1 scrollbar-hover space-y-2.5">
              {locationStats.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-xs text-slate-400 italic">No location data captured yet.</p>
                </div>
              ) : (
                locationStats.map((loc, idx) => (
                  <div 
                    key={idx} 
                    className="h-[54px] p-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 transition-colors flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold gap-2">
                      <span className="text-slate-900 font-bold truncate flex-1 min-w-0" title={loc.name}>
                        {loc.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-white text-emerald-700 font-bold text-[10px] border border-slate-200 shrink-0 font-mono shadow-2xs">
                        {loc.count} {loc.count === 1 ? 'place' : 'places'} ({loc.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500" 
                        style={{ width: `${loc.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 mt-2">
            <span className="text-[11px] font-medium text-slate-500 truncate min-w-0">
              Filtered by {locationMode === 'country' ? 'Country' : 'City'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 shrink-0 whitespace-nowrap self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{locationStats.length} Unique {locationMode === 'country' ? 'Countries' : 'Cities'}</span>
            </span>
          </div>
        </div>

        {/* 4.2 Target Niche Breakdown (50%) */}
        <div className="p-4 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between min-h-[380px] sm:h-[400px] group">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <PieChart className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Target Niche Breakdown
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Market and industry categorization
                  </p>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200 shrink-0 whitespace-nowrap">
                {nicheStats.length} Categories
              </span>
            </div>

            {/* List of Niches (Height locked to exactly 246px = exactly 4 items of 54px + 3 gaps of 10px) */}
            <div className="mt-3.5 h-[246px] min-h-[246px] max-h-[246px] overflow-y-auto pr-1 scrollbar-hover space-y-2.5">
              {nicheStats.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-xs text-slate-400 italic">No industry categories indexed yet.</p>
                </div>
              ) : (
                nicheStats.map((niche, idx) => (
                  <div 
                    key={idx} 
                    className="h-[54px] p-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 transition-colors flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold gap-2">
                      <span className="text-slate-900 font-bold truncate flex-1 min-w-0" title={niche.name}>
                        {niche.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-white text-violet-700 font-bold text-[10px] border border-slate-200 shrink-0 font-mono shadow-2xs">
                        {niche.count} leads ({niche.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-violet-600 transition-all duration-500" 
                        style={{ width: `${niche.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 mt-2">
            <span className="text-[11px] font-medium text-slate-500 truncate min-w-0">
              <span className="hidden sm:inline">Proprietary B2B market & industry taxonomy</span>
              <span className="sm:hidden">Industry taxonomy</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-md border border-violet-200 shrink-0 whitespace-nowrap self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span>Verified Segments</span>
            </span>
          </div>
        </div>
      </div>

      {/* 5. Full-Width Executive Section: Active Campaigns Benchmark */}
      <div className="p-4 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Active Campaigns Benchmark
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-campaign performance tracking, pipeline monitoring, and workspace management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              {campaigns.length} Projects Active
            </span>
            <button
              type="button"
              onClick={onCreateCampaign}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No active campaigns found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Create your first outbound campaign to begin automated prospecting and cold email dispatch.
            </p>
            <button
              type="button"
              onClick={onCreateCampaign}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Campaign</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[238px] scrollbar-hover mt-4 border border-slate-100/80 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px] sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-4 bg-slate-50">Campaign / Organization</th>
                  <th className="py-3 px-4 bg-slate-50">Target Market & Location</th>
                  <th className="py-3 px-4 text-center bg-slate-50">Scoped Leads</th>
                  <th className="py-3 px-4 text-center bg-slate-50">Emails Dispatched</th>
                  <th className="py-3 px-4 min-w-[150px] bg-slate-50">Outreach Completion</th>
                  <th className="py-3 px-4 text-right bg-slate-50">Workspace Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {campaigns.map((camp) => {
                  const leadsCount = camp.total_leads || 0;
                  const sentCount = camp.sent_leads || 0;
                  const rate = leadsCount > 0 ? Math.round((sentCount / leadsCount) * 100) : 0;

                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors h-[64px] group/row">
                      {/* 1. Campaign Name & Sender */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                          {camp.company_name || camp.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Sender: {camp.sender_name || 'Automated Engine'}</span>
                        </div>
                      </td>

                      {/* 2. Target Market & Location */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 text-xs">
                          {camp.business_type || 'General B2B'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{camp.location || 'Global / Unrestricted'}</span>
                        </div>
                      </td>

                      {/* 3. Scoped Leads */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-slate-900 text-sm font-mono">
                          {leadsCount}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">prospects</span>
                      </td>

                      {/* 4. Emails Dispatched */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{sentCount} sent</span>
                        </span>
                      </td>

                      {/* 5. Completion Bar */}
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>Dispatch Velocity</span>
                          <span className="font-bold text-emerald-700">{rate}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                            style={{ width: `${Math.min(rate, 100)}%` }}
                          />
                        </div>
                      </td>

                      {/* 6. Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenCampaign(camp)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 hover:border-slate-900 shadow-2xs transition-all cursor-pointer"
                        >
                          <span>Open Workspace</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Clicking "Open Workspace" isolates that campaign's leads database, prospecting pipeline, and email dispatcher.</span>
          </div>
          <span className="font-semibold text-slate-600 shrink-0">
            {campaigns.length} Configured Workspaces
          </span>
        </div>
      </div>
    </div>
  );
}
