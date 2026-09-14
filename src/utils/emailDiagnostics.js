/**
 * Smart diagnostic parser for outbound email provider test failures.
 * Translates raw API & SMTP error codes into friendly, actionable solutions.
 */

export function diagnoseEmailError(errorText = '', provider = 'brevo') {
  if (!errorText) return null;
  const str = String(errorText).toLowerCase();

  // 1. Brevo: Unrecognised IP Address
  if (str.includes('unrecognised ip') || str.includes('unrecognised ip address') || str.includes('authorised_ips')) {
    // Extract IP if present
    const ipMatch = errorText.match(/([0-9a-fA-F:]{7,39}|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
    const ip = ipMatch ? ipMatch[0] : null;

    return {
      id: 'brevo_unrecognised_ip',
      severity: 'warning',
      badge: 'Brevo IP Security Restriction',
      title: 'Action Needed: Authorize Your IP Address in Brevo',
      summary: 'Brevo rejected the test because your account has "Authorized IPs" enabled and the request originated from an unrecognized IP address.',
      detectedIp: ip,
      steps: [
        'Recommended: Open your Brevo Security Settings and disable IP filtering so your API key works seamlessly from any network or server.',
        'Alternative: Add your IP address to the whitelist, or click "Authorize" in the security email Brevo just sent you.'
      ],
      actionUrl: 'https://app.brevo.com/security/authorised_ips',
      actionText: 'Manage Authorized IPs in Brevo ↗',
      guideTab: 'brevo',
      guideAnchor: 'brevo-ip-whitelist'
    };
  }

  // 2. Brevo: Key not found (using SMTP password instead of REST API key)
  if (provider === 'brevo' && (str.includes('key not found') || str.includes('unauthorised') || str.includes('invalid api key'))) {
    return {
      id: 'brevo_invalid_key',
      severity: 'error',
      badge: 'Invalid API Key',
      title: 'Brevo API Key Not Recognized',
      summary: 'Make sure you are using the REST API v3 Key (starts with "xkeysib-"), NOT the SMTP password (starts with "xsmtpsib-").',
      steps: [
        'Go to Brevo -> "SMTP & API" or "API- und MCP-Schlüssel".',
        'Generate a new API v3 key (starting with xkeysib-).',
        'Paste the REST API key in the field above.'
      ],
      actionUrl: 'https://app.brevo.com/settings/keys/api',
      actionText: 'Generate Brevo API Key ↗',
      guideTab: 'brevo',
      guideAnchor: 'brevo-api-key'
    };
  }

  // 3. Brevo: Unverified or unauthorized sender email
  if (provider === 'brevo' && (str.includes('sender') && (str.includes('not verified') || str.includes('not found') || str.includes('invalid')))) {
    return {
      id: 'brevo_unverified_sender',
      severity: 'warning',
      badge: 'Unverified Sender Email',
      title: 'Sender Email Is Not Verified in Brevo',
      summary: 'Brevo only allows dispatching cold emails from an email address or domain that you have explicitly verified.',
      steps: [
        'Open Brevo -> Senders & IP -> Senders.',
        'Add your email address and click the verification link sent to your inbox.'
      ],
      actionUrl: 'https://app.brevo.com/senders',
      actionText: 'Verify Sender in Brevo ↗',
      guideTab: 'brevo',
      guideAnchor: 'brevo-sender-verification'
    };
  }

  // 4. SendGrid: Sender identity not verified
  if (provider === 'sendgrid' && (str.includes('from address does not match a verified sender') || str.includes('sender identity'))) {
    return {
      id: 'sendgrid_unverified_sender',
      severity: 'warning',
      badge: 'Sender Authentication Missing',
      title: 'Sender Email Not Verified in SendGrid',
      summary: 'SendGrid requires Single Sender Verification or Domain Authentication before allowing email delivery.',
      steps: [
        'Navigate to SendGrid Settings -> Sender Authentication.',
        'Click "Verify a Single Sender" and confirm the email sent by SendGrid.'
      ],
      actionUrl: 'https://app.sendgrid.com/settings/sender_auth',
      actionText: 'Verify SendGrid Sender ↗',
      guideTab: 'sendgrid',
      guideAnchor: 'sendgrid-sender'
    };
  }

  // 5. SendGrid: Invalid API key or missing permissions
  if (provider === 'sendgrid' && (str.includes('authorization required') || str.includes('forbidden') || str.includes('401') || str.includes('403'))) {
    return {
      id: 'sendgrid_key_permissions',
      severity: 'error',
      badge: 'SendGrid Authorization Failed',
      title: 'SendGrid API Key Missing Permissions',
      summary: 'Ensure your SendGrid API key has "Full Access" or at minimum "Restricted Access -> Mail Send" permissions.',
      steps: [
        'Open SendGrid -> Settings -> API Keys.',
        'Create a new API Key with "Full Access" permissions.'
      ],
      actionUrl: 'https://app.sendgrid.com/settings/api_keys',
      actionText: 'Manage SendGrid Keys ↗',
      guideTab: 'sendgrid',
      guideAnchor: 'sendgrid-api-key'
    };
  }

  // 6. Resend: Domain not verified or testing limitation
  if (provider === 'resend' && (str.includes('domain is not verified') || str.includes('validation_error'))) {
    return {
      id: 'resend_unverified_domain',
      severity: 'warning',
      badge: 'Resend Domain Verification',
      title: 'Resend Domain Verification Required',
      summary: 'To send emails to arbitrary recipients, your custom domain must be verified with DNS records (DKIM/SPF) in Resend.',
      steps: [
        'Go to Resend -> Domains -> Add Domain.',
        'Add the recommended DNS records to your domain registrar (Cloudflare, Namecheap, GoDaddy).',
        'Wait 2-5 minutes for DNS propagation.'
      ],
      actionUrl: 'https://resend.com/domains',
      actionText: 'Manage Resend Domains ↗',
      guideTab: 'resend',
      guideAnchor: 'resend-domains'
    };
  }

  // 7. Custom SMTP: Gmail / Google Workspace App Password required
  if (str.includes('username and password not accepted') || str.includes('535-5.7.8') || str.includes('535 5.7.8') || (str.includes('smtp') && str.includes('gmail.com'))) {
    return {
      id: 'gmail_app_password',
      severity: 'warning',
      badge: 'Google App Password Required',
      title: 'Gmail / Google Workspace Requires App Password',
      summary: 'Google does not allow using your regular account password with third-party SMTP. You must generate a 16-character App Password.',
      steps: [
        'Enable 2-Step Verification on your Google Account.',
        'Go to Google Account Security -> 2-Step Verification -> App Passwords.',
        'Generate an App Password (name it "Lead Machine SaaS").',
        'Paste the 16-letter App Password into the SMTP Password field.'
      ],
      actionUrl: 'https://myaccount.google.com/apppasswords',
      actionText: 'Generate Google App Password ↗',
      guideTab: 'smtp',
      guideAnchor: 'smtp-gmail'
    };
  }

  // 8. Custom SMTP: Connection refused / Timeout
  if (str.includes('connection refused') || str.includes('timed out') || str.includes('timeout') || str.includes('getaddrinfo failed')) {
    return {
      id: 'smtp_connection_failed',
      severity: 'error',
      badge: 'SMTP Connection Failed',
      title: 'Could Not Connect to SMTP Server',
      summary: 'The connection to the host server timed out or was blocked by a network firewall.',
      steps: [
        'Verify that your SMTP host is correct (e.g. smtp.gmail.com, mail.yourdomain.com).',
        'Verify that the port is standard (587 with STARTTLS or 465 with SSL).',
        'Check if your hosting provider restricts outbound SMTP traffic.'
      ],
      guideTab: 'smtp',
      guideAnchor: 'smtp-general'
    };
  }

  return null;
}
