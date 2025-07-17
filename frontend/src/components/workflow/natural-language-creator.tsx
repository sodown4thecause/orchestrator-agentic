import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  agent: string;
  tools: string[];
  dependencies: string[];
  estimatedTime: string;
}

interface ParsedIntent {
  objective: string;
  confidence: number;
  requiredData: string[];
  outputFormat: string;
  steps: WorkflowStep[];
  complexity: 'simple' | 'medium' | 'complex';
}

interface NaturalLanguageCreatorProps {
  onWorkflowGenerated?: (workflow: WorkflowStep[]) => void;
}

export const NaturalLanguageCreator: React.FC<NaturalLanguageCreatorProps> = ({
  onWorkflowGenerated
}) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedIntent, setParsedIntent] = useState<ParsedIntent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example suggestions for user guidance
  const exampleCommands = [
    "Analyze our sales data from last quarter and create a presentation",
    "Monitor our website uptime and send alerts if it goes down",
    "Scrape competitor pricing and update our database",
    "Generate a weekly report from our customer support tickets",
    "Backup all project files to cloud storage every night"
  ];

  const handleAnalyzeIntent = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/intent/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: input }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to parse intent');
      }
      
      const intent: ParsedIntent = await response.json();
      setParsedIntent(intent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze command');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateWorkflow = async () => {
    if (!parsedIntent) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/workflow/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ intent: parsedIntent }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate workflow');
      }
      
      const workflow: WorkflowStep[] = await response.json();
      onWorkflowGenerated?.(workflow);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workflow');
    } finally {
      setIsGenerating(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Natural Language Workflow Creator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Describe what you want to accomplish:
            </label>
            <Textarea
              placeholder="e.g., Analyze our sales data from last quarter and create a presentation..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAnalyzeIntent}
              disabled={!input.trim() || isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Intent'}
            </Button>
            
            {parsedIntent && (
              <Button 
                onClick={handleGenerateWorkflow}
                disabled={isGenerating}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Workflow'}
              </Button>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Example Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Example Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {exampleCommands.map((command, index) => (
              <button
                key={index}
                onClick={() => setInput(command)}
                className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-sm text-gray-600">💡</span>
                <span className="ml-2 text-sm">{command}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Parsed Intent Display */}
      {parsedIntent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Parsed Intent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Confidence</label>
                <div className={`text-lg font-semibold ${getConfidenceColor(parsedIntent.confidence)}`}>
                  {Math.round(parsedIntent.confidence * 100)}%
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Complexity</label>
                <Badge className={getComplexityColor(parsedIntent.complexity)}>
                  {parsedIntent.complexity}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Steps</label>
                <div className="text-lg font-semibold">{parsedIntent.steps.length}</div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">Objective</label>
              <p className="text-sm bg-gray-50 p-3 rounded-lg">{parsedIntent.objective}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">Required Data Sources</label>
              <div className="flex flex-wrap gap-2">
                {parsedIntent.requiredData.map((data, index) => (
                  <Badge key={index} variant="outline">{data}</Badge>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">Workflow Steps</label>
              <div className="space-y-3">
                {parsedIntent.steps.map((step, index) => (
                  <div key={step.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        Step {index + 1}
                      </span>
                      <span className="font-medium">{step.title}</span>
                      <Badge variant="outline" className="text-xs">{step.agent}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Tools: {step.tools.join(', ')}</span>
                      <span>Est. Time: {step.estimatedTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};