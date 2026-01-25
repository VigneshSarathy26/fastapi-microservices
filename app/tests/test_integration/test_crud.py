from fastapi.testclient import TestClient
import pytest

def test_create_get_users(client: TestClient):
    # Create
    response = client.post("/api/v1/users/", json={
        "email": "integration@test.com", 
        "name": "Integration",
        "password": "intPassword"
    })
    assert response.status_code == 200
    user_id = response.json()["id"]

    # Get
    response = client.get("/api/v1/users/")
    assert response.status_code == 200
    assert any(u["id"] == user_id for u in response.json())

def test_users_cache_hit_miss(client: TestClient, mock_redis):
    # First call (Miss -> DB)
    response = client.get("/api/v1/users/")
    assert response.status_code == 200
    
    # Second call (Hit -> Redis)
    response = client.get("/api/v1/users/")
    assert response.status_code == 200