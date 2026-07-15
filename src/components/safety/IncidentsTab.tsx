import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Building, 
  MapPin, 
  ExternalLink,
  History,
  FileDown,
  Check,
  ClipboardList
} from "lucide-react";
import { useIncidents } from "./useSafetyHooks";
import { Incident } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function IncidentsTab() {
  const { incidents, createIncident, updateIncidentStatus, approveIncidentAction } = useIncidents();
  
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Incident["category"]>("Fall from Height");
  const [severity, setSeverity] = useState<Incident["severity"]>("High");
  const [building, setBuilding] = useState("Block B");
  const [floor, setFloor] = useState("Level 2");
  const [room, setRoom] = useState("Zone B");
  const [worker, setWorker] = useState("");
  const [contractor, setContractor] = useState("Tata Projects");
  const [description, setDescription] = useState("");
  const [witness, setWitness] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");

  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterContractor, setFilterContractor] = useState("All");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const fresh = createIncident({
      title,
      category,
      severity,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      project: "Bangalore Tech Park - Block B",
      building,
      floor,
      room,
      worker,
      contractor,
      description,
      photos: ["https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400"],
      witness,
      status: "Open",
      rootCause,
      correctiveAction,
      preventiveAction,
      approval: { status: "Pending" }
    });

    setSelectedIncident(fresh);
    setIsAdding(false);
    
    // reset
    setTitle("");
    setDescription("");
    setWorker("");
    setWitness("");
    setRootCause("");
    setCorrectiveAction("");
    setPreventiveAction("");
  };

  const getSeverityStyle = (sev: Incident["severity"]) => {
    switch (sev) {
      case "Critical":
        return "bg-rose-500/10 text-rose-700 border-rose-200";
      case "High":
        return "bg-amber-500/10 text-amber-700 border-amber-200";
      case "Medium":
        return "bg-sky-500/10 text-sky-700 border-sky-200";
      case "Low":
        return "bg-slate-500/10 text-slate-700 border-slate-200";
    }
  };

  const getStatusBadge = (status: Incident["status"]) => {
    switch (status) {
      case "Open":
        return "bg-rose-50 text-rose-700 border-rose-150";
      case "Investigating":
        return "bg-amber-50 text-amber-700 border-amber-150";
      case "Actioned":
        return "bg-sky-50 text-sky-700 border-sky-150";
      case "Approved":
      case "Closed":
        return "bg-emerald-50 text-emerald-705 border-emerald-150";
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchesSev = filterSeverity === "All" || inc.severity === filterSeverity;
    const matchesContractor = filterContractor === "All" || inc.contractor === filterContractor;
    return matchesSev && matchesContractor;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
      
      {/* Left Sidebar: Incident Logs */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between h-[600px]">
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Incident Register</span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-0.5">Enterprise Ledgers</h4>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center transition shrink-0 shadow-xs"
              title="Record New Incident"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sidebar filters */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
            <select 
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-[10px] p-1.5 border rounded bg-white text-slate-650"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select 
              value={filterContractor}
              onChange={(e) => setFilterContractor(e.target.value)}
              className="text-[10px] p-1.5 border rounded bg-white text-slate-650"
            >
              <option value="All">All Contractors</option>
              <option value="Tata Projects">Tata Projects</option>
              <option value="L&T Construction">L&T Construction</option>
              <option value="Sterling & Wilson">Sterling & Wilson</option>
            </select>
          </div>

          {/* List */}
          <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
            {filteredIncidents.map((inc) => (
              <button
                key={inc.id}
                onClick={() => { setSelectedIncident(inc); setIsAdding(false); }}
                className={`w-full text-left p-2.5 rounded-lg border transition flex flex-col justify-between gap-1.5 ${
                  selectedIncident?.id === inc.id && !isAdding
                    ? "bg-indigo-50 border-indigo-200 text-slate-900 font-medium"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <div className="flex justify-between items-start w-full gap-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{inc.id}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase font-mono border ${getSeverityStyle(inc.severity)}`}>
                    {inc.severity}
                  </span>
                </div>

                <span className="text-xs font-sans font-bold leading-tight text-slate-800 line-clamp-2">{inc.title}</span>

                <div className="flex justify-between items-center w-full text-[9px] text-slate-400 font-mono mt-1">
                  <span>{inc.date} • {inc.time}</span>
                  <span className={`px-1.5 py-0.2 rounded uppercase border font-bold ${getStatusBadge(inc.status)}`}>
                    {inc.status}
                  </span>
                </div>
              </button>
            ))}
          </div>

        </div>

        <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex justify-between items-center shrink-0">
          <span>RERA compliance: active</span>
          <span className="font-bold">TOTAL: {incidents.length}</span>
        </div>
      </div>

      {/* Right panel Content: Add Form OR details view */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs h-[600px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.form 
              key="add-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="space-y-4 font-sans"
            >
              <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                <div>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono">Report incident</span>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-0.5">HSE Form 10A</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs px-2.5 py-1.5 border rounded-lg hover:bg-slate-50 text-slate-600 uppercase font-bold tracking-wider"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Incident title</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Temporary barrier collapse Zone B"
                    className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Fall from Height">Fall from Height</option>
                    <option value="Struck by Object">Struck by Object</option>
                    <option value="Equipment Collision">Equipment Collision</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Fire">Fire</option>
                    <option value="Excavation">Excavation</option>
                    <option value="Confined Space">Confined Space</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Severity</label>
                  <select 
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:border-indigo-500 font-sans"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Contractor Accountable</label>
                  <select 
                    value={contractor}
                    onChange={(e) => setContractor(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:border-indigo-500 font-sans"
                  >
                    <option value="Tata Projects">Tata Projects</option>
                    <option value="L&T Construction">L&T Construction</option>
                    <option value="Sterling & Wilson">Sterling & Wilson</option>
                    <option value="Shapoorji Pallonji">Shapoorji Pallonji</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Worker involved (Optional)</label>
                  <input 
                    type="text" 
                    value={worker}
                    onChange={(e) => setWorker(e.target.value)}
                    placeholder="e.g. Vikram Dev (WRK-101)"
                    className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Location Coordinates</label>
                  <div className="grid grid-cols-3 gap-1">
                    <input type="text" placeholder="Bldg B" value={building} onChange={(e)=>setBuilding(e.target.value)} className="text-xs p-1.5 border rounded focus:outline-hidden" />
                    <input type="text" placeholder="Lvl 2" value={floor} onChange={(e)=>setFloor(e.target.value)} className="text-xs p-1.5 border rounded focus:outline-hidden" />
                    <input type="text" placeholder="Zone B" value={room} onChange={(e)=>setRoom(e.target.value)} className="text-xs p-1.5 border rounded focus:outline-hidden" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Description of Occurrence</label>
                <textarea 
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details regarding scaffolding layout, equipment triggers, unsafe acts..."
                  className="w-full text-xs p-2 border rounded-lg focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Root Cause Assessment</label>
                  <input type="text" value={rootCause} onChange={(e)=>setRootCause(e.target.value)} placeholder="e.g. Inadequate edge guardrail locks" className="w-full text-xs p-1.5 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Corrective Action</label>
                  <input type="text" value={correctiveAction} onChange={(e)=>setCorrectiveAction(e.target.value)} placeholder="e.g. Secure wood toe-boards" className="w-full text-xs p-1.5 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Preventive Action</label>
                  <input type="text" value={preventiveAction} onChange={(e)=>setPreventiveAction(e.target.value)} placeholder="e.g. Mandatory visual checklists" className="w-full text-xs p-1.5 border rounded-lg" />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition uppercase tracking-wider"
              >
                Log Enterprise Incident
              </button>
            </motion.form>
          ) : selectedIncident ? (
            <motion.div 
              key="details-pane"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5 text-slate-700"
            >
              
              {/* Incident Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">{selectedIncident.id}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-[10px] text-slate-400 font-mono">{selectedIncident.category}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-1">{selectedIncident.title}</h3>
                </div>
                
                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border font-mono ${getStatusBadge(selectedIncident.status)}`}>
                    {selectedIncident.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border font-mono ${getSeverityStyle(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                </div>
              </div>

              {/* Grid location details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-1.5 border-b border-slate-100 text-[11px]">
                <div className="flex gap-1.5 items-center">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Subcontractor</span>
                    <span className="font-sans font-semibold text-slate-800">{selectedIncident.contractor}</span>
                  </div>
                </div>

                <div className="flex gap-1.5 items-center">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Location</span>
                    <span className="font-sans text-slate-800">{selectedIncident.floor}, {selectedIncident.room}</span>
                  </div>
                </div>

                <div className="flex gap-1.5 items-center">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Responsible Personnel</span>
                    <span className="font-sans text-slate-800 truncate">{selectedIncident.worker || "N/A"}</span>
                  </div>
                </div>

                <div className="flex gap-1.5 items-center">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Logged At</span>
                    <span className="font-sans font-mono text-slate-800">{selectedIncident.date} {selectedIncident.time}</span>
                  </div>
                </div>
              </div>

              {/* Description & Photo block */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 space-y-2">
                  <span className="text-[10px] text-slate-450 font-mono font-bold uppercase block">Occurrence description</span>
                  <p className="text-[11px] leading-relaxed text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedIncident.description}
                  </p>
                </div>

                <div className="md:col-span-4 space-y-2">
                  <span className="text-[10px] text-slate-450 font-mono font-bold uppercase block">Safety camera photogrammetry</span>
                  {selectedIncident.photos.length > 0 ? (
                    <img 
                      src={selectedIncident.photos[0]} 
                      alt="CCTV Capture" 
                      className="w-full h-24 object-cover rounded-lg border shadow-xs" 
                    />
                  ) : (
                    <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-dashed">
                      <span className="text-[9px] font-mono uppercase">No photo attachments</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CAPA (Corrective and Preventive Actions) display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 border rounded-xl bg-rose-50/20 border-rose-100">
                  <span className="text-[9px] text-rose-700 font-bold uppercase font-mono block">Root Cause analysis</span>
                  <p className="text-[11px] text-slate-650 mt-1 leading-relaxed">{selectedIncident.rootCause || "Analyzing root causes..."}</p>
                </div>

                <div className="p-3 border rounded-xl bg-indigo-50/20 border-indigo-100">
                  <span className="text-[9px] text-indigo-700 font-bold uppercase font-mono block">Corrective Action (CAPA)</span>
                  <p className="text-[11px] text-slate-650 mt-1 leading-relaxed">{selectedIncident.correctiveAction || "Corrective actions pending..."}</p>
                </div>

                <div className="p-3 border rounded-xl bg-emerald-50/20 border-emerald-100">
                  <span className="text-[9px] text-emerald-700 font-bold uppercase font-mono block">Preventive Action</span>
                  <p className="text-[11px] text-slate-650 mt-1 leading-relaxed">{selectedIncident.preventiveAction || "Preventive systems pending..."}</p>
                </div>
              </div>

              {/* HSE Sign-off approval flow */}
              <div className="border rounded-xl p-4 bg-slate-900 text-slate-200">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] text-indigo-300 font-bold uppercase font-mono">HSE PRINCIPAL SIGN-OFF SYSTEM</span>
                  </div>
                  
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                    selectedIncident.approval.status === "Approved" 
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-900" 
                      : "bg-amber-950 text-indigo-300 border border-amber-900"
                  }`}>
                    Review: {selectedIncident.approval.status}
                  </span>
                </div>

                <div className="mt-3 flex justify-between items-center flex-wrap gap-3">
                  <div className="text-[10px] text-slate-400">
                    {selectedIncident.approval.status === "Approved" ? (
                      <p>Certified closed by: <strong className="text-white">{selectedIncident.approval.by}</strong> on {selectedIncident.approval.date}</p>
                    ) : (
                      <p>Pending safety certification. Click approve to issue a digital ISO clearance certificate.</p>
                    )}
                  </div>

                  {selectedIncident.approval.status === "Pending" && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => approveIncidentAction(selectedIncident.id, "TracProgress HSE", true)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Mitigation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chronological Auditing History logs */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-450 font-mono font-bold uppercase flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> Chronological Audit Logs
                </span>
                
                <div className="space-y-2 max-h-[120px] overflow-y-auto bg-slate-50 border p-2.5 rounded-lg text-[10px] font-mono text-slate-500">
                  {selectedIncident.history.map((hist, i) => (
                    <div key={i} className="flex gap-2 border-b border-slate-100 pb-1.5 last:border-b-0">
                      <span className="text-indigo-600 shrink-0">[{hist.timestamp}]</span>
                      <span className="font-bold text-slate-750 shrink-0">{hist.updatedBy}:</span>
                      <p className="flex-1">{hist.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Select an incident from the registry list to view active compliance audits.
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
