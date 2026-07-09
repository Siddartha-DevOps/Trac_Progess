export interface ArchSection {
  id: string;
  title: string;
  category: "Overview" | "System Components" | "Pipelines & Workflows" | "Infrastructure & Ops" | "Folder & Repo Specs";
  iconName: string;
  content: string;
}

export const ARCHITECTURE_SECTIONS: ArchSection[] = [
  {
    id: "overall-architecture",
    title: "1. Overall System Architecture",
    category: "Overview",
    iconName: "Network",
    content: `### High-Level System Architecture

The platform is designed as a **decoupled, event-driven microservices architecture** optimized for compute-heavy spatial photogrammetry processing and high-fidelity enterprise 3D CAD visualization.

\`\`\`
                     +---------------------------------------+
                     |         Web Client (Next.js)          |
                     |  - React Three Fiber / Three.js       |
                     |  - Tailwind CSS / Shadcn / TS         |
                     +-------------------+-------------------+
                                         |
                                (REST & WebSockets)
                                         |
                                         v
                     +-------------------+-------------------+
                     |       NestJS API Gateway / Core       |
                     |  - Rate Limiting / Guard Auth         |
                     |  - Prisma ORM / PostgreSQL            |
                     +---------+-------------------+---------+
                               |                   |
                     (Push Job / Redis)     (BIM Metadata)
                               |                   |
                               v                   v
                     +---------+-------+   +-------+---------+
                     |  BullMQ / Redis |   | Autodesk APS /  |
                     |  Task Queue     |   | IFC.js Parser   |
                     +---------+-------+   +-----------------+
                               |
                        (Job Pull)
                               |
                               v
                     +---------+-------------------+
                     |  Python / FastAPI AI Workers|
                     |  - PyTorch & YOLOv11        |
                     |  - OpenCV & SAM             |
                     |  - Open3D Point Clouds      |
                     +-----------------------------+
\`\`\`

#### Architectural Paradigms:
1. **Asynchronous Compute Decoupling**: Drone video files or helmet 360-degree footage are highly volumetric. The ingestion is synchronous, but the heavy extraction, keyframe matching, photogrammetry stitching, and neural inference are executed asynchronously via a resilient task queue model managed by Redis and BullMQ.
2. **Federated Common Data Environment (CDE)**: BIM models represent the "Ground Truth". The architecture continuously compares real-time, computer-vision segmented physical geometries against theoretical IFC (Industry Foundation Classes) objects, logging the differences inside a central PostgreSQL schema.
3. **Multi-Region Localized Data Residency**: To comply with the Indian RERA (Real Estate Regulatory Authority) guidelines and global data protection standards, data storage (AWS S3 and PostgreSQL) is structured with strict region-pinning to prevent raw construction site coordinates and proprietary project files from crossing national borders.`
  },
  {
    id: "technology-selection",
    title: "2. Technology Stack Rationale",
    category: "Overview",
    iconName: "CheckSquare",
    content: `### Why Each Technology Was Selected

| Technology | Selection Rationale | Core Benefits |
| :--- | :--- | :--- |
| **Next.js / React** | Server-Side Rendering (SSR) for blazing-fast initial load of the analytics dashboard, paired with client-side SPA capabilities for heavy 3D visualizations. | SEO indexing for marketing portals, high modularity, powerful state hydration, and rich component ecosystem. |
| **NestJS** | Highly opinionated enterprise Node.js framework that implements TypeScript natively. Out-of-the-box dependency injection and modular structure. | Guarantees code maintainability across distributed developer squads. Native integration with RxJS, microservices protocols, and guards. |
| **PostgreSQL & Prisma** | Reliable relational engine with stellar ACID compliance and unmatched geospatial indexing capabilities via PostGIS. | Prisma provides end-to-end type safety, automated migration generating, and highly intuitive declarative schema building. |
| **Redis & BullMQ** | Redis is a lightning-fast, in-memory data store. BullMQ is a distributed, robust message queue library built on Redis. | Prevents API Gateway blockages by handling task retries, back-off mechanisms, rate-limiting, and microservice pub-sub events. |
| **Python & FastAPI** | Python is the undisputed industry leader for computer vision and ML libraries. FastAPI provides an asynchronous, incredibly rapid web shell. | Auto-generated OpenAPI (Swagger) specs, Pydantic data validation, and ultra-low latency execution suitable for high-throughput image ingest. |
| **PyTorch & OpenCV** | PyTorch is highly flexible for custom layer design and neural pipeline execution. OpenCV provides industrial-grade image pre-processing. | Maximum performance on CUDA-enabled GPU clusters, modular data loading, and optimized matrix transformations. |
| **Autodesk APS & IFC.js** | Autodesk Platform Services (APS) is standard for Revit federated files. IFC.js provides native, lightweight client-side IFC parser capabilities. | Allows seamless 3D rendering without requiring proprietary CAD workstations. Fast rendering of multi-gigabyte models in pure WebGL. |`
  },
  {
    id: "system-responsibilities",
    title: "3. Service Responsibilities",
    category: "System Components",
    iconName: "Activity",
    content: `### Separation of Concerns & Service Responsibilities

#### 1. Frontend Client (Next.js / React Three Fiber)
* **High-Fidelity 3D Interface**: Renders the digital twin (aligned point clouds and IFC CAD elements) inside WebGL canvas.
* **Telemetry Dashboarding**: Displays real-time gantt schedules, computed completion charts, and active discrepancies.
* **Authentication Hydration**: Manages secure session cookies and tokens, ensuring secure context routing.

#### 2. Core Backend (NestJS / Prisma)
* **Metadata Master**: Orchestrates the storage of schedules, user roles, billing, and system audit logs.
* **Queue Dispatcher**: Receives video upload completion events, calculates job priority, and dispatches them into BullMQ.
* **BIM Metadata Aggregator**: Exposes JSON parsed endpoints of IFC files, linking GUIDs with temporal database records.

#### 3. AI / Computer Vision Microservice (Python / FastAPI)
* **Frame Extraction Engine**: Runs adaptive keyframing to eliminate blurry, redundant, and dark video segments.
* **Neural Object Detector**: Identifies electrical boxes, drywall frames, reinforcement steel grids, and mechanical pipe fittings.
* **Alignment Solver**: Executes Iterative Closest Point (ICP) algorithms to match drone points with coordinate grids.

#### 4. Redis Key-Value Store
* **Session Cache**: Accelerates JWT validations and enterprise permissions lookups.
* **BullMQ Backing Broker**: Manages state machines of active, paused, delayed, and completed video analysis jobs.
* **WebSockets Pub/Sub**: Routes progress updates from backend processing pipelines back to specific web clients in real-time.`
  },
  {
    id: "communications-flow",
    title: "4. Cross-Service Communication Map",
    category: "System Components",
    iconName: "Send",
    content: `### Cross-Service Communication Protocols

The platform operates on a **hybrid communication protocol** model based on the latency, durability, and bandwidth requirements of each integration point:

\`\`\`
  +------------------+                   +--------------------+
  |  Frontend Client | <== WebSockets == | Core NestJS Backend|
  +--------+---------+                   +---------+----------+
           |                                       |
          REST                                  BullMQ
           v                                       v
  +--------+---------+                   +---------+----------+
  | Autodesk Viewer  |                   | Redis Task Broker  |
  +------------------+                   +---------+----------+
                                                   |
                                                 gRPC
                                                   v
                                         +---------+----------+
                                         | AI Python Workers  |
                                         +--------------------+
\`\`\`

#### 1. Client to Core Backend (REST & WebSockets)
* **Querying / State Updates**: standard stateless HTTPS REST API with TLS 1.3 encryption.
* **Real-time Pipeline Logs**: Secure WebSockets (\`wss://\`) connection. Provides a live telemetry stream during drone orthophoto processing, eliminating aggressive polling.

#### 2. Core Backend to AI Workers (Redis / BullMQ & gRPC)
* **Job Ingestion (Async)**: NestJS pushes a task object payload containing AWS S3 image paths to a high-priority BullMQ Redis partition.
* **Synchronous Heavy RPC Querying (Internal)**: For sub-millisecond, low-overhead inter-service communication (e.g., querying feature extraction maps), services use **gRPC over HTTP/2** with protocol buffer definitions.

#### 3. BIM Coordinate Synchronizers (Autodesk APS & Custom Parsers)
* The Autodesk Platform Services Viewer runs on direct secure OAuth client credentials. Large binary vector files are converted into SVF2 geometries served directly via Autodesk CDNs, while metadata is mirrored via Webhook-driven delta sync.`
  },
  {
    id: "api-endpoints",
    title: "5. Production API Design",
    category: "System Components",
    iconName: "Code",
    content: `### Production API Endpoint Specifications

All API responses strictly adhere to the standardized **JSON:API** schema specification. Below are the critical enterprise endpoints:

#### 1. Video Upload Ingestion Pipeline
* **POST** \`/api/v1/projects/:projectId/ingest\`
* **Headers**: \`Authorization: Bearer <token>\`, \`Content-Type: application/json\`
* **Payload Request**:
\`\`\`json
{
  "fileName": "drone_whitefield_zone_b_floor3.mp4",
  "source": "DJI_MATRICE_300",
  "resolution": "4K_60FPS",
  "captureDate": "2026-07-09T05:47:00Z",
  "coordinates": {
    "latitude": 12.9698,
    "longitude": 77.7500,
    "elevation": 920.5
  }
}
\`\`\`
* **Response (202 Accepted)**:
\`\`\`json
{
  "success": true,
  "jobId": "job_cv_9938_2348a",
  "uploadUrl": "https://s3.ap-south-1.amazonaws.com/buildtrace-ingest/raw/drone_whitefield_zone_b_floor3.mp4?AWSAccessKeyId=...",
  "status": "AWAITING_UPLOAD",
  "expiresAt": "2026-07-09T06:15:00Z"
}
\`\`\`

#### 2. Anomaly Lookup & Structural Integrity Query
* **GET** \`/api/v1/projects/:projectId/anomalies/:anomalyId\`
* **Response (200 OK)**:
\`\`\`json
{
  "id": "anom_rebar_density",
  "projectId": "proj_bangalore_tech_park_2",
  "elementId": "col_c4",
  "guid": "3b8a39c9-8dcf-4e92-a1f9-8da38812c9bf",
  "category": "Reinforcement",
  "level": "critical",
  "deviation": "Spacing deviation of +85mm vs. IFC4 standard",
  "remediationState": "OPEN",
  "boundingBox": {
    "center": [8.0, 7.5, 5.0],
    "dimensions": [0.8, 5.0, 0.8]
  }
}
\`\`\`

#### 3. BIM Alignment Trigger (Internal Dev Trigger)
* **POST** \`/api/v1/ai/align-bim\`
* **Response (200 OK)**:
\`\`\`json
{
  "alignmentMatrix": [
    [0.9998, -0.0122, 0.0114, 142.3],
    [0.0123, 0.9999, -0.0055, 982.1],
    [-0.0113, 0.0056, 0.9998, 45.2],
    [0.0000, 0.0000, 0.0000, 1.0000]
  ],
  "meanSquaredError": 0.0112,
  "alignedPoints": 12450230
}
\`\`\``
  },
  {
    id: "database-schema",
    title: "6. Database Schema Design (Prisma)",
    category: "System Components",
    iconName: "Database",
    content: `### Database Architecture (Prisma Schema Model)

To guarantee type safety and efficient spatial indices, the PostgreSQL schema utilizes standard primary keys, compound indexes, and geometric variables optimized via **PostGIS**.

\`\`\`prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ProjectRole {
  ENTERPRISE_ADMIN
  PROJECT_MANAGER
  SITE_ENGINEER
  RERA_AUDITOR
  SUBCONTRACTOR
}

enum AnomalyLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum RemediationState {
  OPEN
  MONITORING
  RESOLVED
  EXEMPTED
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  passwordHash String
  firstName    String
  lastName     String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  memberships  Membership[]
}

model Project {
  id               String        @id @default(uuid())
  name             String
  location         String
  reraRegistration String?       @unique
  latitude         Float
  longitude        Float
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  memberships      Membership[]
  elements         BimElement[]
  anomalies        Anomaly[]
  ingestionJobs    IngestionJob[]
}

model Membership {
  id        String      @id @default(uuid())
  userId    String
  projectId String
  role      ProjectRole @default(SITE_ENGINEER)
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
}

model BimElement {
  id           String      @id @default(uuid())
  projectId    String
  externalGuid String      @unique // Industry Standard IFC GUID
  name         String
  category     String      // Structure, MEP, Arch
  type         String      // Column, Slab, Duct, Pipe, Wall
  progress     Float       @default(0.0) // 0 to 100
  material     String?
  targetWeek   Int
  coordinates  Json        // Stored local bounding box details
  project      Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  anomalies    Anomaly[]
}

model Anomaly {
  id               String           @id @default(uuid())
  projectId        String
  bimElementId     String?
  category         String           // Reinforcement, MEP Collision, Geometric Shift
  title            String
  description      String
  level            AnomalyLevel     @default(MEDIUM)
  deviation        String
  possibleCause    String?
  state            RemediationState @default(OPEN)
  detectedAt       DateTime         @default(now())
  bimElement       BimElement?      @relation(fields: [bimElementId], references: [id], onDelete: SetNull)
  project          Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, state])
}

model IngestionJob {
  id         String   @id @default(uuid())
  projectId  String
  status     String   // PENDING, PROCESSING, COMPLETED, FAILED
  filePath   String
  logHistory Json?
  createdAt  DateTime @default(now())
  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
\`\`\``
  },
  {
    id: "ai-inference-pipeline",
    title: "7. Computer Vision & Inference Specs",
    category: "Pipelines & Workflows",
    iconName: "Cpu",
    content: `### AI Inference & Automated Anomaly Detection

Our machine learning pipeline bridges the gap between raw pixel arrays and structural BIM entities.

\`\`\`
  +------------------+     +------------------+     +------------------+
  | Raw Video Frame  | ==> | YOLOv11 Instance | ==> |  Rebar & Conduit |
  | (4K Drone/Helmet)|     | Segmentation     |     |  Bounding Boxes  |
  +------------------+     +--------+---------+     +--------+---------+
                                    |                        |
                                    v                        v
                           +--------+---------+     +--------+---------+
                           | SAM (Segment     |     | Volumetric Depth |
                           | Anything Model)  |     | Mapping (LiDAR)  |
                           +------------------+     +------------------+
\`\`\`

#### 1. Frame Ingestion & Preprocessing
* High-definition 4K images are corrected for spherical lens distortion (barrel effect) from action cameras using predetermined camera calibration matrix arrays.
* Frame filtering relies on an optical flow index score. Redundant, adjacent, or stationary frames are discarded, reducing inference costs by up to 70%.

#### 2. Neural Object Identification (YOLOv11 & SAM)
* **Instance Segmentation (YOLOv11)**: Detects specific, highly granular construction classes (e.g., *stirrup bars, structural anchor ties, fire protection sprinkler pipes, HVAC branch elbows*). Bounding polygons are calculated with a confidence score requirement of $\\geq 0.85$.
* **Segment Anything Model (SAM)**: Refines edge boundaries on identified structural anomalies (such as crack propagations or alignment boundaries).

#### 3. Bounding Frame Classification
* Output coordinates of identified structural components are projected from the pixel coordinate system into a 3D bounding point box relative to the floor plan's zero datum.
* Discrepancies are logged when the volume of the detected physical object does not overlap with the IFC bounding layout within an acceptable structural tolerance ($\\pm 10$ mm).`
  },
  {
    id: "video-processing-pipeline",
    title: "8. Drone / Helmet Video Pipeline",
    category: "Pipelines & Workflows",
    iconName: "Play",
    content: `### High-Throughput Video Processing Pipeline

To process multi-gigabyte video files captured by onsite helmet cameras, we employ an asynchronous, chunk-based pipeline with the following architecture:

\`\`\`
 +-------------------+      +-------------------+      +-------------------+
 |  Site Operator    | ===> | AWS S3 Multipart  | ===> | NestJS Ingestion  |
 |  Uploads Video    |      | Secure Upload     |      | Event Webhook     |
 +-------------------+      +-------------------+      +---------+---------+
                                                                 |
                                                                 v
 +-------------------+      +-------------------+      +---------+---------+
 | GPU Inference     | <=== | Celery Task       | <=== | BullMQ Priority   |
 | Execution Cluster |      | Worker Allocator  |      | Dispatcher        |
 +-------------------+      +-------------------+      +-------------------+
\`\`\`

#### Detailed Workflow Steps:
1. **Multipart Upload (Pre-signed S3)**: The client requests a series of secure pre-signed URLs from NestJS. The file is uploaded directly to an AWS S3 bucket from the site operator's browser, bypassing NestJS server bottlenecks.
2. **Ingestion Webhook**: Once S3 receives the final chunk, an S3 Event Notification triggers an HTTP webhook in NestJS.
3. **Queue Segmentation**: NestJS validates the upload metadata and creates a new \`IngestionJob\` entry, then schedules an active BullMQ job.
4. **FastAPI Processing Hook**: A worker pulling from the queue spawns a background thread. It extracts keyframes utilizing hardware-accelerated **FFmpeg NVDEC (NVIDIA GPU)** to minimize host CPU consumption.
5. **3D Reconstruction**: The frames are aligned using Structure from Motion (SfM) techniques, producing a localized point cloud file (.ply) ready for BIM alignment.`
  },
  {
    id: "bim-synchronization",
    title: "9. BIM (IFC) Alignment Workflow",
    category: "Pipelines & Workflows",
    iconName: "Compass",
    content: `### BIM Synchronization & Coordinate Alignment

Aligning raw physical photogrammetry data with the pristine coordinate space of 3D computer models requires structural geometry alignment calculations.

#### Point Cloud to BIM Coordinate Mapping Matrix:

The transformation from the photogrammetry coordinate system ($P_{scan}$) to the BIM coordinates ($P_{BIM}$) is defined by a 3D rigid transformation consisting of a $3\\times3$ rotation matrix ($R$) and a translation vector ($T$):

$$P_{BIM} = R \\cdot P_{scan} + T$$

$$\\begin{bmatrix} X_{BIM} \\\\ Y_{BIM} \\\\ Z_{BIM} \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} r_{11} & r_{12} & r_{13} & t_x \\\\ r_{21} & r_{22} & r_{23} & t_y \\\\ r_{31} & r_{32} & r_{33} & t_z \\\\ 0 & 0 & 0 & 1 \\end{bmatrix} \\cdot \\begin{bmatrix} X_{scan} \\\\ Y_{scan} \\\\ Z_{scan} \\\\ 1 \\end{bmatrix}$$

#### Alignment Stages:
1. **Rough Alignment (Keypoint Alignment)**: The pipeline matches physical site features with known architectural anchors (e.g., elevator shafts, concrete corners).
2. **Fine Alignment (ICP - Iterative Closest Point)**: The system executes numerical optimization to minimize the geometric distances between the scanned surface points and the IFC solid surfaces.
3. **Accuracy Verification**: If the Mean Squared Error (MSE) is less than $12$ mm, the alignment is flagged as **SUCCESS**. If the error exceeds $30$ mm, the job is quarantined for manual site inspection.`
  },
  {
    id: "auth-security",
    title: "10. Authentication & Authorization",
    category: "Pipelines & Workflows",
    iconName: "ShieldCheck",
    content: `### Identity Governance & Access Management (RBAC / ABAC)

To safeguard confidential construction blueprints and financial schedules, the system utilizes a robust **Role-Based Access Control (RBAC)** model layered with **Attribute-Based Access Control (ABAC)**.

#### 1. Identity Verification Protocols
* **Enterprise SSO**: Seamless SAML 2.0 / OpenID Connect (OIDC) integrations for large-scale enterprise clients (e.g., L&T, Tata Projects) utilizing Azure Active Directory or Okta.
* **MFA Requirement**: Multi-factor authentication is enforced across all roles.

#### 2. Fine-Grained Authorization Matrix (RERA Compliant)

| User Role | BIM Viewing | Upload Surveys | AI Anomalies Audit | Dispute Exemption |
| :--- | :--- | :--- | :--- | :--- |
| **Enterprise Admin** | Read / Write | Yes | Yes | Yes |
| **Project Manager** | Read Only | Yes | Yes | Yes |
| **Site Engineer** | Read Only | Yes | Read Only | No |
| **RERA Auditor** | Read Only | No | Read Only | No |
| **Subcontractor** | Limited Layer | No | View Assigned | No |

#### 3. Data Protection Measures
* **Row-Level Security (RLS)**: Enforced at the PostgreSQL level via tenant ID columns. Developers can never write a database query that accidentally exposes blueprints of project B to a subcontractor on project A.`
  },
  {
    id: "file-storage",
    title: "11. File Storage Architecture",
    category: "Pipelines & Workflows",
    iconName: "Database",
    content: `### Enterprise File Storage & Asset Management

We store massive photogrammetry point cloud files (.ply, .laz), 4K video files, and structured IFC/Revit models using a decoupled, tiered storage architecture on **AWS S3**.

\`\`\`
                   +------------------------+
                   |  AWS S3 Ingest Bucket  |
                   +-----------+------------+
                               |
                   (Lifecycle Rules: 14 Days)
                               |
                               v
                   +------------------------+
                   |  AWS S3 Glacier Deep   |
                   |  Archive (For Raw video|
                   |  assets - Cold tier)   |
                   +------------------------+
\`\`\`

#### Storage Bucket Strategy:
1. **\`buildtrace-raw-ingest\`**: Private, block-all-public-access bucket where raw video streams and orthophotos are uploaded using secure, chunk-based pre-signed URL configurations.
2. **\`buildtrace-processed-assets\`**: Stores point clouds, cropped anomaly frame thumbnails, and optimized GLTF/GLB models for Three.js client-side rendering. Optimized CDN delivery is configured via Amazon CloudFront.
3. **\`buildtrace-bim-vault\`**: Encrypted storage bucket holding the master Industry Foundation Classes (IFC) and Autodesk Revit federated sheets.`
  },
  {
    id: "queue-bullmq",
    title: "12. Resilient Queue Specs (BullMQ)",
    category: "Pipelines & Workflows",
    iconName: "Cpu",
    content: `### Resilient Queue Architecture (BullMQ)

Heavy photogrammetry processing can easily block standard node event loops. To avoid this, we distribute tasks across microservices with **BullMQ**.

#### 1. Task Queue Categories
* **\`survey-ingest-queue\`**: Handles incoming 4K drone videography. Tasks are routed to compute nodes with high CPU capacity.
* **\`ai-inference-queue\`**: Processes frames through GPU models. Tasks are routed to NVIDIA CUDA-enabled clusters.
* **\`bim-geometry-queue\`**: Handles Autodesk APS conversions, IFC translation, and coordinate alignments.

#### 2. Robust Failure & Retries Strategy

\`\`\`typescript
// NestJS Job Producer Implementation Example
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bull";

export class SurveyIngestionService {
  constructor(
    @InjectQueue('survey-ingest-queue') private surveyQueue: Queue
  ) {}

  async queueInferenceJob(projectId: string, s3Url: string) {
    await this.surveyQueue.add('analyze-survey-video', {
      projectId,
      s3Url,
    }, {
      attempts: 3, // retry up to 3 times
      backoff: {
        type: 'exponential', // wait exponentially to avoid storming the GPU server
        delay: 5000,         // initial delay is 5 seconds
      },
      removeOnComplete: true, // clear successfully completed tasks to save memory
      removeOnFail: false,    // retain failed logs for developer inspection
    });
  }
}
\`\`\``
  },
  {
    id: "redis-usage",
    title: "13. High-Performance Redis Strategy",
    category: "Infrastructure & Ops",
    iconName: "Database",
    content: `### Enterprise Redis Usage Model

Redis acts as our primary in-memory orchestration layer, supporting five distinct roles to ensure high application throughput:

#### 1. Rate Limiting (DDoS & API Protection)
* Limits API access using a sliding-window counter algorithm. This prevents scripts from spamming NestJS ingestion endpoints.
* Unauthenticated endpoints are capped at **60 requests/minute**, while authorized drone uploads are restricted to **10 uploads/hour**.

#### 2. Session Caching
* Keeps active user permission hashes, tenancy checks, and active JWT structures cached. Reduces DB lookups by up to 85%.

#### 3. Real-Time Telemetry Broker
* Uses Redis Pub/Sub to pass Python progress updates (e.g., *'Photogrammetry frame matching completed 65%'*) straight to NestJS, which then forwards the events to the client via WebSockets.

#### 4. Spatial Cache Cluster
* Bounding boxes of visual elements in active viewing ports are cached as serialized coordinate buffers, accelerating Three.js rendering lookups.`
  },
  {
    id: "microservices",
    title: "14. Microservices Grid",
    category: "Infrastructure & Ops",
    iconName: "Layers",
    content: `### Decentralized Microservices Architecture

To guarantee maximum uptime and independent scaling of services, we separate functional areas into containerized microservices:

\`\`\`
                 +-----------------------------------------+
                 |          AWS API Gateway / ALB          |
                 +--------------------+--------------------+
                                      |
                       +--------------+--------------+
                       |                             |
                       v                             v
             +------------------+          +------------------+
             |   NestJS Core    |          |  Python FastAPI  |
             |   API Service    |          |  Inference Pods  |
             +--------+---------+          +--------+---------+
                      |                             |
                  (Postgres)                  (CUDA Cluster)
\`\`\`

#### Service Catalog:
1. **NestJS Gateway Service (Internal Node.js)**: Handles authentication, billing, dashboard endpoints, and projects management.
2. **FastAPI Computer Vision Engine (Python)**: Executes inference, feature extraction, and alignment algorithms on GPU clusters.
3. **BIM IFC Parser Service (Rust / C++)**: Extremely fast IFC parser that extracts geometric attributes into streamlined binary streams.
4. **Notification & Telemetry Service (Node.js)**: Manages WebSockets, emails, and SMS alerts.`
  },
  {
    id: "docker-multi-stage",
    title: "15. Multi-Stage Docker Specs",
    category: "Folder & Repo Specs",
    iconName: "Layers",
    content: `### Multi-Stage Container Specifications (Docker)

To minimize cold-start latency in Kubernetes, our Dockerfiles are split into distinct compilation and execution stages, stripping build tools from the final images.

#### 1. NestJS Core Service Dockerfile
\`\`\`dockerfile
# --- Stage 1: Build & Compile ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# --- Stage 2: Runtime Execution ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
\`\`\`

#### 2. Python FastAPI CV Inference Dockerfile
\`\`\`dockerfile
# --- Stage 1: Dependency Ingest ---
FROM nvidia/cuda:12.2.0-base-ubuntu22.04 AS python-builder
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y python3-pip python3-dev ffmpeg libsm6 libxext6
WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# --- Stage 2: App Launch ---
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\``
  },
  {
    id: "kubernetes-k8s",
    title: "16. Kubernetes Deployment Architecture",
    category: "Infrastructure & Ops",
    iconName: "Compass",
    content: `### Kubernetes (EKS) Cluster Configuration

The system is deployed on **Amazon EKS** using custom Helm chart declarations to manage resource auto-scaling.

\`\`\`
                 +-----------------------------------------+
                 |       Route 53 / AWS ALB Controller     |
                 +--------------------+--------------------+
                                      |
                                      v
                 +--------------------+--------------------+
                 |          EKS Cluster VPC (Subnets)      |
                 |  +-----------------------------------+  |
                 |  |       Core NestJS Deploy Pods     |  |
                 |  +-----------------------------------+  |
                 |  +-----------------------------------+  |
                 |  |       FastAPI GPU Pods (g4dn)     |  |
                 |  +-----------------------------------+  |
                 +-----------------------------------------+
\`\`\`

#### Auto-Scaling Rules:
* **NestJS Microservice Pods**: Managed by Horizontal Pod Autoscaler (HPA) targets targeting **65% average CPU consumption**.
* **GPU Computer Vision Worker Pods**: Auto-scale based on the length of the **BullMQ active queue** metrics rather than raw system CPU usage. This prevents job starvation during peak drone upload windows.`
  },
  {
    id: "aws-infra",
    title: "17. AWS Cloud Infrastructure Specs",
    category: "Infrastructure & Ops",
    iconName: "Cloud",
    content: `### AWS Architecture Map

Our production environments leverage managed AWS infrastructure to ensure SOC2-compliant operations and low-latency rendering across major Indian tech hubs:

* **Computation Cluster (Amazon EKS)**:
  * Master Nodes: Managed on highly resilient t3.medium configurations across multiple availability zones.
  * Inference Worker Nodes: Powered by **g4dn.xlarge** instances equipped with single NVIDIA T4 GPUs for rapid YOLOv11 & SAM computer vision execution.
* **Geospatial Database Layer (Amazon Aurora PostgreSQL)**:
  * Powered by db.r6g.xlarge instances with multi-AZ replication.
  * Spatial storage indices optimized via PostGIS extensions.
* **Enterprise Cache (Amazon ElastiCache Redis)**:
  * Multi-AZ Redis cluster running on cache.m6g.large instances with automated failovers.
* **Asset CDN Distribution (Amazon CloudFront)**:
  * CloudFront edge locations across Mumbai, Bangalore, and New Delhi cache localized Three.js rendering files to deliver seamless, low-latency WebGL twin fly-throughs.`
  },
  {
    id: "ci-cd-pipeline",
    title: "18. CI / CD Deployment Pipeline",
    category: "Infrastructure & Ops",
    iconName: "TrendingUp",
    content: `### CI/CD Deployment Pipeline

Our automated pipeline is built on **GitHub Actions** and **ArgoCD** for continuous deployment to target Kubernetes namespaces.

\`\`\`
  +------------------+     +------------------+     +------------------+
  |  Developer Git   | ==> | GitHub Actions   | ==> | Docker Images    |
  |  Commit Push     |     | Lint & Test Runs |     | Pushed to ECR    |
  +------------------+     +------------------+     +--------+---------+
                                                             |
                                                             v
  +------------------+     +------------------+     +--------+---------+
  | Production Cluster| <== | ArgoCD Auto Sync | <== | GitOps Repo      |
  | (EKS Namespace)  |     | K8s State        |     | Manifests Update |
  +------------------+     +------------------+     +------------------+
\`\`\`

#### Integration Guardrails:
* **Linting & Type-Safety**: Pre-commit hooks block any changes containing TypeScript or ESLint errors.
* **Automated Unit Testing**: Every pull request triggers a parallel testing environment, validating Prisma schema integrity.
* **Security Scanning**: Automated Triton scans inspect container layers for vulnerabilities before they are pushed to the registry.`
  },
  {
    id: "monitoring-observability",
    title: "19. Monitoring & Observability Grid",
    category: "Infrastructure & Ops",
    iconName: "Activity",
    content: `### Enterprise Observability & System Auditing

To maintain a high level of operational stability, we monitor the system using an industry-standard telemetry stack:

* **Distributed APM Tracking (OpenTelemetry)**:
  * Tracks request execution paths across Next.js, NestJS, and Python FastAPI, allowing engineers to pinpoint bottlenecks in under-performing alignment computations.
* **Telemetry Visualizer (Prometheus & Grafana)**:
  * Visualizes core cluster metrics like container memory usage, S3 transfer rates, active BullMQ lengths, and live GPU core temperatures.
* **Enterprise Log Aggregator (Elasticsearch & Kibana)**:
  * Aggregates runtime system outputs across all container environments to simplify debugging.`
  },
  {
    id: "security-compliance",
    title: "20. Information Security & Compliance",
    category: "Infrastructure & Ops",
    iconName: "ShieldCheck",
    content: `### SOC2 & Indian RERA Compliance Matrix

Because construction blueprints represent high-value corporate intellectual property, the platform enforces strict security guidelines:

* **Data Encryption at Rest**: All databases, file systems, and S3 vaults use AES-256 encryption. Key management is handled natively by AWS KMS.
* **Transit Cryptography (TLS 1.3)**: Every external entry point forces secure HTTPS communication, blocking obsolete algorithms.
* **Indian Data Sovereignty Pinning**: In accordance with Indian infrastructure laws and local real estate compliance guidelines, all primary database clusters and object store vaults are hosted in the AWS Mumbai region.`
  },
  {
    id: "scalability-strategy",
    title: "21. Enterprise Scalability Strategy",
    category: "Infrastructure & Ops",
    iconName: "TrendingUp",
    content: `### Scalability Blueprint

To support thousands of concurrent projects without degrading system performance, the platform employs three core scaling strategies:

#### 1. Horizontal Database Scaling (Read Replicas)
* The database is configured with **Aurora Auto-Scaling Read Replicas**. Core read operations (such as loading dashboard metric charts) are routed to replica clusters, while the primary node handles writing schedules and model parameters.

#### 2. CDN Edge-Caching
* Massive WebGL models are converted into highly optimized, chunked binary files (.gltf / .glb) and cached at localized CloudFront edges, speeding up load times.

#### 3. Ephemeral AI Compute Cluster Scaling
* Spawns Spot Instance GPU nodes during peak photogrammetry calculation windows and shuts them down once processing tasks finish, reducing platform overhead.`
  },
  {
    id: "folder-structure",
    title: "22. Folder Structure for Every Service",
    category: "Folder & Repo Specs",
    iconName: "Layers",
    content: `### Detailed Service-Level Folder Blueprints

Below are the production directory layouts configured for both our Node.js and Python backend microservices:

#### 1. NestJS Core Service Folder Structure
\`\`\`
/apps/core-backend
├── src
│   ├── main.ts                   # App bootstrapper
│   ├── app.module.ts             # Federated root module
│   ├── config                    # Schema validations & env setups
│   ├── common                    # Interceptors, guards, and filters
│   ├── database                  # Prisma module configurations
│   ├── modules
│   │   ├── auth                  # OIDC & JWT logic
│   │   ├── projects              # Tenant workspace managers
│   │   ├── bim                   # IFC parsers & GUID maps
│   │   └── ingest                # BullMQ producers
│   └── tests                     # Integration test suites
├── prisma
│   ├── schema.prisma             # Active DB definition
│   └── migrations                # SQL history files
├── Dockerfile                    # Multi-stage image
└── package.json
\`\`\`

#### 2. Python FastAPI CV Service Folder Structure
\`\`\`
/apps/ai-worker
├── src
│   ├── main.py                   # FastAPI bootstrapper
│   ├── core                      # App initialization & secrets
│   ├── pipeline
│   │   ├── keyframe.py           # Frame filter
│   │   ├── detector.py           # YOLOv11 & SAM pipelines
│   │   └── alignment.py          # ICP coordinate aligns
│   ├── models                    # Pre-trained weights
│   └── tests                     # PyTest cases
├── requirements.txt              # ML dependencies
├── Dockerfile                    # CUDA GPU container
└── pyproject.toml
\`\`\``
  },
  {
    id: "monorepo-structure",
    title: "23. Recommended Git Monorepo Structure",
    category: "Folder & Repo Specs",
    iconName: "Layers",
    content: `### Recommended Git Monorepo Layout (Turborepo)

To manage our frontend and backend codebases in a single repository, we employ a unified monorepo powered by **Turborepo** or **Nx**:

\`\`\`
/buildtrace-monorepo
├── apps
│   ├── web-portal/               # Next.js / Tailwind React Client
│   ├── core-backend/             # NestJS Service
│   └── cv-worker/                # Python FastAPI Processing Worker
├── packages
│   ├── typescript-config/        # Shared compilation configs
│   ├── eslint-config/            # Shared linting guidelines
│   ├── database/                 # Prisma Client & PostGIS setups
│   └── types-bim/                # Shared interfaces
├── tooling
│   ├── helm/                     # Kubernetes deployment configurations
│   └── terraform/                # Infrastructure-as-code manifests
├── turbo.json                    # Turborepo task pipeline rules
└── package.json
\`\`\`

Using this structure, editing a type file under \`/packages/types-bim\` automatically updates and rebuilds downstream clients, ensuring full consistency across the codebase.`
  },
  {
    id: "production-deployment",
    title: "24. Production Deployment Architecture",
    category: "Folder & Repo Specs",
    iconName: "Compass",
    content: `### Enterprise Production Deployment Blueprint

Below is the network topology of our multi-region enterprise deployment:

\`\`\`
                      +-----------------------------+
                      |       Enterprise client     |
                      +--------------+--------------+
                                     |
                          (Route 53 Geo Routing)
                                     |
                                     v
                      +--------------+--------------+
                      |   AWS ALB (Mumbai Region)   |
                      +--------------+--------------+
                                     |
                   +-----------------+-----------------+
                   |                                   |
            (Private Subnet A)                  (Private Subnet B)
                   |                                   |
                   v                                   v
        +----------+----------+             +----------+----------+
        |   Core NestJS Pods  |             |  FastAPI GPU Pods   |
        |   (Replica Group)   |             |  (CUDA Segments)    |
        +----------+----------+             +----------+----------+
                   |                                   |
                   +-----------------+-----------------+
                                     |
                                     v
                      +--------------+--------------+
                      |  Aurora Postgres DB Master   |
                      |  (Encrypted Multi-AZ replica)|
                      +-----------------------------+
\`\`\``
  },
  {
    id: "development-roadmap",
    title: "25. Estimated Development Roadmap",
    category: "Folder & Repo Specs",
    iconName: "TrendingUp",
    content: `### Estimated Development Roadmap (Enterprise Ready)

Below is an outline of our development roadmap to bring the platform from prototype to enterprise launch:

#### 🚀 Phase 1: Infrastructure & Core Pipelines (Weeks 1 - 8)
* Configure the Turborepo monorepo, NestJS gateway database models, and active Prisma migration tasks.
* Deploy private S3 buckets and establish the asynchronous BullMQ pipeline backed by Redis.
* Integrate IFC.js parser mechanics into our React Three Fiber frontend, establishing solid coordinate foundations.

#### 🧠 Phase 2: Computer Vision & Model Calibration (Weeks 9 - 18)
* Train and calibrate instance segmentation models on target construction materials.
* Build the rigid ICP transformation module in Python to align photogrammetry outputs with digital CAD blueprints.
* Set up real-time server notification updates using WebSockets.

#### 🏢 Phase 3: Enterprise Hardening & SOC2 Auditing (Weeks 19 - 24)
* Conduct fine-grained RBAC audits, set up Row-Level Security parameters, and integrate enterprise identity structures.
* Deploy EKS Kubernetes clusters with robust horizontal auto-scaling, Prometheus performance alerting, and ArgoCD configurations.
* Perform structural load simulation tests on simulated multi-gigabyte blueprints to finalize RERA compliance auditing.`
  }
];
