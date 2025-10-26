from fastapi import FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
import httpx, asyncio
from datetime import datetime
from typing import Union
from postgrest.exceptions import APIError
from supabase import Client

from src.auth.service import (
    POST_VIDEO_INIT,
    POST_CAROUSEL_INIT,
    ensure_fresh_access,
    map_visibility,
)
from .models import PublishingCarouselPost, PublishingPost, PostStatus
from src.core.logging_config import logger
from src.auth.utils import utcnow


async def update_post_in_supabase(
    supabase: Client,
    user,
    post_id: str,
    publishing_post: Union[PublishingPost, PublishingCarouselPost],
):
    user_id = user["sub"]
    supabase.table("publishing").update(jsonable_encoder(publishing_post)).eq(
        "id", post_id
    ).eq("user_id", user_id).execute()


async def schedule_post_to_supabase(
    supabase: Client,
    user,
    publishing_post: Union[PublishingPost, PublishingCarouselPost],
):
    user_id = user["sub"]

    data = {
        "user_id": user_id,
        "special_reference_id": publishing_post.special_reference_id,
        "open_id": publishing_post.open_id,
        "scheduled_at": publishing_post.scheduled_at,
        "channel": "tiktok",
        "post_type": publishing_post.post_type,
        "payload": publishing_post.payload,
    }

    try:
        supabase.table("publishing").insert(jsonable_encoder(data)).execute()
    except APIError as e:
        if e.code == "23505":  # unique constraint violation
            raise HTTPException(status_code=400, detail="This is already published")
        raise


async def check_post_status(supabase, user, id):
    user_id = user["sub"]
    try:
        data = (
            supabase.table("publishing")
            .select("open_id,result")
            .eq("id", id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
    except APIError as e:
        if e.code == "PGRST116":
            raise ValueError(f"No publishing record found for id={id} user={user_id}")
        raise

    publish_id = data.data["result"]["data"]["publish_id"]
    open_id = data.data["open_id"]
    token = await ensure_fresh_access(supabase, user_id, open_id)
    payload = {"publish_id": publish_id}
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(
            "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json; charset=UTF-8",
            },
            json=payload,
        )
    if r.status_code != 200:
        raise RuntimeError(f"TikTok API error {r.status_code}: {r.text}")

    resp = r.json()
    return resp


async def _publish_post(supabase, user, id):
    user_id = user["sub"]
    try:
        data = (
            supabase.table("publishing")
            .select("*")
            .eq("id", id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
    except APIError as e:
        if e.code == "PGRST116":
            raise ValueError(f"No publishing record found for id={id} user={user_id}")
        raise

    open_id = data.data["open_id"]
    title = data.data["payload"]["title"]
    visibility = data.data["payload"]["visibility"]
    status = data.data["status"]

    isVideo = data.data["post_type"] == "VIDEO"

    if status == PostStatus.published:
        raise HTTPException(status_code=400, detail="Post has already been published")

    token = await ensure_fresh_access(supabase, user_id, open_id)

    if isVideo:
        video_url = data.data["payload"]["video_url"]
        payload = {
            "post_info": {
                "title": title,
                "privacy_level": map_visibility(visibility),
                # optional toggles if you want:
                # "disable_comment": False, "disable_duet": False, "disable_stitch": False
            },
            "source_info": {"source": "PULL_FROM_URL", "video_url": video_url},
            "post_mode": "DIRECT_POST",
        }
    else:
        description = data.data["payload"].get("description", "")
        images = data.data["payload"].get("items", [])
        payload = {
            "media_type": "PHOTO",
            "post_mode": "DIRECT_POST",
            "post_info": {
                "title": title,
                "description": description,
                "privacy_level": map_visibility(visibility),
                "disable_comment": False,
                "auto_add_music": True,
            },
            "source_info": {
                "source": "PULL_FROM_URL",
                "photo_images": images,
                "photo_cover_index": 0,
            },
        }

    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(
            POST_VIDEO_INIT if isVideo else POST_CAROUSEL_INIT,
            json=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json; charset=UTF-8",
            },
        )

    if r.status_code != 200:
        # logger.info("tiktok missed")
        logger.error(r.text)
        raise HTTPException(r.status_code, "Failed to publish to TikTok")

    result = r.json()

    supabase.table("publishing").update(
        {
            "result": result,
            "status": PostStatus.published,
            "published_at": utcnow().isoformat(),
        }
    ).eq("id", id).eq("user_id", user_id).execute()

    return result


async def publish_post(supabase, user, id):
    try:
        return await _publish_post(supabase, user, id)
    except Exception as e:
        logger.error("Failed to publish post: %s", str(e))
        supabase.table("publishing").update(
            {"status": PostStatus.failed, "error": str(e)}
        ).eq("id", id).eq("user_id", user["sub"]).execute()
        raise


async def publish_due_posts(supabase):
    posts = (
        supabase.table("publishing")
        .select("*")
        .lte("scheduled_at", utcnow())
        .eq("status", "scheduled")
        .execute()
        .data
        or []
    )

    coros = [publish_post(supabase, {"sub": p["user_id"]}, p["id"]) for p in posts]
    results = await asyncio.gather(*coros, return_exceptions=True)

    success = 0
    failed = 0

    for p, r in zip(posts, results):
        if isinstance(r, Exception):
            success += 1
            logger.error(f"publish failed user={p['user_id']} post={p['id']}: {r}")
        else:
            failed += 1
            logger.info(f"publish ok user={p['user_id']} post={p['id']}")

    logger.info(f"publish summary: success={success} failed={failed}")


async def publish_scheduler_daemon(app: FastAPI, stop_event: asyncio.Event) -> None:
    interval = max(10, 6000)
    supabase = app.state.supabase

    while not stop_event.is_set():
        logger.info("Checking for due scheduled posts...")
        try:
            await publish_due_posts(supabase)
        except Exception:
            logger.exception("Error while processing scheduled posts")

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=interval)
        except asyncio.TimeoutError:
            continue
