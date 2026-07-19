import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  Layers,
  Compass,
  Zap,
  Activity,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  Database,
  FileCode2,
  ListFilter,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  MapPin,
  Eye,
  Sliders,
  ShieldAlert,
  SlidersHorizontal,
  FolderTree,
  Terminal,
  Code,
  Gauge,
  Box,
  Binary,
  HelpCircle,
  Sparkles,
  Layers2,
  AlertCircle,
  FileText,
  Workflow,
  Flame,
  Construction,
  Wrench,
  BadgeAlert
} from "lucide-react";

// Types for the CV Progress Engine
interface DetectionInstance {
  id: string;
  category: string;
  material: string;
  confidence: number;
  bimGuid: string;
  status: "INSTALLED" | "PARTIAL" | "MISSING" | "INCORRECT" | "BLOCKED";
  occlusion: "NONE" | "PARTIAL" | "TEMPORARY" | "HEAVY";
}

interface SequenceViolation {
  id: string;
  violation: string;
  severity: "CRITICAL" | "WARNING" | "MINOR";
  rule: string;
  detectedObject: string;
  requiredBefore: string;
}

interface QualityAnomaly {
  id: string;
  type: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  confidence: number;
  guid: string;
}

export default function CVProgressEngine() {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "inference" | "sequence" | "quality" | "specifications">("dashboard");
  const [selectedModel, setSelectedModel] = useState<string>("sam2");
  const [selectedTrade, setSelectedTrade] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Interactive Simulation states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(100);
  const [showFastApiCode, setShowFastApiCode] = useState<boolean>(false);
  const [explainNode, setExplainNode] = useState<string | null>(null);

  // Dynamic state changes
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  
  // Real-time canvas reference for Semantic & Instance segmentation visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Raw Image frames for inference visualization
  const inferenceFrames = [
    { name: "Active Frame #081 - Main Column Zone", count: 42, error: "0.2px", matchRate: "98.4%" },
    { name: "Active Frame #082 - East Wing Ductline", count: 28, error: "0.4px", matchRate: "95.1%" },
    { name: "Active Frame #083 - Core Slab Overlook", count: 54, error: "0.1px", matchRate: "99.2%" }
  ];

  // AI Model configurations with professional parameters
  const modelsInfo = {
    sam2: { name: "Segment Anything 2 (SAM 2)", type: "Zero-Shot Instance Segmentation", desc: "Performs real-time, high-precision instance mask tracking directly from bounding prompts. Selected for outstanding boundary snapping on dynamic construction assets.", speed: "22ms/frame", accuracy: "94.2% mAP" },
    yolov12: { name: "YOLOv12-X Enterprise", type: "Ultra-Fast Object Detector", desc: "Computes sub-millisecond structural object localizations (beams, columns, slabs) with optimized FP16 TensorRT layers. Selected for low-latency batch processing.", speed: "4.5ms/frame", accuracy: "91.8% mAP" },
    rtdetr: { name: "RT-DETR-L", type: "Real-time Transformer Detector", desc: "Provides high-accuracy object detections using multi-scale feature attention layers. Handles heavy construction site occlusions with global scene context.", speed: "11.2ms/frame", accuracy: "93.6% mAP" },
    groundingdino: { name: "GroundingDINO-v2", type: "Open-Vocabulary Text-to-BBox", desc: "Aligns human language queries ('bent rebar', 'cracked structural concrete') with visual regions of interest. Essential for unstructured anomaly scans.", speed: "85ms/frame", accuracy: "89.5% Zero-Shot" }
  };

  // Detected instances reflecting state on site
  const [instances, setInstances] = useState<DetectionInstance[]>([
    { id: "INST-029", category: "IfcColumn", material: "Reinforced Concrete", confidence: 0.98, bimGuid: "col-7f4c9a12-bd88", status: "INSTALLED", occlusion: "NONE" },
    { id: "INST-031", category: "IfcDuctSegment", material: "Galvanized Steel", confidence: 0.94, bimGuid: "duct-3a8d9e22-ff88", status: "PARTIAL", occlusion: "PARTIAL" },
    { id: "INST-040", category: "IfcWallStandardCase", material: "Drywall Gypsum", confidence: 0.96, bimGuid: "wall-e4f8a329-8472", status: "MISSING", occlusion: "NONE" },
    { id: "INST-044", category: "IfcPipeSegment", material: "Copper Pipe", confidence: 0.91, bimGuid: "pipe-6d33a109-aa21", status: "INCORRECT", occlusion: "TEMPORARY" },
    { id: "INST-052", category: "IfcBeam", material: "Structural Carbon Steel", confidence: 0.97, bimGuid: "beam-a8f3d1b8-6c88", status: "INSTALLED", occlusion: "NONE" },
    { id: "INST-061", category: "IfcLightFixture", material: "LED Aluminum", confidence: 0.88, bimGuid: "light-9b43e110-09cc", status: "BLOCKED", occlusion: "HEAVY" }
  ]);

  // Sequence Violations simulated with rich rules
  const [violations, setViolations] = useState<SequenceViolation[]>([
    { id: "VIOL-01", violation: "MEP Rough-in installed before dry-wall framing is structurally complete", severity: "CRITICAL", rule: "Framing -> MEP -> Wall Closeout", detectedObject: "IfcDuctSegment (duct-3a8d9e22-ff88)", requiredBefore: "IfcWallStandardCase (wall-e4f8a329-8472)" },
    { id: "VIOL-02", violation: "Plaster work scheduled prior to structural concrete core curing sequence", severity: "WARNING", rule: "Slab/Column Curing -> Plaster", detectedObject: "IfcWall (wall-99d8b1)", requiredBefore: "IfcColumn (col-7f4c9a12)" }
  ]);

  // Quality anomalies detected
  const [anomalies, setAnomalies] = useState<QualityAnomaly[]>([
    { id: "QA-109", type: "Concrete Honeycombing", description: "Inadequate consolidation of concrete mix leading to structural voids on Column Base L01-B.", severity: "HIGH", confidence: 0.95, guid: "col-7f4c9a12-bd88" },
    { id: "QA-112", type: "Rebar Improper Spacing", description: "Detected spacing deviation of 12% from structural blueprint spacing criteria.", severity: "MEDIUM", confidence: 0.89, guid: "rebar-mesh-091" },
    { id: "QA-115", type: "Drywall Panel Micro-Crack", description: "Vertical hairline fracture of length 15cm detected close to door frame edge.", severity: "LOW", confidence: 0.92, guid: "wall-e4f8a329-8472" }
  ]);

  // Run a simulation trigger for deep vision scan
  const triggerVisionScan = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          // Modulate states dynamically to prove live interactive capability
          setInstances(prevInst =>
            prevInst.map((item, idx) => ({
              ...item,
              confidence: Number((0.90 + Math.random() * 0.09).toFixed(2))
            }))
          );
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Render simulated Semantic and Instance Segments on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frameCount = 0;

    const draw = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Base context drawing - simulating video frame scanline
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw horizontal camera scanning overlay lines
      ctx.strokeStyle = "rgba(99, 102, 241, 0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw simulated structural masks
      // 1. Column Mask (Reinforced Concrete)
      ctx.fillStyle = selectedModel === "sam2" ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0.15)";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(60, 40, 90, 190);
      ctx.fill();
      ctx.stroke();
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "#10b981";
      ctx.fillText("IfcColumn [INST-029]", 65, 55);
      ctx.fillText("Concrete | Conf: 98%", 65, 68);

      // 2. HVAC Duct Mask
      ctx.fillStyle = "rgba(59, 130, 246, 0.35)";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(220, 50);
      ctx.lineTo(440, 50);
      ctx.lineTo(400, 110);
      ctx.lineTo(220, 110);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#3b82f6";
      ctx.fillText("IfcDuctSegment [INST-031]", 230, 70);
      ctx.fillText("Steel | Conf: 94%", 230, 83);

      // 3. Wall bounding box (Under installation or Missing)
      ctx.strokeStyle = "#f43f5e";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.strokeRect(480, 70, 160, 140);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(244, 63, 94, 0.08)";
      ctx.fillRect(480, 70, 160, 140);
      ctx.fillStyle = "#f43f5e";
      ctx.fillText("MISSING IfcWall [INST-040]", 488, 88);
      ctx.fillText("Gypsum | Exp. Design Bounds", 488, 102);

      // Animated scanner scan line
      const scanY = (Math.sin(frameCount * 0.02) * 0.5 + 0.5) * canvas.height;
      ctx.strokeStyle = "rgba(99, 102, 241, 0.6)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#6366f1";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [selectedModel]);

  // Filtering helper
  const filteredInstances = instances.filter((inst) => {
    const matchesSearch = inst.category.toLowerCase().includes(searchTerm.toLowerCase()) || inst.bimGuid.includes(searchTerm);
    if (selectedTrade === "all") return matchesSearch;
    if (selectedTrade === "structural") return matchesSearch && (inst.category === "IfcColumn" || inst.category === "IfcBeam");
    if (selectedTrade === "mep") return matchesSearch && (inst.category === "IfcDuctSegment" || inst.category === "IfcPipeSegment" || inst.category === "IfcLightFixture");
    return matchesSearch;
  });

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-2xl overflow-hidden" id="cv-progress-engine">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 shadow-md">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">Computer Vision Site Progress Engine</h2>
              <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">Vision ML-v12</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Enterprise neural object segmentation matching on site visual state maps directly onto design schemas.</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveSubTab("dashboard")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeSubTab === "dashboard" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            CV Dashboard
          </button>
          <button
            onClick={() => setActiveSubTab("inference")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeSubTab === "inference" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Inference Stream
          </button>
          <button
            onClick={() => setActiveSubTab("sequence")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeSubTab === "sequence" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Sequence Audits
          </button>
          <button
            onClick={() => setActiveSubTab("quality")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeSubTab === "quality" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Quality & Defects
          </button>
          <button
            onClick={() => setActiveSubTab("specifications")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 text-amber-400 border border-amber-500/20 bg-amber-950/20`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
            <span>FastAPI Specs</span>
          </button>
        </div>
      </div>

      {/* PORTAL VIEWPORT PANEL */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          
          {/* SUB-TAB 1: CV DASHBOARD */}
          {activeSubTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Telemetry metrics rows */}
              <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">BIM Verification</span>
                    <span className="text-xl font-extrabold text-white font-mono mt-1 block">94.8%</span>
                    <span className="text-[9px] text-emerald-400 mt-1 block font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Fully Matched IFC GUIDs
                    </span>
                  </div>
                  <Gauge className="w-8 h-8 text-indigo-500/20" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Sequence Deviations</span>
                    <span className="text-xl font-extrabold text-rose-400 font-mono mt-1 block">02 Critical</span>
                    <span className="text-[9px] text-slate-400 mt-1 block font-semibold">
                      Violations Registered
                    </span>
                  </div>
                  <AlertCircle className="w-8 h-8 text-rose-500/20" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Total Instances</span>
                    <span className="text-xl font-extrabold text-white font-mono mt-1 block">18,290</span>
                    <span className="text-[9px] text-slate-400 mt-1 block font-semibold">
                      Parsed on Floor L01
                    </span>
                  </div>
                  <Box className="w-8 h-8 text-indigo-500/20" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Occlusion Recovery</span>
                    <span className="text-xl font-extrabold text-indigo-400 font-mono mt-1 block">89.4%</span>
                    <span className="text-[9px] text-indigo-300 mt-1 block font-semibold">
                      SVD Multi-view Fusion
                    </span>
                  </div>
                  <Sparkles className="w-8 h-8 text-indigo-500/20" />
                </div>
              </div>

              {/* Left Side: Deep Learning Model Parameters Selector & Mini Explainability (8 Cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                      <Binary className="w-4 h-4 text-indigo-400" />
                      <span>Enterprise Neural Model Registry & Hardware Benchmarks</span>
                    </h3>
                    <button
                      onClick={triggerVisionScan}
                      disabled={isProcessing}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                      <span>{isProcessing ? `Scanning ${processingProgress}%` : "Deploy Inference Sweep"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(modelsInfo).map(([key, info]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedModel(key)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          selectedModel === key
                            ? "bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-500/5"
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-white"
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-bold font-mono uppercase tracking-wider block opacity-75">{info.type}</span>
                          <span className="text-xs font-extrabold block mt-1.5 text-white">{info.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono mt-3 text-slate-500 pt-2 border-t border-slate-900">
                          <span>{info.speed}</span>
                          <span className="text-emerald-400 font-bold">{info.accuracy}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Highlighted Model details */}
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-1 text-xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">SELECTED MODEL PIPELINE DEPLOYMENT DETAILS</span>
                    <p className="text-slate-300 leading-relaxed mt-1">{modelsInfo[selectedModel as keyof typeof modelsInfo].desc}</p>
                  </div>
                </div>

                {/* AI Explainability Console Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Inference Decision Explainability Log (SHAP/CAM Metrics)</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 flex flex-col gap-2.5">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">WHY INSTALLED? [INST-029]</span>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        The neural visual edge map snaps onto the design coordinates projection with <strong className="text-emerald-400">98.4% spatial correlation</strong>. No occluding components (such as temporary scaffolding or clutter) were detected within a 2-meter raycast sweep.
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 flex flex-col gap-2.5">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">WHY MISSING? [INST-040]</span>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        A depth map disparity validation check via <strong className="text-rose-400">Depth Anything V2</strong> indicates flat empty space of depth 4.5m where structural drywall elements should reside. This region of interest yields 0 matches in semantic texture correlation.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Ledger / Search of Detections (4 Cols) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                    <ListFilter className="w-4 h-4 text-indigo-400" />
                    <span>Trade Segment Filter</span>
                  </h3>
                  <select
                    value={selectedTrade}
                    onChange={(e) => setSelectedTrade(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-[10px] text-white rounded px-2.5 py-1 font-mono font-bold"
                  >
                    <option value="all">ALL TRADES</option>
                    <option value="structural">STRUCTURAL</option>
                    <option value="mep">MEP ASSETS</option>
                  </select>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search active instances (e.g., IfcColumn)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[385px] pr-1 scrollbar-thin">
                  {filteredInstances.map((inst, i) => (
                    <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-white text-xs font-mono">{inst.category}</span>
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                          inst.status === "INSTALLED"
                            ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
                            : inst.status === "PARTIAL"
                            ? "bg-amber-950/40 border-amber-500/20 text-amber-400"
                            : "bg-rose-950/40 border-rose-500/20 text-rose-400"
                        }`}>
                          {inst.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono select-all">
                        GUID: {inst.bimGuid}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-900">
                        <span>Mat: {inst.material}</span>
                        <span>Confidence: {(inst.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                  {filteredInstances.length === 0 && (
                    <div className="text-center p-6 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-mono">
                      No instances match the current filters.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 2: INFERENCE STREAM SEGMENTATION */}
          {activeSubTab === "inference" && (
            <motion.div
              key="inference"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex justify-between items-center border-b border-slate-800 pb-3">
                  <span>Inference Frame Segmentations Overlay</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">GPU-Accelerated (16 TFLOPS)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Below is the real-time visualization of semantic segmentation masks generated directly on site photos. It highlights concrete cores, structural frame walls, and MEP segments.
                </p>

                {/* Main Visualizer Canvas */}
                <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-850 h-[320px] flex items-center justify-center relative">
                  <canvas
                    ref={canvasRef}
                    width={680}
                    height={320}
                    className="w-full h-full block"
                  />
                </div>
              </div>

              {/* Right panel: Active Frame select & Multi-view parameters */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                  <span>Interactive Frame Scrubber</span>
                </h3>

                <div className="flex flex-col gap-3">
                  {inferenceFrames.map((frame, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFrameIndex(index)}
                      className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        activeFrameIndex === index
                          ? "bg-indigo-950/40 border-indigo-500 text-white shadow-md"
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-extrabold font-mono text-white block">{frame.name}</span>
                      <div className="flex justify-between items-center text-[10px] font-mono mt-2 text-slate-500 pt-1.5 border-t border-slate-900">
                        <span>Matches: {frame.matchRate}</span>
                        <span>Error: {frame.error}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-2.5 text-xs text-slate-400 leading-relaxed">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">DENSE DEPTH MAP METRICS</span>
                  <div>
                    The multi-view fusion loop calculates dynamic spatial occlusions. If an object is temporarily blocked by scaffold racks, the system flags it as <strong>'BLOCKED'</strong> to avoid incorrect negative (Missing) classifications.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 3: SEQUENCE AUDITS */}
          {activeSubTab === "sequence" && (
            <motion.div
              key="sequence"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                    <BadgeAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>Installation Sequence Audits & CPM Schedule Violations</span>
                  </h3>
                  <span className="text-[10px] bg-rose-950 text-rose-300 px-2.5 py-1 rounded-md border border-rose-500/20">Critical Alert System</span>
                </div>
                <p className="text-xs text-slate-400">
                  The engine automatically cross-references detected progress states on site with the scheduled precedence relationships defined in the <strong>Primavera P6 / Microsoft Project</strong> XML files.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {violations.map((viol, i) => (
                    <div key={i} className="bg-slate-950 p-4 rounded-xl border border-rose-500/20 flex flex-col justify-between gap-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rotate-45 translate-x-12 -translate-y-12" />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
                            viol.severity === "CRITICAL"
                              ? "bg-rose-950 text-rose-400 border-rose-500/30"
                              : "bg-amber-950 text-amber-400 border-amber-500/30"
                          }`}>
                            {viol.severity} Violation
                          </span>
                          <p className="text-xs text-slate-200 font-extrabold mt-3 leading-relaxed">{viol.violation}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-900 font-mono text-[10px] text-slate-400">
                        <div className="flex justify-between">
                          <span>Sequence Rule:</span>
                          <span className="text-white font-bold">{viol.rule}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Detected on Site:</span>
                          <span className="text-indigo-400 font-bold">{viol.detectedObject}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Required Completion:</span>
                          <span className="text-rose-400 font-bold">{viol.requiredBefore}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 4: QUALITY & DEFECTS */}
          {activeSubTab === "quality" && (
            <motion.div
              key="quality"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                    <Construction className="w-4 h-4 text-amber-400" />
                    <span>Computer Vision Structural Defects Ledger</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">BIM Coordinate Mapping: Active</span>
                </div>
                <p className="text-xs text-slate-400">
                  By matching high-resolution close-up imagery against IFC CAD boundaries, the AI detects micro-fissures, Honeycombing, out-of-plumb concrete pours, and misaligned structural reinforcements.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {anomalies.map((anom, i) => (
                    <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-white text-xs font-mono">{anom.type}</span>
                          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                            anom.severity === "HIGH"
                              ? "bg-rose-950/40 border-rose-500/20 text-rose-400"
                              : anom.severity === "MEDIUM"
                              ? "bg-amber-950/40 border-amber-500/20 text-amber-400"
                              : "bg-slate-900 border-slate-800 text-slate-400"
                          }`}>
                            {anom.severity} Severity
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{anom.description}</p>
                      </div>

                      <div className="flex flex-col gap-1 pt-3 border-t border-slate-900 font-mono text-[10px] text-slate-500">
                        <div className="flex justify-between">
                          <span>Target Element:</span>
                          <span className="text-slate-300 font-bold select-all">{anom.guid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inference Confidence:</span>
                          <span className="text-emerald-400 font-bold">{(anom.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 5: SYSTEM SPECIFICATIONS & BLUEPRINTS */}
          {activeSubTab === "specifications" && (
            <motion.div
              key="specifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                      <FileCode2 className="w-4 h-4 text-indigo-400" />
                      <span>Enterprise Backend Specifications - Computer Vision Pipeline</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">High-performance async FastAPI & Celery task worker layout for real-time computer vision streams.</p>
                  </div>
                  <button
                    onClick={() => setShowFastApiCode(!showFastApiCode)}
                    className="px-3.5 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/20 text-indigo-300 text-xs font-bold font-mono rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Code className="w-4 h-4" />
                    <span>{showFastApiCode ? "Show Database Schema" : "Show FastAPI Code"}</span>
                  </button>
                </div>

                {showFastApiCode ? (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] scrollbar-thin">
                    <pre>{`from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

app = FastAPI(title="Computer Vision Progress Engine APIs")

class ProgressEvaluationPayload(BaseModel):
    session_id: str
    project_id: str
    target_floors: List[str]

class InstanceResult(BaseModel):
    instance_id: str
    bim_guid: str
    category: str
    status: str
    confidence: float

@app.post("/api/v1/cv-engine/evaluate-progress")
async def evaluate_progress(payload: ProgressEvaluationPayload, background_tasks: BackgroundTasks):
    """
    Submits walkthrough frames to the GPU inference pipeline.
    Runs instance matching using SAM2 and structural tracking.
    """
    # Trigger Celery asynchronous worker task
    return {
        "task_id": "celery-cv-89ac-40d1",
        "status": "PROCESSING",
        "estimated_duration_sec": 4.5
    }
`}</pre>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] scrollbar-thin">
                    <pre>{`-- PostgreSQL DDL Script for CV Progress Engine Data Models

CREATE TABLE cv_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    frame_index INT NOT NULL,
    bim_guid VARCHAR(128) NOT NULL,
    category VARCHAR(128) NOT NULL,
    material_detected VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'INSTALLED',
    confidence_score DOUBLE PRECISION NOT NULL,
    geometry_transform JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sequence_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    violation_description TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL,
    rule_id VARCHAR(128) NOT NULL,
    detected_object_guid VARCHAR(128) NOT NULL,
    required_object_guid VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quality_defects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    defect_type VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    bim_guid VARCHAR(128) NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index optimization for real-time progress calculations
CREATE INDEX idx_cv_guid_session ON cv_detections (bim_guid, session_id);
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
