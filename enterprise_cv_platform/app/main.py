from contextlib import asynccontextmanager
from datetime import datetime
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.adapters.api.router import router as api_router
from app.adapters.api.websocket import ws_router
from app.config import settings
from app.logger import configure_logging, get_logger

# Configure structured JSON logging on startup
configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    FastAPI Lifespan lifecycle event runner.
    Initializes ML models (YOLOv11 and SAM) inside GPU memory and handles connections.
    """
    logger.info("Initializing BuildTrace Computer Vision platform", env=settings.APP_ENV)

    try:
        # Import dynamically to prevent compile blocker when modules are loading
        from app.infrastructure.ml.yolo_segmenter import MultiModelInferenceEngine
        
        # Instantiate and cache global model loaders inside the application state
        ml_engine = MultiModelInferenceEngine()
        ml_engine.load_model()
        app.state.ml_engine = ml_engine
        
        logger.info("Deep learning networks (YOLOv11 & SAM) successfully cached in VRAM")
    except Exception as e:
        logger.error("Failed to load neural models on VRAM startup", error=str(e))
        # Keep loading so container doesn't crash if CUDA weights are downloading asynchronously

    yield  # Hand over control to FastAPI request router

    # Cleanup operations during graceful shutdown
    logger.info("Deallocating resources. Shutting down BuildTrace Computer Vision platform")
    import torch
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        logger.info("Cleared CUDA memory cache layers successfully.")


# Instantiate the FastAPI main router
app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise Computer Vision & Photogrammetry BIM Sync Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/redoc" if settings.APP_ENV != "production" else None
)

# Standardize CORS policies (Permits local development and micro-frontend syncs)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to official gateway origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register HTTP Router and WebSocket routers
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)


# Global HTTP Exception Handling overrides for production
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catches unhandled errors, logs structured traceback, and returns safe responses.
    """
    logger.exception("Global HTTP Exception interceptor triggered", url=str(request.url), error=str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal spatial error occurred. Please consult the telemetry dashboard logs.",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    )


# Health check for platform load-balancing ingress
@app.get("/", status_code=status.HTTP_200_OK)
async def index() -> dict:
    """Gateway entry descriptor"""
    return {
        "service": settings.APP_NAME,
        "api_v1_docs": f"{settings.API_V1_STR}/docs" if settings.APP_ENV != "production" else "Disabled",
        "timestamp": datetime.utcnow()
    }
