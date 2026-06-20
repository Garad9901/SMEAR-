"""
RouteIQ X — Celery Application Definition
Configures async task queues using Redis broker.
"""

from celery import Celery
from .core.config import settings

# Declare the celery application instance
celery_app = Celery(
    "routeiq_celery",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Standard serialization configs for message passing
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Autodiscover task modules inside app.tasks
celery_app.autodiscover_tasks(["app.tasks"])
