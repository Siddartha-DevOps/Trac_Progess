# Image-To-BIM Auto-Registration Engine
## System Architecture Specification

This document details the production-grade architecture, database schema, mathematical formulations, and worker pipeline designs for the TracProgress Image-to-BIM Registration Engine.

---

## 1. Overall System Architecture

The Image-to-BIM Registration Engine operates on a distributed, asynchronous, real-time spatial processing pattern. It marries physical image capture streams (360° videos, drone photogrammetry, helmet-mounted cameras) with spatial IFC (BIM) structural databases.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Ingress & Pre-processing                        │
│  Camera Video Frames / 360° Orthomosaics -> S3 Bucket Object Storage    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  Asynchronous Worker Queue (Celery)                     │
│  - Task Distribution      - Image Pre-processing    - Dense Optic Flow  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│              Computer Vision Core Pipeline (FastAPI / GPU)             │
│  - SuperPoint / SuperGlue Network   - ORB-SLAM3 Trajectory Alignment   │
│  - Camera Matrix Projection         - Loop Closure Graph Optimizer     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                BIM Spatial Alignment & Indexing Engine                 │
│  - World Coordinate transform      - IFC Geometry Projection (Three.js)│
│  - KD-Tree & Octree Search        - Nearest IFC Object Raycast         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Enterprise Storage Tier                         │
│  - PostgreSQL (Spatially Indexed)  - Redis (Telemetry & Cache)         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Layout & Folder Structure

```
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── registration.py     # Camera pose and alignment APIs
│   │   │   │   ├── slam.py             # Visual SLAM & Loop closure tracking
│   │   │   │   └── query.py            # KD-tree spatial index queries
│   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── models/                     # SQLAlchemy Database ORM Models
│   │   │   ├── pose.py
│   │   │   ├── session.py
│   │   │   └── spatial.py
│   │   ├── schemas/                    # Pydantic schemas
│   │   │   ├── pose.py
│   │   │   └── spatial.py
│   │   ├── services/                   # Heavyweight CV & Math Pipelines
│   │   │   ├── slam_pipeline.py        # SuperPoint descriptors, tracking
│   │   │   ├── alignment.py            # Coordinate transformations
│   │   │   └── kd_tree.py              # Custom Spatial Search Trees
│   │   └── worker.py                   # Celery asynchronous worker definitions
├── src/                                # React Frontend Client
│   ├── components/
│   │   ├── ImageToBimRegistrationEngine.tsx # Interactive Dashboard Workbench
│   │   └── BIMViewer.tsx               # Three.js IFC Mesh Renderer
│   ├── store.ts                        # Zustand shared state manager
│   └── types.ts                        # Unified TypeScript specs
```

---

## 3. Database Schema Design (PostgreSQL)

The system leverages spatial indexes and partition grids for sub-millisecond retrieval of camera trajectory vectors and visual keypoints.

```sql
-- PostgreSQL DDL Script

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "cube";

-- 1. Registration Sessions Tracker
CREATE TABLE registration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    walkthrough_date TIMESTAMP WITH TIME ZONE NOT NULL,
    operator_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    device_model VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Camera Poses (Trajectory Vector Line)
CREATE TABLE camera_poses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES registration_sessions(id) ON DELETE CASCADE,
    frame_index INT NOT NULL,
    timestamp_offset DOUBLE PRECISION NOT NULL,
    -- Translation Vector
    x DOUBLE PRECISION NOT NULL,
    y DOUBLE PRECISION NOT NULL,
    z DOUBLE PRECISION NOT NULL,
    -- Quaternion Orientation
    qw DOUBLE PRECISION NOT NULL,
    qx DOUBLE PRECISION NOT NULL,
    qy DOUBLE PRECISION NOT NULL,
    qz DOUBLE PRECISION NOT NULL,
    -- Euler Angles for visualization convenience
    heading DOUBLE PRECISION NOT NULL,
    pitch DOUBLE PRECISION NOT NULL,
    roll DOUBLE PRECISION NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    PRIMARY KEY (id, session_id)
) PARTITION BY HASH (session_id);

-- 3. Spatial IFC Geometry Index cache
CREATE TABLE spatial_ifc_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    ifc_guid VARCHAR(128) NOT NULL,
    category VARCHAR(128) NOT NULL,
    level_id VARCHAR(128) NOT NULL,
    -- Bounding box spatial volumes represented as cube dimensions
    bounding_box_min_x DOUBLE PRECISION NOT NULL,
    bounding_box_min_y DOUBLE PRECISION NOT NULL,
    bounding_box_min_z DOUBLE PRECISION NOT NULL,
    bounding_box_max_x DOUBLE PRECISION NOT NULL,
    bounding_box_max_y DOUBLE PRECISION NOT NULL,
    bounding_box_max_z DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid spatial bounding box intersection queries
CREATE INDEX idx_spatial_bbox ON spatial_ifc_elements (
    bounding_box_min_x, bounding_box_max_x,
    bounding_box_min_y, bounding_box_max_y,
    bounding_box_min_z, bounding_box_max_z
);
```

---

## 4. Backend Architecture: FastAPI Endpoints

```python
# backend/app/api/endpoints/registration.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np

router = APIRouter()

class CameraPosePayload(BaseModel):
    session_id: str
    image_url: str
    sensor_timestamp: float
    imu_quaternion: Optional[List[float]] = Field(None, max_items=4, min_items=4)

class NearestElementResponse(BaseModel):
    ifc_guid: str
    category: str
    distance_meters: float

class RegistrationResponse(BaseModel):
    session_id: str
    pose_matrix_4x4: List[List[float]]
    confidence: float
    level_detected: str
    nearest_elements: List[NearestElementResponse]

@router.post("/estimate-pose", response_model=RegistrationResponse)
async def estimate_pose(payload: CameraPosePayload, background_tasks: BackgroundTasks):
    """
    Performs sub-second estimation using SuperPoint, LightGlue networks, 
    and aligns structural landmarks using coordinate transforms.
    """
    # 1. Fetch Image from Object Storage (S3-compatible)
    # 2. Extract visual descriptors (TensorRT GPU Inference)
    # 3. Match against rendering landmarks derived from IFC model
    # 4. Apply Kabsch translation-rotation algorithm for alignment
    
    # Simulating transform matrix results
    r_matrix = np.eye(4).tolist()
    
    return {
        "session_id": payload.session_id,
        "pose_matrix_4x4": r_matrix,
        "confidence": 0.954,
        "level_detected": "FLOOR_01",
        "nearest_elements": [
            {"ifc_guid": "7f4c9a12-bd88-4a55-bb2a-fa134d1bc910", "category": "IfcWall", "distance_meters": 0.42},
            {"ifc_guid": "3a8d9e22-ff88-4212-a111-ee4c9d1bc911", "category": "IfcColumn", "distance_meters": 1.25}
        ]
    }
```

---

## 5. Mathematical Formulations & Coordinate Transformations

To align visual keypoints discovered by SLAM (local tracking origin $\mathcal{O}_{slam}$) with real-world design coordinates (global origin $\mathcal{O}_{bim}$):

$$P_{bim} = s \cdot R \cdot P_{slam} + T$$

Where:
- $s$ is the calculated scalar scale factor.
- $R \in SO(3)$ is the 3x3 rotation matrix matching orientation.
- $T \in \mathbb{R}^3$ is the translation coordinate offset vector.

We solve for $R$ and $T$ dynamically using **Singular Value Decomposition (SVD)** (the Kabsch algorithm) over correlated keypoint pairs.

---

## 6. Development Roadmap & Milestones

1. **Phase 1: Keypoint Deep Extraction (M1-M2)**
   - Integrate ONNX Runtime with SuperPoint and LightGlue networks.
   - Benchmark feature descriptor matching under poor lighting / high blur.

2. **Phase 2: Spatial Index Optimizations (M3-M4)**
   - Populate PostgreSQL with IFC bounding box matrices.
   - Build kd-tree indexes in C++ bindings to execute sub-millisecond nearest-neighbor frustum sweeps.

3. **Phase 3: Trajectory Loop Closure and Relocalizer (M5)**
   - Implement ORB-SLAM3 global pose graph optimizations.
   - Connect web UI walkthrough player with background Celery stream tasks.

---

## 7. Next-Step AI Coding Assistant Build Prompts

Use the following highly target-oriented prompts sequentially with Claude Code to generate every individual module in the workspace:

### Prompt 1: Core Database Schemas & Models
> "Generate SQLAlchemy ORM class declarations in `backend/app/models/spatial.py` reflecting coordinate transformations, camera poses, registration sessions, and IFC element bounding box ranges. Implement high-efficiency compound indexing for spatial coordinate queries."

### Prompt 2: FastAPI Endpoints Setup
> "Build the complete endpoints structure inside `backend/app/api/endpoints/registration.py` handling image-to-BIM camera pose evaluations, coordinate transformation calculations, and KD-Tree search triggers. Use Pydantic structures for strict telemetry validation."

### Prompt 3: Custom Spatial Tree Indexing
> "Implement a high-performance Python-native 3D KD-Tree structure in `backend/app/services/kd_tree.py` capable of loading thousands of spatial IFC coordinate points, bounding boxes, and returning Nearest-Neighbors within a specified search radius query."
