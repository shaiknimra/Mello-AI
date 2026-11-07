"""Conversation management endpoints: List, Create, Retrieve, Update, and Delete."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List

from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.conversation import Conversation
from backend.app.models.message import Message
from backend.app.core.security import get_current_user
from backend.app.schemas.conversation import (
    ConversationSummaryResponse,
    ConversationDetailResponse,
    ConversationCreateRequest,
    ConversationUpdateRequest,
    MessageResponse,
)

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get("", response_model=List[ConversationSummaryResponse])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all conversations owned by the authenticated user, pinned first then by update time."""
    stmt = (
        select(Conversation)
        .where(Conversation.user_id == current_user.id, Conversation.is_archived == False)
        .order_by(desc(Conversation.is_pinned), desc(Conversation.updated_at))
    )
    result = await db.execute(stmt)
    convs = result.scalars().all()

    return [
        ConversationSummaryResponse(
            id=c.id,
            title=c.title,
            is_pinned=c.is_pinned,
            message_count=len(c.messages) if c.messages else 0,
            created_at=c.created_at.isoformat() if c.created_at else "",
            updated_at=c.updated_at.isoformat() if c.updated_at else "",
        )
        for c in convs
    ]


@router.post("", response_model=ConversationDetailResponse)
async def create_conversation(
    payload: ConversationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new empty conversation for the authenticated user."""
    conv = Conversation(
        user_id=current_user.id,
        title=payload.title or "New Chat",
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)

    return ConversationDetailResponse(
        id=conv.id,
        title=conv.title,
        is_pinned=conv.is_pinned,
        created_at=conv.created_at.isoformat() if conv.created_at else "",
        updated_at=conv.updated_at.isoformat() if conv.updated_at else "",
        messages=[],
    )


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full conversation turn history. Enforces strict user ownership."""
    stmt = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()

    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied.",
        )

    return ConversationDetailResponse(
        id=conv.id,
        title=conv.title,
        is_pinned=conv.is_pinned,
        created_at=conv.created_at.isoformat() if conv.created_at else "",
        updated_at=conv.updated_at.isoformat() if conv.updated_at else "",
        messages=[MessageResponse.from_orm_model(m) for m in conv.messages],
    )


@router.patch("/{conversation_id}", response_model=ConversationDetailResponse)
async def update_conversation(
    conversation_id: str,
    payload: ConversationUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Rename or pin/unpin a conversation."""
    stmt = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()

    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    if payload.title is not None:
        conv.title = payload.title.strip() or "Untitled Chat"
    if payload.is_pinned is not None:
        conv.is_pinned = payload.is_pinned

    await db.commit()
    await db.refresh(conv)

    return ConversationDetailResponse(
        id=conv.id,
        title=conv.title,
        is_pinned=conv.is_pinned,
        created_at=conv.created_at.isoformat() if conv.created_at else "",
        updated_at=conv.updated_at.isoformat() if conv.updated_at else "",
        messages=[MessageResponse.from_orm_model(m) for m in conv.messages],
    )


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a conversation and all its messages. Enforces strict user ownership."""
    stmt = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()

    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    await db.delete(conv)
    await db.commit()
    return None


@router.post("/{conversation_id}/messages/{message_id}/save")
async def toggle_save_message(
    conversation_id: str,
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bookmark / save an important response."""
    stmt = (
        select(Message)
        .join(Conversation)
        .where(
            Message.id == message_id,
            Message.conversation_id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    result = await db.execute(stmt)
    msg = result.scalar_one_or_none()

    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")

    msg.is_saved = not msg.is_saved
    await db.commit()
    await db.refresh(msg)
    return {"message_id": msg.id, "is_saved": msg.is_saved}
