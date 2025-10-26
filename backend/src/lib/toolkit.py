"""High-level entry points for captioning media."""

from __future__ import annotations

import os
import subprocess
from typing import Tuple

from .captioning.ffmpeg import build_ffmpeg_image_cmd, build_ffmpeg_video_cmd
from .captioning.io import download_to_temp, ffprobe_json
from .captioning.layout import (
    compute_layout,
    render_caption_png,
    wrap_and_autoscale_text,
)

__all__ = [
    "add_caption_to_image",
    "add_caption_to_video",
    "compute_layout",
    "wrap_and_autoscale_text",
    "render_caption_png",
    "build_ffmpeg_image_cmd",
    "build_ffmpeg_video_cmd",
    "download_to_temp",
    "ffprobe_json",
]


def add_caption_to_image(
    source: str,
    out_path: str,
    *,
    output_size: Tuple[int, int] = (1920, 1080),
    caption: str,
    font_path: str,
    placement: str = "center",
    size_preset: str = "medium",
    text_color: Tuple[int, int, int] = (255, 255, 255),
    stroke_color: Tuple[int, int, int] = (0, 0, 0),
    stroke_width_px: int = 5,
    background: str | None = "semi",
    background_opacity: float = 0,
    background_color: Tuple[int, int, int] | None = None,
    background_style: str = "box",
    background_padding_px: int = 20,
    padding_ratio: float = 0.06,
    debug: bool = False,
    background_line_gap_px: int = 0,
) -> None:
    """Load an image, add a caption, and save to ``out_path``."""

    layout = compute_layout(output_size, placement, padding_ratio)
    caption_box = layout["caption_box"]
    caption_layout = wrap_and_autoscale_text(
        caption,
        font_path,
        caption_box["w"],
        caption_box["h"],
        size_preset=size_preset,
    )
    caption_png = render_caption_png(
        caption_layout,
        font_path,
        caption_box,
        text_color=text_color,
        stroke_color=stroke_color,
        stroke_width_px=stroke_width_px,
        background=background,
        background_opacity=background_opacity,
        background_color=background_color,
        background_style=background_style,
        background_padding_px=background_padding_px,
        background_line_gap_px=background_line_gap_px,
        debug=debug,
    )

    temp_path: str | None = None
    try:
        temp_path = download_to_temp(source)
        cmd = build_ffmpeg_image_cmd(
            temp_path,
            out_path,
            canvas_w=layout["canvas_w"],
            canvas_h=layout["canvas_h"],
            caption_png=caption_png,
            caption_box=caption_box,
        )
        subprocess.run(
            cmd,
            check=True,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True,
            close_fds=True,
        )
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr or ""
        raise RuntimeError(f"ffmpeg failed: {stderr[-500:]}") from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
        if os.path.exists(caption_png):
            os.unlink(caption_png)


def add_caption_to_video(
    source: str,
    out_path: str,
    *,
    output_size: Tuple[int, int] = (1920, 1080),
    caption: str,
    font_path: str,
    placement: str = "center",
    size_preset: str = "medium",
    text_color: Tuple[int, int, int] = (255, 255, 255),
    stroke_color: Tuple[int, int, int] = (0, 0, 0),
    stroke_width_px: int = 5,
    background: str | None = "semi",
    background_opacity: float = 0,
    background_color: Tuple[int, int, int] | None = None,
    background_style: str = "box",
    background_padding_px: int = 20,
    background_line_gap_px: int = 0,
    padding_ratio: float = 0.06,
    crf: int = 18,
    preset: str = "medium",
    hw_accel: str | None = None,
    audio_copy: bool = False,
) -> None:
    """Load a video, add a caption overlay, and save to ``out_path``."""

    layout = compute_layout(output_size, placement, padding_ratio)
    caption_box = layout["caption_box"]
    caption_layout = wrap_and_autoscale_text(
        caption,
        font_path,
        caption_box["w"],
        caption_box["h"],
        size_preset=size_preset,
    )
    caption_png = render_caption_png(
        caption_layout,
        font_path,
        caption_box,
        text_color=text_color,
        stroke_color=stroke_color,
        stroke_width_px=stroke_width_px,
        background=background,
        background_opacity=background_opacity,
        background_color=background_color,
        background_style=background_style,
        background_padding_px=background_padding_px,
        background_line_gap_px=background_line_gap_px,
    )

    temp_path: str | None = None
    try:
        temp_path = download_to_temp(source)
        ffprobe_json(temp_path)
        cmd = build_ffmpeg_video_cmd(
            temp_path,
            out_path,
            canvas_w=layout["canvas_w"],
            canvas_h=layout["canvas_h"],
            caption_png=caption_png,
            caption_box=caption_box,
            crf=crf,
            preset=preset,
            hw_accel=hw_accel,
            audio_copy=audio_copy,
        )
        subprocess.run(
            cmd,
            check=True,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True,
            close_fds=True,
        )
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr or ""
        raise RuntimeError(f"ffmpeg failed: {stderr[-500:]}") from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
        if os.path.exists(caption_png):
            os.unlink(caption_png)
