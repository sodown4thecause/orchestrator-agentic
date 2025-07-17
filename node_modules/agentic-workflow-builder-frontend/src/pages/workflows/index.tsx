import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Wand2,
  Settings,
  Activity
} from 'lucide-react';
import { NaturalLanguageCreator } from '@/components/workflow/natural-language-creator';
import { apiClient, Workflow, WorkflowStep } from '@/services/api';
import { useRouter } from 'next/router';

interface WorkflowExecutionStatus {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentStep: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

const WorkflowsPage: React.FC = () => {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecutionStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('create');

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await apiClient.getWorkflows();
      setWorkflows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    }
  };

  const loadExecutions = async () => {
    try {
      // This would be implemented in the workflow engine
      // For now, we'll use mock data
      setExecutions([]);
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowGenerated = async (steps: WorkflowStep[]) => {
    try {
      const workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'> = {
        name: `Auto-generated Workflow`,
        description: `Workflow created from natural language input`,
        steps,
        status: 'draft'
      };
      
      const createdWorkflow = await apiClient.createWorkflow(workflow);
      setWorkflows(prev => [createdWorkflow, ...prev]);
      setActiveTab('manage');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow');
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      const result = await apiClient.executeWorkflow(workflowId);
      // Add to executions list
      const newExecution: WorkflowExecutionStatus = {
        id: result.executionId,
        workflowId,
        status: 'running',
        currentStep: 'step_1',
        progress: 0,
        startedAt: new Date().toISOString()
      };
      setExecutions(prev => [newExecution, ...prev]);
      setActiveTab('monitor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute workflow');
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      await apiClient.deleteWorkflow(workflowId);
      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading workflows...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agentic Workflows</h1>
          <p className="text-gray-600 mt-2">
            Create, manage, and monitor your AI-powered workflows
          </p>
        </div>
        <Button 
          onClick={() => router.push('/workflows/builder')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Manual Builder
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Natural Language Creator
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage Workflows
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitor Executions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <NaturalLanguageCreator onWorkflowGenerated={handleWorkflowGenerated} />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <div className="grid gap-4">
            {workflows.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wand2 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No workflows yet
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    Create your first workflow using natural language or the manual builder
                  </p>
                  <Button onClick={() => setActiveTab('create')}>
                    Create Workflow
                  </Button>
                </CardContent>
              </Card>
            ) : (
              workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {workflow.name}
                          <Badge className={getStatusColor(workflow.status)}>
                            {getStatusIcon(workflow.status)}
                            {workflow.status}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {workflow.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/workflows/${workflow.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleExecuteWorkflow(workflow.id)}
                          disabled={workflow.status === 'running'}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Steps: {workflow.steps.length}</span>
                        <span>Created: {new Date(workflow.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {workflow.steps.slice(0, 3).map((step, index) => (
                          <div key={step.id} className="bg-gray-50 p-2 rounded text-xs">
                            <div className="font-medium">{index + 1}. {step.title}</div>
                            <div className="text-gray-600">{step.agent}</div>
                          </div>
                        ))}
                        {workflow.steps.length > 3 && (
                          <div className="bg-gray-50 p-2 rounded text-xs flex items-center justify-center text-gray-600">
                            +{workflow.steps.length - 3} more steps
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <div className="grid gap-4">
            {executions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No active executions
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    Execute a workflow to see real-time monitoring here
                  </p>
                  <Button onClick={() => setActiveTab('manage')}>
                    View Workflows
                  </Button>
                </CardContent>
              </Card>
            ) : (
              executions.map((execution) => {
                const workflow = workflows.find(w => w.id === execution.workflowId);
                return (
                  <Card key={execution.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {workflow?.name || 'Unknown Workflow'}
                            <Badge className={getStatusColor(execution.status)}>
                              {getStatusIcon(execution.status)}
                              {execution.status}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Execution ID: {execution.id}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div>Started: {new Date(execution.startedAt).toLocaleString()}</div>
                          {execution.completedAt && (
                            <div>Completed: {new Date(execution.completedAt).toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{execution.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${execution.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          Current Step: {execution.currentStep}
                        </div>
                        
                        {execution.error && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{execution.error}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowsPage;