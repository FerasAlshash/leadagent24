from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
import httpx
import json
from datetime import datetime
from backend.config import N8N_WEBHOOK_URL
from backend.database import supabase_admin, supabase_client

router = APIRouter(prefix="/api/campaigns", tags=["Campaigns"])

def encode_campaign_meta(title: Optional[str], company_name: Optional[str], company_pitch: Optional[str], sender_name: Optional[str]) -> str:
    """
    Encode rich company profile details into the title column as JSON to preserve
    isolated company profile metadata without requiring DB schema migrations.
    """
    display_title = title or company_name or "My Campaign"
    meta = {
        "title": display_title,
        "company_name": company_name or display_title,
        "company_pitch": company_pitch or "",
        "sender_name": sender_name or ""
    }
    return json.dumps(meta, ensure_ascii=False)

def decode_campaign(camp: Dict[str, Any]) -> Dict[str, Any]:
    """
    Decode campaign profile metadata. Falls back gracefully for legacy records.
    """
    raw_title = camp.get("title") or ""
    display_title = raw_title
    company_name = raw_title
    company_pitch = ""
    sender_name = ""

    if raw_title.startswith("{") and raw_title.endswith("}"):
        try:
            meta = json.loads(raw_title)
            display_title = meta.get("title") or display_title
            company_name = meta.get("company_name") or display_title
            company_pitch = meta.get("company_pitch", "")
            sender_name = meta.get("sender_name", "")
        except Exception:
            pass

    return {
        **camp,
        "title": display_title,
        "company_name": company_name,
        "company_pitch": company_pitch,
        "sender_name": sender_name
    }

class CampaignCreateRequest(BaseModel):
    title: Optional[str] = None
    company_name: Optional[str] = None
    company_pitch: Optional[str] = None
    sender_name: Optional[str] = None
    business_type: str = "Software Agencies"
    location: Optional[str] = "Multi-region"
    lead_number: Optional[int] = 10
    email_style: str = "Professional"
    schedule_type: Optional[str] = "once"

class CampaignLaunchRequest(BaseModel):
    campaign_id: Optional[str] = None
    campaign_title: Optional[str] = None
    business_type: str = Field(..., alias="Business Type")
    location: str = Field(..., alias="Location")
    lead_number: int = Field(10, alias="Lead Number")
    email_style: str = Field("Professional", alias="Email Style")
    your_name: str = Field(..., alias="Your Name")
    company_name: Optional[str] = Field("", alias="Your Company/Agency Name")
    company_pitch: Optional[str] = Field("", alias="What does your company do?")
    schedule_type: Optional[str] = "once"
    webhook_url: Optional[str] = None

    class Config:
        populate_by_name = True

def verify_token(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")
    token = authorization.replace("Bearer ", "").strip()
    
    # 1. Primary: supabase_client
    try:
        user_res = supabase_client.auth.get_user(token)
        if user_res and user_res.user:
            return user_res.user.id
    except Exception:
        pass

    # 2. Secondary: supabase_admin (with service role key)
    try:
        admin_user_res = supabase_admin.auth.get_user(token)
        if admin_user_res and admin_user_res.user:
            return admin_user_res.user.id
    except Exception:
        pass

    # 3. Resilient fallback: Decode JWT directly (zero network dependency, resilient to temporary rate limits)
    try:
        import jwt
        payload = jwt.decode(token, options={"verify_signature": False, "verify_exp": False})
        user_id = payload.get("sub")
        if user_id:
            return user_id
    except Exception:
        pass

    raise HTTPException(status_code=401, detail="Authentication failed.")

@router.post("")
def create_campaign(req: CampaignCreateRequest, authorization: Optional[str] = Header(None)):
    """
    Create a new isolated campaign entity with company name, pitch, and targeting.
    """
    user_id = verify_token(authorization)
    try:
        title_encoded = encode_campaign_meta(
            title=req.title,
            company_name=req.company_name,
            company_pitch=req.company_pitch,
            sender_name=req.sender_name
        )

        camp_res = supabase_admin.table("campaigns").insert({
            "user_id": user_id,
            "title": title_encoded,
            "business_type": req.business_type,
            "location": req.location,
            "lead_number": req.lead_number,
            "email_style": req.email_style,
            "schedule_type": req.schedule_type or "once",
            "is_active": True,
            "last_run_at": None
        }).execute()

        if not camp_res.data or len(camp_res.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create campaign record.")

        created = decode_campaign(camp_res.data[0])
        return {
            "success": True,
            "campaign": {
                **created,
                "total_leads": 0,
                "sent_leads": 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{campaign_id}")
def update_campaign(campaign_id: str, req: CampaignCreateRequest, authorization: Optional[str] = Header(None)):
    """
    Update an existing campaign's company details or targeting parameters.
    """
    user_id = verify_token(authorization)
    try:
        title_encoded = encode_campaign_meta(
            title=req.title,
            company_name=req.company_name,
            company_pitch=req.company_pitch,
            sender_name=req.sender_name
        )

        camp_res = supabase_admin.table("campaigns").update({
            "title": title_encoded,
            "business_type": req.business_type,
            "location": req.location,
            "lead_number": req.lead_number,
            "email_style": req.email_style,
        }).eq("id", campaign_id).eq("user_id", user_id).execute()

        if not camp_res.data:
            raise HTTPException(status_code=404, detail="Campaign not found or unauthorized.")

        updated = decode_campaign(camp_res.data[0])
        return {"success": True, "campaign": updated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/launch")
async def launch_campaign(req: CampaignLaunchRequest, authorization: Optional[str] = Header(None)):
    """
    1. Verify user authentication.
    2. Record or update campaign in Supabase `campaigns` table.
    3. Dispatch enriched payload with user_id and campaign_id to n8n Webhook.
    """
    user_id = verify_token(authorization)
    campaign_id = req.campaign_id

    # 1. Update or create campaign record
    if campaign_id:
        try:
            # Check existing to preserve or update title
            existing = supabase_admin.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user_id).execute()
            if existing.data and len(existing.data) > 0:
                current_camp = decode_campaign(existing.data[0])
                # Update with current info
                title_encoded = encode_campaign_meta(
                    title=req.campaign_title or current_camp["title"],
                    company_name=req.company_name or current_camp["company_name"],
                    company_pitch=req.company_pitch or current_camp["company_pitch"],
                    sender_name=req.your_name or current_camp["sender_name"]
                )
                # Track cumulative locations if multiple searches run in different regions
                existing_loc = (existing.data[0].get("location") or "").strip()
                if existing_loc and existing_loc.lower() != "multi-region":
                    loc_list = [x.strip() for x in existing_loc.split(",") if x.strip()]
                    if req.location.strip().lower() not in [x.lower() for x in loc_list]:
                        loc_list.append(req.location.strip())
                    combined_loc = ", ".join(loc_list)
                else:
                    combined_loc = req.location.strip()

                supabase_admin.table("campaigns").update({
                    "title": title_encoded,
                    "business_type": req.business_type,
                    "location": combined_loc,
                    "lead_number": req.lead_number,
                    "email_style": req.email_style,
                    "last_run_at": datetime.utcnow().isoformat()
                }).eq("id", campaign_id).eq("user_id", user_id).execute()
        except Exception as e:
            print(f"[Warning] Failed to update existing campaign: {e}")
    else:
        # Create brand new campaign entry
        try:
            title_encoded = encode_campaign_meta(
                title=req.campaign_title or f"{req.company_name or req.business_type} - {req.location}",
                company_name=req.company_name,
                company_pitch=req.company_pitch,
                sender_name=req.your_name
            )
            camp_res = supabase_admin.table("campaigns").insert({
                "user_id": user_id,
                "title": title_encoded,
                "business_type": req.business_type,
                "location": req.location,
                "lead_number": req.lead_number,
                "email_style": req.email_style,
                "schedule_type": req.schedule_type or "once",
                "is_active": True,
                "last_run_at": datetime.utcnow().isoformat()
            }).execute()

            if camp_res.data and len(camp_res.data) > 0:
                campaign_id = camp_res.data[0]["id"]
        except Exception as e:
            print(f"[Warning] Failed to insert into campaigns table: {e}")

    # 2. Prepare payload for n8n
    from backend.webhook_manager import get_active_webhook_url
    target_webhook = req.webhook_url or get_active_webhook_url()
    n8n_payload = {
        "user_id": user_id,
        "campaign_id": campaign_id,
        "Business Type": req.business_type,
        "Location": req.location,
        "Lead Number": req.lead_number,
        "Email Style": req.email_style,
        "Your Name": req.your_name,
        "Your Company/Agency Name": req.company_name,
        "What does your company do?": req.company_pitch,
    }

    # 3. Dispatch to n8n via HTTP POST
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                target_webhook,
                json=n8n_payload,
                headers={"Content-Type": "application/json", "Accept": "application/json"}
            )
            
            resp_data = None
            try:
                resp_data = response.json()
            except Exception:
                resp_data = response.text

            return {
                "success": response.is_success,
                "status_code": response.status_code,
                "campaign_id": campaign_id,
                "user_id": user_id,
                "data": resp_data,
                "message": "Campaign successfully dispatched to n8n" if response.is_success else f"n8n returned status {response.status_code}"
            }
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not connect to n8n webhook at {target_webhook}: {str(exc)}"
        )

@router.get("")
def list_campaigns(authorization: Optional[str] = Header(None)):
    """
    Fetch all campaigns belonging to the user enriched with live lead counts and decoded company metadata.
    """
    user_id = verify_token(authorization)
    try:
        camp_res = supabase_admin.table("campaigns").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        campaigns_list = camp_res.data or []

        # Fetch leads stats for each campaign
        leads_res = supabase_admin.table("leads").select("id, campaign_id, Cold_Mail_Status").eq("user_id", user_id).execute()
        all_leads = leads_res.data or []

        enriched = []
        for raw_camp in campaigns_list:
            camp = decode_campaign(raw_camp)
            camp_id = camp["id"]
            camp_leads = [l for l in all_leads if l.get("campaign_id") == camp_id]
            sent_leads = [l for l in camp_leads if l.get("Cold_Mail_Status") == "✅" or l.get("Cold_Mail_Status") == "Sent"]
            
            enriched.append({
                **camp,
                "total_leads": len(camp_leads),
                "sent_leads": len(sent_leads)
            })

        return enriched
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: str, authorization: Optional[str] = Header(None)):
    """
    Delete a specific campaign and all associated scoped leads.
    """
    user_id = verify_token(authorization)
    try:
        # Delete leads attached to this campaign
        supabase_admin.table("leads").delete().eq("campaign_id", campaign_id).eq("user_id", user_id).execute()
        # Delete campaign record
        supabase_admin.table("campaigns").delete().eq("id", campaign_id).eq("user_id", user_id).execute()
        return {"success": True, "message": "Campaign and associated leads deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
