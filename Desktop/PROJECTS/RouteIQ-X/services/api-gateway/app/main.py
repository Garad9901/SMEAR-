"""
RouteIQ X — FastAPI API Gateway
Production-grade REST API with OAuth2/JWT, RBAC, multi-tenancy, and observability.
"""

from fastapi import FastAPI, Depends, HTTPException, Security, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import structlog
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from .routers import roads, agents, maintenance, budget, analytics, mlops, reports, health
from .middleware.auth import JWTAuthMiddleware
from .middleware.tenant import TenantContextMiddleware
from .middleware.rate_limit import RateLimitMiddleware
from .core.config import settings
from .core.database import init_db

logger = structlog.get_logger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter("routeiq_requests_total", "Total API requests", ["method", "endpoint", "status"])
REQUEST_LATENCY = Histogram("routeiq_request_duration_seconds", "Request latency", ["method", "endpoint"])

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown."""
    logger.info("RouteIQ X API Gateway starting", version=settings.VERSION)
    await init_db()
    yield
    logger.info("RouteIQ X API Gateway shutting down")

app = FastAPI(
    title="RouteIQ X API",
    description="""
    ## Autonomous Infrastructure Intelligence Platform

    Cloud-native REST API for smart city road maintenance intelligence.

    ### Features
    - 🛰️ Satellite imagery analysis (Sentinel-2 / EfficientNet / YOLOv8)
    - 🤖 8 autonomous AI agents (LangGraph / Temporal Workflows)
    - 📊 Predictive degradation forecasting (LSTM / TFT / Prophet)
    - 💰 Budget optimization (LP / Genetic Algorithms / RL)
    - 🗺️ Geospatial intelligence (PostGIS / OSMnx / GeoPandas)
    """,
    version=settings.VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── OpenTelemetry ──────────────────────────────────────────────────
provider = TracerProvider()
otlp_exporter = OTLPSpanExporter(endpoint=settings.OTEL_ENDPOINT)
provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("routeiq.api")

# ── Middleware ─────────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(JWTAuthMiddleware)
app.add_middleware(TenantContextMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=120)

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start
    endpoint = request.url.path
    REQUEST_COUNT.labels(request.method, endpoint, response.status_code).inc()
    REQUEST_LATENCY.labels(request.method, endpoint).observe(duration)
    response.headers["X-Request-ID"] = request.headers.get("X-Request-ID", "")
    response.headers["X-RouteIQ-Version"] = settings.VERSION
    return response

# ── Routers ───────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(health.router,      prefix="/api",        tags=["Health"])
app.include_router(roads.router,       prefix=API_PREFIX,    tags=["Road Segments"])
app.include_router(agents.router,      prefix=API_PREFIX,    tags=["AI Agents"])
app.include_router(maintenance.router, prefix=API_PREFIX,    tags=["Maintenance"])
app.include_router(budget.router,      prefix=API_PREFIX,    tags=["Budget Optimizer"])
app.include_router(analytics.router,   prefix=API_PREFIX,    tags=["Analytics"])
app.include_router(mlops.router,       prefix=API_PREFIX,    tags=["MLOps"])
app.include_router(reports.router,     prefix=API_PREFIX,    tags=["Reports"])

# ── Prometheus Metrics Endpoint ────────────────────────────────────
@app.get("/metrics", include_in_schema=False)
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# ── Global Exception Handler ───────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "An unexpected error occurred",
            "request_id": request.headers.get("X-Request-ID", ""),
        },
    )
