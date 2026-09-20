import React, { useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Compass, 
  Sliders,
  Cpu, 
  Database, 
  Globe, 
  Zap, 
  Layers, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';
import LeadAgentLogo from '../components/LeadAgentLogo';

export default function AboutPage({ onGetStarted, onSignIn, onBackToHome, onNavigateLegal }) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const pillars = [
    {
      icon: Zap,
      title: "Real-Time Google Places Discovery",
      description: "Static database directories become obsolete within months. LeadAgent24 extracts live, fresh commercial data directly from Google Places with real-time contact verification."
    },
    {
      icon: Cpu,
      title: "Bring Your Own Key (BYOK) Freedom",
      description: "Zero vendor lock-in. Connect your own trusted outbound providers (Resend, Brevo, SendGrid, or private SMTP) with full domain authentication and deliverability control."
    },
    {
      icon: Sliders,
      title: "Adaptive AI Email Synthesis",
      description: "Our autonomous engine tailors every cold email according to your target niche, company value pitch, and chosen tone (Professional, Direct, Consultative, or Urgent)."
    },
    {
      icon: Database,
      title: "Cryptographic Multi-Tenant Isolation",
      description: "Engineered with strict Row Level Security (RLS) and AES-encrypted credential vaults, guaranteeing that your leads, campaigns, and API keys remain strictly confidential to your workspace."
    }
  ];

  const engineeringStandards = [
    { 
      title: "Real-Time Places Discovery", 
      badge: "Zero Stale Lists",
      desc: "Live algorithmic extraction directly from Google Places ensures every phone number, website, and physical address is current and operational." 
    },
    { 
      title: "Autonomous Event-Driven Pipeline", 
      badge: "24/7 Execution",
      desc: "Distributed background pipelines manage continuous prospecting, contact resolution, and custom email dispatch without manual oversight." 
    },
    { 
      title: "Cryptographic Tenant Isolation", 
      badge: "Row-Level Security",
      desc: "Enterprise database partitioning guarantees your proprietary campaigns and qualified leads are strictly inaccessible to other tenants." 
    },
    { 
      title: "High-Throughput Asynchronous Core", 
      badge: "Sub-Second Latency",
      desc: "Non-blocking event architecture delivers ultra-fast geo-radius searches and immediate response times during large-scale discovery." 
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-10 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-2 sm:gap-3.5 group cursor-pointer transition-transform active:scale-95 text-left focus:outline-none shrink-0"
            title="LeadAgent24 - Home"
          >
            <LeadAgentLogo className="w-7 h-7 sm:w-10 sm:h-10 shadow-xs group-hover:scale-105 transition-transform shrink-0" />
            <div>
              <span className="font-extrabold text-xs min-[360px]:text-sm sm:text-lg text-slate-900 tracking-tight block whitespace-nowrap group-hover:text-emerald-700 transition-colors">
                LeadAgent<span className="text-emerald-600">24</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 hidden sm:block -mt-0.5">
                Autonomous B2B Lead Engine
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onSignIn}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-10 pb-20 sm:pt-12 sm:pb-24 overflow-hidden border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* Unified Return & Breadcrumb Bar */}
          <div className="mb-8 flex items-center justify-start">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-white hover:shadow-2xs transition-all group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Platform Overview</span>
            </button>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>The Mission Behind LeadAgent24</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Pioneering 24/7 Autonomous B2B Discovery & Outbound
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Traditional B2B lead generation is broken: teams spend thousands of dollars buying stale lists, or waste hundreds of hours copying contacts into spreadsheets. LeadAgent24 is built as an autonomous, self-operating agent that scouts, qualifies, and engages high-intent prospects around the clock.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Core Pillars Grid */}
      <section className="py-16 sm:py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Core Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Engineered for Independence & Precision
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div 
                  key={idx}
                  className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Architecture & Engineering Overview */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Engineering Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Enterprise Architectural Reliability
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Every component of LeadAgent24 is built to provide verifiable data accuracy, cryptographic privacy, and round-the-clock autonomous outreach.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {engineeringStandards.map((item, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-left hover:border-emerald-300 hover:bg-white hover:shadow-2xs transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Bottom CTA Banner */}
      <section className="py-16 bg-emerald-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Deploy Your Autonomous B2B Outbound Agent?
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed">
            Create your workspace in seconds. Bring your own email keys, configure your target market, and start generating qualified leads.
          </p>
          <div className="pt-2 flex items-center justify-center">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold bg-white text-emerald-950 hover:bg-emerald-50 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>Launch Your First Campaign</span>
              <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LeadAgentLogo className="w-6 h-6 shadow-2xs" />
            <span className="font-semibold text-slate-700">LeadAgent24 Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => onNavigateLegal ? onNavigateLegal('/privacy') : null}
              className="hover:text-slate-800 hover:underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => onNavigateLegal ? onNavigateLegal('/terms') : null}
              className="hover:text-slate-800 hover:underline transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          <div>
            &copy; {new Date().getFullYear()} LeadAgent24. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
