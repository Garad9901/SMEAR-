"""
RouteIQ X — Redis Rate Limiter Middleware
Restricts requests per IP within 1-minute windows.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import redis
import time
import structlog
from ..core.config import settings

logger = structlog.get_logger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 120):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        
        # Connect to Redis
        try:
            self.redis = redis.from_url(
                settings.REDIS_URL, 
                socket_connect_timeout=2,
                socket_timeout=2
            )
            # Basic ping to verify connectivity
            self.redis.ping()
            logger.info("Rate limiter successfully connected to Redis", limit=requests_per_minute)
        except Exception as e:
            logger.warning("Could not connect to Redis for rate limiting. Running in FAIL-OPEN mode.", error=str(e))
            self.redis = None

    async def dispatch(self, request: Request, call_next):
        # Allow open health or metrics endpoints to bypass rate limiting
        bypass_paths = ["/api/health", "/metrics"]
        if any(request.url.path.startswith(path) for path in bypass_paths):
            return await call_next(request)
            
        if not self.redis:
            # Redis offline — fallback to let request pass
            return await call_next(request)
            
        client_ip = request.client.host if request.client else "unknown-client"
        current_minute = int(time.time() / 60)
        key = f"rate_limit:{client_ip}:{current_minute}"
        
        try:
            # Atomically increment request count and set expiration
            pipe = self.redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, 60)
            results = pipe.execute()
            
            request_count = results[0]
            if request_count > self.requests_per_minute:
                logger.warning("Rate limit exceeded for client", client_ip=client_ip, count=request_count, limit=self.requests_per_minute)
                return JSONResponse(
                    status_code=429,
                    content={"error": "too_many_requests", "message": "API rate limit exceeded. Please try again later."}
                )
        except Exception as e:
            logger.warning("Redis operation failed in rate limiter middleware. Failing open.", error=str(e))
            
        return await call_next(request)
