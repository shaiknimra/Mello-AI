"""Tests for the chat interaction endpoint."""


def test_chat_message_success(client):
    """Ensure sending a valid message returns an assistant response with markdown."""
    payload = {
        "message": "Explain how Python functions work",
        "personality": "Friendly",
        "response_length": "medium",
        "explanation_level": "beginner",
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "assistant"
    assert data["status"] == "completed"
    assert "conversation_id" in data
    assert "message_id" in data
    assert "Hello! I am Mello" in data["content"]
    assert "```python" in data["content"]


def test_chat_empty_message_validation_failure(client):
    """Ensure empty messages are rejected with HTTP 422 Unprocessable Entity."""
    payload = {
        "message": "",
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 422
