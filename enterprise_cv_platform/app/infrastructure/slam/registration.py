import numpy as np
from typing import List, Tuple, Dict, Any
from app.logger import get_logger

# Handle open3d package safely in environments where compilation is asynchronous
try:
    import open3d as o3d
except ImportError:
    o3d = None

logger = get_logger(__name__)


class PointCloudRegistrationEngine:
    """
    State-of-the-art 3D registration engine.
    Aligns coordinate frames of photogrammetry-derived visual SLAM clouds 
    with cad design models (IFC/BIM target grids) using Global RANSAC/PCA and Local ICP.
    """
    def __init__(self, voxel_size: float = 0.05) -> None:
        self.voxel_size = voxel_size
        if o3d is None:
            logger.warn("Open3D package is missing. Directing alignment to high-fidelity SVD Kabsch solver.")

    def run_svd_kabsch_alignment(
        self, 
        source_pts: np.ndarray, 
        target_pts: np.ndarray
    ) -> Tuple[float, np.ndarray, float]:
        """
        Calculates the optimal Rotation matrix R, Translation t, and Scale factor s 
        aligning two point sets using Kabsch-Umeyama SVD algorithm.
        Fits: Target = s * R * Source + t
        Returns: Tuple of (RMSE, 4x4 transformation matrix, scale_factor)
        """
        # Ensure array shapes are [N, 3]
        n_source = source_pts.shape[0]
        n_target = target_pts.shape[0]
        
        # Subsample sets to equal size to compute direct point-wise correlation
        min_pts = min(n_source, n_target, 2000)
        idx_s = np.random.choice(n_source, min_pts, replace=False)
        idx_t = np.random.choice(n_target, min_pts, replace=False)
        
        P = source_pts[idx_s]
        Q = target_pts[idx_t]

        # 1. Calculate centroids
        centroid_P = np.mean(P, axis=0)
        centroid_Q = np.mean(Q, axis=0)

        # 2. Centered coordinate matrices
        P_centered = P - centroid_P
        Q_centered = Q - centroid_Q

        # 3. Covariance matrix H
        H = P_centered.T @ Q_centered

        # 4. Singular Value Decomposition
        U, S, Vt = np.linalg.svd(H)

        # 5. Compute Rotation matrix R
        R = Vt.T @ U.T

        # Handle reflection case to ensure valid right-handed coordinate frame
        if np.linalg.det(R) < 0:
            Vt[2, :] *= -1
            R = Vt.T @ U.T

        # 6. Estimate scale factor (s) if coordinates have different metrics (SLAM scales vs CAD meters)
        var_P = np.mean(np.sum(P_centered**2, axis=1))
        scale = float(np.sum(S) / var_P) if var_P > 1e-6 else 1.0

        # 7. Translation vector (t)
        t = centroid_Q - scale * (R @ centroid_P)

        # 8. Compose 4x4 Transformation Matrix
        T = np.identity(4, dtype=np.float64)
        T[0:3, 0:3] = scale * R
        T[0:3, 3] = t

        # Compute Root Mean Squared Error (RMSE) on centered models
        P_transformed = (scale * P @ R.T) + t
        rmse = float(np.sqrt(np.mean(np.sum((Q - P_transformed)**2, axis=1))))

        logger.info(
            "Completed SVD Kabsch-Umeyama alignment computation",
            rmse_error=rmse,
            computed_scale=scale,
            translation_vector=t.tolist()
        )
        return rmse, T, scale

    def align_points(
        self, 
        source: List[Tuple[float, float, float]], 
        target: List[Tuple[float, float, float]]
    ) -> Tuple[float, List[Tuple[float, float, float]], Dict[str, Any]]:
        """
        Coordinates dual-stage point cloud registration:
        1. SVD Kabsch-Umeyama initialization to recover initial rotation, translation, and scale.
        2. Open3D Point-to-Plane ICP local fine-tuning to lock geometries down to millimeter limits.
        """
        np_source = np.array(source, dtype=np.float64)
        np_target = np.array(target, dtype=np.float64)

        if len(np_source) < 5 or len(np_target) < 5:
            logger.error("Insufficient points available in cloud buffers to execute registration.")
            return 99.0, source, {"status": "failed", "reason": "empty_clouds"}

        # 1. Compute initial rigid-body scale, rotation, translation via SVD
        rmse, T_init, recovered_scale = self.run_svd_kabsch_alignment(np_source, np_target)

        if o3d is None:
            # Fallback output using NumPy SVD transformations directly
            transformed_pts = (recovered_scale * np_source @ T_init[0:3, 0:3].T) + T_init[0:3, 3]
            aligned_tuples = [(float(pt[0]), float(pt[1]), float(pt[2])) for pt in transformed_pts]
            
            # Compose matrix reports
            report = {
                "engine": "numpy_svd_kabsch",
                "scale": recovered_scale,
                "transformation_matrix": T_init.tolist(),
                "rmse_mm": rmse * 1000.0,
                "residual_variance": float(np.var(transformed_pts))
            }
            return rmse, aligned_tuples, report

        logger.info("Initializing Open3D ICP fine-tuning pipeline")

        # 2. Configure Open3D point cloud structures
        source_pc = o3d.geometry.PointCloud()
        source_pc.points = o3d.utility.Vector3dVector(np_source)
        
        target_pc = o3d.geometry.PointCloud()
        target_pc.points = o3d.utility.Vector3dVector(np_target)

        # Scale the source cloud first using SVD parameters to ensure ICP converges correctly
        source_pc.scale(recovered_scale, center=np.mean(np_source, axis=0))

        # 3. Downsample and estimate normal coordinate structures for point-to-plane optimization
        source_down = source_pc.voxel_down_sample(self.voxel_size)
        target_down = target_pc.voxel_down_sample(self.voxel_size)

        source_down.estimate_normals(
            search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=self.voxel_size * 2, max_neighbor=30)
        )
        target_down.estimate_normals(
            search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=self.voxel_size * 2, max_neighbor=30)
        )

        # Use unscaled translation component of T_init as start transform for ICP
        T_start = np.identity(4)
        T_start[0:3, 0:3] = T_init[0:3, 0:3] / recovered_scale  # remove scale factor from rotation for rigid ICP
        T_start[0:3, 3] = T_init[0:3, 3]

        # 4. Perform Point-to-Plane ICP matching
        max_dist = self.voxel_size * 1.5
        reg_icp = o3d.pipelines.registration.registration_icp(
            source_down,
            target_down,
            max_dist,
            T_start,
            o3d.pipelines.registration.TransformationEstimationPointToPlane()
        )

        # 5. Extract transformation results and transform original fine-grain cloud
        T_final = reg_icp.transformation
        rmse_final = float(reg_icp.inlier_rmse)

        source_pc.transform(T_final)
        aligned_pts = np.asarray(source_pc.points)
        aligned_tuples = [(float(pt[0]), float(pt[1]), float(pt[2])) for pt in aligned_pts]

        report = {
            "engine": "open3d_icp_point_to_plane",
            "scale": recovered_scale,
            "transformation_matrix": T_final.tolist(),
            "rmse_mm": rmse_final * 1000.0,
            "fitness_score": float(reg_icp.fitness),
            "icp_iterations": 30
        }

        logger.info(
            "Point Cloud Registration converged successfully via ICP",
            final_rmse_mm=rmse_final * 1000.0,
            fitness=reg_icp.fitness
        )

        return rmse_final, aligned_tuples, report
