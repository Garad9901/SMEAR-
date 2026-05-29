"""
AgroSense AI — FastAPI Application Entry Point
==============================================
Production-ready FastAPI app with:
- Async lifespan context manager
- CORS middleware
- Rate limiting (slowapi)
- Prometheus metrics
- Structured logging
- JWT authentication
- API versioning (v1)
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging import configure_logging

# ─────────────────────────────────────────────────────────────────────────────
# Configure structured logging
# ─────────────────────────────────────────────────────────────────────────────
configure_logging()
logger = structlog.get_logger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Rate Limiter
# ─────────────────────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


# ─────────────────────────────────────────────────────────────────────────────
# Lifespan — startup / shutdown
# ─────────────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Application startup and shutdown lifecycle."""
    # Startup
    logger.info(
        "agrosense_startup",
        version=settings.APP_VERSION,
        env=settings.APP_ENV,
        districts=11,
    )
    # Create tables if not managed by Alembic (dev only)
    if settings.APP_ENV == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    logger.info("database_connected", url=str(settings.DATABASE_URL)[:30] + "...")
    yield

    # Shutdown
    await engine.dispose()
    logger.info("agrosense_shutdown")


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI Application
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AgroSense AI API",
    description=(
        "Intelligent Crop & Climate Risk Platform for Vidarbha, Maharashtra. "
        "Provides rainfall forecasting, crop yield prediction, drought/flood risk "
        "indexing, and real-time farmer alerts for 11 districts."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ─────────────────────────────────────────────────────────────────────────────
# Middleware
# ─────────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ─────────────────────────────────────────────────────────────────────────────
# Prometheus Metrics
# ─────────────────────────────────────────────────────────────────────────────
Instrumentator(
    should_group_status_codes=True,
    excluded_handlers=["/health", "/metrics"],
).instrument(app).expose(app)


# ─────────────────────────────────────────────────────────────────────────────
# Request Logging Middleware
# ─────────────────────────────────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        path=request.url.path,
        method=request.method,
        client_ip=request.client.host if request.client else "unknown",
    )
    response = await call_next(request)
    logger.info("http_request", status_code=response.status_code)
    return response


# ─────────────────────────────────────────────────────────────────────────────
# Core Endpoints
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"], summary="Health Check")
async def health_check():
    """System health check — used by Docker and load balancers."""
    return {
        "status": "healthy",
        "service": "AgroSense AI",
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "districts_covered": 11,
        "region": "Vidarbha, Maharashtra",
    }


@app.get("/", tags=["System"], summary="API Root")
async def root():
    """API root endpoint with service information."""
    return {
        "message": "Welcome to AgroSense AI API 🌾",
        "docs": "/docs",
        "version": settings.APP_VERSION,
        "modules": [
            "Rainfall Forecasting",
            "Crop Yield Prediction",
            "Drought & Flood Risk",
            "Real-Time Alerts",
        ],
    }


# ─────────────────────────────────────────────────────────────────────────────
# API Routers
# ─────────────────────────────────────────────────────────────────────────────
app.include_router(api_v1_router, prefix="/api/v1")


# ─────────────────────────────────────────────────────────────────────────────
# Global Exception Handlers
# ─────────────────────────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error. Please try again later."},
    )


# ─────────────────────────────────────────────────────────────────────────────
# Dev entrypoint
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.APP_DEBUG,
        log_level="info",
        access_log=True,
    )
