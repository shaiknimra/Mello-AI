"""Application configuration management using Pydantic Settings.

Reads environment variables from system environment and backend/.env file.
"""

from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    """Configuration settings for Mello AI backend."""

    # Project metadata
    PROJECT_NAME: str = "Mello AI"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    # Environment
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS origins for frontend communication
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Ensure CORS_ORIGINS is parsed into a list of strings if provided as JSON or comma-separated string."""
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # LLM Settings
    LLM_PROVIDER: str = "gemini"  # "gemini" or "mock"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # Support / Privacy
    SUPPORT_EMAIL: str = "support@example.com"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
