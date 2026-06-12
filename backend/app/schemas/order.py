"""Pydantic schemas for API request/response validation."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class OrderItem(BaseModel):
    """A single line item in a bakery order."""

    name: str = Field(..., description="Name of the bakery item")
    quantity: int = Field(default=1, ge=1, description="Quantity ordered")
    notes: Optional[str] = Field(default=None, description="Item-specific notes")


class ExtractedOrder(BaseModel):
    """Structured order extracted from a WhatsApp conversation."""

    customer_name: Optional[str] = None
    phone_number: Optional[str] = None
    items: list[OrderItem] = Field(default_factory=list)
    delivery_address: Optional[str] = None
    delivery_time: Optional[str] = None
    special_instructions: Optional[str] = None
    order_date: Optional[str] = None
    confidence: Optional[str] = Field(
        default=None,
        description="AI confidence: high, medium, or low",
    )
    raw_summary: Optional[str] = Field(
        default=None,
        description="Brief summary of the conversation context",
    )


class OrderResponse(ExtractedOrder):
    """Order record returned from the API including database metadata."""

    id: int
    source_type: str
    created_at: datetime


class ExtractionResponse(BaseModel):
    """Response after extracting order details from uploaded content."""

    success: bool
    order: ExtractedOrder
    message: str = "Order extracted successfully"
    saved_order_id: Optional[int] = None


class ItemStatistic(BaseModel):
    """Aggregate statistic for a bakery item."""

    item_name: str
    total_quantity: int
    order_count: int


class StatisticsResponse(BaseModel):
    """Bakery order statistics across all saved orders."""

    total_orders: int
    total_items_sold: int
    unique_customers: int
    most_ordered_items: list[ItemStatistic]
    recent_orders: list[OrderResponse]


class RawTextRequest(BaseModel):
    """Request body for pasted conversation text extraction."""

    conversation: str = Field(..., min_length=1, description="Raw WhatsApp conversation text")


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    ai_provider: str
    ai_configured: bool
