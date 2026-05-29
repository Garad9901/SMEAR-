"""
AgroSense AI — Rainfall Forecasting Endpoints
===============================================
Module 1: 7-day XGBoost+LSTM forecasts and seasonal SARIMA+Transformer predictions.
"""

from datetime import date, datetime, timezone
from typing import List, Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import CurrentUser, DBSession, Pagination, require_subscription
from app.core.config import settings
from app.models.district import District
from app.models.rainfall import RainfallForecast, RainfallObservation
from app.schemas.rainfall import (
    RainfallForecastRequest,
    RainfallForecastResponse,
    RainfallHistoryResponse,
    SeasonalForecastRequest,
    SeasonalForecastResponse,
)
from app.services.rainfall_service import RainfallForecastService

logger = structlog.get_logger(__name__)
router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# 7-Day Forecast
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/forecast",
    response_model=RainfallForecastResponse,
    summary="Generate 7-day district rainfall forecast",
    description=(
        "Generate short-term rainfall forecast (1–90 days) for a Vidarbha district "
        "using XGBoost, LSTM, or ensemble model with optional Bayesian uncertainty bounds."
    ),
)
async def forecast_rainfall(
    request: RainfallForecastRequest,
    db: DBSession,
    current_user: CurrentUser,
    _: None = Depends(require_subscription("farmer", "agribusiness", "insurance", "government")),
):
    """Generate district-level rainfall forecast."""
    service = RainfallForecastService(db)
    try:
        result = await service.generate_forecast(request, requested_by=current_user)
        logger.info(
            "forecast_generated",
            district=request.district_name,
            horizon=request.horizon_days,
            model=request.model,
            user_id=str(current_user.id),
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error("forecast_error", error=str(e), district=request.district_name)
        raise HTTPException(status_code=500, detail="Forecast generation failed.")


# ─────────────────────────────────────────────────────────────────────────────
# Seasonal Forecast
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/forecast/seasonal",
    response_model=SeasonalForecastResponse,
    summary="Seasonal rainfall outlook (SARIMA + Transformer)",
    description=(
        "Long-term seasonal rainfall forecast for kharif or rabi season "
        "using SARIMA + Temporal Transformer ensemble."
    ),
)
async def forecast_seasonal(
    request: SeasonalForecastRequest,
    db: DBSession,
    current_user: CurrentUser,
    _: None = Depends(require_subscription("agribusiness", "insurance", "government")),
):
    """Seasonal rainfall outlook for planning and insurance purposes."""
    service = RainfallForecastService(db)
    try:
        return await service.generate_seasonal_forecast(request)
    except Exception as e:
        logger.error("seasonal_forecast_error", error=str(e))
        raise HTTPException(status_code=500, detail="Seasonal forecast failed.")


# ─────────────────────────────────────────────────────────────────────────────
# All Districts — Snapshot
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/forecast/all-districts",
    response_model=List[dict],
    summary="7-day forecast snapshot for all 11 districts",
)
async def forecast_all_districts(
    horizon_days: int = Query(default=7, ge=1, le=14),
    db: DBSession = None,
    current_user: CurrentUser = None,
    _: None = Depends(require_subscription("agribusiness", "insurance", "government")),
):
    """Batch 7-day forecast for all 11 Vidarbha districts (for dashboard map)."""
    service = RainfallForecastService(db)
    results = []
    for district_name in settings.VIDARBHA_DISTRICTS:
        req = RainfallForecastRequest(
            district_name=district_name,
            horizon_days=horizon_days,
            model="ensemble",
            include_uncertainty=False,
        )
        try:
            forecast = await service.generate_forecast(req, requested_by=current_user)
            results.append({
                "district": district_name,
                "total_mm": forecast.total_predicted_mm,
                "peak_day": str(forecast.peak_day) if forecast.peak_day else None,
                "peak_mm": forecast.peak_value_mm,
                "alert": forecast.alert_triggered,
            })
        except Exception:
            results.append({"district": district_name, "error": "forecast_unavailable"})
    return results


# ─────────────────────────────────────────────────────────────────────────────
# Historical Data
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/history/{district_name}",
    response_model=RainfallHistoryResponse,
    summary="Fetch historical rainfall observations",
)
async def get_rainfall_history(
    district_name: str,
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: DBSession = None,
    current_user: CurrentUser = None,
):
    """Retrieve historical daily rainfall observations for a district."""
    if district_name not in settings.VIDARBHA_DISTRICTS:
        raise HTTPException(status_code=404, detail=f"District '{district_name}' not found.")
    if (end_date - start_date).days > 365 * 5:
        raise HTTPException(status_code=400, detail="Date range cannot exceed 5 years.")

    service = RainfallForecastService(db)
    return await service.get_history(district_name, start_date, end_date)
