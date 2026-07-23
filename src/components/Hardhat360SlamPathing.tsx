import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Compass, 
  Activity, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Maximize2, 
  Eye, 
  Sliders, 
  MapPin, 
  Clock, 
  Footprints, 
  Cpu, 
  Zap, 
  Download, 
  RefreshCw, 
  ShieldAlert, 
  Check, 
  Box, 
  Crosshair, 
  Radio, 
  Move, 
  HelpCircle,
  FileSpreadsheet
} from "lucide-react";

interface KeyframeNode {
  id: number;
  time: string;
  seconds: number;
  label: string;
  room: string;
  x: number; // percentage on floorplan
  y: number; // percentage on floorplan
  status: "nominal" | "warning" | "critical";
  heading: number; // in degrees
  detectedItems: {
    name: string;
    category: "MEP" | "Drywall" | "Structure" | "Safety";
    status: "matched" | "missing" | "displaced" | "extra";
    confidence: number;
    bimId: string;
    details: string;
  }[];
  imuData: {
    accel: [number, number, number];
    gyro: [number, number, number];
    driftScore: number;
    featureCount: number;
  };
}

const WALK_NODES: KeyframeNode[] = [
  {
    id: 1,
    time: "00:45",
    seconds: 45,
    label: "Node 01 - Elevator Lobby B",
    room: "Lobby Corridor 3-A",
    x: 18,
    y: 82,
    status: "nominal",
    heading: 45,
    detectedItems: [
      { name: "Cable Tray CT-301", category: "MEP", status: "matched", confidence: 98.4, bimId: "BIM-CT-301", details: "Installed at elevation +3.4m as per design" },
      { name: "Structural Column C14", category: "Structure", status: "matched", confidence: 99.1, bimId: "BIM-COL-C14", details: "Concrete curing complete, 0mm deviation" },
      { name: "Sprinkler Pipe SP-08", category: "MEP", status: "matched", confidence: 96.2, bimId: "BIM-SP-08", details: "Hanger spacing 1.8m compliant" }
    ],
    imuData: { accel: [0.02, 0.98, 0.05], gyro: [0.01, -0.02, 0.04], driftScore: 0.02, featureCount: 1480 }
  },
  {
    id: 2,
    time: "02:15",
    seconds: 135,
    label: "Node 02 - Primary East Corridor",
    room: "Corridor 3-E",
    x: 32,
    y: 68,
    status: "nominal",
    heading: 30,
    detectedItems: [
      { name: "HVAC Main Trunk Line", category: "MEP", status: "matched", confidence: 97.8, bimId: "BIM-HVAC-T01", details: "Duct insulation applied" },
      { name: "Metal Stud Track Floor", category: "Drywall", status: "matched", confidence: 95.1, bimId: "BIM-DW-TRK1", details: "Layout matches grid line E-4" }
    ],
    imuData: { accel: [0.05, 0.96, 0.08], gyro: [-0.03, 0.01, 0.02], driftScore: 0.03, featureCount: 1320 }
  },
  {
    id: 3,
    time: "04:10",
    seconds: 250,
    label: "Node 03 - Server Room Entrance",
    room: "Server Room 304",
    x: 48,
    y: 52,
    status: "warning",
    heading: 90,
    detectedItems: [
      { name: "Conduit Bundle CB-12", category: "MEP", status: "displaced", confidence: 91.5, bimId: "BIM-CB-12", details: "Horizontal shift of 140mm south vs BIM design" },
      { name: "Fire Door Frame DF-04", category: "Structure", status: "matched", confidence: 98.0, bimId: "BIM-DF-04", details: "Plumb & level verified" }
    ],
    imuData: { accel: [0.12, 0.92, 0.15], gyro: [0.08, -0.05, 0.09], driftScore: 0.08, featureCount: 1150 }
  },
  {
    id: 4,
    time: "06:30",
    seconds: 390,
    label: "Node 04 - Mechanical Plant Room 3B",
    room: "Plant Room 3B",
    x: 65,
    y: 35,
    status: "critical",
    heading: 135,
    detectedItems: [
      { name: "Motorized Fire Damper FD-302", category: "MEP", status: "missing", confidence: 99.2, bimId: "BIM-FD-302", details: "CRITICAL: Duct opening unsealed. Damper unit absent in physical walk." },
      { name: "Chilled Water Pipe CHW-01", category: "MEP", status: "matched", confidence: 94.6, bimId: "BIM-CHW-01", details: "Valves installed, pressure test tag attached" },
      { name: "Acoustic Insulation Batt", category: "Drywall", status: "missing", confidence: 96.8, bimId: "BIM-INS-02", details: "Wall cavity left uninsulated prior to board closing" }
    ],
    imuData: { accel: [-0.08, 0.99, 0.02], gyro: [0.02, 0.04, -0.01], driftScore: 0.04, featureCount: 1560 }
  },
  {
    id: 5,
    time: "09:00",
    seconds: 540,
    label: "Node 05 - Open Plan Zone 308",
    room: "Zone 308 - Workstation Bay",
    x: 82,
    y: 48,
    status: "nominal",
    heading: 210,
    detectedItems: [
      { name: "Ceiling Hanger Grid Wire", category: "Drywall", status: "matched", confidence: 97.1, bimId: "BIM-CLG-08", details: "1.2m grid layout compliant" },
      { name: "VAV Terminal Unit VAV-09", category: "MEP", status: "matched", confidence: 98.9, bimId: "BIM-VAV-09", details: "Flexible duct connected" }
    ],
    imuData: { accel: [0.01, 0.97, 0.04], gyro: [-0.01, 0.02, 0.01], driftScore: 0.02, featureCount: 1610 }
  },
  {
    id: 6,
    time: "11:45",
    seconds: 705,
    label: "Node 06 - Executive Suite Partition",
    room: "Exec Room 312",
    x: 68,
    y: 78,
    status: "warning",
    heading: 270,
    detectedItems: [
      { name: "In-wall Backing Plate", category: "Drywall", status: "missing", confidence: 93.4, bimId: "BIM-BK-14", details: "Missing timber backing for heavy wall TV mount" },
      { name: "Drywall Board One-Side", category: "Drywall", status: "matched", confidence: 97.5, bimId: "BIM-DW-BS1", details: "Boarding complete, screw pitch verified" }
    ],
    imuData: { accel: [0.04, 0.95, 0.06], gyro: [0.05, -0.02, 0.03], driftScore: 0.05, featureCount: 1290 }
  }
];

export default function Hardhat360SlamPathing() {
  const [selectedNode, setSelectedNode] = useState<KeyframeNode>(WALK_NODES[3]); // default node 4 (critical)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [cameraPanAngle, setCameraPanAngle] = useState<number>(0);
  const [showAiBoxes, setShowAiBoxes] = useState<boolean>(true);
  const [showDepthHeatmap, setShowDepthHeatmap] = useState<boolean>(false);
  const [showImuTelemetry, setShowImuTelemetry] = useState<boolean>(true);
  const [selectedFloor, setSelectedFloor] = useState<string>("Floor 3 - MEP & Interior");
  const [loopClosureActive, setLoopClosureActive] = useState<boolean>(true);

  // Playback timer simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedNode((prevNode) => {
          const nextIndex = (WALK_NODES.findIndex(n => n.id === prevNode.id) + 1) % WALK_NODES.length;
          return WALK_NODES[nextIndex];
        });
      }, 3000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Handle angle pan
  const panLeft = () => setCameraPanAngle((prev) => (prev - 45 + 360) % 360);
  const panRight = () => setCameraPanAngle((prev) => (prev + 45) % 360);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                HARDHAT 360° SLAM PATHING ENGINE
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-emerald-500/30">
                ACTIVE RECONSTRUCTION
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Footprints className="w-8 h-8 text-indigo-400 shrink-0" />
              360° Helmet Camera Trajectory & SLAM Walk Inspector
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Real-time 6-DoF visual-inertial odometry trajectory reconstructed from site inspectors' 360° helmet camera walk. Cross-references physical geometry frame-by-frame against the 4D BIM design.
            </p>
          </div>

          {/* QUICK TOP STATS & ACTIONS */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-left min-w-[130px]">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Floor Zone</div>
              <select 
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="bg-transparent text-xs font-bold text-indigo-300 focus:outline-none cursor-pointer mt-0.5"
              >
                <option value="Floor 3 - MEP & Interior" className="bg-slate-900 text-white">Floor 3 - MEP & Interior</option>
                <option value="Floor 2 - Structural Slab" className="bg-slate-900 text-white">Floor 2 - Structural Slab</option>
                <option value="Floor 1 - Main Lobby" className="bg-slate-900 text-white">Floor 1 - Main Lobby</option>
              </select>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-left">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Capture Session</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Walk #108 (14m 32s)
              </div>
            </div>

            <button 
              onClick={() => setLoopClosureActive(!loopClosureActive)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                loopClosureActive 
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30" 
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loopClosureActive ? "animate-spin" : ""}`} />
              {loopClosureActive ? "SLAM Loop Closure Active" : "Enable Loop Closure"}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE 2D FLOORPLAN & PATH TRAJECTORY (5 COLS) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Site Walk Path & SLAM Keyframe Nodes
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                2D Trajectory View
              </span>
            </div>

            {/* SVG FLOORPLAN CANVAS WITH ANIMATED WALK PATH */}
            <div className="relative w-full aspect-[4/3] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner group">
              {/* Floorplan Structural Background Lines */}
              <svg className="absolute inset-0 w-full h-full text-slate-800" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Structural Grid */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,1" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" opacity="0.4" />

                {/* Rooms & Corridors Outline */}
                <rect x="10" y="10" width="80" height="80" fill="none" stroke="#334155" strokeWidth="1.5" />
                <line x1="40" y1="10" x2="40" y2="90" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="70" y1="10" x2="70" y2="90" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="10" y1="40" x2="90" y2="40" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="10" y1="70" x2="90" y2="70" stroke="#334155" strokeWidth="1" strokeDasharray="2,2" />

                {/* Room Labels */}
                <text x="25" y="25" fill="#475569" fontSize="3" fontWeight="bold">LOBBY 3-A</text>
                <text x="52" y="25" fill="#475569" fontSize="3" fontWeight="bold">CORRIDOR EAST</text>
                <text x="75" y="25" fill="#475569" fontSize="3" fontWeight="bold">PLANT ROOM 3B</text>
                <text x="25" y="55" fill="#475569" fontSize="3" fontWeight="bold">SERVER ROOM 304</text>
                <text x="75" y="55" fill="#475569" fontSize="3" fontWeight="bold">ZONE 308</text>
                <text x="50" y="80" fill="#475569" fontSize="3" fontWeight="bold">EXEC SUITE 312</text>

                {/* SLAM Trajectory Path Line connecting nodes */}
                <path 
                  d={`M ${WALK_NODES.map(n => `${n.x} ${n.y}`).join(" L ")}`} 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="1.8" 
                  strokeDasharray="3,2" 
                />

                {/* Trajectory Direction Arrows */}
                {WALK_NODES.map((node, i) => {
                  if (i === WALK_NODES.length - 1) return null;
                  const next = WALK_NODES[i + 1];
                  const midX = (node.x + next.x) / 2;
                  const midY = (node.y + next.y) / 2;
                  return (
                    <circle key={`dir-${i}`} cx={midX} cy={midY} r="0.8" fill="#818cf8" />
                  );
                })}
              </svg>

              {/* NODE BUTTONS ON FLOORPLAN */}
              {WALK_NODES.map((node) => {
                const isSelected = selectedNode.id === node.id;
                let badgeColor = "bg-emerald-500 border-emerald-300 text-emerald-950";
                if (node.status === "warning") badgeColor = "bg-amber-500 border-amber-300 text-amber-950";
                if (node.status === "critical") badgeColor = "bg-rose-500 border-rose-300 text-rose-950 animate-bounce";

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group/node transition-transform duration-200 ${
                      isSelected ? "scale-125 z-30" : "hover:scale-110 z-20"
                    }`}
                    title={`${node.label} - ${node.room}`}
                  >
                    {/* Active Cone Field-of-View for selected node */}
                    {isSelected && (
                      <div 
                        style={{ transform: `rotate(${node.heading}deg)` }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none"
                      >
                        <div className="w-full h-full bg-indigo-500/25 rounded-full border border-indigo-400/50 clip-cone" />
                      </div>
                    )}

                    {/* Node Dot Indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-mono text-[10px] font-bold shadow-lg ${badgeColor} ${
                      isSelected ? "ring-4 ring-indigo-500/50" : ""
                    }`}>
                      {node.id}
                    </div>

                    {/* Hover Label */}
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 hidden group-hover/node:flex flex-col bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-40 border border-slate-700 pointer-events-none">
                      <span className="font-bold">{node.label}</span>
                      <span className="text-slate-400">{node.time} • {node.room}</span>
                    </div>
                  </button>
                );
              })}

              {/* CURRENT POSITION PULSE ICON */}
              <div 
                style={{ left: `${selectedNode.x}%`, top: `${selectedNode.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
              >
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full animate-ping" />
              </div>
            </div>

            {/* CONTROLS & TIMELINE SCRUBBER */}
            <div className="mt-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  KEYFRAME {selectedNode.id} / {WALK_NODES.length}
                </span>
                <span>TIME: {selectedNode.time} / 14:32</span>
              </div>

              {/* Timeline Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative cursor-pointer">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(selectedNode.id / WALK_NODES.length) * 100}%` }}
                />
              </div>

              {/* Playback Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center justify-center font-bold text-xs gap-1"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    <span>{isPlaying ? "Pause Walk" : "Play Walk"}</span>
                  </button>

                  <button 
                    onClick={() => setSelectedNode(WALK_NODES[0])}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    title="Reset to Start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed Toggle */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {[1, 2, 4].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                        playbackSpeed === speed 
                          ? "bg-indigo-600 text-white" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* REAL-TIME VISUAL-INERTIAL TELEMETRY PANEL */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                VI-SLAM ODOMETRY TELEMETRY
              </span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                6-DoF TRACKING OK
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[9px] text-slate-400">Drift Error</div>
                <div className="text-xs font-bold text-emerald-400">{selectedNode.imuData.driftScore}%</div>
              </div>

              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[9px] text-slate-400">Feature Anchors</div>
                <div className="text-xs font-bold text-indigo-300">{selectedNode.imuData.featureCount}</div>
              </div>

              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[9px] text-slate-400">IMU Accel (G)</div>
                <div className="text-xs font-bold text-amber-300">
                  {selectedNode.imuData.accel[1]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DUAL VIEWPORT INSPECTION & COMPARISON (7 COLS) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg space-y-5">
          
          {/* TOP TITLE & VIEWPORT TOGGLES */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
                  {selectedNode.label}
                </span>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                  selectedNode.status === "critical" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                  selectedNode.status === "warning" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                  "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}>
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                360° Physical Capture vs. 4D BIM Design Overlay
              </h2>
            </div>

            {/* AI OVERLAY CONTROLS */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAiBoxes(!showAiBoxes)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  showAiBoxes 
                    ? "bg-indigo-600 text-white border-indigo-500 shadow" 
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                AI Bounding Boxes
              </button>

              <button
                onClick={() => setShowDepthHeatmap(!showDepthHeatmap)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  showDepthHeatmap 
                    ? "bg-cyan-600 text-white border-cyan-500 shadow" 
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Depth Mesh
              </button>
            </div>
          </div>

          {/* DUAL COMPARISON VIEWPORTS (SPLIT VIEW) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* VIEWPORT 1: 360° PHYSICAL HELMET CAMERA FRAME */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative group">
              <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  360° Physical Photo Frame
                </span>
                <span className="text-[10px] text-slate-400">Angle: {cameraPanAngle}°</span>
              </div>

              {/* SIMULATED 360 PANORAMA CONTAINER */}
              <div className={`relative w-full aspect-[4/3] bg-slate-900 overflow-hidden flex items-center justify-center ${
                showDepthHeatmap ? "bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950" : ""
              }`}>
                {/* Background Synthetic Camera Image Representation */}
                <div className="absolute inset-0 bg-slate-900 p-4 flex flex-col justify-between opacity-90">
                  {/* Grid Lines indicating 360 lens calibration */}
                  <svg className="absolute inset-0 w-full h-full opacity-20 text-indigo-400 pointer-events-none" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
                    <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" />
                  </svg>

                  {/* Visual Representation of Site Image Frame */}
                  <div className="relative z-10 w-full h-full border border-slate-700/50 rounded-lg p-3 flex flex-col justify-between bg-slate-950/60 backdrop-blur-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>LOCATION: {selectedNode.room}</span>
                      <span className="text-emerald-400 font-bold">FPS: 30.0</span>
                    </div>

                    {/* Simulated Construction Scene Elements */}
                    <div className="space-y-2 my-auto">
                      {selectedNode.detectedItems.map((item, idx) => (
                        <div 
                          key={idx}
                          className={`p-2 rounded border text-xs flex items-center justify-between ${
                            item.status === "missing" 
                              ? "bg-rose-500/20 border-rose-500/50 text-rose-200" :
                            item.status === "displaced"
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-200" :
                              "bg-emerald-500/20 border-emerald-500/50 text-emerald-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {item.status === "missing" && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                            {item.status === "displaced" && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                            {item.status === "matched" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                            <div>
                              <div className="font-bold text-white text-[11px]">{item.name}</div>
                              <div className="text-[9px] opacity-80">{item.details}</div>
                            </div>
                          </div>
                          {showAiBoxes && (
                            <span className="text-[9px] font-mono bg-slate-900/80 px-1.5 py-0.5 rounded font-bold">
                              {item.confidence}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="text-[9px] font-mono text-slate-500 text-right">
                      FRAME ID: #FRAME-2026-0723-{selectedNode.id * 1042}
                    </div>
                  </div>
                </div>

                {/* PAN ANGLE CONTROLS OVERLAY */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-20 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                  <button 
                    onClick={panLeft} 
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono font-bold rounded transition-colors"
                  >
                    ◀ Pan 45°
                  </button>
                  <span className="text-[10px] font-mono text-indigo-300 font-bold">360° Panorama Angle</span>
                  <button 
                    onClick={panRight} 
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono font-bold rounded transition-colors"
                  >
                    Pan 45° ▶
                  </button>
                </div>
              </div>
            </div>

            {/* VIEWPORT 2: SYNTHETIC 4D BIM SYNCHRONIZED MODEL */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative group">
              <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5 font-bold text-indigo-400">
                  <Box className="w-3.5 h-3.5 text-indigo-400" />
                  4D BIM Expected Design Slice
                </span>
                <span className="text-[10px] text-slate-400">BIM v4.2 Sync</span>
              </div>

              {/* 4D BIM RENDERING CONTAINER */}
              <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden flex items-center justify-center p-4">
                {/* BIM Grid Wireframe background */}
                <div className="w-full h-full border border-indigo-500/30 rounded-lg p-3 flex flex-col justify-between bg-indigo-950/20 backdrop-blur-xs relative">
                  <div className="flex items-center justify-between text-[10px] font-mono text-indigo-300">
                    <span>POSE: [X: {selectedNode.x}.2, Y: {selectedNode.y}.8, Z: 3.4m]</span>
                    <span className="text-emerald-400 font-bold">BIM LOD 400</span>
                  </div>

                  {/* BIM Expected Elements List */}
                  <div className="space-y-2 my-auto">
                    {selectedNode.detectedItems.map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-2 rounded border border-indigo-500/30 bg-indigo-950/40 text-indigo-100 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Box className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div>
                            <div className="font-bold text-white text-[11px]">{item.name}</div>
                            <div className="text-[9px] text-indigo-300 font-mono">BIM ID: {item.bimId}</div>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono bg-indigo-900/60 text-indigo-200 px-2 py-0.5 rounded font-bold border border-indigo-500/30">
                          SCHEDULED
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[9px] font-mono text-indigo-400 text-right">
                    COORDINATES: AUTODESK REVIT / IFC4 SYNC
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* DISCREPANCY & AI INSPECTION ANALYSIS BANNER */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                AI REALITY DISCREPANCY DETECTED AT THIS KEYFRAME
              </span>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded font-bold">
                ACTION REQUIRED
              </span>
            </div>

            <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 text-xs space-y-2">
              {selectedNode.detectedItems.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between gap-4 py-1 border-b border-slate-800/80 last:border-none">
                  <div>
                    <span className="font-bold text-slate-200">{item.name}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{item.details}</p>
                  </div>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase shrink-0 ${
                    item.status === "missing" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                    item.status === "displaced" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                    "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* QUICK ACTIONS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-slate-400 font-mono">
                Assigned Trade: <span className="text-indigo-300 font-bold">Voltas MEP & Drywall Contracting</span>
              </div>

              <button 
                onClick={() => alert(`Generated discrepancy ticket for ${selectedNode.label} and logged to Issue Tracker.`)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Flag Discrepancy Ticket to Contractor
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
