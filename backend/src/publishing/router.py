from urllib import response
from fastapi import APIRouter, Depends, Body, HTTPException, status, Response
from rq import Queue, Retry
from typing import Union

from src.core.logging_config import logger
from src.core.supabase import supabase_dependency
from src.auth.models import PostRequest
from src.core.user import get_user
from .service import (
    schedule_post_to_supabase,
    update_post_in_supabase,
    publish_post,
    check_post_status,
)
from .models import (
    PublishingPost,
    PostStatus,
    Channel,
    ChannelResult,
    PublishNow,
    PublishingCarouselPost,
)

router = APIRouter()


@router.post("/schedule")
async def schedule_post(
    publishing_post: Union[PublishingPost, PublishingCarouselPost],
    user=Depends(get_user),
    supabase=Depends(supabase_dependency),
):
    await schedule_post_to_supabase(supabase, user, publishing_post)
    return publishing_post


@router.put("/reschedule/{post_id}")
async def reschedule_post(
    post_id: str,
    updated_post: Union[PublishingPost, PublishingCarouselPost],
    user=Depends(get_user),
    supabase=Depends(supabase_dependency),
):
    await update_post_in_supabase(supabase, user, post_id, updated_post)
    return Response(status_code=status.HTTP_200_OK)


@router.post("/publish")
async def publish_now(
    publish: PublishNow, user=Depends(get_user), supabase=Depends(supabase_dependency)
):
    print("HELLO")
    logger.debug("publish_now called with id=%s", publish.id)
    data = await publish_post(supabase, user, publish.id)
    return data
