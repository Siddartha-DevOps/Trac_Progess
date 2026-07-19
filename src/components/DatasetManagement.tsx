import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Database,
  Layers,
  Search,
  Plus,
  Download,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  Activity,
  FileText,
  RefreshCw,
  Trash2,
  Calendar,
  MapPin,
  Camera,
  Cpu,
  Check,
  X,
  ChevronRight,
  Info,
  Sliders,
  ArrowRight,
  Shield,
  FileCode,
  FolderOpen,
  Filter,
  PieChart,
  Grid,
  List,
  Flame,
  CheckSquare,
  AlertCircle,
  Settings,
  HelpCircle
} from "lucide-react";

// Interfaces for our Dataset items
interface DatasetImage {
  id: string;
  filename: string;
  imageUrl: string;
  projectId: string;
  projectName: string;
  qualityScore: number; // 0 to 100
  status: "PENDING" | "APPROVED" | "REJECTED" | "IN_REVIEW";
  resolution: string;
  captureDate: string;
  metadata: {
    camera: { make: string; model: string; focalLength: string; fNumber: string };
    bim: { ifcGuid: string; category: string; floor: string };
    gps: { lat: number; lng: number; alt: number };
  };
  issues: {
    corrupted: boolean;
    duplicate: boolean;
    missingMetadata: boolean;
  };
}

interface DatasetVersion {
  version: string;
  releaseDate: string;
  imageCount: number;
  author: string;
  description: string;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
}

interface PipelineStatus {
  taskId: string;
  type: "IMPORT" | "EXPORT" | "SPLIT" | "MERGE" | "AUDIT";
  progress: number;
  status: "RUNNING" | "COMPLETED" | "FAILED";
  message: string;
}

export default function DatasetManagement() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "explorer" | "versioning" | "ops" | "audit" | "approval" | "architecture">("dashboard");
  const [selectedImage, setSelectedImage] = useState<DatasetImage | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>("v2.1-stable");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuality, setFilterQuality] = useState<"all" | "high" | "low">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "PENDING" | "APPROVED" | "REJECTED" | "IN_REVIEW">("all");
  const [filterIssues, setFilterIssues] = useState<"all" | "corrupted" | "duplicate" | "missing">("all");

  // Interactive state controllers
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingType, setProcessingType] = useState<string>("");
  const [activePipeline, setActivePipeline] = useState<PipelineStatus | null>(null);

  // Schema and code view states
  const [codeTab, setCodeTab] = useState<"postgres" | "fastapi" | "celery" | "prompts">("postgres");

  // State mock data representing construction image collections
  const [images, setImages] = useState<DatasetImage[]>([
    {
      id: "IMG-9012",
      filename: "reality_capture_l01_sec3_081.jpg",
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&auto=format&fit=crop&q=60",
      projectId: "PRJ-Alpha",
      projectName: "Downtown Medical Center",
      qualityScore: 92.4,
      status: "APPROVED",
      resolution: "4096 x 2048 (360°)",
      captureDate: "2026-07-15 09:42",
      metadata: {
        camera: { make: "Insta360", model: "ONE RS 1-Inch", focalLength: "14mm", fNumber: "f/2.2" },
        bim: { ifcGuid: "col-7f4c9a12-bd88", category: "IfcColumn", floor: "Floor 01" },
        gps: { lat: 37.7749, lng: -122.4194, alt: 124.5 }
      },
      issues: { corrupted: false, duplicate: false, missingMetadata: false }
    },
    {
      id: "IMG-9013",
      filename: "hvac_duct_installation_012.jpg",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60",
      projectId: "PRJ-Alpha",
      projectName: "Downtown Medical Center",
      qualityScore: 88.1,
      status: "IN_REVIEW",
      resolution: "3024 x 4032",
      captureDate: "2026-07-16 11:15",
      metadata: {
        camera: { make: "Apple", model: "iPhone 15 Pro", focalLength: "24mm", fNumber: "f/1.78" },
        bim: { ifcGuid: "duct-3a8d9e22-ff88", category: "IfcDuctSegment", floor: "Floor 01" },
        gps: { lat: 37.7751, lng: -122.4192, alt: 125.1 }
      },
      issues: { corrupted: false, duplicate: false, missingMetadata: false }
    },
    {
      id: "IMG-9014",
      filename: "conrete_slab_leveling_v02.jpg",
      imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=500&auto=format&fit=crop&q=60",
      projectId: "PRJ-Beta",
      projectName: "Metropolitan Life Tower",
      qualityScore: 42.5,
      status: "PENDING",
      resolution: "1920 x 1080",
      captureDate: "2026-07-18 14:02",
      metadata: {
        camera: { make: "GoPro", model: "Hero 11", focalLength: "16mm", fNumber: "f/2.5" },
        bim: { ifcGuid: "slab-a412f5e3-c211", category: "IfcSlab", floor: "Floor 03" },
        gps: { lat: 40.7128, lng: -74.006, alt: 45.2 }
      },
      issues: { corrupted: false, duplicate: true, missingMetadata: false }
    },
    {
      id: "IMG-9015",
      filename: "corrupted_stream_unreadable.jpg",
      imageUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=500&auto=format&fit=crop&q=60",
      projectId: "PRJ-Alpha",
      projectName: "Downtown Medical Center",
      qualityScore: 12.0,
      status: "REJECTED",
      resolution: "Unknown",
      captureDate: "2026-07-19 02:11",
      metadata: {
        camera: { make: "Unknown", model: "Unknown", focalLength: "Unknown", fNumber: "Unknown" },
        bim: { ifcGuid: "Unknown", category: "Unknown", floor: "Unknown" },
        gps: { lat: 0, lng: 0, alt: 0 }
      },
      issues: { corrupted: true, duplicate: false, missingMetadata: true }
    },
    {
      id: "IMG-9016",
      filename: "drywall_paneling_l02_sec1.jpg",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60",
      projectId: "PRJ-Beta",
      projectName: "Metropolitan Life Tower",
      qualityScore: 78.4,
      status: "PENDING",
      resolution: "3024 x 4032",
      captureDate: "2026-07-19 05:01",
      metadata: {
        camera: { make: "Samsung", model: "Galaxy S23", focalLength: "23mm", fNumber: "f/1.8" },
        bim: { ifcGuid: "wall-e4f8a329-8472", category: "IfcWallStandardCase", floor: "Floor 02" },
        gps: { lat: 40.713, lng: -74.0058, alt: 48.9 }
      },
      issues: { corrupted: false, duplicate: false, missingMetadata: false }
    }
  ]);

  const [versions, setVersions] = useState<DatasetVersion[]>([
    { version: "v2.1-stable", releaseDate: "2026-07-10", imageCount: 142905, author: "Dr. Clara Mercer (Head of CV)", description: "Production dataset mapped to complete multi-view concrete and structural column IFC instances. Certified drift-free.", status: "ACTIVE" },
    { version: "v2.0-baseline", releaseDate: "2026-05-18", imageCount: 98110, author: "Marc Wood (MLOps Principal)", description: "Initial release matching structural framing walls with LiDAR spatial alignments.", status: "ARCHIVED" },
    { version: "v2.2-rc1", releaseDate: "Pending Approval", imageCount: 18290, author: "You (Head of MLOps)", description: "Contains active validation walkthrough captures including newly integrated MEP ductwork segmentations.", status: "DRAFT" }
  ]);

  // Operations and split ratios
  const [splitRatio, setSplitRatio] = useState({ train: 80, val: 10, test: 10 });
  const [mergeSourceVersion, setMergeSourceVersion] = useState("v2.0-baseline");
  const [mergeTargetVersion, setMergeTargetVersion] = useState("v2.2-rc1");

  // Handler to run pipeline actions (e.g., merge, split, quality audits)
  const triggerPipelineOp = (type: "IMPORT" | "EXPORT" | "SPLIT" | "MERGE" | "AUDIT", durationMs: number = 2000) => {
    setIsProcessing(true);
    setProcessingType(type);
    setProcessingProgress(0);
    
    setActivePipeline({
      taskId: `task-${Math.random().toString(36).substr(2, 9)}`,
      type,
      progress: 0,
      status: "RUNNING",
      message: `Asynchronous multi-threaded pipeline execution initialized for operations: ${type}`
    });

    const step = 10;
    const intervalTime = durationMs / (100 / step);
    
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        const next = prev + step;
        
        setActivePipeline(curr => curr ? {
          ...curr,
          progress: next >= 100 ? 100 : next,
          status: next >= 100 ? "COMPLETED" : "RUNNING",
          message: next >= 100 
            ? `Successfully completed operations cluster: ${type}. All records updated in PostgreSQL spatial instances.` 
            : `Processing pipeline ${type}... ${next}% completed`
        } : null);

        if (next >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          // Auto update statistics or trigger mutations
          if (type === "AUDIT") {
            // Simulated fix: detect duplicates and corruption
            setImages(prevImages => 
              prevImages.map(img => {
                if (img.issues.corrupted) {
                  return { ...img, status: "REJECTED" as const };
                }
                return img;
              })
            );
          }
          return 100;
        }
        return next;
      });
    }, intervalTime);
  };

  // Approval actions
  const updateImageStatus = (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, status: newStatus } : img));
    if (selectedImage?.id === id) {
      setSelectedImage(curr => curr ? { ...curr, status: newStatus } : null);
    }
  };

  // Filters calculation
  const filteredImages = images.filter((img) => {
    const matchesSearch = img.filename.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          img.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          img.metadata.bim.ifcGuid.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesQuality = filterQuality === "all" 
      ? true 
      : filterQuality === "high" ? img.qualityScore >= 75 : img.qualityScore < 75;

    const matchesStatus = filterStatus === "all" ? true : img.status === filterStatus;

    const matchesIssues = filterIssues === "all"
      ? true
      : filterIssues === "corrupted" ? img.issues.corrupted
      : filterIssues === "duplicate" ? img.issues.duplicate
      : img.issues.missingMetadata;

    return matchesSearch && matchesQuality && matchesStatus && matchesIssues;
  });

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-2xl overflow-hidden" id="dataset-management-platform">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 shadow-md">
            <Database className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">Enterprise Dataset Management Platform</h2>
              <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">MLOps Hub</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">SaaS scale data warehousing for millions of construction reality capture assets integrated with BIM GUID indices.</p>
          </div>
        </div>

        {/* Global Toolbar Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto shrink-0">
          {[
            { id: "dashboard", label: "Dashboard", icon: PieChart },
            { id: "explorer", label: "Explorer", icon: Grid },
            { id: "versioning", label: "Versioning", icon: GitBranch },
            { id: "ops", label: "Split/Merge/Import", icon: Sliders },
            { id: "audit", label: "Quality Audit", icon: AlertTriangle },
            { id: "approval", label: "Approval Workflow", icon: CheckSquare },
            { id: "architecture", label: "Architecture Specs", icon: FileCode }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedImage(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PIPELINE LIVE STATUS FLASH BAR */}
      {activePipeline && (
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all ${
          activePipeline.status === "COMPLETED" 
            ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
            : activePipeline.status === "FAILED"
            ? "bg-rose-950/20 border-rose-500/20 text-rose-300"
            : "bg-indigo-950/20 border-indigo-500/20 text-indigo-300 animate-pulse"
        }`}>
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 animate-spin" />
            <div>
              <span className="text-[10px] font-mono font-bold block uppercase">
                ACTIVE QUEUE WORKER: {activePipeline.type} Pipeline [ {activePipeline.taskId} ]
              </span>
              <p className="text-xs mt-0.5">{activePipeline.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-32 bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  activePipeline.status === "COMPLETED" ? "bg-emerald-500" : "bg-indigo-500"
                }`}
                style={{ width: `${activePipeline.progress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold">{activePipeline.progress}%</span>
          </div>
        </div>
      )}

      {/* WORKSPACE AREA */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">

          {/* TAB 1: DASHBOARD METRICS & HEALTH OVERVIEW */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Telemetry Panel */}
              <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Total Images</span>
                    <span className="text-xl font-extrabold text-white font-mono mt-1 block">1,429,052</span>
                    <span className="text-[9px] text-emerald-400 mt-1 block font-semibold flex items-center gap-1">
                      +18,290 Walkthrough (v2.2-rc1)
                    </span>
                  </div>
                  <Database className="w-8 h-8 text-indigo-500/20" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Dataset Drift Score</span>
                    <span className="text-xl font-extrabold text-white font-mono mt-1 block">0.021 PSI</span>
                    <span className="text-[9px] text-emerald-400 mt-1 block font-semibold">
                      Excellent class balance
                    </span>
                  </div>
                  <Cpu className="w-8 h-8 text-emerald-500/20" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Avg Image Quality</span>
                    <span className="text-xl font-extrabold text-indigo-400 font-mono mt-1 block">88.4%</span>
                    <span className="text-[9px] text-indigo-300 mt-1 block font-semibold">
                      BRISQUE Objective Metric
                    </span>
                  </div>
                  <Sliders className="w-8 h-8 text-indigo-500/20" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Anomalous / Corrupted</span>
                    <span className="text-xl font-extrabold text-rose-400 font-mono mt-1 block">18 Images</span>
                    <span className="text-[9px] text-rose-300 mt-1 block font-semibold">
                      Flagged for MLOps review
                    </span>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-rose-500/20" />
                </div>
              </div>

              {/* Core Quality Audit stats */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Real-time Dataset Quality & Health Distribution</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase font-mono block">Metadata Completeness</span>
                    <span className="text-2xl font-extrabold font-mono text-white">99.2%</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      99.2% of images contain valid Camera Exif, GPS, and BIM mapping GUID metadata records.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase font-mono block">Duplicate Rate</span>
                    <span className="text-2xl font-extrabold font-mono text-white">0.08%</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Deep perceptual hash check mapping ensures no identical spatial walkthrough coordinates.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase font-mono block">Approved/Draft Ratio</span>
                    <span className="text-2xl font-extrabold font-mono text-white">12.1x</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Approved enterprise baseline v2.1 outweighs newly loaded review iterations.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex flex-col gap-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase font-mono block">AUTOMATED INGESTION CHECKS</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-white block">Lens Distortion Correction</strong>
                        Radial & tangential lens coefficients calibrated on-the-fly for every capture walkthrough.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-white block">Perceptual Hashing (pHash)</strong>
                        Detects redundant sequence overlaps automatically prior to entering training batches.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right panel: Dataset version baseline registry */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  <span>Certified Baseline Registries</span>
                </h3>

                <div className="flex flex-col gap-3">
                  {versions.map((ver, i) => (
                    <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-white text-xs font-mono">{ver.version}</span>
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                          ver.status === "ACTIVE" 
                            ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                            : ver.status === "ARCHIVED"
                            ? "bg-slate-900 border-slate-800 text-slate-400"
                            : "bg-amber-950/40 border-amber-500/20 text-amber-400"
                        }`}>
                          {ver.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{ver.description}</p>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1.5 border-t border-slate-900">
                        <span>Released: {ver.releaseDate}</span>
                        <span className="text-white">{ver.imageCount.toLocaleString()} imgs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DATASET EXPLORER AND METADATA */}
          {activeTab === "explorer" && (
            <motion.div
              key="explorer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Filter controls left-side (3 cols) */}
              <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Filter className="w-4 h-4 text-indigo-400" />
                  <span>Explorer Filters</span>
                </h3>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Search Queries</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filename, GUID or Project"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Image Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 font-mono font-bold w-full"
                  >
                    <option value="all">ALL STATES</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="IN_REVIEW">IN REVIEW</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Quality Score Threshold</label>
                  <select
                    value={filterQuality}
                    onChange={(e) => setFilterQuality(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 font-mono font-bold w-full"
                  >
                    <option value="all">ALL QUALITY SCORES</option>
                    <option value="high">HIGH ( &gt;= 75% )</option>
                    <option value="low">LOW ( &lt; 75% )</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Anomaly Issues</label>
                  <select
                    value={filterIssues}
                    onChange={(e) => setFilterIssues(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 font-mono font-bold w-full"
                  >
                    <option value="all">NO ANOMALY FILTERS</option>
                    <option value="corrupted">CORRUPTED IMAGES</option>
                    <option value="duplicate">DUPLICATE IMAGES</option>
                    <option value="missing">MISSING METADATA</option>
                  </select>
                </div>
              </div>

              {/* Grid content explorer middle (6 cols) */}
              <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-indigo-400" />
                    <span>Walkthrough Image Grid ({filteredImages.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-[420px] pr-1">
                  {filteredImages.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img)}
                      className={`group relative text-left bg-slate-950 border rounded-xl overflow-hidden p-1 flex flex-col gap-2 transition-all cursor-pointer ${
                        selectedImage?.id === img.id
                          ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg"
                          : "border-slate-850 hover:border-slate-700"
                      }`}
                    >
                      <div className="h-28 rounded-lg overflow-hidden bg-slate-900 relative">
                        <img 
                          src={img.imageUrl} 
                          alt={img.filename} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className={`absolute top-2 right-2 text-[8px] font-bold font-mono px-1 py-0.5 rounded border ${
                          img.status === "APPROVED" 
                            ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400"
                            : img.status === "IN_REVIEW"
                            ? "bg-amber-950/80 border-amber-500/30 text-amber-400"
                            : "bg-rose-950/80 border-rose-500/30 text-rose-400"
                        }`}>
                          {img.status}
                        </span>
                      </div>
                      <div className="px-1.5 pb-1">
                        <span className="font-bold text-[11px] text-white block truncate">{img.filename}</span>
                        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-1">
                          <span>Qual: {img.qualityScore}%</span>
                          <span className="text-slate-400">{img.id}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail view right-side (3 cols) */}
              <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <span>Metadata Detail Viewer</span>
                </h3>

                {selectedImage ? (
                  <div className="flex flex-col gap-4">
                    <div className="h-32 rounded-lg overflow-hidden bg-slate-950 border border-slate-850">
                      <img src={selectedImage.imageUrl} alt={selectedImage.filename} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col gap-3 font-mono text-[10px]">
                      <div className="border-b border-slate-950 pb-2">
                        <span className="text-slate-500 uppercase block font-bold text-[9px]">File Properties</span>
                        <span className="text-white font-extrabold mt-1 block truncate">{selectedImage.filename}</span>
                        <span className="text-slate-400 mt-0.5 block">{selectedImage.resolution}</span>
                      </div>

                      <div className="border-b border-slate-950 pb-2 flex flex-col gap-1">
                        <span className="text-slate-500 uppercase block font-bold text-[9px]">Camera Calibration</span>
                        <div className="flex justify-between"><span className="text-slate-400">Device:</span> <span className="text-white font-bold">{selectedImage.metadata.camera.make} {selectedImage.metadata.camera.model}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Aperture:</span> <span className="text-white font-bold">{selectedImage.metadata.camera.fNumber}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Focal length:</span> <span className="text-white font-bold">{selectedImage.metadata.camera.focalLength}</span></div>
                      </div>

                      <div className="border-b border-slate-950 pb-2 flex flex-col gap-1">
                        <span className="text-slate-500 uppercase block font-bold text-[9px]">BIM Coordinates</span>
                        <div className="flex justify-between"><span className="text-slate-400">IFC Class:</span> <span className="text-indigo-400 font-bold">{selectedImage.metadata.bim.category}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">GUID Reference:</span> <span className="text-slate-300 select-all font-bold">{selectedImage.metadata.bim.ifcGuid}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Level:</span> <span className="text-white font-bold">{selectedImage.metadata.bim.floor}</span></div>
                      </div>

                      <div className="border-b border-slate-950 pb-2 flex flex-col gap-1">
                        <span className="text-slate-500 uppercase block font-bold text-[9px]">GPS Coordinates</span>
                        <div className="flex justify-between"><span className="text-slate-400">Latitude:</span> <span className="text-white font-bold">{selectedImage.metadata.gps.lat}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Longitude:</span> <span className="text-white font-bold">{selectedImage.metadata.gps.lng}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Altitude (m):</span> <span className="text-white font-bold">{selectedImage.metadata.gps.alt}m</span></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-xl">
                    Select any reality capture image to inspect spatial camera alignment telemetry parameters.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: DATASET VERSIONING */}
          {activeTab === "versioning" && (
            <motion.div
              key="versioning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  <span>Interactive Version branching & MLOps baselines</span>
                </h3>

                <p className="text-xs text-slate-400">
                  Manage certified baseline versions for training neural nets. Tagging baselines creates dynamic views of images. Changing active baselines immediately swaps spatial database caches.
                </p>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-4">
                  <span className="text-[10px] text-indigo-400 font-bold font-mono block uppercase">CREATE NEW DATASET VERSION BRANCH</span>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-mono font-bold uppercase">VERSION IDENTIFIER (SEMVER)</label>
                      <input 
                        type="text" 
                        defaultValue="v2.2-stable"
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white" 
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-mono font-bold uppercase">PARENT RELEASE ORIGIN</label>
                      <select className="bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white font-bold">
                        <option>v2.1-stable</option>
                        <option>v2.0-baseline</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label className="text-slate-500 font-mono font-bold uppercase">CHANGELOG DESCRIPTION / REMARKS</label>
                      <textarea 
                        defaultValue="Includes validation sweeps of Floor 02 and Floor 03 drywalls, incorporating SAM2 segmentation annotations."
                        rows={3}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-900">
                    <button 
                      onClick={() => triggerPipelineOp("SPLIT", 1500)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs uppercase tracking-wider text-white rounded-lg cursor-pointer"
                    >
                      Branch Version Registry
                    </button>
                  </div>
                </div>
              </div>

              {/* Version History Info (4 cols) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Registry Changelog Timeline</span>
                </h3>

                <div className="flex flex-col gap-4 font-mono text-[10px] text-slate-400">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <div>
                      <strong className="text-white block">v2.1-stable (Active)</strong>
                      142,905 images tagged. Model training benchmark hit 94.2% mAP on multi-view column segmentations.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <div>
                      <strong className="text-white block">v2.0-baseline</strong>
                      98,110 images locked. Retained for historical model calibration regression runs.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-400 mt-0.5" />
                    <div>
                      <strong className="text-white block">v2.2-rc1 (Draft)</strong>
                      18,290 images tagged. Blocked under active QA workflow audit queue checks.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: DATASET OPS - MERGE, SPLIT, IMPORT */}
          {activeTab === "ops" && (
            <motion.div
              key="ops"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Dataset Merge & Split Operations Left (6 cols) */}
              <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  <span>Interactive Merge & Split Workflows</span>
                </h3>

                {/* Merge Tool */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
                  <span className="text-[10px] text-indigo-400 font-bold font-mono block uppercase">Dataset Merger</span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-mono font-bold uppercase">Merge Source Version</label>
                      <select 
                        value={mergeSourceVersion}
                        onChange={(e) => setMergeSourceVersion(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white"
                      >
                        <option value="v2.0-baseline">v2.0-baseline</option>
                        <option value="v2.1-stable">v2.1-stable</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-mono font-bold uppercase">Target Host version</label>
                      <select 
                        value={mergeTargetVersion}
                        onChange={(e) => setMergeTargetVersion(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white"
                      >
                        <option value="v2.2-rc1">v2.2-rc1 (Draft)</option>
                        <option value="v2.1-stable">v2.1-stable</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => triggerPipelineOp("MERGE", 2500)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-[10px] uppercase tracking-wider text-white rounded-lg cursor-pointer"
                    >
                      Execute Merge Sweep
                    </button>
                  </div>
                </div>

                {/* Split Tool */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
                  <span className="text-[10px] text-indigo-400 font-bold font-mono block uppercase">Train / Validation / Test Splitter</span>
                  <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold uppercase">Train ratio %</label>
                      <input 
                        type="number" 
                        value={splitRatio.train}
                        onChange={(e) => setSplitRatio({...splitRatio, train: Number(e.target.value)})}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold uppercase">Val ratio %</label>
                      <input 
                        type="number" 
                        value={splitRatio.val}
                        onChange={(e) => setSplitRatio({...splitRatio, val: Number(e.target.value)})}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500 font-bold uppercase">Test ratio %</label>
                      <input 
                        type="number" 
                        value={splitRatio.test}
                        onChange={(e) => setSplitRatio({...splitRatio, test: Number(e.target.value)})}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => triggerPipelineOp("SPLIT", 2000)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-[10px] uppercase tracking-wider text-white rounded-lg cursor-pointer"
                    >
                      Compute Split Partitions
                    </button>
                  </div>
                </div>
              </div>

              {/* Ingestion & Export specifications panel Right (6 cols) */}
              <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>Import & Export Formats Registry</span>
                </h3>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-3 text-xs">
                  <span className="text-[10px] text-indigo-400 font-bold font-mono block uppercase">EXPORT FORMAT CONVERSION</span>
                  <p className="text-slate-400">
                    Compile spatial baseline datasets directly into model-ready annotations formats including <strong>YOLOv12 Poly-Bounds</strong>, <strong>COCO Instance Masks</strong>, and <strong>TFRecord</strong>.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    <button 
                      onClick={() => triggerPipelineOp("EXPORT", 1500)}
                      className="p-3 border border-slate-800 hover:border-slate-700 bg-slate-900 text-left font-mono rounded-xl cursor-pointer"
                    >
                      <strong className="text-white block">YOLOv12 Format</strong>
                      Produces poly-bounds text registries
                    </button>
                    <button 
                      onClick={() => triggerPipelineOp("EXPORT", 1500)}
                      className="p-3 border border-slate-800 hover:border-slate-700 bg-slate-900 text-left font-mono rounded-xl cursor-pointer"
                    >
                      <strong className="text-white block">COCO Dataset Format</strong>
                      Produces monolithic instance JSON maps
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-3 text-xs">
                  <span className="text-[10px] text-indigo-400 font-bold font-mono block uppercase">REALITY CAPTURE INGESTION</span>
                  <p className="text-slate-400">
                    Upload reality capture streams directly. The queue parses camera parameters, extracts BIM coordinates from world poses, and indexes GPS logs dynamically.
                  </p>

                  <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500 font-mono flex flex-col items-center justify-center gap-2">
                    <Plus className="w-6 h-6 text-indigo-400" />
                    <span>Drag & drop reality capture ZIP / TAR files here</span>
                    <button 
                      onClick={() => triggerPipelineOp("IMPORT", 3000)}
                      className="px-3 py-1.5 bg-indigo-900/60 hover:bg-indigo-900 text-indigo-300 font-bold font-mono rounded-lg text-[10px] uppercase border border-indigo-500/20 mt-2 cursor-pointer"
                    >
                      Map Ingestion Bundle
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: AUTOMATED QUALITY AUDIT */}
          {activeTab === "audit" && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-12 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Automated Image Quality & Integrity Audits</span>
                  </h3>
                  <button 
                    onClick={() => triggerPipelineOp("AUDIT", 2000)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase rounded-lg font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Trigger Integrity Scan</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Every asset entering the baseline registry undergoes neural image validation to isolate corrupted files, duplicate exposures, and incomplete metadata schemas.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/20 flex flex-col justify-between gap-3 relative overflow-hidden">
                    <div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border bg-rose-950 text-rose-400 border-rose-500/20 uppercase">CORRUPTION DETECTED</span>
                      <h4 className="font-extrabold text-white text-xs mt-3 font-mono">corrupted_stream_unreadable.jpg</h4>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        Incomplete file transfer or corrupted binary stream header detected. Yields unreadable JPEG compression blocks.
                      </p>
                    </div>
                    <div className="flex justify-between items-center font-mono text-[9px] pt-3 border-t border-slate-900 text-slate-500">
                      <span>ID: IMG-9015</span>
                      <span className="text-rose-400 font-bold">Purge Suggested</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 flex flex-col justify-between gap-3 relative overflow-hidden">
                    <div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border bg-amber-950 text-amber-400 border-amber-500/20 uppercase">PERCEPTUAL DUPLICATE</span>
                      <h4 className="font-extrabold text-white text-xs mt-3 font-mono">conrete_slab_leveling_v02.jpg</h4>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        Hash match score of 99.4% with base image from prior walkthrough sequence. Increases training redundancy.
                      </p>
                    </div>
                    <div className="flex justify-between items-center font-mono text-[9px] pt-3 border-t border-slate-900 text-slate-500">
                      <span>ID: IMG-9014</span>
                      <span className="text-amber-400 font-bold">Merge Recommended</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3 relative overflow-hidden">
                    <div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border bg-slate-900 text-slate-400 border-slate-800 uppercase">METADATA COMPLIANT</span>
                      <h4 className="font-extrabold text-white text-xs mt-3 font-mono">reality_capture_l01_sec3_081.jpg</h4>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        All GPS metadata, Camera calibration metrics, and BIM IFC class relations successfully parsed.
                      </p>
                    </div>
                    <div className="flex justify-between items-center font-mono text-[9px] pt-3 border-t border-slate-900 text-slate-500">
                      <span>ID: IMG-9012</span>
                      <span className="text-emerald-400 font-bold">Status: Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: DATASET APPROVAL WORKFLOW */}
          {activeTab === "approval" && (
            <motion.div
              key="approval"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-12 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>Role-Based Dataset Approval Signoff Queue</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Muti-Stage Review Pipeline</span>
                </div>

                <p className="text-xs text-slate-400">
                  Ensure newly captured reality image packages are approved by annotators and ML leaders before merging into the main v2.1 baseline registries.
                </p>

                <div className="flex flex-col gap-3 mt-2">
                  {images.filter(img => img.status === "PENDING" || img.status === "IN_REVIEW").map((img) => (
                    <div key={img.id} className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-850 shrink-0">
                          <img src={img.imageUrl} alt={img.filename} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-xs font-mono">{img.filename}</span>
                            <span className="bg-amber-950/40 text-amber-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-amber-500/20 uppercase">
                              {img.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            Project: {img.projectName} | Captured: {img.captureDate}
                          </p>
                          <p className="text-[10px] text-indigo-400 mt-0.5 font-mono">
                            IFC Target Element: {img.metadata.bim.category} (GUID: {img.metadata.bim.ifcGuid})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => updateImageStatus(img.id, "APPROVED")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase font-mono rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button 
                          onClick={() => updateImageStatus(img.id, "REJECTED")}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase font-mono rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {images.filter(img => img.status === "PENDING" || img.status === "IN_REVIEW").length === 0 && (
                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-mono">
                      All walkthrough image captures are signed off. Baseline registry contains 100% certified instances.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 7: SYSTEM ARCHITECTURE SPECIFICATION */}
          {activeTab === "architecture" && (
            <motion.div
              key="architecture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-indigo-400" />
                      <span>Enterprise Backend Specifications - Dataset Platform</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">High-concurrency data models, FastAPI schemas, and Redis job queue brokers.</p>
                  </div>
                  
                  {/* Selectors for Code Sub-Tabs */}
                  <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-lg">
                    {[
                      { id: "postgres", label: "PostgreSQL DDL" },
                      { id: "fastapi", label: "FastAPI Endpoints" },
                      { id: "celery", label: "Celery Workers" },
                      { id: "prompts", label: "Claude Code Prompts" }
                    ].map((codeSub) => (
                      <button
                        key={codeSub.id}
                        onClick={() => setCodeTab(codeSub.id as any)}
                        className={`px-3 py-1 rounded text-[10px] font-bold font-mono transition-all cursor-pointer ${
                          codeTab === codeSub.id 
                            ? "bg-indigo-600 text-white shadow" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {codeSub.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PostgreSQL Schema Spec */}
                {codeTab === "postgres" && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] scrollbar-thin">
                    <pre>{`-- PostgreSQL DDL for Dataset Management Platform

CREATE TABLE dataset_versions (
    version_id VARCHAR(64) PRIMARY KEY,
    description TEXT,
    image_count INT NOT NULL DEFAULT 0,
    author_id UUID,
    status VARCHAR(32) DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dataset_images (
    image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(256) NOT NULL,
    storage_url VARCHAR(512) NOT NULL,
    project_id UUID NOT NULL,
    quality_score DOUBLE PRECISION NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING',
    resolution VARCHAR(64),
    capture_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Nested Metadata structures indexed via JSONB
    camera_metadata JSONB NOT NULL,
    bim_metadata JSONB NOT NULL,
    gps_coordinates JSONB NOT NULL,
    
    -- Quality triggers
    is_corrupted BOOLEAN DEFAULT FALSE,
    is_duplicate BOOLEAN DEFAULT FALSE,
    missing_metadata BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimize queries on quality indexes
CREATE INDEX idx_dataset_quality ON dataset_images (quality_score);
CREATE INDEX idx_dataset_gps ON dataset_images USING gin (gps_coordinates);
CREATE INDEX idx_dataset_bim ON dataset_images USING gin (bim_metadata);
`}</pre>
                  </div>
                )}

                {/* FastAPI Schema Spec */}
                {codeTab === "fastapi" && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] scrollbar-thin">
                    <pre>{`# backend/app/api/endpoints/datasets.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter(prefix="/api/v1/datasets", tags=["dataset-ops"])

class SplitDatasetPayload(BaseModel):
    version: str
    train_ratio: float = Field(0.8, ge=0.0, le=1.0)
    val_ratio: float = Field(0.1, ge=0.0, le=1.0)
    test_ratio: float = Field(0.1, ge=0.0, le=1.0)

class MergeDatasetPayload(BaseModel):
    source_version: str
    target_version: str

class IngestRealityCapturePayload(BaseModel):
    project_id: str
    object_storage_uri: str

@router.post("/split")
async def split_dataset(payload: SplitDatasetPayload, background_tasks: BackgroundTasks):
    """Triggers asynchronous Celery worker to segment dataset partitions"""
    return {
        "task_id": "celery-split-f492b",
        "status": "QUEUED",
        "message": "Split partitioning task submitted to background worker queue."
    }

@router.post("/merge")
async def merge_datasets(payload: MergeDatasetPayload):
    """Triggers database procedures to map instances in matching baselines"""
    return {
        "task_id": "celery-merge-98a1c",
        "status": "PROCESSING"
    }
`}</pre>
                  </div>
                )}

                {/* Celery Schema Spec */}
                {codeTab === "celery" && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] scrollbar-thin">
                    <pre>{`# backend/app/worker.py
from celery import Celery
import os
import redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("dataset_workers", broker=REDIS_URL, backend=REDIS_URL)

@celery_app.task(name="tasks.perform_perceptual_hash_deduplication")
def run_deduplication_audit(image_ids: list):
    """
    Leverages multi-threaded Python loops to calculate perceptual hash (pHash) 
    similarities. Flags identical images within sub-millisecond ranges.
    """
    # 1. Fetch images from bucket
    # 2. Compute visual hash matrix
    # 3. Locate hash collisions
    return {"scanned": len(image_ids), "duplicates_purged": 2}
`}</pre>
                  </div>
                )}

                {/* Claude Code prompts */}
                {codeTab === "prompts" && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] scrollbar-thin">
                    <pre>{`# Dependency-Ordered Development Prompts for Claude Code

# Prompt 1: Database Schemas
"Generate SQLAlchemy model entities in 'backend/app/models/dataset.py' mapping columns, GPS JSONB parameters, camera calibrations, and quality checkpoints. Include multi-stage partition mappings."

# Prompt 2: FastAPI Routing Structures
"Create API route file 'backend/app/api/endpoints/datasets.py' with Pydantic payload models validating split ratios (le=1.0) and triggers for Celery background tasks."

# Prompt 3: Redis / Celery Task Engine
"Implement multi-threaded MLOps tasks in 'backend/app/worker.py' computing deep perceptual hashes (pHash) and objective BRISQUE quality scores for incoming reality capture JPEGs."
`}</pre>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
