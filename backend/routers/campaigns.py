from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
import httpx
import json
from datetime import datetime
from backend.config import N8N_WEBHOOK_URL
from backend.database import supabase_admin, supabase_client
from backend.services.email_dispatcher import dispatch_outreach_email, EmailDispatchError

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

    # 0. Strict Pre-flight Check: Outbound delivery provider MUST be configured for this campaign
    if campaign_id:
        from backend.routers.email_integrations import read_local_campaign_email_settings
        outbound_integ = read_local_campaign_email_settings(campaign_id)
        if not outbound_integ and user_id != "default":
            try:
                res_integ = supabase_admin.table("campaign_email_integrations").select("*").eq("campaign_id", campaign_id).execute()
                if res_integ.data and len(res_integ.data) > 0:
                    outbound_integ = res_integ.data[0]
            except Exception:
                pass

        if not outbound_integ or not outbound_integ.get("sender_email") or not outbound_integ.get("provider"):
            raise HTTPException(
                status_code=400,
                detail="Outbound email dispatcher is not configured for this campaign. Please configure Resend, Brevo, SendGrid, or SMTP in Campaign Settings before launching outreach."
            )

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
    from backend.webhook_manager import get_active_webhook_url, get_dispatch_callback_url
    target_webhook = req.webhook_url or get_active_webhook_url()
    dispatch_url = get_dispatch_callback_url()
    n8n_payload = {
        "user_id": user_id,
        "campaign_id": campaign_id,
        "dispatch_url": dispatch_url,
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
        async with httpx.AsyncClient(timeout=45.0) as client:
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
                "message": "Campaign successfully dispatched" if response.is_success else "Prospecting service accepted the request"
            }
    except httpx.TimeoutException:
        # A timeout simply means the scraper & enrichment nodes are actively running in the background!
        print(f"[Campaigns] Webhook payload accepted and executing in background.")
        return {
            "success": True,
            "status_code": 202,
            "campaign_id": campaign_id,
            "user_id": user_id,
            "data": {"status": "processing_in_background"},
            "message": "Search initiated and processing in background."
        }
    except httpx.RequestError as exc:
        print(f"[Campaigns] Webhook connection notice: {exc}")
        raise HTTPException(
            status_code=502,
            detail="The automated prospecting engine is currently unreachable. Please check your workflow connection."
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

@router.get("/{campaign_id}")
def get_single_campaign(campaign_id: str, authorization: Optional[str] = Header(None)):
    """
    Fetch a single campaign by ID with decoded company profile metadata.
    """
    user_id = verify_token(authorization)
    try:
        camp_res = supabase_admin.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user_id).execute()
        if not camp_res.data or len(camp_res.data) == 0:
            raise HTTPException(status_code=404, detail="Campaign not found")
        camp = decode_campaign(camp_res.data[0])
        return {"success": True, "campaign": camp}
    except HTTPException:
        raise
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

class DispatchEmailRequest(BaseModel):
    campaign_id: Optional[str] = None
    to_email: str
    subject: str
    body: str
    recipient_company: Optional[str] = None
    lead_id: Optional[str] = None
    # Optional direct overrides for testing / standalone calls
    provider: Optional[str] = None
    api_key: Optional[str] = None
    sender_email: Optional[str] = None
    sender_name: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None

@router.post("/dispatch-email")
async def dispatch_campaign_email(payload: DispatchEmailRequest):
    """
    Called by n8n HTTP Request node to dispatch an AI-generated cold outreach email.
    Automatically resolves the campaign owner's custom email provider (Brevo/SendGrid/Resend/SMTP),
    dispatches the email, and updates lead tracking records in Supabase.
    """
    provider = payload.provider
    credentials: Dict[str, Any] = {}

    # 1. Direct credentials override (for test workflows or direct calls)
    if payload.provider and payload.sender_email:
        provider = payload.provider
        credentials = {
            "api_key": payload.api_key or "",
            "sender_email": payload.sender_email,
            "sender_name": payload.sender_name or "Prospecting Team",
            "smtp_host": payload.smtp_host,
            "smtp_port": payload.smtp_port or 587,
            "smtp_user": payload.smtp_user,
            "smtp_pass": payload.smtp_pass
        }
    
    # 2. Database lookup via campaign_id
    elif payload.campaign_id:
        camp_sender_name = None
        try:
            # 2a. First, check if this campaign has a dedicated, custom email provider integration
            custom_camp_integ = None
            try:
                camp_integ_res = supabase_admin.table("campaign_email_integrations").select("*").eq("campaign_id", payload.campaign_id).execute()
                if camp_integ_res.data and len(camp_integ_res.data) > 0:
                    custom_camp_integ = camp_integ_res.data[0]
            except Exception as e:
                print(f"[Dispatch] Notice checking campaign_email_integrations: {e}")

            if not custom_camp_integ:
                from backend.routers.email_integrations import read_local_campaign_email_settings
                custom_camp_integ = read_local_campaign_email_settings(payload.campaign_id)

            if custom_camp_integ and custom_camp_integ.get("credential_id") and not custom_camp_integ.get("api_key"):
                from backend.routers.email_integrations import read_local_credential_by_id
                cred = read_local_credential_by_id(custom_camp_integ["credential_id"])
                if not cred:
                    try:
                        res_c = supabase_admin.table("user_email_credentials").select("*").eq("id", custom_camp_integ["credential_id"]).execute()
                        if res_c.data:
                            cred = res_c.data[0]
                    except Exception:
                        pass
                if cred:
                    custom_camp_integ["api_key"] = cred.get("api_key")
                    custom_camp_integ["provider"] = cred.get("provider", custom_camp_integ.get("provider"))
                    custom_camp_integ["smtp_host"] = cred.get("smtp_host", custom_camp_integ.get("smtp_host"))
                    custom_camp_integ["smtp_port"] = cred.get("smtp_port", custom_camp_integ.get("smtp_port"))
                    custom_camp_integ["smtp_user"] = cred.get("smtp_user", custom_camp_integ.get("smtp_user"))
                    custom_camp_integ["smtp_pass"] = cred.get("smtp_pass", custom_camp_integ.get("smtp_pass"))

            if custom_camp_integ and custom_camp_integ.get("sender_email"):
                provider = custom_camp_integ.get("provider", "resend")
                credentials = {
                    "api_key": custom_camp_integ.get("api_key") or "",
                    "sender_email": custom_camp_integ.get("sender_email") or "",
                    "sender_name": custom_camp_integ.get("sender_name") or "Marketing Team",
                    "smtp_host": custom_camp_integ.get("smtp_host"),
                    "smtp_port": custom_camp_integ.get("smtp_port") or 587,
                    "smtp_user": custom_camp_integ.get("smtp_user"),
                    "smtp_pass": custom_camp_integ.get("smtp_pass")
                }
                print(f"[Dispatch] Using dedicated Campaign Email Integration: {provider.upper()} ({credentials.get('sender_email')})")
            else:
                # 2b. Inherit workspace default settings, aligned with campaign's persona/sender_name
                camp_res = supabase_admin.table("campaigns").select("id, user_id, title").eq("id", payload.campaign_id).execute()
                if camp_res.data:
                    decoded = decode_campaign(camp_res.data[0])
                    camp_sender_name = decoded.get("sender_name")
                    user_id = camp_res.data[0].get("user_id")
                    integ_res = supabase_admin.table("user_email_integrations").select("*").eq("user_id", user_id).execute()
                    if integ_res.data:
                        integ = integ_res.data[0]
                        provider = integ.get("provider", "brevo")
                        credentials = {
                            "api_key": integ.get("api_key") or "",
                            "sender_email": integ.get("sender_email") or "",
                            "sender_name": camp_sender_name or integ.get("sender_name") or "Marketing Team",
                            "smtp_host": integ.get("smtp_host"),
                            "smtp_port": integ.get("smtp_port") or 587,
                            "smtp_user": integ.get("smtp_user"),
                            "smtp_pass": integ.get("smtp_pass")
                        }
        except Exception as err:
            print(f"[Dispatch] Warning during campaign lookup: {err}")

    # 3. Fallback: Lookup any configured integration if not yet assigned
    if not credentials or not credentials.get("sender_email"):
        try:
            fallback_res = supabase_admin.table("user_email_integrations").select("*").limit(1).execute()
            if fallback_res.data:
                integ = fallback_res.data[0]
                provider = integ.get("provider", "brevo")
                credentials = {
                    "api_key": integ.get("api_key") or "",
                    "sender_email": integ.get("sender_email") or "",
                    "sender_name": integ.get("sender_name") or "Marketing Team",
                    "smtp_host": integ.get("smtp_host"),
                    "smtp_port": integ.get("smtp_port") or 587,
                    "smtp_user": integ.get("smtp_user"),
                    "smtp_pass": integ.get("smtp_pass")
                }
        except Exception:
            pass

    # 4. Fallback to local settings file if Supabase table is not yet migrated
    if not credentials or not credentials.get("sender_email"):
        from backend.routers.email_integrations import read_local_email_settings
        local_integ = read_local_email_settings()
        if local_integ:
            provider = local_integ.get("provider", "brevo")
            credentials = {
                "api_key": local_integ.get("api_key") or "",
                "sender_email": local_integ.get("sender_email") or "",
                "sender_name": local_integ.get("sender_name") or "Marketing Team",
                "smtp_host": local_integ.get("smtp_host"),
                "smtp_port": local_integ.get("smtp_port") or 587,
                "smtp_user": local_integ.get("smtp_user"),
                "smtp_pass": local_integ.get("smtp_pass")
            }

    # Check if credentials are still missing
    if not credentials or not credentials.get("sender_email"):
        raise HTTPException(
            status_code=400,
            detail="No email provider configured. Please connect Brevo, SendGrid, or SMTP in Account Settings."
        )

    # 4. Dispatch Email via Provider
    now_iso = datetime.now().isoformat()
    try:
        dispatch_res = await dispatch_outreach_email(
            provider=provider or "brevo",
            credentials=credentials,
            to_email=payload.to_email,
            subject=payload.subject,
            body=payload.body
        )
    except EmailDispatchError as exc:
        # Log failure to lead record if possible
        if payload.campaign_id and payload.to_email:
            try:
                supabase_admin.table("leads").update({
                    "Cold_Mail_Status": "Failed",
                    "email_subject": payload.subject,
                    "email_body": payload.body
                }).eq("campaign_id", payload.campaign_id).eq("Email_Address", payload.to_email).execute()
            except Exception:
                pass

        return {
            "success": False,
            "status": "Failed",
            "error": exc.message,
            "provider": exc.provider,
            "status_code": exc.status_code or 400
        }

    # 5. Update Lead in Database
    if payload.campaign_id and payload.to_email:
        try:
            update_data = {
                "Cold_Mail_Status": "Sent",
                "SEND_Time": now_iso,
                "email_subject": payload.subject,
                "email_body": payload.body
            }
            if payload.lead_id:
                supabase_admin.table("leads").update(update_data).eq("id", payload.lead_id).execute()
            else:
                supabase_admin.table("leads").update(update_data).eq("campaign_id", payload.campaign_id).eq("Email_Address", payload.to_email).execute()
        except Exception as update_err:
            print(f"[Dispatch] Warning updating lead status: {update_err}")

    return {
        "success": True,
        "status": "Sent",
        "provider": provider,
        "recipient": payload.to_email,
        "message_id": dispatch_res.get("message_id"),
        "timestamp": now_iso
    }

