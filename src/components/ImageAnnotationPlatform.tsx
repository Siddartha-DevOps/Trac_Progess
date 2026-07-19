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
  HelpCircle,
  Eye,
  EyeOff,
  Play,
  Pause,
  ChevronLeft,
  ChevronLast,
  MessageSquare,
  Send,
  Award,
  Sparkles,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Users,
  SlidersHorizontal,
  Target
} from "lucide-react";

// Interfaces for Annotation records
interface AnnotationInstance {
  id: string;
  label: string;
  type: "bbox" | "polygon" | "segmentation" | "keypoint" | "polyline" | "cuboid" | "depth" | "pointcloud";
  bimGuid: string;
  color: string;
  coordinates: any; // visual geometry data
  attributes: {
    occluded: boolean;
    truncated: boolean;
    qualityScore: number;
    annotator: string;
    reviewer: string;
  };
  comments: { user: string; text: string; timestamp: string }[];
}

interface FrameRecord {
  frameId: number;
  timestamp: string;
  imageUrl: string;
  annotations: AnnotationInstance[];
}

export default function ImageAnnotationPlatform() {
  const [activeTab, setActiveTab] = useState<"canvas" | "video" | "lidar" | "review" | "specifications">("canvas");
  const [selectedTool, setSelectedTool] = useState<"bbox" | "polygon" | "segmentation" | "keypoint" | "polyline" | "cuboid">("bbox");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>("inst-101");
  const [showLabels, setShowLabels] = useState(true);
  const [showDepthOverlay, setShowDepthOverlay] = useState(false);

  // Video State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [trackedInstances, setTrackedInstances] = useState<string[]>(["inst-101", "inst-102"]);

  // LiDAR Matrix Simulation state
  const [lidarRotation, setLidarRotation] = useState({ yaw: 45, pitch: 30 });
  const [isRotatingLidar, setIsRotatingLidar] = useState(false);

  // Code Generation Switcher
  const [specTab, setSpecTab] = useState<"sql" | "fastapi" | "celery" | "typescript" | "prompts">("sql");

  // Mock comments chat
  const [chatMessage, setChatMessage] = useState("");
  const [qaDecision, setQaDecision] = useState<"APPROVED" | "REJECTED" | "REQUIRES_REWORK">("APPROVED");

  // Dynamic Annotations Database state
  const [instances, setInstances] = useState<AnnotationInstance[]>([
    {
      id: "inst-101",
      label: "Concrete Column (IfcColumn)",
      type: "bbox",
      bimGuid: "col-7f4c9a12-bd88",
      color: "border-indigo-500 bg-indigo-500/10 text-indigo-300",
      coordinates: { x: 22, y: 15, w: 28, h: 65 },
      attributes: { occluded: false, truncated: false, qualityScore: 98.4, annotator: "Alex Chen (L3)", reviewer: "Marc Wood (Principal)" },
      comments: [
        { user: "Marc Wood", text: "Bounding box bounds are tight and conform to pixel margins perfectly.", timestamp: "2026-07-18 10:14" },
        { user: "Alex Chen", text: "BIM mapping confirmed with spatial point cloud intersection.", timestamp: "2026-07-18 11:30" }
      ]
    },
    {
      id: "inst-102",
      label: "HVAC Ductwork Segment",
      type: "polygon",
      bimGuid: "duct-3a8d9e22-ff88",
      color: "border-emerald-500 bg-emerald-500/10 text-emerald-300",
      coordinates: { points: "35,15 65,18 70,35 40,30" },
      attributes: { occluded: true, truncated: false, qualityScore: 94.2, annotator: "Sarah Jenkins (L2)", reviewer: "Marc Wood (Principal)" },
      comments: [
        { user: "Marc Wood", text: "Ensure the polygon bounds handle occlusion behind the concrete column properly.", timestamp: "2026-07-19 01:11" }
      ]
    },
    {
      id: "inst-103",
      label: "Steel Rebar Anchor Points",
      type: "keypoint",
      bimGuid: "anchor-9e22fa11",
      color: "border-amber-500 bg-amber-500/20 text-amber-300",
      coordinates: { points: [{ x: 55, y: 72 }, { x: 58, y: 75 }, { x: 61, y: 78 }] },
      attributes: { occluded: false, truncated: false, qualityScore: 91.5, annotator: "David Miller (L1)", reviewer: "Clara Mercer (Senior)" },
      comments: []
    },
    {
      id: "inst-104",
      label: "Main Slab Boundary",
      type: "polyline",
      bimGuid: "slab-a412f5e3-c211",
      color: "border-purple-500 bg-purple-500/10 text-purple-300",
      coordinates: { points: "5,80 95,80 95,95 5,95" },
      attributes: { occluded: false, truncated: false, qualityScore: 96.0, annotator: "Sarah Jenkins (L2)", reviewer: "Clara Mercer (Senior)" },
      comments: []
    }
  ]);

  // Video Frame annotations sequence mockup
  const videoFrames: FrameRecord[] = [
    {
      frameId: 1,
      timestamp: "00:01.00",
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&auto=format&fit=crop&q=80",
      annotations: [
        { id: "inst-101", label: "Concrete Column", type: "bbox", bimGuid: "col-7f4c9a12-bd88", color: "border-indigo-500 bg-indigo-500/10 text-indigo-300", coordinates: { x: 22, y: 15, w: 28, h: 65 }, attributes: { occluded: false, truncated: false, qualityScore: 98.4, annotator: "Alex", reviewer: "Marc" }, comments: [] }
      ]
    },
    {
      frameId: 2,
      timestamp: "00:02.00",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80",
      annotations: [
        { id: "inst-101", label: "Concrete Column", type: "bbox", bimGuid: "col-7f4c9a12-bd88", color: "border-indigo-500 bg-indigo-500/10 text-indigo-300", coordinates: { x: 28, y: 15, w: 28, h: 65 }, attributes: { occluded: false, truncated: false, qualityScore: 98.4, annotator: "Alex", reviewer: "Marc" }, comments: [] }
      ]
    },
    {
      frameId: 3,
      timestamp: "00:03.00",
      imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=1200&auto=format&fit=crop&q=80",
      annotations: [
        { id: "inst-101", label: "Concrete Column", type: "bbox", bimGuid: "col-7f4c9a12-bd88", color: "border-indigo-500 bg-indigo-500/10 text-indigo-300", coordinates: { x: 34, y: 15, w: 28, h: 65 }, attributes: { occluded: false, truncated: false, qualityScore: 98.4, annotator: "Alex", reviewer: "Marc" }, comments: [] }
      ]
    },
    {
      frameId: 4,
      timestamp: "00:04.00",
      imageUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=1200&auto=format&fit=crop&q=80",
      annotations: [
        { id: "inst-101", label: "Concrete Column", type: "bbox", bimGuid: "col-7f4c9a12-bd88", color: "border-indigo-500 bg-indigo-500/10 text-indigo-300", coordinates: { x: 40, y: 15, w: 28, h: 65 }, attributes: { occluded: false, truncated: false, qualityScore: 98.4, annotator: "Alex", reviewer: "Marc" }, comments: [] }
      ]
    }
  ];

  // Simulated LiDAR Point Cloud points database mapping
  const lidarPoints = Array.from({ length: 180 }, (_, index) => {
    const angle = (index / 180) * Math.PI * 2;
    const radius = 8 + Math.sin(angle * 4) * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = Math.sin(index / 15) * 3;
    const classVal = index % 3 === 0 ? "Column" : index % 3 === 1 ? "Slab" : "Wall";
    return { x, y, z, classVal };
  });

  // Handle active video ticks
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % videoFrames.length);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Handle live chat submissions
  const handleSendChat = () => {
    if (!chatMessage || !selectedInstanceId) return;
    setInstances((prev) =>
      prev.map((inst) => {
        if (inst.id === selectedInstanceId) {
          return {
            ...inst,
            comments: [
              ...inst.comments,
              { user: "You (Head of MLOps)", text: chatMessage, timestamp: "Just now" }
            ]
          };
        }
        return inst;
      })
    );
    setChatMessage("");
  };

  const selectedInstance = instances.find((inst) => inst.id === selectedInstanceId);

  // Quality metrics compute
  const averageQuality = (instances.reduce((acc, inst) => acc + inst.attributes.qualityScore, 0) / instances.length).toFixed(1);

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-2xl overflow-hidden" id="image-annotation-platform">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 shadow-md">
            <Target className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">Enterprise Image & 3D Sensor Annotation Platform</h2>
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">LabelEngine Enterprise</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Multi-modal computer vision suite powering bounding-boxes, 3D cuboids, semantic masks, and LiDAR frame tracking synced directly with BIM GUIDs.</p>
          </div>
        </div>

        {/* Studio Level Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto shrink-0">
          {[
            { id: "canvas", label: "Studio Editor", icon: Layers },
            { id: "video", label: "Video Tracking Timeline", icon: Play },
            { id: "lidar", label: "LiDAR 3D Point Cloud", icon: Sparkles },
            { id: "review", label: "QA & Consensus Hub", icon: Users },
            { id: "specifications", label: "Production Spec Architecture", icon: FileCode }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-indigo-600 text-white shadow-md font-extrabold" 
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

      {/* CORE ACTIVE WORKSPACE CANVAS AND TOOLBAR */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">

          {/* TAB 1: STUDIO CANVAS EDITOR */}
          {activeTab === "canvas" && (
            <motion.div
              key="canvas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Tool Selector sidebar (1 col / 80px) */}
              <div className="lg:col-span-1 flex flex-row lg:flex-col justify-around lg:justify-start gap-2 bg-slate-900/80 border border-slate-800/80 p-2.5 rounded-xl">
                {[
                  { id: "bbox", label: "Box", shortcut: "B" },
                  { id: "polygon", label: "Poly", shortcut: "P" },
                  { id: "segmentation", label: "Brush", shortcut: "S" },
                  { id: "keypoint", label: "Key", shortcut: "K" },
                  { id: "polyline", label: "Line", shortcut: "L" },
                  { id: "cuboid", label: "3D Cub", shortcut: "C" }
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id as any)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-center transition-all cursor-pointer flex-1 lg:flex-initial ${
                      selectedTool === tool.id
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-md font-extrabold"
                        : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                    }`}
                    title={`${tool.label} Tool (Press ${tool.shortcut})`}
                  >
                    <span className="text-[10px] font-bold block truncate">{tool.label}</span>
                    <span className="text-[8px] opacity-60 font-mono mt-0.5">{tool.shortcut}</span>
                  </button>
                ))}

                <div className="hidden lg:block border-t border-slate-800/80 my-2" />
                
                {/* Visual View Helpers */}
                <button 
                  onClick={() => setShowLabels(!showLabels)}
                  className={`p-2 rounded-lg border flex items-center justify-center cursor-pointer ${
                    showLabels ? "bg-slate-950 border-indigo-500/30 text-indigo-400" : "bg-slate-950 border-slate-850 text-slate-500"
                  }`}
                  title="Toggle Labels View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowDepthOverlay(!showDepthOverlay)}
                  className={`p-2 rounded-lg border flex items-center justify-center cursor-pointer mt-1.5 ${
                    showDepthOverlay ? "bg-slate-950 border-indigo-500/30 text-indigo-400" : "bg-slate-950 border-slate-850 text-slate-500"
                  }`}
                  title="Toggle Depth Map Overlay"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Main Visual interactive Canvas (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative h-[520px]">
                {/* Canvas Control Header */}
                <div className="bg-slate-950 px-4 py-2 flex justify-between items-center border-b border-slate-850 z-20">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-extrabold uppercase">ACTIVE RESOLUTION: 4096 x 2048</span>
                    <span className="text-[10px] text-slate-400 font-mono">Downtown_Medical_L01_C028.png</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                      className="p-1 bg-slate-900 border border-slate-800 rounded hover:text-white cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-slate-300">{zoomLevel}%</span>
                    <button 
                      onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                      className="p-1 bg-slate-900 border border-slate-800 rounded hover:text-white cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Canvas Render Area */}
                <div className="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center">
                  <div 
                    className="relative transition-all duration-100"
                    style={{ width: "100%", height: "100%", transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center" }}
                  >
                    {/* Background construction Image */}
                    <img 
                      src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&auto=format&fit=crop&q=80" 
                      alt="Construction Site Raw Capture" 
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />

                    {/* DEPTH MAP OVERLAY */}
                    {showDepthOverlay && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/60 via-blue-900/60 to-emerald-900/40 mix-blend-color-burn pointer-events-none z-10 animate-fade-in">
                        <div className="absolute top-4 left-4 bg-slate-950/80 border border-purple-500/30 rounded p-1.5 font-mono text-[8px] text-purple-300">
                          RAW DEPTH ESTIMATION BUFFER (Depth Estimation API)
                        </div>
                      </div>
                    )}

                    {/* INTERACTIVE VECTOR OVERLAYS (SVG & Divs representing loaded instances) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none select-none z-20">
                      {/* Polygon representation */}
                      <polygon 
                        points="280,110 520,130 560,250 320,220" 
                        className={`fill-emerald-500/10 stroke-2 cursor-pointer transition-all ${
                          selectedInstanceId === "inst-102" ? "stroke-emerald-400 fill-emerald-500/25 filter drop-shadow-md" : "stroke-emerald-500/60"
                        }`}
                        onClick={(e) => { e.stopPropagation(); setSelectedInstanceId("inst-102"); }}
                      />

                      {/* Polyline trace */}
                      <polyline 
                        points="40,640 760,640 760,760 40,760" 
                        className={`fill-none stroke-2 cursor-pointer transition-all ${
                          selectedInstanceId === "inst-104" ? "stroke-purple-400" : "stroke-purple-500/60"
                        }`}
                        onClick={(e) => { e.stopPropagation(); setSelectedInstanceId("inst-104"); }}
                      />

                      {/* Keypoint nodes connection line */}
                      <polyline 
                        points="440,576 464,600 488,624" 
                        className="fill-none stroke-dashed stroke-amber-500/40"
                      />
                    </svg>

                    {/* Bounding Box 1 (inst-101) */}
                    <div 
                      onClick={() => setSelectedInstanceId("inst-101")}
                      className={`absolute border-2 rounded cursor-pointer flex flex-col justify-between transition-all p-1 z-30 ${
                        selectedInstanceId === "inst-101" 
                          ? "border-indigo-400 bg-indigo-500/20 ring-2 ring-indigo-400/25" 
                          : "border-indigo-500/60 bg-indigo-500/5 hover:border-indigo-400"
                      }`}
                      style={{ left: "22%", top: "15%", width: "28%", height: "65%" }}
                    >
                      {showLabels && (
                        <div className="bg-indigo-600 text-white text-[9px] font-bold px-1 py-0.5 rounded shadow-md font-mono self-start select-none">
                          IfcColumn [col-7f4c9a12-bd88]
                        </div>
                      )}
                      
                      {/* Handle Resizers for editing mockup */}
                      {selectedInstanceId === "inst-101" && (
                        <>
                          <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-white border border-indigo-600 rounded-full cursor-nwse-resize -translate-x-1/2 -translate-y-1/2" />
                          <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-white border border-indigo-600 rounded-full cursor-nesw-resize translate-x-1/2 -translate-y-1/2" />
                          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-white border border-indigo-600 rounded-full cursor-nesw-resize -translate-x-1/2 translate-y-1/2" />
                          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-white border border-indigo-600 rounded-full cursor-nwse-resize translate-x-1/2 translate-y-1/2" />
                        </>
                      )}
                    </div>

                    {/* Polygon Label Pin */}
                    {showLabels && (
                      <div 
                        className="absolute bg-emerald-600 text-white text-[9px] font-bold px-1 py-0.5 rounded shadow font-mono pointer-events-none"
                        style={{ left: "40%", top: "22%" }}
                      >
                        IfcDuctSegment [duct-3a8d9e22-ff88]
                      </div>
                    )}

                    {/* Keypoint handles mapping (inst-103) */}
                    <div className="absolute left-[55%] top-[72%] w-3 h-3 bg-amber-500 border-2 border-white rounded-full cursor-pointer z-35 -translate-x-1/2 -translate-y-1/2" onClick={() => setSelectedInstanceId("inst-103")} />
                    <div className="absolute left-[58%] top-[75%] w-3 h-3 bg-amber-500 border-2 border-white rounded-full cursor-pointer z-35 -translate-x-1/2 -translate-y-1/2" onClick={() => setSelectedInstanceId("inst-103")} />
                    <div className="absolute left-[61%] top-[78%] w-3 h-3 bg-amber-500 border-2 border-white rounded-full cursor-pointer z-35 -translate-x-1/2 -translate-y-1/2" onClick={() => setSelectedInstanceId("inst-103")} />

                    {/* 3D Cuboid Mock overlay (when cuboid tool is active) */}
                    {selectedTool === "cuboid" && (
                      <div className="absolute left-[65%] top-[40%] w-[120px] h-[180px] border border-dashed border-sky-400 bg-sky-500/10 rounded pointer-events-none z-30 flex flex-col justify-between p-1">
                        <span className="text-[8px] bg-sky-600 text-white px-1 py-0.5 rounded font-mono self-start">3D CUBOID PROJECTION</span>
                        {/* Render cuboid vertices lines */}
                        <div className="absolute inset-0 border border-sky-300 opacity-45 transform rotate-12 skew-y-6" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Annotation Legend status bar */}
                <div className="bg-slate-950 px-4 py-2 border-t border-slate-850 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> BBox Active
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-2" /> Poly active
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2" /> Keypoints active
                  </span>
                  <span>User session: s_0921 (alex.chen)</span>
                </div>
              </div>

              {/* Inspector & BIM guid mapping (3 cols) */}
              <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                  <span>Instance Inspector</span>
                </h3>

                {selectedInstance ? (
                  <div className="flex flex-col gap-4">
                    {/* Core Identification */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col gap-1">
                      <span className="text-[8px] text-indigo-400 font-mono font-bold uppercase">INSTANCE ID: {selectedInstance.id}</span>
                      <span className="text-xs text-white font-bold">{selectedInstance.label}</span>
                      
                      {/* BIM mapping info */}
                      <div className="mt-2 pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500">BIM IFC GUID:</span>
                        <span className="text-slate-200 select-all font-bold">{selectedInstance.bimGuid}</span>
                      </div>
                    </div>

                    {/* Metadata & Quality values */}
                    <div className="flex flex-col gap-2 text-[10px] font-mono">
                      <div className="flex justify-between p-1 bg-slate-950/40 rounded">
                        <span className="text-slate-400">Confidence Score:</span>
                        <span className="text-emerald-400 font-bold">{selectedInstance.attributes.qualityScore}%</span>
                      </div>
                      <div className="flex justify-between p-1 bg-slate-950/40 rounded">
                        <span className="text-slate-400">Annotator Rank:</span>
                        <span className="text-white font-bold">{selectedInstance.attributes.annotator}</span>
                      </div>
                      <div className="flex justify-between p-1 bg-slate-950/40 rounded">
                        <span className="text-slate-400">QA Approved by:</span>
                        <span className="text-indigo-300 font-bold">{selectedInstance.attributes.reviewer}</span>
                      </div>
                      <div className="flex justify-between p-1 bg-slate-950/40 rounded">
                        <span className="text-slate-400">Occluded State:</span>
                        <span className={`font-bold ${selectedInstance.attributes.occluded ? "text-amber-400" : "text-slate-500"}`}>
                          {selectedInstance.attributes.occluded ? "TRUE (Partial)" : "FALSE"}
                        </span>
                      </div>
                    </div>

                    {/* Active Comments log (Scale AI like threaded discussion) */}
                    <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
                      <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">COLLABORATION LOG & DISCUSSIONS</span>
                      
                      <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                        {selectedInstance.comments.map((comm, index) => (
                          <div key={index} className="bg-slate-950 p-2 rounded text-[10px] flex flex-col gap-1 font-mono">
                            <div className="flex justify-between text-[8px] text-slate-500">
                              <span className="font-extrabold text-indigo-400">{comm.user}</span>
                              <span>{comm.timestamp}</span>
                            </div>
                            <p className="text-slate-300 text-[10px] font-sans">{comm.text}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-1.5 mt-1">
                        <input
                          type="text"
                          placeholder="Reply to instance..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white placeholder-slate-500"
                        />
                        <button 
                          onClick={handleSendChat}
                          className="bg-indigo-600 hover:bg-indigo-500 p-1 rounded text-white cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-xl">
                    Click on any visual coordinate instance overlay to review its BIM tracking data logs.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: VIDEO TIMELINE & FRAME INTERPOLATION */}
          {activeTab === "video" && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Frame Viewer Canvas (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span>Dynamic Frame Interpolation & Object Tracker Suite</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Frame {currentFrame + 1} of {videoFrames.length} ({videoFrames[currentFrame].timestamp})</span>
                </div>

                <div className="h-72 rounded-xl overflow-hidden bg-slate-950 relative border border-slate-850">
                  <img 
                    src={videoFrames[currentFrame].imageUrl} 
                    alt={`Frame ${currentFrame + 1}`} 
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                  
                  {/* Active object tracker bbox interpolation simulation */}
                  <div 
                    className="absolute border-2 border-emerald-500 bg-emerald-500/10 rounded p-1"
                    style={{ 
                      left: `${videoFrames[currentFrame].annotations[0].coordinates.x}%`, 
                      top: "20%", 
                      width: "30%", 
                      height: "60%" 
                    }}
                  >
                    <span className="bg-emerald-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                      Track ID: Concrete_Col_991 (Interpolated)
                    </span>
                  </div>
                </div>

                {/* Video Playback Controls bar */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setCurrentFrame((prev) => Math.max(0, prev - 1))}
                      className="p-1.5 bg-slate-900 border border-slate-800 hover:text-white rounded cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setCurrentFrame((prev) => (prev + 1) % videoFrames.length)}
                      className="p-1.5 bg-slate-900 border border-slate-800 hover:text-white rounded cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scrub bar */}
                  <div className="flex-1 mx-6 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">0.00</span>
                    <input 
                      type="range" 
                      min="0" 
                      max={videoFrames.length - 1} 
                      value={currentFrame}
                      onChange={(e) => setCurrentFrame(Number(e.target.value))}
                      className="flex-1 accent-indigo-500" 
                    />
                    <span className="text-[10px] text-slate-500 font-mono">0.04</span>
                  </div>

                  {/* Interpolate Actions */}
                  <button 
                    onClick={() => {
                      setIsPlaying(true);
                      setTimeout(() => setIsPlaying(false), 3000);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] font-mono rounded uppercase hover:bg-emerald-900/40 cursor-pointer"
                  >
                    Interpolate Tracks
                  </button>
                </div>
              </div>

              {/* Object Track Panel (4 cols) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                  <span>Object Tracking List</span>
                </h3>

                <p className="text-[11px] text-slate-400">
                  Track identities remain persistent across sequential frame slices. Kalman interpolation approximates position coordinate matrices dynamically.
                </p>

                <div className="flex flex-col gap-2 font-mono text-[10px]">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-white">Track ID: Concrete_Col_991</span>
                      <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Active</span>
                    </div>
                    <span className="text-[9px] text-slate-500">Class: IfcColumn (col-7f4c9a12-bd88)</span>
                    <span className="text-[9px] text-slate-400">Active keyframes: #1, #4. Frames #2-#3 interpolated.</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-300">Track ID: Duct_MEP_002</span>
                      <span className="text-[8px] bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">Idle</span>
                    </div>
                    <span className="text-[9px] text-slate-500">Class: IfcDuctSegment (duct-3a8d9e22-ff88)</span>
                    <span className="text-[9px] text-slate-400">Locked outside camera boundary bounds.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: LIDAR 3D POINT CLOUD SENSOR STUDIO */}
          {activeTab === "lidar" && (
            <motion.div
              key="lidar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Point Cloud Viewport (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>LIDAR 3D Laser Coordinates Annotation Viewport</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Yaw: {lidarRotation.yaw}° | Pitch: {lidarRotation.pitch}°</span>
                </div>

                <div 
                  className="h-80 rounded-xl bg-black border border-slate-950 relative flex items-center justify-center overflow-hidden cursor-grab"
                  onMouseDown={() => setIsRotatingLidar(true)}
                  onMouseUp={() => setIsRotatingLidar(false)}
                  onMouseMove={(e) => {
                    if (isRotatingLidar) {
                      setLidarRotation(prev => ({
                        yaw: (prev.yaw + e.movementX) % 360,
                        pitch: Math.max(-90, Math.min(90, prev.pitch + e.movementY))
                      }));
                    }
                  }}
                >
                  <div className="absolute top-3 left-3 flex flex-col gap-1 text-[8px] font-mono text-slate-500 bg-slate-950/80 p-2 rounded border border-slate-900 z-10">
                    <span>GRID UNIT: 0.5m</span>
                    <span>POINTS RENDERING: {lidarPoints.length} LASERS</span>
                    <span>BIM BOUNDING INTEGRITY: APPROVED</span>
                  </div>

                  {/* Simulated 3D Projection space */}
                  <svg className="w-full h-full absolute inset-0 z-0">
                    {/* Concentric laser range rings */}
                    <circle cx="50%" cy="50%" r="50" className="fill-none stroke-slate-900/60 stroke-1" />
                    <circle cx="50%" cy="50%" r="100" className="fill-none stroke-slate-900/40 stroke-1" />
                    <circle cx="50%" cy="50%" r="150" className="fill-none stroke-slate-900/20 stroke-1" />

                    {/* Point cloud plots */}
                    {lidarPoints.map((pt, index) => {
                      // Project with custom rotation matrix values
                      const radYaw = (lidarRotation.yaw * Math.PI) / 180;
                      const radPitch = (lidarRotation.pitch * Math.PI) / 180;
                      
                      // 3D Matrix Rotation formulas
                      const rotatedX = pt.x * Math.cos(radYaw) - pt.y * Math.sin(radYaw);
                      const rotatedY = (pt.x * Math.sin(radYaw) + pt.y * Math.cos(radYaw)) * Math.cos(radPitch) - pt.z * Math.sin(radPitch);
                      
                      const pixelX = 400 + rotatedX * 18;
                      const pixelY = 160 + rotatedY * 18;
                      
                      const color = pt.classVal === "Column" 
                        ? "fill-indigo-500 text-indigo-400" 
                        : pt.classVal === "Slab" 
                        ? "fill-emerald-500 text-emerald-400" 
                        : "fill-amber-500 text-amber-400";

                      return (
                        <circle 
                          key={index} 
                          cx={`${pixelX}%`} 
                          cy={`${pixelY}%`} 
                          r={pt.classVal === "Column" ? "3" : "2"} 
                          className={`${color} hover:r-4 cursor-pointer transition-all`}
                        />
                      );
                    })}

                    {/* 3D Cuboid box mapping projection overlay */}
                    <polygon 
                      points="120,80 210,50 250,90 160,120" 
                      className="fill-indigo-500/10 stroke-indigo-400 stroke-2" 
                    />
                    <polygon 
                      points="120,200 210,170 250,210 160,240" 
                      className="fill-indigo-500/10 stroke-indigo-400 stroke-2" 
                    />
                    {/* Connecting lines */}
                    <line x1="120" y1="80" x2="120" y2="200" className="stroke-indigo-400 stroke-2" />
                    <line x1="210" y1="50" x2="210" y2="170" className="stroke-indigo-400 stroke-2" />
                    <line x1="250" y1="90" x2="250" y2="210" className="stroke-indigo-400 stroke-2" />
                    <line x1="160" y1="120" x2="160" y2="240" className="stroke-indigo-400 stroke-2" />
                  </svg>

                  <div className="absolute bottom-3 right-3 text-[9px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-900">
                    Drag viewport matrix to rotate 3D point coordinates.
                  </div>
                </div>
              </div>

              {/* Point Cloud attributes inspector (4 cols) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>3D Sensor Calibration</span>
                </h3>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col gap-2 font-mono text-[10px]">
                  <span className="text-white font-bold block uppercase">BIM COORDINATES MATRIX MATCH</span>
                  <div className="flex justify-between"><span className="text-slate-500">Sensor Frame:</span> <span className="text-white">Velodyne HDL-64E</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Pose Alignment:</span> <span className="text-emerald-400">MATCHED [0.012m offset]</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Registered IFC:</span> <span className="text-indigo-400 font-extrabold select-all">col-7f4c9a12-bd88</span></div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs text-slate-400 flex flex-col gap-2">
                  <span className="text-[10px] text-indigo-400 font-bold font-mono uppercase block">3D Bounding Cuboid controls</span>
                  <p className="text-[10px] leading-relaxed">
                    Adjust the center, extents (length, width, height), and rotation (yaw, pitch, roll) of the 3D annotation bounding cuboid relative to the coordinate origin.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 font-mono text-[9px] text-white">
                    <div className="bg-slate-900 p-1.5 rounded">X Center: 12.42m</div>
                    <div className="bg-slate-900 p-1.5 rounded">Length (X): 1.25m</div>
                    <div className="bg-slate-900 p-1.5 rounded">Y Center: -4.81m</div>
                    <div className="bg-slate-900 p-1.5 rounded">Width (Y): 1.25m</div>
                    <div className="bg-slate-900 p-1.5 rounded">Z Center: 1.12m</div>
                    <div className="bg-slate-900 p-1.5 rounded">Height (Z): 3.80m</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: QA AND CONSENSUS PIPELINE */}
          {activeTab === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left-Side reviewers dashboard statistics (4 cols) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Reviewers & Quality Score Registry</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-mono font-bold block uppercase">AVG QA SCORE</span>
                    <span className="text-xl font-extrabold text-white font-mono mt-1 block">{averageQuality}%</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-mono font-bold block uppercase">CONSENSUS RATE</span>
                    <span className="text-xl font-extrabold text-indigo-400 font-mono mt-1 block">99.8%</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-2 font-mono text-[10px]">
                  <span className="text-[10px] text-slate-300 font-bold uppercase block pb-1 border-b border-slate-900">CONSENSUS VERIFICATION PIPELINE</span>
                  <p className="text-slate-400 font-sans text-xs">
                    Label Engine enforces <strong>double-blind reviewers consensus (CoD)</strong>. Instances with overlap intersection below 95% are automatically escalated to senior engineers.
                  </p>
                  <div className="flex justify-between items-center text-slate-400 mt-1">
                    <span>Consensus Threshold:</span>
                    <span className="text-white">0.95 IoU</span>
                  </div>
                </div>
              </div>

              {/* Right-Side Review Approval Workflow panel (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                  <span>BIM Quality Control Approval Workflow</span>
                </h3>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-4 text-xs">
                  <span className="text-[10px] text-indigo-400 font-bold font-mono block uppercase">PENDING SUBMISSION REVIEW ACTION</span>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <strong className="text-white block text-sm">Downtown_Medical_L01_C028.png</strong>
                      <span className="text-[10px] text-slate-500 font-mono">Submitted by: Alex Chen (L3) on 2026-07-18</span>
                    </div>
                    <span className="bg-amber-950/40 border border-amber-500/20 text-amber-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase">
                      In Review
                    </span>
                  </div>

                  <p className="text-slate-400 leading-relaxed text-xs">
                    This reality capture set contains 4 active annotations matching IFC Columns and Duct segments. Automatic sensor alignment confirms GPS Pose is within 2cm tolerances.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button 
                      onClick={() => {
                        setQaDecision("APPROVED");
                        alert("Successfully approved active reality capture set. Committing coordinates to PostgreSQL baseline v2.2!");
                      }}
                      className={`p-3 border rounded-xl font-mono text-left cursor-pointer transition-all ${
                        qaDecision === "APPROVED" 
                          ? "bg-emerald-950/40 border-emerald-500 text-emerald-400" 
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <strong className="block text-white">Approve Ingestion</strong>
                      Commit coordinates to active postgres baselines.
                    </button>

                    <button 
                      onClick={() => {
                        setQaDecision("REQUIRES_REWORK");
                        alert("Escalated back to Alex Chen for tight bounding box alignment.");
                      }}
                      className={`p-3 border rounded-xl font-mono text-left cursor-pointer transition-all ${
                        qaDecision === "REQUIRES_REWORK" 
                          ? "bg-amber-950/40 border-amber-500 text-amber-400" 
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <strong className="block text-white">Request Rework</strong>
                      Escalate back with specific rework annotations comments.
                    </button>

                    <button 
                      onClick={() => {
                        setQaDecision("REJECTED");
                        alert("Asset rejected. Quality metric too low or metadata corrupted.");
                      }}
                      className={`p-3 border rounded-xl font-mono text-left cursor-pointer transition-all ${
                        qaDecision === "REJECTED" 
                          ? "bg-rose-950/40 border-rose-500 text-rose-400" 
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <strong className="block text-white">Reject Asset</strong>
                      Mark as corrupted, unreadable or bad capture quality.
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: ARCHITECTURE AND SCHEMA GENERATOR */}
          {activeTab === "specifications" && (
            <motion.div
              key="specifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4"
            >
              {/* Specs selector tab */}
              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full overflow-x-auto">
                {[
                  { id: "sql", label: "PostgreSQL Database Schema", icon: Database },
                  { id: "fastapi", label: "FastAPI Core Routers", icon: Sliders },
                  { id: "celery", label: "Redis Task Queue Worker", icon: Activity },
                  { id: "typescript", label: "TypeScript Schema Interfaces", icon: FileCode },
                  { id: "prompts", label: "Claude Code Prompts", icon: Sparkles }
                ].map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <button
                      key={spec.id}
                      onClick={() => setSpecTab(spec.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        specTab === spec.id 
                          ? "bg-indigo-600 text-white shadow-md font-extrabold" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{spec.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Code display window */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 overflow-x-auto max-h-[440px]">
                {specTab === "sql" && (
                  <pre className="text-xs text-indigo-300 font-mono leading-relaxed select-all">
{`-- PostgreSQL + PostGIS Schema for multi-modal Image, Video, and LiDAR Point Cloud Annotations
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE annotation_type_enum AS ENUM (
  'bounding_box', 'polygon', 'semantic_segmentation', 'instance_segmentation', 
  'keypoints', 'polyline', '3d_cuboid', 'depth_map', 'point_cloud'
);

CREATE TYPE workflow_status_enum AS ENUM (
  'draft', 'in_review', 'approved', 'requires_rework', 'rejected'
);

-- Active Image/Video Frames database
CREATE TABLE video_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL,
  frame_number INT NOT NULL,
  timestamp_seconds DECIMAL(10, 4) NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  gps_pose GEOMETRY(PointZ, 4326), -- Spatial reference for exact point coordinates
  camera_calibration JSONB NOT NULL, -- Focal length, distortion, intrinsic/extrinsic matrices
  bim_metadata_matches JSONB, -- Registered IFC elements mapping
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(dataset_id, frame_number)
);

-- Core Annotations instances tracking indices
CREATE TABLE annotations_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frame_id UUID REFERENCES video_frames(id) ON DELETE CASCADE,
  track_id VARCHAR(128), -- Unique tracking ID across video/timeline sequence frame slices
  type annotation_type_enum NOT NULL,
  ifc_guid VARCHAR(128) NOT NULL, -- BIM mapping index target link
  geometry_bounds GEOMETRY(GeometryZ, 4326), -- PostGIS Spatial geometry for precise overlay checks
  segmentation_mask_rle TEXT, -- Run-length encoded semantic brush mask data
  quality_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00, -- Algorithmic BRISQUE or consensus score
  status workflow_status_enum DEFAULT 'draft',
  annotator_id UUID NOT NULL,
  reviewer_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}', -- Occluded, truncated, anchor points, yaw/pitch/roll values
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Thread and Collaboration logs
CREATE TABLE annotation_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES annotations_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name VARCHAR(128) NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create optimal postgis index parameters
CREATE INDEX idx_annotations_geometry ON annotations_instances USING GIST(geometry_bounds);
CREATE INDEX idx_annotations_ifc ON annotations_instances(ifc_guid);
CREATE INDEX idx_frames_dataset ON video_frames(dataset_id);`}
                  </pre>
                )}

                {specTab === "fastapi" && (
                  <pre className="text-xs text-indigo-300 font-mono leading-relaxed select-all">
{`# FastAPI Core Endpoints for Multi-Modal Annotation pipelines
from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid

app = FastAPI(title="Enterprise CV Ingestion Engine")
router = APIRouter(prefix="/api/v1/annotations", tags=["annotation-studio"])

class Coordinate2D(BaseModel):
    x: float
    y: float

class Extents3D(BaseModel):
    length: float
    width: float
    height: float

class AnnotationCreate(BaseModel):
    frame_id: uuid.UUID
    type: str = Field(..., description="bbox, polygon, keypoints, cuboid, depth, pointcloud")
    ifc_guid: str = Field(..., description="BIM mapping index target link")
    coordinates: Dict = Field(..., description="Raw geometry points or vector indices")
    occluded: bool = False
    truncated: bool = False

@router.post("/", response_model=Dict)
async def create_annotation_instance(payload: AnnotationCreate):
    # Inserts record inside PostgreSQL annotations_instances with initial workflow state 'draft'
    # Resolves BIM spatial overlap index matrices dynamically in PostGIS
    instance_id = uuid.uuid4()
    return {
        "status": "success",
        "instance_id": str(instance_id),
        "consensus_iou": 0.984,
        "message": f"Successfully registered {payload.type} annotation instance attached to BIM: {payload.ifc_guid}"
    }

@router.post("/interpolate")
async def trigger_kalman_interpolation(track_id: str, start_frame: int, end_frame: int, background_tasks: BackgroundTasks):
    # Offloads frame interpolation process to Celery/Redis queue for multi-threaded computation
    task_id = str(uuid.uuid4())
    background_tasks.add_task(run_frame_interpolation_worker, track_id, start_frame, end_frame, task_id)
    return {
        "status": "queued",
        "task_id": task_id,
        "message": f"Kalman tracker interpolation worker initialized for track ID: {track_id}"
    }

def run_frame_interpolation_worker(track_id: str, start: int, end: int, task_id: str):
    # Simulated background worker logic
    print(f"Executing multi-frame extrapolation logic on task {task_id}")
`}
                  </pre>
                )}

                {specTab === "celery" && (
                  <pre className="text-xs text-indigo-300 font-mono leading-relaxed select-all">
{`# Celery/Redis task queue config for massive frame tracking computations
import os
from celery import Celery
import numpy as np

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("annotation_workers", broker=REDIS_URL, backend=REDIS_URL)

@celery_app.task(name="pipelines.interpolate_frames")
def interpolate_frames_task(track_id: str, source_coords: dict, target_coords: dict, num_frames: int):
    """
    Interpolates spatial geometry coordinates for object tracking across frame slices.
    Applies Kalman filtering or Linear Interpolation over bounding polygon coordinate matrices.
    """
    interpolated_sequence = []
    
    # Simple linear bounding-box coordinates interpolation formula
    x1, y1, w1, h1 = source_coords['x'], source_coords['y'], source_coords['w'], source_coords['h']
    x2, y2, w2, h2 = target_coords['x'], target_coords['y'], target_coords['w'], target_coords['h']
    
    for i in range(1, num_frames - 1):
        ratio = i / (num_frames - 1)
        curr_frame_coords = {
            'x': x1 + (x2 - x1) * ratio,
            'y': y1 + (y2 - y1) * ratio,
            'w': w1 + (w2 - w1) * ratio,
            'h': h1 + (h2 - h1) * ratio
        }
        interpolated_sequence.append(curr_frame_coords)
        
    return {
        "status": "COMPLETED",
        "interpolated_frames_count": len(interpolated_sequence),
        "coordinates": interpolated_sequence
    }
`}
                  </pre>
                )}

                {specTab === "typescript" && (
                  <pre className="text-xs text-indigo-300 font-mono leading-relaxed select-all">
{`// TypeScript types for secure spatial annotation schemas
export type AnnotationType = 
  | "bbox" 
  | "polygon" 
  | "segmentation" 
  | "keypoint" 
  | "polyline" 
  | "cuboid" 
  | "depth" 
  | "pointcloud";

export type WorkflowStatus = 
  | "draft" 
  | "in_review" 
  | "approved" 
  | "requires_rework" 
  | "rejected";

export interface CameraCalibration {
  intrinsicMatrix: number[][]; // Focal length offsets px
  extrinsicMatrix: number[][]; // Translation & rotation coordinates relative to ground pose
  lensDistortionCoefficients: number[]; // Radial & tangential values
}

export interface AnnotationInstance {
  id: string;
  frameId: string;
  trackId?: string; // Links identical instances across multi-frame timelines
  type: AnnotationType;
  ifcGuid: string; // Dynamic BIM elements identifier mapping
  geometry: {
    points?: { x: number; y: number }[]; // Coordinates for polygons/polylines
    center3d?: { x: number; y: number; z: number }; // LiDAR center coordinate
    extents3d?: { l: number; w: number; h: number }; // Cuboids length/width/height
    rotation3d?: { roll: number; pitch: number; yaw: number }; // Euler angle metrics
  };
  attributes: {
    occluded: boolean;
    truncated: boolean;
    qualityScore: number; // Quality/consensus confidence parameter (0-100)
    annotatorId: string;
    reviewerId?: string;
  };
  status: WorkflowStatus;
}
`}
                  </pre>
                )}

                {specTab === "prompts" && (
                  <pre className="text-xs text-indigo-300 font-mono leading-relaxed select-all">
{`========================================================================
CLAUDE CODE PROMPT 1: DATA PIPELINE INGESTION AND POSTGRES DATABASE
========================================================================
Act as a Principal Database Architect. Scaffold a database initialization script inside
src/db/migrations/01_annotations_setup.sql. Establish the spatial database table mappings
supporting PostGIS geometry indices. Ensure enum types for annotation modes, workflow status tracking,
and unique constraint parameters are established precisely. Document index optimization benchmarks
for querying polygon overlays.

========================================================================
CLAUDE CODE PROMPT 2: FASTAPI SPATIAL GEOMETRY ROUTERS
========================================================================
Act as a Senior Backend MLOps Engineer. Generate a FastAPI router inside app/routers/annotations.py.
Incorporate comprehensive Pydantic model validations for bounding boxes, 3D cuboids, and point cloud
laser metrics. Build endpoints to persist instances inside PostgreSQL, calculate IoU (Intersection over Union)
for double-blind reviewers consensus, and delegate background timeline tasks to Celery queues.

========================================================================
CLAUDE CODE PROMPT 3: REDIS QUEUE AND FRAME TRACKING WORKER
========================================================================
Act as a Distributed Systems MLOps Engineer. Build the task orchestration file pipelines/workers.py
utilizing Celery and Redis. Implement a frame-by-frame interpolation worker that processes object tracks
across video frame slices. Use linear and Kalman filter modeling parameters to calculate intermediate target coordinates.
`}
                  </pre>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
