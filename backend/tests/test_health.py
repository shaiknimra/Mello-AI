"""Tests for system health endpoints."""


def test_health_check(client):
    """Ensure GET /api/v1/health returns HTTP 200 with healthy status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "Mello AI"
    assert "version" in data
    assert "timestamp" in data


def test_root_endpoint(client):
    """Ensure root path returns welcome greeting."""
    response = client.get("/")
    assert response.status_code == 200
    assert "Think. Ask. Discover." in response.json()["message"]
