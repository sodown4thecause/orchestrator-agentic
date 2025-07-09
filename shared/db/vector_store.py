from qdrant_client import QdrantClient
import os

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "orchestra_vectors")
qdrant = QdrantClient(url=QDRANT_URL)

def upsert_vector(id, vector, payload=None):
    qdrant.upsert(collection_name=QDRANT_COLLECTION, points=[{"id": id, "vector": vector, "payload": payload or {}}])

def search_vector(query_vector, top_k=5):
    hits = qdrant.search(collection_name=QDRANT_COLLECTION, query_vector=query_vector, limit=top_k)
    return hits
