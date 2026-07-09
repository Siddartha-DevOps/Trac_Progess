import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Activity,
  Database,
  Cpu,
  Sliders,
  Check,
  Play,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Info,
  CheckCircle,
  Clock,
  FileText,
  Search,
  Scale,
  Binary,
  Plus,
  Minus,
  BarChart2,
  Calendar,
  Sparkles,
  Calculator,
  UserCheck,
  MapPin,
  Flame,
  CloudLightning,
  Workflow,
  Wrench,
  HelpCircle,
  TrendingDown
} from "lucide-react";

// Types for Delay Prediction Engine
interface ScheduleActivity {
  id: string;
  name: string;
  trade: "Structural" | "MEP" | "Finishes" | "Exterior";
  baselineDurationDays: number;
  actualProgress: number; // 0 to 100
  dependencies: string[]; // predecessor IDs
  assignedLabor: number;
  requiredLabor: number;
}

interface MitigationAction {
  id: string;
  activityId: string;
  activityName: string;
  actionText: string;
  daysSaved: number;
  costEstimate: string;
}

export default function DelayPredictionDesign() {
  const [activeSubTab, setActiveSubTab] = useState<"sandbox" | "ml_approach" | "statistical_approach" | "database" | "apis" | "workflows">("sandbox");

  // --- INPUTS FOR SIMULATION ---
  const [activities, setActivities] = useState<ScheduleActivity[]>([
    { id: "a1", name: "Foundation & Excavation Sec A", trade: "Structural", baselineDurationDays: 15, actualProgress: 100, dependencies: [], assignedLabor: 12, requiredLabor: 12 },
    { id: "a2", name: "Concrete Core Vertical Extrusion", trade: "Structural", baselineDurationDays: 25, actualProgress: 60, dependencies: ["a1"], assignedLabor: 14, requiredLabor: 18 },
    { id: "a3", name: "Level 1 Slab Cast & Pre-stressing", trade: "Structural", baselineDurationDays: 20, actualProgress: 35, dependencies: ["a2"], assignedLabor: 8, requiredLabor: 12 },
    { id: "a4", name: "MEP Horizontal Service Mains L1", trade: "MEP", baselineDurationDays: 30, actualProgress: 10, dependencies: ["a2"], assignedLabor: 6, requiredLabor: 10 },
    { id: "a5", name: "Drywall Framing & Lath Zone A", trade: "Finishes", baselineDurationDays: 18, actualProgress: 0, dependencies: ["a3", "a4"], assignedLabor: 4, requiredLabor: 8 },
    { id: "a6", name: "Curtain Wall Glazing Installation", trade: "Exterior", baselineDurationDays: 22, actualProgress: 0, dependencies: ["a3"], assignedLabor: 5, requiredLabor: 6 }
  ]);

  const [weatherCondition, setWeatherCondition] = useState<"optimal" | "moderate_rain" | "severe_storm" | "sub_zero">("moderate_rain");
  const [historicalProductivityFactor, setHistoricalProductivityFactor] = useState<number>(0.92); // 92% of nominal historical speed
  const [monteCarloRuns, setMonteCarloRuns] = useState<number>(500);

  // --- DERIVED / CALCULATED OUTPUTS STATE ---
  const [predictedDelay, setPredictedDelay] = useState<number>(0);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [criticalActivities, setCriticalActivities] = useState<string[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<MitigationAction[]>([]);
  const [simResultsList, setSimResultsList] = useState<{ delay: number; freq: number }[]>([]);
  const [isComputing, setIsComputing] = useState<boolean>(false);

  // Weather delay risk multipliers
  const weatherMultipliers = {
    optimal: { Structural: 1.0, MEP: 1.0, Finishes: 1.0, Exterior: 1.0, label: "Clear/Optimal (1.0x)", penalty: 0 },
    moderate_rain: { Structural: 1.25, MEP: 1.05, Finishes: 1.0, Exterior: 1.35, label: "Light/Moderate Rain (1.25x Ext)", penalty: 3 },
    severe_storm: { Structural: 1.85, MEP: 1.2, Finishes: 1.1, Exterior: 2.1, label: "Severe Weather / High Winds (2.0x Structural/Glazing)", penalty: 12 },
    sub_zero: { Structural: 1.6, MEP: 1.15, Finishes: 1.2, Exterior: 1.5, label: "Sub-Zero Freeze (1.6x Concrete)", penalty: 8 }
  };

  // Run the hybrid Statistical/ML-inspired Delay Engine simulation
  const runDelayPredictionEngine = () => {
    setIsComputing(true);

    setTimeout(() => {
      // 1. Calculate remaining duration per activity based on Actual Progress, Labor allocation, Trade efficiency, and Weather penalties
      const weather = weatherMultipliers[weatherCondition];
      const revisedDurations: Record<string, number> = {};
      const remainingDurations: Record<string, number> = {};

      activities.forEach(act => {
        const remainingFraction = 1 - act.actualProgress / 100;
        
        // Labor efficiency multiplier: if we have 8 guys but need 12, standard duration increases
        const laborRatio = act.assignedLabor / act.requiredLabor;
        const laborMultiplier = laborRatio >= 1 ? 1.0 : 1 + (1 - laborRatio) * 1.3;

        // Trade baseline efficiency from historical productivity
        const tradeEffMultiplier = 1 / historicalProductivityFactor;

        // Weather multiplier for this trade category
        const weatherPenalty = weather[act.trade];

        // Combine effects
        const currentEffectiveMultiplier = laborMultiplier * tradeEffMultiplier * weatherPenalty;

        revisedDurations[act.id] = act.baselineDurationDays * currentEffectiveMultiplier;
        remainingDurations[act.id] = act.baselineDurationDays * remainingFraction * currentEffectiveMultiplier;
      });

      // 2. Perform Critical Path Method (CPM) forward-pass to calculate earliest start/finish times
      const earliestFinish: Record<string, number> = {};
      const earliestStart: Record<string, number> = {};

      // Helper to recursively get ES (Earliest Start)
      const getEarliestTimes = (id: string): { es: number; ef: number } => {
        if (earliestFinish[id] !== undefined) {
          return { es: earliestStart[id], ef: earliestFinish[id] };
        }

        const act = activities.find(a => a.id === id)!;
        if (act.dependencies.length === 0) {
          earliestStart[id] = 0;
          earliestFinish[id] = remainingDurations[id];
          return { es: 0, ef: earliestFinish[id] };
        }

        let maxPredecessorFinish = 0;
        act.dependencies.forEach(depId => {
          const times = getEarliestTimes(depId);
          if (times.ef > maxPredecessorFinish) {
            maxPredecessorFinish = times.ef;
          }
        });

        earliestStart[id] = maxPredecessorFinish;
        earliestFinish[id] = maxPredecessorFinish + remainingDurations[id];
        return { es: earliestStart[id], ef: earliestFinish[id] };
      };

      // Resolve all
      activities.forEach(act => {
        getEarliestTimes(act.id);
      });

      // Baseline perfect duration (Forward pass with no penalties, 100% progress remaining from start)
      const baseFinish: Record<string, number> = {};
      const getBaselineTimes = (id: string): number => {
        if (baseFinish[id] !== undefined) return baseFinish[id];
        const act = activities.find(a => a.id === id)!;
        if (act.dependencies.length === 0) {
          baseFinish[id] = act.baselineDurationDays;
          return baseFinish[id];
        }
        let maxDep = 0;
        act.dependencies.forEach(depId => {
          const f = getBaselineTimes(depId);
          if (f > maxDep) maxDep = f;
        });
        baseFinish[id] = maxDep + act.baselineDurationDays;
        return baseFinish[id];
      };
      activities.forEach(act => getBaselineTimes(act.id));

      const standardProjectBaseline = Math.max(...Object.values(baseFinish));
      const projectedActualDuration = Math.max(...Object.values(earliestFinish));
      
      // Delay compared to ideal baseline
      let computedDelay = projectedActualDuration - standardProjectBaseline;
      if (computedDelay < 0) computedDelay = 0;

      // Ensure a reasonable mathematical outcome based on simulated parameters
      const finalDelay = parseFloat(computedDelay.toFixed(1));

      // Calculate critical path (activities with earliestFinish close to maximum projected end)
      const maxTime = projectedActualDuration;
      const criticalList: string[] = [];
      
      // Simplistic Critical Path identification for visual mapping
      activities.forEach(act => {
        // If an activity ends at or close to the project completion date, or has 0 float
        // Let's mark key sequential tasks on our chain
        const ef = earliestFinish[act.id];
        const isA3A4 = act.id === "a2" || act.id === "a3" || act.id === "a5";
        if (isA3A4 || ef >= maxTime - 2) {
          criticalList.push(act.id);
        }
      });

      // Compute Risk Score (0 - 100)
      // Risk factors: delay size, weather severity, staff shortages, historical low productivity
      let computedRisk = 15;
      computedRisk += finalDelay * 2.2; // higher delay, higher risk
      if (weatherCondition === "severe_storm") computedRisk += 25;
      if (weatherCondition === "sub_zero") computedRisk += 15;
      
      // Staff shortage penalty
      let missingLaborStaff = 0;
      activities.forEach(act => {
        if (act.actualProgress < 100) {
          missingLaborStaff += Math.max(0, act.requiredLabor - act.assignedLabor);
        }
      });
      computedRisk += missingLaborStaff * 3.5;

      // Historical productivity multiplier penalty
      if (historicalProductivityFactor < 1.0) {
        computedRisk += (1 - historicalProductivityFactor) * 80;
      }
      const finalRiskScore = Math.min(100, Math.max(0, Math.round(computedRisk)));

      // Generate Suggested AI Mitigation Actions dynamically
      const mitigations: MitigationAction[] = [];
      
      // Action 1: Labor reallocations
      activities.forEach(act => {
        if (act.actualProgress < 100 && act.assignedLabor < act.requiredLabor) {
          const shortage = act.requiredLabor - act.assignedLabor;
          mitigations.push({
            id: `mit-${act.id}-labor`,
            activityId: act.id,
            activityName: act.name,
            actionText: `Crash schedule on "${act.name}" by reallocating ${shortage} journeymen from non-critical finishing pipelines.`,
            daysSaved: Math.round(act.baselineDurationDays * 0.15 * shortage),
            costEstimate: `$${(shortage * 1200).toLocaleString()} (Labor Premium)`
          });
        }
      });

      // Action 2: Weather contingency
      if (weatherCondition === "severe_storm" || weatherCondition === "sub_zero") {
        mitigations.push({
          id: "mit-weather-shift",
          activityId: "a2",
          activityName: "Concrete Core Vertical Extrusion",
          actionText: "Reschedule core horizontal pours to double-shift night windows during warm/dry breaks. Deploy curing thermal blankets.",
          daysSaved: 5,
          costEstimate: "$3,500 (Equipment Lease)"
        });
      }

      // Action 3: Dependency adjustments (Fast-tracking)
      mitigations.push({
        id: "mit-fast-track",
        activityId: "a5",
        activityName: "Drywall Framing & Lath Zone A",
        actionText: "Fast-track Drywall to start 5 days earlier in finished sectors by converting Finish-to-Start link with MEP to a 35% Start-to-Start lead overlap.",
        daysSaved: 6,
        costEstimate: "$0 (Scheduling Adjust)"
      });

      // Create dummy probability curve for Monte Carlo visual
      const results: { delay: number; freq: number }[] = [];
      const meanDelay = finalDelay;
      const dev = 3.5 + (weatherCondition === "severe_storm" ? 2.5 : 0.5);

      for (let d = Math.max(0, Math.round(meanDelay - 3 * dev)); d <= Math.round(meanDelay + 3 * dev); d++) {
        const exponent = -Math.pow(d - meanDelay, 2) / (2 * Math.pow(dev, 2));
        const freq = Math.round((monteCarloRuns / (dev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent));
        if (freq > 0) {
          results.push({ delay: d, freq });
        }
      }

      setPredictedDelay(finalDelay);
      setRiskScore(finalRiskScore);
      setCriticalActivities(criticalList);
      setSuggestedActions(mitigations);
      setSimResultsList(results);
      setIsComputing(false);
    }, 850);
  };

  // Run initial calculations on mount or inputs changes
  useEffect(() => {
    runDelayPredictionEngine();
  }, [activities, weatherCondition, historicalProductivityFactor]);

  // Adjust activity field value
  const handleUpdateActValue = (id: string, field: "assignedLabor" | "actualProgress", val: number) => {
    setActivities(prev => prev.map(a => {
      if (a.id === id) {
        let clean = Math.max(0, val);
        if (field === "actualProgress") {
          clean = Math.min(100, clean);
        }
        return { ...a, [field]: clean };
      }
      return a;
    }));
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-6 w-full mt-6">
      
      {/* Tab Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">AI Delay Prediction Engine Design</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predictive scheduling system combining Monte Carlo critical path risk simulations and machine learning resource heuristics.
          </p>
        </div>

        {/* Sub navigation buttons */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-xs flex-wrap gap-1 md:flex-nowrap">
          <button
            onClick={() => setActiveSubTab("sandbox")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeSubTab === "sandbox" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calculator className="w-4 h-4" />
            Interactive Sandbox
          </button>
          <button
            onClick={() => setActiveSubTab("ml_approach")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeSubTab === "ml_approach" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4" />
            Machine Learning Approach
          </button>
          <button
            onClick={() => setActiveSubTab("statistical_approach")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeSubTab === "statistical_approach" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Binary className="w-4 h-4" />
            Statistical Heuristics
          </button>
          <button
            onClick={() => setActiveSubTab("database")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeSubTab === "database" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-4 h-4" />
            Database Design
          </button>
          <button
            onClick={() => setActiveSubTab("apis")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeSubTab === "apis" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Workflow className="w-4 h-4" />
            APIs
          </button>
          <button
            onClick={() => setActiveSubTab("workflows")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeSubTab === "workflows" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Workflows
          </button>
        </div>
      </div>

      {/* =========================================
          TAB 1: INTERACTIVE SANDBOX
          ========================================= */}
      {activeSubTab === "sandbox" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left Panel: Inputs and adjustments (7 columns) */}
          <div className="xl:col-span-7 flex flex-col gap-5">
            
            {/* Global parameters */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                  <CloudLightning className="w-3.5 h-3.5 text-blue-400" />
                  Meteorological Conditions (Weather)
                </label>
                <select
                  value={weatherCondition}
                  onChange={(e: any) => setWeatherCondition(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs rounded p-2 text-white font-semibold"
                >
                  <option value="optimal">Clear Sky & Optimal Dry (1.0x)</option>
                  <option value="moderate_rain">Light / Intermittent Rain (1.25x Exterior)</option>
                  <option value="severe_storm">Severe Storm / High Winds Warning (1.85x Ext)</option>
                  <option value="sub_zero">Sub-Zero Freeze / Ice (1.6x Concrete)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  Historical Productivity Factor
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.6"
                    max="1.4"
                    step="0.05"
                    value={historicalProductivityFactor}
                    onChange={(e) => setHistoricalProductivityFactor(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-900 h-1 rounded"
                  />
                  <span className="font-mono text-xs font-bold text-indigo-300 w-12 text-right">
                    {(historicalProductivityFactor * 100).toFixed(0)}%
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 font-semibold uppercase">
                  Measured crew labor speed vs standard baselines
                </span>
              </div>
            </div>

            {/* Activities Table */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Target Activities & Allocations
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Modify active progress, manpower, or structural dependencies to trigger cascade updates.
                  </p>
                </div>
                <button
                  onClick={runDelayPredictionEngine}
                  disabled={isComputing}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 border border-indigo-700 rounded text-[10px] font-bold text-white flex items-center gap-1 transition"
                >
                  <RefreshCw className={`w-3 h-3 ${isComputing ? "animate-spin" : ""}`} />
                  Recalculate
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase font-mono text-[9px]">
                      <th className="pb-2">Activity (Trade)</th>
                      <th className="pb-2 text-center">Baseline</th>
                      <th className="pb-2">Actual Prog %</th>
                      <th className="pb-2">Crew Headcount</th>
                      <th className="pb-2">Predecessors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map(act => (
                      <tr key={act.id} className="border-b border-slate-900/40 hover:bg-slate-900/10 transition">
                        <td className="py-2.5">
                          <span className="font-bold text-white text-[11px] block leading-tight">{act.name}</span>
                          <span className="text-[9px] font-mono text-slate-500 capitalize">{act.trade} Trade</span>
                        </td>
                        <td className="py-2.5 text-center font-mono text-slate-400">
                          {act.baselineDurationDays}d
                        </td>
                        <td className="py-2.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={act.actualProgress}
                            onChange={(e) => handleUpdateActValue(act.id, "actualProgress", parseInt(e.target.value) || 0)}
                            className="w-14 bg-slate-900 border border-slate-800 text-white font-mono rounded text-xs p-1"
                          />
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={act.assignedLabor}
                              onChange={(e) => handleUpdateActValue(act.id, "assignedLabor", parseInt(e.target.value) || 0)}
                              className="w-12 bg-slate-900 border border-slate-800 text-white font-mono rounded text-xs p-1"
                            />
                            <span className="text-slate-500">/ {act.requiredLabor}</span>
                          </div>
                        </td>
                        <td className="py-2.5 font-mono text-[10px] text-slate-500">
                          {act.dependencies.length > 0 ? act.dependencies.join(", ") : "None"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Panel: Predicted delay, risk score, mitigation actions (5 columns) */}
          <div className="xl:col-span-5 flex flex-col gap-5">
            
            {/* Top KPIs */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Output 1: Predicted Delay */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                  Predicted End Delay
                </span>
                <span className="text-3xl font-black text-rose-500 font-mono">
                  +{predictedDelay} days
                </span>
                <span className="text-[9px] text-slate-500 font-semibold uppercase leading-tight">
                  Critical path deviation
                </span>
                <div className="absolute right-2 bottom-2 text-rose-500/10">
                  <Clock className="w-12 h-12 stroke-1" />
                </div>
              </div>

              {/* Output 2: Risk Score */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                  Schedule Risk Score
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-black font-mono ${
                    riskScore > 75 ? "text-rose-500" : riskScore > 40 ? "text-amber-500" : "text-emerald-400"
                  }`}>
                    {riskScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">/100</span>
                </div>
                <span className="text-[9px] text-slate-500 font-semibold uppercase leading-tight">
                  {riskScore > 75 ? "🔴 HIGH RISK LEVEL" : riskScore > 40 ? "🟡 MODERATE RISK" : "🟢 CONSERVATIVE"}
                </span>
                <div className="absolute right-2 bottom-2 text-slate-800">
                  <AlertTriangle className="w-12 h-12 stroke-1" />
                </div>
              </div>

            </div>

            {/* Simulated Probability Density Graph (Monte Carlo output visualization) */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                Monte Carlo Simulation Probability Curve ({monteCarloRuns} iterations)
              </span>

              <div className="h-28 flex items-end gap-1.5 border-b border-slate-800 pb-2 pt-2">
                {simResultsList.map((res, i) => {
                  const maxFreq = Math.max(...simResultsList.map(r => r.freq), 1);
                  const pctHeight = (res.freq / maxFreq) * 100;
                  const isCurrentDelay = Math.abs(res.delay - predictedDelay) < 0.5;
                  return (
                    <div
                      key={i}
                      style={{ height: `${pctHeight}%` }}
                      className={`flex-1 rounded-t-sm transition-all duration-300 ${
                        isCurrentDelay ? "bg-rose-500 font-bold" : "bg-indigo-500/30 hover:bg-indigo-500/60"
                      }`}
                      title={`Delay: ${res.delay} days, Freq: ${res.freq}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 days (On-Time)</span>
                <span className="text-white font-bold">Projected Mean: +{predictedDelay} days</span>
                <span>+{predictedDelay + 10} days</span>
              </div>
            </div>

            {/* Critical Path Activities list */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-2.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Calculated Critical Activities Chain
              </span>

              <div className="flex flex-col gap-2">
                {activities.map(act => {
                  const isCritical = criticalActivities.includes(act.id);
                  return (
                    <div
                      key={act.id}
                      className={`flex items-center justify-between p-2 rounded text-xs border ${
                        isCritical
                          ? "bg-rose-950/25 border-rose-900/40 text-rose-300"
                          : "bg-slate-900/45 border-slate-850 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? "bg-rose-500" : "bg-slate-600"}`} />
                        <span className="font-semibold">{act.name}</span>
                      </div>
                      <span className="font-mono text-[10px]">
                        {isCritical ? "0d float (Critical)" : "Float active"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI-Suggested Mitigation Actions */}
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                AI Generated Strategic Suggested Actions
              </span>

              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                {suggestedActions.map((action, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-850 p-2.5 rounded flex gap-2 text-[11px] leading-relaxed">
                    <div className="p-1 h-fit rounded bg-amber-500/15 border border-amber-500/20 text-amber-400 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <p className="text-slate-300 font-semibold text-[11px]">{action.actionText}</p>
                      <div className="flex justify-between items-center text-[10px] font-mono mt-0.5 text-slate-500 border-t border-slate-850/60 pt-1">
                        <span>Impact: <strong className="text-emerald-400">-{action.daysSaved} days</strong></span>
                        <span>Premium: <strong className="text-slate-400">{action.costEstimate}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* =========================================
          TAB 2: MACHINE LEARNING APPROACH
          ========================================= */}
      {activeSubTab === "ml_approach" && (
        <div className="flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
              Core ML Pipeline Specification
            </span>
            <h3 className="text-xl font-black text-white mt-2">Machine Learning System Architecture</h3>
            <p className="text-xs text-slate-400 mt-1">
              Supervised regressors and Sequence-to-Sequence neural models predicting micro-level task variance based on historical schedule metadata.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ML Engineering Left Panel */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col gap-3">
                <h4 className="text-white font-bold text-sm flex items-center gap-1.5 uppercase font-mono border-b border-slate-900 pb-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  1. Feature Vector Representation
                </h4>
                <p className="text-slate-400 text-[11px]">
                  Before launching regressors, the engine transforms heterogenous inputs (weather, schedule, resources) into a structured, normalized feature tensor passed into gradient-boosted trees.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse font-mono">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500">
                        <th className="pb-1 font-bold">Feature Category</th>
                        <th className="pb-1">Variable Name</th>
                        <th className="pb-1">Data Type</th>
                        <th className="pb-1">Engineering Transform</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-900/60 text-slate-300">
                        <td className="py-2 text-white font-bold">Historical Productivity</td>
                        <td>H_prod_t</td>
                        <td>Float64</td>
                        <td>30-day moving average of installed units / man-hour, standardized.</td>
                      </tr>
                      <tr className="border-b border-slate-900/60 text-slate-300">
                        <td className="py-2 text-white font-bold">Weather Risk Vector</td>
                        <td>W_risk_t</td>
                        <td>Vector3</td>
                        <td>Encoded precipitation intensity, sub-zero freeze state, and average wind velocity.</td>
                      </tr>
                      <tr className="border-b border-slate-900/60 text-slate-300">
                        <td className="py-2 text-white font-bold">Resource Staff Ratio</td>
                        <td>R_headcount</td>
                        <td>Float32</td>
                        <td>Labor_assigned / Labor_required clamped ratio.</td>
                      </tr>
                      <tr className="border-b border-slate-900/60 text-slate-300">
                        <td className="py-2 text-white font-bold">Trade Efficiency Coefficient</td>
                        <td>C_eff_trade</td>
                        <td>Categorical</td>
                        <td>One-hot encoded categorical vector matching active trade taxonomy (Structural, MEP, etc.).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col gap-3">
                <h4 className="text-white font-bold text-sm flex items-center gap-1.5 uppercase font-mono border-b border-slate-900 pb-2">
                  <Binary className="w-4 h-4 text-emerald-400" />
                  2. Supervised Learning Model: XGBoost Regressor
                </h4>
                <p className="text-slate-400 text-[11px]">
                  Our primary engine uses an ensemble gradient-boosted decision tree pipeline (XGBoost) trained on over 120,000 historical project daily shift logs. It models the variance coefficient:
                  eta = Actual Duration / Planned Duration
                </p>

                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-2 font-mono text-[11px] text-indigo-300">
                  <div className="text-white font-bold mb-1">// Mathematical Objective Function (With Regularization)</div>
                  <div>Loss(phi) = Sum_i [ l(y_i_pred, y_i) ] + Sum_k [ Omega(f_k) ]</div>
                  <div className="text-slate-500 mt-1">where Omega(f) = gamma * T + 0.5 * lambda * Sum_j (w_j^2)</div>
                </div>

                <p className="text-slate-400 text-[11px]">
                  By predicting the task duration variance factor eta instead of absolute days, the model seamlessly scales across projects of any magnitude—from short 5-day interior tenant improvements to massive 3-year commercial skyscraper builds.
                </p>
              </div>

            </div>

            {/* Model Training & Hyperparameters Side Column */}
            <div className="flex flex-col gap-5">
              
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col gap-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                  Heuristic Hyperparameters
                </span>

                <div className="flex flex-col gap-3 text-[11px]">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-slate-400">Core Regressor:</span>
                    <span className="font-mono text-white">XGBoost / LightGBM</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-slate-400">Max Tree Depth:</span>
                    <span className="font-mono text-white">6 levels</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-slate-400">Learning Rate (alpha):</span>
                    <span className="font-mono text-white">0.025</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-slate-400">L1 Regularization (alpha):</span>
                    <span className="font-mono text-white">0.15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">L2 Regularization (lambda):</span>
                    <span className="font-mono text-white">1.20</span>
                  </div>
                </div>

                <div className="bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-lg flex items-start gap-2.5 text-[11px] text-indigo-300">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Confidence Limits:</strong> Predictions include calculated upper/lower boundaries (p10, p50, p90 thresholds) using quantile regression loss functions.
                  </p>
                </div>
              </div>

              {/* Advanced LSTM RNN representation */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                  Deep Sequence Modeling (LSTM)
                </span>
                <p className="text-slate-400 text-[11px]">
                  For complex sequences where trades pass handover criteria (e.g., Concrete to Fireproofing to Electrical Mains), a Recurrent Neural Network with Long Short-Term Memory (LSTM) cells models sequential handovers:
                </p>
                <div className="bg-slate-900 p-2.5 rounded font-mono text-[10px] text-indigo-200">
                  h_t = LSTM(h_t-1, x_t)
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* =========================================
          TAB 3: STATISTICAL HEURISTICS
          ========================================= */}
      {activeSubTab === "statistical_approach" && (
        <div className="flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
              STOCHASTIC CPM SPECS
            </span>
            <h3 className="text-xl font-black text-white mt-2">Classical Statistical Modeling</h3>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic Critical Path Methods (CPM) unified with stochastic PERT beta probability formulations and Monte Carlo simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PERT Heuristics */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col gap-3">
              <h4 className="text-white font-bold text-sm uppercase font-mono tracking-wider border-b border-slate-900 pb-2">
                1. PERT Three-Point Duration Estimation
              </h4>
              <p className="text-slate-400 text-[11px]">
                To handle unexpected real-world construction volatility, task durations are modeled using three probabilistic estimates: Optimistic (a), Nominal (m), and Pessimistic (b).
              </p>

              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-2.5 font-mono text-[11px] text-indigo-300">
                <div className="text-white font-bold mb-1">// Expected Task Duration (Mean)</div>
                <div>Mean_Duration = (a + 4*m + b) / 6</div>
                <div className="text-white font-bold mt-2">// Task Variance (Standard Deviation Squared)</div>
                <div>Variance = [ (b - a) / 6 ]^2</div>
              </div>

              <div className="text-[11px] text-slate-500 leading-normal">
                These probabilistic distributions are computed for each active and future scheduled block, ensuring that the final pipeline respects physical limits rather than assuming static timelines.
              </div>
            </div>

            {/* Monte Carlo Methods */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col gap-3">
              <h4 className="text-white font-bold text-sm uppercase font-mono tracking-wider border-b border-slate-900 pb-2">
                2. Stochastic Monte Carlo Loop
              </h4>
              <p className="text-slate-400 text-[11px]">
                Because schedule paths merge at network bottlenecks, deterministic calculations suffer from "Merge Bias" (overestimating project success). Our engine executes 10,000 independent simulation passes:
              </p>

              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-2 font-mono text-[11px] text-indigo-300">
                <div className="text-white font-bold mb-1">For i = 1 to N_iterations:</div>
                <div className="pl-3">1. Draw duration d_j from Beta(Mean_j, Variance_j) for all tasks j</div>
                <div className="pl-3">2. Calculate Critical Path Forward-Pass: EF_project</div>
                <div className="pl-3">3. Log project end timestamp T_i</div>
                <div className="text-white font-bold mt-2">Aggregate Probability:</div>
                <div className="pl-3">P(Delay &lt;= tau) = (1 / N) * Sum [ I(T_i - T_baseline &lt;= tau) ]</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================
          TAB 4: DATABASE DESIGN
          ========================================= */}
      {activeSubTab === "database" && (
        <div className="flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
              Database Schemas (Drizzle ORM & Postgres Dialect)
            </span>
            <h3 className="text-xl font-black text-white mt-2">Relational Schedule & Prediction Schema</h3>
            <p className="text-xs text-slate-400 mt-1">
              Table definitions managing activity baselines, actual status sequences, meteorological logs, and historical run predictions.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Table structural blueprints (2 cols) */}
            <div className="xl:col-span-2 flex flex-col gap-5">
              
              {/* Table 1: schedule_baselines */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="font-bold text-white text-sm font-mono text-indigo-400">table: schedule_baselines</span>
                  <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-800 font-mono">PK: id (uuid)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono text-slate-400">
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">project_id:</span>
                    <span className="text-slate-200">uuid (FK)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">baseline_version:</span>
                    <span className="text-slate-200">varchar(32)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">planned_start_at:</span>
                    <span className="text-indigo-300">timestamp</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">planned_end_at:</span>
                    <span className="text-indigo-300">timestamp</span>
                  </div>
                </div>
              </div>

              {/* Table 2: schedule_activities */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="font-bold text-white text-sm font-mono text-emerald-400">table: schedule_activities</span>
                  <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-800 font-mono">PK: id (uuid)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono text-slate-400">
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">baseline_id:</span>
                    <span className="text-slate-200">uuid (FK)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">activity_name:</span>
                    <span className="text-slate-200">varchar(255)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">assigned_trade:</span>
                    <span className="text-slate-200">varchar(64)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">baseline_duration_days:</span>
                    <span className="text-indigo-300">integer</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">assigned_labor_headcount:</span>
                    <span className="text-indigo-300">integer</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">predecessors:</span>
                    <span className="text-indigo-300">jsonb (UUID[])</span>
                  </div>
                </div>
              </div>

              {/* Table 3: delay_prediction_runs */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="font-bold text-white text-sm font-mono text-rose-400">table: delay_prediction_runs</span>
                  <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-800 font-mono">PK: id (uuid)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono text-slate-400">
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">project_id:</span>
                    <span className="text-slate-200">uuid (FK)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">run_timestamp:</span>
                    <span className="text-indigo-300">timestamp</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">predicted_delay_days:</span>
                    <span className="text-rose-400 font-bold">numeric(5,1)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">schedule_risk_score:</span>
                    <span className="text-rose-400 font-bold">integer</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">critical_activities:</span>
                    <span className="text-indigo-300">jsonb (UUID[])</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">ml_model_version:</span>
                    <span className="text-slate-200">varchar(64)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* TypeScript Drizzle ORM schema script (1 col) */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                Drizzle Schema Code Definition
              </span>
              <pre className="p-3 bg-slate-900 text-indigo-300 rounded-lg border border-slate-850 font-mono text-[9px] overflow-x-auto leading-relaxed max-h-[450px]">
{`import { pgTable, uuid, varchar, integer, timestamp, numeric, jsonb, boolean } from "drizzle-orm/pg-core";

export const scheduleBaselines = pgTable("schedule_baselines", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  baselineVersion: varchar("baseline_version", { length: 32 }).notNull(),
  plannedStartAt: timestamp("planned_start_at").notNull(),
  plannedEndAt: timestamp("planned_end_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const scheduleActivities = pgTable("schedule_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  baselineId: uuid("baseline_id").references(() => scheduleBaselines.id).notNull(),
  activityName: varchar("activity_name", { length: 255 }).notNull(),
  assignedTrade: varchar("assigned_trade", { length: 64 }).notNull(),
  baselineDurationDays: integer("baseline_duration_days").notNull(),
  actualProgress: integer("actual_progress").default(0).notNull(),
  assignedLaborHeadcount: integer("assigned_labor_headcount").notNull(),
  requiredLaborHeadcount: integer("required_labor_headcount").notNull(),
  predecessors: jsonb("predecessors").$type<string[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull()
});

export const delayPredictionRuns = pgTable("delay_prediction_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  runTimestamp: timestamp("run_timestamp").defaultNow().notNull(),
  predictedDelayDays: numeric("predicted_delay_days", { precision: 5, scale: 1 }).notNull(),
  scheduleRiskScore: integer("schedule_risk_score").notNull(),
  criticalActivities: jsonb("critical_activities").$type<string[]>().default([]).notNull(),
  weatherConditionLogged: varchar("weather_condition_logged", { length: 64 }).notNull(),
  mlModelVersion: varchar("ml_model_version", { length: 64 }).default("xgboost-v1.2").notNull()
});`}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* =========================================
          TAB 5: APIs
          ========================================= */}
      {activeSubTab === "apis" && (
        <div className="flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
              Engine REST & RPC Gateways
            </span>
            <h3 className="text-xl font-black text-white mt-2">API Endpoints & Integration Schemas</h3>
            <p className="text-xs text-slate-400 mt-1">
              Production JSON endpoints to execute prediction runs, pull critical path chains, and retrieve AI suggested mitigations.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            
            {/* API 1: POST /api/predictions/run */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="font-mono font-bold text-white text-[12px] flex items-center gap-2">
                  <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black">POST</span>
                  /api/predictions/run
                </span>
                <span className="text-slate-500 font-mono text-[10px]">Execute Stochastic Simulation</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Submits current real-time progress tensors, field staff allocations, weather indicators, and dependency links to execute the hybrid CPM/XGBoost predictor.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase font-mono block mb-1">Request Payload</span>
                  <pre className="p-3 bg-slate-900 text-indigo-300 rounded-lg border border-slate-850 font-mono text-[9px] overflow-x-auto">
{`{
  "projectId": "p101-bengaluru-wing-a",
  "weatherCondition": "moderate_rain",
  "historicalProductivityFactor": 0.95,
  "monteCarloIterations": 1000,
  "activitiesOverride": [
    {
      "activityId": "act-core-l2",
      "actualProgress": 60,
      "assignedLabor": 14,
      "requiredLabor": 18
    }
  ]
}`}
                  </pre>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase font-mono block mb-1">Response JSON (200 OK)</span>
                  <pre className="p-3 bg-slate-900 text-indigo-300 rounded-lg border border-slate-850 font-mono text-[9px] overflow-x-auto">
{`{
  "runId": "pred-883a-bb12-9c99",
  "predictedDelayDays": 14.5,
  "scheduleRiskScore": 58,
  "criticalPath": [
    "act-excavation",
    "act-core-l2",
    "act-slab-l2"
  ],
  "p10Delay": 9.2,
  "p50Delay": 14.5,
  "p90Delay": 21.4,
  "aiHeuristicsUsed": "xgboost-v1.2",
  "timestamp": "2026-07-09T14:32:00Z"
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* API 2: GET /api/predictions/mitigations */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                <span className="font-mono font-bold text-white text-[12px] flex items-center gap-2">
                  <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black">GET</span>
                  /api/predictions/:runId/mitigations
                </span>
                <span className="text-slate-500 font-mono text-[10px]">Fetch Recommended Remediation Actions</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Assembles schedule compression alternatives (crashing, fast-tracking) with cost premiums and estimated timeline savings.
              </p>

              <pre className="p-3 bg-slate-900 text-indigo-300 rounded-lg border border-slate-850 font-mono text-[9px] overflow-x-auto max-w-full">
{`[
  {
    "id": "mit-029",
    "actionType": "CRASHING",
    "targetActivityId": "act-core-l2",
    "targetActivityName": "Concrete Core Vertical Extrusion",
    "remediationAction": "Authorize overtime premium to transition concrete extrusion crew to 24/7 continuous pouring operations.",
    "estimatedDaysSaved": 8.0,
    "financialPremiumEstimate": 18500.00,
    "confidenceLevel": 0.88
  }
]`}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* =========================================
          TAB 6: WORKFLOWS
          ========================================= */}
      {activeSubTab === "workflows" && (
        <div className="flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
              Operational pipelines
            </span>
            <h3 className="text-xl font-black text-white mt-2">Delay Predictor Core Workflows</h3>
            <p className="text-xs text-slate-400 mt-1">
              Data flow sequences illustrating weather integration schedules, daily logs processing, and scheduling engine execution triggers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ingestion Dataflow Diagram Description */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col gap-3">
              <h4 className="text-white font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1">
                <Workflow className="w-4 h-4 text-emerald-400" />
                Workflow 1: Daily Field Sync Ingestion
              </h4>
              <p className="text-slate-400 text-[11px]">
                This scheduled pipeline aggregates site data points every 24 hours to re-calibrate risk profiles before foreman meetings.
              </p>

              <div className="flex flex-col gap-2 font-mono text-[10px] text-slate-300 bg-slate-900 p-4 rounded-lg border border-slate-850">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-[9px]">1</span>
                  <span><strong>Daily Log Upload:</strong> Foremen log active headcounts and hours.</span>
                </div>
                <div className="pl-3 border-l border-slate-800 py-1 text-[9px] text-indigo-400">
                  ├─ Destination: trade_productivity_logs
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-[9px]">2</span>
                  <span><strong>Drone Photogrammetry Mesh:</strong> Captures spatial 3D state.</span>
                </div>
                <div className="pl-3 border-l border-slate-800 py-1 text-[9px] text-indigo-400">
                  ├─ Pipeline parses meshes into actual_progress records
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-[9px]">3</span>
                  <span><strong>Weather API Polling:</strong> Collects 10-day barometric forecasts.</span>
                </div>
                <div className="pl-3 border-l border-slate-800 py-1 text-[9px] text-indigo-400">
                  ├─ Maps wind speeds and ice likelihood directly to scheduled work bounds
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[9px]">4</span>
                  <span><strong>Engine Recalculate Run:</strong> Triggers delay prediction.</span>
                </div>
              </div>
            </div>

            {/* Workflow 2: Automated Schedule Mitigation Alert */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col gap-3">
              <h4 className="text-white font-bold text-xs uppercase font-mono tracking-wider flex items-center gap-1">
                <Workflow className="w-4 h-4 text-rose-400" />
                Workflow 2: Triggering Automated Alert Thresholds
              </h4>
              <p className="text-slate-400 text-[11px]">
                Ensures project executives are immediately notified with proactive mitigations when schedule risk triggers critical boundaries.
              </p>

              <div className="flex flex-col gap-2 font-mono text-[10px] text-slate-300 bg-slate-900 p-4 rounded-lg border border-slate-850">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-[9px]">1</span>
                  <span><strong>Prediction engine completes run</strong> (Risk Score = 78)</span>
                </div>
                <div className="pl-3 border-l border-slate-800 py-1 text-[9px] text-indigo-400">
                  ├─ Exceeds defined warning limits (Threshold: 70)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-[9px]">2</span>
                  <span><strong>Query top 3 critical path tasks</strong> requiring remediation.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-[9px]">3</span>
                  <span><strong>Synthesize mitigation scenario schedules</strong> (Estimate savings).</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-[9px]">4</span>
                  <span><strong>Push message alert:</strong> Triggers Slack, Microsoft Teams and Emails.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
