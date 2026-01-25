import redis.asyncio as redis
import os
from contextlib import asynccontextmanager

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

redis_client = redis.from_url(REDIS_URL, decode_responses=True)

@asynccontextmanager
async def get_redis():
    try:
        yield redis_client
    finally:
        pass  # Connection pooled
