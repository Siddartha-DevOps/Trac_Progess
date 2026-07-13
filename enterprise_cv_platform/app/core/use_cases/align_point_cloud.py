from datetime import datetime
import uuid
from typing import List, Optional

from app.core.domain.entities import SpatialAnomaly, Point3D
from app.core.domain.interfaces import IBIMRepository, IGeometryRegister
from app.logger import get_logger

logger = get_logger(__name__)


class AlignPointCloudUseCase:
    """
    Central spatial use case coordinating raw photogrammetry alignment.
    Aligns 3D point clouds extracted from the site walk with design BIM boundaries.
    """
    def __init__(self, db_repo: IBIMRepository, geom_register: IGeometryRegister):
        self.db_repo = db_repo
        self.geom_register = geom_register

    async def execute(self, element_id: str, scanned_coords: List[tuple]) -> bool:
        """
        Coordinates the point-cloud registration and variance check for a given BIM element.
        """
        logger.info("Starting point cloud alignment", bim_element_id=element_id, points_count=len(scanned_coords))

        # 1. Load element specifications from PostgreSQL
        element = await self.db_repo.get_element_by_id(element_id)
        if not element:
            logger.error("BIM Element not found in database", bim_element_id=element_id)
            return False

        # 2. Package design bounds metadata
        design_bounds = {
            "center": {"x": element.bounds.center.x, "y": element.bounds.center.y, "z": element.bounds.center.z},
            "size": {"x": element.bounds.size.x, "y": element.bounds.size.y, "z": element.bounds.size.z}
        }

        # 3. Call Open3D ICP implementation port to register geometries
        try:
            mean_squared_error, aligned_vertices = self.geom_register.align_scans_to_bim(
                scanned_points=scanned_coords,
                design_bounds=design_bounds
            )
        except Exception as e:
            logger.exception("IGeometryRegister execution failed", bim_element_id=element_id, error=str(e))
            return False

        # 4. Analyze spatial error (BIM alignment thresholding)
        # Standard tolerance for concrete positioning in enterprise construction is ~25mm (0.025m)
        measured_variance_mm = mean_squared_error * 1000.0
        logger.info("Alignment registration complete", bim_element_id=element_id, mse_error=mean_squared_error, variance_mm=measured_variance_mm)

        if measured_variance_mm > 25.0:
            # We detected a structural positioning deviation! Log an anomaly.
            anomaly_id = f"anom-{uuid.uuid4().hex[:8]}"
            deviation_desc = f"Structure placed outside coordinate limits. Measured translation variance of {measured_variance_mm:.1f}mm exceeds tolerance threshold (25.0mm)."
            
            remedy = (
                f"Flag spatial conflict to project manager. Adjust subsequent rebar placement "
                f"or formwork grids by {measured_variance_mm:.1f}mm along the alignment displacement plane."
            )

            anomaly = SpatialAnomaly(
                id=anomaly_id,
                bim_element_id=element_id,
                title=f"Positioning Shift on {element.name}",
                severity="Critical" if measured_variance_mm > 50.0 else "Warning",
                deviation_description=deviation_desc,
                measured_variance_mm=measured_variance_mm,
                recommended_mitigation=remedy,
                flagged_at=datetime.utcnow()
            )

            # Persist anomaly state to database
            await self.db_repo.log_anomaly(anomaly)
            
            # Update element status in DB to "delayed" due to spatial conflict
            await self.db_repo.update_element_progress(element_id, progress=element.progress, status="delayed")
            logger.warn("Spatial deviation flagged. Anomaly logged in database", bim_element_id=element_id, anomaly_id=anomaly_id)
        else:
            # Physical scans align perfectly with design coordinate guidelines
            await self.db_repo.update_element_progress(element_id, progress=100.0, status="completed")
            logger.info("Physical scanning aligned with design model. Structure marked completed.", bim_element_id=element_id)

        return True
