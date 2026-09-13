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

class PingWebhookRequest(BaseModel):
    target_url: Optional[str] = None

@router.get("/webhook")
def get_admin_webhook(admin: Dict[str, Any] = Depends(verify_admin)):
    """
    Returns current webhook configuration: mode (test vs production), URLs, and active URL.
    """
    return {
        "success": True,
        "config": get_webhook_config()
    }

@router.post("/webhook")
def update_admin_webhook(req: WebhookUpdateRequest, admin: Dict[str, Any] = Depends(verify_admin)):
    """
    Updates the active webhook mode and URLs.
    """
    try:
        updated = set_webhook_config(
            mode=req.mode,
            test_url=req.test_url,
            production_url=req.production_url
        )
        return {
            "success": True,
            "message": f"Webhook switched to {updated['mode'].upper()} mode successfully.",
            "config": updated
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update webhook config: {str(e)}")

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
            "production_url": webhook_cfg["production_url"]
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
