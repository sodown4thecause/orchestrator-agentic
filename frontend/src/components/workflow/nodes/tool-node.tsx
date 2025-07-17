import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { WrenchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ToolNode = memo(({ data, selected }: NodeProps) => {
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
        className="!bg-blue-500 !border-blue-500"
      />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
          <WrenchIcon className="h-4 w-4 text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-medium">{data.label}</p>
          <p className="text-xs text-muted-foreground">{data.tool?.name || 'Tool'}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !border-blue-500"
      />
    </div>
  );
});

ToolNode.displayName = 'ToolNode';