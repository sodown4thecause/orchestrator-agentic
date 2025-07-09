# Orchestra Platform - Azure Deployment Script
# This script automates the deployment of the Orchestra platform to Azure

# Configuration Variables - Modify these as needed
$ResourceGroup = "orchestra-rg"
$Location = "eastus"
$AcrName = "orchestraregistry"
$AksName = "orchestra-aks"
$PostgresServerName = "orchestra-postgres"
$PostgresAdminUser = "postgresadmin"
$PostgresAdminPassword = "YourStrongPasswordHere" # Change this to a secure password
$PostgresDbName = "orchestra"
$RedisName = "orchestra-redis"
$ApiKey = "your-api-key" # Change this to your API key
$OpenAiApiKey = "your-openai-api-key" # Change this to your OpenAI API key

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Cyan

if (-not (Test-CommandExists "az")) {
    Write-Host "Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

if (-not (Test-CommandExists "kubectl")) {
    Write-Host "kubectl is not installed. Please install it from https://kubernetes.io/docs/tasks/tools/" -ForegroundColor Red
    exit 1
}

if (-not (Test-CommandExists "docker")) {
    Write-Host "Docker is not installed. Please install it from https://docs.docker.com/get-docker/" -ForegroundColor Red
    exit 1
}

# Check if logged in to Azure
$loginStatus = az account show 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
    exit 1
}

Write-Host "All prerequisites met!" -ForegroundColor Green

# Step 1: Create Resource Group
Write-Host "\nStep 1: Creating Resource Group..." -ForegroundColor Cyan
az group create --name $ResourceGroup --location $Location
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create resource group." -ForegroundColor Red
    exit 1
}
Write-Host "Resource Group created successfully!" -ForegroundColor Green

# Step 2: Create Azure Container Registry
Write-Host "\nStep 2: Creating Azure Container Registry..." -ForegroundColor Cyan
az acr create --resource-group $ResourceGroup --name $AcrName --sku Basic
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create Azure Container Registry." -ForegroundColor Red
    exit 1
}

az acr login --name $AcrName
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to log in to Azure Container Registry." -ForegroundColor Red
    exit 1
}
Write-Host "Azure Container Registry created and logged in successfully!" -ForegroundColor Green

# Step 3: Build and Push Docker Images
Write-Host "\nStep 3: Building and pushing Docker images..." -ForegroundColor Cyan

$services = @("api-gateway", "workflow-engine", "agent-runtime", "integration-service", "maestro-service")
$directories = @("api_gateway", "workflow_engine", "agent_runtime", "integration_service", "maestro_service")

for ($i = 0; $i -lt $services.Length; $i++) {
    $service = $services[$i]
    $directory = $directories[$i]
    
    Write-Host "Building $service image..." -ForegroundColor Yellow
    docker build -t "$AcrName.azurecr.io/orchestra/$service`:latest" -f docker/Dockerfile.microservice $directory/
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to build $service image." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Pushing $service image to ACR..." -ForegroundColor Yellow
    docker push "$AcrName.azurecr.io/orchestra/$service`:latest"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to push $service image to ACR." -ForegroundColor Red
        exit 1
    }
}

Write-Host "All Docker images built and pushed successfully!" -ForegroundColor Green

# Step 4: Create AKS Cluster
Write-Host "\nStep 4: Creating AKS Cluster..." -ForegroundColor Cyan
az aks create \
  --resource-group $ResourceGroup \
  --name $AksName \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --attach-acr $AcrName

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create AKS Cluster." -ForegroundColor Red
    exit 1
}

az aks get-credentials --resource-group $ResourceGroup --name $AksName --overwrite-existing
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to get AKS credentials." -ForegroundColor Red
    exit 1
}
Write-Host "AKS Cluster created and credentials obtained successfully!" -ForegroundColor Green

# Step 5: Create Azure Database for PostgreSQL
Write-Host "\nStep 5: Creating Azure Database for PostgreSQL..." -ForegroundColor Cyan
az postgres server create \
  --resource-group $ResourceGroup \
  --name $PostgresServerName \
  --location $Location \
  --admin-user $PostgresAdminUser \
  --admin-password $PostgresAdminPassword \
  --sku-name GP_Gen5_2

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create PostgreSQL server." -ForegroundColor Red
    exit 1
}

az postgres db create \
  --resource-group $ResourceGroup \
  --server-name $PostgresServerName \
  --name $PostgresDbName

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create PostgreSQL database." -ForegroundColor Red
    exit 1
}

az postgres server firewall-rule create \
  --resource-group $ResourceGroup \
  --server-name $PostgresServerName \
  --name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create PostgreSQL firewall rule." -ForegroundColor Red
    exit 1
}
Write-Host "PostgreSQL server and database created successfully!" -ForegroundColor Green

# Step 6: Create Azure Cache for Redis
Write-Host "\nStep 6: Creating Azure Cache for Redis..." -ForegroundColor Cyan
az redis create \
  --resource-group $ResourceGroup \
  --name $RedisName \
  --sku Basic \
  --vm-size C0 \
  --location $Location

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create Redis cache." -ForegroundColor Red
    exit 1
}

$redisKey = az redis list-keys --resource-group $ResourceGroup --name $RedisName --query primaryKey -o tsv
$redisHost = "$RedisName.redis.cache.windows.net"
$redisUrl = "redis://:$redisKey@$redisHost:6380?ssl=true"
Write-Host "Redis cache created successfully!" -ForegroundColor Green

# Step 7: Create Kubernetes Secrets
Write-Host "\nStep 7: Creating Kubernetes Secrets..." -ForegroundColor Cyan

# Get PostgreSQL connection string
$postgresDsn = "dbname=$PostgresDbName user=$PostgresAdminUser password=$PostgresAdminPassword host=$PostgresServerName.postgres.database.azure.com"

# Base64 encode secrets
$apiKeyBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($ApiKey))
$postgresDsnBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($postgresDsn))
$redisUrlBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($redisUrl))
$qdrantUrlBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("http://qdrant:6333"))
$openaiApiKeyBase64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($OpenAiApiKey))

# Create secrets YAML
$secretsYaml = @"
apiVersion: v1
kind: Secret
metadata:
  name: orchestra-secrets
type: Opaque
data:
  api-key: $apiKeyBase64
  postgres-dsn: $postgresDsnBase64
  redis-url: $redisUrlBase64
  qdrant-url: $qdrantUrlBase64
  openai-api-key: $openaiApiKeyBase64
"@

$secretsYaml | Out-File -FilePath "azure-secrets.yaml" -Encoding utf8

# Apply secrets
kubectl apply -f azure-secrets.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to apply Kubernetes secrets." -ForegroundColor Red
    exit 1
}
Write-Host "Kubernetes secrets created successfully!" -ForegroundColor Green

# Step 8: Update Kubernetes Manifests for Azure
Write-Host "\nStep 8: Updating Kubernetes Manifests for Azure..." -ForegroundColor Cyan

# Create directory for Azure-specific manifests
if (-not (Test-Path "k8s-azure")) {
    New-Item -Path "k8s-azure" -ItemType Directory | Out-Null
}

# Copy and modify the existing manifests
Get-ChildItem -Path "k8s" -Filter "*.yaml" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "image: orchestra/", "image: $AcrName.azurecr.io/orchestra/"
    $content | Set-Content -Path "k8s-azure/$($_.Name)" -NoNewline
}
Write-Host "Kubernetes manifests updated successfully!" -ForegroundColor Green

# Step 9: Deploy to AKS
Write-Host "\nStep 9: Deploying to AKS..." -ForegroundColor Cyan

# Apply database manifests first
kubectl apply -f k8s-azure/databases.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to apply database manifests." -ForegroundColor Red
    exit 1
}

# Wait for databases to be ready
Write-Host "Waiting for databases to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Apply the rest of the manifests
kubectl apply -f azure-secrets.yaml
kubectl apply -f k8s-azure/workflow-engine.yaml
kubectl apply -f k8s-azure/agent-runtime.yaml
kubectl apply -f k8s-azure/integration-service.yaml
kubectl apply -f k8s-azure/maestro-service.yaml
kubectl apply -f k8s-azure/api-gateway.yaml

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to apply service manifests." -ForegroundColor Red
    exit 1
}
Write-Host "Services deployed successfully!" -ForegroundColor Green

# Step 10: Create Azure Application Gateway Ingress
Write-Host "\nStep 10: Creating Azure Application Gateway Ingress..." -ForegroundColor Cyan

# Create ingress YAML for Azure
$ingressYaml = @"
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: orchestra-ingress
  annotations:
    kubernetes.io/ingress.class: azure/application-gateway
    appgw.ingress.kubernetes.io/ssl-redirect: "true"
    appgw.ingress.kubernetes.io/use-private-ip: "false"
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 80
"@

$ingressYaml | Out-File -FilePath "k8s-azure/ingress-azure.yaml" -Encoding utf8

# Create public IP
az network public-ip create \
  --resource-group $ResourceGroup \
  --name orchestra-ip \
  --allocation-method Static \
  --sku Standard

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create public IP." -ForegroundColor Red
    exit 1
}

# Create identity for Application Gateway
az identity create -g $ResourceGroup -n orchestra-identity
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create identity for Application Gateway." -ForegroundColor Red
    exit 1
}

# Install Application Gateway Ingress Controller
Write-Host "Installing Application Gateway Ingress Controller..." -ForegroundColor Yellow
helm repo add application-gateway-kubernetes-ingress https://appgwingress.blob.core.windows.net/ingress-azure-helm-package/
helm repo update

$subscriptionId = az account show --query id -o tsv
$identityResourceId = az identity show -g $ResourceGroup -n orchestra-identity --query id -o tsv
$identityClientId = az identity show -g $ResourceGroup -n orchestra-identity --query clientId -o tsv

helm install ingress-azure \
  application-gateway-kubernetes-ingress/ingress-azure \
  --namespace default \
  --set appgw.subscriptionId=$subscriptionId \
  --set appgw.resourceGroup=$ResourceGroup \
  --set appgw.name=orchestra-appgw \
  --set appgw.shared=false \
  --set armAuth.type=aadPodIdentity \
  --set armAuth.identityResourceID=$identityResourceId \
  --set armAuth.identityClientID=$identityClientId \
  --set rbac.enabled=true

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install Application Gateway Ingress Controller." -ForegroundColor Red
    exit 1
}

# Apply ingress
kubectl apply -f k8s-azure/ingress-azure.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to apply ingress." -ForegroundColor Red
    exit 1
}
Write-Host "Ingress created successfully!" -ForegroundColor Green

# Step 11: Initialize the Database
Write-Host "\nStep 11: Initializing the Database..." -ForegroundColor Cyan

# Wait for workflow-engine pods to be ready
Write-Host "Waiting for workflow-engine pods to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Get the name of a workflow-engine pod
$pod = kubectl get pods -l app=workflow-engine -o jsonpath="{.items[0].metadata.name}"

# Initialize the database
kubectl exec -it $pod -- python -c "from shared.db.init_db import init_db; init_db()"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to initialize the database." -ForegroundColor Red
    exit 1
}
Write-Host "Database initialized successfully!" -ForegroundColor Green

# Step 12: Enable Azure Monitor
Write-Host "\nStep 12: Enabling Azure Monitor..." -ForegroundColor Cyan
az aks enable-addons \
  --resource-group $ResourceGroup \
  --name $AksName \
  --addons monitoring

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to enable Azure Monitor." -ForegroundColor Red
    exit 1
}
Write-Host "Azure Monitor enabled successfully!" -ForegroundColor Green

# Get the public IP of the Application Gateway
$publicIp = az network public-ip show \
  --resource-group $ResourceGroup \
  --name orchestra-ip \
  --query ipAddress \
  -o tsv

# Final message
Write-Host "\n===========================================" -ForegroundColor Green
Write-Host "Orchestra Platform deployed successfully to Azure!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host "\nAccess your Orchestra platform at: http://$publicIp" -ForegroundColor Cyan
Write-Host "\nNote: It may take a few minutes for the Application Gateway to be fully provisioned." -ForegroundColor Yellow
Write-Host "\nTo monitor your deployment, use the following commands:" -ForegroundColor Yellow
Write-Host "  kubectl get pods" -ForegroundColor Yellow
Write-Host "  kubectl get services" -ForegroundColor Yellow
Write-Host "  kubectl get ingress" -ForegroundColor Yellow
Write-Host "\nTo clean up all resources when you're done:" -ForegroundColor Yellow
Write-Host "  az group delete --name $ResourceGroup --yes --no-wait" -ForegroundColor Yellow