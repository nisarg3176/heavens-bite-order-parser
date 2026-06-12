"""FastAPI application entry point for Heaven's Bite Bakery Order Extractor."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import health, orders


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Heaven's Bite Bakery — Order Extractor API",
        description=(
            "Convert WhatsApp bakery orders into structured records using AI. "
            "Upload exported chat files or screenshots to extract customer details, "
            "items, delivery info, and special instructions."
        ),
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(orders.router)

    return app


app = create_app()
