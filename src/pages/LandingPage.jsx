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
  Sparkles, 
  ShieldCheck, 
  Sliders, 
  FileSpreadsheet, 
  Layers, 
  Lock, 
  UserCheck 
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onSignIn }) {
  const features = [
    {
      icon: Building2,
      title: "Global Business Discovery Engine",
      description: "Extract verified local and regional business listings at scale with phone numbers, addresses, and official websites."
    },
    {
      icon: Mail,
      title: "AI Contact Enrichment & Scoring",
      description: "AI-driven analysis selects the optimal corporate email address and social profiles, filtering out generic inboxes."
    },
    {
      icon: Database,
      title: "Enterprise Multi-Tenant Architecture",
      description: "Persistent private database for every user. Leads, campaigns, and delivery statuses are securely isolated."
    },
    {
      icon: Sliders,
      title: "Adaptive Cold Outreach",
      description: "Generate customized value propositions and personalized signatures aligned with your company's core pitch."
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Define Target Niche & Region",
      description: "Input any B2B category (e.g. Software, Agencies, Logistics, Real Estate) and any target global city."
    },
    {
      step: "02",
      title: "Customize Your Pitch & Tone",
      description: "Provide your company's unique value proposition and select your outreach style (Professional, Friendly, or Concise)."
    },
    {
      step: "03",
      title: "Automate Extraction & Delivery",
      description: "Autonomous agents discover verified businesses, AI enriches executive contact points, and personalized sequences dispatch automatically."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              LM
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block">
                Lead Machine
              </span>
              <span className="text-[11px] font-medium text-slate-500 block -mt-0.5">
                B2B Outbound Platform
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-700 transition-colors">Platform Capabilities</a>
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">How It Works</a>
            <a href="#security" className="hover:text-emerald-700 transition-colors">SaaS Security</a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSignIn}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-all shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Multi-Tenant Enterprise Lead Automation</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Automate B2B Discovery & Precision Cold Outreach
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Extract targeted verified business listings globally, enrich decision-maker contact points with advanced AI, and dispatch personalized cold email sequences at scale.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              Access Your Workspace
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Isolated Supabase Database</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Realtime Delivery Status</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Hardcoded Credentials</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Platform Capabilities Grid */}
      <section id="features" className="py-16 sm:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              End-to-End Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Engineered for Scalable Commercial Lead Generation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Everything your team needs to launch, filter, and track outbound outreach campaigns with zero manual friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200 hover:border-emerald-300 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-4 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. How It Works (Custom Multi-Tenant Campaigns) */}
      <section id="how-it-works" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              User-Driven Outbound
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Create Your Own Custom Campaigns
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Every business has its own unique target niche, geographical focus, and value pitch. Build and launch campaigns tailored to your specific market in 3 simple steps:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workflowSteps.map((ws) => (
              <div 
                key={ws.step}
                className="section-card p-7 sm:p-8 bg-white border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-sm flex items-center justify-center mb-5">
                    {ws.step}
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-2">
                    {ws.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {ws.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-700">
                  <span>Step {ws.step} of 03</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SaaS Security Banner */}
      <section id="security" className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Enterprise Multi-Tenant Security & Isolation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every campaign, extracted place record, and outreach status is protected by PostgreSQL Row Level Security (RLS).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGetStarted}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shrink-0"
          >
            Create Your Account
          </button>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto py-8 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
              LM
            </div>
            <span className="font-semibold text-slate-700">Lead Machine B2B Platform</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Lead Machine. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
