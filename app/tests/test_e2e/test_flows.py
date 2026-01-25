import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_e2e_flow(client: TestClient):
    async with AsyncClient(app=client.app, base_url="http://test") as ac:
        resp_create = await ac.post("/users/", json={"name": "E2E", "email": "e2e@test.com"})
        assert resp_create.status_code == 200
        resp_get = await ac.get("/users/")
        assert len(resp_get.json()) >= 1
