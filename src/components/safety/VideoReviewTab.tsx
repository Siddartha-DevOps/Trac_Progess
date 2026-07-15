import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Volume2, 
  Camera, 
  Clock, 
  AlertOctagon, 
  Bookmark, 
  Gauge, 
  Eye, 
  Cpu, 
  Video,
  ListFilter,
  Maximize,
  Sliders
} from "lucide-react";
import { useSafety } from "./useSafetyHooks";
import { VideoService } from "./safetyServices";
import { VideoEvent, CameraStream } from "./types";
import { motion } from "motion/react";

export default function VideoReviewTab() {
  const { kpis } = useSafety();
  const cameras = VideoService.getCameraStreams();
  const events = VideoService.getVideoEvents();

  const [selectedCamera, setSelectedCamera] = useState<CameraStream>(cameras[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(12); // start near first event
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showConfidence, setShowConfidence] = useState(true);
  
  // Timer for video simulation
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 100) return 0; // loop
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const activeEvent = events.find(
    (e) => currentTime >= e.timestamp - 3 && currentTime <= e.timestamp + 3
  );

  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
    setIsPlaying(false);
  };

  const stepFrame = (forward: boolean) => {
    setCurrentTime((prev) => {
      const next = forward ? prev + 1 : prev - 1;
      return Math.max(0, Math.min(100, next));
    });
    setIsPlaying(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
      
      {/* Left panel: Cameras timeline / Feed selection */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Feed Registry</span>
            <Video className="w-4 h-4 text-indigo-500" />
          </div>
          
          <div className="space-y-2">
            {cameras.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setSelectedCamera(cam)}
                className={`w-full text-left p-2.5 rounded-lg border transition text-xs flex justify-between items-center ${
                  selectedCamera.id === cam.id
                    ? "bg-indigo-50/50 border-indigo-200 text-slate-900 font-bold"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${cam.status === "Online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                    <span className="font-sans font-semibold text-slate-800">{cam.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">{cam.location}</span>
                </div>

                {cam.activeViolationsCount > 0 && (
                  <span className="bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                    {cam.activeViolationsCount} CV
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Drone Flight Path</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Drone Quad-Stream #1 is set to automatically patrol external facade zones every 4 hours. Manual overrides supported via Pilot hub.
          </p>
        </div>
      </div>

      {/* Middle: Video Canvas Center with controls */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        
        {/* Playback Canvas Area */}
        <div className="bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-900 relative">
          
          {/* Header overlay */}
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-10 text-white font-mono text-[10px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold uppercase text-[9px] tracking-widest bg-red-600 px-1 py-0.2 rounded">LIVE ANALYZER</span>
              <span className="text-slate-300">{selectedCamera.name}</span>
            </div>
            <span className="text-slate-350">
              RESOL: {selectedCamera.resolution}
            </span>
          </div>

          {/* Interactive Player Mock Layout */}
          <div className="aspect-video w-full relative flex items-center justify-center select-none bg-slate-900">
            
            {/* Background dynamic scene graphic representing site construction scaffolding */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] flex flex-col justify-end p-8 text-slate-500 text-[10px] font-mono">
              <div className="border-l border-b border-slate-750 h-32 w-full relative flex justify-around items-end">
                {/* Scaffold Columns */}
                <div className="w-1.5 bg-slate-700 h-full relative" />
                <div className="w-1.5 bg-slate-700 h-full relative" />
                <div className="w-1.5 bg-slate-700 h-full relative" />
                <div className="w-1.5 bg-slate-700 h-full relative" />
                <div className="absolute top-1/3 left-0 right-0 h-1 bg-slate-750" />
                <div className="absolute top-2/3 left-0 right-0 h-1 bg-slate-750" />
              </div>
            </div>

            {/* Bounding box dynamic overlays mapped to timestamps */}
            {showBoundingBoxes && activeEvent && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  position: "absolute",
                  left: "30%",
                  top: "25%",
                  width: "40%",
                  height: "55%",
                  border: activeEvent.severity === "Critical" ? "2px solid #ef4444" : "2px solid #f59e0b",
                  backgroundColor: activeEvent.severity === "Critical" ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)"
                }}
                className="rounded flex flex-col justify-between p-2 font-mono"
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[8px] font-bold text-white px-1 py-0.2 rounded uppercase ${
                    activeEvent.severity === "Critical" ? "bg-red-600" : "bg-amber-500"
                  }`}>
                    {activeEvent.type}
                  </span>
                  
                  {showConfidence && (
                    <span className="bg-slate-900/85 text-[8px] text-slate-200 px-1 py-0.2 rounded font-bold">
                      {activeEvent.confidence}% Conf
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-0.5 text-[8px] text-slate-200 bg-slate-950/80 p-1 rounded">
                  <span>Class: {activeEvent.objectType}</span>
                  <span>ID: {activeEvent.workerId || "N/A"}</span>
                </div>
              </motion.div>
            )}

            {/* Interactive Heatmap Visual Overlay */}
            {showHeatmap && (
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-amber-500/20 to-emerald-500/10 pointer-events-none mix-blend-overlay" />
            )}

            {/* Center Player Watermark state when paused */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-full text-indigo-400">
                  <Pause className="w-5 h-5 fill-indigo-400" />
                </div>
              </div>
            )}

            {/* Simulated Live Video Time Clock Overlay */}
            <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded text-white font-mono text-[10px]">
              T-00:{currentTime.toString().padStart(2, "0")}
            </div>

            {/* Speed Display */}
            <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded text-slate-350 font-mono text-[9px]">
              {playbackSpeed}x SPEED
            </div>
          </div>

          {/* Timeline scrubbing track */}
          <div className="bg-slate-900 px-3 py-1.5 flex items-center gap-3 border-t border-slate-850">
            <span className="text-[9px] text-slate-400 font-mono">00:00</span>
            <input 
              type="range"
              min="0"
              max="100"
              value={currentTime}
              onChange={(e) => seekTo(parseInt(e.target.value))}
              className="flex-1 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[9px] text-slate-400 font-mono">01:40</span>
          </div>

        </div>

        {/* Playback Controls Toolbar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between shadow-xs gap-3">
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => seekTo(0)}
              className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg transition"
              title="Reset Timeline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={() => stepFrame(false)}
              className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg transition"
              title="Step Frame Backward"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs"
              title={isPlaying ? "Pause Stream" : "Play Stream"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button 
              onClick={() => stepFrame(true)}
              className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg transition"
              title="Step Frame Forward"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed configuration */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-400 font-mono font-bold mr-1 uppercase">Speed</span>
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`text-[10px] font-mono px-2 py-1 rounded transition border ${
                  playbackSpeed === speed
                    ? "bg-slate-900 border-slate-900 text-white font-bold"
                    : "bg-white hover:bg-slate-50 text-slate-600 border-slate-250"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Rendering Overlays */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              className={`p-1.5 rounded-lg border text-[10px] font-mono font-bold transition flex items-center gap-1 ${
                showBoundingBoxes
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white text-slate-500 border-slate-200"
              }`}
              title="Toggle bounding boxes overlay"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>BBOX</span>
            </button>

            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`p-1.5 rounded-lg border text-[10px] font-mono font-bold transition flex items-center gap-1 ${
                showHeatmap
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-white text-slate-500 border-slate-200"
              }`}
              title="Toggle Heatmap"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>HEAT</span>
            </button>
          </div>

        </div>

      </div>

      {/* Right: Detected Events Feed List */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Detection Logs</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[350px] pr-1">
            {events.map((evt) => (
              <button
                key={evt.id}
                onClick={() => seekTo(evt.timestamp)}
                className={`w-full text-left p-2 rounded-lg border transition flex gap-2 ${
                  currentTime >= evt.timestamp - 3 && currentTime <= evt.timestamp + 3
                    ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-600/10 text-slate-900"
                    : "bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <div className={`p-1.5 rounded shrink-0 h-fit ${
                  evt.severity === "Critical" ? "bg-rose-100 text-rose-705" : "bg-amber-100 text-amber-705"
                }`}>
                  <AlertOctagon className="w-3.5 h-3.5" />
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-[11px] font-bold uppercase truncate">{evt.type}</span>
                    <span className="text-[9px] font-mono text-indigo-600 shrink-0">00:{evt.timestampStr}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-500 line-clamp-2">{evt.description}</p>
                  
                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 mt-1">
                    <span>Conf: {evt.confidence}%</span>
                    <span className="bg-slate-200 px-1 rounded uppercase tracking-wide font-bold">{evt.status}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-405 flex items-center gap-1 font-mono justify-between">
          <span>AI Engine status: ONLINE</span>
          <span className="bg-emerald-100 text-emerald-700 font-bold uppercase px-1 py-0.2 rounded text-[8px]">YOLOv11s</span>
        </div>
      </div>

    </div>
  );
}
