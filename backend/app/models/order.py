"""SQLAlchemy database models."""

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class OrderRecord(Base):
    """Persisted bakery order extracted from WhatsApp."""

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    customer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    items_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    delivery_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    delivery_time: Mapped[str | None] = mapped_column(String(255), nullable=True)
    special_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    order_date: Mapped[str | None] = mapped_column(String(100), nullable=True)
    confidence: Mapped[str | None] = mapped_column(String(20), nullable=True)
    raw_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_type: Mapped[str] = mapped_column(String(20), nullable=False, default="text")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
