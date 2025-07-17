import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  WorkflowGraph,
  RunStatus,
  Tool,
  AgentConfig,
  Integration,
  MCPServer,
  WorkflowEditorState,
  AGUIState,
} from '@/types';
import { orchestraAPI } from '@/lib/api';

// Helper function to safely get error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
};

// Main application store
interface AppStore {
  // State
  workflows: WorkflowGraph[];
  currentWorkflow?: WorkflowGraph;
  runs: RunStatus[];
  tools: Tool[];
  agents: AgentConfig[];
  integrations: Integration[];
  mcpServers: MCPServer[];
  isLoading: boolean;
  error?: string;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  
  // Workflow actions
  loadWorkflows: () => Promise<void>;
  createWorkflow: (workflow: Omit<WorkflowGraph, 'id'>) => Promise<string>;
  updateWorkflow: (id: string, workflow: Partial<WorkflowGraph>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  setCurrentWorkflow: (workflow?: WorkflowGraph) => void;
  generateWorkflow: (goal: string, context?: Record<string, any>) => Promise<WorkflowGraph>;
  
  // Run actions
  loadRuns: (workflowId?: string) => Promise<void>;
  runWorkflow: (workflowId: string, context?: Record<string, any>) => Promise<string>;
  pauseRun: (runId: string) => Promise<void>;
  resumeRun: (runId: string) => Promise<void>;
  cancelRun: (runId: string) => Promise<void>;
  updateRunStatus: (runId: string, status: Partial<RunStatus>) => void;
  
  // Tools and agents
  loadTools: () => Promise<void>;
  loadAgents: () => Promise<void>;
  
  // Integrations
  loadIntegrations: () => Promise<void>;
  startOAuth: (provider: string) => Promise<string>;
  disconnectIntegration: (id: string) => Promise<void>;
  
  // MCP Servers
  loadMCPServers: () => Promise<void>;
  addMCPServer: (server: Omit<MCPServer, 'id' | 'status' | 'tools'>) => Promise<void>;
  removeMCPServer: (id: string) => Promise<void>;
  testMCPServer: (id: string) => Promise<{ status: string; tools: any[] }>;
}

export const useAppStore = create<AppStore>()
  (devtools(
    persist(
      (set, get) => ({
        // Initial state
        workflows: [],
        runs: [],
        tools: [],
        agents: [],
        integrations: [],
        mcpServers: [],
        isLoading: false,

        // Basic actions
        setLoading: (loading: boolean) => set({ isLoading: loading }),
        setError: (error?: string) => set({ error }),

        // Workflow actions
        loadWorkflows: async () => {
          set({ isLoading: true, error: undefined });
          try {
            const workflows = await orchestraAPI.getWorkflows();
            set({ workflows, isLoading: false });
          } catch (error) {
            set({ error: getErrorMessage(error), isLoading: false });
          }
        },

        createWorkflow: async (workflow: Omit<WorkflowGraph, 'id'>) => {
          set({ isLoading: true, error: undefined });
          try {
            const response = await orchestraAPI.createWorkflow(workflow);
            await get().loadWorkflows(); // Reload workflows
            set({ isLoading: false });
            return response.workflow_id;
          } catch (error) {
            set({ error: getErrorMessage(error), isLoading: false });
            throw error;
          }
        },

        updateWorkflow: async (id: string, workflow: Partial<WorkflowGraph>) => {
          set({ isLoading: true, error: undefined });
          try {
            await orchestraAPI.updateWorkflow(id, workflow);
            await get().loadWorkflows(); // Reload workflows
            set({ isLoading: false });
          } catch (error) {
            set({ error: getErrorMessage(error), isLoading: false });
            throw error;
          }
        },

        deleteWorkflow: async (id: string) => {
          set({ isLoading: true, error: undefined });
          try {
            await orchestraAPI.deleteWorkflow(id);
            const workflows = get().workflows.filter((w: any) => w.id !== id);
            set({ workflows, isLoading: false });
          } catch (error) {
            set({ error: getErrorMessage(error), isLoading: false });
            throw error;
          }
        },

        setCurrentWorkflow: (workflow?: WorkflowGraph) => set({ currentWorkflow: workflow }),

        generateWorkflow: async (goal: string, context?: Record<string, any>) => {
          set({ isLoading: true, error: undefined });
          try {
            const response = await orchestraAPI.generateWorkflow({ goal, context });
            // Convert the generated graph to a full workflow
            const workflow: WorkflowGraph = {
              name: `Generated: ${goal.substring(0, 50)}...`,
              description: `Auto-generated workflow for: ${goal}`,
              trigger: {},
              start_node: response.graph.nodes[0]?.id || '',
              nodes: response.graph.nodes.reduce((acc: any, node: any) => {
                acc[node.id] = node;
                return acc;
              }, {}),
              edges: response.graph.edges,
            };
            set({ isLoading: false });
            return workflow;
          } catch (error) {
            set({ error: getErrorMessage(error), isLoading: false });
            throw error;
          }
        },

        // Run actions
        loadRuns: async (workflowId?: string) => {
          set({ isLoading: true, error: undefined });
          try {
            const runs = await orchestraAPI.getRuns(workflowId);
            set({ runs, isLoading: false });
          } catch (error) {
            set({ error: getErrorMessage(error), isLoading: false });
          }
        },

        runWorkflow: async (workflowId: string, context?: Record<string, any>) => {
          set({ isLoading: true, error: undefined });
          try {
            const response = await orchestraAPI.runWorkflow(workflowId, context);
            await get().loadRuns(); // Reload runs
            set({ isLoading: false });
            return response.run_id;
          } catch (error) {
            set({ error: getErrorMessage(error), isLoading: false });
            throw error;
          }
        },

        pauseRun: async (runId: string) => {
          try {
            await orchestraAPI.pauseRun(runId);
            await get().loadRuns(); // Reload runs
          } catch (error) {
            set({ error: getErrorMessage(error) });
            throw error;
          }
        },

        resumeRun: async (runId: string) => {
          try {
            await orchestraAPI.resumeRun(runId);
            await get().loadRuns(); // Reload runs
          } catch (error) {
            set({ error: getErrorMessage(error) });
            throw error;
          }
        },

        cancelRun: async (runId: string) => {
          try {
            await orchestraAPI.cancelRun(runId);
            await get().loadRuns(); // Reload runs
          } catch (error) {
            set({ error: getErrorMessage(error) });
            throw error;
          }
        },

        updateRunStatus: (runId: string, status: Partial<RunStatus>) => {
          const runs = get().runs.map((run) =>
            run.run_id === runId ? { ...run, ...status } : run
          );
          set({ runs });
        },

        // Tools and agents
        loadTools: async () => {
          try {
            const tools = await orchestraAPI.getTools();
            set({ tools });
          } catch (error) {
            set({ error: getErrorMessage(error) });
          }
        },

        loadAgents: async () => {
          try {
            const agents = await orchestraAPI.getAgents();
            set({ agents });
          } catch (error) {
            set({ error: getErrorMessage(error) });
          }
        },

        // Integrations
        loadIntegrations: async () => {
          try {
            const integrations = await orchestraAPI.getIntegrations();
            set({ integrations });
          } catch (error) {
            set({ error: getErrorMessage(error) });
          }
        },

        startOAuth: async (provider: string) => {
          try {
            const response = await orchestraAPI.startOAuth(provider);
            return response.auth_url;
          } catch (error) {
            set({ error: getErrorMessage(error) });
            throw error;
          }
        },

        disconnectIntegration: async (id: string) => {
          try {
            await orchestraAPI.disconnectIntegration(id);
            await get().loadIntegrations(); // Reload integrations
          } catch (error) {
            set({ error: getErrorMessage(error) });
            throw error;
          }
        },

        // MCP Servers
        loadMCPServers: async () => {
          try {
            const mcpServers = await orchestraAPI.getMCPServers();
            set({ mcpServers });
          } catch (error) {
            set({ error: getErrorMessage(error) });
          }
        },

        addMCPServer: async (server: Omit<MCPServer, 'id' | 'status' | 'tools'>) => {
          try {
            await orchestraAPI.addMCPServer(server);
            await get().loadMCPServers(); // Reload servers
          } catch (error) {
            set({ error: getErrorMessage(error) });
            throw error;
          }
        },

        removeMCPServer: async (id: string) => {
          try {
            await orchestraAPI.removeMCPServer(id);
            await get().loadMCPServers(); // Reload servers
          } catch (error) {
            set({ error: getErrorMessage(error) });
            throw error;
          }
        },

        testMCPServer: async (id: string) => {
          try {
            const result = await orchestraAPI.testMCPServer(id);
            return result;
          } catch (error) {
            set({ error: getErrorMessage(error) });
            throw error;
          }
        },
      }),
      {
        name: 'orchestra-app-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          currentWorkflow: state.currentWorkflow,
        }),
      }
    ),
    {
      name: 'orchestra-app-store',
    }
  ));

// Workflow editor store
interface WorkflowEditorStore extends WorkflowEditorState {
  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
  setSelectedNode: (nodeId?: string) => void;
  setSelectedEdge: (edgeId?: string) => void;
  setEditing: (editing: boolean) => void;
  setDirty: (dirty: boolean) => void;
  addNode: (node: any) => void;
  updateNode: (nodeId: string, updates: any) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: any) => void;
  updateEdge: (edgeId: string, updates: any) => void;
  removeEdge: (edgeId: string) => void;
  reset: () => void;
}

export const useWorkflowEditorStore = create<WorkflowEditorStore>()
  (devtools(
    (set, get) => ({
      nodes: [],
      edges: [],
      isEditing: false,
      isDirty: false,

      setNodes: (nodes: any[]) => set({ nodes, isDirty: true }),
      setEdges: (edges: any[]) => set({ edges, isDirty: true }),
      setSelectedNode: (selectedNode?: string) => set({ selectedNode }),
      setSelectedEdge: (selectedEdge?: string) => set({ selectedEdge }),
      setEditing: (isEditing: boolean) => set({ isEditing }),
      setDirty: (isDirty: boolean) => set({ isDirty }),

      addNode: (node: any) => {
        const nodes = [...get().nodes, node];
        set({ nodes, isDirty: true });
      },

      updateNode: (nodeId: string, updates: any) => {
        const nodes = get().nodes.map((node) =>
          node.id === nodeId ? { ...node, ...updates } : node
        );
        set({ nodes, isDirty: true });
      },

      removeNode: (nodeId: string) => {
        const nodes = get().nodes.filter((node) => node.id !== nodeId);
        const edges = get().edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        );
        set({ nodes, edges, isDirty: true });
      },

      addEdge: (edge: any) => {
        const edges = [...get().edges, edge];
        set({ edges, isDirty: true });
      },

      updateEdge: (edgeId: string, updates: any) => {
        const edges = get().edges.map((edge) =>
          edge.id === edgeId ? { ...edge, ...updates } : edge
        );
        set({ edges, isDirty: true });
      },

      removeEdge: (edgeId: string) => {
        const edges = get().edges.filter((edge) => edge.id !== edgeId);
        set({ edges, isDirty: true });
      },

      reset: () => set({
        nodes: [],
        edges: [],
        selectedNode: undefined,
        selectedEdge: undefined,
        isEditing: false,
        isDirty: false,
      }),
    }),
    {
      name: 'workflow-editor-store',
    }
  ));

// AG-UI integration store
interface AGUIStore extends AGUIState {
  connect: (workflowId?: string) => void;
  disconnect: () => void;
  sendMessage: (content: string, type?: 'user' | 'agent' | 'system') => void;
  addMessage: (message: any) => void;
  updateContext: (updates: Record<string, any>) => void;
  setActiveRun: (runId?: string) => void;
}

export const useAGUIStore = create<AGUIStore>()
  (devtools(
    (set, get) => ({
      isConnected: false,
      messages: [],
      context: {},

      connect: (workflowId?: string) => {
        set({ isConnected: true, currentWorkflow: workflowId });
      },

      disconnect: () => {
        set({ isConnected: false, currentWorkflow: undefined, activeRun: undefined });
      },

      sendMessage: (content: string, type: 'user' | 'agent' | 'system' = 'user') => {
        const message = {
          id: `msg_${Date.now()}`,
          type,
          content,
          timestamp: new Date().toISOString(),
        };
        const messages = [...get().messages, message];
        set({ messages });
      },

      addMessage: (message: any) => {
        const messages = [...get().messages, message];
        set({ messages });
      },

      updateContext: (updates: Record<string, any>) => {
        const context = { ...get().context, ...updates };
        set({ context });
      },

      setActiveRun: (activeRun?: string) => set({ activeRun }),
    }),
    {
      name: 'agui-store',
    }
  ));