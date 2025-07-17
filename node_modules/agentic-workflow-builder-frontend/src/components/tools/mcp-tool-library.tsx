'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store';
import { MCPServer, MCPTool } from '@/types';
import {
  Search,
  Plus,
  Server,
  Tool,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Filter,
  Grid,
  List,
  Star,
  Zap,
  Globe,
  Database,
  Code,
  Image,
  MessageSquare,
  FileText,
  Calendar,
  Mail,
  ShoppingCart,
  BarChart,
  Settings
} from 'lucide-react';

// Predefined MCP servers from the research
const FEATURED_MCP_SERVERS = [
  {
    name: 'Google Search MCP',
    description: 'Web search capabilities using Google Custom Search API and webpage content extraction',
    category: 'Search & Web',
    url: 'docker://ghcr.io/metorial/mcp-containers/google-search:latest',
    icon: Globe,
    featured: true,
    tools: ['web_search', 'extract_content', 'summarize_page']
  },
  {
    name: 'Todoist MCP',
    description: 'Natural language task management integration with Todoist',
    category: 'Productivity',
    url: 'docker://ghcr.io/metorial/mcp-containers/todoist:latest',
    icon: Calendar,
    featured: true,
    tools: ['create_task', 'list_tasks', 'update_task', 'complete_task']
  },
  {
    name: 'AgentMail MCP',
    description: 'Dynamic email management, list messages, send and reply to emails',
    category: 'Communication',
    url: 'docker://ghcr.io/metorial/mcp-containers/agentmail:latest',
    icon: Mail,
    featured: true,
    tools: ['list_emails', 'send_email', 'reply_email', 'search_emails']
  },
  {
    name: 'FileScopeMCP',
    description: 'Instantly understand and visualize codebase structure & dependencies',
    category: 'Development',
    url: 'docker://ghcr.io/metorial/mcp-containers/filescope:latest',
    icon: Code,
    featured: true,
    tools: ['analyze_codebase', 'visualize_dependencies', 'code_metrics']
  },
  {
    name: 'AI Image Generation',
    description: 'Generate images using Together AI API with custom aspect ratios',
    category: 'AI & ML',
    url: 'docker://ghcr.io/metorial/mcp-containers/ai-image-gen:latest',
    icon: Image,
    featured: true,
    tools: ['generate_image', 'batch_generate', 'custom_aspect_ratio']
  },
  {
    name: 'Airtable MCP',
    description: 'Read and write access to Airtable databases',
    category: 'Database',
    url: 'docker://ghcr.io/metorial/mcp-containers/airtable:latest',
    icon: Database,
    featured: true,
    tools: ['read_records', 'create_record', 'update_record', 'delete_record']
  },
  {
    name: 'MCP Scholarly',
    description: 'Search for accurate academic articles and research papers',
    category: 'Research',
    url: 'docker://ghcr.io/metorial/mcp-containers/scholarly:latest',
    icon: FileText,
    featured: true,
    tools: ['search_papers', 'get_citations', 'analyze_research']
  },
  {
    name: 'Bitcoin & Lightning MCP',
    description: 'Bitcoin & Lightning Network integration and tools',
    category: 'Blockchain',
    url: 'docker://ghcr.io/metorial/mcp-containers/bitcoin-lightning:latest',
    icon: BarChart,
    featured: true,
    tools: ['check_balance', 'send_payment', 'create_invoice', 'lightning_info']
  }
];

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
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
];

interface MCPToolLibraryProps {
  onToolSelect?: (tool: MCPTool) => void;
  selectedTools?: string[];
}

export function MCPToolLibrary({ onToolSelect, selectedTools = [] }: MCPToolLibraryProps) {
  const { toast } = useToast();
  const { mcpServers, addMCPServer, removeMCPServer, testMCPServer } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerUrl, setNewServerUrl] = useState('');
  const [newServerDescription, setNewServerDescription] = useState('');
  const [isInstalling, setIsInstalling] = useState<string | null>(null);
  const [installedServers, setInstalledServers] = useState<Set<string>>(new Set());

  // Combine featured servers with user's installed servers
  const allServers = [
    ...FEATURED_MCP_SERVERS.map(server => ({
      ...server,
      id: server.name.toLowerCase().replace(/\s+/g, '-'),
      status: installedServers.has(server.name) ? 'connected' as const : 'disconnected' as const,
      tools: server.tools.map(toolName => ({
        name: toolName,
        description: `${toolName} from ${server.name}`,
        inputSchema: {},
        provider: server.name,
        category: server.category
      }))
    })),
    ...mcpServers
  ];

  // Filter servers based on search and category
  const filteredServers = allServers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         server.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           server.category.toLowerCase().replace(/\s+/g, '-').includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleInstallServer = async (server: any) => {
    setIsInstalling(server.name);
    try {
      await addMCPServer({
        name: server.name,
        url: server.url,
        type: 'http'
      });
      setInstalledServers(prev => new Set([...prev, server.name]));
      toast({
        title: 'Server Installed',
        description: `${server.name} has been successfully installed and is ready to use.`,
      });
    } catch (error) {
      toast({
        title: 'Installation Failed',
        description: `Failed to install ${server.name}. Please check the server URL and try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsInstalling(null);
    }
  };

  const handleRemoveServer = async (serverId: string, serverName: string) => {
    try {
      await removeMCPServer(serverId);
      setInstalledServers(prev => {
        const newSet = new Set(prev);
        newSet.delete(serverName);
        return newSet;
      });
      toast({
        title: 'Server Removed',
        description: `${serverName} has been removed from your tool library.`,
      });
    } catch (error) {
      toast({
        title: 'Removal Failed',
        description: `Failed to remove ${serverName}. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleAddCustomServer = async () => {
    if (!newServerName || !newServerUrl) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both server name and URL.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addMCPServer({
        name: newServerName,
        url: newServerUrl,
        type: 'http'
      });
      setNewServerName('');
      setNewServerUrl('');
      setNewServerDescription('');
      setShowAddDialog(false);
      toast({
        title: 'Custom Server Added',
        description: `${newServerName} has been added to your tool library.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to Add Server',
        description: 'Please check the server URL and try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = TOOL_CATEGORIES.find(cat => 
      cat.name.toLowerCase() === category.toLowerCase()
    );
    return categoryData?.icon || Tool;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MCP Tool Library</h2>
          <p className="text-muted-foreground">
            Discover and integrate Model Context Protocol servers to expand your workflow capabilities
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
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Server
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom MCP Server</DialogTitle>
                <DialogDescription>
                  Add a custom Model Context Protocol server to your tool library
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Server Name</label>
                  <Input
                    value={newServerName}
                    onChange={(e) => setNewServerName(e.target.value)}
                    placeholder="My Custom Server"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Server URL</label>
                  <Input
                    value={newServerUrl}
                    onChange={(e) => setNewServerUrl(e.target.value)}
                    placeholder="docker://my-registry/my-mcp-server:latest"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    value={newServerDescription}
                    onChange={(e) => setNewServerDescription(e.target.value)}
                    placeholder="Describe what this server does..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCustomServer}>
                    Add Server
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools and servers..."
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

      {/* Server Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredServers.map((server) => {
          const Icon = server.icon || Server;
          const isInstalled = server.status === 'connected';
          const isInstalling_ = isInstalling === server.name;
          
          return (
            <Card key={server.id || server.name} className={`transition-all hover:shadow-md ${
              viewMode === 'list' ? 'flex items-center p-4' : ''
            }`}>
              {viewMode === 'grid' ? (
                <>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{server.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(server.status)}
                            <Badge variant="outline" className="text-xs">
                              {server.category}
                            </Badge>
                            {server.featured && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {server.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Available Tools:</p>
                        <div className="flex flex-wrap gap-1">
                          {server.tools.slice(0, 3).map((tool, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {typeof tool === 'string' ? tool : tool.name}
                            </Badge>
                          ))}
                          {server.tools.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{server.tools.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isInstalled ? (
                          <>
                            <Button size="sm" className="flex-1" disabled>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Installed
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveServer(server.id || server.name, server.name)}
                            >
                              Remove
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleInstallServer(server)}
                            disabled={isInstalling_}
                          >
                            {isInstalling_ ? (
                              <>
                                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                                Installing...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Install
                              </>
                            )}
                          </Button>
                        )}
                      </div>
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
                        <h3 className="font-semibold">{server.name}</h3>
                        {getStatusIcon(server.status)}
                        <Badge variant="outline" className="text-xs">
                          {server.category}
                        </Badge>
                        {server.featured && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{server.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {server.tools.length} tools available
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isInstalled ? (
                      <>
                        <Button size="sm" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Installed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveServer(server.id || server.name, server.name)}
                        >
                          Remove
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleInstallServer(server)}
                        disabled={isInstalling_}
                      >
                        {isInstalling_ ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                            Installing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Install
                          </>
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

      {filteredServers.length === 0 && (
        <div className="text-center py-12">
          <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No servers found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search terms or category filter
          </p>
          <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default MCPToolLibrary;