export interface CVSection {
  id: string;
  title: string;
  category: "Detection & Segmentation" | "Tracking & Dewarping" | "Training & Data" | "Evaluation & Deploy";
  iconName: string;
  content: string;
}

export const CV_ARCHITECTURE_SECTIONS: CVSection[] = [
  {
    id: "cv-overall-architecture",
    title: "1. Computer Vision Architecture",
    category: "Detection & Segmentation",
    iconName: "Network",
    content: `### High-Level Computer Vision Architecture

The Computer Vision (CV) module is designed as a **dual-pass, geometry-guided spatio-temporal inference engine**. 

Its core objective is to analyze continuous 360-degree helmet-camera video walkthroughs of construction sites, identify active elements, segment them with pixel-level precision, track them through time, and register them back into the coordinate frame of the 3D BIM model.

#### The Dual-Pass Inference Flow:
1. **Pass 1: Spatio-Temporal Ingress (Localization)**: Renders a continuous trajectory of the operator walkthrough using visual-inertial SLAM. This assigns a 6-DOF camera pose ($[R|T]$) to every extracted keyframe.
2. **Pass 2: Object Segmentation & Association**: Feeds selected keyframes into parallel deep learning heads (YOLOv11-seg + RT-DETR) to localize and segment the 12 key construction elements, then maps them into 3D world space.

\`\`\`
   +-------------------------------------------------------------+
   |                     Raw 360° Walkthrough                    |
   |                (4K Equirectangular, 30 FPS)                 |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |             Frame Extractor & Dewarping Engine              |
   |     - Optical Flow filtering (blur / pause elimination)     |
   |     - Equirectangular-to-Perspective Gnomonic Solver        |
   +------------------------------+------------------------------+
                                  |
             +--------------------+--------------------+
             |                                         |
             v                                         v
   +-------------------+                     +-------------------+
   |  Visual SLAM &   |                     | PyTorch ML Cluster|
   | Camera Tracker    |                     | (RT-DETR / YOLO)  |
   | - 6-DOF Pose      |                     | - Object Det.     |
   | - Odometry Graph  |                     | - Instance Seg.   |
   +---------+---------+                     +---------+---------+
             |                                         |
             +--------------------+--------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |             Multi-Object Tracking (MOT) & Fusion            |
   |       - ByteTrack / BoT-SORT temporal track association     |
   |       - 3D Projection Engine (Intrinsic / Extrinsic Mapping)  |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |              3D BIM Registration & Alignment                |
   |    - Iterative Closest Point (ICP) Point Cloud Overlay      |
   |    - Discrepancy Engine (Compares predicted vs. IFC GUID)   |
   +-------------------------------------------------------------+
\`\`\`

#### Key Architecture Principles:
* **Decoupled Heavy Compute**: Raw frames are dewarped on lightweight CPU clusters and sent via Redis queues to dedicated CUDA-backed GPU pools for parallel neural inference.
* **Geometry-Constraint Prior**: Predictions are filtered based on spatial context. For example, a "Ceiling Grid" is mathematically constrained to appear in the upper hemisphere of the spatial map relative to the computed camera trajectory.`
  },
  {
    id: "recommended-models",
    title: "2. Recommended Deep Learning Models",
    category: "Detection & Segmentation",
    iconName: "Cpu",
    content: `### Recommended Deep Learning Models (Model Selection Matrix)

Detecting complex, highly occluded construction elements under varying illumination requires a customized ensemble approach instead of a single model.

| Model Category | Recommended Network | Selection Rationale | Core Function |
| :--- | :--- | :--- | :--- |
| **Real-time Instance Segmentation** | **YOLOv11x-seg** | State-of-the-art speed-to-accuracy ratio. Employs a modified C3k2 backbone and decoupled segmentation head (ProtoNet). | Detects and extracts precise polygons for structural components (**Walls, Slabs, Columns, Beams, HVAC Ducts**). |
| **High-Density Object Detection** | **RT-DETR (Real-Time DEtection TRansformer)** | A transformer-based detector that eliminates Non-Maximum Suppression (NMS) bottlenecks. Avoids suppression errors on overlapping linear objects. | Detects dense, overlapping MEP objects (**Pipes, Electrical Conduits, Cable Trays**). |
| **Zero-Shot Object Grounding** | **Grounding DINO** | Open-vocabulary detector linking natural language to bounding boxes. Essential for rare architectural components. | Auto-labels custom fittings or rare construction items (**Fire Sprinklers, Ceiling Grids, Specific HVAC dampers**) during active learning. |
| **Class-Agnostic Segmenter** | **Segment Anything 2 (SAM 2)** | High-fidelity foundation model. Excels at generating pixel-perfect contours when prompted with bounding boxes. | Refines boundaries of detected items; acts as the primary tool for synthetic data generation and label auto-completion. |

#### Why RT-DETR is Critical for MEP:
Traditional convolutional detectors rely heavily on NMS thresholds to remove overlapping bounding boxes. On a construction site, electrical conduits, water pipes, and cable trays run parallel in tight bundles. This causes traditional NMS to suppress true positive detections. RT-DETR uses Hungarian Matching in its transformer architecture, bypasses NMS, and naturally excels at distinguishing overlapping parallel elements.`
  },
  {
    id: "object-detection",
    title: "3. Object Detection Pipeline",
    category: "Detection & Segmentation",
    iconName: "Layers",
    content: `### Object Detection Pipeline Specification

The Object Detection module operates as an anchor-free network executing multi-class classification and spatial localization.

\`\`\`
  +------------------+     +------------------+     +------------------+
  |   Input Image    | --> |  HGNetv2 Backbone| --> |   FPN / PAN Neck |
  | (1024x1024x3)    |     | (Feature Extr.)  |     | (Multi-scale)    |
  +------------------+     +------------------+     +------------------+
                                                             |
                                                             v
  +------------------+     +------------------+     +------------------+
  |  Bounding Box    | <-- | Hungarian Matcher| <-- | Transformer Head |
  |  Predictions     |     | (No NMS Needed)  |     | (Query Decoder)  |
  +------------------+     +------------------+     +------------------+
\`\`\`

#### Detailed Pipeline Stages:
1. **Preprocessing**: 
   * Image resizing to standard $1024 \\times 1024$ pixels.
   * Local Contrast Normalization to mitigate harsh shadows and over-exposure from high-intensity halogen site lamps.
2. **Backbone Feature Extraction**:
   * Uses **HGNetv2 (High Performance GPU Net)** which includes Depthwise Separable Convolutions and Squeeze-and-Excitation blocks.
   * Extracts multi-level feature maps at resolutions of 1/8, 1/16, and 1/32 of the input shape.
3. **Neck (Multi-scale Feature Fusion)**:
   * **Path Aggregation Network (PAN)** fuses semantic features from top-down channels with spatial coordinates from bottom-up channels. This ensures that small objects (like fire sprinklers) preserve high-resolution spatial details in early network blocks.
4. **Decoder & Transformer Heads**:
   * Generates $N = 300$ object queries.
   * Outputs regression coordinates $B_i = [x_{center}, y_{center}, w, h]$ and classification probabilities $C_i$ for each of the 12 object classes.

#### Target Elements:
The pipeline is calibrated to identify the 12 key elements:
* **Structural**: Walls, Columns, Beams, Slabs
* **MEP**: Pipes, Electrical Conduits, Cable Trays, HVAC Ducts, Fire Sprinklers
* **Finishes**: Doors, Windows, Ceiling Grids`
  },
  {
    id: "instance-segmentation",
    title: "4. Instance Segmentation Pipeline",
    category: "Detection & Segmentation",
    iconName: "Sliders",
    content: `### Instance Segmentation Pipeline

For elements like Slabs, Walls, and HVAC Ducts, bounding boxes are insufficient. Precise volume and area coverage calculations require pixel-level masks.

#### The Instance Segmentation Pipeline Architecture (YOLOv11-seg based):
1. **ProtoNet (Prototype Generation Block)**:
   * Generates $k = 32$ global candidate mask prototypes ($P \\in \\mathbb{H} \\times \\mathbb{W} \\times k$) at 1/4 resolution of the input image.
   * These prototypes represent basic geometric primitives (edges, vertical surfaces, horizontal planes, curves).
2. **Segment Head (Coefficient Prediction)**:
   * For each detected object, the segment head predicts $k$ mask coefficients ($M \\in \\mathbb{R}^k$).
3. **Linear Combination Assembly**:
   * The final instance mask ($S$) is generated by taking the matrix product of prototypes and coefficients, passed through a Sigmoid activation:
     $$S_i = \\sigma(P \\cdot M_i)$$
   * Crop the resulting mask to the predicted object bounding box.

\`\`\`
                 +-----------------------+
                 |  Fused Neck Features  |
                 +-----------+-----------+
                             |
             +---------------+---------------+
             |                               |
             v                               v
   +-------------------+           +-------------------+
   |   Prototype Net   |           |  Segment Head     |
   |    (ProtoNet)     |           | (Mask Coeffs M)   |
   +---------+---------+                     +---------+---------+
             |                               |
             +---------------+---------------+
                             |
                             v
                 +-----------------------+
                 |   Matrix Multiplication|
                 |      S = Sigmoid(P*M) |
                 +-----------+-----------+
                             |
                             v
                 +-----------------------+
                 |  Crop to Bounding Box |
                 |  (Final Polygon Mask) |
                 +-----------------------+
\`\`\`

#### Boundary IoU Loss:
To prevent "fuzzy borders" on concrete slabs and drywall frames, we train with **Boundary IoU Loss**, which focuses optimization specifically on pixels along the contour edges:
$$L_{boundary} = 1 - \\frac{|(G \\cap D) \\cap B_d|}{|(G \\cup D) \\cap B_d|}$$
where $G$ is ground truth, $D$ is prediction, and $B_d$ is the narrow boundary band of thickness $d$.`
  },
  {
    id: "multi-object-tracking",
    title: "5. Multi-Object Tracking Pipeline",
    category: "Tracking & Dewarping",
    iconName: "GitBranch",
    content: `### Multi-Object Tracking (MOT) Pipeline

A site walkthrough contains continuous footage of the same structural columns and pipes from multiple angles. To prevent double-counting and enable 3D localization, the system must maintain consistent temporal IDs.

#### The BoT-SORT & ByteTrack Hybrid Tracking Engine:
1. **Dynamic Track Association**:
   * **High-Confidence Step**: Associates highly confident detections ($\\text{IoU} \\ge 0.6$) with existing tracklets using Hungarian linear assignment.
   * **Byte Step**: For lower-confidence detections (due to dust, motion blur, or severe lighting shifts), instead of throwing them away, associates them with existing tracklets. This maintains track continuity even under heavy transient occlusions.
2. **Camera Motion Compensation (CMC)**:
   * Walkthroughs are helmet-mounted, causing constant shaking, panning, and tilting.
   * Uses OpenCV's global homography estimation to align background features between consecutive frames:
     $$x_{t+1} = H_t \\cdot x_t$$
   * This offsets camera motion, allowing the Kalman Filter state to model only the physical movement or scale shift of objects relative to the frame.

\`\`\`
   +------------------+
   |  Inference Frame |
   +--------+---------+
            |
            v
   +--------+---------+     No Track?     +--------------------+
   |   Detections     | ----------------> | Create New Tracklet|
   +--------+---------+                   +--------------------+
            |
     [Match High-Score] ---> Matched? ---> Update Kalman State
            | (IoU >= 0.6)
            v
     [Match Low-Score]  ---> Matched? ---> Update Kalman State
            | (Dust/Blur)
            v
     No match for 30 frames? -----------> Terminate / Archive Track
\`\`\`

#### Spatio-Temporal Association Logic:
* State Vector: $x = [u, v, s, r, \\dot{u}, \\dot{v}, \\dot{s}]$ representing horizontal and vertical coordinates, area, aspect ratio, and their respective derivatives.
* Track affinity is scored by combining 2D IoU with Cosine Similarity of deep appearance descriptors extracted from a ResNet-50 Re-ID network.`
  },
  {
    id: "frame-extraction",
    title: "6. Frame Extraction Strategy from 360° Videos",
    category: "Tracking & Dewarping",
    iconName: "Play",
    content: `### Frame Ingestion & 360° Video Dewarping

Raw helmet footage consists of ultra-wide 360-degree equirectangular videos. These contain severe spherical radial distortions that render standard convolutional networks useless.

#### 1. Dewarping Algorithm (Equirectangular to Gnomonic/Perspective):
We partition the spherical frame into $N = 6$ overlapping flat perspective views (Front, Back, Left, Right, Up, Down), representing a Cube Map.
For any target pixel $(x, y)$ in the perspective plane, we calculate its spherical angles $(\\theta, \\phi)$:
$$\\theta = \\arctan\\left(\\frac{x}{f}\\right), \\quad \\phi = \\arctan\\left(\\frac{y \\cos\\theta}{f}\\right)$$
where $f$ is the focal length corresponding to the chosen field of view (FOV, set to $90^\\circ$).

These angles map directly to raw source pixels inside the equirectangular frame:
$$U = \\frac{\\theta + \\pi}{2\\pi} \\cdot W_{equi}, \\quad V = \\frac{\\phi + \\pi/2}{\\pi} \\cdot H_{equi}$$

\`\`\`
       +---------------------------------------------+
       |             Equirectangular Frame           |
       |                   (360° Panoramic)          |
       +----------------------+----------------------+
                              |
                     [Spherical Mapping]
                              |
                              v
                   +----------+----------+
                   |  Cube Map Projection|
                   |  (6 Flat Perspectives)
                   +--+--+--+--+--+--+--+
                      |  |  |  |  |  |
                      v  v  v  v  v  v
                   [Parallel YOLO Inference]
\`\`\`

#### 2. Adaptive Keyframe Selection:
Processing 30 FPS video is computationally wasteful and redundant. The **Frame Extraction Engine** filters the video stream down to essential keyframes ($1 \\sim 2$ FPS) based on:
1. **Optical Flow Thresholding**: Computes average optical flow ($\\mu_{flow}$) using Gunnar Farnebäck's method. If ($\\mu_{flow}$) is near zero, the operator is standing still; the frame is dropped.
2. **Laplacian Blur Scoring**: Computes the variance of the Laplacian of the image:
   $$\\text{Score} = \\operatorname{Var}\\left(\\nabla^2 I\\right)$$
   If $\\text{Score} < 100.0$, the frame is discarded as blurry (due to rapid operator head turning).
3. **Redundancy Overlap**: Drops frames if the spatial camera pose $[R|T]$ from SLAM indicates a camera translation of less than 0.3 meters from the previously selected frame.`
  },
  {
    id: "camera-calibration",
    title: "7. Camera Calibration",
    category: "Tracking & Dewarping",
    iconName: "Compass",
    content: `### Camera Calibration & Coordinate Registration

To transform 2D pixel segments into real-world 3D geometries, we must establish a rigorous calibration pipeline.

#### 1. Intrinsic Calibration (Pinhole Model):
Calculates focal length ($f_x, f_y$) and principal points ($c_x, c_y$) using a checkerboard calibration target:
$$K = \\begin{bmatrix} f_x & 0 & c_x \\\\ 0 & f_y & c_y \\\\ 0 & 0 & 1 \\end{bmatrix}$$
Correction for radial distortion (coefficients $k_1, k_2, k_3$) and tangential distortion ($p_1, p_2$):
$$x_{corrected} = x(1 + k_1 r^2 + k_2 r^4 + k_3 r^6) + 2p_1 xy + p_2(r^2 + 2x^2)$$

#### 2. Extrinsic Registration (Camera-to-BIM Alignments):
We register the camera walkthrough trajectory $[R_{cam}|T_{cam}]$ to the BIM global coordinate system.

\`\`\`
  +-------------------------------------------------------------+
  |              1. Intrinsic Checkerboard Calibration          |
  |              Outputs Camera Matrix K and distortion (k, p) |
  +------------------------------+------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |              2. Perspective-n-Point (PnP) Solver            |
  |  Establishes initial 6-DOF camera coordinates [R_cam|T_cam] |
  +------------------------------+------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |               3. Iterative Closest Point (ICP)              |
  | Matches 3D physical scans with virtual IFC CAD models       |
  |                 P_BIM = R * P_scan + T                      |
  +------------------------------+------------------------------+
\`\`\`

* **Features Matcher**: Matches visual keypoints (ORB/SuperPoint) with georeferenced visual anchors on site (e.g. structural survey markers, elevator shafts).
* **Alignment Transformation**:
  $$P_{BIM} = R \\cdot P_{scan} + T$$
  The optimal rotation $R$ and translation $T$ are computed using singular value decomposition (SVD) over matched point clusters, ensuring sub-20mm spatial alignment.`
  },
  {
    id: "occlusion-handling",
    title: "8. Occlusion Handling",
    category: "Tracking & Dewarping",
    iconName: "AlertTriangle",
    content: `### Occlusion & Clutter Handling Spec

Construction sites are cluttered environments. Drywall frames block HVAC ducts, scaffoldings occlude columns, and stacked materials cover slabs.

#### 1. Geometric Raycasting Prior (BIM-guided Occlusion):
Instead of relying solely on visual features, our system queries the virtual IFC CAD model.
* We cast virtual rays from the computed camera location $[X_c, Y_c, Z_c]$ to the target coordinate bounds of a BIM element.
* If a theoretical structural concrete wall is situated between the camera and a water pipe, the raycaster returns a "Blocked" status.
* The 2D detection network is then configured to expect zero visibility for that specific pipe GUID, preventing false-negative logs.

\`\`\`
       [Camera Center Object]
                *
               / \\
              /   \\
             /     \\
            v       \\
     [Drywall Wall]  \\
      (Occulder)      \\
                       v
                 [HVAC Duct]
               (Occulded Element)
\`\`\`
*Raycast detects Drywall blocking the path to the HVAC Duct, flagging the HVAC Duct as mathematically occluded.*

#### 2. Temporal Consistency Logic:
If a cable tray is tracked in frames $F_{t-10}$ to $F_{t}$ and disappears in $F_{t+1}$ due to an intervening scaffold, the tracker does not immediately log a "Delayed" or "Removed" status.
* The system places the element into a **"Temporary Occlusion Buffer"** for a temporal window of 5 seconds (or 10 meters of translational operator movement).
* If the operator passes the scaffold and the tray reappears, the tracker retains the historical ID. If it does not reappear from a visible angle, a physical deficiency alert is generated.`
  },
  {
    id: "small-object-detection",
    title: "9. Small Object Detection",
    category: "Detection & Segmentation",
    iconName: "Search",
    content: `### Small Object Detection Strategy

Small elements like fire sprinklers, cable fittings, and electrical conduit lines constitute a major source of tracking errors because they occupy less than $16 \\times 16$ pixels in high-res panoramic shots.

#### 1. SAHI (Slicing Aided Hyper Inference):
To detect ultra-small objects, we integrate SAHI during the offline processing pipeline.
* Rather than downsampling the high-res 4K Perspective frames (which destroys fine details), SAHI slices the image into overlapping window segments ($512 \\times 512$ px with a $20\\%$ stride overlap).
* Neural inference is run independently on each patch.
* Predictions are mapped back to full-frame dimensions, and bounding boxes are fused using **Non-Maximum Suppression (NMS)** with an Intersection-over-Union (IoU) threshold of $0.45$.

\`\`\`
  +---------------------------------+
  |           Full 4K Perspective Frame           |
  +---------------------------------+
  | [ Slice 1 ]  [ Slice 2 ]  [ Slice 3 ] ...     |
  | [ Slice 4 ]  [ Slice 5 ]  [ Slice 6 ] ...     |
  +---------------------------------+
                |
                v
  [ Independent High-Res Inference ]
                |
                v
  [ Coordinate Remapping & Box Fusion ]
\`\`\`

#### 2. High-Resolution Multi-Scale Feature Maps ($P_2$ Layer):
* Standard object detectors extract final features from $P_3$, $P_4$, and $P_5$ levels (downsampled up to 32x).
* We modify the Neck to include a **$P_2$ prediction layer** (downsampled only 4x from raw input). This preserves the precise spatial location of sprinklers and conduit corners, boosting small object mAP by over $18.5\\%$.`
  },
  {
    id: "model-training",
    title: "10. Model Training Strategy",
    category: "Training & Data",
    iconName: "GitCommit",
    content: `### Model Training & Fine-Tuning Strategy

Our model training workflow follows a three-stage progressive convergence methodology to achieve enterprise reliability.

#### Training Stage Progression:
1. **Stage 1: Self-Supervised Pretraining (DINOv2)**:
   * Backbone networks (HGNetv2/CSPDarknet) are pretrained on **DINOv2** self-supervised representations over a massive general dataset (100M images). This builds robust visual features invariant to physical textures and shadows.
2. **Stage 2: Synthetic Transfer Learning (Omniverse)**:
   * Models are trained on synthetic construction renders with perfect segmentation masks. This instills basic structural geometry associations (e.g. beams are connected to columns).
3. **Stage 3: Fine-Tuning on Annotated Real Site Data**:
   * Fully unfreezes all parameters, training with a low learning rate using the AdamW optimizer:
     $$\\eta(t) = \\eta_{min} + \\frac{1}{2}(\\eta_{max} - \\eta_{min})\\left(1 + \\cos\\left(\\frac{T_{cur}}{T_{max}}\\pi\\right)\\right)$$

\`\`\`
   [DINOv2 Self-Supervised] ---> [Synthetic Transfer Renders] ---> [Fine-Tuning on Site Data]
   (Pre-train Backbone)            (Geometry Associations)          (AdamW Cosine Anneal)
\`\`\`

#### Optimization Parameters:
* **Batch Size**: 64 (distributed over 4x NVIDIA H100 GPUs using PyTorch Distributed Data Parallel).
* **Learning Rate**: $\\eta_{max} = 1\\times 10^{-4}$, decaying to $\\eta_{min} = 1\\times 10^{-6}$ over 150 epochs.
* **Loss Function Weights**:
  $$L_{total} = \\lambda_{cls} L_{cls} + \\lambda_{box} L_{box} + \\lambda_{mask} L_{mask} + \\lambda_{boundary} L_{boundary}$$
  with weights dynamically adapted via homoscedastic uncertainty optimization.`
  },
  {
    id: "annotation-strategy",
    title: "11. Annotation Strategy",
    category: "Training & Data",
    iconName: "CheckCircle",
    content: `### Annotation & Quality Control Pipeline

High-quality models require pristine ground-truth label definitions. We implement a semi-automated, multi-stage labeling workflow.

#### 1. Semi-Automated Auto-Labeling Loop:
1. **Foundation Segment Ingress**: Pass raw frames through **SAM 2 (Segment Anything 2)** using loose bounding boxes generated by early YOLO iterations.
2. **Auto-Polygon Generation**: SAM 2 outputs detailed boundary polygons, reducing human annotator effort by over $80\\%$.
3. **Manual Human Auditing**: Specialized annotators verify, adjust, and correct misaligned vertices.
4. **BIM Guid Linkage**: Annotators associate predicted elements with corresponding IFC GUID metadata schemas.

\`\`\`
  +------------------+     +------------------+     +------------------+
  |    Raw Frame     | --> | Early YOLO Box   | --> |   SAM 2 Polygon  |
  +------------------+     +------------------+     +--------+---------+
                                                             |
                                                             v
  +------------------+     +------------------+     +------------------+
  |   Dataset Sync   | <-- |   BIM GUID Match | <-- |  Human Revision  |
  +------------------+     +------------------+     +------------------+
\`\`\`

#### 2. Quality Control (Inter-Annotator Agreement):
* Every frame in our calibration dataset is validated by two independent labeling specialists.
* We compute the Intersection over Union (IoU) of their annotated polygons.
* If the polygon agreement score is $\\text{IoU} < 0.85$, the frame is automatically routed to a Senior Computer Vision Engineer for resolution.`
  },
  {
    id: "dataset-requirements",
    title: "12. Dataset Requirements",
    category: "Training & Data",
    iconName: "Database",
    content: `### Dataset & Class Requirements

To guarantee high model accuracy across various environments, the database must contain rich, balanced class distributions.

#### Class Distribution & Volume Targets:
Our target dataset comprises **100,000 annotated images** distributed across the 12 construction elements:

| Element Class | Required Annotations | Preferred Sourcing | Background Contexts |
| :--- | :--- | :--- | :--- |
| **Walls** | 150,000 instances | Real site sweeps (drywall & concrete) | Framed, boarded, primed, painted |
| **Columns & Beams**| 80,000 instances | Hybrid (real + synthetic CAD renders) | Raw rebar grids, cast concrete, steel |
| **HVAC Ducts** | 60,000 instances | Real site walkthroughs | Exposed ceilings, cluttered utility corridors |
| **Pipes** | 120,000 instances | Real site scans | Copper, PVC, CPVC sprinkler, insulated |
| **Conduits** | 200,000 instances | Real site scans (SAHI slices) | Concrete-embedded, surface-mounted |
| **Sprinklers & Fixtures**| 45,000 instances | Synthetic expansion models | Suspended ceiling arrays, industrial |

#### Domain Sourcing Distribution:
* **70% Real Construction Sites**: Walkthroughs of commercial towers, residential developments, and airport terminals.
* **20% Synthetic Renders**: Generated inside NVIDIA Omniverse using imported project BIM IFC models with randomized textures, dust particles, and lightning environments.
* **10% Laboratory Sweeps**: Custom test-bench rigs of dense MEP configurations.`
  },
  {
    id: "label-structure",
    title: "13. Label Structure",
    category: "Training & Data",
    iconName: "GitBranch",
    content: `### Label Structure & Formats

To ensure compatibility across PyTorch training frameworks and BIM databases, label outputs are exported in a geo-referenced COCO-compliant JSON format.

#### Label Schema Instance Example:
\`\`\`json
{
  "image_metadata": {
    "image_id": 98231,
    "file_name": "mumbai_b3_week4_perspective_01.jpg",
    "width": 1024,
    "height": 1024,
    "camera_pose": {
      "translation": [142.3, 982.1, 45.2],
      "rotation_matrix": [[0.976, -0.216, 0.0], [0.216, 0.976, 0.0], [0.0, 0.0, 1.0]]
    }
  },
  "annotations": [
    {
      "id": 10043,
      "category_id": 8,
      "category_name": "HVAC_Duct",
      "bbox": [152.0, 310.5, 340.0, 85.0],
      "segmentation": [
        [152.0, 310.5, 492.0, 310.5, 492.0, 395.5, 152.0, 395.5]
      ],
      "bim_metadata": {
        "ifc_guid": "3b8s92jaK29s1A8dzLpwQ1",
        "system_association": "Supply_Air_L1",
        "material_spec": "Galvanized_Steel_0.8mm"
      }
    }
  ]
}
\`\`\`

#### Key Mapping Identifiers:
* \`category_id\`: Identifies the object within the 12 primary classes.
* \`ifc_guid\`: Connects the 2D pixel prediction to its digital twin element inside the core PostgreSQL database.`
  },
  {
    id: "data-augmentation",
    title: "14. Data Augmentation Techniques",
    category: "Training & Data",
    iconName: "Sliders",
    content: `### Advanced Data Augmentation Spec

Construction sites exhibit dynamic, challenging environmental conditions. Standard augmentations (rotation, scaling) are insufficient to build robust networks.

#### Specialized Augmentations:
1. **MEP Copy-Paste (Class Balancing)**:
   * Pipes, conduits, and fire sprinklers have low pixel densities and occur in specific locations.
   * We extract high-fidelity pipe segments from labeled images and "paste" them onto random images of unfinished walls or concrete slabs, following structural layout rules.
   * This maintains a balanced representation of sparse objects across all training epochs.
2. **Atmospheric Dust & Fog Simulation**:
   * Construction sites are dusty, especially during grinding and core cutting.
   * We apply synthetic atmospheric haze using a randomized Perlin Noise density overlay:
     $$I_{augmented} = I \\cdot (1 - \\alpha) + A \\cdot \\alpha$$
   * This models air quality degradation, ensuring models don't fail when active construction kicks up dust.
3. **Halogen Flare & Glare Emulation**:
   * Simulates high-intensity spotlights bouncing off metallic HVAC ducts, which often cause over-exposure.
   * Adds virtual radial Gaussian light bursts at random coordinates on galvanized steel textures.

\`\`\`
   +-----------------------+     +-----------------------+
   |      Raw Input        |     |   Copy-Paste MEP      |
   | (Clean concrete slab) | --> |  (Adds sparse pipes   |
   +-----------------------+     |   onto concrete)      |
                                 +-----------+-----------+
                                             |
   +-----------------------+                 v
   |   Final Augmented     |     +-----------------------+
   | (Ready for PyTorch)   | <-- |   Perlin Dust Fog     |
   +-----------------------+     |  (Atmospheric haze)   |
                                 +-----------------------+
\`\`\``
  },
  {
    id: "evaluation-metrics",
    title: "15. Evaluation Metrics",
    category: "Evaluation & Deploy",
    iconName: "CheckCircle",
    content: `### Evaluation Metrics & Validation Benchmarks

Our model evaluation framework employs standard COCO metrics, with specialized geometric constraints for site tracking.

#### 1. Core Neural Metrics:
* **Mean Average Precision (mAP)**: Evaluated at standard thresholds:
  * **$\\text{mAP}_{50}$**: Evaluated at $50\\%$ Intersection-over-Union (IoU) to assess general classification accuracy.
  * **$\\text{mAP}_{50:95}$**: Averaged over IoU thresholds from $50\\%$ to $95\\%$ with a $5\\%$ step, validating accurate spatial contours.
* **Precision & Recall Curves**: Calibrated class-by-class.
* **Intersection over Union (IoU)**: Validated for instance segmentation masks:
  $$\\text{IoU} = \\frac{|A \\cap B|}{|A \\cup B|}$$

#### 2. Site Tracking Metrics:
* **MOTA (Multi-Object Tracking Accuracy)**: Measures tracking precision across consecutive video frames:
  $$\\text{MOTA} = 1 - \\frac{\\sum (FN_t + FP_t + IDSW_t)}{\\sum GT_t}$$
  where $FN$ is false negatives, $FP$ is false positives, and $IDSW$ is identity switches (when a pipe ID switches mid-walkthrough).
* **Physical Alignment Margin**: Measured in millimeters. Evaluates the physical distance between predicted segmented elements and their CAD BIM model coordinates after Iterative Closest Point alignment (Target: $< 25$mm).`
  },
  {
    id: "inference-pipeline",
    title: "16. Inference Pipeline",
    category: "Evaluation & Deploy",
    iconName: "Play",
    content: `### Inference Pipeline & Runtime Optimization

To process hours of site video, the inference pipeline is optimized to minimize latency and maximize GPU throughput.

\`\`\`
   +------------------+
   | Raw 4K Video Slices
   +--------+---------+
            |
            v
   +--------+---------+
   |  TensorRT Engine | <--- Quantization: FP16 / INT8
   |  (Parallel CUDA) |      using Calibration Cache
   +--------+---------+
            |
            v
   +--------+---------+
   | Shared GPU Cache | <--- Enqueue batch size: 16
   | (Pinned Memory)  |
   +--------+---------+
            |
            v
   +--------+---------+
   | Parallel Decoders|
   +------------------+
\`\`\`

#### Optimized Pipeline Stages:
1. **Model Compilation (TensorRT)**:
   * PyTorch \`.pth\` model weights are exported to standard ONNX intermediate files.
   * ONNX configurations are compiled into specialized **NVIDIA TensorRT** execution engines (\`.engine\`).
   * This optimizes layer fusion, eliminating redundant memory write-backs between layers.
2. **Quantization Strategy**:
   * **FP16 Execution**: Run by default for complex segmentation tasks, yielding a $2\\text{x}$ throughput increase with negligible accuracy loss.
   * **INT8 Quantization**: Used for rapid object classification, utilizing a representative calibration dataset to adjust scales and clipping parameters, achieving up to $3.8\\text{x}$ throughput improvements.
3. **Dynamic Frame Batching**:
   * Standardizes input buffers to batch size $B = 16$.
   * Utilizes GPU Pinned Memory (\`cudaHostAlloc\`) to bypass standard host-to-device memory copy bottlenecks.`
  },
  {
    id: "gpu-requirements",
    title: "17. Compute & GPU Infrastructure Requirements",
    category: "Evaluation & Deploy",
    iconName: "Cpu",
    content: `### Compute & GPU Infrastructure Requirements

Bulk video processing is highly memory and compute-intensive. The infrastructure is scaled using AWS EC2 instance tiers.

#### Hardware Selection Profiles:

| Processing Profile | Target Instance | Core Compute Specs | Cost / Speed Tradeoff |
| :--- | :--- | :--- | :--- |
| **Standard Stream** | **AWS g5.4xlarge** | 1x NVIDIA A10G (24GB VRAM), 16 vCPUs, 64GB RAM | Cost-optimized for standard single-tower walkthrough videos. |
| **Bulk Parallel Batch** | **AWS g5.12xlarge** | 4x NVIDIA A10G (96GB total VRAM), 48 vCPUs, 192GB RAM | High-throughput cluster for multi-zone simultaneous uploads. |
| **Model Re-training** | **AWS p4de.24xlarge** | 8x NVIDIA A100 (640GB total VRAM), 96 vCPUs, 1.1TB RAM | Reserved for monthly active learning model fine-tuning runs. |

#### VRAM Allocation Budget (Per A10G Instance):
* **Model Loader Memory (YOLOv11-seg + RT-DETR)**: 8.5 GB
* **Feature Maps & Frame Batch Buffers (Batch 16)**: 6.2 GB
* **SLAM Tracking & Point Cloud Solver (Open3D)**: 4.8 GB
* **System Overhead**: 2.5 GB
* **Total Allocation**: 22.0 GB / 24 GB`
  },
  {
    id: "folder-structure",
    title: "18. Folder Structure & Monorepo Spec",
    category: "Evaluation & Deploy",
    iconName: "Layers",
    content: `### Python Computer Vision Service Layout

The AI pipelines are organized in a clean, modular structure inside the \`cv-worker\` monorepo workspace.

\`\`\`
/apps/cv-worker
├── api/                           # API Ingress & REST Controllers
│   ├── routes.py                  # Ingress endpoint triggers
│   └── websocket.py               # Live telemetry logs stream
├── core/                          # Deep Learning Implementations
│   ├── model_loader.py            # TensorRT engine loader
│   ├── object_detector.py         # RT-DETR custom box parser
│   └── inst_segmenter.py          # YOLOv11 Decoupled ProtoNet head
├── dewarp/                        # Spherical Dewarping Solvers
│   ├── gnomonic.py                # Equirectangular-to-Perspective math
│   └── optical_flow.py            # Keyframe blur filters
├── tracking/                      # Spatio-Temporal Trackers
│   ├── byte_track.py              # Kalman low-score associations
│   └── coordinate_map.py          # Camera-to-BIM PnP / ICP matrix solvers
├── config.py                      # CUDA parameters & S3 keys
├── Dockerfile                     # CUDA-12.2 backed deployment setup
└── requirements.txt               # Pin dependencies (torch, opencv, tensorrt)
\`\`\`

#### Code Design Principles:
1. **High Modularity**: The \`dewarp\` engine is separated from the \`core\` model loaders, allowing independent CPU/GPU task scaling.
2. **Explicit Type Enforcements**: Strict execution of Python Type Hints, validating numpy/tensor structures before moving to CUDA arrays.`
  },
  {
    id: "api-design",
    title: "19. API Design (FastAPI / gRPC)",
    category: "Evaluation & Deploy",
    iconName: "Network",
    content: `### API Design & Data Exchange Specifications

The Python CV service exposes a series of REST APIs and gRPC services to communicate processing states with the NestJS gateway.

#### 1. Ingest Video Endpoint:
* **Route**: \`POST /api/v1/cv/process-walkthrough\`
* **Content-Type**: \`application/json\`

##### Request Payload:
\`\`json
{
  "project_id": "proj-98231-mumbai",
  "walkthrough_id": "walk-009-week4",
  "s3_video_key": "raw-videos/mumbai/b3/week4_walkthrough.mp4",
  "ifc_model_guid": "model-rev4-structural",
  "parameters": {
    "target_fps": 1.5,
    "sahi_slicing": true,
    "quantization": "FP16"
  }
}
\`\`

##### Immediate Response (Async Job Accepted):
\`\`json
{
  "job_id": "cv-job-88231-92aa",
  "status": "queued",
  "estimated_processing_seconds": 450,
  "submitted_at": "2026-07-09T12:54:10Z"
}
\`\`

#### 2. Websocket Log Stream:
* **Route**: \`WS /api/v1/cv/logs/{job_id}\`
* **Message Payload**:
  \`\`json
  {
    "timestamp": "2026-07-09T12:55:02Z",
    "level": "INFO",
    "step": "inference",
    "progress_percent": 35.5,
    "log": "[FastAPI] Computed YOLOv11 instance segmentation masks for Slice 42. Detected 12 Pipes, 4 HVAC Ducts"
  }
  \`\``
  },
  {
    id: "deployment-architecture",
    title: "20. Deployment Architecture",
    category: "Evaluation & Deploy",
    iconName: "Compass",
    content: `### Deployment Topology & Infrastructure

Our AI models are served using dedicated, scalable Triton Inference Servers running on Amazon EKS.

\`\`\`
   +-------------------------------------------------------------+
   |                     S3 Video Upload Event                   |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                      AWS API Gateway                        |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                 Triton Inference Server (EKS)               |
   |           - Manages CUDA layers, tensor batches             |
   |           - Auto-scales based on active job queues          |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                     Core PostgreSQL / DB                    |
   |                  - Relational schema updates                |
   |                  - WebSocket progress dispatch              |
   +-------------------------------------------------------------+
\`\`\`

#### Scalable Deployment Principles:
1. **Triton Inference Engine**:
   * Standardizes deployment formats by loading compiled \`.engine\` TensorRT models.
   * Handles multi-model orchestration, allowing YOLOv11 and RT-DETR to share GPU memory dynamically via thread pools.
2. **Karpenter Autoscaling**:
   * Triggers EKS cluster expansion using Karpenter.
   * If Redis indicates a spike in \`survey-ingest-queue\` depth, Karpenter provisions a new GPU spot instance in under 45 seconds, processing peaks in parallel without over-allocating baseline budgets.`
  },
  {
    id: "scalability-considerations",
    title: "21. Scalability Considerations",
    category: "Evaluation & Deploy",
    iconName: "Sliders",
    content: `### Scalability & Data Retention Policies

Handling massive 4K site videos demands deliberate data-retention and memory pruning mechanisms to prevent memory leaks and billing overruns.

#### 1. Lifecycle Data Management:
* **Raw Video Retention (S3)**: Deleted 72 hours after successful processing, saving thousands of dollars in high-volume deep storage costs.
* **Extracted Keyframes Cache**: Stored in standard low-cost Amazon S3 Infrequent Access (IA) categories for 30 days to facilitate potential reprocessing or human-annotator feedback loops, then automatically purged.
* **Extracted Polygons and Guids Metadata**: Maintained permanently inside PostgreSQL as lightweight database rows, taking up minimal disk space.

#### 2. Memory Pruning on Ingress Nodes:
* PyTorch execution environments are configured to release inactive CUDA memory blocks after every completed video slice processing run:
  \`\`python
  import torch
  torch.cuda.empty_cache()
  \`\`
* Deletes intermediary optical flow frames from memory immediately after computing the respective displacement vectors, preventing system RAM crashes.`
  },
  {
    id: "future-improvements",
    title: "22. Future Improvements",
    category: "Evaluation & Deploy",
    iconName: "ShieldCheck",
    content: `### Future Improvements & Research Directions

The platform is designed with future upgrades in mind, facilitating integration with bleeding-edge spatial research.

#### 💡 1. 3D Gaussian Splatting Integration:
* Rather than simple 2D keyframe matching, future iterations will process walkthrough videos to generate dense **3D Gaussian Splats** of active construction zones.
* This will allow sub-millimeter volume calculation of complex concrete structures and immediate recognition of micro-discrepancies that 2D cameras miss.

#### 🧠 2. Multimodal Vision-Language Models (VLM):
* Integrates visual-language models (such as Gemini 2.5 Flash) over the spatial coordinates.
* This will enable site engineers to query the walkthrough database in natural language:
  * *\"Show me all fire sprinklers installed near HVAC branches on Level 1\"*
  * *\"Highlight any electrical boxes exposed to direct moisture zones\"*
* The VLM translates natural queries into corresponding database GUID filters and 3D camera viewpoints instantly.`
  }
];
