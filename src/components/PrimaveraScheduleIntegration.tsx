import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  Search, 
  Filter, 
  Sliders, 
  Play, 
  Sparkles, 
  ShieldAlert, 
  Activity, 
  Link, 
  ChevronRight,
  Database,
  Briefcase,
  AlertCircle
} from "lucide-react";

interface ScheduleActivity {
  id: string;
  p6ActivityId: string;
  activityName: string;
  trade: string;
  bimGuid: string;
  originalStartDate: string;
  originalEndDate: string;
  durationDays: number;
  progressPercent: number; // Reality % detected by AI
  plannedPercent: number;  // Baseline % expected
  floatDays: number;       // Free/Total Float
  isCriticalPath: boolean;
  status: "on_track" | "delayed" | "critical_delay" | "ahead";
  prerequisitesReady: boolean;
  prerequisitesMessage?: string;
}

const SCHEDULE_ACTIVITIES: ScheduleActivity[] = [
  {
    id: "ACT-01",
    p6ActivityId: "A3010-MEP-CABLE",
    activityName: "Install Overhead Cable Trays - Floor 3 Corridor A",
    trade: "MEP Electrical",
    bimGuid: "BIM-ELE-CT-301",
    originalStartDate: "2026-07-10",
    originalEndDate: "2026-07-22",
    durationDays: 12,
    progressPercent: 100,
    plannedPercent: 100,
    floatDays: 8,
    isCriticalPath: false,
    status: "ahead",
    prerequisitesReady: true
  },
  {
    id: "ACT-02",
    p6ActivityId: "A3020-DRY-STUD",
    activityName: "Metal Stud Framing - Executive Suites Zone B",
    trade: "Drywall & Partition",
    bimGuid: "BIM-DRY-FRM-02",
    originalStartDate: "2026-07-15",
    originalEndDate: "2026-07-25",
    durationDays: 10,
    progressPercent: 45,
    plannedPercent: 80,
    floatDays: 0,
    isCriticalPath: true,
    status: "critical_delay",
    prerequisitesReady: false,
    prerequisitesMessage: "BLOCKED: Overhead HVAC Ducting trunk line offset delaying top track anchor"
  },
  {
    id: "ACT-03",
    p6ActivityId: "A3030-HVAC-DUCT",
    activityName: "Main Trunk Ducting Assembly - Mechanical Plant 3B",
    trade: "MEP HVAC",
    bimGuid: "BIM-HVAC-T01",
    originalStartDate: "2026-07-18",
    originalEndDate: "2026-07-30",
    durationDays: 12,
    progressPercent: 65,
    plannedPercent: 70,
    floatDays: 2,
    isCriticalPath: true,
    status: "delayed",
    prerequisitesReady: strokePrereq("HVAC Fire Damper FD-302 arrival pending")
  },
  {
    id: "ACT-04",
    p6ActivityId: "A3040-DRY-BOARD",
    activityName: "Gypsum Board Side A Closeout - Server Room 304",
    trade: "Drywall & Partition",
    bimGuid: "BIM-DW-BS1",
    originalStartDate: "2026-07-22",
    originalEndDate: "2026-08-05",
    durationDays: 14,
    progressPercent: 20,
    plannedPercent: 25,
    floatDays: 5,
    isCriticalPath: false,
    status: "on_track",
    prerequisitesReady: true
  },
  {
    id: "ACT-05",
    p6ActivityId: "A3050-ELEM-TRIM",
    activityName: "Switch & Socket Trim-out & Cable Termination",
    trade: "MEP Electrical",
    bimGuid: "BIM-ELE-TRM-04",
    originalStartDate: "2026-07-28",
    originalEndDate: "2026-08-10",
    durationDays: 13,
    progressPercent: 0,
    plannedPercent: 0,
    floatDays: 12,
    isCriticalPath: false,
    status: "on_track",
    prerequisitesReady: true
  }
];

function strokePrereq(msg: string) {
  return false;
}

export default function PrimaveraScheduleIntegration() {
  const [activities, setActivities] = useState<ScheduleActivity[]>(SCHEDULE_ACTIVITIES);
  const [activeTab, setActiveTab] = useState<"gantt" | "lookahead" | "mapping">("gantt");
  const [filterCriticalOnly, setFilterCriticalOnly] = useState<boolean>(false);
  const [simulationDelayDays, setSimulationDelayDays] = useState<number>(0);

  const displayedActivities = activities.filter(act => !filterCriticalOnly || act.isCriticalPath);

  // Stats calculation
  const totalCriticalActivities = activities.filter(a => a.isCriticalPath).length;
  const delayedActivities = activities.filter(a => a.status === "delayed" || a.status === "critical_delay").length;

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-purple-500/20 text-purple-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-purple-500/30 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                PRIMAVERA P6 & MS PROJECT INTEGRATION
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-emerald-500/30">
                BIDIRECTIONAL .XER / .MPP SYNC
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-400 shrink-0" />
              Bidirectional Live Schedule & Critical Path Float Engine
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Ingests Oracle Primavera P6 (.XER) and MS Project (.MPP) files, maps Activity Task IDs to BIM GUIDs, and recalculates total float and critical path shifts in real time from computer vision site captures.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => alert("Simulated importing Primavera P6 .XER schedule file. Activity IDs successfully mapped to BIM GUIDs.")}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
            >
              <Upload className="w-4 h-4" />
              Import .XER / .MPP Schedule
            </button>
            <button 
              onClick={() => alert("Exported updated Primavera P6 schedule XML with revised percent complete values.")}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-purple-400" />
              Export P6 Sync XML
            </button>
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION / MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("gantt")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "gantt"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Live Schedule Float & Gantt Analyzer
          </button>
          <button
            onClick={() => setActiveTab("lookahead")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "lookahead"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Automated 3-Week Lookahead Planner
          </button>
          <button
            onClick={() => setActiveTab("mapping")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "mapping"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            P6 Task ID ↔ BIM GUID Mapping Table
          </button>
        </div>

        {/* CRITICAL PATH FILTER TOGGLE */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
              filterCriticalOnly
                ? "bg-rose-600 text-white border-rose-500 shadow"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {filterCriticalOnly ? "Showing Critical Path Only" : "Filter Critical Path"}
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Total Scheduled Activities</div>
          <div className="text-xl font-black text-white mt-1">{activities.length} P6 Tasks</div>
          <div className="text-xs text-purple-400 font-mono mt-1">100% mapped to BIM elements</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Critical Path Tasks</div>
          <div className="text-xl font-black text-rose-400 mt-1">{totalCriticalActivities} Critical</div>
          <div className="text-xs text-rose-300/80 font-mono mt-1">Zero total float remaining</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Schedule Slippage Forecast</div>
          <div className="text-xl font-black text-amber-400 mt-1">+4.5 Days Slippage</div>
          <div className="text-xs text-slate-400 font-mono mt-1">Primary delay in HVAC Trunk</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Lookahead Readiness</div>
          <div className="text-xl font-black text-emerald-400 mt-1">82% Prereqs Ready</div>
          <div className="text-xs text-emerald-300/80 font-mono mt-1">Safe to execute next 21 days</div>
        </div>
      </div>

      {/* TAB 1: GANTT CHART & FLOAT ANALYZER */}
      {activeTab === "gantt" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Live Primavera P6 Interactive Gantt & Float Buffer Map
            </h3>
            <span className="text-xs text-slate-400 font-mono">Real-time Float Calculation</span>
          </div>

          {/* GANTT TIMELINE TABLE */}
          <div className="space-y-3">
            {displayedActivities.map((act) => (
              <div 
                key={act.id}
                className={`bg-slate-950 border rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all ${
                  act.isCriticalPath 
                    ? "border-rose-500/40 bg-rose-950/10" 
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* ACTIVITY METADATA */}
                <div className="min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                      {act.p6ActivityId}
                    </span>
                    {act.isCriticalPath && (
                      <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                        CRITICAL PATH
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm mt-1">{act.activityName}</h4>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Trade: <strong className="text-slate-200">{act.trade}</strong></span>
                    <span>BIM: <code className="text-indigo-400">{act.bimGuid}</code></span>
                  </div>
                </div>

                {/* PROGRESS vs PLANNED COMPARISON */}
                <div className="flex-1 max-w-xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">P6 Baseline vs AI Reality</span>
                    <span className="font-bold text-white">{act.progressPercent}% / {act.plannedPercent}%</span>
                  </div>

                  {/* Dual Bar (Top: Planned, Bottom: AI Actual) */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full" style={{ width: `${act.plannedPercent}%` }} />
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        act.status === "critical_delay" ? "bg-rose-500" :
                        act.status === "delayed" ? "bg-amber-500" :
                        "bg-emerald-500"
                      }`} style={{ width: `${act.progressPercent}%` }} />
                    </div>
                  </div>
                </div>

                {/* FLOAT BUFFER & DELAY BADGE */}
                <div className="flex items-center gap-3 text-right">
                  <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-mono uppercase">Total Float</div>
                    <div className={`text-xs font-bold font-mono ${
                      act.floatDays === 0 ? "text-rose-400" : "text-emerald-400"
                    }`}>
                      {act.floatDays} Days
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase shrink-0 ${
                    act.status === "critical_delay" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                    act.status === "delayed" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                    "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {act.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATED 3-WEEK LOOKAHEAD PLANNER */}
      {activeTab === "lookahead" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Automated 3-Week Short-Interval Production Lookahead
            </h3>
            <span className="text-xs text-slate-400 font-mono">Auto-generated from Prerequisite Readiness</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* WEEK 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white font-mono">WEEK 1 (Jul 23 - Jul 29)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded">
                  READY TO EXECUTE
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <div className="font-bold text-white">Overhead Cable Tray CT-301</div>
                  <div className="text-slate-400 text-[11px] mt-1">Prerequisites 100% verified by AI</div>
                  <div className="mt-2 text-[10px] font-mono text-emerald-400 font-bold">RELEASED FOR PRODUCTION</div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <div className="font-bold text-white">Main Ducting Assembly Plant 3B</div>
                  <div className="text-slate-400 text-[11px] mt-1">Fire Damper arrival pending</div>
                  <div className="mt-2 text-[10px] font-mono text-amber-400 font-bold">PREREQUISITE WARNING</div>
                </div>
              </div>
            </div>

            {/* WEEK 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white font-mono">WEEK 2 (Jul 30 - Aug 05)</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded">
                  IN PREPARATION
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <div className="font-bold text-white">Gypsum Board Side A Closeout</div>
                  <div className="text-slate-400 text-[11px] mt-1">Server Room 304 Wall Partition</div>
                  <div className="mt-2 text-[10px] font-mono text-indigo-300 font-bold">MEP IN-WALL SIGNOFF REQUIRED</div>
                </div>
              </div>
            </div>

            {/* WEEK 3 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white font-mono">WEEK 3 (Aug 06 - Aug 12)</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 font-mono font-bold px-2 py-0.5 rounded">
                  SCHEDULED
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <div className="font-bold text-white">Switch & Socket Trim-out</div>
                  <div className="text-slate-400 text-[11px] mt-1">Executive Suite 312</div>
                  <div className="mt-2 text-[10px] font-mono text-slate-400 font-bold">PENDING DRYWALL PAINT COAT 1</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: P6 TASK ID TO BIM GUID MAPPING TABLE */}
      {activeTab === "mapping" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Link className="w-4 h-4 text-purple-400" />
              Primavera P6 Task ID ↔ BIM Element GUID Direct Mapping Matrix
            </h3>
            <span className="text-xs text-slate-400 font-mono">100% Bi-Directional Synchronization</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {activities.map((act) => (
              <div key={act.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-purple-600/20 text-purple-300 px-2.5 py-1 rounded font-bold border border-purple-500/30">
                    {act.p6ActivityId}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className="bg-indigo-600/20 text-indigo-300 px-2.5 py-1 rounded font-bold border border-indigo-500/30">
                    {act.bimGuid}
                  </span>
                </div>
                <span className="text-slate-300 font-sans font-semibold">{act.activityName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
