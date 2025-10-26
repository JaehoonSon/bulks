"""Business logic for TikTok auth routes."""

from __future__ import annotations

import asyncio
import logging
import os
from collections import defaultdict
from datetime import timedelta
from typing import Any, Dict, Iterable, List, Optional, Tuple

import httpx
from fastapi import FastAPI, HTTPException

from src.auth.models import PostRequest, RelinkRequest
from src.auth.utils import (
    analytics_row_sort_key,
    coerce_number,
    coerce_timestamp,
    map_visibility,
    parse_ts,
    pkce_pair,
    safe_divide,
    utcnow,
)

logger = logging.getLogger(__name__)

AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/"
TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"
POST_VIDEO_INIT = "https://open.tiktokapis.com/v2/post/publish/video/init/"
POST_CAROUSEL_INIT = "https://open.tiktokapis.com/v2/post/publish/content/init/"
CREATOR_Q = "https://open.tiktokapis.com/v2/post/publish/creator_info/query/"
VIDEO_QUERY = "https://open.tiktokapis.com/v2/video/query/"
ANALYTICS_TABLE = os.getenv("TIKTOK_ANALYTICS_TABLE", "tiktok_publish_analytics")

SCOPES = "user.info.basic,video.publish"
CLIENT_KEY = os.environ["TIKTOK_CLIENT_KEY"]
CLIENT_SECRET = os.environ["TIKTOK_CLIENT_SECRET"]
REDIRECT_URI = os.environ["TIKTOK_REDIRECT_URI"]

REFRESH_MARGIN_SECONDS = int(os.getenv("TIKTOK_TOKEN_REFRESH_MARGIN_SECONDS", "21600"))
REFRESH_INTERVAL_SECONDS = int(
    os.getenv("TIKTOK_TOKEN_REFRESH_INTERVAL_SECONDS", "3600")
)

_METRIC_FIELD_ALIASES: Dict[str, Tuple[str, type]] = {
    "view_count": ("views", int),
    "views": ("views", int),
    "like_count": ("likes", int),
    "likes": ("likes", int),
    "comment_count": ("comments", int),
    "comments": ("comments", int),
    "share_count": ("shares", int),
    "shares": ("shares", int),
    "favorite_count": ("favorites", int),
    "favorites": ("favorites", int),
    "reach": ("reach", int),
    "reach_count": ("reach", int),
    "watch_time": ("watch_time_seconds", float),
    "watch_time_seconds": ("watch_time_seconds", float),
    "average_watch_time": ("average_watch_time_seconds", float),
    "average_watch_time_seconds": ("average_watch_time_seconds", float),
    "completion_rate": ("completion_rate", float),
}

_AGGREGATABLE_METRICS = {
    "views",
    "likes",
    "comments",
    "shares",
    "favorites",
    "reach",
    "watch_time_seconds",
}

_GROWTH_METRICS = {"views", "likes", "comments", "shares", "favorites", "reach"}

_TIMESERIES_METRICS = _AGGREGATABLE_METRICS | {
    "average_watch_time_seconds",
    "completion_rate",
}

_ENGAGEMENT_COMPONENTS = ("likes", "comments", "shares", "favorites")


def get_account_row(supabase, user_id: str, open_id: str) -> Dict[str, Any]:
    res = (
        supabase.table("tiktok_accounts")
        .select("*")
        .eq("user_id", user_id)
        .eq("open_id", open_id)
        .limit(1)
        .execute()
    )
    rows = res.data or []
    if not rows:
        raise HTTPException(404, "account not linked")
    return rows[0]


def _normalize_metric_row(row: Dict[str, Any]) -> Dict[str, Any]:
    metrics: Dict[str, Any] = {}
    for raw_key, (alias, caster) in _METRIC_FIELD_ALIASES.items():
        if raw_key not in row or row[raw_key] is None:
            continue
        metrics[alias] = coerce_number(row[raw_key], caster)

    alias_casts = {
        alias: caster for alias, (_, caster) in _METRIC_FIELD_ALIASES.items()
    }
    for alias, caster in alias_casts.items():
        if alias in row and alias not in metrics and row[alias] is not None:
            metrics[alias] = coerce_number(row[alias], caster)

    collected_at = coerce_timestamp(
        row.get("collected_at")
        or row.get("timestamp")
        or row.get("created_at")
        or row.get("updated_at")
    )

    return {
        "metrics": metrics,
        "collected_at": collected_at.isoformat() if collected_at else None,
        "_collected_at_dt": collected_at,
        "publish_id": row.get("publish_id"),
        "open_id": row.get("open_id"),
    }


def _aggregate_metrics(rows: Iterable[Dict[str, Any]]) -> Dict[str, Any]:
    totals: Dict[str, Any] = {metric: 0 for metric in _AGGREGATABLE_METRICS}
    for row in rows:
        metrics = row.get("metrics", {})
        for metric in _AGGREGATABLE_METRICS:
            if metric in metrics:
                totals[metric] += metrics[metric]
    return {metric: value for metric, value in totals.items() if value}


def _latest_snapshot(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not rows:
        raise HTTPException(404, "analytics not found")
    return max(rows, key=analytics_row_sort_key)


def _compute_engagement_rate(metrics: Dict[str, Any]) -> float:
    views = metrics.get("views") or 0
    numerator = sum(metrics.get(metric, 0) for metric in _ENGAGEMENT_COMPONENTS)
    return safe_divide(numerator, views)


def _compute_growth(
    rows: List[Dict[str, Any]], metric: str
) -> Optional[Dict[str, float]]:
    values = [
        row["metrics"].get(metric) for row in rows if metric in row.get("metrics", {})
    ]
    if len(values) < 2:
        return None
    start, end = values[0], values[-1]
    absolute = end - start
    relative = safe_divide(absolute, start) if start else None
    payload: Dict[str, float] = {"absolute": absolute}
    if relative is not None:
        payload["relative"] = relative
    return payload


def _build_timeseries(rows: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    series: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    ordered = sorted(rows, key=analytics_row_sort_key)
    for row in ordered:
        ts = row.get("collected_at")
        if not ts:
            continue
        for metric, value in row.get("metrics", {}).items():
            if metric in _TIMESERIES_METRICS:
                series[metric].append({"collected_at": ts, "value": value})
    return {metric: values for metric, values in series.items() if values}


def _fetch_analytics_rows(
    supabase, user_id: str, publish_id: str, open_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    query = (
        supabase.table(ANALYTICS_TABLE)
        .select("*")
        .eq("user_id", user_id)
        .eq("publish_id", publish_id)
    )
    if open_id:
        query = query.eq("open_id", open_id)
    res = query.execute()
    raw_rows = res.data or []
    normalized = [_normalize_metric_row(row) for row in raw_rows]
    normalized = [row for row in normalized if row.get("metrics")]
    if not normalized:
        raise HTTPException(404, "analytics not found")
    return normalized


# def _get_analytics(
#     supabase, user_id: str, publish_id: str, open_id: Optional[str] = None
# ) -> Dict[str, Any]:
#     rows = _fetch_analytics_rows(supabase, user_id, publish_id, open_id=open_id)
#     latest = _latest_snapshot(rows)
#     totals = _aggregate_metrics(rows)
#     growth = {
#         metric: payload
#         for metric in _GROWTH_METRICS
#         if (payload := _compute_growth(rows, metric)) is not None
#     }
#     timeseries = _build_timeseries(rows)
#     first = min(rows, key=analytics_row_sort_key)

#     summary = {
#         "publish_id": publish_id,
#         "latest": latest["metrics"],
#         "totals": totals,
#         "growth": growth,
#         "engagement_rate": _compute_engagement_rate(latest["metrics"]),
#     }
#     if "average_watch_time_seconds" in latest["metrics"]:
#         summary["average_watch_time_seconds"] = latest["metrics"][
#             "average_watch_time_seconds"
#         ]
#     if "completion_rate" in latest["metrics"]:
#         summary["completion_rate"] = latest["metrics"]["completion_rate"]

#     return {
#         "publish_id": publish_id,
#         "summary": summary,
#         "timeseries": timeseries,
#         "sample_size": len(rows),
#         "first_collected_at": first.get("collected_at"),
#         "last_collected_at": latest.get("collected_at"),
#     }


# def get_publish_analytics(
#     supabase, user_id: str, publish_id: str, open_id: Optional[str] = None
# ) -> Dict[str, Any]:
#     if open_id:
#         get_account_row(supabase, user_id, open_id)
#     return _get_analytics(supabase, user_id, publish_id, open_id=open_id)


async def _get_analytics(
    supabase, user_id: str, publish_id: str, open_id: Optional[str] = None
) -> Dict[str, Any]:
    """Fetch a fresh analytics snapshot from TikTok Display API for a given publish_id.

    Notes:
    - Does NOT read analytics from Supabase; only uses Supabase to retrieve/refresh tokens.
    - Requires open_id to acquire the correct user access token.
    """
    if not open_id:
        raise HTTPException(400, "open_id is required")

    # Ensure the account exists and get current tokens
    account = get_account_row(supabase, user_id, open_id)

    # Acquire a fresh access token using the existing helper
    try:
        token = await ensure_fresh_access(supabase, user_id, open_id)
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to ensure TikTok access token")
        raise HTTPException(500, "failed to acquire access token")

    # Query TikTok Display API for the specific video id (publish_id)
    # We request common fields; if metrics exist (e.g., statistics), we'll normalize them.
    query_params = httpx.QueryParams(
        {
            # Ask for a broad set; API will ignore unsupported fields
            "fields": "id,title,create_time,duration,cover_image_url,embed_link,share_url,statistics,stats,view_count,like_count,comment_count,share_count,favorite_count",
        }
    )
    body = {
        "filters": {
            "video_ids": [publish_id],
        }
    }

    with httpx.Client(timeout=30) as client:
        r = client.post(
            f"{VIDEO_QUERY}?{query_params}",
            json=body,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json; charset=UTF-8",
            },
        )

    if r.status_code != 200:
        # bubble upstream error body for easier debugging
        raise HTTPException(r.status_code, r.text)

    data = r.json() or {}
    videos = (data.get("data") or {}).get("videos") or []
    if not videos:
        raise HTTPException(404, "analytics not found")

    video = videos[0]

    # Flatten potential metrics from various known containers
    raw_row: Dict[str, Any] = {
        "publish_id": publish_id,
        "open_id": open_id,
        "collected_at": utcnow().isoformat(),
    }
    # Direct top-level metrics if any
    for key in (
        "view_count",
        "like_count",
        "comment_count",
        "share_count",
        "favorite_count",
        "reach",
        "reach_count",
        "watch_time",
        "watch_time_seconds",
        "average_watch_time",
        "average_watch_time_seconds",
        "completion_rate",
    ):
        if key in video:
            raw_row[key] = video.get(key)

    # Known containers that may hold metrics
    for container_key in ("statistics", "stats"):
        stats = video.get(container_key)
        if isinstance(stats, dict):
            for k, v in stats.items():
                if v is not None:
                    raw_row[k] = v

    # Normalize to internal shape
    rows = [_normalize_metric_row(raw_row)]
    latest = _latest_snapshot(rows)
    totals = _aggregate_metrics(rows)
    growth = {
        metric: payload
        for metric in _GROWTH_METRICS
        if (payload := _compute_growth(rows, metric)) is not None
    }
    timeseries = _build_timeseries(rows)
    first = min(rows, key=analytics_row_sort_key)

    summary: Dict[str, Any] = {
        "publish_id": publish_id,
        "latest": latest["metrics"],
        "totals": totals,
        "growth": growth,
        "engagement_rate": _compute_engagement_rate(latest["metrics"]),
    }
    if "average_watch_time_seconds" in latest["metrics"]:
        summary["average_watch_time_seconds"] = latest["metrics"][
            "average_watch_time_seconds"
        ]
    if "completion_rate" in latest["metrics"]:
        summary["completion_rate"] = latest["metrics"]["completion_rate"]

    return {
        "publish_id": publish_id,
        "summary": summary,
        "timeseries": timeseries,
        "sample_size": len(rows),
        "first_collected_at": first.get("collected_at"),
        "last_collected_at": latest.get("collected_at"),
    }


async def get_publish_analytics(supabase, user_id: str, publish_id: str, open_id):

    return await _get_analytics(supabase, user_id, publish_id, open_id)


def create_authorize_payload(state: str, supabase) -> Dict[str, Any]:
    verifier, challenge = pkce_pair()
    supabase.table("tiktok_pkce_states").upsert(
        {"state": state, "user_id": state, "code_verifier": verifier}
    ).execute()
    qs = httpx.QueryParams(
        {
            "client_key": CLIENT_KEY,
            "scope": SCOPES,
            "response_type": "code",
            "redirect_uri": REDIRECT_URI,
            "state": state,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
        }
    )
    return {"authorize_url": f"{AUTH_URL}?{qs}"}


def list_accounts(supabase, user_id: str) -> List[Dict[str, Any]]:
    res = (
        supabase.table("tiktok_accounts")
        .select("open_id,scope,expires_at")
        .eq("user_id", user_id)
        .execute()
    )
    return res.data or []


async def complete_callback(
    supabase, *, code: str, state: str
) -> Tuple[Dict[str, Any], int]:
    rec = (
        supabase.table("tiktok_pkce_states")
        .select("code_verifier,expires_at")
        .eq("state", state)
        .eq("user_id", state)
        .single()
        .execute()
        .data
    )
    if not rec:
        return {"error": "invalid/expired state"}, 400

    if parse_ts(rec["expires_at"]) <= utcnow():
        supabase.table("tiktok_pkce_states").delete().eq("state", state).eq(
            "user_id", state
        ).execute()
        return {"error": "invalid/expired state"}, 400

    code_verifier = rec["code_verifier"]
    supabase.table("tiktok_pkce_states").delete().eq("state", state).eq(
        "user_id", state
    ).execute()

    data = {
        "client_key": CLIENT_KEY,
        "client_secret": CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "code_verifier": code_verifier,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            TOKEN_URL,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if resp.status_code != 200:
        return resp.json(), resp.status_code

    tok = resp.json()
    updates = {
        "user_id": state,
        "open_id": tok["open_id"],
        "scope": tok.get("scope", ""),
        **_token_update_fields(tok),
    }

    supabase.table("tiktok_accounts").upsert(
        updates,
        on_conflict="user_id,open_id",
    ).execute()

    return {"linked": True, "open_id": tok["open_id"], "scope": tok.get("scope")}, 200


def _token_update_fields(
    tok: Dict[str, Any], *, fallback_refresh: Optional[str] = None
) -> Dict[str, Any]:
    expires_at = (utcnow() + timedelta(seconds=int(tok["expires_in"]))).isoformat()
    refresh_token = tok.get("refresh_token") or fallback_refresh
    updates: Dict[str, Any] = {
        "access_token": tok["access_token"],
        "expires_at": expires_at,
    }
    if refresh_token:
        updates["refresh_token"] = refresh_token
    refresh_expires_in = tok.get("refresh_token_expires_in")
    if refresh_expires_in is None:
        refresh_expires_in = tok.get("refresh_expires_in")
    if refresh_expires_in is not None:
        updates["refresh_expires_at"] = (
            utcnow() + timedelta(seconds=int(refresh_expires_in))
        ).isoformat()
    return updates


async def _request_token_refresh(
    refresh_token: str, client: Optional[httpx.AsyncClient] = None
) -> Dict[str, Any]:
    owns_client = client is None
    if owns_client:
        client = httpx.AsyncClient(timeout=30)
    try:
        response = await client.post(
            TOKEN_URL,
            data={
                "client_key": CLIENT_KEY,
                "client_secret": CLIENT_SECRET,
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    finally:
        if owns_client:
            await client.aclose()

    if response.status_code != 200:
        raise HTTPException(response.status_code, response.text)

    return response.json()


async def ensure_fresh_access(supabase, user_id: str, open_id: str) -> str:
    logger.debug(
        "Ensuring fresh access token", extra={"user_id": user_id, "open_id": open_id}
    )
    record = get_account_row(supabase, user_id, open_id)
    expires_at = parse_ts(record["expires_at"])
    if expires_at > utcnow() + timedelta(seconds=60):
        return record["access_token"]

    payload = await _request_token_refresh(record["refresh_token"])
    updates = _token_update_fields(payload, fallback_refresh=record["refresh_token"])

    supabase.table("tiktok_accounts").update(updates).eq("user_id", user_id).eq(
        "open_id", open_id
    ).execute()

    return updates["access_token"]


async def refresh_due_accounts(supabase) -> None:
    threshold = (utcnow() + timedelta(seconds=REFRESH_MARGIN_SECONDS)).isoformat()
    accounts = (
        supabase.table("tiktok_accounts")
        .select("user_id,open_id,refresh_token,refresh_expires_at,expires_at")
        .lte("expires_at", threshold)
        .execute()
        .data
        or []
    )
    if not accounts:
        return

    async with httpx.AsyncClient(timeout=30) as client:
        for account in accounts:
            refresh_expires_at = account.get("refresh_expires_at")
            if refresh_expires_at and parse_ts(refresh_expires_at) <= utcnow():
                logger.warning(
                    "Skipping TikTok token refresh because refresh token expired",
                    extra={
                        "user_id": account["user_id"],
                        "open_id": account["open_id"],
                    },
                )
                continue

            try:
                payload = await _request_token_refresh(
                    account["refresh_token"], client=client
                )
            except HTTPException as exc:
                logger.warning(
                    "Failed to refresh TikTok token",
                    extra={
                        "user_id": account["user_id"],
                        "open_id": account["open_id"],
                        "status_code": exc.status_code,
                    },
                )
                continue
            except Exception:
                logger.exception(
                    "Unexpected error refreshing TikTok token",
                    extra={
                        "user_id": account["user_id"],
                        "open_id": account["open_id"],
                    },
                )
                continue

            updates = _token_update_fields(
                payload, fallback_refresh=account["refresh_token"]
            )
            supabase.table("tiktok_accounts").update(updates).eq(
                "user_id", account["user_id"]
            ).eq("open_id", account["open_id"]).execute()


async def tiktok_refresh_daemon(app: FastAPI, stop_event: asyncio.Event) -> None:
    interval = max(30, REFRESH_INTERVAL_SECONDS)
    supabase = app.state.supabase

    while not stop_event.is_set():
        logger.info("Running TikTok token refresh check...")
        try:
            await refresh_due_accounts(supabase)
        except Exception:  # pragma: no cover - defensive logging
            logger.exception("Error while refreshing TikTok tokens")

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=interval)
        except asyncio.TimeoutError:
            continue


async def fetch_profile(supabase, user_id: str, open_id: str) -> Dict[str, Any]:
    token = await ensure_fresh_access(supabase, user_id, open_id)
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            CREATOR_Q,
            json={},
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json; charset=UTF-8",
            },
        )

    if response.status_code != 200:
        raise HTTPException(response.status_code, response.text)

    payload = response.json()
    data = payload.get("data") or {}
    handle = data.get("creator_nickname")
    avatar = data.get("creator_avatar_url")

    supabase.table("tiktok_accounts").update(
        {"handle": handle, "avatar_url": avatar}
    ).eq("user_id", user_id).eq("open_id", open_id).execute()

    return payload


async def publish_post(supabase, user_id: str, request: PostRequest) -> Dict[str, Any]:
    token = await ensure_fresh_access(supabase, user_id, request.open_id)
    payload = {
        "post_info": {
            "title": request.title,
            "privacy_level": map_visibility(request.visibility),
        },
        "source_info": {"source": "PULL_FROM_URL", "video_url": request.video_url},
        "post_mode": "DIRECT_POST",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            POST_VIDEO_INIT,
            json=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json; charset=UTF-8",
            },
        )

    if response.status_code != 200:
        raise HTTPException(response.status_code, response.text)

    return response.json()


def unlink_account(supabase, user_id: str, open_id: str) -> Dict[str, Any]:
    supabase.table("tiktok_accounts").delete().eq("user_id", user_id).eq(
        "open_id", open_id
    ).execute()
    return {"unlinked": True}


def create_relink_payload(
    supabase, user_id: str, request: RelinkRequest
) -> Dict[str, Any]:
    get_account_row(supabase, user_id, request.open_id)
    payload = create_authorize_payload(user_id, supabase)
    payload["open_id"] = request.open_id
    return payload
