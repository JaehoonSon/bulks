"""Shared TikTok auth utilities."""

from __future__ import annotations

import base64
import hashlib
import secrets
from datetime import datetime, timezone
from typing import Any, Callable


def map_visibility(value: str) -> str:
    """Map a user supplied visibility string to a TikTok privacy level."""
    return "SELF_ONLY"  # TEMPORARY HARD-CODE FOR TESTING
    value = (value or "").upper()
    if value in ("PUBLIC", "PUBLIC_TO_EVERYONE"):
        return "PUBLIC_TO_EVERYONE"
    if value in ("FRIENDS", "MUTUAL_FOLLOW_FRIENDS"):
        return "MUTUAL_FOLLOW_FRIENDS"
    if value in ("PRIVATE", "SELF_ONLY"):
        return "SELF_ONLY"
    return "PUBLIC_TO_EVERYONE"


def pkce_pair() -> tuple[str, str]:
    """Return a PKCE verifier/challenge pair."""
    verifier = secrets.token_urlsafe(64)[:64]
    challenge = (
        base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest())
        .rstrip(b"=")
        .decode()
    )
    return verifier, challenge


def utcnow() -> datetime:
    """Return the current UTC timestamp with timezone info."""
    return datetime.now(timezone.utc)


def parse_ts(timestamp: str) -> datetime:
    """Parse an ISO formatted timestamp into a timezone-aware datetime."""
    return datetime.fromisoformat(timestamp.replace("Z", "+00:00"))


def coerce_number(value: Any, caster: Callable[[Any], Any]) -> Any:
    """Safely cast a value to an ``int`` or ``float``."""
    if value is None:
        return caster()
    if isinstance(value, (int, float)):
        return caster(value)
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return caster()
        try:
            if caster is int:
                return caster(float(stripped))
            return caster(stripped)
        except (TypeError, ValueError):
            return caster()
    try:
        return caster(value)
    except (TypeError, ValueError):
        return caster()


def coerce_timestamp(value: Any) -> datetime | None:
    """Normalize a variety of timestamp representations."""
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(value, tz=timezone.utc)
        except (OverflowError, OSError, ValueError):
            return None
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return None
        try:
            return parse_ts(stripped)
        except ValueError:
            try:
                return datetime.fromisoformat(stripped)
            except ValueError:
                return None
    return None


def analytics_row_sort_key(row: dict[str, Any]) -> datetime:
    """Return a safe sort key for analytics rows."""
    collected = row.get("_collected_at_dt")
    if isinstance(collected, datetime):
        return collected
    return datetime.min.replace(tzinfo=timezone.utc)


def safe_divide(numerator: float, denominator: float) -> float:
    """Return ``numerator / denominator`` guarding against zero division."""
    if not denominator:
        return 0.0
    return numerator / denominator


__all__ = [
    "analytics_row_sort_key",
    "coerce_number",
    "coerce_timestamp",
    "map_visibility",
    "parse_ts",
    "pkce_pair",
    "safe_divide",
    "utcnow",
]
