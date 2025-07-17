from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import logging
from datetime import datetime
import json
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="General Agent", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ExecutionRequest(BaseModel):
    step_id: str
    tools: List[str]
    parameters: Dict[str, Any] = {}
    context: Dict[str, Any] = {}

class ExecutionResponse(BaseModel):
    success: bool
    output: Dict[str, Any] = {}
    context_updates: Dict[str, Any] = {}
    error_message: Optional[str] = None
    execution_time: float
    logs: List[str] = []

# Available tools for the general agent
class GeneralAgentTools:
    def __init__(self):
        self.tools = {
            "task_executor": self.execute_task,
            "data_processor": self.process_data,
            "file_handler": self.handle_file,
            "api_caller": self.call_api,
            "text_processor": self.process_text,
            "logger": self.log_message
        }
    
    async def execute_task(self, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Generic task executor"""
        task_type = parameters.get("task_type", "unknown")
        task_data = parameters.get("data", {})
        
        logger.info(f"Executing task: {task_type}")
        
        # Simulate task execution
        await asyncio.sleep(2)  # Simulate processing time
        
        result = {
            "task_id": str(uuid.uuid4()),
            "task_type": task_type,
            "status": "completed",
            "processed_data": task_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return {
            "output": result,
            "context_updates": {
                "last_task_id": result["task_id"],
                "last_task_type": task_type
            },
            "logs": [f"Successfully executed task: {task_type}"]
        }
    
    async def process_data(self, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process data with various operations"""
        data = parameters.get("data", [])
        operation = parameters.get("operation", "count")
        
        logger.info(f"Processing data with operation: {operation}")
        
        result = {}
        
        if operation == "count":
            result = {"count": len(data) if isinstance(data, list) else 1}
        elif operation == "sum" and isinstance(data, list):
            result = {"sum": sum(x for x in data if isinstance(x, (int, float)))}
        elif operation == "filter":
            filter_key = parameters.get("filter_key")
            filter_value = parameters.get("filter_value")
            if filter_key and isinstance(data, list):
                filtered = [item for item in data if isinstance(item, dict) and item.get(filter_key) == filter_value]
                result = {"filtered_data": filtered, "count": len(filtered)}
        else:
            result = {"processed_data": data, "operation": operation}
        
        return {
            "output": result,
            "context_updates": {"last_operation": operation},
            "logs": [f"Data processed with operation: {operation}"]
        }
    
    async def handle_file(self, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle file operations"""
        operation = parameters.get("operation", "read")
        file_path = parameters.get("file_path", "")
        
        logger.info(f"File operation: {operation} on {file_path}")
        
        # Simulate file operation
        await asyncio.sleep(1)
        
        result = {
            "operation": operation,
            "file_path": file_path,
            "status": "completed",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if operation == "read":
            result["content"] = f"Simulated content from {file_path}"
        elif operation == "write":
            result["bytes_written"] = len(parameters.get("content", ""))
        
        return {
            "output": result,
            "context_updates": {"last_file_operation": operation},
            "logs": [f"File operation completed: {operation}"]
        }
    
    async def call_api(self, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Make API calls"""
        url = parameters.get("url", "")
        method = parameters.get("method", "GET")
        headers = parameters.get("headers", {})
        
        logger.info(f"API call: {method} {url}")
        
        # Simulate API call
        await asyncio.sleep(1.5)
        
        result = {
            "url": url,
            "method": method,
            "status_code": 200,
            "response": {"message": "Simulated API response", "timestamp": datetime.utcnow().isoformat()},
            "headers": headers
        }
        
        return {
            "output": result,
            "context_updates": {"last_api_call": url},
            "logs": [f"API call completed: {method} {url}"]
        }
    
    async def process_text(self, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process text with various operations"""
        text = parameters.get("text", "")
        operation = parameters.get("operation", "analyze")
        
        logger.info(f"Text processing: {operation}")
        
        result = {"original_text": text, "operation": operation}
        
        if operation == "analyze":
            result.update({
                "word_count": len(text.split()),
                "character_count": len(text),
                "line_count": len(text.split('\n'))
            })
        elif operation == "uppercase":
            result["processed_text"] = text.upper()
        elif operation == "lowercase":
            result["processed_text"] = text.lower()
        elif operation == "extract_keywords":
            # Simple keyword extraction (split by spaces and filter)
            words = text.split()
            keywords = [word.strip('.,!?;:') for word in words if len(word) > 3]
            result["keywords"] = list(set(keywords))[:10]  # Top 10 unique keywords
        
        return {
            "output": result,
            "context_updates": {"last_text_operation": operation},
            "logs": [f"Text processed with operation: {operation}"]
        }
    
    async def log_message(self, parameters: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Log a message"""
        message = parameters.get("message", "")
        level = parameters.get("level", "info")
        
        # Log the message
        if level == "error":
            logger.error(message)
        elif level == "warning":
            logger.warning(message)
        else:
            logger.info(message)
        
        result = {
            "message": message,
            "level": level,
            "timestamp": datetime.utcnow().isoformat(),
            "logged": True
        }
        
        return {
            "output": result,
            "context_updates": {"last_log_message": message},
            "logs": [f"Message logged at {level} level"]
        }

tools = GeneralAgentTools()

@app.post("/execute", response_model=ExecutionResponse)
async def execute_step(request: ExecutionRequest):
    """Execute a workflow step"""
    start_time = datetime.utcnow()
    
    try:
        logger.info(f"Executing step {request.step_id} with tools: {request.tools}")
        
        all_outputs = {}
        all_context_updates = {}
        all_logs = []
        
        # Execute each tool in sequence
        for tool_name in request.tools:
            if tool_name not in tools.tools:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unknown tool: {tool_name}"
                )
            
            tool_func = tools.tools[tool_name]
            tool_result = await tool_func(request.parameters, request.context)
            
            # Merge results
            all_outputs[tool_name] = tool_result["output"]
            all_context_updates.update(tool_result["context_updates"])
            all_logs.extend(tool_result["logs"])
            
            # Update context for next tool
            request.context.update(tool_result["context_updates"])
        
        execution_time = (datetime.utcnow() - start_time).total_seconds()
        
        return ExecutionResponse(
            success=True,
            output=all_outputs,
            context_updates=all_context_updates,
            execution_time=execution_time,
            logs=all_logs
        )
    
    except Exception as e:
        execution_time = (datetime.utcnow() - start_time).total_seconds()
        logger.error(f"Step execution failed: {str(e)}")
        
        return ExecutionResponse(
            success=False,
            error_message=str(e),
            execution_time=execution_time,
            logs=[f"Execution failed: {str(e)}"]
        )

@app.get("/tools")
async def get_available_tools():
    """Get list of available tools"""
    return {
        "tools": list(tools.tools.keys()),
        "descriptions": {
            "task_executor": "Execute generic tasks",
            "data_processor": "Process data with various operations",
            "file_handler": "Handle file operations",
            "api_caller": "Make API calls",
            "text_processor": "Process text with various operations",
            "logger": "Log messages"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "general-agent",
        "timestamp": datetime.utcnow().isoformat(),
        "available_tools": len(tools.tools)
    }

@app.get("/capabilities")
async def get_capabilities():
    """Get agent capabilities"""
    return {
        "agent_type": "general_agent",
        "supported_tools": list(tools.tools.keys()),
        "max_concurrent_executions": 10,
        "average_execution_time": "2-5 seconds",
        "specializations": [
            "Generic task execution",
            "Data processing",
            "File operations",
            "API interactions",
            "Text processing",
            "Logging"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8009)