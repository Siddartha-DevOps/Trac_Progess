import React, { useState } from "react";
import MissionControlView from "./reality-capture/MissionControlView";
import CaptureTimelinePlayer from "./reality-capture/CaptureTimelinePlayer";
import AlignmentEngineView from "./reality-capture/AlignmentEngineView";
import ChangeDetectionView from "./reality-capture/ChangeDetectionView";
import RealityHeatmapView from "./reality-capture/RealityHeatmapView";

import { 
  Camera, 
  Layers, 
  Sliders, 
  MapPin, 
  Sparkles, 
  Activity, 
  CheckCircle, 
  Calendar, 
  AlertTriangle, 
  FileSpreadsheet, 
  Cpu, 
  ClipboardCheck, 
  History,
  Workflow,
  Wrench,
  TrendingUp,
  Link2
} from "lucide-react";

export default function RealityCaptureWorkspace() {
  const [activeSubTab, setActiveSubTab] = useState<"missions" | "timeline" | "alignment" | "change-detect" | "heatmap" | "integrations">("missions");

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Platform Workspace Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl p-6 border border-slate-800 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                Reality Intelligence Layer
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-100 mt-1">
              Reality Capture Workspace
            </h1>
            <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
              Analyze drone photogrammetry orthomosaics, 360° helmet captures, and LiDAR point clouds synchronized automatically against IFC 3D Design models.
            </p>
          </div>
        </div>

        {/* Global telemetry indices */}
        <div className="flex gap-4 border-l border-slate-800 pl-6 shrink-0 font-mono text-[11px]">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Registration Confidence</span>
            <span className="text-white font-black text-sm">96.8% Average</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">RERA Site Compliance</span>
            <span className="text-emerald-400 font-black text-sm">100% Certified</span>
          </div>
        </div>
      </div>

      {/* Workspace Inner Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-200/60 rounded-xl self-start border border-slate-300/40">
        <button
          onClick={() => setActiveSubTab("missions")}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === "missions"
              ? "bg-white text-slate-900 shadow-sm font-black"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Camera className="w-4 h-4 text-indigo-500" />
          <span>Ingestion & Sessions HUD</span>
        </button>

        <button
          onClick={() => setActiveSubTab("timeline")}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === "timeline"
              ? "bg-white text-slate-900 shadow-sm font-black"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>Visual Timeline Player</span>
        </button>

        <button
          onClick={() => setActiveSubTab("alignment")}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === "alignment"
              ? "bg-white text-slate-900 shadow-sm font-black"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>BIM Alignment Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab("change-detect")}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === "change-detect"
              ? "bg-white text-slate-900 shadow-sm font-black"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Change Detection ledger</span>
        </button>

        <button
          onClick={() => setActiveSubTab("heatmap")}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === "heatmap"
              ? "bg-white text-slate-900 shadow-sm font-black"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-500" />
          <span>Reality Heat Maps</span>
        </button>

        <button
          onClick={() => setActiveSubTab("integrations")}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === "integrations"
              ? "bg-white text-slate-900 shadow-sm font-black"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Link2 className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span>System Integrations</span>
        </button>
      </div>

      {/* Sub-Tab Viewport */}
      <div className="flex flex-col gap-6">
        {activeSubTab === "missions" && <MissionControlView />}
        {activeSubTab === "timeline" && <CaptureTimelinePlayer />}
        {activeSubTab === "alignment" && <AlignmentEngineView />}
        {activeSubTab === "change-detect" && <ChangeDetectionView />}
        {activeSubTab === "heatmap" && <RealityHeatmapView />}

        {/* Step 10: Integrations Dashboard rendering */}
        {activeSubTab === "integrations" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Integration Block 1: Operations Workflow */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded font-mono uppercase">Operations Workflow</span>
                  <Workflow className="w-4 h-4 text-indigo-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 uppercase">Automation Trigger Rules</h4>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  When photogrammetry scans detect physical rebar spacing discrepancies, an immediate automated Non-Conformance Report (NCR) is initiated inside the <strong>Operations Workflow Engine</strong>.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>API HOOK: onAnomalyDetected</span>
                <span className="text-emerald-500 font-bold uppercase">SYNCHRONIZED</span>
              </div>
            </div>

            {/* Integration Block 2: Schedules & Gantt Milestones */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] bg-cyan-50 text-cyan-600 font-bold px-2 py-0.5 rounded font-mono uppercase">Milestone Schedules</span>
                  <Calendar className="w-4 h-4 text-cyan-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 uppercase">Gantt Float Synchronization</h4>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Visual scan completion percentages automatically feed back into <strong>Gantt Milestones</strong>, recalculating float margins and flagging critical paths dynamically on schedule slippage.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>API HOOK: updateScheduleGantt</span>
                <span className="text-emerald-500 font-bold uppercase">SYNCHRONIZED</span>
              </div>
            </div>

            {/* Integration Block 3: Issues Ledger */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded font-mono uppercase">Issues Ledger</span>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 uppercase">Geometric Dev Snapshotting</h4>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Unresolved spatial deviations automatically manifest as entries inside the <strong>Quality Issues Ledger</strong>, attaching raw orthomosaic images and IFC metadata tags directly.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>API HOOK: createDeviationIssue</span>
                <span className="text-emerald-500 font-bold uppercase">SYNCHRONIZED</span>
              </div>
            </div>

            {/* Integration Block 4: Commercial Claims & BOQ */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded font-mono uppercase">BOQ Claims</span>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 uppercase">Valuations Quantities Match</h4>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Earned value claims are cross-checked instantly against reality-captured quantities (such as volume of concrete poured or running HVAC meters), blocking unverified commercial claims.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>API HOOK: verifyBOQQuantity</span>
                <span className="text-emerald-500 font-bold uppercase">SYNCHRONIZED</span>
              </div>
            </div>

            {/* Integration Block 5: Digital Twin Map */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] bg-cyan-50 text-cyan-600 font-bold px-2 py-0.5 rounded font-mono uppercase">Digital Twin</span>
                  <Sliders className="w-4 h-4 text-cyan-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 uppercase">3D Point-Cloud Overlay</h4>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  The interactive 3D Three.js BIM model is annotated directly with point-cloud vertex offsets, letting operators fly through aligned reality models overlaying structural elements.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>API HOOK: overlayPointCloud</span>
                <span className="text-emerald-500 font-bold uppercase">SYNCHRONIZED</span>
              </div>
            </div>

            {/* Integration Block 6: Quality ISO Auditing */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded font-mono uppercase">Quality QMS</span>
                  <ClipboardCheck className="w-4 h-4 text-amber-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 uppercase">ISO 9001 Compliance Reports</h4>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Alignment matrices and mean-squared-error calibration tolerances compile into comprehensive, digital-signed quality PDFs ready for structural engineers and government audits.
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3 mt-4 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>API HOOK: compileISOReport</span>
                <span className="text-emerald-500 font-bold uppercase">SYNCHRONIZED</span>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
