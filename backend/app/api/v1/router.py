"""API v1 Aggregated Router."""

from fastapi import APIRouter
from backend.app.api.v1.endpoints import health, chat, auth, conversations

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(conversations.router)
api_router.include_router(chat.router)
