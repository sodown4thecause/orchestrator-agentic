'use client';

import React, { useState } from 'react';
import { Node } from 'reactflow';
import {
  PlusIcon,
  UserIcon,
  WrenchIcon,
  GitBranchIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store';
import { generateNodeId } from '@/lib/utils';
import { NodeDefinition } from '@/types';

interface NodeSidebarProps {
  selectedNodeId?: string;
  onNodeUpdate: (nodeId: string, updates: Partial<Node>) => void;
  onNodeDelete: (nodeId: string) => void;
  onAddNode: (node: Node) => void;
}

const nodeTemplates = [
  {
    type: 'start',
    label: 'Start',
    icon: PlayIcon,
    description: 'Workflow entry point',
  },
  {
    type: 'agent',
    label: 'Agent',
    icon: UserIcon,
    description: 'AI agent execution',
  },
  {
    type: 'tool',
    label: 'Tool',
    icon: WrenchIcon,
    description: 'Tool or function call',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: GitBranchIcon,
    description: 'Conditional branching',
  },
  {
    type: 'end',
    label: 'End',
    icon: StopIcon,
    description: 'Workflow exit point',
  },
];

export function NodeSidebar({
  selectedNodeId,
  onNodeUpdate,
  onNodeDelete,
  onAddNode,
}: NodeSidebarProps) {
  const { agents, tools } = useAppStore();
  const [nodeForm, setNodeForm] = useState({
    label: '',
    description: '',
    agentId: '',
    toolId: '',
    condition: '',
  });

  const handleAddNode = (type: string) => {
    const id = generateNodeId();
    const position = { x: Math.random() * 400, y: Math.random() * 400 };
    
    const baseNode = {
      id,
      type,
      position,
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${id.slice(-4)}`,
      },
    };

    // Add type-specific data
    if (type === 'agent' && agents.length > 0) {
      baseNode.data.agent = agents[0];
    } else if (type === 'tool' && tools.length > 0) {
      baseNode.data.tool = tools[0];
    }

    onAddNode(baseNode as Node);
  };

  const handleUpdateNode = (field: string, value: any) => {
    if (!selectedNodeId) return;
    
    const updates: Partial<Node> = {
      data: {
        [field]: value,
      },
    };

    // Handle special cases
    if (field === 'agentId') {
      const agent = agents.find(a => a.id === value);
      updates.data = { agent };
    } else if (field === 'toolId') {
      const tool = tools.find(t => t.id === value);
      updates.data = { tool };
    }

    onNodeUpdate(selectedNodeId, updates);
  };

  return (
    <div className="w-80 border-l bg-background p-4 space-y-4">
      {/* Add Nodes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add Nodes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {nodeTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Button
                key={template.type}
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={() => handleAddNode(template.type)}
              >
                <Icon className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">{template.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {template.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Node Properties Section */}
      {selectedNodeId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Node Properties</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNodeDelete(selectedNodeId)}
                className="text-destructive hover:text-destructive"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <Input
                placeholder="Node label"
                value={nodeForm.label}
                onChange={(e) => {
                  setNodeForm({ ...nodeForm, label: e.target.value });
                  handleUpdateNode('label', e.target.value);
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Node description"
                value={nodeForm.description}
                onChange={(e) => {
                  setNodeForm({ ...nodeForm, description: e.target.value });
                  handleUpdateNode('description', e.target.value);
                }}
              />
            </div>

            {/* Agent Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent</label>
              <Select
                value={nodeForm.agentId}
                onValueChange={(value) => {
                  setNodeForm({ ...nodeForm, agentId: value });
                  handleUpdateNode('agentId', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{agent.type}</Badge>
                        {agent.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tool Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tool</label>
              <Select
                value={nodeForm.toolId}
                onValueChange={(value) => {
                  setNodeForm({ ...nodeForm, toolId: value });
                  handleUpdateNode('toolId', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tool" />
                </SelectTrigger>
                <SelectContent>
                  {tools.map((tool) => (
                    <SelectItem key={tool.id} value={tool.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{tool.type}</Badge>
                        {tool.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Condition Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Condition</label>
              <Textarea
                placeholder="Enter condition logic"
                value={nodeForm.condition}
                onChange={(e) => {
                  setNodeForm({ ...nodeForm, condition: e.target.value });
                  handleUpdateNode('condition', e.target.value);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Help</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Drag nodes to reposition them</p>
          <p>• Connect nodes by dragging from handles</p>
          <p>• Click a node to edit its properties</p>
          <p>• Use Start and End nodes for entry/exit points</p>
        </CardContent>
      </Card>
    </div>
  );
}