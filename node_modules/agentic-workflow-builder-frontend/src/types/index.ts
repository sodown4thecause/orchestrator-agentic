// Core Orchestra Types
export interface WorkflowGraph {
  name: string;
  description?: string;
  trigger: Record<string, any>;
  start_node: string;
  nodes: Record<string, NodeDefinition>;
  edges: EdgeDefinition[];
}

export interface NodeDefinition {
  agent_id: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  position?: { x: number; y: number };
  type?: 'agent' | 'condition' | 'trigger' | 'action';
}

export interface EdgeDefinition {
  from_node: string;
  to_node: string[];
  action: string;
  condition?: string;
}

export interface ContextObject {
  trigger_data: Record<string, any>;
  node_outputs: Record<string, any>;
  workflow_state: Record<string, any>;
}

export interface AgentConfig {
  llm_provider: string;
  model_name: string;
  temperature: number;
}

export interface Tool {
  name: string;
  description: string;
  schema: Record<string, any>;
  category?: string;
  provider?: string;
}

// API Response Types
export interface WorkflowResponse {
  workflow_id: string;
  version: number;
  created_at: string;
  validated: boolean;
}

export interface RunResponse {
  run_id: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  flow_id?: string;
}

export interface RunStatus {
  run_id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  current_nodes: string[];
  completed_nodes: string[];
  context: Record<string, any>;
  history: Array<{
    timestamp: string;
    node_id: string;
    action: string;
    result?: any;
    error?: string;
  }>;
  created_at: string;
  updated_at: string;
  error?: string;
}

export interface GenerateWorkflowRequest {
  goal: string;
  context?: Record<string, any>;
}

export interface GenerateWorkflowResponse {
  workflow_id: string;
  graph: {
    nodes: any[];
    edges: any[];
  };
  confidence_score: number;
}

// AG-UI Integration Types
export interface AGUIEvent {
  type: string;
  data: any;
  timestamp: string;
  source?: string;
}

export interface AGUIMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AGUIState {
  isConnected: boolean;
  currentWorkflow?: string;
  activeRun?: string;
  messages: AGUIMessage[];
  context: Record<string, any>;
}

// UI State Types
export interface WorkflowEditorState {
  nodes: NodeDefinition[];
  edges: EdgeDefinition[];
  selectedNode?: string;
  selectedEdge?: string;
  isEditing: boolean;
  isDirty: boolean;
}

export interface AppState {
  workflows: WorkflowGraph[];
  currentWorkflow?: WorkflowGraph;
  runs: RunStatus[];
  tools: Tool[];
  agents: AgentConfig[];
  isLoading: boolean;
  error?: string;
}

// Form Types
export interface CreateWorkflowForm {
  name: string;
  description: string;
  goal?: string; // For NLP generation
}

export interface NodeForm {
  agent_id: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  type: 'agent' | 'condition' | 'trigger' | 'action';
}

export interface EdgeForm {
  from_node: string;
  to_node: string;
  action: string;
  condition?: string;
}

// Integration Types
export interface Integration {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  tools: Tool[];
  config: Record<string, any>;
}

export interface OAuthStartResponse {
  auth_url: string;
  state: string;
}

// MCP (Model Context Protocol) Types for tool integration
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  provider: string;
  category: string;
}

export interface MCPServer {
  id?: string;
  name: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  headers?: Record<string, string>;
  status: 'connected' | 'disconnected' | 'error';
  tools: MCPTool[];
  type?: 'http' | 'stdio' | 'remote';
}

// Real-time updates
export interface WorkflowUpdate {
  type: 'node_started' | 'node_completed' | 'node_failed' | 'workflow_completed' | 'workflow_failed';
  run_id: string;
  node_id?: string;
  data?: any;
  timestamp: string;
}