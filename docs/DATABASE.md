# Database Design — Heaven's Bite Bakery Order Extractor

## Overview

The application uses **SQLite** for local development and demonstration. SQLAlchemy ORM provides async database access via `aiosqlite`.

For production, swap `DATABASE_URL` to PostgreSQL (e.g. `postgresql+asyncpg://user:pass@host/db`).

## Entity Relationship

```
┌─────────────────────────────────────────────────────────────┐
│                         orders                               │
├─────────────────────────────────────────────────────────────┤
│ id                  INTEGER PRIMARY KEY AUTOINCREMENT        │
│ customer_name       VARCHAR(255) NULL                        │
│ phone_number        VARCHAR(50) NULL                         │
│ items_json          TEXT NOT NULL  (JSON array of line items)│
│ delivery_address    TEXT NULL                                │
│ delivery_time       VARCHAR(255) NULL                        │
│ special_instructions TEXT NULL                              │
│ order_date          VARCHAR(100) NULL                        │
│ confidence          VARCHAR(20) NULL   (high|medium|low)     │
│ raw_summary         TEXT NULL                                │
│ source_type         VARCHAR(20) NOT NULL (text|image)        │
│ created_at          DATETIME NOT NULL DEFAULT now()          │
└─────────────────────────────────────────────────────────────┘
```

## Line Items (JSON in `items_json`)

Each order stores items as a JSON array:

```json
[
  {
    "name": "Chocolate Fudge Cupcakes",
    "quantity": 2,
    "notes": "No nuts (allergy)"
  }
]
```

This denormalized approach keeps the schema simple for a POC. A normalized design with an `order_items` table would be preferable at scale.

## Statistics Queries

Statistics are computed in application code by aggregating all `orders` records:

| Metric | Logic |
|--------|-------|
| Total orders | `COUNT(orders)` |
| Items sold | Sum of all item quantities across orders |
| Unique customers | Distinct `customer_name` (case-insensitive) |
| Most ordered items | Group by item name, sum quantities, sort desc |

## Future Extensions (Out of Scope)

- `customers` table for repeat customer lookup
- `products` table for menu validation
- Payment/delivery status columns (explicitly excluded from this POC)
