import redis.asyncio as redis
import os
from contextlib import asynccontextmanager

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Create a single client instance to be reused
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

async def get_redis():
    # Simple dependency injection pattern
    return redis_client