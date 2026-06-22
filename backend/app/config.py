"""Application configuration loaded from environment variables."""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central settings for Heaven's Bite Bakery backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ai_provider: Literal["gemini", "openai"] = "gemini"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    database_url: str = Field(
    default="sqlite+aiosqlite:///./heavens_bite.db",
    alias="DATABASE_URL"
)
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,https://heavens-bite-order-parser.vercel.app"
    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
