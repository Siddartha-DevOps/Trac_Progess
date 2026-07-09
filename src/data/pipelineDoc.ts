export interface PipelineStep {
  id: number;
  title: string;
  category: "Ingestion" | "Vision Core" | "3D Reconstruction" | "BIM Analytics" | "Dashboard HUD";
  iconName: string;
  summary: string;
  algorithm: {
    name: string;
    description: string;
    mathFormula?: string;
  };
  models: string[];
  libraries: string[];
  optimizations: string[];
  diagram: string;
}

export const AI_PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 1,
    title: "Video Upload",
    category: "Ingestion",
    iconName: "Cloud",
    summary: "Ingest high-resolution 4K 360-degree site videos. Raw footage is split into chunked multi-part streams, verified for binary integrity using MD5 hashing, and dispatched via high-speed queues to processing pipelines.",
    algorithm: {
      name: "S3 Secure Multi-Part Chunked Ingestion",
      description: "An asynchronous multipart upload flow where files are divided into exactly 15MB binary blocks. Each block is uploaded in parallel with concurrent S3 workers. Upon upload, an MD5 checksum validation is performed, followed by a BullMQ job dispatch event on Redis.",
      mathFormula: "Integrity(V) = \\bigwedge_{i=1}^{N} \\left( \\text{MD5}(C_i) \\equiv H_{expected, i} \\right)"
    },
    models: ["None (Infrastructure Ingress Layer)"],
    libraries: ["FastAPI", "boto3 (AWS SDK)", "Redis Py", "BullMQ / Celery"],
    optimizations: [
      "Asynchronous non-blocking file streaming directly to S3 memory buffer",
      "Dynamic chunk-size allocation optimized for Indian cellular network uploads",
      "Failed chunk auto-retry with Exponential Backoff and Jitter algorithms"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
|  Raw 360° Site Video  | ---> |   Multipart Splitter  | ---> | Concurrent S3 Workers |
|   (4K MP4 @ 30 FPS)   |      |   (15MB Binary Chunks)|      | (Parallel PUT Streams)|
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
|   BullMQ Queue Job    | <--- |   Redis Pub/Sub Event | <--- | MD5 Integrity Checker |
| (Enqueued for CUDA)   |      |  (Upload Completed)   |      | (Hash-to-S3 Validate) |
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 2,
    title: "Frame Extraction",
    category: "Ingestion",
    iconName: "Play",
    summary: "Decodes the 30 FPS video stream and extracts keyframes at variable frequencies (typically 1-2 FPS). Adaptive thresholds filter out stationary frames and highly blurry shots caused by quick camera rotations.",
    algorithm: {
      name: "Adaptive Spatio-Temporal Keyframe Selection",
      description: "Computes average dense optical flow using the Farnebäck method. If displacement is below threshold, the operator is stationary; frame is discarded. If Laplacian variance is below threshold, camera motion is too fast (blurry); frame is discarded.",
      mathFormula: "\\text{Keyframe}(t) = \\left[ \\mu_{\\text{optical}} \\ge \\theta_{\\text{motion}} \\right] \\land \\left[ \\operatorname{Var}(\\nabla^2 I_t) \\ge \\theta_{\\text{blur}} \\right]"
    },
    models: ["None (Deterministic Geometry Filter)"],
    libraries: ["NVIDIA-Decord", "opencv-python (cv2)", "numpy"],
    optimizations: [
      "NVIDIA NVDEC hardware acceleration decodes frames directly inside GPU VRAM, bypassing CPU-RAM bottleneck",
      "Dynamic stride scaling: increases frame rate when the operator accelerates walk speed, preserving spatial resolution",
      "In-memory frame buffers eliminate sluggish disk-write operations during processing"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
|   VRAM Decoded Frame  | ---> |  Farnebäck Optical    | ---> | Is Motion >= 0.3m/s?  |
|  (NVIDIA NVDEC Stream)|      |  Flow Displacement    |      | (Yes: Keep / No: Drop)|
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
|  Ingested Keyframe    | <--- | Is Variance >= 100.0? | <--- | Laplacian Variance    |
| (Ready for Dewarping) |      | (Yes: Sharp / No: Blur|      | (Divergence Solver)   |
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 3,
    title: "Image Enhancement",
    category: "Ingestion",
    iconName: "Sliders",
    summary: "Enhances raw frames taken under poor illumination (harsh direct sunlight or dark unfinished basement corridors) to preserve high details on metallic and structural textures.",
    algorithm: {
      name: "CLAHE & Deep Curve Parameter Estimation",
      description: "Applies Contrast Limited Adaptive Histogram Equalization (CLAHE) on the Luminance channel in Lab color space to prevent halo artifacts. Low-light frames are enhanced using a lightweight Deep Curve network to estimate pixel-wise dynamic curves.",
      mathFormula: "I_{enhanced}(x) = I(x) + \\alpha \\cdot I(x) \\cdot (1 - I(x))"
    },
    models: ["Zero-DCE (Deep Curve Estimation)", "MIRNet-v2 (Low-Light Restorer)"],
    libraries: ["opencv-python (CUDA filters)", "scikit-image", "PyTorch"],
    optimizations: [
      "LUT (Lookup Table) multi-threading for rapid color-space conversion mappings",
      "Half-precision (FP16) weight evaluation inside Zero-DCE reduces VRAM utilization to just 180MB",
      "GPU-accelerated bilateral filtering preserving structural edges while removing digital sensor noise"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
|     Raw Keyframe      | ---> |  CIE Lab Color Split  | ---> |      CLAHE Solver     |
|   (Under-exposed)     |      |  (Isolate Luminance)  |      |  (Contrast Enhancer)  |
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
|  Enhanced Keyframe    | <--- | Edge Bilateral Filter | <--- | Zero-DCE Dynamic Curve|
|  (Pristine Textures)  |      |   (Noise Reduction)   |      |  (Light Correction)   |
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 4,
    title: "Object Detection",
    category: "Vision Core",
    iconName: "Layers",
    summary: "Localizes and classifies the 12 target construction elements within 2D perspective frames, focusing heavily on dense, highly overlapping mechanical, electrical, and plumbing (MEP) items.",
    algorithm: {
      name: "Anchor-Free Transformer Bounding Box Localization",
      description: "Employs a real-time DEtection TRansformer (RT-DETR). Uses multi-scale feature extraction combined with a hybrid encoder. Fuses object queries with visual tokens using a Hungarian Matcher, bypassing traditional slow Non-Maximum Suppression (NMS).",
      mathFormula: "\\mathcal{L}_{Hungarian} = \\sum_{i=1}^{N} \\left[ -\\log P(c_i) + \\mathcal{L}_{box}(b_i, \\hat{b}_{\\sigma(i)}) \\right]"
    },
    models: ["RT-DETR-x (Real-Time Transformer)", "YOLOv11x (Detection Backbone)"],
    libraries: ["PyTorch (torch)", "torchvision", "SuperGradients"],
    optimizations: [
      "TensorRT layer fusion compiles multi-head self-attention kernels directly to hardware-specific instructions",
      "Eliminating NMS removes CPU bottlenecks, speeding up dense pipeline inference by 4x",
      "Multi-scale feature maps allow concurrent detection of large slabs and tiny fire sprinklers"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
|  Enhanced Keyframe    | ---> |    HGNetv2 Backbone   | ---> |  Multi-Scale FPN/PAN  |
|     (1024x1024 px)    |      |  (Feature Extractor)  |      | (Aggregates Features) |
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
| Bounding Box Outputs  | <--- |   Hungarian Matcher   | <--- |   Transformer Decoder |
|  (Target Class IDs)   |      | (Bypasses NMS Bottlnk)|      |  (300 Object Queries) |
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 5,
    title: "Object Tracking",
    category: "Vision Core",
    iconName: "GitBranch",
    summary: "Maintains temporal consistency across consecutive video frames. Ensures that individual columns, HVAC segments, and conduits preserve a single unique tracking ID across the entire walkthrough video.",
    algorithm: {
      name: "BoT-SORT & Camera Motion Compensation",
      description: "Associates tracking boxes across frames by matching Kalman filter state vectors (coordinates, aspect ratio, velocity). Background homography estimation (using ORB feature extraction) compensates for helmet-camera tilt, bounce, and shake.",
      mathFormula: "x_{t+1} = F \\cdot x_t + w_t, \\quad y_t = H_{camera} \\cdot (G \\cdot x_t) + v_t"
    },
    models: ["ResNet-50 Re-ID (Deep Feature Extractor)"],
    libraries: ["scipy (linear_sum_assignment)", "filterpy (Kalman Filter)", "opencv-python"],
    optimizations: [
      "Cythonized implementation of the Hungarian assignment solver reduces processing delay to sub-1ms per frame",
      "Two-stage confidence matching (ByteTrack step) retains tracking IDs for dusty or highly occluded items",
      "Low-frequency feature extraction: extracts deep appearance embeddings only every 5 frames, saving massive GPU flops"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
|  Detections t & t+1   | ---> |  ORB Homography Math  | ---> | Kalman Motion Filter  |
|  (Coordinates & IDs)  |      | (Camera Compensation) |      | (State Vector Predict)|
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
| Updated Consistent ID | <--- | Cosine Feature Merge  | <--- |   Hungarian Solver    |
|   (Temporal Track)    |      | (Appearance Weights)  |      | (Matches Kalman State)|
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 6,
    title: "Semantic Segmentation",
    category: "Vision Core",
    iconName: "Sliders",
    summary: "Computes pixel-perfect contours for structural and architectural elements (Slabs, Walls, Beams, Drywalls). Provides the precise volume and boundary profiles necessary for physical BIM registration.",
    algorithm: {
      name: "Decoupled ProtoNet Prototype Assembly",
      description: "Generates 32 global mask prototypes at 1/4 resolution of the input frame. A secondary segment head predicts scalar coefficients for each object. Final masks are assembled by a linear combination passed through a Sigmoid filter.",
      mathFormula: "S_{mask} = \\sigma \\left( P_{\\text{prototypes}} \\cdot M_{\\text{coefficients}} \\right)"
    },
    models: ["YOLOv11x-seg (Segmentation Model)", "SAM-2 (Segment Anything for contour refinement)"],
    libraries: ["PyTorch (torch)", "torchvision", "onnxruntime"],
    optimizations: [
      "ProtoNet mask matrix multiplications are compiled into highly optimized parallel CUDA kernels",
      "Boundary IoU loss prioritizes optimization on boundary pixels, preventing pixel bleed and blurry drywall edges",
      "Masks are compressed using Run-Length Encoding (RLE) inside RAM before database transport, saving bandwidth"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
|  Inference Neck Feat  | ---> |   ProtoNet Generator  | ---> | Global Mask Proto P   |
| (Multi-channel Tensor)|      |  (Spatio-Geom Blocks) |      |  (32 Primitive Maps)  |
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
|  Pixel-Perfect Mask   | <--- | Crop to BBox & Sigmd  | <--- | Matrix Multiply Head  |
| (Boundary IoU Align)  |      |   (Linear Assembly)   |      |  (Coefficients M)     |
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 7,
    title: "Depth Estimation",
    category: "3D Reconstruction",
    iconName: "Eye",
    summary: "Estimates the depth (distance from camera) of every pixel within a single 2D perspective frame, translating 2D images into spatial metrics before full 3D point cloud generation.",
    algorithm: {
      name: "Monocular Metric Depth Inference",
      description: "Utilizes a dense depth-prediction network to compute relative depth maps. These are converted to metric scales (meters) by solving alignment functions against reference points (known structural spans or camera height).",
      mathFormula: "D_{\\text{metric}}(u,v) = \\alpha \\cdot D_{\\text{model}}(u,v) + \\beta"
    },
    models: ["Depth-Anything-V2-Large", "ZoeDepth", "MiDaS-v3.1"],
    libraries: ["PyTorch (torch)", "huggingface-hub", "timm"],
    optimizations: [
      "FP16 quantization reduces memory foot-print by 50% on AWS G5 GPU nodes",
      "Depth model outputs are cached at low resolution (512x512) and upsampled using edge-guided Bilateral Solvers",
      "Temporal smoothing across adjacent walkthrough frames suppresses rapid distance flickers"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
|   2D Perspective Img  | ---> |    Encoder Backbone   | ---> |   Relative Depth Map  |
|     (Enhanced Input)  |      |  (Vision Transformer) |      | (Pixel-Wise Distance) |
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
|  Absolute Metric Map  | <--- |   Temporal Smoother   | <--- | Scale Alignment Solver|
|  (Sub-20mm Resolution)|      |  (Multi-Frame Filter) |      | (Height & CAD Prs)  |
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 8,
    title: "3D Reconstruction",
    category: "3D Reconstruction",
    iconName: "Workflow",
    summary: "Reconstructs raw video segments into sparse visual 3D structures. Solves physical camera locations and structural feature points across overlapping video walkthrough sectors.",
    algorithm: {
      name: "Structure-from-Motion (SfM) Bundler",
      description: "Extracts keypoints, matches visual features across frames using light attention matching, filters geometric outliers using Epipolar geometry (Essential Matrix verification), and performs global bundle adjustment.",
      mathFormula: "\\min_{P_j, R_i, T_i} \\sum_{i} \\sum_{j} \\left\\| x_{ij} - K(R_i P_j + T_i) \\right\\|^2"
    },
    models: ["SuperPoint (Visual Features)", "LightGlue (Feature Matching transformer)", "Dust3R"],
    libraries: ["pycolmap", "gtsam (Factor Graphs)", "scipy.optimize"],
    optimizations: [
      "Vocabulary Tree based index speeds up feature matching on thousands of walkthrough frames from O(N²) to O(N)",
      "CUDA-accelerated SIFT descriptor extraction runs in parallel with image enhancements",
      "Factor Graph incremental solvers (iSAM2) update camera paths dynamically, skipping redundant calculations"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
| Ingested Frame Stream | ---> |  SuperPoint Extractor | ---> | LightGlue Matcher     |
|   (Variable Keyframes)|      |  (Robust Site Feats)  |      | (Transformer Matcher) |
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
| 3D Scene Structure    | <--- |   Bundle Adjustment   | <--- | Factor Graph iSAM2    |
| (Sparse Point Cloud)  |      | (Ceres Global Solver) |      | (Incremental Traj)    |
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 9,
    title: "Camera Pose Estimation",
    category: "3D Reconstruction",
    iconName: "Compass",
    summary: "Computes the exact 6-Degrees-of-Freedom (6-DOF) spatial position and rotation of the operator's helmet camera relative to the physical site coordinate grid.",
    algorithm: {
      name: "Perspective-n-Point (PnP) RANSAC Solver",
      description: "Solves the absolute pose of the camera by matching 2D pixel keypoints to georeferenced 3D landmark coordinates. Uses Random Sample Consensus (RANSAC) to filter out dynamic site noise (e.g. workers walking past).",
      mathFormula: "P_{camera} = \\begin{bmatrix} R_{3x3} & T_{3x1} \\\\ 0_{1x3} & 1 \\end{bmatrix}"
    },
    models: ["None (Pure Photogrammetry & Spatial Math)"],
    libraries: ["gtsam", "scipy.spatial", "opencv-python"],
    optimizations: [
      "Initial pose seed generated using IMU sensor logs (accelerometer, gyroscope) reduces RANSAC iterations by 80%",
      "Covariance-weighted bundle adjustment treats distant keypoints with smaller weights to protect pose accuracy",
      "Dynamic tracking cache avoids solving PnP from scratch by using motion priors of operator speed (typical < 1.5m/s)"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
|  2D Visual Keypoints  | ---> |   PnP Spatial Matrix  | ---> |  RANSAC Iterative Loop|
|  (SuperPoint Feature) |      | (Matches 2D-3D Pairs) |      | (Removes Dynamic Noise|
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
|   6-DOF Camera Pose   | <--- | Ceres Graph Smoother  | <--- |  Extrinsic Projection |
|  [R|T] Global Vector  |      | (Fuses Camera Traj)   |      |  (Pose Transformation)|
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 10,
    title: "Point Cloud Generation",
    category: "3D Reconstruction",
    iconName: "Network",
    summary: "Converts millions of multi-view 2D depth measurements into a dense, metric 3D point cloud. Noise, floating particles, and dust are filtered to produce a highly accurate physical representation of active floors.",
    algorithm: {
      name: "Volumetric TSDF Fusion & Voxel Grid Filtering",
      description: "Fuses depth maps into a volumetric Truncated Signed Distance Function (TSDF) grid. Extracts the dense point cloud, applies voxel downsampling (0.01m voxels), and runs statistical outlier removal (SOR) to prune dynamic visual artifacts.",
      mathFormula: "D(x) = \\frac{\\sum w_i \\cdot d_i(x)}{\\sum w_i}, \\quad SOR(p) = \\left[ \\bar{d}_k \\le \\mu + m \\cdot \\sigma \\right]"
    },
    models: ["None (Deterministic Voxel Engine)"],
    libraries: ["Open3D (CUDA)", "PCL (Point Cloud Library)", "numpy", "cupy"],
    optimizations: [
      "CuPy arrays perform TSDF volumetric projections directly on GPU cores, skipping slow CPU loops",
      "Voxel downsampling decreases point density in planar areas (slabs, walls) while retaining high density in corners",
      "Octree spatial indexing structure reduces point cloud searching complexity to O(log N)"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
| Multi-View Depth Maps | ---> |   Volumetric TSDF     | ---> | Dense Point Extraction|
| (Metric Scale Images) |      |   (GPU-Parallel Grid) |      |  (Millions of Points) |
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
| Clean 3D Point Cloud  | <--- | Statistical Outlier   | <--- | Voxel Downsampler     |
| (Sub-15mm Spatial Map)|      |  (SOR Noise Filter)   |      | (Voxel Grid Decimate) |
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 11,
    title: "BIM Alignment",
    category: "BIM Analytics",
    iconName: "Database",
    summary: "Registers the generated 3D scanned point cloud with the virtual IFC CAD BIM model. Computes the global translation and rotation matrices needed to overlay physical coordinates directly onto virtual baseline designs.",
    algorithm: {
      name: "FPFH Global Registration & Iterative Closest Point (ICP)",
      description: "Extracts Fast Point Feature Histograms (FPFH) to perform rough, coarse alignment. Refines features using point-to-plane Iterative Closest Point (ICP). Computes optimal spatial transformations by minimizing coordinate distance.",
      mathFormula: "E(R, T) = \\sum_{i} \\left\\| (R \\cdot p_i + T - q_i) \\cdot n_i \\right\\|^2"
    },
    models: ["None (Optional: PointNet++ for category registration)"],
    libraries: ["Open3D", "ifcopenshell", "scipy.spatial"],
    optimizations: [
      "Pre-indexes virtual CAD models into 3D KD-Tree structures, achieving microsecond nearest-neighbor matching",
      "Facets-filtering: only registers scans against active CAD components (skipping finished floors)",
      "Coarse-to-Fine registration reduces ICP convergence iterations from 300 down to just 15"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
|  Raw Scanned Point Cl | ---> |   FPFH Descriptor     | ---> | RANSAC Coarse Align   |
|   (Metric Coordinates)|      |  (Global Feature Hist)|      | (Rough Rotation/Trans)|
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
| Aligned Digital Twin  | <--- |  KD-Tree Match Query  | <--- | Point-to-Plane ICP    |
| (Perfect Spatial Over)|      |  (IFC Facets Index)   |      |  (Fine Tuning Solver) |
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 12,
    title: "Progress Detection",
    category: "BIM Analytics",
    iconName: "Workflow",
    summary: "Computes physical construction progress by comparing the scanned elements with the virtual IFC CAD schema. Automatically identifies which structural components have been completed.",
    algorithm: {
      name: "Spatio-Volumetric Intersection Detection",
      description: "Extracts physical coordinates of segmented components (e.g. Drywalls). Evaluates the Intersection over Union (IoU) of 3D bounding geometries. If the scanned point cloud density is $>80\\%$ of the CAD volume, marked as 'Built'.",
      mathFormula: "\\text{Progress}_{IoU}(E) = \\frac{\\operatorname{Vol}\\left( P_{\\text{scanned}, E} \\cap V_{\\text{CAD}, E} \\right)}{\\operatorname{Vol}\\left( V_{\\text{CAD}, E} \\right)}"
    },
    models: ["None (Deterministic CAD-to-Scanned geometry solver)"],
    libraries: ["trimesh", "shapely (2D projection)", "numpy"],
    optimizations: [
      "Bounding Volume Hierarchies (BVH) prune non-overlapping element checks instantly",
      "Downsamples scanned regions: skips checking points that are deep inside solid walls, checking only face coordinates",
      "Dynamic baseline indexing: only evaluates elements scheduled for active construction windows"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
| Aligned 3D Point Cl   | ---> |  BVH Space Partition  | ---> | Volumetric Intersect  |
|  (With Segment Labels)|      | (Prunes Silent Zones) |      | (Calculates 3D IoU)   |
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
| Updated Status Map    | <--- | Density Thresholding  | <--- | Point Density Solver  |
|  (GUID-indexed row)   |      | (If IoU > 80% = Built) |      | (Points vs CAD Volume)|
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 13,
    title: "Completion Percentage",
    category: "BIM Analytics",
    iconName: "CheckCircle",
    summary: "Computes the exact completion percentages for overall building floors and system trades (MEP, Structural, Finishes), respecting physical and logical construction dependency graphs.",
    algorithm: {
      name: "Trade-Weighted Dependency Aggregator",
      description: "Aggregates completed components, weighting each by scheduled man-hours and material cost. Employs a Directed Acyclic Graph (DAG) solver to enforce topological dependencies (e.g., Slabs on Level 2 require Columns on Level 1).",
      mathFormula: "\\%_{\\text{Complete}}(F) = \\frac{\\sum_{e \\in F} w_e \\cdot \\mathbb{I}\\left(\\text{Status}_e \\equiv \\text{'Built'}\\right)}{\\sum_{e \\in F} w_e}"
    },
    models: ["None (Relational Aggregators & Rules Engines)"],
    libraries: ["networkx", "pandas", "numpy"],
    optimizations: [
      "Caching: stores intermediate completion metrics at room-level, avoiding deep scans of the entire building DAG on minor changes",
      "Sparse matrix representations of graph structures speed up dependency evaluations to microseconds",
      "Bit-vector optimization for rapid binary tracking of element completion status values"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
| Updated Status Map    | ---> | Topological Graph     | ---> | Cost & Weight Index   |
|  (GUID-indexed rows)  |      |  (Dependency Parser)  |      | (Calculates Effort)   |
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
| Dashboard Percentage  | <--- | Temporal State Machine| <--- | Weighted Aggregator   |
|  (72% overall value)  |      |  (Curing Time Solver) |      | (Aggregates Trades)   |
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 14,
    title: "Issue Detection",
    category: "BIM Analytics",
    iconName: "AlertTriangle",
    summary: "Automatically flags dimensional deviations and MEP clashes (e.g. HVAC ducts colliding with CPVC sprinkler lines, or columns slightly offset) that violate specified IFC clearance parameters.",
    algorithm: {
      name: "3D Volumetric Clash Analysis & Spatial Discrepancy",
      description: "Computes spatial clearance profiles for MEP elements. Queries the distance between scanned physical boundaries and CAD coordinate specs. If components occupy the same physical coordinates, a clash is generated.",
      mathFormula: "\\text{Clash}(A, B) = \\operatorname{dist}\\left(V_A, V_B\\right) \\le \\theta_{\\text{tolerance}}"
    },
    models: ["Gemini-2.5-Flash (to generate natural-language issue tickets and recommended fixes)"],
    libraries: ["trimesh (raycasting)", "scipy.spatial", "ifcopenshell"],
    optimizations: [
      "Octree spatial partitioning skips checking pairs of elements that are not in immediate physical vicinity",
      "GPU-accelerated triangle intersection algorithms (OptiX) solve millions of polygon coordinates in seconds",
      "Active status filters: skips clash detection on floors that have not begun active MEP piping works"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
| Aligned Scanned Cloud | ---> | Octree Partitioning   | ---> | Volumetric Intersect  |
|  (Perfect Spatial Over)|      | (Isolates Near Pairs) |      |  (Clash Solver Core)  |
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
|  Alert Notification   | <--- | Gemini Ticket Engine  | <--- | Deviation Tracker     |
| (Clash Ticket Opened) |      | (Writes Remediation)  |      | (If Clash > 25mm flag)|
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 15,
    title: "Delay Risk Detection",
    category: "BIM Analytics",
    iconName: "TrendingUp",
    summary: "Evaluates construction timelines. Predicts future bottleneck risks and scheduling delays across the project, based on current completion velocity and curing windows.",
    algorithm: {
      name: "Monte Carlo Critical Path Schedule Simulator",
      description: "Uses current progress trends to run 10,000 Monte Carlo schedule simulations. Projects completion dates based on historical velocity and curing intervals, flagging activities with negative float times.",
      mathFormula: "P\\left(\\text{Delay} > d\\right) = \\frac{1}{M} \\sum_{m=1}^{M} \\mathbb{I}\\left( \\text{CPM}_m(t) - T_{\\text{target}} > d \\right)"
    },
    models: ["None (Stochastic Schedule Solver)"],
    libraries: ["scipy.stats", "networkx", "pandas"],
    optimizations: [
      "Sparse matrix CPM solver resolves critical path routes in microseconds, allowing live interactive simulations",
      "Parallelized Monte Carlo paths: utilizes Python multi-processing pools over all server CPU cores",
      "Dynamic risk pooling: groups minor non-critical delay risks to prevent false alarming site managers"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
| Trade Percentages     | ---> | Critical Path Network | ---> | Monte Carlo Sampler   |
| (Current Stage Speeds)|      |  (Task Dependency)    |      | (10,000 Schedule Sim) |
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
| Delay Risk Dashboard  | <--- | Critical Risk Filter  | <--- | Float Time Calculator |
| (Red Alert indicators)|      | (Negative Float Paths)|      | (Distribution Curves) |
+-----------------------+      +-----------------------+      +-----------------------+`
  },
  {
    id: 16,
    title: "Dashboard Output",
    category: "Dashboard HUD",
    iconName: "Terminal",
    summary: "Visualizes the entire computed site state onto responsive web interfaces. Provides intuitive interactive 3D viewports, daily automated AI brief logs, and spatial anomaly centers for engineers.",
    algorithm: {
      name: "Instanced WebGL Rendering & Spatial Sync Engine",
      description: "Renders the 3D BIM canvas inside Three.js using instanced geometry buffers. Status updates are pushed to clients using WebSockets. Gemini models automatically summarize complex anomaly metrics into clear executive reports.",
      mathFormula: "\\text{Render}(\\text{BimCanvas}) = \\bigcup_{e \\in E} \\text{Instance}_{e}\\left( R_e, T_e, \\text{Color}(\\text{Status}_e) \\right)"
    },
    models: ["Gemini-2.5-Flash (to summarize metrics and auto-generate daily site briefs)"],
    libraries: ["Three.js", "lucide-react", "recharts", "socket.io-client"],
    optimizations: [
      "Instanced mesh rendering compiles repeating elements (columns, conduit hangers) into single GPU draw calls",
      "Frustum and Occlusion Culling inside Three.js prevents rendering elements that are currently hidden from view",
      "Dynamic data-polling debouncers prevent UI lag when high volumes of WebSocket logs are pushed to client screens"
    ],
    diagram: `+-----------------------+      +-----------------------+      +-----------------------+
|  Computed Site State  | ---> | WebSocket Event Push  | ---> | Three.js Instance Mesh|
| (Database Record Rows)|      |  (Immediate Updates)  |      |  (Color-coded status) |
+-----------------------+      +-----------------------+      +-----------+-----------+
                                                                          |
                                                                          v
+-----------------------+      +-----------------------+      +-----------+-----------+
| Elegant Web Viewport  | <--- | Gemini Executive Brief| <--- | Frustum Culling Engine|
| (Interactive 3D Tool) |      | (Human-readable Logs) |      | (High-performance FPS)|
+-----------------------+      +-----------------------+      +-----------------------+`
  }
];
