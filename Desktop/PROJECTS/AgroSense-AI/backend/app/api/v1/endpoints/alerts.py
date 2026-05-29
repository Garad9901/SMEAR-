"""
AgroSense AI — Real-Time Alert Endpoints
==========================================
Module 4: Threshold-triggered SMS/push alerts via Twilio + Firebase.
"""

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.v1.deps import CurrentUser, DBSession, Pagination, require_admin, require_subscription
from app.schemas.risk import AlertHistoryResponse, AlertResponse, AlertTriggerRequest
from app.services.alert_service import AlertService

logger = structlog.get_logger(__name__)
router = APIRouter()


@router.post(
    "/trigger",
    response_model=AlertResponse,
    summary="Manually trigger a district alert",
    description=(
        "Send SMS via Twilio and push notification via Firebase to all subscribers "
        "of a district. Admin or agribusiness tier required."
    ),
)
async def trigger_alert(
    request: AlertTriggerRequest,
    db: DBSession,
    current_user: CurrentUser,
    _: None = Depends(require_subscription("agribusiness", "government")),
):
    """Trigger SMS + push notification alert for a district."""
    service = AlertService(db)
    try:
        result = await service.trigger_alert(request, triggered_by=current_user)
        logger.info(
            "alert_triggered",
            alert_id=str(result.alert_id),
            district_id=request.district_id,
            type=request.alert_type,
            severity=request.severity,
        )
        return result
    except Exception as e:
        logger.error("alert_trigger_error", error=str(e))
        raise HTTPException(status_code=500, detail=f"Alert failed: {str(e)}")


@router.post(
    "/auto-check",
    summary="Run automatic threshold checks and trigger alerts",
    description=(
        "Evaluates current model outputs against configured thresholds "
        "and auto-triggers alerts for all districts exceeding thresholds."
    ),
)
async def run_auto_alert_check(
    db: DBSession = None,
    current_user: CurrentUser = None,
    _: None = Depends(require_admin()),
):
    """Admin endpoint to run automatic threshold-based alert checks."""
    service = AlertService(db)
    result = await service.run_auto_threshold_checks()
    return {"triggered_alerts": result["count"], "districts": result["districts"]}


@router.get(
    "/history",
    response_model=AlertHistoryResponse,
    summary="Get alert history",
)
async def get_alert_history(
    district_id: int = Query(None, description="Filter by district ID"),
    alert_type: str = Query(None, description="Filter by type"),
    pagination: Pagination = None,
    db: DBSession = None,
    current_user: CurrentUser = None,
):
    """Paginated alert history filtered by district or type."""
    service = AlertService(db)
    return await service.get_history(
        district_id=district_id,
        alert_type=alert_type,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@router.get(
    "/preferences",
    summary="Get alert preferences for current user",
)
async def get_alert_preferences(current_user: CurrentUser):
    """Return the current user's alert channel preferences."""
    return {
        "sms_enabled": current_user.sms_alerts_enabled,
        "push_enabled": current_user.push_alerts_enabled,
        "preferred_district": current_user.preferred_district,
        "phone_number": current_user.phone_number,
    }
