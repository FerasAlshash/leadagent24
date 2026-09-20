import os
import json
import re
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
from datetime import datetime, timezone

SETTINGS_PATH = Path(__file__).resolve().parent / "webhook_settings.json"
ENV_PATH = Path(__file__).resolve().parent / ".env"

DEFAULT_TEST_URL = "https://n8n.inexlify.com/webhook-test/lead-machine"
DEFAULT_PROD_URL = "https://n8n.inexlify.com/webhook/lead-machine"
DEFAULT_DISPATCH_URL = "https://lead.inexlify.com/api/campaigns/dispatch-email"

def _sync_to_env_file(active_url: str):
    """Safely updates N8N_WEBHOOK_URL in backend/.env if the file exists."""
    if not ENV_PATH.exists():
        return
    try:
        content = ENV_PATH.read_text(encoding="utf-8")
        if re.search(r"^N8N_WEBHOOK_URL=.*$", content, flags=re.MULTILINE):
            new_content = re.sub(
                r"^N8N_WEBHOOK_URL=.*$",
                f"N8N_WEBHOOK_URL={active_url}",
                content,
                flags=re.MULTILINE
            )
        else:
            new_content = content + f"\nN8N_WEBHOOK_URL={active_url}\n"
        ENV_PATH.write_text(new_content, encoding="utf-8")
    except Exception as e:
        print(f"[Warning] Failed to sync webhook to .env: {e}")

def _load_access_control_from_supabase() -> Tuple[Optional[bool], Optional[List[Dict[str, Any]]]]:
    """
    Attempts to fetch restricted_prospecting and authorized_prospecting_emails from Supabase.
    Returns (restricted_bool, emails_list) or (None, None) if tables do not exist.
    """
    try:
        from backend.database import supabase_admin

        restricted = None
        # 1. Fetch restriction toggle from system_settings
        try:
            res_setting = supabase_admin.table("system_settings").select("value").eq("key", "prospecting_access_control").execute()
            if res_setting.data and len(res_setting.data) > 0:
                val = res_setting.data[0].get("value")
                if isinstance(val, dict):
                    restricted = bool(val.get("restricted", True))
                elif isinstance(val, bool):
                    restricted = val
        except Exception:
            pass

        # 2. Fetch authorized emails list from authorized_prospecting_users
        emails = []
        try:
            res_users = supabase_admin.table("authorized_prospecting_users").select("email, granted_at").execute()
            if res_users.data is not None:
                for row in res_users.data:
                    em = row.get("email")
                    if em and "@" in em:
                        emails.append({
                            "email": em.strip().lower(),
                            "granted_at": row.get("granted_at")
                        })
        except Exception:
            pass

        if restricted is not None or emails:
            return restricted, emails
        return None, None
    except Exception:
        return None, None

def _sync_access_control_to_supabase(restricted: bool, emails: List[Dict[str, Any]]):
    """
    Safely synchronizes restriction setting and authorized emails to Supabase tables.
    If tables do not exist yet, skips gracefully without crashing.
    """
    try:
        from backend.database import supabase_admin

        # 1. Sync system_settings
        try:
            supabase_admin.table("system_settings").upsert({
                "key": "prospecting_access_control",
                "value": {"restricted": bool(restricted)},
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).execute()
        except Exception:
            pass

        # 2. Sync authorized_prospecting_users
        try:
            target_emails = set()
            for item in emails:
                em = item.get("email") if isinstance(item, dict) else item
                if em and isinstance(em, str) and "@" in em:
                    em_clean = em.strip().lower()
                    target_emails.add(em_clean)
                    gr_at = item.get("granted_at") if isinstance(item, dict) else None
                    supabase_admin.table("authorized_prospecting_users").upsert({
                        "email": em_clean,
                        "granted_at": gr_at or datetime.now(timezone.utc).isoformat(),
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }, on_conflict="email").execute()

            # Clean up emails from DB that were revoked/removed
            current_db = supabase_admin.table("authorized_prospecting_users").select("email").execute()
            if current_db.data:
                for row in current_db.data:
                    db_email = (row.get("email") or "").strip().lower()
                    if db_email and db_email not in target_emails:
                        supabase_admin.table("authorized_prospecting_users").delete().eq("email", db_email).execute()
        except Exception:
            pass
    except Exception:
        pass

def get_webhook_config() -> Dict[str, Any]:
    """
    Returns the current webhook configuration:
    mode ('test' | 'production'), test_url, production_url, active_url, and dispatch_callback_url.
    Prioritizes Supabase cloud database for access control, with resilient fallback to local JSON.
    """
    local_data = {}
    if SETTINGS_PATH.exists():
        try:
            local_data = json.loads(SETTINGS_PATH.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"[Warning] Failed to read webhook settings: {e}")

    mode = local_data.get("mode", "test").lower()
    if mode not in ["test", "production"]:
        mode = "test"

    test_url = local_data.get("test_url", DEFAULT_TEST_URL).strip()
    production_url = local_data.get("production_url", DEFAULT_PROD_URL).strip()
    dispatch_callback_url = local_data.get("dispatch_callback_url", DEFAULT_DISPATCH_URL).strip()
    active_url = production_url if mode == "production" else test_url

    # Check Supabase first for access control
    db_restricted, db_emails = _load_access_control_from_supabase()

    if db_restricted is not None:
        restricted_prospecting = db_restricted
    else:
        restricted_prospecting = bool(local_data.get("restricted_prospecting", False))

    if db_emails is not None:
        authorized_prospecting_emails = db_emails
    else:
        raw_authorized = local_data.get("authorized_prospecting_emails", [])
        authorized_prospecting_emails = []
        for item in (raw_authorized if isinstance(raw_authorized, list) else []):
            if isinstance(item, dict) and item.get("email"):
                authorized_prospecting_emails.append({
                    "email": item["email"].strip().lower(),
                    "granted_at": item.get("granted_at")
                })
            elif isinstance(item, str) and "@" in item:
                authorized_prospecting_emails.append({
                    "email": item.strip().lower(),
                    "granted_at": None
                })

    return {
        "mode": mode,
        "test_url": test_url,
        "production_url": production_url,
        "active_url": active_url,
        "dispatch_callback_url": dispatch_callback_url,
        "restricted_prospecting": restricted_prospecting,
        "authorized_prospecting_emails": authorized_prospecting_emails
    }

def get_active_webhook_url() -> str:
    """Returns the currently active webhook URL based on selected mode."""
    return get_webhook_config()["active_url"]

def get_dispatch_callback_url() -> str:
    """Returns the callback dispatch URL injected into n8n payload."""
    return get_webhook_config().get("dispatch_callback_url", DEFAULT_DISPATCH_URL)

def set_webhook_config(
    mode: str, 
    test_url: str, 
    production_url: str, 
    dispatch_callback_url: str = None,
    restricted_prospecting: bool = None,
    authorized_prospecting_emails: list = None
) -> Dict[str, Any]:
    """
    Updates the webhook configuration, saves to JSON, updates runtime config,
    synchronizes to Supabase cloud database, and syncs to backend/.env.
    """
    current = get_webhook_config()

    mode = mode.lower().strip()
    if mode not in ["test", "production"]:
        raise ValueError("Mode must be either 'test' or 'production'")

    test_url = test_url.strip()
    production_url = production_url.strip()

    if not (test_url.startswith("http://") or test_url.startswith("https://")):
        raise ValueError("Test webhook URL must start with http:// or https://")

    if not (production_url.startswith("http://") or production_url.startswith("https://")):
        raise ValueError("Production webhook URL must start with http:// or https://")

    if dispatch_callback_url:
        dispatch_callback_url = dispatch_callback_url.strip()
        if not (dispatch_callback_url.startswith("http://") or dispatch_callback_url.startswith("https://")):
            raise ValueError("Dispatch Callback URL must start with http:// or https://")
    else:
        dispatch_callback_url = current.get("dispatch_callback_url", DEFAULT_DISPATCH_URL)

    active_url = production_url if mode == "production" else test_url

    # Preserve or update access control settings
    if restricted_prospecting is None:
        restricted_prospecting = current.get("restricted_prospecting", False)
    if authorized_prospecting_emails is None:
        authorized_prospecting_emails = current.get("authorized_prospecting_emails", [])

    # Clean and structure authorized emails with granted_at timestamp
    clean_items = []
    seen_emails = set()
    for item in authorized_prospecting_emails:
        em = None
        gr_at = None
        if isinstance(item, dict):
            em = item.get("email")
            gr_at = item.get("granted_at")
        elif isinstance(item, str):
            em = item
            gr_at = datetime.now(timezone.utc).isoformat()

        if em and isinstance(em, str) and "@" in em:
            email_clean = em.strip().lower()
            if email_clean not in seen_emails:
                seen_emails.add(email_clean)
                clean_items.append({
                    "email": email_clean,
                    "granted_at": gr_at or datetime.now(timezone.utc).isoformat()
                })

    config = {
        "mode": mode,
        "test_url": test_url,
        "production_url": production_url,
        "active_url": active_url,
        "dispatch_callback_url": dispatch_callback_url,
        "restricted_prospecting": bool(restricted_prospecting),
        "authorized_prospecting_emails": clean_items
    }

    # 1. Save local JSON backup
    try:
        SETTINGS_PATH.write_text(json.dumps(config, indent=2), encoding="utf-8")
    except Exception as e:
        print(f"[Warning] Failed to write webhook_settings.json: {e}")

    # 2. Sync to Supabase cloud database
    _sync_access_control_to_supabase(
        restricted=bool(restricted_prospecting),
        emails=clean_items
    )

    # 3. Update environment variable in memory
    os.environ["N8N_WEBHOOK_URL"] = active_url
    os.environ["DISPATCH_CALLBACK_URL"] = dispatch_callback_url

    # 4. Update backend.config module variable if loaded
    try:
        import backend.config as backend_config
        backend_config.N8N_WEBHOOK_URL = active_url
    except Exception:
        pass

    # 5. Sync to backend/.env file
    _sync_to_env_file(active_url)

    return config

def is_prospecting_authorized(user_email: str = None) -> bool:
    """
    Checks if a caller is authorized to run live prospecting.
    - Primary: Supabase cloud tables (system_settings & authorized_prospecting_users).
    - Fallback: Local JSON configuration.
    """
    if not user_email:
        return False

    em_clean = user_email.strip().lower()

    # System Admin always permitted
    if em_clean in ["ferasalshash@gmail.com"]:
        return True

    # 1. Attempt verification via Supabase cloud database
    try:
        from backend.database import supabase_admin
        
        res_setting = supabase_admin.table("system_settings").select("value").eq("key", "prospecting_access_control").execute()
        if res_setting.data and len(res_setting.data) > 0:
            val = res_setting.data[0].get("value")
            is_restricted = val.get("restricted", True) if isinstance(val, dict) else bool(val)
            if not is_restricted:
                return True
            
            # If restricted mode is ON, check authorized_prospecting_users
            res_user = supabase_admin.table("authorized_prospecting_users").select("id").ilike("email", em_clean).execute()
            if res_user.data and len(res_user.data) > 0:
                return True
            return False
    except Exception:
        pass

    # 2. Resilient fallback to local configuration
    cfg = get_webhook_config()
    if not cfg.get("restricted_prospecting", False):
        return True

    for item in cfg.get("authorized_prospecting_emails", []):
        if isinstance(item, dict) and item.get("email", "").strip().lower() == em_clean:
            return True
        elif isinstance(item, str) and item.strip().lower() == em_clean:
            return True

    return False
