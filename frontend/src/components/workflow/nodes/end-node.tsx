import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { StopIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const EndNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        'rounded-full border bg-card p-4 shadow-sm transition-all',
        selected ? 'ring-2 ring-primary' : ''
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-red-500 !border-red-500"
      />
      <div className="flex items-center justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
          <StopIcon className="h-4 w-4 text-red-500" />
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs font-medium">End</p>
      </div>
    </div>
  );
});

EndNode.displayName = 'EndNode';