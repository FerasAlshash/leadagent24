import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Mail, 
  X, 
  Copy, 
  Check, 
  Clock, 
  ExternalLink, 
  Building2, 
  Send, 
  CheckCircle2,
  FileText,
  Briefcase
} from 'lucide-react';

export default function SentEmailModal({ 
  isOpen, 
  onClose, 
  lead, 
  campaign 
}) {
  const [copiedSection, setCopiedSection] = useState(null); // 'subject' | 'body' | 'all' | 'email'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !lead) return null;

  const companyName = lead.Company_Name || lead.title || lead.company || 'Prospect';
  const recipientEmail = lead.Email_Address || (Array.isArray(lead.emails) && lead.emails[0]) || lead.email || null;
  const sendTime = lead.SEND_Time || lead.created_at || null;
  const campaignName = campaign?.company_name || campaign?.title || lead.campaignName || 'Active Campaign';
  const status = lead.Cold_Mail_Status || 'No Email';
  const isSent = status === '✅' || status === 'Sent' || Boolean(lead.SEND_Time);
  
  const subject = lead.email_subject || '';
  const body = lead.email_body || '';

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSection(type);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  const handleCopyFullEmail = () => {
    const fullText = `Subject: ${subject || 'Outbound Pitch'}\nTo: ${recipientEmail || ''}\n\n${body || ''}`;
    handleCopy(fullText, 'all');
  };

  // Formatted date string
  const formattedDate = sendTime ? (() => {
    try {
      const d = new Date(sendTime);
      return d.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch {
      return sendTime;
    }
  })() : 'Delivered';

  // Mailto fallback link
  const mailtoUrl = recipientEmail 
    ? `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : '#';

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl my-auto flex flex-col overflow-hidden max-h-[88vh] animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-start justify-between gap-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                  {isSent ? 'Outbound Cold Email' : 'Verified Lead Outreach'}
                </h3>
                {isSent ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-[11px] shadow-2xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Delivered</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 border border-sky-300 text-sky-900 font-bold text-[11px] shadow-2xs">
                    <CheckCircle2 className="w-3 h-3 text-sky-600" />
                    <span>Verified Contact • Ready for Dispatch</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">{companyName}</span>
                {lead.Category && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{lead.Category}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transmission Metadata Bar */}
        <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 sm:px-5 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Recipient */}
          <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0">To:</span>
              <span className="font-mono font-bold text-slate-800 truncate" title={recipientEmail || 'No email'}>
                {recipientEmail || 'No recipient email'}
              </span>
            </div>
            {recipientEmail && (
              <button
                type="button"
                onClick={() => handleCopy(recipientEmail, 'email')}
                className={`p-1 rounded-md border transition-all cursor-pointer ${
                  copiedSection === 'email'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-transparent'
                }`}
                title="Copy recipient address"
              >
                {copiedSection === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Time & Campaign */}
          <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium truncate">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
              <Briefcase className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[120px]">{campaignName}</span>
            </div>
          </div>
        </div>

        {/* Email Content Container (Scrollable) */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[58vh]">
          {/* Subject Line Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Email Subject
              </span>
              {subject && (
                <button
                  type="button"
                  onClick={() => handleCopy(subject, 'subject')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 cursor-pointer transition-colors"
                >
                  {copiedSection === 'subject' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Subject</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-3.5 text-slate-900">
              {subject ? (
                <h4 className="text-sm font-extrabold text-slate-900 leading-snug select-all">
                  {subject}
                </h4>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Subject not recorded for this historical record.
                </p>
              )}
            </div>
          </div>

          {/* Email Body Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Personalized Outbound Body
              </span>
              {body && (
                <button
                  type="button"
                  onClick={() => handleCopy(body, 'body')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 cursor-pointer transition-colors"
                >
                  {copiedSection === 'body' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Body</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {body ? (
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap select-all">
                  {body}
                </div>
              </div>
            ) : isSent ? (
              <div className="p-6 text-center rounded-xl bg-emerald-50/40 border border-dashed border-emerald-200 space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Archival Active for Upcoming Dispatches
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  This contact was reached before email content archiving was configured in your n8n workflow. For all newly launched searches and outbound pitches, the full personalized AI pitch is saved and visible here.
                </p>
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-sky-50/50 border border-dashed border-sky-200 space-y-2">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 mx-auto flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Automated AI Pitch Ready to Generate
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  This prospect has a verified email address ({recipientEmail}). Once outbound prospecting is dispatched for this workspace, the n8n AI engine will dynamically craft and save the personalized pitch here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-4.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {(subject || body) && (
              <button
                type="button"
                onClick={handleCopyFullEmail}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                {copiedSection === 'all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied Entire Pitch!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Full Pitch</span>
                  </>
                )}
              </button>
            )}

            {recipientEmail && (
              <a
                href={mailtoUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-all"
                title="Open in your default email client"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Open Mail App</span>
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
