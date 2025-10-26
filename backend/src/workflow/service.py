import uuid, os, asyncio
from rq import get_current_job
from typing import Dict, List, Optional, Union, Literal
from litellm import acompletion
import random
import src.lib.toolkit as toolkit
from urllib.parse import urljoin

# from src.content.service import ImageContent
from src.content.service import retrieve_image_url
from src.content.video_service import overlay_high_quality_text_on_video
from .models import (
    Captions,
    Queries,
    Workflow,
    Slide,
    Stories,
    Story,
    CarouselObject,
    Videos,
)
from .utils import (
    playwright_scrape,
    pil_from_url,
    pil_from_urls_with_fallback,
    format_image_for_social,
    overlay_text_on_image,
    wrap_sentence,
    get_random_jpg_path,
    get_pil_image,
    get_random_mp4_path,
    generate_caption_and_download,
)
from src.jobs.utils import sb_update_job
from src.core.config import settings

OUTPUT_DIR = settings.output_dir


async def llm_call(model, system_prompt, user_message, basemodel):
    resp = await acompletion(
        model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "result", "schema": basemodel.model_json_schema()},
        },
        reasoning_effort="low",
    )

    return basemodel.model_validate_json(resp.choices[0].message["content"])


def get_carousel_prompt(content_style: str = "personal story") -> Dict[str, str]:
    return {
        "master": open(f"prompts/carousels/{content_style}/master.txt").read(),
        # "slide": open(f"prompts/carousels/{content_style}/slide.txt").read(),
    }


def get_video_prompt(content_style: Literal["personal story"]) -> str:
    return open(f"prompts/videos/{content_style}/master.txt").read()


def get_user_message(business_context, generation_amount) -> str:
    "User message goes here"
    return f"Create engaing and viral content based on\n\n{business_context}\n\nGenerate {generation_amount} outputs."


def _process_carousel(payload):
    """Process carousel creation workflow"""
    job = get_current_job()

    business_context = payload["business_context"]
    content_format = payload["content_format"]
    generation_amount = payload["generation_amount"]

    prompts = get_carousel_prompt(content_format)

    stories: Stories = asyncio.run(
        llm_call(
            "openai/gpt-5-mini",
            prompts["master"],
            get_user_message(business_context, generation_amount),
            Stories,
        )
    )

    carouselObjects = []

    base_dir = os.path.join(OUTPUT_DIR, job.id if job else f"temp_{uuid.uuid1()}")
    os.makedirs(base_dir, exist_ok=True)

    for index, story in enumerate(stories.stories):
        carouselObject = {}
        carouselObject["title"] = story.title
        carouselObject["caption"] = story.desc
        carouselObject["generation"] = []
        job_dir = os.path.join(base_dir, str(index))
        os.makedirs(job_dir, exist_ok=True)
        for slide_index, slide in enumerate(story.slides):
            out_path = os.path.join(job_dir, f"{slide_index:02d}.jpeg")

            img_path = get_random_jpg_path(f"scraped-image/{slide.visuals}")
            toolkit.add_caption_to_image(
                source=img_path,
                out_path=out_path,
                output_size=(1080, 1920),
                caption=slide.caption,
                font_path=settings.font_path,
                background=None,
            )

            carouselObject["generation"].append(out_path)

        carouselObjects.append(carouselObject)

    return {"extra": stories.model_dump(), "content": carouselObjects}


def process_carousel(payload):
    try:
        job = get_current_job()
        sb_update_job(job.id, status="started", started_at="now()")

        carousel_results = _process_carousel(payload)

        sb_update_job(
            job.id,
            status="finished",
            finished_at="now()",
            result=carousel_results,
        )

        return carousel_results
    except Exception as e:
        sb_update_job(job.id, status="failed", finished_at="now()", error=str(e))
        raise


def _process_video(payload):
    job = get_current_job()

    business_context = payload["business_context"]
    content_format = payload["content_format"]
    generation_amount = payload["generation_amount"]

    prompt = get_video_prompt(content_format)

    videos: Videos = asyncio.run(
        llm_call(
            "openai/gpt-5-mini",
            prompt,
            get_user_message(business_context, generation_amount),
            Videos,
        )
    )

    videoObjects = []

    base_dir = os.path.join(OUTPUT_DIR, job.id if job else f"temp_{uuid.uuid1()}")
    os.makedirs(base_dir, exist_ok=True)
    for index, video in enumerate(videos.videos):
        out_path = os.path.join(base_dir, f"video_{index:02d}.mp4")

        videoObject = {}
        videoObject["title"] = video.title
        videoObject["caption"] = video.caption
        videoObject["generation"] = out_path

        base_video_path = get_random_mp4_path(f"scraped-video/{video.visuals}")

        toolkit.add_caption_to_video(
            source=base_video_path,
            out_path=out_path,
            output_size=(1080, 1920),
            caption=video.caption,
            font_path=settings.font_path,
            background=None,
            crf=25,
        )
        videoObjects.append(videoObject)

    return {"extra": videos.model_dump(), "content": videoObjects}


def process_video(payload):
    try:
        job = get_current_job()
        sb_update_job(job.id, status="started", started_at="now()")

        video_results = _process_video(payload)

        sb_update_job(
            job.id,
            status="finished",
            finished_at="now()",
            result=video_results,
        )

        return video_results
    except Exception as e:
        sb_update_job(job.id, status="failed", finished_at="now()", error=str(e))
        raise


if __name__ == "__main__":
    # sample_payload = {
    #     "business_context": "I run a small bakery in New York City that specializes in artisanal breads and pastries. We pride ourselves on using high-quality, locally sourced ingredients to create unique and delicious baked goods. Our target audience is food enthusiasts and locals who appreciate the art of baking and are looking for a cozy place to enjoy fresh bread and pastries.",
    #     "content_format": "personal-story",
    #     "generation_amount": 1,
    # }
    # # print(_process_carousel(sample_payload))
    # # print(_process_video(sample_payload))
    # print(_process_carousel(sample_payload))
    # print(get_carousel_prompt("personal-story"))
    pass
