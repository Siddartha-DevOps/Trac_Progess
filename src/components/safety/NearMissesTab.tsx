import React, { useState } from "react";
import { 
  Search, 
  Plus, 
  HelpCircle, 
  Calendar, 
  User, 
  CheckCircle, 
  Activity, 
  ShieldAlert 
} from "lucide-react";
import { MOCK_NEAR_MISSES } from "./safetyMockData";
import { NearMiss } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function NearMissesTab() {
  const [nearMisses, setNearMisses] = useState<NearMiss[]>(MOCK_NEAR_MISSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [reporter, setReporter] = useState("");
  const [contractor, setContractor] = useState("Tata Projects");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [potentialSeverity, setPotentialSeverity] = useState<NearMiss["potentialSeverity"]>("Medium");
  const [rootCause, setRootCause] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !reporter) return;

    const fresh: NearMiss = {
      id: `MS-00${nearMisses.length + 1}`,
      title,
      reporter,
      contractor,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      location,
      description,
      potentialSeverity,
      rootCause,
      status: "Reported"
    };

    setNearMisses([fresh, ...nearMisses]);
    setIsAdding(false);
    setTitle("");
    setReporter("");
    setDescription("");
    setRootCause("");
    setLocation("");
  };

  const handleMitigate = (id: string) => {
    setNearMisses(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: "Mitigated" as const,
          mitigationAction: "Corrective engineering barrier deployed on-site."
        };
      }
      return m;
    }));
  };

  const handleClose = (id: string) => {
    setNearMisses(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: "Closed" as const
        };
      }
      return m;
    }));
  };

  const getSeverityStyle = (sev: NearMiss["potentialSeverity"]) => {
    switch (sev) {
      case "Critical": return "bg-rose-600 text-white border-rose-700";
      case "High": return "bg-rose-50 text-rose-700 border-rose-200";
      case "Medium": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Low": return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const filteredMisses = nearMisses.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reporter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Near miss trends data
  const chartData = [
    { month: "Jan", count: 4 },
    { month: "Feb", count: 7 },
    { month: "Mar", count: 5 },
    { month: "Apr", count: 8 },
    { month: "May", count: 12 },
    { month: "Jun", count: 9 },
    { month: "Jul", count: nearMisses.length }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
      
      {/* List Registry & creation */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        
        {/* Actions bar */}
        <div className="bg-white border rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Filter near misses, locations..."
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border rounded-lg focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition uppercase tracking-wider flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" /> {isAdding ? "Close Form" : "Report Near Miss"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isAdding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="bg-white border rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono">INCIDENT PREVENTION ENGINE</span>
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-tight mt-0.5">Log Near Miss Incident</h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Title</label>
                  <input 
                    type="text" required placeholder="e.g. Scaffolding bar slipped 1 meter"
                    value={title} onChange={(e)=>setTitle(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Reporter Name</label>
                  <input 
                    type="text" required placeholder="e.g. Vikram Dev"
                    value={reporter} onChange={(e)=>setReporter(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Location Coordinator</label>
                  <input 
                    type="text" required placeholder="e.g. Loading Platform Zone A"
                    value={location} onChange={(e)=>setLocation(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Accountable Contractor</label>
                  <select value={contractor} onChange={(e)=>setContractor(e.target.value)} className="w-full text-xs p-2 border rounded-lg font-sans">
                    <option value="Tata Projects">Tata Projects</option>
                    <option value="L&T Construction">L&T Construction</option>
                    <option value="Sterling & Wilson">Sterling & Wilson</option>
                    <option value="Shapoorji Pallonji">Shapoorji Pallonji</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Potential Severity</label>
                  <select value={potentialSeverity} onChange={(e)=>setPotentialSeverity(e.target.value as any)} className="w-full text-xs p-2 border rounded-lg font-sans">
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Likely Root Cause</label>
                  <input 
                    type="text" placeholder="e.g. Loose locking clip pins"
                    value={rootCause} onChange={(e)=>setRootCause(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Description of incident</label>
                <textarea 
                  rows={2} required placeholder="Detail description of potential impact, worker heights, equipment status..."
                  value={description} onChange={(e)=>setDescription(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition uppercase tracking-wider"
              >
                Log to Prevention Registry
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Registry display list */}
        <div className="space-y-3">
          {filteredMisses.map((miss) => (
            <div key={miss.id} className="bg-white border rounded-xl p-4 shadow-xs space-y-3 text-slate-700 hover:border-slate-300 transition">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{miss.id}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="text-[11px] font-sans font-medium text-slate-800">{miss.location}</span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono border ${getSeverityStyle(miss.potentialSeverity)}`}>
                  POTENTIAL: {miss.potentialSeverity}
                </span>
              </div>

              <div className="space-y-1">
                <h5 className="text-xs font-bold text-slate-900 leading-snug">{miss.title}</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">{miss.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 border rounded-lg text-[11px] font-sans">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Root Cause</span>
                  <span className="text-slate-750 font-medium">{miss.rootCause}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Reported By</span>
                  <span className="text-slate-750">{miss.reporter} ({miss.contractor}) on {miss.date} {miss.time}</span>
                </div>
              </div>

              {/* Action row depending on status */}
              <div className="flex justify-between items-center flex-wrap gap-3 pt-1 border-t border-slate-100">
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded uppercase ${
                  miss.status === "Closed" 
                    ? "bg-slate-100 text-slate-600" 
                    : (miss.status === "Mitigated" ? "bg-emerald-50 text-emerald-705 border border-emerald-100" : "bg-rose-50 text-rose-705 border border-rose-100")
                }`}>
                  Status: {miss.status}
                </span>

                <div className="flex gap-2">
                  {miss.status === "Reported" && (
                    <button 
                      onClick={() => handleMitigate(miss.id)}
                      className="text-[10px] px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-bold uppercase font-mono transition"
                    >
                      Mitigate Risk
                    </button>
                  )}
                  
                  {miss.status === "Mitigated" && (
                    <button 
                      onClick={() => handleClose(miss.id)}
                      className="text-[10px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold uppercase font-mono transition"
                    >
                      Close Near Miss
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Right Sidebar: Near Miss Trend Chart */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between h-fit">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">HSE Analytics</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="space-y-1">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Prevention Trends</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Recording near misses is a critical indicator of proactively managed site cultures. An upward trend suggests high reporting transparency, preventing severe fatalities.
            </p>
          </div>

          <div className="h-[180px] w-full font-mono text-[9px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -30 }}>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#f8fafc" }}
                  labelClassName="text-[10px] font-bold text-slate-400"
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Reports" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
          ISO 45001 Standard Metric
        </div>
      </div>

    </div>
  );
}
