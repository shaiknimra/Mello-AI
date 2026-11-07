"""Tests for Conversations and user data isolation."""


def create_user_and_token(client, email: str, password: str = "TestPass123!") -> str:
    """Helper to create a user and return their access token."""
    res = client.post("/api/v1/auth/signup", json={"email": email, "password": password})
    return res.json()["access_token"]


def test_conversation_lifecycle_and_user_isolation(client):
    """Verify conversations can be created, retrieved, and that User A CANNOT access User B's conversation."""
    # 1. Register User A and User B
    token_a = create_user_and_token(client, "user_a@example.com")
    token_b = create_user_and_token(client, "user_b@example.com")

    # 2. User A creates a conversation
    create_res = client.post(
        "/api/v1/conversations",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"title": "User A Private Research"},
    )
    assert create_res.status_code == 200
    conv_a_id = create_res.json()["id"]

    # 3. User A can list and retrieve their own conversation
    list_res = client.get(
        "/api/v1/conversations",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert list_res.status_code == 200
    assert any(c["id"] == conv_a_id for c in list_res.json())

    get_res = client.get(
        f"/api/v1/conversations/{conv_a_id}",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "User A Private Research"

    # 4. Strict Isolation Check: User B attempts to access User A's conversation
    unauthorized_res = client.get(
        f"/api/v1/conversations/{conv_a_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    # Must be 404 (does not leak existence of User A's conversation to User B)
    assert unauthorized_res.status_code == 404

    # 5. User B attempts to delete User A's conversation
    unauth_delete = client.delete(
        f"/api/v1/conversations/{conv_a_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert unauth_delete.status_code == 404

    # 6. User A deletes their own conversation
    delete_res = client.delete(
        f"/api/v1/conversations/{conv_a_id}",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert delete_res.status_code == 204
