from pydantic import BaseModel, Field
from typing import List, Literal


class Queries(BaseModel):
    queries: List[str]


class Captions(BaseModel):
    captions: List[str]


class Slide(BaseModel):
    caption: str = Field(
        ...,
    )
    visuals: Literal[
        "girl selfie", "surrealism", "computer setup", "healthy food", "gym guys"
    ] = Field(
        ...,
        description="Matching visuals based on the overall story and visuals. First few pictures should always be captivating",
    )


class Story(BaseModel):
    # story: str = Field(..., description="Full story for the reel")
    title: str = Field(
        ..., description="Short, bland and simple title for posting the reel"
    )
    desc: str = Field(..., description="Short, 3-7 word caption for the reel")
    slides: List[Slide] = Field(..., description="")


class Stories(BaseModel):
    stories: List[Story]


class Video(BaseModel):
    title: str = Field(
        ..., description="Short, bland and simple title for posting the reel"
    )
    desc: str = Field(..., description="Short, 3-7 word caption for the reel")
    caption: str = Field(..., description="Caption that will put on the video")
    visuals: Literal["girl", "gym guys"] = Field(
        ..., description="Matching visuals based on the overall story and visuals."
    )


class Videos(BaseModel):
    videos: List[Video]


class Workflow(BaseModel):
    slides: List[Slide]


class CarouselBusinessRequest(BaseModel):
    business_context: str = Field(alias="businessContext")
    number_of_slides: int = Field(alias="numberOfSlides")
    topic: str = Field(alias="topic")
    content_style: Literal["personal story"] = "personal story"


class PassiveVideoRequest(BaseModel):
    business_context: str = Field(alias="businessContext")
    number_of_videos: int = Field(alias="numberOfVideos")
    topic: str = Field(alias="topic")


class DefaultPayloadRequest(BaseModel):
    business_context: str = Field(alias="businessContext")
    content_format: Literal["personal-story", "personal-progress"] = Field(
        alias="contentFormat"
    )
    generation_amount: int = Field(alias="generationAmount")


class CarouselObject(BaseModel):
    title: str
    caption: str
    generation: List[str]
    public_generation: List[str]


class VideoObject(BaseModel):
    title: str
    caption: str
    generation: str
    public_generation: str


class JobOutput(BaseModel):
    extra: dict
    content: List[CarouselObject] | List[VideoObject]
