"""
RouteIQ X — Core Configuration
Pydantic Settings with environment variable validation.
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────────────────
    VERSION: str = "2.4.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # ── Database ─────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://routeiq:routeiq_secret@localhost:5432/routeiq_db"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 40
    DB_POOL_TIMEOUT: int = 30

    # ── Redis ────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 300

    # ── Kafka ────────────────────────────────────────────────────
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_CONSUMER_GROUP: str = "routeiq-api-group"
    KAFKA_TOPICS: List[str] = [
        "road-segments", "satellite-imagery", "climate-data",
        "complaints", "traffic-data", "maintenance-events", "agent-actions"
    ]

    # ── Auth ─────────────────────────────────────────────────────
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ─────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://app.routeiq-x.io",
    ]

    # ── External APIs ────────────────────────────────────────────
    OPENWEATHER_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    TOMTOM_API_KEY: str = ""
    SENTINEL_HUB_CLIENT_ID: str = ""
    SENTINEL_HUB_CLIENT_SECRET: str = ""
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = "us-east-1-aws"

    # ── MLflow ───────────────────────────────────────────────────
    MLFLOW_TRACKING_URI: str = "http://mlflow:5000"
    MODEL_REGISTRY_NAME: str = "routeiq-models"

    # ── OpenTelemetry ────────────────────────────────────────────
    OTEL_ENDPOINT: str = "http://jaeger:4317"
    OTEL_SERVICE_NAME: str = "routeiq-api-gateway"

    # ── Storage ──────────────────────────────────────────────────
    S3_BUCKET: str = "routeiq-x-artifacts"
    AWS_REGION: str = "ap-south-1"

    # ── Multi-Tenancy ────────────────────────────────────────────
    MAX_TENANTS: int = 100
    DEFAULT_TENANT_QUOTA_ROADS: int = 100_000
    DEFAULT_TENANT_QUOTA_REQUESTS_HOUR: int = 10_000

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
