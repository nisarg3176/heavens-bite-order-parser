"""Seed the database with sample orders for demo purposes (no AI required)."""

import asyncio
import json

from app.database import async_session_factory, init_db
from app.models.order import OrderRecord

SAMPLE_ORDERS = [
    {
        "customer_name": "Sarah Khan",
        "phone_number": "+1 718-555-0142",
        "items": [
            {"name": "Chocolate Fudge Cupcakes", "quantity": 2, "notes": "No nuts"},
            {"name": "Red Velvet Cake (6 inch)", "quantity": 1, "notes": "Happy Birthday Mom"},
            {"name": "Vanilla Cookies", "quantity": 6, "notes": None},
        ],
        "delivery_address": "42 Maple Street, Apt 3B, Brooklyn NY 11201",
        "delivery_time": "Saturday 5 PM",
        "special_instructions": "No nuts in cupcakes. Pink icing message on cake.",
        "order_date": "12/06/2025",
        "confidence": "high",
        "raw_summary": "Birthday order with cupcakes, cake, and cookies.",
        "source_type": "text",
    },
    {
        "customer_name": "James O'Brien",
        "phone_number": None,
        "items": [
            {"name": "Lemon Tarts", "quantity": 6, "notes": "Extra glaze"},
            {"name": "Blueberry Muffins", "quantity": 2, "notes": None},
        ],
        "delivery_address": "88 Oak Avenue, Queens",
        "delivery_time": "Friday 4pm pickup",
        "special_instructions": "Extra glaze on tarts",
        "order_date": "06/12/2025",
        "confidence": "high",
        "raw_summary": "Pickup order for lemon tarts and muffins.",
        "source_type": "text",
    },
    {
        "customer_name": "Priya Sharma",
        "phone_number": "917-555-8834",
        "items": [
            {"name": "Mini Cupcakes (Vanilla)", "quantity": 12, "notes": None},
            {"name": "Mini Cupcakes (Chocolate)", "quantity": 12, "notes": None},
            {"name": "Sugar Cookies", "quantity": 12, "notes": "Blue and pink frosting"},
        ],
        "delivery_address": "Grand Ballroom, 200 Park Lane, Manhattan",
        "delivery_time": "Sunday 14 June 11 AM",
        "special_instructions": "Baby shower theme - star sprinkles. 6 GF cupcakes.",
        "order_date": "11/06/2025",
        "confidence": "high",
        "raw_summary": "Baby shower custom order.",
        "source_type": "text",
    },
]


async def seed() -> None:
    await init_db()
    async with async_session_factory() as session:
        for data in SAMPLE_ORDERS:
            record = OrderRecord(
                customer_name=data["customer_name"],
                phone_number=data["phone_number"],
                items_json=json.dumps(data["items"]),
                delivery_address=data["delivery_address"],
                delivery_time=data["delivery_time"],
                special_instructions=data["special_instructions"],
                order_date=data["order_date"],
                confidence=data["confidence"],
                raw_summary=data["raw_summary"],
                source_type=data["source_type"],
            )
            session.add(record)
        await session.commit()
    print(f"Seeded {len(SAMPLE_ORDERS)} sample orders.")


if __name__ == "__main__":
    asyncio.run(seed())
