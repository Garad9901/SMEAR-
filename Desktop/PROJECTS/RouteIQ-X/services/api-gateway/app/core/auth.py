"""
RouteIQ X — Authentication & Session Core
JWT decoding and tenant resolution dependencies.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from .config import settings
import structlog

logger = structlog.get_logger(__name__)
security = HTTPBearer(auto_error=False)

# Mumbai Municipal Corporation UUID from init seed records
MOCK_TENANT_ID = "e6a0d0a2-23c1-4c12-a1b2-0123456789ab"

def get_current_tenant(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to resolve the current request's tenant scope.
    Decodes the JWT bearer token to extract tenant metadata.
    """
    if not credentials:
        if settings.ENVIRONMENT == "development":
            logger.debug("No Authorization credentials provided. Defaulting to development tenant context.")
            return {
                "id": MOCK_TENANT_ID,
                "slug": "mmc-in",
                "name": "Mumbai Municipal Corporation",
                "tier": "enterprise"
            }
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid"
        )
        
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        tenant_id = payload.get("tenant_id")
        if not tenant_id:
            logger.warning("Token parsed successfully but lacks a tenant_id claim.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: tenant_id missing"
            )
            
        return {
            "id": tenant_id,
            "slug": payload.get("slug", ""),
            "name": payload.get("name", ""),
            "tier": payload.get("tier", "standard")
        }
    except JWTError as e:
        logger.warning("JWT validation failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid or expired"
        )
