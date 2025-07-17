'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  PlayIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store';
import { formatRelativeTime, getStatusColor } from '@/lib/utils';

export function Dashboard() {
  const { workflows, runs, fetchWorkflows, fetchRuns } = useAppStore();

  useEffect(() => {
    fetchWorkflows();
    fetchRuns();
  }, [fetchWorkflows, fetchRuns]);

  const stats = {
    totalWorkflows: workflows.length,
    runningWorkflows: runs.filter(run => run.status === 'running').length,
    completedRuns: runs.filter(run => run.status === 'completed').length,
    failedRuns: runs.filter(run => run.status === 'failed').length,
  };

  const recentRuns = runs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const recentWorkflows = workflows
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Orchestra</h1>
          <p className="text-muted-foreground">
            Build and manage AI-powered workflows with ease
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/workflows/new">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Workflow
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <PlayIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
            <p className="text-xs text-muted-foreground">
              {workflows.filter(w => w.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.runningWorkflows}</div>
            <p className="text-xs text-muted-foreground">
              Currently executing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedRuns}</div>
            <p className="text-xs text-muted-foreground">
              Successful runs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedRuns}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Workflows */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Workflows</CardTitle>
                <CardDescription>
                  Your latest workflow configurations
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/workflows">
                  View All
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentWorkflows.length === 0 ? (
              <div className="text-center py-6">
                <PlayIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No workflows yet</p>
                <Button asChild>
                  <Link href="/workflows/new">
                    Create Your First Workflow
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{workflow.name}</h4>
                        {workflow.is_active && (
                          <Badge variant="success" className="text-xs">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {workflow.description || 'No description'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatRelativeTime(workflow.updated_at || workflow.created_at)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/workflows/${workflow.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Runs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Runs</CardTitle>
                <CardDescription>
                  Latest workflow executions
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/workflows?tab=runs">
                  View All
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentRuns.length === 0 ? (
              <div className="text-center py-6">
                <ClockIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No runs yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRuns.map((run) => {
                  const workflow = workflows.find(w => w.id === run.workflow_id);
                  return (
                    <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {workflow?.name || 'Unknown Workflow'}
                          </h4>
                          <Badge 
                            variant={getStatusColor(run.status) as any}
                            className="text-xs"
                          >
                            {run.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Run #{run.id.slice(-8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Started {formatRelativeTime(run.created_at)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/workflows/${run.workflow_id}/runs/${run.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start" asChild>
              <Link href="/workflows/new">
                <PlusIcon className="h-6 w-6 mb-2" />
                <div className="text-left">
                  <div className="font-medium">Create Workflow</div>
                  <div className="text-sm text-muted-foreground">Build a new AI workflow</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start" asChild>
              <Link href="/integrations">
                <PlayIcon className="h-6 w-6 mb-2" />
                <div className="text-left">
                  <div className="font-medium">Add Integration</div>
                  <div className="text-sm text-muted-foreground">Connect external services</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start" asChild>
              <Link href="/agents">
                <PlayIcon className="h-6 w-6 mb-2" />
                <div className="text-left">
                  <div className="font-medium">Configure Agents</div>
                  <div className="text-sm text-muted-foreground">Set up AI agents</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}