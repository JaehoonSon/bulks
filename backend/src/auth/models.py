"""Pydantic models for TikTok auth routes."""

from pydantic import BaseModel


class PostRequest(BaseModel):
    open_id: str
    title: str
    video_url: str
    visibility: str = "PUBLIC"


class RelinkRequest(BaseModel):
    open_id: str
