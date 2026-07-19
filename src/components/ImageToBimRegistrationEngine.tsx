import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  Layers,
  Cpu,
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
  Code
} from "lucide-react";

// Types for our Registration Engine simulation
interface CameraPose {
  x: number;
  y: number;
  z: number;
  qw: number;
  qx: number;
  qy: number;
  qz: number;
  heading: number;
  pitch: number;
  roll: number;
  confidence: number;
}

interface SLAMMetrics {
  activeKeyframes: number;
  trackedPoints: number;
  loopClosures: number;
  reprojectionError: number; // in pixels
  relocalizations: number;
  matchingConfidence: number;
}

interface LocalizationResult {
  guid: string;
  category: string;
  distance: number; // meters
  family: string;
  level: string;
  confidence: number;
}

interface ReplayFrame {
  timestamp: number;
  x: number;
  y: number;
  room: string;
  floor: string;
  heading: number;
  detectedObjects: string[];
}

export default function ImageToBimRegistrationEngine() {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "slam_studio" | "spatial_inspector" | "replay_viewer" | "architecture">("dashboard");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isRelocalizing, setIsRelocalizing] = useState<boolean>(false);
  const [showFastApiCode, setShowFastApiCode] = useState<boolean>(false);
  
  // Real-time canvas references for feature matching visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [slamState, setSlamState] = useState<"TRACKING" | "LOST" | "RELOCALIZING" | "OPTIMIZING">("TRACKING");
  const [loopClosureTriggered, setLoopClosureTriggered] = useState<boolean>(false);

  // Simulated raw camera telemetry
  const [cameraPose, setCameraPose] = useState<CameraPose>({
    x: 12.456,
    y: -8.112,
    z: 3.450,
    qw: 0.7071,
    qx: 0.0,
    qy: 0.7071,
    qz: 0.0,
    heading: 90.0,
    pitch: -5.4,
    roll: 1.2,
    confidence: 0.942
  });

  const [slamMetrics, setSlamMetrics] = useState<SLAMMetrics>({
    activeKeyframes: 142,
    trackedPoints: 1254,
    loopClosures: 8,
    reprojectionError: 0.82,
    relocalizations: 2,
    matchingConfidence: 95.4
  });

  // Simulated Walkthrough frames (10 frames for replay path)
  const replayFrames: ReplayFrame[] = [
    { timestamp: 0, x: 2.5, y: 3.0, room: "Corridor 101", floor: "Floor 01", heading: 45, detectedObjects: ["Wall-0221", "Column-081"] },
    { timestamp: 2, x: 4.8, y: 3.2, room: "Corridor 101", floor: "Floor 01", heading: 50, detectedObjects: ["Wall-0221", "Beam-092", "Door-011"] },
    { timestamp: 4, x: 7.2, y: 4.5, room: "Lobby East", floor: "Floor 01", heading: 90, detectedObjects: ["Slab-101", "Column-084", "HVAC-Duct-04"] },
    { timestamp: 6, x: 9.5, y: 6.8, room: "Lobby East", floor: "Floor 01", heading: 120, detectedObjects: ["Slab-101", "Column-084", "Wall-0225"] },
    { timestamp: 8, x: 12.0, y: 8.0, room: "Electrical Zone B", floor: "Floor 01", heading: 180, detectedObjects: ["CableTray-33", "Wall-0226", "Pipe-MEP-01"] },
    { timestamp: 10, x: 14.2, y: 9.5, room: "Electrical Zone B", floor: "Floor 01", heading: 210, detectedObjects: ["CableTray-33", "Transformer-01", "Slab-101"] },
    { timestamp: 12, x: 16.5, y: 11.2, room: "Server Room 104", floor: "Floor 01", heading: 270, detectedObjects: ["Server-Rack-01", "Column-089", "Ceiling-04"] },
    { timestamp: 14, x: 18.0, y: 12.5, room: "Server Room 104", floor: "Floor 01", heading: 275, detectedObjects: ["Server-Rack-02", "Wall-0230", "Ceiling-04"] },
    { timestamp: 16, x: 20.2, y: 14.0, room: "UPS Battery Room", floor: "Floor 01", heading: 310, detectedObjects: ["UPS-Cabinet-01", "Wall-0231", "Slab-101"] },
    { timestamp: 18, x: 22.5, y: 15.8, room: "UPS Battery Room", floor: "Floor 01", heading: 350, detectedObjects: ["UPS-Cabinet-02", "Column-092", "Pipe-MEP-08"] }
  ];

  // Nearest detected BIM objects simulation
  const localizedObjects: LocalizationResult[] = [
    { guid: "7f4c9a12-bd88-4a55-bb2a-fa134d1bc910", category: "IfcWallStandardCase", distance: 0.42, family: "Basic Wall", level: "Floor 01", confidence: 0.98 },
    { guid: "3a8d9e22-ff88-4212-a111-ee4c9d1bc911", category: "IfcColumn", distance: 1.25, family: "Rectangular Column", level: "Floor 01", confidence: 0.94 },
    { guid: "a8f3d1b8-6c88-40b9-9d6e-0012bc44cf12", category: "IfcDuctSegment", distance: 2.10, family: "Rectangular HVAC Duct", level: "Floor 01", confidence: 0.88 },
    { guid: "e4f8a329-8472-4e2b-a199-a1b63d9bc022", category: "IfcBeam", distance: 1.85, family: "W-Shape Steel Beam", level: "Floor 01", confidence: 0.91 }
  ];

  // Spatial Search tree results
  const [spatialQueryRadius, setSpatialQueryRadius] = useState<number>(3);
  const [kdTreeSearchResults, setKdTreeSearchResults] = useState<any[]>([
    { id: "Wall-221", type: "IfcWall", dist: 0.42, coords: [12.1, -8.3, 3.4] },
    { id: "Col-081", type: "IfcColumn", dist: 1.25, coords: [11.5, -9.0, 3.4] },
    { id: "Beam-092", type: "IfcBeam", dist: 1.85, coords: [13.0, -7.5, 5.1] },
    { id: "Duct-04", type: "IfcDuctSegment", dist: 2.10, coords: [12.0, -8.1, 4.8] }
  ]);

  // Handle simulation frame loops for Replay Player
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prevIndex) => {
          if (prevIndex >= replayFrames.length - 1) {
            return 0; // Loop back
          }
          return prevIndex + 1;
        });
      }, 1500 / replaySpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, replaySpeed]);

  // Synchronize camera pose with replay track if active sub-tab is Replay or Dashboard
  useEffect(() => {
    if (activeSubTab === "replay_viewer" || isPlaying) {
      const activeFrame = replayFrames[currentFrameIndex];
      setCameraPose(prev => ({
        ...prev,
        x: Number((activeFrame.x + (Math.random() * 0.05 - 0.025)).toFixed(3)),
        y: Number((activeFrame.y + (Math.random() * 0.05 - 0.025)).toFixed(3)),
        heading: activeFrame.heading,
        confidence: Number((0.90 + Math.random() * 0.08).toFixed(3))
      }));
      setSlamMetrics(prev => ({
        ...prev,
        trackedPoints: Math.floor(1100 + Math.random() * 300),
        reprojectionError: Number((0.65 + Math.random() * 0.3).toFixed(2))
      }));
    }
  }, [currentFrameIndex]);

  // Render simulated SLAM Canvas features
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

      // Left half: Real Camera frame, Right half: BIM Wireframe projection
      const midX = canvas.width / 2;

      // Draw dividing line
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(midX, 0);
      ctx.lineTo(midX, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw background text indicators
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "#64748b";
      ctx.fillText("REAL CAMERA FRAME (SUPERPOINT)", 12, 18);
      ctx.fillText("BIM WIREFRAME MATCH (IFC PROJECTED)", midX + 12, 18);

      // Generate visual keypoints
      const keypointsCount = 45;
      const points: Array<{ x1: number; y1: number; x2: number; y2: number; matched: boolean }> = [];

      for (let i = 0; i < keypointsCount; i++) {
        // Base seed coordinate
        const seedX = (Math.sin(i * 123.45) * 0.4 + 0.5) * (midX - 40) + 20;
        const seedY = (Math.cos(i * 456.78) * 0.4 + 0.5) * (canvas.height - 40) + 20;

        // Simulate projection drift/offset
        const driftX = Math.sin(frameCount * 0.02 + i) * 6;
        const driftY = Math.cos(frameCount * 0.02 + i) * 6;

        const isMatched = i % 5 !== 0; // 80% matching rate

        points.push({
          x1: seedX,
          y1: seedY,
          x2: midX + seedX + driftX,
          y2: seedY + driftY,
          matched: isMatched
        });
      }

      // Draw SLAM tracks / keypoint links
      points.forEach((pt, index) => {
        // Draw keypoint on left
        ctx.fillStyle = pt.matched ? "#10b981" : "#f43f5e";
        ctx.beginPath();
        ctx.arc(pt.x1, pt.y1, 2.5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw matching keypoint on right
        ctx.fillStyle = pt.matched ? "#10b981" : "#e2e8f0";
        ctx.beginPath();
        ctx.arc(pt.x2, pt.y2, 2.5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw correspondence line with animated SuperGlue attention weights
        if (pt.matched && index % 2 === 0) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 + Math.sin(frameCount * 0.05 + index) * 0.1})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(pt.x1, pt.y1);
          ctx.lineTo(pt.x2, pt.y2);
          ctx.stroke();
        }
      });

      // Draw simulated loop-closure overlay
      if (loopClosureTriggered) {
        ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        ctx.font = "bold 11px monospace";
        ctx.fillStyle = "#10b981";
        ctx.fillText("✔ LOOP CLOSURE CONFIRMED & GLOBAL POSE GRAPH OPTIMIZED", 20, canvas.height - 20);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [loopClosureTriggered]);

  const triggerLoopClosure = () => {
    setLoopClosureTriggered(true);
    setSlamState("OPTIMIZING");
    setTimeout(() => {
      setLoopClosureTriggered(false);
      setSlamState("TRACKING");
    }, 3000);
  };

  const triggerRelocalize = () => {
    setIsRelocalizing(true);
    setSlamState("RELOCALIZING");
    setTimeout(() => {
      setIsRelocalizing(false);
      setSlamState("TRACKING");
      setSlamMetrics(prev => ({
        ...prev,
        relocalizations: prev.relocalizations + 1,
        matchingConfidence: 98.2
      }));
    }, 2000);
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-2xl overflow-hidden" id="image-to-bim-engine">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 shadow-md">
            <Camera className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">Image-To-BIM Auto-Registration Engine</h2>
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase">Enterprise Production Core</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Spatial localization with sub-second kd-tree BIM frustum searching and automated ORB-SLAM3 trajectory mapping.</p>
          </div>
        </div>
        
        {/* Navigation Tabs for Modules */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveSubTab("dashboard")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeSubTab === "dashboard" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveSubTab("slam_studio")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeSubTab === "slam_studio" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            SLAM Studio
          </button>
          <button
            onClick={() => setActiveSubTab("spatial_inspector")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeSubTab === "spatial_inspector" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Spatial KD-Tree
          </button>
          <button
            onClick={() => setActiveSubTab("replay_viewer")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeSubTab === "replay_viewer" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Trajectory Replay
          </button>
          <button
            onClick={() => setActiveSubTab("architecture")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 text-amber-400 border border-amber-500/20 bg-amber-950/20`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Architecture Specs</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB VIEWPORT PANEL */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          
          {/* SUB-TAB 1: ENGINE DASHBOARD */}
          {activeSubTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Telemetry Stat Cards (12 Cols grid) */}
              <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">SLAM Alignment</span>
                    <span className="text-xl font-extrabold text-white font-mono mt-1 block">99.4%</span>
                    <span className="text-[9px] text-emerald-400 mt-1 block font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Reproj. Error &lt; 0.8px
                    </span>
                  </div>
                  <Cpu className="w-8 h-8 text-indigo-500/20" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Active Keyframes</span>
                    <span className="text-xl font-extrabold text-white font-mono mt-1 block">42,890</span>
                    <span className="text-[9px] text-slate-400 mt-1 block font-semibold">
                      Globally Registered
                    </span>
                  </div>
                  <Layers className="w-8 h-8 text-indigo-500/20" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Nearest BIM Object</span>
                    <span className="text-xl font-extrabold text-emerald-400 font-mono mt-1 block truncate max-w-[130px]">IfcWall-301</span>
                    <span className="text-[9px] text-slate-400 mt-1 block font-semibold">
                      Distance: 0.42m
                    </span>
                  </div>
                  <Compass className="w-8 h-8 text-indigo-500/20" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Auto Floor Detection</span>
                    <span className="text-xl font-extrabold text-white font-mono mt-1 block">WING B / L01</span>
                    <span className="text-[9px] text-emerald-400 mt-1 block font-semibold">
                      Confidence: High (98%)
                    </span>
                  </div>
                  <Zap className="w-8 h-8 text-indigo-500/20" />
                </div>
              </div>

              {/* Left Column: Live Features Visualizer & Telemetry Feed (8 Cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isRelocalizing ? "bg-amber-500 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
                      <span className="text-xs font-bold uppercase tracking-wider font-mono">
                        SLAM Core Status: {slamState}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={triggerRelocalize}
                        className="px-3 py-1 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-[10px] font-bold font-mono rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRelocalizing ? "animate-spin" : ""}`} />
                        <span>Force Re-localize</span>
                      </button>
                      <button
                        onClick={triggerLoopClosure}
                        className="px-3 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono rounded-lg transition-colors cursor-pointer"
                      >
                        Trigger Loop Closure
                      </button>
                    </div>
                  </div>

                  {/* Feature Match Canvas */}
                  <div className="bg-slate-950 rounded-lg overflow-hidden border border-slate-850 h-[280px] relative flex justify-center items-center">
                    <canvas
                      ref={canvasRef}
                      width={680}
                      height={280}
                      className="w-full h-full block"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-slate-950 p-3.5 rounded-xl border border-slate-900 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-mono">REPROJECTION ERROR</span>
                      <span className="font-bold text-white font-mono text-sm">{slamMetrics.reprojectionError} px</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-mono">TRACKED SLAM POINTS</span>
                      <span className="font-bold text-white font-mono text-sm">{slamMetrics.trackedPoints} pts</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-mono">LOOP CLOSURES RECORDED</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">{slamMetrics.loopClosures} Matches</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Spatial Matrix & Bounding Box (4 Cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <span>Pose Matrix & Quaternions</span>
                  </h3>

                  <div className="flex flex-col gap-3 font-mono text-xs">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">TRANSLATION VECTOR (X,Y,Z)</span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-900 px-2 py-1.5 rounded text-indigo-300 font-bold">X: {cameraPose.x}</div>
                        <div className="bg-slate-900 px-2 py-1.5 rounded text-indigo-300 font-bold">Y: {cameraPose.y}</div>
                        <div className="bg-slate-900 px-2 py-1.5 rounded text-indigo-300 font-bold">Z: {cameraPose.z}</div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">ROTATION QUATERNION (W,X,Y,Z)</span>
                      <div className="grid grid-cols-4 gap-1 text-[10px] text-center">
                        <div className="bg-slate-900 px-1.5 py-1 rounded text-slate-400">w: {cameraPose.qw}</div>
                        <div className="bg-slate-900 px-1.5 py-1 rounded text-slate-400">x: {cameraPose.qx}</div>
                        <div className="bg-slate-900 px-1.5 py-1 rounded text-slate-400">y: {cameraPose.qy}</div>
                        <div className="bg-slate-900 px-1.5 py-1 rounded text-slate-400">z: {cameraPose.qz}</div>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">EULER DEGREES (PITCH, YAW, ROLL)</span>
                      <div className="flex justify-between items-center text-[11px] text-slate-300 border-b border-slate-900 py-1">
                        <span>Heading / Yaw:</span>
                        <span className="font-bold text-white">{cameraPose.heading}°</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-300 border-b border-slate-900 py-1">
                        <span>Pitch Angle:</span>
                        <span className="font-bold text-white">{cameraPose.pitch}°</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-300 py-1">
                        <span>Roll Twist:</span>
                        <span className="font-bold text-white">{cameraPose.roll}°</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>Real-time Console Logs</span>
                  </h3>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-[10px] text-slate-400 h-[105px] overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
                    <div className="text-emerald-400">[SLAM_CORE] Successfully computed scale factor transform (s=1.002).</div>
                    <div className="text-indigo-400">[KD_TREE] spatial search query matching active on Wing B.</div>
                    <div className="text-slate-500">[WORKER_Q] Queue frame payload registration payload completed.</div>
                    <div className="text-emerald-400">[LOOP] loop closure matrix populated from keyframe #124.</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 2: SLAM STUDIO (SUPERPOINT & SUPERGLUE FOCUS) */}
          {activeSubTab === "slam_studio" && (
            <motion.div
              key="slam_studio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex justify-between items-center border-b border-slate-800 pb-3">
                  <span>Visual Feature Matching Engine (Dense Graph Projection)</span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-500/20">SuperGlue + LightGlue Enabled</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Below is the direct live camera stream matching keypoints against the computed CAD perspective renderer. The neural feature extraction uses <strong>SuperPoint</strong> for descriptors and <strong>SuperGlue</strong> for graph matching context.
                </p>

                {/* Sub-canvas showing depth map generation or re-projection */}
                <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-850 h-[320px] flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 to-transparent opacity-50" />
                  <div className="grid grid-cols-2 w-full h-full p-4 gap-4 z-10">
                    <div className="border border-slate-800 rounded-lg bg-slate-900/60 p-3 flex flex-col justify-between relative">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>CAMERA FRAME #245A</span>
                        <span className="text-emerald-400">ACTIVE DESCRIPTORS: 480</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center py-4">
                        {/* Simulated feature points cluster */}
                        <div className="relative w-40 h-40 border border-dashed border-indigo-500/20 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: "12s" }}>
                          <span className="absolute w-2 h-2 rounded-full bg-indigo-500 top-4 left-10 animate-ping" />
                          <span className="absolute w-2 h-2 rounded-full bg-indigo-400 bottom-8 right-12" />
                          <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 top-20 right-6 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono bg-slate-950 p-2 rounded border border-slate-850 truncate">
                        Descriptors Matrix: [128 floats x 480 points]
                      </div>
                    </div>

                    <div className="border border-slate-800 rounded-lg bg-slate-900/60 p-3 flex flex-col justify-between relative">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>SYNTHETIC BIM IFC RENDER</span>
                        <span className="text-emerald-400">PROJECTED VERTICES: 12.4K</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center py-4">
                        {/* Simulated BIM Wireframe mesh */}
                        <div className="w-40 h-40 border border-emerald-500/20 rounded-lg flex items-center justify-center relative">
                          <div className="absolute inset-2 border border-emerald-500/10 rotate-12" />
                          <div className="absolute inset-6 border border-indigo-500/15 -rotate-45" />
                          <Compass className="w-8 h-8 text-emerald-500/40 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono bg-slate-950 p-2 rounded border border-slate-850 truncate">
                        Transformation: R_align_matrix (3x3), t_align (3x1)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Pipeline Optimization Toggles</span>
                </h3>

                <div className="flex flex-col gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 font-mono block mb-2">MAX CORRESPONDENCE THRESHOLD</label>
                    <input type="range" className="w-full accent-indigo-600" defaultValue="75" />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>0.1 px</span>
                      <span>Selected: 0.75 px</span>
                      <span>2.0 px</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono block mb-2">MIN SUPERPOINT CONFIDENCE</label>
                    <input type="range" className="w-full accent-indigo-600" defaultValue="90" />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>50%</span>
                      <span>Selected: 90%</span>
                      <span>99%</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 flex flex-col gap-2.5">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">SLAM STAGES OVERVIEW</span>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Incremental Mapping:</span>
                      <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Bundle Adjustment:</span>
                      <span className="text-emerald-400 font-bold font-mono">CONVERGED (0.01s)</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Pose Graph Optim.:</span>
                      <span className="text-emerald-400 font-bold font-mono">STABILIZED</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 3: SPATIAL KD-TREE INSPECTOR */}
          {activeSubTab === "spatial_inspector" && (
            <motion.div
              key="spatial_inspector"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex justify-between items-center border-b border-slate-800 pb-3">
                  <span>KD-Tree & Octree 3D Query Bounds</span>
                  <span className="text-[10px] text-slate-400 font-mono">KD-Tree Dimensions: 3D</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The spatial indexing engine maintains high-performance bounding box volumes (BVH) representing millions of IFC architectural components. It queries spatial intersections inside the camera's visual frustum cone.
                </p>

                {/* Spatial search range slider */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-300">Spatial Query Search Radius</span>
                    <span className="text-xs font-bold font-mono text-indigo-400">{spatialQueryRadius} meters</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={spatialQueryRadius}
                    onChange={(e) => setSpatialQueryRadius(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Nearest Neighbor Spatial Query Results (Sub-second)</span>
                  <div className="flex flex-col gap-2">
                    {kdTreeSearchResults.map((result, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-900 p-2.5 rounded border border-slate-800 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-white font-bold">{result.id}</span>
                          <span className="text-slate-500 text-[10px]">({result.type})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">Dist: {(result.dist * (spatialQueryRadius / 3)).toFixed(2)}m</span>
                          <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded">Verified</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>BIM Object GUID Indexing Ledger</span>
                </h3>

                <div className="flex flex-col gap-3">
                  {localizedObjects.map((obj, index) => (
                    <div key={index} className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-white font-mono">{obj.category}</span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                          {(obj.confidence * 100).toFixed(0)}% Match
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono select-all">
                        GUID: {obj.guid}
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-900">
                        <span>Level: {obj.level}</span>
                        <span>Distance: {obj.distance}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 4: REPLAY VIEWER (WALKTHROUGH REPLAY PLAYER) */}
          {activeSubTab === "replay_viewer" && (
            <motion.div
              key="replay_viewer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-emerald-400" />
                    <span>SLAM Trajectory Route Replay Player</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
                      <span>{isPlaying ? "Pause" : "Play Path"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentFrameIndex(0);
                        setIsPlaying(false);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 rounded-lg text-slate-300 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Simulated Trajectory Map Path */}
                <div className="bg-slate-950 rounded-xl border border-slate-850 h-[280px] p-6 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 to-transparent opacity-50" />
                  
                  {/* Visualizing Walking Track Path */}
                  <div className="flex-1 relative border border-dashed border-slate-800/80 rounded-lg bg-slate-900/20 p-4">
                    {/* Horizontal coordinate graph with walking nodes */}
                    <div className="absolute inset-x-8 top-1/2 h-0.5 bg-slate-800" />
                    
                    {/* Render node positions */}
                    {replayFrames.map((frame, idx) => {
                      const isActive = idx === currentFrameIndex;
                      const isVisited = idx <= currentFrameIndex;
                      return (
                        <div
                          key={idx}
                          className="absolute transition-all duration-300"
                          style={{
                            left: `${8 + (idx * 8.5)}%`,
                            top: `${40 + (Math.sin(idx * 0.8) * 20)}%`,
                            transform: "translate(-50%, -50%)"
                          }}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center text-[7px] font-mono font-bold ${
                              isActive
                                ? "bg-indigo-600 border-white text-white scale-125 shadow-lg shadow-indigo-500/40"
                                : isVisited
                                ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                                : "bg-slate-900 border-slate-700 text-slate-500"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          {isActive && (
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-indigo-900 text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-indigo-500/30 whitespace-nowrap z-20">
                              {frame.room}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Scrubber and Timeline slider controls */}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] font-mono text-slate-500">TIMESTAMP: {replayFrames[currentFrameIndex].timestamp}s</span>
                    <input
                      type="range"
                      min="0"
                      max={replayFrames.length - 1}
                      value={currentFrameIndex}
                      onChange={(e) => setCurrentFrameIndex(Number(e.target.value))}
                      className="flex-1 accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-500">SPEED:</span>
                      <select
                        value={replaySpeed}
                        onChange={(e) => setReplaySpeed(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-800 text-[10px] font-mono rounded px-1 py-0.5 text-white"
                      >
                        <option value={1}>1x</option>
                        <option value={2}>2x</option>
                        <option value={4}>4x</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-900">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">CURRENT FLOOR</span>
                    <span className="font-extrabold text-white">{replayFrames[currentFrameIndex].floor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">WALKING SPEED</span>
                    <span className="font-extrabold text-white">1.1 m/s</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">ROOM COVERAGE</span>
                    <span className="font-extrabold text-emerald-400">89.2%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">MISSED SEGMENTS</span>
                    <span className="font-extrabold text-rose-400">03 (Minor)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Walkthrough detected assets timeline list */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Real-time Segment Detections</span>
                </h3>

                <div className="flex flex-col gap-3 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
                  {replayFrames[currentFrameIndex].detectedObjects.map((obj, i) => (
                    <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono text-white font-bold">{obj}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">IFC Class Match</span>
                    </div>
                  ))}
                  <div className="text-[10px] text-slate-500 font-mono text-center p-3 border border-dashed border-slate-800 rounded-lg">
                    Detections refresh dynamically as camera traverses the SLAM vector line.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUB-TAB 5: SYSTEM SPECIFICATIONS & BLUEPRINTS */}
          {activeSubTab === "architecture" && (
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
                      <FileCode2 className="w-4 h-4 text-indigo-400" />
                      <span>Enterprise Backend Specifications</span>
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

app = FastAPI(title="Image-To-BIM Auto-Registration Engine")

class CameraPosePayload(BaseModel):
    session_id: str
    image_url: str
    sensor_timestamp: float

class RegistrationResponse(BaseModel):
    pose_matrix: List[List[float]]
    confidence: float
    floor_detected: str
    nearest_ifc_guid: str

@app.post("/api/v1/registration/estimate-pose", response_model=RegistrationResponse)
async def estimate_pose(payload: CameraPosePayload, background_tasks: BackgroundTasks):
    """
    Performs sub-second estimation using SuperPoint & LightGlue models
    and matches against the spatial KD-Tree inside the BIM IFC mesh.
    """
    # 1. Fetch Image & Run ORB / Neural pipeline
    # 2. Align coordinate frames (WCS -> IFC Global Origin)
    # 3. Query KD-Tree spatial index for nearest structural elements
    
    pose_matrix = np.eye(4).tolist() # Identity matrix representation
    
    return {
        "pose_matrix": pose_matrix,
        "confidence": 0.942,
        "floor_detected": "FLOOR 01",
        "nearest_ifc_guid": "7f4c9a12-bd88-4a55-bb2a-fa134d1bc910"
    }`}</pre>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] scrollbar-thin">
                    <pre>{`-- PostgreSQL Production-Grade DB Schema layout for Spatial BIM Assets
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- Store registered physical camera viewpoints
CREATE TABLE IF NOT EXISTS camera_poses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    x DOUBLE PRECISION NOT NULL,
    y DOUBLE PRECISION NOT NULL,
    z DOUBLE PRECISION NOT NULL,
    qw DOUBLE PRECISION NOT NULL,
    qx DOUBLE PRECISION NOT NULL,
    qy DOUBLE PRECISION NOT NULL,
    qz DOUBLE PRECISION NOT NULL,
    heading DOUBLE PRECISION NOT NULL,
    pitch DOUBLE PRECISION NOT NULL,
    roll DOUBLE PRECISION NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_camera_poses_session ON camera_poses(session_id);
-- B-Tree index for XYZ range queries
CREATE INDEX IF NOT EXISTS idx_spatial_xyz ON camera_poses(x, y, z);`}</pre>
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
