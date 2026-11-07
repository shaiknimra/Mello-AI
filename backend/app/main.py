"""Main FastAPI entrypoint for Mello AI backend."""

import sys
import types
from pathlib import Path

# Ensure 'backend' package is always resolvable regardless of working directory
_app_dir = Path(__file__).resolve().parent
_backend_dir = _app_dir.parent
_repo_root = _backend_dir.parent

for _p in [str(_repo_root), str(_backend_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

if "backend" not in sys.modules:
    _pkg = types.ModuleType("backend")
    _pkg.__path__ = [str(_backend_dir)]
    sys.modules["backend"] = _pkg

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.v1.router import api_router
from backend.app.db.session import engine, Base
import backend.app.models  # Ensures all models are registered with Base.metadata


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown routines."""
    print("--> entering lifespan", flush=True)
    if settings.APP_ENV != "test":
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning("Database initialization skipped or deferred: %s", e)
    yield
    print("--> exiting lifespan", flush=True)
    if settings.APP_ENV != "test":
        try:
            await engine.dispose()
        except Exception:
            pass


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API powering Mello AI — a multi-agent AI assistant.",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS) for frontend React client
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    """Root status greeting with reference to health and API docs."""
    return {
        "message": "Welcome to Mello AI API. Think. Ask. Discover.",
        "docs": f"{settings.API_V1_PREFIX}/health",
        "version": settings.VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
