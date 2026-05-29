"""
AgroSense AI — Rainfall Pydantic Schemas
==========================================
Request/response schemas for rainfall forecasting endpoints.
"""

import uuid
from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

from app.core.config import settings


# ─────────────────────────────────────────────────────────────────────────────
# Request Schemas
# ─────────────────────────────────────────────────────────────────────────────
class RainfallForecastRequest(BaseModel):
    """Request payload for district-level rainfall forecast."""
    district_name: str = Field(..., description="One of the 11 Vidarbha districts")
    horizon_days: int = Field(
        default=7, ge=1, le=90, description="Forecast horizon (1–90 days)"
    )
    model: str = Field(
        default="ensemble",
        description="Model to use: xgboost | lstm | transformer | sarima | ensemble",
    )
    include_uncertainty: bool = Field(
        default=True, description="Include Bayesian uncertainty bounds"
    )

    @field_validator("district_name")
    @classmethod
    def validate_district(cls, v: str) -> str:
        if v not in settings.VIDARBHA_DISTRICTS:
            raise ValueError(f"District must be one of: {settings.VIDARBHA_DISTRICTS}")
        return v

    @field_validator("model")
    @classmethod
    def validate_model(cls, v: str) -> str:
        allowed = {"xgboost", "lstm", "transformer", "sarima", "ensemble"}
        if v not in allowed:
            raise ValueError(f"Model must be one of: {allowed}")
        return v


class SeasonalForecastRequest(BaseModel):
    """Request for long-term seasonal rainfall forecast."""
    district_name: str
    season: str = Field(
        ..., description="Target season: kharif | rabi | annual"
    )
    year: int = Field(..., ge=2024, le=2030)

    @field_validator("season")
    @classmethod
    def validate_season(cls, v: str) -> str:
        if v not in {"kharif", "rabi", "annual"}:
            raise ValueError("Season must be kharif, rabi, or annual")
        return v


# ─────────────────────────────────────────────────────────────────────────────
# Response Schemas
# ─────────────────────────────────────────────────────────────────────────────
class DailyForecastPoint(BaseModel):
    """Single day forecast data point."""
    date: date
    day_number: int
    predicted_rainfall_mm: float
    lower_bound_mm: Optional[float] = None
    upper_bound_mm: Optional[float] = None
    confidence_pct: Optional[float] = None
    category: str  # no_rain | light | moderate | heavy | very_heavy | extreme


class RainfallForecastResponse(BaseModel):
    """Full rainfall forecast response for a district."""
    forecast_id: uuid.UUID
    district_name: str
    district_id: int
    forecast_generated_at: datetime
    model_used: str
    horizon_days: int
    daily_forecasts: List[DailyForecastPoint]
    total_predicted_mm: float
    peak_day: Optional[date] = None
    peak_value_mm: Optional[float] = None
    alert_triggered: bool
    alert_message: Optional[str] = None
    model_metrics: Optional[dict] = None

    model_config = {"from_attributes": True}


class SeasonalForecastResponse(BaseModel):
    """Seasonal rainfall forecast summary."""
    district_name: str
    season: str
    year: int
    predicted_total_mm: float
    historical_avg_mm: float
    deviation_pct: float
    forecast_category: str  # below_normal | normal | above_normal
    confidence_pct: float
    monthly_breakdown: List[dict]
    model_used: str
    generated_at: datetime


class RainfallHistoryResponse(BaseModel):
    """Historical rainfall data for a district."""
    district_name: str
    start_date: date
    end_date: date
    records: List[dict]
    total_records: int
    avg_rainfall_mm: float
    max_rainfall_mm: float
    total_rainfall_mm: float
