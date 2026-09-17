import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  User, 
  RotateCcw, 
  Briefcase, 
  Mail, 
  FileText, 
  Check, 
  Send,
  Compass,
  CheckCircle2,
  Globe,
  Link2,
  Unlink
} from 'lucide-react';

const businessPills = [
  { label: "Software Agencies", type: "tech" },
  { label: "Marketing Agencies", type: "marketing" },
  { label: "Recruitment & Staffing", type: "hr" },
  { label: "Real Estate Brokers", type: "realestate" },
  { label: "Management Consulting", type: "consulting" },
  { label: "Financial Services", type: "finance" },
  { label: "Tour & Travel Operators", type: "travel" },
  { label: "Logistics & Supply Chain", type: "logistics" }
];

const locationPills = [
  "London, UK", 
  "New York, NY", 
  "Dubai, UAE", 
  "Austin, TX", 
  "Berlin, Germany", 
  "Paris, France",
  "Toronto, Canada",
  "Singapore"
];

const companyTemplates = [
  {
    label: "B2B SaaS / Operational Automation",
    text: "We provide an enterprise platform that automates core workflows, saving growing commercial teams 20+ hours per week and reducing operational costs."
  },
  {
    label: "Growth & Client Acquisition Consulting",
    text: "We partner with high-growth service businesses to build predictable, multi-channel outbound client acquisition pipelines with guaranteed ROI."
  },
  {
    label: "Enterprise IT & Cloud Solutions",
    text: "We deliver modern infrastructure and high-velocity development for forward-thinking organizations requiring scalable digital architectures."
  }
];

export default function LeadForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  isLoading,
  webhookUrl,
  selectedCampaign = null,
  allCampaigns = [],
  onSelectCampaign = () => {},
  onClearCampaign = () => {}
}) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData['Business Type']?.trim()) {
      errs['Business Type'] = "Business Type is required";
    }
    if (!formData['Location']?.trim()) {
      errs['Location'] = "Target Location is required";
    }
    if (!formData['Lead Number'] || formData['Lead Number'] < 1) {
      errs['Lead Number'] = "Lead count must be at least 1";
    }
    if (!formData['Your Name']?.trim()) {
      errs['Your Name'] = "Your Name is required for email signatures";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        campaign_id: selectedCampaign?.id || null
      });
    }
  };

  const emailStyles = [
    {
      id: "Professional",
      title: "Professional",
      desc: "Structured, formal corporate framing focusing on ROI, capability, and enterprise credibility.",
      icon: Briefcase
    },
    {
      id: "Friendly",
      title: "Friendly",
      desc: "Warm, collaborative, relationship-first tone ideal for partnerships and travel providers.",
      icon: Mail
    },
    {
      id: "Simple",
      title: "Concise",
      desc: "Direct 3-sentence message cutting straight to the core proposition and call to action.",
      icon: FileText
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6" id="lead-campaign-form">
      {/* CAMPAIGN SCOPE HEADER */}
      {selectedCampaign ? (
        <div className="p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Active Campaign Scope
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold">
                  <Link2 className="w-3 h-3" />
                  {selectedCampaign.company_name || selectedCampaign.title}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Leads scraped from this search will be strictly isolated and tagged to <strong>{selectedCampaign.company_name || selectedCampaign.title}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {allCampaigns.length > 1 && (
              <select
                value={selectedCampaign.id}
                onChange={(e) => {
                  const target = allCampaigns.find(c => c.id === e.target.value);
                  if (target) onSelectCampaign(target);
                }}
                className="text-xs py-2 px-3 rounded-xl border border-emerald-300 bg-white text-slate-700 font-semibold focus:outline-hidden"
              >
                {allCampaigns.map(c => (
                  <option key={c.id} value={c.id}>
                    Switch: {c.company_name || c.title}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={onClearCampaign}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
              title="Detach and run an independent ad-hoc search"
            >
              <Unlink className="w-3.5 h-3.5 text-slate-400" />
              <span>Unlink</span>
            </button>
          </div>
        </div>
      ) : (
        allCampaigns.length > 0 && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600 font-medium">
                Want to attach this search to one of your saved campaigns?
              </span>
            </div>
            <select
              defaultValue=""
              onChange={(e) => {
                const target = allCampaigns.find(c => c.id === e.target.value);
                if (target) onSelectCampaign(target);
              }}
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-hidden"
            >
              <option value="" disabled>Select a Campaign...</option>
              {allCampaigns.map(c => (
                <option key={c.id} value={c.id}>{c.company_name || c.title}</option>
              ))}
            </select>
          </div>
        )
      )}

      {/* SECTION 1: SEARCH & SCRAPING CRITERIA */}
      <div className="section-card p-6 sm:p-8 bg-white border border-slate-200">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Target Market & Prospecting Parameters</h2>
              <p className="text-xs text-slate-500">Specify search criteria for autonomous business discovery</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
            Step 1 of 3
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Type */}
          <div>
            <label htmlFor="business-type-input" className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Target Business Niche <span className="text-rose-500">*</span></span>
              <span className="text-[11px] text-slate-500 font-normal">e.g. Recruitment Agency, Software Agency</span>
            </label>
            <input
              id="business-type-input"
              type="text"
              required
              value={formData["Business Type"] || ""}
              onChange={(e) => setFormData({ ...formData, "Business Type": e.target.value })}
              placeholder="e.g. Recruitment Agency, Tour Operator, Staffing Agency..."
              className={`w-full form-input px-3.5 py-2.5 text-sm ${
                errors["Business Type"] ? "border-rose-400 focus:border-rose-500" : ""
              }`}
            />
            {errors["Business Type"] && (
              <p className="mt-1.5 text-xs text-rose-500">{errors["Business Type"]}</p>
            )}

            {/* Quick Pills */}
            <div className="mt-3">
              <span className="text-[11px] text-slate-500 font-medium block mb-1.5">Recommended Categories:</span>
              <div className="flex flex-wrap gap-1.5">
                {businessPills.map((pill) => {
                  const isActive = formData["Business Type"] === pill.label;
                  return (
                    <button
                      key={pill.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, "Business Type": pill.label })}
                      className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                        isActive
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                          : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location-input" className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Target Geographic Location <span className="text-rose-500">*</span></span>
              <span className="text-[11px] text-slate-500 font-normal">City & Country</span>
            </label>
            <input
              id="location-input"
              type="text"
              required
              value={formData["Location"] || ""}
              onChange={(e) => setFormData({ ...formData, "Location": e.target.value })}
              placeholder="e.g. London, UK or New York, NY..."
              className={`w-full form-input px-3.5 py-2.5 text-sm ${
                errors["Location"] ? "border-rose-400 focus:border-rose-500" : ""
              }`}
            />
            {errors["Location"] && (
              <p className="mt-1.5 text-xs text-rose-500">{errors["Location"]}</p>
            )}

            {/* Quick Pills */}
            <div className="mt-3">
              <span className="text-[11px] text-slate-500 font-medium block mb-1.5">Quick Location Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {locationPills.map((pill) => {
                  const isActive = formData["Location"] === pill;
                  return (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setFormData({ ...formData, "Location": pill })}
                      className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                        isActive
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                          : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      {pill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Lead Count Selector */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label htmlFor="lead-number-input" className="text-xs font-bold text-slate-900 block">
                Target Lead Volume
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Maximum number of verified business records to extract, qualify, and queue
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[5, 10, 25, 50, 100].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({ ...formData, "Lead Number": num })}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    formData["Lead Number"] === num
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                      : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {num}
                </button>
              ))}

              <div className="w-20 ml-2">
                <input
                  id="lead-number-input"
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={formData["Lead Number"] || 10}
                  onChange={(e) => setFormData({ ...formData, "Lead Number": parseInt(e.target.value) || 1 })}
                  className="w-full form-input px-2.5 py-1.5 text-xs font-bold text-center text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: EMAIL MESSAGE TONE */}
      <div className="section-card p-6 sm:p-8 bg-white border border-slate-200">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Outreach Communication Tone</h2>
              <p className="text-xs text-slate-500">Directs the cold email generator on framing, structure, and tone</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
            Step 2 of 3
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emailStyles.map((style) => {
            const Icon = style.icon;
            const isSelected = formData["Email Style"] === style.id || (style.id === "Simple" && formData["Email Style"] === "Concise");
            return (
              <div
                key={style.id}
                onClick={() => setFormData({ ...formData, "Email Style": style.id })}
                className={`cursor-pointer rounded-xl p-5 border transition-all relative ${
                  isSelected
                    ? "bg-emerald-50/60 border-emerald-600 ring-1 ring-emerald-600"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>

                <div className="font-bold text-sm text-slate-900 mb-1">
                  {style.title} Style
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {style.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: SENDER IDENTITY & VALUE PROPOSITION */}
      <div className="section-card p-6 sm:p-8 bg-white border border-slate-200">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Sender Profile & Value Proposition</h2>
                {selectedCampaign && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Synced from Campaign
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Used to generate authentic signatures and customized value propositions</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
            Step 3 of 3
          </span>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Your Name */}
            <div>
              <label htmlFor="sender-name-input" className="text-xs font-semibold text-slate-700 block mb-2">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="sender-name-input"
                type="text"
                required
                value={formData["Your Name"] || ""}
                onChange={(e) => setFormData({ ...formData, "Your Name": e.target.value })}
                placeholder="e.g. Alex Chino"
                className={`w-full form-input px-3.5 py-2.5 text-sm ${
                  errors["Your Name"] ? "border-rose-400" : ""
                }`}
              />
              {errors["Your Name"] && (
                <p className="mt-1 text-xs text-rose-500">{errors["Your Name"]}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="company-name-input" className="text-xs font-semibold text-slate-700 block mb-2">
                Your Company / Platform Name
              </label>
              <input
                id="company-name-input"
                type="text"
                value={formData["Your Company/Agency Name"] || ""}
                onChange={(e) => setFormData({ ...formData, "Your Company/Agency Name": e.target.value })}
                placeholder="e.g. Acme Corporation or NextGen Solutions"
                className="w-full form-input px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* What does your company do? */}
          <div>
            <label htmlFor="company-pitch-input" className="text-xs font-semibold text-slate-700 block mb-2">
              What does your company / platform do? (Core Value Proposition)
            </label>
            <textarea
              id="company-pitch-input"
              rows="3"
              value={formData["What does your company do?"] || ""}
              onChange={(e) => setFormData({ ...formData, "What does your company do?": e.target.value })}
              placeholder="Explain your unique capability, standard, or offer..."
              className="w-full form-input px-3.5 py-2.5 text-sm leading-relaxed"
            />

            {/* Template Suggestions */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Quick Suggestions:</span>
              {companyTemplates.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, "What does your company do?": template.text })}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DISPATCH ACTION BAR */}
      <div className="section-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Target Webhook:</span>
            <span className="font-mono text-slate-500 truncate max-w-xs">{webhookUrl}</span>
          </div>
          <div className="mt-1">
            {selectedCampaign ? (
              <p className="text-xs text-slate-500">
                Scoped launch: Results will be linked to <strong>{selectedCampaign.company_name || selectedCampaign.title}</strong>.
              </p>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Data will be transmitted directly to initiate automated discovery and outreach.</span>
              </div>
            )}
          </div>
        </div>

        <button
          id="launch-campaign-submit-btn"
          type="submit"
          disabled={isLoading}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
            isLoading
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Discovering & Dispatching...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Launch Outbound Campaign</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
