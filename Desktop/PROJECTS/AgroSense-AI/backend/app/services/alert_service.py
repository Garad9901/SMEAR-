"""
AgroSense AI — Alert Service
==============================
Sends SMS via Twilio and push notifications via Firebase.
Handles auto-threshold checking across all districts.
"""

import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional

import structlog
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.risk import AlertRecord
from app.schemas.risk import AlertHistoryResponse, AlertResponse, AlertTriggerRequest

logger = structlog.get_logger(__name__)


class AlertService:
    """Handles alert generation and delivery via Twilio SMS + Firebase FCM."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self._twilio_client = None
        self._firebase_app = None

    def _get_twilio(self):
        """Lazy-load Twilio client."""
        if self._twilio_client is None:
            try:
                from twilio.rest import Client
                self._twilio_client = Client(
                    settings.TWILIO_ACCOUNT_SID,
                    settings.TWILIO_AUTH_TOKEN,
                )
            except Exception as e:
                logger.warning("twilio_init_failed", error=str(e))
        return self._twilio_client

    def _get_firebase(self):
        """Lazy-load Firebase Admin SDK."""
        if self._firebase_app is None:
            try:
                import firebase_admin
                from firebase_admin import credentials
                if not firebase_admin._apps:
                    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                    self._firebase_app = firebase_admin.initialize_app(cred)
                else:
                    self._firebase_app = firebase_admin.get_app()
            except Exception as e:
                logger.warning("firebase_init_failed", error=str(e))
        return self._firebase_app

    # ─────────────────────────────────────────────────────────────────────────
    # Trigger Alert
    # ─────────────────────────────────────────────────────────────────────────
    async def trigger_alert(
        self,
        request: AlertTriggerRequest,
        triggered_by=None,
    ) -> AlertResponse:
        """Send alert via configured channels and persist to DB."""
        alert_id = uuid.uuid4()
        sms_status = None
        push_status = None
        recipients_notified = 0
        delivered = False
        delivery_error = None

        # ─── SMS via Twilio ───────────────────────────────────────────────────
        if request.channel in ("sms", "all"):
            phone_numbers = request.recipient_phones or []
            if not phone_numbers and settings.TWILIO_ALERT_NUMBER:
                phone_numbers = [settings.TWILIO_ALERT_NUMBER]

            for phone in phone_numbers:
                try:
                    client = self._get_twilio()
                    if client:
                        msg = client.messages.create(
                            body=f"🌾 AgroSense AI Alert\n{request.title}\n{request.message}",
                            from_=settings.TWILIO_FROM_NUMBER,
                            to=phone,
                        )
                        sms_status = f"sent:{msg.sid}"
                        recipients_notified += 1
                        delivered = True
                        logger.info("sms_sent", to=phone, sid=msg.sid)
                    else:
                        sms_status = "twilio_unavailable"
                        logger.warning("sms_skipped", reason="twilio_not_configured")
                except Exception as e:
                    sms_status = f"error:{str(e)[:50]}"
                    delivery_error = str(e)
                    logger.error("sms_error", error=str(e), phone=phone)

        # ─── Push via Firebase ────────────────────────────────────────────────
        if request.channel in ("push", "all"):
            try:
                from firebase_admin import messaging
                self._get_firebase()
                message = messaging.Message(
                    notification=messaging.Notification(
                        title=request.title,
                        body=request.message,
                    ),
                    topic=f"district_{request.district_id}",
                    data={
                        "alert_type": request.alert_type,
                        "severity": request.severity,
                        "district_id": str(request.district_id),
                    },
                )
                response = messaging.send(message)
                push_status = f"sent:{response}"
                delivered = True
                logger.info("push_sent", message_id=response)
            except Exception as e:
                push_status = f"error:{str(e)[:50]}"
                delivery_error = str(e)
                logger.error("push_error", error=str(e))

        # ─── Persist to DB ────────────────────────────────────────────────────
        alert_record = AlertRecord(
            id=alert_id,
            district_id=request.district_id,
            user_id=triggered_by.id if triggered_by else None,
            alert_type=request.alert_type,
            severity=request.severity,
            title=request.title,
            message=request.message,
            channel=request.channel,
            recipient_phone=request.recipient_phones[0] if request.recipient_phones else None,
            twilio_sid=sms_status.split(":")[-1] if sms_status and "sent:" in sms_status else None,
            firebase_message_id=push_status.split(":")[-1] if push_status and "sent:" in push_status else None,
            delivered=delivered,
            delivery_error=delivery_error,
            delivered_at=datetime.now(timezone.utc) if delivered else None,
        )
        self.db.add(alert_record)

        return AlertResponse(
            alert_id=alert_id,
            district_name=f"District #{request.district_id}",
            alert_type=request.alert_type,
            severity=request.severity,
            title=request.title,
            message=request.message,
            channel=request.channel,
            sms_status=sms_status,
            push_status=push_status,
            recipients_notified=max(recipients_notified, 1),
            triggered_at=datetime.now(timezone.utc),
            delivered=delivered,
        )

    async def run_auto_threshold_checks(self) -> dict:
        """
        Auto-check all districts against model output thresholds.
        Triggers alerts for any district exceeding configured limits.
        """
        from app.services.risk_service import RiskAnalysisService
        from app.services.rainfall_service import RainfallForecastService
        from app.schemas.rainfall import RainfallForecastRequest

        triggered = []
        risk_service = RiskAnalysisService(self.db)
        rainfall_service = RainfallForecastService(self.db)

        for district_name in settings.VIDARBHA_DISTRICTS:
            try:
                # Check risk index
                risk = await risk_service.get_district_risk(district_name)
                for d in risk.districts:
                    if d.composite_score >= settings.DROUGHT_RISK_THRESHOLD * 100:
                        req = AlertTriggerRequest(
                            district_id=d.district_id,
                            alert_type="drought",
                            severity="critical" if d.composite_score > 85 else "warning",
                            title=f"Drought Alert — {district_name}",
                            message=(
                                f"Risk score: {d.composite_score:.0f}/100. "
                                f"Category: {d.risk_level}. Immediate action advised."
                            ),
                            channel="sms",
                        )
                        await self.trigger_alert(req)
                        triggered.append(district_name)
            except Exception as e:
                logger.error("auto_check_error", district=district_name, error=str(e))

        return {"count": len(triggered), "districts": triggered}

    async def get_history(
        self,
        district_id: Optional[int],
        alert_type: Optional[str],
        page: int,
        page_size: int,
    ) -> AlertHistoryResponse:
        """Fetch paginated alert history."""
        stmt = select(AlertRecord).order_by(desc(AlertRecord.triggered_at))
        if district_id:
            stmt = stmt.where(AlertRecord.district_id == district_id)
        if alert_type:
            stmt = stmt.where(AlertRecord.alert_type == alert_type)

        result = await self.db.execute(
            stmt.offset((page - 1) * page_size).limit(page_size)
        )
        alerts = result.scalars().all()

        alert_responses = [
            AlertResponse(
                alert_id=a.id,
                district_name=f"District #{a.district_id}",
                alert_type=a.alert_type,
                severity=a.severity,
                title=a.title,
                message=a.message,
                channel=a.channel,
                sms_status=a.twilio_sid,
                push_status=a.firebase_message_id,
                recipients_notified=1,
                triggered_at=a.triggered_at,
                delivered=a.delivered,
            )
            for a in alerts
        ]

        return AlertHistoryResponse(
            total=len(alert_responses),
            page=page,
            page_size=page_size,
            alerts=alert_responses,
        )
