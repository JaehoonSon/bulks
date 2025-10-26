from fastapi import HTTPException
from PIL import Image, ImageOps, ImageDraw, ImageFont
from typing import List, Optional
from io import BytesIO
import httpx, os
import textwrap
import random
from src.core.logging_config import logger


def wrap_sentence(text: str, width: int = 35) -> str:
    w = textwrap.TextWrapper(
        width=width, break_long_words=False, break_on_hyphens=False
    )
    out = []
    for line in text.splitlines():
        if not line.strip():
            out.append("")  # preserve blank lines
        else:
            out.extend(w.wrap(line))  # wrap this line only
    return "\n".join(out)


def get_random_jpg_path(relative_dir: str) -> str:
    """Return absolute path to a random .jpg file inside a given relative directory."""
    base_path = os.path.abspath(os.getcwd())
    full_path = os.path.join(base_path, relative_dir)
    jpgs = [f for f in os.listdir(full_path) if f.lower().endswith(".jpg")]
    if not jpgs:
        raise FileNotFoundError("No .jpg files found.")
    return os.path.join(full_path, random.choice(jpgs))


def get_random_mp4_path(relative_dir: str) -> str:
    """Return absolute path to a random .mp4 file inside a given relative directory."""
    base_path = os.path.abspath(os.getcwd())
    full_path = os.path.join(base_path, relative_dir)
    mp4s = [f for f in os.listdir(full_path) if f.lower().endswith(".mp4")]
    if not mp4s:
        raise FileNotFoundError("No .mp4 files found.")
    # return os.path.join(full_path, random.choice(mp4s))
    return random.choice(mp4s)


def get_pil_image(image_path: str) -> Image.Image:
    """Return a PIL Image object for the given image path."""
    return Image.open(image_path)


def overlay_text_on_image(image_input, text, config=None):
    """
    Overlays text on an image with customizable configuration, including a text stroke.

    :param image_input: Path to the input image or a PIL Image object.
    :param text: The text to overlay on the image. Supports newlines for multi-line text.
    :param config: A dictionary for configuration. Possible keys:
        - 'position': Tuple (rel_x, rel_y) where rel_x and rel_y are floats from 0.0 to 1.0,
          representing relative positions on the image (0.0 left/top, 1.0 right/bottom). The position
          acts as the anchor point based on alignment and vertical_alignment. Default: (0.01, 0.01).
        - 'font_path': Path to a TTF font file (default: uses a system font if available).
        - 'font_size': Integer font size (default: 40).
        - 'text_color': Tuple (R, G, B, A) for text color (default: (255, 255, 255, 255) white).
        - 'alignment': Horizontal alignment: 'left', 'center', or 'right' (default: 'left').
        - 'vertical_alignment': Vertical alignment: 'top', 'middle', or 'bottom' (default: 'top').
        - 'stroke_width': Integer for the text stroke width (default: 2).
        - 'stroke_color': Tuple (R, G, B, A) for the stroke color (default: (0, 0, 0, 255) black).
        - 'background_color': Tuple (R, G, B, A) for text background color (default: None, no background).
        - 'background_padding': Integer for padding around text background (default: 10).
        - 'background_radius': Integer for corner radius of background (default: 8).
        - 'output_path': Path to save the output image (if None, returns the PIL Image object).
        - 'quality': Save quality for JPEG (default: 95).

    :return: The modified PIL Image object if no output_path, else None.
    """
    # Load the image if it's a path
    if isinstance(image_input, str):
        if not os.path.exists(image_input):
            raise FileNotFoundError(f"Image file not found: {image_input}")
        image = Image.open(image_input).convert("RGBA")
    elif isinstance(image_input, Image.Image):
        image = image_input.convert("RGBA")
    else:
        raise ValueError("image_input must be a file path or PIL Image object.")

    # Default config
    default_config = {
        "position": (0.01, 0.01),  # Relative positions
        "font_path": None,  # Will use default font if None
        "font_size": 40,
        "text_color": (255, 255, 255, 255),  # White with full opacity
        "alignment": "left",
        "vertical_alignment": "top",
        "stroke_width": 2,  # Default stroke width
        "stroke_color": (0, 0, 0, 255),  # Default stroke color (black)
        "background_color": None,  # No background by default
        "background_padding": 10,  # Padding around text background
        "background_radius": 8,  # Corner radius for background
        "output_path": None,
        "quality": 95,
    }

    # Merge user config with defaults
    if config is None:
        config = {}
    config = {**default_config, **config}

    # Calculate absolute position from relative
    width, height = image.size
    rel_x, rel_y = config["position"]
    if not (0.0 <= rel_x <= 1.0 and 0.0 <= rel_y <= 1.0):
        raise ValueError("Relative position values must be between 0.0 and 1.0.")
    x = int(rel_x * width)
    y = int(rel_y * height)

    # Load font
    try:
        # Use a default system font if no path is provided
        font = (
            ImageFont.truetype(config["font_path"], config["font_size"])
            if config["font_path"]
            else ImageFont.load_default(size=config["font_size"])
        )
    except Exception as e:
        print(f"Font loading error: {e}. Falling back to default font.")
        font = ImageFont.load_default(size=config["font_size"])

    # Create a transparent layer for text
    text_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(text_layer)

    # Get text bounding box for the entire text to get overall dimensions
    bbox = draw.multiline_textbbox(
        (0, 0),
        text,
        font=font,
        align=config["alignment"],
        stroke_width=config["stroke_width"],
    )
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Adjust x and y based on alignment to find the correct top-left corner for the text block.
    # The (x, y) tuple in multiline_text is always the top-left corner.
    if config["alignment"] == "center":
        x -= text_width // 2
    elif config["alignment"] == "right":
        x -= text_width

    if config["vertical_alignment"] == "middle":
        y -= text_height // 2
    elif config["vertical_alignment"] == "bottom":
        y -= text_height

    # The 'align' parameter aligns the lines relative to each other within the bounding box.
    # Draw the text with the specified stroke
    draw.multiline_text(
        (x, y),
        text,
        font=font,
        fill=config["text_color"],
        align=config["alignment"],
        stroke_width=config["stroke_width"],
        stroke_fill=config["stroke_color"],
    )

    # Composite the text layer onto the image
    image = Image.alpha_composite(image, text_layer)

    # If output_path is provided, save the image
    if config["output_path"]:
        # Convert back to RGB if saving as JPEG
        if config["output_path"].lower().endswith((".jpg", ".jpeg")):
            image = image.convert("RGB")
        image.save(config["output_path"], quality=config["quality"])
        return None
    else:
        return image


def format_image_for_social(image_input, config=None):
    """
    Standardizes an image to a specific aspect ratio (portrait, square, or landscape),
    centering it and adding black bars if necessary.

    This function simplifies image formatting for social media platforms by handling
    resizing and padding automatically.

    :param image_input: Path to the input image or a PIL Image object.
    :param config: A dictionary for configuration. Possible keys:
        - 'aspect_ratio': The target aspect ratio. Accepts 'portrait' (9:16),
          'square' (1:1), or 'landscape' (16:9). Default: 'square'.
        - 'output_size': A tuple (width, height) for the final image resolution.
          Default is 1080p resolution appropriate for the aspect ratio.
        - 'background_color': Color for the padding bars. Default: 'black'.
        - 'output_path': Path to save the output image. If None, the function
          returns the final PIL Image object.
        - 'quality': Save quality for the output image (1-95). Default: 95.

    :return: The formatted PIL Image object if 'output_path' is None, otherwise None.
    """
    # --- 1. Load Image and Set Up Configuration ---
    if isinstance(image_input, str):
        try:
            image = Image.open(image_input).convert("RGBA")
        except FileNotFoundError:
            raise FileNotFoundError(f"Image file not found at: {image_input}")
    elif isinstance(image_input, Image.Image):
        image = image_input.convert("RGBA")
    else:
        raise ValueError("image_input must be a file path or a PIL Image object.")

    # Define standard aspect ratios and default resolutions
    aspect_ratios = {
        "portrait": (9 / 16, (1080, 1920)),
        "square": (1 / 1, (1080, 1080)),
        "landscape": (16 / 9, (1920, 1080)),
    }

    # Default configuration
    default_config = {
        "aspect_ratio": "portrait",  # TikTok optimal format (9:16)
        "output_size": None,  # Will be set based on aspect_ratio if not provided
        "background_color": "black",
        "output_path": None,
        "quality": 95,
    }

    if config is None:
        config = {}
    config = {**default_config, **config}

    # Validate aspect ratio
    target_format = config["aspect_ratio"].lower()
    if target_format not in aspect_ratios:
        raise ValueError(
            f"Invalid aspect_ratio '{target_format}'. Choose from 'portrait', 'square', or 'landscape'."
        )

    # Determine the final output size
    target_aspect_ratio, default_size = aspect_ratios[target_format]
    output_size = config["output_size"] or default_size
    target_width, target_height = output_size

    # --- 2. Resize Image to Fit Within the Target Frame ---
    # The ImageOps.contain method is perfect for this. It calculates the correct
    # dimensions to make the image fit within the given size while maintaining its
    # aspect ratio. It's like a "fit inside" or "scale to fit" operation.
    # The thumbnailing is done with high-quality downsampling (LANCZOS).
    resized_image = ImageOps.contain(
        image, (target_width, target_height), Image.Resampling.LANCZOS
    )

    # --- 3. Create the Background Canvas ---
    # This will be the final image frame with the chosen background color.
    canvas = Image.new("RGB", (target_width, target_height), config["background_color"])

    # --- 4. Center the Resized Image on the Canvas ---
    # Calculate the top-left corner coordinates to paste the resized image
    # so that it appears perfectly centered.
    paste_x = (target_width - resized_image.width) // 2
    paste_y = (target_height - resized_image.height) // 2

    # Paste the resized image onto the canvas.
    # If the resized image has transparency, its alpha channel is used as the mask.
    canvas.paste(resized_image, (paste_x, paste_y), resized_image)

    # --- 5. Save or Return the Final Image ---
    if config["output_path"]:
        canvas.save(config["output_path"], quality=config["quality"])
        print(f"Image saved successfully to {config['output_path']}")
        return None
    else:
        return canvas


async def pil_from_url(url: str) -> Image.Image:
    async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
        r = await client.get(url, headers={"User-Agent": "format-image/1.0"})
        r.raise_for_status()
        ct = r.headers.get("content-type", "")
        if not ct.startswith("image/"):
            raise HTTPException(
                status_code=400, detail=f"URL did not return an image: {url}"
            )
        img = Image.open(BytesIO(r.content))
        img.load()
        try:
            img = ImageOps.exif_transpose(img)
        except Exception:
            pass
        return img


async def pil_from_urls_with_fallback(urls: List[str]) -> Image.Image:
    """
    Try to load an image from a list of URLs, falling back to the next URL if one fails.

    Args:
        urls: List of image URLs to try in order

    Returns:
        Image.Image: The first successfully loaded image

    Raises:
        HTTPException: If all URLs fail to load
    """
    last_error = None

    for i, url in enumerate(urls):
        try:
            return await pil_from_url(url)
        except Exception as e:
            last_error = e
            continue

    # If we get here, all URLs failed
    raise HTTPException(
        status_code=400,
        detail=f"All {len(urls)} URLs failed to load images. Last error: {str(last_error)}",
    )


async def brave_search(query: str, count: str) -> List[str]:
    url = "https://api.search.brave.com/res/v1/images/search"
    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "x-subscription-token": "BSAjndG_PSjz-nXHIinAqMSjpwsOjXS",
    }
    params = {"q": query, "count": count, "safesearch": "strict", "country": "ALL"}

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, headers=headers, params=params)
        resp.raise_for_status()
        data = resp.json()

    n = int(count)
    results = data.get("results", [])[:n]
    return [
        item.get("properties", {}).get("url")
        for item in results
        if item.get("properties", {}).get("url")
    ]


async def google_image_search(
    query: str,
    count: int,
    api_key: str = "AIzaSyCokAG3mc6i_pwJnee-M2o2o2YDlHX0LVQ",
    cx: str = "7189ea84ca10b4c92",
) -> List[str]:
    """
    Search Google Images using Custom Search JSON API.

    Args:
        query (str): Search query.
        count (int): Number of results (max 10 per request).
        api_key (str): Google API key.
        cx (str): Programmable Search Engine ID.

    Returns:
        List[str]: List of image URLs.
    """
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "q": query,
        "num": min(count, 10),
        "searchType": "image",
        "key": api_key,
        "cx": cx,
        "safe": "active",
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    items = data.get("items", [])
    # final = [item["link"] for item in items[:count]]
    return [item["link"] for item in items[:count]]

    # if final[0] == ""
    # return items


async def playwright_scrape(query, count=3):
    from src.scraper import scrape_pins

    search_results = await scrape_pins(query)
    # Return up to 'count' image URLs for fallback
    if not search_results:

        raise ValueError(str(search_results))
    return [result["img"] for result in search_results[:count] if result.get("img")]


def smart_crop_to_fit(image, target_size, position="center"):
    """
    Smart crop an image to fit exact target dimensions while preserving important content.

    Args:
        image: PIL Image object
        target_size: Tuple (width, height) for target dimensions
        position: 'center', 'top', 'bottom', 'left', 'right'

    Returns:
        PIL Image object cropped and resized to exact target_size
    """
    if not isinstance(image, Image.Image):
        raise ValueError("Input must be a PIL Image object")

    target_width, target_height = target_size
    target_ratio = target_width / target_height
    current_ratio = image.width / image.height

    if current_ratio > target_ratio:
        new_height = image.height
        new_width = int(new_height * target_ratio)

        if position == "left":
            crop_x = 0
        elif position == "right":
            crop_x = image.width - new_width
        else:
            crop_x = (image.width - new_width) // 2

        crop_box = (crop_x, 0, crop_x + new_width, new_height)
    else:
        new_width = image.width
        new_height = int(new_width / target_ratio)

        if position == "top":
            crop_y = 0
        elif position == "bottom":
            crop_y = image.height - new_height
        else:
            crop_y = (image.height - new_height) // 2

        crop_box = (0, crop_y, new_width, crop_y + new_height)

    cropped = image.crop(crop_box)
    return cropped.resize(target_size, Image.Resampling.LANCZOS)


def create_image_grid(images, layout="2x2", config=None):
    """
    Creates TikTok-style image grids from multiple images.

    Args:
        images: List of image URLs/paths or PIL Image objects
        layout: Grid layout string like "2x1", "2x2", "3x1", "1x3", etc.
        config: Dictionary with styling options

    Returns:
        PIL Image object with the grid layout
    """
    aspect_ratios = {
        "portrait": (9 / 16, (1080, 1920)),
        "square": (1 / 1, (1080, 1080)),
        "landscape": (16 / 9, (1920, 1080)),
    }

    default_config = {
        "aspect_ratio": "portrait",
        "output_size": None,
        "spacing": 8,
        "border_width": 0,
        "border_color": "white",
        "background_color": "black",
        "cell_fit": "crop",
        "crop_position": "center",
        "quality": 95,
    }

    if config is None:
        config = {}
    config = {**default_config, **config}

    target_format = config["aspect_ratio"].lower()
    if target_format not in aspect_ratios:
        raise ValueError(
            f"Invalid aspect_ratio '{target_format}'. Choose from 'portrait', 'square', or 'landscape'."
        )

    target_aspect_ratio, default_size = aspect_ratios[target_format]
    output_size = config["output_size"] or default_size
    target_width, target_height = output_size

    try:
        cols_str, rows_str = layout.lower().split("x")
        cols, rows = int(cols_str), int(rows_str)
    except (ValueError, IndexError):
        raise ValueError(
            f"Invalid layout format '{layout}'. Use format like '2x2', '3x1', etc."
        )

    if cols <= 0 or rows <= 0:
        raise ValueError("Layout dimensions must be positive integers")

    total_cells = cols * rows

    if len(images) < total_cells:
        raise ValueError(
            f"Layout '{layout}' requires {total_cells} images but only {len(images)} provided"
        )

    pil_images = []
    for i, img in enumerate(images[:total_cells]):
        if isinstance(img, str):
            if os.path.exists(img):
                pil_img = Image.open(img).convert("RGBA")
            else:
                raise FileNotFoundError(f"Image file not found: {img}")
        elif isinstance(img, Image.Image):
            pil_img = img.convert("RGBA")
        else:
            raise ValueError(f"Image {i} must be a file path or PIL Image object")

        pil_images.append(pil_img)

    canvas_width, canvas_height = target_width, target_height
    spacing = config["spacing"]

    cell_width = (canvas_width - (cols - 1) * spacing) // cols
    cell_height = (canvas_height - (rows - 1) * spacing) // rows

    canvas = Image.new("RGB", (canvas_width, canvas_height), config["background_color"])

    for idx, img in enumerate(pil_images):
        col = idx % cols
        row = idx // cols

        x = col * (cell_width + spacing)
        y = row * (cell_height + spacing)

        if config["cell_fit"] == "crop":
            processed_img = smart_crop_to_fit(
                img, (cell_width, cell_height), config["crop_position"]
            )
        else:
            processed_img = ImageOps.contain(
                img, (cell_width, cell_height), Image.Resampling.LANCZOS
            )
            if processed_img.size != (cell_width, cell_height):
                cell_canvas = Image.new(
                    "RGB", (cell_width, cell_height), config["background_color"]
                )
                paste_x = (cell_width - processed_img.width) // 2
                paste_y = (cell_height - processed_img.height) // 2
                cell_canvas.paste(
                    processed_img,
                    (paste_x, paste_y),
                    processed_img if processed_img.mode == "RGBA" else None,
                )
                processed_img = cell_canvas

        if config["border_width"] > 0:
            border_img = Image.new(
                "RGB",
                (
                    cell_width + 2 * config["border_width"],
                    cell_height + 2 * config["border_width"],
                ),
                config["border_color"],
            )
            border_img.paste(
                processed_img, (config["border_width"], config["border_width"])
            )
            processed_img = border_img
            x -= config["border_width"]
            y -= config["border_width"]

        if processed_img.mode == "RGBA":
            canvas.paste(processed_img, (x, y), processed_img)
        else:
            canvas.paste(processed_img, (x, y))

    return canvas


async def create_image_grid_from_urls(image_urls, layout="2x2", config=None):
    """
    Creates TikTok-style image grids from image URLs with fallback support.

    Args:
        image_urls: List of image URLs or list of lists of URLs (for fallback)
        layout: Grid layout string like "2x2", "3x1", etc.
        config: Dictionary with styling options

    Returns:
        PIL Image object with the grid layout
    """
    try:
        cols_str, rows_str = layout.lower().split("x")
        cols, rows = int(cols_str), int(rows_str)
        total_cells = cols * rows
    except (ValueError, IndexError):
        raise ValueError(
            f"Invalid layout format '{layout}'. Use format like '2x2', '3x1', etc."
        )

    pil_images = []

    for i in range(min(total_cells, len(image_urls))):
        url_item = image_urls[i]

        if isinstance(url_item, list):
            img = await pil_from_urls_with_fallback(url_item)
        else:
            img = await pil_from_url(url_item)

        pil_images.append(img)

    return create_image_grid(pil_images, layout, config)


def create_tiktok_grid_with_text(
    images, layout="2x2", text="", grid_config=None, text_config=None
):
    """
    Creates a complete TikTok-style post by combining image grid with text overlay.

    Args:
        images: List of image URLs/paths or PIL Image objects
        layout: Grid layout string like "2x2", "3x1", etc.
        text: Text to overlay on the grid
        grid_config: Configuration for grid creation
        text_config: Configuration for text overlay

    Returns:
        PIL Image object with grid and text overlay
    """
    grid_image = create_image_grid(images, layout, grid_config)

    if text and text.strip():
        default_text_config = {
            "position": (0.5, 0.95),
            "font_size": 48,
            "text_color": (255, 255, 255, 255),
            "alignment": "center",
            "vertical_alignment": "bottom",
            "stroke_width": 3,
            "stroke_color": (0, 0, 0, 255),
            "font_path": None,
        }

        if text_config:
            default_text_config.update(text_config)

        wrapped_text = wrap_sentence(text, width=40)

        final_image = overlay_text_on_image(
            grid_image, wrapped_text, default_text_config
        )
        return final_image

    return grid_image


async def create_tiktok_grid_from_urls_with_text(
    image_urls, layout="2x2", text="", grid_config=None, text_config=None
):
    """
    Creates a complete TikTok-style post from URLs by combining image grid with text overlay.

    Args:
        image_urls: List of image URLs or list of lists of URLs (for fallback)
        layout: Grid layout string like "2x2", "3x1", etc.
        text: Text to overlay on the grid
        grid_config: Configuration for grid creation
        text_config: Configuration for text overlay

    Returns:
        PIL Image object with grid and text overlay
    """
    grid_image = await create_image_grid_from_urls(image_urls, layout, grid_config)

    if text and text.strip():
        default_text_config = {
            "position": (0.5, 0.95),
            "font_size": 48,
            "text_color": (255, 255, 255, 255),
            "alignment": "center",
            "vertical_alignment": "bottom",
            "stroke_width": 3,
            "stroke_color": (0, 0, 0, 255),
            "font_path": None,
        }

        if text_config:
            default_text_config.update(text_config)

        wrapped_text = wrap_sentence(text, width=40)

        final_image = overlay_text_on_image(
            grid_image, wrapped_text, default_text_config
        )
        return final_image

    return grid_image


async def generate_caption_and_download(
    caption: str, input_path: str, output_path: str
):
    """
    Sends a POST request to the caption API, retrieves the output_url,
    downloads the processed video, and saves it to output_path.
    """
    url = "https://social-video-helper-119239050721.europe-west1.run.app/caption"

    payload = {
        "input_url": input_path,
        "output_gsurl": "gs://theblucks/outputs/temp.mp4",
        "output_size": [1080, 1920],
        "caption": caption,
        "font_path": "/app/fonts/tiktok.ttf",
        "placement": "center",
        "size_preset": "medium",
        "text_color": [255, 255, 255],
        "stroke_color": [0, 0, 0],
        "stroke_width_px": 5,
        "background": "semi",
        "background_opacity": 0,
        "background_color": [255, 255, 255],
        "background_style": "box",
        "background_padding_px": 20,
        "background_line_gap_px": 0,
        "line_spacing": 0.5,
        "padding_ratio": 0.06,
        "crf": 18,
        "preset": "medium",
    }

    async with httpx.AsyncClient(timeout=120) as client:
        # Send caption generation request
        response = await client.post(url, json=payload)

        # Log the response for debugging
        if response.status_code != 200:
            print(f"Error response status: {response.status_code}")
            print(f"Error response body: {response.text}")
            print(f"Request payload: {payload}")
            raise HTTPException(
                status_code=500,
                detail="Caption API request failed",
            )

        response.raise_for_status()
        data = response.json()

        output_url = data.get("output_url")
        if not output_url:
            raise ValueError("No output_url returned from API")

        # Download the output file
        video_response = await client.get(output_url)
        video_response.raise_for_status()

        # Save to file
        with open(output_path, "wb") as f:
            f.write(video_response.content)

        return output_path
