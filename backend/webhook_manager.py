import os
import json
import re
from pathlib import Path
from typing import Dict, Any

SETTINGS_PATH = Path(__file__).resolve().parent / "webhook_settings.json"
ENV_PATH = Path(__file__).resolve().parent / ".env"

DEFAULT_TEST_URL = "https://n8n.inexlify.com/webhook-test/lead-machine"
DEFAULT_PROD_URL = "https://n8n.inexlify.com/webhook/lead-machine"

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

def get_webhook_config() -> Dict[str, Any]:
    """
    Returns the current webhook configuration:
    mode ('test' | 'production'), test_url, production_url, and active_url.
    """
    if SETTINGS_PATH.exists():
        try:
            data = json.loads(SETTINGS_PATH.read_text(encoding="utf-8"))
            mode = data.get("mode", "test").lower()
            if mode not in ["test", "production"]:
                mode = "test"
            test_url = data.get("test_url", DEFAULT_TEST_URL).strip()
            production_url = data.get("production_url", DEFAULT_PROD_URL).strip()
            active_url = production_url if mode == "production" else test_url
            return {
                "mode": mode,
                "test_url": test_url,
                "production_url": production_url,
                "active_url": active_url
            }
        except Exception as e:
            print(f"[Warning] Failed to read webhook settings: {e}")

    # Fallback to environment variable or defaults
    env_url = os.getenv("N8N_WEBHOOK_URL", DEFAULT_TEST_URL).strip()
    is_test = "webhook-test" in env_url or "/test" in env_url
    mode = "test" if is_test else "production"
    
    if is_test:
        test_url = env_url
        production_url = env_url.replace("webhook-test", "webhook")
    else:
        production_url = env_url
        test_url = env_url.replace("webhook", "webhook-test") if "webhook" in env_url else DEFAULT_TEST_URL

    active_url = production_url if mode == "production" else test_url
    
    # Save initial file so it is permanently tracked
    config = {
        "mode": mode,
        "test_url": test_url,
        "production_url": production_url,
        "active_url": active_url
    }
    try:
        SETTINGS_PATH.write_text(json.dumps(config, indent=2), encoding="utf-8")
    except Exception:
        pass

    return config

def get_active_webhook_url() -> str:
    """Returns the currently active webhook URL based on selected mode."""
    return get_webhook_config()["active_url"]

def set_webhook_config(mode: str, test_url: str, production_url: str) -> Dict[str, Any]:
    """
    Updates the webhook configuration, saves to JSON, updates runtime config,
    and synchronizes to backend/.env.
    """
    mode = mode.lower().strip()
    if mode not in ["test", "production"]:
        raise ValueError("Mode must be either 'test' or 'production'")

    test_url = test_url.strip()
    production_url = production_url.strip()

    if not (test_url.startswith("http://") or test_url.startswith("https://")):
        raise ValueError("Test webhook URL must start with http:// or https://")

    if not (production_url.startswith("http://") or production_url.startswith("https://")):
        raise ValueError("Production webhook URL must start with http:// or https://")

    active_url = production_url if mode == "production" else test_url

    config = {
        "mode": mode,
        "test_url": test_url,
        "production_url": production_url,
        "active_url": active_url
    }

    # 1. Save JSON
    SETTINGS_PATH.write_text(json.dumps(config, indent=2), encoding="utf-8")

    # 2. Update environment variable in memory
    os.environ["N8N_WEBHOOK_URL"] = active_url

    # 3. Update backend.config module variable if loaded
    try:
        import backend.config as backend_config
        backend_config.N8N_WEBHOOK_URL = active_url
    except Exception:
        pass

    # 4. Sync to backend/.env file
    _sync_to_env_file(active_url)

    return config
