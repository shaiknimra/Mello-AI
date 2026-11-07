"""Pydantic schemas for chat requests and responses.

Defines the contract between the frontend React application and FastAPI backend.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, timezone


ResponseLength = Literal["short", "medium", "detailed"]
ExplanationLevel = Literal["beginner", "intermediate", "advanced"]
Personality = Literal["Friendly", "Professional", "Academic"]


class ChatMessageRequest(BaseModel):
    """Payload sent by the client when asking a question to Mello."""
    message: str = Field(..., min_length=1, max_length=10000, description="The user's question or message")
    conversation_id: Optional[str] = Field(default=None, description="Existing conversation ID if continuing a chat")
    agent_id: Optional[str] = Field(default="coordinator", description="Identifier of the targeted agent")
    response_length: ResponseLength = Field(default="medium", description="Desired response depth")
    explanation_level: ExplanationLevel = Field(default="intermediate", description="Target audience comprehension level")
    personality: Personality = Field(default="Friendly", description="Persona tone to use")


class ChatMessageResponse(BaseModel):
    """Payload returned by Mello containing the response and metadata."""
    conversation_id: str
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = "assistant"
    content: str
    agent_id: str = "coordinator"
    agent_name: str = "Coordinator Agent"
    status: Literal["completed", "error"] = "completed"
    error: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
