import logging
import sys
from typing import Any, Dict
import structlog
from app.config import settings


def configure_logging() -> None:
    """
    Configures highly optimized structured logging.
    Supports pretty-printing on console during local development and high-throughput JSON logs in Production.
    """
    # Define standard processors to enrich logs with timestamps, levels, and system metadata
    shared_processors = [
        structlog.processors.TimeStamps(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    if settings.LOG_FORMAT.lower() == "json":
        # Format logs as single-line JSON structures for AWS CloudWatch / Datadog indexing
        renderer = structlog.processors.JSONRenderer()
    else:
        # Dev local machine pretty-printer with rich color coding
        renderer = structlog.dev.ConsoleRenderer(colors=True)

    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            *shared_processors,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.UnicodeDecoder(),
            renderer,
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Bridge standard logging to structlog
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    )


# Retrieve a bound logger
def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """
    Returns a configured structured logger instances bound with context.
    """
    return structlog.get_logger(name)
