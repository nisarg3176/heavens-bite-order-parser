"""WhatsApp exported chat (.txt) parsing utilities."""

import re
from dataclasses import dataclass


@dataclass
class ChatMessage:
    """A single parsed message from an exported WhatsApp chat."""

    timestamp: str
    sender: str
    content: str


# Common WhatsApp export formats:
# [DD/MM/YYYY, HH:MM:SS] Sender: Message
# DD/MM/YYYY, HH:MM - Sender: Message
# MM/DD/YY, HH:MM AM/PM - Sender: Message
MESSAGE_PATTERNS = [
    re.compile(
        r"^\[(\d{1,2}/\d{1,2}/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APMapm]{2})?)\]\s*"
        r"([^:]+):\s*(.*)$"
    ),
    re.compile(
        r"^(\d{1,2}/\d{1,2}/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APMapm]{2})?)\s*-\s*"
        r"([^:]+):\s*(.*)$"
    ),
]


def parse_whatsapp_export(content: str) -> list[ChatMessage]:
    """
    Parse a WhatsApp exported chat file into structured messages.

    Handles multi-line messages by appending continuation lines to the
    previous message until a new timestamp line is found.
    """
    messages: list[ChatMessage] = []
    current: ChatMessage | None = None

    for line in content.splitlines():
        matched = False
        for pattern in MESSAGE_PATTERNS:
            match = pattern.match(line)
            if match:
                if current:
                    messages.append(current)
                current = ChatMessage(
                    timestamp=match.group(1).strip(),
                    sender=match.group(2).strip(),
                    content=match.group(3).strip(),
                )
                matched = True
                break

        if not matched and current and line.strip():
            current.content += "\n" + line.strip()

    if current:
        messages.append(current)

    return messages


def format_messages_for_ai(messages: list[ChatMessage]) -> str:
    """Format parsed messages into a readable transcript for the AI model."""
    if not messages:
        return ""

    lines = []
    for msg in messages:
        lines.append(f"[{msg.timestamp}] {msg.sender}: {msg.content}")
    return "\n".join(lines)


def extract_customer_hint(messages: list[ChatMessage]) -> str | None:
    """
    Heuristic: the non-bakery sender with the most messages is likely the customer.
    Bakery names containing 'heaven' or 'bite' are treated as the shop side.
    """
    bakery_keywords = ("heaven", "bite", "bakery", "shop")
    sender_counts: dict[str, int] = {}

    for msg in messages:
        sender_lower = msg.sender.lower()
        if any(keyword in sender_lower for keyword in bakery_keywords):
            continue
        sender_counts[msg.sender] = sender_counts.get(msg.sender, 0) + 1

    if not sender_counts:
        return None
    return max(sender_counts, key=sender_counts.get)
