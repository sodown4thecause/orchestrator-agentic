/**
 * Simple script to add the Ref MCP server to the orchestrator platform
 * Run this with: node add-ref-mcp.js
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8000';
const API_KEY = 'orchestra-secret-key';

// Ref MCP Server configuration (streamable HTTP - recommended)
const refServerConfig = {
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

// Ref MCP Server configuration (stdio - legacy)
const refServerLegacyConfig = {
  name: 'Ref (Legacy)',
  command: 'npx',
  args: ['ref-tools-mcp@latest'],
  type: 'stdio',
  env: {
    'REF_API_KEY': 'ref-57210845759dab8bb7f6'
  }
};

async function addRefMCPServer(useStreamable = true) {
  try {
    const config = useStreamable ? refServerConfig : refServerLegacyConfig;
    
    console.log(`Adding ${config.name} MCP server...`);
    
    const response = await axios.post(
      `${API_BASE_URL}/v1/mcp/servers`,
      config,
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Ref MCP server added successfully!');
    console.log('Server details:', response.data);
    
  } catch (error) {
    console.error('❌ Failed to add Ref MCP server:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const useStreamable = !args.includes('--legacy');

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node add-ref-mcp.js [--legacy]');
  console.log('  --legacy    Use stdio transport instead of streamable HTTP (default: false)');
  process.exit(0);
}

console.log('🚀 Adding Ref MCP Server to Orchestra Platform');
console.log(`Transport: ${useStreamable ? 'Streamable HTTP (recommended)' : 'stdio (legacy)'}`);
console.log('');

addRefMCPServer(useStreamable);