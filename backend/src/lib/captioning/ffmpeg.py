"""ffmpeg command builders for caption overlays."""
from __future__ import annotations

from typing import Dict, List


def build_ffmpeg_image_cmd(
    src_path_or_url: str,
    out_path: str,
    *,
    canvas_w: int,
    canvas_h: int,
    caption_png: str,
    caption_box: Dict[str, int],
) -> List[str]:
    """Construct the ffmpeg command for captioning an image."""

    overlay_x = caption_box["x"]
    overlay_y = caption_box["y"]
    filter_complex = (
        f"[0:v]scale=w={canvas_w}:h={canvas_h}:force_original_aspect_ratio=decrease:flags=lanczos"
        f",pad={canvas_w}:{canvas_h}:(ow-iw)/2:(oh-ih)/2:black[base];"
        f"[1:v]format=rgba,scale=flags=lanczos[overlay];"
        f"[base][overlay]overlay={overlay_x}:{overlay_y}:format=auto"
    )

    return [
        "ffmpeg",
        "-nostdin",
        "-y",
        "-v",
        "error",
        "-i",
        src_path_or_url,
        "-i",
        caption_png,
        "-filter_complex",
        filter_complex,
        "-frames:v",
        "1",
        out_path,
    ]


def build_ffmpeg_video_cmd(
    src_url: str,
    out_path: str,
    *,
    canvas_w: int,
    canvas_h: int,
    caption_png: str,
    caption_box: Dict[str, int],
    crf: int = 18,
    preset: str = "medium",
    hw_accel: str | None = None,
    audio_copy: bool = False,
) -> List[str]:
    """Construct the ffmpeg command for captioning a video."""

    overlay_x = caption_box["x"]
    overlay_y = caption_box["y"]
    filter_complex = (
        f"[0:v]scale=w={canvas_w}:h={canvas_h}:force_original_aspect_ratio=decrease:flags=lanczos"
        f",pad={canvas_w}:{canvas_h}:(ow-iw)/2:(oh-ih)/2:black[base];"
        f"[1:v]format=rgba,scale=flags=lanczos[overlay];"
        f"[base][overlay]overlay={overlay_x}:{overlay_y}:format=auto"
    )

    # Base command
    cmd = [
        "ffmpeg",
        "-nostdin",
        "-y",
        "-v",
        "error",
        "-i",
        src_url,
        "-i",
        caption_png,
        "-filter_complex",
        filter_complex,
        "-map",
        "0:a?",
    ]
    
    # Select video encoder based on hardware acceleration
    if hw_accel == "nvenc":
        cmd.extend([
            "-c:v", "h264_nvenc",
            "-preset", preset,  # NVENC presets: slow/medium/fast/hp/hq/bd/ll/llhq/llhp
            "-cq", str(crf),  # Use CQ (constant quality) instead of CRF for NVENC
        ])
    elif hw_accel == "qsv":
        cmd.extend([
            "-c:v", "h264_qsv",
            "-preset", preset,
            "-global_quality", str(crf),  # QSV uses global_quality
        ])
    elif hw_accel == "vaapi":
        cmd.extend([
            "-c:v", "h264_vaapi",
            "-qp", str(crf),  # VAAPI uses qp
        ])
    else:
        # Software encoding (default)
        cmd.extend([
            "-c:v", "libx264",
            "-preset", preset,
            "-crf", str(crf),
        ])
    
    # Audio and pixel format
    if audio_copy:
        cmd.extend(["-c:a", "copy"])
    else:
        cmd.extend(["-c:a", "aac", "-b:a", "128k"])

    cmd.extend([
        "-pix_fmt", "yuv420p",
        out_path,
    ])
    
    return cmd
