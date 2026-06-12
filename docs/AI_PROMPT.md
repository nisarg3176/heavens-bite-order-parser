# AI Extraction Prompt

The order extraction logic lives in `backend/app/services/ai_extractor.py`.

## System Prompt

The AI acts as an order extraction assistant for Heaven's Bite Bakery. Key rules:

1. Extract **only** information explicitly stated or clearly implied
2. Use `null` for missing fields — do not guess
3. Combine duplicate items and sum quantities
4. Distinguish bakery staff from the customer
5. Extract phone numbers from anywhere in the chat
6. Capture delivery time phrases naturally ("tomorrow 5pm", "Saturday morning")
7. Include dietary/customization in special instructions
8. Rate confidence: `high`, `medium`, or `low`

## Output Schema

```json
{
  "customer_name": "string | null",
  "phone_number": "string | null",
  "items": [
    { "name": "string", "quantity": 1, "notes": "string | null" }
  ],
  "delivery_address": "string | null",
  "delivery_time": "string | null",
  "special_instructions": "string | null",
  "order_date": "string | null",
  "confidence": "high | medium | low",
  "raw_summary": "One sentence summary"
}
```

## Provider Support

| Provider | Text | Vision (Screenshots) | Env Variable |
|----------|------|----------------------|--------------|
| Gemini (default) | ✅ | ✅ | `GEMINI_API_KEY` |
| OpenAI | ✅ | ✅ | `OPENAI_API_KEY` |

Set `AI_PROVIDER=gemini` or `AI_PROVIDER=openai` in `.env`.

## Pre-processing

Before AI extraction, WhatsApp `.txt` exports are parsed by `chat_parser.py`:

- Supports `[DD/MM/YYYY, HH:MM:SS] Sender: Message` format
- Supports `DD/MM/YYYY, HH:MM - Sender: Message` format
- Handles multi-line message continuations
- Provides a customer name hint based on message frequency

## Testing Without AI

Use `samples/sample_outputs.json` for expected results when demoing the UI flow without an API key. The frontend will show a warning if the API key is not configured.
