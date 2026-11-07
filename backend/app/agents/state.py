"""State schema for LangGraph agent orchestration."""

from typing import TypedDict, List, Dict, Any, Optional


class MelloAgentState(TypedDict):
    """Execution state shared across all nodes in the LangGraph graph."""
    # Conversation context (list of prior messages for multi-turn shared memory)
    history: List[Dict[str, str]]

    # Current user prompt
    prompt: str

    # Agent selection (target chosen by user, active chosen by router)
    target_agent: str
    active_agent_id: str
    active_agent_name: str

    # Response preferences
    personality: str
    response_length: str
    explanation_level: str

    # High-level observable progress indicator (never internal deliberation)
    progress_status: str

    # Generated response content
    final_response: Optional[str]
