from typing import Any, Dict, List, Optional, Callable, Union, TypeVar, Generic
from pydantic import BaseModel, Field
import asyncio
import uuid
from datetime import datetime
from enum import Enum

# Type variables for generic typing
T = TypeVar('T')
R = TypeVar('R')

class FlowStatus(str, Enum):
    """Status of a flow execution"""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"

class BaseNode(Generic[T, R]):
    """Base class for all nodes in a flow.
    
    Implements the prep -> exec -> post lifecycle similar to OrchestraAgent
    but with a more flexible interface for flow control.
    """
    def __init__(self, node_id: Optional[str] = None):
        self.node_id = node_id or str(uuid.uuid4())
        self.successors = {}
        self.store = {}
    
    def prep(self, context: Dict[str, Any]) -> T:
        """Prepare inputs for execution from the flow context."""
        return context  # type: ignore
    
    async def exec(self, inputs: T) -> R:
        """Execute the node's core logic."""
        raise NotImplementedError("Subclasses must implement exec method")
    
    def post(self, result: R, context: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        """Process results and determine next action."""
        return "default", context
    
    def add_edge(self, action: str, node: 'BaseNode'):
        """Add an edge from this node to another node based on an action."""
        self.successors[action] = node
        return self
    
    def get_next(self, action: str) -> Optional['BaseNode']:
        """Get the next node based on an action."""
        return self.successors.get(action)

class Node(BaseNode[Dict[str, Any], Dict[str, Any]]):
    """Standard node implementation that works with dictionary inputs and outputs."""
    def __init__(self, 
                 node_id: Optional[str] = None,
                 prep_fn: Optional[Callable[[Dict[str, Any]], Dict[str, Any]]] = None,
                 exec_fn: Optional[Callable[[Dict[str, Any]], Dict[str, Any]]] = None,
                 post_fn: Optional[Callable[[Dict[str, Any], Dict[str, Any]], tuple[str, Dict[str, Any]]]] = None):
        super().__init__(node_id)
        self._prep_fn = prep_fn
        self._exec_fn = exec_fn
        self._post_fn = post_fn
    
    def prep(self, context: Dict[str, Any]) -> Dict[str, Any]:
        if self._prep_fn:
            return self._prep_fn(context)
        return context
    
    async def exec(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        if self._exec_fn:
            # Handle both sync and async exec functions
            result = self._exec_fn(inputs)
            if asyncio.iscoroutine(result):
                return await result
            return result
        return inputs
    
    def post(self, result: Dict[str, Any], context: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        if self._post_fn:
            return self._post_fn(result, context)
        return "default", {**context, **result}

class AgentNode(Node):
    """Node that wraps an OrchestraAgent for use in a flow."""
    def __init__(self, agent, node_id: Optional[str] = None):
        super().__init__(node_id)
        self.agent = agent
    
    def prep(self, context: Dict[str, Any]) -> Dict[str, Any]:
        return self.agent.prep(context)
    
    async def exec(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        return self.agent.exec(inputs)
    
    def post(self, result: Dict[str, Any], context: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        return self.agent.post(result, context)

class Flow(BaseNode[Dict[str, Any], Dict[str, Any]]):
    """A flow is a directed graph of nodes that can be executed.
    
    Flows can be nested within other flows, allowing for complex workflows.
    """
    def __init__(self, start_node: Node, node_id: Optional[str] = None):
        super().__init__(node_id)
        self.start_node = start_node
        self.nodes = {start_node.node_id: start_node}
        self.current_node = None
        self.status = FlowStatus.PENDING
        self.history = []
        self.created_at = datetime.now().isoformat()
        self.updated_at = self.created_at
        self.error = None
    
    def add_node(self, node: Node) -> Node:
        """Add a node to the flow."""
        self.nodes[node.node_id] = node
        return node
    
    def connect(self, from_node_id: str, action: str, to_node_id: str) -> 'Flow':
        """Connect two nodes with an edge."""
        from_node = self.nodes.get(from_node_id)
        to_node = self.nodes.get(to_node_id)
        
        if not from_node or not to_node:
            raise ValueError(f"Node not found: {from_node_id if not from_node else to_node_id}")
        
        from_node.add_edge(action, to_node)
        return self
    
    async def exec(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the flow from start to finish."""
        context = inputs.copy()
        self.current_node = self.start_node
        self.status = FlowStatus.RUNNING
        self.updated_at = datetime.now().isoformat()
        
        try:
            while self.current_node and self.status == FlowStatus.RUNNING:
                node = self.current_node
                
                # Record execution start
                step_start = datetime.now().isoformat()
                self.history.append({
                    "node_id": node.node_id,
                    "status": "started",
                    "timestamp": step_start
                })
                
                try:
                    # Execute node lifecycle
                    node_inputs = node.prep(context)
                    node_result = await node.exec(node_inputs)
                    action, updated_context = node.post(node_result, context)
                    
                    # Update context
                    context = updated_context
                    context["node_outputs"] = context.get("node_outputs", {})
                    context["node_outputs"][node.node_id] = node_result
                    
                    # Record execution completion
                    self.history.append({
                        "node_id": node.node_id,
                        "status": "completed",
                        "action": action,
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    # Find next node
                    self.current_node = node.get_next(action)
                    
                    # If no next node, we're done
                    if not self.current_node:
                        self.status = FlowStatus.COMPLETED
                        
                except Exception as e:
                    # Record execution failure
                    self.history.append({
                        "node_id": node.node_id,
                        "status": "failed",
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    })
                    self.status = FlowStatus.FAILED
                    self.error = str(e)
                    raise
            
            self.updated_at = datetime.now().isoformat()
            return context
            
        except Exception as e:
            self.updated_at = datetime.now().isoformat()
            self.status = FlowStatus.FAILED
            self.error = str(e)
            raise
    
    def pause(self) -> None:
        """Pause the flow execution."""
        if self.status == FlowStatus.RUNNING:
            self.status = FlowStatus.PAUSED
            self.updated_at = datetime.now().isoformat()
            self.history.append({
                "status": "paused",
                "timestamp": self.updated_at
            })
    
    def resume(self) -> None:
        """Resume a paused flow."""
        if self.status == FlowStatus.PAUSED:
            self.status = FlowStatus.RUNNING
            self.updated_at = datetime.now().isoformat()
            self.history.append({
                "status": "resumed",
                "timestamp": self.updated_at
            })
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert flow to dictionary for serialization."""
        return {
            "node_id": self.node_id,
            "status": self.status.value,
            "current_node_id": self.current_node.node_id if self.current_node else None,
            "history": self.history,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "error": self.error
        }

class FlowBuilder:
    """Helper class to build flows with a fluent API."""
    def __init__(self, name: str = None):
        self.name = name or f"flow_{uuid.uuid4()}"
        self.nodes = {}
        self.start_node = None
        self.current_node = None
    
    def add_node(self, node_id: str, node: Optional[Node] = None) -> 'FlowBuilder':
        """Add a node to the flow."""
        if not node:
            node = Node(node_id=node_id)
        else:
            # Ensure the node has the specified ID
            node.node_id = node_id
            
        self.nodes[node_id] = node
        
        # Set as start node if this is the first node
        if not self.start_node:
            self.start_node = node
            self.current_node = node
            
        return self
    
    def add_agent_node(self, node_id: str, agent) -> 'FlowBuilder':
        """Add an agent node to the flow."""
        node = AgentNode(agent, node_id=node_id)
        return self.add_node(node_id, node)
    
    def connect(self, from_node_id: str, action: str, to_node_id: str) -> 'FlowBuilder':
        """Connect two nodes with an edge."""
        from_node = self.nodes.get(from_node_id)
        to_node = self.nodes.get(to_node_id)
        
        if not from_node or not to_node:
            raise ValueError(f"Node not found: {from_node_id if not from_node else to_node_id}")
        
        from_node.add_edge(action, to_node)
        return self
    
    def build(self) -> Flow:
        """Build and return the flow."""
        if not self.start_node:
            raise ValueError("Cannot build flow with no nodes")
            
        flow = Flow(self.start_node, node_id=self.name)
        
        # Add all nodes to the flow
        for node_id, node in self.nodes.items():
            if node != self.start_node:  # Start node is already added in Flow constructor
                flow.add_node(node)
                
        return flow