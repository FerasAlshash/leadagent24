from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from backend.database import supabase_admin, supabase_client

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class AuthRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[str] = None
    email: Optional[str] = None
    access_token: Optional[str] = None

def _find_user_by_email(email: str):
    try:
        users = supabase_admin.auth.admin.list_users()
        for u in users:
            if u.email and u.email.lower() == email.lower():
                return u
    except Exception as e:
        print(f"Error listing users: {e}")
    return None

@router.post("/signup", response_model=AuthResponse)
def signup(req: AuthRequest):
    """
    Create a new SaaS account.
    Uses admin create_user with email_confirm=True so no email verification message or friction occurs.
    If the account was already created but unconfirmed, it auto-confirms it and updates the password.
    """
    try:
        # 1. Check if user already exists
        existing_user = _find_user_by_email(req.email)
        if existing_user:
            # Auto-confirm and update password
            supabase_admin.auth.admin.update_user_by_id(
                existing_user.id,
                {"email_confirm": True, "password": req.password}
            )
            login_res = supabase_client.auth.sign_in_with_password({
                "email": req.email,
                "password": req.password
            })
            return AuthResponse(
                success=True,
                message="Account verified and signed in successfully",
                user_id=existing_user.id,
                email=existing_user.email,
                access_token=login_res.session.access_token if login_res.session else None
            )

        # 2. Create brand new user with pre-confirmed email via Supabase Admin
        user_res = supabase_admin.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True
        })
        
        user = user_res.user
        
        # 3. Immediately sign in to generate a session JWT
        login_res = supabase_client.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })

        return AuthResponse(
            success=True,
            message="Account created and signed in successfully",
            user_id=user.id,
            email=user.email,
            access_token=login_res.session.access_token if login_res.session else None
        )
    except Exception as e:
        err_msg = str(e)
        raise HTTPException(status_code=400, detail=err_msg)

@router.post("/login", response_model=AuthResponse)
def login(req: AuthRequest):
    """
    Authenticate user and return session token.
    If email is unconfirmed, auto-confirms via admin and signs in.
    """
    try:
        res = supabase_client.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })
        return AuthResponse(
            success=True,
            message="Signed in successfully",
            user_id=res.user.id,
            email=res.user.email,
            access_token=res.session.access_token
        )
    except Exception as e:
        err_msg = str(e)
        if "email not confirmed" in err_msg.lower():
            # Auto-confirm with admin and retry
            try:
                user = _find_user_by_email(req.email)
                if user:
                    supabase_admin.auth.admin.update_user_by_id(user.id, {"email_confirm": True})
                    res = supabase_client.auth.sign_in_with_password({
                        "email": req.email,
                        "password": req.password
                    })
                    return AuthResponse(
                        success=True,
                        message="Email auto-confirmed and signed in successfully",
                        user_id=res.user.id,
                        email=res.user.email,
                        access_token=res.session.access_token
                    )
            except Exception as inner_e:
                print(f"Auto-confirm retry error: {inner_e}")

        raise HTTPException(status_code=401, detail="Invalid email or password.")

@router.post("/confirm-and-login", response_model=AuthResponse)
def confirm_and_login(req: AuthRequest):
    """
    Explicit helper endpoint to confirm an existing unconfirmed user and sign them in.
    """
    try:
        user = _find_user_by_email(req.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        supabase_admin.auth.admin.update_user_by_id(
            user.id,
            {"email_confirm": True, "password": req.password}
        )
        res = supabase_client.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })
        return AuthResponse(
            success=True,
            message="Account confirmed and signed in successfully",
            user_id=res.user.id,
            email=res.user.email,
            access_token=res.session.access_token
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Verify current JWT token and return user profile.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header.")
    
    token = authorization.replace("Bearer ", "").strip()
    try:
        user_res = supabase_client.auth.get_user(token)
        if not user_res or not user_res.user:
            raise HTTPException(status_code=401, detail="Invalid session token.")
        
        return {
            "authenticated": True,
            "user_id": user_res.user.id,
            "email": user_res.user.email,
            "role": user_res.user.role
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")
