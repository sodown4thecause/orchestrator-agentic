# Ref MCP Server Setup Guide

This guide explains how to configure and use the Ref MCP server with your orchestrator platform.

## Overview

The Ref MCP server provides AI-powered research and reference capabilities to your orchestrator platform. There are two configuration options available:

1. **Streamable HTTP (recommended)** - Uses the modern streamable HTTP protocol
2. **stdio (legacy)** - Uses the traditional stdio transport

## Configuration Options

### Option 1: Streamable HTTP (Recommended)

This is the recommended configuration as of April 2025, using `mcp-remote` as a local proxy:

```json
{
  "name": "Ref",
  "command": "npx",
  "args": [
    "mcp-remote@0.1.0-0",
    "https://api.ref.tools/mcp",
    "--header",
    "x-ref-api-key: ref-57210845759dab8bb7f6"
  ],
  "type": "remote",
  "headers": {
    "x-ref-api-key": "ref-57210845759dab8bb7f6"
  }
}
```

### Option 2: stdio (Legacy)

This uses the traditional stdio transport method:

```json
{
  "name": "Ref (Legacy)",
  "command": "npx",
  "args": ["ref-tools-mcp@latest"],
  "type": "stdio",
  "env": {
    "REF_API_KEY": "ref-57210845759dab8bb7f6"
  }
}
```

## Quick Setup

### Using the Provided Script

1. **Streamable HTTP (default)**:
   ```bash
   node add-ref-mcp.js
   ```

2. **Legacy stdio**:
   ```bash
   node add-ref-mcp.js --legacy
   ```

### Using the Frontend

1. Navigate to the Integrations page in the orchestrator frontend
2. Click "Add MCP Server"
3. Select "Ref" from the predefined servers
4. Choose your preferred configuration (streamable HTTP or legacy)

### Using the API

```bash
# Add Ref server (streamable HTTP)
curl -X POST http://localhost:8000/v1/mcp/servers \
  -H "X-API-Key: orchestra-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ref",
    "command": "npx",
    "args": [
      "mcp-remote@0.1.0-0",
      "https://api.ref.tools/mcp",
      "--header",
      "x-ref-api-key: ref-57210845759dab8bb7f6"
    ],
    "type": "remote",
    "headers": {
      "x-ref-api-key": "ref-57210845759dab8bb7f6"
    }
  }'
```

## Verification

To verify that Ref is working correctly:

1. **Test via API**:
   ```bash
   curl -X POST http://localhost:8000/v1/mcp/servers/{server-id}/test \
     -H "X-API-Key: orchestra-secret-key"
   ```

2. **Test via Frontend**:
   - Go to the MCP servers dashboard
   - Find your Ref server
   - Click "Test Connection"

3. **Test via Natural Language**:
   - Open the orchestrator chat interface
   - Type: "Use ref to look up how to write an MCP client"
   - The system should return relevant information about MCP client development

## Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Ensure your API key is correct: `ref-57210845759dab8bb7f6`
   - Check network connectivity to `https://api.ref.tools/mcp`
   - Verify `mcp-remote` is installed: `npm install -g mcp-remote@0.1.0-0`

2. **Permission Errors**:
   - Ensure the orchestrator has permission to execute `npx` commands
   - Check that Node.js and npm are properly installed

3. **Legacy Mode Issues**:
   - Ensure `ref-tools-mcp` is installed: `npm install -g ref-tools-mcp@latest`
   - Verify the `REF_API_KEY` environment variable is set correctly

### Environment Variables

For the legacy stdio configuration, you can also set the API key as an environment variable:

```bash
export REF_API_KEY=ref-57210845759dab8bb7f6
```

## Configuration Files

- **mcp-config.json**: Contains the complete MCP server configurations
- **add-ref-mcp.js**: Script to programmatically add the Ref server
- **frontend/src/utils/mcp-servers.ts**: Frontend utilities for MCP server management

## Support

For issues with the Ref MCP server:
1. Check the orchestrator logs
2. Verify the Ref API is accessible
3. Test the configuration using the verification steps above
