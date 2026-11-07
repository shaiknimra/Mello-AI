"""Pytest configuration and shared fixtures for Mello AI backend tests."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.db.session import get_db, Base
from backend.app.services.llm.mock import MockLLMAdapter
from backend.app.services.llm import get_llm_adapter

# Dedicated test database (in-memory SQLite)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all schema tables in test engine synchronously or at start."""
    import asyncio
    async def init():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    asyncio.run(init())
    yield
    async def cleanup():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        await test_engine.dispose()
    asyncio.run(cleanup())


@pytest.fixture
def client():
    """Provides a synchronous test client with mock LLM and test database session overrides."""
    async def override_get_db():
        async with TestingSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_llm_adapter] = lambda: MockLLMAdapter()
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.pop(get_llm_adapter, None)
    app.dependency_overrides.pop(get_db, None)
