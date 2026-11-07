"""Abstract Base Class for LLM Adapters.

Enables swappable LLM providers (e.g. Gemini, Mock for testing, or future providers)
without modifying any agent or controller code.
"""

from abc import ABC, abstractmethod
from typing import Optional


class BaseLLMAdapter(ABC):
    """Abstract interface that all LLM provider adapters must implement."""

    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        personality: str = "Friendly",
        response_length: str = "medium",
        explanation_level: str = "intermediate",
        is_first_message: bool = False,
    ) -> str:
        """Generates a text completion given the user's prompt and formatting requirements.

        Args:
            prompt: The user query or conversation turn.
            system_instruction: Core instructions defining agent role and constraints.
            personality: "Friendly", "Professional", or "Academic".
            response_length: "short", "medium", or "detailed".
            explanation_level: "beginner", "intermediate", or "advanced".

        Returns:
            The generated Markdown text response.
        """
        pass
