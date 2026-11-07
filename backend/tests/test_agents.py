"""Tests for LangGraph Agent Orchestration and Specialist Routing."""


def test_list_specialist_agents(client):
    """Ensure GET /api/v1/agents returns all 6 core specialist agents."""
    response = client.get("/api/v1/agents")
    assert response.status_code == 200
    agents = response.json()
    assert len(agents) == 6
    agent_ids = [a["id"] for a in agents]
    assert "coordinator" in agent_ids
    assert "research" in agent_ids
    assert "learning" in agent_ids
    assert "coding" in agent_ids
    assert "planning" in agent_ids
    assert "writing" in agent_ids


def test_manual_agent_selection_coding(client):
    """Ensure explicitly selecting 'coding' agent directs task to Coding Agent."""
    payload = {
        "message": "Write a binary search algorithm",
        "agent_id": "coding",
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["agent_id"] == "coding"
    assert data["agent_name"] == "Coding Agent"
    assert data["status"] == "completed"


def test_manual_agent_selection_learning(client):
    """Ensure explicitly selecting 'learning' agent directs task to Learning Agent."""
    payload = {
        "message": "Teach me how recursion works with an analogy",
        "agent_id": "learning",
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["agent_id"] == "learning"
    assert data["agent_name"] == "Learning Agent"


def test_coordinator_auto_routing_to_coding(client):
    """Ensure Coordinator automatically branches to coding agent when prompt is code-heavy."""
    payload = {
        "message": "Write a python function to reverse a linked list with O(N) complexity",
        "agent_id": "coordinator",
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Verified automatic branch to coding agent
    assert data["agent_id"] == "coding"


def test_coordinator_direct_answer_for_simple_question(client):
    """Ensure Coordinator answers straightforward questions directly without unnecessary sub-agent loops."""
    payload = {
        "message": "Hello! What is your name and how are you today?",
        "agent_id": "coordinator",
    }
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["agent_id"] == "coordinator"
