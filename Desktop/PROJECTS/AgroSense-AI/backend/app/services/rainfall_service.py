"""
AgroSense AI — Rainfall Forecast Service
==========================================
Business logic for rainfall forecasting.
Loads trained models from disk and runs inference for API responses.
"""

import json
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Optional

import numpy as np
import pandas as pd
import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.district import District
from app.models.rainfall import RainfallForecast, RainfallObservation
from app.schemas.rainfall import (
    DailyForecastPoint,
    RainfallForecastRequest,
    RainfallForecastResponse,
    RainfallHistoryResponse,
    SeasonalForecastRequest,
    SeasonalForecastResponse,
)
from ml.module1_rainfall.predict import RainfallPredictor

logger = structlog.get_logger(__name__)


class RainfallForecastService:
    """
    Orchestrates rainfall forecasting across all models.
    Loads pre-trained models from the model registry.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.predictor = RainfallPredictor()
        self._models_cache: dict = {}

    # ─────────────────────────────────────────────────────────────────────────
    # Main Forecast Entry Point
    # ─────────────────────────────────────────────────────────────────────────
    async def generate_forecast(
        self,
        request: RainfallForecastRequest,
        requested_by=None,
    ) -> RainfallForecastResponse:
        """
        Generate a district-level rainfall forecast.

        Steps:
        1. Fetch district ID from DB
        2. Load recent observations for feature engineering
        3. Run selected model(s)
        4. Categorize each day, check alert thresholds
        5. Persist forecast to DB
        6. Return structured response
        """
        # Fetch district
        district = await self._get_district(request.district_name)
        if not district:
            raise ValueError(f"District '{request.district_name}' not configured in database.")

        # Fetch recent observations for feature engineering
        recent_obs = await self._fetch_recent_observations(district.id, days=30)

        # Build feature matrix
        features = self._engineer_features(recent_obs)

        # Run inference
        if request.model == "ensemble":
            predictions, lower, upper = await self._run_ensemble(
                features, request.horizon_days, request.include_uncertainty
            )
        else:
            predictions, lower, upper = await self._run_single_model(
                request.model, features, request.horizon_days, request.include_uncertainty
            )

        # Build daily forecast points
        today = date.today()
        daily_forecasts = []
        for i, pred in enumerate(predictions):
            target_date = today + timedelta(days=i + 1)
            daily_forecasts.append(
                DailyForecastPoint(
                    date=target_date,
                    day_number=i + 1,
                    predicted_rainfall_mm=round(max(0.0, float(pred)), 2),
                    lower_bound_mm=round(max(0.0, float(lower[i])), 2) if lower is not None else None,
                    upper_bound_mm=round(max(0.0, float(upper[i])), 2) if upper is not None else None,
                    confidence_pct=85.0,
                    category=self._categorize_rainfall(float(pred)),
                )
            )

        # Check alert thresholds
        peak = max(daily_forecasts, key=lambda d: d.predicted_rainfall_mm)
        alert_triggered = peak.predicted_rainfall_mm >= settings.HEAVY_RAIN_THRESHOLD_MM
        alert_message = None
        if alert_triggered:
            if peak.predicted_rainfall_mm >= settings.EXTREME_RAIN_THRESHOLD_MM:
                alert_message = (
                    f"⚠️ EXTREME RAIN WARNING: {peak.predicted_rainfall_mm:.0f}mm expected "
                    f"on {peak.date} in {request.district_name}"
                )
            else:
                alert_message = (
                    f"⚠️ HEAVY RAIN ALERT: {peak.predicted_rainfall_mm:.0f}mm expected "
                    f"on {peak.date} in {request.district_name}"
                )

        # Persist to DB
        forecast_id = uuid.uuid4()
        db_forecast = RainfallForecast(
            id=forecast_id,
            district_id=district.id,
            forecast_date=datetime.now(timezone.utc),
            target_date=today + timedelta(days=1),
            horizon_days=request.horizon_days,
            predicted_rainfall_mm=predictions[0],
            lower_bound_mm=float(lower[0]) if lower is not None else None,
            upper_bound_mm=float(upper[0]) if upper is not None else None,
            confidence_pct=85.0,
            model_name=request.model,
            alert_triggered=alert_triggered,
        )
        self.db.add(db_forecast)

        return RainfallForecastResponse(
            forecast_id=forecast_id,
            district_name=request.district_name,
            district_id=district.id,
            forecast_generated_at=datetime.now(timezone.utc),
            model_used=request.model,
            horizon_days=request.horizon_days,
            daily_forecasts=daily_forecasts,
            total_predicted_mm=round(sum(d.predicted_rainfall_mm for d in daily_forecasts), 2),
            peak_day=peak.date,
            peak_value_mm=peak.predicted_rainfall_mm,
            alert_triggered=alert_triggered,
            alert_message=alert_message,
        )

    async def generate_seasonal_forecast(
        self, request: SeasonalForecastRequest
    ) -> SeasonalForecastResponse:
        """Generate seasonal SARIMA + Transformer forecast."""
        res = self.predictor.predict_seasonal(request.district_name, request.season, request.year)
        
        return SeasonalForecastResponse(
            district_name=request.district_name,
            season=request.season,
            year=request.year,
            predicted_total_mm=res["predicted_total_mm"],
            historical_avg_mm=res["historical_avg_mm"],
            deviation_pct=res["deviation_pct"],
            forecast_category=res["forecast_category"],
            confidence_pct=78.0,
            monthly_breakdown=res["monthly_breakdown"],
            model_used="sarima_transformer_ensemble",
            generated_at=datetime.now(timezone.utc),
        )

    async def get_history(
        self, district_name: str, start_date: date, end_date: date
    ) -> RainfallHistoryResponse:
        """Fetch historical rainfall observations from DB."""
        district = await self._get_district(district_name)
        if not district:
            raise ValueError(f"District {district_name} not found")

        stmt = (
            select(RainfallObservation)
            .where(RainfallObservation.district_id == district.id)
            .where(RainfallObservation.observation_date >= start_date)
            .where(RainfallObservation.observation_date <= end_date)
            .order_by(RainfallObservation.observation_date)
        )
        result = await self.db.execute(stmt)
        observations = result.scalars().all()

        records = [
            {
                "date": str(obs.observation_date),
                "rainfall_mm": obs.rainfall_mm,
                "temperature_avg_c": obs.temperature_avg_c,
                "humidity_pct": obs.humidity_pct,
                "wind_speed_kmh": obs.wind_speed_kmh,
                "category": obs.rain_category,
            }
            for obs in observations
        ]

        rainfall_values = [r["rainfall_mm"] for r in records if r["rainfall_mm"] is not None]
        return RainfallHistoryResponse(
            district_name=district_name,
            start_date=start_date,
            end_date=end_date,
            records=records,
            total_records=len(records),
            avg_rainfall_mm=round(np.mean(rainfall_values), 2) if rainfall_values else 0.0,
            max_rainfall_mm=round(max(rainfall_values), 2) if rainfall_values else 0.0,
            total_rainfall_mm=round(sum(rainfall_values), 2) if rainfall_values else 0.0,
        )

    # ─────────────────────────────────────────────────────────────────────────
    # Private Helpers
    # ─────────────────────────────────────────────────────────────────────────
    async def _get_district(self, name: str) -> Optional[District]:
        result = await self.db.execute(select(District).where(District.name == name))
        return result.scalar_one_or_none()

    async def _fetch_recent_observations(self, district_id: int, days: int = 30):
        """Fetch recent observations for feature engineering."""
        cutoff = date.today() - timedelta(days=days)
        stmt = (
            select(RainfallObservation)
            .where(RainfallObservation.district_id == district_id)
            .where(RainfallObservation.observation_date >= cutoff)
            .order_by(RainfallObservation.observation_date.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    def _engineer_features(self, observations: list) -> np.ndarray:
        """Build feature matrix from recent observations."""
        if not observations:
            # Return mock features for when DB is empty (dev mode)
            return np.random.rand(1, 12)

        records = []
        for obs in observations:
            records.append({
                "rainfall": obs.rainfall_mm or 0.0,
                "temp": obs.temperature_avg_c or 25.0,
                "humidity": obs.humidity_pct or 60.0,
                "wind": obs.wind_speed_kmh or 10.0,
                "month_sin": obs.month_sin or 0.0,
                "month_cos": obs.month_cos or 1.0,
                "lag_1": obs.lag_1_rainfall or 0.0,
                "lag_7": obs.lag_7_rainfall or 0.0,
                "rolling_7": obs.rolling_mean_7d or 0.0,
                "rolling_14": obs.rolling_mean_14d or 0.0,
            })

        df = pd.DataFrame(records)
        return df.values[-1:] if len(df) > 0 else np.zeros((1, 10))

    async def _run_ensemble(self, features: np.ndarray, horizon: int, include_uncertainty: bool):
        """Run XGBoost + LSTM ensemble forecast."""
        preds, lower, upper = self.predictor.predict_7day(
            features, model_type="ensemble", include_uncertainty=include_uncertainty
        )
        # Squeeze to fit horizon size
        preds = preds[:horizon]
        if lower is not None:
            lower = lower[:horizon]
        if upper is not None:
            upper = upper[:horizon]
        return preds, lower, upper

    async def _run_single_model(self, model_name: str, features: np.ndarray, horizon: int, uncertainty: bool):
        """Run a specific model for forecasting."""
        preds, lower, upper = self.predictor.predict_7day(
            features, model_type=model_name, include_uncertainty=uncertainty
        )
        return preds[:horizon], (lower[:horizon] if lower is not None else None), (upper[:horizon] if upper is not None else None)

    @staticmethod
    def _categorize_rainfall(mm: float) -> str:
        """IMD rainfall classification."""
        if mm == 0:
            return "no_rain"
        elif mm < 2.5:
            return "light"
        elif mm < 15.6:
            return "moderate"
        elif mm < 64.5:
            return "heavy"
        elif mm < 115.6:
            return "very_heavy"
        else:
            return "extreme"

    @staticmethod
    def _get_historical_seasonal_avg(district: str, season: str) -> float:
        """Historical seasonal averages for Vidarbha (approximate IMD data)."""
        avgs = {
            "kharif": {"Nagpur": 1100, "Amravati": 820, "Wardha": 880,
                       "Yavatmal": 900, "Akola": 760, "Buldhana": 720,
                       "Washim": 780, "Chandrapur": 1200, "Gadchiroli": 1500,
                       "Gondia": 1300, "Bhandara": 1250},
            "rabi": {"Nagpur": 80, "Amravati": 60, "Wardha": 70,
                     "Yavatmal": 65, "Akola": 55, "Buldhana": 50,
                     "Washim": 58, "Chandrapur": 95, "Gadchiroli": 110,
                     "Gondia": 100, "Bhandara": 90},
        }
        season_key = "kharif" if season in ["kharif", "annual"] else "rabi"
        return avgs.get(season_key, {}).get(district, 900)

    @staticmethod
    def _get_season_months(season: str) -> list:
        return {
            "kharif": ["June", "July", "August", "September"],
            "rabi": ["October", "November", "December", "January"],
            "annual": ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        }.get(season, ["June", "July", "August", "September"])
