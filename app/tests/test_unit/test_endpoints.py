from fastapi.testclient import TestClient  # <--- FIX 1: Add Import

def test_create_user(client: TestClient):
    # FIX 2: Update URL to /api/v1/users/
    # FIX 3: Add 'password' to payload
    response = client.post("/api/v1/users/", json={
        "name": "Test", 
        "email": "test@example.com",
        "password": "s3curePassword" 
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test"
    assert "id" in data
    # Security check: ensure password is not returned
    assert "password" not in data