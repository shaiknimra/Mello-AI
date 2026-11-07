"""Web Research Tool with verified citations.

Searches the web using DuckDuckGo to find external, factual information.
Formats results with titles, source links, and snippets so Mello never fabricates citations.
"""

from typing import List, Optional
import logging
from backend.app.tools.base import BaseTool, ToolResult, ToolCitation, RiskLevel

logger = logging.getLogger(__name__)


class WebSearchTool(BaseTool):
    """Executes live web searches and extracts verifiable citation links."""

    name = "web_search"
    description = "Searches the web for up-to-date facts, documentation, or news. Returns verified source URLs."
    risk_level = RiskLevel.LOW

    async def execute(self, query: str = "", max_results: int = 5, **kwargs) -> ToolResult:
        query_clean = query.strip()
        if not query_clean:
            return ToolResult(
                success=False,
                error="Search query cannot be empty.",
                action_summary="Web search aborted: empty query",
            )

        citations: List[ToolCitation] = []

        try:
            from duckduckgo_search import DDGS
            import asyncio

            # Run DuckDuckGo text search in an async executor thread
            def search_sync():
                with DDGS() as ddgs:
                    return list(ddgs.text(query_clean, max_results=max_results))

            results = await asyncio.to_thread(search_sync)

            for item in results:
                title = item.get("title", "Untitled Source").strip()
                url = item.get("href") or item.get("link") or ""
                snippet = item.get("body") or item.get("snippet") or ""

                if url:
                    citations.append(
                        ToolCitation(
                            title=title,
                            url=url,
                            snippet=snippet[:300],
                        )
                    )

            if not citations:
                return ToolResult(
                    success=True,
                    data={"query": query_clean, "results": []},
                    citations=[],
                    action_summary=f"Searched web for '{query_clean}': 0 results found",
                )

            return ToolResult(
                success=True,
                data={
                    "query": query_clean,
                    "count": len(citations),
                    "results": [c.model_dump() for c in citations],
                },
                citations=citations,
                action_summary=f"Searched web for '{query_clean}': found {len(citations)} sources",
            )

        except Exception as exc:
            logger.warning(f"Web search exception for '{query_clean}': {exc}")
            return ToolResult(
                success=False,
                error=f"Web search encountered a temporary network issue: {str(exc)}",
                action_summary=f"Web search failed for query '{query_clean}'",
            )
