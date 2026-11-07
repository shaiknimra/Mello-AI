"""LangGraph Orchestrator for Mello AI multi-agent workflow.

Implements the LLM-led coordinator and 5 specialist agents with shared conversation context,
task planning, conditional routing, and observable high-level progress tracking.
"""

from typing import List, Dict, Any, Optional
import logging
from langgraph.graph import StateGraph, END

from backend.app.agents.state import MelloAgentState
from backend.app.agents.specialists import SPECIALIST_AGENTS, get_agent
from backend.app.services.llm.base import BaseLLMAdapter
from backend.app.services.llm.mock import MockLLMAdapter

logger = logging.getLogger(__name__)


def build_context_prompt(history: List[Dict[str, str]], current_prompt: str) -> str:
    """Combines previous conversation history with the current prompt into a shared context."""
    if not history:
        return current_prompt

    formatted_history = []
    # Take up to last 8 turns to preserve context without exceeding token budgets
    for turn in history[-8:]:
        role = "User" if turn.get("role") == "user" else "Mello"
        content = turn.get("content", "").strip()
        formatted_history.append(f"{role}: {content}")

    context_str = "\n".join(formatted_history)
    return (
        f"--- Conversation Context ---\n"
        f"{context_str}\n"
        f"----------------------------\n\n"
        f"Current User Request:\n{current_prompt}"
    )


def determine_route(state: MelloAgentState) -> str:
    """Conditional edge router determining which specialist agent handles the request."""
    target = state.get("target_agent", "coordinator").lower().strip()

    # 1. Manual User Selection takes immediate precedence
    if target in ["coding", "research", "learning", "planning", "writing"]:
        return f"{target}_node"

    # 2. Coordinator analyzes intent for complex tasks
    prompt = state.get("prompt", "").lower()

    # Coding patterns
    coding_keywords = ["code", "function", "python", "typescript", "javascript", "react", "fastapi", "sql", "bug", "error", "algorithm", "class", "def ", "api"]
    if any(k in prompt for k in coding_keywords):
        return "coding_node"

    # Research patterns
    research_keywords = ["research", "fact check", "source", "compare", "difference between", "history of", "evidence"]
    if any(k in prompt for k in research_keywords):
        return "research_node"

    # Learning & teaching patterns
    learning_keywords = ["teach me", "explain like", "analogy", "how does", "what is the concept of", "beginner guide", "learn"]
    if any(k in prompt for k in learning_keywords):
        return "learning_node"

    # Planning & roadmap patterns
    planning_keywords = ["plan", "roadmap", "milestone", "timeline", "schedule", "strategy", "break down the steps", "checklist"]
    if any(k in prompt for k in planning_keywords):
        return "planning_node"

    # Writing patterns
    writing_keywords = ["write an essay", "draft an email", "blog post", "cover letter", "rephrase", "summarize the article", "write a story"]
    if any(k in prompt for k in writing_keywords):
        return "writing_node"

    # Default: Coordinator answers straightforward questions directly
    return "coordinator_node"


class MelloOrchestrator:
    """Orchestrator that wraps the LangGraph compiled state graph."""

    def __init__(self, llm_adapter: BaseLLMAdapter):
        self.llm = llm_adapter
        # Detect mock adapter so we skip external tool calls in tests
        self.is_mock = isinstance(llm_adapter, MockLLMAdapter)
        self.graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(MelloAgentState)

        # ── Shared agent execution helper ────────────────────────────────────
        async def execute_agent(state: MelloAgentState, agent_id: str) -> Dict[str, Any]:
            agent_def = get_agent(agent_id)
            history = state.get("history", [])
            prompt_with_context = build_context_prompt(history, state.get("prompt", ""))
            is_first_message = len(history) == 0

            # Tool invocation – only when using the real Gemini adapter
            tool_output = None
            if not self.is_mock:
                if agent_id == "research":
                    from backend.app.tools.web_search import WebSearchTool
                    tool_result = await WebSearchTool().execute(query=state.get("prompt", ""))
                    if tool_result.success and tool_result.citations:
                        tool_output = "\n**Sources:**\n" + "\n".join(
                            f"- [{c.title}]({c.url})" for c in tool_result.citations
                        )
                elif agent_id == "learning":
                    calc_triggers = ["calculate", "result of", "plus", "minus", "times", "divide"]
                    if any(tok in state.get("prompt", "").lower() for tok in calc_triggers):
                        from backend.app.tools.calculator import SafeCalculatorTool
                        calc_result = await SafeCalculatorTool().execute(expression=state.get("prompt", ""))
                        if calc_result.success:
                            tool_output = f"\n**Calculation Result:** {calc_result.data.get('result')}"

            # Call LLM
            response = await self.llm.generate_response(
                prompt=prompt_with_context,
                system_instruction=agent_def["prompt"],
                personality=state.get("personality", "Friendly"),
                response_length=state.get("response_length", "medium"),
                explanation_level=state.get("explanation_level", "intermediate"),
                is_first_message=is_first_message,
            )

            if tool_output:
                response = f"{response}\n{tool_output}"

            return {
                "active_agent_id": agent_def["id"],
                "active_agent_name": agent_def["name"],
                "progress_status": "Verifying results",
                "final_response": response,
            }

        # ── Individual agent node wrappers ───────────────────────────────────
        async def coordinator_node(state: MelloAgentState):
            return await execute_agent(state, "coordinator")

        async def coding_node(state: MelloAgentState):
            return await execute_agent(state, "coding")

        async def research_node(state: MelloAgentState):
            return await execute_agent(state, "research")

        async def learning_node(state: MelloAgentState):
            return await execute_agent(state, "learning")

        async def planning_node(state: MelloAgentState):
            return await execute_agent(state, "planning")

        async def writing_node(state: MelloAgentState):
            return await execute_agent(state, "writing")

        async def routing_node(state: MelloAgentState):
            return {"progress_status": "Understanding your question"}

        # ── Register nodes ───────────────────────────────────────────────────
        workflow.add_node("routing_node", routing_node)
        workflow.add_node("coordinator_node", coordinator_node)
        workflow.add_node("coding_node", coding_node)
        workflow.add_node("research_node", research_node)
        workflow.add_node("learning_node", learning_node)
        workflow.add_node("planning_node", planning_node)
        workflow.add_node("writing_node", writing_node)

        workflow.set_entry_point("routing_node")
        workflow.add_conditional_edges(
            "routing_node",
            determine_route,
            {
                "coordinator_node": "coordinator_node",
                "coding_node": "coding_node",
                "research_node": "research_node",
                "learning_node": "learning_node",
                "planning_node": "planning_node",
                "writing_node": "writing_node",
            },
        )

        # All specialist nodes terminate the graph
        for node in ["coordinator_node", "coding_node", "research_node", "learning_node", "planning_node", "writing_node"]:
            workflow.add_edge(node, END)

        return workflow.compile()

    async def run(
        self,
        prompt: str,
        target_agent: str = "coordinator",
        history: Optional[List[Dict[str, str]]] = None,
        personality: str = "Friendly",
        response_length: str = "medium",
        explanation_level: str = "intermediate",
    ) -> Dict[str, Any]:
        """Execute the LangGraph multi-agent flow and return the final response and active agent."""
        initial_state: MelloAgentState = {
            "prompt": prompt,
            "target_agent": target_agent or "coordinator",
            "history": history or [],
            "active_agent_id": target_agent or "coordinator",
            "active_agent_name": get_agent(target_agent or "coordinator")["name"],
            "personality": personality,
            "response_length": response_length,
            "explanation_level": explanation_level,
            "progress_status": "Understanding your question",
            "final_response": None,
        }

        result = await self.graph.ainvoke(initial_state)
        return {
            "content": result.get("final_response") or "I processed your request, but received no response.",
            "agent_id": result.get("active_agent_id", "coordinator"),
            "agent_name": result.get("active_agent_name", "Coordinator Agent"),
            "status": "completed",
        }
