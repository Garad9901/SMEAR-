"""
RouteIQ X — Maintenance Task Model
SQLAlchemy model mapping for the maintenance_tasks table.
"""

from sqlalchemy import Column, String, Integer, Float, Date, DateTime, Numeric, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from .base import Base

class MaintenanceTask(Base):
    __tablename__ = "maintenance_tasks"
    __table_args__ = {"schema": "routeiq"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("routeiq.tenants.id"), nullable=False)
    segment_id = Column(UUID(as_uuid=True), ForeignKey("routeiq.road_segments.id"), nullable=False)
    
    task_type = Column(String(32), nullable=True)
    priority = Column(String(16), nullable=True)
    status = Column(String(32), nullable=True)
    
    # Schedule info
    scheduled_date = Column(Date, nullable=True)
    estimated_days = Column(Integer, nullable=True)
    actual_start_date = Column(Date, nullable=True)
    actual_end_date = Column(Date, nullable=True)
    
    # Cost matrices
    estimated_cost = Column(Numeric(15, 2), nullable=True)
    actual_cost = Column(Numeric(15, 2), nullable=True)
    cost_savings = Column(Numeric(15, 2), nullable=True)
    
    # Resource assignment
    assigned_team = Column(String(128), nullable=True)
    crew_size = Column(Integer, nullable=True)
    equipment = Column(JSONB, default=[])
    
    # AI lineage
    ai_generated = Column(Boolean, default=True)
    ai_agent = Column(String(64), default="Maintenance Planning Agent")
    ai_confidence = Column(Float, nullable=True)
    human_approved_by = Column(UUID(as_uuid=True), nullable=True)
    human_approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Validation
    rhi_before = Column(Float, nullable=True)
    rhi_after = Column(Float, nullable=True)
    verified_by_agent = Column(Boolean, default=False)
    verification_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
