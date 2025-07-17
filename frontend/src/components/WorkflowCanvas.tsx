import { FC, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

interface WorkflowCanvasProps {
  workflow: any
}

// Custom node component
const CustomNode: FC<{ data: any }> = ({ data }) => {
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'trigger':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'action':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'condition':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getServiceIcon = (service: string) => {
    const icons: { [key: string]: string } = {
      'gmail': '📧',
      'slack': '💬',
      'hubspot': '🎯',
      'stripe': '💳',
      'mailchimp': '📮',
      'clickup': '✅',
      'github': '🐙',
      'notion': '📝',
      'calendar': '📅',
      'webhook': '🔗',
      'delay': '⏱️',
      'condition': '🔀',
      'filter': '🔍'
    }
    return icons[service.toLowerCase()] || '⚙️'
  }

  return (
    <div className={`px-4 py-3 rounded-lg border-2 min-w-[200px] shadow-sm ${getNodeColor(data.type)}`}>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{getServiceIcon(data.service)}</span>
        <div className="flex-1">
          <h3 className="font-medium text-sm">{data.service}</h3>
          <p className="text-xs opacity-75">{data.action}</p>
        </div>
      </div>
      <p className="text-xs mt-1">{data.description}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

export const WorkflowCanvas: FC<WorkflowCanvasProps> = ({ workflow }) => {
  // Convert workflow steps to nodes
  const initialNodes: Node[] = useMemo(() => {
    return workflow.steps.map((step: any, index: number) => ({
      id: step.id,
      type: 'custom',
      data: {
        service: step.service,
        action: step.action,
        description: step.description,
        type: step.type,
        config: step.config,
      },
      position: { x: 100, y: 100 + index * 150 },
    }))
  }, [workflow.steps])

  // Convert workflow flow to edges
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = []
    for (let i = 0; i < workflow.steps.length - 1; i++) {
      edges.push({
        id: `e${i}-${i + 1}`,
        source: workflow.steps[i].id,
        target: workflow.steps[i + 1].id,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      })
    }
    return edges
  }, [workflow.steps])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((event: any, node: Node) => {
    // Handle node click - could open configuration modal
    console.log('Node clicked:', node)
  }, [])

  return (
    <div className="h-[600px] w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap 
            zoomable 
            pannable 
            style={{ 
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          />
          <Background variant="dots" gap={16} size={1} />
        </ReactFlow>
      </div>
      
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Workflow Tools</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
            Add Action
          </button>
          <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
            Add Condition
          </button>
          <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
            Add Delay
          </button>
        </div>
      </div>
    </div>
  )
}