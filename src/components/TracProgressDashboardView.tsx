import React, { useState, useRef } from "react";
import { 
  Camera, 
  Layers, 
  Table, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Clock, 
  Cpu, 
  Check, 
  Upload, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck, 
  ChevronRight, 
  FileText, 
  Info,
  Maximize2,
  Minimize2,
  Video,
  Database
} from "lucide-react";
import { useAppStore } from "../store";

// Trade Activity matrix mock data
const TRADES_MATRIX = [
  { id: "trd-1", name: "Drywall Partitions", subcontractor: "InterioCraft Ltd", progress: 82, planned: 80, pace: "+2.5% / wk", status: "On Track", issues: 0 },
  { id: "trd-2", name: "Electrical Sockets & Boxes", subcontractor: "VoltSparks Electrical", progress: 45, planned: 55, pace: "-3.1% / wk", status: "Delayed", issues: 2 },
  { id: "trd-3", name: "HVAC Ductwork & Dampers", subcontractor: "CoolAir Climate", progress: 70, planned: 68, pace: "+1.2% / wk", status: "On Track", issues: 1 },
  { id: "trd-4", name: "Plumbing Mains & Sleeves", subcontractor: "FlowPlumb Corp", progress: 61, planned: 62, pace: "0.0% / wk", status: "On Track", issues: 1 },
  { id: "trd-5", name: "Structural Reinforcement", subcontractor: "MegaCon Infrastructure", progress: 98, planned: 100, pace: "Completed", status: "On Track", issues: 0 }
];

// Helmet Walkthrough records
const WALKTHROUGHS_DB = [
  { id: "wk-04", name: "Walk_04_L1_Finishes", date: "Today, 10:14 AM", operator: "Rajesh K. (QC Lead)", duration: "38 mins", items: "9,412 items mapped", accuracy: "99.2%", status: "Synced" },
  { id: "wk-03", name: "Walk_03_L1_MEP_RoughIns", date: "July 10, 04:30 PM", operator: "Venkatesh R. (BIM Team)", duration: "45 mins", items: "12,180 items mapped", accuracy: "98.7%", status: "Synced" },
  { id: "wk-02", name: "Walk_02_L1_Concrete_Pours", date: "July 08, 09:15 AM", operator: "Rajesh K. (QC Lead)", duration: "30 mins", items: "7,850 items mapped", accuracy: "99.5%", status: "Synced" }
];

// Interactive Split-Screen 360 Site-to-BIM components
const BIM_ELEMENTS_360 = [
  { id: "elem-1", name: "Double Wall Socket A4", trade: "Electrical", status: "installed", coords: "x: 12.4, y: 1.5, z: -4.2", desc: "Physical installation matches IFC layout design geometry exactly." },
  { id: "elem-2", name: "HVAC Wall Sleeve Penetration", trade: "HVAC", status: "omitted", coords: "x: 18.2, y: 2.1, z: -4.2", desc: "OMISSION DETECTED: Blockout sleeve missing from structural pour. Core drilling required." },
  { id: "elem-3", name: "Drywall Stud Bracket S3", trade: "Drywall", status: "installed", coords: "x: 9.8, y: 0.8, z: -3.1", desc: "Brackets installed at 400mm centers as mandated in structural PRD." },
  { id: "elem-4", name: "MEP Conduit Sleeve D1", trade: "Plumbing", status: "delayed", coords: "x: 21.0, y: 1.1, z: -2.8", desc: "Conduit installed with 12cm geometric variance from Revit coordinates." }
];

export default function TracProgressDashboardView() {
  const { activeProject, currentWeek } = useAppStore();
  const [walks, setWalks] = useState(WALKTHROUGHS_DB);
  
  // Interactive Walk Processing simulator state
  const [processingWalk, setProcessingWalk] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [progressPct, setProgressPct] = useState(0);

  // Interactive 360° Simulator state
  const [selectedBimItem, setSelectedBimItem] = useState(BIM_ELEMENTS_360[0]);
  const [hoveredBimId, setHoveredBimId] = useState<string | null>(null);

  // Synchronized camera & locations states (Buildots Parity upgrades)
  const [rotationYaw, setRotationYaw] = useState<number>(142);
  const [selectedZone, setSelectedZone] = useState<string>("Zone A Corridor");

  // Trigger helmet walkthrough video processing simulation
  const startWalkwayProcessing = () => {
    if (processingWalk) return;
    setProcessingWalk(true);
    setProgressPct(5);
    setProgressText("Uploading raw 360° helmet walkthrough video...");

    const steps = [
      { pct: 25, text: "Extracting frames and stitching panoramic spheres..." },
      { pct: 55, text: "YOLO Convolutional networks detecting structural sockets, pipes & drywalls..." },
      { pct: 80, text: "Registering camera trajectory with IFC design model geometry..." },
      { pct: 100, text: "Alignment complete! 11,402 components updated in BIM Database." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgressPct(steps[currentStep].pct);
        setProgressText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setProcessingWalk(false);
          // Add a new completed walk to the top
          const newWalk = {
            id: `wk-0${walks.length + 1}`,
            name: `Walk_0${walks.length + 1}_L1_Dynamic_Progress`,
            date: "Just Now",
            operator: "Staff Inspector (You)",
            duration: "32 mins",
            items: "11,402 items mapped",
            accuracy: "99.4%",
            status: "Synced"
          };
          setWalks([newWalk, ...walks]);
        }, 800);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-slate-100 font-sans" id="tracprogress-dashboard">
      
      {/* 1. TRAC PROGRESS® SIGNATURE METRIC TILES BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">BIM Completion Rate</span>
            <span className="text-[9px] bg-indigo-950 text-indigo-400 font-bold border border-indigo-900/60 px-1.5 py-0.2 rounded uppercase font-mono">tracprogress® verified</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono">{activeProject.overallProgress}%</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">+1.4% vs last week</span>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-full" style={{ width: `${activeProject.overallProgress}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Weekly Walks Processed</span>
            <span className="text-[9px] bg-emerald-950 text-emerald-400 font-bold border border-emerald-900/60 px-1.5 py-0.2 rounded uppercase font-mono">Active</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono">{walks.length} / {walks.length}</span>
            <span className="text-xs text-slate-400">100% Floor Area Covered</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-mono">Last processed: {walks[0]?.date}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Outstanding Omissions</span>
            <span className="text-[9px] bg-red-950 text-red-400 font-bold border border-red-900/60 px-1.5 py-0.2 rounded uppercase font-mono">Critical delta</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-red-400 font-mono">3 Items</span>
            <span className="text-xs text-slate-400">Blocked downstream pouring</span>
          </div>
          <p className="text-[10px] text-red-400 mt-3 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            HVAC sleeve omission in L1-C4
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Total Monitored Units</span>
            <span className="text-[9px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.2 rounded uppercase border border-slate-700/50">BIM catalog</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white font-mono">41,209</span>
            <span className="text-xs text-slate-400">IFC Elements registered</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-mono">Sync engine frequency: 1.5 FPS</p>
        </div>

      </div>

      {/* 2. DYNAMIC WALKTHROUGH UPLOADER PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
              <Camera className="w-4 h-4 text-indigo-400" />
              360° Helmet Walkthrough Ingress Desk
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Upload helmet raw footage or trigger live photogrammetry extraction logs.</p>
          </div>
          <button
            onClick={startWalkwayProcessing}
            disabled={processingWalk}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              processingWalk 
                ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700" 
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 border border-indigo-500"
            }`}
          >
            {processingWalk ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI processing active...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Site Walk Video</span>
              </>
            )}
          </button>
        </div>

        {/* Processing overlay if simulator running */}
        {processingWalk && (
          <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-indigo-900/40 animate-pulse">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-indigo-300 font-bold font-mono flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                {progressText}
              </span>
              <span className="text-white font-mono font-bold">{progressPct}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-indigo-500 to-sky-500 h-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {/* Render Walks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {walks.map((w, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
              <div className="flex justify-between items-start border-b border-slate-900 pb-2.5 mb-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-200 font-mono truncate max-w-[150px]">{w.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{w.date}</span>
                </div>
                <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded font-bold font-mono">
                  {w.status}
                </span>
              </div>
              <div className="space-y-1 text-[10.5px] text-slate-400 font-mono">
                <div className="flex justify-between"><span>Operator:</span><span className="text-slate-300 font-medium">{w.operator}</span></div>
                <div className="flex justify-between"><span>Length:</span><span className="text-slate-300 font-medium">{w.duration}</span></div>
                <div className="flex justify-between"><span>Mapped Items:</span><span className="text-slate-300 font-medium font-bold">{w.items}</span></div>
                <div className="flex justify-between"><span>Fidelity Acc:</span><span className="text-emerald-400 font-bold">{w.accuracy}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DUAL-PANE SYNCHRONIZED 360° SITE-TO-BIM VIEWPORT SIMULATOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        
        {/* Module Header with Live Sync Status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Buildots-Style Dual-Pane Synced 360° Walkthrough
            </h3>
            <p className="text-xs text-slate-400">
              Dragging the panoramic orientation slider rotates both the <strong>IFC BIM digital twin</strong> and the <strong>360° Site Reality frame</strong> in lockstep.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {["Zone A Corridor", "Electrical Closet", "L1-C4 Column Column"].map((zone) => (
              <button
                key={zone}
                onClick={() => {
                  setSelectedZone(zone);
                  if (zone === "Zone A Corridor") setSelectedBimItem(BIM_ELEMENTS_360[0]);
                  else if (zone === "Electrical Closet") setSelectedBimItem(BIM_ELEMENTS_360[1]);
                  else setSelectedBimItem(BIM_ELEMENTS_360[3]);
                }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md font-mono uppercase transition ${
                  selectedZone === zone 
                    ? "bg-indigo-600 text-white" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        {/* The Dual Viewport Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-4">
          
          {/* Left Viewport: Synced 3D BIM Model */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative flex flex-col justify-between overflow-hidden min-h-[300px]">
            {/* Visual background coordinate grids */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px]" />
            
            {/* Dynamic rotation background simulation element */}
            <div 
              className="absolute inset-0 flex items-center justify-center opacity-30 transition-transform duration-100 ease-out"
              style={{ transform: `rotate(${rotationYaw}deg)` }}
            >
              <div className="w-64 h-64 border-4 border-dashed border-indigo-500 rounded-full flex items-center justify-center">
                <div className="w-40 h-40 border border-indigo-400 rounded-full flex items-center justify-center">
                  <div className="w-16 h-1 bg-indigo-500 rounded" />
                </div>
              </div>
            </div>

            {/* Viewport Header */}
            <div className="relative z-10 flex justify-between items-center bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800 backdrop-blur-sm">
              <span className="text-[10px] text-indigo-400 font-bold font-mono uppercase tracking-wider">
                VIEWPORT A: Revit 3D BIM Twin
              </span>
              <span className="text-[9px] bg-indigo-950/80 text-indigo-300 font-mono border border-indigo-900 px-1.5 py-0.5 rounded uppercase">
                Active Coordinate: {selectedBimItem.coords}
              </span>
            </div>

            {/* BIM Element Overlay Spot */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-xl bg-slate-900 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-3 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Layers className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-extrabold text-white uppercase font-mono mb-1">{selectedBimItem.name}</h4>
              <p className="text-[11px] text-slate-400 max-w-xs font-mono leading-relaxed">
                Design Spec: Wireframe grid model alignment detected at coordinate <span className="text-white font-bold">{selectedBimItem.coords}</span>.
              </p>

              {/* Status HUD indicator */}
              <div className="mt-4 flex gap-4 text-[10px] font-mono text-slate-500">
                <div>YAW: <strong className="text-slate-300">{rotationYaw}°</strong></div>
                <div>DEPTH: <strong className="text-slate-300">4.2m</strong></div>
                <div>COMPLIANCE: <strong className="text-emerald-400">Class 1</strong></div>
              </div>
            </div>

            {/* Footer indicators */}
            <div className="relative z-10 text-[9.5px] font-mono text-slate-500 bg-slate-900/60 p-2 rounded border border-slate-800 flex justify-between items-center">
              <span>FOV: 90° Orthographic</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                IFC4 Schema Connected
              </span>
            </div>
          </div>

          {/* Right Viewport: Synced Site Walk 360 Reality Photo */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative flex flex-col justify-between overflow-hidden min-h-[300px]">
            {/* Reality walk background panorama representing processed site walk */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            
            {/* Dynamic rotation camera perspective representation */}
            <div 
              className="absolute inset-0 flex items-center justify-center opacity-40 transition-transform duration-100 ease-out"
              style={{ transform: `rotate(${-rotationYaw}deg) scale(1.1)` }}
            >
              <div className="w-72 h-48 border border-dashed border-indigo-400/40 rounded flex items-center justify-center">
                <div className="text-slate-700 text-[10px] font-mono uppercase font-bold">Panoramic Horizon Walk Grid</div>
              </div>
            </div>

            {/* Viewport Header */}
            <div className="relative z-10 flex justify-between items-center bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800 backdrop-blur-sm">
              <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-wider">
                VIEWPORT B: Processed 360° Photo Proof
              </span>
              <span className="text-[9px] bg-emerald-950/80 text-emerald-300 font-mono border border-emerald-900 px-1.5 py-0.5 rounded uppercase">
                Fidelity Conf: 99.4% Verified
              </span>
            </div>

            {/* Photo Reality Frame Overlay */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Camera className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-extrabold text-white uppercase font-mono mb-1">Actual Photo Record</h4>
              
              {/* Contextual description box based on state */}
              <div className={`mt-2 p-3 rounded-lg border text-[11px] leading-relaxed max-w-xs ${
                selectedBimItem.status === "installed" 
                  ? "bg-emerald-950/40 border-emerald-900 text-emerald-300" 
                  : (selectedBimItem.status === "omitted" ? "bg-red-950/40 border-red-900 text-red-300" : "bg-amber-950/40 border-amber-900 text-amber-300")
              }`}>
                <span className="font-bold uppercase text-[9px] block mb-1 font-mono">
                  {selectedBimItem.status === "installed" ? "✓ Reality Verified" : "✗ Deviation Detected"}
                </span>
                {selectedBimItem.desc}
              </div>
            </div>

            {/* Footer indicators */}
            <div className="relative z-10 text-[9.5px] font-mono text-slate-500 bg-slate-900/60 p-2 rounded border border-slate-800 flex justify-between items-center">
              <span>FOCAL YAW: {rotationYaw}°</span>
              <span className="flex items-center gap-1 font-bold text-slate-300">
                <Video className="w-3.5 h-3.5 text-indigo-400" />
                GoPro Max Frame Walk_04_L1
              </span>
            </div>
          </div>

        </div>

        {/* Dynamic Rotation Slide Controller */}
        <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="p-1.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-900">
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
            </span>
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              360° Panoramic Compass Yaw:
            </span>
          </div>
          
          <input 
            type="range" 
            min="0" 
            max="360" 
            value={rotationYaw} 
            onChange={(e) => setRotationYaw(parseInt(e.target.value))}
            className="flex-1 accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />

          <div className="font-mono text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded shrink-0">
            {rotationYaw}° Degrees
          </div>
        </div>

        {/* Coordinates Map Selection Panel */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          {BIM_ELEMENTS_360.map((elem) => {
            const isSelected = selectedBimItem.id === elem.id;
            return (
              <button
                key={elem.id}
                onClick={() => setSelectedBimItem(elem)}
                className={`text-left p-3 rounded-lg border transition-all flex flex-col gap-1 font-mono ${
                  isSelected 
                    ? "bg-indigo-950/40 border-indigo-500 shadow-md" 
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-200">{elem.name}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    elem.status === "installed" ? "bg-emerald-500" : (elem.status === "omitted" ? "bg-red-500" : "bg-amber-500")
                  }`} />
                </div>
                <span className="text-[9px] text-slate-500">Coord: {elem.coords}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 4. DENSE TRADE MATRIX DATA LIST (DASHBOARD SHEET) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="border-b border-slate-800 pb-3.5 mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Table className="w-4 h-4 text-indigo-400" />
              Subcontractor Trade Performance Matrix
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Granular completion percentage, weekly schedule deviation and critical issue metrics.</p>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">5 active disciplines</span>
        </div>

        {/* Trade matrix table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[9px] pb-2">
                <th className="py-2.5 px-3">Trade Scope</th>
                <th className="py-2.5 px-3">Subcontractor</th>
                <th className="py-2.5 px-3 text-center">BIM Progress</th>
                <th className="py-2.5 px-3 text-center">Scheduled Target</th>
                <th className="py-2.5 px-3 text-center">Weekly Pace</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Discrepancies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {TRADES_MATRIX.map((trade) => (
                <tr key={trade.id} className="hover:bg-slate-950/45 transition">
                  <td className="py-3 px-3 font-bold text-slate-200">{trade.name}</td>
                  <td className="py-3 px-3 text-slate-400">{trade.subcontractor}</td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-indigo-500 h-full" style={{ width: `${trade.progress}%` }} />
                      </div>
                      <span className="font-bold text-white w-8 text-right">{trade.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300">{trade.planned}%</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-200">{trade.pace}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      trade.status === "On Track" 
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/50" 
                        : "bg-red-950/60 text-red-400 border border-red-900/50"
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {trade.issues > 0 ? (
                      <span className="bg-red-950 text-red-400 px-2 py-0.5 rounded font-bold border border-red-900/60">
                        {trade.issues} Critical
                      </span>
                    ) : (
                      <span className="text-emerald-400">✓ 0 Issues</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. DENSE WEEKLY QUANTITY OUTPUTS & PPC LEDGER (Buildots Signature Feature) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="border-b border-slate-800 pb-3.5 mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Table className="w-4 h-4 text-indigo-400" />
              Granular Weekly Production Velocity & PPC Ledger
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Buildots Parity: Tracks individual physical unit quantities installed against planned targets to calculate <strong>Percent Plan Complete (PPC)</strong>.
            </p>
          </div>
          <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">
            PPC Standard: 87.5%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Electrical Outlet Plates</span>
            <div className="my-2">
              <span className="text-2xl font-black text-white font-mono">142 / 160</span>
              <span className="text-[10px] text-red-400 font-mono ml-2 font-bold">-11.2% rate</span>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mb-2">
              <div className="bg-red-500 h-full" style={{ width: "88.7%" }} />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>PPC Score: <strong className="text-red-400">88%</strong></span>
              <span>Velocity: <strong>-18 units/wk</strong></span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Drywall Panels (Sheets)</span>
            <div className="my-2">
              <span className="text-2xl font-black text-white font-mono">310 / 300</span>
              <span className="text-[10px] text-emerald-400 font-mono ml-2 font-bold">+3.3% rate</span>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mb-2">
              <div className="bg-emerald-500 h-full" style={{ width: "100%" }} />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>PPC Score: <strong className="text-emerald-400">100%</strong></span>
              <span>Velocity: <strong>+10 sheets/wk</strong></span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">HVAC Rigid Ducting</span>
            <div className="my-2">
              <span className="text-2xl font-black text-white font-mono">80m / 80m</span>
              <span className="text-[10px] text-slate-400 font-mono ml-2 font-bold">100% target</span>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mb-2">
              <div className="bg-indigo-500 h-full" style={{ width: "100%" }} />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>PPC Score: <strong className="text-indigo-400 font-bold">100%</strong></span>
              <span>Velocity: <strong>On Track</strong></span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold">Plumbing Copper Pipe main</span>
            <div className="my-2">
              <span className="text-2xl font-black text-white font-mono">210m / 250m</span>
              <span className="text-[10px] text-red-400 font-mono ml-2 font-bold">-16% rate</span>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mb-2">
              <div className="bg-amber-500 h-full" style={{ width: "84%" }} />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>PPC Score: <strong className="text-amber-400">84%</strong></span>
              <span>Velocity: <strong>-40 meters/wk</strong></span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
