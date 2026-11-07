"""Health check endpoint.

Provides real-time system status, deployment checks, and diagnostic information.
"""

from fastapi import APIRouter
from datetime import datetime, timezone
from backend.app.core.config import settings

router = APIRouter()


@router.get("/health", tags=["Health"])
async def check_health():
    """Verify backend health, runtime status, and active LLM provider."""
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.APP_ENV,
        "llm_provider": settings.LLM_PROVIDER,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
