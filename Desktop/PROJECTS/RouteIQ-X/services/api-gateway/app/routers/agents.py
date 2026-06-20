"""
RouteIQ X — AI Agents Router
Proxies calls to the LangGraph autonomous multi-agent orchestrator service.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
from pydantic import BaseModel
import httpx
import structlog
from ..core.auth import get_current_tenant

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/agents", tags=["AI Agents"])

AGENTS_SERVICE_URL = "http://agents-orchestrator:8003"

class OrchestrateRequest(BaseModel):
    city: Optional[str] = None
    segment_ids: List[str]
    task_type: str = "full_assessment"

@router.post("/orchestrate")
async def trigger_orchestration(request: OrchestrateRequest, tenant: dict = Depends(get_current_tenant)):
    """
    Triggers the LangGraph multi-agent planning workflow for a list of road segments.
    """
    logger.info("Forwarding orchestration request to AI Agents Service", tenant_id=tenant["id"], segments_count=len(request.segment_ids))
    
    payload = {
        "tenant_id": tenant["id"],
        "city": request.city,
        "segment_ids": request.segment_ids,
        "task_type": request.task_type
    }
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{AGENTS_SERVICE_URL}/orchestrate", json=payload)
            if resp.status_code == 200:
                return resp.json()
            else:
                logger.error("Agents service returned error status", status=resp.status_code, body=resp.text)
                raise HTTPException(status_code=resp.status_code, detail="Agents orchestrator service failed")
    except Exception as e:
        logger.error("Failed to communicate with agents service", error=str(e))
        raise HTTPException(status_code=502, detail="Agents service unreachable")

@router.get("/status")
async def get_agents_status(tenant: dict = Depends(get_current_tenant)):
    """
    Retrieves the real-time activity status, uptimes, and inference logs of the 8 autonomous agents.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{AGENTS_SERVICE_URL}/agents/status")
            if resp.status_code == 200:
                return resp.json()
            else:
                logger.error("Agents service status endpoint failed", status=resp.status_code)
                raise HTTPException(status_code=resp.status_code, detail="Failed to fetch agents status")
    except Exception as e:
        logger.error("Failed to query agents service health status", error=str(e))
        raise HTTPException(status_code=502, detail="Agents service unreachable")
