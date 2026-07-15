import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Orbit, 
  Radio, 
  Compass, 
  Glasses, 
  Terminal, 
  ShieldAlert, 
  Eye, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Drone,
  Bot,
  Truck,
  Layers,
  Thermometer,
  CloudLightning,
  Clock,
  ArrowRight,
  Gauge
} from "lucide-react";

interface DroneStatus {
  id: string;
  name: string;
  type: "drone" | "rover" | "quadruped" | "arm";
  battery: number;
  status: "idle" | "scanning" | "navigating" | "offline";
  currentTask: string;
  location: string;
}

interface WearableMetric {
  id: string;
  user: string;
  role: string;
  heartRate: number;
  helmetTemp: number;
  hudState: "active" | "error" | "recalibrating";
  hasPPE: boolean;
}

interface SpatialAnomaly {
  id: string;
  timestamp: string;
  zone: string;
  element: string;
  deviation: number; // in mm
  severity: "critical" | "warning" | "nominal";
  status: "unresolved" | "adjusting" | "resolved";
}

export default function FuturisticACOSView() {
  const [activeTab, setActiveTab] = useState<"spatial" | "robotics" | "wearables" | "agents">("spatial");
  const [simulationActive, setSimulationActive] = useState(true);
  const [time, setTime] = useState("09:59:00");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[ACOS-SYS] Booting Neural-Vision kernel v35.2.4...",
    "[ACOS-SYS] Established 6G secure quantum tunnel to Region-1 Node-E",
    "[ACOS-SYS] Spatial alignment active: colored ICP tolerance set to 1.5mm",
    "[ACOS-SWARM] Quad-Rover-04 dispatched to level 2 drywall inspection",
    "[ACOS-PROC] Procurement Agent draft ledger synced: Cement supply chain locked"
  ]);

  const [drones, setDrones] = useState<DroneStatus[]>([
    { id: "R-01", name: "Alpha-Rover", type: "quadruped", battery: 94, status: "scanning", currentTask: "Continuous NeRF Scan", location: "Zone C - Level 1" },
    { id: "D-02", name: "Nimbus-Surveyor", type: "drone", battery: 88, status: "scanning", currentTask: "Aerial Laser Audit", location: "Roof Structure" },
    { id: "Q-03", name: "Spot-Heavy-03", type: "quadruped", battery: 67, status: "navigating", currentTask: "Drywall Verification", location: "Zone B - Level 2" },
    { id: "A-04", name: "Apex-Welder-01", type: "arm", battery: 100, status: "idle", currentTask: "Awaiting Schedule Dispatch", location: "Zone A - Level 1" }
  ]);

  const [wearables, setWearables] = useState<WearableMetric[]>([
    { id: "W-01", user: "Marcus Vance", role: "Structural Engineer", heartRate: 74, helmetTemp: 28.5, hudState: "active", hasPPE: true },
    { id: "W-02", user: "Sarah Lin", role: "Project Manager", heartRate: 82, helmetTemp: 27.2, hudState: "active", hasPPE: true },
    { id: "W-03", user: "David Chen", role: "MEP Inspector", heartRate: 98, helmetTemp: 31.0, hudState: "recalibrating", hasPPE: false }
  ]);

  const [anomalies, setAnomalies] = useState<SpatialAnomaly[]>([
    { id: "ANOM-402", timestamp: "09:52:14", zone: "Zone B - Room 204", element: "Drywall Partition Partition-204", deviation: 4.8, severity: "warning", status: "unresolved" },
    { id: "ANOM-403", timestamp: "09:54:10", zone: "Zone A - Main Corridor", element: "Sprinkler Pipe Pipe-A11", deviation: 12.4, severity: "critical", status: "adjusting" },
    { id: "ANOM-404", timestamp: "09:55:00", zone: "Zone C - Mech Room", element: "HVAC Duct HVAC-C03", deviation: 0.8, severity: "nominal", status: "resolved" }
  ]);

  // Periodic Simulation Loop
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      // 1. Update timestamp
      const now = new Date();
      setTime(now.toTimeString().split(" ")[0]);

      // 2. Randomly jitter drone batteries and statuses
      setDrones(prev => prev.map(d => {
        if (d.battery <= 5) return { ...d, battery: 100, status: "idle" };
        const d_bat = Math.max(0, d.battery - (Math.random() > 0.7 ? 1 : 0));
        const statuses: ("idle" | "scanning" | "navigating")[] = ["idle", "scanning", "navigating"];
        const nextStatus = Math.random() > 0.85 ? statuses[Math.floor(Math.random() * statuses.length)] : d.status;
        return { ...d, battery: d_bat, status: nextStatus };
      }));

      // 3. Jitter wearable metrics
      setWearables(prev => prev.map(w => {
        const nextHR = Math.min(130, Math.max(60, w.heartRate + Math.floor(Math.random() * 5) - 2));
        const nextTemp = Math.min(40, Math.max(20, w.helmetTemp + (Math.random() * 0.4) - 0.2));
        return { ...w, heartRate: nextHR, helmetTemp: parseFloat(nextTemp.toFixed(1)) };
      }));

      // 4. Random terminal logs
      const logPool = [
        "[ACOS-VISION] Neural mesh rasterized 1,400 additional points.",
        "[ACOS-TWIN] 3D Gaussian Splatting pipeline completed Zone B frame aggregation.",
        "[ACOS-SAFETY] Warning: Crew David Chen is entering a high-vibration zone.",
        "[ACOS-ROBOTICS] Spot-Heavy-03 re-routed to avoid temporary partition block.",
        "[ACOS-AGENT] Procurement Agent initiated smart escrow payment of $12,400.",
        "[ACOS-SCHEDULER] Monte Carlo simulation predicted delay in critical path: resolving...",
        "[ACOS-VISION] Sub-millimeter audit: drywalls matched model by 99.88%."
      ];
      if (Math.random() > 0.5) {
        setTerminalLogs(prev => {
          const nextLogs = [...prev, `[${new Date().toTimeString().split(" ")[0]}] ${logPool[Math.floor(Math.random() * logPool.length)]}`];
          return nextLogs.slice(-6); // keep last 6 logs
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [simulationActive]);

  // Action dispatches
  const addLog = (log: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toTimeString().split(" ")[0]}] ${log}`].slice(-6));
  };

  const dispatchRobot = (id: string) => {
    setDrones(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, status: "navigating", currentTask: "Forced Path Re-validation" };
      }
      return d;
    }));
    addLog(`ROBOTICS: Force dispatched ${id} to re-verify path.`);
  };

  const resolveAnomaly = (id: string) => {
    setAnomalies(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: "resolved" };
      }
      return a;
    }));
    addLog(`SPATIAL AUDIT: Resolved anomaly ${id}. Physical adjustments verified.`);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in text-slate-100 font-sans">
      
      {/* HEADER HUD BAR */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-3 flex gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs rounded uppercase tracking-widest flex items-center gap-1.5">
                <Orbit className="w-4 h-4 animate-spin" /> acos core v2035.1
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                SYSTEM TIME: <span className="text-cyan-400 font-bold">{time}</span>
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mt-3 text-white">
              Autonomous Construction Operating System
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Managing 3D Gaussian Splats, robotics fleets, safety sensors, and neural vision agents. 
              The decentralized global operating system for smart construction sites.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2.5 rounded-xl shrink-0">
            <button
              onClick={() => setSimulationActive(!simulationActive)}
              className={`px-4 py-2 text-xs font-mono font-bold rounded-lg flex items-center gap-2 transition-all ${
                simulationActive 
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/35 hover:bg-cyan-500/25" 
                  : "bg-red-500/15 text-red-400 border border-red-500/35 hover:bg-red-500/25"
              }`}
            >
              {simulationActive ? (
                <>
                  <Zap className="w-4 h-4 text-cyan-400 animate-bounce" /> SIMULATION ACTIVE
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-red-400" /> SIMULATION PAUSED
                </>
              )}
            </button>
            <button 
              onClick={() => {
                setTerminalLogs([
                  "[ACOS-SYS] Hard recalibration initialized...",
                  "[ACOS-SYS] Syncing point clouds from local EKS workers...",
                  "[ACOS-SWARM] All robotic agents set to safe trajectory sweeps."
                ]);
                addLog("System telemetry rebooted.");
              }}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
              title="Reset Simulation Feed"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CORE 2035 CAPABILITY PORTALS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab("spatial")}
          className={`p-4 border rounded-xl flex flex-col gap-3 text-left transition-all ${
            activeTab === "spatial" 
              ? "bg-slate-900 border-cyan-500/45 shadow-lg" 
              : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </div>
            {activeTab === "spatial" && <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-ping" />}
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Pillar 01</span>
            <h4 className="text-sm font-black text-white mt-1">Live Neural Twins</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Continuous 3D Gaussian Splats.</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("robotics")}
          className={`p-4 border rounded-xl flex flex-col gap-3 text-left transition-all ${
            activeTab === "robotics" 
              ? "bg-slate-900 border-indigo-500/45 shadow-lg" 
              : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            {activeTab === "robotics" && <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />}
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Pillar 02</span>
            <h4 className="text-sm font-black text-white mt-1">Robotic Swarms</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Quadrupeds, Welder and Drone Fleets.</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("wearables")}
          className={`p-4 border rounded-xl flex flex-col gap-3 text-left transition-all ${
            activeTab === "wearables" 
              ? "bg-slate-900 border-amber-500/45 shadow-lg" 
              : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Glasses className="w-5 h-5" />
            </div>
            {activeTab === "wearables" && <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />}
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Pillar 03</span>
            <h4 className="text-sm font-black text-white mt-1">AR & Smart Wearables</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Continuous worker biometrics HUD.</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("agents")}
          className={`p-4 border rounded-xl flex flex-col gap-3 text-left transition-all ${
            activeTab === "agents" 
              ? "bg-slate-900 border-emerald-500/45 shadow-lg" 
              : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            {activeTab === "agents" && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />}
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Pillar 04</span>
            <h4 className="text-sm font-black text-white mt-1">Autonomous Agents</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">RAG Procurement, Delay Solvers.</p>
          </div>
        </button>
      </div>

      {/* DYNAMIC CONTENT DESK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TAB SPECIFIC ENGINE SCREEN (LEFT & CENTER - 2 COLS) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* TAB 1: LIVE SPATIAL TWIN & ANOMALY LIST */}
          {activeTab === "spatial" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4.5 h-4.5 text-cyan-400" />
                    Spatial Gaussian Splat Ingress
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Continuous point cloud alignments</p>
                </div>
                <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono rounded font-bold uppercase animate-pulse">
                  Rendering SPLATS @ 60FPS
                </span>
              </div>

              {/* Futuristic Vector Simulation Box */}
              <div className="relative aspect-video rounded-lg border border-slate-800 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-slate-950 to-slate-950" />
                
                {/* Simulated Point Cloud Dots Grid */}
                <div className="absolute inset-0 opacity-10 flex flex-wrap justify-between items-center p-4 select-none pointer-events-none">
                  {Array.from({ length: 120 }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" style={{ animationDelay: `${i * 80}ms`, animationDuration: "3s" }} />
                  ))}
                </div>

                {/* Simulated Wireframe Section Cuts */}
                <div className="absolute inset-x-0 top-1/4 h-px bg-cyan-500/25 animate-pulse" />
                <div className="absolute inset-x-0 top-2/4 h-px bg-cyan-500/10" />
                <div className="absolute inset-y-0 left-1/3 w-px bg-cyan-500/25" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-cyan-500/10" />

                <div className="z-10 flex flex-col items-center text-center gap-2 max-w-sm px-6">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full animate-spin">
                    <Orbit className="w-8 h-8" />
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mt-2">Active Laser Spatial Parser</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Analyzing geometric anomalies comparing point clouds with original Revit CAD blueprints. Auto-corrective threshold set to **1.5mm**.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono rounded font-bold">
                      COLOURED ICP MATCH: 99.12%
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[9px] font-mono rounded font-bold">
                      RESOLUTION: 0.5MM
                    </span>
                  </div>
                </div>

                {/* Live Scanning Indicators overlay */}
                <div className="absolute bottom-4 left-4 flex gap-4 text-[9px] font-mono text-slate-500">
                  <div>X: <span className="text-cyan-400 font-bold">402.148</span></div>
                  <div>Y: <span className="text-cyan-400 font-bold">110.892</span></div>
                  <div>Z: <span className="text-cyan-400 font-bold">12.551</span></div>
                </div>
              </div>

              {/* Spatial Anomalies Tables */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono">Discovered Spatial Anomalies</span>
                <div className="flex flex-col gap-2.5">
                  {anomalies.map(a => (
                    <div key={a.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                          a.severity === "critical" ? "bg-red-500/10 border border-red-500/20 text-red-400" :
                          a.severity === "warning" ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" :
                          "bg-slate-500/10 border border-slate-500/20 text-slate-400"
                        }`}>
                          {a.id}
                        </span>
                        <div>
                          <p className="font-bold text-white">{a.element}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{a.zone} • {a.timestamp} • <span className="font-mono text-red-400">+{a.deviation}mm deviation</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                          a.status === "resolved" ? "bg-emerald-500/15 text-emerald-400" :
                          a.status === "adjusting" ? "bg-cyan-500/15 text-cyan-400 animate-pulse" :
                          "bg-red-500/15 text-red-400"
                        }`}>
                          {a.status}
                        </span>
                        {a.status !== "resolved" && (
                          <button
                            onClick={() => resolveAnomaly(a.id)}
                            className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-[9px] uppercase rounded transition-all flex items-center gap-1"
                          >
                            Recalibrate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROBOTIC SWARM FLEET BROKER */}
          {activeTab === "robotics" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5 shadow-xl animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Bot className="w-4.5 h-4.5 text-indigo-400" />
                    Robotic Swarm Fleet control
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Real-time status of quadrupeds, surveyors, & heavy helpers</p>
                </div>
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono rounded font-bold uppercase">
                  ACTIVE BRIDGES: {drones.length}
                </span>
              </div>

              {/* Swarm Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drones.map(d => (
                  <div key={d.id} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 rounded-lg">
                          {d.type === "drone" ? <Radio className="w-5 h-5 animate-pulse" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">{d.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">{d.id} • {d.type.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          d.battery > 50 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400 animate-pulse"
                        }`}>
                          {d.battery}% BAT
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800/50 p-2.5 rounded-lg text-xs leading-relaxed flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-[10px]">CURRENT ACTION:</span>
                        <span className="text-indigo-400 font-bold">{d.currentTask}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-[10px]">GEOLOCATION:</span>
                        <span className="text-slate-300 font-mono text-[10px]">{d.location}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${
                        d.status === "scanning" ? "text-cyan-400" :
                        d.status === "navigating" ? "text-amber-400" : "text-slate-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          d.status === "scanning" ? "bg-cyan-500 animate-ping" :
                          d.status === "navigating" ? "bg-amber-500 animate-pulse" : "bg-slate-500"
                        }`} />
                        {d.status.toUpperCase()}
                      </span>

                      <button
                        onClick={() => dispatchRobot(d.id)}
                        className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-bold text-[9px] uppercase rounded transition-all flex items-center gap-1"
                      >
                        Dispatch Sweep
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* C-SLAM Orchestration Terminal */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4 text-xs">
                <div className="p-3 bg-indigo-500/15 text-indigo-400 rounded-lg border border-indigo-500/20">
                  <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Collaborative Spatial SLAM Anchor</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Synchronizing shared tracking coordinates across active rovers and smart helmets. Standard deviation variance locked at **$\leq 0.08$ meters RMS**.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEARABLE HUD & BIOMETRICS FEED */}
          {activeTab === "wearables" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5 shadow-xl animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Glasses className="w-4.5 h-4.5 text-amber-400" />
                    AR Wearables & Helmet HUD Telemetry
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Continuous health audits, heat indexes, & spatial overrides</p>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono rounded font-bold uppercase">
                  HUD REFRESH INGEST: 10HZ
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {wearables.map(w => (
                  <div key={w.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-white text-xs">{w.user}</h4>
                        <p className="text-[9px] text-slate-500 mt-0.5">{w.role} • {w.id}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold ${
                        w.hudState === "active" ? "bg-emerald-500/10 text-emerald-400 animate-pulse" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        HUD: {w.hudState}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-1.5 border-y border-slate-800/40">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-red-500" />
                        <div>
                          <span className="text-[9px] text-slate-500 block">Pulse</span>
                          <span className="font-bold text-white font-mono">{w.heartRate} bpm</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                        <div>
                          <span className="text-[9px] text-slate-500 block">Helmet Temp</span>
                          <span className="font-bold text-white font-mono">{w.helmetTemp}°C</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${w.hasPPE ? "bg-emerald-500" : "bg-red-500 animate-ping"}`} />
                        <span className="text-slate-400">PPE Verified: {w.hasPPE ? "Yes" : "No"}</span>
                      </div>

                      {!w.hasPPE && (
                        <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-mono rounded font-bold uppercase animate-pulse flex items-center gap-1">
                          <ShieldAlert className="w-2.5 h-2.5" /> PPE HAZARD
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Glasses Display Box */}
              <div className="relative aspect-[21/9] rounded-lg border border-amber-500/20 bg-slate-950/80 p-5 overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-slate-500 tracking-wider">AR ENGINE READY</div>
                <div className="absolute inset-0 border border-amber-500/10 pointer-events-none rounded-lg" />
                <div className="absolute inset-x-0 top-1/2 h-px bg-amber-500/5" />

                <div className="z-10">
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[9px] font-mono rounded font-bold uppercase">
                    ACTIVE HUD SIMULATOR
                  </span>
                  <h4 className="text-white font-black text-sm mt-2 flex items-center gap-1.5">
                    <Glasses className="w-4 h-4 text-amber-400" /> WebXR Spatial Projector Active
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-md leading-relaxed">
                    Projecting duct coordinates for finishing installers. Safety warnings auto-alert on structural deviations exceeding local codes.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  No structural hazards in line of sight.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUTONOMOUS AGENTS (PLANNING & PROCUREMENT LEDGER) */}
          {activeTab === "agents" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5 shadow-xl animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4.5 h-4.5 text-emerald-400" />
                    Decentralized Planning & Procurement Ledger
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Automated RAG, dynamic material trade agreements, & delay mitigation</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded font-bold uppercase">
                  LEDGER ONLINE
                </span>
              </div>

              {/* RAG and Agent activities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">Dynamic Procurement Agent</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Evaluates spatial volumetric measurements of cement block installations. Automatically places concrete orders when local inventories drop below 15%.
                  </p>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] leading-relaxed font-mono text-emerald-400 flex flex-col gap-1">
                    <div>[09:54:12] Placed order to Holcim Cement for 140 metric tonnes.</div>
                    <div>[09:54:14] Smart escrow validated: $18,450 reserved.</div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">Primavera P6 Critical-Path Agent</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Monitors installation delays dynamically. Uses graph-theoretic models to adjust schedule tasks before delays affect final handover dates.
                  </p>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-[11px] leading-relaxed font-mono text-cyan-400 flex flex-col gap-1">
                    <div>[09:55:01] Identified delay in Zone B drywall installation.</div>
                    <div>[09:55:04] Adjusted float metrics: Compressed Zone C finishing by 3 days.</div>
                  </div>
                </div>
              </div>

              {/* Blockchain Smart Contract verification banner */}
              <div className="bg-slate-950 border border-emerald-500/10 p-4 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Decentralized Ledger Secured</h4>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      Progressive sub-contractor billing claims are verified by visual spatial records and committed directly to the blockchain ledger.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase font-bold rounded">
                  VERIFIED: SHA256 SECURE
                </span>
              </div>
            </div>
          )}

        </div>

        {/* FUTURISTIC REAL-TIME TERMINAL MONITORS (RIGHT SIDE - 1 COL) */}
        <div className="flex flex-col gap-6">
          
          {/* TERMINAL OUTPUT BOX */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> telemetry log terminal
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            </div>

            <div className="flex flex-col gap-3 min-h-[180px] max-h-[240px] overflow-y-auto text-[10.5px] leading-relaxed text-slate-300">
              {terminalLogs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-cyan-500 select-none">&gt;</span>
                  <p>{log}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
              <input
                type="text"
                placeholder="Query ACOS AGI Agent..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    addLog(`USER QUERY: ${e.currentTarget.value}`);
                    const inputVal = e.currentTarget.value;
                    e.currentTarget.value = "";
                    setTimeout(() => {
                      addLog(`ACOS AGENT: Analytical parser processed query "${inputVal}". Adjusting spatial anchors...`);
                    }, 800);
                  }
                }}
                className="bg-transparent border-none text-xs text-white focus:outline-none focus:ring-0 flex-1 placeholder:text-slate-600"
              />
              <span className="text-[9px] text-slate-500">[ENTER]</span>
            </div>
          </div>

          {/* AI-DECISION HUD CHARTS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono">ACOS Site Health Status</span>
            
            <div className="flex flex-col gap-3.5">
              
              {/* Metric 1 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold">Spatial Mesh Synchronization</span>
                  <span className="font-mono text-cyan-400 font-bold">99.1%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
                  <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: "99.1%" }} />
                </div>
              </div>

              {/* Metric 2 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold">Robotic Swarm Batteries</span>
                  <span className="font-mono text-indigo-400 font-bold">87.3% AVG</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: "87.3%" }} />
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold">RAG Knowledge Coverage</span>
                  <span className="font-mono text-emerald-400 font-bold">100% COMPLETE</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Metric 4 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold">Active Safety Threshold</span>
                  <span className="font-mono text-amber-400 font-bold">0 HAZARDS OPEN</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "100%" }} />
                </div>
              </div>

            </div>
          </div>

          {/* 2035 SYSTEM ARCHITECTURE HIGHLIGHTS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-500" /> ACOS Hardware Stack (2035)
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Powered by unified regional **H100/H200 GPU cluster swarms** connected through low-latency **6G networks** back to **NVIDIA Jetson Thor** on-device edge nodes.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
