"""API route handlers for order extraction and management."""

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.order import (
    ExtractionResponse,
    ExtractedOrder,
    OrderResponse,
    RawTextRequest,
    StatisticsResponse,
)
from app.services.ai_extractor import extract_order_from_images, extract_order_from_text
from app.services.chat_parser import extract_customer_hint, format_messages_for_ai, parse_whatsapp_export
from app.services.order_service import (
    get_all_orders,
    get_order_by_id,
    get_statistics,
    save_order,
    delete_order,
    update_order,
)
from app.config import Settings, get_settings

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("/extract/text", response_model=ExtractionResponse)
async def extract_from_text(
    file: UploadFile = File(..., description="WhatsApp exported chat .txt file"),
    save: bool = Query(True, description="Save extracted order to database"),
    settings: Settings = Depends(get_settings),
    db: AsyncSession = Depends(get_db),
) -> ExtractionResponse:
    """
    Upload a WhatsApp exported chat (.txt) and extract structured order details.

    The file should be exported from WhatsApp using "Export chat" without media.
    """
    if not file.filename or not file.filename.lower().endswith(".txt"):
        raise HTTPException(status_code=400, detail="Please upload a .txt WhatsApp export file")

    content_bytes = await file.read()
    try:
        content = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        content = content_bytes.decode("latin-1")

    if not content.strip():
        raise HTTPException(status_code=400, detail="The uploaded file is empty")

    messages = parse_whatsapp_export(content)
    conversation = format_messages_for_ai(messages)

    if not conversation.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not parse WhatsApp messages. Check the export format.",
        )

    customer_hint = extract_customer_hint(messages)

    try:
        order = await extract_order_from_text(conversation, settings, customer_hint)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI extraction failed: {exc}") from exc

    saved_id = None
    if save:
        record = await save_order(db, order, source_type="text")
        saved_id = record.id

    return ExtractionResponse(
        success=True,
        order=order,
        saved_order_id=saved_id,
    )


@router.post("/extract/images", response_model=ExtractionResponse)
async def extract_from_images(
    files: list[UploadFile] = File(..., description="WhatsApp chat screenshot(s)"),
    save: bool = Query(True, description="Save extracted order to database"),
    settings: Settings = Depends(get_settings),
    db: AsyncSession = Depends(get_db),
) -> ExtractionResponse:
    """
    Upload one or more WhatsApp chat screenshots and extract order details using vision AI.
    """
    if not files:
        raise HTTPException(status_code=400, detail="Please upload at least one image")

    allowed_types = {"image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"}
    image_bytes_list: list[bytes] = []

    for upload in files:
        if upload.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {upload.content_type}. Use PNG, JPG, or WEBP.",
            )
        data = await upload.read()
        if data:
            image_bytes_list.append(data)

    if not image_bytes_list:
        raise HTTPException(status_code=400, detail="No valid image data received")

    try:
        order = await extract_order_from_images(image_bytes_list, settings)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI extraction failed: {exc}") from exc

    saved_id = None
    if save:
        record = await save_order(db, order, source_type="image")
        saved_id = record.id

    return ExtractionResponse(
        success=True,
        order=order,
        saved_order_id=saved_id,
    )


@router.post("/extract/raw", response_model=ExtractionResponse)
async def extract_from_raw_text(
    body: RawTextRequest,
    save: bool = Query(True),
    settings: Settings = Depends(get_settings),
    db: AsyncSession = Depends(get_db),
) -> ExtractionResponse:
    """Extract order from pasted raw conversation text (for testing/demo)."""
    try:
        order = await extract_order_from_text(body.conversation.strip(), settings)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI extraction failed: {exc}") from exc

    saved_id = None
    if save:
        record = await save_order(db, order, source_type="text")
        saved_id = record.id

    return ExtractionResponse(success=True, order=order, saved_order_id=saved_id)


@router.get("", response_model=list[OrderResponse])
async def list_orders(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> list[OrderResponse]:
    """List all saved orders, newest first."""
    return await get_all_orders(db, limit=limit)


@router.get("/statistics", response_model=StatisticsResponse)
async def order_statistics(db: AsyncSession = Depends(get_db)) -> StatisticsResponse:
    """Get aggregate bakery order statistics."""
    return await get_statistics(db)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)) -> OrderResponse:
    """Get a single saved order by ID."""
    order = await get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}")
async def remove_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a saved order."""
    deleted = await delete_order(db, order_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    return {
        "success": True,
        "message": "Order deleted successfully",
    }

@router.put("/{order_id}", response_model=OrderResponse)
async def edit_order(
    order_id: int,
    order: ExtractedOrder,
    db: AsyncSession = Depends(get_db),
):
    """Edit existing order."""

    updated = await update_order(
        db,
        order_id,
        order,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    return updated