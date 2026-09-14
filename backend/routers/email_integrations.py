from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
from backend.database import supabase_admin, supabase_client
from backend.services.email_dispatcher import dispatch_outreach_email, EmailDispatchError

router = APIRouter(prefix="/api/email-integrations", tags=["Email Integrations"])

class TestEmailRequest(BaseModel):
    provider: str = "brevo"  # 'brevo', 'sendgrid', 'resend', 'smtp'
    api_key: Optional[str] = None
    sender_email: str
    sender_name: Optional[str] = "LeadAgent Prospecting"
    test_recipient: str
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
    e.g. An 88-char Brevo key will produce exactly 88 characters:
    'xkeysib-' + 76 bullets ('•') + 'AsgL'.
    This ensures the HTML password field renders the exact matching number of dots,
    preserving full length and reassuring the user.
    """
    if not raw_key:
        return ""
    length = len(raw_key)
    if length <= 8:
        return "•" * length

    # Identify standard provider prefixes
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


@router.post("/test")
async def test_email_integration(
    payload: TestEmailRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Immediate verification endpoint. Dispatches a real test email
    to confirm API key validity, domain verification, and quota availability.
    Automatically resolves real credentials if a masked string was submitted.
    """
    subject = f"✅ LeadAgent: Email Provider Verification Test ({payload.provider.upper()})"
    body = (
        f"Hello from LeadAgent!\n\n"
        f"This is a verification test email dispatched via your {payload.provider.title()} account.\n"
        f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
        f"Sender: {payload.sender_name} <{payload.sender_email}>\n\n"
        f"Your outbound email pipeline is authenticated, healthy, and ready to dispatch live campaign outreach."
    )

    user_id = None
    try:
        user_id = get_user_id_from_header(authorization)
    except Exception:
        pass

    resolved_api_key = (payload.api_key or "").strip()
    if is_masked_string(resolved_api_key):
        saved = read_local_email_settings(user_id)
        if saved and saved.get("api_key"):
            resolved_api_key = saved["api_key"]
        elif user_id:
            try:
                res = supabase_admin.table("user_email_integrations").select("api_key").eq("user_id", user_id).execute()
                if res.data and res.data[0].get("api_key"):
                    resolved_api_key = res.data[0]["api_key"]
            except Exception:
                pass

    resolved_smtp_pass = (payload.smtp_pass or "").strip()
    if is_masked_string(resolved_smtp_pass):
        saved = read_local_email_settings(user_id)
        if saved and saved.get("smtp_pass"):
            resolved_smtp_pass = saved["smtp_pass"]
        elif user_id:
            try:
                res = supabase_admin.table("user_email_integrations").select("smtp_pass").eq("user_id", user_id).execute()
                if res.data and res.data[0].get("smtp_pass"):
                    resolved_smtp_pass = res.data[0]["smtp_pass"]
            except Exception:
                pass

    credentials = {
        "api_key": resolved_api_key,
        "sender_email": payload.sender_email,
        "sender_name": payload.sender_name or "LeadAgent Test",
        "smtp_host": payload.smtp_host,
        "smtp_port": payload.smtp_port or 587,
        "smtp_user": payload.smtp_user,
        "smtp_pass": resolved_smtp_pass
    }

    try:
        result = await dispatch_outreach_email(
            provider=payload.provider,
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

import json
from pathlib import Path

SETTINGS_FILE = Path(__file__).resolve().parent.parent / "email_settings.json"

def read_local_email_settings(user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    if not SETTINGS_FILE.exists():
        return None
    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if user_id and user_id in data:
                return data[user_id]
            return data.get("default") or None
    except Exception:
        return None

def write_local_email_settings(user_id: str, settings: Dict[str, Any]):
    data = {}
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = {}
    data[user_id] = settings
    data["default"] = settings
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

@router.get("/me")
async def get_my_email_integration(authorization: Optional[str] = Header(None)):
    """Retrieve the current user's active email integration with length-preserving masked secrets."""
    user_id = None
    try:
        user_id = get_user_id_from_header(authorization)
    except Exception:
        pass

    # 1. Try Supabase
    if user_id:
        try:
            res = supabase_admin.table("user_email_integrations").select("*").eq("user_id", user_id).execute()
            if res.data:
                record = res.data[0]
                raw_key = record.get("api_key") or ""
                record["api_key_masked"] = mask_secret_key(raw_key)
                record.pop("smtp_pass", None)
                return {"configured": True, "integration": record}
        except Exception:
            pass

    # 2. Resilient Fallback to local settings file
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
    """Save or update user's email outreach provider credentials, preserving existing secrets if masked."""
    user_id = "default"
    try:
        user_id = get_user_id_from_header(authorization)
    except Exception:
        pass
    
    # Load existing settings to ensure we don't overwrite real secrets with masked bullets
    existing = read_local_email_settings(user_id) or {}
    if not existing and user_id != "default":
        try:
            res = supabase_admin.table("user_email_integrations").select("*").eq("user_id", user_id).execute()
            if res.data:
                existing = res.data[0]
        except Exception:
            pass

    upsert_data = {
        "user_id": user_id,
        "provider": payload.provider.lower().strip(),
        "sender_email": payload.sender_email.strip(),
        "sender_name": payload.sender_name.strip(),
        "smtp_host": payload.smtp_host.strip() if payload.smtp_host else None,
        "smtp_port": payload.smtp_port or 587,
        "smtp_user": payload.smtp_user.strip() if payload.smtp_user else None,
        "updated_at": datetime.now().isoformat()
    }
    
    submitted_api_key = (payload.api_key or "").strip()
    if submitted_api_key and not is_masked_string(submitted_api_key):
        upsert_data["api_key"] = submitted_api_key
    elif existing.get("api_key"):
        upsert_data["api_key"] = existing["api_key"]

    submitted_smtp_pass = (payload.smtp_pass or "").strip()
    if submitted_smtp_pass and not is_masked_string(submitted_smtp_pass):
        upsert_data["smtp_pass"] = submitted_smtp_pass
    elif existing.get("smtp_pass"):
        upsert_data["smtp_pass"] = existing["smtp_pass"]

    # Pre-validation for Brevo: Verify sender identity before saving
    if payload.provider.lower().strip() == "brevo" and upsert_data.get("api_key"):
        import httpx
        from backend.services.email_dispatcher import verify_brevo_sender_authorization, EmailDispatchError
        headers = {
            "api-key": upsert_data["api_key"].strip(),
            "Content-Type": "application/json",
            "accept": "application/json"
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                await verify_brevo_sender_authorization(client, headers, payload.sender_email)
            except EmailDispatchError as exc:
                raise HTTPException(status_code=400, detail=exc.message)

    # Always persist locally as fail-safe
    write_local_email_settings(user_id, upsert_data)

    # Also attempt Supabase upsert if table exists
    try:
        if user_id != "default":
            supabase_admin.table("user_email_integrations").upsert(
                upsert_data, on_conflict="user_id"
            ).execute()
    except Exception as exc:
        print(f"[Email Integrations] Notice: Saved locally. Supabase table not yet created ({exc}).")

    return {
        "success": True,
        "message": f"{payload.provider.upper()} credentials saved and active!",
        "data": {
            **upsert_data,
            "api_key_masked": mask_secret_key(upsert_data.get("api_key", ""))
        }
    }

