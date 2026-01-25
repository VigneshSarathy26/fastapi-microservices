import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_e2e_flow():
    # Wrap the app in ASGITransport. 
    # This is the modern way to test async endpoints without "FakeReader" errors.
    transport = ASGITransport(app=app)
    
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create
        resp_create = await ac.post("/api/v1/users/", json={
            "name": "E2E", 
            "email": "e2e@test.com",
            "password": "e2ePassword"
        })
        assert resp_create.status_code == 200
        
        # Get
        resp_get = await ac.get("/api/v1/users/")
        assert resp_get.status_code == 200
        assert len(resp_get.json()) >= 1