"""Mock LLM Adapter for offline development and automated testing.

Allows the entire Mello system to run and be verified without external API calls or real credentials.
"""

from typing import Optional
from backend.app.services.llm.base import BaseLLMAdapter


class MockLLMAdapter(BaseLLMAdapter):
    """Predictable, fast mock adapter returning markdown-formatted responses."""

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        personality: str = "Friendly",
        response_length: str = "medium",
        explanation_level: str = "intermediate",
    ) -> str:
        # Provide rich sample markdown with code and list formatting so UI rendering is proven
        return (
            f"### Hello! I am Mello ({personality} persona).\n\n"
            f"You asked: *\"{prompt}\"*\n\n"
            f"- **Explanation Level:** {explanation_level}\n"
            f"- **Target Length:** {response_length}\n\n"
            f"Here is an example code snippet illustrating how Mello structures answers:\n\n"
            f"```python\n"
            f"def greet_mello(user_name: str) -> str:\n"
            f"    return f\"Welcome to Mello AI, {{user_name}}! Think. Ask. Discover.\"\n"
            f"\n"
            f"print(greet_mello(\"Friend\"))\n"
            f"```\n\n"
            f"How can I assist you further today?"
        )
