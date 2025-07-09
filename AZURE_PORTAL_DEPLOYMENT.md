# Deploying Orchestra to Azure Using the Portal

This guide provides step-by-step instructions for deploying the Orchestra platform to Azure using the Azure Portal UI.

## Prerequisites

- Azure account with an active subscription
- Docker installed for building container images

## Step 1: Create Resource Group

1. Log in to the [Azure Portal](https://portal.azure.com)
2. Click on **Resource groups** in the left navigation
3. Click **+ Create**
4. Enter the following details:
   - **Subscription**: Select your subscription
   - **Resource group**: `orchestra-rg`
   - **Region**: Select a region close to you (e.g., East US)
5. Click **Review + create**, then **Create**

## Step 2: Create Azure Container Registry (ACR)

1. In the Azure Portal, search for "Container registries"
2. Click **+ Create**
3. Enter the following details:
   - **Resource group**: `orchestra-rg`
   - **Registry name**: `orchestraregistry` (must be unique)
   - **Location**: Same as your resource group
   - **SKU**: Basic
4. Click **Review + create**, then **Create**
5. Once created, go to your registry
6. Under **Settings**, click on **Access keys**
7. Enable **Admin user**
8. Note down the **Login server**, **Username**, and **Password**

## Step 3: Build and Push Docker Images

On your local machine, build and push the Docker images:

```powershell
# Log in to ACR
docker login orchestraregistry.azurecr.io -u <username> -p <password>

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

## Step 4: Create Azure Kubernetes Service (AKS)

1. In the Azure Portal, search for "Kubernetes services"
2. Click **+ Create** → **Create a Kubernetes cluster**
3. In the **Basics** tab, enter:
   - **Resource group**: `orchestra-rg`
   - **Cluster name**: `orchestra-aks`
   - **Region**: Same as your resource group
   - **Kubernetes version**: Accept default
   - **Node size**: Standard DS2 v2
   - **Node count**: 3
4. In the **Node pools** tab, accept defaults
5. In the **Authentication** tab, accept defaults
6. In the **Networking** tab, accept defaults
7. In the **Integrations** tab:
   - Enable **Container registry**
   - Select your ACR (`orchestraregistry`)
8. In the **Monitoring** tab, enable **Azure Monitor**
9. Click **Review + create**, then **Create**

## Step 5: Create Azure Database for PostgreSQL

1. In the Azure Portal, search for "Azure Database for PostgreSQL servers"
2. Click **+ Create** → **Single server**
3. Enter the following details:
   - **Resource group**: `orchestra-rg`
   - **Server name**: `orchestra-postgres` (must be unique)
   - **Location**: Same as your resource group
   - **Version**: 11
   - **Admin username**: `postgresadmin`
   - **Password**: Create a strong password
   - **Confirm password**: Repeat your password
4. In the **Compute + storage** tab, select **Basic** tier
5. Click **Review + create**, then **Create**
6. Once created, go to your PostgreSQL server
7. Under **Settings**, click on **Connection security**
8. Set **Allow access to Azure services** to **Yes**
9. Click **Save**
10. Under **Settings**, click on **Databases**
11. Click **+ Add**
12. Enter `orchestra` as the database name and click **OK**

## Step 6: Create Azure Cache for Redis

1. In the Azure Portal, search for "Azure Cache for Redis"
2. Click **+ Create**
3. Enter the following details:
   - **Resource group**: `orchestra-rg`
   - **DNS name**: `orchestra-redis` (must be unique)
   - **Location**: Same as your resource group
   - **Cache type**: Basic C0 (250 MB)
4. Click **Review + create**, then **Create**
5. Once created, go to your Redis cache
6. Under **Settings**, click on **Access keys**
7. Note down the **Primary connection string**

## Step 7: Connect to AKS Cluster

1. In the Azure Portal, go to your AKS cluster
2. Under **Settings**, click on **Connect**
3. Follow the instructions to connect using Azure Cloud Shell or your local machine

## Step 8: Create Kubernetes Secrets

1. Create a file named `azure-secrets.yaml` with the following content:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: orchestra-secrets
type: Opaque
data:
  api-key: <base64-encoded-api-key>
  postgres-dsn: <base64-encoded-postgres-dsn>
  redis-url: <base64-encoded-redis-url>
  qdrant-url: <base64-encoded-qdrant-url>
  openai-api-key: <base64-encoded-openai-api-key>
```

2. Replace the placeholders with your base64-encoded values:

```powershell
# Example for PostgreSQL DSN
$postgresDsn = "dbname=orchestra user=postgresadmin password=YourStrongPasswordHere host=orchestra-postgres.postgres.database.azure.com"
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($postgresDsn))

# Example for Redis URL (from the connection string)
$redisUrl = "redis://:<password>@orchestra-redis.redis.cache.windows.net:6380?ssl=true"
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($redisUrl))
```

3. Apply the secrets:

```powershell
kubectl apply -f azure-secrets.yaml
```

## Step 9: Update Kubernetes Manifests

1. Create a directory for Azure-specific manifests:

```powershell
mkdir -p k8s-azure
```

2. Copy and modify the existing manifests:

```powershell
Get-ChildItem -Path k8s -Filter *.yaml | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "image: orchestra/", "image: orchestraregistry.azurecr.io/orchestra/"
    $content | Set-Content -Path "k8s-azure/$($_.Name)" -NoNewline
}
```

## Step 10: Deploy to AKS

1. Apply database manifests first:

```powershell
kubectl apply -f k8s-azure/databases.yaml
```

2. Wait for databases to be ready (about 1 minute)

3. Apply the rest of the manifests:

```powershell
kubectl apply -f azure-secrets.yaml
kubectl apply -f k8s-azure/workflow-engine.yaml
kubectl apply -f k8s-azure/agent-runtime.yaml
kubectl apply -f k8s-azure/integration-service.yaml
kubectl apply -f k8s-azure/maestro-service.yaml
kubectl apply -f k8s-azure/api-gateway.yaml
```

## Step 11: Set Up Application Gateway

1. In the Azure Portal, search for "Application gateways"
2. Click **+ Create**
3. Enter the following details:
   - **Resource group**: `orchestra-rg`
   - **Application gateway name**: `orchestra-appgw`
   - **Region**: Same as your resource group
   - **Tier**: Standard V2
4. In the **Frontends** section:
   - **Frontend IP address type**: Public
   - **Public IP address**: Create new
   - **Public IP address name**: `orchestra-ip`
5. In the **Backends** section:
   - Click **+ Add a backend pool**
   - **Name**: `api-gateway-pool`
   - **Add backend without targets**: Yes
6. In the **Configuration** section:
   - Click **+ Add a routing rule**
   - **Rule name**: `orchestra-rule`
   - **Priority**: 100
   - **Listener name**: `orchestra-listener`
   - **Frontend IP**: Public
   - **Protocol**: HTTP
   - **Port**: 80
   - **Backend pool**: `api-gateway-pool`
   - **HTTP setting**: Create new
   - **HTTP setting name**: `orchestra-http-setting`
   - **Backend protocol**: HTTP
   - **Backend port**: 80
7. Click **Review + create**, then **Create**

## Step 12: Configure Application Gateway Backend

1. Once the Application Gateway is created, go to it in the Azure Portal
2. Under **Settings**, click on **Backend pools**
3. Click on `api-gateway-pool`
4. Change **Target type** to **IP address or FQDN**
5. Add the internal IP address of your `api-gateway` Kubernetes service
   - You can get this by running `kubectl get service api-gateway`
6. Click **Save**

## Step 13: Initialize the Database

1. Get the name of a workflow-engine pod:

```powershell
$pod = kubectl get pods -l app=workflow-engine -o jsonpath="{.items[0].metadata.name}"
```

2. Initialize the database:

```powershell
kubectl exec -it $pod -- python -c "from shared.db.init_db import init_db; init_db()"
```

## Step 14: Access Your Orchestra Platform

1. In the Azure Portal, go to your Application Gateway
2. Note the **Frontend public IP address**
3. Access your Orchestra platform at `http://<frontend-public-ip>`

## Monitoring Your Deployment

1. In the Azure Portal, go to your AKS cluster
2. Under **Monitoring**, click on **Insights**
3. View the health and performance of your cluster and pods

## Scaling Your Deployment

1. In the Azure Portal, go to your AKS cluster
2. Under **Settings**, click on **Node pools**
3. Click on the node pool you want to scale
4. Adjust the **Node count** and click **Save**

## Cleaning Up

To delete all resources when you're done:

1. In the Azure Portal, go to the `orchestra-rg` resource group
2. Click **Delete resource group**
3. Enter the resource group name to confirm
4. Click **Delete**

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

### Check Application Gateway

1. In the Azure Portal, go to your Application Gateway
2. Under **Monitoring**, click on **Metrics**
3. Add metrics to monitor performance
4. Under **Settings**, click on **Health probes**
5. Verify that health probes are configured correctly