"""
RouteIQ X — Health Router
Gateway status check endpoint for Kubernetes liveness/readiness probes.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from ..core.database import get_db
import redis
from ..core.config import settings
import structlog

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/")
async def get_health(db: AsyncSession = Depends(get_db)):
    """
    Exposes health status checks validating DB connectivity and Redis status.
    """
    db_alive = False
    try:
        await db.execute(text("SELECT 1;"))
        db_alive = True
    except Exception as e:
        logger.error("Health check failed on database validation", error=str(e))

    redis_alive = False
    try:
        r = redis.from_url(settings.REDIS_URL, socket_connect_timeout=2)
        r.ping()
        redis_alive = True
    except Exception as e:
        logger.error("Health check failed on Redis validation", error=str(e))

    status = "healthy" if (db_alive and redis_alive) else "degraded"
    
    return {
        "status": status,
        "version": settings.VERSION,
        "checks": {
            "postgres": "up" if db_alive else "down",
            "redis": "up" if redis_alive else "down"
        }
    }
