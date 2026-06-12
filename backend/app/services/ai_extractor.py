"""AI-powered order extraction from WhatsApp conversations."""

import json
import re
from typing import Any

from app.config import Settings
from app.schemas.order import ExtractedOrder, OrderItem

EXTRACTION_SYSTEM_PROMPT = """You are an order extraction assistant for Heaven's Bite Bakery, a home-based bakery that receives orders via WhatsApp.

Your task is to read a WhatsApp conversation and extract structured order details.

RULES:
1. Extract ONLY information explicitly stated or clearly implied in the conversation.
2. If a field is missing or unclear, set it to null (not a guess).
3. Combine duplicate items and sum quantities when the customer orders the same item multiple times.
4. The bakery side may be named "Heaven's Bite", "Heaven's Bite Bakery", or similar — that is NOT the customer.
5. The customer is typically the other participant placing the order.
6. Phone numbers may appear in the chat header, contact info, or within messages — extract if present.
7. Delivery time can be phrases like "tomorrow 5pm", "Saturday morning", "by 3 PM today".
8. Order date should reflect when the order was placed (from message timestamps or stated date).
9. Special instructions include dietary requests, customization, gift messages, etc.
10. Set confidence to "high" if most fields are clear, "medium" if some inference needed, "low" if very sparse.

Respond with ONLY valid JSON matching this exact schema:
{
  "customer_name": "string or null",
  "phone_number": "string or null",
  "items": [{"name": "string", "quantity": 1, "notes": "string or null"}],
  "delivery_address": "string or null",
  "delivery_time": "string or null",
  "special_instructions": "string or null",
  "order_date": "string or null",
  "confidence": "high|medium|low",
  "raw_summary": "One sentence summary of the order conversation"
}"""


def build_extraction_prompt(conversation_text: str, customer_hint: str | None = None) -> str:
    """Build the user prompt for order extraction."""
    hint_line = ""
    if customer_hint:
        hint_line = f"\nLikely customer name (heuristic): {customer_hint}\n"

    return f"""Extract the bakery order from this WhatsApp conversation:

{hint_line}
--- CONVERSATION START ---
{conversation_text}
--- CONVERSATION END ---

Return ONLY the JSON object, no markdown fences."""


def _parse_json_response(text: str) -> dict[str, Any]:
    """Parse JSON from AI response, stripping markdown fences if present."""
    cleaned = text.strip()
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if fence_match:
        cleaned = fence_match.group(1).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        json_match = re.search(r"\{[\s\S]*\}", cleaned)
        if json_match:
            return json.loads(json_match.group(0))
        raise ValueError("AI response did not contain valid JSON") from None


def _normalize_order_data(data: dict[str, Any]) -> ExtractedOrder:
    """Convert raw AI JSON into a validated ExtractedOrder."""
    items_raw = data.get("items") or []
    items: list[OrderItem] = []

    for item in items_raw:
        if isinstance(item, dict) and item.get("name"):
            qty = item.get("quantity", 1)
            try:
                qty = max(1, int(qty))
            except (TypeError, ValueError):
                qty = 1
            items.append(
                OrderItem(
                    name=str(item["name"]).strip(),
                    quantity=qty,
                    notes=item.get("notes"),
                )
            )

    return ExtractedOrder(
        customer_name=data.get("customer_name"),
        phone_number=data.get("phone_number"),
        items=items,
        delivery_address=data.get("delivery_address"),
        delivery_time=data.get("delivery_time"),
        special_instructions=data.get("special_instructions"),
        order_date=data.get("order_date"),
        confidence=data.get("confidence"),
        raw_summary=data.get("raw_summary"),
    )


async def extract_order_from_text(
    conversation_text: str,
    settings: Settings,
    customer_hint: str | None = None,
) -> ExtractedOrder:
    """Extract structured order using configured AI provider."""
    prompt = build_extraction_prompt(conversation_text, customer_hint)

    if settings.ai_provider == "openai":
        raw = await _call_openai(prompt, settings)
    else:
        raw = await _call_gemini(prompt, settings)

    data = _parse_json_response(raw)
    return _normalize_order_data(data)


async def extract_order_from_images(
    image_bytes_list: list[bytes],
    settings: Settings,
) -> ExtractedOrder:
    """Extract order from WhatsApp screenshot images using vision AI."""
    prompt = build_extraction_prompt(
        "The conversation is provided as WhatsApp chat screenshot(s). "
        "Read all visible messages and extract the order details."
    )

    if settings.ai_provider == "openai":
        raw = await _call_openai_vision(prompt, image_bytes_list, settings)
    else:
        raw = await _call_gemini_vision(prompt, image_bytes_list, settings)

    data = _parse_json_response(raw)
    return _normalize_order_data(data)


async def _call_gemini(prompt: str, settings: Settings) -> str:
    import google.generativeai as genai

    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not configured. See backend/.env.example")

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        system_instruction=EXTRACTION_SYSTEM_PROMPT,
    )
    response = model.generate_content(prompt)
    return response.text


async def _call_gemini_vision(prompt: str, images: list[bytes], settings: Settings) -> str:
    import google.generativeai as genai
    from PIL import Image
    import io

    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not configured. See backend/.env.example")

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        system_instruction=EXTRACTION_SYSTEM_PROMPT,
    )

    parts: list[Any] = [prompt]
    for img_bytes in images:
        img = Image.open(io.BytesIO(img_bytes))
        parts.append(img)

    response = model.generate_content(parts)
    return response.text


async def _call_openai(prompt: str, settings: Settings) -> str:
    from openai import AsyncOpenAI

    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is not configured. See backend/.env.example")

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    return response.choices[0].message.content or "{}"


async def _call_openai_vision(prompt: str, images: list[bytes], settings: Settings) -> str:
    import base64
    from openai import AsyncOpenAI

    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is not configured. See backend/.env.example")

    content: list[dict[str, Any]] = [{"type": "text", "text": prompt}]
    for img_bytes in images:
        b64 = base64.b64encode(img_bytes).decode("utf-8")
        content.append(
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{b64}"},
            }
        )

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
            {"role": "user", "content": content},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    return response.choices[0].message.content or "{}"
