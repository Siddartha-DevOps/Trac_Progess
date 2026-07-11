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
  };

  // Active Milestone calculations
  const activeMilestone = MILESTONES[currentWeek - 1];
  const activeVideoFeed = VIDEO_FEEDS[currentWeek - 1];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-5 text-slate-800">
      
      {/* SECTION 1: HEADER & OPTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-50 text-indigo-600">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Photogrammetry Timeline Control Center
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Synchronize 3D BIM coordination models with historical drone video reels & laser-scans
          </p>
        </div>

        {/* COMPARISON AND OPTIONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsComparisonMode(!isComparisonMode)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition border ${
              isComparisonMode 
                ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>{isComparisonMode ? "Disable Comparison" : "BIM vs Scan Comparison"}</span>
          </button>
          
          <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 font-bold px-2 py-1 rounded font-mono">
            RERA COMPLIANT
          </span>
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

      {/* SECTION 3: PLAYBACK CONTROLS & TIMELINE SLIDER */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-4">
        
        {/* Playback Controls and Dates */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Main Play/Pause Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={resetTimeline}
              title="Reset Timeline to Week 1"
              className="p-2 bg-white border border-slate-250 hover:bg-slate-100 rounded-lg text-slate-600 transition shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={togglePlayback}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-sm ${
                isPlaying 
                  ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100/50" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
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
              className="p-2 bg-white border border-slate-250 hover:bg-slate-100 rounded-lg text-slate-600 transition shadow-sm"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Speeds */}
            <div className="bg-slate-200/60 p-0.5 rounded-lg flex items-center border border-slate-200">
              <button
                onClick={() => handleSpeedChange(2000)}
                className={`px-2 py-1 text-[9px] font-extrabold rounded transition ${
                  playSpeed === 2000 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                0.5x
              </button>
              <button
                onClick={() => handleSpeedChange(1000)}
                className={`px-2 py-1 text-[9px] font-extrabold rounded transition ${
                  playSpeed === 1000 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                1.0x
              </button>
              <button
                onClick={() => handleSpeedChange(500)}
                className={`px-2 py-1 text-[9px] font-extrabold rounded transition ${
                  playSpeed === 500 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                2.0x
              </button>
            </div>
          </div>

          {/* Target Dates Range indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Date Window:</span>
            <span className="font-extrabold text-slate-700 font-mono bg-white border border-slate-150 px-2.5 py-1 rounded-md">
              {MILESTONES[0].date}
            </span>
            <span className="text-slate-300 font-mono">—</span>
            <span className="font-extrabold text-indigo-600 font-mono bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-md">
              {activeMilestone.date} (Active)
            </span>
          </div>

          {/* Stage status indicator badge */}
          <div>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
              activeMilestone.status === "completed"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : activeMilestone.status === "delayed"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}>
              Week {currentWeek}: {activeMilestone.status}
            </span>
          </div>
        </div>

        {/* The Progress Slider with Ticks */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="relative w-full px-2">
            
            {/* Background slider track */}
            <div className="absolute top-1/2 left-2 right-2 h-1.5 -translate-y-1/2 bg-slate-200 rounded-full" />
            
            {/* Active filled track indicator */}
            <div 
              className="absolute top-1/2 left-2 h-1.5 -translate-y-1/2 bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `calc(${(currentWeek - 1) * 25}%` }}
            />

            {/* Hidden Input Slider overlaid */}
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
            />

            {/* Slider Ticks labels */}
            <div className="flex justify-between px-1 mt-1 text-[10px] font-bold text-slate-400">
              {MILESTONES.map((milestone) => (
                <button
                  key={milestone.week}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentWeek(milestone.week);
                  }}
                  className={`flex flex-col items-center gap-0.5 focus:outline-none transition-all ${
                    currentWeek === milestone.week 
                      ? "text-indigo-600 scale-105" 
                      : "hover:text-slate-700"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm transition ${
                    currentWeek === milestone.week 
                      ? "bg-indigo-600 scale-125 ring-2 ring-indigo-200" 
                      : milestone.status === "completed" ? "bg-emerald-500" : milestone.status === "delayed" ? "bg-red-500" : "bg-slate-300"
                  }`} />
                  <span className="font-mono mt-0.5">Wk {milestone.week}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: THE VIDEO TIMELINE & DRONE PREVIEWS */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Video className="w-4 h-4 text-indigo-500" />
            Drone Orthomosaic & Visual Video Timeline
          </span>
          <span className="text-[9px] text-slate-400 font-bold uppercase font-mono bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded">
            5 Scans Synchronized
          </span>
        </div>

        {/* Video Thumbnail Grid */}
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
                {/* Visual Camera lens representation overlay on card background */}
                <div className="absolute -right-3 -bottom-3 opacity-[0.06] text-white">
                  <Camera className="w-20 h-20" />
                </div>

                {/* Top header on thumbnail */}
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
                  
                  {/* Drone GPS accuracy quality indicator */}
                  <span className="text-[8.5px] font-mono text-slate-400 flex items-center gap-0.5">
                    <ShieldCheck className={`w-3 h-3 ${isSelected ? "text-indigo-300" : "text-emerald-500"}`} />
                    {feed.quality}
                  </span>
                </div>

                {/* Play button indicator overlay */}
                <div className="my-1 text-center flex justify-center items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected 
                      ? "bg-white text-indigo-950 scale-110" 
                      : "bg-slate-800 text-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105"
                  }`}>
                    <Play className="w-3 h-3 fill-current stroke-none ml-0.5" />
                  </span>
                </div>

                {/* Bottom title & details */}
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

      {/* SECTION 5: MILESTONES ROADMAP GRID */}
      <div className="bg-slate-50/60 border border-slate-150 p-4 rounded-xl">
        <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-3">
          <Activity className="w-4 h-4 text-indigo-500" />
          Scheduled Milestones Detail Block
        </span>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {MILESTONES.map((milestone) => {
            const isSelected = milestone.week === currentWeek;
            
            return (
              <div
                key={milestone.week}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentWeek(milestone.week);
                }}
                className={`bg-white rounded-xl p-3 border hover:border-indigo-200 transition cursor-pointer text-left flex flex-col justify-between min-h-[140px] shadow-[0_1px_2px_rgba(0,0,0,0.01)] ${
                  isSelected 
                    ? "border-indigo-600 ring-2 ring-indigo-50" 
                    : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[8px] font-mono font-bold text-slate-400">STAGE {milestone.week}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      milestone.status === "completed" 
                        ? "bg-emerald-500" 
                        : milestone.status === "delayed" 
                        ? "bg-red-500" 
                        : "bg-slate-300"
                    }`} />
                  </div>

                  <h4 className="text-[11px] font-bold text-slate-800 font-sans line-clamp-1 mb-0.5">
                    {milestone.title}
                  </h4>
                  
                  <p className="text-[9.5px] text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                    {milestone.shortDesc}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-2 flex flex-col gap-1.5">
                  {/* Gauge Progress percent bar */}
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-bold text-slate-700">{milestone.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        milestone.status === "completed"
                          ? "bg-emerald-500"
                          : milestone.status === "delayed"
                          ? "bg-red-500"
                          : "bg-indigo-600"
                      }`}
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: WEEKLY PROGRESS ACTIVE STATUS CARD */}
      <div className="bg-slate-900 text-white rounded-xl p-4.5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative overflow-hidden">
        
        {/* Subtle decorative grid in bg */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />

        {/* Column 1: Active details (8 Cols) */}
        <div className="md:col-span-8 flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">
              WEEK {currentWeek} DETAILS
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Verified Scan: {activeMilestone.date}
            </span>
          </div>

          <h3 className="text-sm font-bold text-white leading-snug">
            {activeMilestone.title}
          </h3>
          
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans max-w-2xl">
            {activeMilestone.detail}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-400 mt-1 font-mono">
            <div className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pilot Feed: <strong className="text-slate-200">{activeVideoFeed.pilot}</strong></span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Angle: <strong className="text-slate-200">{activeVideoFeed.cameraAngle}</strong></span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1">
              <Map className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Finish: <strong className="text-indigo-300">{activeMilestone.date}</strong></span>
            </div>
          </div>
        </div>

        {/* Column 2: Weekly Progress Stats Indicators (4 Cols) */}
        <div className="md:col-span-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 flex flex-col gap-3 relative z-10">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block">
            Velocity Stats
          </span>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-900 border border-slate-800 p-2 rounded flex flex-col justify-center">
              <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none">CV Scan Match</span>
              <span className="text-[15px] font-extrabold text-indigo-400 font-mono mt-1">
                {activeVideoFeed.quality}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2 rounded flex flex-col justify-center">
              <span className="text-[9px] text-slate-500 font-bold block uppercase leading-none">Milestone status</span>
              <span className={`text-[10px] font-extrabold font-mono mt-1.5 uppercase ${
                activeMilestone.status === "completed" 
                  ? "text-emerald-400" 
                  : activeMilestone.status === "delayed" 
                  ? "text-red-400" 
                  : "text-slate-400"
              }`}>
                {activeMilestone.status}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Stage Accuracy Index:</span>
            <span className="font-extrabold text-white">99.82% ANSI</span>
          </div>
        </div>

      </div>

    </div>
  );
}
