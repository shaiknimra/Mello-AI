"""SQLAlchemy User Model."""

from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Boolean, Integer, DateTime
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth accounts
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Usage statistics
    daily_message_count = Column(Integer, default=0, nullable=False)
    last_active_date = Column(String(10), default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"))

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
