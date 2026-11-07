"""Chat endpoint for Mello AI.

Handles conversational requests, passes them through the selected LLM adapter,
and returns structured responses with metadata.
"""

from fastapi import APIRouter, HTTPException, Depends
import uuid
import logging
from backend.app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from backend.app.services.llm import BaseLLMAdapter, get_llm_adapter

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/chat", response_model=ChatMessageResponse, tags=["Chat"])
async def send_chat_message(
    payload: ChatMessageRequest,
    llm: BaseLLMAdapter = Depends(get_llm_adapter),
) -> ChatMessageResponse:
    """Send a message to Mello and receive a generated assistant response."""
    conversation_id = payload.conversation_id or str(uuid.uuid4())

    try:
        content = await llm.generate_response(
            prompt=payload.message,
            personality=payload.personality,
            response_length=payload.response_length,
            explanation_level=payload.explanation_level,
        )

        return ChatMessageResponse(
            conversation_id=conversation_id,
            role="assistant",
            content=content,
            agent_id=payload.agent_id or "coordinator",
            agent_name="Coordinator Agent" if (payload.agent_id or "coordinator") == "coordinator" else f"{payload.agent_id.capitalize()} Agent",
            status="completed",
        )
    except Exception as exc:
        logger.exception("Error processing chat message: %s", exc)
        return ChatMessageResponse(
            conversation_id=conversation_id,
            role="assistant",
            content="Mello is temporarily unavailable. Please try again shortly.",
            agent_id=payload.agent_id or "coordinator",
            agent_name="Coordinator Agent",
            status="error",
            error=str(exc),
        )
