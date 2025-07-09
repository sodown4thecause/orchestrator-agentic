from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional, Union
import asyncio
import httpx
import uuid
import json
from datetime import datetime

# Import shared modules
from shared.models.core import WorkflowGraph, ContextObject, OrchestraAgent, AgentConfig, Tool
from shared.models.flow import Flow, Node, AgentNode, FlowBuilder, FlowStatus
from shared.utils.flow_utils import flow_to_dict, dict_to_flow, create_flow_from_workflow_graph
from shared.db.postgres import save_workflow, get_workflow
from shared.db.redis_cache import get_agent_state, set_agent_state
from shared.utils.logging import get_logger

logger = get_logger(__name__)

# Models for API
class FlowRunRequest(BaseModel):
    flow_id: str
    initial_context: Dict[str, Any] = Field(default_factory=dict)
    run_async: bool = True

class FlowRunStatus(BaseModel):
    run_id: str
    flow_id: str
    status: str
    current_node_id: Optional[str] = None
    history: List[Dict[str, Any]] = Field(default_factory=list)
    context: Dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str
    error: Optional[str] = None

# In-memory store for flows and runs (replace with DB in production)
flows = {}
runs = {}

# Agent registry (replace with DB in production)
agent_registry = {}

# Helper to create an agent instance
def create_agent(agent_id: str, agent_type: str, config: Optional[Dict[str, Any]] = None) -> OrchestraAgent:
    """Create an agent instance based on type."""
    # In production, this would dynamically load agent classes
    # For now, we'll create a basic OrchestraAgent
    agent_config = AgentConfig(
        llm_provider=config.get("llm_provider", "openai"),
        model_name=config.get("model_name", "gpt-4-turbo"),
        temperature=config.get("temperature", 0.7)
    )
    
    return OrchestraAgent(agent_id=agent_id, config=agent_config)

# Function to register a flow
def register_flow(flow_id: str, flow: Flow) -> str:
    """Register a flow in the system."""
    flows[flow_id] = flow
    return flow_id

# Function to convert WorkflowGraph to Flow
def convert_workflow_to_flow(workflow_id: str, workflow: WorkflowGraph) -> str:
    """Convert a WorkflowGraph to a Flow and register it."""
    # Create agents for each node
    agents = {}
    for node in workflow.nodes:
        agent_id = node.agent_id
        # Check if agent exists in registry
        if agent_id not in agent_registry:
            # Create agent and add to registry
            agent = create_agent(agent_id, "default", {})
            agent_registry[agent_id] = agent
        agents[agent_id] = agent_registry[agent_id]
    
    # Create flow from workflow
    flow = create_flow_from_workflow_graph(workflow, agents)
    
    # Register flow
    flow_id = f"flow_{workflow_id}"
    register_flow(flow_id, flow)
    
    return flow_id

# Function to run a flow
async def run_flow(flow_id: str, initial_context: Dict[str, Any]) -> str:
    """Run a flow with the given initial context."""
    flow = flows.get(flow_id)
    if not flow:
        raise ValueError(f"Flow {flow_id} not found")
    
    # Create a new run ID
    run_id = f"run_{uuid.uuid4()}"
    
    # Initialize run status
    run_status = FlowRunStatus(
        run_id=run_id,
        flow_id=flow_id,
        status=flow.status.value,
        current_node_id=flow.start_node.node_id if flow.start_node else None,
        context=initial_context,
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat()
    )
    
    # Store initial run status
    runs[run_id] = run_status.dict()
    
    return run_id

# Function to execute a flow in the background
async def execute_flow_background(flow_id: str, run_id: str, initial_context: Dict[str, Any]):
    """Execute a flow in the background."""
    try:
        flow = flows.get(flow_id)
        if not flow:
            raise ValueError(f"Flow {flow_id} not found")
        
        # Execute flow
        result = await flow.exec(initial_context)
        
        # Update run status
        run_status = runs.get(run_id)
        if run_status:
            run_status["status"] = flow.status.value
            run_status["current_node_id"] = flow.current_node.node_id if flow.current_node else None
            run_status["history"] = flow.history
            run_status["context"] = result
            run_status["updated_at"] = datetime.now().isoformat()
            run_status["error"] = flow.error
            runs[run_id] = run_status
    
    except Exception as e:
        logger.error(f"Flow execution error: {str(e)}")
        # Update run status with error
        run_status = runs.get(run_id)
        if run_status:
            run_status["status"] = FlowStatus.FAILED.value
            run_status["error"] = str(e)
            run_status["updated_at"] = datetime.now().isoformat()
            runs[run_id] = run_status

# Function to get run status
def get_run_status(run_id: str) -> Optional[Dict[str, Any]]:
    """Get the status of a flow run."""
    return runs.get(run_id)

# Function to pause a flow run
async def pause_flow_run(flow_id: str, run_id: str) -> bool:
    """Pause a flow run."""
    run_status = runs.get(run_id)
    if not run_status:
        return False
    
    if run_status["flow_id"] != flow_id:
        return False
    
    flow = flows.get(flow_id)
    if not flow:
        return False
    
    # Pause flow
    flow.pause()
    
    # Update run status
    run_status["status"] = flow.status.value
    run_status["updated_at"] = datetime.now().isoformat()
    runs[run_id] = run_status
    
    return True

# Function to resume a flow run
async def resume_flow_run(flow_id: str, run_id: str) -> bool:
    """Resume a paused flow run."""
    run_status = runs.get(run_id)
    if not run_status:
        return False
    
    if run_status["flow_id"] != flow_id:
        return False
    
    flow = flows.get(flow_id)
    if not flow:
        return False
    
    # Resume flow
    flow.resume()
    
    # Update run status
    run_status["status"] = flow.status.value
    run_status["updated_at"] = datetime.now().isoformat()
    runs[run_id] = run_status
    
    # Resume execution in background
    asyncio.create_task(
        execute_flow_background(
            flow_id=flow_id,
            run_id=run_id,
            initial_context=run_status["context"]
        )
    )
    
    return True

# Function to list all flows
def list_flows() -> List[Dict[str, Any]]:
    """List all registered flows."""
    return [{
        "flow_id": flow_id,
        "name": getattr(flow, 'name', flow_id),
        "status": flow.status.value,
        "created_at": flow.created_at
    } for flow_id, flow in flows.items()]

# Function to list all runs
def list_runs(flow_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """List all flow runs, optionally filtered by flow_id."""
    if flow_id:
        return [{
            "run_id": run_id,
            "flow_id": run["flow_id"],
            "status": run["status"],
            "created_at": run["created_at"],
            "updated_at": run["updated_at"]
        } for run_id, run in runs.items() if run["flow_id"] == flow_id]
    
    return [{
        "run_id": run_id,
        "flow_id": run["flow_id"],
        "status": run["status"],
        "created_at": run["created_at"],
        "updated_at": run["updated_at"]
    } for run_id, run in runs.items()]