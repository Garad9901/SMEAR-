"""
RouteIQ X — Tenant Model
SQLAlchemy model mapping for the tenants table.
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from .base import Base

class Tenant(Base):
    __tablename__ = "tenants"
    __table_args__ = {"schema": "routeiq"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    slug = Column(String(64), unique=True, nullable=False)
    name = Column(String(256), nullable=False)
    country = Column(String(64), nullable=True)
    tier = Column(String(16), default="standard")
    quota_roads = Column(Integer, default=100000)
    quota_api_hour = Column(Integer, default=10000)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    metadata_fields = Column("metadata", JSONB, default={})
