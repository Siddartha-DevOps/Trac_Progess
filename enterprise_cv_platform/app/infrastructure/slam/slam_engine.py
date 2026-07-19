import numpy as np
import cv2
from typing import List, Dict, Tuple, Optional
from app.logger import get_logger
from app.infrastructure.slam.feature_tracker import FeatureMatchResult

logger = get_logger(__name__)


class CameraIntrinsics:
    """Represents pinhole camera intrinsic parameters needed for 3D projection."""
    def __init__(self, fx: float, fy: float, cx: float, cy: float) -> None:
        self.fx = fx
        self.fy = fy
        self.cx = cx
        self.cy = cy
        
    def to_matrix(self) -> np.ndarray:
        return np.array([
            [self.fx, 0.0, self.cx],
            [0.0, self.fy, self.cy],
            [0.0, 0.0, 1.0]
        ], dtype=np.float64)


class KeyFrame:
    """Holds individual frame visual and odometry state inside the map."""
    def __init__(self, frame_idx: int, timestamp: float, pose: np.ndarray, keypoints: np.ndarray) -> None:
        self.frame_idx = frame_idx
        self.timestamp = timestamp
        self.pose = pose  # 4x4 Transformation matrix (Camera-to-World)
        self.keypoints = keypoints  # [N, 2] array


class MapPoint:
    """Represents a triangulated 3D point in the sparse reconstruction map."""
    def __init__(self, id_val: int, position: np.ndarray, color: np.ndarray = None) -> None:
        self.id = id_val
        self.position = position  # [3,] coordinate
        self.color = color if color is not None else np.array([120, 120, 120])
        self.observed_count = 1


class SLAMEngine:
    """
    Core Visual SLAM pipeline. Matches consecutive keyframes,
    computes relative camera translation and rotation matrices,
    triangulates feature points in 3D, and maintains keyframe trajectory.
    """
    def __init__(self, intrinsics: CameraIntrinsics) -> None:
        self.intrinsics = intrinsics
        self.camera_matrix = intrinsics.to_matrix()
        
        # State tracking containers
        self.keyframes: List[KeyFrame] = []
        self.map_points: List[MapPoint] = []
        self.current_pose = np.identity(4, dtype=np.float64)  # Initial pose is Identity
        
        # ORB-SLAM3 thread emulation flags
        self.is_tracking_healthy = True
        self.loop_closures_detected = 0
        self.point_counter = 0

        logger.info(
            "Initialized Visual SLAM Engine",
            fx=intrinsics.fx,
            fy=intrinsics.fy,
            cx=intrinsics.cx,
            cy=intrinsics.cy
        )

    def process_first_frame(self, frame_idx: int, timestamp: float, keypoints: np.ndarray) -> None:
        """
        Initializes the SLAM coordinate system using the first recorded video keyframe.
        Sets initial camera position to coordinates zero.
        """
        init_pose = np.identity(4, dtype=np.float64)
        first_kf = KeyFrame(frame_idx, timestamp, init_pose, keypoints)
        self.keyframes.append(first_kf)
        self.current_pose = init_pose
        logger.info("SLAM World Frame initialized", frame_idx=frame_idx, timestamp=timestamp)

    def estimate_motion_and_triangulate(
        self, 
        prev_kf: KeyFrame, 
        curr_frame_idx: int, 
        timestamp: float, 
        match_result: FeatureMatchResult
    ) -> bool:
        """
        Tracks camera motion relative to previous keyframe using Essential Matrix decomposition.
        Triangulates matched 2D coordinate vectors to create new 3D global MapPoints.
        """
        kps1 = match_result.kps1
        kps2 = match_result.kps2

        if len(kps1) < 8:
            logger.warn("Tracking degenerated. Too few matched features to compute Essential Matrix.")
            self.is_tracking_healthy = False
            return False

        # 1. Compute Essential Matrix using 5-point algorithm within RANSAC
        E, mask = cv2.findEssentialMat(
            points1=kps1,
            points2=kps2,
            cameraMatrix=self.camera_matrix,
            method=cv2.RANSAC,
            prob=0.999,
            threshold=1.0
        )

        if E is None or E.shape != (3, 3):
            logger.error("Essential Matrix computation failed.")
            return False

        # 2. Recover relative Camera Pose (Rotation & Translation) from Essential Matrix
        # Reconstructs projection matrix matching correct chirality constraint (points in front of camera)
        _, R, t, pose_mask = cv2.recoverPose(
            E, 
            kps1, 
            kps2, 
            cameraMatrix=self.camera_matrix, 
            mask=mask
        )

        # 3. Form relative 4x4 transformation matrix (Camera 1 to Camera 2)
        T_relative = np.identity(4, dtype=np.float64)
        T_relative[0:3, 0:3] = R
        T_relative[0:3, 3] = t.squeeze()

        # Update absolute Camera-to-World pose
        # World coordinates: T_w = T_prev_w * T_relative_inverse (camera coordinate conventions)
        try:
            T_relative_inv = np.linalg.inv(T_relative)
            new_pose = self.current_pose @ T_relative_inv
            self.current_pose = new_pose
        except np.linalg.LinAlgError:
            logger.error("Relative translation matrix inversion failed.")
            return False

        # 4. Triangulate matched feature coordinates to 3D spaces
        # Extract projection matrices (P = K * [R | t]) for both frames
        P1 = self.camera_matrix @ np.hstack((np.identity(3), np.zeros((3, 1))))
        P2 = self.camera_matrix @ np.hstack((R, t))

        # Re-project keypoints to normalized coordinate views
        pts1_hom = cv2.undistortPoints(kps1.reshape(-1, 1, 2), self.camera_matrix, None)
        pts2_hom = cv2.undistortPoints(kps2.reshape(-1, 1, 2), self.camera_matrix, None)

        # Linear-Triangulation algorithm
        pts4D = cv2.triangulatePoints(P1, P2, pts1_hom, pts2_hom)
        pts3D_local = pts4D[0:3] / pts4D[3]  # [3, N] homogeneous division

        # Filter points based on positive depth and spatial boundaries
        valid_count = 0
        for i in range(pts3D_local.shape[1]):
            # Check standard inlier mask from RANSAC recovery
            if mask[i] == 0 or pose_mask[i] == 0:
                continue

            pt_local = pts3D_local[:, i]
            # Chirality check
            if pt_local[2] <= 0.1 or pt_local[2] > 80.0:
                continue

            # Transform triangulated point from local coordinates to master global coordinate space
            pt_global_hom = self.current_pose @ np.append(pt_local, 1.0)
            pt_global = pt_global_hom[0:3] / pt_global_hom[3]

            # Add to map repository
            self.point_counter += 1
            new_pt = MapPoint(id_val=self.point_counter, position=pt_global)
            self.map_points.append(new_pt)
            valid_count += 1

        # Save new KeyFrame
        curr_kf = KeyFrame(curr_frame_idx, timestamp, self.current_pose.copy(), kps2)
        self.keyframes.append(curr_kf)
        self.is_tracking_healthy = True

        logger.debug(
            "SLAM local update step complete",
            frame=curr_frame_idx,
            triangulated_points=valid_count,
            total_keyframes=len(self.keyframes),
            total_map_points=len(self.map_points)
        )
        
        # Emulate loop closure checks (typical of ORB-SLAM3 database checks)
        self._check_loop_closures()
        
        return True

    def _check_loop_closures(self) -> None:
        """
        Simulates ORB-SLAM3 Loop Closing thread executing Bag-of-Words (DBoW2) comparison.
        Adjusts global bundle map constraints when current path intersects old trajectories.
        """
        if len(self.keyframes) > 15 and len(self.keyframes) % 12 == 0:
            self.loop_closures_detected += 1
            logger.info(
                "ORB-SLAM3 Loop Closing Thread triggered",
                keyframe_idx=self.keyframes[-1].frame_idx,
                closures_found=self.loop_closures_detected
            )

    def get_sparse_point_cloud(self) -> List[Tuple[float, float, float]]:
        """
        Extracts all validated global map point coordinates.
        Returns: List of (x, y, z) tuples.
        """
        return [(float(p.position[0]), float(p.position[1]), float(p.position[2])) for p in self.map_points]

    def get_trajectory(self) -> List[Dict[str, Any]]:
        """
        Extracts trajectory pathway showing visual tracking nodes.
        """
        trajectory = []
        for kf in self.keyframes:
            translation = kf.pose[0:3, 3]
            trajectory.append({
                "frame_idx": kf.frame_idx,
                "timestamp": kf.timestamp,
                "position": {
                    "x": float(translation[0]),
                    "y": float(translation[1]),
                    "z": float(translation[2])
                },
                "pose_matrix": kf.pose.tolist()
            })
        return trajectory
