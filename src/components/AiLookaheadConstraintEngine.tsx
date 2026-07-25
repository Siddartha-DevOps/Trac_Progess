import React, { useState } from "react";
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Filter, 
  ArrowRight, 
  ShieldAlert, 
  Layers, 
  Building2, 
  Zap, 
  Users, 
  BarChart2, 
  ChevronRight, 
  RefreshCw, 
  CheckSquare, 
  Lock, 
  Unlock, 
  FileText,
  TrendingUp,
  Brain
} from "lucide-react";
import { useAppStore } from "../store";

interface Constraint {
  id: string;
  activityName: string;
  location: string;
  trade: string;
  category: "Material" | "Preceding Trade" | "Access/Scaffolding" | "Design/RFI" | "Quality Re-work";
  severity: "Critical" | "High" | "Medium";
  impactDays: number;
  status: "Blocked" | "In Resolution" | "Cleared";
  owner: string;
  aiRecommendation: string;
  ppcImpact: string;
}

const INITIAL_CONSTRAINTS: Constraint[] = [
  {
    id: "CST-01",
    activityName: "Electrical Conduit Pulls - Corridor 3A",
    location: "Floor 3 East (Grid C-4)",
    trade: "VoltTech Electrical",
    category: "Preceding Trade",
    severity: "Critical",
    impactDays: 4,
    status: "Blocked",
    owner: "Apex Drywall Corp",
    aiRecommendation: "Re-sequence Floor 3 Zone B stud installation to Corridor 3A immediately to unblock electrical conduit installation by Thursday morning.",
    ppcImpact: "-12% PPC"
  },
  {
    id: "CST-02",
    activityName: "Chilled Water Pipe Insulation",
    location: "Floor 2 Central Plant",
    trade: "ThermalShield HVAC",
    category: "Material",
    severity: "High",
    impactDays: 3,
    status: "In Resolution",
    owner: "Procurement / Site Ops",
    aiRecommendation: "Release partial delivery batch from Warehouse B; 120m insulation sleeves verified in transit via GPS IoT tracker.",
    ppcImpact: "-8% PPC"
  },
  {
    id: "CST-03",
    activityName: "Curtain Wall Glass Panel Installation",
    location: "Floor 4 Exterior West Facade",
    trade: "VisionGlaze Facades",
    category: "Access/Scaffolding",
    severity: "Critical",
    impactDays: 5,
    status: "Blocked",
    owner: "Tower Crane Operator & Site Safety",
    aiRecommendation: "Shift crane lifting slot to 06:00-09:00 AM window when wind speeds are < 15 km/h according to localized weather sensors.",
    ppcImpact: "-15% PPC"
  },
  {
    id: "CST-04",
    activityName: "Sprinkler Head Drop Alignment",
    location: "Floor 3 Executive Suites",
    trade: "FireSafe Systems",
    category: "Design/RFI",
    severity: "Medium",
    impactDays: 2,
    status: "Cleared",
    owner: "Architectural Lead",
    aiRecommendation: "RFI #142 approved. AI BIM auto-adjusted ceiling grid clearance from 2.8m to 2.85m.",
    ppcImpact: "+0% PPC"
  }
];

const LOOKAHEAD_TASKS = [
  { id: "LKA-101", task: "Metal Stud Framing - Corridor 3A", trade: "Apex Drywall", floor: "Floor 3", week: "Week 1", status: "In Progress", readiness: 65, constraintCount: 1 },
  { id: "LKA-102", task: "Electrical Conduit Wire Pulling", trade: "VoltTech Elec", floor: "Floor 3", week: "Week 1", status: "Blocked", readiness: 30, constraintCount: 1 },
  { id: "LKA-103", task: "Drywall Board A Single Side", trade: "Apex Drywall", floor: "Floor 3", week: "Week 2", status: "Scheduled", readiness: 80, constraintCount: 0 },
  { id: "LKA-104", task: "HVAC Secondary Branch Ducting", trade: "ThermalShield", floor: "Floor 2", week: "Week 2", status: "Scheduled", readiness: 95, constraintCount: 0 },
  { id: "LKA-105", task: "Curtain Wall Bracket Anchorage", trade: "VisionGlaze", floor: "Floor 4", week: "Week 3", status: "Blocked", readiness: 45, constraintCount: 1 },
  { id: "LKA-106", task: "Fire Dampers & Sensor Wiring", trade: "FireSafe Systems", floor: "Floor 3", week: "Week 3", status: "Ready", readiness: 100, constraintCount: 0 }
];

export default function AiLookaheadConstraintEngine() {
  const { setActiveTab } = useAppStore();
  const [constraints, setConstraints] = useState<Constraint[]>(INITIAL_CONSTRAINTS);
  const [activeWindow, setActiveWindow] = useState<"3-Week" | "6-Week">("3-Week");
  const [selectedFloor, setSelectedFloor] = useState<string>("All Floors");
  const [filterSeverity, setFilterSeverity] = useState<string>("All");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);

  const handleResolveConstraint = (id: string) => {
    setResolvingId(id);
    setTimeout(() => {
      setConstraints(prev => prev.map(c => c.id === id ? { ...c, status: "Cleared", impactDays: 0 } : c));
      setResolvingId(null);
    }, 1200);
  };

  const handleAiScan = () => {
    setIsAiScanning(true);
    setTimeout(() => {
      setIsAiScanning(false);
    }, 1500);
  };

  const filteredConstraints = constraints.filter(c => {
    if (filterSeverity !== "All" && c.severity !== filterSeverity) return false;
    return true;
  });

  const totalBlocked = constraints.filter(c => c.status === "Blocked").length;
  const totalCleared = constraints.filter(c => c.status === "Cleared").length;
  const overallPPC = 82; // Percent Plan Complete

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                BUILDOTS AI LOOKAHEAD & CONSTRAINT RESOLUTION
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-amber-500/30">
                PPC COMMITMENT RELIABILITY ENGINE
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-400 shrink-0" />
              Automated 3 to 6-Week Lookahead & Constraint Clearance
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Synthesizes 360° helmet photogrammetry with Primavera P6 baseline tasks to detect trade bottlenecks, material holds, and access blockers before they hit the critical path.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAiScan}
              disabled={isAiScanning}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles className={`w-4 h-4 ${isAiScanning ? "animate-spin" : ""}`} />
              <span>{isAiScanning ? "AI Analyzing 4D BIM..." : "Run AI Constraint Scan"}</span>
            </button>

            <button
              onClick={() => setActiveTab("primavera-schedule-integration")}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <span>Sync Primavera P6</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* METRIC HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PERCENT PLAN COMPLETE (PPC)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{overallPPC}%</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <span>+4.2% higher reliability vs. Last Month</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ACTIVE CRITICAL CONSTRAINTS</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1">{totalBlocked} Blocked</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Holding $42,500/day in potential delay claims</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>CLEARED THIS WEEK</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{totalCleared} Cleared</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Average clearance time: 1.8 days</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>LOOKAHEAD TIME WINDOW</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setActiveWindow("3-Week")}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                activeWindow === "3-Week"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              3-Week Rolling
            </button>
            <button
              onClick={() => setActiveWindow("6-Week")}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                activeWindow === "6-Week"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              6-Week Rolling
            </button>
          </div>
        </div>
      </div>

      {/* CONSTRAINTS MANAGEMENT MATRIX */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Active Site Constraints & Automated AI Resolution
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Identified by Buildots AI visual detection matching site reality against Primavera P6 predecessor relationships.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Severity:</span>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical Only</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>
          </div>
        </div>

        {/* CONSTRAINT ITEMS LIST */}
        <div className="space-y-4">
          {filteredConstraints.map((item) => {
            const isBlocked = item.status === "Blocked";
            const isResolving = resolvingId === item.id;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.status === "Cleared"
                    ? "bg-slate-950/50 border-slate-800/80 opacity-70"
                    : isBlocked
                    ? "bg-rose-950/10 border-rose-500/30"
                    : "bg-amber-950/10 border-amber-500/30"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-slate-400">{item.id}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        item.severity === "Critical"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : item.severity === "High"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                      }`}>
                        {item.severity}
                      </span>
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="text-slate-400">| Location: {item.location}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {item.activityName}
                    </h3>

                    <div className="text-xs text-slate-400 flex items-center gap-3 font-mono">
                      <span>Trade: <strong className="text-indigo-300">{item.trade}</strong></span>
                      <span>Responsible: <strong className="text-slate-200">{item.owner}</strong></span>
                      <span>Delay Impact: <strong className="text-rose-400">{item.impactDays} Days</strong></span>
                    </div>
                  </div>

                  {/* AI RECOMMENDATION & ACTION */}
                  <div className="lg:w-96 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-mono font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Unblocking Recommendation</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {item.aiRecommendation}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-mono text-rose-400">{item.ppcImpact}</span>

                      {item.status !== "Cleared" ? (
                        <button
                          onClick={() => handleResolveConstraint(item.id)}
                          disabled={isResolving}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-[11px] font-bold flex items-center gap-1.5 transition-all"
                        >
                          {isResolving ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          <span>{isResolving ? "Resolving..." : "Apply AI Clearance"}</span>
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROLLING LOOKAHEAD TASK BOARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              {activeWindow} Weekly Work Plan (WWP) Task Readiness
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Weekly trade execution breakdown mapped to 360° photogrammetry verification status.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LOOKAHEAD_TASKS.map((t) => (
            <div key={t.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between font-mono">
                <span className="text-indigo-400 font-bold">{t.week}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  t.status === "Ready"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : t.status === "Blocked"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-slate-800 text-slate-300"
                }`}>
                  {t.status}
                </span>
              </div>

              <h4 className="font-bold text-white text-sm">{t.task}</h4>

              <div className="text-slate-400 text-[11px] space-y-1 font-mono">
                <div>Trade: <span className="text-slate-200">{t.trade}</span></div>
                <div>Location: <span className="text-slate-200">{t.floor}</span></div>
              </div>

              {/* READINESS PROGRESS BAR */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Pre-requisite Readiness</span>
                  <span className="font-bold text-white">{t.readiness}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      t.readiness >= 90 ? "bg-emerald-500" : t.readiness >= 50 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${t.readiness}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
