"""Health check and root endpoints."""

from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.schemas.order import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Check API health and AI configuration status."""
    ai_configured = bool(
        settings.gemini_api_key
        if settings.ai_provider == "gemini"
        else settings.openai_api_key
    )
    return HealthResponse(
        status="ok",
        ai_provider=settings.ai_provider,
        ai_configured=ai_configured,
    )


@router.get("/")
async def root() -> dict:
    return {
        "name": "Heaven's Bite Bakery Order Extractor API",
        "version": "1.0.0",
        "docs": "/docs",
    }
