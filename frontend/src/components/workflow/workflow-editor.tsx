'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Connection,
  ConnectionMode,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkflowEditorStore } from '@/store';
import { workflowToReactFlow, reactFlowToWorkflow } from '@/lib/utils';
import { WorkflowGraph } from '@/types';
import { AgentNode } from './nodes/agent-node';
import { ToolNode } from './nodes/tool-node';
import { ConditionNode } from './nodes/condition-node';
import { StartNode } from './nodes/start-node';
import { EndNode } from './nodes/end-node';
import { NodeSidebar } from './node-sidebar';
import { WorkflowToolbar } from './workflow-toolbar';

const nodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
  condition: ConditionNode,
  start: StartNode,
  end: EndNode,
};

interface WorkflowEditorProps {
  workflow?: WorkflowGraph;
  onSave?: (workflow: WorkflowGraph) => void;
  onRun?: (workflow: WorkflowGraph) => void;
  readonly?: boolean;
}

export function WorkflowEditor({ 
  workflow, 
  onSave, 
  onRun, 
  readonly = false 
}: WorkflowEditorProps) {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    selectedNode,
    isDirty,
    setNodes,
    setEdges,
    setSelectedNode,
    setIsDirty,
    addNode,
    updateNode,
    deleteNode,
    addEdge: addStoreEdge,
    deleteEdge,
    clearSelection,
  } = useWorkflowEditorStore();

  const [nodes, , onNodesChange] = useNodesState(storeNodes);
  const [edges, , onEdgesChange] = useEdgesState(storeEdges);

  // Sync store with local state
  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  // Load workflow into editor
  useEffect(() => {
    if (workflow) {
      const { nodes: flowNodes, edges: flowEdges } = workflowToReactFlow(workflow);
      setNodes(flowNodes);
      setEdges(flowEdges);
      setIsDirty(false);
    }
  }, [workflow, setNodes, setEdges, setIsDirty]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (readonly) return;
      
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: 'smoothstep',
        animated: true,
      };
      
      addStoreEdge(newEdge as Edge);
      setIsDirty(true);
    },
    [addStoreEdge, setIsDirty, readonly]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (readonly) return;
      setSelectedNode(node.id);
    },
    [setSelectedNode, readonly]
  );

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleSave = useCallback(() => {
    if (!onSave) return;
    
    const workflowGraph = reactFlowToWorkflow(nodes, edges);
    onSave(workflowGraph);
    setIsDirty(false);
  }, [nodes, edges, onSave, setIsDirty]);

  const handleRun = useCallback(() => {
    if (!onRun) return;
    
    const workflowGraph = reactFlowToWorkflow(nodes, edges);
    onRun(workflowGraph);
  }, [nodes, edges, onRun]);

  const canSave = useMemo(() => {
    return isDirty && nodes.length > 0 && !readonly;
  }, [isDirty, nodes.length, readonly]);

  const canRun = useMemo(() => {
    const hasStartNode = nodes.some(node => node.type === 'start');
    const hasEndNode = nodes.some(node => node.type === 'end');
    return hasStartNode && hasEndNode && nodes.length > 1;
  }, [nodes]);

  return (
    <div className="flex h-full">
      {/* Main Editor */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          className="bg-background"
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
          
          {/* Toolbar */}
          <Panel position="top-left">
            <WorkflowToolbar 
              onSave={canSave ? handleSave : undefined}
              onRun={canRun ? handleRun : undefined}
              readonly={readonly}
            />
          </Panel>
          
          {/* Status Panel */}
          <Panel position="top-right">
            <Card className="w-64">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Workflow Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Nodes:</span>
                  <Badge variant="outline">{nodes.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Connections:</span>
                  <Badge variant="outline">{edges.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <Badge variant={isDirty ? 'warning' : 'success'}>
                    {isDirty ? 'Modified' : 'Saved'}
                  </Badge>
                </div>
                {!canRun && (
                  <div className="text-xs text-muted-foreground">
                    Add start and end nodes to run
                  </div>
                )}
              </CardContent>
            </Card>
          </Panel>
        </ReactFlow>
      </div>

      {/* Node Sidebar */}
      {!readonly && (
        <NodeSidebar 
          selectedNodeId={selectedNode}
          onNodeUpdate={updateNode}
          onNodeDelete={deleteNode}
          onAddNode={addNode}
        />
      )}
    </div>
  );
}