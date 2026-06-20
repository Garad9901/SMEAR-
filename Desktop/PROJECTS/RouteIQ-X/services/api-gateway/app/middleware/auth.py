"""
RouteIQ X — JWT Authentication Middleware
Validates Bearer tokens and sets request.state context.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from jose import jwt, JWTError
from ..core.config import settings
import structlog

logger = structlog.get_logger(__name__)

# Mumbai Municipal Corporation default fallback UUID
MOCK_TENANT_ID = "e6a0d0a2-23c1-4c12-a1b2-0123456789ab"

class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Skip auth for open/public endpoints
        open_paths = [
            "/api/health", 
            "/metrics", 
            "/api/docs", 
            "/api/redoc", 
            "/api/openapi.json"
        ]
        if any(request.url.path == path or request.url.path.startswith(path) for path in open_paths):
            return await call_next(request)
            
        # 2. Parse Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                request.state.user = payload
                request.state.tenant_id = payload.get("tenant_id")
            except JWTError as e:
                logger.warning("Invalid token received in authentication middleware", error=str(e))
                if settings.ENVIRONMENT != "development":
                    return JSONResponse(
                        status_code=401,
                        content={"error": "unauthorized", "message": "Invalid or expired token"}
                    )
                else:
                    self._apply_mock_context(request)
        else:
            # 3. Fallback or reject
            if settings.ENVIRONMENT != "development":
                logger.warning("Rejecting request with missing Authorization header", path=request.url.path)
                return JSONResponse(
                    status_code=401,
                    content={"error": "unauthorized", "message": "Authorization header missing"}
                )
            else:
                self._apply_mock_context(request)
                
        return await call_next(request)
        
    def _apply_mock_context(self, request: Request):
        """Apply developer mode mock credentials."""
        request.state.user = {
            "sub": "developer",
            "role": "admin",
            "tenant_id": MOCK_TENANT_ID,
            "slug": "mmc-in",
            "name": "Mumbai Municipal Corporation"
        }
        request.state.tenant_id = MOCK_TENANT_ID
