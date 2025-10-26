"""Caption layout and text rendering helpers."""

from __future__ import annotations

import tempfile
from typing import Dict, List, Tuple

from PIL import Image, ImageDraw, ImageFont


PRESET_FONT_SIZES = {
    "big": 96,
    "medium": 72,
    "small": 48,
}


def compute_layout(
    output_size: Tuple[int, int], placement: str, padding_ratio: float
) -> Dict[str, object]:
    """Compute the caption layout for the given canvas size."""

    if placement not in {"top", "center", "bottom"}:
        raise ValueError(f"Unsupported placement: {placement!r}")

    canvas_w, canvas_h = output_size
    if canvas_w <= 0 or canvas_h <= 0:
        raise ValueError("output_size must be positive integers")

    if padding_ratio < 0:
        raise ValueError("padding_ratio must be non-negative")

    pad_px = round(canvas_h * padding_ratio)

    if placement == "center":
        box_h = round(canvas_h * 0.60)
    else:
        box_h = round(canvas_h * 0.35)

    box_h = max(0, box_h - 2 * pad_px)
    box_w = max(0, canvas_w - 2 * pad_px)

    if placement == "top":
        y = pad_px
    elif placement == "center":
        y = (canvas_h - box_h) // 2
    else:  # bottom
        y = canvas_h - pad_px - box_h

    caption_box = {"x": pad_px, "y": y, "w": box_w, "h": box_h}
    return {
        "canvas_w": canvas_w,
        "canvas_h": canvas_h,
        "pad_px": pad_px,
        "caption_box": caption_box,
    }


def _load_font(font_path: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(font_path, size)
    except OSError as exc:  # pragma: no cover - ensures consistent message
        raise FileNotFoundError(f"Unable to load font at {font_path!r}: {exc}") from exc


def _wrap_text_to_width(
    text: str, font: ImageFont.FreeTypeFont, max_width: int
) -> List[str]:
    def measure(text_value: str) -> int:
        bbox = font.getbbox(text_value if text_value else " ")
        return bbox[2] - bbox[0]

    def split_word(word: str) -> List[str]:
        if measure(word) <= max_width or len(word) == 1:
            return [word]
        parts: List[str] = []
        current = ""
        for ch in word:
            trial = current + ch
            if measure(trial) <= max_width or not current:
                current = trial
            else:
                parts.append(current)
                current = ch
        if current:
            parts.append(current)
        return parts

    def wrap_line(line: str) -> List[str]:
        words = line.split()
        if not words:
            return [""]

        wrapped: List[str] = []
        current = ""
        for word in words:
            segments = split_word(word)
            for seg_index, segment in enumerate(segments):
                prefix = " " if (current and seg_index == 0) else ""
                candidate = current + prefix + segment if current else segment
                if candidate and measure(candidate) <= max_width:
                    current = candidate
                else:
                    if current:
                        wrapped.append(current)
                    current = segment
        if current:
            wrapped.append(current)
        return wrapped

    if not text:
        return [""]

    lines: List[str] = []
    for paragraph in text.split("\n"):
        wrapped_lines = wrap_line(paragraph)
        # Preserve intentional empty lines. wrap_line returns [""] in that case.
        lines.extend(wrapped_lines)
    return lines


def wrap_and_autoscale_text(
    caption: str,
    font_path: str,
    box_w: int,
    box_h: int,
    *,
    size_preset: str = "medium",
    line_spacing: float = 1.15,
    min_px: int = 10,
) -> Dict[str, object]:
    """Wrap and scale caption text to fit inside the bounding box."""

    if size_preset not in PRESET_FONT_SIZES:
        raise ValueError(f"Unknown size preset: {size_preset!r}")

    if box_w <= 0 or box_h <= 0:
        raise ValueError("Caption box must be positive")

    if line_spacing <= 0:
        raise ValueError("line_spacing must be greater than zero")

    start_size = PRESET_FONT_SIZES[size_preset]
    best_layout: Dict[str, object] | None = None

    def evaluate(size: int) -> Dict[str, object]:
        font = _load_font(font_path, size)
        lines = _wrap_text_to_width(caption, font, box_w)
        ascent, descent = font.getmetrics()
        line_height = ascent + descent
        spacing_px = max(0, int(round(line_height * (line_spacing - 1))))
        total_height = len(lines) * line_height + max(len(lines) - 1, 0) * spacing_px
        max_width = 0
        for line in lines:
            bbox = font.getbbox(line if line else " ")
            max_width = max(max_width, bbox[2] - bbox[0])
        return {
            "font_size_px": size,
            "lines": lines,
            "line_height_px": line_height,
            "line_spacing_px": spacing_px,
            "total_height_px": total_height,
            "max_line_width_px": max_width,
            "line_spacing": line_spacing,
        }

    for size in range(start_size, min_px - 1, -1):
        layout = evaluate(size)
        if layout["total_height_px"] <= box_h and layout["max_line_width_px"] <= box_w:
            best_layout = layout
            break

    if best_layout is None:
        best_layout = evaluate(min_px)

    return best_layout


def render_caption_png(
    caption_layout: Dict[str, object],
    font_path: str,
    box: Dict[str, int],
    *,
    text_color: Tuple[int, int, int] = (255, 255, 255),
    stroke_color: Tuple[int, int, int] = (0, 0, 0),
    stroke_width_px: int = 2,
    background: str | None = "semi",
    background_opacity: float = 0.65,
    background_color: Tuple[int, int, int] | None = None,
    background_style: str = "box",
    background_padding_px: int = 20,
    align: str = "center",
    debug: bool = False,
    background_line_gap_px: int = 0,
) -> str:
    """Render the caption text to a temporary PNG file."""

    if stroke_width_px < 0:
        raise ValueError("stroke_width_px must be >= 0")

    if not (0.0 <= background_opacity <= 1.0):
        raise ValueError("background_opacity must be between 0 and 1")

    if len(text_color) != 3 or len(stroke_color) != 3:
        raise ValueError("text_color and stroke_color must be RGB tuples")

    if background_color is not None and len(background_color) != 3:
        raise ValueError("background_color must be an RGB tuple")

    if background_style not in {"box", "line"}:
        raise ValueError(
            f"background_style must be 'box' or 'line', got {background_style!r}"
        )

    if background_padding_px < 0:
        raise ValueError("background_padding_px must be >= 0")
    if background_line_gap_px < 0:
        raise ValueError("background_line_gap_px must be >= 0")

    font_size = int(caption_layout["font_size_px"])
    lines = caption_layout["lines"]
    line_height = int(caption_layout["line_height_px"])
    spacing_px = int(caption_layout["line_spacing_px"])
    total_height = int(caption_layout["total_height_px"])

    font = _load_font(font_path, font_size)

    w = int(box["w"])
    h = int(box["h"])

    if w <= 0 or h <= 0:
        raise ValueError("Caption box dimensions must be positive")

    # Determine background color and alpha based on parameters
    if background is None:
        bg_rgba = (0, 0, 0, 0)
    elif background == "semi":
        alpha = max(0, min(255, int(round(255 * background_opacity))))
        base_color = background_color if background_color else (0, 0, 0)
        bg_rgba = base_color + (alpha,)
    elif background == "solid":
        base_color = background_color if background_color else (0, 0, 0)
        bg_rgba = base_color + (255,)
    else:
        raise ValueError(f"Unsupported background: {background!r}")

    # Create transparent canvas for line style or filled canvas for box style
    if background_style == "box":
        image = Image.new("RGBA", (w, h), bg_rgba)
    else:
        image = Image.new("RGBA", (w, h), (0, 0, 0, 0))

    draw = ImageDraw.Draw(image)

    # Calculate starting y position
    y = max(0, (h - total_height) // 2)

    if debug:
        print("[render_caption_png] Debug on")
        print(
            f"canvas=({w}x{h}) align={align} style={background_style} bg_rgba={bg_rgba} pad={background_padding_px} stroke={stroke_width_px} gap_px={background_line_gap_px}"
        )
        print(
            f"font_size={font_size} line_height={line_height} spacing_px={spacing_px} total_height={total_height}"
        )

    for idx, line in enumerate(lines):
        text = line
        bbox = font.getbbox(text if text else " ")
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # Calculate x position based on alignment
        if align == "center":
            x = max(0, (w - text_width) // 2)
        elif align == "left":
            x = 0
        elif align == "right":
            x = max(0, w - text_width)
        else:
            raise ValueError(f"Unsupported alignment: {align!r}")

        # Draw per-line background if needed
        if background_style == "line" and background is not None:
            # Horizontal extents from text width with padding
            bg_x1 = max(0, x - background_padding_px)
            bg_x2 = min(w, x + text_width + background_padding_px)

            # Use consistent vertical extents based on line metrics, not glyph bbox
            # This avoids taller boxes for descenders (g, p, q, y, j).
            vertical_pad = max(0, background_padding_px // 2)
            base_gap = max(0, spacing_px - 2 * vertical_pad)
            extra_gap_needed = background_line_gap_px - base_gap
            if extra_gap_needed < 0:
                extra_gap_needed = 0
            # Shrink each rect symmetrically to create additional inter-line gap
            max_shrink = max(0, (line_height + 2 * vertical_pad) // 2 - 1)
            shrink = min(max_shrink, extra_gap_needed // 2)
            bg_y1 = max(0, y - vertical_pad + shrink)
            bg_y2 = min(h, y + line_height + vertical_pad - shrink)

            # Draw rounded rectangle for TikTok-style background
            corner_radius = min(10, background_padding_px // 2)
            draw.rounded_rectangle(
                [(bg_x1, bg_y1), (bg_x2, bg_y2)], radius=corner_radius, fill=bg_rgba
            )

            if debug:
                bg_cx = (bg_x1 + bg_x2) / 2.0
                text_cx = x + text_width / 2.0
                bg_cy = (bg_y1 + bg_y2) / 2.0
                text_cy = y + text_height / 2.0
                print(
                    f"line[{idx}] '{text}': bbox={bbox} text_w={text_width} line_y={y} x={x} -> bg=({bg_x1},{bg_y1},{bg_x2},{bg_y2}) cx_diff={text_cx-bg_cx:.2f} cy_diff={text_cy-bg_cy:.2f} base_gap={base_gap} shrink={shrink}"
                )

        # Draw text on top of background
        draw.text(
            (x, y),
            text,
            fill=tuple(int(c) for c in text_color) + (255,),
            font=font,
            stroke_width=stroke_width_px,
            stroke_fill=tuple(int(c) for c in stroke_color) + (255,),
        )

        y += line_height
        if idx < len(lines) - 1:
            y += spacing_px

    tmp = tempfile.NamedTemporaryFile("wb", suffix=".png", delete=False)
    with tmp:
        image.save(tmp, format="PNG", compress_level=1, optimize=False)
    return tmp.name
