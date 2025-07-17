# Getting Started with Agentic Workflow Builder

Welcome to the Agentic Workflow Builder! This guide will help you set up and start using the platform to create intelligent workflows using natural language.

## ✨ What You've Built

You now have a complete agentic workflow builder that includes:

### 🎯 Core Features
- **Natural Language Workflow Creation**: Just describe what you want to automate in plain English
- **60+ Service Integrations**: Connect to Slack, Gmail, HubSpot, Stripe, GitHub, and many more
- **Visual Workflow Editor**: Drag-and-drop interface powered by React Flow
- **MCP Container Support**: Run custom AI tools and services in Docker containers
- **Real-time Execution**: Monitor workflows as they run with live updates
- **AI-Powered Suggestions**: Get intelligent recommendations for workflow improvements

### 🏗️ Architecture Highlights
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB + Socket.IO
- **AI Integration**: OpenAI GPT-4 for natural language processing
- **Real-time**: WebSocket connections for live updates
- **Containerized**: Full Docker support for easy deployment

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Install Node.js 18+
node --version  # Should be 18 or higher

# Install MongoDB (or use Docker)
# macOS: brew install mongodb
# Ubuntu: sudo apt install mongodb
# Windows: Download from mongodb.com

# Get OpenAI API Key
# Visit https://platform.openai.com/api-keys
```

### 2. Setup
```bash
# Clone and install
git clone <your-repo>
cd agentic-workflow-builder
npm run install:all

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your OpenAI API key and MongoDB connection
```

### 3. Start Development
```bash
# Start all services
npm run dev

# Or start with Docker
docker-compose up
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/health

## 🎨 Using the Platform

### Creating Your First Workflow

1. **Open the Workflow Builder**
   - Go to http://localhost:3000
   - Click "Create Workflow" or navigate to "New Workflow"

2. **Describe Your Automation**
   Try these examples:
   ```
   "When someone fills out my contact form, send them a welcome email and add them to my CRM"
   
   "Every Monday at 9 AM, create a summary of last week's GitHub issues and post it to our Slack channel"
   
   "When a new order comes in Stripe, add the customer to Mailchimp and create a task in ClickUp"
   ```

3. **Review and Configure**
   - The AI will parse your description into workflow steps
   - Review the generated workflow
   - Configure service connections and settings

4. **Test and Deploy**
   - Test the workflow with sample data
   - Activate it to start running automatically

### Setting Up Integrations

1. **Go to Integrations Page**
   - View all available services
   - See connection status for each

2. **Connect a Service**
   - Click "Connect" on any service
   - Provide API keys or OAuth credentials
   - Test the connection

3. **Use in Workflows**
   - Connected services appear in workflow builder
   - AI automatically suggests relevant services

### Managing MCP Containers

1. **Add a Container**
   - Go to Settings → MCP Containers
   - Add Docker image URL
   - Configure capabilities

2. **Start/Stop Containers**
   - Manage container lifecycle
   - View logs and health status

3. **Use in Workflows**
   - MCP containers appear as available services
   - Execute custom AI tools and processors

## 🔧 Configuration

### Environment Variables
```env
# Backend (.env)
PORT=8000
MONGODB_URI=mongodb://localhost:27017/agentic-workflow-builder
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:3000
```

### Service Credentials
Common integration setups:

#### Slack
1. Create Slack app at https://api.slack.com/apps
2. Get Bot Token and add to integration

#### Gmail
1. Enable Gmail API in Google Cloud Console
2. Create OAuth credentials
3. Add to integration

#### HubSpot
1. Create private app in HubSpot
2. Get API key
3. Add to integration

## 📊 Monitoring & Analytics

### Dashboard Features
- **Workflow Statistics**: Active, paused, and error counts
- **Execution Metrics**: Success rates and performance
- **Recent Activity**: Latest workflow runs and events
- **Integration Health**: Connection status and usage

### Real-time Updates
- Workflow execution progress
- Integration connection status
- Error notifications
- Performance metrics

## 🔐 Security

### Authentication
- JWT-based authentication
- API key management
- Role-based access control

### Data Protection
- Encrypted credential storage
- Secure API communication
- Input validation and sanitization

## 📚 Advanced Features

### Custom Integrations
Add new services by:
1. Adding to integration catalog
2. Implementing service connector
3. Updating AI parsing prompts

### Workflow Scheduling
- Cron expressions for time-based triggers
- Webhook endpoints for external triggers
- Manual execution for testing

### Error Handling
- Automatic retries with backoff
- Custom error handling per step
- Detailed logging and debugging

## 🚀 Deployment

### Production Setup
```bash
# Build for production
npm run build

# Run with Docker
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to cloud providers
# AWS, Google Cloud, Azure, etc.
```

### Scaling Considerations
- Use MongoDB Atlas for database
- Implement Redis for caching
- Add load balancers for high availability
- Monitor with tools like Prometheus/Grafana

## 🤝 Next Steps

### Immediate Actions
1. Set up your first workflow
2. Connect your most-used services
3. Explore the dashboard and monitoring
4. Try the MCP container features

### Advanced Usage
1. Create custom integrations
2. Build complex multi-step workflows
3. Set up monitoring and alerts
4. Implement custom MCP containers

### Community
- Join our Discord for support
- Contribute to the project on GitHub
- Share your workflows and integrations
- Report bugs and feature requests

## 📝 Example Workflows

### 1. Lead Generation Pipeline
```
"When someone downloads our whitepaper, add them to our CRM as a lead, 
send them to our email nurture sequence, and notify our sales team on Slack"
```

### 2. Support Ticket Automation
```
"When a high-priority support ticket is created, create a task in our project 
management system and alert the on-call engineer via SMS"
```

### 3. Content Distribution
```
"When I publish a new blog post, share it on all our social media channels, 
send it to our newsletter subscribers, and post it in our community Slack"
```

### 4. Data Synchronization
```
"Every hour, sync customer data from our CRM to our analytics database 
and update our customer success dashboard"
```

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check MongoDB is running
mongod --version

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/agentic-workflow-builder
```

**OpenAI API Errors**
```bash
# Verify API key is set
echo $OPENAI_API_KEY

# Check API key validity at https://platform.openai.com/api-keys
```

**Integration Connection Issues**
- Double-check API keys and credentials
- Verify service permissions and scopes
- Check service API documentation for changes

### Getting Help
- Check the DOCUMENTATION.md for detailed guides
- Review error logs in the backend console
- Use the health check endpoints for debugging
- Join our community for support

---

🎉 **Congratulations!** You now have a fully functional agentic workflow builder. Start by creating your first workflow and experience the power of natural language automation!