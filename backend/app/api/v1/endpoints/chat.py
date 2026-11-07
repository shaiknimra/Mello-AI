"""Chat endpoint for Mello AI with per-user conversation persistence."""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime, timezone
import uuid
import logging

from backend.app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from backend.app.services.llm import BaseLLMAdapter, get_llm_adapter
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.conversation import Conversation
from backend.app.models.message import Message
from backend.app.core.security import get_current_user_optional
from backend.app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/chat", response_model=ChatMessageResponse, tags=["Chat"])
async def send_chat_message(
    payload: ChatMessageRequest,
    llm: BaseLLMAdapter = Depends(get_llm_adapter),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
) -> ChatMessageResponse:
    """Send a message to Mello and receive a generated assistant response."""
    # 1. Enforce daily usage limit for registered users
    if current_user:
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if current_user.last_active_date != today_str:
            current_user.daily_message_count = 0
            current_user.last_active_date = today_str

        if current_user.daily_message_count >= settings.DAILY_MESSAGE_LIMIT:
            return ChatMessageResponse(
                conversation_id=payload.conversation_id or str(uuid.uuid4()),
                role="assistant",
                content=(
                    f"⏳ **Daily message allowance reached**\n\n"
                    f"You have used your daily allowance of {settings.DAILY_MESSAGE_LIMIT} messages. "
                    "Your allowance will automatically reset at 00:00 UTC."
                ),
                agent_id="coordinator",
                agent_name="Coordinator Agent",
                status="completed",
            )

    # 2. Determine or create conversation
    active_conversation = None
    if current_user:
        if payload.conversation_id:
            stmt = select(Conversation).where(
                Conversation.id == payload.conversation_id,
                Conversation.user_id == current_user.id,
            )
            res = await db.execute(stmt)
            active_conversation = res.scalar_one_or_none()

        if not active_conversation:
            # Auto-generate a clean title from the first ~6 words
            title_words = payload.message.strip().split()
            auto_title = " ".join(title_words[:6])
            if len(title_words) > 6:
                auto_title += "..."

            active_conversation = Conversation(
                user_id=current_user.id,
                title=auto_title or "New Chat",
            )
            db.add(active_conversation)
            await db.commit()
            await db.refresh(active_conversation)

        # Store User Message in DB
        user_db_message = Message(
            conversation_id=active_conversation.id,
            role="user",
            content=payload.message,
            status="completed",
        )
        db.add(user_db_message)

    conversation_id = active_conversation.id if active_conversation else (payload.conversation_id or str(uuid.uuid4()))

    # 3. Generate response using the configured LLM adapter
    try:
        content = await llm.generate_response(
            prompt=payload.message,
            personality=payload.personality,
            response_length=payload.response_length,
            explanation_level=payload.explanation_level,
        )

        # Store Assistant Message in DB if authenticated
        if current_user and active_conversation:
            assistant_db_message = Message(
                conversation_id=active_conversation.id,
                role="assistant",
                content=content,
                agent_id=payload.agent_id or "coordinator",
                agent_name="Coordinator Agent" if (payload.agent_id or "coordinator") == "coordinator" else f"{payload.agent_id.capitalize()} Agent",
                status="completed",
            )
            db.add(assistant_db_message)

            # Increment daily usage and update timestamp
            current_user.daily_message_count += 1
            active_conversation.updated_at = datetime.now(timezone.utc)
            await db.commit()

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
