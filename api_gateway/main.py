from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Dict, List, Optional
import httpx
import os
from datetime import datetime
import json

# Initialize FastAPI
app = FastAPI(title="API Gateway", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Service URLs
SERVICE_URLS = {
    "backend": os.getenv("BACKEND_URL", "http://localhost:8000"),
    "workflow-engine": os.getenv("WORKFLOW_ENGINE_URL", "http://localhost:8001"),
    "integration-service": os.getenv("INTEGRATION_SERVICE_URL", "http://localhost:8002"),
    "mcp-service": os.getenv("MCP_SERVICE_URL", "http://localhost:8003"),
    "ai-service": os.getenv("AI_SERVICE_URL", "http://localhost:8004"),
}

# Authentication
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In production, verify JWT token
    return credentials.credentials

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "api-gateway"}

@app.get("/v1/services/health")
async def check_all_services():
    """Check health of all services."""
    
    health_status = {}
    
    async with httpx.AsyncClient() as client:
        for service_name, service_url in SERVICE_URLS.items():
            try:
                response = await client.get(f"{service_url}/health", timeout=5.0)
                health_status[service_name] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "response_time": response.elapsed.total_seconds()
                }
            except Exception as e:
                health_status[service_name] = {
                    "status": "unreachable",
                    "error": str(e)
                }
    
    return {"services": health_status}

# Proxy endpoints
@app.api_route("/v1/workflows/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_workflows(request: Request, path: str):
    """Proxy workflow requests to workflow engine."""
    
    async with httpx.AsyncClient() as client:
        url = f"{SERVICE_URLS['workflow-engine']}/v1/workflows/{path}"
        
        # Forward request
        response = await client.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers.items() if k.lower() != "host"},
            params=request.query_params,
            json=await request.json() if request.method in ["POST", "PUT"] else None
        )
        
        return response.json()

@app.api_route("/v1/integrations/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_integrations(request: Request, path: str):
    """Proxy integration requests to integration service."""
    
    async with httpx.AsyncClient() as client:
        url = f"{SERVICE_URLS['integration-service']}/v1/integrations/{path}"
        
        response = await client.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers.items() if k.lower() != "host"},
            params=request.query_params,
            json=await request.json() if request.method in ["POST", "PUT"] else None
        )
        
        return response.json()

@app.api_route("/v1/mcp/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_mcp(request: Request, path: str):
    """Proxy MCP requests to MCP service."""
    
    async with httpx.AsyncClient() as client:
        url = f"{SERVICE_URLS['mcp-service']}/v1/mcp/{path}"
        
        response = await client.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers.items() if k.lower() != "host"},
            params=request.query_params,
            json=await request.json() if request.method in ["POST", "PUT"] else None
        )
        
        return response.json()

@app.api_route("/v1/ai/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_ai(request: Request, path: str):
    """Proxy AI requests to AI service."""
    
    async with httpx.AsyncClient() as client:
        url = f"{SERVICE_URLS['ai-service']}/v1/ai/{path}"
        
        response = await client.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers.items() if k.lower() != "host"},
            params=request.query_params,
            json=await request.json() if request.method in ["POST", "PUT"] else None
        )
        
        return response.json()

# Unified workflow creation endpoint
@app.post("/v1/workflows/create-from-natural-language")
async def create_workflow_from_natural_language(request: Request):
    """Create a workflow from natural language using AI service."""
    
    async with httpx.AsyncClient() as client:
        # First, parse the intent
        intent_response = await client.post(
            f"{SERVICE_URLS['ai-service']}/v1/parse-intent",
            json=await request.json()
        )
        
        if intent_response.status_code != 200:
            raise HTTPException(status_code=intent_response.status_code, detail=intent_response.text)
        
        intent = intent_response.json()
        
        # Then generate the workflow
        workflow_response = await client.post(
            f"{SERVICE_URLS['ai-service']}/v1/generate-workflow",
            json={
                "description": intent["intent"],
                "preferences": {}
            }
        )
        
        if workflow_response.status_code != 200:
            raise HTTPException(status_code=workflow_response.status_code, detail=workflow_response.text)
        
        workflow = workflow_response.json()
        
        # Create the workflow in the workflow engine
        create_response = await client.post(
            f"{SERVICE_URLS['workflow-engine']}/v1/workflows",
            json=workflow["workflow"]
        )
        
        return create_response.json()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)</content>

<write_to_file>
<path>api_gateway/requirements.txt</path>
<content>fastapi==0.104.1
uvicorn==0.24.0
httpx==0.25.2
pydantic==2.5.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
