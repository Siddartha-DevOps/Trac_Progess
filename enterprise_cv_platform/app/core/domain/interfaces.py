from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime

from app.core.domain.entities import BIMElement, CVScanResult, SpatialAnomaly


class IStorageService(ABC):
    """
    Abstract interface port for cloud S3 object storage transactions.
    """
    @abstractmethod
    async def upload_file(self, file_path: str, bucket_name: str, object_key: str) -> str:
        """Uploads local files and returns the public file URL."""
        pass

    @abstractmethod
    async def download_file(self, bucket_name: str, object_key: str, dest_path: str) -> bool:
        """Downloads a cloud object block stream to local path."""
        pass


class IBrokerService(ABC):
    """
    Abstract interface port for distributed Redis queues or message publishing.
    """
    @abstractmethod
    async def publish_job_event(self, job_id: str, queue_name: str, payload: dict) -> bool:
        """Publishes a processing event or background job trigger."""
        pass

    @abstractmethod
    async def pop_job_event(self, queue_name: str, timeout: int = 5) -> Optional[dict]:
        """Claims a queued processing task."""
        pass


class IBIMRepository(ABC):
    """
    Abstract interface port for PostgreSQL relational database persistence.
    """
    @abstractmethod
    async def get_element_by_id(self, element_id: str) -> Optional[BIMElement]:
        """Loads a single design element state by GUID."""
        pass

    @abstractmethod
    async def update_element_progress(self, element_id: str, progress: float, status: str) -> bool:
        """Updates physical progress percentages."""
        pass

    @abstractmethod
    async def log_anomaly(self, anomaly: SpatialAnomaly) -> bool:
        """Records a new spatial deviation event."""
        pass

    @abstractmethod
    async def list_active_anomalies(self) -> List[SpatialAnomaly]:
        """Retrieves outstanding uncompleted variances."""
        pass


class IModelInferenceEngine(ABC):
    """
    Abstract interface port for neural networks (YOLOv11 and Segment Anything).
    """
    @abstractmethod
    def load_model(self) -> None:
        """Initializes model parameters inside GPU VRAM memory."""
        pass

    @abstractmethod
    def detect_and_segment(self, image_path: str) -> List[CVScanResult]:
        """Runs the neural model and returns segmented element candidates."""
        pass


class IGeometryRegister(ABC):
    """
    Abstract interface port for 3D point cloud registration algorithms (Open3D ICP).
    """
    @abstractmethod
    def align_scans_to_bim(self, scanned_points: List[tuple], design_bounds: dict) -> tuple[float, list[tuple]]:
        """Calculates rotation/translation matrices aligning physical scans to design coordinates."""
        pass
