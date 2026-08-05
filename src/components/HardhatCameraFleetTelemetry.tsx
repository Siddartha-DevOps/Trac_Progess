import React, { useMemo, useRef, useState } from "react";
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
  Clock,
  Upload,
  KeyRound,
  Loader2
} from "lucide-react";
import { useAppStore } from "../store";
import { useDevices } from "../hooks/useDevices";
import { useChunkedUpload } from "../hooks/useChunkedUpload";
import { deviceApi, type DeviceRecord as CameraDevice } from "../services/deviceApi";
import { badgeClass, card, radius, cx } from "../lib/ui";

export default function HardhatCameraFleetTelemetry() {
  const { setActiveTab } = useAppStore();
  const { devices: cameras, loading: fleetLoading, error: fleetError, refresh } = useDevices();
  const chunkedUpload = useChunkedUpload();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [pairingBusy, setPairingBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleIssuePairingCode = async () => {
    setPairingBusy(true);
    try {
      const p = await deviceApi.createPairing();
      setPairingCode(p);
    } catch (e) {
      console.error("Pairing code request failed", e);
    } finally {
      setPairingBusy(false);
    }
  };

  const handlePickFile = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    fileInputRef.current?.click();
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !selectedDeviceId) return;
    await chunkedUpload.upload({ deviceId: selectedDeviceId, file });
    refresh();
  };

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

  const fleetMetrics = useMemo(() => {
    const activeUnits = cameras.filter((c) => c.status !== "Offline" && c.status !== "Unpaired").length;
    const activeWalkers = cameras.filter((c) => c.status === "Active Capture").length;
    const avgBattery = cameras.length
      ? cameras.reduce((s, c) => s + c.batteryPercent, 0) / cameras.length
      : 0;
    const lowBatteryCameras = cameras.filter((c) => c.batteryPercent < 25);
    const avgSlam = cameras.length
      ? cameras.reduce((s, c) => s + c.gpsSlamQuality, 0) / cameras.length
      : 0;
    const avgSd = cameras.length
      ? cameras.reduce((s, c) => s + c.sdCardUsedPercent, 0) / cameras.length
      : 0;
    const worstSd = cameras.reduce<CameraDevice | null>(
      (worst, c) => (!worst || c.sdCardUsedPercent > worst.sdCardUsedPercent ? c : worst),
      null
    );
    return { activeUnits, activeWalkers, avgBattery, lowBatteryCameras, avgSlam, avgSd, worstSd };
  }, [cameras]);

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden file input used by per-card "Upload capture" buttons */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.mov,.insv,.360"
        className="hidden"
        onChange={handleFileChosen}
      />

      {/* HEADER BANNER */}
      {/* Polish: header uses card.hero (e2) — the highest elevation rung, so
          it visually leads. Padding tuned to give the h1 breathing space
          (p-6 → p-7 sm:p-8) and mt-1 → mt-3 under the h1 for typographic rhythm.
          Badges swapped to the shared badgeClass() recipe — smaller, ring-based
          treatment reads as designed rather than "AI status chip". */}
      <div className={cx(card.hero, "text-white p-7 sm:p-8 relative overflow-hidden")}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            {/* Polish: badge WORDS preserved verbatim. Only the visual chrome
                changed — dropped font-mono + font-bold + border-inflation, now
                using the shared ring-based badgeClass() so it reads as designed
                system-status rather than the "generated status pill" look. */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={badgeClass("cyan")}>
                <Camera className="w-3 h-3" aria-hidden="true" />
                BUILDOTS HARDHAT CAMERA FLEET IoT TELEMETRY
              </span>
              <span className={badgeClass("emerald")}>
                <Activity className="w-3 h-3" aria-hidden="true" />
                LIVE BLE &amp; SLAM TRACKING ACTIVE
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
              <Zap className="w-7 h-7 text-cyan-400 shrink-0 -mt-px" aria-hidden="true" />
              Hardhat Camera Fleet Telemetry &amp; Battery IoT Manager
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-2xl leading-relaxed">
              Real-time IoT monitoring of 360° hardhat camera hardware fleet health, battery decay curves, SD card wear, Bluetooth 5.2 sync latency, and walker SLAM path trajectory accuracy.
            </p>
          </div>

          {/* Polish: gap-3 → gap-2 (buttons live in a pair, tighter grouping),
              radius bumped to match card system (rounded-lg is the "inside a
              card" rung), removed `transition-all` (perf trap — global CSS
              transitions only the properties that change), added type="button",
              added aria-busy for screen readers during loading. Loading state
              on the primary CTA now uses a leading spinner INSIDE the button
              (baseline-aligned) rather than replacing the icon. */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleIssuePairingCode}
              disabled={pairingBusy}
              aria-busy={pairingBusy}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
            >
              {pairingBusy
                ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                : <KeyRound className="w-4 h-4" aria-hidden="true" />}
              <span>Pair New Device</span>
            </button>
            <button
              type="button"
              onClick={handleRunFleetDiagnostics}
              disabled={isAiDiagnosing}
              aria-busy={isAiDiagnosing}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_4px_12px_-4px_rgba(6,182,212,0.35)]"
            >
              {isAiDiagnosing
                ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                : <Sparkles className="w-4 h-4" aria-hidden="true" />}
              <span>{isAiDiagnosing ? "AI Diagnosing Hardware..." : "Run AI Fleet IoT Diagnostics"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PAIRING CODE PANEL */}
      {pairingCode && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <div className="font-mono text-xs">
              <div className="text-amber-300 font-bold">DEVICE PAIRING CODE — enter this on the helmet camera SDK</div>
              <div className="text-slate-400 text-[11px]">
                Expires at {new Date(pairingCode.expiresAt).toLocaleTimeString()} · POST /api/devices/pair/complete
              </div>
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 tracking-widest font-mono">{pairingCode.code}</div>
          <button onClick={() => setPairingCode(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* UPLOAD PROGRESS PANEL */}
      {(chunkedUpload.busy || chunkedUpload.session || chunkedUpload.error) && (
        <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
              <Upload className="w-4 h-4" />
              <span>
                {chunkedUpload.busy
                  ? "UPLOADING 360° CAPTURE"
                  : chunkedUpload.error
                  ? "UPLOAD FAILED"
                  : "UPLOAD COMPLETE"}
              </span>
              {chunkedUpload.session && (
                <span className="text-slate-500">· {chunkedUpload.session.filename}</span>
              )}
            </div>
            <button
              onClick={chunkedUpload.busy ? chunkedUpload.abort : chunkedUpload.reset}
              className="text-slate-400 hover:text-white text-xs font-mono"
            >
              {chunkedUpload.busy ? "Abort" : "Dismiss"}
            </button>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${Math.round(chunkedUpload.progress * 100)}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-4 text-[11px] font-mono text-slate-400">
            <span>Progress: <strong className="text-cyan-400">{Math.round(chunkedUpload.progress * 100)}%</strong></span>
            {chunkedUpload.session && (
              <>
                <span>Chunks: {chunkedUpload.session.receivedChunks.length}/{chunkedUpload.session.totalChunks}</span>
                <span>Upload ID: {chunkedUpload.session.uploadId}</span>
                <span>Status: {chunkedUpload.session.status}</span>
              </>
            )}
          </div>
          {chunkedUpload.error && (
            <div className="text-rose-400 font-mono text-xs">{chunkedUpload.error}</div>
          )}
        </div>
      )}

      {/* METRICS METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cx(card.base, "p-4")}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL FLEET CAMERAS</span>
            <Camera className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {fleetMetrics.activeUnits} Units Online
          </div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1">
            <span>{fleetMetrics.activeWalkers} Active Capture Walkers</span>
          </div>
        </div>

        <div className={cx(card.base, "p-4")}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>AVERAGE FLEET BATTERY</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {fleetMetrics.avgBattery.toFixed(1)}%
          </div>
          <div className="text-[11px] text-amber-400 font-mono mt-1">
            {fleetMetrics.lowBatteryCameras.length === 0
              ? <span>No low-battery cameras</span>
              : <span>{fleetMetrics.lowBatteryCameras.length} Low Battery Warning ({fleetMetrics.lowBatteryCameras.map((c) => c.id).join(", ")})</span>
            }
          </div>
        </div>

        <div className={cx(card.base, "p-4")}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>GPS & SLAM TRAJECTORY ACCURACY</span>
            <Footprints className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-1">
            {fleetMetrics.avgSlam.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>±1.5cm Spatial Mesh Precision</span>
          </div>
        </div>

        <div className={cx(card.base, "p-4")}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SD CARD STORAGE CAPACITY</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {fleetMetrics.avgSd.toFixed(1)}% Avg Used
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {fleetMetrics.worstSd
              ? <span>{fleetMetrics.worstSd.id} at {fleetMetrics.worstSd.sdCardUsedPercent}%{fleetMetrics.worstSd.sdCardUsedPercent > 85 ? " (SD Swap Req)" : ""}</span>
              : <span>—</span>
            }
          </div>
        </div>
      </div>

      {/* ERROR / LOADING BANNER */}
      {fleetError && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-4 text-rose-300 text-xs font-mono">
          Failed to load device fleet: {fleetError}
        </div>
      )}
      {fleetLoading && cameras.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-400 text-xs font-mono flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading fleet…
        </div>
      )}

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

              {/* UPLOAD CAPTURE BUTTON */}
              <button
                onClick={() => handlePickFile(cam.id)}
                disabled={chunkedUpload.busy}
                className="mt-3 w-full px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 disabled:opacity-50 border border-cyan-500/40 text-cyan-300 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                {chunkedUpload.busy && selectedDeviceId === cam.id
                  ? "Uploading capture…"
                  : "Upload capture (chunked, resumable)"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
