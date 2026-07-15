import React, { useState } from "react";
import { CHANGE_DETECTION_ITEMS, ChangeDetectionItem } from "./mockData";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Activity, 
  Filter, 
  TrendingUp, 
  Flame, 
  Database, 
  Wrench, 
  Home, 
  Search,
  Sparkles,
  RefreshCw,
  Sliders,
  ChevronRight
} from "lucide-react";

export default function ChangeDetectionView() {
  const [selectedTrade, setSelectedTrade] = useState<"All" | "Structural" | "Finishing" | "MEP">("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredItems = CHANGE_DETECTION_ITEMS.filter(item => {
    const matchesTrade = selectedTrade === "All" || item.trade === selectedTrade;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.zone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTrade && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Upper Panel: Dynamic Trade Rollup / Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Card 1: Structural Rollup */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-md text-slate-100">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono tracking-wider">Structural Trade</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-[10px] text-slate-400 block font-mono">CALCULATED PHYSICAL VOLUME</span>
            <span className="text-xl font-black text-white">450 m³ Concrete</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Slab/Column Pour Verified • 97.9% Confidence</span>
          </div>
          <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "95%" }} />
          </div>
        </div>

        {/* Card 2: MEP Services */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-md text-slate-100">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono tracking-wider">MEP Services</span>
            <Wrench className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-[10px] text-slate-400 block font-mono">CONDUITS & CHILLED PIPING</span>
            <span className="text-xl font-black text-white">1,262 meters</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">61.1% Average Service Completion</span>
          </div>
          <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: "61.1%" }} />
          </div>
        </div>

        {/* Card 3: Finishing & Masonry */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-md text-slate-100">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[10px] text-amber-400 font-bold uppercase font-mono tracking-wider">Finishing & Masonry</span>
            <Home className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-[10px] text-slate-400 block font-mono">AAC WALL PARTITIONS</span>
            <span className="text-xl font-black text-white">280 m² Walls</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">82.3% Partition Wall Coverage</span>
          </div>
          <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: "82.3%" }} />
          </div>
        </div>

        {/* Card 4: AI Audit Risk Rating */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-md text-slate-100">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-[10px] text-rose-400 font-bold uppercase font-mono tracking-wider">Clash Detection</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2.5">
            <span className="text-[10px] text-slate-400 block font-mono">Downstream RERA Schedule Risk</span>
            <span className="text-xl font-black text-white">Moderate (78/100)</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">2 Spatial interference issues log</span>
          </div>
          <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: "22%" }} />
          </div>
        </div>

      </div>

      {/* Filter and Search Action bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        
        {/* Trade Tabs Selector */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg self-start">
          {(["All", "Structural", "MEP", "Finishing"] as const).map(trade => (
            <button
              key={trade}
              onClick={() => setSelectedTrade(trade)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                selectedTrade === trade 
                  ? "bg-indigo-600 text-white shadow-sm font-bold" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {trade} {trade === "All" ? "Trades" : ""}
            </button>
          ))}
        </div>

        {/* Search Input bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search items, zones or categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>

      </div>

      {/* Main Detected Changes Ledger list */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">AI Change Detection Log</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Physical scans synchronized against IFC design geometries</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Progress Engine active</span>
          </div>
        </div>

        {/* Data List container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/50 text-slate-400 uppercase font-mono tracking-wider font-extrabold text-[9px] border-b border-slate-100">
                <th className="py-3 px-5">Component Name / Zone</th>
                <th className="py-3 px-4">Trade</th>
                <th className="py-3 px-4 text-right">BIM Design Qty</th>
                <th className="py-3 px-4 text-right">Physical Captured</th>
                <th className="py-3 px-4 text-center">Completion %</th>
                <th className="py-3 px-4 text-center">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5">Physical Deviations / Quality Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/55 transition">
                    
                    {/* Name & Zone */}
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800 text-[11px]">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                          {item.zone}
                        </span>
                      </div>
                    </td>

                    {/* Trade Category */}
                    <td className="py-3.5 px-4 font-mono text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded border ${
                        item.trade === "Structural" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" 
                          : (item.trade === "MEP" ? "bg-indigo-50 text-indigo-700 border-indigo-200/50" : "bg-amber-50 text-amber-700 border-amber-200/50")
                      }`}>
                        {item.trade}
                      </span>
                    </td>

                    {/* BIM design Qty */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 font-bold">
                      {item.qtyBim}
                    </td>

                    {/* Physical Captured Qty */}
                    <td className="py-3.5 px-4 text-right font-mono text-indigo-600 font-bold">
                      {item.qtyPhysical}
                    </td>

                    {/* Completion Pct slider/visual */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-mono font-bold text-[11px] text-slate-700">
                        <div className="w-12 bg-slate-100 h-1 rounded overflow-hidden shrink-0">
                          <div className="bg-indigo-500 h-full" style={{ width: `${item.completionPct}%` }} />
                        </div>
                        <span>{item.completionPct}%</span>
                      </div>
                    </td>

                    {/* AI Confidence */}
                    <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                      {item.confidence}%
                    </td>

                    {/* Status badges */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        item.status === "Completed" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : (item.status === "Deviation" ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200")
                      }`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Deviation description / Quality remarks */}
                    <td className="py-3.5 px-5 text-slate-500 leading-relaxed text-[11px]">
                      {item.status === "Deviation" ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-red-700 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            {item.incorrectInstallation}
                          </span>
                          <span className="text-red-500 text-[10px]">{item.missingWork}</span>
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          Zero deviation. Physical alignment matches design.
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No detected components match the selected trade or filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
