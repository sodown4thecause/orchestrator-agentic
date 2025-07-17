# Natural Language Agentic Workflow Platform

A comprehensive platform that enables users to create complex multi-step workflows using natural language commands. Built with a microservices architecture and inspired by the Eko framework.

## 🌟 Features

### Core Capabilities
- **Natural Language Interface**: Create workflows by simply describing what you want to accomplish
- **Intent Parsing**: Advanced LLM-powered understanding of user commands
- **Dynamic Workflow Generation**: Automatic creation of multi-step workflows from natural language
- **Multi-Agent Orchestration**: Coordinate multiple specialized agents to execute complex tasks
- **Real-time Execution**: Stream workflow progress with live updates
- **Human-in-the-Loop**: Intervention points for user approval and guidance

### Example Use Cases
```
"Analyze the sales data from last quarter and create a summary report"
"Send a welcome email to all new users who signed up this week"
"Monitor our website uptime and alert me if it goes down"
"Process customer feedback and categorize by sentiment"
```

## 🏗️ Architecture

### Microservices Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Intent Parser   │    │ Workflow Engine │
│  (React + TS)   │◄──►│   Service        │◄──►│    Service      │
│                 │    │  (FastAPI + LLM) │    │   (FastAPI)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Gateway   │    │    General       │    │   Existing      │
│   (FastAPI)     │    │     Agent        │    │   Services      │
│                 │    │   (FastAPI)      │    │ (Maestro, etc.) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### New Services Added

1. **Intent Parser Service** (Port 8010)
   - Processes natural language commands
   - Extracts intent, parameters, and context
   - Generates workflow specifications

2. **Enhanced Workflow Engine** (Port 8011)
   - Creates dynamic workflows from parsed intents
   - Manages workflow execution and state
   - Coordinates agent interactions

3. **General Agent** (Port 8009)
   - Executes workflow steps
   - Provides multiple tool capabilities
   - Handles various task types

4. **Natural Language Frontend**
   - React-based interface for natural language input
   - Real-time workflow visualization
   - Progress monitoring and intervention

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- OpenAI API Key

### Environment Setup

1. **Clone and navigate to the project**:
   ```bash
   cd "orchestrator agentic"
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**:
   ```env
   # Required
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Database
   POSTGRES_DSN=postgresql://postgres:postgres@postgres:5432/orchestra
   
   # Redis
   REDIS_URL=redis://redis:6379
   
   # Vector Database
   QDRANT_URL=http://qdrant:6333
   
   # API Security
   API_KEY=your_secure_api_key
   
   # Logging
   LOG_LEVEL=info
   DEBUG=false
   ```

### Running the Platform

#### Option 1: Full Docker Deployment (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

#### Option 2: Selective Service Startup

```bash
# Start only natural language services
docker-compose up --build intent-parser workflow-engine-new general-agent frontend

# Start existing orchestrator services
docker-compose up --build api-gateway workflow-engine agent-runtime
```

### Accessing the Platform

- **Natural Language Interface**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Intent Parser**: http://localhost:8010
- **New Workflow Engine**: http://localhost:8011
- **General Agent**: http://localhost:8009

## 💡 Usage Examples

### Basic Natural Language Commands

1. **Data Processing**:
   ```
   "Count the number of items in my dataset and show me the total"
   ```

2. **File Operations**:
   ```
   "Read the contents of report.txt and extract the key insights"
   ```

3. **API Integration**:
   ```
   "Call the weather API and get today's forecast for New York"
   ```

4. **Multi-step Workflow**:
   ```
   "Download the sales data, analyze trends, and create a summary report"
   ```

### Advanced Workflows

1. **Conditional Logic**:
   ```
   "If the server response time is over 500ms, send an alert email"
   ```

2. **Data Pipeline**:
   ```
   "Extract data from the database, clean it, apply transformations, and save to CSV"
   ```

3. **Monitoring Setup**:
   ```
   "Monitor our website every 5 minutes and log any downtime"
   ```

## 🔧 Development

### Local Development Setup

#### Frontend Development
```bash
cd frontend
npm install
npm start
```

#### Backend Service Development
```bash
# Intent Parser
cd backend/services/intent-parser
pip install -r requirements.txt
python src/main.py

# Workflow Engine
cd backend/services/workflow-engine
pip install -r requirements.txt
python src/main.py

# General Agent
cd backend/services/agents/general-agent
pip install -r requirements.txt
python src/main.py
```

### Adding New Agents

1. **Create agent directory**:
   ```bash
   mkdir -p backend/services/agents/your-agent
   ```

2. **Implement agent service**:
   ```python
   # backend/services/agents/your-agent/src/main.py
   from fastapi import FastAPI
   
   app = FastAPI(title="Your Agent")
   
   @app.post("/execute")
   async def execute_step(request: ExecutionRequest):
       # Your agent logic here
       pass
   ```

3. **Add to docker-compose.yml**:
   ```yaml
   your-agent:
     build:
       context: ./backend/services/agents/your-agent
     ports:
       - "8012:8009"
   ```

### Extending Tool Capabilities

1. **Add new tools to General Agent**:
   ```python
   # In backend/services/agents/general-agent/src/main.py
   async def your_new_tool(self, parameters: Dict[str, Any], context: Dict[str, Any]):
       # Tool implementation
       return {
           "output": result,
           "context_updates": updates,
           "logs": logs
       }
   ```

2. **Register tool**:
   ```python
   self.tools["your_new_tool"] = self.your_new_tool
   ```

## 📊 Monitoring and Debugging

### Health Checks
```bash
# Check all services
curl http://localhost:8010/health  # Intent Parser
curl http://localhost:8011/health  # Workflow Engine
curl http://localhost:8009/health  # General Agent
```

### Logs
```bash
# View logs for specific service
docker-compose logs -f intent-parser
docker-compose logs -f workflow-engine-new
docker-compose logs -f general-agent
```

### Database Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d orchestra

# Connect to Redis
docker-compose exec redis redis-cli
```

## 🔒 Security Considerations

- **API Keys**: Store securely in environment variables
- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: Implement rate limiting for API endpoints
- **Authentication**: Add authentication for production deployments
- **Network Security**: Use internal Docker networks for service communication

## 🚀 Deployment

### Production Deployment

1. **Environment Configuration**:
   ```bash
   # Set production environment variables
   export DEBUG=false
   export LOG_LEVEL=warning
   export API_KEY=secure_production_key
   ```

2. **Docker Compose Override**:
   ```yaml
   # docker-compose.prod.yml
   version: '3.8'
   services:
     frontend:
       environment:
         - NODE_ENV=production
     intent-parser:
       environment:
         - LOG_LEVEL=warning
   ```

3. **Deploy**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Scaling

```bash
# Scale specific services
docker-compose up --scale general-agent=3 --scale intent-parser=2
```

## 📈 Performance Optimization

- **Caching**: Redis caching for frequent requests
- **Connection Pooling**: Database connection pooling
- **Async Processing**: Non-blocking I/O operations
- **Load Balancing**: Multiple agent instances
- **Resource Limits**: Docker resource constraints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Ensure all services are healthy
4. Review the API documentation at `/docs` endpoints

---

**Built with ❤️ for the future of agentic workflows**