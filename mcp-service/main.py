from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import docker
import os
import asyncio
import json
from datetime import datetime
import uuid
import subprocess
import yaml

# Initialize FastAPI
app = FastAPI(title="MCP Service", version="1.0.0")

# Security
security = HTTPBearer()

# Docker client
docker_client = docker.from_env()

# MCP registry
mcp_registry = {}

# Pydantic models
class MCPContainerRequest(BaseModel):
    name: str
    image: str
    environment: Optional[Dict[str, str]] = Field(default_factory=dict)
    ports: Optional[Dict[str, int]] = Field(default_factory=dict)
    volumes: Optional[Dict[str, str]] = Field(default_factory=dict)
    memory_limit: Optional[str] = "512m"
    cpu_limit: Optional[str] = "0.5"

class MCPContainerStatus(BaseModel):
    container_id: str
    name: str
    status: str
    image: str
    ports: Dict[str, int]
    created_at: str
    health: Optional[str] = None

class MCPConfig(BaseModel):
    name: str
    description: str
    image: str
    version: str
    capabilities: List[str]
    environment: Dict[str, str]
    endpoints: List[str]

# Authentication
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In production, verify JWT token
    return credentials.credentials

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mcp-service"}

@app.post("/v1/mcp/deploy")
async def deploy_mcp_container(
    request: MCPContainerRequest,
    token: str = Depends(verify_token)
):
    """Deploy a new MCP container."""
    
    try:
        # Check if container already exists
        existing_containers = docker_client.containers.list(all=True, filters={"name": request.name})
        if existing_containers:
            raise HTTPException(status_code=400, detail=f"Container {request.name} already exists")
        
        # Prepare container configuration
        container_config = {
            "image": request.image,
            "name": request.name,
            "environment": request.environment,
            "ports": request.ports,
            "volumes": request.volumes,
            "mem_limit": request.memory_limit,
            "cpu_quota": int(float(request.cpu_limit) * 100000),
            "detach": True,
            "restart_policy": {"Name": "unless-stopped"}
        }
        
        # Create and start container
        container = docker_client.containers.run(**container_config)
        
        # Register in MCP registry
        mcp_registry[request.name] = {
            "container_id": container.id,
            "image": request.image,
            "ports": request.ports,
            "created_at": datetime.utcnow().isoformat()
        }
        
        return {
            "container_id": container.id,
            "name": request.name,
            "status": "running",
            "ports": request.ports
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to deploy container: {str(e)}")

@app.get("/v1/mcp/containers")
async def list_mcp_containers(token: str = Depends(verify_token)):
    """List all MCP containers."""
    
    try:
        containers = docker_client.containers.list(all=True)
        mcp_containers = []
        
        for container in containers:
            if container.name in mcp_registry:
                ports = {}
                if container.ports:
                    for port, bindings in container.ports.items():
                        if bindings:
                            ports[port] = bindings[0]['HostPort']
                
                mcp_containers.append(MCPContainerStatus(
                    container_id=container.id,
                    name=container.name,
                    status=container.status,
                    image=container.image.tags[0] if container.image.tags else container.image.id[:12],
                    ports=ports,
                    created_at=container.attrs['Created'],
                    health=container.attrs.get('State', {}).get('Health', {}).get('Status')
                ))
        
        return {"containers": mcp_containers}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list containers: {str(e)}")

@app.get("/v1/mcp/containers/{container_name}")
async def get_container_status(
    container_name: str,
    token: str = Depends(verify_token)
):
    """Get status of a specific MCP container."""
    
    try:
        container = docker_client.containers.get(container_name)
        ports = {}
        if container.ports:
            for port, bindings in container.ports.items():
                if bindings:
                    ports[port] = bindings[0]['HostPort']
        
        return MCPContainerStatus(
            container_id=container.id,
            name=container.name,
            status=container.status,
            image=container.image.tags[0] if container.image.tags else container.image.id[:12],
            ports=ports,
            created_at=container.attrs['Created'],
            health=container.attrs.get('State', {}).get('Health', {}).get('Status')
        )
        
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Container not found: {str(e)}")

@app.post("/v1/mcp/containers/{container_name}/start")
async def start_container(
    container_name: str,
    token: str = Depends(verify_token)
):
    """Start an existing MCP container."""
    
    try:
        container = docker_client.containers.get(container_name)
        container.start()
        
        return {
            "container_id": container.id,
            "name": container.name,
            "status": "started"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start container: {str(e)}")

@app.post("/v1/mcp/containers/{container_name}/stop")
async def stop_container(
    container_name: str,
    token: str = Depends(verify_token)
):
    """Stop an MCP container."""
    
    try:
        container = docker_client.containers.get(container_name)
        container.stop()
        
        return {
            "container_id": container.id,
            "name": container.name,
            "status": "stopped"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop container: {str(e)}")

@app.delete("/v1/mcp/containers/{container_name}")
async def delete_container(
    container_name: str,
    token: str = Depends(verify_token)
):
    """Delete an MCP container."""
    
    try:
        container = docker_client.containers.get(container_name)
        container.stop()
        container.remove()
        
        # Remove from registry
        if container_name in mcp_registry:
            del mcp_registry[container_name]
        
        return {
            "container_id": container.id,
            "name": container.name,
            "status": "deleted"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete container: {str(e)}")

@app.get("/v1/mcp/registry")
async def list_mcp_registry(token: str = Depends(verify_token)):
    """List all available MCP containers in registry."""
    
    return {
        "registry": [
            {
                "name": "slack-mcp",
                "description": "Slack integration MCP server",
                "image": "mcp/slack:latest",
                "capabilities": ["send_message", "read_channels", "manage_users"],
                "endpoints": ["/slack/send", "/slack/channels"]
            },
            {
                "name": "github-mcp",
                "description": "GitHub integration MCP server",
                "image": "mcp/github:latest",
                "capabilities": ["create_issue", "read_repos", "manage_prs"],
                "endpoints": ["/github/issues", "/github/repos"]
            },
            {
                "name": "notion-mcp",
                "description": "Notion integration MCP server",
                "image": "mcp/notion:latest",
                "capabilities": ["create_page", "read_database", "update_blocks"],
                "endpoints": ["/notion/pages", "/notion/databases"]
            }
        ]
    }

@app.post("/v1/mcp/build")
async def build_mcp_container(
    config: MCPConfig,
    token: str = Depends(verify_token)
):
    """Build a custom MCP container from configuration."""
    
    try:
        # Create Dockerfile
        dockerfile_content = f"""
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "main.py"]
"""
        
        # Write Dockerfile
        with open(f"/tmp/{config.name}/Dockerfile", "w") as f:
            f.write(dockerfile_content)
        
        # Build image
        image, logs = docker_client.images.build(
            path=f"/tmp/{config.name}",
            tag=f"mcp/{config.name}:{config.version}",
            rm=True
        )
        
        return {
            "image": f"mcp/{config.name}:{config.version}",
            "build_logs": [str(log) for log in logs]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build container: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
