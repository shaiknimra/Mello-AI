"""Pytest configuration and shared fixtures for Mello AI backend tests."""

import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from backend.app.core.config import settings

# Force test environment so external DB and APIs are disabled
settings.APP_ENV = "test"

from backend.app.main import app
from backend.app.db.session import get_db, Base
from backend.app.services.llm.mock import MockLLMAdapter
from backend.app.services.llm import get_llm_adapter

# Dedicated in-memory SQLite for tests (no file, no network)
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


def _run_sync(coro):
    """Run a coroutine synchronously using a fresh event loop (safe at session scope)."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all schema tables in the test engine before any tests run."""
    async def _init():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def _cleanup():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        await test_engine.dispose()

    _run_sync(_init())
    yield
    _run_sync(_cleanup())


@pytest.fixture
def client():
    """Synchronous test client with Mock LLM and in-memory DB overrides."""

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
