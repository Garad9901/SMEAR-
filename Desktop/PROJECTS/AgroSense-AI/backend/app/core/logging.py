"""
AgroSense AI — Structured Logging Configuration
================================================
Uses structlog with JSON output in production, colored console in dev.
"""

import logging
import sys

import structlog

from app.core.config import settings


def configure_logging() -> None:
    """
    Configure structlog with appropriate processors for the environment.
    - Development: Human-readable colored console output
    - Production: JSON structured output for log aggregators
    """
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
    ]

    if settings.APP_ENV == "production":
        # JSON output for production (CloudWatch, ELK, etc.)
        processors = shared_processors + [
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer(),
        ]
        renderer = structlog.processors.JSONRenderer()
    else:
        # Colored console for development
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True),
        ]
        renderer = structlog.dev.ConsoleRenderer(colors=True)

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(logging.DEBUG),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Also configure stdlib logging to integrate with structlog
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.DEBUG if settings.APP_DEBUG else logging.INFO,
    )

    # Silence noisy libraries
    for logger_name in ["uvicorn", "sqlalchemy.engine", "asyncio"]:
        logging.getLogger(logger_name).setLevel(
            logging.INFO if settings.APP_DEBUG else logging.WARNING
        )
