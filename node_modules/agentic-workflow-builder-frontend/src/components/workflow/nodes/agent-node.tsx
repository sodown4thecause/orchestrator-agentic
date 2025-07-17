import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AgentNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-3 shadow-sm transition-all',
        selected ? 'ring-2 ring-primary' : ''
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !border-primary"
      />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <UserIcon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{data.label}</p>
          <p className="text-xs text-muted-foreground">{data.agent?.type || 'Agent'}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !border-primary"
      />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';