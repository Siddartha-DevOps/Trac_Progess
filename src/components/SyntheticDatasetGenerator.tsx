import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileCode,
  Database,
  Cpu,
  Layers,
  Settings,
  HelpCircle,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  Sparkles,
  Tv,
  CheckCircle,
  Download,
  Terminal,
  Shield,
  Zap,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  Camera,
  Sun,
  CloudRain,
  Wind,
  HardHat,
  Truck,
  Box,
  Image,
  Layers3,
  ExternalLink,
  Lock,
  GitBranch,
  Copy,
  Check
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

// Interfaces for Synthetic Generation State
interface SyntheticTask {
  id: string;
  name: string;
  status: "idle" | "running" | "completed" | "paused" | "failed";
  progress: number;
  generatedCount: number;
  totalTarget: number;
  currentSpeed: number; // images / sec
  estimatedTimeRemaining: string;
  gpuUtilization: number;
  storageSize: string;
}

interface ImageSequence {
  id: string;
  title: string;
  timestamp: string;
  lighting: string;
  weather: string;
  dustDensity: string;
  workerCount: number;
  hasEquipment: boolean;
  viewpoint: string;
  bboxCount: number;
  imageUrl: string;
  bboxes: Array<{
    label: string;
    x: number; // percentage
    y: number; // percentage
    w: number; // percentage
    h: number; // percentage
    color: string;
  }>;
}

export default function SyntheticDatasetGenerator() {
  const [activeTab, setActiveTab] = useState<"config" | "environment" | "labels" | "live-generator" | "architecture">("config");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // --- TAB 1: Config & Assets States ---
  const [selectedBimSource, setSelectedBimSource] = useState<"ifc" | "revit" | "existing">("existing");
  const [customFileName, setCustomFileName] = useState<string>("");
  const [customFileSize, setCustomFileSize] = useState<string>("");
  const [workerDensity, setWorkerDensity] = useState<number>(3); // scale 0-10
  const [equipmentDensity, setEquipmentDensity] = useState<number>(2); // scale 0-10
  const [occlusionFactor, setOcclusionFactor] = useState<number>(40); // percentage
  const [randomMaterials, setRandomMaterials] = useState<boolean>(true);
  const [predefinedBim, setPredefinedBim] = useState<string>("BIM-BlockB-Structural.ifc");

  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; status: string }>>([
    { name: "Terminal3_RoofSystem_Phase2.rvt", size: "142.4 MB", status: "Validated" },
    { name: "UndergroundParking_rebar_Level0.ifc", size: "84.1 MB", status: "Validated" }
  ]);

  const [workerPpeMix, setWorkerPpeMix] = useState({
    helmetRequired: true,
    hiVisRequired: true,
    harnessRequired: false,
    glovesRequired: true
  });

  const [materialsList, setMaterialsList] = useState([
    { name: "C30 Concrete (New Pour)", randomized: true, variance: "High" },
    { name: "Structural Mild Steel A36", randomized: true, variance: "Low" },
    { name: "Formwork Pine Timber", randomized: true, variance: "Medium" },
    { name: "Weathered Excavation Earth", randomized: false, variance: "None" }
  ]);

  // --- TAB 2: Environment & Trajectories States ---
  const [cameraTrajectory, setCameraTrajectory] = useState<"drone-scanning" | "crane-cam" | "ground-inspector" | "corner-fixed" | "orbit-helix">("drone-scanning");
  const [frameStepRate, setFrameStepRate] = useState<number>(15); // steps per path segment
  const [lightingPeriod, setLightingPeriod] = useState<"solar-noon" | "golden-hour" | "twilight" | "night-artificial" | "random-cycle">("golden-hour");
  const [weatherCondition, setWeatherCondition] = useState<"clear" | "rainy" | "foggy" | "dust-storm" | "random-weather">("foggy");
  const [dustDensity, setDustDensity] = useState<number>(65); // percentage
  const [cloudDensity, setCloudDensity] = useState<number>(80); // percentage

  // --- TAB 3: Labeling & Format Export States ---
  const [exportFormat, setExportFormat] = useState<"yolov8" | "coco-json" | "pascal-voc" | "custom-analytics">("yolov8");
  const [generate2DBox, setGenerate2DBox] = useState<boolean>(true);
  const [generate3DBox, setGenerate3DBox] = useState<boolean>(true);
  const [generateInstanceMasks, setGenerateInstanceMasks] = useState<boolean>(true);
  const [generateDepthMaps, setGenerateDepthMaps] = useState<boolean>(true);
  const [annotationFrequency, setAnnotationFrequency] = useState<number>(1); // every N frames

  // --- TAB 4: Live Generator Task Manager States ---
  const [activeTask, setActiveTask] = useState<SyntheticTask>({
    id: "synth-task-091",
    name: "Golden Hour BIM Concrete Hard Example Run",
    status: "idle",
    progress: 0,
    generatedCount: 0,
    totalTarget: 500000,
    currentSpeed: 0,
    estimatedTimeRemaining: "00:00:00",
    gpuUtilization: 0,
    storageSize: "0.0 GB"
  });

  const [activeGpus, setActiveGpus] = useState([
    { name: "NVIDIA H100 Node 1 - GPU 0", temp: 72, usage: 0, vram: "80GB / 80GB" },
    { name: "NVIDIA H100 Node 1 - GPU 1", temp: 70, usage: 0, vram: "80GB / 80GB" },
    { name: "NVIDIA H100 Node 1 - GPU 2", temp: 74, usage: 0, vram: "80GB / 80GB" },
    { name: "NVIDIA H100 Node 1 - GPU 3", temp: 69, usage: 0, vram: "80GB / 80GB" }
  ]);

  const [generationLogs, setGenerationLogs] = useState<string[]>([
    "System Initialized. Awaiting model/trajectory inputs...",
    "Telemetry workers bound to port 50051 (gRPC gateway ready).",
    "Pre-heated Blender-Server orchestration pool (4 instances connected)."
  ]);

  // Image sequence simulated gallery (showing labels overlay)
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [showLabelOverlay, setShowLabelOverlay] = useState<boolean>(true);

  const imageSequences: ImageSequence[] = [
    {
      id: "syn-001",
      title: "Rebar Reinforcement Grid Occlusion Frame",
      timestamp: "0.2s from path start",
      lighting: "Golden Hour",
      weather: "Heavy Fog",
      dustDensity: "65%",
      workerCount: 3,
      hasEquipment: true,
      viewpoint: "Drone Scan Z=14m",
      bboxCount: 4,
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80",
      bboxes: [
        { label: "IfcRebar_Grid", x: 10, y: 15, w: 80, h: 70, color: "border-red-500 text-red-400 bg-red-500/10" },
        { label: "Worker_PPE", x: 25, y: 35, w: 18, h: 45, color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
        { label: "Helmet_OK", x: 28, y: 35, w: 8, h: 8, color: "border-indigo-400 text-indigo-300 bg-indigo-400/10" },
        { label: "Excavator_CAT320", x: 55, y: 40, w: 35, h: 45, color: "border-amber-500 text-amber-400 bg-amber-500/10" }
      ]
    },
    {
      id: "syn-002",
      title: "HVAC Segment Spline Construction Path",
      timestamp: "1.5s from path start",
      lighting: "Artificial Floodlights",
      weather: "Dusty Clear",
      dustDensity: "80%",
      workerCount: 1,
      hasEquipment: false,
      viewpoint: "Ground Inspector Crane Cam",
      bboxCount: 3,
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
      bboxes: [
        { label: "IfcDuctSegment", x: 30, y: 20, w: 50, h: 30, color: "border-cyan-500 text-cyan-400 bg-cyan-500/10" },
        { label: "Worker_NoPPE_Alert", x: 15, y: 45, w: 20, h: 50, color: "border-rose-500 text-rose-400 bg-rose-500/10" },
        { label: "Scaffolding_Occlusion", x: 5, y: 5, w: 90, h: 90, color: "border-slate-500 text-slate-300 bg-slate-500/5" }
      ]
    },
    {
      id: "syn-003",
      title: "Slab Edge Formwork Casting Pouring",
      timestamp: "3.2s from path start",
      lighting: "Solar Noon High Albedo",
      weather: "Sunny Glare",
      dustDensity: "10%",
      workerCount: 4,
      hasEquipment: true,
      viewpoint: "Tower Crane Fixed Anchor",
      bboxCount: 5,
      imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=800&auto=format&fit=crop&q=80",
      bboxes: [
        { label: "IfcSlab_Formwork", x: 20, y: 30, w: 60, h: 50, color: "border-amber-400 text-amber-300 bg-amber-400/10" },
        { label: "Worker_Crouching", x: 45, y: 40, w: 12, h: 30, color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
        { label: "ConcretePump_Arm", x: 5, y: 10, w: 40, h: 80, color: "border-indigo-400 text-indigo-300 bg-indigo-400/10" },
        { label: "Safety_Harness_OK", x: 47, y: 42, w: 8, h: 18, color: "border-cyan-400 text-cyan-300 bg-cyan-400/10" },
        { label: "Worker_Signaling", x: 75, y: 35, w: 15, h: 45, color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" }
      ]
    }
  ];

  // Simulated metrics of historical rendering sessions
  const historicalSessionsData = [
    { label: "Session 1", images: 120000, duration: 18 },
    { label: "Session 2", images: 340000, duration: 44 },
    { label: "Session 3", images: 750000, duration: 92 },
    { label: "Session 4", images: 1200000, duration: 150 },
    { label: "Current Plan", images: activeTask.totalTarget, duration: Math.ceil(activeTask.totalTarget / 8500) }
  ];

  // --- TAB 5: Production Architecture Blueprints & Source Code ---
  const [architectureSubTab, setArchitectureSubTab] = useState<"database" | "worker" | "apis" | "docker">("database");

  // Handler for file upload trigger
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      const newFile = {
        name: file.name,
        size: `${sizeInMB} MB`,
        status: "Validated"
      };
      setUploadedFiles([newFile, ...uploadedFiles]);
      setPredefinedBim(file.name);
      alert(`BIM model '${file.name}' imported & successfully validated for geometry structure bounding meshes!`);
    }
  };

  // Handler to start/pause simulation
  const toggleGenerationTask = () => {
    if (activeTask.status === "idle" || activeTask.status === "paused") {
      setActiveTask((prev) => ({ ...prev, status: "running" }));
      // Pre-heat log statements
      setGenerationLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Spawning Ray rendering workers over H100 clusters...`,
        `[${new Date().toLocaleTimeString()}] Loading mesh elements from '${predefinedBim}' into memory context...`,
        `[${new Date().toLocaleTimeString()}] Applying material randomizations & surface scattering textures...`,
        ...prev
      ]);
    } else {
      setActiveTask((prev) => ({ ...prev, status: "paused", currentSpeed: 0, gpuUtilization: 0 }));
    }
  };

  // Log simulation effect during "running" status
  useEffect(() => {
    let interval: any;
    if (activeTask.status === "running") {
      interval = setInterval(() => {
        setActiveTask((prev) => {
          if (prev.generatedCount >= prev.totalTarget) {
            clearInterval(interval);
            setGenerationLogs((logs) => [
              `[${new Date().toLocaleTimeString()}] Completed Synthetic Dataset generation of ${prev.totalTarget} images.`,
              `[${new Date().toLocaleTimeString()}] Output packaged to TAR.GZ containing YOLOv8 formatting + label annotations.`,
              ...logs
            ]);
            return {
              ...prev,
              status: "completed",
              progress: 100,
              generatedCount: prev.totalTarget,
              currentSpeed: 0,
              estimatedTimeRemaining: "00:00:00"
            };
          }

          const rate = 1450 + Math.floor(Math.random() * 320); // random images per cycle
          const nextCount = Math.min(prev.totalTarget, prev.generatedCount + rate);
          const nextProgress = Math.min(100, Number(((nextCount / prev.totalTarget) * 100).toFixed(1)));
          
          // Speed / Rem calculations
          const imagesPerSec = 780 + Math.floor(Math.random() * 120);
          const secondsRemaining = Math.max(0, Math.ceil((prev.totalTarget - nextCount) / imagesPerSec));
          const hours = Math.floor(secondsRemaining / 3600).toString().padStart(2, "0");
          const mins = Math.floor((secondsRemaining % 3600) / 60).toString().padStart(2, "0");
          const secs = (secondsRemaining % 60).toString().padStart(2, "0");

          // Randomize GPUs temp/usages as we run
          setActiveGpus((gpus) =>
            gpus.map((gpu) => ({
              ...gpu,
              usage: 88 + Math.floor(Math.random() * 10),
              temp: 72 + Math.floor(Math.random() * 6)
            }))
          );

          // Push periodic logs
          if (Math.random() > 0.6) {
            const sampleLogs = [
              `Rendering index [${nextCount}] - view vector applied camera theta=${(Math.random() * 360).toFixed(1)}°`,
              `Synthesizing weather artifacts [Condition: ${weatherCondition}] cloud density: ${cloudDensity}%`,
              `Label mapping complete for rebar & workers PPE configuration indices`,
              `Generated instance masks bounding vectors on BIM entity tags`,
              `Wrote batch checkpoint to high-performance local NVMe array`
            ];
            const chosenLog = sampleLogs[Math.floor(Math.random() * sampleLogs.length)];
            setGenerationLogs((logs) => [`[${new Date().toLocaleTimeString()}] ${chosenLog}`, ...logs.slice(0, 30)]);
          }

          return {
            ...prev,
            generatedCount: nextCount,
            progress: nextProgress,
            currentSpeed: imagesPerSec,
            estimatedTimeRemaining: `${hours}:${mins}:${secs}`,
            gpuUtilization: 92,
            storageSize: `${(nextCount * 0.00032).toFixed(2)} GB` // approx 320kb per image + metadata
          };
        });
      }, 900);
    }
    return () => clearInterval(interval);
  }, [activeTask.status, weatherCondition, cloudDensity]);

  // Reset Task
  const resetGenerationTask = () => {
    setActiveTask({
      id: `synth-task-${Math.floor(100 + Math.random() * 900)}`,
      name: `Synthetics_${predefinedBim.replace(".ifc", "").replace(".rvt", "")}_Session`,
      status: "idle",
      progress: 0,
      generatedCount: 0,
      totalTarget: activeTask.totalTarget,
      currentSpeed: 0,
      estimatedTimeRemaining: "00:00:00",
      gpuUtilization: 0,
      storageSize: "0.0 GB"
    });
    setGenerationLogs([
      `[${new Date().toLocaleTimeString()}] Generation context recycled. State is idle. Ready to initiate renderer.`
    ]);
    setActiveGpus((gpus) => gpus.map((g) => ({ ...g, usage: 0 })));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-2xl overflow-hidden" id="synthetic-dataset-generator">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 shadow-md">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">SynthetiCon® Automated Dataset Synthesizer</h2>
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">Mass Scale Engine</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ingest IFC / Revit / BIM models. Parametrize camera pathways, worker density, lighting angles, weather occlusions, and materialize automated labels.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto shrink-0">
          {[
            { id: "config", label: "1. Models & Assets", icon: Layers },
            { id: "environment", label: "2. Environments", icon: Sun },
            { id: "labels", label: "3. Auto-Label Setup", icon: Layers3 },
            { id: "live-generator", label: "4. Generator Run", icon: Play },
            { id: "architecture", label: "5. Code Blueprints", icon: FileCode }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md font-extrabold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER DETAILED TABS */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: Config & Assets (Input, Workers, Equipment, Materials) */}
          {activeTab === "config" && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Model upload/select & presets (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span>3D Model Input Feed (IFC/Revit/BIM)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Provide the architectural source BIM models. The geometry pipeline extracts collision bounds, element classifications, and material slots.
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "existing", label: "BIM Presets" },
                      { id: "ifc", label: "Upload IFC" },
                      { id: "revit", label: "Upload RVT" }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setSelectedBimSource(mode.id as any)}
                        className={`py-2 px-1 text-center font-bold text-xs rounded border transition-all cursor-pointer ${
                          selectedBimSource === mode.id
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  {selectedBimSource === "existing" ? (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] text-slate-400 font-mono">Select Available Pre-validated Project Presets:</label>
                      <select
                        value={predefinedBim}
                        onChange={(e) => setPredefinedBim(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-white font-semibold font-mono"
                      >
                        <option value="BIM-BlockB-Structural.ifc">Bangalore Tech Park Block B - Structural Grid (72.4MB)</option>
                        <option value="AirportTerminal-Phase2.rvt">Airport Terminal Complex - Phase 2 (142.4MB)</option>
                        <option value="TunnelSegment-DrillAndBlast.ifc">Metro Line Tunnel - Drill & Blast Profile (18.1MB)</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="border border-dashed border-slate-800 rounded-lg p-5 text-center bg-slate-950/50 hover:bg-slate-950 transition-all cursor-pointer relative group">
                        <input
                          type="file"
                          accept={selectedBimSource === "ifc" ? ".ifc" : ".rvt"}
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Layers3 className="w-8 h-8 text-indigo-400 mx-auto group-hover:scale-110 transition-transform mb-2" />
                        <span className="text-xs text-slate-300 font-bold block">Drag & Drop model file or click to select</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">Supported format: {selectedBimSource === "ifc" ? ".ifc files" : ".rvt Revit files"} (max 500MB)</span>
                      </div>
                    </div>
                  )}

                  {/* Uploaded assets log */}
                  <div className="flex flex-col gap-2 pt-2">
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Loaded BIM Assets Vault</span>
                    <div className="flex flex-col gap-1.5">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="bg-slate-950/80 p-2 rounded border border-slate-850 flex justify-between items-center text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-slate-300 truncate max-w-[190px] font-mono">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-slate-500 text-[10px]">{file.size}</span>
                            <span className="bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">{file.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: In-scene Objects: Workers (PPE), Equipment & Occluding components (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                    <HardHat className="w-4 h-4" />
                    <span>In-Scene Objects & PPE Parameterization Matrix</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Control random instance generation within scene frames. These objects generate ground-truth training vectors for model object detection.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Worker parameters */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                      <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Worker Instances & Poses</span>
                      </span>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-mono text-slate-400">
                          <span>Max Worker Count per Frame:</span>
                          <span className="text-white font-bold">{workerDensity}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={workerDensity}
                          onChange={(e) => setWorkerDensity(Number(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      {/* PPE checklist toggles */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">Randomized PPE Compliance Rules:</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input
                              type="checkbox"
                              checked={workerPpeMix.helmetRequired}
                              onChange={(e) => setWorkerPpeMix({ ...workerPpeMix, helmetRequired: e.target.checked })}
                              className="accent-indigo-500"
                            />
                            <span>Random Safety Helmets</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input
                              type="checkbox"
                              checked={workerPpeMix.hiVisRequired}
                              onChange={(e) => setWorkerPpeMix({ ...workerPpeMix, hiVisRequired: e.target.checked })}
                              className="accent-indigo-500"
                            />
                            <span>Hi-Vis Vests (Orange/Yellow)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input
                              type="checkbox"
                              checked={workerPpeMix.harnessRequired}
                              onChange={(e) => setWorkerPpeMix({ ...workerPpeMix, harnessRequired: e.target.checked })}
                              className="accent-indigo-500"
                            />
                            <span>Full Body Harnesses</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                            <input
                              type="checkbox"
                              checked={workerPpeMix.glovesRequired}
                              onChange={(e) => setWorkerPpeMix({ ...workerPpeMix, glovesRequired: e.target.checked })}
                              className="accent-indigo-500"
                            />
                            <span>Heavy Work Gloves</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Equipment & Occlusion parameters */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                      <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Heavy Construction Machinery</span>
                      </span>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-mono text-slate-400">
                          <span>Equipment Density Factor:</span>
                          <span className="text-white font-bold">{equipmentDensity}/10</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={equipmentDensity}
                          onChange={(e) => setEquipmentDensity(Number(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-mono text-slate-400">
                          <span>Foreground Occlusion Mesh:</span>
                          <span className="text-white font-bold">{occlusionFactor}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={occlusionFactor}
                          onChange={(e) => setOcclusionFactor(Number(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                        <span className="text-[9px] text-slate-500 font-mono">*Spawn scaffolds, temporal columns & formworks to occlude target objects.</span>
                      </div>
                    </div>
                  </div>

                  {/* Texture Materials Randomizer panel */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Domain Randomization: PBR Materials</span>
                      </span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-indigo-400">
                        <input
                          type="checkbox"
                          checked={randomMaterials}
                          onChange={(e) => setRandomMaterials(e.target.checked)}
                          className="accent-indigo-500"
                        />
                        <span>Enable Materials Randomization</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {materialsList.map((material, mIdx) => (
                        <div key={mIdx} className="bg-slate-900 border border-slate-850 rounded p-2.5 flex justify-between items-center text-[11px] font-mono">
                          <div className="flex flex-col">
                            <span className="text-slate-300 font-bold">{material.name}</span>
                            <span className="text-slate-500 text-[10px]">Variance Strength: {material.variance}</span>
                          </div>
                          <button
                            onClick={() => {
                              setMaterialsList(
                                materialsList.map((m, i) => (i === mIdx ? { ...m, randomized: !m.randomized } : m))
                              );
                            }}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                              material.randomized && randomMaterials
                                ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-400"
                                : "bg-slate-950 border border-slate-800 text-slate-500"
                            }`}
                          >
                            {material.randomized && randomMaterials ? "Random" : "Static"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Environment & Trajectories */}
          {activeTab === "environment" && (
            <motion.div
              key="environment"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Camera Trajectory settings (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Interactive Camera Trajectory Editor</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select keyframe spline trajectories around model vertices to simulate continuous drone scans, crane-mounted inspection feeds, or worker-level walks.
                </p>

                <div className="flex flex-col gap-2">
                  {[
                    { id: "drone-scanning", label: "Autonomous Drone Scan Path", desc: "Raster helix loop above the model (max diversity variance, high angles)." },
                    { id: "crane-cam", label: "Fixed Crane Jib Camera", desc: "Linear static orbit with high-altitude lens distortion & load swaying." },
                    { id: "ground-inspector", label: "Safety Ground Walkthrough", desc: "Clipped 1.7m eye-level horizontal spline. High rebar/ppe visibility." },
                    { id: "corner-fixed", label: "Perimeter CCTV Spline", desc: "Multiple fixed corners. Low view variance but realistic background bias." },
                    { id: "orbit-helix", label: "360-Degree Continuous Helix", desc: "Sweeping structural orbit capturing all geometry angles uniformly." }
                  ].map((traj) => (
                    <button
                      key={traj.id}
                      onClick={() => setCameraTrajectory(traj.id as any)}
                      className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                        cameraTrajectory === traj.id
                          ? "bg-indigo-950/60 border-indigo-500 text-indigo-300"
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white font-mono">{traj.label}</span>
                        {cameraTrajectory === traj.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">{traj.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Path Resolution Step Rate:</span>
                    <span className="text-white font-bold">{frameStepRate} frames / spline segment</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={frameStepRate}
                    onChange={(e) => setFrameStepRate(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-500 font-mono">*Higher steps yield closely spaced sequence snapshots (realistic motion blur tracking).</span>
                </div>
              </div>

              {/* Right Column: Lighting, Weather, Dust and Atmospheric (7 cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  <span>Lighting, Weather & Atmospheric Occlusion Parameters</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Introduce extreme environmental variances to build heavy resistance against environmental drifts (rain glare, shadows, dark night construction, fog density).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Lighting parameters */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                    <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-indigo-400" />
                      <span>HDRI Lighting Environments</span>
                    </span>

                    <div className="flex flex-col gap-2">
                      {[
                        { id: "solar-noon", label: "Solar Noon Clear Sky", desc: "Noon glare, sharp vertical shadows." },
                        { id: "golden-hour", label: "Golden Hour Sunset", desc: "Long warm shadows, amber backscattering." },
                        { id: "twilight", label: "Overcast Twilight", desc: "Soft ambient shadows, low visibility index." },
                        { id: "night-artificial", label: "Night Floodlights Mode", desc: "Artificial spotlight cones, high image noise." },
                        { id: "random-cycle", label: "Full Dynamic Cycle", desc: "Generates step sequence along sunset paths." }
                      ].map((light) => (
                        <button
                          key={light.id}
                          onClick={() => setLightingPeriod(light.id as any)}
                          className={`p-2.5 rounded text-left text-xs font-mono transition-all border cursor-pointer ${
                            lightingPeriod === light.id
                              ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-300 font-bold"
                              : "bg-slate-900/50 border-slate-850 text-slate-400 hover:text-white"
                          }`}
                        >
                          {light.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weather & Dust parameters */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                    <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Weather Particle Generatives</span>
                    </span>

                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] text-slate-400 font-mono">Simulated Weather Condition:</label>
                      <select
                        value={weatherCondition}
                        onChange={(e) => setWeatherCondition(e.target.value as any)}
                        className="bg-slate-900 border border-slate-850 rounded p-2 text-xs text-white font-mono"
                      >
                        <option value="clear">Perfectly Clear (Direct Sun)</option>
                        <option value="rainy">Heavy Rainfall & Concrete Wet Glare</option>
                        <option value="foggy">Dense Mist/Fog (High Depth Degradation)</option>
                        <option value="dust-storm">Construction Site Dust Storm</option>
                        <option value="random-weather">Random Dynamic Weather Shuffled</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
                      <div className="flex justify-between text-xs font-mono text-slate-400">
                        <span>Airborne Dust Density:</span>
                        <span className="text-indigo-400 font-bold">{dustDensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={dustDensity}
                        onChange={(e) => setDustDensity(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-mono text-slate-400">
                        <span>Cloudiness Factor:</span>
                        <span className="text-indigo-400 font-bold">{cloudDensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={cloudDensity}
                        onChange={(e) => setCloudDensity(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Labeling & Format Export */}
          {activeTab === "labels" && (
            <motion.div
              key="labels"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Output Annotation Flags (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-2">
                  <Layers3 className="w-4 h-4" />
                  <span>Ground-Truth Labels Extraction Matrix</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select which mathematical ground-truth layers are extracted automatically during rendering cycles.
                </p>

                <div className="flex flex-col gap-3">
                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-850 cursor-pointer hover:border-slate-700 transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold font-mono text-white">2D Object Bounding Boxes</span>
                      <span className="text-[9px] text-slate-500 font-mono">Normalized [x_center, y_center, width, height] coords.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={generate2DBox}
                      onChange={(e) => setGenerate2DBox(e.target.checked)}
                      className="accent-indigo-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-850 cursor-pointer hover:border-slate-700 transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold font-mono text-white">3D Oriented Bounding Boxes</span>
                      <span className="text-[9px] text-slate-500 font-mono">Calculates 8 corner coordinates in camera-space coordinates.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={generate3DBox}
                      onChange={(e) => setGenerate3DBox(e.target.checked)}
                      className="accent-indigo-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-850 cursor-pointer hover:border-slate-700 transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold font-mono text-white">Instance & Semantic Segment Masks</span>
                      <span className="text-[9px] text-slate-500 font-mono">Pixel-wise color coding matches precise mesh polygons.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={generateInstanceMasks}
                      onChange={(e) => setGenerateInstanceMasks(e.target.checked)}
                      className="accent-indigo-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-850 cursor-pointer hover:border-slate-700 transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold font-mono text-white">Depth Maps (Z-Buffer Raster)</span>
                      <span className="text-[9px] text-slate-500 font-mono">Floating point EXR files mapping radial distance to grid.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={generateDepthMaps}
                      onChange={(e) => setGenerateDepthMaps(e.target.checked)}
                      className="accent-indigo-500 w-4 h-4"
                    />
                  </label>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] font-mono text-slate-400">
                  <span className="text-amber-400 font-bold uppercase block mb-1">Compute Cost Analysis:</span>
                  Automatic labels are mapped directly from GPU raster vertices, resulting in <span className="text-white font-bold">zero overhead</span> compared to manual pixel masks.
                </div>
              </div>

              {/* Right Column: Export Format & Code Schema configuration (7 cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>Target Export Framework Layout Configurator</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select your target ML pipeline layout. The generator outputs folder partitions matching your standard training loops.
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "yolov8", label: "YOLOv8 PyTorch" },
                    { id: "coco-json", label: "COCO JSON" },
                    { id: "pascal-voc", label: "Pascal VOC XML" },
                    { id: "custom-analytics", label: "DVC Analytics" }
                  ].map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setExportFormat(format.id as any)}
                      className={`p-2.5 text-center font-bold text-[11px] rounded transition-all border cursor-pointer ${
                        exportFormat === format.id
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>

                {/* Simulated schema file output box */}
                <div className="bg-slate-950 rounded-lg p-4 border border-slate-850 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>Generated File Structure Preview (`data_config.yaml`)</span>
                    <button
                      onClick={() => copyToClipboard(`path: /dataset/syntheticon_run
train: images/train
val: images/val
test: images/test

names:
  0: IfcRebar_Grid
  1: Worker_PPE_Helmet
  2: Worker_NoPPE_Alert
  3: Excavator_CAT320
  4: IfcDuctSegment
  5: IfcSlab_Formwork
  6: Scaffold_Block`, "YOLO-Yaml")}
                      className="text-indigo-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === "YOLO-Yaml" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedText === "YOLO-Yaml" ? "Copied" : "Copy YAML"}</span>
                    </button>
                  </div>

                  <pre className="text-[11px] text-indigo-300 font-mono bg-slate-950 p-2.5 rounded border border-slate-900 overflow-x-auto leading-relaxed max-h-56">
                    <code>{`# YOLOv8 Auto-Generated Construction Dataset Manifest
path: /dataset/syntheticon_run
train: images/train
val: images/val
test: images/test

names:
  0: IfcRebar_Grid
  1: Worker_PPE_Helmet
  2: Worker_NoPPE_Alert
  3: Excavator_CAT320
  4: IfcDuctSegment
  5: IfcSlab_Formwork
  6: Scaffold_Block`}</code>
                  </pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: Live Generator run monitor, GPU stats & Image overlay */}
          {activeTab === "live-generator" && (
            <motion.div
              key="live-generator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Side: Simulation controllers & GPU cluster metrics (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span>Cluster Generator Status</span>
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      activeTask.status === "running"
                        ? "bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 animate-pulse"
                        : activeTask.status === "completed"
                        ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-400"
                        : "bg-slate-950 text-slate-500 border border-slate-850"
                    }`}>
                      {activeTask.status === "idle" ? "READY" : activeTask.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 font-mono text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Target Session Capacity:</span>
                      <div className="flex items-center gap-1.5">
                        <select
                          disabled={activeTask.status === "running"}
                          value={activeTask.totalTarget}
                          onChange={(e) => setActiveTask({ ...activeTask, totalTarget: Number(e.target.value) })}
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-0.5 text-xs text-white"
                        >
                          <option value="10000">10,000 images</option>
                          <option value="50000">50,000 images</option>
                          <option value="100000">100,000 images</option>
                          <option value="500000">500,000 images (Full BIM Matrix)</option>
                          <option value="1000000">1,000,000 images (Enterprise Production)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Synthesized Snapshot Sequence:</span>
                      <strong className="text-white">{activeTask.generatedCount.toLocaleString()} / {activeTask.totalTarget.toLocaleString()}</strong>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Render Throughput Rate:</span>
                      <strong className="text-emerald-400 font-extrabold">{activeTask.currentSpeed} imgs/sec</strong>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Total Data Footprint:</span>
                      <strong className="text-white">{activeTask.storageSize}</strong>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Estimated Time Remaining:</span>
                      <strong className="text-white font-mono">{activeTask.estimatedTimeRemaining}</strong>
                    </div>
                  </div>

                  {/* Progress Slider Display */}
                  <div className="w-full bg-slate-950 p-3 rounded-lg border border-slate-850">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Render Progress Matrix:</span>
                      <span className="text-indigo-400 font-bold">{activeTask.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${activeTask.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Operational Controls */}
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      onClick={toggleGenerationTask}
                      className={`py-3 px-4 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTask.status === "running"
                          ? "bg-amber-600 hover:bg-amber-500 text-white"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white"
                      }`}
                    >
                      {activeTask.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{activeTask.status === "running" ? "Pause Render" : "Initiate Render"}</span>
                    </button>

                    <button
                      onClick={resetGenerationTask}
                      className="py-3 px-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold uppercase text-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Reset Context</span>
                    </button>
                  </div>
                </div>

                {/* GPU Cluster nodes stats */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block">GPU Rendering Node Cluster (NVIDIA H100s)</span>
                  <div className="flex flex-col gap-2">
                    {activeGpus.map((gpu, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col gap-1 text-[11px] font-mono">
                        <div className="flex justify-between items-center text-slate-300 font-semibold">
                          <span>{gpu.name}</span>
                          <span className={`${gpu.usage > 0 ? "text-emerald-400" : "text-slate-500"}`}>{gpu.usage}% Load</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Thermal Index: {gpu.temp}°C</span>
                          <span>VRAM Context: {gpu.vram}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Virtual Interactive Frame Previews & Bounding Overlays (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                        <Tv className="w-4 h-4 text-indigo-400" />
                        <span>Interactive Syntheticon® Output Frame Simulator</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Toggle label overlays over current rendered path frames.</p>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-indigo-400 cursor-pointer font-mono bg-slate-950 border border-slate-850 px-2.5 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={showLabelOverlay}
                        onChange={(e) => setShowLabelOverlay(e.target.checked)}
                        className="accent-indigo-500"
                      />
                      <span>Overlays Active</span>
                    </label>
                  </div>

                  {/* Active Preview Simulator Frame */}
                  <div className="relative rounded-xl overflow-hidden bg-slate-950 h-80 border border-slate-850 select-none">
                    <img
                      src={imageSequences[activePreviewIndex].imageUrl}
                      alt="synthetic-rendering"
                      className="w-full h-full object-cover"
                    />

                    {/* Interactive bounding boxes overlays */}
                    {showLabelOverlay && imageSequences[activePreviewIndex].bboxes.map((box, bIdx) => (
                      <div
                        key={bIdx}
                        className={`absolute border-2 rounded ${box.color} flex flex-col justify-start p-1 cursor-pointer transition-all hover:scale-102`}
                        style={{
                          left: `${box.x}%`,
                          top: `${box.y}%`,
                          width: `${box.w}%`,
                          height: `${box.h}%`
                        }}
                      >
                        <span className="text-[9px] font-bold font-mono px-1 py-0.5 rounded leading-none w-fit bg-slate-950/90 shadow text-white border border-slate-800 uppercase">
                          {box.label}
                        </span>
                      </div>
                    ))}

                    <div className="absolute bottom-4 left-4 bg-slate-950/90 border border-slate-800 p-3 rounded-lg font-mono text-[10px] text-slate-300 max-w-sm flex flex-col gap-0.5">
                      <strong className="text-white text-xs mb-0.5">{imageSequences[activePreviewIndex].title}</strong>
                      <span>Time: {imageSequences[activePreviewIndex].timestamp}</span>
                      <span>Lighting: {imageSequences[activePreviewIndex].lighting} | Weather: {imageSequences[activePreviewIndex].weather}</span>
                      <span>Dust Density: {imageSequences[activePreviewIndex].dustDensity} | Active Workers: {imageSequences[activePreviewIndex].workerCount}</span>
                    </div>

                    <div className="absolute top-4 right-4 bg-indigo-600 border border-indigo-400/30 font-mono text-[9px] font-bold text-white px-2.5 py-1 rounded shadow">
                      {imageSequences[activePreviewIndex].viewpoint}
                    </div>
                  </div>

                  {/* Frame Thumbnails Selector */}
                  <div className="grid grid-cols-3 gap-3">
                    {imageSequences.map((seq, idx) => (
                      <button
                        key={seq.id}
                        onClick={() => setActivePreviewIndex(idx)}
                        className={`text-left rounded-lg overflow-hidden border transition-all cursor-pointer flex flex-col ${
                          activePreviewIndex === idx
                            ? "border-indigo-500 bg-indigo-950/25 ring-2 ring-indigo-600/30"
                            : "border-slate-800 bg-slate-950 hover:border-slate-750"
                        }`}
                      >
                        <div className="h-14 relative bg-slate-900">
                          <img src={seq.imageUrl} alt={seq.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2 text-[10px] font-mono flex flex-col">
                          <strong className="text-white truncate block">{seq.id} - {seq.title}</strong>
                          <span className="text-slate-500 text-[8px] mt-0.5">{seq.bboxCount} bounding tags detected</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Active telemetry terminal logs */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Live Generation Console Logs</span>
                    <div className="h-28 overflow-y-auto font-mono text-[10px] text-indigo-400 flex flex-col gap-1 bg-slate-950 p-2 border border-slate-900 rounded">
                      {generationLogs.map((log, lIdx) => (
                        <div key={lIdx} className="leading-relaxed border-l-2 border-indigo-600 pl-2">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: Production Architecture Codes, API routes and Dockerfiles */}
          {activeTab === "architecture" && (
            <motion.div
              key="architecture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Architecture Sub tabs navigation */}
              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl self-start overflow-x-auto max-w-full">
                {[
                  { id: "database", label: "PostgreSQL Schema DDL" },
                  { id: "worker", label: "Blender-Server Render Loop" },
                  { id: "apis", label: "Dataset Ingestion Router" },
                  { id: "docker", label: "Docker-Compose Stack" }
                ].map((sTab) => (
                  <button
                    key={sTab.id}
                    onClick={() => setArchitectureSubTab(sTab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      architectureSubTab === sTab.id
                        ? "bg-slate-950 text-indigo-400 shadow font-extrabold border border-slate-800"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {sTab.label}
                  </button>
                ))}
              </div>

              {/* RENDER ARCHITECTURE SUB TAB */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                {architectureSubTab === "database" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">Durable PostgreSQL / Drizzle DDL Schema</h4>
                        <p className="text-xs text-slate-400 mt-1">Defines datasets, bounding boxes, synthetic sequences, and active worker node configurations.</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`-- PostgreSQL Schema DDL for SynthetiCon Dataset Hub
CREATE TABLE synthetic_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  source_bim VARCHAR(255) NOT NULL,
  target_images_count INT NOT NULL DEFAULT 100000,
  current_rendered_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE synthetic_render_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES synthetic_datasets(id) ON DELETE CASCADE,
  lighting_period VARCHAR(50) NOT NULL,
  weather_condition VARCHAR(50) NOT NULL,
  dust_density NUMERIC(5,2) NOT NULL,
  camera_theta NUMERIC(5,2) NOT NULL,
  camera_phi NUMERIC(5,2) NOT NULL,
  image_storage_path VARCHAR(512) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bounding_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES synthetic_render_sequences(id) ON DELETE CASCADE,
  class_label VARCHAR(100) NOT NULL,
  x_min NUMERIC(8,6) NOT NULL,
  y_min NUMERIC(8,6) NOT NULL,
  x_max NUMERIC(8,6) NOT NULL,
  y_max NUMERIC(8,6) NOT NULL
);`, "DDL")}
                        className="text-xs text-indigo-400 font-mono flex items-center gap-1 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-850"
                      >
                        {copiedText === "DDL" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText === "DDL" ? "Copied DDL" : "Copy Schema"}</span>
                      </button>
                    </div>

                    <pre className="text-xs text-indigo-300 font-mono bg-slate-950 p-4 rounded-xl border border-slate-850 overflow-x-auto leading-relaxed max-h-96">
                      <code>{`-- PostgreSQL Schema DDL for SynthetiCon Dataset Hub
CREATE TABLE synthetic_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  source_bim VARCHAR(255) NOT NULL,
  target_images_count INT NOT NULL DEFAULT 100000,
  current_rendered_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE synthetic_render_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES synthetic_datasets(id) ON DELETE CASCADE,
  lighting_period VARCHAR(50) NOT NULL,
  weather_condition VARCHAR(50) NOT NULL,
  dust_density NUMERIC(5,2) NOT NULL,
  camera_theta NUMERIC(5,2) NOT NULL,
  camera_phi NUMERIC(5,2) NOT NULL,
  image_storage_path VARCHAR(512) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bounding_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES synthetic_render_sequences(id) ON DELETE CASCADE,
  class_label VARCHAR(100) NOT NULL,
  x_min NUMERIC(8,6) NOT NULL,
  y_min NUMERIC(8,6) NOT NULL,
  x_max NUMERIC(8,6) NOT NULL,
  y_max NUMERIC(8,6) NOT NULL
);`}</code>
                    </pre>
                  </div>
                )}

                {architectureSubTab === "worker" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">Python Headless Blender Ray-Tracing Script</h4>
                        <p className="text-xs text-slate-400 mt-1">Parses BIM files inside headless cycles, applying weather filters and coordinate projections.</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`# Headless Blender Cycles Render Pipeline
import bpy
import math
import random
import json

def load_bim_geometry(filepath):
    # Import IFC or Revit mesh geometries via BIMServer SDK
    bpy.ops.import_scene.ifc(filepath=filepath)
    print(f"BIM mesh successfully loaded into context: {filepath}")

def configure_camera_trajectory(spline_points):
    camera = bpy.data.objects['Camera']
    # Bind camera location vectors dynamically
    for step, coord in enumerate(spline_points):
        camera.location = coord
        camera.keyframe_insert(data_path="location", frame=step)

def inject_weather_fog_particles(density_factor):
    world = bpy.context.scene.world
    world.use_nodes = True
    volume_node = world.node_tree.nodes.new("ShaderNodeVolumeScatter")
    volume_node.inputs['Density'].default_value = density_factor
    # Plug scatter directly into World volume outputs
    world_output = world.node_tree.nodes['World Output']
    world.node_tree.links.new(volume_node.outputs['Volume'], world_output.inputs['Volume'])

def render_bounding_boxes():
    # project 3D vertices to camera 2D coordinates viewport
    scene = bpy.context.scene
    camera = bpy.data.objects['Camera']
    # Write YOLO bounding boxes annotations to files
    pass`, "PythonWorker")}
                        className="text-xs text-indigo-400 font-mono flex items-center gap-1 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-850"
                      >
                        {copiedText === "PythonWorker" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText === "PythonWorker" ? "Copied" : "Copy Python"}</span>
                      </button>
                    </div>

                    <pre className="text-xs text-indigo-300 font-mono bg-slate-950 p-4 rounded-xl border border-slate-850 overflow-x-auto leading-relaxed max-h-96">
                      <code>{`# Headless Blender Cycles Render Pipeline
import bpy
import math
import random
import json

def load_bim_geometry(filepath):
    # Import IFC or Revit mesh geometries via BIMServer SDK
    bpy.ops.import_scene.ifc(filepath=filepath)
    print(f"BIM mesh successfully loaded into context: {filepath}")

def configure_camera_trajectory(spline_points):
    camera = bpy.data.objects['Camera']
    # Bind camera location vectors dynamically
    for step, coord in enumerate(spline_points):
        camera.location = coord
        camera.keyframe_insert(data_path="location", frame=step)

def inject_weather_fog_particles(density_factor):
    world = bpy.context.scene.world
    world.use_nodes = True
    volume_node = world.node_tree.nodes.new("ShaderNodeVolumeScatter")
    volume_node.inputs['Density'].default_value = density_factor
    # Plug scatter directly into World volume outputs
    world_output = world.node_tree.nodes['World Output']
    world.node_tree.links.new(volume_node.outputs['Volume'], world_output.inputs['Volume'])

def render_bounding_boxes():
    # project 3D vertices to camera 2D coordinates viewport
    scene = bpy.context.scene
    camera = bpy.data.objects['Camera']
    # Write YOLO bounding boxes annotations to files
    pass`}</code>
                    </pre>
                  </div>
                )}

                {architectureSubTab === "apis" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">Express Render Dispatch API Router</h4>
                        <p className="text-xs text-slate-400 mt-1">Handles BIM models upload processing, parameterizing settings, and spawning rendering worker loops.</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`// Express Backend API Route for SynthetiCon Dataset Generation
import { Router } from "express";
import { spawn } from "child_process";

const router = Router();

router.post("/api/synthetic/generate", async (req, res) => {
  const {
    datasetName,
    sourceBimFile,
    targetCount,
    weather,
    dustDensity,
    lighting,
    workerDensity
  } = req.body;

  try {
    // Spawn rendering cluster background worker execution
    const processArgs = [
      "render_worker.py",
      "--bim_file", sourceBimFile,
      "--images_count", targetCount.toString(),
      "--weather_condition", weather,
      "--dust_factor", dustDensity.toString(),
      "--workers_density", workerDensity.toString()
    ];

    const workerProcess = spawn("python3", processArgs, {
      detached: true,
      stdio: "ignore"
    });

    workerProcess.unref();

    return res.status(202).json({
      success: true,
      message: "Headless synthetic render process dispatched to Cycle cluster.",
      taskId: "synth-task-" + Date.now()
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});`, "APIRoute")}
                        className="text-xs text-indigo-400 font-mono flex items-center gap-1 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-850"
                      >
                        {copiedText === "APIRoute" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText === "APIRoute" ? "Copied API" : "Copy Router"}</span>
                      </button>
                    </div>

                    <pre className="text-xs text-indigo-300 font-mono bg-slate-950 p-4 rounded-xl border border-slate-850 overflow-x-auto leading-relaxed max-h-96">
                      <code>{`// Express Backend API Route for SynthetiCon Dataset Generation
import { Router } from "express";
import { spawn } from "child_process";

const router = Router();

router.post("/api/synthetic/generate", async (req, res) => {
  const {
    datasetName,
    sourceBimFile,
    targetCount,
    weather,
    dustDensity,
    lighting,
    workerDensity
  } = req.body;

  try {
    // Spawn rendering cluster background worker execution
    const processArgs = [
      "render_worker.py",
      "--bim_file", sourceBimFile,
      "--images_count", targetCount.toString(),
      "--weather_condition", weather,
      "--dust_factor", dustDensity.toString(),
      "--workers_density", workerDensity.toString()
    ];

    const workerProcess = spawn("python3", processArgs, {
      detached: true,
      stdio: "ignore"
    });

    workerProcess.unref();

    return res.status(202).json({
      success: true,
      message: "Headless synthetic render process dispatched to Cycle cluster.",
      taskId: "synth-task-" + Date.now()
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});`}</code>
                    </pre>
                  </div>
                )}

                {architectureSubTab === "docker" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">Docker-Compose Orchestration Container Stack</h4>
                        <p className="text-xs text-slate-400 mt-1">Launches the database cluster, express api gateways and Nvidia GPU cycle render nodes.</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`version: "3.8"
services:
  api-gateway:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:db_pass@db-cluster:5432/synthetic_db
    depends_on:
      - db-cluster

  gpu-cycles-render-worker:
    build:
      context: ./render_worker
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    volumes:
      - shared_data_vol:/datasets

  db-cluster:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: db_pass
      POSTGRES_DB: synthetic_db
    ports:
      - "5432:5432"

volumes:
  shared_data_vol:`, "DockerYaml")}
                        className="text-xs text-indigo-400 font-mono flex items-center gap-1 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-850"
                      >
                        {copiedText === "DockerYaml" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText === "DockerYaml" ? "Copied Stack" : "Copy Stack"}</span>
                      </button>
                    </div>

                    <pre className="text-xs text-indigo-300 font-mono bg-slate-950 p-4 rounded-xl border border-slate-850 overflow-x-auto leading-relaxed max-h-96">
                      <code>{`version: "3.8"
services:
  api-gateway:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:db_pass@db-cluster:5432/synthetic_db
    depends_on:
      - db-cluster

  gpu-cycles-render-worker:
    build:
      context: ./render_worker
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    volumes:
      - shared_data_vol:/datasets

  db-cluster:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: db_pass
      POSTGRES_DB: synthetic_db
    ports:
      - "5432:5432"

volumes:
  shared_data_vol:`}</code>
                    </pre>
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
