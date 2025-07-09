# Deploying Orchestra to Azure

## Prerequisites

- Azure CLI installed and logged in
- Azure Kubernetes Service (AKS) extension installed
- Docker installed for building container images
- kubectl configured to connect to your AKS cluster

## Step 1: Create Azure Resource Group

```powershell
# Create a resource group
az group create --name orchestra-rg --location eastus
```

## Step 2: Create Azure Container Registry (ACR)

```powershell
# Create a container registry
az acr create --resource-group orchestra-rg --name orchestraregistry --sku Basic

# Log in to the registry
az acr login --name orchestraregistry
```

## Step 3: Build and Push Docker Images to ACR

```powershell
# Build and tag images
docker build -t orchestraregistry.azurecr.io/orchestra/api-gateway:latest -f docker/Dockerfile.microservice api_gateway/
docker build -t orchestraregistry.azurecr.io/orchestra/workflow-engine:latest -f docker/Dockerfile.microservice workflow_engine/
docker build -t orchestraregistry.azurecr.io/orchestra/agent-runtime:latest -f docker/Dockerfile.microservice agent_runtime/
docker build -t orchestraregistry.azurecr.io/orchestra/integration-service:latest -f docker/Dockerfile.microservice integration_service/
docker build -t orchestraregistry.azurecr.io/orchestra/maestro-service:latest -f docker/Dockerfile.microservice maestro_service/

# Push images to ACR
docker push orchestraregistry.azurecr.io/orchestra/api-gateway:latest
docker push orchestraregistry.azurecr.io/orchestra/workflow-engine:latest
docker push orchestraregistry.azurecr.io/orchestra/agent-runtime:latest
docker push orchestraregistry.azurecr.io/orchestra/integration-service:latest
docker push orchestraregistry.azurecr.io/orchestra/maestro-service:latest
```

## Step 4: Create Azure Kubernetes Service (AKS) Cluster

```powershell
# Create AKS cluster
az aks create \
  --resource-group orchestra-rg \
  --name orchestra-aks \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --attach-acr orchestraregistry

# Get credentials for kubectl
az aks get-credentials --resource-group orchestra-rg --name orchestra-aks
```

## Step 5: Create Azure Database for PostgreSQL

```powershell
# Create PostgreSQL server
az postgres server create \
  --resource-group orchestra-rg \
  --name orchestra-postgres \
  --location eastus \
  --admin-user postgresadmin \
  --admin-password "YourStrongPasswordHere" \
  --sku-name GP_Gen5_2

# Create database
az postgres db create \
  --resource-group orchestra-rg \
  --server-name orchestra-postgres \
  --name orchestra

# Configure firewall rule to allow Azure services
az postgres server firewall-rule create \
  --resource-group orchestra-rg \
  --server-name orchestra-postgres \
  --name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## Step 6: Create Azure Cache for Redis

```powershell
# Create Redis cache
az redis create \
  --resource-group orchestra-rg \
  --name orchestra-redis \
  --sku Basic \
  --vm-size C0 \
  --location eastus

# Get Redis connection string
$redisKey = az redis list-keys --resource-group orchestra-rg --name orchestra-redis --query primaryKey -o tsv
$redisHost = "orchestra-redis.redis.cache.windows.net"
$redisUrl = "redis://:$redisKey@$redisHost:6380?ssl=true"
```

## Step 7: Update Kubernetes Secrets

Create a new file called `azure-secrets.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: orchestra-secrets
type: Opaque
data:
  # Replace these with your actual base64-encoded values
  api-key: <base64-encoded-api-key>
  postgres-dsn: <base64-encoded-postgres-dsn>
  redis-url: <base64-encoded-redis-url>
  qdrant-url: <base64-encoded-qdrant-url>
  openai-api-key: <base64-encoded-openai-api-key>
```

Encode your values using PowerShell:

```powershell
# Example for PostgreSQL DSN
$postgresDsn = "dbname=orchestra user=postgresadmin password=YourStrongPasswordHere host=orchestra-postgres.postgres.database.azure.com"
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($postgresDsn))

# Example for Redis URL
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($redisUrl))
```

Apply the secrets:

```powershell
kubectl apply -f azure-secrets.yaml
```

## Step 8: Update Kubernetes Manifests for Azure

Update the image references in your Kubernetes manifests to point to your ACR:

```powershell
# Create a directory for Azure-specific manifests
mkdir -p k8s-azure

# Copy and modify the existing manifests
Get-ChildItem -Path k8s -Filter *.yaml | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "image: orchestra/", "image: orchestraregistry.azurecr.io/orchestra/"
    $content | Set-Content -Path "k8s-azure/$($_.Name)" -NoNewline
}
```

## Step 9: Deploy to AKS

```powershell
# Apply database manifests first
kubectl apply -f k8s-azure/databases.yaml

# Wait for databases to be ready
Start-Sleep -Seconds 60

# Apply the rest of the manifests
kubectl apply -f k8s-azure/secrets.yaml
kubectl apply -f k8s-azure/workflow-engine.yaml
kubectl apply -f k8s-azure/agent-runtime.yaml
kubectl apply -f k8s-azure/integration-service.yaml
kubectl apply -f k8s-azure/maestro-service.yaml
kubectl apply -f k8s-azure/api-gateway.yaml
```

## Step 10: Set Up Azure Application Gateway for Ingress

```powershell
# Create public IP
az network public-ip create \
  --resource-group orchestra-rg \
  --name orchestra-ip \
  --allocation-method Static \
  --sku Standard

# Install Application Gateway Ingress Controller
helm repo add application-gateway-kubernetes-ingress https://appgwingress.blob.core.windows.net/ingress-azure-helm-package/
helm repo update

helm install ingress-azure \
  application-gateway-kubernetes-ingress/ingress-azure \
  --namespace default \
  --set appgw.subscriptionId=$(az account show --query id -o tsv) \
  --set appgw.resourceGroup=orchestra-rg \
  --set appgw.name=orchestra-appgw \
  --set appgw.shared=false \
  --set armAuth.type=aadPodIdentity \
  --set armAuth.identityResourceID=$(az identity show -g orchestra-rg -n orchestra-identity --query id -o tsv) \
  --set armAuth.identityClientID=$(az identity show -g orchestra-rg -n orchestra-identity --query clientId -o tsv) \
  --set rbac.enabled=true
```

## Step 11: Update Ingress for Azure

Create a new ingress manifest for Azure (`k8s-azure/ingress-azure.yaml`):

```yaml
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
```

Apply the ingress:

```powershell
kubectl apply -f k8s-azure/ingress-azure.yaml
```

## Step 12: Initialize the Database

```powershell
# Get the name of a workflow-engine pod
$pod = kubectl get pods -l app=workflow-engine -o jsonpath="{.items[0].metadata.name}"

# Initialize the database
kubectl exec -it $pod -- python -c "from shared.db.init_db import init_db; init_db()"
```

## Step 13: Set Up Azure Monitor for Observability

```powershell
# Enable Azure Monitor for containers
az aks enable-addons \
  --resource-group orchestra-rg \
  --name orchestra-aks \
  --addons monitoring
```

## Step 14: Set Up Azure Key Vault for Secrets Management (Optional)

```powershell
# Create Key Vault
az keyvault create \
  --resource-group orchestra-rg \
  --name orchestra-keyvault \
  --sku standard

# Store secrets in Key Vault
az keyvault secret set \
  --vault-name orchestra-keyvault \
  --name api-key \
  --value "your-api-key"

az keyvault secret set \
  --vault-name orchestra-keyvault \
  --name openai-api-key \
  --value "your-openai-api-key"

# Install CSI driver for Key Vault
helm repo add csi-secrets-store-provider-azure https://raw.githubusercontent.com/Azure/secrets-store-csi-driver-provider-azure/master/charts
helm install csi-secrets-store-provider-azure/csi-secrets-store-provider-azure --generate-name
```

## Troubleshooting

### Check Pod Status

```powershell
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Check Service Status

```powershell
kubectl get services
kubectl describe service <service-name>
```

### Check Ingress Status

```powershell
kubectl get ingress
kubectl describe ingress orchestra-ingress
```

### Check Application Gateway

```powershell
az network application-gateway show -g orchestra-rg -n orchestra-appgw
```

## Cleaning Up

To delete all resources when you're done:

```powershell
az group delete --name orchestra-rg --yes --no-wait
```

## Additional Resources

- [Azure Kubernetes Service Documentation](https://docs.microsoft.com/en-us/azure/aks/)
- [Azure Container Registry Documentation](https://docs.microsoft.com/en-us/azure/container-registry/)
- [Azure Database for PostgreSQL Documentation](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Azure Cache for Redis Documentation](https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/)
- [Azure Application Gateway Documentation](https://docs.microsoft.com/en-us/azure/application-gateway/)
- [Azure Key Vault Documentation](https://docs.microsoft.com/en-us/azure/key-vault/)