import React, { useState, useEffect } from "react";
import { ARCHITECTURE_SECTIONS, ArchSection } from "./data/architectureDoc";
import { CV_ARCHITECTURE_SECTIONS, CVSection } from "./data/cvModuleDoc";
import { ENTERPRISE_DB_TABLES, PRISMA_SCHEMA_CODE } from "./data/dbSchemaDoc";
import { AI_PIPELINE_STEPS, PipelineStep } from "./data/pipelineDoc";
import { PRODUCTION_PIPELINE_DATA, ProductionPipelineSection } from "./data/productionPipelineDoc";
import {
  Terminal,
  Cpu,
  Database,
  Compass,
  Layers,
  Search,
  BookOpen,
  Sliders,
  Workflow,
  Network,
  GitBranch,
  Play,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Cloud,
  Eye,
  Loader2,
  Trash2,
  GitCommit,
  TrendingUp,
  CloudLightning,
  Camera,
  ShieldAlert,
  Server
} from "lucide-react";

import BimEngineDesign from "./BimEngineDesign";
import ProgressEngineDesign from "./ProgressEngineDesign";
import DelayPredictionDesign from "./DelayPredictionDesign";

// Types for Queue Simulator
interface SimulatedJob {
  id: string;
  name: string;
  type: "drone_video" | "helmet_360" | "ifc_sync";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  priority: "high" | "standard" | "low";
  logs: string[];
  workerId: string;
}

export default function TechArchitecture() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"doc" | "queue" | "alignment" | "schema" | "cv" | "bim" | "progress" | "delay">("doc");
  
  // Document Search & Selected Section
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("overall-architecture");

  // CV Document Search & Selected Section
  const [cvSearchQuery, setCvSearchQuery] = useState("");
  const [selectedCVSectionId, setSelectedCVSectionId] = useState("cv-overall-architecture");

  // CV Sub-Tabs & Pipeline states
  const [cvSubTab, setCvSubTab] = useState<"pipeline" | "manual" | "production">("pipeline");
  const [selectedPipelineStepId, setSelectedPipelineStepId] = useState<number>(1);
  const [selectedProdSectionId, setSelectedProdSectionId] = useState<string>("upload-compression");

  // Production Pipeline Interactive Simulation States
  const [pipelineSimLogs, setPipelineSimLogs] = useState<string[]>([
    "System Initialized. Production Video Pipeline monitoring engine ACTIVE.",
    "Ready to ingest high-throughput helmet video walks."
  ]);
  const [isSimulatingRetry, setIsSimulatingRetry] = useState(false);
  const [isSimulatingOOM, setIsSimulatingOOM] = useState(false);
  const [cdnCacheStatus, setCdnCacheStatus] = useState<"idle" | "fetching" | "hit" | "miss">("idle");
  const [cacheSimKey, setCacheSimKey] = useState("");

  // Filter CV sections based on search
  const filteredCVSections = CV_ARCHITECTURE_SECTIONS.filter(section =>
    section.title.toLowerCase().includes(cvSearchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(cvSearchQuery.toLowerCase())
  );

  const selectedCVSection = CV_ARCHITECTURE_SECTIONS.find(s => s.id === selectedCVSectionId) || CV_ARCHITECTURE_SECTIONS[0];

  // Queue Simulator State
  const [jobs, setJobs] = useState<SimulatedJob[]>([
    {
      id: "job-001",
      name: "Whitefield Block B Orthomosaic Survey",
      type: "drone_video",
      status: "completed",
      progress: 100,
      priority: "high",
      workerId: "gpu-worker-mumbai-01",
      logs: [
        "[NestJS] Ingestion event received from S3 webhook",
        "[BullMQ] Enqueued 'drone_video' in survey-ingest-queue with priority=high",
        "[FastAPI] Claimed job 'job-001' on gpu-worker-mumbai-01",
        "[FastAPI] Extracting 4K frames... 3,420 keyframes extracted",
        "[FastAPI] Aligning 3D point cloud... ICP converged (MSE: 0.0112m)",
        "[Prisma] Updated BimElement progress maps successfully",
        "[BullMQ] Job marked as COMPLETED in 12,450ms"
      ]
    },
    {
      id: "job-002",
      name: "Level 1 Corridor 360-degree Helmet Scan",
      type: "helmet_360",
      status: "processing",
      progress: 45,
      priority: "standard",
      workerId: "gpu-worker-mumbai-02",
      logs: [
        "[NestJS] Ingestion event received from S3 webhook",
        "[BullMQ] Enqueued 'helmet_360' with standard priority",
        "[FastAPI] Claimed job 'job-002' on gpu-worker-mumbai-02",
        "[FastAPI] Running YOLOv11 Instance Segmentation... 85% mapped",
        "[FastAPI] Spatial collision solver: 1 clash flagged (CPVC pipe vs Duct C4)"
      ]
    }
  ]);

  // Spatial Alignment State
  const [tx, setTx] = useState(142.3);
  const [ty, setTy] = useState(982.1);
  const [tz, setTz] = useState(45.2);
  const [yaw, setYaw] = useState(12.5); // Rotation in degrees

  // BIM Engine Architectural Interactive States
  const [bimTech, setBimTech] = useState<"ifc" | "revit" | "aps" | "xeokit" | "ifc_js">("ifc_js");
  const [bimSubsystem, setBimSubsystem] = useState<"import" | "geometry" | "mapping" | "alignment" | "spatial" | "versioning" | "comparison" | "matching">("import");
  
  // 1. Import Pipeline States
  const [bimImportProgress, setBimImportProgress] = useState(0);
  const [bimImportStatus, setBimImportStatus] = useState<"idle" | "ingesting" | "parsing" | "indexing" | "completed">("idle");
  const [bimImportLogs, setBimImportLogs] = useState<string[]>([]);
  
  // 2. Geometry Extraction States
  const [bimGeomType, setBimGeomType] = useState<"wall" | "column" | "slab" | "pipe">("wall");
  
  // 3. Mapping Node selection
  const [bimSelectedMapNode, setBimSelectedMapNode] = useState<string>("node_wall_1");
  
  // 4. Alignment offsets
  const [bimAlignLocalX, setBimAlignLocalX] = useState<number>(10.0);
  const [bimAlignLocalY, setBimAlignLocalY] = useState<number>(15.0);
  const [bimAlignLocalZ, setBimAlignLocalZ] = useState<number>(3.5);
  const [bimAlignScale, setBimAlignScale] = useState<number>(1.0);
  const [bimAlignYaw, setBimAlignYaw] = useState<number>(45.0);
  
  // 5. Spatial Indexing
  const [bimSpatialLevels, setBimSpatialLevels] = useState<number>(2);
  
  // 6. Model Versioning
  const [bimSelectedCommit, setBimSelectedCommit] = useState<string>("c3");
  
  // 7. Comparison Engine
  const [bimCompModelA, setBimCompModelA] = useState<string>("v1_0");
  const [bimCompModelB, setBimCompModelB] = useState<string>("v1_1");
  const [isBimComparing, setIsBimComparing] = useState<boolean>(false);
  const [bimCompCompleted, setBimCompCompleted] = useState<boolean>(false);
  
  // 8. Progress Matching
  const [bimProgressOverlap, setBimProgressOverlap] = useState<number>(75);

  // Schema Table Highlights
  const [selectedTable, setSelectedTable] = useState<string>("BimElement");
  const [dbViewMode, setDbViewMode] = useState<"entities" | "diagram" | "prisma" | "specs">("entities");
  const [dbTableSearch, setDbTableSearch] = useState("");
  const [copiedPrisma, setCopiedPrisma] = useState(false);

  // Filter sections based on search
  const filteredSections = ARCHITECTURE_SECTIONS.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSection = ARCHITECTURE_SECTIONS.find(s => s.id === selectedSectionId) || ARCHITECTURE_SECTIONS[0];

  // Simulated queue process loop
  useEffect(() => {
    const timer = setInterval(() => {
      setJobs(prevJobs =>
        prevJobs.map(job => {
          if (job.status === "processing") {
            const nextProgress = Math.min(job.progress + 15, 100);
            const nextStatus = nextProgress === 100 ? "completed" : "processing";
            const newLogs = [...job.logs];

            if (nextProgress === 60) {
              newLogs.push(`[FastAPI] Iterative Closest Point fine-tuning aligned elements`);
            } else if (nextProgress === 80) {
              newLogs.push(`[FastAPI] Spatial Anomaly Verification: Complete`);
            } else if (nextProgress === 100) {
              newLogs.push(`[Prisma] Committed 12 synced BIM elements and 1 anomalous target`);
              newLogs.push(`[BullMQ] Core-backend event notified via Redis Pub/Sub: COMPLETED`);
            }

            return {
              ...job,
              progress: nextProgress,
              status: nextStatus as any,
              logs: newLogs
            };
          }
          return job;
        })
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const addSimulatedJob = (type: "drone_video" | "helmet_360" | "ifc_sync") => {
    const randId = `job-${Math.floor(Math.random() * 900) + 100}`;
    let name = "New Survey Upload";
    let priority: "high" | "standard" | "low" = "standard";

    if (type === "drone_video") {
      name = `Zone ${String.fromCharCode(65 + Math.floor(Math.random() * 4))} Drone Sweep`;
      priority = "high";
    } else if (type === "helmet_360") {
      name = `L${Math.floor(Math.random() * 3) + 1} Walkthrough Helmet Scan`;
      priority = "standard";
    } else {
      name = `IFC Revision Baseline Model v2.${Math.floor(Math.random() * 5)}`;
      priority = "low";
    }

    const newJob: SimulatedJob = {
      id: randId,
      name,
      type,
      status: "pending",
      progress: 0,
      priority,
      workerId: `gpu-worker-mumbai-0${Math.floor(Math.random() * 3) + 1}`,
      logs: [
        `[NestJS] Client authorized upload for ${name}`,
        `[S3] Multipart chunks verified and consolidated`,
        `[BullMQ] Ingested task into partition: status=QUEUED`
      ]
    };

    setJobs(prev => [newJob, ...prev]);

    // Fast-start processing for demonstration
    setTimeout(() => {
      setJobs(prev =>
        prev.map(j => {
          if (j.id === randId) {
            return {
              ...j,
              status: "processing",
              progress: 10,
              logs: [...j.logs, `[FastAPI] Assigned processing slice on worker ${j.workerId}`]
            };
          }
          return j;
        })
      );
    }, 1500);
  };

  const clearJobs = () => {
    setJobs([]);
  };

  // 1. Trigger Exponential Backoff Retry Simulation
  const runRetrySimulation = () => {
    if (isSimulatingRetry) return;
    setIsSimulatingRetry(true);
    setPipelineSimLogs([
      "Initiating Walkthrough Video Ingestion Retry test...",
      "[INGEST] Dispatching multipart consolidation payload."
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        setPipelineSimLogs(prev => [
          ...prev,
          "[ERROR] HTTP 504 Gateway Timeout while accessing S3 bucket sector-4-upload.",
          "[RETRY-1] Scheduling retry in 2000ms. Math: delay = min(30s, 1s * 2^1) + Jitter(152ms)"
        ]);
      } else if (step === 2) {
        setPipelineSimLogs(prev => [
          ...prev,
          "[ERROR] HTTP 504 Gateway Timeout: S3 replication lock still busy.",
          "[RETRY-2] Scheduling retry in 4000ms. Math: delay = min(30s, 1s * 2^2) + Jitter(324ms)"
        ]);
      } else if (step === 3) {
        setPipelineSimLogs(prev => [
          ...prev,
          "[SUCCESS] Connection established! Chunks consolidated successfully.",
          "[INGEST] Transcoding to H.265 (HEVC) complete. File Hash MD5 matched: d41d8cd98f00b204e9800998ecf8427e.",
          "🎉 Job completed successfully on retry attempt #3!"
        ]);
        setIsSimulatingRetry(false);
        clearInterval(interval);
      }
    }, 1200);
  };

  // 2. Trigger CUDA Out-of-Memory (OOM) Protection Simulation
  const runOOMSimulation = () => {
    if (isSimulatingOOM) return;
    setIsSimulatingOOM(true);
    setPipelineSimLogs([
      "Launching YOLOv11 Instance Segmentation model on GPU Worker 03...",
      "[MODEL-RUN] Batch Size: 16 | Extracted frames queue: 240 items."
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        setPipelineSimLogs(prev => [
          ...prev,
          "[CRITICAL] CUDA OUT OF MEMORY (OOM) detected on Device 0 (NVIDIA RTX 4090).",
          "└─ Tried to allocate 4.12 GB (GPU 0; 24.00 GB total capacity; 21.40 GB already allocated).",
          "[INTERCEPT] Triggering PyTorch custom exception handler..."
        ]);
      } else if (step === 2) {
        setPipelineSimLogs(prev => [
          ...prev,
          "[HEAL-1] Invoking 'torch.cuda.empty_cache()' to purge orphan frame buffers.",
          "[HEAL-2] Throttling model pass configuration: Batch Size decreased from 16 to 4.",
          "[HEAL-3] Spawning clean python isolated child process..."
        ]);
      } else if (step === 3) {
        setPipelineSimLogs(prev => [
          ...prev,
          "[MODEL-RETRY] Retrying inference stream. Batch Size: 4. Memory overhead: 8.2 GB / 24 GB.",
          "[SUCCESS] Frame 1-64 segmented successfully.",
          "[SUCCESS] Frame 65-128 segmented successfully.",
          "🎉 All frames processed with 0 master process crashes! VRAM Auto-Healer: OK."
        ]);
        setIsSimulatingOOM(false);
        clearInterval(interval);
      }
    }, 1200);
  };

  // 3. Trigger CDN Cache Simulation
  const runCdnCacheSimulation = (resource: string) => {
    if (cdnCacheStatus === "fetching") return;
    setCdnCacheStatus("fetching");
    setCacheSimKey(resource);
    setPipelineSimLogs(prev => [
      ...prev,
      `[CDN] Querying cache status for: https://cdn.buildtrace.io/videos/${resource}`
    ]);

    // Simple check if it's been accessed before to show cached state
    const hasBeenCached = pipelineSimLogs.some(log => log.includes(resource) && log.includes("[CDN-MISS]"));

    setTimeout(() => {
      if (hasBeenCached) {
        // Cache Hit!
        setCdnCacheStatus("hit");
        setPipelineSimLogs(prev => [
          ...prev,
          `[CDN-HIT] Resource served directly from CloudFront Edge (mumbai-pop-1).`,
          `└─ Response time: 2ms | Cache status: HIT | Range-Requests: SUPPORTED`
        ]);
      } else {
        // Cache Miss!
        setCdnCacheStatus("miss");
        setPipelineSimLogs(prev => [
          ...prev,
          `[CDN-MISS] Resource not present on edge POPs. Fetching from Standard S3 bucket origin...`,
          `└─ Response time: 340ms | Cache status: MISS | Range-Requests: CACHED_FOR_NEXT_USERS`
        ]);
      }
    }, 1000);
  };

  // BIM Ingestion & Processing Pipeline Simulation
  const runBimImportSimulation = () => {
    if (bimImportStatus !== "idle" && bimImportStatus !== "completed") return;
    setBimImportStatus("ingesting");
    setBimImportProgress(10);
    setBimImportLogs([
      "▶ Ingestion started: Received multi-part model upload request (raw payload: 184MB)",
      "[STAGE 1/4] Writing raw block streams to cloud-accessible S3 cache segment...",
      "└─ S3 URI: s3://buildtrace-vault/incoming/model_first_floor_draft_rev4.ifc"
    ]);

    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step === 2) {
        setBimImportStatus("parsing");
        setBimImportProgress(35);
        setBimImportLogs(prev => [
          ...prev,
          "▶ Ingestion parsing initiated: Initializing WebAssembly-accelerated parser thread pool...",
          "[STAGE 2/4] ISO 10303-21 STEP physical file parser active (8 CPU cores claimed)",
          "├─ Extracted project header metadata successfully",
          "├─ Found 11,240 entity definitions (IfcWall, IfcSlab, IfcColumn, IfcPipe, etc.)",
          "└─ Traversing spatial hierarchy tree (IfcProject -> IfcSite -> IfcBuilding -> IfcBuildingStorey)..."
        ]);
      } else if (step === 3) {
        setBimImportStatus("indexing");
        setBimImportProgress(70);
        setBimImportLogs(prev => [
          ...prev,
          "▶ Geometry Extraction & Spatial Indexing active...",
          "[STAGE 3/4] Running Constructive Solid Geometry (CSG) swept solids mesh triangulations...",
          "├─ Triangulated 4,120 concrete mesh entities (1.8M faces generated)",
          "├─ Triangulated 2,410 mechanical MEP objects",
          "├─ Building spatial division map (3D Octree with max-depth = 6 levels)",
          "└─ Resolving topological boundary representation loops (IfcHalfSpaceSolid, IfcBooleanResult)..."
        ]);
      } else if (step === 4) {
        setBimImportStatus("completed");
        setBimImportProgress(100);
        setBimImportLogs(prev => [
          ...prev,
          "▶ Finalizing DB storage mapping operations...",
          "[STAGE 4/4] Writing structured property sets to PostgreSQL and indexing in Drizzle ORM...",
          "├─ Generated stable relational UUID mappings for 11,240 IFC GUIDs",
          "├─ Resolved 87 visual material color presets (Pset_WallCommon.ThermalTransmittance etc.)",
          "├─ Compressing triangle meshes into custom binary compression format (.btb mesh)",
          "🎉 Model ingestion pipeline COMPLETED in 3.6s. Interactive viewer hydrated successfully!"
        ]);
        clearInterval(interval);
      }
    }, 1200);
  };

  // BIM Comparison Engine Simulation
  const runBimCompSimulation = () => {
    if (isBimComparing) return;
    setIsBimComparing(true);
    setBimCompCompleted(false);
    setTimeout(() => {
      setIsBimComparing(false);
      setBimCompCompleted(true);
    }, 1500);
  };

  // Safe markdown render helper to structure text into styled visual modules
  const renderMarkdownText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-lg font-bold text-slate-100 mt-6 mb-3 border-b border-slate-800 pb-2">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("#### ")) {
        return (
          <h4 key={idx} className="text-base font-semibold text-indigo-400 mt-4 mb-2">
            {line.replace("#### ", "")}
          </h4>
        );
      }

      // Code blocks start / end
      if (line.startsWith("```")) {
        const lang = line.replace("```", "");
        return (
          <div key={idx} className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 my-4 overflow-x-auto relative">
            <span className="absolute right-3 top-2 text-[9px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded uppercase">
              {lang || "code"}
            </span>
          </div>
        );
      }

      // Code blocks internals (Note: we bypass actual ``` splitting by treating monospaced lines customly or reading blocks)
      const isCodeLine = line.startsWith(" ") || line.startsWith("}") || line.startsWith("{") || line.startsWith("model ") || line.startsWith("enum ") || line.startsWith("  ") || line.startsWith("  -") || line.startsWith("+--") || line.startsWith("|") || line.startsWith("import ") || line.startsWith("export ") || line.startsWith("const ") || line.startsWith("FROM ") || line.startsWith("RUN ") || line.startsWith("COPY ");
      if (isCodeLine) {
        return (
          <div key={idx} className="font-mono text-xs text-indigo-300 leading-relaxed pl-4 bg-slate-950/40 border-l border-slate-800/80">
            {line}
          </div>
        );
      }

      // Bullet points
      if (line.startsWith("* ")) {
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc mb-1.5 leading-relaxed">
            {line.replace("* ", "")}
          </li>
        );
      }

      // Normal Text Paragraphs
      if (line.trim() === "") return <div key={idx} className="h-2" />;

      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-2.5">
          {line}
        </p>
      );
    });
  };

  // Compute rotation matrix values based on state
  const cosYaw = Math.cos((yaw * Math.PI) / 180).toFixed(4);
  const sinYaw = Math.sin((yaw * Math.PI) / 180).toFixed(4);
  const negSinYaw = (-Math.sin((yaw * Math.PI) / 180)).toFixed(4);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-6">
      
      {/* Top Main Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Network className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Enterprise Architecture Spec Hub</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Principal Architect blueprint: High-throughput AI segmentations, BullMQ workers, and coordinates synchronization.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab("doc")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeTab === "doc" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            1. Architecture Doc (1-25)
          </button>
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeTab === "queue" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Workflow className="w-4 h-4" />
            2. BullMQ Simulator
          </button>
          <button
            onClick={() => setActiveTab("alignment")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeTab === "alignment" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4" />
            3. Alignment Sandbox
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeTab === "schema" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-4 h-4" />
            4. Database Schema
          </button>
          <button
            onClick={() => setActiveTab("cv")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeTab === "cv" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4" />
            5. AI & Computer Vision Spec
          </button>
          <button
            onClick={() => setActiveTab("bim")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeTab === "bim" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            6. BIM Engine Design
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeTab === "progress" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            7. Construction Progress Engine
          </button>
          <button
            onClick={() => setActiveTab("delay")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeTab === "delay" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4 text-rose-400" />
            8. Delay Prediction System
          </button>
        </div>
      </div>

      {/* Content Rendering based on selected tab */}

      {/* TAB 1: Complete 25-Section Architecture Document with Search & Navigation */}
      {activeTab === "doc" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Index sidebar & search */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search blueprints (e.g. Prisma, EKS)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* Sidebar grouped categories */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-4 max-h-[500px] overflow-y-auto">
              
              {(["Overview", "System Components", "Pipelines & Workflows", "Infrastructure & Ops", "Folder & Repo Specs"] as const).map(cat => {
                const catSections = filteredSections.filter(s => s.category === cat);
                if (catSections.length === 0) return null;

                return (
                  <div key={cat} className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase px-2 mb-1">
                      {cat}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {catSections.map(section => (
                        <button
                          key={section.id}
                          onClick={() => setSelectedSectionId(section.id)}
                          className={`text-left text-xs px-2.5 py-2 rounded-lg transition-all flex items-center justify-between ${
                            selectedSectionId === section.id
                              ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 font-semibold"
                              : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
                          }`}
                        >
                          <span className="truncate">{section.title}</span>
                          <ArrowRight className={`w-3.5 h-3.5 transition-transform ${
                            selectedSectionId === section.id ? "translate-x-0.5 text-indigo-400" : "opacity-0 group-hover:opacity-100"
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredSections.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No architecture chapters matching your search filter.
                </div>
              )}
            </div>

            {/* Technical Architect HUD Card */}
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-900/40 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Enterprise SLA Compliance</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This architecture document corresponds to BuildTrace production benchmark level 4.2. Designed to handle up to 25,000 active RERA-audited projects in concurrent execution.
              </p>
            </div>

          </div>

          {/* Right Column: Markdown Document Reader */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-6 min-h-[500px] max-h-[620px] overflow-y-auto relative">
            
            {/* Chapter indicator */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-3 mb-5">
              <span className="uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {selectedSection.category}
              </span>
              <span>BuildTrace Standard System Spec v1.4</span>
            </div>

            {/* Rendered content */}
            <div className="prose prose-invert max-w-none">
              {renderMarkdownText(selectedSection.content)}
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: Dynamic BullMQ Task Queue Simulator */}
      {activeTab === "queue" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-indigo-400" />
                Push Job to BullMQ
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Trigger simulated high-fidelity pipeline tasks. BullMQ pushes tasks to Redis where multi-threaded FastAPI CUDA clusters execute segmentation models.
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => addSimulatedJob("drone_video")}
                  className="w-full text-left p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 transition group flex justify-between items-center"
                >
                  <div>
                    <span className="text-xs font-bold text-indigo-400 block">Ingest 4K Drone Video</span>
                    <span className="text-[10px] text-slate-500">survey-ingest-queue • High priority</span>
                  </div>
                  <Play className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
                </button>

                <button
                  onClick={() => addSimulatedJob("helmet_360")}
                  className="w-full text-left p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 transition group flex justify-between items-center"
                >
                  <div>
                    <span className="text-xs font-bold text-emerald-400 block">Walkthrough Helmet Scan</span>
                    <span className="text-[10px] text-slate-500">ai-inference-queue • Std priority</span>
                  </div>
                  <Play className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                </button>

                <button
                  onClick={() => addSimulatedJob("ifc_sync")}
                  className="w-full text-left p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition group flex justify-between items-center"
                >
                  <div>
                    <span className="text-xs font-bold text-amber-400 block">IFC CAD Revision Sync</span>
                    <span className="text-[10px] text-slate-500">bim-geometry-queue • Low priority</span>
                  </div>
                  <Play className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                </button>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Active simulated tasks: {jobs.length}</span>
                <button
                  onClick={clearJobs}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Queue
                </button>
              </div>
            </div>

            {/* Architecture Ingest Diagram */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 text-[11px] text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-200 uppercase tracking-wide text-[9px] block">Pipeline Ingress Rule:</span>
              <p>
                NestJS schedules the job in BullMQ using Redis locks. Python FastAPI workers fetch payloads via atomic popping. Failures trigger immediate exponential backoffs.
              </p>
            </div>
          </div>

          {/* Active Queue Logs & Processing Feed */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Live Queue Container */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex-1 min-h-[450px] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    BullMQ Memory State: Redis-6379 Broker
                  </h3>
                  <div className="flex gap-2 text-[10px]">
                    <span className="bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded font-bold">
                      REDIS WORKERS ACTIVE: 3
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto">
                  {jobs.map(job => (
                    <div key={job.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-3">
                      
                      {/* Job Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{job.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">({job.id})</span>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-0.5 block">Allocated: {job.workerId}</span>
                        </div>

                        {/* Status pills */}
                        <div className="flex gap-1.5">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            job.priority === "high" ? "bg-red-950 text-red-400" : (job.priority === "standard" ? "bg-indigo-950 text-indigo-400" : "bg-slate-800 text-slate-400")
                          }`}>
                            {job.priority} Priority
                          </span>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            job.status === "completed"
                              ? "bg-emerald-950 text-emerald-400"
                              : (job.status === "processing" ? "bg-indigo-600 text-white animate-pulse" : "bg-slate-800 text-slate-400")
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              job.status === "completed" ? "bg-emerald-500" : "bg-indigo-500"
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{job.progress}%</span>
                      </div>

                      {/* Active Python console segment */}
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-[9px] text-slate-400 flex flex-col gap-1 select-none">
                        {job.logs.slice(-3).map((log, lIdx) => (
                          <div key={lIdx} className="flex gap-1.5 items-center">
                            <span className="text-slate-600">&gt;</span>
                            <span className={lIdx === job.logs.slice(-3).length - 1 ? "text-indigo-300" : ""}>{log}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}

                  {jobs.length === 0 && (
                    <div className="h-[250px] flex flex-col justify-center items-center text-center p-4 border border-dashed border-slate-800 rounded-xl text-slate-500">
                      <Workflow className="w-10 h-10 text-slate-700 mb-2" />
                      <h4 className="font-semibold text-slate-400 text-xs mb-0.5">BullMQ Memory Empty</h4>
                      <p className="text-[11px] leading-relaxed max-w-[250px]">
                        Push simulated jobs using the controls in the left sidebar to watch Next.js and Python FastAPI coordinate in real-time.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Memory Footprint HUD */}
              <div className="border-t border-slate-800 pt-3 mt-4 flex justify-between items-center font-mono text-[10px] text-slate-500">
                <span>Redis Key eviction: volatile-lru</span>
                <span>Active concurrency slots: 4 / 8</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: Coordinate Alignment Rigid Transformation Matrix Sandbox */}
      {activeTab === "alignment" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls columns (4 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-400" />
                Rigid 3D Matrix Transformations
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Adjust alignment vectors to align simulated physical camera scans with theoretical structural IFC coordinate planes (P_BIM = R * P_scan + T).
              </p>

              {/* Translation Sliders */}
              <div className="flex flex-col gap-3.5 border-t border-slate-800 pt-4">
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-400 font-bold">Translation X ($t_x$)</span>
                    <span className="text-indigo-400 font-mono font-bold">{tx.toFixed(1)}m</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="200"
                    step="0.5"
                    value={tx}
                    onChange={(e) => setTx(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-400 font-bold">Translation Y ($t_y$)</span>
                    <span className="text-indigo-400 font-mono font-bold">{ty.toFixed(1)}m</span>
                  </div>
                  <input
                    type="range"
                    min="900"
                    max="1100"
                    step="1"
                    value={ty}
                    onChange={(e) => setTy(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-400 font-bold">Translation Z ($t_z$)</span>
                    <span className="text-indigo-400 font-mono font-bold">{tz.toFixed(1)}m</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="0.5"
                    value={tz}
                    onChange={(e) => setTz(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-400 font-bold">Rotation Angle (Yaw / $\theta$)</span>
                    <span className="text-indigo-400 font-mono font-bold">{yaw.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    step="0.5"
                    value={yaw}
                    onChange={(e) => setYaw(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-900"
                  />
                </div>
              </div>

              {/* RANSAC indicator */}
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg text-[10px] text-slate-400 flex flex-col gap-1.5">
                <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[8px]">ICP Optimization Score:</span>
                <p className="leading-normal">
                  RANSAC rough matching aligned 15 feature vertices. Fine alignment yields Mean Squared Error (MSE) of <strong>0.0112m</strong> (Conforms to $\leq 15$mm RERA limits).
                </p>
              </div>
            </div>
          </div>

          {/* Computed Matrix Display (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Live calculation card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-800 pb-3 mb-4">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Calculated Projection Matrix $T \\in SE(3)$
                  </h3>
                  <p className="text-[10px] text-slate-500">Live coordinates calculated by FastAPI python pipeline in double-precision float format</p>
                </div>

                {/* Matrix structure representation */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-indigo-400 flex flex-col gap-2 relative">
                  <div className="absolute top-2 right-3 text-[8px] bg-slate-800 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">
                    SE3 Homogeneous Matrix
                  </div>

                  <span className="text-slate-500 mb-2">{"// Matrix translation and coordinate rotations"}</span>

                  <div className="flex gap-6 items-center">
                    <span className="text-2xl text-slate-600 font-sans">[</span>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                        <span className="text-indigo-200 font-bold">{cosYaw}</span>
                        <span className="text-indigo-200 font-bold">{negSinYaw}</span>
                        <span>0.0000</span>
                        <span className="text-indigo-400 font-extrabold">{tx.toFixed(4)}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                        <span className="text-indigo-200 font-bold">{sinYaw}</span>
                        <span className="text-indigo-200 font-bold">{cosYaw}</span>
                        <span>0.0000</span>
                        <span className="text-indigo-400 font-extrabold">{ty.toFixed(4)}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                        <span>0.0000</span>
                        <span>0.0000</span>
                        <span className="text-indigo-200 font-bold">1.0000</span>
                        <span className="text-indigo-400 font-extrabold">{tz.toFixed(4)}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px] text-slate-600">
                        <span>0.0000</span>
                        <span>0.0000</span>
                        <span>0.0000</span>
                        <span>1.0000</span>
                      </div>
                    </div>
                    <span className="text-2xl text-slate-600 font-sans">]</span>
                  </div>
                </div>

                {/* 2D alignment visualization simulator */}
                <div className="mt-5 border border-slate-800 rounded-xl p-4 bg-slate-900 flex flex-col gap-2 relative overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Spatial Coordinate Overlap Scan:</span>
                  
                  {/* Grid Simulator */}
                  <div className="h-[120px] bg-slate-950 rounded border border-slate-800/60 relative flex items-center justify-center">
                    {/* Simulated grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-30" />
                    
                    {/* Theoretical BIM shape (Fixed target) */}
                    <div className="absolute w-24 h-16 border-2 border-dashed border-indigo-500 rounded bg-indigo-500/10 flex items-center justify-center">
                      <span className="text-[8px] text-indigo-400 font-mono uppercase font-bold">Theoretical IFC</span>
                    </div>

                    {/* Scanned Point Cloud shape (Controlled by parameters) */}
                    <div
                      className="absolute w-24 h-16 border border-emerald-400 rounded bg-emerald-400/15 flex items-center justify-center transition-all duration-300 shadow-lg"
                      style={{
                        transform: `translate(${(tx - 150) * 1.5}px, ${(ty - 1000) * 0.4}px) rotate(${yaw}deg)`,
                        opacity: 0.8
                      }}
                    >
                      <span className="text-[8px] text-emerald-400 font-mono uppercase font-bold">Drone Scan</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 block text-right mt-1">Adjust sliders above to match coordinates perfectly.</span>
                </div>
              </div>

              {/* RERA alert state HUD */}
              <div className="border-t border-slate-800 pt-3 mt-4 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Transformation space: SE(3) Euclidean</span>
                <span>Active Anchor Points: 230,480 / sec</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 4: Enterprise Prisma/PostgreSQL Database Schema Explorer */}
      {activeTab === "schema" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          
          {/* Sub-navigation for Database View Modes */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <div className="flex gap-2">
              <button
                onClick={() => setDbViewMode("entities")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  dbViewMode === "entities"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                1. Table Explorer ({ENTERPRISE_DB_TABLES.length} Tables)
              </button>
              <button
                onClick={() => setDbViewMode("diagram")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  dbViewMode === "diagram"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                2. Interactive ER Map
              </button>
              <button
                onClick={() => setDbViewMode("prisma")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  dbViewMode === "prisma"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                3. Prisma-v5 Codebase Schema
              </button>
              <button
                onClick={() => setDbViewMode("specs")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  dbViewMode === "specs"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                4. Enterprise Specs (RLS, Audits, GIS)
              </button>
            </div>
            
            <div className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded border border-indigo-500/20">
              Database Core: PostgreSQL v16 Engine
            </div>
          </div>

          {/* Render Entity Explorer */}
          {dbViewMode === "entities" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: List of 21 Tables with Search */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  
                  {/* Search bar inside the Sidebar */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search tables (e.g. Schedule)..."
                      value={dbTableSearch}
                      onChange={(e) => setDbTableSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal">
                    Audit detailed PostgreSQL constraints, primary-foreign keys, nullability, and index indicators for the 21 core tables.
                  </p>

                  <div className="flex flex-col gap-1.5 pt-1 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                    {(() => {
                      const filtered = ENTERPRISE_DB_TABLES.filter(t =>
                        t.name.toLowerCase().includes(dbTableSearch.toLowerCase()) ||
                        t.desc.toLowerCase().includes(dbTableSearch.toLowerCase())
                      );
                      
                      if (filtered.length === 0) {
                        return <span className="text-center py-4 text-xs text-slate-500">No tables matching search.</span>;
                      }

                      return filtered.map(table => (
                        <button
                          key={table.name}
                          onClick={() => setSelectedTable(table.name)}
                          className={`w-full text-left p-2 rounded-lg border transition flex flex-col gap-1 ${
                            selectedTable === table.name
                              ? "bg-indigo-600/10 border-indigo-500/35 text-indigo-300 font-semibold"
                              : "bg-slate-900 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xs font-bold font-mono">{table.name}</span>
                            <span className="text-[9px] bg-slate-950 border border-slate-800/60 px-1.5 py-0.5 rounded font-mono text-slate-500">
                              {table.fields.length} cols
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 leading-normal font-sans">{table.desc}</p>
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Table Fields & Schema definitions */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {(() => {
                  const activeTableObj = ENTERPRISE_DB_TABLES.find(t => t.name === selectedTable) || ENTERPRISE_DB_TABLES[0];
                  
                  return (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 min-h-[500px] flex flex-col justify-between">
                      <div>
                        
                        {/* Selected Table Title */}
                        <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-800 pb-3.5 mb-4">
                          <div>
                            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide font-mono flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                              Table: {activeTableObj.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{activeTableObj.desc}</p>
                          </div>
                          <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-900 px-2 py-0.5 rounded font-bold font-mono uppercase">
                            Primary Key: id
                          </span>
                        </div>

                        {/* Database Fields Specifications Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-300">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                <th className="pb-2.5 pr-2">Field Name</th>
                                <th className="pb-2.5 pr-2">Postgres Type</th>
                                <th className="pb-2.5 pr-2">Constraints</th>
                                <th className="pb-2.5 pr-2">Indexed</th>
                                <th className="pb-2.5">Field / Relation Mapping Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 font-mono text-[11px] text-slate-300">
                              {activeTableObj.fields.map(field => (
                                <tr key={field.name} className="hover:bg-slate-900/40 transition-colors">
                                  <td className="py-2.5 font-bold text-indigo-300 pr-2">{field.name}</td>
                                  <td className="py-2.5 text-slate-300 pr-2">{field.type}</td>
                                  <td className="py-2.5 text-amber-500 pr-2">{field.constraint}</td>
                                  <td className="py-2.5 pr-2">
                                    {field.isIndexed ? (
                                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded text-[9px] font-bold">YES</span>
                                    ) : (
                                      <span className="text-slate-600 text-[9px]">NO</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 text-slate-400 font-sans text-xs leading-relaxed">
                                    {field.desc}
                                    {field.relation && (
                                      <span className="block text-[10px] text-indigo-400 mt-0.5 font-mono">
                                        🔗 References {field.relation}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                      </div>

                      {/* HUD footer */}
                      <div className="border-t border-slate-800 pt-3 mt-5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                        <span>Row-Level Security (RLS) & Audit Triggers Configured</span>
                        <span>Multi-tenant Isolation Tier 1</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

          {/* Render ER Diagram Canvas */}
          {dbViewMode === "diagram" && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wide">
                  Logical ER Relationship Model
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Interactive multi-entity relational schema detailing cardinality ratios (e.g. 1:N) and foreign key mappings.
                </p>
              </div>

              {/* Graphical CSS Nodes & Connectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-900/60 border border-slate-800 rounded-xl relative overflow-hidden min-h-[420px]">
                
                {/* 1. Identity Module Group */}
                <div className="border border-indigo-500/20 bg-indigo-950/15 p-4 rounded-xl flex flex-col gap-3">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 w-max">
                    1. Identity & RBAC
                  </span>
                  
                  {/* Node: Organization */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1 shadow-md hover:border-indigo-500/40 transition">
                    <span className="text-xs font-bold text-white font-mono flex items-center justify-between">
                      <span>Organization</span>
                      <span className="text-[8px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-bold">1:N</span>
                    </span>
                    <span className="text-[9px] text-slate-500 leading-normal">Slug, Name, RERA License</span>
                  </div>

                  {/* Connector line indicator */}
                  <div className="h-4 flex items-center justify-center">
                    <div className="w-0.5 h-full bg-slate-800 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-slate-500 bg-slate-950 px-1 border border-slate-800 rounded font-mono font-bold">FK</div>
                    </div>
                  </div>

                  {/* Node: User */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1 shadow-md hover:border-indigo-500/40 transition">
                    <span className="text-xs font-bold text-white font-mono flex items-center justify-between">
                      <span>User</span>
                      <span className="text-[8px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-bold">1:N</span>
                    </span>
                    <span className="text-[9px] text-slate-500 leading-normal">Email, PasswordHash, OrgId</span>
                  </div>

                  {/* Connector line indicator */}
                  <div className="h-4 flex items-center justify-center">
                    <div className="w-0.5 h-full bg-slate-800 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-slate-500 bg-slate-950 px-1 border border-slate-800 rounded font-mono font-bold">FK</div>
                    </div>
                  </div>

                  {/* Node: Role */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1 shadow-md hover:border-indigo-500/40 transition">
                    <span className="text-xs font-bold text-white font-mono flex items-center justify-between">
                      <span>Role</span>
                      <span className="text-[8px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-bold">M:N</span>
                    </span>
                    <span className="text-[9px] text-slate-500 leading-normal">Name, OrgId, UserRoles[]</span>
                  </div>
                </div>

                {/* 2. Physical Infrastructure Module */}
                <div className="border border-emerald-500/20 bg-emerald-950/15 p-4 rounded-xl flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-max block mb-3">
                      2. Physical & Spatial
                    </span>
                    
                    <div className="flex flex-col gap-3">
                      {/* Node: Project */}
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1 shadow-md hover:border-emerald-500/40 transition">
                        <span className="text-xs font-bold text-white font-mono flex items-center justify-between">
                          <span>Project</span>
                          <span className="text-[8px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-bold">1:N</span>
                        </span>
                        <span className="text-[9px] text-slate-500 leading-normal">Code, Latitude, Longitude, RERA Id</span>
                      </div>

                      {/* Node: Building */}
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1 shadow-md hover:border-emerald-500/40 transition">
                        <span className="text-xs font-bold text-white font-mono flex items-center justify-between">
                          <span>Building</span>
                          <span className="text-[8px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-bold">1:N</span>
                        </span>
                        <span className="text-[9px] text-slate-500 leading-normal">TowerCode, ProjectId</span>
                      </div>

                      {/* Node: Floor */}
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1 shadow-md hover:border-emerald-500/40 transition">
                        <span className="text-xs font-bold text-white font-mono flex items-center justify-between">
                          <span>Floor</span>
                          <span className="text-[8px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-bold">1:N</span>
                        </span>
                        <span className="text-[9px] text-slate-500 leading-normal">LevelNumber, BuildingId</span>
                      </div>

                      {/* Node: Room */}
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1 shadow-md hover:border-emerald-500/40 transition">
                        <span className="text-xs font-bold text-white font-mono flex items-center justify-between">
                          <span>Room</span>
                          <span className="text-[8px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-bold">1:N</span>
                        </span>
                        <span className="text-[9px] text-slate-500 leading-normal">GridCode, FloorId</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. BIM Element & CV Pipeline Module */}
                <div className="border border-amber-500/20 bg-amber-950/15 p-4 rounded-xl flex flex-col gap-3">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 w-max">
                    3. BIM & Ingest Pipeline
                  </span>

                  {/* Node: BimElement */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1 shadow-md hover:border-amber-500/40 transition">
                    <span className="text-xs font-bold text-white font-mono flex items-center justify-between">
                      <span>BimElement</span>
                      <span className="text-[8px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-bold">1:1</span>
                    </span>
                    <span className="text-[9px] text-slate-500 leading-normal">IFC GUID, Name, Coordinates, BoundingBox</span>
                  </div>

                  {/* Node: Video */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1 shadow-md hover:border-amber-500/40 transition">
                    <span className="text-xs font-bold text-white font-mono flex items-center justify-between">
                      <span>Video / Scan</span>
                      <span className="text-[8px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-bold">1:N</span>
                    </span>
                    <span className="text-[9px] text-slate-500 leading-normal">S3 Url, CaptureType, BullMQ Status</span>
                  </div>

                  {/* Node: Frame */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1 shadow-md hover:border-amber-500/40 transition">
                    <span className="text-xs font-bold text-white font-mono flex items-center justify-between">
                      <span>Frame Capture</span>
                      <span className="text-[8px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-bold">1:N</span>
                    </span>
                    <span className="text-[9px] text-slate-500 leading-normal">OffsetTimestamp, ImageUrl, Extrinsics</span>
                  </div>

                  {/* Node: AIPrediction */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1 shadow-md hover:border-amber-500/40 transition">
                    <span className="text-xs font-bold text-white font-mono flex items-center justify-between">
                      <span>AIPrediction</span>
                      <span className="text-[8px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-bold">YOLO</span>
                    </span>
                    <span className="text-[9px] text-slate-500 leading-normal">Confidence, ClassLabel, BoundingBox</span>
                  </div>
                </div>

              </div>

              {/* Copyable Mermaid ER String block */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Enterprise Mermaid.js ER Definition Code</span>
                <pre className="p-4 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 font-mono text-[10px] overflow-x-auto max-h-[160px] leading-relaxed">
{`erDiagram
    ORGANIZATION ||--o{ USER : "has"
    ORGANIZATION ||--o{ PROJECT : "owns"
    ORGANIZATION ||--o{ ROLE : "defines"
    USER ||--o{ USER_ROLE : "assumes"
    ROLE ||--o{ USER_ROLE : "assigned"
    PROJECT ||--o{ BUILDING : "houses"
    BUILDING ||--o{ FLOOR : "has"
    FLOOR ||--o{ ROOM : "contains"
    FLOOR ||--o{ BIM_ELEMENT : "maps"
    BIM_ELEMENT ||--o{ PROGRESS : "records"
    PROJECT ||--o{ VIDEO : "captures"
    VIDEO ||--o{ FRAME : "extracts"
    FRAME ||--o{ AI_PREDICTION : "detects"
    AI_PREDICTION ||--o| BIM_ELEMENT : "labels"
    PROJECT ||--o{ ISSUE : "flags"
    ISSUE ||--o{ COMMENT : "discusses"
    ISSUE ||--o{ FILE : "attaches"`}
                </pre>
              </div>
            </div>
          )}

          {/* Render Prisma Code View */}
          {dbViewMode === "prisma" && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">
                    schema.prisma (Production Schema v5.2)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Fully normalized structure including soft-deletes and temporal indexing</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(PRISMA_SCHEMA_CODE);
                    setCopiedPrisma(true);
                    setTimeout(() => setCopiedPrisma(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition"
                >
                  {copiedPrisma ? "✓ Copied to clipboard" : "Copy Schema"}
                </button>
              </div>

              {/* Prisma Code representation */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-indigo-300 max-h-[480px] overflow-y-auto leading-relaxed relative">
                <span className="absolute top-2 right-3 text-[9px] bg-slate-800 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">
                  Prisma Code Block
                </span>
                <pre>{PRISMA_SCHEMA_CODE}</pre>
              </div>
            </div>
          )}

          {/* Render Technical Specs (Soft Deletes, Audits, Indexes, Temporal Versioning) */}
          {dbViewMode === "specs" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              
              {/* Left Spec Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 w-max block mb-1">
                    System Design Parameter
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                    Soft Deletes & Audit Trails
                  </h3>
                </div>

                <div className="flex flex-col gap-3.5 text-xs text-slate-400 leading-relaxed font-sans">
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">1. Global Soft Delete Filtering</h4>
                    <p>
                      Every multi-tenant entity (Organization, User, Project, Building, Issue) implements a nullable `deletedAt DateTime?` index. When an operator deletes an asset, the system updates `deletedAt` rather than executing a hard SQL deletion, ensuring legal data lineage under state RERA regulations.
                    </p>
                  </div>
                  <div className="border-t border-slate-800/60 pt-3">
                    <h4 className="font-bold text-slate-200 mb-1">2. Transactional Audit Versioning</h4>
                    <p>
                      The `AuditLog` table stores JSON snapshots of `oldValues` and `newValues` before any update transaction completes. Audit triggers capture the user ID, project context, action (INSERT/UPDATE/DELETE), and device IP address to maintain cryptographic trace trails for active construction timelines.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Spec Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-max block mb-1">
                    PostgreSQL Tuning Specs
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                    Spatial Indexes & GIS Overlays
                  </h3>
                </div>

                <div className="flex flex-col gap-3.5 text-xs text-slate-400 leading-relaxed font-sans">
                  <div>
                    <h4 className="font-bold text-slate-200 mb-1">1. GIS Coordinate Index (GIST)</h4>
                    <p>
                      Projects contain GPS coordinate markers. The coordinates in the database are indexed using high-efficiency GIST spatial indexes inside PostgreSQL:
                    </p>
                    <pre className="p-2 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-indigo-300 mt-1.5">
                      CREATE INDEX project_coords_idx ON "Project" USING gist (
                        ll_to_earth(latitude, longitude)
                      );
                    </pre>
                  </div>
                  <div className="border-t border-slate-800/60 pt-3">
                    <h4 className="font-bold text-slate-200 mb-1">2. Multi-Column Temporal B-Trees</h4>
                    <p>
                      In order to query progressive construction timelines in sub-millisecond ranges, compound indexes are active on `BimElement(guid, floorId)` and `Progress(activityId, measuredAt)`. This enables extremely high throughput for real-time video inference synchronization.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 5: Complete AI & Computer Vision Spec */}
      {activeTab === "cv" && (
        <div className="flex flex-col gap-6 animate-fade-in w-full">
          
          {/* Sub Tab Controls inside CV */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-xs">
              <button
                onClick={() => setCvSubTab("pipeline")}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold ${
                  cvSubTab === "pipeline" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Workflow className="w-4 h-4" />
                16-Step AI Pipeline Flow
              </button>
              <button
                onClick={() => setCvSubTab("manual")}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold ${
                  cvSubTab === "manual" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                22-Chapter DL Manual
              </button>
              <button
                onClick={() => setCvSubTab("production")}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold ${
                  cvSubTab === "production" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Server className="w-4 h-4" />
                Production Video Pipeline
              </button>
            </div>
            
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pipeline: Ready</span>
            </div>
          </div>

          {/* Sub Tab 1: 16-Step AI Pipeline Flow */}
          {cvSubTab === "pipeline" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Stepper list of 16 steps (4 Cols) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold px-1">
                  Sequential Execution Chain
                </div>
                
                <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1 bg-slate-950/20 border border-slate-800/40 p-2.5 rounded-xl">
                  {AI_PIPELINE_STEPS.map((step) => {
                    const isActive = selectedPipelineStepId === step.id;
                    return (
                      <button
                        key={step.id}
                        onClick={() => setSelectedPipelineStepId(step.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all duration-150 flex items-center gap-3 relative overflow-hidden group ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-950 to-slate-900 border-indigo-500/80 shadow-md"
                            : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {/* Glow effect on active */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                        )}
                        
                        {/* Step Number Badge */}
                        <span className={`w-6 h-6 rounded-lg text-[11px] font-bold font-mono flex items-center justify-center shrink-0 ${
                          isActive ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-500 group-hover:text-slate-300"
                        }`}>
                          {step.id}
                        </span>

                        {/* Title & Category */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-bold truncate ${isActive ? "text-indigo-300" : ""}`}>
                            {step.title}
                          </h4>
                          <span className="text-[9px] uppercase font-semibold text-slate-500 block tracking-wider mt-0.5">
                            {step.category}
                          </span>
                        </div>
                        
                        {/* Interactive Status Indicator */}
                        <span className="text-[10px] text-slate-500 group-hover:translate-x-0.5 transition-transform shrink-0">
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Interactive Panel (8 Cols) */}
              {(() => {
                const activeStep = AI_PIPELINE_STEPS.find(s => s.id === selectedPipelineStepId) || AI_PIPELINE_STEPS[0];
                return (
                  <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 max-h-[720px] overflow-y-auto relative animate-fade-in">
                    
                    {/* Step Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                            Step {activeStep.id} - {activeStep.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-white mt-2 tracking-tight">
                          {activeStep.title}
                        </h3>
                      </div>
                      
                      <div className="text-[11px] bg-slate-900 text-slate-400 font-mono border border-slate-800/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span>GPU CUDA Segmented</span>
                      </div>
                    </div>

                    {/* Step Summary */}
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-white block mb-1">Functional Pipeline Objective:</span>
                      {activeStep.summary}
                    </div>

                    {/* Grid of details: Algorithm, Models, Libraries, Optimizations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Left: Algorithm Details */}
                      <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                          Mathematical Algorithm
                        </h4>
                        <div>
                          <span className="text-xs font-bold text-indigo-300 block mb-1">
                            {activeStep.algorithm.name}
                          </span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {activeStep.algorithm.description}
                          </p>
                        </div>
                        
                        {activeStep.algorithm.mathFormula && (
                          <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-center text-xs text-indigo-400 leading-normal flex items-center justify-center">
                            {activeStep.algorithm.mathFormula}
                          </div>
                        )}
                      </div>

                      {/* Right: Infrastructure & Execution badging */}
                      <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-4">
                        
                        {/* Models & Networks */}
                        <div className="flex flex-col gap-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                            Deep Learning Models
                          </h4>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {activeStep.models.map((mod, i) => (
                              <span key={i} className="text-[10px] font-mono bg-slate-900 border border-slate-800/80 text-slate-300 px-2 py-1 rounded font-bold">
                                {mod}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Libraries & Frameworks */}
                        <div className="flex flex-col gap-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                            <Network className="w-3.5 h-3.5 text-indigo-400" />
                            Libraries & SDKs
                          </h4>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {activeStep.libraries.map((lib, i) => (
                              <span key={i} className="text-[10px] font-mono bg-slate-900 border border-slate-800/80 text-indigo-400 px-2.5 py-1 rounded font-bold">
                                {lib}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Performance Optimizations block */}
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        Performance Optimization Techniques
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {activeStep.optimizations.map((opt, i) => (
                          <li key={i} className="text-[11px] text-slate-300 leading-normal flex items-start gap-2 pl-1">
                            <span className="text-indigo-400 font-bold shrink-0">✓</span>
                            <span>{opt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Architecture diagram visualization terminal */}
                    <div className="flex flex-col gap-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                        Step-by-Step Data Flow Architecture
                      </span>
                      <pre className="p-4 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 font-mono text-[10px] overflow-x-auto leading-relaxed relative">
                        <span className="absolute right-3 top-2 text-[9px] bg-slate-950 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                          ascii flow diagram
                        </span>
                        {activeStep.diagram}
                      </pre>
                    </div>

                  </div>
                );
              })()}

            </div>
          )}

          {/* Sub Tab 2: 22-Chapter DL Manual (Existing chapters view) */}
          {cvSubTab === "manual" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Index sidebar & search */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                
                {/* Search Input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search CV modules (e.g. YOLO, tracking)..."
                    value={cvSearchQuery}
                    onChange={(e) => setCvSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                {/* Sidebar grouped categories */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-4 max-h-[500px] overflow-y-auto">
                  
                  {(["Detection & Segmentation", "Tracking & Dewarping", "Training & Data", "Evaluation & Deploy"] as const).map(cat => {
                    const catSections = filteredCVSections.filter(s => s.category === cat);
                    if (catSections.length === 0) return null;

                    return (
                      <div key={cat} className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase px-2 mb-1">
                          {cat}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          {catSections.map(section => (
                            <button
                              key={section.id}
                              onClick={() => setSelectedCVSectionId(section.id)}
                              className={`text-left text-xs px-2.5 py-2 rounded-lg transition-all flex items-center justify-between ${
                                selectedCVSectionId === section.id
                                  ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 font-semibold"
                                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent"
                              }`}
                            >
                              <span className="truncate">{section.title}</span>
                              <ArrowRight className={`w-3.5 h-3.5 transition-transform ${
                                selectedCVSectionId === section.id ? "translate-x-0.5 text-indigo-400" : "opacity-0 group-hover:opacity-100"
                              }`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {filteredCVSections.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No CV spec chapters matching your search filter.
                    </div>
                  )}
                </div>

                {/* CV Principal Engineer HUD Card */}
                <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-900/40 p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                    <Cpu className="w-4 h-4" />
                    <span>Computer Vision Core Engine</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This specification document has been approved by the Principal CV Engineer. Designed to process continuous 360-degree site helmet feeds with sub-25mm geometric coordination accuracy.
                  </p>
                </div>

              </div>

              {/* Right Column: Markdown Document Reader */}
              <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl p-6 min-h-[500px] max-h-[620px] overflow-y-auto relative">
                
                {/* Chapter indicator */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-3 mb-5">
                  <span className="uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {selectedCVSection.category}
                  </span>
                  <span>BuildTrace Deep Learning Spec v2.1</span>
                </div>

                {/* Rendered content */}
                <div className="prose prose-invert max-w-none">
                  {renderMarkdownText(selectedCVSection.content)}
                </div>

              </div>

            </div>
          )}

          {/* Sub Tab 3: Production Video Pipeline Specs & Simulators */}
          {cvSubTab === "production" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
              
              {/* Left Column: Sidebar of 6 stages & Real-Time Ingestion Logs Monitor (4 Cols) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold px-1">
                  6-Stage Production Spec Sections
                </div>
                
                {/* 6 Stages List */}
                <div className="flex flex-col gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                  {PRODUCTION_PIPELINE_DATA.map((section) => {
                    const isActive = selectedProdSectionId === section.id;
                    
                    // Render Icon based on string
                    let SectionIcon = Server;
                    if (section.icon === "CloudLightning") SectionIcon = CloudLightning;
                    else if (section.icon === "Camera") SectionIcon = Camera;
                    else if (section.icon === "Cpu") SectionIcon = Cpu;
                    else if (section.icon === "ShieldAlert") SectionIcon = ShieldAlert;
                    else if (section.icon === "Database") SectionIcon = Database;

                    return (
                      <button
                        key={section.id}
                        onClick={() => setSelectedProdSectionId(section.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all duration-150 flex items-center gap-3 relative overflow-hidden group ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-950 to-slate-900 border-indigo-500/80 shadow-md"
                            : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                        )}
                        
                        <span className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${
                          isActive ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" : "bg-slate-900 border-slate-800 text-slate-500 group-hover:text-slate-400"
                        }`}>
                          <SectionIcon className="w-4 h-4" />
                        </span>

                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-bold truncate ${isActive ? "text-indigo-300" : ""}`}>
                            {section.title}
                          </h4>
                          <span className="text-[9px] uppercase font-semibold text-slate-500 block tracking-wider mt-0.5">
                            PROD INFRASTRUCTURE
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* REAL-TIME SIMULATION MONITOR PANEL */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span>Pipeline Event Telemetry</span>
                    </div>
                    <button
                      onClick={() => setPipelineSimLogs(["[MONITOR] Clear log telemetry initialized."])}
                      className="text-[9px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wide font-mono"
                    >
                      Clear Logs
                    </button>
                  </div>

                  {/* Log Screen */}
                  <div className="h-[220px] bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[10px] text-emerald-400 overflow-y-auto flex flex-col gap-1.5 leading-normal relative select-none">
                    <span className="absolute right-2 top-2 text-[8px] bg-slate-950 text-emerald-500 font-bold px-1 py-0.5 rounded uppercase border border-emerald-500/20 animate-pulse">
                      live console
                    </span>
                    {pipelineSimLogs.map((log, i) => (
                      <div key={i} className={`whitespace-pre-wrap ${
                        log.startsWith("[ERROR]") || log.startsWith("[CRITICAL]") ? "text-red-400 font-bold" :
                        log.startsWith("[SUCCESS]") || log.startsWith("🎉") ? "text-emerald-300 font-bold" :
                        log.startsWith("[RETRY") || log.startsWith("[INTERCEPT") || log.startsWith("[HEAL") ? "text-amber-300" :
                        log.startsWith("[CDN") ? "text-indigo-300" : "text-slate-300"
                      }`}>
                        {log}
                      </div>
                    ))}
                  </div>

                  {/* Interactive Trigger Buttons */}
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">
                      Trigger Edge failure scenarios
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={runRetrySimulation}
                        disabled={isSimulatingRetry}
                        className={`text-[10px] font-bold py-1.5 px-2 rounded-lg border transition duration-150 text-center flex items-center justify-center gap-1 ${
                          isSimulatingRetry
                            ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-red-950/20 border-red-900/40 hover:bg-red-950/40 text-red-400 hover:border-red-500/30"
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>S3 Retry (Backoff)</span>
                      </button>

                      <button
                        onClick={runOOMSimulation}
                        disabled={isSimulatingOOM}
                        className={`text-[10px] font-bold py-1.5 px-2 rounded-lg border transition duration-150 text-center flex items-center justify-center gap-1 ${
                          isSimulatingOOM
                            ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-amber-950/20 border-amber-900/40 hover:bg-amber-950/40 text-amber-400 hover:border-amber-500/30"
                        }`}
                      >
                        <Cpu className="w-3.5 h-3.5 shrink-0" />
                        <span>CUDA OOM Protect</span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1 mt-1">
                        Test CloudFront HLS CDN Edge
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => runCdnCacheSimulation("walk_L1.m3u8")}
                          disabled={cdnCacheStatus === "fetching"}
                          className="text-[10px] font-semibold py-1 px-2 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500/30 hover:bg-slate-850 text-slate-300 transition"
                        >
                          Query: L1 Corridor
                        </button>
                        <button
                          onClick={() => runCdnCacheSimulation("walk_L2_highres.mp4")}
                          disabled={cdnCacheStatus === "fetching"}
                          className="text-[10px] font-semibold py-1 px-2 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500/30 hover:bg-slate-850 text-slate-300 transition"
                        >
                          Query: L2 Video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Full Architecture Specs & ASCII Flow Diagrams (8 Cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {(() => {
                  const activeSec = PRODUCTION_PIPELINE_DATA.find(s => s.id === selectedProdSectionId) || PRODUCTION_PIPELINE_DATA[0];
                  return (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 max-h-[780px] overflow-y-auto relative animate-fade-in">
                      
                      {/* Section Header */}
                      <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                        <div>
                          <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                            Enterprise Production Spec
                          </span>
                          <h3 className="text-xl font-black text-white mt-2 tracking-tight font-sans">
                            {activeSec.title}
                          </h3>
                        </div>
                        <div className="text-[11px] bg-slate-900 text-slate-400 font-mono border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active Spec v3.4</span>
                        </div>
                      </div>

                      {/* Brief Summary */}
                      <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4 text-xs text-indigo-200 leading-relaxed">
                        <span className="font-bold text-white block mb-1">Architectural Scope Summary:</span>
                        {activeSec.summary}
                      </div>

                      {/* Sub-Components Mapping */}
                      <div className="flex flex-col gap-5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                          Core Components & Implementation Mandates
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeSec.subcomponents.map((comp, idx) => (
                            <div key={idx} className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-3 justify-between">
                              <div>
                                <h5 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  {comp.name}
                                </h5>
                                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                                  {comp.description}
                                </p>
                                
                                <ul className="flex flex-col gap-1.5">
                                  {comp.details.map((det, dIdx) => (
                                    <li key={dIdx} className="text-[10px] text-slate-300 pl-2.5 relative leading-relaxed">
                                      <span className="absolute left-0 text-indigo-400">•</span>
                                      {det}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="border-t border-slate-800 pt-3 mt-1 flex flex-col gap-2">
                                {comp.modelsOrLibraries && (
                                  <div className="flex flex-wrap gap-1 items-center">
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mr-1">Tech:</span>
                                    {comp.modelsOrLibraries.map((lib, lIdx) => (
                                      <span key={lIdx} className="text-[9px] font-mono bg-slate-950 border border-slate-800 text-indigo-300 px-1.5 py-0.5 rounded">
                                        {lib}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {comp.performanceMetric && (
                                  <div className="text-[9px] text-emerald-400 font-semibold bg-emerald-950/15 border border-emerald-900/30 p-1.5 rounded flex items-center gap-1">
                                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                                    <span>{comp.performanceMetric}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Unified Architecture Visual Flow Diagrams (ASCII) */}
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                            Interactive Architectural Workflow Diagram
                          </span>
                          <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            v3.4 spec
                          </span>
                        </div>
                        <pre className="p-4 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 font-mono text-[10px] overflow-x-auto leading-relaxed relative">
                          <span className="absolute right-3 top-2 text-[8px] bg-slate-950 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase font-mono border border-slate-800">
                            UML WORKFLOW
                          </span>
                          {activeSec.diagram}
                        </pre>
                      </div>

                    </div>
                  );
                })()}
              </div>

            </div>
          )}

        </div>
      )}

      {activeTab === "bim" && (
        <div className="flex flex-col gap-6 animate-fade-in w-full">
          <BimEngineDesign />
        </div>
      )}

      {activeTab === "progress" && (
        <div className="flex flex-col gap-6 animate-fade-in w-full">
          <ProgressEngineDesign />
        </div>
      )}

      {activeTab === "delay" && (
        <div className="flex flex-col gap-6 animate-fade-in w-full">
          <DelayPredictionDesign />
        </div>
      )}

    </div>
  );
}
