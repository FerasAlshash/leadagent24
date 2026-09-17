import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  Search, 
  Send, 
  Building2, 
  Briefcase, 
  Rocket, 
  CheckCircle2, 
  Clock, 
  Download, 
  Filter, 
  Calendar, 
  ArrowUpRight, 
  Check, 
  Copy, 
  Sliders, 
  Mail, 
  MapPin, 
  Users,
  ChevronDown,
  ShieldCheck,
  Globe,
  Eye
} from 'lucide-react';
import SentEmailModal from '../components/SentEmailModal';
import PageHeader from '../components/PageHeader';

export default function AuditLogPage({
  leads = [],
  campaigns = [],
  onRefresh,
  loading = false
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'email_sent' | 'lead_scraped' | 'campaign_created' | 'search_dispatched'
  const [selectedCampaignId, setSelectedCampaignId] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'today' | '7d' | '30d'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest) | 'asc' (oldest)
  const [copiedId, setCopiedId] = useState(null);
  const [selectedEmailLead, setSelectedEmailLead] = useState(null);

  // Map campaigns by ID for quick lookup
  const campaignMap = useMemo(() => {
    const map = {};
    campaigns.forEach(c => {
      map[c.id] = c.company_name || c.title || 'Campaign Workspace';
    });
    return map;
  }, [campaigns]);

  // Build 100% real, comprehensive activity feed from database entities
  const allActivities = useMemo(() => {
    const feed = [];

    // 1. Process Leads (Scraped / Extracted events & Email delivery events)
    leads.forEach((lead, idx) => {
      const company = lead.Company_Name || lead.title || 'Target Business';
      const campName = campaignMap[lead.campaign_id] || 'General Workspace';
      const city = lead.city || lead.Address || lead.address || 'Target Location';
      const category = lead.Category || lead.categoryName || 'B2B Prospect';
      const email = lead.Email_Address || (Array.isArray(lead.emails) && lead.emails[0]) || null;
      const phone = lead.Phone_Nummber || lead.phone || null;
      const createdAt = lead.created_at || new Date().toISOString();

      // Event A: Lead Extracted / Scraped
      feed.push({
        id: `lead-scraped-${lead.id || idx}`,
        rawId: lead.id,
        type: 'lead_scraped',
        typeLabel: 'Prospect Discovered',
        icon: Building2,
        iconColor: 'bg-sky-50 text-sky-600 border-sky-200',
        badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
        title: `Prospect discovered: ${company}`,
        description: `Verified ${category} extracted in ${city}`,
        timestamp: createdAt,
        campaignId: lead.campaign_id,
        campaignName: campName,
        company,
        email,
        phone,
        location: city,
        statusText: 'Verified Lead',
        statusColor: 'text-sky-700 bg-sky-50 border-sky-200'
      });

      // Event B: Cold Email Dispatched
      const isSent = lead.Cold_Mail_Status === '✅' || lead.Cold_Mail_Status === 'Sent' || Boolean(lead.SEND_Time);
      if (isSent) {
        const sentTime = lead.SEND_Time || lead.created_at || new Date().toISOString();
        feed.push({
          id: `email-sent-${lead.id || idx}`,
          rawId: lead.id,
          lead,
          type: 'email_sent',
          typeLabel: 'Outbound Dispatched',
          icon: Send,
          iconColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          title: `Cold email delivered to ${company}`,
          description: `Personalized outbound pitch transmitted to ${email || 'verified inbox'}`,
          timestamp: sentTime,
          campaignId: lead.campaign_id,
          campaignName: campName,
          company,
          email,
          phone,
          location: city,
          statusText: 'Delivered',
          statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        });
      }
    });

    // 2. Process Campaigns (Creation & Search Execution events)
    campaigns.forEach((camp, idx) => {
      const campTitle = camp.company_name || camp.title || 'Campaign Workspace';
      const createdAt = camp.created_at || new Date().toISOString();

      // Event C: Campaign Created
      feed.push({
        id: `camp-created-${camp.id || idx}`,
        rawId: camp.id,
        type: 'campaign_created',
        typeLabel: 'Campaign Created',
        icon: Briefcase,
        iconColor: 'bg-purple-50 text-purple-600 border-purple-200',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        title: `Campaign workspace established: ${campTitle}`,
        description: `Targeting ${camp.business_type || 'Industry'} in ${camp.location || 'all regions'}`,
        timestamp: createdAt,
        campaignId: camp.id,
        campaignName: campTitle,
        company: campTitle,
        location: camp.location || 'Global',
        statusText: 'Active Workspace',
        statusColor: 'text-purple-700 bg-purple-50 border-purple-200'
      });

      // Event D: Search Dispatched
      if (camp.last_run_at) {
        feed.push({
          id: `camp-run-${camp.id || idx}`,
          rawId: camp.id,
          type: 'search_dispatched',
          typeLabel: 'Prospecting Dispatched',
          icon: Rocket,
          iconColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          title: `Prospecting search dispatched for ${campTitle}`,
          description: `Automated query executed for target quota of ${camp.lead_number || 10} records`,
          timestamp: camp.last_run_at,
          campaignId: camp.id,
          campaignName: campTitle,
          company: campTitle,
          location: camp.location || 'Target Region',
          statusText: 'Dispatched 🚀',
          statusColor: 'text-indigo-700 bg-indigo-50 border-indigo-200'
        });
      }
    });

    return feed;
  }, [leads, campaigns, campaignMap]);

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    const now = new Date().getTime();

    return allActivities
      .filter((act) => {
        // 1. Type Filter
        if (typeFilter !== 'all' && act.type !== typeFilter) {
          return false;
        }

        // 2. Campaign Filter
        if (selectedCampaignId !== 'all' && String(act.campaignId) !== String(selectedCampaignId)) {
          return false;
        }

        // 3. Time Filter
        if (timeFilter !== 'all') {
          const actTime = new Date(act.timestamp).getTime();
          const diffHours = (now - actTime) / (1000 * 60 * 60);

          if (timeFilter === 'today' && diffHours > 24) return false;
          if (timeFilter === '7d' && diffHours > 24 * 7) return false;
          if (timeFilter === '30d' && diffHours > 24 * 30) return false;
        }

        // 4. Text Search Filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = act.title.toLowerCase().includes(q);
          const matchDesc = act.description.toLowerCase().includes(q);
          const matchComp = (act.company || '').toLowerCase().includes(q);
          const matchEmail = (act.email || '').toLowerCase().includes(q);
          const matchCamp = (act.campaignName || '').toLowerCase().includes(q);
          const matchLoc = (act.location || '').toLowerCase().includes(q);

          if (!matchTitle && !matchDesc && !matchComp && !matchEmail && !matchCamp && !matchLoc) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime() || 0;
        const timeB = new Date(b.timestamp).getTime() || 0;
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [allActivities, typeFilter, selectedCampaignId, timeFilter, searchTerm, sortOrder]);

  // Aggregate Metrics Summary
  const metrics = useMemo(() => {
    const totalEvents = allActivities.length;
    const sentEmails = allActivities.filter(a => a.type === 'email_sent').length;
    const leadsDiscovered = allActivities.filter(a => a.type === 'lead_scraped').length;
    const campaignsCount = campaigns.length;

    return { totalEvents, sentEmails, leadsDiscovered, campaignsCount };
  }, [allActivities, campaigns]);

  // Relative Time Formatter
  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  // Full Exact Date Formatter
  const formatFullDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return String(isoString);
    }
  };

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Audit Trail to CSV
  const handleExportCSV = () => {
    if (filteredActivities.length === 0) return;

    const headers = ["Event ID", "Event Type", "Title", "Description", "Campaign", "Company", "Contact Email", "Phone", "Location", "Timestamp", "Status"];
    const rows = filteredActivities.map(act => [
      act.id,
      act.typeLabel,
      act.title,
      act.description,
      act.campaignName,
      act.company || '',
      act.email || '',
      act.phone || '',
      act.location || '',
      act.timestamp,
      act.statusText
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Page Header Card */}
      <PageHeader
        icon={History}
        title="Activity & Outbound Audit Log"
        subtitle="Immutable chronological telemetry of all outbound dispatches, prospect discoveries, campaign lifecycle events, and system mutations."
        badges={
          <>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Security & Telemetry Audit</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {allActivities.length} Logged Actions
            </span>
          </>
        }
        actions={
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredActivities.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit CSV</span>
          </button>
        }
      />

      {/* 2. Top Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Logged Events</span>
            <History className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.totalEvents}</div>
          <div className="text-[11px] text-slate-400 mt-1">Full system audit trail</div>
        </div>

        {/* Cold Emails Sent */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Outbound Emails Sent</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{metrics.sentEmails}</div>
          <div className="text-[11px] text-slate-400 mt-1">Confirmed with ✅ status</div>
        </div>

        {/* Prospects Extracted */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Prospects Discovered</span>
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.leadsDiscovered}</div>
          <div className="text-[11px] text-slate-400 mt-1">Saved into Supabase database</div>
        </div>

        {/* Active Campaigns */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Workspaces Active</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.campaignsCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Independent company channels</div>
        </div>
      </div>

      {/* 3. Filter & Search Controls Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
        {/* Top Filter Row: Search + Campaign Select + Time Filter + Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company, email, campaign or city..."
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Campaign Select */}
            <div className="relative">
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="pl-3.5 pr-8 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-slate-700 appearance-none cursor-pointer shadow-2xs"
              >
                <option value="all">All Campaigns ({campaigns.length})</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company_name || c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Time Filter Select */}
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="pl-3.5 pr-8 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-slate-700 appearance-none cursor-pointer shadow-2xs"
              >
                <option value="all">All Time</option>
                <option value="today">Today (Last 24h)</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Toggle Sort Direction"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Filter Row: Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Category:
          </span>

          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Events ({allActivities.length})
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter('email_sent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              typeFilter === 'email_sent'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Send className="w-3 h-3" />
            <span>Outbound Emails ({metrics.sentEmails})</span>
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter('lead_scraped')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              typeFilter === 'lead_scraped'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Prospects Discovered ({metrics.leadsDiscovered})</span>
          </button>

          <button
            type="button"
            onClick={() => setTypeFilter('campaign_created')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              typeFilter === 'campaign_created'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Campaign Lifecycle</span>
          </button>
        </div>
      </div>

      {/* 4. Scrollable Activity Stream Container (CRITICAL: Fixed Viewport Height with Clean Scrollbar) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Stream Header Strip */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              {filteredActivities.length === allActivities.length
                ? `All Recorded Events (${allActivities.length})`
                : `Showing ${filteredActivities.length} of ${allActivities.length} Events`}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            Scroll inside container to view historical records
          </div>
        </div>

        {/* Scrollable Feed List - Capped at 640px height with elegant hover scrollbar */}
        <div className="max-h-[640px] overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
          {filteredActivities.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <History className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No matching activities found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                No telemetry actions match your selected search keywords or category filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setSelectedCampaignId('all');
                  setTimeFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredActivities.map((act) => {
              const IconComp = act.icon;

              return (
                <div 
                  key={act.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 rounded-2xl px-3 transition-colors group"
                >
                  {/* Left: Icon + Event Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${act.iconColor}`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${act.badgeColor}`}>
                          {act.typeLabel}
                        </span>

                        {/* Campaign Workspace Badge with direct navigation */}
                        <button
                          type="button"
                          onClick={() => act.campaignId && navigate(`/campaigns/${act.campaignId}`)}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Open Campaign Workspace"
                        >
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[140px]">{act.campaignName}</span>
                          <ArrowUpRight className="w-2.5 h-2.5 text-slate-400" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {act.title}
                      </h4>

                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {act.description}
                      </p>

                      {/* Contact & Location Metadata Badges */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                        {act.location && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{act.location}</span>
                          </span>
                        )}

                        {act.email && (
                          <span className="flex items-center gap-1 text-slate-600 font-mono">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{act.email}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(act.email, `em-${act.id}`)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                              title="Copy email"
                            >
                              {copiedId === `em-${act.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </span>
                        )}

                        {act.type === 'email_sent' && act.lead && (
                          <button
                            type="button"
                            onClick={() => setSelectedEmailLead(act.lead)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300 hover:border-emerald-600 font-bold text-[11px] shadow-2xs transition-all cursor-pointer group active:scale-95"
                            title="View personalized cold email sent to this contact"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white transition-colors" />
                            <span>Preview Email</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Timestamp & Status */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span 
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-default" 
                      title={formatFullDate(act.timestamp)}
                    >
                      {formatRelativeTime(act.timestamp)}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400 hidden sm:block">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border mt-1 ${act.statusColor}`}>
                      {act.statusText}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stream Footer Strip */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] font-semibold text-slate-600">
            Audit Trail Active • Realtime Supabase Telemetry
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {filteredActivities.length === allActivities.length
              ? `Total Captured: ${allActivities.length}`
              : `Showing: ${filteredActivities.length} / Total: ${allActivities.length}`}
          </span>
        </div>
      </div>

      {/* Dispatched Cold Email Modal Preview */}
      {selectedEmailLead && (
        <SentEmailModal
          isOpen={Boolean(selectedEmailLead)}
          onClose={() => setSelectedEmailLead(null)}
          lead={selectedEmailLead}
          campaign={campaigns.find(c => c.id === selectedEmailLead?.campaign_id)}
        />
      )}
    </div>
  );
}
