import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { 
  TrendingUp, CheckCircle2, AlertTriangle, Sparkles, Clock, 
  ShieldAlert, Layers, Building2, ChevronRight, Activity, Eye
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
  
  const elements = DEFAULT_BIM_DATASET;
  const totalCount = elements.length;
  
  // Calculate dynamic weekly counts to simulate active scan matching
  // Week 1: 20% progress
  // Week 2: 42% progress
  // Week 3: 62% progress
  // Week 4: 78% progress
  // Week 5: 95% progress
  const completedCount = Math.min(
    totalCount,
    currentWeek === 1 ? 3 : currentWeek === 2 ? 6 : currentWeek === 3 ? 9 : currentWeek === 4 ? 12 : 14
  );
  
  const inProgressCount = currentWeek === 5 ? 1 : 2;
  const delayedCount = currentWeek >= 4 ? 2 : currentWeek >= 2 ? 1 : 0;
  const overallProgressPercent = Math.round((completedCount / totalCount) * 100);

  // Dynamic Trade Progress linked to currentWeek
  const tradeStats = [
    { 
      name: "Structure", 
      completed: currentWeek === 1 ? 2 : currentWeek === 2 ? 4 : currentWeek === 3 ? 5 : 6, 
      total: 6, 
      percent: Math.round(((currentWeek === 1 ? 2 : currentWeek === 2 ? 4 : currentWeek === 3 ? 5 : 6) / 6) * 100),
      color: "bg-indigo-600"
    },
    { 
      name: "MEP", 
      completed: currentWeek <= 2 ? 0 : currentWeek === 3 ? 2 : currentWeek === 4 ? 3 : 4, 
      total: 4, 
      percent: Math.round(((currentWeek <= 2 ? 0 : currentWeek === 3 ? 2 : currentWeek === 4 ? 3 : 4) / 4) * 100),
      color: "bg-amber-500"
    },
    { 
      name: "Arch", 
      completed: currentWeek <= 3 ? 0 : currentWeek === 4 ? 2 : 4, 
      total: 5, 
      percent: Math.round(((currentWeek <= 3 ? 0 : currentWeek === 4 ? 2 : 4) / 5) * 100),
      color: "bg-emerald-500"
    }
  ];

  // Cumulative progress trend up to the active week
  const weeklyProgressTrend = [
    { week: "Wk 1", progress: 20 },
    { week: "Wk 2", progress: 42 },
    { week: "Wk 3", progress: 62 },
    { week: "Wk 4", progress: 78 },
    { week: "Wk 5", progress: 95 },
  ].slice(0, currentWeek);

  // Dynamic AI Insights Feed linked to currentWeek
  const aiFindings = [
    {
      week: 1,
      title: "Ground Foundation Scan",
      text: "Foundations concrete pouring complete. 100% CAD match verified.",
      type: "success"
    },
    {
      week: 2,
      title: "Column Stirrups Spacing",
      text: "Column C4 stirrup spacing variance measures 185mm vs. IFC 100mm layout plan.",
      type: "deviation"
    },
    {
      week: 3,
      title: "Slab Curing Speed",
      text: "Moisture evaporation logs specify normal curing index for level 1 deck slab.",
      type: "info"
    },
    {
      week: 4,
      title: "Duct Coordinate Clash",
      text: "MEP horizontal branch duct shifting 140mm south, colliding with sprinkler lines.",
      type: "deviation"
    },
    {
      week: 5,
      title: "Gypsum Drywall Verified",
      text: "Gypsum board wall partitions successfully aligned on ground floor.",
      type: "success"
    }
  ].filter(f => f.week <= currentWeek);

  const handleElementClick = (elemId: string) => {
    const found = elements.find(e => e.id === elemId);
    if (found) {
      const mapped: BIMElement = {
        id: found.id,
        name: found.name,
        category: found.category,
        type: found.type as any,
        progress: found.status === "completed" ? 100 : (found.status === "in_progress" ? 60 : (found.status === "delayed" ? 30 : 0)),
        status: found.status === "completed" ? "completed" : (found.status === "delayed" ? "delayed" : (found.status === "in_progress" ? "in_progress" : "not_started")),
        position: found.position,
        size: found.size,
        material: (found.properties["Material"] || "Concrete Spec") as string,
        installationDate: found.floor === "Ground Floor" ? "Week 1" : "Week 4",
        anomalyId: found.id === "col_c4" ? "anom_rebar_density" : (found.id === "mep_duct_branch" ? "anom_duct_clash" : undefined)
      };
      onSelectElement(mapped);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-slate-800 pb-2">
      
      {/* 1. OVERALL PROGRESS */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">Overall Progress</span>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded font-mono">
            {completedCount}/{totalCount} Elements Verified
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-slate-100"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-indigo-600 transition-all duration-500"
                strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - overallProgressPercent / 100)}`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-black text-slate-800 font-mono">
              {overallProgressPercent}%
            </span>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2 text-[9.5px]">
            <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 flex flex-col justify-center">
              <span className="text-slate-400 font-bold uppercase block leading-tight">In-Progress</span>
              <span className="text-xs font-extrabold text-amber-600 font-mono mt-0.5">{inProgressCount} Structural</span>
            </div>
            <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 flex flex-col justify-center">
              <span className="text-slate-400 font-bold uppercase block leading-tight">Delayed</span>
              <span className="text-xs font-extrabold text-red-500 font-mono mt-0.5">{delayedCount} Spatials</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DELAY PREDICTION */}
      <div className="bg-red-50/70 border border-red-200/60 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-red-800 font-extrabold text-[11px] uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span>Delay Prediction</span>
          </div>
          <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
            currentWeek >= 4 
              ? "bg-red-100 text-red-700 border-red-200" 
              : currentWeek >= 2 
              ? "bg-amber-100 text-amber-700 border-amber-200" 
              : "bg-emerald-100 text-emerald-700 border-emerald-200"
          }`}>
            {currentWeek >= 4 ? "High Risk" : currentWeek >= 2 ? "Moderate" : "Nominal"}
          </span>
        </div>
        
        <p className="text-[10px] text-red-700 leading-normal font-sans text-left">
          {currentWeek >= 4 ? (
            <span>
              MEP duct collisions on <strong className="underline cursor-pointer" onClick={() => handleElementClick("mep_duct_branch")}>Zone B branch</strong> predicts concrete formwork casting delay of <strong className="font-bold">8 days</strong>.
            </span>
          ) : currentWeek >= 2 ? (
            <span>
              Column rebar spacing offset on <strong className="underline cursor-pointer" onClick={() => handleElementClick("col_c4")}>Column C4</strong> has pushed structural cure schedules by <strong className="font-bold">3 days</strong>.
            </span>
          ) : (
            <span>No construction schedule path delays predicted at current work velocity.</span>
          )}
        </p>

        <div className="bg-white rounded-lg p-2 border border-red-100 flex justify-between items-center text-[9.5px]">
          <span className="text-slate-500">Projected Liquidation Damages:</span>
          <span className="font-black text-red-600 font-mono">
            {currentWeek >= 4 ? "₹1,20,000 / wk" : currentWeek >= 2 ? "₹45,000 / wk" : "₹0"}
          </span>
        </div>
      </div>

      {/* 3. AI INSIGHTS */}
      <div className="bg-indigo-950 text-indigo-100 rounded-xl p-4 flex flex-col gap-2.5 shadow-md">
        <div className="flex justify-between items-center border-b border-indigo-900 pb-2">
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
            AI Computer Vision Insights
          </span>
          <span className="text-[8px] bg-indigo-900 text-indigo-300 border border-indigo-800 font-bold px-1.5 py-0.5 rounded font-mono">
            REALTIME
          </span>
        </div>

        <div className="flex flex-col gap-2 text-[10px] leading-relaxed max-h-[140px] overflow-y-auto scrollbar-thin">
          {aiFindings.map((finding, idx) => (
            <div key={idx} className="flex gap-1.5 border-b border-indigo-900/40 pb-1.5 last:border-b-0 last:pb-0 text-left">
              <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white font-sans">{finding.title}: </strong>
                <span className="text-indigo-200">{finding.text}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TRADE PROGRESS */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-500" />
            Trade Progress Matrix
          </span>
          <span className="text-[9px] text-slate-400 font-mono uppercase font-bold">Drone Photogrammetry Verified</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {tradeStats.map(trade => (
            <div key={trade.name} className="flex flex-col gap-1 text-[10px] text-left">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">{trade.name} Trade</span>
                <span className="font-mono text-slate-500">
                  {trade.completed}/{trade.total} Completed ({trade.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${trade.color}`}
                  style={{ width: `${trade.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. WEEKLY ANALYTICS */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2.5">
        <div>
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Weekly Progress Velocity
          </span>
          <p className="text-[9px] text-slate-400 text-left">Cumulative scanning matched rate</p>
        </div>

        <div className="h-[90px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyProgressTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" stroke="#94a3b8" style={{ fontSize: 8, fontFamily: "monospace" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: 8, fontFamily: "monospace" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 9, borderRadius: 6 }} />
              <Area type="monotone" dataKey="progress" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorProgress)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. OPEN ISSUES */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2.5">
        <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          Open Issues Ledger
        </span>

        <div className="flex flex-col gap-1.5 text-[9.5px]">
          {elements.filter(e => {
            if (currentWeek < 2) return false;
            if (currentWeek < 4 && e.id === "mep_duct_branch") return false;
            return e.status === "delayed" || e.status === "in_progress" && (e.properties["RERA Warning"] || e.properties["Collision Warning"]);
          }).map(elem => (
            <div 
              key={elem.id}
              onClick={() => handleElementClick(elem.id)}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-150 hover:border-indigo-200 transition cursor-pointer text-left"
            >
              <div className="flex flex-col gap-0.5 max-w-[70%]">
                <span className="font-bold text-slate-800 truncate block">{elem.name}</span>
                <span className="text-[8px] font-mono text-red-500 truncate block">
                  {elem.properties["RERA Warning"] || elem.properties["Collision Warning"] || "Schedule deviation"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono bg-red-50 text-red-700 border border-red-200 shrink-0">
                  {elem.status}
                </span>
                <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>
          ))}
          {elements.filter(e => {
            if (currentWeek < 2) return false;
            if (currentWeek < 4 && e.id === "mep_duct_branch") return false;
            return e.status === "delayed" || e.status === "in_progress" && (e.properties["RERA Warning"] || e.properties["Collision Warning"]);
          }).length === 0 && (
            <div className="text-center py-4 text-slate-400 border border-dashed border-slate-200 rounded-lg">
              No open issues detected in this week block.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
