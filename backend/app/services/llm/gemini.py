"""Google Gemini LLM Adapter.

Implements BaseLLMAdapter using the official google-genai SDK.
Handles quota limits (HTTP 429) and outages gracefully with user-friendly notices.
"""

from typing import Optional
import logging
from backend.app.services.llm.base import BaseLLMAdapter
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# System prompt defining Mello's core persona and behavior rules
MELLO_SYSTEM_BASE = """You are Mello, the intelligent, friendly, and professional AI assistant for Mello AI.
Tagline: Think. Ask. Discover.

Core behavioral rules:
1. Always be honest, clear, and helpful. If uncertain, admit it. Never fabricate facts or citations.
2. Format all responses using clean, structured Markdown (use headings, lists, tables, and code blocks where appropriate).
3. Do not show internal chain-of-thought deliberation; present high-level plans and concise outcomes.
4. When writing code, provide clean, idiomatic code, syntax highlighting tags, and clear explanations.
"""


class GeminiLLMAdapter(BaseLLMAdapter):
    """Adapter for Google Gemini models using the google-genai library."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL
        self._client = None

        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Gemini Client: {e}")
                self._client = None

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        personality: str = "Friendly",
        response_length: str = "medium",
        explanation_level: str = "intermediate",
    ) -> str:
        """Call Gemini to generate a response tailored to persona, length, and depth."""
        if not self._client:
            return (
                "⚠️ **Mello Configuration Notice**\n\n"
                "No valid `GEMINI_API_KEY` was found in `backend/.env`.\n\n"
                "To enable live Gemini responses:\n"
                "1. Get a free API key at [Google AI Studio](https://aistudio.google.com/)\n"
                "2. Set `GEMINI_API_KEY=your_key` in `backend/.env`\n"
                "3. Or switch to `LLM_PROVIDER=mock` for local offline testing."
            )

        # Assemble personality and formatting instructions
        full_system_instruction = (
            f"{MELLO_SYSTEM_BASE}\n"
            f"- Persona Tone: {personality}\n"
            f"- Target Audience Level: {explanation_level}\n"
            f"- Response Depth: {response_length}\n"
        )
        if system_instruction:
            full_system_instruction += f"\nSpecialist Directive:\n{system_instruction}\n"

        # List candidate models in order of priority (configured model first)
        candidate_models = [self.model, "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.1-flash-lite"]
        seen = set()
        models_to_try = [m for m in candidate_models if not (m in seen or seen.add(m))]

        last_error = None
        for model_name in models_to_try:
            try:
                from google.genai import types

                response = await self._client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=full_system_instruction,
                        temperature=0.7,
                    ),
                )
                if response.text:
                    return response.text
            except Exception as err:
                last_error = err
                err_str = str(err)
                logger.warning(f"Gemini model '{model_name}' failed: {err_str}. Trying next candidate if available.")
                if "429" in err_str or "quota" in err_str.lower() or "resource_exhausted" in err_str.lower():
                    # Quota limits affect the entire account, so don't hammer other models
                    return (
                        "⏳ **Mello is experiencing high demand**\n\n"
                        "The free-tier rate limit was reached. Please wait a moment and try asking again shortly."
                    )
                if "403" in err_str or "api key" in err_str.lower() or "permission_denied" in err_str.lower():
                    return (
                        "🔒 **Authentication Issue**\n\n"
                        "The configured Gemini API key appears invalid or expired. Please check your `backend/.env` settings."
                    )
                continue

        # If all candidates failed
        err_str = str(last_error) if last_error else "Unknown error"
        logger.error(f"All Gemini models failed. Last error: {err_str}")
        return (
            "⚠️ **Service Temporarily Unavailable**\n\n"
            "Mello encountered a temporary hiccup communicating with the model provider. "
            "Please try again in a few moments."
        )
