"""
AgroSense AI — Risk & Alert Pydantic Schemas
=============================================
Schemas for drought/flood risk index and alert management.
"""

import uuid
from datetime import date, datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ─────────────────────────────────────────────────────────────────────────────
# Risk Index Schemas
# ─────────────────────────────────────────────────────────────────────────────
class DistrictRiskScore(BaseModel):
    """Risk score for a single district."""
    district_name: str
    district_id: int
    composite_score: float = Field(..., ge=0, le=100)
    risk_level: str  # low | medium | high | critical
    drought_score: Optional[float] = None
    drought_category: Optional[str] = None
    flood_probability: Optional[float] = None
    flood_category: Optional[str] = None
    anomaly_score: Optional[float] = None
    index_date: date
    latitude: float
    longitude: float


class RiskIndexResponse(BaseModel):
    """Risk index for one or all districts."""
    as_of_date: date
    districts: List[DistrictRiskScore]
    critical_count: int
    high_count: int
    model_version: Optional[str] = None
    generated_at: datetime


class DroughtAnalysisResponse(BaseModel):
    """Detailed drought analysis for a district."""
    district_name: str
    analysis_date: date
    spi_30d: Optional[float] = None
    spi_90d: Optional[float] = None
    spi_180d: Optional[float] = None
    drought_category: str
    consecutive_dry_days: int
    rainfall_deficit_mm: float
    historical_percentile: float
    isolation_forest_score: float
    autoencoder_reconstruction_loss: float
    is_anomaly: bool
    advisory: str
    generated_at: datetime


class FloodAnalysisResponse(BaseModel):
    """GNN-based flood risk analysis for a district."""
    district_name: str
    analysis_date: date
    flood_probability: float
    flood_category: str
    gnn_node_embedding_norm: Optional[float] = None
    upstream_districts_at_risk: List[str]
    downstream_impact_probability: Optional[float] = None
    spatial_risk_map_url: Optional[str] = None
    advisory: str
    generated_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# Alert Schemas
# ─────────────────────────────────────────────────────────────────────────────
class AlertTriggerRequest(BaseModel):
    """Manually trigger an alert for a district."""
    district_id: int
    alert_type: str = Field(
        ..., description="heavy_rain | drought | flood | crop_advisory"
    )
    severity: str = Field(..., description="info | warning | critical")
    title: str = Field(..., max_length=200)
    message: str = Field(..., max_length=1000)
    channel: str = Field(default="all", description="sms | push | email | all")
    recipient_phones: Optional[List[str]] = None

    @field_validator("alert_type")
    @classmethod
    def validate_alert_type(cls, v: str) -> str:
        allowed = {"heavy_rain", "drought", "flood", "crop_advisory", "system"}
        if v not in allowed:
            raise ValueError(f"Alert type must be one of: {allowed}")
        return v

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        if v not in {"info", "warning", "critical"}:
            raise ValueError("Severity must be info, warning, or critical")
        return v


class AlertResponse(BaseModel):
    """Alert delivery response."""
    alert_id: uuid.UUID
    district_name: str
    alert_type: str
    severity: str
    title: str
    message: str
    channel: str
    sms_status: Optional[str] = None
    push_status: Optional[str] = None
    recipients_notified: int
    triggered_at: datetime
    delivered: bool

    model_config = {"from_attributes": True}


class AlertHistoryResponse(BaseModel):
    """Paginated alert history."""
    district_name: Optional[str] = None
    total: int
    page: int
    page_size: int
    alerts: List[AlertResponse]
