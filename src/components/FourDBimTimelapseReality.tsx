import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Calendar, 
  Split, 
  Maximize2, 
  Eye, 
  Layers, 
  Box, 
  Camera, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  Compass,
  Zap,
  Activity,
  Maximize,
  Grid
} from "lucide-react";

interface TimelineKeyframe {
  date: string;
  label: string;
  weekNumber: number;
  bimCompletionPercent: number;
  actualCompletionPercent: number;
  capturedPhotosCount: number;
  varianceStatus: "on_track" | "minor_delay" | "critical_delay";
  realityImgUrl: string;
  bimModelUrl: string;
  keyEvents: string[];
}

const TIMELINE_KEYFRAMES: TimelineKeyframe[] = [
  {
    date: "2026-05-15",
    label: "Week 1 - Substructure & Core",
    weekNumber: 1,
    bimCompletionPercent: 15,
    actualCompletionPercent: 15,
    capturedPhotosCount: 142,
    varianceStatus: "on_track",
    realityImgUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80",
    bimModelUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    keyEvents: ["Formwork erected Grid A-E", "Rebar cage tied", "Pour #1 completed"]
  },
  {
    date: "2026-05-30",
    label: "Week 3 - Primary MEP Riser & Conduit",
    weekNumber: 3,
    bimCompletionPercent: 32,
    actualCompletionPercent: 30,
    capturedPhotosCount: 210,
    varianceStatus: "minor_delay",
    realityImgUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
    bimModelUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    keyEvents: ["Main MEP riser conduit run", "HVAC trunk ducting initiated", "Minor 2-day delay on duct hangers"]
  },
  {
    date: "2026-06-15",
    label: "Week 5 - Drywall Framing & MEP Pulls",
    weekNumber: 5,
    bimCompletionPercent: 55,
    actualCompletionPercent: 48,
    capturedPhotosCount: 380,
    varianceStatus: "critical_delay",
    realityImgUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    bimModelUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
    keyEvents: ["Metal stud framing floor 3", "Cable tray installation", "Drywall Board A delayed by 4 days"]
  },
  {
    date: "2026-06-30",
    label: "Week 7 - In-Wall Insulation & Board B",
    weekNumber: 7,
    bimCompletionPercent: 72,
    actualCompletionPercent: 70,
    capturedPhotosCount: 450,
    varianceStatus: "on_track",
    realityImgUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    bimModelUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80",
    keyEvents: ["Acoustic insulation stuffed", "Board B closed on Corridor 3A", "MEP in-wall signoff verified"]
  },
  {
    date: "2026-07-15",
    label: "Week 9 - Taping, Jointing & Faceplates",
    weekNumber: 9,
    bimCompletionPercent: 88,
    actualCompletionPercent: 86,
    capturedPhotosCount: 520,
    varianceStatus: "on_track",
    realityImgUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80",
    bimModelUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    keyEvents: ["Joint compound coat 3", "Switch faceplate trim-out", "Primer paint coat applied"]
  },
  {
    date: "2026-07-23",
    label: "Week 10 - Current Reality Today",
    weekNumber: 10,
    bimCompletionPercent: 95,
    actualCompletionPercent: 92,
    capturedPhotosCount: 610,
    varianceStatus: "minor_delay",
    realityImgUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80",
    bimModelUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    keyEvents: ["Final trim-out verification", "360° helmet walkthrough capture", "2 minor spatial clashes flagged"]
  }
];

export default function FourDBimTimelapseReality() {
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(TIMELINE_KEYFRAMES.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100 for curtain split
  const [viewMode, setViewMode] = useState<"curtain" | "side_by_side" | "overlay">("curtain");
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);

  const activeKeyframe = TIMELINE_KEYFRAMES[currentFrameIndex];

  // Animation Loop for Time-Lapse Playback
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prevIndex) => {
          if (prevIndex >= TIMELINE_KEYFRAMES.length - 1) {
            setIsPlaying(false);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, 2000 / playbackSpeed);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                4D BIM TIME-LAPSE & REALITY SPLIT
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-emerald-500/30">
                SYNCHRONIZED 6-DoF VIEWPORT
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Split className="w-8 h-8 text-indigo-400 shrink-0" />
              4D BIM vs 360° Photo Reality Time-Lapse Inspector
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Drag the interactive split-curtain slider to compare actual 360° site photogrammetry directly against the scheduled 4D BIM digital twin across any date in the project lifecycle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => alert(`Captured 4D BIM vs Reality Split-Screen Comparison Report for ${activeKeyframe.date}`)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              Export 4D Split Comparison Snapshot
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE & PLAYBACK CONTROL BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        
        {/* PLAYBACK BUTTONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              isPlaying 
                ? "bg-amber-600 text-white shadow" 
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause Time-Lapse" : "Play 4D Time-Lapse"}
          </button>

          <button
            onClick={() => setCurrentFrameIndex(0)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Reset to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {[0.5, 1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  playbackSpeed === speed ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* CURTAIN / SIDE-BY-SIDE VIEW MODE SWITCHER */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Display Mode:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setViewMode("curtain")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                viewMode === "curtain" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              Interactive Split Curtain
            </button>
            <button
              onClick={() => setViewMode("side_by_side")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all ${
                viewMode === "side_by_side" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Side-by-Side Dual View
            </button>
          </div>
        </div>

      </div>

      {/* MAIN VIEWPORT DISPLAY AREA */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative min-h-[480px]">
        
        {/* VIEWPORT HEADER OVERLAY */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600 text-white font-bold px-2.5 py-1 rounded">
              {activeKeyframe.date} ({activeKeyframe.label})
            </span>
            <span className="text-slate-300">
              Photos Captured: <strong className="text-white">{activeKeyframe.capturedPhotosCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-bold">
              360° Reality: {activeKeyframe.actualCompletionPercent}%
            </span>
            <span className="text-purple-400 font-bold">
              4D BIM Planned: {activeKeyframe.bimCompletionPercent}%
            </span>
            <span className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
              activeKeyframe.varianceStatus === "critical_delay" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
              activeKeyframe.varianceStatus === "minor_delay" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
              "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}>
              {activeKeyframe.varianceStatus.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* VIEWMODE 1: INTERACTIVE SPLIT CURTAIN */}
        {viewMode === "curtain" && (
          <div className="relative w-full h-[520px] select-none overflow-hidden">
            {/* BACKGROUND: 4D BIM MODEL (RIGHT SIDE) */}
            <div className="absolute inset-0">
              <img 
                src={activeKeyframe.bimModelUrl} 
                alt="4D BIM Model View"
                className="w-full h-full object-cover filter brightness-90 contrast-110"
              />
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono font-bold text-purple-300">
                4D BIM Scheduled Model Twin ({activeKeyframe.bimCompletionPercent}%)
              </div>
            </div>

            {/* FOREGROUND: 360° REALITY PHOTO (LEFT SIDE WITH CLIP PATH) */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
              <img 
                src={activeKeyframe.realityImgUrl} 
                alt="360° Site Reality"
                className="w-full h-full object-cover filter brightness-105"
              />
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono font-bold text-emerald-300">
                360° Physical Reality Capture ({activeKeyframe.actualCompletionPercent}%)
              </div>
            </div>

            {/* SPLITTER CURTAIN BAR & HANDLE */}
            <div 
              className="absolute top-0 bottom-0 z-30 w-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] cursor-ew-resize flex items-center justify-center"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white shadow-xl flex items-center justify-center border-2 border-white text-xs font-bold pointer-events-none">
                ↔
              </div>
            </div>

            {/* INVISIBLE SLIDER RANGE INPUT OVERLAY */}
            <input 
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 opacity-0 z-40 cursor-ew-resize w-full h-full"
            />
          </div>
        )}

        {/* VIEWMODE 2: SIDE BY SIDE DUAL VIEW */}
        {viewMode === "side_by_side" && (
          <div className="grid grid-cols-1 md:grid-cols-2 h-[520px]">
            {/* REALITY VIEW */}
            <div className="relative border-r border-slate-800">
              <img 
                src={activeKeyframe.realityImgUrl} 
                alt="360° Site Reality"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono font-bold text-emerald-300">
                360° Physical Site Reality ({activeKeyframe.actualCompletionPercent}%)
              </div>
            </div>

            {/* BIM MODEL VIEW */}
            <div className="relative">
              <img 
                src={activeKeyframe.bimModelUrl} 
                alt="4D BIM Model"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono font-bold text-purple-300">
                4D BIM Digital Twin Model ({activeKeyframe.bimCompletionPercent}%)
              </div>
            </div>
          </div>
        )}

      </div>

      {/* TIME-LAPSE SCRUBBER TIMELINE CONTROL BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold uppercase flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Project Lifecycle Scrubber Timeline
          </span>
          <span className="text-indigo-400 font-bold">
            Keyframe {currentFrameIndex + 1} of {TIMELINE_KEYFRAMES.length}
          </span>
        </div>

        {/* SCRUBBER PIPELINE STOPS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TIMELINE_KEYFRAMES.map((frame, index) => {
            const isCurrent = currentFrameIndex === index;

            return (
              <button
                key={frame.date}
                onClick={() => setCurrentFrameIndex(index)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isCurrent 
                    ? "bg-indigo-950/80 border-indigo-500 shadow-lg ring-2 ring-indigo-500/30" 
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 font-bold">{frame.date}</div>
                <div className="text-xs font-bold text-white mt-1 truncate">{frame.label}</div>
                
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-emerald-400 font-bold">{frame.actualCompletionPercent}%</span>
                  <span className={`w-2 h-2 rounded-full ${
                    frame.varianceStatus === "critical_delay" ? "bg-rose-500" :
                    frame.varianceStatus === "minor_delay" ? "bg-amber-500" :
                    "bg-emerald-500"
                  }`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE KEYFRAME EVENT BREAKDOWN */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          Milestone Event Log for {activeKeyframe.date}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeKeyframe.keyEvents.map((event, i) => (
            <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{event}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
