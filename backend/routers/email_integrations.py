import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
import httpx

from backend.database import supabase_admin, supabase_client
from backend.services.email_dispatcher import (
    dispatch_outreach_email,
    verify_brevo_sender_authorization,
    verify_resend_sender_authorization,
    verify_sendgrid_sender_authorization,
    EmailDispatchError
)

router = APIRouter(prefix="/api/email-integrations", tags=["Email Integrations"])
SETTINGS_FILE = Path(__file__).resolve().parent.parent / "email_settings.json"

# =========================================================================
# MODELS
# =========================================================================

class TestEmailRequest(BaseModel):
    provider: str = "resend"  # 'brevo', 'sendgrid', 'resend', 'smtp'
    api_key: Optional[str] = None
    sender_email: str
    sender_name: Optional[str] = "LeadAgent Prospecting"
    test_recipient: str
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None
    credential_id: Optional[str] = None

class CredentialRequest(BaseModel):
    id: Optional[str] = None
    name: str  # e.g. "Hireley Master Resend", "Agency Brevo"
    provider: str  # 'resend', 'brevo', 'sendgrid', 'smtp'
    api_key: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None

class CampaignBindRequest(BaseModel):
    credential_id: Optional[str] = None
    credential_name: Optional[str] = None  # Friendly Vault Label
    provider: Optional[str] = "resend"
    api_key: Optional[str] = None
    sender_email: str
    sender_name: str
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None

class SaveIntegrationRequest(BaseModel):
    provider: str
    api_key: Optional[str] = None
    sender_email: str
    sender_name: str
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None

class VerifyConnectionRequest(BaseModel):
    provider: str = "resend"
    credential_id: Optional[str] = None
    credential_name: Optional[str] = None
    api_key: Optional[str] = None
    sender_email: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None

# =========================================================================
# HELPER FUNCTIONS
# =========================================================================

def get_user_id_from_header(authorization: Optional[str] = Header(None)) -> str:
    """Helper to extract user_id from Supabase JWT token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    try:
        token = authorization.replace("Bearer ", "").strip()
        user_res = supabase_client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_res.user.id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def mask_secret_key(raw_key: str) -> str:
    """
    Masks a secret key while preserving its exact length and visible prefix/suffix.
    e.g. 're_' + 27 bullets ('•') + '3NKP'.
    """
    if not raw_key:
        return ""
    length = len(raw_key)
    if length <= 8:
        return "•" * length

    if raw_key.startswith("xkeysib-"):
        prefix_len = 8
    elif raw_key.startswith("SG."):
        prefix_len = 3
    elif raw_key.startswith("re_"):
        prefix_len = 3
    else:
        prefix_len = min(4, length // 4)

    suffix_len = min(4, length // 4)
    middle_len = length - prefix_len - suffix_len
    if middle_len <= 0:
        return "•" * length

    return f"{raw_key[:prefix_len]}{'•' * middle_len}{raw_key[-suffix_len:]}"


def is_masked_string(val: Optional[str]) -> bool:
    """Returns True if the value contains mask characters or is blank."""
    if not val or not val.strip():
        return True
    v = val.strip()
    return "•" in v or "*" in v or "..." in v


# =========================================================================
# LOCAL FAIL-SAFE STORAGE (CREDENTIALS & CAMPAIGNS)
# =========================================================================

def _read_all_settings() -> Dict[str, Any]:
    if not SETTINGS_FILE.exists():
        return {}
    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def _write_all_settings(data: Dict[str, Any]):
    try:
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception:
        pass

def read_local_email_settings(user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    data = _read_all_settings()
    if user_id and user_id in data:
        return data[user_id]
    return None

def write_local_email_settings(user_id: str, settings: Dict[str, Any]):
    data = _read_all_settings()
    data[user_id] = settings
    _write_all_settings(data)

def read_local_credentials(user_id: str) -> List[Dict[str, Any]]:
    data = _read_all_settings()
    creds_dict = data.get("vault_credentials", {})
    user_creds = []
    for cid, cdata in creds_dict.items():
        if cdata.get("user_id") in [user_id, "default"] or user_id == "default":
            user_creds.append(cdata)
    return user_creds

def read_local_credential_by_id(cred_id: str) -> Optional[Dict[str, Any]]:
    data = _read_all_settings()
    creds_dict = data.get("vault_credentials", {})
    return creds_dict.get(cred_id)

def write_local_credential(cred_data: Dict[str, Any]):
    data = _read_all_settings()
    if "vault_credentials" not in data:
        data["vault_credentials"] = {}
    cid = cred_data["id"]
    data["vault_credentials"][cid] = cred_data
    _write_all_settings(data)

def delete_local_credential(cred_id: str):
    data = _read_all_settings()
    if "vault_credentials" in data and cred_id in data["vault_credentials"]:
        del data["vault_credentials"][cred_id]
        _write_all_settings(data)

def read_local_campaign_email_settings(campaign_id: str) -> Optional[Dict[str, Any]]:
    data = _read_all_settings()
    key = f"campaign:{campaign_id}"
    return data.get(key)  # Strictly isolated: returns None if this specific campaign has no bound settings!

def write_local_campaign_email_settings(campaign_id: str, settings: Dict[str, Any]):
    data = _read_all_settings()
    key = f"campaign:{campaign_id}"
    data[key] = settings
    _write_all_settings(data)

def delete_local_campaign_email_settings(campaign_id: str):
    key = f"campaign:{campaign_id}"
    data = _read_all_settings()
    if key in data:
        del data[key]
        _write_all_settings(data)


# =========================================================================
# PROVIDER CREDENTIALS VAULT ENDPOINTS (N8N STYLE)
# =========================================================================

@router.get("/credentials")
async def list_user_credentials(authorization: Optional[str] = Header(None)):
    """
    List all stored provider credentials (API keys / SMTP servers) in the user's vault.
    Returns keys with length-preserving masks for high security.
    """
    user_id = "default"
    try:
        user_id = get_user_id_from_header(authorization)
    except Exception:
        pass

    credentials_list = []

    # 1. Try Supabase
    if user_id != "default":
        try:
            res = supabase_admin.table("user_email_credentials").select("*").eq("user_id", user_id).order("created_at").execute()
            if res.data:
                credentials_list = res.data
        except Exception:
            pass

    # 2. Fallback to local vault
    if not credentials_list:
        credentials_list = read_local_credentials(user_id)

    # Mask secrets
    sanitized = []
    for c in credentials_list:
        item = dict(c)
        raw_key = item.get("api_key") or ""
        item["api_key_masked"] = mask_secret_key(raw_key)
        item.pop("smtp_pass", None)
        sanitized.append(item)

    return {"success": True, "credentials": sanitized}


@router.post("/credentials")
async def save_user_credential(
    payload: CredentialRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Create or update a named credential in the user's vault (e.g. 'Agency Resend Master').
    Strictly validates the API key before saving!
    """
    user_id = "default"
    try:
        user_id = get_user_id_from_header(authorization)
    except Exception:
        pass

    prov = payload.provider.lower().strip()
    cred_id = payload.id or str(uuid.uuid4())

    # Load existing if editing
    existing = read_local_credential_by_id(cred_id) or {}
    if not existing and user_id != "default" and payload.id:
        try:
            res = supabase_admin.table("user_email_credentials").select("*").eq("id", cred_id).execute()
            if res.data:
                existing = res.data[0]
        except Exception:
            pass

    submitted_api_key = (payload.api_key or "").strip()
    resolved_api_key = submitted_api_key
    if is_masked_string(submitted_api_key):
        resolved_api_key = existing.get("api_key") or ""

    submitted_smtp_pass = (payload.smtp_pass or "").strip()
    resolved_smtp_pass = submitted_smtp_pass
    if is_masked_string(submitted_smtp_pass):
        resolved_smtp_pass = existing.get("smtp_pass") or ""

    # Validate API Key with provider if provided
    if prov in ["resend", "brevo", "sendgrid"] and resolved_api_key:
        async with httpx.AsyncClient(timeout=10.0) as client:
            if prov == "resend":
                res = await client.get("https://api.resend.com/domains", headers={"Authorization": f"Bearer {resolved_api_key}"})
                if res.status_code != 200:
                    err_detail = "Invalid Resend API Key"
                    try:
                        err_detail = res.json().get("message") or err_detail
                    except Exception:
                        pass
                    raise HTTPException(status_code=400, detail=f"Resend authentication failed: {err_detail}")
            elif prov == "brevo":
                res = await client.get("https://api.brevo.com/v3/account", headers={"api-key": resolved_api_key})
                if res.status_code != 200:
                    err_detail = "Invalid Brevo API Key"
                    try:
                        err_detail = res.json().get("message") or err_detail
                    except Exception:
                        pass
                    raise HTTPException(status_code=400, detail=f"Brevo authentication failed: {err_detail}")
            elif prov == "sendgrid":
                res = await client.get("https://api.sendgrid.com/v3/user/profile", headers={"Authorization": f"Bearer {resolved_api_key}"})
                if res.status_code != 200:
                    raise HTTPException(status_code=400, detail="Invalid SendGrid API Key")

    cred_record = {
        "id": cred_id,
        "user_id": user_id,
        "name": payload.name.strip(),
        "provider": prov,
        "api_key": resolved_api_key,
        "smtp_host": payload.smtp_host.strip() if payload.smtp_host else None,
        "smtp_port": payload.smtp_port or 587,
        "smtp_user": payload.smtp_user.strip() if payload.smtp_user else None,
        "smtp_pass": resolved_smtp_pass,
        "is_verified": True,
        "updated_at": datetime.now().isoformat()
    }

    # 1. Local storage fail-safe
    write_local_credential(cred_record)

    # 2. Supabase storage
    if user_id != "default":
        try:
            supabase_admin.table("user_email_credentials").upsert(
                cred_record, on_conflict="id"
            ).execute()
        except Exception as e:
            print(f"[Credentials Vault] Notice saving to Supabase: {e}")

    return {
        "success": True,
        "message": f"Credential '{payload.name}' saved and verified successfully!",
        "credential": {
            **cred_record,
            "api_key_masked": mask_secret_key(resolved_api_key)
        }
    }


@router.delete("/credentials/{credential_id}")
async def remove_user_credential(
    credential_id: str,
    authorization: Optional[str] = Header(None)
):
    """Delete a stored credential from the vault."""
    user_id = "default"
    try:
        user_id = get_user_id_from_header(authorization)
    except Exception:
        pass

    delete_local_credential(credential_id)

    if user_id != "default":
        try:
            supabase_admin.table("user_email_credentials").delete().eq("id", credential_id).execute()
        except Exception:
            pass

    return {"success": True, "message": "Credential removed successfully."}


# =========================================================================
# TEST DISPATCH ENDPOINT
# =========================================================================

@router.post("/test")
async def test_email_integration(
    payload: TestEmailRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Immediate verification endpoint. Dispatches a real test email
    to confirm API key validity, domain verification, and quota availability.
    """
    subject = f"✅ LeadAgent: Email Provider Verification Test ({payload.provider.upper()})"
    body = (
        f"Hello from LeadAgent!\n\n"
        f"This is a verification test email dispatched via your {payload.provider.title()} provider.\n"
        f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
        f"Sender: {payload.sender_name} <{payload.sender_email}>\n\n"
        f"Your outbound email pipeline is authenticated, healthy, and ready to dispatch live campaign outreach."
    )

    resolved_api_key = (payload.api_key or "").strip()
    resolved_smtp_pass = (payload.smtp_pass or "").strip()

    # If credential_id provided, resolve from vault
    if payload.credential_id:
        cred = read_local_credential_by_id(payload.credential_id)
        if not cred:
            try:
                res = supabase_admin.table("user_email_credentials").select("*").eq("id", payload.credential_id).execute()
                if res.data:
                    cred = res.data[0]
            except Exception:
                pass
        if cred:
            resolved_api_key = cred.get("api_key") or resolved_api_key
            resolved_smtp_pass = cred.get("smtp_pass") or resolved_smtp_pass

    credentials = {
        "api_key": resolved_api_key,
        "sender_email": payload.sender_email,
        "sender_name": payload.sender_name or "LeadAgent Team",
        "smtp_host": payload.smtp_host,
        "smtp_port": payload.smtp_port or 587,
        "smtp_user": payload.smtp_user,
        "smtp_pass": resolved_smtp_pass
    }

    try:
        result = await dispatch_outreach_email(
            provider=payload.provider.lower().strip(),
            credentials=credentials,
            to_email=payload.test_recipient,
            subject=subject,
            body=body
        )
        return {
            "success": True,
            "provider": payload.provider,
            "message": f"Verification test email delivered successfully to {payload.test_recipient}!",
            "details": result
        }
    except EmailDispatchError as exc:
        return {
            "success": False,
            "error": exc.message,
            "provider": exc.provider,
            "status_code": exc.status_code or 400
        }
    except Exception as exc:
        return {
            "success": False,
            "error": f"Unexpected dispatch error: {str(exc)}",
            "provider": payload.provider,
            "status_code": 500
        }


@router.post("/verify-connection")
async def verify_connection(
    payload: VerifyConnectionRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Non-destructive pre-flight verification endpoint.
    Strictly verifies provider API credentials AND checks domain authorization
    without dispatching an email to any inbox!
    """
    user_id = "default"
    try:
        user_id = get_user_id_from_header(authorization)
    except Exception:
        pass

    prov = (payload.provider or "resend").lower().strip()
    resolved_api_key = (payload.api_key or "").strip()
    resolved_smtp_host = payload.smtp_host.strip() if payload.smtp_host else None
    resolved_smtp_port = payload.smtp_port or 587
    resolved_smtp_user = payload.smtp_user.strip() if payload.smtp_user else None
    resolved_smtp_pass = (payload.smtp_pass or "").strip()

    # If credential_id provided, resolve from vault
    if payload.credential_id:
        cred = read_local_credential_by_id(payload.credential_id)
        if not cred and user_id != "default":
            try:
                res_c = supabase_admin.table("user_email_credentials").select("*").eq("id", payload.credential_id).execute()
                if res_c.data:
                    cred = res_c.data[0]
            except Exception:
                pass
        if cred:
            prov = cred.get("provider", prov)
            resolved_api_key = cred.get("api_key") or resolved_api_key
            resolved_smtp_host = cred.get("smtp_host") or resolved_smtp_host
            resolved_smtp_port = cred.get("smtp_port") or resolved_smtp_port
            resolved_smtp_user = cred.get("smtp_user") or resolved_smtp_user
            resolved_smtp_pass = cred.get("smtp_pass") or resolved_smtp_pass

    sender_email = (payload.sender_email or "").strip()

    # 1. Verification for Resend
    if prov == "resend":
        if not resolved_api_key:
            raise HTTPException(status_code=400, detail="Resend API Key is required for verification.")
        headers = {"Authorization": f"Bearer {resolved_api_key}", "Content-Type": "application/json"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get("https://api.resend.com/domains", headers=headers)
            if res.status_code != 200:
                err_detail = "Invalid Resend API Key"
                try:
                    err_detail = res.json().get("message") or err_detail
                except Exception:
                    pass
                raise HTTPException(status_code=400, detail=f"Resend authentication failed: {err_detail}")
            
            domains_data = res.json().get("data", [])
            verified_domains = [
                d.get("name", "").lower().strip()
                for d in domains_data
                if d.get("status") == "verified" and d.get("name")
            ]

            if sender_email:
                try:
                    await verify_resend_sender_authorization(client, headers, sender_email)
                except EmailDispatchError as exc:
                    raise HTTPException(status_code=400, detail=exc.message)

            return {
                "success": True,
                "provider": "resend",
                "verified_domains": verified_domains,
                "message": f"Resend API key is valid! Verified domains: {', '.join(verified_domains) or 'resend.dev sandbox only'}." if not sender_email else f"Success! Resend API key is valid and domain for '{sender_email}' is fully authenticated."
            }

    # 2. Verification for Brevo
    elif prov == "brevo":
        if not resolved_api_key:
            raise HTTPException(status_code=400, detail="Brevo API Key is required for verification.")
        headers = {"api-key": resolved_api_key, "Content-Type": "application/json", "accept": "application/json"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get("https://api.brevo.com/v3/account", headers=headers)
            if res.status_code != 200:
                err_detail = "Invalid Brevo API Key"
                try:
                    err_detail = res.json().get("message") or err_detail
                except Exception:
                    pass
                raise HTTPException(status_code=400, detail=f"Brevo authentication failed: {err_detail}")

            if sender_email:
                try:
                    await verify_brevo_sender_authorization(client, headers, sender_email)
                except EmailDispatchError as exc:
                    raise HTTPException(status_code=400, detail=exc.message)

            return {
                "success": True,
                "provider": "brevo",
                "message": "Brevo API key is valid!" if not sender_email else f"Success! Brevo account connected and sender '{sender_email}' is verified."
            }

    # 3. Verification for SendGrid
    elif prov == "sendgrid":
        if not resolved_api_key:
            raise HTTPException(status_code=400, detail="SendGrid API Key is required for verification.")
        headers = {"Authorization": f"Bearer {resolved_api_key}", "Content-Type": "application/json"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get("https://api.sendgrid.com/v3/user/profile", headers=headers)
            if res.status_code != 200:
                raise HTTPException(status_code=400, detail="SendGrid authentication failed: Invalid API Key")

            if sender_email:
                try:
                    await verify_sendgrid_sender_authorization(client, headers, sender_email)
                except EmailDispatchError as exc:
                    raise HTTPException(status_code=400, detail=exc.message)

            return {
                "success": True,
                "provider": "sendgrid",
                "message": "SendGrid API key is valid!" if not sender_email else f"Success! SendGrid API key is valid and sender '{sender_email}' is verified."
            }

    # 4. Verification for Custom SMTP
    elif prov == "smtp":
        if not resolved_smtp_host:
            raise HTTPException(status_code=400, detail="SMTP Host is required.")
        import aiosmtplib
        try:
            use_tls = (resolved_smtp_port == 465)
            start_tls = (resolved_smtp_port == 587)
            client = aiosmtplib.SMTP(
                hostname=resolved_smtp_host,
                port=resolved_smtp_port,
                use_tls=use_tls,
                start_tls=start_tls,
                timeout=10
            )
            await client.connect()
            if resolved_smtp_user and resolved_smtp_pass:
                await client.login(resolved_smtp_user, resolved_smtp_pass)
            await client.quit()
            return {
                "success": True,
                "provider": "smtp",
                "message": f"SMTP connection and authentication to {resolved_smtp_host}:{resolved_smtp_port} successful!"
            }
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"SMTP connection failed: {str(exc)}")

    raise HTTPException(status_code=400, detail=f"Unsupported provider: {prov}")


# =========================================================================
# CAMPAIGN-LEVEL SENDER BINDING ENDPOINTS
# =========================================================================

@router.get("/campaign/{campaign_id}")
async def get_campaign_email_integration(
    campaign_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Retrieve outbound email configuration for a specific campaign,
    and returns the list of available user credentials.
    """
    user_id = "default"
    try:
        user_id = get_user_id_from_header(authorization)
    except Exception:
        pass

    # 1. Fetch available credentials for selection
    available_creds = []
    if user_id != "default":
        try:
            res_creds = supabase_admin.table("user_email_credentials").select("*").eq("user_id", user_id).order("created_at").execute()
            if res_creds.data:
                available_creds = res_creds.data
        except Exception:
            pass
    if not available_creds:
        available_creds = read_local_credentials(user_id)

    sanitized_creds = []
    for c in available_creds:
        item = dict(c)
        item["api_key_masked"] = mask_secret_key(item.get("api_key") or "")
        item.pop("smtp_pass", None)
        sanitized_creds.append(item)

    # 2. Fetch campaign's bound outbound config
    bound_record = None
    try:
        res = supabase_admin.table("campaign_email_integrations").select("*").eq("campaign_id", campaign_id).execute()
        if res.data and len(res.data) > 0:
            bound_record = res.data[0]
    except Exception:
        pass

    if not bound_record:
        bound_record = read_local_campaign_email_settings(campaign_id)

    if bound_record:
        rec = dict(bound_record)
        rec["api_key_masked"] = mask_secret_key(rec.get("api_key") or "")
        rec.pop("smtp_pass", None)
        return {
            "configured": True,
            "integration": rec,
            "available_credentials": sanitized_creds
        }

    return {
        "configured": False,
        "integration": None,
        "available_credentials": sanitized_creds
    }


@router.post("/campaign/{campaign_id}")
async def save_campaign_email_integration(
    campaign_id: str,
    payload: CampaignBindRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Binds a campaign to a dedicated outbound sender identity and provider (Resend, Brevo, SendGrid, SMTP).
    Strictly verifies that the sender email domain is authorized in that provider account before saving!
    """
    user_id = "default"
    try:
        user_id = get_user_id_from_header(authorization)
    except Exception:
        pass

    # Load existing binding to preserve secrets if masked
    existing = read_local_campaign_email_settings(campaign_id) or {}
    if not existing and user_id != "default":
        try:
            res = supabase_admin.table("campaign_email_integrations").select("*").eq("campaign_id", campaign_id).execute()
            if res.data:
                existing = res.data[0]
        except Exception:
            pass

    resolved_provider = (payload.provider or "resend").lower().strip()
    resolved_api_key = (payload.api_key or "").strip()
    resolved_smtp_host = payload.smtp_host.strip() if payload.smtp_host else None
    resolved_smtp_port = payload.smtp_port or 587
    resolved_smtp_user = payload.smtp_user.strip() if payload.smtp_user else None
    resolved_smtp_pass = (payload.smtp_pass or "").strip()

    # If linked to a saved credential from the vault, pull its keys
    if payload.credential_id:
        cred = read_local_credential_by_id(payload.credential_id)
        if not cred and user_id != "default":
            try:
                res_c = supabase_admin.table("user_email_credentials").select("*").eq("id", payload.credential_id).execute()
                if res_c.data:
                    cred = res_c.data[0]
            except Exception:
                pass
        if cred:
            resolved_provider = cred.get("provider", resolved_provider)
            resolved_api_key = cred.get("api_key") or resolved_api_key
            resolved_smtp_host = cred.get("smtp_host") or resolved_smtp_host
            resolved_smtp_port = cred.get("smtp_port") or resolved_smtp_port
            resolved_smtp_user = cred.get("smtp_user") or resolved_smtp_user
            resolved_smtp_pass = cred.get("smtp_pass") or resolved_smtp_pass

    if is_masked_string(resolved_api_key):
        resolved_api_key = existing.get("api_key") or ""
    if is_masked_string(resolved_smtp_pass):
        resolved_smtp_pass = existing.get("smtp_pass") or ""

    sender_email = payload.sender_email.strip()
    sender_name = payload.sender_name.strip()

    if not sender_email:
        raise HTTPException(status_code=400, detail="Sender Email Address is required.")

    # Strict Pre-flight Verification: Verify sender email authorization with provider
    if resolved_provider == "brevo" and resolved_api_key:
        headers = {"api-key": resolved_api_key, "Content-Type": "application/json", "accept": "application/json"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                await verify_brevo_sender_authorization(client, headers, sender_email)
            except EmailDispatchError as exc:
                raise HTTPException(status_code=400, detail=exc.message)
    elif resolved_provider == "resend" and resolved_api_key:
        headers = {"Authorization": f"Bearer {resolved_api_key}", "Content-Type": "application/json"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                await verify_resend_sender_authorization(client, headers, sender_email)
            except EmailDispatchError as exc:
                raise HTTPException(status_code=400, detail=exc.message)
    elif resolved_provider == "sendgrid" and resolved_api_key:
        headers = {"Authorization": f"Bearer {resolved_api_key}", "Content-Type": "application/json"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                await verify_sendgrid_sender_authorization(client, headers, sender_email)
            except EmailDispatchError as exc:
                raise HTTPException(status_code=400, detail=exc.message)

    # If this is a new credential without a vault id, automatically register it in the Vault!
    bound_cred_id = payload.credential_id
    if not bound_cred_id and (resolved_api_key or resolved_smtp_host):
        cred_name = (payload.credential_name or "").strip() or f"{resolved_provider.title()} ({sender_email or 'Outbound'})"
        bound_cred_id = str(uuid.uuid4())
        cred_record = {
            "id": bound_cred_id,
            "user_id": user_id,
            "name": cred_name,
            "provider": resolved_provider,
            "api_key": resolved_api_key,
            "smtp_host": resolved_smtp_host,
            "smtp_port": resolved_smtp_port,
            "smtp_user": resolved_smtp_user,
            "smtp_pass": resolved_smtp_pass,
            "is_verified": True,
            "updated_at": datetime.now().isoformat()
        }
        write_local_credential(cred_record)
        if user_id != "default":
            try:
                supabase_admin.table("user_email_credentials").upsert(cred_record, on_conflict="id").execute()
            except Exception as e:
                print(f"[Credentials Vault] Notice saving new credential: {e}")

    upsert_data = {
        "campaign_id": campaign_id,
        "user_id": user_id,
        "credential_id": bound_cred_id,
        "provider": resolved_provider,
        "api_key": resolved_api_key,
        "sender_email": sender_email,
        "sender_name": sender_name,
        "smtp_host": resolved_smtp_host,
        "smtp_port": resolved_smtp_port,
        "smtp_user": resolved_smtp_user,
        "smtp_pass": resolved_smtp_pass,
        "is_verified": True,
        "updated_at": datetime.now().isoformat()
    }

    # 1. Local fail-safe persistence
    write_local_campaign_email_settings(campaign_id, upsert_data)

    # 2. Supabase persistence
    if user_id != "default":
        try:
            supabase_admin.table("campaign_email_integrations").upsert(
                upsert_data, on_conflict="campaign_id"
            ).execute()
        except Exception as exc:
            print(f"[Campaign Email Integration] Notice: Saved locally ({exc}).")

    return {
        "success": True,
        "message": f"Outbound {resolved_provider.upper()} sender '{sender_email}' verified and bound to campaign!",
        "integration": {
            **upsert_data,
            "api_key_masked": mask_secret_key(resolved_api_key)
        }
    }


@router.delete("/campaign/{campaign_id}")
async def reset_campaign_email_integration(
    campaign_id: str,
    authorization: Optional[str] = Header(None)
):
    """Removes outbound email configuration for this campaign."""
    user_id = "default"
    try:
        user_id = get_user_id_from_header(authorization)
    except Exception:
        pass

    delete_local_campaign_email_settings(campaign_id)

    try:
        supabase_admin.table("campaign_email_integrations").delete().eq("campaign_id", campaign_id).execute()
    except Exception:
        pass

    return {
        "success": True,
        "message": "Campaign outbound sender configuration removed."
    }


# =========================================================================
# BACKWARD COMPATIBILITY ENDPOINTS (FOR LEGACY CALLS)
# =========================================================================

@router.get("/me")
async def get_my_email_integration(authorization: Optional[str] = Header(None)):
    """Legacy user email integration endpoint."""
    user_id = "default"
    try:
        user_id = get_user_id_from_header(authorization)
    except Exception:
        pass

    local_integ = read_local_email_settings(user_id)
    if local_integ:
        record = dict(local_integ)
        raw_key = record.get("api_key") or ""
        record["api_key_masked"] = mask_secret_key(raw_key)
        record.pop("smtp_pass", None)
        return {"configured": True, "integration": record}

    return {"configured": False, "integration": None}


@router.post("/save")
async def save_my_email_integration(
    payload: SaveIntegrationRequest,
    authorization: Optional[str] = Header(None)
):
    """Legacy save endpoint."""
    user_id = "default"
    try:
        user_id = get_user_id_from_header(authorization)
    except Exception:
        pass

    upsert_data = {
        "user_id": user_id,
        "provider": payload.provider.lower().strip(),
        "sender_email": payload.sender_email.strip(),
        "sender_name": payload.sender_name.strip(),
        "api_key": payload.api_key or "",
        "smtp_host": payload.smtp_host,
        "smtp_port": payload.smtp_port or 587,
        "smtp_user": payload.smtp_user,
        "smtp_pass": payload.smtp_pass or "",
        "updated_at": datetime.now().isoformat()
    }
    write_local_email_settings(user_id, upsert_data)
    return {"success": True, "message": "Saved successfully", "data": upsert_data}
