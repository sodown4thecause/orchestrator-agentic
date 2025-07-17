import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
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
        className="!bg-yellow-500 !border-yellow-500"
      />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10">
          <GitBranchIcon className="h-4 w-4 text-yellow-500" />
        </div>
        <div>
          <p className="text-sm font-medium">{data.label}</p>
          <p className="text-xs text-muted-foreground">Condition</p>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="!bg-green-500 !border-green-500 !left-2"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="!bg-red-500 !border-red-500 !right-2"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>True</span>
        <span>False</span>
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';