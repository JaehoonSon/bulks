"""Redis connection and queue management."""
from typing import Generator, Optional
from redis import Redis
from rq import Queue
from fastapi import Depends

from .config import settings

# Global Redis connection instance
_redis: Optional[Redis] = None
_queue: Optional[Queue] = None

def get_redis() -> Redis:
    """Get Redis connection instance."""
    global _redis
    if _redis is None:
        _redis = Redis.from_url(settings.redis_url)
    return _redis

def get_queue(redis: Redis = Depends(get_redis)) -> Queue:
    """Get Redis Queue instance."""
    global _queue
    if _queue is None:
        _queue = Queue("images", connection=redis)
    return _queue

# Dependency functions for FastAPI
def redis_dependency() -> Generator[Redis, None, None]:
    """FastAPI dependency for Redis connection."""
    redis = get_redis()
    try:
        yield redis
    finally:
        # Connection cleanup if needed
        pass

def queue_dependency(redis: Redis = Depends(redis_dependency)) -> Generator[Queue, None, None]:
    """FastAPI dependency for Redis Queue."""
    queue = get_queue(redis)
    yield queue
