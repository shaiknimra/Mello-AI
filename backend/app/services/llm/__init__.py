"""LLM Adapter factory and exports."""

from backend.app.core.config import settings
from backend.app.services.llm.base import BaseLLMAdapter
from backend.app.services.llm.gemini import GeminiLLMAdapter
from backend.app.services.llm.mock import MockLLMAdapter


def get_llm_adapter() -> BaseLLMAdapter:
    """Factory to retrieve the configured LLM adapter."""
    provider = settings.LLM_PROVIDER.lower().strip()
    if provider == "mock":
        return MockLLMAdapter()
    return GeminiLLMAdapter()


__all__ = ["BaseLLMAdapter", "GeminiLLMAdapter", "MockLLMAdapter", "get_llm_adapter"]
