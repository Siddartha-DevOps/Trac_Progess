import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Activity,
  Database,
  Cpu,
  Layers,
  Workflow,
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
  MapPin
} from "lucide-react";

// Types for Progress Engine
interface TradeItem {
  id: string;
  name: string;
  category: "Structural" | "MEP" | "Finishes" | "Exterior";
  totalQty: number;
  installedQty: number;
  unit: string;
  unitWeight: number; // weight in composite calculations (e.g. cost or complexity)
  laborHoursPaid: number;
  plannedDays: number;
}

interface HistoricalData {
  week: string;
  completedPercent: number;
  laborHoursUsed: number;
}

interface WeightItem {
  progress: number;
  weight: number;
}

export default function ProgressEngineDesign() {
  // Navigation tabs for the Progress Engine Spec
  const [activeSubTab, setActiveSubTab] = useState<"sandbox" | "algorithms" | "database" | "apis" | "workflows">("sandbox");

  // --- SANDBOX CALCULATOR STATE ---
  const [trades, setTrades] = useState<TradeItem[]>([
    { id: "t1", name: "Structural Concrete (Columns & Slabs)", category: "Structural", totalQty: 4500, installedQty: 3200, unit: "m³", unitWeight: 180, laborHoursPaid: 950, plannedDays: 45 },
    { id: "t2", name: "Steel Reinforcement / Rebar", category: "Structural", totalQty: 250, installedQty: 210, unit: "Tons", unitWeight: 120, laborHoursPaid: 620, plannedDays: 30 },
    { id: "t3", name: "HVAC Ductwork & Dampers", category: "MEP", totalQty: 1200, installedQty: 450, unit: "m", unitWeight: 45, laborHoursPaid: 480, plannedDays: 40 },
    { id: "t4", name: "Drywall Partitioning & Framing", category: "Finishes", totalQty: 8500, installedQty: 1800, unit: "m²", unitWeight: 25, laborHoursPaid: 520, plannedDays: 50 },
    { id: "t5", name: "Glazing & Curtain Walls", category: "Exterior", totalQty: 1800, installedQty: 1200, unit: "m²", unitWeight: 110, laborHoursPaid: 400, plannedDays: 35 }
  ]);

  // Spatial Hierarchical Progress Weights
  const [floorWeights, setFloorWeights] = useState<Record<string, WeightItem>>({
    floor1: { progress: 85, weight: 1.2 },
    floor2: { progress: 60, weight: 1.0 },
    floor3: { progress: 25, weight: 1.0 },
    floor4: { progress: 5, weight: 0.8 }
  });

  const [roomWeights, setRoomWeights] = useState<Record<string, WeightItem>>({
    electricalRoom: { progress: 90, weight: 1.5 },
    corridorNorth: { progress: 45, weight: 0.8 },
    officeSuiteA: { progress: 70, weight: 1.0 },
    mechanicalPenthouse: { progress: 15, weight: 2.0 }
  });

  const [laborHoursPeriod, setLaborHoursPeriod] = useState<number>(160); // current week/period active hours

  // Historical snaps for Week-on-Week & Month-on-Month pace
  const [historicalTimeline, setHistoricalTimeline] = useState<HistoricalData[]>([
    { week: "Wk -4", completedPercent: 42, laborHoursUsed: 710 },
    { week: "Wk -3", completedPercent: 46, laborHoursUsed: 780 },
    { week: "Wk -2", completedPercent: 51, laborHoursUsed: 800 },
    { week: "Wk -1", completedPercent: 55, laborHoursUsed: 750 },
    { week: "Current", completedPercent: 59.4, laborHoursUsed: 820 } // Calculated dynamically below, but stored as reference
  ]);

  // Simulation controls
  const [isSimulatingCVBatch, setIsSimulatingCVBatch] = useState(false);
  const [simLog, setSimLog] = useState<string[]>(["Sandbox ready. Modify table parameters directly to trigger recalculations."]);

  // --- DERIVED METRICS CALCULATIONS ---

  // 1. Quantities & Weights calculations
  let totalWeightedWork = 0;
  let completedWeightedWork = 0;
  let totalInstalledQty = 0;
  let totalTotalQty = 0;
  let totalMissingQty = 0;
  let totalLaborHoursPaid = 0;

  trades.forEach(trade => {
    const tradeTotalWeight = trade.totalQty * trade.unitWeight;
    const tradeCompletedWeight = trade.installedQty * trade.unitWeight;
    totalWeightedWork += tradeTotalWeight;
    completedWeightedWork += tradeCompletedWeight;

    totalInstalledQty += trade.installedQty;
    totalTotalQty += trade.totalQty;
    totalMissingQty += (trade.totalQty - trade.installedQty);
    totalLaborHoursPaid += trade.laborHoursPaid;
  });

  const overallCompletedPercent = totalWeightedWork > 0 ? (completedWeightedWork / totalWeightedWork) * 100 : 0;
  const overallRemainingWork = totalWeightedWork - completedWeightedWork;

  // 2. Spatial Index Aggregations
  // Building Progress aggregated from floors weighted
  let sumFloorWeightedProgress = 0;
  let sumFloorWeight = 0;
  (Object.values(floorWeights) as WeightItem[]).forEach(f => {
    sumFloorWeightedProgress += f.progress * f.weight;
    sumFloorWeight += f.weight;
  });
  const buildingProgress = sumFloorWeight > 0 ? sumFloorWeightedProgress / sumFloorWeight : 0;

  // Composite Room Progress
  let sumRoomWeightedProgress = 0;
  let sumRoomWeight = 0;
  (Object.values(roomWeights) as WeightItem[]).forEach(r => {
    sumRoomWeightedProgress += r.progress * r.weight;
    sumRoomWeight += r.weight;
  });
  const avgRoomProgress = sumRoomWeight > 0 ? sumRoomWeightedProgress / sumRoomWeight : 0;

  // 3. Productivity & Pace (Run-rate Velocity)
  // Productivity = Units Installed / Man-Hour
  const compositeProductivity = totalLaborHoursPaid > 0 ? (totalInstalledQty / totalLaborHoursPaid) : 0;

  // Pace Calculation (Velocity = delta progress per week over the last month)
  // Let's compute delta progress from Wk -4 (42%) to Current (~59.4%)
  const startingPercent = historicalTimeline[0].completedPercent;
  const deltaProgress = overallCompletedPercent - startingPercent;
  const weeksElapsed = 4;
  const weeklyPaceRate = deltaProgress / weeksElapsed; // progress points per week
  const monthlyPaceRate = weeklyPaceRate * 4.34; // progress points per month

  // Estimated Weeks to Completion (ETC) based on remaining percentage and weekly pace rate
  const remainingPercent = 100 - overallCompletedPercent;
  const estimatedWeeksToComplete = weeklyPaceRate > 0 ? (remainingPercent / weeklyPaceRate) : 999;

  // Handle manual trade input modifications
  const handleUpdateQty = (id: string, field: "installedQty" | "totalQty" | "laborHoursPaid", value: number) => {
    setTrades(prev => prev.map(t => {
      if (t.id === id) {
        let clampedVal = Math.max(0, value);
        if (field === "installedQty") {
          clampedVal = Math.min(t.totalQty, clampedVal); // Installed cannot exceed total
        }
        return { ...t, [field]: clampedVal };
      }
      return t;
    }));
  };

  // Run a computer vision batch simulation to update progress in real-time
  const handleTriggerCVSimulation = () => {
    if (isSimulatingCVBatch) return;
    setIsSimulatingCVBatch(true);
    setSimLog(prev => [
      ...prev,
      `▶ [${new Date().toLocaleTimeString()}] Triggering Computer Vision Reality Capture Sync Engine...`,
      `[CV-PIPELINE] Downloading high-resolution 360-degree helmet frames and drone point-clouds (Payload: 4.2GB)`,
      `[CV-PIPELINE] Initializing alignment with BIM spatial model coordinate maps (Octree Depth: 4)`
    ]);

    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step === 2) {
        setSimLog(prev => [
          ...prev,
          `[STAGE 1/3] Mesh semantic segmentation model active (ResNet-101 3D back-bone)...`,
          `├─ Recognized 14 concrete columns on Level 2 with >96.5% confidence.`,
          `├─ Identified 125 meters of insulated copper hydronic piping on Level 1.`,
          `└─ Identified missing drywall sheets on North corridor (Level 3).`
        ]);
      } else if (step === 3) {
        setSimLog(prev => [
          ...prev,
          `[STAGE 2/3] Comparing segmented visual mesh contours against BIM geometry definitions...`,
          `├─ Calculated local volumetric concrete match: 35.2m³ verified.`,
          `├─ Drywall completion updated on Level 3 North by +420m².`,
          `└─ Running statistical anomaly checker: Gaps within standard tolerances.`
        ]);
        
        // Actually modify state to show changes!
        setTrades(prev => prev.map(t => {
          if (t.id === "t1") return { ...t, installedQty: Math.min(t.totalQty, t.installedQty + 80) }; // concrete installed increases
          if (t.id === "t3") return { ...t, installedQty: Math.min(t.totalQty, t.installedQty + 40) }; // HVAC increases
          if (t.id === "t4") return { ...t, installedQty: Math.min(t.totalQty, t.installedQty + 350) }; // drywall increases
          return t;
        }));

        setFloorWeights(prev => ({
          ...prev,
          floor3: { ...prev.floor3, progress: Math.min(100, prev.floor3.progress + 15) }
        }));

        setRoomWeights(prev => ({
          ...prev,
          corridorNorth: { ...prev.corridorNorth, progress: Math.min(100, prev.corridorNorth.progress + 25) }
        }));

      } else if (step === 4) {
        setSimLog(prev => [
          ...prev,
          `[STAGE 3/3] Committing updated quantities to DB...`,
          `├─ Updated 3 Trade Records, 2 Floor Records, and 1 Room spatial containment.`,
          `🎉 Progress ingestion completed successfully. Relational databases updated and sync event emitted to browser gateways.`
        ]);
        setIsSimulatingCVBatch(false);
        clearInterval(interval);
      }
    }, 1200);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-2xl flex flex-col gap-6 w-full mt-6">
      
      {/* Top Main Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Construction Progress Engine Spec</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Core progress calculator: Integrates Computer Vision segmentations, BIM model metadata, and multi-spatial aggregation hierarchies.
          </p>
        </div>

        {/* Engine Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 text-xs flex-wrap gap-1 md:flex-nowrap">
          <button
            onClick={() => setActiveSubTab("sandbox")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeSubTab === "sandbox" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calculator className="w-4 h-4" />
            Progress Sandbox
          </button>
          <button
            onClick={() => setActiveSubTab("algorithms")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeSubTab === "algorithms" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Binary className="w-4 h-4" />
            Calculated Algorithms
          </button>
          <button
            onClick={() => setActiveSubTab("database")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeSubTab === "database" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-4 h-4" />
            Database Design
          </button>
          <button
            onClick={() => setActiveSubTab("apis")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeSubTab === "apis" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Workflow className="w-4 h-4" />
            API Specifications
          </button>
          <button
            onClick={() => setActiveSubTab("workflows")}
            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-semibold ${
              activeSubTab === "workflows" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Ingestion Workflows
          </button>
        </div>
      </div>

      {/* =========================================
          TAB 1: PROGRESS SANDBOX
          ========================================= */}
      {activeSubTab === "sandbox" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left Panel: Real-time calculation aggregates (8 columns) */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Completed %</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{overallCompletedPercent.toFixed(1)}%</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Weighted composite</p>
                <div className="absolute right-2 bottom-2 text-emerald-500/15">
                  <CheckCircle className="w-12 h-12 stroke-1" />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Remaining Work</span>
                <span className="text-xl font-black text-white font-mono">{(overallRemainingWork / 1000).toFixed(1)}k pt</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Weighted metric sum</p>
                <div className="absolute right-2 bottom-2 text-slate-800">
                  <Activity className="w-12 h-12 stroke-1" />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Installed Qty</span>
                <span className="text-xl font-black text-indigo-400 font-mono">{totalInstalledQty.toLocaleString()}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Physical items</p>
                <div className="absolute right-2 bottom-2 text-indigo-500/15">
                  <Database className="w-12 h-12 stroke-1" />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Missing Qty</span>
                <span className="text-xl font-black text-amber-500 font-mono">{totalMissingQty.toLocaleString()}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Remaining to install</p>
                <div className="absolute right-2 bottom-2 text-amber-500/15">
                  <AlertTriangle className="w-12 h-12 stroke-1" />
                </div>
              </div>
            </div>

            {/* Trade Progress Sandbox Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    Trade Item Progress Sandbox
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure installed quantities to simulate how the composite algorithm re-calculates progress metrics.
                  </p>
                </div>
                <button
                  onClick={handleTriggerCVSimulation}
                  disabled={isSimulatingCVBatch}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                    isSimulatingCVBatch
                      ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500 border-indigo-700 text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CV Reality Sync</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <th className="pb-2 font-bold">Trade Details</th>
                      <th className="pb-2 font-bold text-center">Completed %</th>
                      <th className="pb-2 font-bold">Installed Qty</th>
                      <th className="pb-2 font-bold">Total Qty</th>
                      <th className="pb-2 font-bold text-center">Unit Weight</th>
                      <th className="pb-2 font-bold">Labor Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map(trade => {
                      const completePct = trade.totalQty > 0 ? (trade.installedQty / trade.totalQty) * 100 : 0;
                      return (
                        <tr key={trade.id} className="border-b border-slate-900/60 hover:bg-slate-900/20 transition">
                          <td className="py-3">
                            <span className="font-bold text-white block">{trade.name}</span>
                            <span className="text-[9px] uppercase font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850">
                              {trade.category}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                              completePct > 80 ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" :
                              completePct > 40 ? "bg-indigo-950/40 text-indigo-400 border border-indigo-900/30" :
                              "bg-amber-950/40 text-amber-500 border border-amber-900/30"
                            }`}>
                              {completePct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1 text-slate-300">
                              <input
                                type="number"
                                value={trade.installedQty}
                                onChange={(e) => handleUpdateQty(trade.id, "installedQty", parseInt(e.target.value) || 0)}
                                className="w-16 bg-slate-900 border border-slate-800 p-1 rounded font-mono text-xs text-white"
                              />
                              <span className="text-[11px] text-slate-500 font-mono">{trade.unit}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1 text-slate-300">
                              <input
                                type="number"
                                value={trade.totalQty}
                                onChange={(e) => handleUpdateQty(trade.id, "totalQty", parseInt(e.target.value) || 0)}
                                className="w-16 bg-slate-900 border border-slate-800 p-1 rounded font-mono text-xs text-white"
                              />
                              <span className="text-[11px] text-slate-500 font-mono">{trade.unit}</span>
                            </div>
                          </td>
                          <td className="py-3 text-center font-mono text-slate-400 font-semibold">
                            {trade.unitWeight}
                          </td>
                          <td className="py-3">
                            <input
                              type="number"
                              value={trade.laborHoursPaid}
                              onChange={(e) => handleUpdateQty(trade.id, "laborHoursPaid", parseInt(e.target.value) || 0)}
                              className="w-16 bg-slate-900 border border-slate-800 p-1 rounded font-mono text-xs text-white"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hierarchical Spatial Progress Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Floor-by-Floor Progress */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Floor-by-Floor Progress
                </span>
                
                <div className="flex flex-col gap-3.5">
                  {(Object.entries(floorWeights) as [string, WeightItem][]).map(([floor, data]) => (
                    <div key={floor} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-300 capitalize">{floor.replace("floor", "Level ")}</span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-500">Weight: {data.weight}x</span>
                          <span className="text-emerald-400 font-bold">{data.progress}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={data.progress}
                          onChange={(e) => setFloorWeights(prev => ({
                            ...prev,
                            [floor]: { ...prev[floor as keyof typeof floorWeights], progress: parseInt(e.target.value) }
                          }))}
                          className="w-full accent-emerald-500 bg-slate-900 h-1 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850/80 mt-1 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-semibold uppercase font-mono text-[9px]">Composite Building Progress:</span>
                  <span className="font-bold text-white font-mono bg-indigo-950/40 text-indigo-300 px-2 py-0.5 rounded border border-indigo-900/20">{buildingProgress.toFixed(1)}%</span>
                </div>
              </div>

              {/* Room-by-Room Spatial Progress */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-pink-400" />
                  Room Containment (IfcSpace) Progress
                </span>

                <div className="flex flex-col gap-3.5">
                  {(Object.entries(roomWeights) as [string, WeightItem][]).map(([room, data]) => (
                    <div key={room} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-300 capitalize">{room.replace(/([A-Z])/g, ' $1')}</span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-500">Weight: {data.weight}x</span>
                          <span className="text-pink-400 font-bold">{data.progress}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={data.progress}
                          onChange={(e) => setRoomWeights(prev => ({
                            ...prev,
                            [room]: { ...prev[room as keyof typeof roomWeights], progress: parseInt(e.target.value) }
                          }))}
                          className="w-full accent-pink-500 bg-slate-900 h-1 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850/80 mt-1 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-semibold uppercase font-mono text-[9px]">Average Room Level Progress:</span>
                  <span className="font-bold text-white font-mono bg-pink-950/40 text-pink-300 px-2 py-0.5 rounded border border-pink-900/20">{avgRoomProgress.toFixed(1)}%</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Panel: Analytics, Pace and CV Log feed (4 columns) */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Run-rate Productivity & Pace */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  Productivity & Pace Forecast
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Derived run-rates based on historical completed work increments and man-hour logs.
                </p>
              </div>

              {/* Stats lists */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                  <span className="text-xs text-slate-400">Composite Productivity</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-xs">{compositeProductivity.toFixed(2)} units</span>
                    <span className="text-[10px] text-slate-500 block">per labor man-hour</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                  <span className="text-xs text-slate-400">Weekly Progress Pace</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-xs">+{weeklyPaceRate.toFixed(2)}%</span>
                    <span className="text-[10px] text-slate-500 block">progress points / wk</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                  <span className="text-xs text-slate-400">Monthly Run-rate</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-xs">+{monthlyPaceRate.toFixed(2)}%</span>
                    <span className="text-[10px] text-slate-500 block">progress points / month</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-1">
                  <span className="text-xs text-slate-400">Estimated Project ETC</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-400 text-xs">{estimatedWeeksToComplete.toFixed(1)} weeks</span>
                    <span className="text-[10px] text-slate-500 block">at current installation pace</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-950/20 border border-amber-900/30 p-3 rounded-lg flex items-start gap-2.5 text-[11px] text-amber-300">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Pace Projection Model:</strong> Estimates assume linear progression of trade vectors. In practice, concrete works have high initial weights, and MEP installations depend on framing completeness.
                </p>
              </div>
            </div>

            {/* Ingestion Monitor Log Panel */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">
                CV segment - Progress update log
              </span>
              <div className="h-[250px] bg-slate-900 border border-slate-850 rounded-lg p-3 font-mono text-[10px] text-slate-300 overflow-y-auto flex flex-col gap-2 relative leading-relaxed">
                {simLog.map((log, i) => (
                  <div key={i} className={
                    log.startsWith("🎉") ? "text-emerald-400 font-semibold" :
                    log.startsWith("▶") ? "text-indigo-400 font-semibold" :
                    log.startsWith("[STAGE") ? "text-amber-400" : "text-slate-300"
                  }>
                    {log}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Clicking the <strong>"CV Reality Sync"</strong> simulation updates the installed quantities on structural concrete and drywall, which immediately cascadingly recomputes all sandbox indicators.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* =========================================
          TAB 2: CALCULATED ALGORITHMS
          ========================================= */}
      {activeSubTab === "algorithms" && (
        <div className="flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
              COMPUTATION ENGINE / SPEC v1.1
            </span>
            <h3 className="text-xl font-black text-white mt-2">Core Progress Formulation & Algorithms</h3>
            <p className="text-xs text-slate-400 mt-1">
              Rigorous mathematical specs and step-by-step pseudo-code governing our construction state validation pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Quantities & Weights Formulas */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col gap-3">
              <h4 className="text-white font-bold text-sm uppercase font-mono tracking-wider border-b border-slate-900 pb-2">
                1. Installed vs Missing Work Quantities
              </h4>
              <p className="text-slate-400 text-[11px]">
                To maintain physical consistency, our progress engine calculates absolute material counts directly extracted from verified scan meshes.
              </p>

              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-2 font-mono text-[11px] text-indigo-300">
                <div className="text-white font-bold mb-1">// Installed Quantity</div>
                <div>Q_inst = Sum( q_v ) for all verified segmented physical entities</div>
                <div className="text-white font-bold mt-2">// Missing Quantity</div>
                <div>Q_miss = Q_total - Q_inst</div>
                <div className="text-white font-bold mt-2">// Completed Work (Weighted Index)</div>
                <div>CW_weighted = Sum( q_v * W_t ) for each trade category t</div>
              </div>

              <div className="text-[11px] text-slate-500 leading-normal">
                Where $W_t$ represents the structural weight coefficient representing financial value, complexity multiplier, or material unit cost, preventing minor finishes from skewing structural slab schedules.
              </div>
            </div>

            {/* 2. Hierarchical Spatial Aggregations */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col gap-3">
              <h4 className="text-white font-bold text-sm uppercase font-mono tracking-wider border-b border-slate-900 pb-2">
                2. Spatial Hierarchical Aggregation
              </h4>
              <p className="text-slate-400 text-[11px]">
                Spatial aggregations propagate progress values bottom-up from discrete spaces (IfcSpace) to storeys (IfcBuildingStorey) up to the building node.
              </p>

              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-2 font-mono text-[11px] text-indigo-300">
                <div className="text-white font-bold mb-1">// Storey Progress Formula</div>
                <div>P_storey = Sum( P_element * W_element ) / Sum( W_element )</div>
                <div className="text-white font-bold mt-2">// Room Progress Formula</div>
                <div>P_space = Sum( P_contained_elements * W_e ) / Sum( W_e )</div>
                <div className="text-white font-bold mt-2">// composite Building Progress</div>
                <div>P_building = Sum( P_storey_i * W_storey_i )</div>
              </div>

              <div className="text-[11px] text-slate-500 leading-normal">
                This bottom-up traversal ensures that the overall building completion rate is derived directly from the physical progress of its component spaces and levels, avoiding subjective manual estimates.
              </div>
            </div>

            {/* 3. Temporal Snapshot Pace */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col gap-3">
              <h4 className="text-white font-bold text-sm uppercase font-mono tracking-wider border-b border-slate-900 pb-2">
                3. Temporal Progress snap Rates
              </h4>
              <p className="text-slate-400 text-[11px]">
                Tracks the rate of installation across consistent windows to establish clear week-on-week and month-on-month trendlines.
              </p>

              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-2 font-mono text-[11px] text-indigo-300">
                <div className="text-white font-bold mb-1">// Weekly Progress Delta</div>
                <div>Delta_Wk = CW(t_now) - CW(t_now - 7 days)</div>
                <div className="text-white font-bold mt-2">// Monthly Progress Delta</div>
                <div>Delta_Mo = CW(t_now) - CW(t_now - 30 days)</div>
                <div className="text-white font-bold mt-2">// Pace (Velocity run-rate)</div>
                <div>V_pace = Delta_Wk / 7.0 (Completion percentage points per day)</div>
              </div>
            </div>

            {/* 4. Productivity & Forecasting */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col gap-3">
              <h4 className="text-white font-bold text-sm uppercase font-mono tracking-wider border-b border-slate-900 pb-2">
                4. Productivity & ETC Forecasting
              </h4>
              <p className="text-slate-400 text-[11px]">
                Calculates site productivity metrics and projects completion horizons based on rolling averages of labor expenditure.
              </p>

              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-850 flex flex-col gap-2 font-mono text-[11px] text-indigo-300">
                <div className="text-white font-bold mb-1">// Labor Productivity</div>
                <div>Productivity = Delta_Q_installed / Total_Labor_Hours</div>
                <div className="text-white font-bold mt-2">// Estimated Time to Complete (Weeks)</div>
                <div>ETC_weeks = (100% - P_current) / (V_pace * 7.0)</div>
                <div className="text-white font-bold mt-2">// Projected Completion Timestamp</div>
                <div>Date_completion = Date_now + ETC_weeks * 7 days</div>
              </div>
            </div>

          </div>

          {/* Core Procedural Pipeline Algorithm Block */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-3 mt-2">
            <h4 className="text-white font-bold text-xs uppercase font-mono tracking-wider">
              Core Ingestion & Calculation Engine Logic Pipeline (TS Pseudocode)
            </h4>
            <p className="text-slate-400 text-[11px]">
              This is the algorithmic pipeline run on background queues when physical segmentations are submitted. It recursively calculates quantities and propagates values through spatial containment and trade schedules.
            </p>
            <pre className="p-4 bg-slate-900 text-indigo-300 rounded-xl border border-slate-850 font-mono text-[10px] overflow-x-auto leading-relaxed">
{`export async function calculateBuildingProgressPipeline(buildingId: string): Promise<ProgressReport> {
  // 1. Fetch all trades associated with the building and compute individual completion states
  const trades = await db.select().from(TradeItems).where(eq(TradeItems.buildingId, buildingId));
  
  let totalWeightedTarget = 0;
  let totalWeightedCompleted = 0;
  
  const tradeDetails = trades.map(trade => {
    const installed = trade.installedQty;
    const total = trade.totalQty;
    const missing = Math.max(0, total - installed);
    const completePercent = total > 0 ? (installed / total) * 100 : 0;
    
    // Calculate weights based on resource complexity & units
    const weightedTarget = total * trade.unitWeight;
    const weightedCompleted = installed * trade.unitWeight;
    
    totalWeightedTarget += weightedTarget;
    totalWeightedCompleted += weightedCompleted;
    
    return {
      tradeId: trade.id,
      completePercent,
      missingQty: missing,
      installedQty: installed,
      productivity: trade.laborHoursPaid > 0 ? (installed / trade.laborHoursPaid) : 0
    };
  });

  const overallCompletedPercent = totalWeightedTarget > 0 ? (totalWeightedCompleted / totalWeightedTarget) * 100 : 0;

  // 2. Fetch spatial levels containment mapping and calculate Level-by-Level progress
  const levels = await db.select().from(BuildingLevels).where(eq(BuildingLevels.buildingId, buildingId));
  const levelProgresses = await Promise.all(levels.map(async (level) => {
    // Aggregation of elements matching spatial level ID
    const elements = await db.select().from(BimElements)
      .where(and(eq(BimElements.levelId, level.id), eq(BimElements.isActive, true)));
      
    let levelWeightedSum = 0;
    let levelWeightTotal = 0;
    
    elements.forEach(elem => {
      levelWeightedSum += elem.installationProgress * elem.weight;
      levelWeightTotal += elem.weight;
    });
    
    const calculatedLevelProgress = levelWeightTotal > 0 ? (levelWeightedSum / levelWeightTotal) : 0;
    
    // Save calculated progress back to db
    await db.update(BuildingLevels).set({ progress: calculatedLevelProgress }).where(eq(BuildingLevels.id, level.id));
    return { levelId: level.id, progress: calculatedLevelProgress, weight: level.weight };
  }));

  // 3. Compute Composite Building Progress
  let buildingWeightedSum = 0;
  let buildingWeightTotal = 0;
  levelProgresses.forEach(lvl => {
    buildingWeightedSum += lvl.progress * lvl.weight;
    buildingWeightTotal += lvl.weight;
  });
  const buildingProgress = buildingWeightTotal > 0 ? (buildingWeightedSum / buildingWeightTotal) : 0;

  // 4. Calculate historical pacing
  const lastSnap = await db.select().from(ProgressSnapshots)
    .where(eq(ProgressSnapshots.buildingId, buildingId))
    .orderBy(desc(ProgressSnapshots.capturedAt))
    .limit(1);

  const prevPercent = lastSnap[0]?.completedPercent ?? overallCompletedPercent;
  const daysElapsed = lastSnap[0] ? (Date.now() - lastSnap[0].capturedAt.getTime()) / (1000 * 60 * 60 * 24) : 7;
  const weeklyPace = daysElapsed > 0 ? ((overallCompletedPercent - prevPercent) / daysElapsed) * 7 : 0;

  // 5. Create new snapshot record
  await db.insert(ProgressSnapshots).values({
    buildingId,
    completedPercent: overallCompletedPercent,
    capturedAt: new Date(),
    paceWeeklyDelta: weeklyPace
  });

  return {
    buildingId,
    overallCompletedPercent,
    buildingProgress,
    tradeDetails,
    levelDetails: levelProgresses,
    weeklyPace,
    estimatedWeeksToComplete: weeklyPace > 0 ? (100 - overallCompletedPercent) / weeklyPace : 999
  };
}`}
            </pre>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 3: DATABASE DESIGN
          ========================================= */}
      {activeSubTab === "database" && (
        <div className="flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
              PostgreSQL Schema Definition
            </span>
            <h3 className="text-xl font-black text-white mt-2">Relational Progress Database Schemas</h3>
            <p className="text-xs text-slate-400 mt-1">
              Data architecture and ORM designs storing spatial items, tracking histories, productivity coefficients, and logs.
            </p>
          </div>

          {/* Database ERD Text Mapping and Schema Specs */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Table Schemas Listing */}
            <div className="xl:col-span-2 flex flex-col gap-4">
              
              {/* Table 1: ProgressMetrics */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="font-bold text-white text-sm font-mono text-emerald-400">table: progress_metrics</span>
                  <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-800 font-mono">PRIMARY KEY: id (uuid)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono text-slate-400">
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">building_id:</span>
                    <span className="text-slate-200">uuid (FK)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">trade_id:</span>
                    <span className="text-slate-200">uuid (FK, nullable)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">installed_quantity:</span>
                    <span className="text-indigo-300">numeric(12,2)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">missing_quantity:</span>
                    <span className="text-indigo-300">numeric(12,2)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">completed_percentage:</span>
                    <span className="text-emerald-400">numeric(5,2)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">man_hours_logged:</span>
                    <span className="text-indigo-300">integer</span>
                  </div>
                </div>
              </div>

              {/* Table 2: spatial_containment_progress */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="font-bold text-white text-sm font-mono text-pink-400">table: spatial_containment_progress</span>
                  <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-800 font-mono">PRIMARY KEY: id (uuid)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono text-slate-400">
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">spatial_node_id:</span>
                    <span className="text-slate-200">uuid (FK)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">node_type:</span>
                    <span className="text-slate-200">varchar("floor"|"room"|"site")</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">aggregated_progress:</span>
                    <span className="text-emerald-400">numeric(5,2)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">containment_weight:</span>
                    <span className="text-indigo-300">numeric(4,2)</span>
                  </div>
                </div>
              </div>

              {/* Table 3: progress_historical_snapshots */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="font-bold text-white text-sm font-mono text-indigo-400">table: progress_historical_snapshots</span>
                  <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-800 font-mono">PRIMARY KEY: id (uuid)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono text-slate-400">
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">building_id:</span>
                    <span className="text-slate-200">uuid (FK)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">snapshot_period:</span>
                    <span className="text-slate-200">varchar("weekly"|"monthly")</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">completed_percentage:</span>
                    <span className="text-emerald-400">numeric(5,2)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">productivity_factor:</span>
                    <span className="text-indigo-300">numeric(8,4)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">calculated_pace_delta:</span>
                    <span className="text-indigo-300">numeric(5,2)</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                    <span className="text-slate-500">captured_at:</span>
                    <span className="text-slate-200">timestamp</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ORM & DB Index Specifications */}
            <div className="flex flex-col gap-4">
              
              {/* Drizzle ORM Snippet */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Drizzle TS schema</span>
                <pre className="p-3 bg-slate-900 text-indigo-300 rounded border border-slate-850 font-mono text-[9px] overflow-x-auto leading-normal">
{`import { pgTable, uuid, varchar, numeric, integer, timestamp, index } from "drizzle-orm/pg-core";

export const progressMetrics = pgTable("progress_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  buildingId: uuid("building_id").notNull(),
  tradeId: uuid("trade_id"),
  installedQuantity: numeric("installed_qty", { precision: 12, scale: 2 }).notNull(),
  missingQuantity: numeric("missing_qty", { precision: 12, scale: 2 }).notNull(),
  completedPercentage: numeric("completed_pct", { precision: 5, scale: 2 }).notNull(),
  manHoursLogged: integer("man_hours_logged").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    buildingIdx: index("pm_building_idx").on(table.buildingId),
    tradeIdx: index("pm_trade_idx").on(table.tradeId),
  };
});`}
                </pre>
              </div>

              {/* DB Schema Indexes Block */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Database Indexing Strategy</span>
                <div className="flex flex-col gap-2 text-[11px] text-slate-400">
                  <div className="bg-slate-900/60 p-2 rounded">
                    <strong className="text-white">Spatial Hierarchical Indexes:</strong> Composite index on <code>(spatial_node_id, node_type)</code> minimizes JOIN latencies during recursive tree aggregations.
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded">
                    <strong className="text-white">Snapshot Chronological Indexes:</strong> Index on <code>(building_id, captured_at DESC)</code> ensures instantaneous rendering of weekly/monthly velocity snapshots.
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* =========================================
          TAB 4: API SPECIFICATIONS
          ========================================= */}
      {activeSubTab === "apis" && (
        <div className="flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
              REST & WebSockets Gateway Specifications
            </span>
            <h3 className="text-xl font-black text-white mt-2">API Endpoints & Payloads</h3>
            <p className="text-xs text-slate-400 mt-1">
              Industrial interfaces allowing external reality capture devices, helmet cameras, and dashboard portals to feed or retrieve progress vectors.
            </p>
          </div>

          {/* Endpoints block */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Endpoints specification */}
            <div className="flex flex-col gap-4">
              
              {/* Endpoint 1 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-black font-mono text-[9px] uppercase border border-emerald-900">GET</span>
                  <span className="font-mono font-bold text-white text-xs">/api/v1/progress/:building_id</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Retrieves high-level composite completion, floor-by-floor stats, aggregated trade lists, productivity indices, and estimated pacing data.
                </p>

                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Response Payload:</span>
                <pre className="p-3 bg-slate-900 text-indigo-300 rounded border border-slate-850 font-mono text-[9px] overflow-x-auto leading-normal">
{`{
  "status": "success",
  "data": {
    "building_id": "9a3f2d1e-8b4c-47ea-aef1-18cb9bf30e12",
    "completed_pct": 59.4,
    "remaining_work_points": 24200.5,
    "installed_qty": 7850,
    "missing_qty": 3400,
    "weekly_pace_delta": 4.5,
    "etc_weeks": 9.0,
    "productivity_factor": 2.15,
    "levels": [
      { "level_id": "l1", "progress": 85.0, "weight": 1.2 },
      { "level_id": "l2", "progress": 60.0, "weight": 1.0 }
    ]
  }
}`}
                </pre>
              </div>

              {/* Endpoint 2 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-black font-mono text-[9px] uppercase border border-blue-900">POST</span>
                  <span className="font-mono font-bold text-white text-xs">/api/v1/progress/reality-sync</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Enqueues a processing job into the queue system to segment reality footage models and update database progress items.
                </p>

                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Request Payload:</span>
                <pre className="p-3 bg-slate-900 text-indigo-300 rounded border border-slate-850 font-mono text-[9px] overflow-x-auto leading-normal">
{`{
  "building_id": "9a3f2d1e-8b4c-47ea-aef1-18cb9bf30e12",
  "capture_session_id": "sess_88d3e2",
  "media_type": "drone_mesh_3d",
  "coordinate_offset": { "x": 12.5, "y": 24.8, "z": 5.2 }
}`}
                </pre>
              </div>

            </div>

            {/* WebSockets Real-time Stream */}
            <div className="flex flex-col gap-4">
              
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 font-black font-mono text-[9px] uppercase border border-purple-900">WS</span>
                  <span className="font-mono font-bold text-white text-xs">/api/v1/progress/live-stream</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Continuous duplex WebSocket connection broadcast to dashboard browsers, pushing live status frames during computer vision mesh segmentations and database updates.
                </p>

                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">WS Event Broadcast Payload:</span>
                <pre className="p-3 bg-slate-900 text-indigo-300 rounded border border-slate-850 font-mono text-[9px] overflow-x-auto leading-normal">
{`{
  "event": "PROGRESS_UPDATED",
  "timestamp": "2026-07-09T14:25:32.480Z",
  "payload": {
    "building_id": "9a3f2d1e-8b4c-47ea-aef1-18cb9bf30e12",
    "updated_trade_id": "t1",
    "old_installed_qty": 3120,
    "new_installed_qty": 3200,
    "new_completed_pct": 71.1,
    "triggered_by": "cv_ingestion_pipeline"
  }
}`}
                </pre>
              </div>

              {/* API Security & Rate limits */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gateway Integration Rules</span>
                <div className="flex flex-col gap-2.5 text-[11px] text-slate-400 leading-relaxed">
                  <div className="bg-slate-900/60 p-2.5 rounded border border-slate-900">
                    <strong className="text-white block mb-0.5">JWT Authorization:</strong>
                    All requests require a Bearer token with <code>write:progress</code> scopes for ingestion endpoints, ensuring only verified on-site telemetry devices can update physical states.
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded border border-slate-900">
                    <strong className="text-white block mb-0.5">Rate Limiting:</strong>
                    Ingestion synchronization requests are limited to 10 per minute per client key, routing excessive streams into high-availability SQS/Redis caches.
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* =========================================
          TAB 5: WORKFLOWS
          ========================================= */}
      {activeSubTab === "workflows" && (
        <div className="flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] uppercase font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
              Operational pipeline Flowcharts
            </span>
            <h3 className="text-xl font-black text-white mt-2">Reality-to-Dashboard Workflow</h3>
            <p className="text-xs text-slate-400 mt-1">
              Visual pipeline detailing how point clouds, photogrammetry, and telemetry are processed, aligned with BIM models, validated, and pushed to active stakeholders.
            </p>
          </div>

          {/* Workflow Sequence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-2.5 relative">
              <div className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500 text-indigo-400 flex items-center justify-center font-bold text-xs">1</div>
              <span className="font-bold text-white text-xs block">Reality Capture</span>
              <p className="text-[11px] text-slate-400">
                Drone cameras, 360 helmet rigs, or LiDAR scanners upload continuous visual point cloud models.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-2.5 relative">
              <div className="w-6 h-6 rounded-full bg-amber-600/20 border border-amber-500 text-amber-400 flex items-center justify-center font-bold text-xs">2</div>
              <span className="font-bold text-white text-xs block">Coordinate Align</span>
              <p className="text-[11px] text-slate-400">
                WASM transformation matrices align localized scan coordinates to real global building origins.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-2.5 relative">
              <div className="w-6 h-6 rounded-full bg-purple-600/20 border border-purple-500 text-purple-400 flex items-center justify-center font-bold text-xs">3</div>
              <span className="font-bold text-white text-xs block">BIM Segmentation</span>
              <p className="text-[11px] text-slate-400">
                AI object segmentation identifies individual walls, ducts, and columns out of point clouds.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-2.5 relative">
              <div className="w-6 h-6 rounded-full bg-pink-600/20 border border-pink-500 text-pink-400 flex items-center justify-center font-bold text-xs">4</div>
              <span className="font-bold text-white text-xs block">Quantity Compute</span>
              <p className="text-[11px] text-slate-400">
                Compares installed elements to physical BIM models, calculating exact missing values.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-2.5 relative">
              <div className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-xs">5</div>
              <span className="font-bold text-white text-xs block">Relational Update</span>
              <p className="text-[11px] text-slate-400">
                DB commits trigger WebSockets, updating trade percentages, weekly pace delta, and ETC metrics.
              </p>
            </div>

          </div>

          {/* Detailed workflow layout chart */}
          <div className="flex flex-col gap-2.5 mt-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
              BIM Spatial Aggregation & Calculation Topology Map
            </span>
            <pre className="p-4 bg-slate-900 text-indigo-300 rounded-xl border border-slate-800 font-mono text-[9px] overflow-x-auto leading-relaxed">
{`                              [COMPOSITE BUILDING NODE] (e.g. overall: 59.4%)
                                          ▲
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
          [Storey: LEVEL 1]                             [Storey: LEVEL 2]
         (P_L1 = weighted avg)                         (P_L2 = weighted avg)
                   ▲                                             ▲
      ┌────────────┴────────────┐                                │
      ▼                         ▼                                ▼
[Space: Room 101]         [Space: Room 102]             [Space: Room 201]
 (P = sum(elements))       (P = sum(elements))           (P = sum(elements))
      ▲                         ▲                                │
      ├─ Column-01 (100%)       ├─ Conduit-05 (20%)              └─ Beam-14 (100%)
      ├─ Slab-01 (100%)         ├─ Piping-08 (100%)
      └─ Drywall-02 (40%)       └─ Ducts-01 (100%)`}
            </pre>
          </div>

        </div>
      )}

    </div>
  );
}
