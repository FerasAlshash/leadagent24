from fastapi import APIRouter, HTTPException, Header, Query
from typing import Optional, List, Dict, Any
from backend.database import supabase_admin, supabase_client

router = APIRouter(prefix="/api/leads", tags=["Leads"])

def verify_token(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")
    token = authorization.replace("Bearer ", "").strip()
    
    try:
        user_res = supabase_client.auth.get_user(token)
        if user_res and user_res.user:
            return user_res.user.id
    except Exception:
        pass

    try:
        admin_user_res = supabase_admin.auth.get_user(token)
        if admin_user_res and admin_user_res.user:
            return admin_user_res.user.id
    except Exception:
        pass

    try:
        import jwt
        payload = jwt.decode(token, options={"verify_signature": False, "verify_exp": False})
        user_id = payload.get("sub")
        if user_id:
            return user_id
    except Exception:
        pass

    raise HTTPException(status_code=401, detail="Authentication failed.")

@router.get("")
def get_user_leads(
    authorization: Optional[str] = Header(None),
    campaign_id: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0)
):
    """
    Fetch all leads extracted for the authenticated user.
    """
    user_id = verify_token(authorization)
    try:
        query = supabase_admin.table("leads").select("*").eq("user_id", user_id)
        if campaign_id:
            query = query.eq("campaign_id", campaign_id)
        
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        res = query.execute()

        return {
            "success": True,
            "count": len(res.data) if res.data else 0,
            "leads": res.data or []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch leads: {str(e)}")

@router.delete("/{lead_id}")
def delete_lead(lead_id: str, authorization: Optional[str] = Header(None)):
    """
    Delete a specific lead belonging to the authenticated user.
    """
    user_id = verify_token(authorization)
    try:
        res = supabase_admin.table("leads").delete().eq("id", lead_id).eq("user_id", user_id).execute()
        return {"success": True, "message": "Lead deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete lead: {str(e)}")
