const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const INTENT_PARSER_URL = process.env.NEXT_PUBLIC_INTENT_PARSER_URL || 'http://localhost:8003';
const WORKFLOW_ENGINE_URL = process.env.NEXT_PUBLIC_WORKFLOW_ENGINE_URL || 'http://localhost:8001';

// Types
export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  agent: string;
  tools: string[];
  dependencies: string[];
  estimatedTime: string;
  parameters?: Record<string, any>;
}

export interface ParsedIntent {
  objective: string;
  confidence: number;
  requiredData: string[];
  outputFormat: string;
  steps: WorkflowStep[];
  complexity: 'simple' | 'medium' | 'complex';
}

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'stopped' | 'error';
  url: string;
  tools: MCPTool[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'draft' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// API Client Class
class ApiClient {
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Intent Parser API
  async parseIntent(command: string, context?: Record<string, any>): Promise<ParsedIntent> {
    return this.request<ParsedIntent>(`${INTENT_PARSER_URL}/parse`, {
      method: 'POST',
      body: JSON.stringify({ command, context }),
    });
  }

  async generateWorkflow(intent: ParsedIntent): Promise<Workflow> {
    return this.request<Workflow>(`${INTENT_PARSER_URL}/generate`, {
      method: 'POST',
      body: JSON.stringify({ intent }),
    });
  }

  async getAvailableTools(): Promise<{ tools: Record<string, string[]>; agents: Record<string, string[]> }> {
    return this.request(`${INTENT_PARSER_URL}/tools`);
  }

  // Workflow Engine API
  async getWorkflows(): Promise<Workflow[]> {
    return this.request<Workflow[]>(`${WORKFLOW_ENGINE_URL}/workflows`);
  }

  async getWorkflow(id: string): Promise<Workflow> {
    return this.request<Workflow>(`${WORKFLOW_ENGINE_URL}/workflows/${id}`);
  }

  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    return this.request<Workflow>(`${WORKFLOW_ENGINE_URL}/workflows`, {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    return this.request<Workflow>(`${WORKFLOW_ENGINE_URL}/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflow),
    });
  }

  async deleteWorkflow(id: string): Promise<void> {
    await this.request(`${WORKFLOW_ENGINE_URL}/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  async executeWorkflow(id: string): Promise<{ executionId: string }> {
    return this.request<{ executionId: string }>(`${WORKFLOW_ENGINE_URL}/workflows/${id}/execute`, {
      method: 'POST',
    });
  }

  async getWorkflowExecution(workflowId: string, executionId: string): Promise<any> {
    return this.request(`${WORKFLOW_ENGINE_URL}/workflows/${workflowId}/executions/${executionId}`);
  }

  async stopWorkflowExecution(workflowId: string, executionId: string): Promise<void> {
    await this.request(`${WORKFLOW_ENGINE_URL}/workflows/${workflowId}/executions/${executionId}/stop`, {
      method: 'POST',
    });
  }

  // MCP Server Management API
  async getMCPServers(): Promise<MCPServer[]> {
    return this.request<MCPServer[]>(`${API_BASE_URL}/mcp/servers`);
  }

  async getMCPServer(id: string): Promise<MCPServer> {
    return this.request<MCPServer>(`${API_BASE_URL}/mcp/servers/${id}`);
  }

  async createMCPServer(server: Omit<MCPServer, 'id' | 'tools'>): Promise<MCPServer> {
    return this.request<MCPServer>(`${API_BASE_URL}/mcp/servers`, {
      method: 'POST',
      body: JSON.stringify(server),
    });
  }

  async updateMCPServer(id: string, server: Partial<MCPServer>): Promise<MCPServer> {
    return this.request<MCPServer>(`${API_BASE_URL}/mcp/servers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(server),
    });
  }

  async deleteMCPServer(id: string): Promise<void> {
    await this.request(`${API_BASE_URL}/mcp/servers/${id}`, {
      method: 'DELETE',
    });
  }

  async startMCPServer(id: string): Promise<void> {
    await this.request(`${API_BASE_URL}/mcp/servers/${id}/start`, {
      method: 'POST',
    });
  }

  async stopMCPServer(id: string): Promise<void> {
    await this.request(`${API_BASE_URL}/mcp/servers/${id}/stop`, {
      method: 'POST',
    });
  }

  async getMCPServerTools(id: string): Promise<MCPTool[]> {
    return this.request<MCPTool[]>(`${API_BASE_URL}/mcp/servers/${id}/tools`);
  }

  async executeMCPTool(
    serverId: string,
    toolName: string,
    parameters: Record<string, any>
  ): Promise<any> {
    return this.request(`${API_BASE_URL}/mcp/servers/${serverId}/tools/${toolName}/execute`, {
      method: 'POST',
      body: JSON.stringify({ parameters }),
    });
  }

  // Health checks
  async healthCheck(): Promise<{ status: string; services: Record<string, string> }> {
    const services = await Promise.allSettled([
      this.request(`${API_BASE_URL}/health`),
      this.request(`${INTENT_PARSER_URL}/health`),
      this.request(`${WORKFLOW_ENGINE_URL}/health`),
    ]);

    return {
      status: services.every(s => s.status === 'fulfilled') ? 'healthy' : 'degraded',
      services: {
        'api-gateway': services[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        'intent-parser': services[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        'workflow-engine': services[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      },
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual API functions for convenience
export const {
  parseIntent,
  generateWorkflow,
  getAvailableTools,
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  getWorkflowExecution,
  stopWorkflowExecution,
  getMCPServers,
  getMCPServer,
  createMCPServer,
  updateMCPServer,
  deleteMCPServer,
  startMCPServer,
  stopMCPServer,
  getMCPServerTools,
  executeMCPTool,
  healthCheck,
} = apiClient;