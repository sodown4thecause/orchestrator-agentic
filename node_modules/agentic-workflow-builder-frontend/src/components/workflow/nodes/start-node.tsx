import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PlayIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StartNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        'rounded-full border bg-card p-4 shadow-sm transition-all',
        selected ? 'ring-2 ring-primary' : ''
      )}
    >
      <div className="flex items-center justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
          <PlayIcon className="h-4 w-4 text-green-500" />
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs font-medium">Start</p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !border-green-500"
      />
    </div>
  );
});

StartNode.displayName = 'StartNode';