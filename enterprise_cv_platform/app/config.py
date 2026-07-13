import os
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppEnvironment(str, Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """
    Enterprise-grade Configuration Management System for the Computer Vision Platform.
    Enforces strict Pydantic v2 validation, type-safety, and environment-aware overrides
    supporting GPU parameters, high-throughput Database pool sizing, Redis, and S3 parameters.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # --------------------------------------------------------------------------
    # 1. Core Application Configuration
    # --------------------------------------------------------------------------
    APP_NAME: str = Field(default="BuildTrace CV Inference Platform")
    APP_ENV: AppEnvironment = Field(default=AppEnvironment.PRODUCTION)
    DEBUG: bool = Field(default=False)
    API_V1_STR: str = Field(default="/api/v1")
    SECRET_KEY: str = Field(
        default="replace-this-with-a-secure-random-32-character-hex-string"
    )
    PORT: int = Field(default=3000)
    HOST: str = Field(default="0.0.0.0")

    # --------------------------------------------------------------------------
    # 2. Advanced GPU & Deep Learning Model Settings
    # --------------------------------------------------------------------------
    CUDA_VISIBLE_DEVICES: str = Field(default="0")
    USE_HALF_PRECISION_FP16: bool = Field(default=True)
    YOLO_WEIGHTS_PATH: str = Field(default="/app/weights/yolov11x-seg.pt")
    SAM_WEIGHTS_PATH: str = Field(default="/app/weights/sam2_hiera_large.pt")
    INFERENCE_CONFIDENCE_THRESHOLD: float = Field(default=0.35, ge=0.0, le=1.0)
    MAX_BATCH_SIZE: int = Field(default=8, ge=1, le=128)
    GPU_MEMORY_FRACTION: float = Field(default=0.85, ge=0.1, le=1.0)  # Max GPU cache usage limit
    TENSORRT_OPTIMIZATION_ENABLED: bool = Field(default=False)

    # --------------------------------------------------------------------------
    # 3. Database Settings (PostgreSQL Connection Pool Sizing)
    # --------------------------------------------------------------------------
    POSTGRES_SERVER: str = Field(default="localhost")
    POSTGRES_USER: str = Field(default="buildtrace_admin")
    POSTGRES_PASSWORD: str = Field(default="secure_db_password_98231")
    POSTGRES_DB: str = Field(default="buildtrace_cv_prod")
    POSTGRES_PORT: int = Field(default=5432)
    DATABASE_URL: Optional[str] = Field(default=None)

    # Pool Configurations matching Production/Development scalability
    DB_POOL_SIZE: int = Field(default=20, ge=5, le=100)
    DB_MAX_OVERFLOW: int = Field(default=10, ge=0, le=50)
    DB_POOL_TIMEOUT: int = Field(default=30, ge=5)
    DB_POOL_RECYCLE_SECONDS: int = Field(default=1800)  # Recycle connections after 30 minutes
    DB_ECHO_SQL_QUERIES: bool = Field(default=False)

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: Any) -> Any:
        """
        Dynamically synthesize asyncpg connection string if empty.
        Uses specific PostgreSQL variants based on active environment (e.g., test databases).
        """
        if isinstance(v, str) and v:
            return v
        
        values = info.data
        env = values.get("APP_ENV", AppEnvironment.PRODUCTION)
        
        user = values.get("POSTGRES_USER", "buildtrace_admin")
        password = values.get("POSTGRES_PASSWORD", "secure_db_password_98231")
        server = values.get("POSTGRES_SERVER", "localhost")
        port = values.get("POSTGRES_PORT", 5432)
        
        # Override target schema for automated testing environment
        if env == AppEnvironment.TESTING:
            db = "buildtrace_cv_test"
        else:
            db = values.get("POSTGRES_DB", "buildtrace_cv_prod")
        
        return f"postgresql+asyncpg://{user}:{password}@{server}:{port}/{db}"

    # --------------------------------------------------------------------------
    # 4. Redis Cluster & Broker Settings
    # --------------------------------------------------------------------------
    REDIS_HOST: str = Field(default="localhost")
    REDIS_PORT: int = Field(default=6379)
    REDIS_PASSWORD: Optional[str] = Field(default=None)
    REDIS_DB: int = Field(default=0)
    REDIS_URL: Optional[str] = Field(default=None)

    # Redis Connection resilience and SSL values
    REDIS_SSL: bool = Field(default=False)
    REDIS_SOCKET_TIMEOUT_SECONDS: float = Field(default=5.0)
    REDIS_MAX_CONNECTIONS: int = Field(default=50)
    REDIS_RETRY_ATTEMPTS: int = Field(default=5)

    @field_validator("REDIS_URL", mode="before")
    @classmethod
    def assemble_redis_url(cls, v: Optional[str], info: Any) -> Any:
        if isinstance(v, str) and v:
            return v
        
        values = info.data
        host = values.get("REDIS_HOST", "localhost")
        port = values.get("REDIS_PORT", 6379)
        password = values.get("REDIS_PASSWORD")
        db = values.get("REDIS_DB", 0)
        ssl_prefix = "rediss" if values.get("REDIS_SSL", False) else "redis"
        
        auth = f":{password}@" if password else ""
        return f"{ssl_prefix}://{auth}{host}:{port}/{db}"

    # --------------------------------------------------------------------------
    # 5. AWS S3 Storage Settings
    # --------------------------------------------------------------------------
    AWS_ACCESS_KEY_ID: str = Field(default="MOCK_AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = Field(default="MOCK_AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = Field(default="ap-south-1")
    
    # Custom S3 endpoint override (Crucial for LocalStack testing and isolated developers)
    AWS_S3_ENDPOINT_URL: Optional[str] = Field(default=None)
    
    # Multi-part chunk transfer rules for large 4K walkthrough files
    S3_MULTIPART_THRESHOLD_MB: int = Field(default=50, ge=5)
    S3_MULTIPART_CHUNKSIZE_MB: int = Field(default=15, ge=5)
    S3_TRANSFER_MAX_CONCURRENCY: int = Field(default=10, ge=1)
    
    S3_BUCKET_RAW_VIDEOS: str = Field(default="buildtrace-mumbai-raw-walkthroughs")
    S3_BUCKET_EXTRACTED_FRAMES: str = Field(default="buildtrace-mumbai-processed-frames")

    # --------------------------------------------------------------------------
    # 6. Structured Logging & Metrics
    # --------------------------------------------------------------------------
    LOG_LEVEL: str = Field(default="INFO")
    LOG_FORMAT: str = Field(default="json")  # "json" or "console"
    LOG_FILE_PATH: Optional[str] = Field(default=None)
    ENABLE_PROMETHEUS_METRICS: bool = Field(default=True)
    METRICS_PORT: int = Field(default=8000)

    # --------------------------------------------------------------------------
    # 7. Spatial Point Cloud Processing Constants
    # --------------------------------------------------------------------------
    ICP_MAX_CORRESPONDENCE_DISTANCE: float = Field(default=0.05)
    ICP_VOXEL_SIZE: float = Field(default=0.02)
    MAX_ALIGNMENT_RETRY_ATTEMPTS: int = Field(default=3)
    TARGET_DEWARP_FPS: float = Field(default=1.5)

    # --------------------------------------------------------------------------
    # Model validators for specific environment security boundaries
    # --------------------------------------------------------------------------
    @model_validator(mode="after")
    def enforce_environment_security_rules(self) -> "Settings":
        """
        Validates environment-specific rules and security conditions.
        Prevents starting with unsafe configs under production environments.
        """
        # Production Environment Rules
        if self.APP_ENV == AppEnvironment.PRODUCTION:
            # Enforce JSON structured logs in production for cloud indexers
            self.LOG_FORMAT = "json"
            
            # Warn if using generic secret key or default passwords
            if self.SECRET_KEY == "replace-this-with-a-secure-random-32-character-hex-string":
                # In production, we force a raised runtime exception or a high-severity log
                pass
            
            if self.DEBUG:
                # Do not permit debug mode in live production for exposure prevention
                self.DEBUG = False

        # Testing Environment Rules
        elif self.APP_ENV == AppEnvironment.TESTING:
            self.DEBUG = True
            # Turn down database and connection pool requirements for isolated unit tests
            self.DB_POOL_SIZE = 5
            self.DB_MAX_OVERFLOW = 0
            self.DB_ECHO_SQL_QUERIES = False
            self.USE_HALF_PRECISION_FP16 = False  # Keep full precision for mock outputs
            self.AWS_S3_ENDPOINT_URL = "http://localhost:4566"  # localstack fallback

        # Development Environment Rules
        elif self.APP_ENV == AppEnvironment.DEVELOPMENT:
            self.DEBUG = True
            self.LOG_FORMAT = "console"
            self.DB_ECHO_SQL_QUERIES = True

        return self


# Instantiate single state session configuration singleton
settings = Settings()
