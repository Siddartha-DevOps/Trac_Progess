import React, { useState } from "react";
import { 
  Building2, 
  MapPin, 
  Search, 
  Building, 
  Briefcase, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  ChevronRight, 
  ArrowUpRight,
  ShieldAlert,
  Globe,
  Sliders,
  DollarSign
} from "lucide-react";
import { useAppStore } from "../store";

interface ProjectItem {
  id: string;
  name: string;
  client: string;
  location: string;
  cost: string;
  reraId: string;
  area: string;
  targetDate: string;
  progress: number;
  status: "active" | "delayed" | "completed";
  anomaliesCount: number;
}

const INDIAN_PROJECTS: ProjectItem[] = [
  {
    id: "btp-block-b",
    name: "Bangalore Tech Park - Block B",
    client: "InnoSpace Developers India Ltd.",
    location: "Whitefield, Bengaluru, Karnataka",
    cost: "₹18.5 Crores",
    reraId: "KA-RERA-2026-0389",
    area: "45,000 sq ft",
    targetDate: "Q4 2026",
    progress: 72.4,
    status: "active",
    anomaliesCount: 4
  },
  {
    id: "mumbai-metro-3",
    name: "Mumbai Metro Line 3 - Underground Station",
    client: "Mumbai Metro Rail Corporation (MMRC)",
    location: "Colaba, Mumbai, Maharashtra",
    cost: "₹45.0 Crores",
    reraId: "MH-RERA-GOVT-1102",
    area: "120,000 sq ft",
    targetDate: "Q2 2027",
    progress: 58.1,
    status: "delayed",
    anomaliesCount: 9
  },
  {
    id: "cybercity-ph2",
    name: "Gurgaon CyberCity - Phase II Tower",
    client: "DLF Infrastructure Solutions Ltd.",
    location: "Sector 24, Gurugram, Haryana",
    cost: "₹32.8 Crores",
    reraId: "HR-RERA-2026-9912",
    area: "85,000 sq ft",
    targetDate: "Q1 2027",
    progress: 88.5,
    status: "active",
    anomaliesCount: 1
  },
  {
    id: "hyd-it-hub",
    name: "Hyderabad IT Corridor Hub",
    client: "Telangana State Industrial Corp",
    location: "Gachibowli, Hyderabad, Telangana",
    cost: "₹24.5 Crores",
    reraId: "TS-RERA-2025-0811",
    area: "60,000 sq ft",
    targetDate: "Q3 2026",
    progress: 100,
    status: "completed",
    anomaliesCount: 0
  }
];

export default function ProjectsView() {
  const { activeProject } = useAppStore();
  const [filter, setFilter] = useState<"all" | "active" | "delayed" | "completed">("all");
  const [search, setSearch] = useState("");

  const filtered = INDIAN_PROJECTS.filter(p => {
    const matchesFilter = filter === "all" || p.status === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.location.toLowerCase().includes(search.toLowerCase()) || 
                          p.reraId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="projects-view">
      
      {/* Upper controls bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        
        {/* Left side query filters */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold self-start">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md transition ${filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            All Projects ({INDIAN_PROJECTS.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-md transition ${filter === "active" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("delayed")}
            className={`px-3 py-1.5 rounded-md transition ${filter === "delayed" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Delayed
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 rounded-md transition ${filter === "completed" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Completed
          </button>
        </div>

        {/* Right side search bar */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Filter by name, state or RERA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-slate-700 outline-none w-full"
          />
        </div>
      </div>

      {/* Grid of enterprise projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(proj => {
          const isActiveProject = proj.id === activeProject.id;
          
          return (
            <div 
              key={proj.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                isActiveProject 
                  ? "border-indigo-500 ring-1 ring-indigo-500" 
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              
              {/* Card Header info */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      proj.status === "completed" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                        : (proj.status === "delayed" ? "bg-red-50 text-red-700 border border-red-200/50" : "bg-blue-50 text-blue-700 border border-blue-200/50")
                    }`}>
                      {proj.status}
                    </span>
                    {isActiveProject && (
                      <span className="bg-indigo-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        ACTIVE IN WORKSPACE
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight hover:text-indigo-600 transition">
                    {proj.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{proj.location}</span>
                  </p>
                </div>

                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-600 shrink-0">
                  <Building className="w-5 h-5 text-slate-500" />
                </div>
              </div>

              {/* Progress Slider block */}
              <div className="p-5 bg-slate-50/40 border-b border-slate-100/60 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold font-mono uppercase text-[9px]">PHYSICAL PROGRESS DEVIATION</span>
                  <span className="font-extrabold text-slate-800 font-mono">{proj.progress}%</span>
                </div>
                {/* Horizontal Progress Track */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      proj.status === "completed" 
                        ? "bg-emerald-500" 
                        : (proj.status === "delayed" ? "bg-red-500" : "bg-indigo-600")
                    }`}
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* Grid Metadata details */}
              <div className="p-5 grid grid-cols-2 gap-4 text-xs border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Estimated Budget</span>
                  <span className="font-bold text-slate-700">{proj.cost}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Target Date</span>
                  <span className="font-bold text-slate-700">{proj.targetDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">RERA ID</span>
                  <span className="font-semibold text-slate-500 font-mono text-[11px]">{proj.reraId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Area under const.</span>
                  <span className="font-bold text-slate-700">{proj.area}</span>
                </div>
              </div>

              {/* Footer action buttons */}
              <div className="p-4 bg-slate-50/50 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400 font-semibold">
                  {proj.anomaliesCount > 0 ? (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {proj.anomaliesCount} CV discrepancies
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Zero deviations
                    </span>
                  )}
                </span>
                
                {isActiveProject ? (
                  <span className="text-[10px] text-indigo-600 font-bold font-mono">Current Active</span>
                ) : (
                  <button 
                    onClick={() => {
                      // We can let the user click to load project details (or show simulated action)
                      alert(`Loading workspace parameters for: ${proj.name}`);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-850 flex items-center gap-0.5"
                  >
                    <span>Load Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
