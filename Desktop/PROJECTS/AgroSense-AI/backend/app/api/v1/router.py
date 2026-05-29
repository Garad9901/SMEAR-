"""
AgroSense AI — API v1 Router
==============================
Aggregates all endpoint routers under /api/v1.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    rainfall,
    crop,
    risk,
    alerts,
    districts,
    subscriptions,
)

api_v1_router = APIRouter()

# ─── Module Routers ──────────────────────────────────────────────────────────
api_v1_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)
api_v1_router.include_router(
    districts.router,
    prefix="/districts",
    tags=["Districts"],
)
api_v1_router.include_router(
    rainfall.router,
    prefix="/rainfall",
    tags=["Module 1 — Rainfall Forecasting"],
)
api_v1_router.include_router(
    crop.router,
    prefix="/crop",
    tags=["Module 2 — Crop Intelligence"],
)
api_v1_router.include_router(
    risk.router,
    prefix="/risk",
    tags=["Module 3 — Drought & Flood Risk"],
)
api_v1_router.include_router(
    alerts.router,
    prefix="/alerts",
    tags=["Module 4 — Real-Time Alerts"],
)
api_v1_router.include_router(
    subscriptions.router,
    prefix="/subscriptions",
    tags=["Billing & Subscriptions"],
)
