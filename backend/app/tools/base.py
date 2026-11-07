"""Base classes and schemas for Mello AI controlled tool execution."""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    """Safety risk classification for tools."""
    LOW = "LOW"        # Read-only, safe to execute automatically (search, math)
    MEDIUM = "MEDIUM"  # Content generation, exports (permission notice)
    HIGH = "HIGH"      # Irreversible, destructive actions (requires explicit confirmation)


class ToolCitation(BaseModel):
    """Citation metadata for verifiable research."""
    title: str
    url: str
    snippet: str


class ToolResult(BaseModel):
    """Standardized output structure for all tool executions."""
    success: bool
    data: Any = None
    error: Optional[str] = None
    citations: Optional[List[ToolCitation]] = None
    action_summary: str = Field(..., description="High-level audit-friendly summary of the action taken")


class BaseTool(ABC):
    """Abstract Base Class for all Mello tools."""

    name: str
    description: str
    risk_level: RiskLevel

    @abstractmethod
    async def execute(self, **kwargs) -> ToolResult:
        """Asynchronously execute the tool action with the provided arguments."""
        pass
