import React from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  Briefcase, 
  Compass, 
  Activity, 
  ShieldCheck, 
  Sliders, 
  FileSpreadsheet, 
  Layers, 
  Lock, 
  UserCheck,
  Server,
  Zap,
  Phone,
  Share2,
  Key
} from 'lucide-react';
import LeadAgentLogo from '../components/LeadAgentLogo';
import { ResendLogo, BrevoLogo, SendGridLogo, SmtpLogo } from '../components/ProviderLogos';

export default function LandingPage({ onGetStarted, onSignIn, onNavigate }) {
  const features = [
    {
      icon: Building2,
      title: "Google Places Discovery Engine",
      description: "Extract verified local and regional business listings in real-time with direct phone lines, physical addresses, and official websites."
    },
    {
      icon: Mail,
      title: "Multi-Channel Contact Intelligence",
      description: "AI-driven analysis discovers corporate email addresses, executive social channels (LinkedIn, Instagram, Facebook), and filters generic inboxes."
    },
    {
      icon: Sliders,
      title: "Adaptive AI Email Synthesis",
      description: "Dynamically generate industry-tailored cold pitch sequences matching your company's value proposition with 7+ distinct tone styles."
    },
    {
      icon: FileSpreadsheet,
      title: "Immutable Telemetry & Audit Logs",
      description: "Comprehensive event log tracking all extraction runs, delivery outcomes, and campaign actions with one-click qualification CSV export."
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Target Any Niche & Global Region",
      description: "Specify your exact target business sector (e.g., Software, E-Commerce, Logistics, Real Estate) and any target global city or region."
    },
    {
      step: "02",
      title: "Deep AI Contact Qualification",
      description: "Autonomous crawlers scout Google Places, extracting verified direct phone numbers, websites, corporate emails, and executive social profiles."
    },
    {
      step: "03",
      title: "Adaptive Pitch & Tone Synthesis",
      description: "Customize your core value proposition and select your outreach tone (Professional, Direct, Consultative, or Friendly) for AI personalization."
    },
    {
      step: "04",
      title: "Autonomous Multi-Provider Dispatch",
      description: "Sequences dispatch automatically through your verified outbound email provider with instant delivery confirmation and audit tracking."
    }
  ];

  const providers = [
    {
      name: "Resend",
      type: "Modern Developer API",
      logo: <ResendLogo className="w-7 h-7" />,
      tag: "API Key",
      desc: "Instant domain verification, high delivery velocity, and real-time open tracking."
    },
    {
      name: "Brevo",
      type: "Enterprise Transactional",
      logo: <BrevoLogo className="w-7 h-7" />,
      tag: "v3 API",
      desc: "Robust European infrastructure, anti-spam reputation scoring, and dedicated sender IPs."
    },
    {
      name: "SendGrid",
      type: "High-Volume Cloud Mail",
      logo: <SendGridLogo className="w-7 h-7" />,
      tag: "v3 Web API",
      desc: "Twilio-backed enterprise deliverability, global inbox routing, and bounce filtering."
    },
    {
      name: "Custom SMTP",
      type: "Private Mail Server",
      logo: <SmtpLogo className="w-7 h-7" />,
      tag: "TLS / SSL",
      desc: "Connect your own private mail server, Google Workspace, or Amazon SES with zero vendor lock-in."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-10 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <LeadAgentLogo className="w-7 h-7 sm:w-10 sm:h-10 shadow-sm shrink-0" />
            <div>
              <span className="font-extrabold text-xs min-[360px]:text-sm sm:text-lg text-slate-900 tracking-tight block whitespace-nowrap">
                LeadAgent<span className="text-emerald-600">24</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 hidden sm:block -mt-0.5">
                Autonomous B2B Lead Engine
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-700 transition-colors">Platform Capabilities</a>
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">How It Works</a>
            <a href="#security" className="hover:text-emerald-700 transition-colors">SaaS Security</a>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('/about') : null}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              About Us
            </button>
          </nav>

          {/* Auth Action Buttons (Zero Wrapping on Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onSignIn}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-24 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-10 text-center">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-semibold mb-6 shadow-2xs max-w-full">
            <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">24/7 Autonomous B2B Prospecting & Outbound Engine</span>
            <span className="sm:hidden">24/7 Autonomous Outbound Engine</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Automate B2B Discovery & Precision Cold Outreach
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-6 text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Extract targeted, verified business listings directly from Google Places, enrich decision-maker contact points with AI, and dispatch personalized cold email sequences through your own trusted email infrastructure.
          </p>

          {/* Hero CTAs */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-sm sm:max-w-none mx-auto">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Start Free with LeadAgent24</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer whitespace-nowrap"
            >
              Access Your Workspace
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Google Places Crawling</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Bring Your Own Key (BYOK) Freedom</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>PostgreSQL Row-Level Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Platform Capabilities Grid */}
      <section id="features" className="py-12 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
              End-to-End Pipeline
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">
              Engineered for High-Converting Outbound Operations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 sm:mt-2">
              Everything your revenue team needs to scout prospects, verify contacts, synthesize pitches, and monitor delivery velocity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div 
                  key={idx}
                  className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#f8fafc] border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-3 sm:mb-4 shadow-2xs">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1 sm:mb-1.5">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. How It Works (The 4-Stage Operational Engine) */}
      <section id="how-it-works" className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
              Autonomous Workflow
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">
              The 4-Stage Autonomous Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 sm:mt-2">
              LeadAgent24 transforms raw search intent into delivered, personalized outbound conversations with zero manual copying.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {workflowSteps.map((ws) => (
              <div 
                key={ws.step}
                className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 flex flex-col justify-between shadow-2xs hover:border-emerald-300 transition-all"
              >
                <div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs sm:text-sm flex items-center justify-center mb-3 sm:mb-5">
                    {ws.step}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1 sm:mb-2">
                    {ws.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {ws.description}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center text-[11px] sm:text-xs font-semibold text-emerald-700">
                  <span>Stage {ws.step} of 04</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Supported Outbound Providers (BYOK Freedom) */}
      <section id="providers" className="py-12 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
              Zero Vendor Lock-In
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">
              Connect Your Preferred Outbound Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 sm:mt-2">
              Bring Your Own Key (BYOK). Connect your authenticated business sender domains via direct API keys or custom SMTP with in-app DNS assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {providers.map((p, idx) => (
              <div 
                key={idx}
                className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#f8fafc] border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                      {p.logo}
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                      {p.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">{p.name}</h3>
                  <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold block mb-1.5 sm:mb-2">{p.type}</span>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SaaS Security & Isolation Section (Dedicated to technical trust) */}
      <section id="security" className="py-12 sm:py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <div className="p-5 sm:p-12 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-3.5 sm:space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Enterprise Security & Cryptographic Isolation</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Your Data & API Keys are Private, Encrypted, and Isolated
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                LeadAgent24 implements strict PostgreSQL Row-Level Security (RLS) on Supabase. Your campaigns, extracted business records, and provider API keys are cryptographically partitioned to your authenticated tenant ID. No shared pools, zero cross-tenant visibility.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AES-Encrypted API Key Vault</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PostgreSQL Row-Level Security (RLS)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full Chronological Telemetry Audit Trail</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SPF / DKIM / DMARC Deliverability Checklists</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer text-center"
              >
                Create Isolated Workspace
              </button>
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('/about') : null}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer text-center"
              >
                Read About Our Architecture
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-auto py-10 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <LeadAgentLogo className="w-7 h-7 shadow-2xs" />
            <div>
              <span className="font-extrabold text-sm text-slate-900 block leading-tight">
                LeadAgent<span className="text-emerald-600">24</span>
              </span>
              <span className="text-[10px] text-slate-400">Autonomous B2B Lead Engine</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('/about') : null}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('/privacy') : null}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('/terms') : null}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          <div className="text-slate-400 text-center md:text-right">
            &copy; {new Date().getFullYear()} LeadAgent24. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
