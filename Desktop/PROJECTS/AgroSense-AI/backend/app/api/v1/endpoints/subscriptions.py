"""
AgroSense AI — Razorpay Subscription Endpoints
================================================
Subscription creation, webhook handling, and tier management.
"""

import hashlib
import hmac

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import CurrentUser, DBSession
from app.core.config import settings
from app.services.payment_service import PaymentService

logger = structlog.get_logger(__name__)
router = APIRouter()

SUBSCRIPTION_PLANS = {
    "farmer": {
        "name": "Farmer Plan",
        "price_inr": 99,
        "features": ["7-day rainfall forecast", "Crop recommendation", "SMS alerts"],
        "razorpay_plan_id": "plan_farmer_monthly",
    },
    "agribusiness": {
        "name": "Agri-Business Plan",
        "price_inr": 5000,
        "features": [
            "All Farmer features",
            "API access (all 11 districts)",
            "Seasonal forecasts",
            "Flood risk (GNN)",
            "SHAP explainability",
        ],
        "razorpay_plan_id": "plan_agribiz_monthly",
    },
    "insurance": {
        "name": "Insurance Plan",
        "price_inr": 15000,
        "features": [
            "All Agri-Business features",
            "Risk index per district (batch)",
            "Historical data export",
            "Custom thresholds",
        ],
        "razorpay_plan_id": "plan_insurance_monthly",
    },
}


@router.get(
    "/plans",
    summary="List all subscription plans",
)
async def list_plans():
    """Return all available AgroSense AI subscription plans with pricing."""
    return {"plans": SUBSCRIPTION_PLANS}


@router.post(
    "/subscribe/{plan_id}",
    summary="Subscribe to a plan",
)
async def subscribe(
    plan_id: str,
    db: DBSession,
    current_user: CurrentUser,
):
    """Initiate a Razorpay subscription for the specified plan."""
    if plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=404, detail=f"Plan '{plan_id}' not found.")

    service = PaymentService(db)
    try:
        result = await service.create_subscription(current_user, plan_id)
        return {
            "subscription_id": result["subscription_id"],
            "razorpay_key": settings.RAZORPAY_KEY_ID,
            "amount": SUBSCRIPTION_PLANS[plan_id]["price_inr"] * 100,
            "currency": "INR",
            "plan": SUBSCRIPTION_PLANS[plan_id],
            "user_email": current_user.email,
            "user_name": current_user.full_name,
        }
    except Exception as e:
        logger.error("subscription_error", error=str(e))
        raise HTTPException(status_code=500, detail="Subscription creation failed.")


@router.post(
    "/webhook",
    summary="Razorpay webhook handler",
    description="Handles payment.captured and subscription.activated events.",
    include_in_schema=False,
)
async def razorpay_webhook(request: Request, db: DBSession):
    """Process Razorpay payment webhooks to activate subscriptions."""
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    # Verify webhook signature
    expected_signature = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    payload = await request.json()
    service = PaymentService(db)
    await service.handle_webhook(payload)
    return {"status": "processed"}


@router.get(
    "/status",
    summary="Get current subscription status",
)
async def get_subscription_status(current_user: CurrentUser):
    """Return the current user's subscription tier and status."""
    return {
        "tier": current_user.subscription_tier,
        "active": current_user.subscription_active,
        "razorpay_subscription_id": current_user.razorpay_subscription_id,
        "features": SUBSCRIPTION_PLANS.get(
            current_user.subscription_tier, {}
        ).get("features", ["Free tier — basic access only"]),
    }


@router.post(
    "/cancel",
    summary="Cancel subscription",
)
async def cancel_subscription(
    db: DBSession,
    current_user: CurrentUser,
):
    """Cancel the current active subscription."""
    service = PaymentService(db)
    await service.cancel_subscription(current_user)
    return {"message": "Subscription cancelled. Access continues until end of billing period."}
