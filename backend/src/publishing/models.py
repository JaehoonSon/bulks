from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Literal
from pydantic import BaseModel, Field, create_model


class PostStatus(str, Enum):
    draft = "draft"
    scheduled = "scheduled"
    queued = "queued"
    publishing = "publishing"
    published = "published"
    failed = "failed"
    canceled = "canceled"


class Channel(str, Enum):
    instagram = "instagram"
    tiktok = "tiktok"


class ChannelResult(BaseModel):
    state: PostStatus
    external_id: Optional[str] = None
    url: Optional[str] = None
    published_at: Optional[datetime] = None
    error: Optional[Any] = None


class Payload(BaseModel):
    visibility: Literal["PUBLIC"] = Field(..., example="PUBLIC")
    video_url: str = Field(..., example="http://example.com/video.mp4")
    title: str = Field(..., example="My Post")
    description: Optional[str] = Field(None, example="This is my post description.")


class PublishingPost(BaseModel):
    special_reference_id: Optional[str] = Field(None, example="special_reference_id")
    open_id: str = Field(..., example="open_id")
    # channels: List[Channel] = Field(..., example=["tiktok"])
    post_type: Literal["VIDEO", "CAROUSEL"] = Field(..., example="VIDEO")
    payload: Payload
    scheduled_at: Optional[datetime] = Field(
        None, example="2025-10-07T14:30:00Z", description="null => publish ASAP"
    )


class CarouselPayload(BaseModel):
    items: List[str] = Field(
        ..., example=["http://example.com/image1.jpg", "http://example.com/image2.jpg"]
    )
    visibility: Literal["PUBLIC"] = Field(..., example="PUBLIC")
    title: str = Field(..., example="My Carousel Post")
    description: Optional[str] = Field(None, example="This is a carousel post.")


class PublishingCarouselPost(BaseModel):
    special_reference_id: Optional[str] = Field(None, example="special_reference_id")
    open_id: str = Field(..., example="open_id")
    post_type: Literal["VIDEO", "CAROUSEL"] = Field(..., example="CAROUSEL")
    payload: CarouselPayload
    scheduled_at: Optional[datetime] = Field(
        None, example="2025-10-07T14:30:00Z", description="null => publish ASAP"
    )


class PublishNow(BaseModel):
    id: str = Field(..., example="post_id")
