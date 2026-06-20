"""
RouteIQ X — Database Configuration
SQLAlchemy Async Engine with tenant context RLS connection hooking.
"""

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text
from .config import settings
import structlog

logger = structlog.get_logger(__name__)

# Initialize async engine with connection pooling parameters from config settings
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    echo=False
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def init_db():
    """Verify connectivity and configure target schema search path."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SET search_path TO routeiq, public;"))
            await conn.commit()
            logger.info("Successfully connected to PostgreSQL database and configured schema search path.")
    except Exception as e:
        logger.error("Failed to initialize database connection", error=str(e))
        raise

async def get_db():
    """
    Async database session dependency generator.
    Enforces tenant context limits in connection session variables for Postgres RLS.
    """
    from ..middleware.tenant import tenant_context
    
    async with AsyncSessionLocal() as session:
        # Configure search path
        await session.execute(text("SET search_path TO routeiq, public;"))
        
        # Inject tenant RLS context if resolved
        tenant_id = tenant_context.get()
        if tenant_id:
            logger.debug("Applying tenant RLS connection context", tenant_id=tenant_id)
            # set_config with is_local=True ensures settings are limited to transaction/connection scope
            await session.execute(
                text("SELECT set_config('app.current_tenant_id', :tenant_id, false)"),
                {"tenant_id": str(tenant_id)}
            )
        else:
            logger.debug("No tenant context resolved. RLS queries might fail if strict policy is applied.")
            
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
