def test_create_user(client: TestClient):
    response = client.post("/users/", json={"name": "Test", "email": "test@example.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test"
