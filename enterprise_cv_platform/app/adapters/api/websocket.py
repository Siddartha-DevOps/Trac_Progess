import asyncio
import json
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.logger import get_logger

logger = get_logger(__name__)
ws_router = APIRouter()


@ws_router.websocket("/ws/logs/{job_id}")
async def stream_walkthrough_logs(websocket: WebSocket, job_id: str) -> None:
    """
    WebSocket endpoint streaming live photogrammetry ingestion and inference logs
    for active drone/helmet walks.
    """
    await websocket.accept()
    logger.info("Client connected to real-time CV telemetry log socket", job_id=job_id)

    # In a full-scale deployment, this subscribes to a Redis Pub/Sub channel
    # matching the job_id. We'll simulate a live worker pipeline loop here.
    pipeline_stages = [
        {"step": "downloading", "progress_percent": 10.0, "log": "Connecting to S3. Downloading raw equirectangular MP4 video..."},
        {"step": "downloading", "progress_percent": 25.0, "log": "S3 download completed. Size: 1.2 GB. Initializing decoders."},
        {"step": "dewarping", "progress_percent": 35.0, "log": "Running OpenCV optical flow filtering... 3450 keyframes compiled."},
        {"step": "dewarping", "progress_percent": 45.0, "log": "Converting equirectangular spheres to perspective Gnomonic projections."},
        {"step": "inference", "progress_percent": 55.0, "log": "Loading YOLOv11-seg into GPU VRAM memory. Starting parallel batch inference..."},
        {"step": "inference", "progress_percent": 68.0, "log": "YOLOv11: Segmented 14 columns, 8 concrete slabs, 24 electrical conduits."},
        {"step": "inference", "progress_percent": 75.0, "log": "Loading SAM 2. Refined pixel-perfect boundaries for HVAC duct masks."},
        {"step": "registration", "progress_percent": 85.0, "log": "Extracting 3D coordinates. Running Open3D point-to-plane ICP registration..."},
        {"step": "registration", "progress_percent": 95.0, "log": "Registration converged. Mapping predicted GUIDs against BIM database model."},
        {"step": "completed", "progress_percent": 100.0, "log": "Inference and BIM sync COMPLETED. Flagged 1 vertical column rebar shift (42.1mm)."}
    ]

    try:
        for stage in pipeline_stages:
            # Construct and transmit structured JSON log block
            payload = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "level": "INFO",
                "job_id": job_id,
                **stage
            }
            await websocket.send_text(json.dumps(payload))
            
            # Simulate real processing delays
            await asyncio.sleep(2.5)

    except WebSocketDisconnect:
        logger.info("Client disconnected from CV log socket", job_id=job_id)
    except Exception as e:
        logger.error("Exception in websocket telemetry loop", job_id=job_id, error=str(e))
    finally:
        logger.info("Closing websocket session", job_id=job_id)
