// User Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  company?: string
  role: 'admin' | 'user'
  isActive: boolean
  settings: UserSettings
  apiKeys: {
    production: string
    development: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  notifications: {
    workflowSuccess: boolean
    workflowError: boolean
    weeklyReport: boolean
    securityAlerts: boolean
  }
  timezone: string
  defaultTimeout: number
  retryAttempts: number
  debugLogging: boolean
}

// Workflow Types
export interface Workflow {
  id: string
  name: string
  description: string
  originalInput: string
  status: 'active' | 'paused' | 'error' | 'draft'
  owner: string
  steps: WorkflowStep[]
  settings: WorkflowSettings
  schedule?: WorkflowSchedule
  execution: WorkflowExecution
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowStep {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'delay'
  service: string
  action: string
  description: string
  config: any
  position: { x: number; y: number }
  connections: string[]
}

export interface WorkflowSettings {
  timeout: number
  retries: number
  onError: 'stop' | 'continue' | 'retry'
  notifications: boolean
}

export interface WorkflowSchedule {
  type: 'cron' | 'interval' | 'webhook'
  value: string
  timezone: string
}

export interface WorkflowExecution {
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  lastRun?: Date
  nextRun?: Date
  averageRunTime: number
}

// Integration Types
export interface Integration {
  id: string
  name: string
  service: string
  category: string
  icon: string
  description: string
  owner: string
  status: 'connected' | 'error' | 'disconnected'
  credentials: {
    type: 'oauth' | 'api_key' | 'basic_auth' | 'custom'
    data: any
  }
  config: any
  lastSync?: Date
  syncStatus?: 'success' | 'error' | 'in_progress'
  syncError?: string
  usageStats: {
    totalCalls: number
    successfulCalls: number
    failedCalls: number
    lastCall?: Date
    rateLimitReset?: Date
  }
  createdAt: Date
  updatedAt: Date
}

export interface AvailableIntegration {
  id: string
  name: string
  description: string
  category: string
  icon: string
  connectionStatus?: 'connected' | 'available' | 'error'
  connectionId?: string
  lastSync?: Date
  usageStats?: Integration['usageStats']
}

// MCP Container Types
export interface MCPContainer {
  id: string
  name: string
  description: string
  image: string
  port: number
  environment: Record<string, string>
  capabilities: string[]
  owner: string
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'restarting' | 'error'
  containerId?: string
  createdAt: Date
  updatedAt: Date
  endpoints: MCPEndpoint[]
  health: {
    status: 'healthy' | 'unhealthy' | 'unknown'
    lastCheck?: Date
    uptime: number
  }
}

export interface MCPEndpoint {
  name: string
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  description?: string
}

export interface MCPExecutionResult {
  command: string
  args: string[]
  stdout: string
  stderr: string
  exitCode: number
  executionTime: number
  timestamp: Date
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: {
    items: T[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

// Workflow Execution Types
export interface WorkflowExecutionInstance {
  id: string
  workflowId: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: Date
  completedAt?: Date
  duration?: number
  stepsCompleted: number
  stepsTotal: number
  currentStep?: string
  error?: string
  inputData?: any
  outputData?: any
  logs: ExecutionLog[]
}

export interface ExecutionLog {
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  stepId?: string
  data?: any
}

// AI Service Types
export interface AIParsingResult {
  name: string
  description: string
  originalInput: string
  steps: WorkflowStep[]
  confidence: number
  suggestions?: string[]
}

export interface AIValidationResult {
  valid: boolean
  issues: ValidationIssue[]
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  step?: string
  suggestion?: string
}

export interface AISuggestion {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'performance' | 'security' | 'functionality' | 'best-practice'
}

// Authentication Types
export interface AuthToken {
  token: string
  expiresAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  company?: string
}

// Dashboard Types
export interface DashboardStats {
  workflows: {
    active: number
    paused: number
    error: number
    draft: number
  }
  executions: {
    totalRuns: number
    successfulRuns: number
    failedRuns: number
    successRate: number
  }
  integrations: {
    connected: number
    available: number
    error: number
  }
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'workflow_created' | 'workflow_executed' | 'integration_connected' | 'error_occurred'
  title: string
  description: string
  timestamp: Date
  metadata?: any
}

// Socket.IO Event Types
export interface SocketEvents {
  'workflow-created': (data: { workflow: Workflow }) => void
  'workflow-updated': (data: { workflow: Workflow }) => void
  'workflow-deleted': (data: { workflowId: string }) => void
  'workflow-started': (data: { workflow: Workflow }) => void
  'workflow-paused': (data: { workflow: Workflow }) => void
  'workflow-execution-started': (data: { workflowId: string, executionId: string, inputData?: any }) => void
  'workflow-execution-completed': (data: { workflowId: string, executionId: string, result: any }) => void
  'workflow-execution-failed': (data: { workflowId: string, executionId: string, error: string }) => void
  'integration-connected': (data: { integration: Integration }) => void
  'integration-disconnected': (data: { integrationId: string }) => void
  'mcp-container-started': (data: { container: MCPContainer }) => void
  'mcp-container-stopped': (data: { container: MCPContainer }) => void
}

// Form Types
export interface WorkflowFormData {
  name: string
  description: string
  originalInput?: string
  steps: WorkflowStep[]
  settings?: Partial<WorkflowSettings>
  schedule?: WorkflowSchedule
}

export interface IntegrationFormData {
  service: string
  credentials: {
    type: 'oauth' | 'api_key' | 'basic_auth' | 'custom'
    data: any
  }
  config?: any
}

export interface MCPContainerFormData {
  name: string
  description: string
  image: string
  port: number
  environment: Record<string, string>
  capabilities: string[]
}