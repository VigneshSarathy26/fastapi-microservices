import json
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_e2e_flow(mock_redis):
    """Create a user and verify it appears in the users list and that cache is set."""
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create
        resp_create = await ac.post("/api/v1/users/", json={
            "name": "E2E", 
            "email": "e2e@test.com",
            "password": "e2ePassword"
        })
        assert resp_create.status_code == 200
        created = resp_create.json()
        assert created["email"] == "e2e@test.com"
        assert "id" in created
        assert created.get("is_active", True) is True

        # First GET should return DB data and set cache
        resp_get = await ac.get("/api/v1/users/")
        assert resp_get.status_code == 200
        users = resp_get.json()
        assert any(u["email"] == created["email"] for u in users)

        # Ensure Redis cache key was set
        cache_key = "users:0:100"
        cached = await mock_redis.get(cache_key)
        assert cached is not None

@pytest.mark.asyncio
async def test_duplicate_email_returns_400():
    """Creating a user with an existing email should return 400."""
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {"name": "Dup", "email": "dup@test.com", "password": "pw"}
        resp1 = await ac.post("/api/v1/users/", json=payload)
        assert resp1.status_code == 200

        # Try to create again
        resp2 = await ac.post("/api/v1/users/", json=payload)
        assert resp2.status_code == 400
        body = resp2.json()
        assert body.get("detail") == "Email already registered"

@pytest.mark.asyncio
async def test_get_returns_cached_value(mock_redis):
    """If a cached value exists we should return it instead of DB results."""
    # Prepare a fake cached payload
    cached_payload = [{"id": 999, "email": "cached@test.com", "name": "Cached", "is_active": True}]
    cache_key = "users:0:100"
    # Store JSON string in Redis as the app expects
    await mock_redis.set(cache_key, json.dumps(cached_payload))

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/users/")
        assert resp.status_code == 200
        assert resp.json() == cached_payload
