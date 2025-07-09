from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
import asyncio
import uuid
import json
from datetime import datetime

# Import shared modules
from shared.models.core import OrchestraAgent, AgentConfig, Tool
from shared.db.redis_cache import get_agent_state, set_agent_state
from shared.db.vector_store import upsert_vector, search_vector
from shared.utils.logging import get_logger

logger = get_logger(__name__)

API_KEY = "orchestra-secret-key"
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing API key")
    return api_key

app = FastAPI(title="Orchestra Agent Runtime")

class AgentRequest(BaseModel):
    agent_id: str
    agent_type: str
    state: Dict[str, Any] = Field(default_factory=dict)
    context: Dict[str, Any] = Field(default_factory=dict)
    tools: List[Dict[str, Any]] = Field(default_factory=list)
    run_id: Optional[str] = None
    timeout: Optional[int] = 30  # Timeout in seconds

class AgentResponse(BaseModel):
    run_id: str
    agent_id: str
    status: str
    action: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    context: Dict[str, Any]
    error: Optional[str] = None
    created_at: str

# In-memory registry of agent types (replace with DB in production)
AGENT_REGISTRY = {
    "rag": {
        "class": "RAGAgent",
        "description": "Retrieval-Augmented Generation agent"
    },
    "chat": {
        "class": "ChatAgent",
        "description": "Conversational agent"
    },
    "workflow": {
        "class": "WorkflowAgent",
        "description": "Workflow orchestration agent"
    },
    "sql": {
        "class": "SQLAgent",
        "description": "SQL database interaction agent"
    }
}

# In-memory store of running agents (replace with Redis in production)
RUNNING_AGENTS = {}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/v1/agents")
def list_agents(api_key: str = Depends(get_api_key)):
    return {"agents": AGENT_REGISTRY}

@app.post("/v1/agent/exec", response_model=AgentResponse)
async def exec_agent(req: AgentRequest, background_tasks: BackgroundTasks, api_key: str = Depends(get_api_key)):
    # Validate agent type
    if req.agent_type not in AGENT_REGISTRY:
        raise HTTPException(status_code=400, detail=f"Unknown agent type: {req.agent_type}")
    
    # Generate run_id if not provided
    run_id = req.run_id or f"run_{uuid.uuid4()}"
    
    # Initialize agent (in production, dynamically load agent class)
    agent_config = AgentConfig(
        llm_provider=req.context.get("llm_provider", "openai"),
        model_name=req.context.get("model_name", "gpt-4-turbo"),
        temperature=req.context.get("temperature", 0.7)
    )
    
    # Convert tool configs to Tool objects
    tools = [Tool(config=tool) for tool in req.tools] if req.tools else []
    
    # Create agent instance
    agent = OrchestraAgent(agent_id=req.agent_id, config=agent_config, toolset=tools)
    
    # Load previous state if exists
    if req.state:
        agent.state = req.state
    elif run_id:
        saved_state = get_agent_state(run_id, req.agent_id)
        if saved_state:
            agent.state = json.loads(saved_state)
    
    # Execute agent in background for long-running tasks
    if req.timeout and req.timeout > 10:
        # Store agent in running agents
        RUNNING_AGENTS[run_id] = {
            "agent": agent,
            "status": "running",
            "started_at": datetime.now().isoformat()
        }
        
        # Run in background
        background_tasks.add_task(run_agent_task, agent, req.context, run_id)
        
        return AgentResponse(
            run_id=run_id,
            agent_id=req.agent_id,
            status="running",
            context=req.context,
            created_at=datetime.now().isoformat()
        )
    
    # For quick tasks, run synchronously
    try:
        inputs = agent.prep(req.context)
        result = agent.exec(inputs)
        action, updated_context = agent.post(result, req.context)
        
        # Save agent state
        set_agent_state(run_id, req.agent_id, json.dumps(agent.state))
        
        return AgentResponse(
            run_id=run_id,
            agent_id=req.agent_id,
            status="completed",
            action=action,
            result=result,
            context=updated_context,
            created_at=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Agent execution error: {str(e)}")
        return AgentResponse(
            run_id=run_id,
            agent_id=req.agent_id,
            status="error",
            error=str(e),
            context=req.context,
            created_at=datetime.now().isoformat()
        )

async def run_agent_task(agent, context, run_id):
    try:
        inputs = agent.prep(context)
        result = agent.exec(inputs)
        action, updated_context = agent.post(result, context)
        
        # Save agent state
        set_agent_state(run_id, agent.agent_id, json.dumps(agent.state))
        
        # Update running agent status
        if run_id in RUNNING_AGENTS:
            RUNNING_AGENTS[run_id]["status"] = "completed"
            RUNNING_AGENTS[run_id]["result"] = result
            RUNNING_AGENTS[run_id]["action"] = action
            RUNNING_AGENTS[run_id]["context"] = updated_context
            RUNNING_AGENTS[run_id]["completed_at"] = datetime.now().isoformat()
    except Exception as e:
        logger.error(f"Background agent execution error: {str(e)}")
        if run_id in RUNNING_AGENTS:
            RUNNING_AGENTS[run_id]["status"] = "error"
            RUNNING_AGENTS[run_id]["error"] = str(e)
            RUNNING_AGENTS[run_id]["completed_at"] = datetime.now().isoformat()

@app.get("/v1/agent/status/{run_id}")
def get_agent_status(run_id: str, api_key: str = Depends(get_api_key)):
    if run_id not in RUNNING_AGENTS:
        raise HTTPException(status_code=404, detail=f"Run ID {run_id} not found")
    
    agent_run = RUNNING_AGENTS[run_id]
    return {
        "run_id": run_id,
        "status": agent_run["status"],
        "started_at": agent_run["started_at"],
        "completed_at": agent_run.get("completed_at"),
        "result": agent_run.get("result"),
        "action": agent_run.get("action"),
        "error": agent_run.get("error")
    }
