# 🚀 FlowIntent Deployment Guide
**flowintent.com** - Complete Deployment Instructions

## 🎯 Quick Start (Windows)

### **Step 1: Start Docker Desktop**
1. **Start Docker Desktop** (required for Windows)
2. **Verify Docker is running**:
   ```bash
   docker --version
   docker-compose --version
   ```

### **Step 2: Alternative Deployment Methods**

#### **Method A: Docker Compose (Recommended)**
```bash
# From project root directory
docker-compose up --build
```

#### **Method B: Individual Service Deployment**
```bash
# Build services individually
docker build -t flowintent-integration ./integration_service
docker build -t flowintent-workflow ./workflow_engine
docker build -t flowintent-ai ./ai-service
docker build -t flowintent-mcp ./mcp-service
docker build -t flowintent-api ./api_gateway
```

#### **Method C: Manual Development Setup**
```bash
# Start services manually for development

# 1. Start databases
docker run -d -p 27017:27017 --name mongodb mongo:6.0
docker run -d -p 6379:6379 --name redis redis:7-alpine

# 2. Start backend services
cd backend && npm install && npm run dev &
cd frontend && npm install && npm run dev &

# 3. Start Python services
cd workflow_engine && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8001 &
cd integration_service && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8002 &
cd ai-service && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8004 &
cd mcp-service && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8003 &
cd api_gateway && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8080 &
```

## 🔧 Windows-Specific Troubleshooting

### **Docker Issues**
```bash
# Check if Docker is running
docker info

# If Docker Desktop isn't running, start it manually
# Or use Docker Toolbox for older Windows versions

# Alternative: Use WSL2
wsl --install
```

### **Path Issues**
```bash
# Use PowerShell instead of Command Prompt
# Ensure you're in the correct directory
cd "C:\Users\User\Documents\orchestrator agentic"

# Use forward slashes in docker-compose.yml
# Or use relative paths
```

### **Port Conflicts**
```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :8080
```

## 🌐 Service URLs (FlowIntent)

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React UI |
| **API Gateway** | http://localhost:8080 | Unified API |
| **Backend** | http://localhost:8000 | Node.js API |
| **Workflow Engine** | http://localhost:8001 | Python FastAPI |
| **Integration Service** | http://localhost:8002 | OAuth & APIs |
| **MCP Service** | http://localhost:8003 | Container management |
| **AI Service** | http://localhost:8004 | GPT-4 & RAG |
| **Serena MCP** | http://localhost:8005 | Web automation |
| **MongoDB** | http://localhost:27017 | Database |
| **Redis** | http://localhost:6379 | Cache |

## 📋 Environment Setup

### **Create .env file**
```bash
# Copy example file
cp .env.example .env

# Edit with your keys
OPENAI_API_KEY=your-openai-key-here
JWT_SECRET=your-jwt-secret-here
```

### **Quick Test Commands**
```bash
# Test each service
curl http://localhost:3000/health
curl http://localhost:8080/health
curl http://localhost:8005/health
```

## 🚀 Production Deployment

### **Docker Hub Deployment**
```bash
# Build and push images
docker build -t flowintent/frontend ./frontend
docker build -t flowintent/backend ./backend
docker build -t flowintent/serena-mcp ./mcp-service/serena-mcp

# Push to Docker Hub
docker push flowintent/frontend
docker push flowintent/backend
docker push flowintent/serena-mcp
```

### **Cloud Deployment Options**

#### **AWS ECS**
```yaml
# aws-ecs-task-definition.json
{
  "family": "flowintent",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "flowintent/frontend:latest",
      "portMappings": [{"containerPort": 3000}]
    }
  ]
}
```

#### **Azure Container Instances**
```bash
# Deploy to Azure
az container create --resource-group flowintent --name flowintent --image flowintent/frontend:latest --ports 3000
```

#### **Google Cloud Run**
```bash
# Deploy to GCP
gcloud run deploy flowintent --image flowintent/frontend:latest --port 3000
```

## 🔍 Verification Steps

### **1. Health Checks**
```bash
# Check all services
curl http://localhost:3000/health
curl http://localhost:8080/health
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
curl http://localhost:8005/health
```

### **2. Test Serena MCP**
```bash
# Test web scraping
curl -X POST http://localhost:8005/v1/web/advanced-scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "selectors": [".title"]}'
```

### **3. Test Natural Language**
```bash
# Test AI workflow creation
curl -X POST http://localhost:8004/v1/workflows/create \
  -H "Content-Type: application/json" \
  -d '{"description": "When someone fills out my contact form, send them a welcome email"}'
```

## 🎯 FlowIntent Quick Start

### **1. Access the Platform**
- **Web UI**: http://localhost:3000
- **API Docs**: http://localhost:8080/docs

### **2. Create Your First Workflow**
1. **Go to http://localhost:3000**
2. **Type in natural language**: "When someone fills out my contact form, send them a welcome email and add them to my CRM"
3. **Watch AI create the workflow automatically**

### **3. Monitor with Serena MCP**
1. **Access Serena dashboard**: http://localhost:8005
2. **Set up competitive intelligence**: Monitor competitor pricing
3. **Create market analysis**: Track industry trends

## 📞 Support

### **Community Support**
- **GitHub Issues**: https://github.com/flowintent/flowintent/issues
- **Discord**: https://discord.gg/flowintent
- **Documentation**: https://docs.flowintent.com

### **Enterprise Support**
- **Email**: support@flowintent.com
- **Phone**: +1-800-FLOWINTENT
- **SLA**: 99.9% uptime guarantee

## 🎉 Success!

**FlowIntent** is now ready for deployment at **flowintent.com** with:
- ✅ Complete AI-first workflow automation
- ✅ Enhanced Serena MCP web automation
- ✅ 60+ integrations ready to use
- ✅ Competitive market positioning
- ✅ Enterprise-grade security

**Start building intelligent workflows today!**
