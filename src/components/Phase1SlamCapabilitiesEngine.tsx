import React, { useState } from "react";
import { 
  Compass, 
  Activity, 
  Layers, 
  Cpu, 
  GitBranch, 
  Database, 
  Camera, 
  Sliders, 
  FileText, 
  Terminal, 
  HardDrive, 
  ShieldCheck, 
  Clock, 
  Workflow, 
  RefreshCw, 
  ListTodo, 
  AlertOctagon, 
  Code,
  LineChart,
  Users,
  CheckCircle2,
  Lock,
  Boxes,
  Maximize2
} from "lucide-react";

// Types for the system
interface Capability {
  id: string;
  name: string;
  tagline: string;
  icon: React.ComponentType<any>;
  category: "Visual Tracking" | "SLAM Pipelines" | "Spatial Alignment" | "Ingestion Calibration";
}

const CAPABILITIES: Capability[] = [
  { id: "vi-slam", name: "Visual-Inertial SLAM", tagline: "Real-time 6-DoF state estimation fusing video and IMU sensors", icon: Activity, category: "Visual Tracking" },
  { id: "trajectory-engine", name: "Camera Trajectory Engine", tagline: "Temporal tracking, spline smoothing and Pose Graph optimization", icon: Compass, category: "Visual Tracking" },
  { id: "orb-slam3", name: "ORB-SLAM3 Integration", tagline: "Robust multi-map visual odometry with loop closure", icon: Layers, category: "SLAM Pipelines" },
  { id: "kimera", name: "Kimera Integration", tagline: "Real-time metric-semantic 3D mesh and SLAM mapping", icon: Cpu, category: "SLAM Pipelines" },
  { id: "icp-registration", name: "ICP Registration Engine", tagline: "Iterative Closest Point spatial alignment to BIM global coordinates", icon: GitBranch, category: "Spatial Alignment" },
  { id: "point-cloud", name: "Point Cloud Generation", tagline: "Dense 3D point cloud reconstructions from calibrated video sequences", icon: Database, category: "Spatial Alignment" },
  { id: "photogrammetry", name: "Photogrammetry Suite", tagline: "Structure-from-Motion (SfM) spatial reconstructions for site-sweeps", icon: Camera, category: "Ingestion Calibration" },
  { id: "calibration", name: "Camera Calibration Engine", tagline: "Sub-pixel intrinsic/extrinsic parameter solver and radial correction", icon: Sliders, category: "Ingestion Calibration" }
];

export default function Phase1SlamCapabilitiesEngine() {
  const [selectedCapId, setSelectedCapId] = useState<string>("vi-slam");
  const [activeCategory, setActiveCategory] = useState<"reqs" | "impl" | "ops" | "plan">("reqs");
  const [isConsoleExpanded, setIsConsoleExpanded] = useState<boolean>(false);

  // Find active capability
  const activeCap = CAPABILITIES.find(c => c.id === selectedCapId) || CAPABILITIES[0];

  // Static content details mapped dynamically to avoid token limits and maximize density
  const getCapabilityContent = (id: string, cat: "reqs" | "impl" | "ops" | "plan") => {
    switch (id) {
      case "vi-slam":
        if (cat === "reqs") {
          return {
            functional: [
              "Extract visual feature points (ORB, FAST, or SuperPoint) in real-time at 30Hz.",
              "Fractions-of-a-millisecond IMU measurement pre-integration on Lie groups (SO(3) / SE(3)).",
              "Estimate 6-DoF camera states (translation [x, y, z] and quaternion rotation [q_w, q_x, q_y, q_z]) concurrently.",
              "Construct local landmarks mapping to identify geometric keyframe nodes.",
              "Compute state uncertainty covariance matrices to feedback to the alignment engine."
            ],
            nonFunctional: [
              "Inference throughput: Minimum 30 frames per second on AWS A10G/A100 instances.",
              "Tracking Latency: Pose update loop completed in under 12ms per frame.",
              "Mean-Time-Between-Failure (MTBF) tracking lost: Less than 1 event per 45-minute continuous site-walk.",
              "Memory footprint: Maximum 2.4 GB VRAM utilization for real-time tracking thread.",
              "Scale-drift constraint: Cumulative scale-drift less than 0.15% over a 500-meter physical walking loop."
            ],
            architecture: `
+---------------------------------------------------------------------------------------------------------+
|                                    VISUAL-INERTIAL SLAM SYSTEM CAPABILITY                               |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [ Camera Video (30 FPS) ] ---> [ ORB Feature Extractor ] ---+                                          |
|                                                              |                                          |
|                                                              v                                          |
|  [ IMU Raw (100-200 Hz) ] ---> [ IMU Preintegration Engine ] ---> [ Sliding Window Local Bundle Adj. ]  |
|                                (SO(3)/SE(3) Manifolds)                 |                                |
|                                                                        v                                |
|                                                             [ IMU-Visual Odometry State ]               |
|                                                                        |                                |
|                                                                        v                                |
|                                                             [ 6-DoF Camera Pose [R|T] ]                 |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
`
          };
        } else if (cat === "impl") {
          return {
            backend: "Implemented as a C++ multi-threaded daemon compiled with CUDA support. Fuses the Ceres Solver for non-linear least squares optimization and Eigen3 for state propagation vector math. Communicates tracking telemetry directly to the Python FastAPI supervisor via local gRPC pipes over Shared Memory (IPC). Uses a dual-state sliding-window filter.",
            frontend: "Displays an interactive, hardware-accelerated 3D viewport of the walking path in real-time. Visualizes active feature point anchors (green/red indicators indicating tracked or discarded points). Renders a floating telemetry dashboard displaying real-time tracking confidence, velocity vectors, and IMU accelerometer noise graphs.",
            schema: `// PostgreSQL schema representation of VI-SLAM states and tracking events
CREATE TABLE vislam_tracking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(50) NOT NULL,
  walkthrough_id VARCHAR(50) NOT NULL,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  imu_sensor_bias JSONB NOT NULL, -- Accelerometer and Gyroscope noise parameters
  tracking_status VARCHAR(20) DEFAULT 'ACTIVE' -- ACTIVE, RECOVERING, LOST, FINISHED
);

CREATE TABLE vislam_pose_keyframes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES vislam_tracking_sessions(id),
  frame_index INTEGER NOT NULL,
  timestamp_ms BIGINT NOT NULL,
  position_xyz DOUBLE PRECISION[3] NOT NULL,
  orientation_quaternion DOUBLE PRECISION[4] NOT NULL,
  tracked_features_count INTEGER NOT NULL,
  covariance_matrix DOUBLE PRECISION[36] NOT NULL -- Pose estimation uncertainty
);`,
            api: `## gRPC API - Tracking telemetry Service
service ViSlamTracker {
  rpc StartSession (StartSessionRequest) returns (StartSessionResponse);
  rpc IngestSensorFrame (stream IngestFrameRequest) returns (stream IngestFrameResponse);
}

message StartSessionRequest {
  string project_id = 1;
  string walkthrough_id = 2;
  double imu_accel_noise_density = 3;
  double imu_gyro_noise_density = 4;
}

message IngestFrameRequest {
  int64 timestamp_us = 1;
  bytes jpeg_data = 2;
  repeated float imu_accel_raw = 3; // x, y, z
  repeated float imu_gyro_raw = 4;  // x, y, z
}

message IngestFrameResponse {
  int64 timestamp_us = 1;
  repeated float position_xyz = 2;
  repeated float quaternion_xyzw = 3;
  float confidence_score = 4;
  bool is_keyframe = 5;
}`,
            flow: "Raw video and high-rate IMU data are streamed from the companion app or disk. Features are extracted; the IMU preintegration propagates state estimate from frame-to-frame. On keyframe selection, a local Bundle Adjustment is queued to refine the poses. Pose estimation is forwarded to the Trajectory Engine.",
            sequence: `[Camera/IMU Sensor] ---Raw Frames + IMU Data---> [SLAM Pre-Processor]
       |
       v
[SLAM Pre-Processor] ---Preintegrated States---> [Feature Optimizer]
       |
       v
[Feature Optimizer]  ---Bundled Pose Graphs-----> [PostgreSQL DB]
       |
       v
[PostgreSQL DB]      ---Realtime Websocket------> [Frontend Live HUD]`
          };
        } else if (cat === "ops") {
          return {
            infrastructure: "Deploys on AWS ECS GPU task nodes using g5.2xlarge instances with NVIDIA A10G GPUs (24GB VRAM). Utilizes a CUDA 12.2 base container image with pre-installed ROS2 Galactic and OpenCV compiled with CUDA support.",
            security: "All telemetry data is fully encrypted in transit using gRPC over TLS 1.3. Telemetry parameters and video assets are securely signed using HMAC-SHA256 with project keys stored in AWS Secrets Manager.",
            performance: "Uses TensorRT acceleration for visual feature extraction. Pinned CUDA memory structures are used to reduce CPU-to-GPU copy latencies by 55%, enabling 35 FPS processing speeds on high-resolution streams.",
            testing: "Unit tested with GTest for preintegration mathematical verification. Integration testing uses the EuRoC MAV datasets. Regression benchmarks run daily on AWS GPU spot clusters to track drift coefficients.",
            deployment: "Automated GitOps pipeline with ArgoCD. Deploys to Kubernetes clusters using custom Helm charts that allocate GPU resources via the NVIDIA Device Plugin."
          };
        } else {
          return {
            cost: "Baseline infrastructure compute costs are estimated at $0.09 per minute of video analyzed. Running standard parallel instances (20 continuous walkthroughs per day) costs approximately $750/month.",
            team: "Requires 1x Senior Computer Vision / SLAM Engineer, 1x Embedded C++ Graphics Engineer, and 0.5x Platform DevOps Engineer.",
            timeline: "6 weeks of core development: Week 1-2 (IMU math & sensor drivers), Week 3-4 (visual tracking loops), Week 5-6 (gRPC interface & API testing).",
            risks: "Severe motion blur or complete blackout may cause tracking loss. Mitigated by automated visual-inertial state re-initialization and fallback loop algorithms.",
            mvp: "A robust monocular Visual-Inertial SLAM engine with Pose Graph refinement operating reliably on pre-recorded site sweeps (using offline CSV telemetry maps).",
            production: "Highly scalable, distributed real-time SLAM service running on elastic GPU clusters with sub-centimeter drift loop closures, supporting instant live viewport rendering."
          };
        }
      case "trajectory-engine":
        if (cat === "reqs") {
          return {
            functional: [
              "Fuses discrete keyframe pose estimates into a unified camera walkthrough trajectory.",
              "Interpolates intermediate frames using C2-continuous cubic B-spline curves to assure smooth, jitter-free view transitions.",
              "Executes non-linear Pose Graph Optimization (PGO) over loop closure constraints.",
              "Aligns the temporal camera tracking frames with physical telemetry time stamps.",
              "Generates statistical analyses on physical operator movement speeds and walking velocities."
            ],
            nonFunctional: [
              "Spline optimization: Trajectory smoothing executed in under 200ms for a 10,000-node graph.",
              "Memory overhead: Node graphs consume less than 85MB RAM per hour of continuous tracking.",
              "Loop closure precision: Absolute trajectory correction resolved in under 1.5 seconds.",
              "Interpolation stability: Spline curves possess continuous second-order derivatives to ensure smooth physical camera fly-throughs.",
              "Throughput: Capable of optimizing up to 50 concurrent walking trajectories simultaneously on standard server workloads."
            ],
            architecture: `
+---------------------------------------------------------------------------------------------------------+
|                                      CAMERA TRAJECTORY ENGINE INTERNALS                                 |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [ SLAM Keyframe Pose Inputs ] ---> [ Pose Graph Builder (Nodes & Edges) ]                              |
|                                                     |                                                   |
|                                                     v                                                   |
|  [ Loop Closure Constraints ] --------> [ g2o Pose Graph Optimizer ]                                     |
|                                                     |                                                   |
|                                                     v                                                   |
|                                        [ Spline Smoothing Solver ]                                      |
|                                                     |                                                   |
|                                                     v                                                   |
|                                      [ Continuous Camera Path [SE(3)] ]                                 |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
`
          };
        } else if (cat === "impl") {
          return {
            backend: "Designed as an optimization microservice utilizing the g2o (General Graph Optimization) library and Ceres Solver. Smooths trajectory lines using continuous-time B-splines. It detects geometric overlap nodes and invokes pose-graph optimizations to correct for accumulated drift over long sweeps.",
            frontend: "Implements three-dimensional camera path visualization using Three.js inside the React application. Renders the walking path as a sleek, glowing blue spline with hoverable keyframe nodes. Renders velocity heatmaps to point out where the operator walked too fast (causing motion blur).",
            schema: `// Database Schema for Trajectory Nodes and Smooth Splines
CREATE TABLE camera_trajectories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  walkthrough_id VARCHAR(50) NOT NULL UNIQUE,
  total_distance_meters DOUBLE PRECISION NOT NULL,
  optimized_at TIMESTAMPTZ DEFAULT NOW(),
  spline_coefficients JSONB NOT NULL -- Knot vectors and control points for path reconstruction
);

CREATE TABLE trajectory_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trajectory_id UUID REFERENCES camera_trajectories(id) ON DELETE CASCADE,
  sequence_id INTEGER NOT NULL,
  raw_position DOUBLE PRECISION[3] NOT NULL,
  optimized_position DOUBLE PRECISION[3] NOT NULL,
  timestamp_ms BIGINT NOT NULL
);`,
            api: `## REST API - Trajectory Optimization Specifications
POST /api/v1/trajectories/optimize
Content-Type: application/json

{
  "trajectory_id": "traj-88219-abc",
  "project_id": "proj-mumbai-01",
  "nodes": [
    { "sequence_id": 0, "timestamp_ms": 10240, "position": [10.2, 5.4, 1.2], "quaternion": [0.0, 0.0, 0.0, 1.0] },
    { "sequence_id": 1, "timestamp_ms": 11240, "position": [10.5, 5.8, 1.2], "quaternion": [0.0, 0.0, 0.1, 0.99] }
  ],
  "loop_constraints": [
    { "from_node": 150, "to_node": 10, "transformation": [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.3, 0.0, 0.0] }
  ]
}

Response (200 OK):
{
  "optimized_trajectory_id": "traj-88219-abc",
  "total_distance_meters": 542.15,
  "residual_error": 0.00245,
  "spline_knot_count": 142
}`,
            flow: "Telemetry logs are posted to the optimization engine. A factor graph is built where nodes represent camera poses, and edges represent relative motion constraints. Loop closures are added as loop edges. The optimizer runs Cholesky decomposition to solve the linear system and returns the optimized control vertices.",
            sequence: `[SLAM Engine]   ---Keyframe Node Coordinates---> [Trajectory Engine]
                                                       |
[Loop Detector] ---Loop Closure Edges------------> [Trajectory Engine]
                                                       |
                                                       v
                                            [g2o Solver: Cholesky]
                                                       |
                                                       v
[Frontend HUD]  <--Glowing Splines & Nodes--------- [Database State]`
          };
        } else if (cat === "ops") {
          return {
            infrastructure: "Runs on AWS ECS Fargate CPU tasks. Because g2o matrix solvers are highly compiled single-core tasks, they run optimized on Intel Xeon Scalable vCPUs (c6i.xlarge instances) with 4 vCPUs and 8GB RAM.",
            security: "Strict API token authorizations using standard OAuth2 Bearer JSON Web Tokens (JWT). Sanitizes all coordinates arrays before passing to underlying C++ binary processes to prevent buffer overflow attacks.",
            performance: "Pre-allocates sparse matrix configurations to avoid dynamic resizing. Compiles Ceres and g2o using Intel AVX-512 vectorization flags, boosting mathematical solver execution by 3.8x.",
            testing: "Mathematical solver validated using synthetic circle and loop trajectories with artificial noise injected. Regression tests verify that loop optimizer successfully closes 10-meter artificial offsets.",
            deployment: "Managed via Docker containers deployed to AWS ECR, using Kubernetes Horizontal Pod Autoscaler based on CPU usage queue parameters."
          };
        } else {
          return {
            cost: "Extremely cost-effective, running on standard CPU resources. Computing one hour of trajectory optimization costs less than $0.02 under standard AWS pricing structures.",
            team: "Requires 1x Robotics Algorithm Specialist (with deep understanding of Factor Graphs and Ceres) and 1x C++ Software Engineer.",
            timeline: "4 weeks: Week 1 (spline interpolation models), Week 2 (factor graph integration with g2o), Week 3 (API routing and metadata persistence), Week 4 (Three.js frontend views).",
            risks: "Sparsely distributed nodes or bad loop closures can wrap the trajectory into unnatural geometric loops. Solved by outlier rejection filtering using Robust Loss Kernels (Huber Loss).",
            mvp: "A Python/NumPy-based spline interpolation and Ceres-backed trajectory optimization engine with basic WebGL paths visualization.",
            production: "A highly parallelized g2o C++ optimization service capable of loop-closure corrections over massive multi-floor construction sweeps, synchronized instantly with 3D BIM systems."
          };
        }
      case "orb-slam3":
        if (cat === "reqs") {
          return {
            functional: [
              "Launches robust multi-map visual-inertial odometry using monocular or pinhole-stereo configurations.",
              "Executes robust FAST feature tracking and visual bag-of-words (DBoW2) place recognition.",
              "Auto-merges separated tracking maps when loop closures are identified across walkthrough sections.",
              "Maintains absolute coordinate scales fusing IMU sensor gravity readings.",
              "Performs local bundle adjustment to eliminate reprojection drift errors on keyframes."
            ],
            nonFunctional: [
              "Feature limit: Processes up to 1,500 FAST keypoints per frame under sub-pixel constraints.",
              "VRAM efficiency: Entire active tracking graph allocated in less than 3.0 GB VRAM.",
              "Place Recognition Lookup: Loops detected in under 120ms against a database of 50,000 keyframes.",
              "Thread safety: Decoupled Tracking, Local Mapping, and Loop Closing threads operate asynchronously without deadlocks.",
              "Accuracy: Sub-centimeter camera position accuracy in normal lighting conditions."
            ],
            architecture: `
+---------------------------------------------------------------------------------------------------------+
|                                    ORB-SLAM3 INTEGRATIVE DATA FLOW                                      |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [ Raw Video Frames ] ===> [ Frame Tracking Thread (FAST Features) ]                                   |
|                                       |                                                                 |
|                                       v                                                                 |
|                            [ Local Mapping Thread ] <---> [ DBoW2 Place Recognition / Loop Closure ]    |
|                                       |                                                                 |
|                                       v                                                                 |
|                            [ Atlas Map Manager ] ---> [ Multi-Map Merge / Global Bundle Adjustment ]   |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
`
          };
        } else if (cat === "impl") {
          return {
            backend: "ORB-SLAM3 is wrapped inside a custom C++ CMake package with Python ctypes and pybind11 bindings. Runs as a multi-threaded process. Uses a dynamic Atlas Map manager to store disconnected sub-maps, enabling map-merging when the operator re-visits previously mapped zones.",
            frontend: "Provides an interactive developer control center featuring live tracking logs, feature match counters, atlas sub-map indexes, and map merging alerts. Includes controls to toggle local mapping constraints and force loop closures.",
            schema: `// ORB-SLAM3 Atlas and Sub-Maps Tracking Tables
CREATE TABLE orbslam_atlas_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(50) NOT NULL,
  total_maps_count INTEGER DEFAULT 1,
  dbow_vocabulary_key VARCHAR(100) NOT NULL, -- Path to DBoW2 vocabulary tree in S3
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orbslam_submaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atlas_id UUID REFERENCES orbslam_atlas_models(id),
  submap_index INTEGER NOT NULL,
  nodes_count INTEGER NOT NULL,
  keyframes_count INTEGER NOT NULL,
  is_merged BOOLEAN DEFAULT FALSE,
  serialized_map_key VARCHAR(100) NOT NULL -- Serialized .bin ORB-SLAM3 map file in S3
);`,
            api: `## REST API - ORB-SLAM3 Map Management
POST /api/v1/orbslam/atlas/create
Content-Type: application/json

{
  "project_id": "proj-mumbai-b3",
  "camera_model": "PINHOLE",
  "sensor_type": "MONOCULAR_IMU",
  "vocabulary_s3_key": "vocab/dbow2_voc.bin"
}

Response (200 OK):
{
  "atlas_id": "atlas-99231-10bc",
  "status": "READY",
  "active_submaps": 1
}`,
            flow: "Frames are ingested in real-time. ORB feature matches are tracked to propagate poses. If tracking is lost, ORB-SLAM3 creates a new sub-map inside the Atlas. DBoW2 matches keyframe signatures against all maps. When a match is found, maps are aligned and merged, executing a full global BA.",
            sequence: `[Video Stream]   ---Sequential Frames----------> [ORB Tracking Thread]
                                                       |
[DBoW2 Database] <---Keyframe BoW Signatures--- [Local Mapping Thread]
       |
       +------------Loop/Merge Detected---------> [Loop Closing Thread]
                                                       |
                                                       v
[EKS Worker Node]<--Serialized Atlas binary----- [Atlas Map Manager]`
          };
        } else if (cat === "ops") {
          return {
            infrastructure: "Runs on AWS EC2 g5.xlarge instances (1x NVIDIA A10G GPU, 24GB VRAM) for parallel visual Bag-of-Words and mapping pipelines. Vocabulary files are cached locally in ephemeral NVMe storage arrays.",
            security: "Serialized atlas maps are stored securely in encrypted S3 buckets. APIs are restricted via IAM Roles and Cognito authentication tokens.",
            performance: "Uses custom SSE/AVX CPU vector instructions for ORB descriptor comparison. Implements multi-threaded mutex protection to ensure that loop-closing threads do not block real-time tracking frames.",
            testing: "Tested using standard KITTI and TUM VI datasets. Continuous testing includes simulating complete camera dropouts to verify map recovery and atlas map-merging capabilities.",
            deployment: "Packaged as a CUDA-optimized Docker container deployed via AWS EKS with horizontal autoscaling bound to active walkthrough tasks."
          };
        } else {
          return {
            cost: "VRAM-intensive task. Processing and map compilation cost approximately $0.14 per minute of site video on standard AWS GPU spot instances.",
            team: "Requires 1x Expert SLAM Robotics Engineer (with extensive experience in ORB-SLAM, Ceres, and pybind11) and 1x C++ performance specialist.",
            timeline: "8 weeks: Weeks 1-3 (pybind11 wrapper & C++ optimizations), Weeks 4-5 (atlas map serialization & S3 storage hooks), Weeks 6-8 (loop-closure merging and UI dashboard).",
            risks: "Huge vocabulary files (150MB+) can cause slow container boot times. Solved by pre-loading and caching the DBoW2 vocabulary in high-performance local volumes.",
            mvp: "A pybind11-wrapped monocular ORB-SLAM3 pipeline capable of writing camera poses to JSON and serializing map structures to S3 on job completion.",
            production: "Highly reliable, distributed multi-map visual-inertial SLAM engine with automated real-time map-merging and loop closure, fully integrated into the CAD global BIM coordinate system."
          };
        }
      case "kimera":
        if (cat === "reqs") {
          return {
            functional: [
              "Fuses 3D coordinate mapping with deep visual classifications to build dense metric-semantic meshes.",
              "Executes fast visual-inertial odometry using standard GTSAM-backed factor graph solvers.",
              "Applies dense semantic labeling to 3D voxel grids (using YOLOv11 predictions mapped to point rays).",
              "Constructs geometric 3D meshes (using Euclidean Signed Distance Fields, ESDF) in real-time.",
              "Generates high-fidelity volumetric estimates of active construction structural elements."
            ],
            nonFunctional: [
              "Voxel resolution: Capable of generating voxel grids with 5cm spatial resolution.",
              "Mesh generation: Real-time 3D mesh rendering at 5Hz.",
              "Compute requirements: Fully runs within 12GB GPU memory limits.",
              "Scale-accuracy: Absolute structural volume estimation within 4.5% margin of actual physical twin values.",
              "Semantic mapping: Direct class remapping latency less than 15ms per segmented frame."
            ],
            architecture: `
+---------------------------------------------------------------------------------------------------------+
|                                    KIMERA SEMANTIC-METRIC DATA PIPELINE                                 |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [ Raw Frames + Segments ] ===> [ Kimera-Semantics Node ] <--- [ 3D Camera Pose [R|T] ]                 |
|                                         |                                                               |
|                                         v                                                               |
|                             [ Voxel Grid (TSDF Solver) ]                                                |
|                                         |                                                               |
|                                         v                                                               |
|                             [ 3D Mesh (ESDF Generator) ] ---> [ Semantic 3D Point Cloud GLTF Export ]   |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
`
          };
        } else if (cat === "impl") {
          return {
            backend: "Kimera is implemented as a ROS2 node package running within an AWS EKS container environment. Fuses GTSAM for factor graph VIO and Voxblox for dense TSDF/ESDF mesh generation. Integrates a custom pipeline to project 2D YOLOv11 segmentation class masks into 3D voxel arrays using Raycasting.",
            frontend: "Integrates a dynamic WebGL mesh viewer based on Three.js and GLTFLoader. Renders the semantic 3D mesh inside the browser, allowing users to hover over objects and read class identities (e.g., 'Drywall Wall', 'Concrete Slab').",
            schema: `// Database schema tracking 3D Semantic Meshes and Voxel Metadata
CREATE TABLE kimera_meshes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(50) NOT NULL,
  walkthrough_id VARCHAR(50) NOT NULL,
  voxel_size_cm DOUBLE PRECISION DEFAULT 5.0,
  gltf_file_key VARCHAR(100) NOT NULL, -- Path to generated 3D GLTF file in S3
  classification_summary JSONB NOT NULL, -- Total counts of detected semantic elements
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
            api: `## REST API - 3D Semantic Mesh Generation
POST /api/v1/kimera/mesh/generate
Content-Type: application/json

{
  "project_id": "proj-mumbai-01",
  "walkthrough_id": "walk-09-week4",
  "voxel_size_cm": 5.0,
  "yolo_inference_s3_prefix": "inference/mumbai/b3/week4/"
}

Response (202 Accepted):
{
  "job_id": "kimera-job-88219-92bb",
  "status": "PROCESSING",
  "estimated_processing_minutes": 12
}`,
            flow: "Camera trajectory coordinates and 2D YOLO segmentation masks are aligned. Visual rays are cast from the camera center into the TSDF voxel grid. Voxels are incremented with classification labels and signed distance fields. The Marching Cubes algorithm is run to extract a textured GLTF mesh.",
            sequence: `[YOLO Segmentations] ---Pixel Classes----------> [Raycasting Mesh Engine]
                                                       |
[Camera Trajectories] --SE(3) Camera Poses------> [Raycasting Mesh Engine]
                                                       |
                                                       v
                                            [TSDF & Voxblox Solvers]
                                                       |
                                                       v
[Frontend Mesh View] <---Semantic GLTF Models---- [Amazon S3 Storage]`
          };
        } else if (cat === "ops") {
          return {
            infrastructure: "Deploys on AWS EKS GPU nodes using g5.4xlarge instances featuring NVIDIA A10G GPUs (24GB VRAM) and 16 vCPUs. Employs persistent NVMe storage for rapid Voxblox file reading.",
            security: "Strict access control lists (ACL) on S3 GLTF mesh file outputs. Data packets transferred via HTTPS with TLS 1.3 protocol architectures.",
            performance: "Utilizes multi-threading to parallelize Raycasting over multiple CPU cores. Employs Octree memory optimizations inside Voxblox to reduce mesh-generation memory usage by 70%.",
            testing: "Validated using standard Euroc datasets with artificial semantic labels injected. Unit tests verify TSDF voxel updating and marching cubes polygon extraction accuracy.",
            deployment: "Managed via customized Docker images using EKS with Karpenter auto-scaling. Automatically scales up node allocations on heavy pipeline surges."
          };
        } else {
          return {
            cost: "High compute load task. Renders and mesh exports cost approximately $0.22 per minute of source video analyzed on AWS GPU spot clusters.",
            team: "Requires 1x Senior 3D Computer Vision Engineer (with deep expertise in ROS2, GTSAM, and Voxblox) and 1x Frontend WebGL Developer.",
            timeline: "8 weeks: Weeks 1-3 (ROS2 / Voxblox compilation and setup), Weeks 4-5 (2D-to-3D projection algorithms), Weeks 6-7 (gLTF mesh exporter integration), Week 8 (Three.js integration).",
            risks: "Severe memory leaks may occur on massive voxel maps. Mitigated by partitioning the physical site walkthrough into independent 50-meter processing zones.",
            mvp: "A local ROS2-backed pipeline capable of generating textured 3D point clouds and semantic meshes from pre-recorded walkthrough sequences.",
            production: "A highly parallelized, elastic cloud-native pipeline converting hours of 4K site videos into pristine, fully semantic GLTF 3D meshes ready for BIM comparison."
          };
        }
      case "icp-registration":
        if (cat === "reqs") {
          return {
            functional: [
              "Ingests a raw 3D point cloud of physical site sweeps.",
              "Executes Singular Value Decomposition (SVD) based Iterative Closest Point (ICP) algorithms.",
              "Calculates the optimal transformation matrix ([R|T]) aligning scans to global virtual CAD coordinates.",
              "Computes alignment tolerances, statistical error residuals, and RMS distances.",
              "Filters structural elements to perform regional ICP alignments on high-priority columns and slabs."
            ],
            nonFunctional: [
              "Registration throughput: Aligns a 1,000,000-point scan in less than 4.5 seconds.",
              "Registration accuracy: Sub-15mm spatial accuracy across aligned structural entities.",
              "Memory constraints: Entire ICP pipeline operates within 2.0 GB of system RAM.",
              "Convergence stability: Minimum 98.5% convergence rate on overlapping scans (with >45% overlap).",
              "Statistical reliability: Returns Mean Squared Error (MSE) metrics to assess alignment trust values."
            ],
            architecture: `
+---------------------------------------------------------------------------------------------------------+
|                                    ICP SPATIAL ALIGNMENT PIPELINE                                       |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [ Raw Scan Point Cloud (Source) ] ===> [ Voxel Grid Downsampler ]                                      |
|                                                    |                                                    |
|                                                    v                                                    |
|  [ BIM Model Vertices (Target) ]   ===> [ KD-Tree Nearest Neighbor Matcher ]                            |
|                                                    |                                                    |
|                                                    v                                                    |
|                                       [ SVD Translation/Rotation Solver ]                               |
|                                                    |                                                    |
|                                                    v                                                    |
|                                      [ Transformed Cloud & Alignment [R|T] ]                            |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
`
          };
        } else if (cat === "impl") {
          return {
            backend: "Designed as a Python/C++ microservice wrapped around Open3D and CloudCompare algorithms. Uses KD-Tree data structures for fast nearest-neighbor point lookups. Calculates optimal rigid transforms using SVD, updating the coordinates system dynamically until the root-mean-square error converges below 5mm.",
            frontend: "Renders an elegant split-screen 3D canvas showing 'Before' and 'After' ICP registration states. Visualizes spatial deviation discrepancies as a color-coded heatmap gradient mapped directly to the BIM model surfaces.",
            schema: `// PostgreSQL Database Schema for ICP Registrations and Matrices
CREATE TABLE icp_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(50) NOT NULL,
  walkthrough_id VARCHAR(50) NOT NULL,
  registration_matrix DOUBLE PRECISION[16] NOT NULL, -- 4x4 homogenous transformation matrix [R|T]
  rmse DOUBLE PRECISION NOT NULL, -- Root-Mean-Square Error of final alignment
  fitness_score DOUBLE PRECISION NOT NULL, -- Overlap ratio (0.0 to 1.0)
  aligned_at TIMESTAMPTZ DEFAULT NOW()
);`,
            api: `## REST API - ICP Registration Endpoint
POST /api/v1/icp/align
Content-Type: application/json

{
  "project_id": "proj-mumbai-01",
  "walkthrough_id": "walk-09-week4",
  "source_cloud_s3_key": "clouds/mumbai/b3_week4.pcd",
  "target_bim_s3_key": "bim/mumbai/b3_structural.obj",
  "voxel_size": 0.05,
  "max_iterations": 100
}

Response (200 OK):
{
  "registration_id": "icp-88219-92cc",
  "registration_matrix": [
    0.998, -0.054,  0.021,  14.25,
    0.053,  0.997,  0.045, -92.11,
   -0.023, -0.044,  0.998,   5.42,
    0.000,  0.000,  0.000,   1.00
  ],
  "rmse": 0.0124,
  "fitness_score": 0.895
}`,
            flow: "The source point cloud is loaded and voxel-downsampled. KD-Trees are constructed for the target BIM vertices. Point correspondences are matched. Rotation and translation are calculated using singular value decomposition. This is iterated until the RMSE delta drops below 1e-6.",
            sequence: `[PCD File (S3)]    ---Ingest Raw Vertices----------> [ICP Alignment Engine]
                                                       |
[BIM OBJ (S3)]    ---Ingest BIM Geometry----------> [ICP Alignment Engine]
                                                       |
                                                       v
                                            [SVD Least-Squares Solver]
                                                       |
                                                       v
[Frontend HUD]    <--4x4 Matrix & Discrepancies--- [PostgreSQL DB]`
          };
        } else if (cat === "ops") {
          return {
            infrastructure: "Runs on AWS ECS Fargate CPU tasks (c6i.2xlarge instances with 8 vCPUs, 16GB RAM). Leverages Intel Math Kernel Library (MKL) for accelerated matrix decompositions.",
            security: "API authentication validated via HMAC-SHA256 signatures. Sanitizes point inputs to prevent negative coordinates or index out of bound conditions.",
            performance: "Utilizes Open3D's C++ KD-Tree implementation for sub-millisecond neighbor lookups. Voxel-downsamples dense source scans from 50M points to 1M points to reduce computation times by 90% without loss of registration accuracy.",
            testing: "Tested on standard Stanford 3D models with random rigid transforms injected. Integration tests verify that the engine converges to the global minimum under 45-degree rotational offsets.",
            deployment: "Deploys to AWS ECR as a Docker image. Orchestrated via AWS Step Functions to trigger automatically upon point cloud generation completion."
          };
        } else {
          return {
            cost: "Computational costs are low due to optimized downsampling. Each ICP alignment run costs less than $0.01 on standard AWS CPU container allocations.",
            team: "Requires 1x 3D Mathematics / Geometry Specialist and 1x C++ performance developer.",
            timeline: "4 weeks: Week 1 (downsampling and KD-Tree structures), Week 2 (SVD ICP solver and optimization loops), Week 3 (DB persistence and API endpoints), Week 4 (Three.js discrepancy overlays).",
            risks: "Bad initialization may cause the ICP algorithm to fall into local minima, resulting in misaligned scans. Mitigated by using Global Registration algorithms (FPFH + RANSAC) first, followed by local ICP refinement.",
            mvp: "A Python script using Open3D to downsample PCD clouds, run classical ICP against standard BIM OBJ files, and output the 4x4 matrix.",
            production: "A highly robust spatial alignment pipeline using RANSAC global registration + SVD ICP, generating detailed engineering discrepancy reports inside a WebGL canvas."
          };
        }
      case "point-cloud":
        if (cat === "reqs") {
          return {
            functional: [
              "Fuses 2D dewarped perspective keyframes and camera trajectories to project point coordinates.",
              "Applies dense stereo matching (using SGBM or Deep Pruning models) to calculate depth maps.",
              "Back-projects pixel coordinates and depth values into 3D world space coordinate points.",
              "Removes outlier points using Statistical Outlier Removal (SOR) and Bilateral filters.",
              "Exports dense 3D point clouds in industry-standard formats (LAS, PCD, or PLY)."
            ],
            nonFunctional: [
              "Throughput: Process 100 keyframes to point-cloud conversions in under 90 seconds.",
              "Density: Renders at least 10,000 points per square meter in indoor corridors.",
              "Memory: Operates within 6.0 GB VRAM allocation constraints.",
              "Accuracy: Volumetric depth estimation matching physical measurements with >95% precision.",
              "Bilateral filter latency: Point filtering executed in under 2.5 seconds per million points."
            ],
            architecture: `
+---------------------------------------------------------------------------------------------------------+
|                                    POINT CLOUD GENERATION PIPELINE                                      |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [ 2D Keyframes ] ===> [ Stereo Matching (SGBM / CreStereo) ] ---> [ Depth Maps ]                       |
|                                                                       |                                 |
|                                                                       v                                 |
|  [ Camera Trajectories ] ------------------------------------> [ Back-Projection Solver ]                |
|                                                                       |                                 |
|                                                                       v                                 |
|                                                            [ Raw 3D Point Cloud ]                       |
|                                                                       |                                 |
|                                                                       v                                 |
|                                                            [ Outlier Filter (SOR) ]                     |
|                                                                       |                                 |
|                                                                       v                                 |
|                                                            [ Clean PLY/LAS Export ]                     |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
`
          };
        } else if (cat === "impl") {
          return {
            backend: "Implemented as an AWS GPU-based worker task using PyTorch and Open3D. Uses CreStereo (or OpenCV's StereoSGBM) to compute high-density depth maps from matched keyframe pairs. Back-projects depth images to 3D space using intrinsic camera matrices, applies SOR to prune floating particles, and writes standard PLY files.",
            frontend: "Integrates a high-performance WebGL point cloud viewer based on Potree or Three.js Points material. Enables smooth navigation and spatial measurement of dense, multi-million point sweeps inside the browser viewport.",
            schema: `// PostgreSQL Database Schema for Point Cloud files and metadata
CREATE TABLE point_clouds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(50) NOT NULL,
  walkthrough_id VARCHAR(50) NOT NULL,
  points_count BIGINT NOT NULL,
  file_format VARCHAR(10) DEFAULT 'PLY',
  s3_file_key VARCHAR(100) NOT NULL, -- Path to PCD/PLY file in S3
  bounding_box JSONB NOT NULL, -- Min/Max spatial coordinates
  generated_at TIMESTAMPTZ DEFAULT NOW()
);`,
            api: `## REST API - Dense Point Cloud Generation
POST /api/v1/pointcloud/generate
Content-Type: application/json

{
  "project_id": "proj-mumbai-01",
  "walkthrough_id": "walk-09-week4",
  "resolution": "MEDIUM", // HIGH, MEDIUM, LOW
  "filtering_strength": 1.5
}

Response (202 Accepted):
{
  "job_id": "pcd-job-88219-92cc",
  "status": "QUEUED",
  "estimated_processing_minutes": 8
}`,
            flow: "Adjacent video keyframes are selected based on baseline thresholds. Stereo correspondence maps are calculated. Depth maps are generated and filtered. These are projected using inverse intrinsic matrices and unified using the computed camera trajectory splines, followed by statistical outlier removal.",
            sequence: `[Keyframe Pairs]   ---Matched Stereos----------> [Stereo Matcher (VRAM)]
                                                       |
[Camera Trajectories] --SE(3) Coordinate Matrices-> [Back-Projection Solver]
                                                       |
                                                       v
                                            [Statistical Outlier Removal]
                                                       |
                                                       v
[Frontend HUD]    <--Potree PCD Render Files------ [Amazon S3 Storage]`
          };
        } else if (cat === "ops") {
          return {
            infrastructure: "Deploys on AWS ECS GPU task nodes using g5.2xlarge instances featuring NVIDIA A10G GPUs (24GB VRAM) and 16GB system RAM.",
            security: "Generated PLY/LAS files are stored in S3 buckets with SSE-S3 encryption enabled. Download links are pre-signed with short-lived TTL authorizations.",
            performance: "Executes back-projection in parallel using PyTorch CUDA tensors, cutting processing latency down to 45ms per frame. Uses Octree spatial partitioning to optimize Potree loading times.",
            testing: "Depth-map quality is verified against synthetic scene ground truth using structural metric comparisons. Outlier removal rates are checked for excessive point decimation.",
            deployment: "Containerized using Docker and deployed via AWS ECR, scaling dynamically based on video walk volumes queued in Redis BullMQ."
          };
        } else {
          return {
            cost: "Compute-heavy task. Processing one hour of walkthrough video to dense point-clouds costs approximately $0.18 on standard AWS GPU spots.",
            team: "Requires 1x Stereo Vision Engineer and 1x Performance CUDA Developer.",
            timeline: "6 weeks: Week 1-2 (stereo matching & depth networks), Week 3-4 (back-projection & SOR filtering), Week 5 (S3 pipelines & API routes), Week 6 (Potree integration).",
            risks: "Reflective surfaces or low-light corridors may result in faulty depth estimations. Mitigated by applying bilateral filters and temporal depth consistency checks.",
            mvp: "A PyTorch-based pipeline using StereoSGBM to extract depth maps from calibrated camera frames and export unified PLY files.",
            production: "A highly parallelized GPU pipeline using deep stereo networks to generate dense, noise-free PLY point-clouds, ready for sub-millimeter BIM ICP alignments."
          };
        }
      case "photogrammetry":
        if (cat === "reqs") {
          return {
            functional: [
              "Ingests batches of overlapping perspective images representing site sweeps.",
              "Detects and matches scale-invariant visual features (SIFT, RootSIFT, or SuperPoint).",
              "Computes absolute camera poses and sparse scene structures using Incremental Structure-from-Motion (SfM).",
              "Runs Multi-View Stereo (MVS) reconstruction algorithms to export dense coordinates.",
              "Executes Global Bundle Adjustment to minimize accumulated projection reprojection errors."
            ],
            nonFunctional: [
              "Batch processing: Reconstructs up to 1,000 photos in less than 35 minutes.",
              "SfM alignment precision: Visual projection residuals below 0.8 pixels.",
              "Memory constraints: Processing thread operates within 32GB system RAM allocations.",
              "Scalability: Handles massive image datasets (up to 5,000 images per block) through spatial clustering.",
              "Output formats: Export orthomosaics, OBJ meshes, and geo-referenced point clouds."
            ],
            architecture: `
+---------------------------------------------------------------------------------------------------------+
|                                    PHOTOGRAMMETRY RECONSTRUCTION PIPELINE                               |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [ Image Batch Ingress ] ===> [ Feature Extraction & Matching ] ---> [ Keypoint Matches ]               |
|                                                                            |                            |
|                                                                            v                            |
|                                                               [ Incremental SfM Solver ]                |
|                                                                            |                            |
|                                                                            v                            |
|                                                               [ Sparse Reconstruction ]                 |
|                                                                            |                            |
|                                                                            v                            |
|  [ MVS Dense Depth maps ] ===> [ Dense Reconstruction & Mesh Export ] <---+                            |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
`
          };
        } else if (cat === "impl") {
          return {
            backend: "Designed as an offline cluster pipeline built on top of Colmap (Structure-from-Motion) or AliceVision Meshroom. Employs SIFT for visual feature extraction and vocabulary trees for rapid matching. Runs incremental triangulation, executing Ceres Solver bundle adjustments to compute camera poses and scene coordinates.",
            frontend: "Renders an interactive high-fidelity 3D workspace. Displays camera locations as wireframe frustums and sparse points as interactive vertex arrays, with metrics on reprojection residuals and photo coverage.",
            schema: `// PostgreSQL Database Schema for Photogrammetry Jobs and Models
CREATE TABLE photogrammetry_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'QUEUED', -- QUEUED, MATCHING, SFM, MVS, FINISHED, FAILED
  photos_count INTEGER NOT NULL,
  sparse_points_count BIGINT,
  dense_points_count BIGINT,
  reprojection_error DOUBLE PRECISION,
  output_gltf_key VARCHAR(100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);`,
            api: `## REST API - Photogrammetry Job Management
POST /api/v1/photogrammetry/reconstruct
Content-Type: application/json

{
  "project_id": "proj-mumbai-01",
  "images_s3_prefix": "uploads/mumbai/b3_walk/",
  "algorithm_preset": "ACCURATE", // ACCURATE, FAST, ULTRA
  "max_image_dimension": 2048
}

Response (200 OK):
{
  "job_id": "photo-job-88219-92cc",
  "status": "QUEUED",
  "estimated_processing_minutes": 28
}`,
            flow: "Raw photo assets are uploaded to S3. Features are extracted and matched across images. Incremental triangulation starts with an initial image pair, growing the scene structure iteratively. Loop closure triggers global bundle adjustment, followed by dense MVS depth fusion.",
            sequence: `[Raw Images (S3)]  ---Batch Ingest---------------> [SIFT Feature Matcher]
                                                       |
[SIFT Matcher]    ---Keypoint Correspondences-----> [Incremental SfM Solver]
                                                       |
                                                       v
                                            [Ceres Bundle Adjustment]
                                                       |
                                                       v
[Frontend HUD]    <--WebGL Sparse Mesh Model------ [S3 GLTF File key]`
          };
        } else if (cat === "ops") {
          return {
            infrastructure: "Runs on high-performance AWS EC2 g5.12xlarge instances (4x NVIDIA A10G GPUs, 96GB VRAM, 48 vCPUs, 192GB RAM) to parallelize multi-view stereo calculations.",
            security: "Raw pictures and camera coordinates are isolated inside dedicated VPC subnets. Temporary local directories on workers are encrypted using AES-256.",
            performance: "Accelerates feature matching using CUDA SIFT implementations. Partitions massive scans into spatial clusters (using PMVS/CMVS) to avoid memory overload.",
            testing: "Validated using standard benchmark datasets (e.g., DTU MVS, ETH3D). Triangulation accuracy is verified against high-precision laser scans (ground truth).",
            deployment: "Managed as an asynchronous pipeline orchestrated via AWS Step Functions, triggering Karpenter to provision spot GPU nodes on demand."
          };
        } else {
          return {
            cost: "Compute-intensive. A 1,000-image reconstruction run costs approximately $5.40 on standard AWS GPU spot configurations.",
            team: "Requires 1x Senior Photogrammetry Software Engineer and 1x C++ Graphics System Developer.",
            timeline: "10 weeks: Week 1-3 (Colmap integration & CUDA features), Week 4-5 (incremental SfM pipelines), Week 6-8 (MVS dense fusion), Week 9-10 (gLTF exports & WebGL UI).",
            risks: "Low texture areas (e.g., blank concrete walls) can fail to generate matches, splitting the scene reconstruction. Mitigated by using semantic visual priors (SuperPoint + SuperGlue).",
            mvp: "A command-line Python script wrapping Colmap to run visual matching, SfM, and export a basic PLY file to S3.",
            production: "An elastic, cluster-based photogrammetry service capable of reconstructing thousands of high-res photos into textured, semantic OBJ/gLTF models with sub-pixel projection errors."
          };
        }
      case "calibration":
        if (cat === "reqs") {
          return {
            functional: [
              "Solves for camera intrinsic parameters (focal length, principal points) using chessboard targets.",
              "Computes radial and tangential lens distortion coefficients for correction.",
              "Calculates extrinsics (relative rotation/translation) for multi-camera helmet configurations.",
              "Executes Perspective-n-Point (PnP) algorithms to localize camera coordinates against known site targets.",
              "Applies radial dewarping to raw video keyframes prior to visual tracking."
            ],
            nonFunctional: [
              "Calibration precision: Reprojection error below 0.15 pixels on checkboards.",
              "Dewarping throughput: Corrects 4K video frames in less than 3.0ms using CUDA shaders.",
              "Numerical stability: Employs Levenberg-Marquardt optimization algorithms with high convergence rates.",
              "Memory overhead: PnP calculations operate within 15MB system RAM.",
              "Compatibility: Supports standard camera models (Pinhole, Fisheye, Equirectangular, Kannala-Brandt)."
            ],
            architecture: `
+---------------------------------------------------------------------------------------------------------+
|                                    CAMERA CALIBRATION PIPELINE FLOW                                     |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [ Checkerboard Images ] ===> [ Corner Detection (Sub-pixel CornerSubPix) ]                             |
|                                               |                                                         |
|                                               v                                                         |
|                                 [ Intrinsic Parameter Solver ]                                          |
|                                               |                                                         |
|                                               v                                                         |
|                                 [ Lens Matrix K & Distortion D ]                                        |
|                                               |                                                         |
|                                               v                                                         |
|  [ Raw 360° Walkthrough ]   ===> [ GPU Dewarping Shader (Gnomonic) ] ---> [ Dewarped Keyframes ]        |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
`
          };
        } else if (cat === "impl") {
          return {
            backend: "Designed as a Python/C++ calibration package built on OpenCV's Calib3d module. Extends Kannala-Brandt and Scaramuzza models to resolve severe radial distortions on wide fisheye or equirectangular helmet systems. PnP problems are solved using the EPnP solver with RANSAC outlier filtering.",
            frontend: "Provides an interactive camera calibration assistant. Displays captured checkerboard corners with overlay residuals, heatmaps showing corner point distribution, and interactive sliders to manually adjust distortion matrices.",
            schema: `// PostgreSQL Schema representing Camera Profiles and Calibration Matrices
CREATE TABLE camera_calibration_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_model_name VARCHAR(50) NOT NULL,
  lens_type VARCHAR(20) NOT NULL, -- PINHOLE, FISHEYE, EQUIRECTANGULAR
  matrix_k DOUBLE PRECISION[9] NOT NULL, -- Intrinsic matrix components
  distortion_d DOUBLE PRECISION[5] NOT NULL, -- Distortion coefficients (k1, k2, k3, p1, p2)
  reprojection_error DOUBLE PRECISION NOT NULL,
  calibrated_at TIMESTAMPTZ DEFAULT NOW()
);`,
            api: `## REST API - Camera Calibration Profile Endpoint
POST /api/v1/calibration/intrinsic/solve
Content-Type: application/json

{
  "camera_name": "Insta360_OneX2_Fisheye",
  "lens_type": "FISHEYE",
  "grid_width": 9,
  "grid_height": 6,
  "square_size_mm": 25.0,
  "image_urls": [
    "https://s3.amazonaws.com/calib/insta_01.jpg",
    "https://s3.amazonaws.com/calib/insta_02.jpg"
  ]
}

Response (200 OK):
{
  "profile_id": "calib-88219-92cc",
  "matrix_k": [1242.15, 0.0, 960.5, 0.0, 1242.15, 540.5, 0.0, 0.0, 1.0],
  "distortion_d": [-0.245, 0.042, 0.0, 0.0, 0.0],
  "reprojection_error": 0.085
}`,
            flow: "Checkerboard corner points are extracted and refined to sub-pixel precision. Levenberg-Marquardt optimizer solves the camera matrix K and radial coefficients. Homogenous transformations are evaluated across multi-camera setups, generating undistortion lookup tables for fast GPU dewarping.",
            sequence: `[Calibration Images] ---Detect Grid Corners-----> [OpenCV Calib3d Solver]
                                                       |
                                                       v
                                            [Levenberg-Marquardt Loop]
                                                       |
                                                       v
[Undistort Shader]   <--Intrinsic Matrices (K, D)---- [PostgreSQL DB]
       |
       v
[Dewarped Frames]    ---To Tracking Pipelines-------> [YOLO/SLAM Engines]`
          };
        } else if (cat === "ops") {
          return {
            infrastructure: "Runs on AWS ECS Fargate CPU tasks (c6i.large instances) for profile compilation. Dewarping shaders execute as lightweight GLES/WebGL assets on client web instances.",
            security: "Configuration parameters are read-only and securely version-controlled. Restricts profile access using standard RBAC API authorizations.",
            performance: "Dewarping utilizes OpenCV's GPU-remap or custom WebGL vertex shaders, reducing pixel translation latency to less than 2.5ms on 4K streams.",
            testing: "Corner detection is verified against synthetic chessboard patterns. Extrinsic solver precision is tested under simulated 3D rotations.",
            deployment: "Deploys to AWS ECS as standard Docker containers. Integrates with the CI/CD pipeline to verify calibration accuracy before packaging camera profiles."
          };
        } else {
          return {
            cost: "Computational costs are negligible. Compiling calibration profiles costs less than $0.005 per calculation on standard CPU allocations.",
            team: "Requires 1x Optics & Imaging Specialist and 1x C++ Graphics Developer.",
            timeline: "4 weeks: Week 1 (corner extraction and lens models), Week 2 (intrinsic/extrinsic optimization solvers), Week 3 (PnP models), Week 4 (Web Undistortion shader & UI).",
            risks: "Poor corner coverage can bias intrinsic results, warping reconstructed geometries. Mitigated by interactive corner-distribution heatmaps that guide users during calibration.",
            mvp: "A Python/OpenCV script capable of detecting chessboard corners, solving for pinhole/fisheye parameters, and exporting standard YAML profiles.",
            production: "An enterprise-grade camera calibration platform supporting Kannala-Brandt, Scaramuzza, and Pinhole models, with automated quality control and instant WebGL dewarping."
          };
        }
      default:
        return {
          functional: [],
          nonFunctional: [],
          architecture: ""
        };
    }
  };

  const capData = getCapabilityContent(selectedCapId, activeCategory);

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-6 shadow-2xl font-sans min-h-[750px]">
      
      {/* LEFT SIDEBAR: Capabilities List */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
              Phase 1 Engineering Blueprint
            </span>
          </div>
          <h2 className="text-sm font-black uppercase tracking-wider text-white">
            Missing Capabilities Spec
          </h2>
          <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
            Comprehensive system architecture, mathematical formulations, and engineering blueprints for our eight core computer vision and tracking modules.
          </p>
        </div>

        <div className="flex flex-col gap-1 overflow-y-auto max-h-[500px] scrollbar-thin">
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            const isSelected = cap.id === selectedCapId;
            return (
              <button
                key={cap.id}
                onClick={() => setSelectedCapId(cap.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500/70 text-white shadow-lg shadow-indigo-900/10"
                    : "bg-slate-950/40 border-slate-850 text-slate-450 hover:bg-slate-950/80 hover:text-slate-200 hover:border-slate-800"
                }`}
              >
                <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-indigo-400 font-bold font-mono uppercase tracking-wider block">
                    {cap.category}
                  </span>
                  <h3 className="text-xs font-bold truncate text-slate-200 mt-0.5">
                    {cap.name}
                  </h3>
                  <p className="text-[9px] text-slate-400 truncate mt-0.5">
                    {cap.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Diagnostic Quick Terminal */}
        <div className="bg-slate-950 rounded-lg p-3 border border-slate-850 mt-auto font-mono text-[9px] text-slate-400 flex flex-col gap-1.5 shadow-inner">
          <div className="flex justify-between items-center text-slate-500 border-b border-slate-900 pb-1.5">
            <span className="flex items-center gap-1.5"><Terminal className="w-3 h-3 text-emerald-400" /> CLI DIAGNOSTICS</span>
            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded border border-emerald-500/20">CONNECTED</span>
          </div>
          <div className="space-y-1 h-20 overflow-y-auto scrollbar-none text-[8px] leading-tight text-indigo-300">
            <div>&gt; initialize_phase1_cluster --gpu-pool-id=g5.4xlarge</div>
            <div className="text-emerald-400">&gt; CUDA 12.2 activated. 4x A10G detected (96GB total VRAM)</div>
            <div>&gt; orbslam3_atlas --load-dbow=vocab/dbow2_voc.bin</div>
            <div className="text-emerald-400">&gt; Place recognition vocabulary loaded successfully. (142MB)</div>
            <div>&gt; icp_registration_solver --test-rmse=0.0124</div>
            <div className="text-indigo-400 font-bold">&gt; ICP converged. RMSE: 12.4mm. Transform Matrix verified.</div>
          </div>
        </div>
      </div>

      {/* RIGHT WORKSPACE PANELS */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        
        {/* Selected Cap Info */}
        <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800 flex justify-between items-start gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                {activeCap.category}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-bold font-mono">SPEC v1.0.4-STABLE</span>
            </div>
            <h1 className="text-lg font-black text-white uppercase tracking-wider">
              {activeCap.name}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              {activeCap.tagline} — Active production schema, APIs, cost structures, and mathematical coordinate algorithms.
            </p>
          </div>

          <div className="shrink-0 p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-lg text-indigo-400 shadow-lg">
            {React.createElement(activeCap.icon, { className: "w-6 h-6 animate-pulse" })}
          </div>
        </div>

        {/* 4 main tabs representing 20 dimensions */}
        <div className="flex gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800/80 self-start">
          <button
            onClick={() => setActiveCategory("reqs")}
            className={`px-4 py-2 rounded-md text-xs font-bold transition flex items-center gap-2 ${
              activeCategory === "reqs"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>1. Requirements & System</span>
          </button>
          
          <button
            onClick={() => setActiveCategory("impl")}
            className={`px-4 py-2 rounded-md text-xs font-bold transition flex items-center gap-2 ${
              activeCategory === "impl"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>2. Design & Implementation</span>
          </button>

          <button
            onClick={() => setActiveCategory("ops")}
            className={`px-4 py-2 rounded-md text-xs font-bold transition flex items-center gap-2 ${
              activeCategory === "ops"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Ops & Infrastructure</span>
          </button>

          <button
            onClick={() => setActiveCategory("plan")}
            className={`px-4 py-2 rounded-md text-xs font-bold transition flex items-center gap-2 ${
              activeCategory === "plan"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>4. Planning & Timelines</span>
          </button>
        </div>

        {/* CONTENT DOCK */}
        <div className="flex-1 bg-slate-950/30 border border-slate-800/80 rounded-xl p-6 overflow-y-auto max-h-[600px] scrollbar-thin">
          
          {/* CATEGORY 1: Requirements & System (Dimensions 1-3) */}
          {activeCategory === "reqs" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Functional Requirements */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    1. Functional Requirements
                  </h3>
                  <ul className="space-y-2.5 text-xs text-slate-400">
                    {(capData.functional || []).map((req: string, i: number) => (
                      <li key={i} className="flex gap-2.5 items-start leading-relaxed">
                        <span className="text-indigo-400 font-bold font-mono mt-0.5">{i+1}.</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Non-functional Requirements */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    2. Non-functional Requirements
                  </h3>
                  <ul className="space-y-2.5 text-xs text-slate-400">
                    {(capData.nonFunctional || []).map((req: string, i: number) => (
                      <li key={i} className="flex gap-2.5 items-start leading-relaxed">
                        <span className="text-emerald-400 font-bold font-mono mt-0.5">{i+1}.</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* 3. Complete System Architecture (ASCII diagram) */}
              {capData.architecture && (
                <div className="bg-slate-950/80 p-5 rounded-lg border border-slate-850 font-mono text-[10px] text-indigo-300 overflow-x-auto relative shadow-inner">
                  <div className="absolute top-3 right-3 text-[9px] text-slate-500 border border-slate-800 px-2 py-0.5 rounded uppercase">
                    3. System Architecture Topology
                  </div>
                  <pre className="leading-tight select-none">
                    {capData.architecture}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* CATEGORY 2: Design & Implementation (Dimensions 4-9) */}
          {activeCategory === "impl" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 4. Backend Design */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-indigo-400" />
                    4. Backend Design
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.backend}
                  </p>
                </div>

                {/* 5. Frontend Changes */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-indigo-400" />
                    5. Frontend Changes
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.frontend}
                  </p>
                </div>

              </div>

              {/* 6. Database Schema */}
              {capData.schema && (
                <div className="bg-slate-950/80 p-5 rounded-lg border border-slate-850 font-mono text-[10px] text-emerald-400 relative">
                  <div className="absolute top-3 right-3 text-[9px] text-slate-500 border border-slate-800 px-2 py-0.5 rounded uppercase font-sans">
                    6. PostgreSQL Schema
                  </div>
                  <pre className="overflow-x-auto leading-relaxed">
                    {capData.schema}
                  </pre>
                </div>
              )}

              {/* 7. API Specifications */}
              {capData.api && (
                <div className="bg-slate-950/80 p-5 rounded-lg border border-slate-850 font-mono text-[10px] text-indigo-300 relative">
                  <div className="absolute top-3 right-3 text-[9px] text-slate-500 border border-slate-800 px-2 py-0.5 rounded uppercase font-sans">
                    7. API Specs
                  </div>
                  <pre className="overflow-x-auto leading-relaxed whitespace-pre-wrap">
                    {capData.api}
                  </pre>
                </div>
              )}

              {/* 8. Event Flows & 9. Sequence Diagrams */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-indigo-400" />
                    8. Event Flows
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.flow}
                  </p>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                    9. Sequence Diagrams
                  </h3>
                  <pre className="text-[10px] font-mono text-slate-400 bg-slate-950/90 p-3 rounded border border-slate-900 overflow-x-auto mt-2 leading-relaxed">
                    {capData.sequence}
                  </pre>
                </div>
              </div>

            </div>
          )}

          {/* CATEGORY 3: Ops & Infrastructure (Dimensions 10-14) */}
          {activeCategory === "ops" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 10. Infrastructure */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850 col-span-1 md:col-span-2 lg:col-span-1">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-indigo-400" />
                    10. Infrastructure
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.infrastructure}
                  </p>
                </div>

                {/* 11. Security */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-400" />
                    11. Security
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.security}
                  </p>
                </div>

                {/* 12. Performance Optimization */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-emerald-400" />
                    12. Performance Optimization
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.performance}
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 13. Testing Strategy */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    13. Testing Strategy
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.testing}
                  </p>
                </div>

                {/* 14. Deployment Strategy */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-indigo-400" />
                    14. Deployment Strategy
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.deployment}
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* CATEGORY 4: Planning & Timelines (Dimensions 15-20) */}
          {activeCategory === "plan" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 15. Cost Estimate */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2 text-indigo-300">
                    <span className="font-mono">$</span>
                    15. Cost Estimate
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.cost}
                  </p>
                </div>

                {/* 16. Team Required */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    16. Team Required
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.team}
                  </p>
                </div>

                {/* 17. Timeline */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    17. Timeline
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.timeline}
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 18. Risks */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2 text-red-400">
                    <AlertOctagon className="w-4 h-4 text-red-450" />
                    18. Risks
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.risks}
                  </p>
                </div>

                {/* 19. MVP */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    19. MVP Scope
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.mvp}
                  </p>
                </div>

                {/* 20. Production Version */}
                <div className="bg-slate-950/60 p-5 rounded-lg border border-slate-850">
                  <h3 className="text-xs font-bold text-slate-white uppercase tracking-widest border-b border-slate-800 pb-2 mb-2 flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-450" />
                    20. Production Scope
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {capData.production}
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
