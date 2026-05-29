"""
AgroSense AI — FastAPI Dependency Injection
=============================================
Reusable dependencies for authentication, DB sessions,
rate limiting, and subscription tier enforcement.
"""

import uuid
from typing import Annotated, Optional

import structlog
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User

logger = structlog.get_logger(__name__)

# OAuth2 scheme — token extracted from Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Type aliases for cleaner endpoint signatures
DBSession = Annotated[AsyncSession, Depends(get_db)]
CurrentToken = Annotated[str, Depends(oauth2_scheme)]


# ─────────────────────────────────────────────────────────────────────────────
# Core Auth Dependency
# ─────────────────────────────────────────────────────────────────────────────
async def get_current_user(
    token: CurrentToken,
    db: DBSession,
) -> User:
    """
    Extract and validate JWT token, return the authenticated User.
    Raises HTTP 401 if token is invalid or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_token(token, token_type="access")
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    try:
        result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()
    except Exception as e:
        logger.error("db_error_in_auth", error=str(e))
        raise credentials_exception

    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Ensure the authenticated user is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support.",
        )
    return current_user


# ─────────────────────────────────────────────────────────────────────────────
# Type Aliases for Clean Endpoint Signatures
# ─────────────────────────────────────────────────────────────────────────────
CurrentUser = Annotated[User, Depends(get_current_active_user)]


# ─────────────────────────────────────────────────────────────────────────────
# Subscription Tier Enforcement
# ─────────────────────────────────────────────────────────────────────────────
def require_subscription(*tiers: str):
    """
    Factory for subscription tier enforcement.
    Usage: Depends(require_subscription("agribusiness", "government"))
    """
    async def _check_subscription(
        current_user: CurrentUser,
    ) -> User:
        if current_user.is_superuser:
            return current_user
        if current_user.subscription_tier not in tiers and not current_user.subscription_active:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=(
                    f"This endpoint requires one of these subscription tiers: {list(tiers)}. "
                    f"Your current tier: {current_user.subscription_tier}. "
                    "Please upgrade at /api/v1/subscriptions/upgrade"
                ),
            )
        return current_user

    return _check_subscription


def require_admin():
    """Require superuser/admin role."""
    async def _check_admin(current_user: CurrentUser) -> User:
        if not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required.",
            )
        return current_user

    return _check_admin


# ─────────────────────────────────────────────────────────────────────────────
# Pagination
# ─────────────────────────────────────────────────────────────────────────────
class PaginationParams:
    def __init__(self, page: int = 1, page_size: int = 20):
        if page < 1:
            raise HTTPException(status_code=400, detail="Page must be >= 1")
        if page_size < 1 or page_size > 100:
            raise HTTPException(status_code=400, detail="Page size must be 1–100")
        self.page = page
        self.page_size = page_size
        self.offset = (page - 1) * page_size


Pagination = Annotated[PaginationParams, Depends(PaginationParams)]
