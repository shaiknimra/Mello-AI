"""Agents catalogue endpoint: Lists all available Mello specialist agents."""

from fastapi import APIRouter
from typing import List, Dict, Any
from backend.app.agents.specialists import get_agent_definitions

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get("", response_model=List[Dict[str, Any]])
async def list_agents():
    """Retrieve full catalog of Mello specialist agents and their metadata."""
    return get_agent_definitions()
