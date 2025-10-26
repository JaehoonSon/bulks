from fastapi import APIRouter, Depends, Body, HTTPException, status
from rq import Queue, Retry

from .models import (
    Workflow,
    CarouselBusinessRequest,
    PassiveVideoRequest,
    DefaultPayloadRequest,
)
from src.core.redis import redis_dependency, queue_dependency
from src.core.user import get_user

# from .service import workflow_from_business, process_passive_video, test_workflow
from .service import process_carousel, process_video
from src.jobs.utils import sb_get_job, sb_insert_job

router = APIRouter()


@router.post("/carousel")
async def carousel(
    req: DefaultPayloadRequest,
    user=Depends(get_user),
    queue: Queue = Depends(queue_dependency),
):
    job = queue.enqueue(process_carousel, req.model_dump())
    job_row = {
        "user_id": user["sub"],
        "id": job.id,
        "status": job.get_status(),
        "job_type": "CAROUSEL",
        "payload": req.model_dump(),
    }

    sb_insert_job(job_row)
    return {"id": job.id, "status": job.get_status()}


@router.post("/video")
async def video(
    req: DefaultPayloadRequest,
    user=Depends(get_user),
    queue: Queue = Depends(queue_dependency),
):
    job = queue.enqueue(process_video, req.model_dump())
    job_row = {
        "user_id": user["sub"],
        "id": job.id,
        "status": job.get_status(),
        "job_type": "VIDEO",
        "payload": req.model_dump(),
    }

    sb_insert_job(job_row)
    return {"id": job.id, "status": job.get_status()}
