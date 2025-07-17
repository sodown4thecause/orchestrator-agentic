from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import json
import asyncio
from datetime import datetime
import logging
from enum import Enum
import aiohttp
from dataclasses import dataclass, asdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Workflow Engine", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums
class WorkflowStatus(str, Enum):
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"

class StepStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

# Pydantic models
class WorkflowStep(BaseModel):
    id: str
    name: str
    description: str
    agent_type: str
    tools: List[str]
    dependencies: List[str]
    parameters: Dict[str, Any] = {}
    status: StepStatus = StepStatus.PENDING
    estimated_duration: str = "5 minutes"
    actual_duration: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    output: Optional[Dict[str, Any]] = None

class Workflow(BaseModel):
    id: str
    name: str
    description: str
    steps: List[WorkflowStep]
    status: WorkflowStatus = WorkflowStatus.DRAFT
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    tags: List[str] = []
    metadata: Dict[str, Any] = {}

class WorkflowExecution(BaseModel):
    id: str
    workflow_id: str
    status: WorkflowStatus
    current_step_id: Optional[str] = None
    progress: float = 0.0
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    execution_log: List[Dict[str, Any]] = []
    context: Dict[str, Any] = {}

class CreateWorkflowRequest(BaseModel):
    name: str
    description: str
    steps: List[WorkflowStep]
    tags: List[str] = []
    metadata: Dict[str, Any] = {}

class UpdateWorkflowRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[List[WorkflowStep]] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

# In-memory storage (replace with database in production)
workflows: Dict[str, Workflow] = {}
executions: Dict[str, WorkflowExecution] = {}

# Agent and tool registry
AGENT_ENDPOINTS = {
    "data_agent": "http://localhost:8004",
    "web_agent": "http://localhost:8005",
    "file_agent": "http://localhost:8006",
    "monitor_agent": "http://localhost:8007",
    "report_agent": "http://localhost:8008",
    "general_agent": "http://localhost:8009"
}

class WorkflowEngine:
    def __init__(self):
        self.running_executions: Dict[str, asyncio.Task] = {}
    
    async def execute_step(self, execution: WorkflowExecution, step: WorkflowStep) -> bool:
        """Execute a single workflow step"""
        try:
            logger.info(f"Executing step {step.id}: {step.name}")
            
            # Update step status
            step.status = StepStatus.RUNNING
            step.started_at = datetime.utcnow()
            
            # Log execution start
            execution.execution_log.append({
                "timestamp": datetime.utcnow().isoformat(),
                "step_id": step.id,
                "event": "step_started",
                "message": f"Started executing step: {step.name}"
            })
            
            # Get agent endpoint
            agent_endpoint = AGENT_ENDPOINTS.get(step.agent_type)
            if not agent_endpoint:
                raise Exception(f"Unknown agent type: {step.agent_type}")
            
            # Prepare execution payload
            payload = {
                "step_id": step.id,
                "tools": step.tools,
                "parameters": step.parameters,
                "context": execution.context
            }
            
            # Execute step via agent
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{agent_endpoint}/execute",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=300)  # 5 minute timeout
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        step.output = result.get("output", {})
                        step.status = StepStatus.COMPLETED
                        step.completed_at = datetime.utcnow()
                        
                        # Update execution context with step output
                        execution.context.update(result.get("context_updates", {}))
                        
                        # Log success
                        execution.execution_log.append({
                            "timestamp": datetime.utcnow().isoformat(),
                            "step_id": step.id,
                            "event": "step_completed",
                            "message": f"Successfully completed step: {step.name}",
                            "output": step.output
                        })
                        
                        return True
                    else:
                        error_text = await response.text()
                        raise Exception(f"Agent execution failed: {error_text}")
        
        except Exception as e:
            logger.error(f"Step execution failed: {str(e)}")
            step.status = StepStatus.FAILED
            step.error_message = str(e)
            step.completed_at = datetime.utcnow()
            
            # Log failure
            execution.execution_log.append({
                "timestamp": datetime.utcnow().isoformat(),
                "step_id": step.id,
                "event": "step_failed",
                "message": f"Step failed: {str(e)}",
                "error": str(e)
            })
            
            return False
    
    def get_ready_steps(self, workflow: Workflow) -> List[WorkflowStep]:
        """Get steps that are ready to execute (dependencies satisfied)"""
        ready_steps = []
        
        for step in workflow.steps:
            if step.status != StepStatus.PENDING:
                continue
            
            # Check if all dependencies are completed
            dependencies_satisfied = True
            for dep_id in step.dependencies:
                dep_step = next((s for s in workflow.steps if s.id == dep_id), None)
                if not dep_step or dep_step.status != StepStatus.COMPLETED:
                    dependencies_satisfied = False
                    break
            
            if dependencies_satisfied:
                ready_steps.append(step)
        
        return ready_steps
    
    async def execute_workflow(self, workflow_id: str) -> str:
        """Execute a workflow and return execution ID"""
        workflow = workflows.get(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Create execution record
        execution_id = str(uuid.uuid4())
        execution = WorkflowExecution(
            id=execution_id,
            workflow_id=workflow_id,
            status=WorkflowStatus.RUNNING,
            started_at=datetime.utcnow()
        )
        executions[execution_id] = execution
        
        # Start execution task
        task = asyncio.create_task(self._run_workflow_execution(workflow, execution))
        self.running_executions[execution_id] = task
        
        return execution_id
    
    async def _run_workflow_execution(self, workflow: Workflow, execution: WorkflowExecution):
        """Run the actual workflow execution"""
        try:
            logger.info(f"Starting workflow execution: {execution.id}")
            
            total_steps = len(workflow.steps)
            completed_steps = 0
            
            while completed_steps < total_steps:
                # Get ready steps
                ready_steps = self.get_ready_steps(workflow)
                
                if not ready_steps:
                    # Check if we're stuck (no ready steps but not all completed)
                    pending_steps = [s for s in workflow.steps if s.status == StepStatus.PENDING]
                    if pending_steps:
                        raise Exception("Workflow stuck: circular dependencies or missing dependencies")
                    break
                
                # Execute ready steps (can be parallel in the future)
                for step in ready_steps:
                    execution.current_step_id = step.id
                    success = await self.execute_step(execution, step)
                    
                    if success:
                        completed_steps += 1
                        execution.progress = (completed_steps / total_steps) * 100
                    else:
                        # Step failed, stop execution
                        execution.status = WorkflowStatus.FAILED
                        execution.error_message = step.error_message
                        execution.completed_at = datetime.utcnow()
                        return
                
                # Small delay between step batches
                await asyncio.sleep(1)
            
            # All steps completed successfully
            execution.status = WorkflowStatus.COMPLETED
            execution.progress = 100.0
            execution.completed_at = datetime.utcnow()
            execution.current_step_id = None
            
            logger.info(f"Workflow execution completed: {execution.id}")
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {str(e)}")
            execution.status = WorkflowStatus.FAILED
            execution.error_message = str(e)
            execution.completed_at = datetime.utcnow()
        
        finally:
            # Clean up running execution
            if execution.id in self.running_executions:
                del self.running_executions[execution.id]

workflow_engine = WorkflowEngine()

# API Endpoints
@app.get("/workflows", response_model=List[Workflow])
async def get_workflows():
    """Get all workflows"""
    return list(workflows.values())

@app.get("/workflows/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: str):
    """Get a specific workflow"""
    workflow = workflows.get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@app.post("/workflows", response_model=Workflow)
async def create_workflow(request: CreateWorkflowRequest):
    """Create a new workflow"""
    workflow_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    workflow = Workflow(
        id=workflow_id,
        name=request.name,
        description=request.description,
        steps=request.steps,
        created_at=now,
        updated_at=now,
        tags=request.tags,
        metadata=request.metadata
    )
    
    workflows[workflow_id] = workflow
    logger.info(f"Created workflow: {workflow_id}")
    
    return workflow

@app.put("/workflows/{workflow_id}", response_model=Workflow)
async def update_workflow(workflow_id: str, request: UpdateWorkflowRequest):
    """Update a workflow"""
    workflow = workflows.get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Update fields if provided
    if request.name is not None:
        workflow.name = request.name
    if request.description is not None:
        workflow.description = request.description
    if request.steps is not None:
        workflow.steps = request.steps
    if request.tags is not None:
        workflow.tags = request.tags
    if request.metadata is not None:
        workflow.metadata = request.metadata
    
    workflow.updated_at = datetime.utcnow()
    
    logger.info(f"Updated workflow: {workflow_id}")
    return workflow

@app.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str):
    """Delete a workflow"""
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    del workflows[workflow_id]
    logger.info(f"Deleted workflow: {workflow_id}")
    
    return {"message": "Workflow deleted successfully"}

@app.post("/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, background_tasks: BackgroundTasks):
    """Execute a workflow"""
    try:
        execution_id = await workflow_engine.execute_workflow(workflow_id)
        return {"execution_id": execution_id}
    except Exception as e:
        logger.error(f"Failed to start workflow execution: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/workflows/{workflow_id}/executions/{execution_id}", response_model=WorkflowExecution)
async def get_execution(workflow_id: str, execution_id: str):
    """Get execution status"""
    execution = executions.get(execution_id)
    if not execution or execution.workflow_id != workflow_id:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    return execution

@app.get("/workflows/{workflow_id}/executions", response_model=List[WorkflowExecution])
async def get_workflow_executions(workflow_id: str):
    """Get all executions for a workflow"""
    workflow_executions = [e for e in executions.values() if e.workflow_id == workflow_id]
    return workflow_executions

@app.post("/workflows/{workflow_id}/executions/{execution_id}/stop")
async def stop_execution(workflow_id: str, execution_id: str):
    """Stop a running execution"""
    execution = executions.get(execution_id)
    if not execution or execution.workflow_id != workflow_id:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    if execution_id in workflow_engine.running_executions:
        task = workflow_engine.running_executions[execution_id]
        task.cancel()
        execution.status = WorkflowStatus.PAUSED
        execution.completed_at = datetime.utcnow()
        
        logger.info(f"Stopped execution: {execution_id}")
        return {"message": "Execution stopped"}
    
    return {"message": "Execution not running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "workflow-engine",
        "timestamp": datetime.utcnow().isoformat(),
        "active_executions": len(workflow_engine.running_executions)
    }

@app.get("/stats")
async def get_stats():
    """Get workflow engine statistics"""
    total_workflows = len(workflows)
    total_executions = len(executions)
    running_executions = len(workflow_engine.running_executions)
    
    status_counts = {}
    for execution in executions.values():
        status = execution.status
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return {
        "total_workflows": total_workflows,
        "total_executions": total_executions,
        "running_executions": running_executions,
        "execution_status_counts": status_counts
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)