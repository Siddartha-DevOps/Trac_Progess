import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { 
  TrendingUp, CheckCircle2, AlertTriangle, Sparkles, Clock, 
  ShieldAlert, Layers, Building2, ChevronRight, Activity, HelpCircle
} from "lucide-react";
import { DEFAULT_BIM_DATASET } from "../lib/bim/IFCJsViewerEngine";
import { BIMElementMetadata } from "../lib/bim/BIMViewerAbstraction";
import { BIMElement } from "../types";

interface BIMAnalyticsPanelProps {
  onSelectElement: (element: BIMElement | null) => void;
  selectedElement: BIMElement | null;
  currentWeek: number;
}

export default function BIMAnalyticsPanel({ onSelectElement, selectedElement, currentWeek }: BIMAnalyticsPanelProps) {
  
  // 1. Calculations from active IFC dataset
  const elements = DEFAULT_BIM_DATASET;
  const totalCount = elements.length;
  
  const completedCount = elements.filter(e => e.status === "completed").length;
  const inProgressCount = elements.filter(e => e.status === "in_progress").length;
  const delayedCount = elements.filter(e => e.status === "delayed").length;
  const notStartedCount = elements.filter(e => e.status === "not_started").length;
  
  const overallProgressPercent = Math.round((completedCount / totalCount) * 100);

  // 2. Trade Progress Breakdowns
  const trades = ["Structure", "MEP", "Arch"] as const;
  const tradeStats = trades.map(trade => {
    const tradeElems = elements.filter(e => e.category === trade);
    const tTotal = tradeElems.length;
    const tCompleted = tradeElems.filter(e => e.status === "completed").length;
    const tInProgress = tradeElems.filter(e => e.status === "in_progress").length;
    const percent = tTotal > 0 ? Math.round((tCompleted / tTotal) * 100) : 0;
    return { name: trade, completed: tCompleted, total: tTotal, inProgress: tInProgress, percent };
  });

  // 3. Floor Progress Breakdowns
  const floors = ["Ground Floor", "First Floor", "Roof"] as const;
  const floorStats = floors.map(floor => {
    const floorElems = elements.filter(e => e.floor === floor);
    const fTotal = floorElems.length;
    const fCompleted = floorElems.filter(e => e.status === "completed").length;
    const percent = fTotal > 0 ? Math.round((fCompleted / fTotal) * 100) : 0;
    return { name: floor, completed: fCompleted, total: fTotal, percent };
  });

  // 4. Weekly Cumulative Progress Trend (conforming to stats.overallProgress history)
  const weeklyProgressTrend = [
    { week: "Wk 1", progress: 20 },
    { week: "Wk 2", progress: 42 },
    { week: "Wk 3", progress: 62 },
    { week: "Wk 4", progress: 78 },
    { week: "Wk 5", progress: 92 },
  ];

  // 5. Today's Progress Log (Daily photogrammetry AI feed)
  const todaysLogs = [
    { id: "col_c1", text: "Structural Column C1 successfully verified.", status: "completed" },
    { id: "arch_wall_w2", text: "Zone B South Drywall Wall - Drywall studs verified.", status: "in_progress" },
    { id: "slab_first_floor", text: "Ceiling Slab (L1 Zone B) curing check: 100% rigid.", status: "completed" },
  ];

  // 6. Focus element helper to map BIMElementMetadata back to parent BIMElement interface
  const handleElementClick = (metadata: BIMElementMetadata) => {
    const mapped: BIMElement = {
      id: metadata.id,
      name: metadata.name,
      category: metadata.category,
      type: metadata.type as any,
      progress: metadata.status === "completed" ? 100 : (metadata.status === "in_progress" ? 60 : (metadata.status === "delayed" ? 30 : 0)),
      status: metadata.status === "completed" ? "completed" : (metadata.status === "delayed" ? "delayed" : (metadata.status === "in_progress" ? "in_progress" : "not_started")),
      position: metadata.position,
      size: metadata.size,
      material: (metadata.properties["Material"] || "Concrete/Gypsum Spec") as string,
      installationDate: metadata.floor === "Ground Floor" ? "Week 1" : (metadata.floor === "First Floor" ? "Week 3" : "Week 5"),
      anomalyId: metadata.id === "col_c4" ? "anom_rebar_density" : (metadata.id === "mep_duct_branch" ? "anom_duct_clash" : undefined)
    };
    onSelectElement(mapped);
  };

  return (
    <div className="flex flex-col gap-5 text-slate-800 pb-2">
      
      {/* 1. OVERALL PROGRESS CARD */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">Overall Construction Progress</span>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded font-mono">
            {completedCount}/{totalCount} Done
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Circular/Radial representation with SVG */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-slate-200"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className="stroke-indigo-600 transition-all duration-500"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - overallProgressPercent / 100)}`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[13px] font-extrabold text-slate-850 font-mono">
              {overallProgressPercent}%
            </span>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white border border-slate-150 rounded-lg p-2 flex flex-col justify-center">
              <span className="text-slate-400 font-bold uppercase block leading-tight">In Progress</span>
              <span className="text-sm font-extrabold text-amber-500 font-mono mt-0.5">{inProgressCount} elements</span>
            </div>
            <div className="bg-white border border-slate-150 rounded-lg p-2 flex flex-col justify-center">
              <span className="text-slate-400 font-bold uppercase block leading-tight">Delayed</span>
              <span className="text-sm font-extrabold text-red-500 font-mono mt-0.5">{delayedCount} elements</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DELAY RISK ALERTS */}
      <div className="bg-red-50/70 border border-red-200/60 rounded-xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-red-800 font-extrabold text-[11px] uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span>RERA Schedule Delay Risk</span>
          </div>
          <span className="text-[9px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200/50 uppercase tracking-wide">
            High Risk
          </span>
        </div>
        
        <p className="text-[11px] text-red-700 leading-relaxed font-sans">
          Concrete rebar mismatch on <strong className="font-bold underline cursor-pointer" onClick={() => {
            const match = elements.find(e => e.id === "col_c4");
            if (match) handleElementClick(match);
          }}>Column C4</strong> and HVAC collision on <strong className="font-bold underline cursor-pointer" onClick={() => {
            const match = elements.find(e => e.id === "mep_duct_branch");
            if (match) handleElementClick(match);
          }}>HVAC Branch C4</strong> risk delaying ceiling slab pours by <span className="font-bold">8 days</span>.
        </p>

        <div className="bg-white/80 rounded-lg p-2 border border-red-100 flex justify-between items-center text-[10px]">
          <span className="text-slate-500">Projected Liquidation Penalty:</span>
          <span className="font-extrabold text-red-600 font-mono">₹1,20,000 / week</span>
        </div>
      </div>

      {/* 3. TRADE PROGRESS GRID */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-500" />
            Trade Verification Matrix
          </span>
          <span className="text-[9px] text-slate-400 font-mono uppercase font-bold">Drone Photogrammetry Verified</span>
        </div>

        <div className="flex flex-col gap-3">
          {tradeStats.map(trade => (
            <div key={trade.name} className="flex flex-col gap-1 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">{trade.name} Trade</span>
                <span className="font-mono text-slate-500">
                  {trade.completed}/{trade.total} Completed ({trade.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    trade.name === "Structure" 
                      ? "bg-indigo-600" 
                      : trade.name === "MEP" ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${trade.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FLOOR PROGRESS LEVELS */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-500" />
            Vertical Level Progress
          </span>
          <span className="text-[9px] text-slate-400 font-mono uppercase font-bold">RERA Site Auditing</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          {floorStats.map(flr => (
            <div 
              key={flr.name} 
              className="bg-slate-50 border border-slate-150 hover:border-indigo-200 p-2.5 rounded-lg flex flex-col justify-between transition cursor-default"
            >
              <span className="text-slate-500 font-bold block truncate leading-tight mb-1">{flr.name.split(" ")[0]} Floor</span>
              <span className="text-[13px] font-extrabold text-slate-800 font-mono block mb-1">{flr.percent}%</span>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${flr.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. WEEKLY PROGRESS TREND CHART */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
        <div>
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Cumulative Weekly Velocity
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">Physical scans vs plan variance</p>
        </div>

        <div className="h-[100px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyProgressTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" stroke="#94a3b8" style={{ fontSize: 9, fontFamily: "monospace" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: 9, fontFamily: "monospace" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6 }} />
              <Area type="monotone" dataKey="progress" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorProgress)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. TODAY'S PROGRESS LOG */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2.5">
        <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-indigo-500" />
          Today's Verification Log
        </span>

        <div className="flex flex-col gap-2">
          {todaysLogs.map(log => {
            const match = elements.find(e => e.id === log.id);
            return (
              <div 
                key={log.id} 
                onClick={() => match && handleElementClick(match)}
                className="group flex gap-2.5 bg-slate-50/60 hover:bg-slate-50 border border-slate-150 hover:border-indigo-150 p-2 rounded-lg cursor-pointer transition text-left"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-700 leading-normal group-hover:text-indigo-950 font-sans">
                    {log.text}
                  </p>
                  <span className="text-[8px] text-slate-400 font-mono uppercase block mt-0.5">
                    Click to inspect in 3D
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. OPEN CRITICAL ANOMALIES */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2.5">
        <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          Critical Deviations Ledger
        </span>

        <div className="flex flex-col gap-2 text-[10px]">
          {elements.filter(e => e.status === "delayed" || e.status === "in_progress" && e.properties["RERA Warning"] || e.properties["Collision Warning"]).map(elem => (
            <div 
              key={elem.id}
              onClick={() => handleElementClick(elem)}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-150 hover:border-indigo-300 transition cursor-pointer text-left"
            >
              <div className="flex flex-col gap-0.5 max-w-[70%]">
                <span className="font-bold text-slate-800 font-sans block truncate">{elem.name}</span>
                <span className="text-[8px] font-mono text-red-500 leading-normal">
                  {elem.properties["RERA Warning"] || elem.properties["Collision Warning"] || "Schedule deviation"}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono border ${
                elem.status === "delayed" 
                  ? "bg-red-50 text-red-700 border-red-200" 
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {elem.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 8. RECENT AI FINDINGS */}
      <div className="bg-indigo-900 text-indigo-100 rounded-xl p-4 flex flex-col gap-3 shadow-md">
        <div className="flex justify-between items-center border-b border-indigo-850 pb-2">
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
            AI Computer Vision Findings
          </span>
          <span className="text-[8px] bg-indigo-950/40 text-indigo-300 border border-indigo-800 font-bold px-1.5 py-0.5 rounded font-mono">
            LIVE FEED
          </span>
        </div>

        <div className="flex flex-col gap-2.5 text-[10px] leading-relaxed">
          <div className="flex gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Steel Stirrup Density Clash:</strong> Column C4 stirrups spacing measures 185mm vs. IFC 100mm design plan. Marked as <span className="text-red-300 font-bold uppercase">Critical deviation</span>.
            </p>
          </div>
          <div className="flex gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Central Coordinate Check:</strong> Branch HVAC Duct colliding directly with sprinkler water pipeline. Drywall assembly blocked in Zone B.
            </p>
          </div>
          <div className="flex gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Drywall Installation:</strong> North gypsum board partition correctly completed on Ground Floor with 100% CAD match.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
