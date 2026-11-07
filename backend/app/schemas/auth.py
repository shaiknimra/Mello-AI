"""Pydantic schemas for Authentication and User management."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from backend.app.core.config import settings


class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="Password (at least 8 characters)")
    full_name: Optional[str] = Field(default=None, max_length=100)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class GoogleAuthRequest(BaseModel):
    credential: str = Field(..., description="Google OAuth ID token or credential")
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    daily_message_count: int
    remaining_messages: int = Field(default=settings.DAILY_MESSAGE_LIMIT)
    created_at: str

    @classmethod
    def from_orm_model(cls, user):
        remaining = max(0, settings.DAILY_MESSAGE_LIMIT - (user.daily_message_count or 0))
        return cls(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            is_verified=user.is_verified,
            daily_message_count=user.daily_message_count,
            remaining_messages=remaining,
            created_at=user.created_at.isoformat() if user.created_at else "",
        )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
