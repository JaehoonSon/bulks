#!/usr/bin/env python3
"""
Enhanced Video Service - Supports high-quality text rendering
This is a supplement to the original video_service.py, providing higher quality text rendering options
"""

import os
from moviepy import VideoFileClip, CompositeVideoClip, ImageClip
import numpy as np
from PIL import Image, ImageDraw

# Import high-quality text renderer
from .hq_text_renderer import create_high_quality_text_clip, get_text_dimensions


def _calculate_text_position(position, relative, video_w, video_h, text_w, text_h):
    """
    Calculate text position - Same function as original video_service.py
    """
    if callable(position):
        return position
    
    if isinstance(position, str):
        position_lower = position.lower().replace('-', '_').replace(' ', '_')
        
        position_map = {
            'center': 'center',
            'top_left': (10, 10),
            'top_center': ('center', 10),
            'top_right': (video_w - text_w - 10, 10),
            'middle_left': (10, 'center'),
            'middle_right': (video_w - text_w - 10, 'center'),
            'bottom_left': (10, video_h - text_h - 10),
            'bottom_center': ('center', video_h - text_h - 10),
            'bottom_right': (video_w - text_w - 10, video_h - text_h - 10),
        }
        
        if position_lower in position_map:
            return position_map[position_lower]
        elif position_lower == 'topleft':
            return position_map['top_left']
        elif position_lower == 'topright':
            return position_map['top_right']
        elif position_lower == 'bottomleft':
            return position_map['bottom_left']
        elif position_lower == 'bottomright':
            return position_map['bottom_right']
        else:
            return position
    
    elif isinstance(position, (tuple, list)) and len(position) == 2:
        x, y = position
        
        if relative:
            pixel_x = x * video_w if isinstance(x, (int, float)) else x
            pixel_y = y * video_h if isinstance(y, (int, float)) else y
            return (pixel_x, pixel_y)
        else:
            return tuple(position)
    
    else:
        print(f"⚠️  Unknown position format: {position}, using safe center position")
        safe_y = min(video_h * 0.5, (video_h - text_h) / 2)
        safe_y = max(video_h * 0.1, safe_y)
        return ('center', safe_y)


def overlay_high_quality_text_on_video(video_path, text, config=None):
    """
    Add high-quality text overlay on video using advanced text rendering
    
    Args:
        video_path (str): Input video file path
        text (str): Text to overlay
        config (dict): Configuration options:
            - output_path (str): Output video path (required)
            - fontsize (int): Font size (default: 50)
            - color (str): Text color (default: 'white')
            - stroke_color (str): Stroke color (default: 'black')
            - stroke_width (int): Stroke width (default: 2)
            - font_path (str): Custom font file path (optional)
            - quality_scale (int): Render quality multiplier (default: 2, higher = better quality)
            - max_width (int): Maximum text width (default: 600)
            - line_spacing (float): Line spacing multiplier (default: 1.2)
            - add_shadow (bool): Whether to add shadow (default: False)
            - shadow_offset (tuple): Shadow offset (default: (2, 2))
            - shadow_color (str): Shadow color (default: 'black')
            - shadow_blur (int): Shadow blur radius (default: 1)
            - background_color (str/tuple): Background color (default: None)
            - background_opacity (float): Background opacity 0-1 (default: 0.8)
            - background_padding (int): Background padding (default: 20)
            - border_radius (int): Border radius (default: 10)
            # Background is always fixed mode (single background for entire text block)
            - position (str/tuple/callable): Text position (default: 'center')
            - relative (bool): Use percentage positioning (default: False)
    
    Returns:
        bool: True if successful, False if failed
    """
    
    if not config or "output_path" not in config:
        raise ValueError("Configuration must contain 'output_path'")
    
    # Default style configuration
    defaults = {
        'fontsize': 50,
        'color': 'white',
        'stroke_color': 'black',
        'stroke_width': 2,
        'font_path': None,
        'quality_scale': 2,  # Key: High-quality rendering multiplier
        'max_width': 600,
        'line_spacing': 1.2,
        'add_shadow': False,
        'shadow_offset': (2, 2),
        'shadow_color': 'black',
        'shadow_blur': 1,
        'background_color': None,
        'background_opacity': 0.8,
        'background_padding': 20,
        'border_radius': 10,
        # Background is always fixed mode
        'position': 'center',
        'relative': False,
    }
    
    style = {**defaults, **config}
    
    print(f"📹 Loading video: {video_path}")
    
    # Load video
    try:
        video = VideoFileClip(video_path)
        print(f"✅ Video loaded successfully")
        print(f"   Duration: {video.duration:.2f} seconds")
        print(f"   Resolution: {video.w}x{video.h}")
        print(f"   Frame rate: {video.fps}")
    except Exception as e:
        print(f"❌ Video loading error: {e}")
        return False
    
    # Create high-quality text clip
    print(f"📝 Creating high-quality text overlay: '{text}'")
    try:
        # Adjust font size to fit video width
        video_width = video.size[0]
        if style['max_width'] > video_width * 0.9:
            style['max_width'] = int(video_width * 0.8)
        
        # Create high-quality text clip
        text_clip = create_high_quality_text_clip(text, style, video.duration)
        
        # Get text dimensions for positioning
        text_w, text_h = get_text_dimensions(text, style)
        video_w, video_h = video.size
        
        # Calculate text position
        text_position = _calculate_text_position(
            style['position'], 
            style['relative'],
            video_w, video_h, 
            text_w, text_h
        )
        
        # Set text position
        text_clip = text_clip.with_position(text_position)
        
        print(f"✅ High-quality text clip created successfully")
        print(f"   Text dimensions: {text_w}x{text_h}")
        print(f"   Video dimensions: {video_w}x{video_h}")
        print(f"   Color: {style['color']}")
        print(f"   Position: {text_position} (from config: {style['position']})")
        print(f"   Quality multiplier: {style['quality_scale']}x")
        print(f"   Font path: {style['font_path'] or 'Default/System font'}")
        
    except Exception as e:
        print(f"❌ Text clip creation error: {e}")
        video.close()
        return False
    
    # Composite video
    print("🎬 Compositing video with text overlay...")
    try:
        clips = [video, text_clip]
        final_video = CompositeVideoClip(clips)
        
        # Write result
        print(f"💾 Writing output to: {style['output_path']}")
        final_video.write_videofile(
            style['output_path'],
            codec='libx264',
            audio_codec='aac',
            temp_audiofile='temp-audio.m4a',
            remove_temp=True
        )
        
        print("✅ Video processing completed successfully!")
        
        # Display file information
        if os.path.exists(style['output_path']):
            file_size = os.path.getsize(style['output_path']) / (1024 * 1024)
            print(f"📊 Output file: {style['output_path']} ({file_size:.1f} MB)")
        
        return style["output_path"]
        
    except Exception as e:
        print(f"❌ Error during video processing: {e}")
        return False
    
    finally:
        # Clean up resources
        video.close()
        if 'text_clip' in locals():
            text_clip.close()
        if 'final_video' in locals():
            final_video.close()
