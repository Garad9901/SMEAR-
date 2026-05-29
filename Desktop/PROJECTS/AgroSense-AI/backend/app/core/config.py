"""
AgroSense AI — Application Configuration
========================================
Typed settings using pydantic-settings v2.
All values read from environment variables with defaults.
"""

from functools import lru_cache
from typing import List

from pydantic import AnyUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── Application ──────────────────────────────────────────────────────────
    APP_NAME: str = "AgroSense AI"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    # ─── Security / JWT ───────────────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production-use-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── CORS ─────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",   # React dev
        "http://localhost:8501",   # Streamlit
        "http://localhost:80",
        "https://agrosense.ai",
    ]

    # ─── Database ─────────────────────────────────────────────────────────────
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "agrosense"
    POSTGRES_USER: str = "agrosense_user"
    POSTGRES_PASSWORD: str = "agrosense_password"
    DATABASE_URL: str = (
        "postgresql+asyncpg://agrosense_user:agrosense_password@localhost:5432/agrosense"
    )

    # ─── Redis ────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ─── MLflow ───────────────────────────────────────────────────────────────
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MLFLOW_EXPERIMENT_NAME: str = "agrosense_production"

    # ─── AWS ──────────────────────────────────────────────────────────────────
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_DEFAULT_REGION: str = "ap-south-1"
    AWS_S3_BUCKET: str = "agrosense-data"
    AWS_S3_MODEL_BUCKET: str = "agrosense-models"

    # ─── Twilio SMS ───────────────────────────────────────────────────────────
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    # ─── Firebase ─────────────────────────────────────────────────────────────
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_CREDENTIALS_PATH: str = "./infra/firebase-service-account.json"

    # ─── Razorpay ─────────────────────────────────────────────────────────────
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # ─── External Data APIs ───────────────────────────────────────────────────
    IMD_API_KEY: str = ""
    NASA_POWER_API_URL: str = "https://power.larc.nasa.gov/api/temporal/daily/point"

    # ─── Vidarbha Districts ───────────────────────────────────────────────────
    VIDARBHA_DISTRICTS: List[str] = [
        "Nagpur", "Amravati", "Wardha", "Yavatmal", "Akola",
        "Buldhana", "Washim", "Chandrapur", "Gadchiroli", "Gondia", "Bhandara",
    ]

    # ─── Model Paths ──────────────────────────────────────────────────────────
    MODEL_BASE_PATH: str = "./models"
    RAINFALL_MODEL_PATH: str = "./models/rainfall"
    CROP_MODEL_PATH: str = "./models/crop"
    RISK_MODEL_PATH: str = "./models/risk"

    # ─── Alert Thresholds ─────────────────────────────────────────────────────
    HEAVY_RAIN_THRESHOLD_MM: float = 64.5      # IMD heavy rain
    EXTREME_RAIN_THRESHOLD_MM: float = 115.6   # IMD extreme rain
    DROUGHT_RISK_THRESHOLD: float = 0.70       # Risk index score
    FLOOD_PROBABILITY_THRESHOLD: float = 0.75  # GNN probability

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def build_database_url(cls, v: str, info) -> str:
        """Allow override from env or auto-build from components."""
        return v


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — singleton pattern."""
    return Settings()


# Module-level singleton
settings = get_settings()
