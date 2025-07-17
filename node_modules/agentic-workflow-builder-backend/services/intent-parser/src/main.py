from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import openai
import json
import re
from datetime import datetime
import uuid
import logging
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Intent Parser Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CommandRequest(BaseModel):
    command: str
    context: Optional[Dict[str, Any]] = None

class WorkflowStep(BaseModel):
    id: str
    title: str
    description: str
    agent: str
    tools: List[str]
    dependencies: List[str]
    estimatedTime: str
    parameters: Optional[Dict[str, Any]] = None

class ParsedIntent(BaseModel):
    objective: str
    confidence: float
    requiredData: List[str]
    outputFormat: str
    steps: List[WorkflowStep]
    complexity: str  # 'simple', 'medium', 'complex'

class IntentRequest(BaseModel):
    intent: ParsedIntent

# Available MCP tools and agents mapping
MCP_TOOLS = {
    "data_analysis": ["pandas_analyzer", "sql_query", "chart_generator"],
    "web_scraping": ["web_scraper", "html_parser", "data_extractor"],
    "file_management": ["file_reader", "file_writer", "cloud_uploader"],
    "monitoring": ["uptime_checker", "alert_sender", "log_analyzer"],
    "reporting": ["report_generator", "email_sender", "pdf_creator"],
    "database": ["db_connector", "query_executor", "data_validator"],
    "api_integration": ["rest_client", "webhook_handler", "auth_manager"]
}

AGENT_TYPES = {
    "data_agent": ["data_analysis", "database"],
    "web_agent": ["web_scraping", "api_integration"],
    "file_agent": ["file_management"],
    "monitor_agent": ["monitoring"],
    "report_agent": ["reporting"]
}

class IntentParser:
    def __init__(self):
        self.patterns = {
            "data_analysis": [r"analyz", r"report", r"dashboard", r"chart", r"graph", r"statistics"],
            "web_scraping": [r"scrape", r"extract", r"crawl", r"fetch", r"collect"],
            "monitoring": [r"monitor", r"watch", r"alert", r"notify", r"check"],
            "automation": [r"automat", r"schedul", r"recurring", r"daily", r"weekly"],
            "file_management": [r"backup", r"save", r"upload", r"download", r"sync"],
            "reporting": [r"presentation", r"summary", r"email", r"send"]
        }
    
    def extract_keywords(self, command: str) -> List[str]:
        """Extract relevant keywords from the command"""
        keywords = []
        command_lower = command.lower()
        
        for category, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, command_lower):
                    keywords.append(category)
                    break
        
        return keywords
    
    def determine_complexity(self, command: str, keywords: List[str]) -> str:
        """Determine workflow complexity based on command analysis"""
        word_count = len(command.split())
        keyword_count = len(keywords)
        
        # Check for complex indicators
        complex_indicators = ["and", "then", "after", "if", "when", "multiple", "various"]
        has_complex_logic = any(indicator in command.lower() for indicator in complex_indicators)
        
        if word_count > 20 or keyword_count > 3 or has_complex_logic:
            return "complex"
        elif word_count > 10 or keyword_count > 1:
            return "medium"
        else:
            return "simple"
    
    def estimate_confidence(self, keywords: List[str], command: str) -> float:
        """Estimate confidence based on keyword matches and command clarity"""
        base_confidence = 0.5
        
        # Increase confidence for each matched keyword
        keyword_boost = min(len(keywords) * 0.15, 0.4)
        
        # Check for clear action words
        action_words = ["create", "generate", "analyze", "monitor", "send", "backup"]
        has_clear_action = any(word in command.lower() for word in action_words)
        action_boost = 0.2 if has_clear_action else 0
        
        # Check for specific data sources or targets
        specific_targets = ["database", "website", "file", "email", "report", "dashboard"]
        has_specific_target = any(target in command.lower() for target in specific_targets)
        target_boost = 0.15 if has_specific_target else 0
        
        confidence = min(base_confidence + keyword_boost + action_boost + target_boost, 0.95)
        return round(confidence, 2)
    
    def generate_workflow_steps(self, command: str, keywords: List[str]) -> List[WorkflowStep]:
        """Generate workflow steps based on command analysis"""
        steps = []
        step_counter = 1
        
        # Map keywords to required steps
        if "data_analysis" in keywords:
            steps.append(WorkflowStep(
                id=f"step_{step_counter}",
                title="Data Collection",
                description="Gather and validate required data sources",
                agent="data_agent",
                tools=["db_connector", "data_validator"],
                dependencies=[],
                estimatedTime="2-5 minutes"
            ))
            step_counter += 1
            
            steps.append(WorkflowStep(
                id=f"step_{step_counter}",
                title="Data Analysis",
                description="Perform statistical analysis and generate insights",
                agent="data_agent",
                tools=["pandas_analyzer", "sql_query"],
                dependencies=[f"step_{step_counter-1}"],
                estimatedTime="5-10 minutes"
            ))
            step_counter += 1
        
        if "web_scraping" in keywords:
            steps.append(WorkflowStep(
                id=f"step_{step_counter}",
                title="Web Data Extraction",
                description="Scrape and extract data from target websites",
                agent="web_agent",
                tools=["web_scraper", "html_parser"],
                dependencies=[],
                estimatedTime="3-8 minutes"
            ))
            step_counter += 1
        
        if "monitoring" in keywords:
            steps.append(WorkflowStep(
                id=f"step_{step_counter}",
                title="Setup Monitoring",
                description="Configure monitoring and alert systems",
                agent="monitor_agent",
                tools=["uptime_checker", "alert_sender"],
                dependencies=[],
                estimatedTime="1-3 minutes"
            ))
            step_counter += 1
        
        if "reporting" in keywords:
            steps.append(WorkflowStep(
                id=f"step_{step_counter}",
                title="Generate Report",
                description="Create and format final report or presentation",
                agent="report_agent",
                tools=["report_generator", "pdf_creator"],
                dependencies=[f"step_{i}" for i in range(1, step_counter)],
                estimatedTime="3-7 minutes"
            ))
            step_counter += 1
        
        if "file_management" in keywords:
            steps.append(WorkflowStep(
                id=f"step_{step_counter}",
                title="File Operations",
                description="Handle file backup, upload, or synchronization",
                agent="file_agent",
                tools=["file_reader", "cloud_uploader"],
                dependencies=[],
                estimatedTime="2-5 minutes"
            ))
            step_counter += 1
        
        # If no specific keywords matched, create a generic workflow
        if not steps:
            steps.append(WorkflowStep(
                id="step_1",
                title="Task Execution",
                description="Execute the requested task using available tools",
                agent="general_agent",
                tools=["task_executor"],
                dependencies=[],
                estimatedTime="5-10 minutes"
            ))
        
        return steps
    
    def extract_data_requirements(self, command: str) -> List[str]:
        """Extract required data sources from command"""
        data_sources = []
        command_lower = command.lower()
        
        # Common data source patterns
        if any(word in command_lower for word in ["database", "db", "sql"]):
            data_sources.append("Database")
        if any(word in command_lower for word in ["file", "csv", "excel", "document"]):
            data_sources.append("Files")
        if any(word in command_lower for word in ["website", "web", "url", "scrape"]):
            data_sources.append("Web Sources")
        if any(word in command_lower for word in ["api", "service", "endpoint"]):
            data_sources.append("API Services")
        if any(word in command_lower for word in ["email", "inbox", "message"]):
            data_sources.append("Email")
        
        return data_sources if data_sources else ["General Data"]
    
    def determine_output_format(self, command: str) -> str:
        """Determine expected output format"""
        command_lower = command.lower()
        
        if any(word in command_lower for word in ["presentation", "slides", "ppt"]):
            return "Presentation"
        elif any(word in command_lower for word in ["report", "document", "pdf"]):
            return "Report"
        elif any(word in command_lower for word in ["dashboard", "chart", "graph"]):
            return "Dashboard"
        elif any(word in command_lower for word in ["email", "notification", "alert"]):
            return "Notification"
        elif any(word in command_lower for word in ["file", "backup", "export"]):
            return "File"
        else:
            return "Data Output"

parser = IntentParser()

@app.post("/parse", response_model=ParsedIntent)
async def parse_intent(request: CommandRequest):
    """Parse natural language command into structured intent"""
    try:
        command = request.command.strip()
        if not command:
            raise HTTPException(status_code=400, detail="Command cannot be empty")
        
        logger.info(f"Parsing command: {command}")
        
        # Extract keywords and analyze command
        keywords = parser.extract_keywords(command)
        complexity = parser.determine_complexity(command, keywords)
        confidence = parser.estimate_confidence(keywords, command)
        
        # Generate workflow components
        steps = parser.generate_workflow_steps(command, keywords)
        required_data = parser.extract_data_requirements(command)
        output_format = parser.determine_output_format(command)
        
        # Create objective summary
        objective = f"Execute workflow to: {command}"
        
        parsed_intent = ParsedIntent(
            objective=objective,
            confidence=confidence,
            requiredData=required_data,
            outputFormat=output_format,
            steps=steps,
            complexity=complexity
        )
        
        logger.info(f"Successfully parsed intent with {len(steps)} steps")
        return parsed_intent
        
    except Exception as e:
        logger.error(f"Error parsing intent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to parse intent: {str(e)}")

@app.post("/generate")
async def generate_workflow(request: IntentRequest):
    """Generate executable workflow from parsed intent"""
    try:
        intent = request.intent
        logger.info(f"Generating workflow for: {intent.objective}")
        
        # Convert intent steps to executable workflow format
        workflow_steps = []
        for step in intent.steps:
            workflow_step = {
                "id": step.id,
                "name": step.title,
                "description": step.description,
                "agent_type": step.agent,
                "tools": step.tools,
                "dependencies": step.dependencies,
                "estimated_duration": step.estimatedTime,
                "parameters": step.parameters or {},
                "status": "pending",
                "created_at": datetime.utcnow().isoformat()
            }
            workflow_steps.append(workflow_step)
        
        # Create workflow metadata
        workflow = {
            "id": str(uuid.uuid4()),
            "name": f"Auto-generated: {intent.objective[:50]}...",
            "description": intent.objective,
            "complexity": intent.complexity,
            "confidence": intent.confidence,
            "required_data": intent.requiredData,
            "output_format": intent.outputFormat,
            "steps": workflow_steps,
            "status": "draft",
            "created_at": datetime.utcnow().isoformat(),
            "estimated_total_time": f"{len(workflow_steps) * 5}-{len(workflow_steps) * 10} minutes"
        }
        
        logger.info(f"Generated workflow with ID: {workflow['id']}")
        return workflow
        
    except Exception as e:
        logger.error(f"Error generating workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate workflow: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "intent-parser", "timestamp": datetime.utcnow().isoformat()}

@app.get("/tools")
async def get_available_tools():
    """Get available MCP tools and agents"""
    return {
        "tools": MCP_TOOLS,
        "agents": AGENT_TYPES
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)