from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from redis import Redis
from rq.job import Job, NoSuchJobError

from supabase import Client
from src.core.supabase import supabase_dependency
from src.core.redis import redis_dependency
from src.workflow.router import router as workflow_router
from src.auth.router import router as auth_router
from src.publishing.router import router as publishing_router


class ErrorResponse(BaseModel):
    detail: str


api_router = APIRouter(
    default_response_class=JSONResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)

unauthenticated_api_router = APIRouter()
authenticated_api_router = APIRouter()

unauthenticated_api_router.include_router(
    workflow_router, prefix="/workflow", tags=["workflow"]
)
unauthenticated_api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
unauthenticated_api_router.include_router(
    publishing_router, prefix="/publishing", tags=["publishing"]
)


@api_router.get("/healthcheck", include_in_schema=False)
def healthcheck():
    """Simple healthcheck endpoint."""
    return {"status": "ok"}


@api_router.get("/jobs/{job_id}")
def job_status(
    job_id: str,
    redis: Redis = Depends(redis_dependency),
    supabase: Client = Depends(supabase_dependency),
):
    # Try RQ/Redis
    try:
        job = Job.fetch(job_id, connection=redis)
        return {
            "id": job.id,
            "status": job.get_status(),
            "result": job.result if job.is_finished else None,
            "error": job.exc_info if job.is_failed else None,
        }
    except NoSuchJobError:
        pass

    # Fallback: Supabase
    try:
        resp = (
            supabase.table("jobs")
            .select("id,status,result,error")
            .eq("id", job_id)
            .single()
            .execute()
        )
    except Exception:
        # Supabase client raises when .single() finds no row or on RPC error
        raise HTTPException(status_code=404, detail="Job not found")

    row = resp.data
    if not row:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "id": row["id"],
        "status": row.get("status"),
        "result": row.get("result"),  # jsonb -> dict/list
        "error": row.get("error"),  # jsonb -> dict/list
    }


api_router.include_router(unauthenticated_api_router)

api_router.include_router(authenticated_api_router)
