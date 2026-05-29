"""
AgroSense AI — Crop Pydantic Schemas
=======================================
Request/response models for crop yield prediction and recommendation.
"""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────────────────────
# Yield Prediction Schemas
# ─────────────────────────────────────────────────────────────────────────────
class SoilFeatures(BaseModel):
    """Soil composition input features."""
    soil_type: str = Field(
        ..., description="Soil type: black_cotton | red | alluvial | laterite"
    )
    soil_ph: float = Field(..., ge=3.0, le=10.0)
    nitrogen_kg_per_ha: float = Field(..., ge=0.0, le=600.0)
    phosphorus_kg_per_ha: float = Field(..., ge=0.0, le=300.0)
    potassium_kg_per_ha: float = Field(..., ge=0.0, le=600.0)
    soil_moisture_pct: float = Field(..., ge=0.0, le=100.0)
    organic_matter_pct: Optional[float] = Field(None, ge=0.0, le=20.0)


class CropYieldPredictRequest(BaseModel):
    """Request for crop yield prediction."""
    district_name: str = Field(..., description="One of the 11 Vidarbha districts")
    crop_name: str = Field(..., description="e.g., Cotton, Soybean, Wheat, Jowar, Tur")
    season: str = Field(..., description="kharif | rabi | zaid")
    year: int = Field(..., ge=2020, le=2030)
    area_ha: float = Field(..., gt=0, description="Cultivation area in hectares")
    soil: SoilFeatures
    season_rainfall_mm: float = Field(..., ge=0)
    avg_temperature_c: float = Field(..., ge=10.0, le=50.0)
    irrigation: bool = Field(default=False)
    model: str = Field(default="ensemble", description="rf | catboost | nn | ensemble")


# ─────────────────────────────────────────────────────────────────────────────
# Recommendation Schemas
# ─────────────────────────────────────────────────────────────────────────────
class CropRecommendRequest(BaseModel):
    """Request for crop recommendation."""
    district_name: str
    season: str
    soil: SoilFeatures
    season_rainfall_mm: float = Field(..., ge=0)
    avg_temperature_c: float
    water_availability: str = Field(
        default="rainfed", description="rainfed | irrigated | partially_irrigated"
    )
    market_distance_km: Optional[float] = None
    farmer_preference: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Response Schemas
# ─────────────────────────────────────────────────────────────────────────────
class ShapFeatureImportance(BaseModel):
    """SHAP feature importance for a single prediction."""
    feature_name: str
    shap_value: float
    feature_value: float
    importance_rank: int


class CropYieldPredictResponse(BaseModel):
    """Crop yield prediction response with SHAP explainability."""
    district_name: str
    crop_name: str
    season: str
    year: int
    area_ha: float
    predicted_yield_kg_per_ha: float
    predicted_total_production_tonnes: float
    yield_confidence_lower: Optional[float] = None
    yield_confidence_upper: Optional[float] = None
    model_used: str
    r2_score: Optional[float] = None
    shap_top_features: List[ShapFeatureImportance]
    advisory: str
    generated_at: datetime


class CropRecommendation(BaseModel):
    """Single crop recommendation with confidence."""
    crop_name: str
    confidence_pct: float
    expected_yield_kg_per_ha: Optional[float] = None
    market_price_inr_per_quintal: Optional[float] = None
    suitability_reasons: List[str]


class CropRecommendResponse(BaseModel):
    """Top-3 crop recommendations with district advisory."""
    district_name: str
    season: str
    recommendations: List[CropRecommendation]
    advisory_text: str
    warnings: List[str]
    generated_at: datetime
