import httpx
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional

class EmailDispatchError(Exception):
    """Custom exception containing provider error details."""
    def __init__(self, message: str, provider: str, status_code: Optional[int] = None, raw_response: Optional[str] = None):
        super().__init__(message)
        self.message = message
        self.provider = provider
        self.status_code = status_code
        self.raw_response = raw_response

async def verify_brevo_sender_authorization(client: httpx.AsyncClient, headers: Dict[str, str], sender_email: str):
    """
    Strictly verifies that sender_email matches the Brevo account email,
    an active verified sender, or an authenticated domain.
    Prevents silent spoofing, DMARC rejection, and account suspension.
    """
    clean_sender = sender_email.lower().strip()
    
    # 1. Fetch senders from Brevo
    senders_res = await client.get("https://api.brevo.com/v3/senders", headers=headers)
    if senders_res.status_code != 200:
        err_msg = "Invalid Brevo API Key"
        try:
            err_msg = senders_res.json().get("message") or err_msg
        except Exception:
            pass
        raise EmailDispatchError(
            f"Brevo authentication failed: {err_msg}",
            provider="brevo",
            status_code=senders_res.status_code
        )
    
    senders_data = senders_res.json().get("senders", [])
    verified_emails = {
        s["email"].lower().strip()
        for s in senders_data
        if s.get("active", True) and s.get("email")
    }
    
    # 2. Fetch account email
    try:
        acct_res = await client.get("https://api.brevo.com/v3/account", headers=headers)
        if acct_res.status_code == 200:
            acct_email = acct_res.json().get("email", "").lower().strip()
            if acct_email:
                verified_emails.add(acct_email)
    except Exception:
        pass

    if clean_sender in verified_emails:
        return

    # 3. Check authenticated domains if sender is not an individual verified email
    domain = clean_sender.split("@")[-1] if "@" in clean_sender else ""
    try:
        domains_res = await client.get("https://api.brevo.com/v3/senders/domains", headers=headers)
        if domains_res.status_code == 200:
            auth_domains = {
                d["domain_name"].lower().strip()
                for d in domains_res.json().get("domains", [])
                if d.get("authenticated", False) and d.get("domain_name")
            }
            if domain in auth_domains:
                return
    except Exception:
        pass

    # If neither email nor domain is verified, raise clear protective error
    sample = ", ".join(list(verified_emails)[:3]) or "your registered account email"
    raise EmailDispatchError(
        f"Sender Email '{sender_email}' is not a verified sender in your Brevo account. "
        f"Your authorized Brevo sender email is: {sample}. "
        f"Please use your authorized email or verify '{sender_email}' in your Brevo console under Senders & IPs.",
        provider="brevo",
        status_code=400
    )


async def send_via_brevo(
    api_key: str,
    sender_name: str,
    sender_email: str,
    to_email: str,
    subject: str,
    body: str
) -> Dict[str, Any]:
    """Dispatch email using Brevo (Sendinblue) REST API v3 with strict sender verification."""
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": api_key.strip(),
        "Content-Type": "application/json",
        "accept": "application/json"
    }
    payload = {
        "sender": {"name": sender_name.strip(), "email": sender_email.strip()},
        "to": [{"email": to_email.strip()}],
        "subject": subject,
        "textContent": body,
        "htmlContent": f"<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>{body.replace(chr(10), '<br/>')}</div>"
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        # 1. Pre-flight verification: ensure sender is authorized in Brevo
        await verify_brevo_sender_authorization(client, headers, sender_email)

        # 2. Dispatch the email
        try:
            response = await client.post(url, headers=headers, json=payload)
        except Exception as exc:
            raise EmailDispatchError(f"Network error connecting to Brevo: {str(exc)}", provider="brevo")

        if response.status_code in (200, 201, 202):
            data = response.json() if response.text else {}
            return {
                "success": True,
                "provider": "brevo",
                "message_id": data.get("messageId") or "sent",
                "status_code": response.status_code
            }
        
        # Handle Brevo specific error responses
        err_msg = response.text
        try:
            err_json = response.json()
            err_msg = err_json.get("message") or err_json.get("code") or response.text
        except Exception:
            pass

        raise EmailDispatchError(
            message=f"Brevo API error: {err_msg}",
            provider="brevo",
            status_code=response.status_code,
            raw_response=response.text
        )

async def send_via_sendgrid(
    api_key: str,
    sender_name: str,
    sender_email: str,
    to_email: str,
    subject: str,
    body: str
) -> Dict[str, Any]:
    """Dispatch email using SendGrid v3 Mail Send API."""
    url = "https://api.sendgrid.com/v3/mail/send"
    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json"
    }
    payload = {
        "personalizations": [{"to": [{"email": to_email.strip()}]}],
        "from": {"email": sender_email.strip(), "name": sender_name.strip()},
        "subject": subject,
        "content": [{"type": "text/plain", "value": body}]
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
        except Exception as exc:
            raise EmailDispatchError(f"Network error connecting to SendGrid: {str(exc)}", provider="sendgrid")

        if response.status_code in (200, 202):
            msg_id = response.headers.get("X-Message-Id") or "sent"
            return {
                "success": True,
                "provider": "sendgrid",
                "message_id": msg_id,
                "status_code": response.status_code
            }

        err_msg = response.text
        try:
            err_json = response.json()
            errors = err_json.get("errors", [])
            if errors and isinstance(errors, list):
                err_msg = errors[0].get("message", err_msg)
        except Exception:
            pass

        raise EmailDispatchError(
            message=f"SendGrid API error: {err_msg}",
            provider="sendgrid",
            status_code=response.status_code,
            raw_response=response.text
        )

async def send_via_resend(
    api_key: str,
    sender_name: str,
    sender_email: str,
    to_email: str,
    subject: str,
    body: str
) -> Dict[str, Any]:
    """Dispatch email using Resend REST API."""
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json"
    }
    from_header = f"{sender_name.strip()} <{sender_email.strip()}>" if sender_name else sender_email.strip()
    payload = {
        "from": from_header,
        "to": [to_email.strip()],
        "subject": subject,
        "text": body
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.post(url, headers=headers, json=payload)
        except Exception as exc:
            raise EmailDispatchError(f"Network error connecting to Resend: {str(exc)}", provider="resend")

        if response.status_code in (200, 201):
            data = response.json() if response.text else {}
            return {
                "success": True,
                "provider": "resend",
                "message_id": data.get("id") or "sent",
                "status_code": response.status_code
            }

        err_msg = response.text
        try:
            err_json = response.json()
            err_msg = err_json.get("message") or response.text
        except Exception:
            pass

        raise EmailDispatchError(
            message=f"Resend API error: {err_msg}",
            provider="resend",
            status_code=response.status_code,
            raw_response=response.text
        )

def send_via_smtp(
    smtp_host: str,
    smtp_port: int,
    smtp_user: str,
    smtp_pass: str,
    sender_name: str,
    sender_email: str,
    to_email: str,
    subject: str,
    body: str
) -> Dict[str, Any]:
    """Dispatch email using Standard SMTP (synchronous, runs cleanly in threadpool)."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    from_header = f"{sender_name} <{sender_email}>" if sender_name else sender_email
    msg["From"] = from_header
    msg["To"] = to_email

    text_part = MIMEText(body, "plain", "utf-8")
    html_part = MIMEText(f"<div>{body.replace(chr(10), '<br/>')}</div>", "html", "utf-8")
    msg.attach(text_part)
    msg.attach(html_part)

    try:
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
            server.starttls()

        if smtp_user and smtp_pass:
            server.login(smtp_user, smtp_pass)

        server.sendmail(sender_email, [to_email], msg.as_string())
        server.quit()

        return {
            "success": True,
            "provider": "smtp",
            "message_id": "smtp-dispatched",
            "status_code": 200
        }
    except Exception as exc:
        raise EmailDispatchError(
            message=f"SMTP error ({smtp_host}:{smtp_port}): {str(exc)}",
            provider="smtp"
        )

async def dispatch_outreach_email(
    provider: str,
    credentials: Dict[str, Any],
    to_email: str,
    subject: str,
    body: str
) -> Dict[str, Any]:
    """
    Unified entrypoint that routes the dispatch request to the matching provider.
    """
    prov = (provider or "").lower().strip()
    sender_email = credentials.get("sender_email") or ""
    sender_name = credentials.get("sender_name") or "Marketing Team"
    api_key = credentials.get("api_key") or ""

    if not sender_email:
        raise EmailDispatchError("Sender email address is required.", provider=prov)
    if not to_email:
        raise EmailDispatchError("Recipient email address (to_email) is required.", provider=prov)

    if prov == "brevo":
        if not api_key:
            raise EmailDispatchError("Brevo API Key is required.", provider="brevo")
        return await send_via_brevo(api_key, sender_name, sender_email, to_email, subject, body)

    elif prov == "sendgrid":
        if not api_key:
            raise EmailDispatchError("SendGrid API Key is required.", provider="sendgrid")
        return await send_via_sendgrid(api_key, sender_name, sender_email, to_email, subject, body)

    elif prov == "resend":
        if not api_key:
            raise EmailDispatchError("Resend API Key is required.", provider="resend")
        return await send_via_resend(api_key, sender_name, sender_email, to_email, subject, body)

    elif prov == "smtp":
        smtp_host = credentials.get("smtp_host") or ""
        smtp_port = int(credentials.get("smtp_port") or 587)
        smtp_user = credentials.get("smtp_user") or sender_email
        smtp_pass = credentials.get("smtp_pass") or credentials.get("api_key") or ""

        if not smtp_host:
            raise EmailDispatchError("SMTP Host is required for Custom SMTP provider.", provider="smtp")
        
        import asyncio
        # Run blocking smtplib in executor
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            send_via_smtp,
            smtp_host,
            smtp_port,
            smtp_user,
            smtp_pass,
            sender_name,
            sender_email,
            to_email,
            subject,
            body
        )

    else:
        raise EmailDispatchError(f"Unsupported email provider '{provider}'. Supported: brevo, sendgrid, resend, smtp", provider=prov)
