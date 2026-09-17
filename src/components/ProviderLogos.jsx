import React from 'react';

/**
 * Official Brand SVG Icons for Outbound Email Providers
 */

export function ResendLogo({ className = "w-4 h-4", ...props }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <title>Resend</title>
      <path d="M14.679 0c4.648 0 7.413 2.765 7.413 6.434s-2.765 6.434-7.413 6.434H12.33L24 24h-8.245l-8.88-8.44c-.636-.588-.93-1.273-.93-1.86 0-.831.587-1.565 1.713-1.883l4.574-1.224c1.737-.465 2.936-1.81 2.936-3.572 0-2.153-1.761-3.4-3.939-3.4H0V0z"/>
    </svg>
  );
}

export function BrevoLogo({ className = "w-4 h-4", ...props }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <title>Brevo</title>
      <g transform="translate(3.627, 0.108)">
        <path d="M3.23431 11.8744V3.09373H8.55255C10.3489 3.09373 11.5354 4.13703 11.5354 5.72008C11.5354 7.51872 9.99052 8.88617 6.82849 9.92948C4.67228 10.6124 3.70259 11.1884 3.34272 11.8729L3.23431 11.8744ZM3.23431 20.6897V17.02C3.23431 15.4008 4.60001 13.8177 6.50476 13.2056C8.19419 12.6297 9.59452 12.0538 10.781 11.4432C12.362 12.3794 13.3317 13.9972 13.3317 15.6888C13.3317 18.5669 10.6003 20.6897 6.89926 20.6897H3.23431ZM0 23.7834H7.18685C12.6496 23.7834 16.7452 20.3655 16.7452 15.832C16.7452 13.3489 15.4879 11.119 13.2595 9.6792C14.4098 8.52735 14.9489 7.19608 14.9489 5.57685C14.9489 2.23134 12.5412 0 8.91242 0H0V23.7834Z" />
      </g>
    </svg>
  );
}

export function SendGridLogo({ className = "w-4 h-4", ...props }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <title>SendGrid</title>
      <path d="M.8 24h13.6c.88 0 1.6-.72 1.6-1.6v-4.8c0-.88-.72-1.6-1.6-1.6H9.6c-.88 0-1.6-.72-1.6-1.6V9.6C8 8.72 7.28 8 6.4 8H1.6C.72 8 0 8.72 0 9.6v13.6c0 .44.36.8.8.8zM23.2 0H9.6C8.72 0 8 .72 8 1.6v4.8C8 7.28 8.72 8 9.6 8h4.8c.88 0 1.6.72 1.6 1.6v4.8c0 .88.72 1.6 1.6 1.6h4.8c.88 0 1.6-.72 1.6-1.6V.8c0-.44-.36-.8-.8-.8Z"/>
    </svg>
  );
}

export function SmtpLogo({ className = "w-4 h-4", ...props }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
      <line x1="6" x2="6.01" y1="6" y2="6"/>
      <line x1="6" x2="6.01" y1="18" y2="18"/>
      <path d="M17 6h2"/>
      <path d="M17 18h2"/>
    </svg>
  );
}

/**
 * Returns metadata and styling tokens for a given provider
 */
export function getProviderVisual(provider) {
  const p = (provider || '').toLowerCase();
  switch (p) {
    case 'resend':
      return {
        id: 'resend',
        name: 'Resend API',
        shortName: 'Resend',
        tag: 'Modern REST',
        icon: <ResendLogo className="w-5 h-5" />,
        LogoComponent: ResendLogo,
        color: '#000000',
        bg: 'bg-black text-white',
        border: 'border-slate-800',
        badge: 'bg-slate-900 text-white border-slate-700',
        pill: 'bg-slate-100 text-slate-800 border-slate-200'
      };
    case 'brevo':
      return {
        id: 'brevo',
        name: 'Brevo API',
        shortName: 'Brevo',
        tag: 'High Quota',
        icon: <BrevoLogo className="w-5 h-5" />,
        LogoComponent: BrevoLogo,
        color: '#0B996E',
        bg: 'bg-[#0B996E] text-white',
        border: 'border-[#0B996E]',
        badge: 'bg-[#0B996E] text-white border-[#0B996E]',
        pill: 'bg-emerald-50 text-[#0B996E] border-emerald-200 font-bold'
      };
    case 'sendgrid':
      return {
        id: 'sendgrid',
        name: 'Twilio SendGrid',
        shortName: 'SendGrid',
        tag: 'Twilio Enterprise',
        icon: <SendGridLogo className="w-5 h-5" />,
        LogoComponent: SendGridLogo,
        bg: 'bg-[#008298] text-white',
        border: 'border-[#008298]',
        badge: 'bg-[#008298] text-white border-[#008298]',
        pill: 'bg-sky-50 text-[#008298] border-sky-200 font-bold'
      };
    case 'smtp':
    default:
      return {
        id: 'smtp',
        name: 'Custom SMTP Server',
        shortName: 'SMTP',
        tag: 'Universal Protocol',
        icon: <SmtpLogo className="w-5 h-5 text-white" />,
        LogoComponent: SmtpLogo,
        bg: 'bg-indigo-600 text-white',
        border: 'border-indigo-600',
        badge: 'bg-indigo-600 text-white border-indigo-600',
        pill: 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold'
      };
  }
}
