# Buildots System Architecture & Technical Reverse Engineering Blueprint
**Author:** Former Founding Engineer / Principal Construction Technology Architect  
**Classification:** Deep-Dive System Analysis & Reverse-Engineering Specification  
**Target Audience:** Principal Architects & AI Research Engineers  

---

## 1. Executive Summary & Core Platform Thesis

Buildots revolutionized construction technology by treating physical job sites as structured databases. Instead of relying on manual checklists or point-in-time photograph captures, the platform converts 360° helmet walkthrough footage into continuous, validated physical progress tracking linked directly to BIM (Building Information Modeling) and schedule baselines.

This document reverse-engineers the technical anatomy of Buildots, breaking down the services, ML pipelines, data stores, and integration strategies that power the system.

```
                         [ 360° Helmet Camera Walkthrough ]
                                         |
                                         v
                      +--------------------------------------+
                      |    GoPro / Garmin Video Upload       |
                      +------------------+-------------------+
                                         |
                                         v
                      +--------------------------------------+
                      | Ingestion & Frame Decimation Service |
                      +------------------+-------------------+
                                         |
                        +----------------+----------------+
                        |                                 |
                        v                                 v
         +-----------------------------+   +-----------------------------+
         | Visual Odometry & SLAM      |   | Object Detection (YOLO/Res) |
         | (Trajectory Reconstruction) |   | (MEP, Drywall, Outlets)     |
         +--------------+--------------+   +--------------+--------------+
                        |                                 |
                        +----------------+----------------+
                                         |
                                         v
                      +--------------------------------------+
                      |      Colored ICP & BIM Align         |
                      |   (Spatial Synchronization Engine)   |
                      +------------------+-------------------+
                                         |
                                         v
                      +--------------------------------------+
                      |  Progress Analytics & schedule Sync  |
                      |   (Primavera P6 / Procore Sync)      |
                      +--------------------------------------+
```

---

## 2. Infrastructure & Ingestion Layer

### 2.1 Multipart Video Ingestion Engine
* **The Workflow:** Walkthroughs are captured via helmet-mounted 360° video cameras (e.g., GoPro Max, Garmin VIRB 360) operating at 5.7K/4K resolutions. Operators upload these heavy files (often 10GB–50GB per walk) via a custom local upload tool or directly through a web portal.
* **Technology Stack (Educated Assumption):** Built in **Golang** for high concurrency. Uses chunked multipart parallel uploads directly to cloud storage (AWS S3) using presigned URLs.
* **Key Optimization:** Network connection losses are common on site offices. The ingest client implements aggressive chunk retries and MD5 checksum validation to prevent file corruption.

### 2.2 Frame Decimation & Extraction Pipeline
* **The Problem:** Processing every single frame of a 30 FPS 4K video is mathematically redundant and computationally prohibitive, running up massive GPU bills.
* **The Solution:** An adaptive decimation service. It utilizes **FFmpeg** bindings and an optical flow estimation algorithm (e.g., Farneback or deep-learned FlowNet2) to measure relative motion between frames.
* **Mechanism:** Frames with heavy motion blur or angular rotational velocities above a designated threshold are pruned. Keyframes are selected only when the camera has traveled at least 0.5 meters linearly or rotated 15 degrees from the previous keyframe. This reduces total frame volume by **85-90%** while retaining spatial integrity.

---

## 3. Computer Vision & Machine Learning Pipeline

The machine learning architecture is divided into two parallel workloads: **Spatial Reconstruction (Where is the camera?)** and **Semantic Parsing (What is in the frame?)**.

```
+---------------------------------------------------------------------------------+
|                               Video Processing Pipeline                         |
+---------------------------------------------------------------------------------+
                                         |
                                         v
                            +--------------------------+
                            |     Input Video Stream   |
                            +------------+-------------+
                                         |
                       +-----------------+-----------------+
                       v                                   v
          +--------------------------+        +--------------------------+
          |  Spatial Reconstruction  |        |    Semantic Parsing      |
          |  - SLAM / SfM            |        |  - Object Detection      |
          |  - Camera Trajectory     |        |  - Instance Segmentation |
          +------------+-------------+        +------------+-------------+
                       |                                   |
                       +-----------------+-----------------+
                                         |
                                         v
                            +--------------------------+
                            | Spatial-Semantic Align   |
                            | - Match Cloud with BIM   |
                            +--------------------------+
```

### 3.1 Spatial Reconstruction (SLAM & SfM)
* **Objective:** Construct a continuous, drift-free camera trajectory through a dynamic, often repetitive indoor environment (corridors, concrete cores).
* **Confirmed Public Info / Patents:** Buildots uses robust visual features to track location.
* **Deep Architecture (Educated Assumption):** A hybrid visual-inertial SLAM system (similar to ORB-SLAM3 or Kimera). It matches visual feature descriptors across frames (SuperPoint or SIFT) and optimizes camera poses via a Factor Graph containing visual and IMU factors.
* **Loop Closure:** When an operator crosses an intersection previously walked, the system detects a loop closure, redistributes the cumulative drift error across the trajectory graph, and locks coordinates.

### 3.2 Spatial-Semantic Alignment (Colored ICP)
* **Objective:** Align the camera's visual trajectory cloud to the absolute coordinate system of the BIM model (IFC/Revit coordinates).
* **Engineering Workflow:** 
  1. The BIM model is converted into an occupancy grid or a reference mesh.
  2. Structural landmarks (concrete columns, shear walls, elevator shafts) are extracted from both the visual point cloud (using semantic segmentation) and the BIM model.
  3. A global alignment step (e.g., FPFH RANSAC) performs rough positioning.
  4. An Iterative Closest Point (ICP) or Generalized ICP (G-ICP) algorithm refines the alignment down to millimeter precision.

### 3.3 Semantic Asset Classification & Verification
* **Objective:** Detect construction elements, classify their current installation state (not started, in-progress, completed, defective), and flag deviations.
* **Core Model Architectures:**
  * **Drywall & Framing:** Mask R-CNN or YOLOv8/YOLO11-segmentation networks identifying individual drywall sheets, joints, and plaster lines.
  * **Electrical & MEP:** Tiny object detection heads focusing on electrical boxes, conduit lines, fire sprinklers, and HVAC damper handles.
* **Loss Function Formulation:** Uses a multi-task loss function to optimize bounding-box regression, class probability, and segmentation mask boundaries concurrently:
  $$\mathcal{L}_{\text{total}} = \lambda_{\text{box}} \mathcal{L}_{\text{CIoU}} + \lambda_{\text{class}} \mathcal{L}_{\text{Focal}} + \lambda_{\text{mask}} \mathcal{L}_{\text{Dice}}$$

---

## 4. BIM & Geometry Engine

BIM models are notoriously heavy, sometimes exceeding several gigabytes in Revit formats. Storing and rendering these models inside a web dashboard requires extensive parsing and decimation.

```
       +---------------------------------------------------------------------------------+
       |                              BIM Parsing Pipeline                               |
       +---------------------------------------+-----------------------------------------+
                                               |
                                               v
                                  +--------------------------+
                                  |    Raw Revit / IFC Model |
                                  +------------+-------------+
                                               |
                                               v
                                  +--------------------------+
                                  |  BIM-Service (C++ Parser)|
                                  +------------+-------------+
                                               |
                        +----------------------+----------------------+
                        |                                             |
                        v                                             v
          +--------------------------+                  +--------------------------+
          | JSON Spatial Hierarchy   |                  | Decimated WebGL Mesh     |
          | (Levels, Zones, Rooms)   |                  | (gLTF / USDZ formats)    |
          +--------------------------+                  +--------------------------+
```

### 4.1 Parser Architecture (Educated Assumption)
* **Technology Stack:** A background parser built in C++ or Rust using open-source libraries like **IFCOpenShell** or Autodesk Platform Services (APS - formerly Forge).
* **Output Outputs:**
  1. **A flat JSON Spatial Hierarchy:** Maps Parent-Child relationships (`Building` -> `Floor` -> `Zone` -> `Room` -> `Element_GUID`).
  2. **Decimated 3D Mesh Assets:** Compresses dense 3D geometry into highly optimized, web-ready **gLTF/GLB** or custom SVF formats. It strips secondary metadata from visual elements (e.g., manufacturer specs) to ensure rapid loading in the browser.

### 4.2 Web Rendering Engine
* **Technology Stack:** Built using WebGL wrapper libraries (Three.js or React Three Fiber).
* **Optimization Strategy:** Implements **Occlusion Culling** (hides rooms behind walls) and **Level of Detail (LoD)** mesh scaling. If an element is far from the current camera frustum, a simplified geometry representation is rendered, saving browser memory.

---

## 5. Scheduling, ERP & Commercial Integrations

### 5.1 Schedule Integration (Primavera P6 & MS Project)
* **Workflow:** Schedule planners maintain master schedules in Primavera P6. Buildots imports these schedules (typically via XML or XER files) and links schedule activities with specific BIM elements.
* **Critical Path Analysis:** On each walk evaluation, the actual physical completion percentage is calculated per element. These updates are aggregated to calculate active delay forecasting and Critical Path impacts, which are reported back to project managers.

### 5.2 ERP & Commercial Valuations
* **The Workflow:** Construction companies use SAP or Oracle ERPs to manage payments and progressive billing certifications (Bill of Quantities - BoQ).
* **The Integration:** Verified physical progress data is exported as an XML/JSON payload, feeding ERP billing modules directly. This automates the validation of subcontractor progress claims, dramatically reducing billing disputes.

---

## 6. Technical Stack Breakdown

Based on industry standards and public technical indicators, Buildots' backend is designed around a modern cloud-native system:

* **Frontend:** React.js, Tailwind CSS, TypeScript, Three.js (WebGL rendering).
* **Backend Services:** Golang (for performance-critical services), Python (Django/FastAPI for machine learning orchestration), C++/Rust (high-performance geometry parsing).
* **Database Systems:**
  * **Relational Database:** AWS Aurora PostgreSQL (stores transactional states, schedule nodes, project metadata).
  * **Vector / Spatial Search:** OpenSearch (for rapid text and spatial coordinate lookups).
  * **Cache:** Redis Cluster (handles user sessions, transient dashboard caching, and task queues).
* **Message Bus / Event Stream:** Apache Kafka or RabbitMQ (for orchestrating high-throughput pipeline actions asynchronously).
* **Deployment & Orchestration:** Docker containers deployed across AWS Elastic Kubernetes Service (EKS) utilizing GPU node groups (NVIDIA T4/A10G).

---

## 7. Comparative Assessment: TracProgress vs. Buildots

### TracProgress Strategic Differentiation:
While Buildots possesses a mature spatial alignment pipeline, **TracProgress holds a massive competitive advantage in Generative AI workflows and modern system accessibility**:

1. **Generative VLM Audits (Gemini 2.0 Integration):** TracProgress leverages Google's state-of-the-art Gemini SDK to automate RFI drafts, punch lists, and subcontractor notifications directly from visual defect captures—a feature requiring manual engineer coordination in legacy Buildots setups.
2. **Dynamic 3D Gaussian Splatting:** Unlike static photogrammetric point clouds, TracProgress integrates real-time Gaussian Splatting, delivering photorealistic, continuous 3D walkthrough rendering that loads rapidly in standard client browsers.
3. **Open API First Architecture:** TracProgress exposes an enterprise REST/gRPC API gateway out-of-the-box, allowing external developers to build custom integrations easily, whereas Buildots runs as a closed enterprise platform.
