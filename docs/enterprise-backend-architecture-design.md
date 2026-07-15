# TracProgress Enterprise Backend Architecture Blueprint
**Author:** Staff Software Architect, Google  
**Target Horizon:** 2030 (10x Scale, High Availability, Petabyte-Scale Video & Millions of BIM Elements)  
**Classification:** Enterprise Confidential / Principal Engineering Blueprint

---

## 1. Executive System Scale & SLA Targets

To support 10,000 active global enterprise construction projects, trillions of spatial points, and hundreds of petabytes of 4K reality capture walkthroughs, the TracProgress backend is designed under a decoupled, cloud-native, event-driven microservices architecture.

### Core Metrics & Scale Footprint:
* **Active Enterprise Projects:** 10,000 concurrent projects.
* **BIM Elements Cataloged:** ~500,000,000 active, version-tracked 3D components.
* **Concurrent Users:** ~50,000 active sessions (dashboard, mobile uploaders, RERA compliance auditors).
* **Reality Capture Throughput:** ~1,200 walkthrough uploads per hour (averaging 15GB each, total petabyte-scale raw video ingested per month).
* **Target SLAs:** 99.99% core API availability; 99.95% GPU pipeline processing availability.
* **RPO (Recovery Point Objective):** $\leq 1$ minute (data state); $\leq 5$ minutes (heavy file pointers).
* **RTO (Recovery Time Objective):** $\leq 15$ minutes with automated cross-region DNS failover.

---

## 2. High-Level Microservices & Event-Driven Topology

The architecture divides operational domains into highly-isolated microservices communicating via **gRPC** for low-latency synchronous inter-service calls, and **Apache Kafka** for high-throughput, durable asynchronous event streams.

```
                                     [ Cloudflare Enterprise WAF / DNS ]
                                                     |
                                                     v
                                       [ Kong API Gateway Cluster ]
                                                     |
             +-----------------------+---------------+---------------+-----------------------+
             | (REST / WebSocket)    | (gRPC / mTLS)                 | (gRPC / mTLS)         | (mTLS / HTTP2)
             v                       v                               v                       v
     +---------------+       +---------------+               +---------------+       +---------------+
     | Auth & User   |       | Project & ERP |               |  BIM Core &   |       | Schedules &   |
     | Identity      |       | Sync Service  |               |  Geometry     |       | Primavera P6  |
     +---------------+       +---------------+               +---------------+       +---------------+
             |                       |                               |                       |
             | (Event Publish)       | (Entity Events)               | (Geometry Sync)       | (Gantt Milestones)
             +-----------------------+---------------+---------------+-----------------------+
                                                     |
                                                     v
                                      [ Apache Kafka Event Bus ]
                                                     |
                                      +--------------+--------------+
                                      |                             |
                                      v (Task Messages)             v (Metrics / Traces)
                            +------------------+           +------------------+
                            | Video Walkthrough|           | Observability /  |
                            | Processing (GPU) |           | OTEL Collector   |
                            +------------------+           +------------------+
                                      |
                             (S3 Multipart Ingest)
                                      v
                             [ AWS S3 / Ceph OSD ]
```

### Core Microservices Split:
1. **Auth & IAM Service (Node.js/NestJS):** Handles session cryptography, OIDC, SAML for enterprise SSO, RBAC/ABAC token signoffs, and RERA regional compliance checks.
2. **Project & ERP Gateway Service (Go):** Manages project meta-states, client entities, and connects bidirectionally to external ERPs (SAP, Oracle Fusion, Microsoft Dynamics) to sync budgets, bill-of-quantities (BoQ), and raw progress valuation bills.
3. **BIM & Geometry Engine (C++ / Rust / WebAssembly):** Parses IFC and Revit models, decimates complex geometry, maps structural topologies, extracts properties, and exposes lightweight SVF2/gLTF visualization packets.
4. **Schedule Intelligence Service (Python / FastAPI):** Connects to Oracle Primavera P6 (EPPM / XML / XER formats) and MS Project. Calculates forward/backward critical path schedules, alerts PMs of downstream bottlenecks, and runs delay scenarios.
5. **Video & Reality Ingest Service (Go):** Manages heavy multipart S3 secure presigned URL generation, segment uploads, file consistency verification, and registers raw videos in DB.
6. **AI & Computer Vision Worker Cluster (Python / PyTorch / CUDA):** Runs frame decimation, camera trajectory estimation (SfM / SLAM), object instance segmentation (YOLOv11-seg + SAM-2), and 3D point cloud rigid transformation matching.
7. **Reporting & Analytics Broker (Go):** Generates heavy audit trail compilations, RERA safety checklists, and progressive PDFs.

---

## 3. Database & Storage Architecture

A single database paradigm is a critical anti-pattern at this scale. The backend employs a **polyglot persistence** architecture to optimize read, write, relational, and search workloads.

```
       +---------------------------------------------------------------------------------+
       |                               Data Storage Layer                                |
       +-----------------------+------------------------+--------------------------------+
                               |                        |
        [ Relational / ACID ]  |   [ Spatial / Mesh ]   |  [ Document / Log Metadata ]
                               v                        v
                    +--------------------+    +--------------------+
                    |  PostgreSQL/Aurora |    | MongoDB / Cassandra|
                    |  (PostGIS Enabled) |    | (Timeseries Store) |
                    +--------------------+    +--------------------+
                               |                        |
                     (Replication / CDC)      (Replication / CDC)
                               |                        |
                               v                        v
                    +--------------------+    +--------------------+
                    | AWS S3 / MinIO     |    | OpenSearch Cluster |
                    | (Raw Video & Mesh) |    | (BIM Element index)|
                    +--------------------+    +--------------------+
```

### Polyglot Store Allocation:
* **Core Relational Metadata Store (AWS Aurora PostgreSQL Serverless v2):** Holds transactional records, project metrics, user memberships, and schedule associations. Features read-replicas pinned to regional availability zones (e.g., `ap-south-1` in Mumbai, `eu-west-1` in Dublin). Enhanced with **PostGIS** for geolocation checks and spatial boundaries.
* **Large BIM Element Store (Cassandra / ScyllaDB Cluster):** Retains properties, GUID states, geometric coordinate lists, and matching histories for millions of IFC elements. Selected for high-throughput partitioning, partition key: `(project_id, building_id)`, clustering key: `(element_id, version)`.
* **In-Memory Cache (Redis Enterprise Cluster):** Serves as an ephemeral layer for session tokens, JWT blacklists, API rate limits, and short-term dashboard computations. Operates with active-active geo-replication.
* **Asynchronous Task Queue (BullMQ backed by isolated Redis Cluster):** Manages execution state of short-lived and medium-duration ingestion processes with resilient lock distributions.
* **Large File & Video Storage (AWS S3 with Intelligent Tiering):**
  * **Raw Ingest Bucket:** Dynamic transition to Glacier Deep Archive after 30 days.
  * **Processed Frame / Keyframe Cache Bucket:** Retained on S3 Standard-IA (Infrequent Access) for rapid neural model reprocessing.
  * **Decimated 3D Mesh Assets:** Cached at edge locations via AWS CloudFront POPs to decrease WebGL loading times.

---

## 4. Ingestion, GPU Pipelines & AI Processing Topology

Processing video files at high volumes requires strict separation between the API web server and the GPU worker nodes to prevent CPU/memory starvation on critical REST endpoints.

```
                  +----------------------------------------------+
                  |           Video Ingestion Pipeline           |
                  +----------------------+-----------------------+
                                         |
                                (Multipart Ingest)
                                         v
                            +--------------------------+
                            | AWS S3 Raw Storage       | <--- Ingest Complete Trigger
                            +------------+-------------+
                                         |
                                         v (S3 Event Webhook)
                            +--------------------------+
                            | Kong Ingress / NestJS    |
                            +------------+-------------+
                                         |
                                (Enqueue Job task)
                                         v
                            +--------------------------+
                            | Apache Kafka Ingest Queue|
                            +------------+-------------+
                                         |
                               (GPU Worker Consumer)
                                         v
                            +--------------------------+
                            | PyTorch & CUDA Workers   | <--- Frame Decimation
                            | - YOLOv11 Instance Seg.  |
                            | - Segment Anything (SAM) |
                            | - Open3D ICP Registration|
                            +------------+-------------+
                                         |
                                  (Committed State)
                                         v
                            +--------------------------+
                            | Aurora DB / Kafka Publish|
                            +--------------------------+
```

### Ingestion Workflow & Error Isolation:
1. **Zero-Byte Upload Handshake:** The mobile or drone operator app registers an intent to upload walkthrough footage to `/api/v1/projects/:id/ingest`.
2. **Presigned Multi-Part S3 URL Generation:** The ingest service returns a set of signed multi-part URLs. The client uploads raw video chunks directly to S3, bypassing our API servers and reducing network overhead.
3. **Async S3 Event Webhook:** On multi-part upload completion, S3 fires an event notification to AWS SNS/SQS, which is digested by the NestJS Queue Dispatcher.
4. **Kafka Task Enqueuing:** A pipeline execution task is enqueued on Kafka under the topic `video.walkthrough.raw`.
5. **Decoupled GPU Workers (Dockerized PyTorch / FastAPI):** Multi-threaded Python worker microservices run on NVIDIA G5 instances (`g5.4xlarge` containing NVIDIA A10G GPUs).
   * **Stage A (Keyframe Extraction):** Runs adaptive optical flow algorithm to drop frames with heavy motion blur or redundant spatial intervals. Decreases processing volume by **90%** with no information loss.
   * **Stage B (Segment-Anything & YOLOv11):** Detects structural objects (walls, doors, pipes, rebar grids) and computes segmentation masks. Uses **TensorRT** optimization to double FPS processing speeds.
   * **Stage C (3D ICP Alignment):** Aligns scanned camera trajectories to spatial coordinates using Open3D. Evaluates point cloud overlap against IFC bounding boxes.
   * **Stage D (Committed State):** Discrepancy matrices and progress validations are committed to the database, and a completion event is pushed to Kafka under `video.walkthrough.completed`.

---

## 5. Scheduler Synchronization (Primavera P6) & ERP Integrations

Enterprise construction projects rely on Oracle Primavera P6 or Microsoft Project as the absolute source of schedule truth. Financial audits rely on SAP or Oracle ERPs.

```
       +-----------------------+              +-----------------------+
       | Oracle Primavera P6   |              | TracProgress Engine   |
       +-----------+-----------+              +-----------+-----------+
                   |                                      |
         (XER / XML Export)                      (Progress Valuation)
                   |                                      |
                   v                                      v
       +-----------+-----------+              +-----------+-----------+
       | Primavera Sync Worker | <== gRPC ==> |   ERP Billing Worker  |
       | - Critical Path Engine|              |   - SAP RFC / REST    |
       +-----------------------+              +-----------------------+
```

### Primavera P6 Synchronization Engine:
* **Data Formats:** Accepts native `.XER` or XML exports via REST API, or connects directly to Primavera EPPM databases using JDBC with read-only database connections.
* **Schema Mapping:** Maps Primavera activity IDs with specific CAD elements/IFC GUIDs. Holds a relational mapping table `activity_element_mapping` in PostgreSQL.
* **Critical Path Solver:** Re-calculates critical path schedules on physical progress updates. Evaluates lag, lead, floats, and outputs a daily prediction metric.
* **Conflict Resolution:** If Primavera changes activity logic, TracProgress marks current element links as "AWAITING_REVIEW" to let engineers manually inspect the changes.

### ERP Billing Integration:
* **Flow:** Connects to SAP (via SAP RFC Gateway / NetWeaver REST APIs) and Oracle Financials.
* **Sync Frequency:** Executed nightly via scheduled Cron tasks or triggered directly on monthly progress claim submissions.
* **Payload:** Packages verified physical element installation states, maps them with BoQ (Bill of Quantities) items, calculates certified progress percentages, and generates automated progressive billing invoices.

---

## 6. Directory Structure & Monorepo Layout

To facilitate code maintenance across high-velocity teams, TracProgress uses a strict monorepo layout backed by **Turborepo** or **Nx**.

```
tracprogress-monorepo/
├── apps/
│   ├── web-client/                     # Next.js / React Three Fiber client dashboard
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── store/
│   │   └── package.json
│   └── docs/                           # Internal technical specifications and Swagger files
│
├── services/
│   ├── auth-service/                   # NestJS Identity & RBAC Service (Port 4001)
│   ├── project-service/                # Go ERP & Metadata Service (Port 4002)
│   ├── bim-service/                    # Go / C++ IFC Geometry Parsing Engine (Port 4003)
│   ├── schedule-service/               # Python Primavera Synchronizer (Port 4004)
│   ├── video-service/                  # Go Multipart Ingestion Service (Port 4005)
│   └── cv-worker-cluster/              # PyTorch CUDA AI Worker Cluster (Consumer)
│       ├── app/
│       │   ├── core/                   # Domain entities and Interfaces (Clean Architecture)
│       │   ├── infrastructure/         # ML Weights loader, TensorRT optimizations
│       │   └── adapters/               # Kafka consumer endpoints
│       ├── weights/                    # local weights cache (YOLOv11-seg, SAM-2)
│       ├── Dockerfile
│       └── requirements.txt
│
├── libs/                               # Shared Enterprise Libraries
│   ├── ts-proto/                       # Auto-generated gRPC TypeScript interfaces
│   ├── go-shared/                      # Shared Go logging, database helpers
│   └── py-shared/                      # Shared Python ML data loaders, geometry scripts
│
├── deploy/                             # Production Kubernetes Manifests & Terraform Files
│   ├── terraform/                      # IaC for AWS EKS, RDS Aurora, Kafka, S3
│   ├── helm/                           # Kubernetes Helm templates
│   └── argocd/                         # GitOps application definitions
│
├── .github/workflows/                  # GitHub Actions (CI/CD workflows)
├── package.json                        # Turborepo Root workspace file
└── turbo.json                          # Invalidation configurations for build pipelines
```

---

## 7. Production AWS Architecture (Enterprise VPC Blueprint)

Below is the design for a production AWS VPC layout spanning multiple Availability Zones to ensure zero single-points-of-failure.

```
+---------------------------------------------------------------------------------------------------------+
|                                     AWS Region (ap-south-1 / Mumbai)                                    |
|                                                                                                         |
|   +-------------------------------------------------------------------------------------------------+   |
|   |                                  VPC (10.0.0.0/16) - TracProgress                               |   |
|   |                                                                                                 |   |
|   |   +----------------------------------+             +----------------------------------+         |   |
|   |   |        Availability Zone A       |             |        Availability Zone B       |         |   |
|   |   |                                  |             |                                  |         |   |
|   |   |  +----------------------------+  |             |  +----------------------------+  |         |   |
|   |   |  | Public Subnet (10.0.1.0/24)|  |             |  | Public Subnet (10.0.2.0/24)|  |         |   |
|   |   |  | - AWS ALB (Internet-Facing)|  |             |  | - AWS ALB (Backup / Multi) |  |         |   |
|   |   |  | - NAT Gateway A            |  |             |  | - NAT Gateway B            |  |         |   |
|   |   |  +--------------+-------------+  |             |  +--------------+-------------+  |         |   |
|   |   |                 |                |             |                 |                |         |   |
|   |   |                 v                |             |                 v                |         |   |
|   |   |  +--------------+-------------+  |             |  +--------------+-------------+  |         |   |
|   |   |  | Private App (10.0.10.0/24) |  |             |  | Private App (10.0.20.0/24) |  |         |   |
|   |   |  | - EKS Nodes (Core Apps)    |  | <=========> |  | - EKS Nodes (Core Apps)    |  |         |   |
|   |   |  | - EKS GPU Nodes (g5)       |  |  Internal   |  | - EKS GPU Nodes (g5)       |  |         |   |
|   |   |  +--------------+-------------+  |   Peering   |  +--------------+-------------+  |         |   |
|   |   |                 |                |             |                 |                |         |   |
|   |   |                 v                |             |                 v                |         |   |
|   |   |  +--------------+-------------+  |             |  +--------------+-------------+  |         |   |
|   |   |  | Database Sub (10.0.100.0/24|  |             |  | Database Sub (10.0.120.0/24|  |         |   |
|   |   |  | - Aurora Postgres Primary  |  |             |  | - Aurora Postgres Replica  |  |         |   |
|   |   |  | - MSK Kafka Broker A       |  |             |  | - MSK Kafka Broker B       |  |         |   |
|   |   |  +----------------------------+  |             |  +----------------------------+  |         |   |
|   |   +----------------------------------+             +----------------------------------+         |   |
|   +-------------------------------------------------------------------------------------------------+   |
|                                                                                                         |
|   [ Global CloudFront CDN Cache ] <=========> [ Global Route53 DNS Latency/Weighted Routing ]           |
+---------------------------------------------------------------------------------------------------------+
```

### AWS VPC Configurations:
* **VPC CIDR:** `10.0.0.0/16`
* **Public Subnets:** `10.0.1.0/24` (AZ-A), `10.0.2.0/24` (AZ-B). Houses Application Load Balancers (ALBs) and NAT Gateways.
* **Private Subnets (EKS App Layer):** `10.0.10.0/24` (AZ-A), `10.0.20.0/24` (AZ-B). Houses EKS worker node pools (m6i instances for API servers; g5 instances for PyTorch processing).
* **Private Subnets (Data Layer):** `10.0.100.0/24` (AZ-A), `10.0.120.0/24` (AZ-B). Isolated database subnet holding RDS Aurora PostgreSQL endpoints, MSK (Managed Streaming for Kafka) instances, and elasticache clusters. Accessible only from App private subnets.

---

## 8. Kubernetes Production Architecture (EKS GitOps Blueprint)

EKS coordinates container lifecycle operations. The cluster uses **ArgoCD** to pull configurations from the Git monorepo and implement modern cloud patterns.

```yaml
# deploy/helm/tracprogress-cv-worker/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cv-worker-cluster
  namespace: tracprogress-prod
  labels:
    app: cv-worker
    tier: pipeline
spec:
  replicas: 10 # Baseline node deployment scaled dynamically via HPA
  selector:
    matchLabels:
      app: cv-worker
  template:
    metadata:
      labels:
        app: cv-worker
    spec:
      containers:
      - name: pytorch-cuda-worker
        image: 767982023487.dkr.ecr.ap-south-1.amazonaws.com/tracprogress/cv-worker:v2.4.1
        imagePullPolicy: IfNotPresent
        env:
        - name: APP_ENV
          value: "production"
        - name: CUDA_VISIBLE_DEVICES
          value: "0"
        - name: KAFKA_BROKERS
          value: "msk-kafka.tracprogress.local:9092"
        resources:
          limits:
            nvidia.com/gpu: "1" # Dedicated GPU assigned to each container
            memory: 16Gi
            cpu: "4"
          requests:
            nvidia.com/gpu: "1"
            memory: 12Gi
            cpu: "2"
        volumeMounts:
        - name: local-frame-cache
          mountPath: /app/temp_frames
      nodeSelector:
        instance-type: "g5.4xlarge" # Scheduled exclusively on GPU instances
      volumes:
      - name: local-frame-cache
        emptyDir:
          medium: Memory # 10x faster frame writes using RAM scratchpad
```

### High-Performance Pod Scheduling:
* **HPA (Horizontal Pod Autoscaler):** Tracks Kafka topic lag metrics via **KEDA (Kubernetes Event-driven Autoscaling)**. If queue lag under `video.walkthrough.raw` exceeds 5 items, KEDA spins up additional `cv-worker` pods.
* **Autoscaler Integration:** Linked with **Karpenter** on AWS to quickly provision raw spot/on-demand GPU EC2 instances on EKS demand surges.
* **EmptyDir RAM Backing:** Temp frame directories are mounted using `emptyDir.medium: Memory`. This completely eliminates local NVMe disk write latencies on 4K image extraction frames.

---

## 9. Security, Threat Modeling & Compliance Controls

Building enterprise physical site assets requires bulletproof security frameworks to protect customer trade secrets and comply with rigorous state data sovereignty regulations.

* **Data Residency Isolation (Local Region Lock):** Customer databases, S3 buckets, and telemetry indexes are geographically locked within specific regions. For example, Indian projects are fully localized in AWS Mumbai (`ap-south-1`) with cross-region replication completely disabled to comply with RERA provisions.
* **mTLS Internal Communication:** Network communication between microservices within EKS is encrypted via mutual TLS (mTLS) managed by **Linkerd Service Mesh**, blocking lateral threat maneuvers.
* **Secret Management:** API tokens, AWS keys, database passwords, and Primavera configurations are managed by **HashiCorp Vault** with automated dynamic rotation.
* **Audit Logs Traceability:** Any modifications to BIM metrics, schedule dates, or user permissions write synchronous audit logs via a global audit logger middleware, storing hashes inside an immutable, read-only audit-trail log table.

---

## 10. Disaster Recovery (DR) & Business Continuity Specs

To support multi-national developers running mission-critical assets, TracProgress implements a strict **Active-Passive Geo-Redundant** DR protocol with hot standby configurations.

| Layer | DR Strategy | RPO / RTO Target | Implementation Details |
| :--- | :--- | :--- | :--- |
| **Transactional DB** | AWS Aurora Global Database | RPO: $\leq 1$s <br> RTO: $\leq 5$m | Cross-region read-replicas inside passive regions (e.g., Singapore `ap-southeast-1` acts as secondary for Mumbai). Failover triggers automated DNS routing updates. |
| **Object Storage** | S3 Cross-Region Replication (CRR) | RPO: $\leq 15$m <br> RTO: $\leq 10$m | Files are replicated via AWS cross-region routing asynchronously. Heavy videos are indexed with duplicate storage hashes. |
| **K8s App Layer** | ArgoCD Multi-Cluster Sync | RPO: 0 <br> RTO: $\leq 10$m | Standardized Helm chart configurations are applied to standby EKS clusters in passive regions, keeping deployment versions synchronized. |
| **DNS Failover** | AWS Route 53 Health Checks | RPO: 0 <br> RTO: $\leq 2$m | If Route53 health checks on primary ALBs fail for 3 cycles, Route53 automatically redirects active user traffic to passive region load balancers. |

---

## 11. MVP Execution Roadmap

To validate the Google Staff Architect design within a rapid 90-day cycle:

```
[ Phase 1: Ingestion & Core (Day 1-30) ] ==> [ Phase 2: CV Workers (Day 31-60) ] ==> [ Phase 3: Primavera & ERP (Day 61-90) ]
```

### Phase 1: Ingestion Pipeline & Metadata Core (Day 1-30)
* Deploy single-region AWS Aurora instance, Redis server, and an S3 bucket.
* Build the Go Multipart Video Service and implement client presigned URL handshakes.
* Implement the Next.js/NestJS dashboard skeleton with active Auth strategies.

### Phase 2: Computer Vision Worker & Task Queue (Day 31-60)
* Deploy a Dockerized PyTorch/CUDA worker on a single GPU node.
* Build the Kafka/BullMQ message queue connecting the Go Ingest service to the Python workers.
* Wire the Open3D ICP alignment script and run rough point-cloud registration validation.

### Phase 3: Primavera P6 & ERP Connectors (Day 61-90)
* Integrate Primavera P6 XML/XER parser in the schedule service.
* Map activity nodes with specific PostgreSQL IFC element columns.
* Launch the end-to-end telemetry dashboard with live notifications and verified progress visualizers.
