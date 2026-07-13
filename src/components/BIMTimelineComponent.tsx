import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, FastForward, Calendar, ShieldCheck, 
  AlertTriangle, Eye, Video, Sparkles, Sliders, RefreshCw, 
  ChevronRight, CheckCircle2, RotateCcw, Split, Layers, Layout,
  Activity, ArrowRight, Gauge, Info, Camera, Compass, Map, User
} from "lucide-react";

interface BIMTimelineComponentProps {
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  selectedElement: any;
  onSelectElement: (elem: any) => void;
}

interface Milestone {
  week: number;
  date: string;
  title: string;
  shortDesc: string;
  status: "completed" | "delayed" | "pending";
  progress: number;
  detail: string;
}

const MILESTONES: Milestone[] = [
  {
    week: 1,
    date: "Oct 12, 2026",
    title: "Foundations & Ground Slab",
    shortDesc: "Excavation and deep reinforcement casting",
    status: "completed",
    progress: 100,
    detail: "Standard structural pouring. All ground level columns footings certified under +10mm precision tolerance."
  },
  {
    week: 2,
    date: "Oct 19, 2026",
    title: "Level 1 Structural Columns",
    shortDesc: "Rebar cage binding & formwork casting",
    status: "completed",
    progress: 100,
    detail: "Found steel alignment variance on Column C4 (185mm stirrups pitch vs 100mm designed plan) - flagged for review."
  },
  {
    week: 3,
    date: "Oct 26, 2026",
    title: "Level 1 Ceiling Slab Curing",
    shortDesc: "Pre-stress slab casting & curing monitor",
    status: "completed",
    progress: 90,
    detail: "Sensors report curing stiffness at 98.4%. Concrete strength metrics meet high-grade safety compliance parameters."
  },
  {
    week: 4,
    date: "Nov 02, 2026",
    title: "HVAC & Sprinklers Routing",
    shortDesc: "MEP services layouts & structural sleeves alignment",
    status: "delayed",
    progress: 60,
    detail: "Critical collision detected: Central Air duct clashed directly with secondary firefighting pipelines in Zone B."
  },
  {
    week: 5,
    date: "Nov 09, 2026",
    title: "Gypsum Drywall Partitions",
    shortDesc: "Interior partitioning and electrical routing",
    status: "pending",
    progress: 15,
    detail: "Ground Floor partitions certified. Upper level works currently on hold pending HVAC spatial clearance."
  }
];

// Mock Drone Orthomosaic Thumbnail Feeds representing 'Video Timeline'
const VIDEO_FEEDS = [
  {
    week: 1,
    thumbName: "Scan_W1_GroundSlab.jpg",
    title: "Drone Orthomosaic (Foundations)",
    duration: "0:45",
    quality: "98.2%",
    cameraAngle: "Nadir 90°",
    pilot: "AI Autopilot V4",
    visualStyle: "bg-slate-950 border-emerald-500/50"
  },
  {
    week: 2,
    thumbName: "Scan_W2_Reinforcement.jpg",
    title: "Column Cages Point Cloud",
    duration: "1:20",
    quality: "97.1%",
    cameraAngle: "Gimbal 45°",
    pilot: "Drone Station East",
    visualStyle: "bg-slate-950 border-amber-500/50"
  },
  {
    week: 3,
    thumbName: "Scan_W3_Level1Pour.jpg",
    title: "Slab Infrared Thermography",
    duration: "0:55",
    quality: "99.4%",
    cameraAngle: "Oblique Zenith",
    pilot: "Sensors Autonomous",
    visualStyle: "bg-slate-950 border-indigo-500/50"
  },
  {
    week: 4,
    thumbName: "Scan_W4_MEPClash.jpg",
    title: "Laser Scan HUD (MEP Clash)",
    duration: "2:05",
    quality: "95.6%",
    cameraAngle: "Ground LiDaR Scan",
    pilot: "Stationary Scanner B",
    visualStyle: "bg-slate-950 border-red-500/50"
  },
  {
    week: 5,
    thumbName: "Scan_W5_InteriorDrywall.jpg",
    title: "3D Spatial Grid Validation",
    duration: "1:40",
    quality: "94.8%",
    cameraAngle: "Nadir Multi-Spectrum",
    pilot: "AI Autopilot V4",
    visualStyle: "bg-slate-950 border-slate-700"
  }
];

export default function BIMTimelineComponent({
  currentWeek,
  setCurrentWeek,
  selectedElement,
  onSelectElement
}: BIMTimelineComponentProps) {
  
  // Playback Control States
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1000); // ms per step
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonSliderVal, setComparisonSliderVal] = useState<number>(50); // percentage split
  
  const activeMilestone = MILESTONES[currentWeek - 1] || MILESTONES[0];
  const activeVideoFeed = VIDEO_FEEDS[currentWeek - 1] || VIDEO_FEEDS[0];
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto playback loop logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        const nextWeek = currentWeek >= 5 ? 1 : currentWeek + 1;
        setCurrentWeek(nextWeek);
      }, playSpeed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, playSpeed, currentWeek, setCurrentWeek]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const stepForward = () => {
    setIsPlaying(false);
    setCurrentWeek(currentWeek >= 5 ? 1 : currentWeek + 1);
  };

  const resetTimeline = () => {
    setIsPlaying(false);
    setCurrentWeek(1);
  };

  const handleSpeedChange = (ms: number) => {
    setPlaySpeed(ms);
  };  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-4 text-slate-800">
      
      {/* Horizontal Layout Dock (5 Main Sections) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch divide-y xl:divide-y-0 xl:divide-x divide-slate-100">
        
        {/* Section 1: Playback Timeline (xl:col-span-3) */}
        <div className="xl:col-span-3 flex flex-col gap-1.5 justify-center pr-3">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Playback Timeline
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={resetTimeline}
              title="Reset to Week 1"
              className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={togglePlayback}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.98] ${
                isPlaying 
                  ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100/50" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-700"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-red-600 stroke-none" />
                  <span>Pause Loop</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white stroke-none" />
                  <span>Play Timeline</span>
                </>
              )}
            </button>

            <button
              onClick={stepForward}
              title="Step Forward (1 Week)"
              className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-95"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Speed Multiplier badge */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200 shrink-0">
              <button
                onClick={() => handleSpeedChange(1500)}
                className={`px-1.5 py-1 text-[8px] font-black rounded transition ${
                  playSpeed === 1500 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                0.5x
              </button>
              <button
                onClick={() => handleSpeedChange(1000)}
                className={`px-1.5 py-1 text-[8px] font-black rounded transition ${
                  playSpeed === 1000 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                1x
              </button>
              <button
                onClick={() => handleSpeedChange(500)}
                className={`px-1.5 py-1 text-[8px] font-black rounded transition ${
                  playSpeed === 500 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                2x
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Progress Slider (xl:col-span-3) */}
        <div className="xl:col-span-3 flex flex-col gap-1.5 justify-center px-4 pt-3 xl:pt-0">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Progress Slider
            </span>
            <span className="text-[9.5px] font-bold font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-full border border-indigo-100">
              Week {currentWeek} of 5
            </span>
          </div>

          <div className="relative w-full py-2">
            {/* Background slider track */}
            <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 bg-slate-100 rounded-full border border-slate-200/50" />
            
            {/* Active filled track indicator */}
            <div 
              className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${(currentWeek - 1) * 25}%` }}
            />

            {/* Slider Input */}
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={currentWeek}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentWeek(parseInt(e.target.value));
              }}
              className="w-full h-8 relative z-10 appearance-none bg-transparent cursor-pointer outline-none focus:outline-none accent-indigo-600"
              style={{ margin: 0 }}
            />

            {/* Slider Ticks labels */}
            <div className="flex justify-between px-1 mt-0.5 text-[8.5px] font-bold text-slate-400 font-mono">
              {MILESTONES.map((milestone) => (
                <button
                  key={milestone.week}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentWeek(milestone.week);
                  }}
                  className={`flex flex-col items-center gap-0.5 focus:outline-none transition-all ${
                    currentWeek === milestone.week ? "text-indigo-600 scale-105" : "hover:text-slate-700"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full border border-white shadow-sm transition ${
                    currentWeek === milestone.week 
                      ? "bg-indigo-600 scale-125 ring-2 ring-indigo-200" 
                      : milestone.status === "completed" ? "bg-emerald-500" : milestone.status === "delayed" ? "bg-red-500" : "bg-slate-300"
                  }`} />
                  <span>Wk {milestone.week}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Dates (xl:col-span-2) */}
        <div className="xl:col-span-2 flex flex-col gap-1 justify-center px-4 pt-3 xl:pt-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Dates
          </span>
          <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 flex flex-col gap-0.5 text-left">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-400 font-semibold uppercase">Scan Range:</span>
              <span className="text-[8px] bg-indigo-50 text-indigo-700 font-mono font-bold px-1 rounded uppercase">Live</span>
            </div>
            <p className="text-[10px] font-extrabold text-slate-700 font-mono truncate">
              {activeMilestone.date}
            </p>
            <span className="text-[8px] text-slate-400 font-sans truncate leading-none">
              Target: {activeMilestone.title}
            </span>
          </div>
        </div>

        {/* Section 4: Compare (xl:col-span-2) */}
        <div className="xl:col-span-2 flex flex-col gap-1.5 justify-center px-4 pt-3 xl:pt-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Compare
          </span>
          <button
            onClick={() => setIsComparisonMode(!isComparisonMode)}
            className={`w-full py-2.5 px-3 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition border active:scale-[0.98] ${
              isComparisonMode 
                ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" 
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Split className="w-3.5 h-3.5 text-indigo-500 group-hover:text-white" />
            <span>{isComparisonMode ? "CAD vs Scan On" : "Compare Mode"}</span>
          </button>
        </div>

        {/* Section 5: Camera Controls (xl:col-span-2) */}
        <div className="xl:col-span-2 flex flex-col gap-1.5 justify-center pl-4 pt-3 xl:pt-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Camera Controls
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("bim-viewer-camera-cmd", { detail: "zoom-in" }))}
              title="Zoom In Model"
              className="flex-1 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 flex items-center justify-center gap-1 transition text-[10px] font-bold active:scale-95"
            >
              <Camera className="w-3 h-3 text-indigo-500" />
              <span>In</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("bim-viewer-camera-cmd", { detail: "zoom-out" }))}
              title="Zoom Out Model"
              className="flex-1 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 flex items-center justify-center gap-1 transition text-[10px] font-bold active:scale-95"
            >
              <Camera className="w-3 h-3 text-indigo-400" />
              <span>Out</span>
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("bim-viewer-camera-cmd", { detail: "reset" }))}
              title="Reset View"
              className="flex-1 py-2 bg-slate-900 border border-slate-950 hover:bg-slate-800 rounded-lg text-white flex items-center justify-center gap-1 transition text-[10px] font-bold active:scale-95"
            >
              <Compass className="w-3 h-3 text-yellow-300" />
              <span>Reset</span>
            </button>
          </div>
        </div>

      </div>

      {/* SECTION 2: COMPARISON OVERLAY (IF ENABLED) */}
      {isComparisonMode && (
        <div className="bg-slate-950 rounded-xl p-4 border border-indigo-500/30 text-white animate-fade-in flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
            <span className="text-[11px] font-extrabold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              CAD Layout (Design Model) vs Photogrammetry Orthomosaic
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              Week {currentWeek} Scan Overlay Matcher
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Visual Screen with Sliders representing "Then vs Now" or "BIM vs Scan" */}
            <div className="md:col-span-8 relative h-[180px] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              
              {/* Left Side (BIM Design) */}
              <div 
                className="absolute inset-y-0 left-0 bg-slate-900 border-r border-indigo-500/80 transition-all overflow-hidden flex flex-col justify-center items-center"
                style={{ width: `${comparisonSliderVal}%` }}
              >
                <div className="absolute top-2 left-3 z-10 bg-slate-950/80 border border-indigo-500/50 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-mono text-indigo-400 font-bold">
                  BIM DESIGN MODEL
                </div>
                
                {/* Simulated Wireframe model visuals */}
                <div className="w-[180px] h-[100px] border-2 border-indigo-500/30 border-dashed rounded-md flex flex-col items-center justify-center gap-1 opacity-80 text-center p-2">
                  <span className="text-[10px] font-mono text-indigo-300 font-bold">IFC WIREFRAME GRID</span>
                  <span className="text-[8px] font-mono text-indigo-400">Tolerance: Exact 0.00mm</span>
                  <div className="w-full bg-slate-800 h-1 rounded overflow-hidden mt-1">
                    <div className="bg-indigo-500 h-full w-full" />
                  </div>
                </div>
              </div>

              {/* Right Side (Drone Scan) */}
              <div className="absolute inset-0 bg-slate-950 flex flex-col justify-center items-center -z-10">
                <div className="absolute top-2 right-3 z-10 bg-slate-900/80 border border-emerald-500/50 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-mono text-emerald-400 font-bold">
                  DRONE PHOTO SCAN
                </div>

                {/* Simulated LiDAR Point Cloud visuals */}
                <div className="w-[180px] h-[100px] border-2 border-emerald-500/30 border-dashed rounded-md flex flex-col items-center justify-center gap-1 opacity-80 text-center p-2">
                  <span className="text-[10px] font-mono text-emerald-300 font-bold">3D POINT CLOUD</span>
                  <span className="text-[8px] font-mono text-emerald-400">Confidence: {activeVideoFeed.quality}</span>
                  <div className="w-full bg-slate-800 h-1 rounded overflow-hidden mt-1">
                    <div className="bg-emerald-500 h-full w-[88%]" />
                  </div>
                </div>
              </div>

              {/* Slider Controller Line UI overlay */}
              <div 
                className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_white]"
                style={{ left: `${comparisonSliderVal}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white text-slate-900 border-2 border-indigo-600 rounded-full p-1.5 shadow-md flex items-center justify-center">
                  <Sliders className="w-3.5 h-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Split Details Ledger Column */}
            <div className="md:col-span-4 bg-slate-900/45 p-3 rounded-lg border border-slate-800 flex flex-col justify-between text-xs">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Variance Audit</span>
                
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Total Scan Points:</span>
                    <span className="font-mono font-bold text-white">4,812,094 pts</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Scan Resolution:</span>
                    <span className="font-mono font-bold text-white">0.5 cm GSD</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Surface Deviation:</span>
                    <span className="font-mono font-bold text-amber-400">Avg +14.2mm</span>
                  </div>
                </div>

                {currentWeek === 4 ? (
                  <div className="bg-red-500/10 border border-red-500/30 p-2 rounded text-[10px] text-red-300 leading-relaxed mt-1 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span>HVAC Duct is physically shifted 140mm south vs CAD grid. Immediate rework suggested.</span>
                  </div>
                ) : currentWeek === 2 ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded text-[10px] text-amber-300 leading-relaxed mt-1 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Column stirrup count mismatched. Formwork cast scheduled for hold.</span>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded text-[10px] text-emerald-300 leading-relaxed mt-1 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>High alignment matching rate. No major spatial clashes identified in this segment.</span>
                  </div>
                )}
              </div>

              {/* Slider adjuster control */}
              <div className="mt-2.5">
                <span className="text-[9px] text-slate-400 block mb-1">Drag to adjust split transparency</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={comparisonSliderVal}
                  onChange={(e) => setComparisonSliderVal(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-850 rounded accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Telemetry Drawer - Interactive Accordion */}
      <details className="group bg-slate-50/50 border border-slate-150 rounded-xl overflow-hidden transition-all duration-300">
        <summary className="px-4 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-between cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Show Ortho-Scan Timeline &amp; Milestone Roadmap</span>
          </div>
          <span className="text-[9px] font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full transition group-open:rotate-180">
            Expand Details
          </span>
        </summary>
        
        <div className="p-4 border-t border-slate-150 flex flex-col gap-4 bg-white animate-fade-in">
          
          {/* Drone Previews Grid */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Visual Drone Scans Synchronized
            </span>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {VIDEO_FEEDS.map((feed) => {
                const isSelected = feed.week === currentWeek;
                const milestone = MILESTONES[feed.week - 1];
                
                return (
                  <div
                    key={feed.week}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentWeek(feed.week);
                    }}
                    className={`group relative overflow-hidden rounded-xl border p-3 cursor-pointer transition-all duration-300 flex flex-col justify-between h-[115px] ${
                      isSelected 
                        ? "bg-indigo-900 border-indigo-600 text-white shadow-md ring-2 ring-indigo-200" 
                        : "bg-slate-900/95 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-950"
                    }`}
                  >
                    <div className="absolute -right-3 -bottom-3 opacity-[0.06] text-white">
                      <Camera className="w-16 h-16" />
                    </div>

                    <div className="flex justify-between items-start gap-1">
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase border ${
                        isSelected 
                          ? "bg-indigo-950 text-indigo-300 border-indigo-800" 
                          : milestone.status === "completed" 
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-900/60" 
                          : milestone.status === "delayed" 
                          ? "bg-red-950/60 text-red-400 border-red-900/60" 
                          : "bg-slate-950 text-slate-500 border-slate-900"
                      }`}>
                        Wk {feed.week}
                      </span>
                      
                      <span className="text-[8.5px] font-mono text-slate-400 flex items-center gap-0.5">
                        <ShieldCheck className={`w-3 h-3 ${isSelected ? "text-indigo-300" : "text-emerald-500"}`} />
                        {feed.quality}
                      </span>
                    </div>

                    <div className="my-1 text-center flex justify-center items-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected 
                          ? "bg-white text-indigo-950 scale-110" 
                          : "bg-slate-800 text-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105"
                      }`}>
                        <Play className="w-3 h-3 fill-current stroke-none ml-0.5" />
                      </span>
                    </div>

                    <div className="relative z-10">
                      <p className={`text-[9.5px] font-bold truncate leading-snug ${isSelected ? "text-white" : "text-slate-100 group-hover:text-white"}`}>
                        {feed.title}
                      </p>
                      <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-0.5">
                        <span>{feed.cameraAngle}</span>
                        <span>{feed.duration}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestones grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 mt-2">
            {MILESTONES.map((milestone) => {
              const isSelected = milestone.week === currentWeek;
              
              return (
                <div
                  key={milestone.week}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentWeek(milestone.week);
                  }}
                  className={`bg-white rounded-xl p-3 border hover:border-indigo-200 transition cursor-pointer text-left flex flex-col justify-between min-h-[130px] shadow-[0_1px_2px_rgba(0,0,0,0.01)] ${
                    isSelected ? "border-indigo-600 ring-2 ring-indigo-50" : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[8px] font-mono font-bold text-slate-400">STAGE {milestone.week}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        milestone.status === "completed" ? "bg-emerald-500" : milestone.status === "delayed" ? "bg-red-500" : "bg-slate-300"
                      }`} />
                    </div>

                    <h4 className="text-[11px] font-bold text-slate-800 font-sans line-clamp-1 mb-0.5">
                      {milestone.title}
                    </h4>
                    <p className="text-[9.5px] text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                      {milestone.shortDesc}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-2 flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-bold text-slate-700">{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          milestone.status === "completed" ? "bg-emerald-500" : milestone.status === "delayed" ? "bg-red-500" : "bg-indigo-600"
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Summary detail row */}
          <div className="bg-slate-900 text-white rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative overflow-hidden mt-2">
            <div className="md:col-span-8 flex flex-col gap-1.5 z-10 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  WEEK {currentWeek} DETAIL LOGS
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Verified Scan: {activeMilestone.date}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white leading-snug">
                {activeMilestone.title}
              </h3>
              <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans max-w-2xl">
                {activeMilestone.detail}
              </p>
            </div>

            <div className="md:col-span-4 bg-slate-950/60 p-3 rounded-lg border border-slate-850 flex flex-col gap-2 z-10">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block text-left">
                Scan Velocity metrics
              </span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900 border border-slate-800 p-1.5 rounded flex flex-col justify-center">
                  <span className="text-[8px] text-slate-500 font-bold block uppercase leading-none">CV Confidence</span>
                  <span className="text-xs font-extrabold text-indigo-400 font-mono mt-0.5">
                    {activeVideoFeed.quality}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-1.5 rounded flex flex-col justify-center">
                  <span className="text-[8px] text-slate-500 font-bold block uppercase leading-none">RERA Stage Status</span>
                  <span className={`text-[9.5px] font-extrabold font-mono mt-0.5 uppercase ${
                    activeMilestone.status === "completed" ? "text-emerald-400" : activeMilestone.status === "delayed" ? "text-red-400" : "text-slate-400"
                  }`}>
                    {activeMilestone.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </details>

    </div>
  );
}
