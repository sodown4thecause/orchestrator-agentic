#!/bin/bash

# DigitalOcean Deployment Script
set -e

# Check for required tools
command -v doctl >/dev/null 2>&1 || { echo >&2 "doctl required but not installed. Aborting."; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo >&2 "terraform required but not installed. Aborting."; exit 1; }

# Load environment
source .env.prod

# Create DigitalOcean resources
echo "Creating DigitalOcean resources..."
doctl apps create --spec .do/app.yaml

# Wait for deployment to complete
echo "Waiting for deployment to complete..."
sleep 30

# Get app URL
APP_URL=$(doctl apps get --format "DefaultIngress" | tail -1)
echo "Application deployed successfully: $APP_URL"

# Set up databases
echo "Configuring databases..."
doctl databases create flowintent-prod-db \
  --engine pg \
  --version 15 \
  --region sfo3 \
  --size db-s-2vcpu-4gb \
  --num-nodes 1

doctl databases create flowintent-prod-redis \
  --engine redis \
  --version 7 \
  --region sfo3 \
  --size db-s-2vcpu-4gb \
  --num-nodes 1

echo "Deployment complete!"
