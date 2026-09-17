import React from 'react';
import { Globe, MapPin, Cpu, Database, Mail, Send, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Globe,
    title: "React Webhook",
    subtitle: "Campaign Trigger",
    color: "from-cyan-500 to-blue-500",
    border: "border-cyan-500/40",
    text: "text-cyan-400",
    bg: "bg-cyan-500/10"
  },
  {
    icon: MapPin,
    title: "Discovery Engine",
    subtitle: "Autonomous Prospector",
    color: "from-blue-500 to-indigo-500",
    border: "border-blue-500/40",
    text: "text-blue-400",
    bg: "bg-blue-500/10"
  },
  {
    icon: Cpu,
    title: "AI Enrichment Engine",
    subtitle: "Executive Contact Resolution",
    color: "from-indigo-500 to-purple-500",
    border: "border-indigo-500/40",
    text: "text-indigo-400",
    bg: "bg-indigo-500/10"
  },
  {
    icon: Database,
    title: "Google Sheets",
    subtitle: "CRM Lead Archival",
    color: "from-purple-500 to-emerald-500",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10"
  },
  {
    icon: Mail,
    title: "AI Copywriter",
    subtitle: "Personalized Outreach",
    color: "from-emerald-500 to-amber-500",
    border: "border-amber-500/40",
    text: "text-amber-400",
    bg: "bg-amber-500/10"
  },
  {
    icon: Send,
    title: "Gmail Automation",
    subtitle: "Direct Dispatch",
    color: "from-amber-500 to-rose-500",
    border: "border-rose-500/40",
    text: "text-rose-400",
    bg: "bg-rose-500/10"
  }
];

export default function WorkflowPipeline() {
  return (
    <div className="w-full glass-card rounded-2xl p-5 border border-white/[0.08] mb-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-72 h-32 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
            End-to-End n8n Pipeline
          </span>
          <h2 className="text-sm sm:text-base font-semibold text-white">
            Automated B2B Lead Generation & Outreach Flow
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Ready for Webhook Dispatch</span>
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div 
              key={idx}
              className="relative p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${step.bg} border ${step.border} ${step.text}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">0{idx + 1}</span>
              </div>
              <div className="font-semibold text-xs text-slate-200 group-hover:text-white transition-colors">
                {step.title}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {step.subtitle}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
