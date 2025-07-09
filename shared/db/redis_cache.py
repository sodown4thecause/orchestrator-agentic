import redis
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.Redis.from_url(REDIS_URL)

def get_agent_state(run_id, agent_id):
    key = f"run:{run_id}:agent:{agent_id}"
    state = redis_client.get(key)
    return state if state else None

def set_agent_state(run_id, agent_id, state):
    key = f"run:{run_id}:agent:{agent_id}"
    redis_client.set(key, state)
