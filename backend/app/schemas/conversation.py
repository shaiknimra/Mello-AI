"""Pydantic schemas for Conversations and Message management."""

from pydantic import BaseModel, Field
from typing import Optional, List


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    agent_id: str
    agent_name: str
    status: str
    is_saved: bool
    created_at: str

    @classmethod
    def from_orm_model(cls, msg):
        return cls(
            id=msg.id,
            conversation_id=msg.conversation_id,
            role=msg.role,
            content=msg.content,
            agent_id=msg.agent_id or "coordinator",
            agent_name=msg.agent_name or "Coordinator Agent",
            status=msg.status or "completed",
            is_saved=bool(msg.is_saved),
            created_at=msg.created_at.isoformat() if msg.created_at else "",
        )


class ConversationCreateRequest(BaseModel):
    title: Optional[str] = Field(default="New Chat", max_length=255)


class ConversationUpdateRequest(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    is_pinned: Optional[bool] = None


class ConversationSummaryResponse(BaseModel):
    id: str
    title: str
    is_pinned: bool
    message_count: int
    created_at: str
    updated_at: str


class ConversationDetailResponse(BaseModel):
    id: str
    title: str
    is_pinned: bool
    created_at: str
    updated_at: str
    messages: List[MessageResponse] = []
