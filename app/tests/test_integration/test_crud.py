import json
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


def test_duplicate_email_returns_400(client: TestClient):
    # Use an email domain that passes pydantic's EmailStr validation
    payload = {"name": "Dup", "email": "dup@example.com", "password": "pw"}
    resp1 = client.post("/api/v1/users/", json=payload)
    assert resp1.status_code == 200

    resp2 = client.post("/api/v1/users/", json=payload)
    assert resp2.status_code == 400
    assert resp2.json().get("detail") == "Email already registered"


def test_get_returns_cached_value_integration(client: TestClient, mock_redis):
    # Prepare a fake cached payload and inject into the fake redis store directly
    cached_payload = [{"id": 999, "email": "cached@example.com", "name": "Cached", "is_active": True}]
    cache_key = "users:0:100"

    # Our SimpleFakeRedis stores values in a dict on the instance
    mock_redis._store[cache_key] = json.dumps(cached_payload)

    resp = client.get("/api/v1/users/")
    assert resp.status_code == 200
    assert resp.json() == cached_payload


def test_pagination(client: TestClient, mock_redis):
    # Create several users
    for i in range(3):
        client.post("/api/v1/users/", json={
            "email": f"page{i}@example.com",
            "name": f"Page{i}",
            "password": "pw"
        })

    # Clear any existing cache so we actually hit the DB for this test
    mock_redis._store.pop("users:0:100", None)

    resp = client.get("/api/v1/users/?skip=1&limit=1")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_create_user_validation_errors(client: TestClient):
    # Missing email
    resp = client.post("/api/v1/users/", json={"name": "NoEmail", "password": "pw"})
    assert resp.status_code == 422

    # Invalid email
    resp2 = client.post("/api/v1/users/", json={"name": "BadEmail", "email": "not-an-email", "password": "pw"})
    assert resp2.status_code == 422
