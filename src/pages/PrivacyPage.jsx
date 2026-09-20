import React, { useEffect } from 'react';
import { ShieldCheck, Lock, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import LeadAgentLogo from '../components/LeadAgentLogo';

export default function PrivacyPage({ onBackToHome, onSignIn, onGetStarted, onNavigateTerms }) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

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
                Privacy & Data Protection
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

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 sm:py-12 w-full">
        {/* Unified Return & Breadcrumb Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:border-emerald-300 hover:shadow-2xs transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Platform Overview</span>
          </button>

          {/* Quick Switch between Legal Documents */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl text-xs border border-slate-200/60">
            <span className="px-3 py-1 rounded-lg bg-white text-emerald-800 font-bold shadow-2xs">
              Privacy Policy
            </span>
            <button
              type="button"
              onClick={onNavigateTerms}
              className="px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xs space-y-8">
          {/* Document Header */}
          <div className="border-b border-slate-100 pb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Policy Document</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400">
              Last Updated: September 17, 2026 • Version 2.4
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Introduction & Scope</h2>
              <p>
                LeadAgent24 ("we", "us", or "our") operates an autonomous B2B lead discovery and outbound prospecting platform. This Privacy Policy governs how we collect, process, isolate, and secure data across our multi-tenant SaaS infrastructure. We are committed to transparency, GDPR principles, and robust cryptographic isolation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li><strong>Account Data:</strong> Work email address, authentication credentials (securely hashed via Supabase Auth), and company identity parameters.</li>
                <li><strong>BYOK Email Provider Keys:</strong> Third-party API credentials (Resend, Brevo, SendGrid, or private SMTP settings). These are encrypted at rest using industry-standard cryptography and are never accessible to other tenants or third parties.</li>
                <li><strong>Operational Telemetry:</strong> Anonymized scrape run logs, outbound dispatch timestamps, delivery status outcomes, and system error events for troubleshooting.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. B2B Public Business Data Processing</h2>
              <p>
                LeadAgent24 extracts publicly listed commercial business data via Google Places APIs and crawlers. This includes publicly visible trade names, registered business addresses, direct commercial phone numbers, verified corporate domain emails, and official social handles (LinkedIn, Facebook, Instagram).
              </p>
              <p className="text-xs text-slate-500 italic">
                We strictly avoid harvesting sensitive personal data (such as national ID numbers, private health data, financial records, or private residential information).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Multi-Tenant Isolation & Row-Level Security (RLS)</h2>
              <p>
                Every user workspace is strictly isolated at the database layer using PostgreSQL Row-Level Security (RLS). Your campaigns, extracted business prospects, notes, and outbound logs are cryptographically bounded to your authenticated user identity. No tenant can view, query, or mutate another tenant's data under any circumstances.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Bring Your Own Key (BYOK) Model</h2>
              <p>
                Unlike traditional platforms that route all emails through shared, pooled IP addresses, LeadAgent24 connects directly to your own verified email provider (Resend, Brevo, SendGrid, or SMTP). We act solely as the orchestration processor; all email transmissions occur through your authenticated sender domain and account.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">6. GDPR Compliance & Right to Erasure</h2>
              <p>
                We honor all GDPR rights, including the Right of Access, Rectification, and Erasure ("Right to be Forgotten"). Any business contact or prospect who requests removal from your outreach records can be purged immediately from your workspace or via contact with our data protection team.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">7. Cookies & Local Storage Technologies</h2>
              <p>
                LeadAgent24 utilizes minimal, strictly necessary browser storage mechanisms (Cookies and HTML5 Local Storage) solely to ensure platform security, maintain your authenticated session, and deliver our core SaaS services.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  <strong>Essential Authentication (JWT):</strong> Secure tokens managed via Supabase Auth stored in client memory or local storage to verify your identity on API requests and protect against unauthorized access.
                </li>
                <li>
                  <strong>Security & CSRF Protection:</strong> Cryptographic validation tokens designed to prevent cross-site request forgery and safeguard your private workspace.
                </li>
                <li>
                  <strong>UI State & Preferences:</strong> Non-sensitive client-side key-value pairs (such as sidebar visibility or active view filters) to provide a fluid, seamless user experience.
                </li>
                <li>
                  <strong>Zero Commercial Ad Tracking:</strong> We do <em>not</em> drop third-party advertising cookies, behavioral retargeting pixels (such as Meta Pixel, TikTok, or Google Ads), or data-broker trackers. We never sell, rent, or monetize your browsing behavior.
                </li>
              </ul>
              <p className="text-xs text-slate-500">
                You may disable or clear cookies and local storage via your browser settings at any time; however, clearing essential authentication tokens will terminate your active session and require re-signing in.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">8. Data Retention & Export</h2>
              <p>
                Your qualified leads and audit records remain accessible within your private workspace as long as your account is active. You may export your entire prospect data and telemetry at any time via CSV format. Upon account deletion, all associated private campaign records and encrypted provider keys are permanently erased.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">9. Contact Us & Compliance Inquiries</h2>
              <p>
                If you have questions, data protection inquiries, or privacy compliance requests regarding LeadAgent24, please reach out to our team at:
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
                privacy@leadagent24.com
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LeadAgentLogo className="w-6 h-6 shadow-2xs" />
            <span className="font-semibold text-slate-700">LeadAgent24 Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="text-emerald-700 font-bold">Privacy Policy</span>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={onNavigateTerms}
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
