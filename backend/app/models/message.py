"""SQLAlchemy Message Model."""

from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    agent_id = Column(String(50), default="coordinator", nullable=False)
    agent_name = Column(String(100), default="Coordinator Agent", nullable=False)
    status = Column(String(20), default="completed", nullable=False)
    is_saved = Column(Boolean, default=False, nullable=False)  # Bookmark/save response feature

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
