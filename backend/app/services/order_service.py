"""Order persistence and statistics service."""

import json
from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import OrderRecord
from app.schemas.order import (
    ExtractedOrder,
    ItemStatistic,
    OrderItem,
    OrderResponse,
    StatisticsResponse,
)


def _record_to_response(record: OrderRecord) -> OrderResponse:
    items_data = json.loads(record.items_json or "[]")
    items = [OrderItem(**item) for item in items_data]

    return OrderResponse(
        id=record.id,
        customer_name=record.customer_name,
        phone_number=record.phone_number,
        items=items,
        delivery_address=record.delivery_address,
        delivery_time=record.delivery_time,
        special_instructions=record.special_instructions,
        order_date=record.order_date,
        confidence=record.confidence,
        raw_summary=record.raw_summary,
        source_type=record.source_type,
        created_at=record.created_at,
    )


async def save_order(
    db: AsyncSession,
    order: ExtractedOrder,
    source_type: str,
) -> OrderRecord:
    """Persist an extracted order to the database."""
    record = OrderRecord(
        customer_name=order.customer_name,
        phone_number=order.phone_number,
        items_json=json.dumps([item.model_dump() for item in order.items]),
        delivery_address=order.delivery_address,
        delivery_time=order.delivery_time,
        special_instructions=order.special_instructions,
        order_date=order.order_date,
        confidence=order.confidence,
        raw_summary=order.raw_summary,
        source_type=source_type,
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return record


async def get_all_orders(db: AsyncSession, limit: int = 50) -> list[OrderResponse]:
    result = await db.execute(
        select(OrderRecord).order_by(OrderRecord.created_at.desc()).limit(limit)
    )
    return [_record_to_response(r) for r in result.scalars().all()]


async def get_order_by_id(db: AsyncSession, order_id: int) -> OrderResponse | None:
    result = await db.execute(select(OrderRecord).where(OrderRecord.id == order_id))
    record = result.scalar_one_or_none()
    return _record_to_response(record) if record else None


async def get_statistics(db: AsyncSession) -> StatisticsResponse:
    """Compute aggregate statistics across all saved orders."""
    result = await db.execute(select(OrderRecord).order_by(OrderRecord.created_at.desc()))
    records = result.scalars().all()

    item_totals: dict[str, dict[str, int]] = defaultdict(lambda: {"qty": 0, "count": 0})
    customers: set[str] = set()
    total_items = 0

    for record in records:
        if record.customer_name:
            customers.add(record.customer_name.lower().strip())
        items = json.loads(record.items_json or "[]")
        seen_in_order: set[str] = set()
        for item in items:
            name = item.get("name", "Unknown")
            qty = int(item.get("quantity", 1))
            item_totals[name]["qty"] += qty
            total_items += qty
            if name not in seen_in_order:
                item_totals[name]["count"] += 1
                seen_in_order.add(name)

    most_ordered = sorted(
        [
            ItemStatistic(
                item_name=name,
                total_quantity=data["qty"],
                order_count=data["count"],
            )
            for name, data in item_totals.items()
        ],
        key=lambda x: x.total_quantity,
        reverse=True,
    )[:10]

    recent = [_record_to_response(r) for r in records[:5]]

    return StatisticsResponse(
        total_orders=len(records),
        total_items_sold=total_items,
        unique_customers=len(customers),
        most_ordered_items=most_ordered,
        recent_orders=recent,
    )
