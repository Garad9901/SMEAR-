"""
AgroSense AI — Async Database Engine
=====================================
SQLAlchemy 2.0 async engine with PostGIS support.
"""

from typing import AsyncGenerator

from sqlalchemy import MetaData, event
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# ─────────────────────────────────────────────────────────────────────────────
# Async Engine
# ─────────────────────────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.APP_DEBUG,
    pool_pre_ping=True,           # Test connections before use
    pool_size=10,                 # Max persistent connections
    max_overflow=20,              # Extra connections under load
    pool_recycle=3600,            # Recycle connections every hour
    pool_timeout=30,              # Timeout waiting for a connection
)

# ─────────────────────────────────────────────────────────────────────────────
# Session Factory
# ─────────────────────────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,       # Don't expire after commit for async
    autocommit=False,
    autoflush=False,
)

# ─────────────────────────────────────────────────────────────────────────────
# Naming Convention for Alembic Migrations
# ─────────────────────────────────────────────────────────────────────────────
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


# ─────────────────────────────────────────────────────────────────────────────
# Declarative Base
# ─────────────────────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


# ─────────────────────────────────────────────────────────────────────────────
# Dependency: Get DB Session
# ─────────────────────────────────────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields an async database session.
    Automatically rolls back on exception and closes on completion.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
