#!/usr/bin/env python3
"""
Agentic Workflow Builder Setup Script
This script sets up the complete environment for the Agentic Workflow Builder
"""

import os
import subprocess
import sys
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Error running command: {e}")
        return False

def setup_environment():
    """Set up the complete environment"""
    print("🚀 Setting up Agentic Workflow Builder...")
    
    # Create .env file if it doesn't exist
    env_file = Path(".env")
    if not env_file.exists():
        print("Creating .env file...")
        with open(".env", "w") as f:
            f.write("""# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Database Configuration
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/agentic_workflow_builder
MONGODB_URI=mongodb://localhost:27017/agentic-workflow-builder
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OAuth Configuration
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NOTION_CLIENT_ID=your-notion-client-id
NOTION_CLIENT_SECRET=your-notion-client-secret
""")
    
    # Create missing directories
    directories = [
        "nginx",
        "nginx/ssl",
        "shared/db/migrations",
        "logs"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    print("✅ Environment setup complete!")
    return True

def check_docker():
    """Check if Docker is running"""
    print("Checking Docker...")
    if not run_command("docker --version"):
        print("❌ Docker is not installed or not in PATH")
        return False
    
    if not run_command("docker-compose --version"):
        print("❌ Docker Compose is not installed")
        return False
    
    print("✅ Docker is ready!")
    return True

def main():
    """Main setup function"""
    print("🔧 Agentic Workflow Builder Setup")
    print("=" * 50)
    
    # Check prerequisites
    if not check_docker():
        sys.exit(1)
    
    # Setup environment
    if not setup_environment():
        sys.exit(1)
    
    print("\n🎉 Setup complete!")
    print("\nNext steps:")
    print("1. Edit .env file with your API keys")
    print("2. Run: docker-compose up --build")
    print("3. Visit: http://localhost:3000")
    print("\nServices will be available at:")
    print("- Frontend: http://localhost:3000")
    print("- API Gateway: http://localhost:8080")
    print("- Backend: http://localhost:8000")
    print("- Workflow Engine: http://localhost:8001")
    print("- Integration Service: http://localhost:8002")
    print("- MCP Service: http://localhost:8003")
    print("- AI Service: http://localhost:8004")

if __name__ == "__main__":
    main()
