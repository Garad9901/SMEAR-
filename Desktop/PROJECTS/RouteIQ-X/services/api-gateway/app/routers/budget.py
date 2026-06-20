"""
RouteIQ X — Budget Optimization Router
Proxies budget allocation requests to the LP/Genetic Algorithm optimizer service.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
import httpx
import structlog
from ..core.auth import get_current_tenant

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/budget", tags=["Budget Optimizer"])

OPTIMIZER_SERVICE_URL = "http://optimizer:8004"

class OptimizationRequest(BaseModel):
    budget_limit: float = Field(gt=0, description="Total budget in INR")
    projects: List[Dict]
    weights: Dict[str, float] = {"risk": 0.40, "traffic": 0.25, "age": 0.20, "complaints": 0.15}
    algorithm: str = "lp"
    cluster_radius_km: float = 3.0
    max_projects: Optional[int] = None
    min_rhi_threshold: float = 30.0

@router.post("/optimize")
async def run_optimization(request: OptimizationRequest, tenant: dict = Depends(get_current_tenant)):
    """
    Solves budget allocation constraints using linear programming, knapsack algorithms, or genetic models.
    """
    logger.info("Forwarding budget optimization request to optimizer", tenant_id=tenant["id"], algorithm=request.algorithm)
    
    payload = {
        "tenant_id": tenant["id"],
        "budget_limit": request.budget_limit,
        "projects": request.projects,
        "weights": request.weights,
        "algorithm": request.algorithm,
        "cluster_radius_km": request.cluster_radius_km,
        "max_projects": request.max_projects,
        "min_rhi_threshold": request.min_rhi_threshold
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{OPTIMIZER_SERVICE_URL}/optimize", json=payload)
            if resp.status_code == 200:
                return resp.json()
            else:
                logger.error("Optimizer service returned error response", status=resp.status_code, body=resp.text)
                raise HTTPException(status_code=resp.status_code, detail="Optimizer solver failed")
    except Exception as e:
        logger.error("Failed to query optimizer service", error=str(e))
        raise HTTPException(status_code=502, detail="Optimizer service unreachable")

@router.get("/algorithms")
async def list_optimization_algorithms(tenant: dict = Depends(get_current_tenant)):
    """
    Lists details of LP, GA, Knapsack, and RL solvers configured on the engine.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{OPTIMIZER_SERVICE_URL}/algorithms")
            if resp.status_code == 200:
                return resp.json()
            else:
                logger.error("Optimizer algorithms listing failed", status=resp.status_code)
                raise HTTPException(status_code=resp.status_code, detail="Failed to fetch algorithms listing")
    except Exception as e:
        logger.error("Failed to query optimizer algorithms service", error=str(e))
        raise HTTPException(status_code=502, detail="Optimizer service unreachable")
export_router = router
