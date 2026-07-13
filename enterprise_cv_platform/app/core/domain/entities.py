from datetime import datetime
from enum import Enum
from typing import List, Optional, Tuple, Dict, Any
from pydantic import BaseModel, Field


class BIMDomain(str, Enum):
    STRUCTURAL = "Structural"
    MEP = "MEP"
    FINISHES = "Finishes"


class ElementType(str, Enum):
    WALL = "Wall"
    COLUMN = "Column"
    SLAB = "Slab"
    BEAM = "Beam"
    PIPE = "Pipe"
    DUCT = "Duct"
    CONDUIT = "Conduit"
    SPRINKLER = "Sprinkler"


class WorkStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELAYED = "delayed"


class Point3D(BaseModel):
    """Represents a coordinate point in the construction 3D spatial space."""
    x: float
    y: float
    z: float


class BoundingBox3D(BaseModel):
    """Represent standard bounding limits of a spatial asset."""
    center: Point3D
    size: Point3D
    rotation: Tuple[float, float, float] = Field(default=(0.0, 0.0, 0.0))


class BIMElement(BaseModel):
    """The central domain entity modeling a registered physical structure."""
    id: str
    name: str
    domain: BIMDomain
    type: ElementType
    progress: float = Field(default=0.0, ge=0.0, le=100.0)
    status: WorkStatus = Field(default=WorkStatus.NOT_STARTED)
    bounds: BoundingBox3D
    material_spec: str
    installed_floor: str
    target_installation_week: int
    actual_installation_week: Optional[int] = None


class CVScanResult(BaseModel):
    """A data entity representing an inferred component detected in the camera frame."""
    id: str
    class_name: str
    confidence: float
    pixel_polygon: List[Tuple[float, float]]
    computed_3d_centroid: Point3D
    associated_bim_guid: Optional[str] = None
    scanned_at: datetime = Field(default_factory=datetime.utcnow)


class SpatialAnomaly(BaseModel):
    """Model representing detected variance between active site and design parameters."""
    id: str
    bim_element_id: str
    title: str
    severity: str = Field(default="Warning")  # Info, Warning, Critical
    deviation_description: str
    measured_variance_mm: float
    recommended_mitigation: str
    flagged_at: datetime = Field(default_factory=datetime.utcnow)
    resolved: bool = False
    resolved_at: Optional[datetime] = None
