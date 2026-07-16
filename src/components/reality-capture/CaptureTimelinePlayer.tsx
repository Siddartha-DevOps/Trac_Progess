import React, { useState, useEffect, useRef } from "react";
import { TIMELINE_HISTORY, TimelineDay } from "./mockData";
import { 
  Play, 
  Pause, 
  Calendar, 
  Layers, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  RotateCcw, 
  Sliders, 
  User, 
  TrendingUp, 
  Cpu, 
  Flame, 
  ShieldCheck, 
  FileSpreadsheet,
  Compass,
  MapPin,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Camera,
  Maximize2,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Waypoints on our interactive Level 2 Floorplan
interface WalkwayNode {
  id: string;
  name: string;
  gridRef: string;
  x: number; // percentage in SVG floorplan
  y: number; // percentage in SVG floorplan
  photoUrl: string;
  bimUrl: string;
  trade: string;
  description: string;
  elementsDetected: { name: string; status: "verified" | "discrepancy" | "pending"; spec: string }[];
  anomalies: { id: string; title: string; severity: "critical" | "warning" | "nominal"; text: string }[];
}

const WALKWAY_NODES: WalkwayNode[] = [
  {
    id: "node-1",
    name: "Structural Column Grid C4",
    gridRef: "L2-C04-SEC3",
    x: 22,
    y: 35,
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80",
    bimUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=1600&q=80", // brickwork overlay texture for BIM feel
    trade: "Structural Concrete",
    description: "Pour and curing verification of Grade M35 load-bearing concrete column.",
    elementsDetected: [
      { name: "Concrete Column L2-C04", status: "verified", spec: "M35 Concrete" },
      { name: "Rebar Cage Tied", status: "discrepancy", spec: "Fe550D High Tensile" },
      { name: "Slab Formwork L2-S3", status: "verified", spec: "Plywood shuttering" }
    ],
    anomalies: [
      { id: "an-01", title: "Stirrup Spacing Defect", severity: "warning", text: "Stirrup spacing exceeds 150mm code maximum on column head L2-C04." }
    ]
  },
  {
    id: "node-2",
    name: "Service Corridor West Wing",
    gridRef: "L2-COR-B5",
    x: 45,
    y: 38,
    photoUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=1600&q=80", // industrial pipes/install
    bimUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80", // industrial architecture line mockup
    trade: "MEP Services",
    description: "Verification of overhead HVAC galvanized ducts and primary fire protection pipelines.",
    elementsDetected: [
      { name: "Galvanized HVAC Duct 1.2mm", status: "discrepancy", spec: "800x400 Header" },
      { name: "Fire Sprinkler Main Run", status: "verified", spec: "DN50 Steel Piping" },
      { name: "PPR Chilled Water Loops", status: "pending", spec: "32mm Insulation Pipe" }
    ],
    anomalies: [
      { id: "an-02", title: "Sprinkler Pipe Interference", severity: "critical", text: "Primary HVAC duct runs directly into the fire sprinkler main pipe line." }
    ]
  },
  {
    id: "node-3",
    name: "Server Room Partition A",
    gridRef: "L2-SRV-01",
    x: 68,
    y: 55,
    photoUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80", // steel structures
    bimUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80",
    trade: "Drywall & Partitioning",
    description: "Verification of galvanized light gauge steel frames for architectural drywalls.",
    elementsDetected: [
      { name: "Metal Stud Framing 100mm", status: "discrepancy", spec: "0.8mm Galvanized Profile" },
      { name: "Expansion Joint Junction", status: "verified", spec: "EJ-C5 standard detail" },
      { name: "Electrical Back-Boxes L2-E1", status: "verified", spec: "GI Flush Mounting Boxes" }
    ],
    anomalies: [
      { id: "an-03", title: "Double Stud Omission", severity: "warning", text: "Missing double stud reinforcement around partition wall expansion joints." }
    ]
  },
  {
    id: "node-4",
    name: "Office Suite 204 Area",
    gridRef: "L2-OFF-204",
    x: 82,
    y: 72,
    photoUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=1600&q=80", // brick blockwork
    bimUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=1600&q=80",
    trade: "AAC Block Masonry",
    description: "Verification of Autoclaved Aerated Concrete brick wall construction and cement plaster.",
    elementsDetected: [
      { name: "AAC Block Wall 150mm", status: "verified", spec: "Grade I block masonry" },
      { name: "Reinforced Concrete Lintel L4", status: "verified", spec: "M25 Cast In-Situ" },
      { name: "Electrical PVC Conduit Run", status: "verified", spec: "25mm Heavy Duty PVC" }
    ],
    anomalies: [
      { id: "an-04", title: "AAC Joint Under-filling", severity: "nominal", text: "Micro-cavities noticed in joint mortar. Normal deviation, patch required." }
    ]
  }
];

export default function CaptureTimelinePlayer() {
  const [currentIndex, setCurrentIndex] = useState<number>(5); // Default to Month 6 (Index 5, current week)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showBimOverlay, setShowBimOverlay] = useState<boolean>(true);
  const [showAiBoxes, setShowAiBoxes] = useState<boolean>(true);

  // Advanced Walkthrough Sync States
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(1); // Default to Waypoint B (MEP Corridor)
  const [syncLock, setSyncLock] = useState<boolean>(true); // Locked rotation by default
  const [leftYaw, setLeftYaw] = useState<number>(180); // 0-360 degrees
  const [leftPitch, setLeftPitch] = useState<number>(0);  // -45 to 45 degrees
  const [rightYaw, setRightYaw] = useState<number>(180);
  const [rightPitch, setRightPitch] = useState<number>(0);
  const [fov, setFov] = useState<number>(75); // Field of view
  const [isDraggingLeft, setIsDraggingLeft] = useState<boolean>(false);
  const [isDraggingRight, setIsDraggingRight] = useState<boolean>(false);
  
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const yawStartRef = useRef<number>(180);
  const pitchStartRef = useRef<number>(0);

  const activeDay = TIMELINE_HISTORY[currentIndex];
  const activeNode = WALKWAY_NODES[selectedNodeIndex];

  // Automatic Timeline walk play loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        // Increment Waypoint index instead of days to simulate actually moving along the walk path!
        setSelectedNodeIndex((prevNode) => {
          const nextNode = prevNode === WALKWAY_NODES.length - 1 ? 0 : prevNode + 1;
          
          // Also slowly shift yaw to make it look like a real operator scanning the room!
          setLeftYaw(y => (y + 45) % 360);
          if (syncLock) {
            setRightYaw(y => (y + 45) % 360);
          }
          
          return nextNode;
        });

        // Also slowly tick the timeline index to show weekly progress updates
        setCurrentIndex((prevDay) => (prevDay === TIMELINE_HISTORY.length - 1 ? 0 : prevDay + 1));
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, syncLock]);

  // Handle Drag on Left Pane (360° Photo)
  const handleMouseDownLeft = (e: React.MouseEvent) => {
    setIsDraggingLeft(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    yawStartRef.current = leftYaw;
    pitchStartRef.current = leftPitch;
    e.preventDefault();
  };

  const handleMouseMoveLeft = (e: React.MouseEvent) => {
    if (!isDraggingLeft) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    // Scale horizontal drag to 0.5 degrees per pixel
    const newYaw = (yawStartRef.current - deltaX * 0.5 + 360) % 360;
    // Scale vertical drag to 0.4 degrees per pixel, clamp between -40 and 40
    const newPitch = Math.max(-40, Math.min(40, pitchStartRef.current + deltaY * 0.4));

    setLeftYaw(newYaw);
    setLeftPitch(newPitch);

    if (syncLock) {
      setRightYaw(newYaw);
      setRightPitch(newPitch);
    }
  };

  const handleMouseUpLeft = () => {
    setIsDraggingLeft(false);
  };

  // Handle Drag on Right Pane (3D BIM Viewport)
  const handleMouseDownRight = (e: React.MouseEvent) => {
    setIsDraggingRight(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    yawStartRef.current = rightYaw;
    pitchStartRef.current = rightPitch;
    e.preventDefault();
  };

  const handleMouseMoveRight = (e: React.MouseEvent) => {
    if (!isDraggingRight) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const newYaw = (yawStartRef.current - deltaX * 0.5 + 360) % 360;
    const newPitch = Math.max(-40, Math.min(40, pitchStartRef.current + deltaY * 0.4));

    setRightYaw(newYaw);
    setRightPitch(newPitch);

    if (syncLock) {
      setLeftYaw(newYaw);
      setLeftPitch(newPitch);
    }
  };

  const handleMouseUpRight = () => {
    setIsDraggingRight(false);
  };

  // Trigger orientation reset
  const resetOrientation = () => {
    setLeftYaw(180);
    setLeftPitch(0);
    setRightYaw(180);
    setRightPitch(0);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-5 shadow-xl flex flex-col gap-5">
      
      {/* Title block detailing the engine capabilities */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400">
            <Compass className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest">Walkthrough Sync Engine</span>
          </div>
          <h2 className="text-lg font-black uppercase text-white mt-1">
            Buildots-Grade Split-Screen Panoramic Viewer
          </h2>
          <p className="text-xs text-slate-400">
            Fusing weekly 360° video frames with spatial BIM coordinate offsets. Hold and drag within either viewport to pan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSyncLock(!syncLock)}
            className={`px-3 py-1.5 rounded text-xs font-bold border flex items-center gap-1.5 transition ${
              syncLock 
                ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300" 
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
            title={syncLock ? "Rotation angles are synchronized" : "Rotation angles are independent"}
          >
            {syncLock ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span className="font-mono text-[10px]">SYNC {syncLock ? "LOCKED" : "FREE"}</span>
          </button>
          
          <button
            onClick={resetOrientation}
            className="px-3 py-1.5 rounded text-xs font-bold border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px]">RESET</span>
          </button>
        </div>
      </div>

      {/* Main split-screen panel and floorplan layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        
        {/* LEFT COLUMN: Dual Split Screen Viewport (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[380px]">
            
            {/* Viewport 1: Real-World 360° Photo */}
            <div 
              className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDownLeft}
              onMouseMove={handleMouseMoveLeft}
              onMouseUp={handleMouseUpLeft}
              onMouseLeave={handleMouseUpLeft}
            >
              {/* Simulated 360° panorama background */}
              <div 
                className="absolute inset-0 bg-no-repeat transition-all duration-75 pointer-events-none"
                style={{
                  backgroundImage: `url('${activeNode.photoUrl}')`,
                  backgroundSize: "3200px 800px", // simulated panorama stretch
                  backgroundPosition: `${leftYaw * 8}px ${leftPitch * 4}px`, // custom mapping representing yaw/pitch rotation
                  opacity: 0.65
                }}
              />
              {/* Vignette Overlay */}
              <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

              {/* Viewport HUD elements */}
              <div className="p-3 z-10 flex justify-between items-start pointer-events-none w-full">
                <span className="bg-slate-950/90 border border-slate-800 text-[9px] font-mono font-bold text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider">
                  REAL 360° SITE WALKTOWARDS
                </span>
                <span className="bg-slate-950/90 text-[9px] font-mono text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                  Yaw: {Math.round(leftYaw)}° | Pitch: {Math.round(leftPitch)}°
                </span>
              </div>

              {/* In-view spatial label (floating 3D tag) */}
              <div className="flex-1 flex items-center justify-center relative pointer-events-none">
                {showAiBoxes && (
                  <div 
                    className="absolute bg-slate-950/90 border border-indigo-500/50 p-2 rounded shadow-lg text-[10px] w-48 transition-all"
                    style={{
                      transform: `translate(${(leftYaw - 180) * 2}px, ${(leftPitch) * 2}px)`,
                      opacity: Math.abs(leftYaw - 180) < 60 ? 1 : 0.15
                    }}
                  >
                    <div className="flex items-center gap-1 text-indigo-400 font-black">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="uppercase tracking-wider">ELEMENT PINPOINT</span>
                    </div>
                    <p className="font-bold text-white mt-1">{activeNode.trade}</p>
                    <div className="text-[9px] text-slate-400 mt-0.5 border-t border-slate-800 pt-1 flex justify-between">
                      <span>Grid Ref:</span>
                      <span className="font-mono font-bold text-indigo-300">{activeNode.gridRef}</span>
                    </div>
                  </div>
                )}

                {/* Simulated Bounding Box for deviations */}
                {showAiBoxes && activeNode.anomalies.map(anom => (
                  <div
                    key={anom.id}
                    className={`absolute border-2 rounded p-1 flex flex-col justify-between transition-all ${
                      anom.severity === "critical" 
                        ? "border-red-500 bg-red-500/10 text-red-300" 
                        : "border-amber-500 bg-amber-500/10 text-amber-300"
                    }`}
                    style={{
                      width: "140px",
                      height: "80px",
                      transform: `translate(${(leftYaw - 180) * 2 - 80}px, ${(leftPitch) * 2 - 90}px)`,
                      opacity: Math.abs(leftYaw - 180) < 50 ? 1 : 0.05
                    }}
                  >
                    <span className={`text-[8px] font-bold uppercase font-mono px-1 rounded self-start ${
                      anom.severity === "critical" ? "bg-red-600 text-white" : "bg-amber-600 text-slate-900"
                    }`}>
                      {anom.title}
                    </span>
                    <span className="text-[7px] font-mono line-clamp-2 leading-tight">{anom.text}</span>
                  </div>
                ))}
              </div>

              {/* Bottom HUD elements */}
              <div className="p-3 z-10 flex justify-between items-end pointer-events-none w-full">
                <span className="text-[8px] font-mono text-slate-400 uppercase">
                  Time: {activeDay.date}
                </span>
                <span className="text-[9px] font-mono text-indigo-400 font-bold">
                  Camera: Insta360 Sphere
                </span>
              </div>
            </div>

            {/* Viewport 2: Virtual 3D BIM Twin */}
            <div 
              className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDownRight}
              onMouseMove={handleMouseMoveRight}
              onMouseUp={handleMouseUpRight}
              onMouseLeave={handleMouseUpRight}
            >
              {/* Simulated BIM layout background */}
              <div 
                className="absolute inset-0 bg-no-repeat transition-all duration-75 pointer-events-none"
                style={{
                  backgroundImage: `url('${activeNode.bimUrl}')`,
                  backgroundSize: "3200px 800px",
                  backgroundPosition: `${rightYaw * 8}px ${rightPitch * 4}px`,
                  opacity: 0.55
                }}
              />
              {/* Virtual Grid Shader */}
              <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-20" />

              {/* Viewport HUD elements */}
              <div className="p-3 z-10 flex justify-between items-start pointer-events-none w-full">
                <span className="bg-slate-950/90 border border-slate-800 text-[9px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider">
                  BIM IDEAL TWIN LAYER
                </span>
                <span className="bg-slate-950/90 text-[9px] font-mono text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                  FOV: {fov}° | Zoom: 1.0x
                </span>
              </div>

              {/* Overlaid BIM Wireframe vector representing target CAD layout */}
              {showBimOverlay && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <svg 
                    className="w-[90%] h-[90%] text-emerald-400/30 transition-transform duration-75"
                    style={{
                      transform: `translate(${(rightYaw - 180) * 1.5}px, ${rightPitch * 1.5}px) rotate(${rightPitch * 0.1}deg)`
                    }}
                    viewBox="0 0 400 200"
                  >
                    <path d="M 30,170 L 130,30 L 270,30 L 370,170 Z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="4 4" />
                    <line x1="130" y1="30" x2="130" y2="170" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
                    <line x1="270" y1="30" x2="270" y2="170" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
                    <circle cx="130" cy="30" r="3.5" fill="#10b981" />
                    <circle cx="270" cy="30" r="3.5" fill="#10b981" />
                  </svg>
                </div>
              )}

              {/* Bottom HUD elements */}
              <div className="p-3 z-10 flex justify-between items-end pointer-events-none w-full">
                <span className="text-[8px] font-mono text-emerald-500 uppercase font-bold">
                  BIM STATUS: LOCK ALIGNED
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">
                  Engine: Autodesk Forge cjs
                </span>
              </div>
            </div>

          </div>

          {/* Quick HUD Visibility Checkboxes */}
          <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-lg text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span className="uppercase font-bold text-[10px]">Viewport Toggles:</span>
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                <input 
                  type="checkbox" 
                  checked={showBimOverlay} 
                  onChange={(e) => setShowBimOverlay(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900 w-3.5 h-3.5"
                />
                <span>IFC Wireframe Overlay</span>
              </label>
              
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                <input 
                  type="checkbox" 
                  checked={showAiBoxes} 
                  onChange={(e) => setShowAiBoxes(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900 w-3.5 h-3.5"
                />
                <span>Computer Vision Bounding Boxes</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-[10px]">FOV Zoom:</span>
              <input 
                type="range" 
                min="50" 
                max="100" 
                value={fov} 
                onChange={(e) => setFov(Number(e.target.value))}
                className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: 2D Spatial Floorplan Map & Navigation Waypoints (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          
          {/* Interactive 2D CAD Floor Plan container */}
          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 flex flex-col justify-between h-[250px] relative">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                <span className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-wider">Level 2 Spatial Trajectory</span>
                <span className="text-[9px] bg-slate-900 text-slate-400 font-mono px-1.5 py-0.2 rounded border border-slate-800">2D Map HUD</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                Click any yellow waypoint node to navigate camera poses along the SLAM walk route:
              </p>
            </div>

            {/* Interactive Vector CAD Floorplan map container */}
            <div className="flex-1 relative bg-slate-900/60 rounded border border-slate-800 overflow-hidden flex items-center justify-center">
              
              {/* Simulated 2D Architectural walls vector map */}
              <svg className="absolute inset-0 w-full h-full text-slate-800" viewBox="0 0 300 150">
                {/* Boundary walls */}
                <rect x="5" y="5" width="290" height="140" fill="none" stroke="currentColor" strokeWidth="2" />
                {/* Rooms dividers */}
                <line x1="90" y1="5" x2="90" y2="145" stroke="currentColor" strokeWidth="1.2" />
                <line x1="190" y1="5" x2="190" y2="145" stroke="currentColor" strokeWidth="1.2" />
                <line x1="90" y1="65" x2="190" y2="65" stroke="currentColor" strokeWidth="1.2" />
                {/* Labels */}
                <text x="15" y="22" className="fill-slate-700 text-[8px] font-mono uppercase">Concrete Core</text>
                <text x="110" y="22" className="fill-slate-700 text-[8px] font-mono uppercase">MEP Shaft</text>
                <text x="110" y="85" className="fill-slate-700 text-[8px] font-mono uppercase">Server Rm A</text>
                <text x="205" y="130" className="fill-slate-700 text-[8px] font-mono uppercase">Office 204</text>
              </svg>

              {/* Dynamic trajectory line connecting the waypoints */}
              <svg className="absolute inset-0 w-full h-full text-indigo-500/40 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline 
                  points={WALKWAY_NODES.map(n => `${n.x},${n.y}`).join(" ")} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeDasharray="2 2"
                />
              </svg>

              {/* Waypoint markers mapping */}
              {WALKWAY_NODES.map((node, index) => {
                const isActive = index === selectedNodeIndex;
                return (
                  <button
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeIndex(index);
                      setIsPlaying(false); // Stop auto playback on manual selection
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 flex items-center justify-center transition"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    {/* Ring animation for active waypoint */}
                    {isActive && (
                      <span className="absolute w-6 h-6 rounded-full bg-indigo-500/30 border border-indigo-400 animate-ping pointer-events-none" />
                    )}
                    
                    {/* Dot container */}
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[7px] font-bold font-mono transition-all ${
                      isActive 
                        ? "bg-indigo-500 border-white text-white scale-110 shadow-lg" 
                        : "bg-slate-950 hover:bg-amber-500 border-amber-500/80 text-amber-400 hover:text-slate-900 scale-95"
                    }`}>
                      {index + 1}
                    </div>

                    {/* Simple hover flag */}
                    <span className="absolute bottom-5 scale-0 group-hover:scale-100 bg-slate-950 border border-slate-700 text-white text-[8px] px-1.5 py-0.5 rounded shadow whitespace-nowrap font-mono pointer-events-none z-30 transition">
                      {node.name}
                    </span>
                  </button>
                );
              })}

            </div>

            {/* Bottom active node status summary */}
            <div className="bg-slate-900 border border-slate-800 rounded p-2 text-[10px] flex justify-between items-center font-mono mt-2">
              <div className="flex items-center gap-1.5 text-slate-300 truncate">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-bold truncate">{activeNode.name}</span>
              </div>
              <span className="text-[9px] bg-indigo-950/40 text-indigo-300 font-bold border border-indigo-500/20 px-1 py-0.2 rounded font-mono">
                Waypoint {selectedNodeIndex + 1}/4
              </span>
            </div>
          </div>

          {/* Verification elements checklist and physical anomalies detailed block */}
          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 flex-1 flex flex-col justify-between h-[174px] overflow-y-auto scrollbar-thin">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider">Spatial Element Analysis</span>
                <span className="text-[9px] text-slate-400 font-mono">CV Checklist</span>
              </div>

              {/* Dynamic Checklist based on active Waypoint */}
              <div className="flex flex-col gap-2">
                {activeNode.elementsDetected.map((elem, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] bg-slate-900/50 p-1.5 rounded border border-slate-800/40">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-200">{elem.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{elem.spec}</span>
                    </div>
                    
                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded border uppercase ${
                      elem.status === "verified"
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                        : elem.status === "discrepancy"
                        ? "bg-red-950/40 text-red-400 border-red-500/20 animate-pulse"
                        : "bg-blue-950/40 text-blue-400 border-blue-500/20"
                    }`}>
                      {elem.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick remedial advice trigger button */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              {activeNode.anomalies.map(anom => (
                <div key={anom.id} className="flex items-start gap-1.5 text-[10px] text-red-400/90 leading-tight">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-bold uppercase text-[9px] text-red-400 mr-1">{anom.title}:</span>
                    {anom.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER: Playback Movie controls & Global Timeline Scale */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Playback Button Group */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              // Backward waypoint step
              setSelectedNodeIndex(prev => (prev > 0 ? prev - 1 : WALKWAY_NODES.length - 1));
              setIsPlaying(false);
            }}
            className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white border border-slate-800 transition"
            title="Step Back Waypoint"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
              isPlaying ? "bg-red-600 text-white hover:bg-red-700 animate-pulse" : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Movie</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Playback</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              // Forward waypoint step
              setSelectedNodeIndex(prev => (prev < WALKWAY_NODES.length - 1 ? prev + 1 : 0));
              setIsPlaying(false);
            }}
            className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white border border-slate-800 transition"
            title="Step Forward Waypoint"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Weekly Timeline Scrubber */}
        <div className="flex-1 flex items-center gap-1.5 w-full overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {TIMELINE_HISTORY.map((dayItem, index) => {
            const isSelected = index === currentIndex;
            return (
              <button
                key={dayItem.day}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPlaying(false);
                }}
                className={`flex-1 min-w-[70px] group relative flex flex-col items-center py-2 px-1 rounded-lg border transition ${
                  isSelected 
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-extrabold" 
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-100"
                }`}
              >
                <span className="text-[9px] font-mono uppercase tracking-wider">{dayItem.day}</span>
                <span className="text-[7px] text-slate-500 group-hover:text-slate-300 truncate max-w-[60px]">{dayItem.label}</span>
                
                {/* Milestone status indicator dot */}
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                  isSelected ? "bg-indigo-400 animate-pulse" : "bg-slate-700"
                }`} />

                {/* Floating Date tooltip */}
                <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-950 text-white text-[8px] font-mono px-1.5 py-0.5 rounded border border-slate-700 transition pointer-events-none whitespace-nowrap z-30">
                  {dayItem.date} ({dayItem.overallCompletion}% overall)
                </span>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
