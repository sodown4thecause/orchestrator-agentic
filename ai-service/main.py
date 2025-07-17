from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import openai
import os
import asyncio
import json
from datetime import datetime
import uuid
from sqlalchemy import create_engine, Column, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import redis
from sentence_transformers import SentenceTransformer
import numpy as np

# Initialize FastAPI
app = FastAPI(title="AI Service", version="1.0.0")

# Security
security = HTTPBearer()

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/ai_service")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis setup
redis_client = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))

# OpenAI setup
openai.api_key = os.getenv("OPENAI_API_KEY")

# Embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Database models
class WorkflowTemplate(Base):
    __tablename__ = "workflow_templates"
    
    id = Column(String, primary_key=True)
    name = Column(String)
    description = Column(Text)
    template = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"
    
    id = Column(String, primary_key=True)
    name = Column(String)
    content = Column(Text)
    embedding = Column(JSON)
    metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class NaturalLanguageRequest(BaseModel):
    text: str
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)

class WorkflowGenerationRequest(BaseModel):
    description: str
    existing_workflows: Optional[List[str]] = Field(default_factory=list)
    preferences: Optional[Dict[str, Any]] = Field(default_factory=dict)

class SearchRequest(BaseModel):
    query: str
    knowledge_base: str
    top_k: int = 5
    filters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class DocumentIngestionRequest(BaseModel):
    content: str
    name: str
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In production, verify JWT token
    return credentials.credentials

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-service"}

@app.post("/v1/parse-intent")
async def parse_intent(
    request: NaturalLanguageRequest,
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
):
    """Parse natural language to extract workflow intent."""
    
    prompt = f"""
    Analyze this natural language request and extract the workflow intent:
    
    Request: "{request.text}"
    Context: {json.dumps(request.context, indent=2)}
    
    Return a JSON object with:
    1. "intent_type": The type of workflow (e.g., "automation", "notification", "data_processing")
    2. "trigger": What triggers this workflow
    3. "actions": List of actions to perform
    4. "conditions": Any conditions or filters
    5. "integrations": Required integrations
    6. "parameters": Specific parameters mentioned
    
    Example response format:
    {{
        "intent_type": "automation",
        "trigger": "new_email",
        "actions": ["send_slack_message", "create_task"],
        "conditions": ["subject_contains_urgent"],
        "integrations": ["gmail", "slack", "todoist"],
        "parameters": {"channel": "#alerts", "priority": "high"}
    }}
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are a workflow intent parser. Extract structured information from natural language requests."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        result = json.loads(response.choices[0].message.content)
        return {"intent": result, "parsed_at": datetime.utcnow().isoformat()}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intent parsing failed: {str(e)}")

@app.post("/v1/generate-workflow")
async def generate_workflow(
    request: WorkflowGenerationRequest,
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
):
    """Generate a complete workflow from natural language description."""
    
    # Get similar workflows for context
    similar_workflows = db.query(WorkflowTemplate).limit(5).all()
    similar_templates = [w.template for w in similar_workflows]
    
    prompt = f"""
    Generate a complete workflow based on this description:
    
    Description: "{request.description}"
    
    Similar existing workflows: {json.dumps(similar_templates, indent=2)}
    
    User preferences: {json.dumps(request.preferences, indent=2)}
    
    Return a complete workflow JSON with:
    1. "name": Workflow name
    2. "description": Detailed description
    3. "trigger": Trigger configuration
    4. "nodes": List of workflow nodes with types and configurations
    5. "edges": Connections between nodes
    6. "integrations": Required service integrations
    7. "error_handling": Error handling strategy
    
    Ensure the workflow is:
    - Production-ready
    - Includes proper error handling
    - Uses best practices for the described use case
    - Optimized for reliability and performance
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are a workflow architect. Create production-ready workflows based on natural language descriptions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        
        workflow = json.loads(response.choices[0].message.content)
        
        # Save template for future use
        template = WorkflowTemplate(
            id=str(uuid.uuid4()),
            name=workflow["name"],
            description=workflow["description"],
            template=workflow
        )
        db.add(template)
        db.commit()
        
        return {"workflow": workflow, "template_id": template.id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow generation failed: {str(e)}")

@app.post("/v1/suggest-optimization")
async def suggest_optimization(
    workflow: Dict[str, Any],
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
):
    """Suggest optimizations for an existing workflow."""
    
    prompt = f"""
    Analyze this workflow and suggest optimizations:
    
    Workflow: {json.dumps(workflow, indent=2)}
    
    Consider:
    1. Performance improvements
    2. Error handling enhancements
    3. Cost optimization
    4. Reliability improvements
    5. Integration best practices
    
    Return a JSON object with:
    1. "suggestions": List of specific optimizations
    2. "priority": High/Medium/Low for each suggestion
    3. "impact": Expected impact of each optimization
    4. "implementation": How to implement each suggestion
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are a workflow optimization expert. Provide actionable suggestions to improve workflow performance, reliability, and cost-effectiveness."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        suggestions = json.loads(response.choices[0].message.content)
        return {"suggestions": suggestions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization suggestions failed: {str(e)}")

@app.post("/v1/knowledge/search")
async def search_knowledge(
    request: SearchRequest,
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
):
    """Semantic search across knowledge base."""
    
    try:
        # Generate embedding for query
        query_embedding = embedding_model.encode(request.query).tolist()
        
        # Search in database
        results = db.query(KnowledgeBase).filter(
            KnowledgeBase.name == request.knowledge_base
        ).all()
        
        # Calculate similarities
        scored_results = []
        for doc in results:
            doc_embedding = np.array(doc.embedding)
            similarity = np.dot(query_embedding, doc_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding)
            )
            scored_results.append({
                "id": doc.id,
                "content": doc.content,
                "metadata": doc.metadata,
                "similarity": float(similarity)
            })
        
        # Sort by similarity and return top k
        scored_results.sort(key=lambda x: x["similarity"], reverse=True)
        return {"results": scored_results[:request.top_k]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
