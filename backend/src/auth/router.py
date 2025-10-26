from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from src.core.supabase import supabase_dependency
from src.core.user import get_user

from .models import PostRequest, RelinkRequest
from .service import (
    complete_callback,
    create_authorize_payload,
    create_relink_payload,
    fetch_profile,
    get_publish_analytics,
    list_accounts,
    publish_post,
    unlink_account,
)

router = APIRouter()


@router.get("/tiktok/start")
async def tiktok_start(user=Depends(get_user), supabase=Depends(supabase_dependency)):
    payload = create_authorize_payload(user["sub"], supabase)
    return JSONResponse(payload)


@router.get("/tiktok/callback")
async def tiktok_callback(code: str, state: str, supabase=Depends(supabase_dependency)):
    payload, status_code = await complete_callback(supabase, code=code, state=state)
    return JSONResponse(payload, status_code=status_code)


@router.get("/tiktok/accounts")
async def tiktok_accounts(
    user=Depends(get_user), supabase=Depends(supabase_dependency)
):
    return {"accounts": list_accounts(supabase, user["sub"])}


@router.get("/tiktok/profile")
async def tiktok_profile(
    open_id: str, user=Depends(get_user), supabase=Depends(supabase_dependency)
):
    return await fetch_profile(supabase, user["sub"], open_id)


@router.get("/tiktok/analytics")
async def tiktok_get_analytics(
    publish_id: str,
    open_id: str | None = None,
    user=Depends(get_user),
    supabase=Depends(supabase_dependency),
):
    return await get_publish_analytics(
        supabase,
        user["sub"],
        publish_id,
        open_id=open_id,
    )


@router.post("/tiktok/post")
async def tiktok_post(
    body: PostRequest,
    user=Depends(get_user),
    supabase=Depends(supabase_dependency),
):
    return await publish_post(supabase, user["sub"], body)


@router.delete("/tiktok/unlink")
async def tiktok_unlink(
    open_id: str, user=Depends(get_user), supabase=Depends(supabase_dependency)
):
    return unlink_account(supabase, user["sub"], open_id)


@router.post("/tiktok/relink")
async def tiktok_relink(
    body: RelinkRequest,
    user=Depends(get_user),
    supabase=Depends(supabase_dependency),
):
    payload = create_relink_payload(supabase, user["sub"], body)
    return JSONResponse(payload)
