"""
RouteIQ X — Multi-Tenant Context Middleware
Captures the tenant scope from the request context and binds it to contextvars.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import contextvars
import structlog

logger = structlog.get_logger(__name__)

# Request-scoped ContextVar to track the tenant context on the current execution thread
tenant_context = contextvars.ContextVar("tenant_context_id", default=None)

class TenantContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract the tenant_id resolved by the JWT auth middleware
        tenant_id = getattr(request.state, "tenant_id", None)
        
        # Binds the tenant_id to the ContextVar for downstream queries
        token = tenant_context.set(tenant_id)
        logger.debug("Bound tenant context to request thread", tenant_id=tenant_id)
        
        try:
            response = await call_next(request)
            return response
        finally:
            # Clean up token context on request completion
            tenant_context.reset(token)
