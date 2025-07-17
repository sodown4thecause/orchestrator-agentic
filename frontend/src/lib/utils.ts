import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { WorkflowGraph, NodeDefinition, EdgeDefinition } from '@/types';

// Tailwind CSS class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

// Workflow utilities
export function validateWorkflow(workflow: WorkflowGraph): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if workflow has a name
  if (!workflow.name || workflow.name.trim() === '') {
    errors.push('Workflow name is required');
  }

  // Check if start_node exists
  if (!workflow.start_node || !workflow.nodes[workflow.start_node]) {
    errors.push('Start node must be specified and exist in nodes');
  }

  // Check if all edge references exist
  workflow.edges.forEach((edge, index) => {
    if (!workflow.nodes[edge.from_node]) {
      errors.push(`Edge ${index}: from_node '${edge.from_node}' does not exist`);
    }
    edge.to_node.forEach((toNode) => {
      if (!workflow.nodes[toNode]) {
        errors.push(`Edge ${index}: to_node '${toNode}' does not exist`);
      }
    });
  });

  // Check for orphaned nodes (nodes with no incoming edges except start_node)
  const nodesWithIncomingEdges = new Set([workflow.start_node]);
  workflow.edges.forEach((edge) => {
    edge.to_node.forEach((toNode) => {
      nodesWithIncomingEdges.add(toNode);
    });
  });

  Object.keys(workflow.nodes).forEach((nodeId) => {
    if (!nodesWithIncomingEdges.has(nodeId)) {
      errors.push(`Node '${nodeId}' is orphaned (no incoming edges)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateEdgeId(): string {
  return `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Convert workflow to React Flow format
export function workflowToReactFlow(workflow: WorkflowGraph) {
  const nodes = Object.entries(workflow.nodes).map(([id, node]) => ({
    id,
    type: 'custom',
    position: node.position || { x: 0, y: 0 },
    data: {
      label: node.agent_id,
      agent_id: node.agent_id,
      inputs: node.inputs,
      outputs: node.outputs,
      type: node.type || 'agent',
    },
  }));

  const edges = workflow.edges.flatMap((edge) =>
    edge.to_node.map((toNode, index) => ({
      id: `${edge.from_node}-${toNode}-${index}`,
      source: edge.from_node,
      target: toNode,
      label: edge.condition || edge.action,
      type: 'smoothstep',
    }))
  );

  return { nodes, edges };
}

// Convert React Flow format back to workflow
export function reactFlowToWorkflow(
  nodes: any[],
  edges: any[],
  name: string,
  description?: string
): WorkflowGraph {
  const workflowNodes: Record<string, NodeDefinition> = {};
  const workflowEdges: EdgeDefinition[] = [];

  // Convert nodes
  nodes.forEach((node) => {
    workflowNodes[node.id] = {
      agent_id: node.data.agent_id,
      inputs: node.data.inputs || {},
      outputs: node.data.outputs || {},
      position: node.position,
      type: node.data.type || 'agent',
    };
  });

  // Group edges by source node
  const edgeGroups: Record<string, any[]> = {};
  edges.forEach((edge) => {
    if (!edgeGroups[edge.source]) {
      edgeGroups[edge.source] = [];
    }
    edgeGroups[edge.source].push(edge);
  });

  // Convert edge groups to workflow edges
  Object.entries(edgeGroups).forEach(([source, sourceEdges]) => {
    const toNodes = sourceEdges.map((edge) => edge.target);
    workflowEdges.push({
      from_node: source,
      to_node: toNodes,
      action: sourceEdges[0].label || 'next',
      condition: sourceEdges[0].condition,
    });
  });

  return {
    name,
    description,
    trigger: {},
    start_node: nodes.find((node) => node.data.type === 'trigger')?.id || nodes[0]?.id || '',
    nodes: workflowNodes,
    edges: workflowEdges,
  };
}

// Status utilities
export function getStatusColor(status: string): string {
  switch (status) {
    case 'running':
      return 'text-blue-600 bg-blue-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'paused':
      return 'text-yellow-600 bg-yellow-100';
    case 'cancelled':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'running':
      return '🔄';
    case 'completed':
      return '✅';
    case 'failed':
      return '❌';
    case 'paused':
      return '⏸️';
    case 'cancelled':
      return '🚫';
    default:
      return '❓';
  }
}

// Error handling utilities
export function getErrorMessage(error: any): string {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Local storage utilities
export function saveToLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Copy to clipboard utility
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// File download utility
export function downloadJSON(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}