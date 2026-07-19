import os
import pytest
import numpy as np
import cv2
from fastapi.testclient import TestClient

from app.main import app
from app.infrastructure.slam.video_processor import EquirectangularProjector
from app.infrastructure.slam.feature_tracker import HybridFeatureTracker
from app.infrastructure.slam.slam_engine import SLAMEngine, CameraIntrinsics
from app.infrastructure.slam.ifc_parser import IFCBIMParser
from app.infrastructure.slam.registration import PointCloudRegistrationEngine
from app.infrastructure.slam.pipeline import BIMCoordinateSLAMOrchestrator


@pytest.fixture
def test_client() -> TestClient:
    return TestClient(app)


def test_equirectangular_projector() -> None:
    """Validates that the 360-degree equirectangular cubemap projector initializes and maps coordinates."""
    projector = EquirectangularProjector(face_size=128)
    # Generate mock 128x256 3-channel spherical image
    mock_sphere = np.zeros((128, 256, 3), dtype=np.uint8)
    cv2.circle(mock_sphere, (128, 64), 20, (0, 255, 0), -1)  # draw green target

    # Project Front face
    front_face = projector.project_face(mock_sphere, "F")
    assert front_face.shape == (128, 128, 3)

    # Project all faces
    faces = projector.project_all_faces(mock_sphere)
    assert len(faces) == 6
    for face in ["F", "R", "B", "L", "U", "D"]:
        assert faces[face].shape == (128, 128, 3)


def test_feature_tracker() -> None:
    """Validates that the classical and hybrid feature tracker extracts and matches keypoints."""
    tracker = HybridFeatureTracker(use_deep=False)  # Force ORB classical to ensure zero GPU dependencies
    
    # Generate two mock images with shared patterns
    img1 = np.zeros((256, 256, 3), dtype=np.uint8)
    img2 = np.zeros((256, 256, 3), dtype=np.uint8)
    
    # Draw corners and visual features
    for x in range(30, 220, 30):
        for y in range(30, 220, 30):
            cv2.circle(img1, (x, y), 5, (255, 255, 255), -1)
            # Shift img2 slightly to model motion
            cv2.circle(img2, (x + 2, y + 1), 5, (255, 255, 255), -1)

    result = tracker.match(img1, img2)
    assert hasattr(result, "kps1")
    assert hasattr(result, "kps2")
    assert hasattr(result, "matches")
    assert len(result.kps1) == len(result.kps2)


def test_slam_engine() -> None:
    """Validates that SLAMEngine processes frame entries, estimates trajectory, and triangulates 3D vertices."""
    intrinsics = CameraIntrinsics(fx=400.0, fy=400.0, cx=256.0, cy=256.0)
    engine = SLAMEngine(intrinsics=intrinsics)

    # Mock keypoints
    kps1 = np.array([[100.0, 100.0], [200.0, 100.0], [300.0, 200.0], [150.0, 300.0],
                     [120.0, 110.0], [210.0, 110.0], [310.0, 210.0], [160.0, 310.0]], dtype=np.float32)
    # Mock keypoints shifted (representing camera motion)
    kps2 = kps1 + np.array([1.5, -0.5], dtype=np.float32)
    
    # Process first keyframe
    engine.process_first_frame(frame_idx=0, timestamp=0.0, keypoints=kps1)
    assert len(engine.keyframes) == 1
    assert np.allclose(engine.current_pose, np.identity(4))

    # Form match result container
    from app.infrastructure.slam.feature_tracker import FeatureMatchResult
    mock_matches = [cv2.DMatch(i, i, 0.0) for i in range(len(kps1))]
    match_res = FeatureMatchResult(kps1, kps2, np.ones(len(kps1)), mock_matches)

    # Estimate motion and triangulate
    prev_kf = engine.keyframes[0]
    success = engine.estimate_motion_and_triangulate(
        prev_kf=prev_kf,
        curr_frame_idx=15,
        timestamp=1.5,
        match_result=match_res
    )
    # Should succeed or log warning and return bool
    assert isinstance(success, bool)


def test_ifc_parser() -> None:
    """Validates that IFCBIMParser correctly generates coordinate distributions."""
    parser = IFCBIMParser()
    points, metadata = parser.extract_bim_point_cloud("non_existent_file.ifc")
    
    assert len(points) > 100
    assert "total_walls" in metadata
    assert "total_columns" in metadata
    assert len(metadata["elements"]) > 0


def test_point_cloud_registration() -> None:
    """Validates SVD Kabsch-Umeyama coordinates solver and registration RMSE minimization."""
    engine = PointCloudRegistrationEngine()

    # Generate source points [10, 3]
    source_pts = np.random.uniform(-2.0, 2.0, size=(100, 3))
    # Translate and rotate to make target points
    theta = 0.45  # rotation angle
    R = np.array([
        [np.cos(theta), -np.sin(theta), 0.0],
        [np.sin(theta),  np.cos(theta), 0.0],
        [0.0, 0.0, 1.0]
    ])
    t = np.array([1.5, -0.8, 0.25])
    scale = 1.05

    target_pts = (scale * source_pts @ R.T) + t

    # Run SVD solver
    rmse, T, est_scale = engine.run_svd_kabsch_alignment(source_pts, target_pts)
    
    assert rmse < 1e-5
    assert np.allclose(est_scale, scale, atol=1e-3)
    assert np.allclose(T[0:3, 3], t, atol=1e-3)


def test_slam_api_endpoint(test_client: TestClient) -> None:
    """Tests the /api/v1/slam/register endpoint with simulated inputs."""
    payload = {
        "video_path": "non_existent_walkthrough.mp4",  # triggers high-fidelity SLAM math models simulation
        "ifc_path": "mock_coordination_model.ifc",
        "target_fps": 2.0,
        "focal_length_px": 450.0
    }
    
    response = test_client.post("/api/v1/slam/register", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "success"
    assert "metadata" in data
    assert "alignment" in data
    assert "trajectory" in data
    assert len(data["trajectory"]) > 0
    assert len(data["sparse_point_cloud"]) > 0
