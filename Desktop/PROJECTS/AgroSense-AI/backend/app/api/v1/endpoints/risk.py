"""
AgroSense AI — Drought & Flood Risk Endpoints
===============================================
Module 3: Composite risk index, drought analysis, flood GNN probability.
"""

from datetime import date
from typing import Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Path, Query

from app.api.v1.deps import CurrentUser, DBSession, require_subscription
from app.core.config import settings
from app.schemas.risk import (
    DroughtAnalysisResponse,
    FloodAnalysisResponse,
    RiskIndexResponse,
)
from app.services.risk_service import RiskAnalysisService

logger = structlog.get_logger(__name__)
router = APIRouter()


@router.get(
    "/index",
    response_model=RiskIndexResponse,
    summary="Get composite risk index for all 11 districts",
    description=(
        "Returns the current drought + flood composite risk score (0–100) for all "
        "Vidarbha districts. Powers the choropleth map in the dashboard."
    ),
)
async def get_risk_index_all(
    as_of_date: Optional[date] = Query(None, description="Date to query (defaults to today)"),
    db: DBSession = None,
    current_user: CurrentUser = None,
):
    """Composite risk index for all 11 Vidarbha districts."""
    service = RiskAnalysisService(db)
    return await service.get_all_district_risk(as_of_date=as_of_date)


@router.get(
    "/index/{district_name}",
    response_model=RiskIndexResponse,
    summary="Get risk index for a specific district",
)
async def get_risk_index_district(
    district_name: str = Path(..., description="Vidarbha district name"),
    as_of_date: Optional[date] = Query(None),
    db: DBSession = None,
    current_user: CurrentUser = None,
):
    """Composite risk index for a single district."""
    if district_name not in settings.VIDARBHA_DISTRICTS:
        raise HTTPException(status_code=404, detail=f"District '{district_name}' not found.")
    service = RiskAnalysisService(db)
    return await service.get_district_risk(district_name, as_of_date=as_of_date)


@router.get(
    "/drought/{district_name}",
    response_model=DroughtAnalysisResponse,
    summary="Detailed drought analysis for a district",
    description=(
        "Isolation Forest + Autoencoder anomaly detection for drought severity. "
        "Includes SPI-30, SPI-90, consecutive dry days, and anomaly scores."
    ),
)
async def get_drought_analysis(
    district_name: str = Path(...),
    analysis_date: Optional[date] = Query(None),
    db: DBSession = None,
    current_user: CurrentUser = None,
):
    """Drought severity analysis using Isolation Forest + Autoencoder."""
    if district_name not in settings.VIDARBHA_DISTRICTS:
        raise HTTPException(status_code=404, detail="District not found.")
    service = RiskAnalysisService(db)
    return await service.analyze_drought(district_name, analysis_date)


@router.get(
    "/flood/{district_name}",
    response_model=FloodAnalysisResponse,
    summary="GNN-based flood probability for a district",
    description=(
        "PyTorch Geometric GNN on the district adjacency graph predicts flood "
        "probability and spatial risk propagation from upstream districts."
    ),
)
async def get_flood_analysis(
    district_name: str = Path(...),
    db: DBSession = None,
    current_user: CurrentUser = None,
    _: None = Depends(require_subscription("agribusiness", "insurance", "government")),
):
    """GNN flood probability and spatial diffusion analysis."""
    if district_name not in settings.VIDARBHA_DISTRICTS:
        raise HTTPException(status_code=404, detail="District not found.")
    service = RiskAnalysisService(db)
    return await service.analyze_flood(district_name)


@router.get(
    "/geojson",
    summary="GeoJSON risk map for choropleth visualization",
    description="Returns GeoJSON FeatureCollection with risk scores for Folium/Mapbox maps.",
)
async def get_risk_geojson(
    as_of_date: Optional[date] = Query(None),
    db: DBSession = None,
    current_user: CurrentUser = None,
):
    """GeoJSON output with district geometries and risk scores."""
    service = RiskAnalysisService(db)
    return await service.get_risk_geojson(as_of_date=as_of_date)
