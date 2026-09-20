import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function MetricsGrid({ leads = [], campaigns = [] }) {
  // Aggregate statistics across all user's leads
  const totalLeads = leads.length;
  const sentEmails = leads.filter(l => l.Cold_Mail_Status === '✅' || l.Cold_Mail_Status === 'Sent' || Boolean(l.SEND_Time)).length;
  const verifiedEmails = leads.filter(l => l.Email_Address || (l.emails && l.emails.length > 0)).length;
  const phoneNumbers = leads.filter(l => l.Phone_Nummber || l.phone || l.phoneUnformatted).length;
  const websites = leads.filter(l => l.Website || l.website).length;
  const linkedInCount = leads.filter(l => l.LinkedIn || (l.linkedIns && l.linkedIns.length > 0)).length;
  const instagramCount = leads.filter(l => l.Instagram || (l.instagrams && l.instagrams.length > 0)).length;
  const facebookCount = leads.filter(l => l.Facebook || (l.facebooks && l.facebooks.length > 0)).length;
  const activeCampaigns = campaigns.length;

  const emailRate = totalLeads > 0 ? Math.round((verifiedEmails / totalLeads) * 100) : 0;
  const sentRate = verifiedEmails > 0 ? Math.round((sentEmails / verifiedEmails) * 100) : 0;

  const cards = [
    {
      id: 'leads',
      label: 'Total Prospects Found',
      value: totalLeads,
      subtext: `${campaigns.length} campaigns active`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      badge: 'All Places'
    },
    {
      id: 'sent',
      label: 'Outreach Dispatched',
      value: sentEmails,
      subtext: `${sentRate}% of verified emails sent`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      badge: 'Sent'
    },
    {
      id: 'emails',
      label: 'Verified Emails',
      value: verifiedEmails,
      subtext: `${emailRate}% email discovery rate`,
      icon: Mail,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-100',
      badge: 'Enriched'
    },
    {
      id: 'phones',
      label: 'Direct Phone Numbers',
      value: phoneNumbers,
      subtext: 'Ready for direct cold calling',
      icon: Phone,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      badge: 'Direct Lines'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn Profiles',
      value: linkedInCount,
      subtext: 'B2B executive profiles',
      customIcon: (
        <svg className="w-5 h-5 fill-current text-[#0077b5]" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.88a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z"/>
        </svg>
      ),
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-100',
      badge: 'B2B Social'
    },
    {
      id: 'instagram',
      label: 'Instagram Accounts',
      value: instagramCount,
      subtext: 'Visual branding channels',
      customIcon: (
        <svg className="w-5 h-5 fill-current text-[#e4405f]" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"/>
        </svg>
      ),
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      badge: 'Visual DM'
    },
    {
      id: 'facebook',
      label: 'Facebook Pages',
      value: facebookCount,
      subtext: 'Active community pages',
      customIcon: (
        <svg className="w-5 h-5 fill-current text-[#1877f2]" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z"/>
        </svg>
      ),
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      badge: 'Pages'
    },
    {
      id: 'campaigns',
      label: 'Active Campaigns',
      value: activeCampaigns,
      subtext: 'Independent brand workspaces',
      icon: Briefcase,
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      badge: 'Tenants'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all duration-200 shadow-2xs hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${card.bgColor} flex items-center justify-center shrink-0`}>
                {card.customIcon ? card.customIcon : <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color}`} />}
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {card.badge}
              </span>
            </div>

            <div className="mt-3 sm:mt-4">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate">
                {card.label}
              </span>
              <div className="text-xl sm:text-3xl font-black text-slate-900 mt-0.5 sm:mt-1 tracking-tight">
                {card.value.toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 font-medium truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
