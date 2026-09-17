import React from 'react';
import { 
  Globe, 
  MapPin, 
  FileSpreadsheet, 
  Mail, 
  Send, 
  Filter, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Layers,
  Cpu
} from 'lucide-react';

export default function PipelineOverviewPage() {
  const pipelineSteps = [
    {
      num: "01",
      title: "Webhook Trigger",
      type: "n8n Webhook Node",
      badge: "Inbound Trigger",
      badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      desc: "Receives parameters via HTTP POST from this console, including target business niche, location query, volume, and company offer.",
      status: "Configured (lead-machine)"
    },
    {
      num: "02",
      title: "Autonomous Prospecting Engine",
      type: "Discovery Node",
      badge: "Data Collection",
      badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      desc: "Executes proprietary business discovery algorithms to extract verified corporate listings, direct phones, verified domains, and addresses.",
      status: "Connected & Active"
    },
    {
      num: "03",
      title: "Respond to Webhook",
      type: "Respond to Webhook Node",
      badge: "Instant Return",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      desc: "Transmits discovered business profiles immediately back to this console so you can inspect, search, and export CSVs without waiting for cold emails to send.",
      status: "Active"
    },
    {
      num: "04",
      title: "Website Verification Filter",
      type: "Filter Node",
      badge: "Quality Control",
      badgeColor: "bg-slate-800 text-slate-300 border-slate-700",
      desc: "Filters places to only proceed with businesses having active domains and websites, eliminating dead or incomplete listings.",
      status: "Strict Validation"
    },
    {
      num: "05",
      title: "AI Decision Maker Extractor",
      type: "Information Extractor",
      badge: "AI Extraction",
      badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      desc: "Analyzes contact data and prioritizes high-yield executive corporate emails over generic inboxes.",
      status: "AI Neural Model"
    },
    {
      num: "06",
      title: "Google Sheets CRM Archival",
      type: "Google Sheets Node",
      badge: "Lead Archival",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      desc: "Appends company name, category, website, phone, verified email, and social handles into your Google Sheet.",
      status: "Sheet1 Appended"
    },
    {
      num: "07",
      title: "Rate Limiting & Wait Delays",
      type: "SplitInBatches & Wait",
      badge: "Anti-Spam Throttling",
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      desc: "Loops through extracted leads one by one with calculated delays to safeguard your Gmail domain sender reputation.",
      status: "Throttled Loop"
    },
    {
      num: "08",
      title: "Gemini Cold Email Copywriter",
      type: "LangChain Information Extractor",
      badge: "Copy Generation",
      badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      desc: "Crafts an eye-catching email subject and a customized cold email body tailored to the recipient's niche using your chosen style and value proposition.",
      status: "Personalized Copy"
    },
    {
      num: "09",
      title: "Gmail Automated Dispatch",
      type: "Gmail OAuth2 Node",
      badge: "Outreach Delivery",
      badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      desc: "Transmits the personalized cold email to the verified contact address with configured retry-on-fail mechanisms.",
      status: "Connected"
    },
    {
      num: "10",
      title: "Status Timestamp & Audit",
      type: "Google Sheets Node",
      badge: "Delivery Status",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      desc: "Updates the Google Sheet record with a delivery checkmark ✅ and the exact dispatch timestamp.",
      status: "Sheet Updated"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Workflow Architecture
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            End-to-End Automation Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete technical blueprint of how data flows through autonomous discovery, AI enrichment, secure CRM synchronization, and multi-channel delivery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            10 Node Flow Connected
          </span>
        </div>
      </div>

      {/* Pipeline Steps Flow */}
      <div className="space-y-4">
        {pipelineSteps.map((step, idx) => (
          <div 
            key={step.num}
            className="section-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 font-mono text-sm font-bold shrink-0">
                {step.num}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {step.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                  <span className="text-slate-500 text-xs hidden sm:inline">•</span>
                  <span className="text-slate-400 text-xs font-mono">{step.type}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
                  {step.desc}
                </p>
              </div>
            </div>

            <div className="shrink-0 self-start md:self-center">
              <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
                {step.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
