# 🛠️ Troubleshooting Guide

## Common Docker Issues

### 1. Docker Desktop Not Running
**Error**: `unable to prepare context: path not found`
**Solution**: 
1. Start Docker Desktop
2. Ensure Docker is running: `docker --version`
3. Try: `docker-compose up --build`

### 2. Windows Path Issues
**Error**: Path not found errors
**Solution**:
1. Use PowerShell or Command Prompt
2. Ensure you're in the correct directory
3. Try: `docker-compose up --build` from the project root

### 3. Build Context Issues
**Solution**:
```bash
# Build individual services
docker build -t integration-service ./integration_service
docker build -t workflow-engine ./workflow_engine
docker build -t ai-service ./ai-service
docker build -t mcp-service ./mcp-service
docker build -t api-gateway ./api_gateway
```

### 4. Docker Compose Issues
**Solution**:
```bash
# Clean and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## Quick Start Commands

### Manual Build (if docker-compose fails)
```bash
# Start services individually
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev

# Python services
cd workflow_engine && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8001
cd integration_service && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8002
cd ai-service && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8004
cd mcp-service && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8003
cd api_gateway && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8080
```

## Environment Variables

Ensure your `.env` file contains:
```
OPENAI_API_KEY=your-key-here
JWT_SECRET=your-secret-here
```

## Service URLs
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Backend: http://localhost:8000
- Workflow Engine: http://localhost:8001
- Integration Service: http://localhost:8002
- MCP Service: http://localhost:8003
- AI Service: http://localhost:8004
