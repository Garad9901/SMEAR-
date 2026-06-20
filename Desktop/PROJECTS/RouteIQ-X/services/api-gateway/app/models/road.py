"""
RouteIQ X — Road Segment Model
SQLAlchemy model mapping for the PostGIS road_segments table.
"""

from sqlalchemy import Column, String, Integer, Float, Date, DateTime, Numeric, BigInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from .base import Base

class RoadSegment(Base):
    __tablename__ = "road_segments"
    __table_args__ = {"schema": "routeiq"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    external_id = Column(String(64), nullable=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("routeiq.tenants.id", ondelete="CASCADE"), nullable=False)
    osm_way_id = Column(BigInteger, nullable=True)
    name = Column(String(512), nullable=True)
    city = Column(String(128), nullable=False)
    country = Column(String(64), nullable=True)
    
    # Geometry columns mapped directly
    geometry = Column(String, nullable=False)
    bbox = Column(String, nullable=True)
    length_m = Column(Float, nullable=True)
    
    # Structural attributes
    highway_type = Column(String(32), nullable=True)
    surface_type = Column(String(32), nullable=True)
    lanes = Column(Integer, default=2)
    speed_limit_kmh = Column(Integer, nullable=True)
    direction = Column(String(16), nullable=True)
    age_years = Column(Integer, nullable=True)
    
    # Health and degradation indices
    rhi_score = Column(Float, nullable=True)
    risk_level = Column(String(16), nullable=True)
    priority_score = Column(Integer, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    
    # Predictive insights
    predicted_failure_date = Column(Date, nullable=True)
    failure_probability_90d = Column(Float, nullable=True)
    rhi_forecast_30d = Column(Float, nullable=True)
    rhi_forecast_60d = Column(Float, nullable=True)
    rhi_forecast_90d = Column(Float, nullable=True)
    
    # Usage metrics
    traffic_load_score = Column(Float, nullable=True)
    annual_traffic_volume = Column(Integer, nullable=True)
    
    # Maintenance cost estimates
    repair_cost_estimate = Column(Numeric(15, 2), nullable=True)
    last_repair_cost = Column(Numeric(15, 2), nullable=True)
    
    # Environmental factors
    rainfall_mm_annual = Column(Float, nullable=True)
    freeze_thaw_cycles = Column(Integer, default=0)
    temperature_avg_c = Column(Float, nullable=True)
    
    # Crowdsourced tickets
    complaint_count_30d = Column(Integer, default=0)
    complaint_count_90d = Column(Integer, default=0)
    complaint_cluster_score = Column(Float, nullable=True)
    
    # Inspections log
    last_inspected_at = Column(Date, nullable=True)
    last_maintained_at = Column(Date, nullable=True)
    maintenance_count = Column(Integer, default=0)
    
    # Lineage and audit information
    data_sources = Column(JSONB, default=[])
    satellite_imagery_date = Column(Date, nullable=True)
    osm_version = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
