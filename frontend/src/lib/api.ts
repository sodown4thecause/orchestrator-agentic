import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  WorkflowGraph,
  WorkflowResponse,
  RunResponse,
  RunStatus,
  GenerateWorkflowRequest,
  GenerateWorkflowResponse,
  Tool,
  AgentConfig,
  Integration,
  OAuthStartResponse,
  MCPServer,
} from '@/types';

class OrchestraAPI {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.apiKey = process.env.NEXT_PUBLIC_API_KEY || 'orchestra-secret-key';
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      timeout: 30000,
    });

    // Request interceptor for debugging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async health(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Workflow Management
  async createWorkflow(workflow: Omit<WorkflowGraph, 'id'>): Promise<WorkflowResponse> {
    const response = await this.client.post('/v1/workflows', {
      name: workflow.name,
      description: workflow.description,
      graph: {
        trigger: workflow.trigger,
        start_node: workflow.start_node,
        nodes: workflow.nodes,
        edges: workflow.edges,
      },
    });
    return response.data;
  }

  async getWorkflows(): Promise<WorkflowGraph[]> {
    const response = await this.client.get('/v1/workflows');
    return response.data;
  }

  async getWorkflow(workflowId: string): Promise<WorkflowGraph> {
    const response = await this.client.get(`/v1/workflows/${workflowId}`);
    return response.data;
  }

  async updateWorkflow(workflowId: string, workflow: Partial<WorkflowGraph>): Promise<WorkflowResponse> {
    const response = await this.client.put(`/v1/workflows/${workflowId}`, {
      name: workflow.name,
      description: workflow.description,
      graph: {
        trigger: workflow.trigger,
        start_node: workflow.start_node,
        nodes: workflow.nodes,
        edges: workflow.edges,
      },
    });
    return response.data;
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.client.delete(`/v1/workflows/${workflowId}`);
  }

  // NLP Workflow Generation
  async generateWorkflow(request: GenerateWorkflowRequest): Promise<GenerateWorkflowResponse> {
    const response = await this.client.post('/v1/workflows/generate', request);
    return response.data;
  }

  // Workflow Execution
  async runWorkflow(workflowId: string, initialContext: Record<string, any> = {}): Promise<RunResponse> {
    const response = await this.client.post(`/v1/workflows/${workflowId}/run`, {
      initial_context: initialContext,
    });
    return response.data;
  }

  async getRunStatus(runId: string): Promise<RunStatus> {
    const response = await this.client.get(`/v1/runs/${runId}`);
    return response.data;
  }

  async getRuns(workflowId?: string): Promise<RunStatus[]> {
    const url = workflowId ? `/v1/runs?workflow_id=${workflowId}` : '/v1/runs';
    const response = await this.client.get(url);
    return response.data;
  }

  async pauseRun(runId: string): Promise<void> {
    await this.client.post(`/v1/runs/${runId}/pause`);
  }

  async resumeRun(runId: string): Promise<void> {
    await this.client.post(`/v1/runs/${runId}/resume`);
  }

  async cancelRun(runId: string): Promise<void> {
    await this.client.post(`/v1/runs/${runId}/cancel`);
  }

  // Agents and Tools
  async getAgents(): Promise<AgentConfig[]> {
    const response = await this.client.get('/v1/agents');
    return response.data;
  }

  async getTools(): Promise<Tool[]> {
    const response = await this.client.get('/v1/tools');
    return response.data;
  }

  async getToolsByCategory(category: string): Promise<Tool[]> {
    const response = await this.client.get(`/v1/tools?category=${category}`);
    return response.data;
  }

  // Integrations
  async getIntegrations(): Promise<Integration[]> {
    const response = await this.client.get('/v1/integrations');
    return response.data;
  }

  async startOAuth(provider: string): Promise<OAuthStartResponse> {
    const response = await this.client.post('/v1/integrations/oauth/start', {
      provider,
    });
    return response.data;
  }

  async completeOAuth(provider: string, code: string, state: string): Promise<Integration> {
    const response = await this.client.post('/v1/integrations/oauth/complete', {
      provider,
      code,
      state,
    });
    return response.data;
  }

  async disconnectIntegration(integrationId: string): Promise<void> {
    await this.client.delete(`/v1/integrations/${integrationId}`);
  }

  // MCP Server Management
  async getMCPServers(): Promise<MCPServer[]> {
    const response = await this.client.get('/v1/mcp/servers');
    return response.data;
  }

  async addMCPServer(server: Omit<MCPServer, 'id' | 'status' | 'tools'>): Promise<MCPServer> {
    const response = await this.client.post('/v1/mcp/servers', server);
    return response.data;
  }

  async removeMCPServer(serverId: string): Promise<void> {
    await this.client.delete(`/v1/mcp/servers/${serverId}`);
  }

  async testMCPServer(serverId: string): Promise<{ status: string; tools: any[] }> {
    const response = await this.client.post(`/v1/mcp/servers/${serverId}/test`);
    return response.data;
  }

  // WebSocket connection for real-time updates
  createWebSocket(runId: string): WebSocket {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/v1/runs/${runId}/ws`);
    
    ws.onopen = () => {
      console.log(`WebSocket connected for run ${runId}`);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log(`WebSocket disconnected for run ${runId}`);
    };
    
    return ws;
  }

  // Utility methods
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.client.defaults.headers['X-API-Key'] = apiKey;
  }

  setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }
}

// Create singleton instance
export const orchestraAPI = new OrchestraAPI();
export default orchestraAPI;