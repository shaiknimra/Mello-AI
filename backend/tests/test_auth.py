"""Tests for Authentication endpoints (Signup, Login, Token validation)."""


def test_signup_success(client):
    """Test user signup with valid email and password."""
    payload = {
        "email": "student@example.com",
        "password": "Password123!",
        "full_name": "Student Tester",
    }
    response = client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "student@example.com"
    assert data["user"]["full_name"] == "Student Tester"


def test_signup_duplicate_email(client):
    """Test signup with already-registered email returns 400."""
    payload = {
        "email": "student@example.com",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_success(client):
    """Test login with correct credentials."""
    payload = {
        "email": "student@example.com",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_invalid_password(client):
    """Test login with wrong password returns 401."""
    payload = {
        "email": "student@example.com",
        "password": "WrongPassword999",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


def test_get_me_unauthorized(client):
    """Test accessing protected /auth/me without token returns 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_get_me_authorized(client):
    """Test accessing protected /auth/me with valid Bearer token."""
    login_res = client.post("/api/v1/auth/login", json={
        "email": "student@example.com",
        "password": "Password123!",
    })
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "student@example.com"
