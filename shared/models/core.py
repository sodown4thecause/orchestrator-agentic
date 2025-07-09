from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional, Tuple

class AgentConfig(BaseModel):
    """Configuration for an OrchestraAgent, including LLM and tool settings."""
    llm_provider: str = "openai"
    model_name: str = "gpt-4-turbo"
    temperature: float = 0.7
    # Add more config fields as needed

class ToolConfig(BaseModel):
    name: str
    description: str
    schema: Dict[str, Any]

class Tool(BaseModel):
    """Pydantic-defined, validated, and discoverable tool for the Universal Toolbelt."""
    config: ToolConfig
    # Add callable logic or reference to implementation as needed

class NodeDefinition(BaseModel):
    agent_id: str
    inputs: Dict[str, Any]
    outputs: Dict[str, Any]

class EdgeDefinition(BaseModel):
    from_node: str
    to_node: List[str]
    action: str
    condition: Optional[str] = None

class WorkflowGraph(BaseModel):
    name: str
    description: Optional[str]
    trigger: Dict[str, Any]
    start_node: str
    nodes: Dict[str, NodeDefinition]
    edges: List[EdgeDefinition]

class ContextObject(BaseModel):
    """Shared dictionary for each workflow run, passed between agents."""
    trigger_data: Dict[str, Any]
    node_outputs: Dict[str, Any]
    workflow_state: Dict[str, Any]

class OrchestraAgent:
    """Base class for all agents in Orchestra."""
    def __init__(self, agent_id: str, config: AgentConfig, toolset: Optional[List[Tool]] = None):
        self.agent_id = agent_id
        self.config = config
        self.state = {"conversation_history": []}
        self.toolset = toolset or []

    def prep(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Prepares inputs for execution from the workflow context."""
        return {"prepared_input": "..."}

    def exec(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Performs core logic (LLM calls, tool usage, etc.)."""
        return {"result": "..."}

    def post(self, result: Dict[str, Any], context: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """Updates the shared context and returns an action string."""
        return "success", context

    # Internal methods for LLM calls, tool handling, etc. can be added here
