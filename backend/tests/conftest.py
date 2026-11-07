"""Pytest configuration and shared fixtures for Mello AI backend tests."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.llm.mock import MockLLMAdapter
from backend.app.services.llm import get_llm_adapter


@pytest.fixture
def client():
    """Provides a synchronous test client with the mock LLM adapter pre-configured."""
    app.dependency_overrides[get_llm_adapter] = lambda: MockLLMAdapter()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.pop(get_llm_adapter, None)
