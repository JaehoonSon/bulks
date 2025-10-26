"""Core configuration settings."""

import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings."""

    def __init__(self):
        self.environment = os.environ.get("ENV", "development")
        self.redis_url: str = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
        self.output_dir: str = os.environ.get("OUTPUT_DIR", "./outputs")
        self.font_path: str = os.environ.get(
            "FONT_PATH", "./TikTokSans-VariableFont_opsz,slnt,wdth,wght.ttf"
        )
        self.video_dir: str = os.environ.get("VIDEO_DIR", "./scraped-video")
        self.supabase_url: str = os.environ.get("SUPABASE_URL")
        self.supabase_key: str = os.environ.get("SUPABASE_KEY")
        self.supabase_jwt: str = os.environ.get("SUPABASE_JWT_KEY")

        self.base_url: str = (
            "https://api.theblucks.com/"
            if self.environment == "production"
            else "http://localhost:8000/"
        )


# Global settings instance
settings = Settings()
