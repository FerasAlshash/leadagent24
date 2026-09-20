import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Briefcase, Building2, Target, MessageSquare, Check, AlignLeft, ChevronDown } from 'lucide-react';
import { TONE_OPTIONS, findToneOption } from '../data/emailTones';

const businessSuggestions = [
  "Software Agencies",
  "Marketing Agencies",
  "Real Estate Brokers",
  "Financial Advisors",
  "Management Consultants",
  "Recruitment & HR",
  "Logistics & Freight",
  "E-commerce Brands"
];

export default function CampaignModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialCampaign = null 
}) {
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    sender_name: '',
    company_pitch: '',
    business_type: 'Software Agencies',
    email_style: 'Professional'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isToneOpen, setIsToneOpen] = useState(false);
  const toneDropdownRef = useRef(null);

  // Close tone dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (toneDropdownRef.current && !toneDropdownRef.current.contains(e.target)) {
        setIsToneOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsToneOpen(false);
      }
    }
    if (isToneOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isToneOpen]);

  useEffect(() => {
    if (initialCampaign) {
      setFormData({
        title: initialCampaign.title || '',
        company_name: initialCampaign.company_name || initialCampaign.title || '',
        sender_name: initialCampaign.sender_name || '',
        company_pitch: initialCampaign.company_pitch || '',
        business_type: initialCampaign.business_type || 'Software Agencies',
        email_style: initialCampaign.email_style || 'Professional'
      });
    } else {
      setFormData({
        title: '',
        company_name: '',
        sender_name: '',
        company_pitch: '',
        business_type: 'Software Agencies',
        email_style: 'Professional'
      });
    }
    setError(null);
  }, [initialCampaign, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      setError('Company / Agency Name is required.');
      return;
    }
    if (!formData.business_type.trim()) {
      setError('Target Business Niche is required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        location: initialCampaign?.location || 'Multi-region',
        lead_number: initialCampaign?.lead_number || 10,
        title: formData.title.trim() || formData.company_name.trim()
      };
      await onSave(payload, initialCampaign?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save campaign.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {initialCampaign ? 'Edit Campaign Profile' : 'Create New Outbound Campaign'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set up your company workspace identity, client niche, and outreach tone.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Business Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>1. Company Identity & Sender</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Company / Agency Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hireley Solutions"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sender Name (Sign-off)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Feras"
                  value={formData.sender_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, sender_name: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                What does your company do? (Value Pitch for Cold Email)
              </label>
              <textarea
                rows="3"
                placeholder="e.g. We provide enterprise automation that automates client outreach and increases qualified appointments."
                value={formData.company_pitch}
                onChange={(e) => setFormData(prev => ({ ...prev, company_pitch: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Section 2: Target Client Niche & Email Tone */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>2. Target Client Niche & Outreach Tone</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Business Type / Niche <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Software Agencies"
                value={formData.business_type}
                onChange={(e) => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {businessSuggestions.map(sugg => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, business_type: sugg }))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                      formData.business_type === sugg
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cold Outreach Tone & Style
              </label>

              <div className="relative" ref={toneDropdownRef}>
                {/* Trigger Button */}
                {(() => {
                  const currentTone = findToneOption(formData.email_style || 'Professional');
                  return (
                    <button
                      type="button"
                      onClick={() => setIsToneOpen(prev => !prev)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium flex items-center justify-between text-left transition-all shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 truncate min-w-0">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-900 shrink-0">
                          {currentTone.label}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0">
                          {currentTone.badge}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                          • {currentTone.subtitle}
                        </span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${isToneOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                    </button>
                  );
                })()}

                {/* Dropdown Menu - Opens Upwards (bottom-full mb-2) to stay completely inside the modal card */}
                {isToneOpen && (
                  <div className="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {TONE_OPTIONS.map(opt => {
                      const isSelected = (formData.email_style || 'Professional') === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, email_style: opt.id }));
                            setIsToneOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left flex items-start justify-between transition-colors cursor-pointer ${
                            isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                                {opt.label}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide ${
                                isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {opt.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-normal">
                              {opt.subtitle || opt.desc}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{initialCampaign ? 'Save Changes' : 'Create Campaign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
