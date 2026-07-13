import React, { useState } from "react";
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Network, 
  Cpu, 
  Palette, 
  Database, 
  Copy, 
  Check, 
  ArrowRight,
  Code
} from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
}

export default function ArchitectureExplorer() {
  const [activeTab, setActiveTab] = useState<"folder" | "hierarchy" | "state" | "theme" | "python-cv">("folder");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "root": true,
    "root/src": true,
    "root/src/app": true,
    "root/src/components": true,
    "root/src/store": true,
    "root/src/hooks": true,
  });
  const [selectedFile, setSelectedFile] = useState<string>("root/src/store/useAppStore.ts");

  const [selectedPythonFile, setSelectedPythonFile] = useState<string>("enterprise_cv_platform/requirements.txt");
  const [expandedPythonNodes, setExpandedPythonNodes] = useState<Record<string, boolean>>({
    "enterprise_cv_platform": true,
    "enterprise_cv_platform/app": true,
    "enterprise_cv_platform/app/core": true,
    "enterprise_cv_platform/app/core/domain": true,
    "enterprise_cv_platform/app/core/use_cases": true,
    "enterprise_cv_platform/app/infrastructure": true,
    "enterprise_cv_platform/app/infrastructure/ml": true,
    "enterprise_cv_platform/app/infrastructure/geometry": true,
    "enterprise_cv_platform/app/adapters": true,
    "enterprise_cv_platform/app/adapters/api": true,
  });

  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Next.js Production Directory Structure Mock Database
  const folderTree: FileNode = {
    name: "root",
    type: "folder",
    children: [
      {
        name: "package.json",
        type: "file",
        content: `{
  "name": "buildtrace-enterprise-suite",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "three": "^0.160.0",
    "lucide-react": "^0.360.0",
    "zustand": "^4.5.2",
    "@tanstack/react-query": "^5.28.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.2",
    "recharts": "^2.12.3"
  }
}`
      },
      {
        name: "src",
        type: "folder",
        children: [
          {
            name: "app",
            type: "folder",
            children: [
              {
                name: "layout.tsx",
                type: "file",
                content: `import "@/styles/globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavigation } from "@/components/layout/TopNavigation";

export const metadata = {
  title: "BuildTrace India | Enterprise BIM Monitor",
  description: "AI-driven physical site verification and progress prediction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full text-slate-800 antialiased font-sans">
        <QueryProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Workspace Stage */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <TopNavigation />
              <main className="flex-1 overflow-y-auto bg-slate-50/60 p-6">
                {children}
              </main>
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}`
              },
              {
                name: "page.tsx",
                type: "file",
                content: `import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { BIMViewer } from "@/components/bim/BIMViewer";
import { DetailsInspector } from "@/components/bim/DetailsInspector";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Upper Layout: 3D model and inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-[550px]">
          <BIMViewer />
        </div>
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
          <DetailsInspector />
        </div>
      </div>
      
      {/* Lower Metrics Section */}
      <DashboardMetrics />
    </div>
  );
}`
              },
              {
                name: "anomalies",
                type: "folder",
                children: [
                  {
                    name: "page.tsx",
                    type: "file",
                    content: `import { AnomalyGrid } from "@/components/anomalies/AnomalyGrid";
import { AIRemediationPanel } from "@/components/anomalies/AIRemediationPanel";

export default function AnomaliesPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-6">
        <AnomalyGrid />
      </div>
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <AIRemediationPanel />
      </div>
    </div>
  );
}`
                  }
                ]
              },
              {
                name: "reports",
                type: "folder",
                children: [
                  {
                    name: "page.tsx",
                    type: "file",
                    content: `import { ReportBuilder } from "@/components/reports/ReportBuilder";
import { DistributionList } from "@/components/reports/DistributionList";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <ReportBuilder />
      <DistributionList />
    </div>
  );
}`
                  }
                ]
              }
            ]
          },
          {
            name: "components",
            type: "folder",
            children: [
              {
                name: "layout",
                type: "folder",
                children: [
                  { name: "Sidebar.tsx", type: "file", content: `// Sidebar containing core enterprise modules with active routing highlights` },
                  { name: "TopNavigation.tsx", type: "file", content: `// Global site header containing breadcrumbs, active project context and workspace stats` }
                ]
              },
              {
                name: "bim",
                type: "folder",
                children: [
                  { name: "BIMViewer.tsx", type: "file", content: `// Core IFC WebGL renderer displaying the 3D model synced with scan dates` },
                  { name: "DetailsInspector.tsx", type: "file", content: `// Side properties drawer displaying CAD schema parameters when elements are clicked` }
                ]
              }
            ]
          },
          {
            name: "store",
            type: "folder",
            children: [
              {
                name: "useAppStore.ts",
                type: "file",
                content: `import { create } from "zustand";

interface AppState {
  activeModule: string;
  setActiveModule: (module: string) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  selectedAnomalyId: string | null;
  setSelectedAnomalyId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: "overview",
  setActiveModule: (module) => set({ activeModule: module }),
  selectedElementId: null,
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  selectedAnomalyId: null,
  setSelectedAnomalyId: (id) => set({ selectedAnomalyId: id }),
}));`
              }
            ]
          },
          {
            name: "hooks",
            type: "folder",
            children: [
              {
                name: "useBimData.ts",
                type: "file",
                content: `import { useQuery } from "@tanstack/react-query";

interface BimElement {
  id: string;
  name: string;
  progress: number;
  status: string;
}

export function useBimData() {
  return useQuery<BimElement[]>({
    queryKey: ["bim-elements"],
    queryFn: async () => {
      const res = await fetch("/api/bim");
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes caching threshold
  });
}`
              }
            ]
          }
        ]
      }
    ]
  };

  const pythonFolderTree: FileNode = {
    name: "enterprise_cv_platform",
    type: "folder",
    children: [
      {
        name: "requirements.txt",
        type: "file",
        content: `# core fastapi application framework
fastapi==0.111.0
uvicorn[standard]==0.30.1
pydantic==2.7.4
pydantic-settings==2.3.3

# deep learning & computer vision
torch==2.3.1
torchvision==0.18.1
ultralytics==8.2.32
segment-anything-fast==0.1.1
opencv-python-headless==4.9.0.80
numpy==1.26.4
scipy==1.13.1
open3d==0.18.0

# databases, async ORM and client connections
asyncpg==0.29.0
SQLAlchemy==2.0.30
redis==5.0.4

# aws integration & storage stream management
boto3==1.34.125
types-boto3-s3==1.34.125

# production logger, tasks, and telemetry
structlog==24.2.0
websockets==12.0
python-multipart==0.0.9
psutil==5.9.8
prometheus-client==0.20.0`
      },
      {
        name: "pyproject.toml",
        type: "file",
        content: `[tool.poetry]
name = "enterprise-cv-platform"
version = "1.0.0"
description = "Enterprise Clean Architecture Computer Vision & Photogrammetry BIM Sync Platform"
authors = ["Lead AI Engineer <lead-ai@buildtrace.in>"]
readme = "README.md"
packages = [{include = "app"}]

[tool.poetry.dependencies]
python = "^3.12"

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort (imports layout)
    "C",   # flake8-comprehensions
    "B",   # flake8-bugbear (common traps)
    "UP",  # pyupgrade (modern syntax)
]
ignore = [
    "E501", # line length handled by black/ruff formatter
    "B008", # function call in argument default (FastAPI Depends)
]

[tool.ruff.lint.isort]
known-first-party = ["app"]
combine-as-imports = true

[tool.black]
line-length = 100
target-version = ['py312']

[tool.mypy]
python_version = "3.12"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
show_error_codes = true`
      },
      {
        name: "docker-compose.yml",
        type: "file",
        content: `version: '3.8'

services:
  cv-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: buildtrace_cv_app
    ports:
      - "3000:3000"
    environment:
      - APP_ENV=production
      - DEBUG=false
      - DATABASE_URL=postgresql+asyncpg://buildtrace_admin:secure_db_password_98231@postgres:5432/buildtrace_cv_prod
      - REDIS_URL=redis://redis:6379/0
      - AWS_REGION=ap-south-1
      - S3_BUCKET_RAW_VIDEOS=buildtrace-mumbai-raw-walkthroughs
      - S3_BUCKET_EXTRACTED_FRAMES=buildtrace-mumbai-processed-frames
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - buildtrace_net
    restart: always

  postgres:
    image: postgres:16-alpine
    container_name: buildtrace_cv_db
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=buildtrace_admin
      - POSTGRES_PASSWORD=secure_db_password_98231
      - POSTGRES_DB=buildtrace_cv_prod
    volumes:
      - pgdata_volume:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U buildtrace_admin -d buildtrace_cv_prod"]
      interval: 10s
    networks:
      - buildtrace_net

  redis:
    image: redis:7-alpine
    container_name: buildtrace_cv_redis
    ports:
      - "6379:6379"
    networks:
      - buildtrace_net

networks:
  buildtrace_net:
    driver: bridge

volumes:
  pgdata_volume:
    driver: local`
      },
      {
        name: "Dockerfile",
        type: "file",
        content: `FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \\
    python3.12 python3.12-dev python3-pip python3-setuptools build-essential \\
    libgl1-mesa-glx libglib2.0-0 libgomp1 curl git && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY requirements.txt .
RUN python3.12 -m pip install --upgrade pip && \\
    python3.12 -m pip wheel --no-cache-dir --wheel-dir=/build/wheels -r requirements.txt


FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04 AS runner

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PYTHONPATH="/app" DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \\
    python3.12 python3-pip libgl1-mesa-glx libglib2.0-0 libgomp1 libgfortran5 curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /build/wheels /wheels
COPY requirements.txt .
RUN python3.12 -m pip install --no-index --find-links=/wheels -r requirements.txt && rm -rf /wheels requirements.txt

RUN groupadd -g 10001 buildtrace_group && useradd -r -u 10001 -g buildtrace_group -m -d /home/buildtrace_user buildtrace_user
RUN mkdir -p /app/weights /app/logs /app/temp_frames && chown -R buildtrace_user:buildtrace_group /app

COPY --chown=buildtrace_user:buildtrace_group ./app /app/app
USER buildtrace_user
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \\
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]`
      },
      {
        name: ".env.example",
        type: "file",
        content: `APP_NAME="BuildTrace CV Inference Platform"
APP_ENV="production"
DEBUG=false
DATABASE_URL="postgresql+asyncpg://buildtrace_admin:secure_db_password_98231@localhost:5432/buildtrace_cv_prod"
REDIS_URL="redis://localhost:6379/0"
AWS_REGION="ap-south-1"
S3_BUCKET_RAW_VIDEOS="buildtrace-mumbai-raw-walkthroughs"
S3_BUCKET_EXTRACTED_FRAMES="buildtrace-mumbai-processed-frames"
YOLO_WEIGHTS_PATH="/app/weights/yolov11x-seg.pt"
SAM_WEIGHTS_PATH="/app/weights/sam2_hiera_large.pt"
LOG_LEVEL="INFO"
LOG_FORMAT="json"`
      },
      {
        name: "app",
        type: "folder",
        children: [
          {
            name: "main.py",
            type: "file",
            content: `from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.adapters.api.router import router as api_router
from app.adapters.api.websocket import ws_router
from app.config import settings
from app.logger import configure_logging, get_logger

configure_logging()
logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Initializing BuildTrace Computer Vision platform", env=settings.APP_ENV)
    from app.infrastructure.ml.yolo_segmenter import MultiModelInferenceEngine
    ml_engine = MultiModelInferenceEngine()
    ml_engine.load_model()
    app.state.ml_engine = ml_engine
    yield
    logger.info("Graceful shutdown initiated.")

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)`
          },
          {
            name: "config.py",
            type: "file",
            content: `import os
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class AppEnvironment(str, Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    PRODUCTION = "production"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    # 1. Core Application Configuration
    APP_NAME: str = "BuildTrace CV Inference Platform"
    APP_ENV: AppEnvironment = AppEnvironment.PRODUCTION
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "replace-this-with-a-secure-random-32-character-hex-string"
    PORT: int = 3000
    HOST: str = "0.0.0.0"

    # 2. Advanced GPU & Deep Learning Model Settings
    CUDA_VISIBLE_DEVICES: str = "0"
    USE_HALF_PRECISION_FP16: bool = True
    YOLO_WEIGHTS_PATH: str = "/app/weights/yolov11x-seg.pt"
    SAM_WEIGHTS_PATH: str = "/app/weights/sam2_hiera_large.pt"
    INFERENCE_CONFIDENCE_THRESHOLD: float = 0.35
    MAX_BATCH_SIZE: int = 8
    GPU_MEMORY_FRACTION: float = 0.85
    TENSORRT_OPTIMIZATION_ENABLED: bool = False

    # 3. Database Settings (PostgreSQL Pools)
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "buildtrace_admin"
    POSTGRES_PASSWORD: str = "secure_db_password_98231"
    POSTGRES_DB: str = "buildtrace_cv_prod"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[str] = None

    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE_SECONDS: int = 1800
    DB_ECHO_SQL_QUERIES: bool = False

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: Any) -> Any:
        if isinstance(v, str) and v: return v
        values = info.data
        env = values.get("APP_ENV", AppEnvironment.PRODUCTION)
        user = values.get("POSTGRES_USER", "buildtrace_admin")
        pw = values.get("POSTGRES_PASSWORD", "secure_db_password_98231")
        srv = values.get("POSTGRES_SERVER", "localhost")
        port = values.get("POSTGRES_PORT", 5432)
        db = "buildtrace_cv_test" if env == AppEnvironment.TESTING else values.get("POSTGRES_DB", "buildtrace_cv_prod")
        return f"postgresql+asyncpg://{user}:{pw}@{srv}:{port}/{db}"

    # 4. Redis Cluster & Broker Settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    REDIS_URL: Optional[str] = None
    REDIS_SSL: bool = False
    REDIS_SOCKET_TIMEOUT_SECONDS: float = 5.0
    REDIS_MAX_CONNECTIONS: int = 50
    REDIS_RETRY_ATTEMPTS: int = 5

    @field_validator("REDIS_URL", mode="before")
    @classmethod
    def assemble_redis_url(cls, v: Optional[str], info: Any) -> Any:
        if isinstance(v, str) and v: return v
        values = info.data
        host = values.get("REDIS_HOST", "localhost")
        port = values.get("REDIS_PORT", 6379)
        pw = values.get("REDIS_PASSWORD")
        db = values.get("REDIS_DB", 0)
        ssl_prefix = "rediss" if values.get("REDIS_SSL", False) else "redis"
        auth = f":{pw}@" if pw else ""
        return f"{ssl_prefix}://{auth}{host}:{port}/{db}"

    # 5. AWS S3 Storage Settings
    AWS_ACCESS_KEY_ID: str = "MOCK_AWS_ACCESS_KEY_ID"
    AWS_SECRET_ACCESS_KEY: str = "MOCK_AWS_SECRET_ACCESS_KEY"
    AWS_REGION: str = "ap-south-1"
    AWS_S3_ENDPOINT_URL: Optional[str] = None
    S3_MULTIPART_THRESHOLD_MB: int = 50
    S3_MULTIPART_CHUNKSIZE_MB: int = 15
    S3_TRANSFER_MAX_CONCURRENCY: int = 10
    S3_BUCKET_RAW_VIDEOS: str = "buildtrace-mumbai-raw-walkthroughs"
    S3_BUCKET_EXTRACTED_FRAMES: str = "buildtrace-mumbai-processed-frames"

    # 6. Structured Logging & Metrics
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    LOG_FILE_PATH: Optional[str] = None
    ENABLE_PROMETHEUS_METRICS: bool = True
    METRICS_PORT: int = 8000

    @model_validator(mode="after")
    def enforce_environment_security_rules(self) -> "Settings":
        if self.APP_ENV == AppEnvironment.PRODUCTION:
            self.LOG_FORMAT = "json"
            if self.DEBUG: self.DEBUG = False
        elif self.APP_ENV == AppEnvironment.TESTING:
            self.DEBUG = True
            self.DB_POOL_SIZE = 5
            self.DB_MAX_OVERFLOW = 0
            self.AWS_S3_ENDPOINT_URL = "http://localhost:4566"
        elif self.APP_ENV == AppEnvironment.DEVELOPMENT:
            self.DEBUG = True
            self.LOG_FORMAT = "console"
        return self

settings = Settings()`
          },
          {
            name: "logger.py",
            type: "file",
            content: `import sys, structlog, logging
from app.config import settings

def configure_logging() -> None:
    renderer = structlog.processors.JSONRenderer() if settings.LOG_FORMAT == "json" else structlog.dev.ConsoleRenderer()
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.processors.TimeStamps(fmt="iso"),
            structlog.stdlib.add_log_level,
            renderer,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
    )
    logging.basicConfig(stream=sys.stdout, level=logging.INFO)`
          },
          {
            name: "core",
            type: "folder",
            children: [
              {
                name: "domain",
                type: "folder",
                children: [
                  {
                    name: "entities.py",
                    type: "file",
                    content: `from enum import Enum
from typing import List, Optional, Tuple
from pydantic import BaseModel

class BIMDomain(str, Enum):
    STRUCTURAL = "Structural"
    MEP = "MEP"
    FINISHES = "Finishes"

class Point3D(BaseModel):
    x: float; y: float; z: float

class BIMElement(BaseModel):
    id: str; name: str; domain: BIMDomain; progress: float

class SpatialAnomaly(BaseModel):
    id: str; bim_element_id: str; title: str; measured_variance_mm: float; recommended_mitigation: str`
                  },
                  {
                    name: "interfaces.py",
                    type: "file",
                    content: `from abc import ABC, abstractmethod
from typing import List
from app.core.domain.entities import BIMElement, SpatialAnomaly

class IBIMRepository(ABC):
    @abstractmethod
    async def get_element_by_id(self, element_id: str) -> BIMElement: pass
    @abstractmethod
    async def log_anomaly(self, anomaly: SpatialAnomaly) -> bool: pass

class IGeometryRegister(ABC):
    @abstractmethod
    def align_scans_to_bim(self, scanned_points: List[tuple], design_bounds: dict) -> tuple: pass`
                  }
                ]
              },
              {
                name: "use_cases",
                type: "folder",
                children: [
                  {
                    name: "align_point_cloud.py",
                    type: "file",
                    content: `import uuid
from app.core.domain.entities import SpatialAnomaly
from app.core.domain.interfaces import IBIMRepository, IGeometryRegister

class AlignPointCloudUseCase:
    def __init__(self, db_repo: IBIMRepository, geom_register: IGeometryRegister):
        self.db_repo = db_repo
        self.geom_register = geom_register

    async def execute(self, element_id: str, scanned_coords: list) -> bool:
        element = await self.db_repo.get_element_by_id(element_id)
        mse, aligned_pts = self.geom_register.align_scans_to_bim(scanned_coords, {"center": [0,0,0]})
        variance_mm = mse * 1000.0
        if variance_mm > 25.0:
            anomaly = SpatialAnomaly(id=f"anom-{uuid.uuid4().hex[:6]}", bim_element_id=element_id, title="Position Variance", measured_variance_mm=variance_mm, recommended_mitigation="Review placement.")
            await self.db_repo.log_anomaly(anomaly)
        return True`
                  }
                ]
              }
            ]
          },
          {
            name: "infrastructure",
            type: "folder",
            children: [
              {
                name: "ml",
                type: "folder",
                children: [
                  {
                    name: "yolo_segmenter.py",
                    type: "file",
                    content: `import torch
from app.core.domain.entities import CVScanResult
from app.core.domain.interfaces import IModelInferenceEngine

class MultiModelInferenceEngine(IModelInferenceEngine):
    def load_model(self) -> None:
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        # Loaded YOLOv11 and SAM models on GPU

    def detect_and_segment(self, image_path: str) -> list:
        # Runs instance segmentation pipelines
        return []`
                  }
                ]
              },
              {
                name: "geometry",
                type: "folder",
                children: [
                  {
                    name: "icp_aligner.py",
                    type: "file",
                    content: `import numpy as np
from app.core.domain.interfaces import IGeometryRegister

class Open3DGeometryRegister(IGeometryRegister):
    def align_scans_to_bim(self, scanned_points: list, design_bounds: dict) -> tuple:
        # Calculates rotation/translation aligning physical scan with design coordinate model
        return 0.0125, scanned_points`
                  }
                ]
              }
            ]
          },
          {
            name: "adapters",
            type: "folder",
            children: [
              {
                name: "api",
                type: "folder",
                children: [
                  {
                    name: "router.py",
                    type: "file",
                    content: `from fastapi import APIRouter, BackgroundTasks, status
from pydantic import BaseModel

router = APIRouter()

class IngestRequest(BaseModel):
    project_id: str; walkthrough_id: str; s3_video_key: str

@router.post("/process-walkthrough", status_code=status.HTTP_202_ACCEPTED)
async def process_walkthrough(payload: IngestRequest, background_tasks: BackgroundTasks):
    return {"job_id": "cv-job-88231", "status": "queued"}`
                  },
                  {
                    name: "websocket.py",
                    type: "file",
                    content: `import asyncio, json
from fastapi import APIRouter, WebSocket

ws_router = APIRouter()

@ws_router.websocket("/ws/logs/{job_id}")
async def stream_walkthrough_logs(websocket: WebSocket, job_id: str):
    await websocket.accept()
    # Stream live telemetry updates to web UI
    await websocket.send_text(json.dumps({"step": "inference", "progress_percent": 55.0, "log": "Running YOLOv11..."}))`
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  const togglePythonNode = (path: string) => {
    setExpandedPythonNodes(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderPythonTree = (node: FileNode, currentPath: string) => {
    const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;
    const isExpanded = expandedPythonNodes[nodePath];
    const isSelected = selectedPythonFile === nodePath;

    if (node.type === "file") {
      return (
        <div 
          key={nodePath}
          onClick={() => setSelectedPythonFile(nodePath)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer text-xs font-mono transition-colors ${
            isSelected 
              ? "bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600 pl-2.5" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
          <span className="truncate">{node.name}</span>
        </div>
      );
    }

    return (
      <div key={nodePath} className="flex flex-col">
        <div 
          onClick={() => togglePythonNode(nodePath)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-xs font-semibold text-slate-700 hover:bg-slate-100/80 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </div>
        
        {isExpanded && node.children && (
          <div className="pl-4 ml-2 border-l border-slate-200 flex flex-col gap-0.5 mt-0.5">
            {node.children.map(child => renderPythonTree(child, nodePath))}
          </div>
        )}
      </div>
    );
  };

  const getPythonFileContent = (path: string, node: FileNode): string | undefined => {
    if (path === node.name) return node.content;
    const segments = path.split("/");
    if (segments[0] === node.name) {
      if (segments.length === 1) return node.content;
      const subPath = segments.slice(1).join("/");
      for (const child of node.children || []) {
        const found = getPythonFileContent(subPath, child);
        if (found) return found;
      }
    }
    return undefined;
  };

  const activePythonFileContent = getPythonFileContent(selectedPythonFile, pythonFolderTree) || "# Select a file to inspect its Python clean architecture code";

  const getFileContent = (path: string, node: FileNode): string | undefined => {
    if (path === node.name) return node.content;
    const segments = path.split("/");
    if (segments[0] === node.name) {
      if (segments.length === 1) return node.content;
      const subPath = segments.slice(1).join("/");
      for (const child of node.children || []) {
        const found = getFileContent(subPath, child);
        if (found) return found;
      }
    }
    return undefined;
  };

  const renderTree = (node: FileNode, currentPath: string) => {
    const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;
    const isExpanded = expandedNodes[nodePath];
    const isSelected = selectedFile === nodePath;

    if (node.type === "file") {
      return (
        <div 
          key={nodePath}
          onClick={() => setSelectedFile(nodePath)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer text-xs font-mono transition-colors ${
            isSelected 
              ? "bg-indigo-50 text-indigo-700 font-semibold" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
          <span className="truncate">{node.name}</span>
        </div>
      );
    }

    return (
      <div key={nodePath} className="flex flex-col">
        <div 
          onClick={() => toggleNode(nodePath)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-xs font-semibold text-slate-700 hover:bg-slate-100/80 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </div>
        
        {isExpanded && node.children && (
          <div className="pl-4 ml-2 border-l border-slate-200 flex flex-col gap-0.5 mt-0.5">
            {node.children.map(child => renderTree(child, nodePath))}
          </div>
        )}
      </div>
    );
  };

  const activeFileContent = getFileContent(selectedFile, folderTree) || "// Select a file to inspect its Next.js blueprint code";

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
      
      {/* Sub Header tabs */}
      <div className="bg-slate-50/50 border-b border-slate-200 px-5 py-3 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Enterprise Architecture blueprints</h3>
        </div>
        <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab("folder")}
            className={`px-3 py-1 rounded-md transition ${activeTab === "folder" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Folder Structure
          </button>
          <button
            onClick={() => setActiveTab("hierarchy")}
            className={`px-3 py-1 rounded-md transition ${activeTab === "hierarchy" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Component Hierarchy
          </button>
          <button
            onClick={() => setActiveTab("state")}
            className={`px-3 py-1 rounded-md transition ${activeTab === "state" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            State Management
          </button>
          <button
            onClick={() => setActiveTab("theme")}
            className={`px-3 py-1 rounded-md transition ${activeTab === "theme" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Theme Tokens
          </button>
          <button
            onClick={() => setActiveTab("python-cv")}
            className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${activeTab === "python-cv" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Code className="w-3.5 h-3.5" />
            Python CV Backend
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        
        {/* TAB: Python CV Engine Structure */}
        {activeTab === "python-cv" && (
          <>
            {/* Left tree navigation (4 columns) */}
            <div className="lg:col-span-4 border-r border-slate-200 p-4 overflow-y-auto max-h-[500px]">
              <div className="mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">Python 3.12 Clean Architecture</div>
              <div className="flex flex-col gap-0.5">
                {renderPythonTree(pythonFolderTree, "")}
              </div>
            </div>

            {/* Right code editor mock (8 columns) */}
            <div className="lg:col-span-8 flex flex-col bg-slate-950 text-slate-300 overflow-hidden h-[500px]">
              <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
                <span className="font-mono text-xs text-indigo-400">{selectedPythonFile}</span>
                <button
                  onClick={() => triggerCopy(activePythonFileContent, "python-code")}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                >
                  {copiedText === "python-code" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 overflow-auto font-mono text-xs leading-relaxed flex-1 select-all selection:bg-slate-800 text-slate-200">
                <code>{activePythonFileContent}</code>
              </pre>
            </div>
          </>
        )}

        {/* TAB: Folder tree viewer */}
        {activeTab === "folder" && (
          <>
            {/* Left tree navigation (4 columns) */}
            <div className="lg:col-span-4 border-r border-slate-200 p-4 overflow-y-auto max-h-[500px]">
              <div className="mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">Next.js App Router Structure</div>
              <div className="flex flex-col gap-0.5">
                {renderTree(folderTree, "")}
              </div>
            </div>

            {/* Right code editor mock (8 columns) */}
            <div className="lg:col-span-8 flex flex-col bg-slate-950 text-slate-300 overflow-hidden h-[500px]">
              <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
                <span className="font-mono text-xs text-indigo-400">{selectedFile.replace("root/", "")}</span>
                <button
                  onClick={() => triggerCopy(activeFileContent, "code")}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                >
                  {copiedText === "code" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="p-4 overflow-auto font-mono text-xs leading-relaxed flex-1 select-all selection:bg-slate-800 text-slate-200">
                <code>{activeFileContent}</code>
              </pre>
            </div>
          </>
        )}

        {/* TAB: Component hierarchy flow map */}
        {activeTab === "hierarchy" && (
          <div className="lg:col-span-12 p-6 flex flex-col gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Module Component Hierarchy & Prop Flow</h4>
              <p className="text-xs text-slate-500">How visual and functional parts interact in our production-ready layout.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch mt-2 text-center text-xs">
              
              {/* Level 1: Root Providers */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="font-bold text-indigo-600 uppercase tracking-wider text-[10px] mb-1.5">Layer 1: Entry context</div>
                  <span className="font-semibold text-slate-800 block p-2 bg-white border border-slate-200 rounded-md">RootLayout (app/layout.tsx)</span>
                </div>
                <div className="flex justify-center my-3 text-slate-400">
                  <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="p-1.5 bg-indigo-50 border border-indigo-100 rounded text-[11px] font-mono text-indigo-700">QueryProvider</span>
                  <span className="p-1.5 bg-indigo-50 border border-indigo-100 rounded text-[11px] font-mono text-indigo-700">useAppStore Context</span>
                </div>
              </div>

              {/* Level 2: Layout Frame */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="font-bold text-indigo-600 uppercase tracking-wider text-[10px] mb-1.5">Layer 2: Nav framing</div>
                  <span className="font-semibold text-slate-800 block p-2 bg-white border border-slate-200 rounded-md">MainWorkspaceFrame</span>
                </div>
                <div className="flex justify-center my-3 text-slate-400">
                  <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                </div>
                <div className="flex flex-col gap-1.5 text-left text-slate-600">
                  <span className="p-1.5 bg-white border border-slate-200 rounded font-semibold">• Sidebar (Nav)</span>
                  <span className="p-1.5 bg-white border border-slate-200 rounded font-semibold">• TopNavigation (HUD)</span>
                </div>
              </div>

              {/* Level 3: Active Routing Route Page */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="font-bold text-indigo-600 uppercase tracking-wider text-[10px] mb-1.5">Layer 3: Router page</div>
                  <span className="font-semibold text-slate-800 block p-2 bg-white border border-slate-200 rounded-md">DashboardPage (app/page.tsx)</span>
                </div>
                <div className="flex justify-center my-3 text-slate-400">
                  <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                </div>
                <div className="flex flex-col gap-1.5 text-left text-slate-600">
                  <span className="p-1.5 bg-white border border-slate-100 rounded">• 3D Tracker view</span>
                  <span className="p-1.5 bg-white border border-slate-100 rounded">• Anomaly Panel</span>
                  <span className="p-1.5 bg-white border border-slate-100 rounded">• Reports center</span>
                </div>
              </div>

              {/* Level 4: Core Interactive canvas/components */}
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50/50 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="font-bold text-indigo-600 uppercase tracking-wider text-[10px] mb-1.5">Layer 4: Render view</div>
                  <span className="font-semibold text-slate-800 block p-2 bg-white border border-slate-200 rounded-md">BIMViewer Component</span>
                </div>
                <div className="my-3 flex justify-center text-slate-400">
                  <ArrowRight className="w-4 h-4 shrink-0 rotate-90 md:rotate-0 opacity-0" />
                </div>
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="p-1.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded font-bold">• IFCJsViewerEngine</span>
                  <span className="p-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded font-mono text-[10px]">• OrbitControls & Camera</span>
                  <span className="p-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded font-mono text-[10px]">• Ambient + Dir Lights</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: State Management Blueprint */}
        {activeTab === "state" && (
          <div className="lg:col-span-12 p-6 flex flex-col gap-5 text-xs text-slate-600 h-[500px] overflow-y-auto">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">State Synchronizer & Caching Strategy</h4>
              <p className="text-xs text-slate-500">Zustand manages local selections and layout toggles. TanStack Query caches remote server database endpoints.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 items-stretch">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-indigo-700 font-mono flex items-center gap-1">
                    <Database className="w-4 h-4 text-indigo-600" />
                    ZUSTAND STORE FLOW
                  </span>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-1.5 py-0.5 rounded font-mono">Client state</span>
                </div>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  When a user clicks on an element in the 3D model, the `IFCJsViewerEngine` captures the GUID and triggers:
                </p>
                <div className="bg-slate-950 text-slate-300 font-mono p-3 rounded-lg border border-slate-800 text-[11px] leading-relaxed select-all">
                  {`// Trigger state change globally
const selectElement = useAppStore(state => state.selectElementById);
selectElement("col_c4");`}
                </div>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  This updates the global store, instantly causing the **DetailsInspector** sidebar to read the selected element's custom specifications without drilling props.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-bold text-indigo-700 font-mono flex items-center gap-1">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    TANSTACK REACT QUERY FLOW
                  </span>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-1.5 py-0.5 rounded font-mono">Server state</span>
                </div>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  React Query caches and manages remote server state, like the anomalies or reports database:
                </p>
                <div className="bg-slate-950 text-slate-300 font-mono p-3 rounded-lg border border-slate-800 text-[11px] leading-relaxed select-all">
                  {`// Hooks-level data query fetching with cache
const { data: anomalies, isLoading } = useQuery({
  queryKey: ["site-anomalies"],
  queryFn: fetchAnomaliesFromServer,
  staleTime: 60000, // 1 min cache safety
});`}
                </div>
                <p className="leading-relaxed text-slate-600 text-[11px]">
                  Keeps the client interface light, handles automated offline polling fallback, and maintains a highly reactive experience for drone inspection data.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* TAB: Theme Tokens */}
        {activeTab === "theme" && (
          <div className="lg:col-span-12 p-6 flex flex-col gap-6 text-xs text-slate-600">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Tailwind-Engineered Corporate Theme Tokens</h4>
              <p className="text-xs text-slate-500">Our palette matches tracprogress® & Procore: premium light-gray layout, stark crisp white surfaces, sharp deep charcoal headings, and subtle drop shadows.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              
              {/* Token 1 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col gap-3 shadow-sm">
                <div className="h-16 rounded-lg bg-white border border-slate-200 shadow-sm" />
                <div>
                  <span className="font-bold text-slate-900 block font-mono text-[11px]">Surface: Stark White</span>
                  <span className="text-[10px] text-slate-500 font-mono">bg-white</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Used on cards, inspector sidebars, and main active layers.</p>
                </div>
              </div>

              {/* Token 2 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col gap-3 shadow-sm">
                <div className="h-16 rounded-lg bg-[#f8fafc] border border-slate-200" />
                <div>
                  <span className="font-bold text-slate-900 block font-mono text-[11px]">Canvas: Soft Off-White</span>
                  <span className="text-[10px] text-slate-500 font-mono">bg-slate-50</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Surrounding body background which emphasizes focus on content cards.</p>
                </div>
              </div>

              {/* Token 3 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col gap-3 shadow-sm">
                <div className="h-16 rounded-lg bg-slate-900" />
                <div>
                  <span className="font-bold text-slate-900 block font-mono text-[11px]">Primary Text: Deep Slate</span>
                  <span className="text-[10px] text-slate-500 font-mono">text-slate-900</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Highly legible, ultra-crisp charcoal typography. Avoids absolute blacks.</p>
                </div>
              </div>

              {/* Token 4 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col gap-3 shadow-sm">
                <div className="h-16 rounded-lg bg-indigo-600" />
                <div>
                  <span className="font-bold text-slate-900 block font-mono text-[11px]">Focus Action: Royal Indigo</span>
                  <span className="text-[10px] text-slate-500 font-mono">text-indigo-600</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">The single functional color for active highlights, buttons, and alerts.</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
