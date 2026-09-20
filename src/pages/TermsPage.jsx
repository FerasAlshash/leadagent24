import React, { useEffect } from 'react';
import { FileText, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import LeadAgentLogo from '../components/LeadAgentLogo';

export default function TermsPage({ onBackToHome, onSignIn, onGetStarted, onNavigatePrivacy }) {
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
                Terms of Service
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
            <button
              type="button"
              onClick={onNavigatePrivacy}
              className="px-3 py-1 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="px-3 py-1 rounded-lg bg-white text-emerald-800 font-bold shadow-2xs">
              Terms of Service
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xs space-y-8">
          {/* Document Header */}
          <div className="border-b border-slate-100 pb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>User Agreement & Terms</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-400">
              Last Updated: September 17, 2026 • Version 2.4
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By accessing, registering for, or using LeadAgent24 (the "Platform" or "Service"), you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or legal entity, you represent that you possess the authority to bind such entity.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Service Description & Scope</h2>
              <p>
                LeadAgent24 is an autonomous B2B lead generation, contact enrichment, and outbound outreach platform. The Service enables subscribers to discover publicly accessible business entities, synthesize commercial pitch messages using AI, and dispatch outbound communications through third-party email providers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Responsible Commercial B2B Outreach & Compliance</h2>
              <p>
                Users agree to use LeadAgent24 exclusively for legitimate, high-relevance B2B (business-to-business) communications. You agree that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>You will comply with all relevant international anti-spam regulations (including the US CAN-SPAM Act, European GDPR / ePrivacy Directive, and UK PECR).</li>
                <li>You will provide clear, truthful sender identification and physical business addresses in outbound communications.</li>
                <li>You will promptly honor all opt-out or unsubscribe requests made by any contact.</li>
                <li>You will not use the Service to send unsolicited consumer (B2C) mass spam, deceptive phishing schemes, or illegal material.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Bring Your Own Key (BYOK) Responsibility</h2>
              <p>
                LeadAgent24 allows users to connect their own email service provider credentials (including Resend, Brevo, SendGrid, and custom SMTP servers). You are solely responsible for maintaining valid accounts with these providers, honoring their individual acceptable use policies, and ensuring your sender domains maintain verified DNS records (SPF, DKIM, DMARC).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Multi-Tenant Account Security</h2>
              <p>
                You are responsible for safeguarding your login credentials and ensuring all users under your organization maintain strong passwords. You agree to notify us immediately of any unauthorized access or breach of security.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">6. Intellectual Property</h2>
              <p>
                All proprietary software, algorithms, user interfaces, branding, and code comprising LeadAgent24 are the exclusive intellectual property of LeadAgent24. All prospect lists, campaign strategies, and data generated within your private tenant workspace remain your property.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">7. Limitation of Liability</h2>
              <p>
                LeadAgent24 is provided on an "as is" and "as available" basis. To the maximum extent permitted by applicable law, in no event shall LeadAgent24 be liable for indirect, incidental, punitive, or consequential damages resulting from lost profits, email deliverability fluctuations, or third-party provider API outages.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">8. Contact Information</h2>
              <p>
                For questions regarding these Terms of Service or commercial licensing inquiries, please contact:
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
                legal@leadagent24.com
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
            <button
              type="button"
              onClick={onNavigatePrivacy}
              className="hover:text-slate-800 hover:underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">Terms of Service</span>
          </div>

          <div>
            &copy; {new Date().getFullYear()} LeadAgent24. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
