# Orchestra Kubernetes Deployment Script

# Check if kubectl is installed
try {
    kubectl version --client
} catch {
    Write-Error "kubectl is not installed. Please install kubectl before running this script."
    exit 1
}

# Create namespace
Write-Host "Creating orchestra namespace..."
kubectl create namespace orchestra

# Apply secrets
Write-Host "Applying secrets..."
kubectl apply -f k8s/secrets.yaml -n orchestra

# Deploy databases
Write-Host "Deploying database services..."
kubectl apply -f k8s/databases.yaml -n orchestra

# Wait for databases to be ready
Write-Host "Waiting for database services to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n orchestra --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n orchestra --timeout=120s
kubectl wait --for=condition=ready pod -l app=qdrant -n orchestra --timeout=120s

# Initialize the database
Write-Host "Initializing the database..."
kubectl exec -it $(kubectl get pod -l app=postgres -n orchestra -o jsonpath="{.items[0].metadata.name}") -n orchestra -- psql -U postgres -d orchestra -c "CREATE DATABASE orchestra;"

# Deploy microservices
Write-Host "Deploying microservices..."
kubectl apply -f k8s/workflow-engine.yaml -n orchestra
kubectl apply -f k8s/agent-runtime.yaml -n orchestra
kubectl apply -f k8s/integration-service.yaml -n orchestra
kubectl apply -f k8s/maestro-service.yaml -n orchestra
kubectl apply -f k8s/api-gateway.yaml -n orchestra

# Wait for microservices to be ready
Write-Host "Waiting for microservices to be ready..."
kubectl wait --for=condition=ready pod -l app=workflow-engine -n orchestra --timeout=120s
kubectl wait --for=condition=ready pod -l app=agent-runtime -n orchestra --timeout=120s
kubectl wait --for=condition=ready pod -l app=integration-service -n orchestra --timeout=120s
kubectl wait --for=condition=ready pod -l app=maestro-service -n orchestra --timeout=120s
kubectl wait --for=condition=ready pod -l app=api-gateway -n orchestra --timeout=120s

# Initialize the database schema
Write-Host "Initializing the database schema..."
kubectl exec -it $(kubectl get pod -l app=workflow-engine -n orchestra -o jsonpath="{.items[0].metadata.name}") -n orchestra -- python -c "from shared.db.init_db import init_db; init_db()"

# Deploy ingress
Write-Host "Deploying ingress..."
kubectl apply -f k8s/ingress.yaml -n orchestra

# Get service URLs
Write-Host "\nDeployment complete! Here are your service URLs:\n"
Write-Host "API Gateway: https://api.orchestra.example.com"
Write-Host "\nTo access the API Gateway locally, run:\n"
Write-Host "kubectl port-forward svc/api-gateway 8000:80 -n orchestra"
Write-Host "Then access: http://localhost:8000"

Write-Host "\nTo view all resources:\n"
Write-Host "kubectl get all -n orchestra"

Write-Host "\nTo view logs for a service:\n"
Write-Host "kubectl logs -f deployment/api-gateway -n orchestra"

Write-Host "\nTo delete the deployment:\n"
Write-Host "kubectl delete namespace orchestra"