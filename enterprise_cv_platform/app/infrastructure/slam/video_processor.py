import os
import cv2
import numpy as np
from typing import Generator, List, Dict, Tuple
from app.logger import get_logger

logger = get_logger(__name__)


class EquirectangularProjector:
    """
    Highly optimized, vectorized geometric projection engine.
    Converts 360-degree equirectangular (spherical) frames into 6 standard pinhole 
    cubemap faces (Front, Right, Back, Left, Top, Bottom) to eliminate spherical 
    distortion and allow standard visual SLAM camera model tracking (e.g. pinhole/radial).
    """
    def __init__(self, face_size: int = 512) -> None:
        self.face_size = face_size
        # Precompute coordinate maps for all 6 cube faces to optimize runtime projection
        self.maps = self._precompute_cubemap_maps()

    def _precompute_cubemap_maps(self) -> Dict[str, Tuple[np.ndarray, np.ndarray]]:
        """
        Precomputes the lookup mapping arrays for cv2.remap.
        Maps 3D cube coordinates onto 2D spherical coordinates (theta, phi).
        """
        maps = {}
        faces = ["F", "R", "B", "L", "U", "D"]
        
        # Grid coordinates for a single cube face
        u, v = np.meshgrid(np.arange(self.face_size), np.arange(self.face_size))
        # Convert pixel to normalized device coordinates [-1, 1]
        u_norm = (2.0 * u / (self.face_size - 1)) - 1.0
        v_norm = (2.0 * v / (self.face_size - 1)) - 1.0

        for face in faces:
            # Calculate 3D direction vector (x, y, z) pointing from center of cube to each pixel
            if face == "F":    # Front (+z)
                x = u_norm
                y = v_norm
                z = np.ones_like(u_norm)
            elif face == "R":  # Right (+x)
                x = np.ones_like(u_norm)
                y = v_norm
                z = -u_norm
            elif face == "B":  # Back (-z)
                x = -u_norm
                y = v_norm
                z = -np.ones_like(u_norm)
            elif face == "L":  # Left (-x)
                x = -np.ones_like(u_norm)
                y = v_norm
                z = u_norm
            elif face == "U":  # Up (+y)
                x = u_norm
                y = -np.ones_like(u_norm)
                z = -v_norm
            else:             # Down (-y)
                x = u_norm
                y = np.ones_like(u_norm)
                z = v_norm

            # Convert 3D Cartesian coordinates (x, y, z) to Spherical coordinates (theta, phi)
            r = np.sqrt(x**2 + y**2 + z**2)
            # theta (longitude) in range [-pi, pi]
            theta = np.arctan2(x, z)
            # phi (latitude) in range [-pi/2, pi/2]
            phi = np.arcsin(y / r)

            # Map spherical angles back to equirectangular 2D texture coordinates normalized [0, 1]
            # Longitude theta [-pi, pi] -> X [0, 1]
            x_map = (theta + np.pi) / (2.0 * np.pi)
            # Latitude phi [-pi/2, pi/2] -> Y [0, 1]
            y_map = (phi + np.pi / 2.0) / np.pi

            # Scale to actual source width and height placeholder targets (will scale dynamically)
            maps[face] = (x_map.astype(np.float32), y_map.astype(np.float32))

        return maps

    def project_face(self, equirect_img: np.ndarray, face: str) -> np.ndarray:
        """
        Projects a single cubemap face from the equirectangular image using bilateral remap.
        """
        h, w = equirect_img.shape[:2]
        x_map, y_map = self.maps[face]
        
        # Scale maps to actual input dimensions
        scaled_x = x_map * w
        scaled_y = y_map * h
        
        return cv2.remap(
            equirect_img, 
            scaled_x, 
            scaled_y, 
            interpolation=cv2.INTER_LINEAR, 
            borderMode=cv2.BORDER_WRAP
        )

    def project_all_faces(self, equirect_img: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Decomposes 360 spherical frame into standard 6 cardinal cubemap faces.
        """
        return {face: self.project_face(equirect_img, face) for face in ["F", "R", "B", "L", "U", "D"]}


class Video360Reader:
    """
    Modular Video Reader designed for high-resolution 360° streams.
    Decodes video file frames and yields processed equirectangular frames 
    subsampled at target FPS.
    """
    def __init__(self, video_path: str, target_fps: float = 2.0) -> None:
        self.video_path = video_path
        self.target_fps = target_fps
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Source 360-degree video file not found: {video_path}")
            
        self.cap = cv2.VideoCapture(video_path)
        if not self.cap.isOpened():
            raise IOError(f"Could not open 360 video stream: {video_path}")
            
        self.source_fps = float(self.cap.get(cv2.CAP_PROP_FPS))
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Calculate frame skip index to match requested FPS rate
        self.frame_skip = max(1, int(round(self.source_fps / self.target_fps)))
        logger.info(
            "Initialized 360 Video Reader",
            path=video_path,
            source_fps=self.source_fps,
            target_fps=target_fps,
            frame_skip=self.frame_skip,
            resolution=f"{self.width}x{self.height}"
        )

    def read_frames(self) -> Generator[Tuple[int, float, np.ndarray], None, None]:
        """
        Generator yielding frames with precise timing metadata.
        Returns: Tuple[frame_idx, timestamp_seconds, frame_numpy_array]
        """
        frame_idx = 0
        try:
            while True:
                ret, frame = self.cap.read()
                if not ret:
                    break

                if frame_idx % self.frame_skip == 0:
                    timestamp = frame_idx / self.source_fps
                    yield frame_idx, timestamp, frame

                frame_idx += 1
        finally:
            self.cap.release()
            logger.info("Closed video reader stream", processed_total_frames=frame_idx)
