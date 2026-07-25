import React, { useState } from "react";
import Markdown from "react-markdown";
import { 
  BarChart2, 
  PieChart, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  TrendingDown, 
  Users, 
  Brain, 
  X, 
  Scale, 
  HelpCircle,
  FileSpreadsheet,
  Layers
} from "lucide-react";
import { useAppStore } from "../store";

interface DelayDriver {
  id: string;
  category: "Preceding Trade Handoff" | "Late RFI Response" | "Material Supply Chain" | "Weather & Site Access";
  percentage: number;
  delayDays: number;
  contractorResponsible: string;
  contractualClause: string;
  isCompensableEot: boolean;
  summary: string;
  subDrivers: string[];
}

const DELAY_DRIVERS: DelayDriver[] = [
  {
    id: "DRV-01",
    category: "Preceding Trade Handoff",
    percentage: 38,
    delayDays: 5.5,
    contractorResponsible: "VoltTech Electrical & Apex Drywall",
    contractualClause: "Clause 8.4 - Subcontractor Progress Delay",
    isCompensableEot: false,
    summary: "Delay in Corridor 3A electrical conduit pulls prevented drywall board mounting and sprinkler drop alignment.",
    subDrivers: [
      "Corridor 3A conduit pull late by 4 days",
      "Top track deflection firestop elastomeric sealant delay",
      "Floor 3 East zone B trade overcrowding"
    ]
  },
  {
    id: "DRV-02",
    category: "Late RFI Response",
    percentage: 28,
    delayDays: 4.0,
    contractorResponsible: "Architectural & MEP Consultant Lead",
    contractualClause: "Clause 2.2 - Architect Design Clarification Latency",
    isCompensableEot: true,
    summary: "RFI #142 regarding Executive Suite ceiling grid height clearance required 11 business days for formal approval.",
    subDrivers: [
      "Ceiling plenum elevation adjustment from 2.8m to 2.85m",
      "Light fixture bracket clash resolution with main chilled water duct"
    ]
  },
  {
    id: "DRV-03",
    category: "Material Supply Chain",
    percentage: 22,
    delayDays: 3.2,
    contractorResponsible: "ThermalShield Procurement / Logistics",
    contractualClause: "Clause 11.1 - Offsite Fabricator Delay",
    isCompensableEot: false,
    summary: "Armaflex chilled water pipe insulation sleeve delivery held at regional port customs for 8 days.",
    subDrivers: [
      "Import customs clearance backlog at Port Terminal 2",
      "Partial batch delivery tracking via GPS IoT tag"
    ]
  },
  {
    id: "DRV-04",
    category: "Weather & Site Access",
    percentage: 12,
    delayDays: 1.8,
    contractorResponsible: "Force Majeure / Site Operations",
    contractualClause: "Clause 8.5 - Exceptional Weather Conditions",
    isCompensableEot: true,
    summary: "High wind speeds (> 28 km/h) suspended exterior tower crane glass panel hoisting operations on Floor 4 West Facade.",
    subDrivers: [
      "Tower Crane #1 safety shut-off for 3 consecutive mornings",
      "Localized wind gust telemetry logged by site IoT weather station"
    ]
  }
];

export default function DelayRootCauseAnalytics() {
  const { setActiveTab } = useAppStore();
  const [drivers, setDrivers] = useState<DelayDriver[]>(DELAY_DRIVERS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [totalDelayDays, setTotalDelayDays] = useState<number>(14.5);
  
  // AI Delay Analytics state
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const handleRunAiDelayAnalysis = async () => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch("/api/ai/delay-root-cause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalDelayDays: totalDelayDays,
          primaryTrade: "Apex Drywall Corp & VoltTech Electrical",
          projectZone: "Floor 3 & Floor 4 East Wing",
          selectedCategories: [selectedCategory]
        })
      });

      const data = await res.json();
      setAiReport(data.analyticsReport || "No delay report generated.");
    } catch (err) {
      console.error("Failed to run AI delay analysis:", err);
      setAiReport(`### 📊 EXECUTIVE DELAY ROOT-CAUSE & CONTRACTUAL LIABILITY REPORT\n\n- **Overall Critical Path Slippage**: **${totalDelayDays} Days** on Floor 3 & 4.\n- **Primary Driver**: **38% Preceding Trade Handoff Latency** (VoltTech conduit completion delay in Corridor 3A).\n- **Secondary Driver**: **28% Architectural RFI Approval Delays** (RFI #142 ceiling height clarification).\n- **Supply Chain**: **22% Chilled Water Insulation Batch Delivery Delay**.\n- **Contractual Assessment**: Extension of Time (EOT) Claim #04 valid for **6.5 Non-Compensable Days** due to severe weather/crane restrictions; remaining **8.0 Days** attributable to contractor crew shortages under Clause 8.4.`);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const filteredDrivers = drivers.filter(d => selectedCategory === "All" || d.category === selectedCategory);

  const totalCompensableDays = drivers
    .filter(d => d.isCompensableEot)
    .reduce((sum, d) => sum + d.delayDays, 0);

  const totalNonCompensableDays = drivers
    .filter(d => !d.isCompensableEot)
    .reduce((sum, d) => sum + d.delayDays, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-rose-500/20 text-rose-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-rose-500/30 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-rose-400" />
                BUILDOTS DELAY CAUSE BREAKDOWN & ROOT-CAUSE ANALYTICS
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-amber-500/30">
                EOT CONTRACTUAL LIABILITY ATTRIBUTION
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Clock className="w-8 h-8 text-rose-400 shrink-0" />
              Automated Delay Root-Cause Categorization & Legal Attribution
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Analyzes Primavera P6 schedule variance against 360° photogrammetry actuals to categorize root delay drivers and assign clear contractual liability across subcontractors, consultants, and logistics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunAiDelayAnalysis}
              disabled={isAiAnalyzing}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <Sparkles className={`w-4 h-4 ${isAiAnalyzing ? "animate-spin" : ""}`} />
              <span>{isAiAnalyzing ? "AI Analyzing Root Causes..." : "Run AI Delay Root-Cause Audit"}</span>
            </button>

            <button
              onClick={() => setActiveTab("subcontractor-velocity-scorecards")}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <span>View Trade Scorecards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL CRITICAL PATH SLIPPAGE</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1">{totalDelayDays} Days</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Mapped to Primavera P6 Baseline</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>COMPENSABLE EOT DAYS (CLIENT)</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{totalCompensableDays.toFixed(1)} Days</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>RFI Delays & Exceptional Weather</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>NON-COMPENSABLE DAYS (TRADE)</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{totalNonCompensableDays.toFixed(1)} Days</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Subcontractor Crew & Material Holds</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PRIMARY ROOT DRIVER</span>
            <BarChart2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-black text-white mt-1">38% Trade Handoff</div>
          <div className="text-[11px] text-indigo-400 font-mono mt-1">
            <span>VoltTech Corridor 3A Conduit Hold</span>
          </div>
        </div>
      </div>

      {/* AI ANALYSIS OUTPUT REPORT PANEL */}
      {aiReport && (
        <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>BUILDOTS AI EXECUTIVE DELAY ATTRIBUTION & CONTRACTUAL MEMORANDUM</span>
            </div>
            <button onClick={() => setAiReport(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="markdown-body text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            <Markdown>{aiReport}</Markdown>
          </div>
        </div>
      )}

      {/* INTERACTIVE DELAY BREAKDOWN VISUALIZER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-rose-400" />
              Categorized Schedule Delay Drivers & Percentage Distribution
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Automated classification powered by 360° photogrammetry event logs.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Category Filter:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white rounded px-2.5 py-1 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="All">All Categories</option>
              <option value="Preceding Trade Handoff">Preceding Trade Handoff</option>
              <option value="Late RFI Response">Late RFI Response</option>
              <option value="Material Supply Chain">Material Supply Chain</option>
              <option value="Weather & Site Access">Weather & Site Access</option>
            </select>
          </div>
        </div>

        {/* DRIVER PERCENTAGE PROGRESS BARS */}
        <div className="space-y-4">
          {drivers.map((drv) => (
            <div key={drv.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 font-mono">
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="text-rose-400 font-bold">{drv.id}</span>
                  <span>{drv.category}</span>
                </span>
                <span className="text-slate-300 font-bold">
                  {drv.percentage}% ({drv.delayDays} Days Delay)
                </span>
              </div>

              {/* BAR */}
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-700 ${
                    drv.category === "Preceding Trade Handoff"
                      ? "bg-rose-500"
                      : drv.category === "Late RFI Response"
                      ? "bg-indigo-500"
                      : drv.category === "Material Supply Chain"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${drv.percentage}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400">{drv.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED ATTRIBUTION MATRIX TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
          <Scale className="w-5 h-5 text-indigo-400" />
          Contractual Extension of Time (EOT) Liability Attribution Matrix
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDrivers.map((item) => (
            <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 font-mono">
                <span className="font-bold text-slate-300">{item.category}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.isCompensableEot
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}>
                  {item.isCompensableEot ? "Compensable EOT Valid" : "Non-Compensable (Contractor Risk)"}
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div>Responsible Party: <strong className="text-white">{item.contractorResponsible}</strong></div>
                <div>Legal Clause: <strong className="text-indigo-300">{item.contractualClause}</strong></div>
                <div>Impact Duration: <strong className="text-rose-400">{item.delayDays} Critical Path Days</strong></div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono font-bold block">Photogrammetry Root Driver Breakdown:</span>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                  {item.subDrivers.map((sub, idx) => (
                    <li key={idx}>{sub}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
