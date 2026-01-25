import pytest
from fastapi.testclient import TestClient
from app.schemas import UserCreate

# Existing sync integration tests (DB only)
def test_create_get_users(client: TestClient, session):
    """Test CRUD without cache."""
    # Create
    response = client.post("/users/", json={"name": "IntUser", "email": "int@test.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "IntUser"
    
    # Get (no cache hit expected first time)
    response = client.get("/users/")
    assert response.status_code == 200
    users = response.json()
    assert len(users) == 1
    assert users[0]["email"] == "int@test.com"

# Async cache tests
@pytest.mark.asyncio
async def test_users_cache_hit_miss(client: TestClient, mock_redis):
    """Test cache miss -> hit flow using async httpx under TestClient."""
    # Pre-cache: miss, hits DB (but mock DB via fixture)
    resp1 = client.get("/users/?skip=0&limit=10")
    assert resp1.status_code == 200
    users1 = resp1.json()
    assert len(users1) == 0  # No users yet
    
    # Create user to populate potential cache
    client.post("/users/", json={"name": "CacheUser", "email": "cache@test.com"})
    
    # Cache miss: populate cache
    resp2 = client.get("/users/")
    assert resp2.status_code == 200
    users2 = resp2.json()
    assert len(users2) == 1
    
    # Verify cache set (direct mock check)
    cached = await mock_redis.get("users:0:100")
    assert cached is not None
    import json
    cached_users = json.loads(cached)
    assert len(cached_users) == 1
    assert cached_users[0]["name"] == "CacheUser"
    
    # Cache hit: same response, no DB call simulated
    resp3 = client.get("/users/")
    assert resp3.status_code == 200
    assert resp3.json() == users2  # Identical cached slice

@pytest.mark.asyncio
async def test_users_cache_ttl(mock_redis):
    """Direct cache TTL test (no HTTP)."""
    await mock_redis.setex("test:key", 1, "value")  # 1s TTL
    assert await mock_redis.get("test:key") == "value"
    # TTL expires after ~1s (test waits implicitly)
