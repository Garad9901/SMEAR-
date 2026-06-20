"""
RouteIQ X — Maintenance Operations Router
Manages repair dispatch scheduling, crew tasks, and supervisor approvals.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date, datetime
import uuid

from ..core.database import get_db
from ..core.auth import get_current_tenant
from ..models.maintenance import MaintenanceTask

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

# ── Schemas ────────────────────────────────────────────────────────
class MaintenanceTaskResponse(BaseModel):
    id: str
    segment_id: str
    task_type: str
    priority: str
    status: str
    scheduled_date: Optional[date]
    estimated_days: Optional[int]
    estimated_cost: float
    assigned_team: Optional[str]
    crew_size: Optional[int]
    ai_generated: bool
    
    class Config:
        from_attributes = True

class CreateTaskRequest(BaseModel):
    segment_id: str
    task_type: str = Field(pattern="^(crack-sealing|pothole-repair|resurfacing|patching|full-reconstruction|inspection)$")
    priority: str = Field(pattern="^(critical|high|medium|low)$")
    scheduled_date: date
    estimated_days: int = Field(gt=0)
    estimated_cost: float = Field(ge=0)
    assigned_team: Optional[str] = None
    crew_size: Optional[int] = None
    equipment: List[str] = []

class UpdateStatusRequest(BaseModel):
    status: str = Field(pattern="^(pending-approval|scheduled|in-progress|completed|cancelled|deferred)$")
    actual_cost: Optional[float] = None
    rhi_after: Optional[float] = None

# ── Endpoints ──────────────────────────────────────────────────────
@router.get("/", response_model=List[MaintenanceTaskResponse])
async def list_maintenance_tasks(
    status: Optional[str] = None,
    tenant: dict = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """
    Lists maintenance tasks scheduled for the tenant.
    Filtered by tenant (isolated by RLS).
    """
    stmt = select(MaintenanceTask).where(MaintenanceTask.tenant_id == tenant["id"])
    if status:
        stmt = stmt.where(MaintenanceTask.status == status)
        
    res = await db.execute(stmt)
    tasks = res.scalars().all()
    return tasks

@router.post("/", response_model=MaintenanceTaskResponse, status_code=status.HTTP_211_CREATED)
async def create_maintenance_task(
    request: CreateTaskRequest,
    tenant: dict = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new maintenance dispatch.
    """
    task = MaintenanceTask(
        tenant_id=uuid.UUID(tenant["id"]),
        segment_id=uuid.UUID(request.segment_id),
        task_type=request.task_type,
        priority=request.priority,
        status="pending-approval",
        scheduled_date=request.scheduled_date,
        estimated_days=request.estimated_days,
        estimated_cost=request.estimated_cost,
        assigned_team=request.assigned_team,
        crew_size=request.crew_size,
        equipment=request.equipment,
        ai_generated=False
    )
    
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task

@router.get("/{task_id}", response_model=MaintenanceTaskResponse)
async def get_task_details(
    task_id: str,
    tenant: dict = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """
    Gets details of a specific maintenance task.
    """
    try:
        task_uuid = uuid.UUID(task_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Task UUID format")
        
    stmt = select(MaintenanceTask).where(
        MaintenanceTask.id == task_uuid,
        MaintenanceTask.tenant_id == tenant["id"]
    )
    res = await db.execute(stmt)
    task = res.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Maintenance task not found")
        
    return task

@router.post("/{task_id}/status")
async def update_task_status(
    task_id: str,
    payload: UpdateStatusRequest,
    tenant: dict = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates the execution status of a task (e.g. approve/complete/defer).
    """
    try:
        task_uuid = uuid.UUID(task_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Task UUID format")
        
    stmt = select(MaintenanceTask).where(
        MaintenanceTask.id == task_uuid,
        MaintenanceTask.tenant_id == tenant["id"]
    )
    res = await db.execute(stmt)
    task = res.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Maintenance task not found")
        
    task.status = payload.status
    if payload.status == "completed":
        task.actual_end_date = date.today()
        if payload.actual_cost is not None:
            task.actual_cost = payload.actual_cost
            if task.estimated_cost:
                task.cost_savings = float(task.estimated_cost) - payload.actual_cost
        if payload.rhi_after is not None:
            task.rhi_after = payload.rhi_after
            task.verified_by_agent = True
            task.verification_date = datetime.utcnow()
            
    await db.commit()
    return {"message": f"Task status updated to {payload.status} successfully"}
