import asyncio
import json
from typing import Dict, Any, List

# Import shared modules
from shared.models.core import OrchestraAgent, AgentConfig, Tool, ToolConfig
from shared.models.flow import Flow, Node, AgentNode, FlowBuilder
from shared.utils.flow_utils import flow_to_dict, dict_to_flow, flow_to_yaml
from shared.utils.logging import get_logger

logger = get_logger(__name__)

# Example agent implementations
class RAGAgent(OrchestraAgent):
    """Example RAG agent implementation."""
    def prep(self, context: Dict[str, Any]) -> Dict[str, Any]:
        query = context.get("query", "")
        return {"query": query, "retrieval_context": []}
    
    def exec(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        # Simulate retrieval and generation
        query = inputs.get("query", "")
        # In a real implementation, this would search a vector store
        retrieved_docs = [f"Document about {query}", f"Another document about {query}"]
        return {"retrieved_docs": retrieved_docs, "query": query}
    
    def post(self, result: Dict[str, Any], context: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        # Update context with retrieved documents
        updated_context = context.copy()
        updated_context["retrieved_docs"] = result.get("retrieved_docs", [])
        return "success", updated_context

class GenerationAgent(OrchestraAgent):
    """Example text generation agent."""
    def prep(self, context: Dict[str, Any]) -> Dict[str, Any]:
        query = context.get("query", "")
        retrieved_docs = context.get("retrieved_docs", [])
        return {"query": query, "context": retrieved_docs}
    
    def exec(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        # Simulate LLM generation
        query = inputs.get("query", "")
        context = inputs.get("context", [])
        # In a real implementation, this would call an LLM
        response = f"Generated response to '{query}' based on {len(context)} documents"
        return {"response": response}
    
    def post(self, result: Dict[str, Any], context: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        # Update context with generated response
        updated_context = context.copy()
        updated_context["response"] = result.get("response", "")
        return "success", updated_context

class ValidationAgent(OrchestraAgent):
    """Example validation agent that can approve or reject responses."""
    def prep(self, context: Dict[str, Any]) -> Dict[str, Any]:
        response = context.get("response", "")
        return {"response": response, "criteria": ["relevance", "accuracy", "completeness"]}
    
    def exec(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        # Simulate validation
        response = inputs.get("response", "")
        # In a real implementation, this would use an LLM to validate
        # For this example, we'll randomly approve or reject
        import random
        approved = random.choice([True, False])
        reason = "Response meets all criteria" if approved else "Response is incomplete"
        return {"approved": approved, "reason": reason}
    
    def post(self, result: Dict[str, Any], context: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        # Determine next action based on validation result
        approved = result.get("approved", False)
        reason = result.get("reason", "")
        
        updated_context = context.copy()
        updated_context["validation"] = {"approved": approved, "reason": reason}
        
        # Return different action based on approval
        action = "approved" if approved else "rejected"
        return action, updated_context

class RevisionAgent(OrchestraAgent):
    """Example agent that revises rejected responses."""
    def prep(self, context: Dict[str, Any]) -> Dict[str, Any]:
        original_response = context.get("response", "")
        validation = context.get("validation", {})
        reason = validation.get("reason", "")
        query = context.get("query", "")
        retrieved_docs = context.get("retrieved_docs", [])
        
        return {
            "original_response": original_response,
            "rejection_reason": reason,
            "query": query,
            "context": retrieved_docs
        }
    
    def exec(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        # Simulate revision
        original = inputs.get("original_response", "")
        reason = inputs.get("rejection_reason", "")
        # In a real implementation, this would call an LLM
        revised = f"Revised version of: {original}. Addressing: {reason}"
        return {"revised_response": revised}
    
    def post(self, result: Dict[str, Any], context: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        # Update context with revised response
        updated_context = context.copy()
        updated_context["response"] = result.get("revised_response", "")
        return "revised", updated_context

# Example function to create a RAG workflow
def create_rag_workflow() -> Flow:
    """Create a RAG workflow with validation and revision."""
    # Create agents
    rag_agent = RAGAgent(
        agent_id="rag_agent",
        config=AgentConfig(llm_provider="openai", model_name="gpt-4-turbo")
    )
    
    gen_agent = GenerationAgent(
        agent_id="gen_agent",
        config=AgentConfig(llm_provider="openai", model_name="gpt-4-turbo")
    )
    
    validation_agent = ValidationAgent(
        agent_id="validation_agent",
        config=AgentConfig(llm_provider="openai", model_name="gpt-4-turbo")
    )
    
    revision_agent = RevisionAgent(
        agent_id="revision_agent",
        config=AgentConfig(llm_provider="openai", model_name="gpt-4-turbo")
    )
    
    # Create flow using builder
    builder = FlowBuilder(name="rag_workflow")
    
    # Add nodes
    builder.add_agent_node("retrieval", rag_agent)
    builder.add_agent_node("generation", gen_agent)
    builder.add_agent_node("validation", validation_agent)
    builder.add_agent_node("revision", revision_agent)
    
    # Connect nodes
    builder.connect("retrieval", "success", "generation")
    builder.connect("generation", "success", "validation")
    builder.connect("validation", "approved", "output")
    builder.connect("validation", "rejected", "revision")
    builder.connect("revision", "revised", "validation")
    
    # Add output node
    builder.add_node("output")
    
    return builder.build()

# Example function to run a flow
async def run_flow(flow: Flow, initial_context: Dict[str, Any]) -> Dict[str, Any]:
    """Run a flow with the given initial context."""
    try:
        result = await flow.exec(initial_context)
        print(f"Flow completed with status: {flow.status.value}")
        print(f"Flow history:\n{json.dumps(flow.history, indent=2)}")
        return result
    except Exception as e:
        print(f"Flow failed: {str(e)}")
        print(f"Flow status: {flow.status.value}")
        print(f"Flow error: {flow.error}")
        print(f"Flow history:\n{json.dumps(flow.history, indent=2)}")
        return {"error": str(e)}

# Example usage
async def main():
    # Create workflow
    flow = create_rag_workflow()
    
    # Print flow as YAML for inspection
    print("Flow configuration:")
    print(flow_to_yaml(flow))
    
    # Run flow with initial context
    initial_context = {"query": "How does the PocketFlow framework work?"}
    result = await run_flow(flow, initial_context)
    
    # Print final result
    print("\nFinal result:")
    print(json.dumps(result, indent=2))

# Run the example
if __name__ == "__main__":
    asyncio.run(main())