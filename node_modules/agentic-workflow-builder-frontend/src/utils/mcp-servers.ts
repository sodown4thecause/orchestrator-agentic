import { MCPServer } from '@/types';
import { orchestraAPI } from '@/lib/api';

/**
 * Add the Ref MCP server with streamable HTTP configuration
 */
export async function addRefMCPServer(): Promise<MCPServer> {
  const refServer: Omit<MCPServer, 'id' | 'status' | 'tools'> = {
    name: 'Ref',
    command: 'npx',
    args: [
      'mcp-remote@0.1.0-0',
      'https://api.ref.tools/mcp',
      '--header',
      'x-ref-api-key: ref-57210845759dab8bb7f6'
    ],
    type: 'remote',
    headers: {
      'x-ref-api-key': 'ref-57210845759dab8bb7f6'
    }
  };

  return await orchestraAPI.addMCPServer(refServer);
}

/**
 * Add the Ref MCP server with stdio (legacy) configuration
 */
export async function addRefMCPServerLegacy(): Promise<MCPServer> {
  const refServerLegacy: Omit<MCPServer, 'id' | 'status' | 'tools'> = {
    name: 'Ref (Legacy)',
    command: 'npx',
    args: ['ref-tools-mcp@latest'],
    type: 'stdio',
    env: {
      'REF_API_KEY': 'ref-57210845759dab8bb7f6'
    }
  };

  return await orchestraAPI.addMCPServer(refServerLegacy);
}

/**
 * Predefined MCP servers that can be easily added
 */
export const PREDEFINED_MCP_SERVERS = {
  ref: {
    name: 'Ref',
    description: 'AI-powered research and reference tool',
    addFunction: addRefMCPServer
  },
  refLegacy: {
    name: 'Ref (Legacy)',
    description: 'AI-powered research and reference tool (stdio version)',
    addFunction: addRefMCPServerLegacy
  }
};