from fastapi import Request
from typing import Generator, Optional
from supabase import create_client, Client

from .config import settings

_supabase: Optional[Client] = None


def init_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_key)


def get_supabase() -> Client:
    """Get Redis connection instance."""
    global _supabase
    if _supabase is None:
        _supabase = create_client(settings.supabase_url, settings.supabase_key)
    return _supabase


# Dependency functions for FastAPI
def supabase_dependency(request: Request) -> Generator[Client, None, None]:
    """FastAPI dependency for Supabase client from lifespan state."""
    supabase: Client = request.app.state.supabase
    try:
        yield supabase
    finally:
        # no cleanup needed; shared client
        pass
