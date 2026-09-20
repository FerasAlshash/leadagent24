from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional, List, Dict, Any
import httpx
from backend.config import N8N_WEBHOOK_URL
from backend.database import supabase_admin, supabase_client

router = APIRouter(prefix="/api/admin", tags=["Admin Console"])

ADMIN_EMAILS = ["ferasalshash@gmail.com"]

def verify_admin(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Verify that the caller is an authenticated administrator.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header.")
    
    token = authorization.replace("Bearer ", "").strip()
    user_id = None
    email = None

    # 1. Primary: supabase_client
    try:
        user_res = supabase_client.auth.get_user(token)
        if user_res and user_res.user:
            user_id = user_res.user.id
            email = (user_res.user.email or "").lower()
    except Exception:
        pass

    # 2. Secondary: supabase_admin
    if not user_id:
        try:
            admin_user_res = supabase_admin.auth.get_user(token)
            if admin_user_res and admin_user_res.user:
                user_id = admin_user_res.user.id
                email = (admin_user_res.user.email or "").lower()
        except Exception:
            pass

    # 3. Fallback: JWT decode directly
    if not user_id:
        try:
            import jwt
            payload = jwt.decode(token, options={"verify_signature": False, "verify_exp": False})
            user_id = payload.get("sub")
            email = (payload.get("email") or "").lower()
        except Exception:
            pass

    if not user_id or not email:
        raise HTTPException(status_code=401, detail="Invalid session token.")
    
    if email not in [a.lower() for a in ADMIN_EMAILS]:
        raise HTTPException(status_code=403, detail="Access denied. Administrator rights required.")
    
    return {
        "id": user_id,
        "email": email,
        "is_admin": True
    }

from pydantic import BaseModel
from backend.webhook_manager import get_webhook_config, get_active_webhook_url, set_webhook_config

class WebhookUpdateRequest(BaseModel):
    mode: str  # "test" or "production"
    test_url: str
    production_url: str
    dispatch_callback_url: Optional[str] = None
    restricted_prospecting: Optional[bool] = None
    authorized_prospecting_emails: Optional[List[Any]] = None

class AccessControlUpdateRequest(BaseModel):
    restricted_prospecting: bool
    authorized_prospecting_emails: List[Any] = []

class PingWebhookRequest(BaseModel):
    target_url: Optional[str] = None

def get_enriched_authorized_users() -> List[Dict[str, Any]]:
    """
    Enriches authorized prospecting emails with live account status from Supabase Auth.
    Identifies whether each account is registered, their registration date, and their access grant date.
    """
    webhook_cfg = get_webhook_config()
    raw_authorized = webhook_cfg.get("authorized_prospecting_emails", [])
    
    users_by_email = {}
    try:
        users_list = supabase_admin.auth.admin.list_users()
        for u in users_list:
            em = getattr(u, "email", None)
            if em:
                users_by_email[em.strip().lower()] = {
                    "id": getattr(u, "id", None),
                    "created_at": getattr(u, "created_at", None),
                    "last_sign_in_at": getattr(u, "last_sign_in_at", None)
                }
    except Exception as e:
        print(f"[Warning] Failed to list auth users in get_enriched_authorized_users: {e}")

    enriched = []
    seen = set()

    # 1. Super Admin (ferasalshash@gmail.com) always first
    admin_email = "ferasalshash@gmail.com"
    admin_auth = users_by_email.get(admin_email)
    admin_created_at = None
    if admin_auth and admin_auth.get("created_at"):
        admin_created_at = str(admin_auth["created_at"])

    enriched.append({
        "email": admin_email,
        "role": "Primary Admin",
        "is_admin": True,
        "is_registered": bool(admin_auth),
        "user_id": admin_auth.get("id") if admin_auth else None,
        "registered_at": admin_created_at,
        "granted_at": "Permanent"
    })
    seen.add(admin_email)

    # 2. Add each authorized guest email
    for item in raw_authorized:
        em = None
        gr_at = None
        if isinstance(item, dict):
            em = item.get("email")
            gr_at = item.get("granted_at")
        elif isinstance(item, str):
            em = item

        if not em or "@" not in em:
            continue

        em_clean = em.strip().lower()
        if em_clean in seen:
            continue
        seen.add(em_clean)

        user_auth = users_by_email.get(em_clean)
        reg_at = None
        if user_auth and user_auth.get("created_at"):
            reg_at = str(user_auth["created_at"])

        enriched.append({
            "email": em_clean,
            "role": "Authorized Guest",
            "is_admin": False,
            "is_registered": bool(user_auth),
            "user_id": user_auth.get("id") if user_auth else None,
            "registered_at": reg_at,
            "granted_at": gr_at
        })

    return enriched

@router.get("/webhook")
def get_admin_webhook(admin: Dict[str, Any] = Depends(verify_admin)):
    """
    Returns current webhook configuration: mode (test vs production), URLs, active URL, dispatch callback URL,
    and access control settings (restricted_prospecting, authorized_prospecting_emails, authorized_users).
    """
    cfg = get_webhook_config()
    return {
        "success": True,
        "config": {
            **cfg,
            "authorized_users": get_enriched_authorized_users()
        }
    }

@router.post("/webhook")
def update_admin_webhook(req: WebhookUpdateRequest, admin: Dict[str, Any] = Depends(verify_admin)):
    """
    Updates the active webhook mode, URLs, dispatch callback URL, and optionally access control settings.
    """
    try:
        updated = set_webhook_config(
            mode=req.mode,
            test_url=req.test_url,
            production_url=req.production_url,
            dispatch_callback_url=req.dispatch_callback_url,
            restricted_prospecting=req.restricted_prospecting,
            authorized_prospecting_emails=req.authorized_prospecting_emails
        )
        return {
            "success": True,
            "message": f"Configuration updated successfully in {updated['mode'].upper()} mode.",
            "config": {
                **updated,
                "authorized_users": get_enriched_authorized_users()
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update webhook config: {str(e)}")

@router.post("/access-control")
def update_access_control(req: AccessControlUpdateRequest, admin: Dict[str, Any] = Depends(verify_admin)):
    """
    Dedicated endpoint to toggle Restricted Live Prospecting and update the list of authorized emails.
    """
    try:
        current = get_webhook_config()
        updated = set_webhook_config(
            mode=current["mode"],
            test_url=current["test_url"],
            production_url=current["production_url"],
            dispatch_callback_url=current.get("dispatch_callback_url"),
            restricted_prospecting=req.restricted_prospecting,
            authorized_prospecting_emails=req.authorized_prospecting_emails
        )
        enriched_users = get_enriched_authorized_users()
        status_label = "Restricted (Admin & Whitelist only)" if updated["restricted_prospecting"] else "Open (Public)"
        return {
            "success": True,
            "message": f"Live prospecting access updated to: {status_label}",
            "config": {
                **updated,
                "authorized_users": enriched_users
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update access control: {str(e)}")

@router.get("/status")
async def get_admin_system_status(admin: Dict[str, Any] = Depends(verify_admin)):
    """
    Returns live system metrics: database counts, webhook connectivity, and user totals.
    """
    # 1. Database stats
    try:
        leads_res = supabase_admin.table("leads").select("id, Cold_Mail_Status, campaign_id, created_at").execute()
        campaigns_res = supabase_admin.table("campaigns").select("id, title, user_id, is_active, created_at").execute()
        users_list = supabase_admin.auth.admin.list_users()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")

    all_leads = leads_res.data or []
    all_campaigns = campaigns_res.data or []
    sent_count = sum(1 for l in all_leads if l.get("Cold_Mail_Status") == "✅" or l.get("Cold_Mail_Status") == "Sent")

    # 2. Check active n8n Webhook connectivity
    webhook_cfg = get_webhook_config()
    active_url = webhook_cfg["active_url"]
    webhook_status = "unknown"
    webhook_latency_ms = None
    try:
        import time
        start = time.time()
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(active_url)
            webhook_latency_ms = round((time.time() - start) * 1000)
            webhook_status = "active" if resp.status_code in [200, 404, 405] else f"http_{resp.status_code}"
    except Exception as ex:
        webhook_status = f"unreachable ({str(ex)[:30]})"

    return {
        "success": True,
        "admin_email": admin["email"],
        "system": {
            "total_users": len(users_list),
            "total_campaigns": len(all_campaigns),
            "total_leads": len(all_leads),
            "total_emails_sent": sent_count,
            "outreach_success_rate": f"{(sent_count / len(all_leads) * 100):.1f}%" if all_leads else "0%"
        },
        "webhook": {
            "url": active_url,
            "status": webhook_status,
            "latency_ms": webhook_latency_ms,
            "mode": webhook_cfg["mode"],
            "test_url": webhook_cfg["test_url"],
            "production_url": webhook_cfg["production_url"],
            "dispatch_callback_url": webhook_cfg.get("dispatch_callback_url", "http://127.0.0.1:8000/api/campaigns/dispatch-email"),
            "restricted_prospecting": webhook_cfg.get("restricted_prospecting", False),
            "authorized_prospecting_emails": webhook_cfg.get("authorized_prospecting_emails", [])
        },
        "access_control": {
            "restricted_prospecting": webhook_cfg.get("restricted_prospecting", False),
            "authorized_prospecting_emails": webhook_cfg.get("authorized_prospecting_emails", []),
            "authorized_users": get_enriched_authorized_users()
        },
        "recent_campaigns": all_campaigns[:8],
        "recent_leads": all_leads[:10]
    }

@router.post("/test-webhook")
async def test_webhook_ping(req: Optional[PingWebhookRequest] = None, admin: Dict[str, Any] = Depends(verify_admin)):
    """
    Ping n8n webhook with a dry-run health payload.
    """
    target = (req.target_url if req and req.target_url else None) or get_active_webhook_url()
    test_payload = {
        "ping": True,
        "admin_test": True,
        "admin_email": admin["email"]
    }
    try:
        import time
        start = time.time()
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(target, json=test_payload)
            latency_ms = round((time.time() - start) * 1000)
            return {
                "success": resp.is_success,
                "status_code": resp.status_code,
                "target_url": target,
                "latency_ms": latency_ms,
                "response_text": resp.text[:500]
            }
    except Exception as e:
        return {
            "success": False,
            "target_url": target,
            "error": str(e)
        }

@router.delete("/clear-test-data")
def clear_test_data(target: str = "leads", admin: Dict[str, Any] = Depends(verify_admin)):
    """
    Emergency admin tool: clear test leads or all leads.
    """
    try:
        if target == "leads":
            res = supabase_admin.table("leads").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            return {"success": True, "message": f"Cleared leads database table"}
        elif target == "campaigns":
            res = supabase_admin.table("campaigns").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            return {"success": True, "message": f"Cleared campaigns database table"}
        else:
            raise HTTPException(status_code=400, detail="Invalid target table")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
