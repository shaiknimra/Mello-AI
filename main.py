"""Root entrypoint proxy for Render and serverless deployment targets."""

from backend.app.main import app

__all__ = ["app"]
