# Add these imports to the existing imports
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional, Union
import asyncio
import httpx
import uuid
import json
from datetime import datetime
import yaml

# Import shared modules
from shared.models.core import WorkflowGraph, ContextObject, OrchestraAgent
from shared.db.postgres import save_workflow, get_workflow
from shared.db.redis_cache import get_agent_state, set_agent_state
from shared.utils.logging import get_logger
from shared.models.flow import Flow, FlowStatus
from shared.utils.flow_utils import flow_to_dict, dict_to_flow

# Flow registry
flows = {}

API_KEY = "orchestra-secret-key"
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing API key")
    return api_key

app = FastAPI(title="Orchestra Workflow Engine")

class WorkflowDef(BaseModel):
    name: str
    description: Optional[str]
    graph: Dict[str, Any]

class RunRequest(BaseModel):
    initial_context: Dict[str, Any]

# In-memory store for workflow definitions and runs (replace with DB in production)
workflows = {}
runs = {}
flows = {}
flow_runs = {}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/v1/workflows")
def create_or_update_workflow(defn: WorkflowDef, api_key: str = Depends(get_api_key)):
    workflow = WorkflowGraph(
        name=defn.name,
        description=defn.description,
        trigger=defn.graph.get("trigger", {}),
        start_node=defn.graph.get("start_node", ""),
        nodes=defn.graph.get("nodes", {}),
        edges=defn.graph.get("edges", [])
    )
    workflow_id = f"wf_{len(workflows)+1}"
    workflows[workflow_id] = workflow
    return {"workflow_id": workflow_id, "version": 1, "created_at": "2025-07-08T00:00:00Z", "validated": True}

logger = get_logger(__name__)

# Add these new models
class WorkflowRunStatus(BaseModel):
    run_id: str
    workflow_id: str
    status: str  # "running", "completed", "failed", "paused"
    current_nodes: List[str] = Field(default_factory=list)
    completed_nodes: List[str] = Field(default_factory=list)
    context: Dict[str, Any] = Field(default_factory=dict)
    history: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: str
    updated_at: str
    error: Optional[str] = None

# Import flow executor
from workflow_engine.flow_executor import (
    run_flow, execute_flow_background, get_run_status,
    pause_flow_run, resume_flow_run, list_flows, list_runs,
    convert_workflow_to_flow, register_flow, FlowRunStatus
)

# Update the run_workflow function
@app.post("/v1/workflows/{workflow_id}/run")
async def run_workflow(workflow_id: str, req: RunRequest, background_tasks: BackgroundTasks, api_key: str = Depends(get_api_key)):
    workflow = workflows.get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    context = ContextObject(
        trigger_data=req.initial_context.get("trigger_data", {}),
        node_outputs=req.initial_context.get("node_outputs", {}),
        workflow_state=req.initial_context.get("workflow_state", {})
    )
    
    # Convert workflow to flow if not already done
    flow_id = f"flow_{workflow_id}"
    if flow_id not in flows:
        # Convert workflow to flow
        convert_workflow_to_flow(workflow_id, workflow)
    
    # Run flow
    run_id = await run_flow(flow_id, context.dict())
    
    # Start flow execution in background
    background_tasks.add_task(
        execute_flow_background,
        flow_id=flow_id,
        run_id=run_id,
        initial_context=context.dict()
    )
    
    return {"run_id": run_id, "status": "running", "flow_id": flow_id}

# Legacy execute_workflow function - will be deprecated
async def execute_workflow(workflow: WorkflowGraph, run_id: str, context: Dict[str, Any]):
    # Convert to flow-based execution
    flow_id = f"flow_{workflow.id}"
    if flow_id not in flows:
        convert_workflow_to_flow(workflow.id, workflow)
    
    # Use the new flow executor
    await execute_flow_background(flow_id, run_id, context)

# Legacy process_node function - will be deprecated
async def process_node(node: NodeDefinition, context: Dict[str, Any]):
    # This would call the agent runtime service to execute the agent
    # For now, we'll simulate with a simple delay
    await asyncio.sleep(1)
    
    # Return simulated result
    return {"action": "next", "output": f"Processed {node.id}"}

# New flow-based endpoints
@app.get("/v1/flows")
async def get_flows(api_key: str = Depends(get_api_key)):
    """List all registered flows"""
    return list_flows()

@app.get("/v1/flows/{flow_id}/runs")
async def get_flow_runs(flow_id: str, api_key: str = Depends(get_api_key)):
    """List all runs for a specific flow"""
    return list_runs(flow_id)

@app.get("/v1/flows/runs/{run_id}")
async def get_flow_run_status(run_id: str, api_key: str = Depends(get_api_key)):
    """Get the status of a specific flow run"""
    status = get_run_status(run_id)
    if not status:
        raise HTTPException(status_code=404, detail="Run not found")
    return status

@app.post("/v1/flows/{flow_id}/pause/{run_id}")
async def pause_flow(flow_id: str, run_id: str, api_key: str = Depends(get_api_key)):
    """Pause a running flow"""
    success = await pause_flow_run(flow_id, run_id)
    if not success:
        raise HTTPException(status_code=404, detail="Run not found or not in running state")
    return {"status": "paused", "run_id": run_id}

@app.post("/v1/flows/{flow_id}/resume/{run_id}")
async def resume_flow(flow_id: str, run_id: str, api_key: str = Depends(get_api_key)):
    """Resume a paused flow"""
    success = await resume_flow_run(flow_id, run_id)
    if not success:
        raise HTTPException(status_code=404, detail="Run not found or not in paused state")
    return {"status": "running", "run_id": run_id}
                            # Evaluate condition (simplified -
