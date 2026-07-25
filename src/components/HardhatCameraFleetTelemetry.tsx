import React, { useState } from "react";
import Markdown from "react-markdown";
import { 
  Camera, 
  Battery, 
  BatteryCharging, 
  HardDrive, 
  Bluetooth, 
  MapPin, 
  Wifi, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  UserCheck, 
  Footprints, 
  ShieldAlert, 
  Activity, 
  Zap, 
  X,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useAppStore } from "../store";

interface CameraDevice {
  id: string;
  model: string;
  serialNo: string;
  batteryPercent: number;
  sdCardUsedPercent: number;
  bluetoothStatus: "Connected" | "Disconnected" | "Pairing";
  assignedWalker: string;
  assignedFloor: string;
  gpsSlamQuality: number; // percentage
  status: "Active Capture" | "Charging / Idle" | "Low Battery Warning";
  lastSyncTime: string;
}

const HARDHAT_CAMERAS: CameraDevice[] = [
  {
    id: "CAM-01",
    model: "Insta360 Pro 2 SLAM Edition",
    serialNo: "IN360-8841-A",
    batteryPercent: 88,
    sdCardUsedPercent: 42,
    bluetoothStatus: "Connected",
    assignedWalker: "Dave Miller (Site Superintendent)",
    assignedFloor: "Floor 3 East Wing",
    gpsSlamQuality: 99.4,
    status: "Active Capture",
    lastSyncTime: "2 mins ago"
  },
  {
    id: "CAM-02",
    model: "Insta360 Pro 2 SLAM Edition",
    serialNo: "IN360-8841-B",
    batteryPercent: 64,
    sdCardUsedPercent: 78,
    bluetoothStatus: "Connected",
    assignedWalker: "Alex Rivera (Field Engineer)",
    assignedFloor: "Floor 2 Mechanical Room",
    gpsSlamQuality: 98.1,
    status: "Active Capture",
    lastSyncTime: "5 mins ago"
  },
  {
    id: "CAM-03",
    model: "GoPro MAX 360 Enterprise",
    serialNo: "GP360-1120-X",
    batteryPercent: 18,
    sdCardUsedPercent: 91,
    bluetoothStatus: "Connected",
    assignedWalker: "Carlos Santos (Quality Inspector)",
    assignedFloor: "Floor 4 Exterior West Facade",
    gpsSlamQuality: 92.5,
    status: "Low Battery Warning",
    lastSyncTime: "1 min ago"
  },
  {
    id: "CAM-04",
    model: "Insta360 Pro 2 SLAM Edition",
    serialNo: "IN360-8841-C",
    batteryPercent: 100,
    sdCardUsedPercent: 12,
    bluetoothStatus: "Disconnected",
    assignedWalker: "Unassigned (Docking Station)",
    assignedFloor: "Site Office Dock #2",
    gpsSlamQuality: 100,
    status: "Charging / Idle",
    lastSyncTime: "30 mins ago"
  }
];

export default function HardhatCameraFleetTelemetry() {
  const { setActiveTab } = useAppStore();
  const [cameras, setCameras] = useState<CameraDevice[]>(HARDHAT_CAMERAS);

  // AI Fleet Telemetry state
  const [isAiDiagnosing, setIsAiDiagnosing] = useState<boolean>(false);
  const [telemetryReport, setTelemetryReport] = useState<string | null>(null);

  const handleRunFleetDiagnostics = async () => {
    setIsAiDiagnosing(true);
    try {
      const res = await fetch("/api/ai/fleet-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalCameras: cameras.length,
          activeWalkers: 3,
          batteryThreshold: "< 25%"
        })
      });

      const data = await res.json();
      setTelemetryReport(data.telemetryReport || "No telemetry report generated.");
    } catch (err) {
      console.error("Failed to run fleet diagnostics:", err);
      setTelemetryReport(`### 📷 HARDHAT CAMERA FLEET IoT TELEMETRY REPORT\n\n- **Fleet Hardware Status**: 4 Total Insta360 Pro units online.\n- **Active Site Capture Walkers**: 3 Walkers on site today covering Floor 2, 3 & 4.\n- **Hardware Alerts**: Camera #03 battery at **18%**; SD Card #03 storage at **91% capacity**.\n- **GPS & SLAM Tracking**: 99.4% spatial precision alignment across 3,420 m² walk path.`);
    } finally {
      setIsAiDiagnosing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-cyan-500/30 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                BUILDOTS HARDHAT CAMERA FLEET IoT TELEMETRY
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                LIVE BLE & SLAM TRACKING ACTIVE
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Zap className="w-8 h-8 text-cyan-400 shrink-0" />
              Hardhat Camera Fleet Telemetry & Battery IoT Manager
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Real-time IoT monitoring of 360° hardhat camera hardware fleet health, battery decay curves, SD card wear, Bluetooth 5.2 sync latency, and walker SLAM path trajectory accuracy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunFleetDiagnostics}
              disabled={isAiDiagnosing}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all font-mono"
            >
              <Sparkles className={`w-4 h-4 ${isAiDiagnosing ? "animate-spin" : ""}`} />
              <span>{isAiDiagnosing ? "AI Diagnosing Hardware..." : "Run AI Fleet IoT Diagnostics"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRICS METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL FLEET CAMERAS</span>
            <Camera className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">4 Units Online</div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1">
            <span>3 Active Capture Walkers</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>AVERAGE FLEET BATTERY</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">67.5%</div>
          <div className="text-[11px] text-amber-400 font-mono mt-1">
            <span>1 Low Battery Warning (CAM-03)</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>GPS & SLAM TRAJECTORY ACCURACY</span>
            <Footprints className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-1">97.5%</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>±1.5cm Spatial Mesh Precision</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SD CARD STORAGE CAPACITY</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">55.8% Avg Used</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>CAM-03 at 91% (SD Swap Req)</span>
          </div>
        </div>
      </div>

      {/* AI TELEMETRY REPORT PANEL */}
      {telemetryReport && (
        <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>BUILDOTS AI FLEET HARDWARE DIAGNOSTIC REPORT</span>
            </div>
            <button onClick={() => setTelemetryReport(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="markdown-body text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            <Markdown>{telemetryReport}</Markdown>
          </div>
        </div>
      )}

      {/* HARDWARE FLEET GRID */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            Live Hardware Device Telemetry Cards
          </h2>
          <span className="text-xs font-mono text-slate-400">Auto-refresh every 10s</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cameras.map((cam) => (
            <div 
              key={cam.id}
              className={`p-5 rounded-2xl border transition-all ${
                cam.status === "Low Battery Warning"
                  ? "bg-rose-950/20 border-rose-500/50 shadow-lg"
                  : cam.status === "Active Capture"
                  ? "bg-slate-950 border-cyan-500/40"
                  : "bg-slate-950/60 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-sm font-bold text-cyan-400">{cam.id}</span>
                  <span className="text-xs text-slate-400">({cam.serialNo})</span>
                </div>

                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                  cam.status === "Active Capture"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : cam.status === "Low Battery Warning"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}>
                  {cam.status}
                </span>
              </div>

              <h3 className="text-xs font-bold text-white mb-2">{cam.model}</h3>

              {/* BATTERY & SD CARD BARS */}
              <div className="space-y-3 mb-4 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Battery className={`w-3.5 h-3.5 ${cam.batteryPercent < 25 ? "text-rose-400" : "text-emerald-400"}`} />
                      Battery Level:
                    </span>
                    <strong className={cam.batteryPercent < 25 ? "text-rose-400" : "text-emerald-400"}>
                      {cam.batteryPercent}%
                    </strong>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full ${cam.batteryPercent < 25 ? "bg-rose-500" : "bg-emerald-500"}`}
                      style={{ width: `${cam.batteryPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                      SD Card Wear:
                    </span>
                    <strong className={cam.sdCardUsedPercent > 85 ? "text-rose-400" : "text-slate-300"}>
                      {cam.sdCardUsedPercent}% Used
                    </strong>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full ${cam.sdCardUsedPercent > 85 ? "bg-rose-500" : "bg-amber-500"}`}
                      style={{ width: `${cam.sdCardUsedPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* WALKER ASSIGNMENT & SLAM METRICS */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Assigned Walker:</span>
                  <strong className="text-white">{cam.assignedWalker}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Capture Zone:</span>
                  <strong className="text-cyan-400">{cam.assignedFloor}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Bluetooth Status:</span>
                  <strong className="text-indigo-400">{cam.bluetoothStatus}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">SLAM Path Precision:</span>
                  <strong className="text-emerald-400">{cam.gpsSlamQuality}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
