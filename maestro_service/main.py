from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import Any, Dict, Optional

API_KEY = "orchestra-secret-key"
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing API key")
    return api_key

app = FastAPI(title="Orchestra Maestro Service")

class WorkflowRequest(BaseModel):
    goal: str
    context: Optional[Dict[str, Any]] = None

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/v1/workflows/generate")
def generate_workflow(req: WorkflowRequest, api_key: str = Depends(get_api_key)):
    # Stub: Replace with LLM-based workflow generation
    return {
        "workflow_id": "wf_123",
        "graph": {"nodes": [], "edges": []},
        "confidence_score": 1.0
    }
