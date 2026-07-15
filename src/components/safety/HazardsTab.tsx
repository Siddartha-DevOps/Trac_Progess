import React, { useState } from "react";
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  HelpCircle, 
  Calendar, 
  User, 
  Briefcase, 
  CheckCircle, 
  Flame, 
  AlertTriangle 
} from "lucide-react";
import { useHazards } from "./useSafetyHooks";
import { Hazard } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function HazardsTab() {
  const { hazards, createHazard, mitigateHazard } = useHazards();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Form States
  const [hazardType, setHazardType] = useState("");
  const [riskLevel, setRiskLevel] = useState<Hazard["riskLevel"]>("Medium");
  const [probability, setProbability] = useState<Hazard["probability"]>("Medium");
  const [impact, setImpact] = useState<Hazard["impact"]>("Medium");
  const [owner, setOwner] = useState("");
  const [mitigation, setMitigation] = useState("");
  const [location, setLocation] = useState("");
  const [detectedBy, setDetectedBy] = useState<Hazard["detectedBy"]>("Manual Audit");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hazardType || !owner) return;

    createHazard({
      hazardType,
      riskLevel,
      probability,
      impact,
      owner,
      mitigation,
      reviewDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: "Open",
      location,
      detectedBy
    });

    setIsAdding(false);
    setHazardType("");
    setOwner("");
    setMitigation("");
    setLocation("");
  };

  const getRiskBadge = (lvl: Hazard["riskLevel"]) => {
    switch (lvl) {
      case "Critical":
        return "bg-rose-600 text-white border-rose-750";
      case "High":
        return "bg-rose-50 text-rose-700 border-rose-150";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-150";
      case "Low":
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const filteredHazards = hazards.filter(h => 
    h.hazardType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header and Add Toggle */}
      <div className="flex justify-between items-center bg-white border rounded-xl p-4 shadow-xs">
        <div>
          <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono">ISO 31000 RISK REGISTER</span>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-0.5">Active Site Hazards Registry</h4>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-[11px] font-bold rounded-lg transition uppercase tracking-wider flex items-center gap-1 shrink-0"
        >
          <Plus className="w-4 h-4" /> {isAdding ? "Cancel Form" : "Report Hazard"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="bg-white border rounded-xl p-5 shadow-sm space-y-4"
          >
            <div className="border-b border-slate-100 pb-2">
              <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono">NEW RISK ANALYSIS</span>
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-tight mt-0.5">Hazard Severity Formulation</h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Hazard Type / Label</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Broken ladder rails near elevator shaft"
                  value={hazardType}
                  onChange={(e)=>setHazardType(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Site Location Coordinator</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Level 3 Facade Segment B"
                  value={location}
                  onChange={(e)=>setLocation(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Risk Level</label>
                <select 
                  value={riskLevel}
                  onChange={(e)=>setRiskLevel(e.target.value as any)}
                  className="w-full text-xs p-2 border rounded-lg"
                >
                  <option value="Critical">Critical Risk</option>
                  <option value="High">High Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="Low">Low Risk</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Mitigation Owner</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. K. Reddy (Tata Projects)"
                  value={owner}
                  onChange={(e)=>setOwner(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Probability of Occurrence</label>
                <select value={probability} onChange={(e)=>setProbability(e.target.value as any)} className="w-full text-xs p-2 border rounded-lg">
                  <option value="High">High Probability</option>
                  <option value="Medium">Medium Probability</option>
                  <option value="Low">Low Probability</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Severity of Impact</label>
                <select value={impact} onChange={(e)=>setImpact(e.target.value as any)} className="w-full text-xs p-2 border rounded-lg">
                  <option value="High">High Impact</option>
                  <option value="Medium">Medium Impact</option>
                  <option value="Low">Low Impact</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Direct Remediation Mitigation Plan</label>
              <textarea 
                rows={2}
                placeholder="Details of required barriers, PPE lockdowns, or circuit shutdowns..."
                value={mitigation}
                onChange={(e)=>setMitigation(e.target.value)}
                className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition uppercase tracking-wider"
            >
              Analyze & Insert in ISO Register
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Main Registry Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
        
        {/* Sub-bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Filter hazards, owners, zones..."
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border rounded-lg focus:outline-hidden"
            />
          </div>

          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
            {filteredHazards.length} Registered Hazard Records
          </span>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 text-[10px] text-slate-400 uppercase font-mono tracking-wider bg-slate-50">
                <th className="py-3 px-4 font-bold">Hazard ID & Description</th>
                <th className="py-3 px-3 font-bold text-center">Risk Level</th>
                <th className="py-3 px-3 font-bold text-center">Prob x Imp</th>
                <th className="py-3 px-3 font-bold">Location COORDINATES</th>
                <th className="py-3 px-3 font-bold">Mitigation Owner</th>
                <th className="py-3 px-4 font-bold">Action Timeline Checklist</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHazards.map((haz) => (
                <tr key={haz.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition text-slate-700">
                  
                  {/* ID & Desc */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{haz.id}</span>
                      <span className="text-xs font-bold text-slate-800 leading-tight mt-0.5">{haz.hazardType}</span>
                      <span className="text-[9px] text-slate-400 font-mono mt-1">Detected by: {haz.detectedBy}</span>
                    </div>
                  </td>

                  {/* Risk Badge */}
                  <td className="py-3.5 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono border ${getRiskBadge(haz.riskLevel)}`}>
                      {haz.riskLevel}
                    </span>
                  </td>

                  {/* Prob x Imp */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      {haz.probability.slice(0, 1)}x{haz.impact.slice(0, 1)}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-3">
                    <span className="text-xs font-sans text-slate-850 font-medium">{haz.location}</span>
                  </td>

                  {/* Owner */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-sans font-semibold text-slate-800">{haz.owner}</span>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">Review Date: {haz.reviewDate}</span>
                    </div>
                  </td>

                  {/* Mitigation Checklist */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">{haz.mitigation}</p>
                      
                      {haz.status === "Open" && (
                        <button
                          onClick={() => mitigateHazard(haz.id, "Principal HSE")}
                          className="mt-1 flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase font-mono transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> MARK AS RESOLVED
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono border ${
                      haz.status === "Resolved" 
                        ? "bg-emerald-50 text-emerald-705 border-emerald-150" 
                        : "bg-rose-50 text-rose-705 border-rose-150"
                    }`}>
                      {haz.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
