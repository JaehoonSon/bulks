#!/usr/bin/env python3
"""
High-Quality Text Renderer
Specialized for creating TikTok-quality text overlays
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from moviepy import ImageClip
import textwrap


def _create_rounded_background(width, height, color, border_radius, opacity=1.0):
    """
    Create rounded background rectangle
    
    Args:
        width (int): Background width
        height (int): Background height
        color (tuple): RGB color tuple
        border_radius (int): Corner radius
        opacity (float): Opacity 0-1
    
    Returns:
        PIL.Image: Background image with alpha channel
    """
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Parse color if it's a string
    if isinstance(color, str):
        if color.startswith('#'):
            color = tuple(int(color[i:i+2], 16) for i in (1, 3, 5))
        else:
            color_map = {
                'black': (0, 0, 0),
                'white': (255, 255, 255),
                'red': (255, 0, 0),
                'green': (0, 255, 0),
                'blue': (0, 0, 255),
                'yellow': (255, 255, 0),
                'cyan': (0, 255, 255),
                'magenta': (255, 0, 255),
                'gray': (128, 128, 128),
                'grey': (128, 128, 128),
            }
            color = color_map.get(color.lower(), (0, 0, 0))
    
    # Add alpha channel
    if len(color) == 3:
        color = color + (int(255 * opacity),)
    
    if border_radius > 0:
        # Draw rounded rectangle
        draw.rectangle([border_radius, 0, width - border_radius, height], fill=color)
        draw.rectangle([0, border_radius, width, height - border_radius], fill=color)
        
        # Draw corner circles
        draw.pieslice([0, 0, border_radius * 2, border_radius * 2], 180, 270, fill=color)
        draw.pieslice([width - border_radius * 2, 0, width, border_radius * 2], 270, 360, fill=color)
        draw.pieslice([0, height - border_radius * 2, border_radius * 2, height], 90, 180, fill=color)
        draw.pieslice([width - border_radius * 2, height - border_radius * 2, width, height], 0, 90, fill=color)
    else:
        # Draw regular rectangle
        draw.rectangle([0, 0, width, height], fill=color)
    
    return img


def _draw_unified_adaptive_background(img, text_lines, line_bboxes, line_height, padding,
                                    bg_color, scaled_bg_padding, scaled_border_radius,
                                    bg_opacity, canvas_width):
    """Draw a unified background that flows smoothly between lines with different widths"""
    from PIL import ImageDraw
    
    # Create overlay for drawing the unified background
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Apply opacity to background color
    r, g, b = bg_color
    alpha = int(255 * bg_opacity)
    fill_color = (r, g, b, alpha)
    
    # Calculate background segments for each line
    segments = []
    y_offset = padding
    
    for i, line in enumerate(text_lines):
        if not line.strip():  # Skip empty lines
            y_offset += line_height
            continue
        
        bbox = line_bboxes[i]
        line_width = bbox[2] - bbox[0]
        
        # Calculate background dimensions for this line
        line_bg_width = int(line_width + scaled_bg_padding * 2)
        line_bg_height = int(line_height + scaled_bg_padding * 2)
        
        # Center the background for this line
        line_bg_x = (canvas_width - line_bg_width) // 2
        line_bg_y = int(y_offset - scaled_bg_padding)
        
        segments.append({
            'x': line_bg_x,
            'y': line_bg_y,
            'width': line_bg_width,
            'height': line_bg_height,
            'line_index': i
        })
        
        y_offset += line_height
    
    if not segments:
        return
    
    # Draw unified background shape by creating connected segments
    for i, segment in enumerate(segments):
        x, y, width, height = segment['x'], segment['y'], segment['width'], segment['height']
        
        if i == 0:
            # First segment - rounded top
            if scaled_border_radius > 0:
                # Top part with rounded corners
                draw.rounded_rectangle(
                    [(x, y), (x + width - 1, y + height - 1)],
                    radius=scaled_border_radius,
                    fill=fill_color
                )
            else:
                draw.rectangle([(x, y), (x + width - 1, y + height - 1)], fill=fill_color)
        
        elif i == len(segments) - 1:
            # Last segment - rounded bottom, connect to previous
            prev_segment = segments[i - 1]
            
            # Draw connection between segments
            _draw_segment_connection(draw, prev_segment, segment, fill_color)
            
            # Draw the segment itself
            if scaled_border_radius > 0:
                draw.rounded_rectangle(
                    [(x, y), (x + width - 1, y + height - 1)],
                    radius=scaled_border_radius,
                    fill=fill_color
                )
            else:
                draw.rectangle([(x, y), (x + width - 1, y + height - 1)], fill=fill_color)
        
        else:
            # Middle segment - connect to previous and draw rectangle
            prev_segment = segments[i - 1]
            
            # Draw connection between segments
            _draw_segment_connection(draw, prev_segment, segment, fill_color)
            
            # Draw the segment itself (no rounding for middle segments)
            draw.rectangle([(x, y), (x + width - 1, y + height - 1)], fill=fill_color)
    
    # Composite the overlay onto the main image
    img.paste(overlay, (0, 0), overlay)


def _draw_segment_connection(draw, prev_segment, curr_segment, fill_color):
    """Draw a smooth connection between two background segments"""
    # Get coordinates for both segments
    prev_x, prev_y = prev_segment['x'], prev_segment['y']
    prev_width, prev_height = prev_segment['width'], prev_segment['height']
    prev_bottom = prev_y + prev_height
    
    curr_x, curr_y = curr_segment['x'], curr_segment['y']
    curr_width = curr_segment['width']
    
    # Calculate connection polygon points
    # Start from bottom of previous segment
    prev_left = prev_x
    prev_right = prev_x + prev_width
    
    # End at top of current segment  
    curr_left = curr_x
    curr_right = curr_x + curr_width
    
    # Create trapezoid/polygon to connect the segments smoothly
    connection_points = [
        (prev_left, prev_bottom),   # Bottom left of previous
        (prev_right, prev_bottom),  # Bottom right of previous
        (curr_right, curr_y),       # Top right of current
        (curr_left, curr_y),        # Top left of current
    ]
    
    # Draw the connecting polygon
    draw.polygon(connection_points, fill=fill_color)


def create_high_quality_text_clip(text, config, video_duration):
    """
    Create high-quality text clip using PIL for anti-aliased rendering
    
    Args:
        text (str): Text to render
        config (dict): Text configuration options
        video_duration (float): Video duration
        
    Returns:
        ImageClip: High-quality text clip
    """
    
    # Default configuration
    defaults = {
        'fontsize': 50,
        'color': 'white',
        'stroke_color': 'black', 
        'stroke_width': 2,
        'font_path': None,  # Custom font path
        'max_width': 600,   # Maximum text width
        'line_spacing': 1.2,  # Line spacing multiplier
        'quality_scale': 2,   # Render quality scale multiplier (higher = better quality)
        'shadow_offset': (2, 2),  # Shadow offset
        'shadow_color': 'black',  # Shadow color
        'shadow_blur': 1,     # Shadow blur radius
        'add_shadow': False,  # Whether to add shadow
        'background_color': None,  # Background color
        'background_opacity': 0.8,  # Background opacity
        'background_padding': 20,   # Background padding
        'border_radius': 10,        # Border radius
        # Background is always fixed mode now
    }
    
    style = {**defaults, **config}
    
    # Quality scale factor - render at higher resolution then scale down
    scale = style['quality_scale']
    scaled_fontsize = style['fontsize'] * scale
    scaled_stroke_width = style['stroke_width'] * scale
    scaled_max_width = style['max_width'] * scale
    
    # Try to load font
    font = None
    try:
        if style['font_path'] and os.path.exists(style['font_path']):
            font = ImageFont.truetype(style['font_path'], size=scaled_fontsize)
            print(f"✅ Loaded custom font: {style['font_path']}")
        else:
            # Try to load TikTok font from project
            tiktok_font_path = 'TikTokSans-VariableFont_opsz,slnt,wdth,wght.ttf'
            if os.path.exists(tiktok_font_path):
                font = ImageFont.truetype(tiktok_font_path, size=scaled_fontsize)
                print(f"✅ Loaded TikTok font: {tiktok_font_path}")
            else:
                # Try system default fonts
                try:
                    # Windows system fonts
                    system_fonts = [
                        'C:/Windows/Fonts/arial.ttf',
                        'C:/Windows/Fonts/calibri.ttf',
                        'C:/Windows/Fonts/segoeui.ttf',
                    ]
                    for font_path in system_fonts:
                        if os.path.exists(font_path):
                            font = ImageFont.truetype(font_path, size=scaled_fontsize)
                            print(f"✅ Loaded system font: {font_path}")
                            break
                except:
                    pass
                    
        if font is None:
            # Use default font
            font = ImageFont.load_default()
            print("⚠️ Using default font")
            
    except Exception as e:
        print(f"⚠️ Font loading failed: {e}, using default font")
        font = ImageFont.load_default()
    
    # Text wrapping handling
    def wrap_text(text, font, max_width):
        """Smart text wrapping"""
        lines = []
        paragraphs = text.split('\n')
        
        for paragraph in paragraphs:
            if not paragraph.strip():
                lines.append('')
                continue
                
            # Calculate characters per line
            avg_char_width = font.getbbox('M')[2]  # Use M character width as average width
            chars_per_line = max(10, max_width // avg_char_width)
            
            # Use textwrap for initial line breaking
            wrapped = textwrap.wrap(paragraph, width=chars_per_line)
            
            # Further optimize to ensure each line doesn't exceed max width
            for line in wrapped:
                while font.getbbox(line)[2] > max_width and len(line) > 1:
                    # If line is too long, continue splitting
                    words = line.split()
                    if len(words) <= 1:
                        break
                    line = ' '.join(words[:-1])
                    # Add remaining words to next line
                    if len(words) > 1:
                        remaining = ' '.join(words[-1:])
                        wrapped.insert(wrapped.index(' '.join(words)) + 1, remaining)
                lines.append(line)
        
        return lines
    
    # Wrap text
    text_lines = wrap_text(text, font, scaled_max_width)
    
    # Calculate text dimensions
    line_height = int(scaled_fontsize * style['line_spacing'])
    max_line_width = 0
    total_height = 0
    
    line_bboxes = []
    for line in text_lines:
        if line.strip():  # Non-empty line
            bbox = font.getbbox(line)
            line_width = bbox[2] - bbox[0]
            line_bboxes.append(bbox)
        else:  # Empty line
            line_width = 0
            line_bboxes.append((0, 0, 0, 0))
        
        max_line_width = max(max_line_width, line_width)
        total_height += line_height
    
    # Add extra space for stroke and shadow
    padding = max(scaled_stroke_width * 2, 10 * scale)
    if style['add_shadow']:
        shadow_padding = max(abs(style['shadow_offset'][0]), abs(style['shadow_offset'][1])) + style['shadow_blur']
        padding = max(padding, shadow_padding * scale)
    
    # Create canvas
    canvas_width = int(max_line_width + padding * 2)
    canvas_height = int(total_height + padding * 2)
    
    # Create high-resolution canvas
    img = Image.new('RGBA', (canvas_width, canvas_height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Parse colors
    def parse_color(color_str):
        """Parse color string to RGB tuple"""
        if isinstance(color_str, (tuple, list)):
            return tuple(color_str[:3])
        
        if isinstance(color_str, str):
            if color_str.startswith('#'):
                # Hexadecimal color
                color_str = color_str[1:]
                if len(color_str) == 6:
                    return tuple(int(color_str[i:i+2], 16) for i in (0, 2, 4))
            else:
                # Named color
                color_map = {
                    'white': (255, 255, 255),
                    'black': (0, 0, 0),
                    'red': (255, 0, 0),
                    'green': (0, 255, 0),
                    'blue': (0, 0, 255),
                    'yellow': (255, 255, 0),
                    'cyan': (0, 255, 255),
                    'magenta': (255, 0, 255),
                    'gray': (128, 128, 128),
                    'grey': (128, 128, 128),
                    'orange': (255, 165, 0),
                    'purple': (128, 0, 128),
                }
                return color_map.get(color_str.lower(), (255, 255, 255))
        
        return (255, 255, 255)  # Default white
    
    text_color = parse_color(style['color'])
    stroke_color = parse_color(style['stroke_color'])
    shadow_color = parse_color(style['shadow_color'])
    
    # Prepare background settings if specified
    bg_color = None
    scaled_bg_padding = 0
    scaled_border_radius = 0
    if style['background_color'] is not None:
        bg_color = parse_color(style['background_color'])
        scaled_bg_padding = style['background_padding'] * scale
        scaled_border_radius = style['border_radius'] * scale
        print("🎨 Creating unified adaptive background...")
    
    # Create unified background if specified
    if bg_color is not None:
        # Create a unified background that adapts to each line's width
        _draw_unified_adaptive_background(
            img, text_lines, line_bboxes, line_height, padding,
            bg_color, scaled_bg_padding, scaled_border_radius,
            style['background_opacity'], canvas_width
        )
    
    # Draw text
    y_offset = padding
    
    for i, line in enumerate(text_lines):
        if not line.strip():  # Empty line
            y_offset += line_height
            continue
        
        bbox = line_bboxes[i]
        line_width = bbox[2] - bbox[0]
        
        # Center align
        x_offset = (canvas_width - line_width) // 2
        
        # Draw shadow (if enabled)
        if style['add_shadow']:
            shadow_x = x_offset + style['shadow_offset'][0] * scale
            shadow_y = y_offset + style['shadow_offset'][1] * scale
            
            # Create shadow layer
            shadow_img = Image.new('RGBA', (canvas_width, canvas_height), (0, 0, 0, 0))
            shadow_draw = ImageDraw.Draw(shadow_img)
            shadow_draw.text((shadow_x, y_offset), line, font=font, fill=shadow_color)
            
            # Apply blur effect
            if style['shadow_blur'] > 0:
                shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(style['shadow_blur'] * scale))
            
            # Merge shadow
            img = Image.alpha_composite(img, shadow_img)
            draw = ImageDraw.Draw(img)
        
        # Draw stroke (by drawing text at multiple positions)
        if scaled_stroke_width > 0:
            for dx in range(-scaled_stroke_width, scaled_stroke_width + 1):
                for dy in range(-scaled_stroke_width, scaled_stroke_width + 1):
                    if dx != 0 or dy != 0:
                        draw.text((x_offset + dx, y_offset + dy), line, font=font, fill=stroke_color)
        
        # Draw main text
        draw.text((x_offset, y_offset), line, font=font, fill=text_color)
        
        y_offset += line_height
    
    # Scale to target size (anti-aliased)
    if scale > 1:
        target_size = (canvas_width // scale, canvas_height // scale)
        img = img.resize(target_size, Image.LANCZOS)  # High-quality scaling
    
    # Convert to numpy array for MoviePy
    img_array = np.array(img)
    
    # Create ImageClip
    clip = ImageClip(img_array, duration=video_duration)
    
    print(f"✅ High-quality text clip created")
    print(f"   Final dimensions: {img.size[0]}x{img.size[1]}")
    print(f"   Render quality: {scale}x")
    print(f"   Lines: {len([l for l in text_lines if l.strip()])}")
    print(f"   Font size: {style['fontsize']} (rendered at: {scaled_fontsize})")
    
    return clip


def get_text_dimensions(text, config):
    """
    Get text dimensions for positioning calculations
    
    Args:
        text (str): Text content
        config (dict): Text configuration
        
    Returns:
        tuple: (width, height) text dimensions
    """
    defaults = {
        'fontsize': 50,
        'font_path': None,
        'max_width': 600,
        'line_spacing': 1.2,
        'stroke_width': 2,
        'quality_scale': 2,
        'background_color': None,
        'background_padding': 20,
        # Background is always fixed mode
    }
    
    style = {**defaults, **config}
    scale = style['quality_scale']
    scaled_fontsize = style['fontsize'] * scale
    scaled_stroke_width = style['stroke_width'] * scale
    scaled_max_width = style['max_width'] * scale
    
    # Load font (simplified version)
    font = None
    try:
        if style['font_path'] and os.path.exists(style['font_path']):
            font = ImageFont.truetype(style['font_path'], size=scaled_fontsize)
        else:
            tiktok_font_path = 'TikTokSans-VariableFont_opsz,slnt,wdth,wght.ttf'
            if os.path.exists(tiktok_font_path):
                font = ImageFont.truetype(tiktok_font_path, size=scaled_fontsize)
            else:
                font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Simple text wrapping
    lines = []
    for paragraph in text.split('\n'):
        if paragraph.strip():
            avg_char_width = font.getbbox('M')[2]
            chars_per_line = max(10, scaled_max_width // avg_char_width)
            wrapped = textwrap.wrap(paragraph, width=chars_per_line)
            lines.extend(wrapped)
        else:
            lines.append('')
    
    # Calculate dimensions
    line_height = int(scaled_fontsize * style['line_spacing'])
    max_width = 0
    total_height = len(lines) * line_height
    
    for line in lines:
        if line.strip():
            bbox = font.getbbox(line)
            line_width = bbox[2] - bbox[0]
            max_width = max(max_width, line_width)
    
    # Add stroke space
    padding = max(scaled_stroke_width * 2, 10 * scale)
    
    # Add background padding if background is enabled
    if style['background_color'] is not None:
        bg_padding = style['background_padding'] * scale
        # Add background padding
        padding = max(padding, bg_padding)
    
    final_width = (max_width + padding * 2) // scale
    final_height = (total_height + padding * 2) // scale
    
    return (final_width, final_height)
