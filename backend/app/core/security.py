"""Authentication, password hashing, and JWT security utilities."""

from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.models.user import User

security_scheme = HTTPBearer(auto_error=False)


def get_password_hash(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    if not hashed_password:
        return False
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT access token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a signed JWT token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


async def get_current_user_optional(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Retrieve current user from JWT token if provided; returns None if guest."""
    if not auth_header or not auth_header.credentials:
        return None

    payload = decode_access_token(auth_header.credentials)
    if not payload or "sub" not in payload:
        return None

    user_id = payload["sub"]
    stmt = select(User).where(User.id == user_id, User.is_active == True)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_current_user(
    current_user: Optional[User] = Depends(get_current_user_optional),
) -> User:
    """Mandatory authentication dependency; raises HTTP 401 if not authenticated."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in or provide a valid bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
