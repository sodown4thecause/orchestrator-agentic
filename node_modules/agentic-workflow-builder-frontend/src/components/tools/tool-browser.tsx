'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store';
import { MCPTool } from '@/types';
import {
  Search,
  Tool,
  Plus,
  Code,
  FileText,
  Settings,
  Zap,
  Globe,
  Database,
  Calendar,
  Mail,
  Image,
  BarChart,
  MessageSquare,
  Filter,
  Grid,
  List,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface ToolBrowserProps {
  onToolSelect?: (tool: MCPTool) => void;
  selectedTools?: string[];
  mode?: 'browse' | 'select';
}

const TOOL_CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: Grid },
  { id: 'search', name: 'Search & Web', icon: Globe },
  { id: 'productivity', name: 'Productivity', icon: Calendar },
  { id: 'communication', name: 'Communication', icon: MessageSquare },
  { id: 'development', name: 'Development', icon: Code },
  { id: 'ai-ml', name: 'AI & ML', icon: Zap },
  { id: 'database', name: 'Database', icon: Database },
  { id: 'research', name: 'Research', icon: FileText },
  { id: 'blockchain', name: 'Blockchain', icon: BarChart },
  { id: 'image', name: 'Image & Media', icon: Image },
];

const getToolIcon = (toolName: string, category: string) => {
  const name = toolName.toLowerCase();
  
  if (name.includes('search') || name.includes('web')) return Globe;
  if (name.includes('email') || name.includes('mail')) return Mail;
  if (name.includes('task') || name.includes('todo')) return Calendar;
  if (name.includes('code') || name.includes('file')) return Code;
  if (name.includes('image') || name.includes('generate')) return Image;
  if (name.includes('database') || name.includes('record')) return Database;
  if (name.includes('message') || name.includes('chat')) return MessageSquare;
  if (name.includes('analyze') || name.includes('metric')) return BarChart;
  
  // Fallback to category-based icons
  const categoryData = TOOL_CATEGORIES.find(cat => 
    category.toLowerCase().includes(cat.name.toLowerCase().replace(/\s+/g, ''))
  );
  return categoryData?.icon || Tool;
};

export function ToolBrowser({ onToolSelect, selectedTools = [], mode = 'browse' }: ToolBrowserProps) {
  const { toast } = useToast();
  const { mcpServers, tools } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [showToolDetails, setShowToolDetails] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState<string | null>(null);

  // Combine tools from MCP servers and regular tools
  const allTools: MCPTool[] = [
    ...tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.schema,
      provider: tool.provider || 'System',
      category: tool.category || 'General'
    })),
    ...mcpServers.flatMap(server => 
      server.tools.map(tool => ({
        ...tool,
        provider: server.name
      }))
    )
  ];

  // Filter tools based on search and category
  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           tool.category.toLowerCase().replace(/\s+/g, '-').includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleToolSelect = (tool: MCPTool) => {
    if (mode === 'select' && onToolSelect) {
      onToolSelect(tool);
      toast({
        title: 'Tool Selected',
        description: `${tool.name} has been added to your workflow.`,
      });
    } else {
      setSelectedTool(tool);
      setShowToolDetails(true);
    }
  };

  const copySchema = async (schema: any, toolName: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
      setCopiedSchema(toolName);
      setTimeout(() => setCopiedSchema(null), 2000);
      toast({
        title: 'Schema Copied',
        description: 'Tool schema has been copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy schema to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const isToolSelected = (toolName: string) => {
    return selectedTools.includes(toolName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {mode === 'select' ? 'Select Tools' : 'Tool Browser'}
          </h2>
          <p className="text-muted-foreground">
            {mode === 'select' 
              ? 'Choose tools to add to your workflow'
              : 'Browse available tools from installed MCP servers'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools by name, description, or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOOL_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Tool className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{allTools.length}</p>
                <p className="text-sm text-muted-foreground">Total Tools</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{mcpServers.length}</p>
                <p className="text-sm text-muted-foreground">MCP Servers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{selectedTools.length}</p>
                <p className="text-sm text-muted-foreground">Selected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tool Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredTools.map((tool, index) => {
          const Icon = getToolIcon(tool.name, tool.category);
          const isSelected = isToolSelected(tool.name);
          
          return (
            <Card key={`${tool.provider}-${tool.name}-${index}`} className={`transition-all hover:shadow-md cursor-pointer ${
              viewMode === 'list' ? 'flex items-center p-4' : ''
            } ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}>
              {viewMode === 'grid' ? (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {tool.provider}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {tool.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleToolSelect(tool)}
                        variant={isSelected ? 'secondary' : 'default'}
                      >
                        {mode === 'select' ? (
                          isSelected ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Selected
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Tool
                            </>
                          )
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </>
                        )}
                      </Button>
                      {mode === 'browse' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copySchema(tool.inputSchema, tool.name)}
                        >
                          {copiedSchema === tool.name ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{tool.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {tool.provider}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {tool.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleToolSelect(tool)}
                      variant={isSelected ? 'secondary' : 'default'}
                    >
                      {mode === 'select' ? (
                        isSelected ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Selected
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </>
                        )
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Details
                        </>
                      )}
                    </Button>
                    {mode === 'browse' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copySchema(tool.inputSchema, tool.name)}
                      >
                        {copiedSchema === tool.name ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <Tool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tools found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or category filter
          </p>
          <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Tool Details Dialog */}
      <Dialog open={showToolDetails} onOpenChange={setShowToolDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTool && (
                <>
                  {React.createElement(getToolIcon(selectedTool.name, selectedTool.category), {
                    className: "h-5 w-5"
                  })}
                  {selectedTool.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTool?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedTool && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline">{selectedTool.provider}</Badge>
                <Badge variant="secondary">{selectedTool.category}</Badge>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Input Schema</h4>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-64">
                    {JSON.stringify(selectedTool.inputSchema, null, 2)}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copySchema(selectedTool.inputSchema, selectedTool.name)}
                  >
                    {copiedSchema === selectedTool.name ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {mode === 'select' && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowToolDetails(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    handleToolSelect(selectedTool);
                    setShowToolDetails(false);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Workflow
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ToolBrowser;