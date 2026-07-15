# Product Requirements Document (PRD)

## Project Name: TracProgress
**Sub-title:** AI-Driven Real-time Construction Site Progress Tracking & Verification System

---

## 1. Executive Summary & Vision

TracProgress is a full-stack, enterprise-grade alternative to platforms like Buildots. It targets high-scale commercial real estate and public infrastructure projects across India (conforming strictly to **RERA - Real Estate Regulatory Authority** timeline audit baselines). 

By integrating ultra-high-resolution drone orthomosaics, 360-degree helmet walk-through cameras, and 3D IFC BIM coordinates models, TracProgress automatically verifies physically completed construction elements on site and highlights quality, alignment, and scheduling anomalies.

---

## 2. Core Objectives

1. **Automate Site Inspection:** Eliminate subjective manual inspection by cross-referencing on-site photogrammetry scans with the virtual IFC BIM blueprint automatically.
2. **Track Multi-trade Progress:** Segment and record daily progress maps for individual trade domains:
   * **Structural:** Reinforcement steel spacing, concrete pour volume, columns, slabs.
   * **Architectural:** Drywall partitions, masonry walls, plastering, glazing.
   * **MEP:** HVAC branch ducts, CPVC fire sprinkler pipes, electrical conduits, cable trays.
3. **Prevent Scheduling Overruns:** Flag spatial and coordinate alignment anomalies in real-time to alert project managers of delayed structural items or volumetric clashes.
4. **Secure RERA Compliance:** Maintain immutable progress proof trails to conform with state RERA audits and avoid critical delay penalties.

---

## 3. Core System Capabilities & Workflows

### Module A: Standard 3D BIM Viewer Canvas
* **IFC.js WebEngine integration:** Renders interactive 3D elements natively in the client-side browser with zero plugin overhead.
* **Trade & Level Filters:** Single-click filtering to isolate specific floors (Ground Floor, L1, L2, Roof) or trades (Structural, Architectural, MEP).
* **Section Plane Clipping:** Interactively slice the 3D model coordinates through X, Y, or Z axes to locate internal volumetric clashes.
* **AI Synchronization Highlights:** Instant overlay highlighting of construction elements color-coded by their verified physical state (Green: Completed, Yellow: In Progress, Red: Delayed/Not Started).

### Module B: Computer Vision (CV) Anomaly Center
* **YOLO Instance Segmentation:** Auto-detects steel rebar density and CPVC fire sprinkler pipelines using neural networks run on S3 video uploads.
* **Coordinates Alignment Sandbox:** Interactively translate ($x, y, z$) and rotate ($yaw$) the real-world drone scan over virtual BIM coordinate maps to adjust registration precision.
* **Gemini Remediation Engine:** Connects to the server-side Gemini API (`gemini-2.5-flash`) to generate actionable structural correction blueprints, resource requirements, and revised scheduling options for flagged site discrepancies.

### Module C: Background Workload & Database Schema
* **High-Throughput Task Queues:** BullMQ handles multi-threaded processing partitions (drone sweeping video slices, 360 helmet scans, IFC revisions) synced with Redis.
* **Prisma & Postgres Schema:** Fully structured entities supporting `BimElement`, `SiteScan`, `Anomaly`, `Trade`, and `ProjectStats` data layers.

---

## 4. Technical Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend Framework** | React (Vite, TS) | High-performance SPA with robust modular state. |
| **Styling Engine** | Tailwind CSS | Clean, uniform typography and modern interface structure. |
| **3D Rendering** | IFC.js WebEngine | Virtual geometry mesh representation. |
| **Model Generation** | @google/genai | Server-side Gemini API for remediation workflows. |
| **State Managers** | BullMQ & Redis | Backend microservices orchestrating background processing workers. |
| **ORM & Database** | Prisma ORM & PostgreSQL | Storage for BIM GUID assets and detected site anomalies. |

---

## 5. Security & SLA Compliance

* **Data Integrity:** Real-world photogrammetry maps are immutable; all coordinate alignment transformations must record an operator audit signature.
* **Low Latency Pipeline:** BullMQ ensures drone 4K video ingestion processing resolves under 15 minutes per workspace section.
* **SLA Targets:** Enterprise dashboard analytics maintains 99.9% uptime for continuous engineering access.
