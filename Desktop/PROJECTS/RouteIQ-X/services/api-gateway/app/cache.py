"""
RouteIQ X — Caching Utilities
Redis-backed decorator for API response caching.
"""

import functools
import json
import redis
from .core.config import settings
import structlog

logger = structlog.get_logger(__name__)

try:
    redis_client = redis.from_url(
        settings.REDIS_URL,
        socket_connect_timeout=2,
        socket_timeout=2
    )
    redis_client.ping()
    logger.info("Cache client successfully connected to Redis")
except Exception as e:
    logger.warning("Failed to initialize Redis cache connection. Caching will be disabled.", error=str(e))
    redis_client = None

def cache_response(ttl: int = 300):
    """
    Decorator to cache route response payloads in Redis.
    Serializes Pydantic structures or dictionary outputs into JSON.
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            if not redis_client:
                # Cache offline — execute function directly
                return await func(*args, **kwargs)
                
            # Create a deterministic key based on the function name and string representation of arguments
            key_parts = [func.__name__]
            
            # Skip first arg if it is APIRouter or self instance
            for arg in args[1:]:
                key_parts.append(str(arg))
                
            for k, v in sorted(kwargs.items()):
                # Exclude database session or background task variables from cache key
                if k not in ("db", "request", "background_tasks", "tenant"):
                    key_parts.append(f"{k}:{v}")
                    
            cache_key = f"response_cache:{':'.join(key_parts)}"
            
            # Attempt to read from cache
            try:
                cached_data = redis_client.get(cache_key)
                if cached_data:
                    logger.debug("Cache hit for route", key=cache_key)
                    return json.loads(cached_data)
            except Exception as e:
                logger.warning("Failed to retrieve from Redis cache. Proceeding to database.", key=cache_key, error=str(e))
                
            # Execute database query
            result = await func(*args, **kwargs)
            
            # Attempt to store result in cache
            try:
                # Handle serialization if result is a Pydantic model (Pydantic v2 use model_dump, fallback to dict)
                if hasattr(result, "model_dump"):
                    serializable = result.model_dump()
                elif hasattr(result, "dict"):
                    serializable = result.dict()
                else:
                    serializable = result
                    
                redis_client.setex(cache_key, ttl, json.dumps(serializable))
                logger.debug("Cached route response successfully", key=cache_key, ttl=ttl)
            except Exception as e:
                logger.warning("Failed to write response payload to Redis cache", key=cache_key, error=str(e))
                
            return result
        return wrapper
    return decorator
