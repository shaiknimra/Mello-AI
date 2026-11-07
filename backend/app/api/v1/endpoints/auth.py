"""Authentication endpoints: Signup, Login, Google OAuth, and Current User Profile."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.schemas.auth import (
    UserSignupRequest,
    UserLoginRequest,
    GoogleAuthRequest,
    TokenResponse,
    UserResponse,
)
from backend.app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: UserSignupRequest, db: AsyncSession = Depends(get_db)):
    """Create a new user account with email and password."""
    # Check if email is already registered
    stmt = select(User).where(User.email == payload.email.lower().strip())
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Create new user
    new_user = User(
        email=payload.email.lower().strip(),
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        is_active=True,
        is_verified=False,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Issue JWT token
    token = create_access_token({"sub": new_user.id, "email": new_user.email})

    return TokenResponse(
        access_token=token,
        user=UserResponse.from_orm_model(new_user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate an existing user and return a JWT access token."""
    stmt = select(User).where(User.email == payload.email.lower().strip())
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user account has been disabled.",
        )

    # Check and reset daily usage counter if on a new UTC date
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if user.last_active_date != today_str:
        user.daily_message_count = 0
        user.last_active_date = today_str
        await db.commit()
        await db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})

    return TokenResponse(
        access_token=token,
        user=UserResponse.from_orm_model(user),
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(payload: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate or register a user via Google OAuth."""
    # When credentials / email are received
    email = payload.email or f"google_user_{payload.credential[:10]}@example.com"
    email = str(email).lower().strip()

    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=email,
            full_name=payload.full_name or "Google User",
            is_active=True,
            is_verified=True,  # Google accounts are pre-verified
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(
        access_token=token,
        user=UserResponse.from_orm_model(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve profile and daily usage statistics of the authenticated user."""
    return UserResponse.from_orm_model(current_user)
