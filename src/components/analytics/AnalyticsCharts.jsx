import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Activity,
  BarChart3,
  LineChart as LineIcon,
  ChevronDown,
  Check
} from 'lucide-react';

export default function AnalyticsCharts({ leads = [], campaigns = [] }) {
  const [chartStyle, setChartStyle] = useState('bars'); // 'bars' | 'line'
  const [hoveredDay, setHoveredDay] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // '7d' | '30d' | '6m' | 'all'
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Time Range Options
  // Time Range Options
  const timeRangeOptions = [
    { id: '7d', label: 'Last 7 Days', badge: '7D' },
    { id: '30d', label: 'Last 30 Days', badge: '30D' },
    { id: '6m', label: 'Last 6 Months', badge: '6M' },
    { id: 'all', label: 'All Time', badge: 'ALL' },
  ];

  // Metadata for the active time range - Professional SaaS Outbound Copy
  const timeRangeMeta = useMemo(() => {
    switch (timeRange) {
      case '30d':
        return {
          title: 'Last 30 Days',
          desc: 'Monthly prospecting volume and email outreach activity',
          subtext: '30-Day Performance Overview'
        };
      case '6m':
      case 'months':
        return {
          title: 'Last 6 Months',
          desc: 'Month-over-month outbound growth and prospecting velocity',
          subtext: '6-Month Growth Comparison'
        };
      case 'all':
        return {
          title: 'All Time',
          desc: 'Cumulative prospecting and multi-channel outreach performance',
          subtext: 'All-Time Outbound Summary'
        };
      case '7d':
      default:
        return {
          title: 'Last 7 Days',
          desc: 'Daily prospecting volume and email outreach activity',
          subtext: '7-Day Outreach Overview'
        };
    }
  }, [timeRange]);

  // Recent Live Activities (Sorted chronologically to show latest 5 verified events)
  const recentActivities = useMemo(() => {
    return [...leads]
      .sort((a, b) => {
        const timeA = new Date(a.SEND_Time || a.created_at || 0).getTime();
        const timeB = new Date(b.SEND_Time || b.created_at || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 5)
      .map((lead, idx) => {
        const isSent = lead.Cold_Mail_Status === '✅' || lead.Cold_Mail_Status === 'Sent' || Boolean(lead.SEND_Time);
        const company = lead.Company_Name || lead.title || 'Target Business';
        const timeVal = lead.SEND_Time || lead.created_at || new Date().toISOString();
        
        return {
          id: lead.id || idx,
          type: isSent ? 'sent' : 'scraped',
          title: isSent ? `Cold email dispatched to ${company}` : `New prospect extracted: ${company}`,
          company,
          time: new Date(timeVal).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          category: lead.Category || lead.categoryName || 'B2B Lead',
          city: lead.city || lead.Address || lead.address || 'Unknown Location'
        };
      });
  }, [leads]);

  // 3. 100% Real Historical Timeline Aggregated by Selected Time Range (7D, 30D, Months, All)
  const timelineData = useMemo(() => {
    const now = new Date();

    // Mode A: Last 7 Days (Daily)
    if (timeRange === '7d') {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().slice(0, 10);
        const dayLabel = d.toLocaleDateString([], { weekday: 'short' });

        const leadsOnDay = leads.filter(l => {
          if (!l.created_at) return false;
          try {
            return new Date(l.created_at).toISOString().slice(0, 10) === dateKey;
          } catch {
            return false;
          }
        }).length;

        const sentOnDay = leads.filter(l => {
          const isSent = l.Cold_Mail_Status === '✅' || l.Cold_Mail_Status === 'Sent' || Boolean(l.SEND_Time);
          if (!isSent) return false;
          const timeVal = l.SEND_Time || l.created_at;
          if (!timeVal) return false;
          try {
            return new Date(timeVal).toISOString().slice(0, 10) === dateKey;
          } catch {
            return false;
          }
        }).length;

        days.push({
          dateKey,
          label: dayLabel,
          fullDate: d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
          leads: leadsOnDay,
          sent: sentOnDay
        });
      }
      return days;
    }

    // Mode B: Last 30 Days (Daily)
    if (timeRange === '30d') {
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().slice(0, 10);
        const dayNum = d.getDate();
        const monthShort = d.toLocaleDateString([], { month: 'short' });
        const dayLabel = `${dayNum} ${monthShort}`;

        const leadsOnDay = leads.filter(l => {
          if (!l.created_at) return false;
          try {
            return new Date(l.created_at).toISOString().slice(0, 10) === dateKey;
          } catch {
            return false;
          }
        }).length;

        const sentOnDay = leads.filter(l => {
          const isSent = l.Cold_Mail_Status === '✅' || l.Cold_Mail_Status === 'Sent' || Boolean(l.SEND_Time);
          if (!isSent) return false;
          const timeVal = l.SEND_Time || l.created_at;
          if (!timeVal) return false;
          try {
            return new Date(timeVal).toISOString().slice(0, 10) === dateKey;
          } catch {
            return false;
          }
        }).length;

        days.push({
          dateKey,
          label: dayLabel,
          tickLabel: (i === 29 || i === 0 || i % 5 === 0) ? `${dayNum} ${monthShort}` : '',
          fullDate: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          leads: leadsOnDay,
          sent: sentOnDay
        });
      }
      return days;
    }

    // Mode C: Last 6 Months (Monthly comparison)
    if (timeRange === '6m' || timeRange === 'months') {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const monthKey = `${y}-${m}`;
        const monthLabel = d.toLocaleDateString([], { month: 'short' });
        const fullDate = d.toLocaleDateString([], { month: 'long', year: 'numeric' });

        const leadsInMonth = leads.filter(l => {
          if (!l.created_at) return false;
          try {
            return new Date(l.created_at).toISOString().slice(0, 7) === monthKey;
          } catch {
            return false;
          }
        }).length;

        const sentInMonth = leads.filter(l => {
          const isSent = l.Cold_Mail_Status === '✅' || l.Cold_Mail_Status === 'Sent' || Boolean(l.SEND_Time);
          if (!isSent) return false;
          const timeVal = l.SEND_Time || l.created_at;
          if (!timeVal) return false;
          try {
            return new Date(timeVal).toISOString().slice(0, 7) === monthKey;
          } catch {
            return false;
          }
        }).length;

        months.push({
          dateKey: monthKey,
          label: monthLabel,
          tickLabel: monthLabel,
          fullDate,
          leads: leadsInMonth,
          sent: sentInMonth
        });
      }
      return months;
    }

    // Mode D: All Time (Cumulative history from first record, minimum 12 months for full annual perspective)
    if (timeRange === 'all') {
      let earliestDate = new Date(now);
      leads.forEach(l => {
        if (l.created_at) {
          const dt = new Date(l.created_at);
          if (!isNaN(dt) && dt < earliestDate) earliestDate = dt;
        }
        if (l.SEND_Time) {
          const dt = new Date(l.SEND_Time);
          if (!isNaN(dt) && dt < earliestDate) earliestDate = dt;
        }
      });

      const monthsSinceStart = (now.getFullYear() - earliestDate.getFullYear()) * 12 + (now.getMonth() - earliestDate.getMonth()) + 1;
      // Show at least 12 months (Full Year) so All-Time is always broader than 6M, up to 24 months
      const totalMonths = Math.min(Math.max(12, monthsSinceStart), 24);

      const allMonths = [];
      for (let i = totalMonths - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const monthKey = `${y}-${m}`;
        const monthLabel = d.toLocaleDateString([], { month: 'short' });
        const fullDate = `${d.toLocaleDateString([], { month: 'long', year: 'numeric' })} (All-Time)`;

        const leadsInMonth = leads.filter(l => {
          if (!l.created_at) return false;
          try {
            return new Date(l.created_at).toISOString().slice(0, 7) === monthKey;
          } catch {
            return false;
          }
        }).length;

        const sentInMonth = leads.filter(l => {
          const isSent = l.Cold_Mail_Status === '✅' || l.Cold_Mail_Status === 'Sent' || Boolean(l.SEND_Time);
          if (!isSent) return false;
          const timeVal = l.SEND_Time || l.created_at;
          if (!timeVal) return false;
          try {
            return new Date(timeVal).toISOString().slice(0, 7) === monthKey;
          } catch {
            return false;
          }
        }).length;

        allMonths.push({
          dateKey: monthKey,
          label: monthLabel,
          tickLabel: monthLabel,
          fullDate,
          leads: leadsInMonth,
          sent: sentInMonth
        });
      }
      return allMonths;
    }

    return [];
  }, [leads, timeRange]);

  // Chart layout metrics with generous top headroom for peak labels (prevents collision with header strip)
  const chartHeight = 160;
  const chartWidth = 520;
  const maxVal = Math.max(...timelineData.map(d => Math.max(d.leads, d.sent)), 3);
  const dataCount = timelineData.length;

  // Calculate coordinates for SVG Line (if in line mode) with comfortable top headroom
  const lineCoordsLeads = timelineData.map((d, i) => ({
    x: (i / Math.max(1, dataCount - 1)) * (chartWidth - 60) + 30,
    y: chartHeight - (d.leads / maxVal) * (chartHeight - 65) - 25,
    ...d
  }));

  const lineCoordsSent = timelineData.map((d, i) => ({
    x: (i / Math.max(1, dataCount - 1)) * (chartWidth - 60) + 30,
    y: chartHeight - (d.sent / maxVal) * (chartHeight - 65) - 25,
    ...d
  }));

  const leadLineD = lineCoordsLeads.length > 0
    ? `M ${lineCoordsLeads[0].x},${lineCoordsLeads[0].y} ` + lineCoordsLeads.slice(1).map(c => `L ${c.x},${c.y}`).join(' ')
    : '';

  const sentLineD = lineCoordsSent.length > 0
    ? `M ${lineCoordsSent[0].x},${lineCoordsSent[0].y} ` + lineCoordsSent.slice(1).map(c => `L ${c.x},${c.y}`).join(' ')
    : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      {/* 1. Outbound Velocity & Daily Activity Card (2 Columns) - Generous Height with Zero Overlap */}
      <div className="lg:col-span-2 p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  Outbound Velocity & Activity
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {timeRangeMeta.desc}
                </p>
              </div>
            </div>

            {/* Controls: Compact Dropdown + Style Toggle + Legend */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-2">
                {/* 1. Custom SaaS Floating Dropdown (Harmonious with platform UI, rounded-xl, zero native select ugliness) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTimeDropdownOpen(prev => !prev)}
                    className={`h-8 px-2.5 sm:px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-2xs ${
                      isTimeDropdownOpen
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
                    }`}
                    title="Filter time range"
                  >
                    <Calendar className={`w-3.5 h-3.5 ${isTimeDropdownOpen ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <span>{timeRangeOptions.find(o => o.id === timeRange)?.label || 'Time Range'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isTimeDropdownOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'
                    }`} />
                  </button>

                  {/* Floating Dropdown Card */}
                  {isTimeDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsTimeDropdownOpen(false)} 
                      />
                      <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-48 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                          Timeline Range
                        </div>
                        {timeRangeOptions.map(opt => {
                          const isSelected = timeRange === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setTimeRange(opt.id);
                                setHoveredDay(null);
                                setIsTimeDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                                isSelected 
                                  ? 'bg-emerald-50 text-emerald-700 font-extrabold' 
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                                <span>{opt.label}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* 2. Style Switcher: Bars vs Line */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setChartStyle('bars')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                      chartStyle === 'bars' 
                        ? 'bg-white text-slate-900 shadow-2xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Side-by-side bars view"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Bars</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartStyle('line')}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${
                      chartStyle === 'line' 
                        ? 'bg-white text-slate-900 shadow-2xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Smooth timeline curve"
                  >
                    <LineIcon className="w-3.5 h-3.5" />
                    <span>Line</span>
                  </button>
                </div>
              </div>

              {/* 3. Legend */}
              <div className="flex items-center gap-2.5 text-xs font-semibold px-1 ml-auto sm:ml-0">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>Prospects</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
                  <span>Sent</span>
                </span>
              </div>
            </div>
          </div>

          {/* Fixed-Height Activity Info Strip (Prevents ANY layout shift or chart oscillation) */}
          <div className="mt-3 h-11 px-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors duration-150 bg-slate-50 border-slate-200 shrink-0">
            {hoveredDay ? (
              <>
                <span className="font-bold text-slate-800 flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span className="truncate">{hoveredDay.fullDate} ({hoveredDay.label}):</span>
                </span>
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <span className="text-emerald-700 font-bold flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    {hoveredDay.leads} <span className="hidden sm:inline">Prospects</span><span className="sm:hidden">L</span>
                  </span>
                  <span className="text-violet-700 font-bold flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs">
                    <span className="w-2 h-2 rounded-full bg-violet-600"></span>
                    {hoveredDay.sent} <span className="hidden sm:inline">Emails Sent</span><span className="sm:hidden">S</span>
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="text-slate-400 font-medium flex items-center gap-2 truncate text-[11px] sm:text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Hover or tap timeline to inspect activity</span>
                </span>
                <span className="text-slate-400 text-[11px] font-medium hidden sm:inline-block shrink-0">
                  {timeRangeMeta.subtext}
                </span>
              </>
            )}
          </div>

          {/* ========================================================================= */}
          {/* VIEW A: SIDE-BY-SIDE GROUPED BARS (NO OVERLAPPING AT ALL) */}
          {/* ========================================================================= */}
          {chartStyle === 'bars' && (
            <div className="flex-1 flex flex-col justify-end pt-5 sm:pt-4 pb-0 min-h-0">
              <div className="h-44 flex items-end justify-between gap-0.5 sm:gap-1 px-2 sm:px-6 relative">
                {/* Subtle horizontal division guide lines in background */}
                {[0.25, 0.5, 0.75].map(ratio => (
                  <div 
                    key={ratio} 
                    className="absolute left-2 right-2 sm:left-6 sm:right-6 border-b border-slate-100/90 border-dashed pointer-events-none" 
                    style={{ bottom: `${ratio * 100}%` }} 
                  />
                ))}

                {timelineData.map((d, idx) => {
                  const leadHeight = (d.leads / maxVal) * 105;
                  const sentHeight = (d.sent / maxVal) * 105;
                  const hasActivity = d.leads > 0 || d.sent > 0;
                  const isDense = dataCount > 14;
                  const isMediumDensity = dataCount >= 9 && dataCount <= 14;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredDay(d)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative z-10 ${
                        isDense ? 'hover:bg-slate-100/60 rounded-md transition-colors' : ''
                      }`}
                    >
                      {/* Count badge on hover or if has activity */}
                      {hasActivity && (
                        <div className={`mb-1.5 font-black text-slate-700 bg-slate-100 rounded border border-slate-200 shadow-2xs ${
                          isDense ? 'text-[8px] px-1 py-0.2' : isMediumDensity ? 'text-[9px] px-1 py-0.5' : 'text-[10px] px-1.5 py-0.5'
                        }`}>
                          {d.leads}
                        </div>
                      )}

                      {/* Side-by-side bars or Faint Division Tick */}
                      {hasActivity ? (
                        <div className={`flex items-end justify-center ${
                          isDense 
                            ? 'gap-0.5 max-w-[16px]' 
                            : isMediumDensity 
                              ? 'gap-1 max-w-[28px] sm:max-w-[34px]' 
                              : 'gap-1.5 max-w-[48px]'
                        } w-full`}>
                          {/* Prospects Bar (Emerald) */}
                          <div
                            className={`rounded-t-lg transition-all duration-300 ${
                              isDense ? 'w-1.5 sm:w-2' : isMediumDensity ? 'w-2 sm:w-2.5' : 'w-3.5 sm:w-4'
                            } ${
                              d.leads > 0 
                                ? 'bg-emerald-600 group-hover:bg-emerald-500 shadow-xs' 
                                : 'bg-slate-200/80 h-1'
                            }`}
                            style={{ height: d.leads > 0 ? `${Math.max(10, leadHeight)}px` : '4px' }}
                            title={`${d.fullDate}: ${d.leads} Prospects`}
                          />

                          {/* Sent Bar (Violet) */}
                          <div
                            className={`rounded-t-lg transition-all duration-300 ${
                              isDense ? 'w-1.5 sm:w-2' : isMediumDensity ? 'w-2 sm:w-2.5' : 'w-3.5 sm:w-4'
                            } ${
                              d.sent > 0 
                                ? 'bg-violet-600 group-hover:bg-violet-500 shadow-xs' 
                                : 'bg-slate-200/80 h-1'
                            }`}
                            style={{ height: d.sent > 0 ? `${Math.max(10, sentHeight)}px` : '4px' }}
                            title={`${d.fullDate}: ${d.sent} Sent`}
                          />
                        </div>
                      ) : (
                        /* Faint Division Slot for Every Day or Inactive Month */
                        <div className="flex items-end justify-center w-full pb-0.5">
                          <div 
                            className={`rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-all duration-150 ${
                              isDense 
                                ? 'w-1.5 h-1 group-hover:h-2 group-hover:w-2' 
                                : isMediumDensity 
                                  ? 'w-2.5 h-1' 
                                  : 'w-4 h-1'
                            }`}
                            title={`${d.fullDate}: No activity`}
                          />
                        </div>
                      )}

                      {/* When NOT dense, show label directly under the bar */}
                      {!isDense && (
                        <div className={`mt-3 ${isMediumDensity ? 'text-[10px] sm:text-[11px]' : 'text-[11px]'} font-bold transition-colors ${
                          hoveredDay?.dateKey === d.dateKey ? 'text-slate-900 font-extrabold' : 'text-slate-400 group-hover:text-slate-900'
                        }`}>
                          {d.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* When dense (30D), show clean dedicated X-Axis milestone labels */}
              {dataCount > 14 && (
                <div className="flex justify-between items-center px-4 sm:px-6 pt-2.5 text-[11px] font-semibold text-slate-400 select-none">
                  <span className="hover:text-slate-700 transition-colors">{timelineData[0]?.label}</span>
                  <span className="hover:text-slate-700 transition-colors">{timelineData[Math.floor(dataCount * 0.25)]?.label}</span>
                  <span className="hover:text-slate-700 transition-colors">{timelineData[Math.floor(dataCount * 0.5)]?.label}</span>
                  <span className="hover:text-slate-700 transition-colors">{timelineData[Math.floor(dataCount * 0.75)]?.label}</span>
                  <span className="hover:text-slate-900 font-bold text-slate-600 transition-colors">{timelineData[dataCount - 1]?.label}</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW B: TRUTHFUL REAL LINE (DOTS ONLY WHERE VALUE > 0) */}
          {/* ========================================================================= */}
          {chartStyle === 'line' && (
            <div className="flex-1 flex flex-col justify-end relative pt-4 pb-0 min-h-0 w-full">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-48 overflow-visible"
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Horizontal Grid lines */}
                {[0.25, 0.5, 0.75, 1.0].map(ratio => (
                  <line
                    key={ratio}
                    x1="0"
                    y1={chartHeight * ratio}
                    x2={chartWidth}
                    y2={chartHeight * ratio}
                    stroke="#f8fafc"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Vertical Day Guide Line on hover */}
                {hoveredDay?.x !== undefined && (
                  <line
                    x1={hoveredDay.x}
                    y1={10}
                    x2={hoveredDay.x}
                    y2={chartHeight}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="pointer-events-none transition-all duration-150"
                  />
                )}

                {/* Prospects Line */}
                {leadLineD && (
                  <path
                    d={leadLineD}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none"
                  />
                )}

                {/* Sent Line (Dashed violet) */}
                {sentLineD && (
                  <path
                    d={sentLineD}
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none"
                  />
                )}

                {/* Real Dots: Rendered ONLY on days that actually have activity (> 0)! */}
                {timelineData.map((d, i) => {
                  if (d.leads === 0 && d.sent === 0) return null; // 100% faithful to database!

                  const leadY = lineCoordsLeads[i].y;
                  const sentY = lineCoordsSent[i].y;
                  const cx = lineCoordsLeads[i].x;
                  const isHovered = hoveredDay?.dateKey === d.dateKey;

                  // Case A: Prospects === Sent > 0 (Both metrics match at the exact same peak)
                  if (d.leads === d.sent && d.leads > 0) {
                    return (
                      <g key={`dual-dot-${i}`} className="pointer-events-none">
                        {/* Ambient glow ring when hovered */}
                        {isHovered && (
                          <circle
                            cx={cx}
                            cy={leadY}
                            r="13"
                            fill="#10b981"
                            fillOpacity="0.2"
                          />
                        )}
                        {/* Outer emerald circle (Prospects) */}
                        <circle
                          cx={cx}
                          cy={leadY}
                          r={isHovered ? 7.5 : 6}
                          fill="#ffffff"
                          stroke="#059669"
                          strokeWidth="2.5"
                          className="shadow-sm transition-all duration-150"
                        />
                        {/* Inner concentric violet bullseye (Sent) */}
                        <circle
                          cx={cx}
                          cy={leadY}
                          r={isHovered ? 3.8 : 3}
                          fill="#7c3aed"
                          className="transition-all duration-150"
                        />
                        {/* Count text above */}
                        <text
                          x={cx}
                          y={leadY - 12}
                          textAnchor="middle"
                          className="text-[11px] font-black fill-slate-800"
                        >
                          {d.leads}
                        </text>
                      </g>
                    );
                  }

                  // Case B: Prospects and Sent have different non-zero values
                  return (
                    <g key={`split-dots-${i}`} className="pointer-events-none">
                      {d.leads > 0 && (
                        <g>
                          {isHovered && (
                            <circle cx={cx} cy={leadY} r="12" fill="#10b981" fillOpacity="0.15" />
                          )}
                          <circle
                            cx={cx}
                            cy={leadY}
                            r={isHovered ? 7 : 5.5}
                            fill="#ffffff"
                            stroke="#059669"
                            strokeWidth="2.5"
                            className="transition-all duration-150"
                          />
                          <text
                            x={cx}
                            y={leadY - 10}
                            textAnchor="middle"
                            className="text-[10px] font-bold fill-emerald-800"
                          >
                            {d.leads}
                          </text>
                        </g>
                      )}
                      {d.sent > 0 && (
                        <g>
                          {isHovered && (
                            <circle cx={cx} cy={sentY} r="11" fill="#7c3aed" fillOpacity="0.15" />
                          )}
                          <circle
                            cx={cx}
                            cy={sentY}
                            r={isHovered ? 6 : 4.5}
                            fill="#ffffff"
                            stroke="#7c3aed"
                            strokeWidth="2"
                            className="transition-all duration-150"
                          />
                          <text
                            x={cx}
                            y={sentY - 10}
                            textAnchor="middle"
                            className="text-[10px] font-bold fill-violet-800"
                          >
                            {d.sent}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Day Hitbox Slices (Effortless, rock-solid hover tracking without mouse jitter) */}
                {timelineData.map((d, i) => {
                  const cx = lineCoordsLeads[i].x;
                  const step = (chartWidth - 60) / Math.max(1, dataCount - 1);
                  const hitX = i === 0 ? 0 : cx - step / 2;
                  const hitW = i === 0 ? 30 + step / 2 : (i === dataCount - 1 ? chartWidth - (cx - step / 2) : step);

                  return (
                    <rect
                      key={`hitbox-${d.dateKey}`}
                      x={hitX}
                      y={0}
                      width={hitW}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredDay({ ...d, x: cx })}
                    />
                  );
                })}
              </svg>

              {/* X-axis labels */}
              {dataCount > 14 ? (
                <div className="flex justify-between items-center px-6 pt-2 text-[11px] font-semibold text-slate-400 select-none">
                  <span className="hover:text-slate-700 transition-colors">{timelineData[0]?.label}</span>
                  <span className="hover:text-slate-700 transition-colors">{timelineData[Math.floor(dataCount * 0.25)]?.label}</span>
                  <span className="hover:text-slate-700 transition-colors">{timelineData[Math.floor(dataCount * 0.5)]?.label}</span>
                  <span className="hover:text-slate-700 transition-colors">{timelineData[Math.floor(dataCount * 0.75)]?.label}</span>
                  <span className="hover:text-slate-900 font-bold text-slate-600 transition-colors">{timelineData[dataCount - 1]?.label}</span>
                </div>
              ) : (
                <div className={`flex justify-between px-6 pt-2 ${dataCount > 8 ? 'text-[10px] sm:text-[11px]' : 'text-[11px]'} font-semibold text-slate-400`}>
                  {timelineData.map((p, idx) => {
                    const isHovered = hoveredDay?.dateKey === p.dateKey;
                    return (
                      <span 
                        key={idx} 
                        className={`transition-colors duration-150 ${isHovered ? 'text-slate-900 font-bold' : ''}`}
                      >
                        {p.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        {/* Footnote stats - Clean, Direct & Professional SaaS Telemetry */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 mt-2">
          <div className="flex items-center gap-2 font-medium text-slate-600 min-w-0">
            <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Live outreach performance updated automatically</span>
              <span className="sm:hidden">Live outreach telemetry</span>
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 sm:py-0.5 rounded-lg border border-emerald-200 whitespace-nowrap shrink-0 text-xs self-start sm:self-auto shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{timeRangeMeta.title}</span>
            <span className="text-emerald-400">•</span>
            <span>Live Telemetry</span>
          </span>
        </div>
      </div>

      {/* 2. Live Outbound Activity Feed (1 Column) - Clean Auto-Stretch Card */}
      <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between h-full">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                  Live Outbound Activity Feed
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Real-time verified events
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold shrink-0 whitespace-nowrap shadow-2xs">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Real-Time</span>
            </div>
          </div>

          {/* Activity items (strictly 4-5 items, cleanly spaced, ZERO scrollbar) */}
          <div className="mt-3.5 space-y-2.5">
            {recentActivities.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-xs text-slate-400 italic">No outreach activity recorded yet.</p>
              </div>
            ) : (
              recentActivities.map((act) => (
                <div 
                  key={act.id} 
                  className="flex items-center gap-2.5 sm:gap-3 p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    act.type === 'sent' 
                      ? 'bg-emerald-100/70 text-emerald-700' 
                      : 'bg-sky-100/70 text-sky-700'
                  }`}>
                    {act.type === 'sent' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-slate-900 truncate text-xs min-w-0">
                        {/* On desktop: full descriptive title */}
                        <span className="hidden sm:inline truncate">{act.title}</span>
                        {/* On mobile: Company name is front & center, not cut off by repetitive prefix! */}
                        <span className="sm:hidden font-extrabold truncate text-slate-900">{act.company}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {act.time}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                      {/* On mobile: compact status badge so user knows what action occurred */}
                      <span className={`sm:hidden inline-flex items-center text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        act.type === 'sent' 
                          ? 'bg-emerald-100/80 text-emerald-800' 
                          : 'bg-sky-100/80 text-sky-800'
                      }`}>
                        {act.type === 'sent' ? 'Sent' : 'Lead'}
                      </span>
                      <span className="truncate font-medium max-w-[130px] sm:max-w-[170px]">{act.city}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 truncate">{act.category}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footnote Teaser */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-4">
          <span className="text-[11px] font-medium text-slate-400">
            Showing latest {recentActivities.length} actions
          </span>
          <span className="text-[11px] font-bold text-slate-600">
            Audit Stream Active
          </span>
        </div>
      </div>
    </div>
  );
}
