import json
import yaml
from typing import Dict, Any, Optional, List, Union
from datetime import datetime
import uuid

from shared.models.flow import Flow, Node, AgentNode, FlowBuilder, FlowStatus
from shared.models.core import OrchestraAgent, AgentConfig, Tool
from shared.db.postgres import save_workflow, get_workflow
from shared.db.redis_cache import get_agent_state, set_agent_state
from shared.utils.logging import get_logger

logger = get_logger(__name__)

def flow_to_dict(flow: Flow) -> Dict[str, Any]:
    """Convert a Flow object to a serializable dictionary."""
    nodes_dict = {}
    edges = []
    
    # Process all nodes
    for node_id, node in flow.nodes.items():
        # Basic node info
        node_info = {
            "id": node.node_id,
            "type": node.__class__.__name__
        }
        
        # Add agent info if it's an AgentNode
        if isinstance(node, AgentNode) and hasattr(node, 'agent'):
            node_info["agent_id"] = node.agent.agent_id
            node_info["agent_type"] = node.agent.__class__.__name__
        
        nodes_dict[node_id] = node_info
        
        # Process edges
        for action, successor in node.successors.items():
            edges.append({
                "from_node": node.node_id,
                "to_node": successor.node_id,
                "action": action
            })
    
    # Build the complete flow dictionary
    flow_dict = {
        "id": flow.node_id,
        "name": getattr(flow, 'name', flow.node_id),
        "start_node": flow.start_node.node_id,
        "nodes": nodes_dict,
        "edges": edges,
        "status": flow.status.value,
        "current_node": flow.current_node.node_id if flow.current_node else None,
        "history": flow.history,
        "created_at": flow.created_at,
        "updated_at": flow.updated_at,
        "error": flow.error
    }
    
    return flow_dict

def dict_to_flow(flow_dict: Dict[str, Any], agents_registry: Optional[Dict[str, OrchestraAgent]] = None) -> Flow:
    """Convert a dictionary representation back to a Flow object.
    
    Args:
        flow_dict: Dictionary representation of the flow
        agents_registry: Optional dictionary mapping agent_ids to OrchestraAgent instances
    
    Returns:
        Flow: Reconstructed Flow object
    """
    builder = FlowBuilder(name=flow_dict.get("name", flow_dict.get("id")))
    
    # First pass: create all nodes
    for node_id, node_info in flow_dict["nodes"].items():
        if node_info.get("type") == "AgentNode" and agents_registry:
            agent_id = node_info.get("agent_id")
            if agent_id and agent_id in agents_registry:
                builder.add_agent_node(node_id, agents_registry[agent_id])
            else:
                # Fallback to regular node if agent not found
                logger.warning(f"Agent {agent_id} not found in registry, creating regular node")
                builder.add_node(node_id)
        else:
            builder.add_node(node_id)
    
    # Second pass: connect nodes
    for edge in flow_dict["edges"]:
        builder.connect(
            from_node_id=edge["from_node"],
            action=edge["action"],
            to_node_id=edge["to_node"]
        )
    
    # Build the flow
    flow = builder.build()
    
    # Restore flow state
    flow.status = FlowStatus(flow_dict.get("status", FlowStatus.PENDING.value))
    flow.history = flow_dict.get("history", [])
    flow.created_at = flow_dict.get("created_at", datetime.now().isoformat())
    flow.updated_at = flow_dict.get("updated_at", datetime.now().isoformat())
    flow.error = flow_dict.get("error")
    
    # Restore current node if possible
    current_node_id = flow_dict.get("current_node")
    if current_node_id and current_node_id in flow.nodes:
        flow.current_node = flow.nodes[current_node_id]
    
    return flow

def save_flow(flow_id: str, flow: Flow) -> None:
    """Save a flow to the database."""
    flow_dict = flow_to_dict(flow)
    save_workflow(flow_id, json.dumps(flow_dict))

def load_flow(flow_id: str, agents_registry: Optional[Dict[str, OrchestraAgent]] = None) -> Optional[Flow]:
    """Load a flow from the database."""
    flow_json = get_workflow(flow_id)
    if not flow_json:
        return None
    
    flow_dict = json.loads(flow_json)
    return dict_to_flow(flow_dict, agents_registry)

def flow_to_yaml(flow: Flow) -> str:
    """Convert a Flow object to YAML for human-readable configuration."""
    flow_dict = flow_to_dict(flow)
    return yaml.dump(flow_dict, sort_keys=False)

def yaml_to_flow(yaml_str: str, agents_registry: Optional[Dict[str, OrchestraAgent]] = None) -> Flow:
    """Convert a YAML configuration to a Flow object."""
    flow_dict = yaml.safe_load(yaml_str)
    return dict_to_flow(flow_dict, agents_registry)

def create_flow_from_workflow_graph(workflow_graph, agents_registry: Dict[str, OrchestraAgent]) -> Flow:
    """Convert a WorkflowGraph to a Flow.
    
    Args:
        workflow_graph: WorkflowGraph object from core.py
        agents_registry: Dictionary mapping agent_ids to OrchestraAgent instances
        
    Returns:
        Flow: Constructed Flow object
    """
    builder = FlowBuilder(name=workflow_graph.name)
    
    # Add all nodes
    for node_id, node_def in workflow_graph.nodes.items():
        agent_id = node_def.agent_id
        if agent_id in agents_registry:
            builder.add_agent_node(node_id, agents_registry[agent_id])
        else:
            # Fallback to regular node if agent not found
            logger.warning(f"Agent {agent_id} not found in registry, creating regular node")
            builder.add_node(node_id)
    
    # Connect nodes based on edges
    for edge in workflow_graph.edges:
        for to_node in edge.to_node:
            builder.connect(
                from_node_id=edge.from_node,
                action=edge.action,
                to_node_id=to_node
            )
    
    return builder.build()