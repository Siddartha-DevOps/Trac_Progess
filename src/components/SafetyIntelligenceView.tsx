import React, { useState, useEffect } from "react";
import { 
  Shield, 
  ShieldCheck, 
  Video, 
  AlertTriangle, 
  ClipboardCheck, 
  Flame, 
  Map, 
  FileText,
  Activity,
  ChevronRight,
  Sparkles,
  Info,
  Cpu,
  Plane,
  Eye,
  AlertOctagon,
  BarChart3,
  Settings,
  Sliders,
  BellRing,
  RefreshCw,
  Send,
  Download,
  CheckCircle,
  X,
  Volume2,
  VolumeX,
  Phone,
  Signal,
  Battery
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

// Imported TracProgress Core Safety Components
import SafetyPatrolSimulator from "./safety/SafetyPatrolSimulator";
import SafetyDashboardTab from "./safety/SafetyDashboardTab";
import PPEAnalyticsTab from "./safety/PPEAnalyticsTab";
import VideoReviewTab from "./safety/VideoReviewTab";
import IncidentsTab from "./safety/IncidentsTab";
import HazardsTab from "./safety/HazardsTab";
import NearMissesTab from "./safety/NearMissesTab";
import SafetyAuditsTab from "./safety/SafetyAuditsTab";
import SafetyHeatmapTab from "./safety/SafetyHeatmapTab";
import ReportsTab from "./safety/ReportsTab";

export default function SafetyIntelligenceView() {
  const [localTab, setLocalTab] = useState<
    | "dashboard"
    | "live-patrol"
    | "camera-network"
    | "drone-monitoring"
    | "wearable-cameras"
    | "violations"
    | "near-misses"
    | "incident-reports"
    | "analytics"
    | "heatmap"
    | "ppe-compliance"
    | "emergency"
    | "audit-reports"
    | "settings"
  >("dashboard");

  // Custom simulation states for Drone Monitoring
  const [isDroneFlying, setIsDroneFlying] = useState(false);
  const [droneAlt, setDroneAlt] = useState(0);
  const [droneBat, setDroneBat] = useState(94);
  const [droneLogs, setDroneLogs] = useState<string[]>([
    "Drone status: Docked & Charging on Tower Pad A",
    "Pre-flight diagnostics completed: 100% stable",
  ]);

  // Custom simulation states for Wearable BodyCams
  const [isIntercomBroadcasting, setIsIntercomBroadcasting] = useState<string | null>(null);
  const [intercomText, setIntercomText] = useState("");
  const [intercomLogs, setIntercomLogs] = useState<string[]>([
    "System: All body-cams connected over LTE priority slice.",
  ]);

  // Custom simulation states for PPE Compliance Slider calibration
  const [confidenceSlider, setConfidenceSlider] = useState(85);
  const [computedFalsePositives, setComputedFalsePositives] = useState(1);

  // Custom states for Site Emergency Response actuator
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [musterCount, setMusterCount] = useState({ present: 48, missing: 4 });
  const [emergencyBroadcastText, setEmergencyBroadcastText] = useState("");
  const [emergencyLogs, setEmergencyLogs] = useState<string[]>([
    "All fire safety panels synced - Status: Nominal",
  ]);

  // Custom safety configuration states
  const [autoSmsNotify, setAutoSmsNotify] = useState(true);
  const [windRecallThreshold, setWindRecallThreshold] = useState(35);
  const [aiDetectionSensitivity, setAiDetectionSensitivity] = useState(75);
  const [sirenOnAlert, setSirenOnAlert] = useState(false);

  // Handle Drone Simulation cycle
  useEffect(() => {
    let interval: any;
    if (isDroneFlying) {
      interval = setInterval(() => {
        setDroneAlt(prev => {
          if (prev < 45) {
            return prev + 5;
          }
          return 45;
        });
        setDroneBat(prev => {
          if (prev > 15) {
            return prev - 1;
          }
          return prev;
        });
      }, 1000);
    } else {
      interval = setInterval(() => {
        setDroneAlt(prev => {
          if (prev > 0) return prev - 5;
          return 0;
        });
        setDroneBat(prev => {
          if (prev < 100) return prev + 2;
          return 100;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDroneFlying]);

  // Handle Dynamic Slider calculations
  useEffect(() => {
    // Calibrate computed stats based on slider
    if (confidenceSlider < 65) {
      setComputedFalsePositives(12);
    } else if (confidenceSlider < 80) {
      setComputedFalsePositives(4);
    } else if (confidenceSlider < 90) {
      setComputedFalsePositives(1);
    } else {
      setComputedFalsePositives(0);
    }
  }, [confidenceSlider]);

  const handleLaunchDrone = () => {
    setIsDroneFlying(true);
    setDroneLogs(prev => [
      `[${new Date().toLocaleTimeString().slice(0, 5)}] Launched drone on active structural sweep route.`,
      `[${new Date().toLocaleTimeString().slice(0, 5)}] Ascending to 45m cruising envelope.`,
      ...prev
    ]);
  };

  const handleRecallDrone = () => {
    setIsDroneFlying(false);
    setDroneLogs(prev => [
      `[${new Date().toLocaleTimeString().slice(0, 5)}] Drone recall signal received. Autopilot landing initialized.`,
      `[${new Date().toLocaleTimeString().slice(0, 5)}] Docked at Tower Pad A. Recharging mode activated.`,
      ...prev
    ]);
  };

  const handleTriggerDroneScanner = () => {
    setDroneLogs(prev => [
      `[${new Date().toLocaleTimeString().slice(0, 5)}] Active aerial LiDAR scan triggered on Column Sector B-24.`,
      `[${new Date().toLocaleTimeString().slice(0, 5)}] Surface mesh comparison locked with 0.4mm variance.`,
      ...prev
    ]);
  };

  const handlePingIntercom = (supervisor: string) => {
    setIsIntercomBroadcasting(supervisor);
    setIntercomLogs(prev => [
      `[${new Date().toLocaleTimeString().slice(0, 5)}] Opened intercom path to ${supervisor}'s body-cam.`,
      ...prev
    ]);
    setTimeout(() => {
      setIsIntercomBroadcasting(null);
    }, 4000);
  };

  const handleDispatchVoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intercomText.trim()) return;
    setIntercomLogs(prev => [
      `[${new Date().toLocaleTimeString().slice(0, 5)}] Audio Intercom dispatch: "${intercomText}" sent to all active Wearables.`,
      ...prev
    ]);
    setIntercomText("");
  };

  const handleDispatchEmergencySms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyBroadcastText.trim()) return;
    setEmergencyLogs(prev => [
      `[${new Date().toLocaleTimeString().slice(0, 5)}] Emergency SMS Dispatch: "${emergencyBroadcastText}" sent to all on-site cellphones.`,
      ...prev
    ]);
    setEmergencyBroadcastText("");
  };

  const handleTriggerEmergency = () => {
    setIsEmergencyActive(true);
    setEmergencyLogs(prev => [
      `[${new Date().toLocaleTimeString().slice(0, 5)}] CRITICAL SITE EMERGENCY ACTIVATED. Site evacuation horns triggered.`,
      `[${new Date().toLocaleTimeString().slice(0, 5)}] Live muster tracking activated. Evacuation pathway lights set to ACTIVE.`,
      ...prev
    ]);
  };

  const handleClearEmergency = () => {
    setIsEmergencyActive(false);
    setMusterCount({ present: 48, missing: 4 });
    setEmergencyLogs(prev => [
      `[${new Date().toLocaleTimeString().slice(0, 5)}] Emergency state cleared. Safety metrics returning to nominal levels.`,
      ...prev
    ]);
  };

  const handleMusterWorker = (worker: string) => {
    if (musterCount.missing > 0) {
      setMusterCount(prev => ({
        present: prev.present + 1,
        missing: prev.missing - 1
      }));
      setEmergencyLogs(prev => [
        `[${new Date().toLocaleTimeString().slice(0, 5)}] Muster scan: ${worker} marked SECURE at Muster Point Alpha.`,
        ...prev
      ]);
    }
  };

  // Enterprise Safety Sub-tab navigation list
  const menuItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: Shield, desc: "Executive HSE KPI matrix" },
    { id: "live-patrol" as const, label: "Live Patrol", icon: Cpu, desc: "Interactive AI CV patrol streams" },
    { id: "camera-network" as const, label: "Camera Network", icon: Video, desc: "Live site CCTV streams & logs" },
    { id: "drone-monitoring" as const, label: "Drone Monitoring", icon: Plane, desc: "Autonomous aerial site sweeps" },
    { id: "wearable-cameras" as const, label: "Wearable Cameras", icon: Eye, desc: "Supervisor body-cam streams" },
    { id: "violations" as const, label: "Safety Violations", icon: AlertOctagon, desc: "Active hazards & critical alerts" },
    { id: "near-misses" as const, label: "Near Misses", icon: Activity, desc: "Preventative action register" },
    { id: "incident-reports" as const, label: "Incident Reports", icon: FileText, desc: "CAPA documentation ledger" },
    { id: "analytics" as const, label: "Safety Analytics", icon: BarChart3, desc: "HSE time-series & trends" },
    { id: "heatmap" as const, label: "Risk Heatmap", icon: Map, desc: "3D digital twin hazard density" },
    { id: "ppe-compliance" as const, label: "PPE Compliance", icon: ShieldCheck, desc: "Attire wearing accuracy ratios" },
    { id: "emergency" as const, label: "Emergency Response", icon: Flame, desc: "Evacuation control room console" },
    { id: "audit-reports" as const, label: "Audit Reports", icon: ClipboardCheck, desc: "ISO 45001 signoff ledgers" },
    { id: "settings" as const, label: "Settings", icon: Settings, desc: "AI sensitivity & SMS alert sync" }
  ];

  const renderActiveTab = () => {
    switch (localTab) {
      case "dashboard":
        return <SafetyDashboardTab />;
      case "live-patrol":
        return <SafetyPatrolSimulator />;
      case "camera-network":
        return <VideoReviewTab />;
      case "violations":
        return <HazardsTab />;
      case "near-misses":
        return <NearMissesTab />;
      case "incident-reports":
        return <IncidentsTab />;
      case "analytics":
        return <PPEAnalyticsTab />;
      case "heatmap":
        return <SafetyHeatmapTab />;
      case "audit-reports":
        return <SafetyAuditsTab />;

      case "drone-monitoring":
        return (
          <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-900 p-6 flex flex-col gap-6 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
              <div>
                <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Plane className="w-5 h-5 text-indigo-400" />
                  Autonomous Drone Monitoring Stream
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time aerial LiDAR sweeps and thermal heat scanning of site structures.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isDroneFlying ? "bg-indigo-500 animate-pulse" : "bg-slate-500"}`} />
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  {isDroneFlying ? "STREAM ACTIVE" : "DRONE DOCKED"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Drone Camera Viewport */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="relative h-[280px] md:h-[380px] rounded-2xl bg-slate-950 border border-slate-900 overflow-hidden shadow-inner flex flex-col justify-between p-4 group">
                  {/* Camera Live Feeds image */}
                  <img 
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80" 
                    alt="Drone Feed"
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isDroneFlying ? "brightness-75" : "brightness-20 filter blur-xs"}`}
                    referrerPolicy="no-referrer"
                  />

                  {/* Drone Horizon HUD Overlay */}
                  {isDroneFlying && (
                    <div className="absolute inset-0 pointer-events-none border border-indigo-500/20 flex items-center justify-center">
                      {/* Compass dial */}
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 text-white font-mono text-[10px] bg-slate-950/80 border border-slate-900 px-3 py-1 rounded-full flex items-center gap-1">
                        <span>HDG:</span>
                        <span className="font-bold text-indigo-400">284° WNW</span>
                      </div>

                      {/* Pitch scale lines */}
                      <div className="w-48 h-0.5 bg-indigo-500/30 relative">
                        <div className="absolute left-0 -top-4 w-4 h-0.5 bg-indigo-500/30" />
                        <div className="absolute right-0 -top-4 w-4 h-0.5 bg-indigo-500/30" />
                        <div className="absolute left-0 top-4 w-4 h-0.5 bg-indigo-500/30" />
                        <div className="absolute right-0 top-4 w-4 h-0.5 bg-indigo-500/30" />
                      </div>
                    </div>
                  )}

                  {!isDroneFlying && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-black/60">
                      <Plane className="w-12 h-12 text-slate-500 mb-2 animate-bounce" />
                      <span className="text-xs font-mono font-bold text-slate-400">DRONE IS CURRENTLY DOCKED</span>
                      <span className="text-[10px] text-slate-500 max-w-xs mt-1">Click the Deploy button below to initialize the autonomous flight path sweep.</span>
                    </div>
                  )}

                  {/* HUD Info top row */}
                  <div className="relative z-10 flex justify-between font-mono text-[9px] text-white">
                    <div className="bg-slate-950/80 border border-slate-900 p-2 rounded-xl flex flex-col gap-0.5">
                      <span className="text-slate-500">ALTITUDE:</span>
                      <span className="font-bold text-indigo-400 text-xs">{droneAlt}m</span>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-900 p-2 rounded-xl flex flex-col gap-0.5">
                      <span className="text-slate-500">BATTERY:</span>
                      <span className={`font-bold text-xs ${droneBat < 30 ? "text-red-500" : "text-emerald-400"}`}>{droneBat}%</span>
                    </div>
                  </div>

                  {/* Bottom HUD bar */}
                  <div className="relative z-10 flex justify-between items-center font-mono text-[8px] text-slate-400 bg-slate-950/90 border border-slate-900 p-2.5 rounded-xl">
                    <span>GPS LOCK: 12.9716° N, 77.5946° E</span>
                    <span>FLIGHT TIME: 14m 22s</span>
                    <span>TX: LTE PRIORITY CELL</span>
                  </div>
                </div>

                {/* Drone action controllers */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={handleLaunchDrone}
                    disabled={isDroneFlying}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isDroneFlying 
                        ? "bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed" 
                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                    }`}
                  >
                    <Plane className="w-4 h-4" />
                    <span>LAUNCH FLIGHT</span>
                  </button>

                  <button
                    onClick={handleRecallDrone}
                    disabled={!isDroneFlying}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      !isDroneFlying 
                        ? "bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed" 
                        : "bg-red-600 hover:bg-red-500 text-white"
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>RECALL TO PAD</span>
                  </button>

                  <button
                    onClick={handleTriggerDroneScanner}
                    disabled={!isDroneFlying}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                      !isDroneFlying 
                        ? "bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed" 
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-indigo-400"
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>SITE SCAN</span>
                  </button>
                </div>
              </div>

              {/* Drone telemetry logs & path specs */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex-1 flex flex-col justify-between h-[250px]">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block tracking-wider mb-2">FLIGHT LOG TELEMETRY</span>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin text-[10.5px] font-mono leading-relaxed">
                      {droneLogs.map((log, idx) => (
                        <div key={idx} className="p-1.5 bg-slate-950/60 border border-slate-900/60 rounded text-slate-350">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-indigo-950/15 border border-indigo-900/40 p-3 rounded-xl text-[10px] text-indigo-400 leading-normal font-mono">
                    <span className="font-bold block mb-1">AUTO WIND SAFETY BRAKE</span>
                    <span>Drones automatically initiate returning pad dock if local wind gust meter matches {windRecallThreshold} km/h.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "wearable-cameras":
        return (
          <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-900 p-6 flex flex-col gap-6 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
              <div>
                <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-400" />
                  Site-Supervisor BodyCam Network
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Live audio intercom links to safety wardens, engineers, and superintendents.</p>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase">
                3 DEVICES CONNECTED
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* BodyCam stream cards list */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Warden Card 1 */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden p-4 flex flex-col justify-between gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <span className="text-xs font-bold text-white block">Device ID: BC-01</span>
                        <span className="text-[10px] text-slate-400 block font-mono">Warden: Rajesh Kumar</span>
                      </div>
                    </div>
                    <div className="flex gap-2 text-[10px] font-mono">
                      <span className="flex items-center gap-0.5 text-emerald-400"><Signal className="w-3.5 h-3.5" /> 98%</span>
                      <span className="flex items-center gap-0.5 text-slate-400"><Battery className="w-3.5 h-3.5" /> 84%</span>
                    </div>
                  </div>

                  {/* BodyCam stream visual mock */}
                  <div className="relative h-44 rounded-xl bg-slate-950 border border-slate-900 overflow-hidden flex flex-col justify-between p-3">
                    <img 
                      src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80" 
                      alt="Rajesh Camera" 
                      className="absolute inset-0 w-full h-full object-cover brightness-65"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-10 flex justify-between font-mono text-[8px] text-slate-400 bg-black/40 p-1.5 rounded">
                      <span>LOCATION: BLOCK B LABS</span>
                      <span>FPS: 30</span>
                    </div>
                    {isIntercomBroadcasting === "Rajesh" && (
                      <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center animate-pulse p-4">
                        <span className="text-white text-xs font-mono font-bold uppercase tracking-wider text-center">Intercom Broadcoast: Live</span>
                      </div>
                    )}
                    <span className="relative z-10 self-start text-[8px] font-mono bg-emerald-500 text-slate-950 px-1 py-0.2 rounded font-black">
                      CAM REC • ACTIVE
                    </span>
                  </div>

                  <button
                    onClick={() => handlePingIntercom("Rajesh")}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-white text-xs font-extrabold rounded-lg transition uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ping Voice Intercom</span>
                  </button>
                </div>

                {/* Warden Card 2 */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden p-4 flex flex-col justify-between gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <span className="text-xs font-bold text-white block">Device ID: BC-02</span>
                        <span className="text-[10px] text-slate-400 block font-mono">Supervisor: Priya Nair</span>
                      </div>
                    </div>
                    <div className="flex gap-2 text-[10px] font-mono">
                      <span className="flex items-center gap-0.5 text-amber-400"><Signal className="w-3.5 h-3.5" /> 74%</span>
                      <span className="flex items-center gap-0.5 text-emerald-400"><Battery className="w-3.5 h-3.5" /> 92%</span>
                    </div>
                  </div>

                  {/* BodyCam stream visual mock */}
                  <div className="relative h-44 rounded-xl bg-slate-950 border border-slate-900 overflow-hidden flex flex-col justify-between p-3">
                    <img 
                      src="https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=600&q=80" 
                      alt="Priya Camera" 
                      className="absolute inset-0 w-full h-full object-cover brightness-65"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-10 flex justify-between font-mono text-[8px] text-slate-400 bg-black/40 p-1.5 rounded">
                      <span>LOCATION: CORRIDOR L2</span>
                      <span>FPS: 30</span>
                    </div>
                    {isIntercomBroadcasting === "Priya" && (
                      <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center animate-pulse p-4">
                        <span className="text-white text-xs font-mono font-bold uppercase tracking-wider text-center">Intercom Broadcoast: Live</span>
                      </div>
                    )}
                    <span className="relative z-10 self-start text-[8px] font-mono bg-emerald-500 text-slate-950 px-1 py-0.2 rounded font-black">
                      CAM REC • ACTIVE
                    </span>
                  </div>

                  <button
                    onClick={() => handlePingIntercom("Priya")}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-white text-xs font-extrabold rounded-lg transition uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ping Voice Intercom</span>
                  </button>
                </div>

              </div>

              {/* Intercom command and LTE logging center */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex-1 flex flex-col justify-between h-[300px]">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block tracking-wider mb-2">LTE NETWORK DIALOGUE</span>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin text-[10.5px] font-mono leading-relaxed">
                      {intercomLogs.map((log, idx) => (
                        <div key={idx} className="p-1.5 bg-slate-950/60 border border-slate-900/60 rounded text-slate-350">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Intercom Voice Dispatcher Form */}
                  <form onSubmit={handleDispatchVoice} className="flex flex-col gap-2 pt-3 border-t border-slate-900 mt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">SOP BROADCAST INTERCOM</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type urgent site safety warning..."
                        value={intercomText}
                        onChange={(e) => setIntercomText(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500/50 font-mono"
                      />
                      <button 
                        type="submit"
                        className="p-1.5 rounded-lg bg-[#daff00] hover:bg-[#b0cc00] text-slate-950 transition cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );

      case "ppe-compliance":
        return (
          <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-900 p-6 flex flex-col gap-6 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
              <div>
                <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  AI PPE Compliance Optimizer
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure deep learning inference threshold rates to filter false-positives.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Slider tuner (8 Columns) */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-white block">YOLOv11 Inference Score Threshold</span>
                    <span className="text-[10px] text-slate-400 block">Calibrate computer vision minimum matching accuracy</span>
                  </div>
                  <span className="text-lg font-black font-mono text-[#daff00]">{confidenceSlider}%</span>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <span className="text-[10px] font-mono text-slate-500">50% SPEED</span>
                  <input 
                    type="range" 
                    min="50" 
                    max="100" 
                    value={confidenceSlider}
                    onChange={(e) => setConfidenceSlider(Number(e.target.value))}
                    className="flex-1 accent-[#daff00] cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-slate-500">100% QUALITY</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">Computed Flase-Positives / Hr</span>
                    <span className="text-lg font-black font-mono text-white mt-1 block">{computedFalsePositives}</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl">
                    <span className="text-[9px] text-slate-500 font-mono block uppercase">Average Frame Analysis Latency</span>
                    <span className="text-lg font-black font-mono text-emerald-400 mt-1 block">8.4ms</span>
                  </div>
                </div>

                {/* PPE Compliance metrics charts */}
                <div className="h-[210px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { day: "Mon", Helmets: 94, Vests: 98, Harness: 90 },
                        { day: "Tue", Helmets: 95, Vests: 99, Harness: 92 },
                        { day: "Wed", Helmets: 92, Vests: 96, Harness: 88 },
                        { day: "Thu", Helmets: 96, Vests: 98, Harness: 93 },
                        { day: "Fri", Helmets: 97, Vests: 99, Harness: 95 },
                        { day: "Sat", Helmets: 98, Vests: 99, Harness: 96 },
                        { day: "Sun", Helmets: 98, Vests: 100, Harness: 97 }
                      ]}
                      margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={9} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} domain={[80, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: "#0b0e14", border: "1px solid rgba(255,255,255,0.1)" }} />
                      <Legend verticalAlign="top" height={32} iconSize={10} style={{ fontSize: "10px" }} />
                      <Line type="monotone" dataKey="Helmets" stroke="#10b981" strokeWidth={2} name="Helmets Compliance %" />
                      <Line type="monotone" dataKey="Vests" stroke="#3b82f6" strokeWidth={2} name="High-Vis Vests %" />
                      <Line type="monotone" dataKey="Harness" stroke="#f59e0b" strokeWidth={2} name="Harness Attach %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Worker lists and overrides (4 Columns) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex-1 flex flex-col gap-3">
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block">RECENT DETECT ACTIONS</span>
                  
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin text-[11px]">
                    <div className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-[9px] text-slate-500">
                        <span>BC-01 WARDEN</span>
                        <span className="text-emerald-400 font-bold">SOLVED</span>
                      </div>
                      <span className="text-white font-bold">Amit Sen (Drywall)</span>
                      <span className="text-slate-400">Wearing helmet - Approved after audio warning dispatch.</span>
                    </div>

                    <div className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-[9px] text-slate-500">
                        <span>CCTV TOWER 4</span>
                        <span className="text-amber-400 font-bold">EXEMPT</span>
                      </div>
                      <span className="text-white font-bold">Rajan Dev (MEP Welder)</span>
                      <span className="text-slate-400">Welding mask used instead of standard helmet - Approved clearance.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "emergency":
        return (
          <div className="bg-slate-950 text-slate-100 rounded-3xl border border-red-950 p-6 flex flex-col gap-6 font-sans">
            
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 ${isEmergencyActive ? "border-red-900" : "border-slate-900"}`}>
              <div>
                <h3 className="text-base md:text-lg font-black uppercase tracking-tight flex items-center gap-2 text-red-500">
                  <Flame className="w-5 h-5 animate-pulse" />
                  Site Emergency Control Room
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Dispatch site-wide sirens, broadcast SMS evacuations, and monitor muster progress.</p>
              </div>

              {isEmergencyActive ? (
                <span className="px-3 py-1 bg-red-600 text-white font-mono font-black text-xs rounded-full border border-red-500 animate-pulse tracking-widest uppercase">
                  🚨 SIRENS &amp; EVACUATION ACTIVE
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-900 text-slate-400 font-mono text-xs rounded-full border border-slate-800 uppercase font-bold">
                  System Nominal
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Evac controllers and muster dials (8 Columns) */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                
                {/* Emergency Trigger Actuator Panel */}
                <div className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-center gap-4 ${
                  isEmergencyActive 
                    ? "bg-red-950/20 border-red-800" 
                    : "bg-slate-900/40 border-slate-850"
                }`}>
                  <div className="text-center md:text-left">
                    <span className="text-xs font-black uppercase font-mono block text-red-500 tracking-wider">
                      CRITICAL EVACUATION ALARM
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-md leading-relaxed">
                      Actuating this command triggers the site-wide vocal speaker sirens, dispatches alert logs to local firefighting teams, and starts active worker geofence tracking.
                    </p>
                  </div>

                  {isEmergencyActive ? (
                    <button
                      onClick={handleClearEmergency}
                      className="py-3 px-6 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-white font-black text-xs rounded-xl transition uppercase cursor-pointer shrink-0 shadow-lg"
                    >
                      CLEAR EMERGENCY ALARMS
                    </button>
                  ) : (
                    <button
                      onClick={handleTriggerEmergency}
                      className="py-4 px-6 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl transition uppercase cursor-pointer shrink-0 shadow-lg shadow-red-500/10 animate-pulse"
                    >
                      TRIGGER EMERGENCY SIRENS
                    </button>
                  )}
                </div>

                {/* Muster Point Tracking Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Muster Point A */}
                  <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white uppercase font-mono">Muster Point Alpha</span>
                      <span className="text-[10px] bg-indigo-950/40 text-indigo-400 px-2 py-0.2 rounded font-mono font-bold">Wing A Main Gate</span>
                    </div>

                    <div className="flex items-baseline gap-2 py-1">
                      <span className="text-3xl font-black font-mono text-white">{isEmergencyActive ? musterCount.present : 0}</span>
                      <span className="text-xs font-mono text-slate-400">/ {isEmergencyActive ? (musterCount.present + musterCount.missing) : 0} present</span>
                    </div>

                    {isEmergencyActive && musterCount.missing > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-red-400 font-mono uppercase block font-bold mb-1">Muster Pending Operators:</span>
                        <div className="flex flex-wrap gap-1">
                          <button 
                            onClick={() => handleMusterWorker("Amit Sen")}
                            className="bg-red-950/40 border border-red-900 hover:bg-red-900/40 px-2 py-0.5 rounded text-[8px] font-mono text-red-300 uppercase cursor-pointer"
                          >
                            Mark Amit S. safe
                          </button>
                          <button 
                            onClick={() => handleMusterWorker("Rajan Dev")}
                            className="bg-red-950/40 border border-red-900 hover:bg-red-900/40 px-2 py-0.5 rounded text-[8px] font-mono text-red-300 uppercase cursor-pointer"
                          >
                            Mark Rajan D. safe
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Incident Checklist */}
                  <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between gap-2 text-[11px]">
                    <span className="text-xs font-bold text-white uppercase font-mono border-b border-slate-900 pb-1.5 mb-1">HSE Evacuation Tasklist</span>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={isEmergencyActive} readOnly className="accent-red-500" />
                      <span className={isEmergencyActive ? "text-slate-300 line-through" : "text-slate-400"}>Engage audio sirens</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={isEmergencyActive} readOnly className="accent-red-500" />
                      <span className={isEmergencyActive ? "text-slate-300 line-through" : "text-slate-400"}>Dispatch SMS broadcast warnings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={isEmergencyActive && musterCount.missing === 0} readOnly className="accent-red-500" />
                      <span className={(isEmergencyActive && musterCount.missing === 0) ? "text-slate-300 line-through" : "text-slate-400"}>Account for 100% headcount</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Telemetry log & urgent dispatch input (4 Columns) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex-1 flex flex-col justify-between h-[300px]">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block tracking-wider mb-2">EVACUATION TRAIL LOGS</span>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin text-[10.5px] font-mono leading-relaxed">
                      {emergencyLogs.map((log, idx) => (
                        <div key={idx} className="p-1.5 bg-slate-950/60 border border-slate-900/60 rounded text-slate-350">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SMS dispatch */}
                  <form onSubmit={handleDispatchEmergencySms} className="flex flex-col gap-2 pt-3 border-t border-slate-900 mt-2">
                    <span className="text-[10px] text-red-400 font-bold uppercase font-mono">SITE CELL-NETWORK SMS DISPATCH</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type urgent SMS evacuation message..."
                        value={emergencyBroadcastText}
                        onChange={(e) => setEmergencyBroadcastText(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-red-500/50 font-mono"
                      />
                      <button 
                        type="submit"
                        className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>
        );

      case "settings":
        return (
          <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-900 p-6 flex flex-col gap-6 font-sans">
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <div>
                <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  HSE Computer Vision Settings
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure alert protocols, geofencing coordinates, and model detection parameters.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form settings sliders/toggles (8 Columns) */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-850 p-5 rounded-2xl flex flex-col gap-6">
                
                {/* 1. Sensitivity Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-white font-bold uppercase">AI Object Recognition Sensitivity</span>
                    <span className="text-[#daff00] font-black">{aiDetectionSensitivity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="95" 
                    value={aiDetectionSensitivity}
                    onChange={(e) => setAiDetectionSensitivity(Number(e.target.value))}
                    className="accent-[#daff00] cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400">Controls confidence score floor required to trigger automatic CAPA tickets.</span>
                </div>

                {/* 2. Wind Safety Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-white font-bold uppercase">Drone Autopilot Wind Recall Threshold</span>
                    <span className="text-indigo-400 font-black">{windRecallThreshold} km/h</span>
                  </div>
                  <input 
                    type="range" 
                    min="25" 
                    max="55" 
                    value={windRecallThreshold}
                    onChange={(e) => setWindRecallThreshold(Number(e.target.value))}
                    className="accent-indigo-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400">Drones will automatically land at Charging Pad Alpha if local gusts exceed this setting.</span>
                </div>

                {/* 3. Notification and Siren Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-4">
                  
                  {/* SMS toggle */}
                  <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-900 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block">Auto-SMS Alert Dispatch</span>
                      <span className="text-[9px] text-slate-400 block font-mono">OSHA alert to subcontractor leads</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoSmsNotify(!autoSmsNotify)}
                      className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                        autoSmsNotify 
                          ? "bg-emerald-500 text-slate-950" 
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {autoSmsNotify ? "ENABLED" : "MUTED"}
                    </button>
                  </div>

                  {/* Siren toggle */}
                  <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-900 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block">Site Audio Intercom Siren</span>
                      <span className="text-[9px] text-slate-400 block font-mono">Vocal warning siren on critical hazard</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSirenOnAlert(!sirenOnAlert)}
                      className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                        sirenOnAlert 
                          ? "bg-emerald-500 text-slate-950" 
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {sirenOnAlert ? "ACTIVE" : "DISABLED"}
                    </button>
                  </div>

                </div>

                {/* Confirmation Save Info */}
                <div className="bg-emerald-950/15 border border-emerald-900/40 p-3.5 rounded-xl flex items-start gap-2 text-[10.5px] text-emerald-400 leading-normal font-mono">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Config settings successfully written to local cache. Live AI pipelines (YOLO/VGG) are reflecting calibration settings instantly.</span>
                </div>

              </div>

              {/* Connections list (4 Columns) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex-1 flex flex-col justify-between h-[250px]">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block mb-2">DVR SYSTEM INTEGRATIONS</span>
                    
                    <div className="flex flex-col gap-2 text-[11px]">
                      <div className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg flex justify-between items-center">
                        <div>
                          <span className="text-white font-bold block">Hikvision DVR-HUB 12</span>
                          <span className="text-[9px] text-slate-400 font-mono block">12 Cameras • ONVIF Prof S</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-emerald-400">CONNECTED</span>
                      </div>

                      <div className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg flex justify-between items-center">
                        <div>
                          <span className="text-white font-bold block">Dahua AirDrone Sync</span>
                          <span className="text-[9px] text-slate-400 font-mono block">Muster 300 RTK Link</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-emerald-400">SYNCED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 lg:px-6 py-6 font-sans text-slate-700" id="safety-intelligence-view-root">
      
      {/* Enterprise Title Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-150 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
              TracProgress® Safety OS
            </span>
            <span className="text-slate-350 text-[10px] font-mono">• HSE STANDARD INTEGRATION</span>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1 uppercase flex items-center gap-2">
            Enterprise Safety Intelligence Platform
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time computer vision inference engine for site-wide PPE compliance, hazard coordinates tracking, and automated ISO auditing.
          </p>
        </div>

        {/* AI Camera Status Watermark */}
        <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center gap-2.5 shadow-md">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>

          <div className="font-mono text-[10px] leading-tight text-slate-200">
            <span className="font-bold uppercase block text-[#daff00]">AI CORE INFERENCE</span>
            <span className="text-slate-400">4 Active streams online</span>
          </div>
        </div>
      </div>

      {/* Main Inner Layout with Left Sidebar Menu Selection for all 14 Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Tab bar Directory selection (3 Columns) */}
        <div className="lg:col-span-3 flex flex-col gap-1.5 bg-slate-50 border border-slate-150 p-2 rounded-2xl max-h-[750px] overflow-y-auto scrollbar-thin">
          <span className="text-[9px] font-mono text-slate-400 uppercase font-black tracking-widest px-2.5 py-1 block">
            HSE Module Nav directory
          </span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = localTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setLocalTab(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                  isSelected 
                    ? "bg-slate-900 text-white shadow-xs font-bold" 
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                }`}
                aria-current={isSelected ? "page" : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#daff00]" : "text-slate-400"}`} />
                <div className="flex-1 min-w-0">
                  <span className="block font-bold uppercase tracking-tight text-[10.5px] truncate">{item.label}</span>
                  <span className={`text-[8.5px] block font-medium truncate ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                    {item.desc}
                  </span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-40 shrink-0 ${isSelected ? "text-[#daff00]" : "text-slate-500"}`} />
              </button>
            );
          })}
        </div>

        {/* Right Side Content Container Box (9 Columns) */}
        <div className="lg:col-span-9 w-full min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={localTab}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
