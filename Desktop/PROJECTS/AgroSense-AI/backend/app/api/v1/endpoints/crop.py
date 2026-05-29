"""
AgroSense AI — Crop Intelligence Endpoints
============================================
Module 2: Yield prediction, crop recommendation, and SHAP explainability.
"""

import structlog
from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.api.v1.deps import CurrentUser, DBSession, require_subscription
from app.schemas.crop import (
    CropRecommendRequest,
    CropRecommendResponse,
    CropYieldPredictRequest,
    CropYieldPredictResponse,
)
from app.services.crop_service import CropIntelligenceService

logger = structlog.get_logger(__name__)
router = APIRouter()


@router.post(
    "/yield",
    response_model=CropYieldPredictResponse,
    summary="Predict crop yield for a district",
    description=(
        "Predict expected crop yield (kg/ha) using Random Forest + CatBoost ensemble, "
        "with SHAP-based feature importance for explainability."
    ),
)
async def predict_crop_yield(
    request: CropYieldPredictRequest,
    db: DBSession,
    current_user: CurrentUser,
):
    """Predict crop yield with SHAP explainability."""
    service = CropIntelligenceService(db)
    try:
        result = await service.predict_yield(request)
        logger.info(
            "yield_predicted",
            district=request.district_name,
            crop=request.crop_name,
            predicted_kg_ha=result.predicted_yield_kg_per_ha,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error("yield_prediction_error", error=str(e))
        raise HTTPException(status_code=500, detail="Yield prediction failed.")


@router.post(
    "/recommend",
    response_model=CropRecommendResponse,
    summary="Get top-3 crop recommendations for a district",
    description=(
        "Multiclass LightGBM classifier recommends best crops for a district "
        "based on soil profile, weather, season, and water availability."
    ),
)
async def recommend_crops(
    request: CropRecommendRequest,
    db: DBSession,
    current_user: CurrentUser,
):
    """LightGBM-powered crop recommendation with advisory text."""
    service = CropIntelligenceService(db)
    try:
        return await service.recommend_crops(request)
    except Exception as e:
        logger.error("recommendation_error", error=str(e))
        raise HTTPException(status_code=500, detail="Crop recommendation failed.")


@router.get(
    "/shap/{district_name}",
    summary="Get SHAP feature importance for a district",
    description="Returns SHAP summary plots and feature importance for the yield model.",
)
async def get_shap_explanation(
    district_name: str = Path(..., description="Vidarbha district name"),
    crop_name: str = "Cotton",
    db: DBSession = None,
    current_user: CurrentUser = None,
    _: None = Depends(require_subscription("agribusiness", "insurance", "government")),
):
    """Return SHAP feature importance for a district-crop combination."""
    service = CropIntelligenceService(db)
    try:
        return await service.get_shap_summary(district_name, crop_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/crops",
    summary="List all supported crops",
)
async def list_crops():
    """Return the list of all crops supported by the prediction models."""
    return {
        "kharif": ["Cotton", "Soybean", "Jowar", "Tur (Arhar)", "Maize", "Paddy", "Groundnut"],
        "rabi": ["Wheat", "Gram (Chana)", "Linseed", "Sunflower", "Safflower"],
        "zaid": ["Watermelon", "Cucumber", "Moong"],
    }
