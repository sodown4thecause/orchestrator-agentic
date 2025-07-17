'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store';
import { MCPToolLibrary } from './mcp-tool-library';
import { ToolBrowser } from './tool-browser';
import {
  Server,
  Tool,
  Package,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Globe,
  Database,
  Code,
  Calendar,
  MessageSquare,
  Image,
  BarChart,
  FileText
} from 'lucide-react';

interface ToolsPageProps {
  onToolSelect?: (tool: any) => void;
  selectedTools?: string[];
}

export function ToolsPage({ onToolSelect, selectedTools = [] }: ToolsPageProps) {
  const { mcpServers, tools } = useAppStore();
  const [activeTab, setActiveTab] = useState('library');

  // Calculate statistics
  const connectedServers = mcpServers.filter(server => server.status === 'connected').length;
  const totalTools = tools.length + mcpServers.reduce((acc, server) => acc + server.tools.length, 0);
  const errorServers = mcpServers.filter(server => server.status === 'error').length;

  // Get tool categories distribution
  const allTools = [
    ...tools.map(tool => ({ ...tool, provider: 'System' })),
    ...mcpServers.flatMap(server => 
      server.tools.map(tool => ({ ...tool, provider: server.name }))
    )
  ];

  const categoryStats = allTools.reduce((acc, tool) => {
    const category = tool.category || 'General';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('search') || categoryLower.includes('web')) return Globe;
    if (categoryLower.includes('database')) return Database;
    if (categoryLower.includes('development') || categoryLower.includes('code')) return Code;
    if (categoryLower.includes('productivity')) return Calendar;
    if (categoryLower.includes('communication')) return MessageSquare;
    if (categoryLower.includes('image') || categoryLower.includes('media')) return Image;
    if (categoryLower.includes('analytics') || categoryLower.includes('chart')) return BarChart;
    if (categoryLower.includes('research') || categoryLower.includes('academic')) return FileText;
    return Tool;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tools & Integrations</h1>
          <p className="text-muted-foreground">
            Manage your MCP servers and browse available tools for your workflows
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalTools}</p>
                <p className="text-sm text-muted-foreground">Total Tools</p>
              </div>
              <Tool className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Available for use</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{mcpServers.length}</p>
                <p className="text-sm text-muted-foreground">MCP Servers</p>
              </div>
              <Server className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-blue-600">
                <Activity className="h-4 w-4 mr-1" />
                <span>{connectedServers} connected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{Object.keys(categoryStats).length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-purple-600">
                <Zap className="h-4 w-4 mr-1" />
                <span>Diverse capabilities</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{selectedTools.length}</p>
                <p className="text-sm text-muted-foreground">Selected</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              {errorServers > 0 ? (
                <div className="flex items-center text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>{errorServers} server errors</span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>All systems operational</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Status Overview */}
      {mcpServers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Server Status
            </CardTitle>
            <CardDescription>
              Overview of your installed MCP servers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mcpServers.map((server) => (
                <div key={server.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {server.status === 'connected' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : server.status === 'error' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{server.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {server.tools.length} tools
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={server.status === 'connected' ? 'default' : 
                            server.status === 'error' ? 'destructive' : 'secondary'}
                  >
                    {server.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Distribution */}
      {topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tool Categories
            </CardTitle>
            <CardDescription>
              Distribution of tools across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topCategories.map(([category, count]) => {
                const Icon = getCategoryIcon(category);
                return (
                  <div key={category} className="text-center p-4 border rounded-lg">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold text-lg">{count}</p>
                    <p className="text-sm text-muted-foreground">{category}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            MCP Library
          </TabsTrigger>
          <TabsTrigger value="browser" className="flex items-center gap-2">
            <Tool className="h-4 w-4" />
            Tool Browser
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <MCPToolLibrary onToolSelect={onToolSelect} selectedTools={selectedTools} />
        </TabsContent>

        <TabsContent value="browser" className="space-y-6">
          <ToolBrowser 
            onToolSelect={onToolSelect} 
            selectedTools={selectedTools}
            mode="browse"
          />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      {mcpServers.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No MCP Servers Installed</h3>
            <p className="text-muted-foreground mb-4">
              Get started by installing your first MCP server from our curated library
            </p>
            <Button onClick={() => setActiveTab('library')}>
              <Package className="h-4 w-4 mr-2" />
              Browse MCP Library
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ToolsPage;