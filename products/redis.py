import os
import json
import redis

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)


def set_cache(key: str, value: dict, expire: int = 3600):
    """Set a cache value with TTL"""
    try:
        redis_client.setex(key, expire, json.dumps(value))
    except Exception as e:
        print(f"Cache set error: {e}")


def get_cache(key: str):
    """Get a cache value"""
    try:
        value = redis_client.get(key)
        return json.loads(value) if value else None
    except Exception as e:
        print(f"Cache get error: {e}")
        return None


def delete_cache(key: str):
    """Delete a cache value"""
    try:
        redis_client.delete(key)
    except Exception as e:
        print(f"Cache delete error: {e}")


def flush_cache():
    """Flush all cache"""
    try:
        redis_client.flushdb()
    except Exception as e:
        print(f"Cache flush error: {e}")
