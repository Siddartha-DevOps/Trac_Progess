import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  Flame, 
  ShieldAlert, 
  Clock, 
  Sliders, 
  HelpCircle, 
  CheckCircle, 
  Download, 
  Printer, 
  ShieldCheck, 
  BellRing, 
  PhoneCall, 
  Cpu, 
  Server,
  Workflow
} from "lucide-react";
import { useSafety } from "./useSafetyHooks";
import { motion } from "motion/react";

export default function ReportsTab() {
  const { kpis, triggerMockAlert } = useSafety();
  const [isCompiling, setIsCompiling] = useState<string | null>(null);
  const [drillActive, setDrillActive] = useState(false);

  // Permits list
  const permits = [
    { id: "PTW-284", type: "Hot-Work Welding", contractor: "Sterling & Wilson", location: "Level 2 - Mech HVAC", status: "Expired", requirements: ["Fire Watcher Present", "CO2 Extinguisher 9kg", "Gas Clearance Test"] },
    { id: "PTW-285", type: "Working at Height", contractor: "L&T Construction", location: "Level 3 - Facade Outer", status: "Approved", requirements: ["Double Harness Tied", "Scaffold Green Tagged", "Edge Nets Installed"] },
    { id: "PTW-286", type: "Confined Space Entry", contractor: "Tata Projects", location: "Level 1 - Cable Trench", status: "Pending", requirements: ["Oxygen O2 Sensor > 19.5%", "Continuous Ventilation", "Buddy Watch Coordinator"] }
  ];

  // System parameters
  const [yoloConf, setYoloConf] = useState(85);
  const [dronePatrol, setDronePatrol] = useState(4);
  const [cameraFps, setCameraFps] = useState(30);

  const handleCompile = (reportName: string) => {
    setIsCompiling(reportName);
    setTimeout(() => {
      setIsCompiling(null);
      alert(`Enterprise ${reportName} compiled and processed successfully! Formatted ISO report has been prepared for download.`);
    }, 1800);
  };

  const handleTriggerDrill = () => {
    setDrillActive(true);
    triggerMockAlert({
      type: "Emergency",
      title: "Active Evacuation Drill Triggered",
      message: "Safety Drill SOP-09 active on Level 2. All personnel are instructed to proceed to Master Assembly Point A.",
      severity: "Critical"
    });
    setTimeout(() => {
      setDrillActive(false);
    }, 5000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans text-slate-700">
      
      {/* Left panel: Permit to work + Emergency response */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        
        {/* Permit to Work */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono">PTW Clearance</span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-0.5">Permit to Work Register</h4>
            </div>
            <Workflow className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="space-y-3">
            {permits.map((p) => (
              <div key={p.id} className="p-3 border rounded-xl bg-slate-50 text-[11px] space-y-2">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-400 font-bold">{p.id}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-350" />
                    <strong className="text-slate-800 uppercase">{p.type}</strong>
                  </div>

                  <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] uppercase border ${
                    p.status === "Approved" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                      : (p.status === "Expired" ? "bg-rose-50 text-rose-700 border-rose-150" : "bg-amber-50 text-amber-700 border-amber-150")
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-sans text-slate-500">
                  <span>Contractor: <strong>{p.contractor}</strong></span>
                  <span>Location: <strong>{p.location}</strong></span>
                </div>

                {/* Requirements checkmarks */}
                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-200/50">
                  {p.requirements.map((req, i) => (
                    <span key={i} className="bg-white px-2 py-0.5 border rounded font-mono text-[9px] text-slate-600 flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" /> {req}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Response HUD */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 shadow-md text-slate-200 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
              <div>
                <span className="text-[10px] text-rose-400 font-bold uppercase font-mono">SOP EMERGENCY CONTROLS</span>
                <h4 className="text-xs font-bold text-white uppercase tracking-tight mt-0.5">Emergency Response Center</h4>
              </div>
            </div>
            
            <span className="bg-red-950 text-red-400 font-mono text-[8px] font-bold border border-red-900 px-1.5 py-0.2 rounded">SOP-09 TRIGGER</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-[11px] text-slate-300">
              <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider block">Evacuation Coordinates</span>
              <ul className="space-y-1.5 font-sans">
                <li>• <strong>Master Assembly Point A:</strong> Main entry road gravel zone.</li>
                <li>• <strong>Evacuation Route:</strong> Use Staircase Core B (Staircase A restricted).</li>
                <li>• <strong>Primary Hospital:</strong> Fortis Hospital Whitefield (7 minutes travel distance).</li>
              </ul>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-mono block">Action Protocol Drill System</span>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                  Fires a simulated site emergency broadcast message. Alerts all mobile personnel and triggers visual beacon indicators.
                </p>
              </div>

              <button
                onClick={handleTriggerDrill}
                disabled={drillActive}
                className={`w-full py-1.5 mt-3 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono transition shadow-xs flex items-center justify-center gap-1.5 ${
                  drillActive 
                    ? "bg-red-700 text-white animate-pulse" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                <BellRing className="w-3.5 h-3.5" /> {drillActive ? "DRILL TELEMETRY DISPATCHING..." : "TRIGGER MOCK EMERGENCY DRILL"}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Right panel: Compile center + Settings calibration */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        
        {/* Compile Reports */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">PDF COMPILES</span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-0.5">Reports Center</h4>
            </div>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="space-y-2">
            {[
              "Daily Safety Compliance Report",
              "Weekly PPE Trend Report",
              "Incident Close-Out Auditor Summary",
              "Monthly ISO 45001 Compliance Audit"
            ].map((rep) => (
              <button
                key={rep}
                onClick={() => handleCompile(rep)}
                disabled={isCompiling !== null}
                className="w-full text-left p-2 rounded-lg border bg-slate-50 hover:bg-slate-100 transition flex justify-between items-center text-xs text-slate-700"
              >
                <span className="font-semibold truncate pr-2">{rep}</span>
                {isCompiling === rep ? (
                  <span className="text-[9px] font-mono text-indigo-600 animate-pulse uppercase tracking-wider shrink-0 font-bold">Compiling...</span>
                ) : (
                  <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* AI Calibration Settings */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">CV Config</span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-0.5">Inference Settings</h4>
            </div>
            <Sliders className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3.5 text-[11px]">
            {/* Slider 1 */}
            <div className="space-y-1">
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-500 font-bold">YOLO CONFIDENCE THRESHOLD</span>
                <span className="text-indigo-600 font-bold">{yoloConf}%</span>
              </div>
              <input 
                type="range" min="50" max="98" step="1"
                value={yoloConf} onChange={(e) => setYoloConf(parseInt(e.target.value))}
                className="w-full accent-indigo-600" 
              />
            </div>

            {/* Slider 2 */}
            <div className="space-y-1">
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-500 font-bold">DRONE PATROL INTERVAL</span>
                <span className="text-indigo-600 font-bold">EVERY {dronePatrol} HOURS</span>
              </div>
              <input 
                type="range" min="1" max="12" step="1"
                value={dronePatrol} onChange={(e) => setDronePatrol(parseInt(e.target.value))}
                className="w-full accent-indigo-600" 
              />
            </div>

            {/* Hardware spec watermark */}
            <div className="p-2.5 bg-slate-50 border rounded-lg flex gap-1.5 items-center font-mono text-[9px] text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Inference Engine: NVIDIA TensorRT H100 GPU cluster (Level 2 active)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
