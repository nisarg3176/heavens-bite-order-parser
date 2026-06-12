# API Documentation — Heaven's Bite Bakery Order Extractor

Base URL: `http://localhost:8000`

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

---

## Health

### `GET /health`

Check API status and AI configuration.

**Response 200**

```json
{
  "status": "ok",
  "ai_provider": "gemini",
  "ai_configured": true
}
```

---

## Order Extraction

### `POST /api/orders/extract/text`

Extract order from WhatsApp exported chat file.

**Content-Type:** `multipart/form-data`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | file | Yes | WhatsApp `.txt` export |
| `save` | query bool | No | Save to DB (default: `true`) |

**Example (curl)**

```bash
curl -X POST "http://localhost:8000/api/orders/extract/text?save=true" \
  -F "file=@samples/chat_export_sarah_khan.txt"
```

**Response 200**

```json
{
  "success": true,
  "message": "Order extracted successfully",
  "saved_order_id": 1,
  "order": {
    "customer_name": "Sarah Khan",
    "phone_number": "+1 718-555-0142",
    "items": [
      { "name": "Chocolate Fudge Cupcakes", "quantity": 2, "notes": "No nuts" }
    ],
    "delivery_address": "42 Maple Street, Apt 3B, Brooklyn NY 11201",
    "delivery_time": "Saturday 5 PM",
    "special_instructions": "No nuts in cupcakes. Happy Birthday Mom on cake.",
    "order_date": "12/06/2025",
    "confidence": "high",
    "raw_summary": "Sarah orders cupcakes, cake, and cookies for Saturday delivery."
  }
}
```

---

### `POST /api/orders/extract/images`

Extract order from WhatsApp chat screenshot(s) using vision AI.

**Content-Type:** `multipart/form-data`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `files` | file[] | Yes | PNG, JPG, or WEBP images |
| `save` | query bool | No | Save to DB (default: `true`) |

**Example (curl)**

```bash
curl -X POST "http://localhost:8000/api/orders/extract/images" \
  -F "files=@screenshot1.png" \
  -F "files=@screenshot2.png"
```

---

### `POST /api/orders/extract/raw`

Extract order from pasted conversation text (useful for demos/testing).

**Content-Type:** `application/json`

```json
{
  "conversation": "[12/06/2025, 09:15:22] Sarah Khan: Hi Heaven's Bite! ..."
}
```

---

## Order Management

### `GET /api/orders`

List saved orders (newest first).

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 50 | Max records (1–200) |

---

### `GET /api/orders/{order_id}`

Get a single order by ID.

**Response 404** if not found.

---

### `GET /api/orders/statistics`

Aggregate bakery statistics.

**Response 200**

```json
{
  "total_orders": 12,
  "total_items_sold": 87,
  "unique_customers": 9,
  "most_ordered_items": [
    {
      "item_name": "Chocolate Fudge Cupcakes",
      "total_quantity": 24,
      "order_count": 8
    }
  ],
  "recent_orders": []
}
```

---

## Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Invalid input (wrong file type, empty file) |
| 404 | Order not found |
| 422 | AI API key missing or invalid configuration |
| 502 | AI provider error |

Error body:

```json
{
  "detail": "Human-readable error message"
}
```
