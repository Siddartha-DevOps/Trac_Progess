import React, { useState } from "react";
import { ALIGNMENT_CHECKPOINTS, AlignmentCheckpoint } from "./mockData";
import { 
  Compass, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Scale 
} from "lucide-react";
import { motion } from "motion/react";

export default function AlignmentEngineView() {
  const [checkpoints, setCheckpoints] = useState<AlignmentCheckpoint[]>(ALIGNMENT_CHECKPOINTS);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationProgress, setCalibrationProgress] = useState<number>(0);
  
  // Matrix translation state
  const [offsetX, setOffsetX] = useState<number>(0.12);
  const [offsetY, setOffsetY] = useState<number>(-0.08);
  const [offsetZ, setOffsetZ] = useState<number>(0.34);
  const [rotationTheta, setRotationTheta] = useState<number>(1.24);

  // Computed metrics based on offsets
  const baseMSE = 4.2; // Mean Squared Error in mm
  const computedMSE = Math.abs(baseMSE + (offsetX * 10) + (offsetY * 8) - (rotationTheta * 2)).toFixed(2);
  const baseConfidence = 96.5;
  const computedConfidence = Math.min(
    100,
    Math.max(60, baseConfidence - Math.abs(offsetX) * 15 - Math.abs(offsetY) * 20 + Math.abs(offsetZ) * 5)
  ).toFixed(1);

  const triggerCalibration = () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);
    
    const interval = setInterval(() => {
      setCalibrationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCalibrating(false);
          // Optimize checkpoints randomly
          setCheckpoints(prevPoints => 
            prevPoints.map(p => ({
              ...p,
              status: "Aligned",
              confidence: parseFloat((Math.min(100, p.confidence + Math.random() * 3)).toFixed(1)),
              errorMarginMm: parseFloat((Math.max(1, p.errorMarginMm - Math.random() * 2)).toFixed(1)),
              unresolvedClashes: 0
            }))
          );
          return 100;
        }
        return prev + 25;
      });
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      {/* 3D Coordinate Calibration Panel (7 Cols) */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-100 flex flex-col gap-4">
        
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono tracking-wider">Rigid Body Transformation</span>
            <h3 className="text-sm font-bold uppercase tracking-tight text-white mt-0.5">Rigid Matrix Alignment Sandbox</h3>
          </div>
          <button
            onClick={triggerCalibration}
            disabled={isCalibrating}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? "animate-spin" : ""}`} />
            <span>{isCalibrating ? "Optimizing..." : "Auto-Align (ICP)"}</span>
          </button>
        </div>

        {/* Matrix Visualization Simulation Canvas */}
        <div className="relative h-[220px] bg-slate-950 rounded-lg border border-slate-850 overflow-hidden flex items-center justify-center">
          
          {/* Wireframe grids */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          {/* 3D Coordinate Axes visualization */}
          <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none font-mono text-[9px] text-slate-500">
            <div className="flex justify-between">
              <span>RERA Grid Reference: IN-KA-WF02</span>
              <span>MSE Deviation: <span className="text-rose-400 font-bold">{computedMSE} mm</span></span>
            </div>
            <div className="flex justify-between items-end">
              <span>Scale Factor: 1.0000000 (Isometric)</span>
              <span>Translation Matrix: [{offsetX.toFixed(2)}, {offsetY.toFixed(2)}, {offsetZ.toFixed(2)}]</span>
            </div>
          </div>

          {/* Interactive Calibration Mesh representation */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Base target mesh (BIM design model) */}
            <div className="absolute inset-2 border-2 border-dashed border-indigo-500/20 rounded-full animate-pulse flex items-center justify-center">
              <span className="text-[8px] font-mono text-indigo-500 uppercase tracking-widest">BIM Core</span>
            </div>

            {/* Drone captured physical point cloud matching mesh */}
            <motion.div 
              animate={{ 
                x: offsetX * 40, 
                y: offsetY * 40,
                rotate: rotationTheta * 15,
                scale: 1 + (offsetZ * 0.1)
              }}
              transition={{ type: "spring", stiffness: 120 }}
              className="absolute w-28 h-28 border border-emerald-500 bg-emerald-500/5 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Simulated Point Cloud Dots */}
                <div className="absolute top-2 left-6 w-1 h-1 bg-emerald-400 rounded-full" />
                <div className="absolute top-10 right-4 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <div className="absolute bottom-4 left-10 w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                <div className="absolute bottom-10 right-8 w-1 h-1 bg-emerald-400 rounded-full" />
                <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-wider bg-slate-950/80 px-1 rounded">PointCloud</span>
              </div>
            </motion.div>
          </div>

          {/* Calibrating overlay */}
          {isCalibrating && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-2">
              <Compass className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="text-xs font-mono font-bold text-slate-200">Refining ICP alignment matrices...</span>
              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${calibrationProgress}%` }} />
              </div>
            </div>
          )}

        </div>

        {/* Matrix offset fine tuning sliders */}
        <div className="grid grid-cols-2 gap-4 mt-1 bg-slate-950/65 p-3 rounded-lg border border-slate-850">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">X-Axis Offset (m)</span>
              <span className="text-indigo-300 font-bold">{offsetX.toFixed(2)}m</span>
            </div>
            <input 
              type="range" 
              min="-1.5" 
              max="1.5" 
              step="0.01" 
              value={offsetX} 
              onChange={(e) => setOffsetX(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Y-Axis Offset (m)</span>
              <span className="text-indigo-300 font-bold">{offsetY.toFixed(2)}m</span>
            </div>
            <input 
              type="range" 
              min="-1.5" 
              max="1.5" 
              step="0.01" 
              value={offsetY} 
              onChange={(e) => setOffsetY(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Z-Axis Altitude (m)</span>
              <span className="text-indigo-300 font-bold">{offsetZ.toFixed(2)}m</span>
            </div>
            <input 
              type="range" 
              min="-1.5" 
              max="1.5" 
              step="0.01" 
              value={offsetZ} 
              onChange={(e) => setOffsetZ(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Yaw Rotation Angle (θ)</span>
              <span className="text-indigo-300 font-bold">{rotationTheta.toFixed(2)}°</span>
            </div>
            <input 
              type="range" 
              min="-5" 
              max="5" 
              step="0.05" 
              value={rotationTheta} 
              onChange={(e) => setRotationTheta(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
            />
          </div>
        </div>

      </div>

      {/* Alignment Verification Checkpoints (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* Verification Summary Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono tracking-wider block">Registration Report</span>
          <div className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-850">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">ALIGNMENT CONFIDENCE</span>
              <span className="text-lg font-black text-white">{computedConfidence}%</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">RMS DRIFT</span>
              <span className="text-lg font-black text-rose-400">{computedMSE} mm</span>
            </div>
          </div>
        </div>

        {/* List of registration checkpoints */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 flex-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Spatial Checkpoints</span>
          
          <div className="flex flex-col gap-2 flex-1 justify-between">
            {checkpoints.map((point) => (
              <div 
                key={point.name}
                className="bg-slate-950 border border-slate-850 p-2.5 rounded flex justify-between items-center text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-slate-200">{point.name}</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">{point.category} • Delta: {point.errorMarginMm}mm</span>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                    point.status === "Aligned" 
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60"
                      : (point.status === "Failed" ? "bg-red-950/40 text-red-400 border-red-900/60" : "bg-indigo-950/40 text-indigo-400 border-indigo-900/60")
                  }`}>
                    {point.status}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1 font-mono">{point.confidence}% Match</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-indigo-950/20 rounded border border-indigo-500/10 text-[10px] text-indigo-300 leading-relaxed font-sans mt-1">
            <strong>Matching Logic:</strong> Reality Capture alignment calculates camera pose estimation, GPS, and surface vertex projections against the standard IFC building core layout to produce 1:1 isometric digital twins.
          </div>

        </div>

      </div>

    </div>
  );
}
