from fastapi import FastAPI, Request, HTTPException, status, Depends
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import Any, Dict

API_KEY = "orchestra-secret-key"  # In production, use env var or secret manager
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

app = FastAPI(title="Orchestra API Gateway")

# Authentication dependency
def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing API key")
    return api_key

@app.get("/health")
def health():
    return {"status": "ok"}

# Proxy endpoint example (stub)
@app.api_route("/v1/{path:path}", methods=["GET", "POST"])
async def proxy(path: str, request: Request, api_key: str = Depends(get_api_key)):
    # In production, forward to correct service based on path
    return {"message": f"Proxy for /v1/{path}", "method": request.method}
