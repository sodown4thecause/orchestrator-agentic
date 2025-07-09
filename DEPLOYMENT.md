# Orchestra Deployment Guide

This guide provides instructions for deploying the Orchestra platform in both local development and production environments.

## Prerequisites

- Docker and Docker Compose (for local development)
- Kubernetes cluster (for production deployment)
- kubectl CLI tool
- Helm (optional, for managing Kubernetes applications)
- PostgreSQL, Redis, and Qdrant instances (or use the provided configurations)

## Local Development Setup

### 1. Environment Configuration

Copy the example environment file and configure it with your settings:

```bash
cp .env.example .env
```

Edit the `.env` file to set your API keys, database connections, and other configuration options.

### 2. Start the Services

Use Docker Compose to start all services:

```bash
docker-compose up -d
```

This will start the following services:
- API Gateway (http://localhost:8000)
- Workflow Engine (http://localhost:8001)
- Agent Runtime (http://localhost:8002)
- Integration Service (http://localhost:8003)
- Maestro Service (http://localhost:8004)
- PostgreSQL (localhost:5432)
- Redis (localhost:6379)
- Qdrant (localhost:6333)

### 3. Initialize the Database

Create the necessary database tables:

```bash
docker-compose exec workflow-engine python -c "from shared.db.postgres import init_db; init_db()"
```

## Production Deployment on Kubernetes

### 1. Create Kubernetes Secrets

First, create the secrets needed by the services:

```bash
# Edit the secrets.yaml file to set your actual secrets (base64 encoded)
vim k8s/secrets.yaml

# Apply the secrets
kubectl apply -f k8s/secrets.yaml
```

### 2. Deploy Database Services

Deploy PostgreSQL, Redis, and Qdrant:

```bash
kubectl apply -f k8s/databases.yaml
```

### 3. Deploy Microservices

Deploy all the Orchestra microservices:

```bash
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/workflow-engine.yaml
kubectl apply -f k8s/agent-runtime.yaml
kubectl apply -f k8s/integration-service.yaml
kubectl apply -f k8s/maestro-service.yaml
```

### 4. Configure Ingress

Deploy the ingress controller to expose the API Gateway:

```bash
# Edit the ingress.yaml file to set your domain name
vim k8s/ingress.yaml

# Apply the ingress configuration
kubectl apply -f k8s/ingress.yaml
```

### 5. Verify Deployment

Check that all pods are running:

```bash
kubectl get pods
```

Test the API Gateway:

```bash
curl -H "X-API-Key: your-api-key" https://api.orchestra.example.com/health
```

## Building and Pushing Docker Images

To build and push the Docker images to your container registry:

```bash
# Build the images
docker build -t your-registry/orchestra/api-gateway:latest -f docker/Dockerfile.microservice api_gateway/
docker build -t your-registry/orchestra/workflow-engine:latest -f docker/Dockerfile.microservice workflow_engine/
docker build -t your-registry/orchestra/agent-runtime:latest -f docker/Dockerfile.microservice agent_runtime/
docker build -t your-registry/orchestra/integration-service:latest -f docker/Dockerfile.microservice integration_service/
docker build -t your-registry/orchestra/maestro-service:latest -f docker/Dockerfile.microservice maestro_service/

# Push the images
docker push your-registry/orchestra/api-gateway:latest
docker push your-registry/orchestra/workflow-engine:latest
docker push your-registry/orchestra/agent-runtime:latest
docker push your-registry/orchestra/integration-service:latest
docker push your-registry/orchestra/maestro-service:latest
```

## Environment Variables

The following environment variables are used by the Orchestra services:

| Variable | Description | Default |
|----------|-------------|--------|
| API_KEY | API key for service authentication | orchestra-secret-key |
| POSTGRES_DSN | PostgreSQL connection string | dbname=orchestra user=postgres password=postgres host=localhost |
| REDIS_URL | Redis connection URL | redis://localhost:6379/0 |
| QDRANT_URL | Qdrant connection URL | http://localhost:6333 |
| QDRANT_COLLECTION | Qdrant collection name | orchestra_vectors |
| OPENAI_API_KEY | OpenAI API key | - |
| OPENAI_MODEL | OpenAI model to use | gpt-4-turbo |
| DEBUG | Enable debug mode | false |
| LOG_LEVEL | Logging level | info |
| PORT | Server port | 8000 |
| HOST | Server host | 0.0.0.0 |

## Monitoring and Observability

The Orchestra platform includes OpenTelemetry instrumentation for monitoring and observability. To enable it, set the following environment variables:

```
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-otel-collector:4317
OTEL_SERVICE_NAME=orchestra
```

## Scaling

To scale the services based on load, you can adjust the number of replicas in the Kubernetes deployment files:

```bash
kubectl scale deployment workflow-engine --replicas=5
kubectl scale deployment agent-runtime --replicas=10
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check that the database services are running
   - Verify the connection strings in the environment variables

2. **API Key Authentication Failures**
   - Ensure the API_KEY environment variable is set correctly in all services
   - Check that the API key is being passed in the X-API-Key header

3. **Pod Startup Failures**
   - Check the pod logs: `kubectl logs <pod-name>`
   - Verify that all required environment variables are set

### Viewing Logs

```bash
# View logs for a specific service
kubectl logs -f deployment/workflow-engine

# View logs for all pods with a specific label
kubectl logs -f -l app=agent-runtime
```

## Backup and Restore

### Database Backup

```bash
# PostgreSQL backup
kubectl exec -it postgres-0 -- pg_dump -U postgres orchestra > orchestra_backup.sql

# Redis backup
kubectl exec -it redis-0 -- redis-cli SAVE
kubectl cp redis-0:/data/dump.rdb redis_backup.rdb

# Qdrant backup
# Follow Qdrant's backup procedures for your specific version
```

### Database Restore

```bash
# PostgreSQL restore
kubectl cp orchestra_backup.sql postgres-0:/tmp/
kubectl exec -it postgres-0 -- psql -U postgres -d orchestra -f /tmp/orchestra_backup.sql

# Redis restore
kubectl cp redis_backup.rdb redis-0:/data/dump.rdb
kubectl exec -it redis-0 -- redis-cli SHUTDOWN SAVE

# Qdrant restore
# Follow Qdrant's restore procedures for your specific version
```

## Security Considerations

1. **API Key Management**
   - Rotate API keys regularly
   - Use a secret management solution like HashiCorp Vault or AWS Secrets Manager

2. **Network Security**
   - Use network policies to restrict communication between services
   - Enable TLS for all external communication

3. **Database Security**
   - Use strong passwords for database users
   - Restrict database access to only the necessary services

4. **LLM API Keys**
   - Secure your OpenAI API keys and other LLM provider credentials
   - Set appropriate usage limits to prevent unexpected costs