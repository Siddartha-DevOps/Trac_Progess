import React, { useState } from "react";
import { 
  Users, 
  Search, 
  SlidersHorizontal, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  UserPlus, 
  AlertTriangle,
  RefreshCw,
  HardHat,
  Eye,
  Hand,
  CheckCircle,
  XCircle,
  HelpCircle,
  Calendar
} from "lucide-react";
import { usePPE } from "./useSafetyHooks";
import { motion, AnimatePresence } from "motion/react";

export default function PPEAnalyticsTab() {
  const { workers, summary, updateWorkerPPE, refreshPPE } = usePPE();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrade, setSelectedTrade] = useState("All");
  const [selectedContractor, setSelectedContractor] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  
  // Trades options
  const trades = ["All", "Steel Fixer", "Scaffolder", "Electrician", "Mason", "Welder", "Plumber", "Concrete Pourer", "Rigger", "HVAC Installer"];
  // Contractors
  const contractors = ["All", "Tata Projects", "L&T Construction", "Sterling & Wilson", "Shapoorji Pallonji"];

  // Filter workers
  const filteredWorkers = workers.filter(w => {
    const matchesSearch = 
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      w.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      w.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTrade = selectedTrade === "All" || w.trade === selectedTrade;
    const matchesContractor = selectedContractor === "All" || w.contractor === selectedContractor;
    const matchesStatus = selectedStatus === "All" || w.ppeStatus === selectedStatus;
    
    return matchesSearch && matchesTrade && matchesContractor && matchesStatus;
  });

  const getStatusBadge = (status: typeof workers[0]["ppeStatus"]) => {
    switch (status) {
      case "Compliant":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Warning":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Violated":
        return "bg-rose-50 text-rose-700 border-rose-100";
    }
  };

  const getCheckStatusIcon = (status: "Wearing" | "Missing" | "N/A") => {
    switch (status) {
      case "Wearing":
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case "Missing":
        return <XCircle className="w-3.5 h-3.5 text-rose-650 shrink-0" />;
      case "N/A":
        return <HelpCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
    }
  };

  const toggleGear = (workerId: string, item: "helmet" | "vest" | "shoes" | "harness" | "gloves" | "eyeProtection" | "faceShield" | "respirator" | "earProtection", current: "Wearing" | "Missing" | "N/A") => {
    if (current === "N/A") return; // Keep N/A intact
    const nextState = current === "Wearing" ? "Missing" : "Wearing";
    updateWorkerPPE(workerId, { [item]: nextState });
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 border rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Total Scanned Force</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-black text-slate-800 font-mono">{summary.total}</span>
            <span className="text-[10px] text-slate-400 font-mono">100% On-Site</span>
          </div>
        </div>
        
        <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[10px] text-emerald-600 font-bold uppercase font-mono tracking-wider">Fully Compliant</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">{summary.compliant}</span>
            <span className="text-[10px] text-emerald-600 font-mono font-bold">
              {summary.total > 0 ? ((summary.compliant / summary.total) * 100).toFixed(0) : 0}% Perfect
            </span>
          </div>
        </div>

        <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[10px] text-amber-650 font-bold uppercase font-mono tracking-wider">Minor Warnings</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-black text-amber-700 font-mono">{summary.warning}</span>
            <span className="text-[10px] text-amber-600 font-mono font-bold">1 Item Missing</span>
          </div>
        </div>

        <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <span className="text-[10px] text-rose-650 font-bold uppercase font-mono tracking-wider">Critical Violations</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-black text-rose-700 font-mono">{summary.violated}</span>
            <span className="text-[10px] text-rose-650 font-mono font-bold">Stop Work Order</span>
          </div>
        </div>
      </div>

      {/* Control Filters Toolbar */}
      <div className="bg-white border rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search workers, IDs, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border rounded-lg focus:outline-hidden focus:border-indigo-500 font-sans"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto items-center">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
          
          <select 
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
            className="text-xs px-2.5 py-1.5 border rounded-lg bg-white font-sans text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            {trades.map(t => <option key={t} value={t}>{t === "All" ? "All Trades" : t}</option>)}
          </select>

          <select 
            value={selectedContractor}
            onChange={(e) => setSelectedContractor(e.target.value)}
            className="text-xs px-2.5 py-1.5 border rounded-lg bg-white font-sans text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            {contractors.map(c => <option key={c} value={c}>{c === "All" ? "All Contractors" : c}</option>)}
          </select>

          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 border rounded-lg bg-white font-sans text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Compliant">Compliant</option>
            <option value="Warning">Warning</option>
            <option value="Violated">Violated</option>
          </select>

          <button 
            onClick={refreshPPE}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg text-slate-600 transition shrink-0"
            title="Reload Camera Scans"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Workers Virtualized Layout / Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono">CV Inference Matrix</span>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-0.5">Subcontractor PPE Verification Feed</h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
            Displaying {filteredWorkers.length} of {workers.length} Personnel
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 text-[10px] text-slate-400 uppercase font-mono tracking-wider bg-slate-50">
                <th className="py-3 px-4 font-bold">Worker ID & Name</th>
                <th className="py-3 px-3 font-bold">Trade & Contractor</th>
                <th className="py-3 px-3 font-bold">Location</th>
                <th className="py-3 px-3 font-bold text-center">Status</th>
                <th className="py-3 px-3 font-bold text-center">CV Confidence</th>
                <th className="py-3 px-4 font-bold text-center">Inference Controls (Toggle Gear Status)</th>
                <th className="py-3 px-4 font-bold text-center">Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-sans">
                    No active personnel found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition">
                    
                    {/* Worker Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 leading-tight">{worker.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">{worker.id}</span>
                      </div>
                    </td>

                    {/* Trade / Contractor */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-700 font-sans font-medium">{worker.trade}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">{worker.contractor}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-700 font-sans">{worker.location}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">Last Checked: {worker.lastInspection.split(" ")[1]}</span>
                      </div>
                    </td>

                    {/* PPE Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${getStatusBadge(worker.ppeStatus)}`}>
                        {worker.ppeStatus}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold font-mono text-slate-800">{worker.confidenceScore}%</span>
                        <div className="w-12 bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full rounded-full ${worker.confidenceScore >= 95 ? "bg-emerald-500" : (worker.confidenceScore >= 90 ? "bg-amber-500" : "bg-rose-500")}`} 
                            style={{ width: `${worker.confidenceScore}%` }} 
                          />
                        </div>
                      </div>
                    </td>

                    {/* Interactive Gear Checklist */}
                    <td className="py-3.5 px-4">
                      <div className="flex justify-center items-center gap-3">
                        {/* Helmet */}
                        <button 
                          onClick={() => toggleGear(worker.id, "helmet", worker.helmet)}
                          className={`flex items-center gap-1 p-1 rounded border text-[9px] font-mono transition ${
                            worker.helmet === "Wearing" 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                              : "bg-rose-50 border-rose-100 text-rose-800 font-bold"
                          }`}
                          title={`Helmet: ${worker.helmet} (Click to toggle)`}
                        >
                          <HardHat className="w-3.5 h-3.5 shrink-0" />
                          <span>HLM</span>
                          {getCheckStatusIcon(worker.helmet)}
                        </button>

                        {/* Vest */}
                        <button 
                          onClick={() => toggleGear(worker.id, "vest", worker.vest)}
                          className={`flex items-center gap-1 p-1 rounded border text-[9px] font-mono transition ${
                            worker.vest === "Wearing" 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                              : "bg-rose-50 border-rose-100 text-rose-800 font-bold"
                          }`}
                          title={`Safety Vest: ${worker.vest} (Click to toggle)`}
                        >
                          <HardHat className="w-3.5 h-3.5 rotate-180 shrink-0" />
                          <span>VST</span>
                          {getCheckStatusIcon(worker.vest)}
                        </button>

                        {/* Harness */}
                        <button 
                          onClick={() => toggleGear(worker.id, "harness", worker.harness)}
                          disabled={worker.harness === "N/A"}
                          className={`flex items-center gap-1 p-1 rounded border text-[9px] font-mono transition ${
                            worker.harness === "N/A" 
                              ? "bg-slate-50 border-slate-100 text-slate-350 opacity-60 cursor-not-allowed" 
                              : worker.harness === "Wearing"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                                : "bg-rose-50 border-rose-100 text-rose-800 font-bold"
                          }`}
                          title={`Harness: ${worker.harness} (Click to toggle)`}
                        >
                          <HardHat className="w-3.5 h-3.5 shrink-0" />
                          <span>HRN</span>
                          {getCheckStatusIcon(worker.harness)}
                        </button>

                        {/* Gloves */}
                        <button 
                          onClick={() => toggleGear(worker.id, "gloves", worker.gloves)}
                          className={`flex items-center gap-1 p-1 rounded border text-[9px] font-mono transition ${
                            worker.gloves === "Wearing" 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                              : "bg-rose-50 border-rose-100 text-rose-800 font-bold"
                          }`}
                          title={`Gloves: ${worker.gloves} (Click to toggle)`}
                        >
                          <HardHat className="w-3.5 h-3.5 shrink-0" />
                          <span>GLV</span>
                          {getCheckStatusIcon(worker.gloves)}
                        </button>
                      </div>
                    </td>

                    {/* Overall Score / Progress */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-xs font-bold font-mono ${worker.compliancePct >= 90 ? "text-emerald-600" : (worker.compliancePct >= 75 ? "text-amber-650" : "text-rose-600")}`}>
                        {worker.compliancePct}%
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Sandbox Instructions Footer */}
        <div className="p-4 border-t border-slate-100 bg-indigo-50/20 text-[11px] text-slate-500 leading-relaxed font-sans flex items-center gap-2">
          <span className="bg-indigo-600 text-white font-mono font-bold text-[8px] px-1.5 py-0.5 rounded tracking-wide shrink-0">CV SIMULATOR</span>
          <p>
            This tab simulates real-time computer vision detection outputs. <strong>Click the gear indicators (HLM, VST, HRN, GLV) in the Checklist table</strong> to simulate gear displacement, and observe how the Safety Index scores and HSE statuses instantly recalculate!
          </p>
        </div>
      </div>

    </div>
  );
}
