# Agentic Workflow Builder Documentation

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB 4.4+
- Docker (optional, for MCP containers)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agentic-workflow-builder
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/agentic-workflow-builder
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
```

### Database Setup

The application uses MongoDB. You can either:
- Install MongoDB locally
- Use MongoDB Atlas (cloud)
- Use Docker: `docker run -d -p 27017:27017 mongo`

## 🤖 Natural Language Processing

### How It Works

The AI service uses OpenAI's GPT-4 to parse natural language descriptions into structured workflows:

1. **Input**: User describes workflow in plain English
2. **Processing**: AI analyzes the description and identifies:
   - Trigger conditions
   - Actions to perform
   - Service integrations needed
   - Data flow between steps
3. **Output**: Structured workflow with steps, configurations, and connections

### Example Transformations

**Input**: "When someone fills out my contact form, send them a welcome email and add them to my CRM"

**Output**:
```json
{
  "name": "Contact Form to CRM",
  "steps": [
    {
      "type": "trigger",
      "service": "webhooks",
      "action": "form_submission",
      "description": "Contact form submitted"
    },
    {
      "type": "action",
      "service": "gmail",
      "action": "send_email",
      "description": "Send welcome email"
    },
    {
      "type": "action",
      "service": "hubspot",
      "action": "create_contact",
      "description": "Add contact to CRM"
    }
  ]
}
```

## 🔌 Integrations

### Supported Services

#### Communication
- **Slack**: Send messages, create channels, manage users
- **Discord**: Bot interactions, channel management
- **Telegram**: Send messages, manage bots
- **Email (SMTP)**: Send emails with templates

#### Productivity
- **Notion**: Create pages, update databases
- **Airtable**: Manage records, sync data
- **ClickUp**: Create tasks, update projects
- **Trello**: Manage boards, cards, lists

#### CRM & Sales
- **HubSpot**: Manage contacts, deals, companies
- **Salesforce**: CRM operations, lead management
- **Pipedrive**: Sales pipeline management

#### Payment & Finance
- **Stripe**: Payment processing, subscription management
- **PayPal**: Payment handling

#### Development
- **GitHub**: Repository management, issues, PRs
- **GitLab**: CI/CD, project management

### Adding New Integrations

1. **Define the integration in `backend/src/routes/integrations.ts`**:
   ```typescript
   {
     id: 'your-service',
     name: 'Your Service',
     description: 'Service description',
     category: 'Category',
     icon: '🔧'
   }
   ```

2. **Implement the service connector**:
   ```typescript
   // Create service-specific API handlers
   class YourServiceConnector {
     async authenticate(credentials: any) { /* ... */ }
     async executeAction(action: string, params: any) { /* ... */ }
   }
   ```

3. **Add to AI parsing prompts** in `backend/src/routes/ai.ts`

## 🐳 MCP Container Support

### What are MCP Containers?

MCP (Model Context Protocol) containers are Docker containers that provide specialized AI capabilities and integrations. They extend the workflow builder with:

- Custom AI models
- Domain-specific tools
- External API integrations
- Data processing capabilities

### Managing MCP Containers

#### Create a Container
```bash
POST /api/mcp
{
  "name": "Custom AI Tool",
  "image": "your-org/mcp-tool:latest",
  "port": 8080,
  "capabilities": ["nlp", "data-processing"]
}
```

#### Start/Stop Containers
```bash
POST /api/mcp/{id}/start
POST /api/mcp/{id}/stop
```

#### Execute Commands
```bash
POST /api/mcp/{id}/execute
{
  "command": "process-data",
  "args": ["--input", "data.json"]
}
```

## 📊 Workflow Engine

### Workflow Structure

```typescript
interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  status: 'active' | 'paused' | 'error' | 'draft'
  schedule?: {
    type: 'cron' | 'interval' | 'webhook'
    value: string
  }
}

interface WorkflowStep {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'delay'
  service: string
  action: string
  config: any
  position: { x: number; y: number }
  connections: string[]
}
```

### Execution Flow

1. **Trigger**: Workflow starts when trigger condition is met
2. **Processing**: Each step is executed in order
3. **Branching**: Conditions can create different execution paths
4. **Error Handling**: Failed steps can retry or halt execution
5. **Completion**: Results are logged and notifications sent

### Scheduling

Workflows can be scheduled in multiple ways:

- **Cron**: Traditional cron expressions (`0 9 * * 1` = Every Monday 9 AM)
- **Interval**: Run every X minutes/hours
- **Webhook**: Triggered by external HTTP requests
- **Manual**: User-initiated execution

## 🔐 Authentication & Security

### JWT Authentication

The API uses JWT tokens for authentication:

```typescript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Returns
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { /* user data */ }
}
```

### API Keys

Users can generate API keys for programmatic access:

```typescript
// Generate API key
POST /api/auth/api-key/production

// Use in requests
Authorization: Bearer awb_prod_abcdef123456
```

### Security Best Practices

- All passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- API keys can be rotated
- Rate limiting on all endpoints
- Input validation and sanitization

## 🎨 Frontend Architecture

### Component Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main layout with navigation
│   ├── WorkflowCanvas.tsx # Visual workflow editor
│   └── WorkflowPreview.tsx # Workflow preview
├── pages/               # Page components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── WorkflowBuilder.tsx # Natural language workflow builder
│   ├── WorkflowList.tsx # Workflow management
│   └── Integrations.tsx # Service integrations
├── hooks/               # Custom React hooks
├── services/            # API communication
└── types/               # TypeScript type definitions
```

### State Management

Using Zustand for lightweight state management:

```typescript
interface WorkflowStore {
  workflows: Workflow[]
  currentWorkflow: Workflow | null
  isLoading: boolean
  fetchWorkflows: () => Promise<void>
  createWorkflow: (data: any) => Promise<void>
}
```

### Real-time Updates

Socket.IO integration for live updates:

```typescript
// Client-side
const socket = io('http://localhost:8000')

socket.on('workflow-updated', (data) => {
  // Update UI
})

// Server-side
io.emit('workflow-updated', { workflow })
```

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# All tests
npm test
```

### Test Structure

```typescript
// Example test
describe('Workflow API', () => {
  it('should create a workflow', async () => {
    const response = await request(app)
      .post('/api/workflows')
      .send({
        name: 'Test Workflow',
        description: 'Test description',
        steps: []
      })
      .expect(201)
    
    expect(response.body.success).toBe(true)
  })
})
```

## 🚢 Deployment

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Environment-specific Configuration

#### Development
- Hot reloading enabled
- Debug logging
- MongoDB local instance

#### Production
- Optimized builds
- SSL/TLS enabled
- Database clustering
- Load balancing

### Monitoring

- Application logs centralized
- Performance metrics tracked
- Error reporting integrated
- Health checks on all services

## 📚 API Reference

### Authentication Endpoints

```typescript
POST /api/auth/login
POST /api/auth/register
GET /api/auth/profile
PUT /api/auth/profile
PUT /api/auth/password
```

### Workflow Endpoints

```typescript
GET /api/workflows
POST /api/workflows
GET /api/workflows/:id
PUT /api/workflows/:id
DELETE /api/workflows/:id
POST /api/workflows/:id/start
POST /api/workflows/:id/pause
POST /api/workflows/:id/execute
```

### Integration Endpoints

```typescript
GET /api/integrations
GET /api/integrations/available
POST /api/integrations
PUT /api/integrations/:id
DELETE /api/integrations/:id
POST /api/integrations/:id/test
```

### AI Endpoints

```typescript
POST /api/ai/parse-workflow
POST /api/ai/suggest
POST /api/ai/validate
```

### MCP Container Endpoints

```typescript
GET /api/mcp
POST /api/mcp
GET /api/mcp/:id
PUT /api/mcp/:id
DELETE /api/mcp/:id
POST /api/mcp/:id/start
POST /api/mcp/:id/stop
POST /api/mcp/:id/execute
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- GitHub Issues: For bug reports and feature requests
- Documentation: This file and inline code comments
- Community: Join our Discord server

---

For more detailed examples and advanced usage, check the `/examples` directory in the repository.