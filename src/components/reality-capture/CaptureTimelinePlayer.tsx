import React, { useState, useEffect } from "react";
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
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CaptureTimelinePlayer() {
  const [currentIndex, setCurrentIndex] = useState<number>(5); // Default to Month 6 (Index 5, representing current date)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showBimOverlay, setShowBimOverlay] = useState<boolean>(true);
  const [showAiBoxes, setShowAiBoxes] = useState<boolean>(true);

  const activeDay = TIMELINE_HISTORY[currentIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex === TIMELINE_HISTORY.length - 1) {
            return 0; // Loop back
          }
          return prevIndex + 1;
        });
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const handleStepForward = () => {
    setCurrentIndex((prev) => (prev < TIMELINE_HISTORY.length - 1 ? prev + 1 : 0));
  };

  const handleStepBackward = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : TIMELINE_HISTORY.length - 1));
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-5 shadow-xl flex flex-col gap-5">
      
      {/* Upper Panel: Main Screen Player View & Sidebar Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Visual Player Window (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="relative h-[340px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex flex-col justify-center items-center">
            
            {/* Visual Stream Mock Graphics */}
            <div className="absolute inset-0 select-none">
              <img 
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80" 
                alt="Construction site baseline" 
                className="w-full h-full object-cover opacity-35"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70" />
            </div>

            {/* Simulated Canvas Layers based on play index */}
            <div className="absolute inset-0 flex flex-col p-4 justify-between z-10 pointer-events-none">
              
              {/* Overlay Top Bar HUD */}
              <div className="flex justify-between items-start">
                <div className="bg-slate-900/90 border border-slate-700/60 px-3 py-1.5 rounded-md text-[10px] font-mono text-indigo-300 backdrop-blur flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>STREAM: {activeDay.capturedBy.toUpperCase()}</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-700/60 px-3 py-1.5 rounded-md text-[10px] font-mono text-indigo-300 backdrop-blur flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>RECORDED: {activeDay.date}</span>
                </div>
              </div>

              {/* Dynamic Simulated Graphics Overlay */}
              <div className="flex-1 flex items-center justify-center relative">
                
                {/* Simulated BIM Coordinates Wireframe Overlay */}
                {showBimOverlay && (
                  <div className="absolute inset-4 border border-dashed border-indigo-500/30 rounded flex items-center justify-center">
                    <span className="absolute top-2 left-2 text-[9px] font-mono text-indigo-400 uppercase tracking-widest bg-indigo-950/70 px-1 rounded border border-indigo-500/20">BIM Layer Active</span>
                    <svg className="w-full h-full text-indigo-400/20 pointer-events-none" viewBox="0 0 400 200">
                      <path d="M 50,150 L 150,50 L 250,50 L 350,150 Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
                      <line x1="150" y1="50" x2="150" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                      <line x1="250" y1="50" x2="250" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                      <circle cx="150" cy="50" r="4" fill="#6366f1" />
                      <circle cx="250" cy="50" r="4" fill="#6366f1" />
                    </svg>
                  </div>
                )}

                {/* Simulated AI Object Detection Bounding Boxes */}
                {showAiBoxes && (
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      {/* Box 1 (Structural Rebar) */}
                      {currentIndex >= 3 && currentIndex < 5 && (
                        <div className="absolute top-[25%] left-[20%] w-[120px] h-[70px] border border-red-500 bg-red-500/10 rounded flex flex-col justify-between p-1">
                          <span className="bg-red-600 text-[8px] text-white font-mono px-1 rounded self-start font-bold uppercase tracking-wider">L2 REBAR DEV [98.2%]</span>
                          <span className="text-[7px] text-red-200 font-mono text-right truncate">STIRRUP SPACING DEFECT</span>
                        </div>
                      )}

                      {/* Box 2 (Concrete Slab Verified) */}
                      {currentIndex >= 4 && (
                        <div className="absolute bottom-[20%] left-[10%] w-[320px] h-[50px] border border-emerald-500 bg-emerald-500/10 rounded flex flex-col justify-between p-1">
                          <span className="bg-emerald-600 text-[8px] text-white font-mono px-1 rounded self-start font-bold uppercase tracking-wider">CONCRETE POUR VERIFIED [99.5%]</span>
                          <span className="text-[7px] text-emerald-200 font-mono text-right">L2-SLAB CODES MATCH</span>
                        </div>
                      )}

                      {/* Box 3 (HVAC Duct lines) */}
                      {currentIndex >= 5 && (
                        <div className="absolute top-[10%] right-[15%] w-[180px] h-[40px] border border-amber-500 bg-amber-500/10 rounded flex flex-col justify-between p-1">
                          <span className="bg-amber-600 text-[8px] text-white font-mono px-1 rounded self-start font-bold uppercase tracking-wider">MEP HVAC INTERFERENCE [96.1%]</span>
                          <span className="text-[7px] text-amber-200 font-mono text-right">COLLISION WITH SPRINKLER</span>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
                
                {/* Central Status text */}
                <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 rounded-md text-[11px] border border-slate-800 text-slate-300 font-mono">
                  Stage: <span className="text-white font-bold">{activeDay.label}</span>
                </div>
              </div>

              {/* Video Overlay Bottom Controls HUD */}
              <div className="flex justify-between items-end">
                <div className="text-[10px] text-slate-400 font-mono">
                  TC: 02:44:12:{currentIndex * 10}
                </div>
                <div className="text-[10px] text-indigo-400 font-mono bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/10 uppercase">
                  FOV: 360° Equirectangular Map
                </div>
              </div>

            </div>

          </div>

          {/* Quick Config Toggles */}
          <div className="flex gap-4 justify-between bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 uppercase font-bold text-[10px]">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              HUD Layers:
            </span>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                <input 
                  type="checkbox" 
                  checked={showBimOverlay} 
                  onChange={(e) => setShowBimOverlay(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900 w-3.5 h-3.5"
                />
                <span>BIM Geometry</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                <input 
                  type="checkbox" 
                  checked={showAiBoxes} 
                  onChange={(e) => setShowAiBoxes(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-900 w-3.5 h-3.5"
                />
                <span>AI Annotations</span>
              </label>
            </div>
          </div>

        </div>

        {/* HUD Statistics Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-950 rounded-lg p-4 border border-slate-800 flex flex-col justify-between">
          
          <div className="flex flex-col gap-3">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase font-mono tracking-wider">Timeline Milestones</span>
              <h3 className="text-sm font-bold text-slate-100 uppercase mt-0.5">{activeDay.day} Status Overview</h3>
            </div>

            {/* Percentages progress blocks */}
            <div className="flex flex-col gap-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Overall Progress</span>
                  <span className="font-bold text-indigo-400">{activeDay.overallCompletion}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${activeDay.overallCompletion}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Structural Concrete</span>
                  <span className="font-bold text-slate-200">{activeDay.structuralPct}%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeDay.structuralPct}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">MEP Trade Runs</span>
                  <span className="font-bold text-slate-200">{activeDay.mepPct}%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${activeDay.mepPct}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Drywall & Finishing</span>
                  <span className="font-bold text-slate-200">{activeDay.finishingPct}%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeDay.finishingPct}%` }} />
                </div>
              </div>
            </div>

            {/* Mini Log statistics */}
            <div className="mt-2 p-3 bg-slate-900 rounded-lg border border-slate-800 flex flex-col gap-2 font-mono">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Day Audit Increments</span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block">Walls Casted</span>
                  <span className="text-white font-bold text-xs">{activeDay.stats.wallsCreated} Units</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block">MEP Runs Logged</span>
                  <span className="text-white font-bold text-xs">{activeDay.stats.pipesInstalled} L.m.</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block">Concrete Poured</span>
                  <span className="text-white font-bold text-xs">{activeDay.stats.concretePouredM3} m³</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block">Anomalies Detected</span>
                  <span className={`font-bold text-xs ${activeDay.stats.issuesFlagged > 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {activeDay.stats.issuesFlagged} Issues
                  </span>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-400 leading-relaxed font-sans">
            <span className="font-bold text-indigo-400 block uppercase font-mono tracking-wider text-[8px] mb-1">Reality Log Highlight</span>
            {activeDay.notableMilestone}
          </div>

        </div>

      </div>

      {/* Playback Scrubber & Navigation Buttons */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStepBackward}
            className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white border border-slate-800 transition shadow"
            title="Step Backward"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
              isPlaying ? "bg-red-600 text-white hover:bg-red-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
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
                <span>Play Movie</span>
              </>
            )}
          </button>

          <button
            onClick={handleStepForward}
            className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white border border-slate-800 transition shadow"
            title="Step Forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scrubbing timeline scale */}
        <div className="flex-1 flex items-center gap-1.5 max-w-lg md:max-w-none w-full">
          {TIMELINE_HISTORY.map((dayItem, index) => (
            <button
              key={dayItem.day}
              onClick={() => {
                setCurrentIndex(index);
                setIsPlaying(false);
              }}
              className={`flex-1 group relative flex flex-col items-center py-2 px-1 rounded-lg border transition ${
                index === currentIndex 
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-300" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <span className="text-[9px] font-mono uppercase font-extrabold tracking-wider">{dayItem.day}</span>
              <span className="text-[7px] text-slate-500 group-hover:text-slate-300 truncate max-w-[65px]">{dayItem.label}</span>
              
              {/* Slider tick dot */}
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                index === currentIndex ? "bg-indigo-400 animate-pulse" : "bg-slate-700"
              }`} />

              {/* Pop-up dates indicator */}
              <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-slate-800 text-white text-[8px] font-mono px-1.5 py-0.5 rounded border border-slate-600 transition shadow pointer-events-none whitespace-nowrap z-30">
                {dayItem.date}
              </span>
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
