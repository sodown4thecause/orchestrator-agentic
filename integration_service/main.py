from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import Any, Dict, List
from urllib.parse import urlencode
import os

API_KEY = "orchestra-secret-key"
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# Example OAuth config (replace with real values or env vars)
OAUTH_CONFIG = {
    "slack": {
        "client_id": os.getenv("SLACK_CLIENT_ID", "your-slack-client-id"),
        "client_secret": os.getenv("SLACK_CLIENT_SECRET", "your-slack-client-secret"),
        "auth_url": "https://slack.com/oauth/v2/authorize",
        "token_url": "https://slack.com/api/oauth.v2.access",
        "scopes": ["chat:write", "channels:read"],
        "redirect_uri": os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8004/v1/integrations/oauth/callback")
    },
    "salesforce": {
        "client_id": os.getenv("SALESFORCE_CLIENT_ID", "your-salesforce-client-id"),
        "client_secret": os.getenv("SALESFORCE_CLIENT_SECRET", "your-salesforce-client-secret"),
        "auth_url": "https://login.salesforce.com/services/oauth2/authorize",
        "token_url": "https://login.salesforce.com/services/oauth2/token",
        "scopes": ["api", "refresh_token"],
        "redirect_uri": os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8004/v1/integrations/oauth/callback")
    },
    "notion": {
        "client_id": os.getenv("NOTION_CLIENT_ID", "your-notion-client-id"),
        "client_secret": os.getenv("NOTION_CLIENT_SECRET", "your-notion-client-secret"),
        "auth_url": "https://api.notion.com/v1/oauth/authorize",
        "token_url": "https://api.notion.com/v1/oauth/token",
        "scopes": ["database.read", "database.write", "users.read"],
        "redirect_uri": os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8004/v1/integrations/oauth/callback")
    },
    "discord": {
        "client_id": os.getenv("DISCORD_CLIENT_ID", "your-discord-client-id"),
        "client_secret": os.getenv("DISCORD_CLIENT_SECRET", "your-discord-client-secret"),
        "auth_url": "https://discord.com/api/oauth2/authorize",
        "token_url": "https://discord.com/api/oauth2/token",
        "scopes": ["identify", "guilds", "messages.read"],
        "redirect_uri": os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8004/v1/integrations/oauth/callback")
    },
    "google": {
        "client_id": os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET", "your-google-client-secret"),
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "scopes": ["openid", "email", "profile", "https://www.googleapis.com/auth/drive"],
        "redirect_uri": os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8004/v1/integrations/oauth/callback")
    },
    "twitter": {
        "client_id": os.getenv("TWITTER_CLIENT_ID", "your-twitter-client-id"),
        "client_secret": os.getenv("TWITTER_CLIENT_SECRET", "your-twitter-client-secret"),
        "auth_url": "https://twitter.com/i/oauth2/authorize",
        "token_url": "https://api.twitter.com/2/oauth2/token",
        "scopes": ["tweet.read", "users.read", "offline.access"],
        "redirect_uri": os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8004/v1/integrations/oauth/callback")
    }
}

def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing API key")
    return api_key

app = FastAPI(title="Orchestra Integration Service")

class ToolInfo(BaseModel):
    name: str
    description: str
    schema: Dict[str, Any]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/v1/tools")
def list_tools(api_key: str = Depends(get_api_key)):
    # Stub: Return available tools
    return {"tools": [
        {"name": "slack_tool", "description": "Send messages to Slack", "schema": {}}
    ]}

@app.post("/v1/integrations/oauth/start")
def start_oauth(service_name: str, api_key: str = Depends(get_api_key)):
    # Build provider auth URL
    config = OAUTH_CONFIG.get(service_name)
    if not config:
        raise HTTPException(status_code=400, detail="Unknown service")
    params = {
        "client_id": config["client_id"],
        "scope": " ".join(config["scopes"]),
        "redirect_uri": config["redirect_uri"],
        "response_type": "code",
        "state": "orchestra-state"  # In production, use a secure random state
    }
    url = f"{config['auth_url']}?{urlencode(params)}"
    return {"redirect_url": url}

@app.get("/v1/integrations/oauth/callback")
def oauth_callback(service_name: str, code: str, state: str, request: Request):
    # Exchange code for token (stub)
    # In production, use requests-oauthlib or authlib to POST to token_url
    # Store tokens securely (e.g., in PostgreSQL or a secrets manager)
    # Example: return {"access_token": "...", "refresh_token": "..."}
