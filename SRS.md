# Software Requirements Specification (SRS)
## Project Name: TracProgress
**Version:** 1.0.0  
**Date:** July 2026  

---

## 1. Introduction
### 1.1 Purpose
This Software Requirements Specification (SRS) document details the functional, non-functional, interface, and system requirements for **TracProgress**—the AI-driven real-time construction site progress tracking and verification system. This document serves as the absolute blueprint for engineering, testing, and deployment.

### 1.2 Scope
TracProgress is an enterprise-grade full-stack application that:
* Ingests high-resolution drone orthomosaics, 360-degree helmet walkthrough video streams, and 3D Industry Foundation Classes (IFC) BIM coordinate files.
* Automatically registers visual coordinates over virtual BIM space to detect, isolate, and log architectural, structural, and MEP trade status.
* Leverages YOLO-based computer vision on server-side nodes for rebar stirrup verification and MEP collision detection.
* Leverages Gemini Large Language Models via the server-side `@google/genai` SDK to generate remediation blueprints for onsite anomalies.
* Safeguards construction timeline compliance under the Real Estate Regulatory Authority (**RERA**) guidelines.

### 1.3 Definitions and Acronyms
* **BIM:** Building Information Modeling.
* **IFC:** Industry Foundation Classes (standard ISO 16739 schema for openBIM data exchange).
* **MEP:** Mechanical, Electrical, and Plumbing engineering.
* **RERA:** Real Estate Regulatory Authority (India).
* **GUID:** Globally Unique Identifier (used to identify specific BIM elements).
* **YOLO:** You Only Look Once (real-time deep learning object detection model).

---

## 2. Overall Description
### 2.1 Product Perspective
TracProgress functions as an autonomous inspection suite. It consists of:
1. **Interactive Client Application (React/TS/Tailwind):** Provides 3D IFC model canvas, spatial coordinate translation/rotation sandbox, interactive analytics tracking, and progress charts.
2. **Robust Backend API Services (NestJS/TypeScript):** Handles multitenant security, IFC parsing pipelines, video ingestion endpoints, and proxy communication with AI model microservices.
3. **AI Core Neural Services (Python/FastAPI/PyTorch):** Handles deep learning YOLOv8 detection workloads, video frame extraction, and coordinate transformation alignment matrices.
4. **Data Persistence Layers (PostgreSQL & Redis):** PostgreSQL stores project hierarchies, user roles, anomalies logs, and IFC metadata; Redis coordinates BullMQ multi-threaded background workers.

### 2.2 User Classes and Characteristics
* **Project Manager / Developer:** Accesses high-level progress tracking dashboards, S-Curves, RERA audit trails, and schedules automatic weekly reports.
* **Site Supervisor / Engineer:** Uploads on-site drone survey captures or walkthrough video files, manually fine-tunes coordinates alignment via the 3D translation sandbox, and resolves verified structural anomalies.
* **RERA Auditor:** Read-only access to progress timelines, historical PDF report logs, and photo verification proofs showing absolute physical milestones.

### 2.3 Operating Environment
* **Frontend:** Standard web browsers (Chrome, Safari, Firefox, Edge) with WebGL 2.0 support.
* **Backend Run-time:** Node.js v20+ / Dockerized environments running on Cloud Run.
* **AI Pipelines:** GPU-enabled (NVIDIA T4/L4) Cloud Run / GKE containers running PyTorch 2.0.
* **Databases:** PostgreSQL 15+ (with indexing on spatial geometries/strings) and Redis 7.2.

---

## 3. Specific Requirements
### 3.1 External Interface Requirements
#### 3.1.1 User Interfaces
* Clean, minimal, high-contrast Slate layout designed with Tailwind.
* 3D Canvas rendering IFC geometry with standard pan, orbit, zoom, and select handlers.
* Multi-axis slider panels for visual coordinate translation ($x, y, z$) and rotation ($yaw$).
* Collapsible anomaly drawer showing annotated image snapshots, deviation metrics, and AI-generated remediation blueprints.

#### 3.1.2 Software Interfaces
* **@google/genai SDK:** Private communication via `process.env.GEMINI_API_KEY` for context-aware structural repairs.
* **IFC.js WebEngine:** Web-based parser converting IFC binaries into customized JSON tree arrays and WebGL geometry.
* **Recharts / D3:** Dynamic construction S-Curve lines showing "Baseline Planned" vs "Physical Actual" trends.

---

## 4. Functional Requirements
### 4.1 Tenant & Access Management (F-1)
* **Description:** The system must partition data logically across organizational boundaries (multitenancy).
* **Requirements:**
  * Support user registration with mandatory Organization Name and state-registered RERA ID.
  * Enforce standard JWT authentication utilizing HttpOnly cookies.
  * Implement hierarchical Role-Based Access Control (`Admin`, `SiteEngineer`, `Auditor`).

### 4.2 IFC Model Ingestion & Tree Generation (F-2)
* **Description:** Process uploaded openBIM `.ifc` files and generate coordinate maps.
* **Requirements:**
  * Parse complex nesting structures: Project $\rightarrow$ Building $\rightarrow$ Floor $\rightarrow$ Room $\rightarrow$ BimElement.
  * Extract persistent global GUIDs from building components.
  * Store coordinate boundaries in PostgreSQL mapping physical spatial quadrants.

### 4.3 High-Throughput Drone Ingestion Pipeline (F-3)
* **Description:** Upload heavy site videos up to 450MB without blocking public thread loops.
* **Requirements:**
  * Provide multi-chunk file upload endpoints supporting resume and pause flags.
  * Offload video decoding, frame extraction, and downsampling to BullMQ and Redis backend processes.
  * Push live processing percentage metrics to the active client browser using server-side WebSocket events.

### 4.4 YOLO Reinforcement & MEP Collision Analysis (F-4)
* **Description:** Execute computer vision routines to find physical defects or collisions.
* **Requirements:**
  * Segment structural stirrups in reinforced steel structures to calculate density spacing.
  * Detect CPVC fire sprinklers relative to drywall metal studs.
  * Log deviations exceeding $15\text{mm}$ from IFC engineering models as critical anomalies.

### 4.5 Coordinates Alignment Sandbox (F-5)
* **Description:** Allow manual fine-tuning of photogrammetry maps matching virtual coordinate matrices.
* **Requirements:**
  * Provide dynamic $x, y, z$ offset inputs shifting visual photo frames over 3D model structures.
  * Capture user adjustment profiles and log operator signature keys to prevent unverified overrides.

### 4.6 Gemini Context-Aware Remediation (F-6)
* **Description:** Use LLM parameters to resolve identified construction deviations.
* **Requirements:**
  * Send precise structural deviation data (e.g., Column C4 stirrup spacing off by 85mm) paired with target design parameters to the Gemini API.
  * Return detailed structural remediation recommendations, manpower requirements, and potential RERA penalty notices.

---

## 5. Non-Functional Requirements
### 5.1 Performance Requirements
* **API Response Time:** 95% of active REST read requests must return content under $200\text{ms}$.
* **Rendering Framerate:** 3D WebGL Canvas must sustain $\ge 50\text{fps}$ on standard consumer-grade office laptops with integrated graphics.
* **Task Processing SLA:** BullMQ video ingestion and frame downsampling tasks must process fully in $< 15\text{ minutes}$.

### 5.2 Security & Compliance
* **Transport Encryption:** 100% of network traffic routed through HTTPS / TLS 1.3.
* **RERA Compliance:** Maintain read-only append-only progress log entries showing exact verification history.
* **Secret Storage:** All database credentials, API keys, and JWT secrets stored in secure environment parameters. No secrets allowed in source repositories.
