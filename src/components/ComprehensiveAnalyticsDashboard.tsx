import React, { useState } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  Clock,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Calendar,
  Layers,
  PieChart as PieIcon,
  Activity,
  BarChart3,
  HardHat,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sparkles,
  Users,
  Target,
  ChevronRight,
  Sliders,
  Award
} from "lucide-react";

export const ComprehensiveAnalyticsDashboard: React.FC = () => {
  const [selectedSubTab, setSelectedSubTab] = useState<"overview" | "earned_value" | "trades" | "safety" | "productivity">("overview");

  // Sample analytics state
  const progressKpis = {
    overallProgressPct: 78.4,
    plannedProgressPct: 82.1,
    variancePct: -3.7,
    delayPct: 4.5,
    criticalFloatDays: 2.0,
    projectedDate: "14 Nov 2026",
    targetDate: "01 Nov 2026"
  };

  const evmMetrics = {
    pv: "₹12.85 Cr",
    ev: "₹12.28 Cr",
    ac: "₹12.10 Cr",
    cpi: 1.015,
    spi: 0.956,
    cv: "+₹18.0 Lakhs (Under Budget)",
    sv: "-₹57.0 Lakhs (Behind Schedule)",
    eac: "₹15.42 Cr",
    vac: "+₹23.0 Lakhs"
  };

  const tradeData = [
    { trade: "Substructure & Concrete", planned: 100, actual: 100, status: "ON_TRACK", contractor: "Shapoorji Pallonji" },
    { trade: "Structural Steel & Decking", planned: 100, actual: 98.5, status: "ON_TRACK", contractor: "Tata BlueScope" },
    { trade: "Drywall & Partition Systems", planned: 88, actual: 78.5, status: "BEHIND", contractor: "L&T Finishes" },
    { trade: "MEP HVAC & Ducting", planned: 82, actual: 79.2, status: "SLIGHTLY_BEHIND", contractor: "Voltas MEP" },
    { trade: "Electrical Conduits & Cable Trays", planned: 80, actual: 76.0, status: "BEHIND", contractor: "Sterling & Wilson" },
    { trade: "Facade & Curtain Wall", planned: 70, actual: 72.1, status: "AHEAD", contractor: "Permasteelisa" },
    { trade: "Ceiling Grids & Tiles", planned: 55, actual: 42.0, status: "BEHIND", contractor: "Armstrong Solutions" },
    { trade: "Flooring & Finishes", planned: 40, actual: 38.0, status: "ON_TRACK", contractor: "Nitco Tiles" }
  ];

  const safetyData = {
    trir: 0.42,
    ltir: 0.00,
    safeHours: "1,284,000 hrs",
    ppeCompliance: 97.6,
    nearMisses: 3,
    spatialHazards: 5
  };

  const productivityData = {
    drywallVelocity: "14.2 m²/man-hour",
    mepDuctingVelocity: "8.5 m/man-hour",
    slabCycle: "11.2 days/floor",
    manpowerEfficiency: "94.8%",
    activeWorkers: 342
  };

  const sCurveData = [
    { month: "Jan", planned: 12, actual: 11.8 },
    { month: "Feb", planned: 25, actual: 24.5 },
    { month: "Mar", planned: 38, actual: 37.2 },
    { month: "Apr", planned: 50, actual: 49.0 },
    { month: "May", planned: 62, actual: 60.5 },
    { month: "Jun", planned: 72, actual: 70.1 },
    { month: "Jul", planned: 82.1, actual: 78.4 }
  ];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              EXECUTIVE PROJECT ANALYTICS
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              EARNED VALUE + SCHEDULE FORECASTING ACTIVE
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Project Performance Analytics Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time tracking of Progress %, Delay %, Productivity, Safety KPIs, Trade-wise completion, EVM indicators &amp; Schedule forecasts
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            AeroSpace Tower B
          </span>
          <button className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Real-Time BIM State
          </button>
        </div>
      </div>

      {/* Top 4 KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress % */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Progress %</span>
            <span className="flex items-center text-amber-400 font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
              -3.7% Variance
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{progressKpis.overallProgressPct}%</span>
            <span className="text-xs text-slate-400">Target: {progressKpis.plannedProgressPct}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progressKpis.overallProgressPct}%` }} />
          </div>
        </div>

        {/* Delay % */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Delay Index %</span>
            <span className="flex items-center text-rose-400 font-semibold text-[11px] bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              <Clock className="w-3 h-3 mr-0.5" />
              4.5% Schedule Drag
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400 font-mono">{progressKpis.delayPct}%</span>
            <span className="text-xs text-slate-400">Float: {progressKpis.criticalFloatDays} days</span>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>Est Completion:</span>
            <span className="text-white font-bold">{progressKpis.projectedDate}</span>
          </div>
        </div>

        {/* Cost Performance Index (CPI) */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Cost Efficiency (CPI)</span>
            <span className="flex items-center text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              Favorable
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">{evmMetrics.cpi}</span>
            <span className="text-xs text-slate-400">SPI: {evmMetrics.spi}</span>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>Cost Variance:</span>
            <span className="text-emerald-400 font-bold">{evmMetrics.cv}</span>
          </div>
        </div>

        {/* Safety Metric (TRIR) */}
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Safety TRIR Score</span>
            <span className="flex items-center text-indigo-400 font-semibold text-[11px] bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              <ShieldCheck className="w-3 h-3 mr-0.5" />
              Zero Lost Time
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-400 font-mono">{safetyData.trir}</span>
            <span className="text-xs text-slate-400">PPE: {safetyData.ppeCompliance}%</span>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>Safe Man-Hours:</span>
            <span className="text-white font-bold">{safetyData.safeHours}</span>
          </div>
        </div>
      </div>

      {/* Analytics Sub-Tab Controls */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setSelectedSubTab("overview")}
          className={`pb-3 transition relative ${
            selectedSubTab === "overview" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Overview &amp; S-Curve
        </button>
        <button
          onClick={() => setSelectedSubTab("earned_value")}
          className={`pb-3 transition relative ${
            selectedSubTab === "earned_value" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Earned Value (EVM)
        </button>
        <button
          onClick={() => setSelectedSubTab("trades")}
          className={`pb-3 transition relative ${
            selectedSubTab === "trades" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Trade-wise Completion
        </button>
        <button
          onClick={() => setSelectedSubTab("productivity")}
          className={`pb-3 transition relative ${
            selectedSubTab === "productivity" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Productivity &amp; Velocity
        </button>
        <button
          onClick={() => setSelectedSubTab("safety")}
          className={`pb-3 transition relative ${
            selectedSubTab === "safety" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Safety Intelligence
        </button>
      </div>

      {/* SUB-TAB 1: OVERVIEW & S-CURVE */}
      {selectedSubTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* S-Curve Chart Visualizer */}
          <div className="lg:col-span-2 p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Planned vs Actual Progress S-Curve
                </h3>
                <p className="text-xs text-slate-400">Cumulative physical progress completion trajectory over project lifecycle</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Planned Curve
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Actual Verified
                </span>
              </div>
            </div>

            {/* S-Curve Bars / Graph Visualization */}
            <div className="space-y-3 pt-2">
              {sCurveData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="font-mono font-bold">{item.month}</span>
                    <span className="font-mono">
                      Planned: <strong className="text-indigo-400">{item.planned}%</strong> | Actual: <strong className="text-emerald-400">{item.actual}%</strong>
                    </span>
                  </div>

                  <div className="space-y-1">
                    {/* Planned Bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500/60 h-full rounded-full" style={{ width: `${item.planned}%` }} />
                    </div>
                    {/* Actual Bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.actual}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Forecast & Monte Carlo Card */}
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="w-5 h-5 text-amber-400" />
              Monte Carlo Schedule Forecast
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                <span className="text-slate-400">P50 Completion (50% Prob):</span>
                <span className="font-mono font-bold text-white">08 Nov 2026</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                <span className="text-slate-400">P80 Completion (80% Prob):</span>
                <span className="font-mono font-bold text-amber-400">14 Nov 2026</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                <span className="text-slate-400">P95 Conservative:</span>
                <span className="font-mono font-bold text-rose-400">22 Nov 2026</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-slate-400 block font-semibold">Critical Path Bottleneck:</span>
                <p className="text-slate-300 font-mono text-[11px]">
                  Level 2 Overhead MEP Ducting -&gt; Ceiling Grid Closing
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EARNED VALUE (EVM) */}
      {selectedSubTab === "earned_value" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Earned Value Management (EVM) Indicators
            </h3>
            <p className="text-xs text-slate-400">ANSI/EIA-748 standard earned value financial metrics for project cost &amp; schedule control</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-xs text-slate-400">Planned Value (PV)</span>
              <div className="text-2xl font-bold font-mono text-white">{evmMetrics.pv}</div>
              <span className="text-[11px] text-slate-500">Authorized budget for scheduled work</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-xs text-slate-400">Earned Value (EV)</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">{evmMetrics.ev}</div>
              <span className="text-[11px] text-slate-500">Budgeted cost of work physically performed</span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-xs text-slate-400">Actual Cost (AC)</span>
              <div className="text-2xl font-bold font-mono text-indigo-400">{evmMetrics.ac}</div>
              <span className="text-[11px] text-slate-500">Total incurred actual costs to date</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Cost Performance Index (CPI):</span>
                <span className="text-emerald-400 font-bold">{evmMetrics.cpi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Schedule Performance Index (SPI):</span>
                <span className="text-amber-400 font-bold">{evmMetrics.spi}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">Cost Variance (CV):</span>
                <span className="text-emerald-400 font-bold">{evmMetrics.cv}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Estimate at Completion (EAC):</span>
                <span className="text-white font-bold">{evmMetrics.eac}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Variance at Completion (VAC):</span>
                <span className="text-emerald-400 font-bold">{evmMetrics.vac}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">Schedule Variance (SV):</span>
                <span className="text-rose-400 font-bold">{evmMetrics.sv}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TRADE-WISE COMPLETION */}
      {selectedSubTab === "trades" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Trade-wise Physical Completion Matrix
            </h3>
            <p className="text-xs text-slate-400">Granular progress tracking broken down by individual contractor work packages</p>
          </div>

          <div className="space-y-3">
            {tradeData.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white text-sm block">{item.trade}</span>
                    <span className="text-slate-400 text-[11px]">Contractor: {item.contractor}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono">Planned: <strong className="text-indigo-400">{item.planned}%</strong></span>
                    <span className="font-mono">Actual: <strong className="text-emerald-400">{item.actual}%</strong></span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.status === "ON_TRACK"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : item.status === "AHEAD"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.actual >= item.planned ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${item.actual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PRODUCTIVITY */}
      {selectedSubTab === "productivity" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Subcontractor Productivity &amp; Installation Velocity
            </h3>
            <p className="text-xs text-slate-400">Trade installation speeds measured in output per man-hour via automated AI camera tracking</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <span className="text-slate-400 block font-semibold">Drywall Framing Velocity</span>
              <span className="text-xl font-bold font-mono text-white">{productivityData.drywallVelocity}</span>
              <p className="text-slate-500 text-[11px]">Target: 15.0 m²/man-hour (94.6% efficiency)</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <span className="text-slate-400 block font-semibold">MEP Ducting Velocity</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{productivityData.mepDuctingVelocity}</span>
              <p className="text-slate-500 text-[11px]">Target: 8.0 m/man-hour (106.2% efficiency)</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <span className="text-slate-400 block font-semibold">Slab Pour Cycle Time</span>
              <span className="text-xl font-bold font-mono text-indigo-400">{productivityData.slabCycle}</span>
              <p className="text-slate-500 text-[11px]">Target: 12.0 days/floor (Ahead of target)</p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SAFETY INTELLIGENCE */}
      {selectedSubTab === "safety" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Safety &amp; Compliance Metrics
            </h3>
            <p className="text-xs text-slate-400">AI Computer Vision PPE compliance tracking and spatial hazard detection</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-slate-400">TRIR (Recordable Incident)</span>
              <div className="text-2xl font-bold text-emerald-400">{safetyData.trir}</div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-slate-400">LTIR (Lost Time Injury)</span>
              <div className="text-2xl font-bold text-white">{safetyData.ltir}</div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-slate-400">PPE Compliance Rate</span>
              <div className="text-2xl font-bold text-indigo-400">{safetyData.ppeCompliance}%</div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-slate-400">Spatial Hazards Detected</span>
              <div className="text-2xl font-bold text-amber-400">{safetyData.spatialHazards} open</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
