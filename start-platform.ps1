# Natural Language Agentic Workflow Platform Startup Script
# PowerShell script for Windows

Write-Host "🚀 Starting Natural Language Agentic Workflow Platform..." -ForegroundColor Green
Write-Host "" 

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to check if a port is available
function Test-Port($port) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
    return -not $connection
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "docker")) {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "docker-compose")) {
    Write-Host "❌ Docker Compose is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Compose" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker and Docker Compose are available" -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "📝 .env file created from .env.example" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env file and add your OpenAI API key before continuing" -ForegroundColor Yellow
        Write-Host "Press any key to continue after editing .env file..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Host "❌ .env.example file not found" -ForegroundColor Red
        exit 1
    }
}

# Check if OpenAI API key is set
$envContent = Get-Content ".env" -Raw
if ($envContent -match "OPENAI_API_KEY=your_openai_api_key_here" -or $envContent -notmatch "OPENAI_API_KEY=sk-") {
    Write-Host "⚠️  OpenAI API key not configured in .env file" -ForegroundColor Yellow
    Write-Host "Please edit .env file and add your OpenAI API key" -ForegroundColor Yellow
    Write-Host "Get your API key from: https://platform.openai.com/api-keys" -ForegroundColor Cyan
    
    $response = Read-Host "Do you want to continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

Write-Host "✅ Environment configuration checked" -ForegroundColor Green

# Check port availability
Write-Host "🔍 Checking port availability..." -ForegroundColor Yellow

$ports = @(3000, 5432, 6379, 6333, 8000, 8001, 8002, 8003, 8004, 8009, 8010, 8011)
$busyPorts = @()

foreach ($port in $ports) {
    if (-not (Test-Port $port)) {
        $busyPorts += $port
    }
}

if ($busyPorts.Count -gt 0) {
    Write-Host "⚠️  The following ports are already in use: $($busyPorts -join ', ')" -ForegroundColor Yellow
    Write-Host "This may cause conflicts. Consider stopping other services using these ports." -ForegroundColor Yellow
    
    $response = Read-Host "Do you want to continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
} else {
    Write-Host "✅ All required ports are available" -ForegroundColor Green
}

# Ask user which services to start
Write-Host "" 
Write-Host "🎯 Choose startup option:" -ForegroundColor Cyan
Write-Host "1. Full Platform (All services including existing orchestrator)" -ForegroundColor White
Write-Host "2. Natural Language Services Only (New services)" -ForegroundColor White
Write-Host "3. Existing Orchestrator Services Only" -ForegroundColor White
Write-Host "4. Custom Selection" -ForegroundColor White
Write-Host "" 

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "🚀 Starting full platform..." -ForegroundColor Green
        $services = ""
    }
    "2" {
        Write-Host "🚀 Starting natural language services..." -ForegroundColor Green
        $services = "intent-parser workflow-engine-new general-agent frontend postgres redis"
    }
    "3" {
        Write-Host "🚀 Starting existing orchestrator services..." -ForegroundColor Green
        $services = "api-gateway workflow-engine agent-runtime integration-service maestro-service postgres redis qdrant"
    }
    "4" {
        Write-Host "Available services:" -ForegroundColor Cyan
        Write-Host "- frontend (Natural Language Interface)" -ForegroundColor White
        Write-Host "- intent-parser (Natural Language Processing)" -ForegroundColor White
        Write-Host "- workflow-engine-new (Dynamic Workflow Engine)" -ForegroundColor White
        Write-Host "- general-agent (Task Execution Agent)" -ForegroundColor White
        Write-Host "- api-gateway (Existing API Gateway)" -ForegroundColor White
        Write-Host "- workflow-engine (Existing Workflow Engine)" -ForegroundColor White
        Write-Host "- agent-runtime (Existing Agent Runtime)" -ForegroundColor White
        Write-Host "- integration-service (Existing Integration Service)" -ForegroundColor White
        Write-Host "- maestro-service (Existing Maestro Service)" -ForegroundColor White
        Write-Host "- postgres (Database)" -ForegroundColor White
        Write-Host "- redis (Cache)" -ForegroundColor White
        Write-Host "- qdrant (Vector Database)" -ForegroundColor White
        Write-Host "" 
        $services = Read-Host "Enter service names separated by spaces"
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

# Build and start services
Write-Host "" 
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow
Write-Host "" 

try {
    if ($services -eq "") {
        docker-compose up --build -d
    } else {
        docker-compose up --build -d $services.Split(' ')
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "" 
        Write-Host "✅ Platform started successfully!" -ForegroundColor Green
        Write-Host "" 
        
        # Show access URLs
        Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
        
        if ($choice -eq "1" -or $choice -eq "2" -or $services -match "frontend") {
            Write-Host "   Natural Language Interface: http://localhost:3000" -ForegroundColor White
        }
        
        if ($choice -eq "1" -or $choice -eq "3" -or $services -match "api-gateway") {
            Write-Host "   API Gateway: http://localhost:8000" -ForegroundColor White
        }
        
        if ($choice -eq "1" -or $choice -eq "2" -or $services -match "intent-parser") {
            Write-Host "   Intent Parser API: http://localhost:8010" -ForegroundColor White
        }
        
        if ($choice -eq "1" -or $choice -eq "2" -or $services -match "workflow-engine-new") {
            Write-Host "   New Workflow Engine API: http://localhost:8011" -ForegroundColor White
        }
        
        if ($choice -eq "1" -or $choice -eq "2" -or $services -match "general-agent") {
            Write-Host "   General Agent API: http://localhost:8009" -ForegroundColor White
        }
        
        Write-Host "" 
        Write-Host "📊 Useful Commands:" -ForegroundColor Cyan
        Write-Host "   View logs: docker-compose logs -f [service-name]" -ForegroundColor White
        Write-Host "   Stop platform: docker-compose down" -ForegroundColor White
        Write-Host "   Restart service: docker-compose restart [service-name]" -ForegroundColor White
        Write-Host "   Check status: docker-compose ps" -ForegroundColor White
        Write-Host "" 
        
        # Wait for services to be ready
        Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        # Check service health
        Write-Host "🏥 Checking service health..." -ForegroundColor Yellow
        
        $healthChecks = @()
        if ($choice -eq "1" -or $choice -eq "2" -or $services -match "intent-parser") {
            $healthChecks += @{Name="Intent Parser"; Url="http://localhost:8010/health"}
        }
        if ($choice -eq "1" -or $choice -eq "2" -or $services -match "workflow-engine-new") {
            $healthChecks += @{Name="Workflow Engine"; Url="http://localhost:8011/health"}
        }
        if ($choice -eq "1" -or $choice -eq "2" -or $services -match "general-agent") {
            $healthChecks += @{Name="General Agent"; Url="http://localhost:8009/health"}
        }
        
        foreach ($check in $healthChecks) {
            try {
                $response = Invoke-WebRequest -Uri $check.Url -TimeoutSec 5 -UseBasicParsing
                if ($response.StatusCode -eq 200) {
                    Write-Host "   ✅ $($check.Name) is healthy" -ForegroundColor Green
                } else {
                    Write-Host "   ⚠️  $($check.Name) returned status $($response.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "   ❌ $($check.Name) is not responding" -ForegroundColor Red
            }
        }
        
        Write-Host "" 
        Write-Host "🎉 Platform is ready to use!" -ForegroundColor Green
        
        if ($choice -eq "1" -or $choice -eq "2" -or $services -match "frontend") {
            Write-Host "" 
            Write-Host "💡 Try these example commands in the Natural Language Interface:" -ForegroundColor Cyan
            Write-Host "   'Count the items in my dataset'" -ForegroundColor White
            Write-Host "   'Process the sales data and create a summary'" -ForegroundColor White
            Write-Host "   'Send a notification when the task is complete'" -ForegroundColor White
        }
        
    } else {
        Write-Host "❌ Failed to start platform" -ForegroundColor Red
        Write-Host "Check the logs with: docker-compose logs" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error starting platform: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "" 
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")