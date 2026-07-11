import React from "react";
import { 
  Milestone, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight,
  Sparkles
} from "lucide-react";

interface TimelinePhase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "completed" | "active" | "delayed" | "pending";
  subcontractor: string;
  deviationDays: number;
}

const CONSTRUCTION_PHASES: TimelinePhase[] = [
  {
    id: "ph-1",
    name: "Excavation & Shoring",
    startDate: "01 Apr 2026",
    endDate: "30 Apr 2026",
    progress: 100,
    status: "completed",
    subcontractor: "L&T GeoStructure",
    deviationDays: 0
  },
  {
    id: "ph-2",
    name: "Foundation & Basement Slab Casting",
    startDate: "02 May 2026",
    endDate: "25 May 2026",
    progress: 100,
    status: "completed",
    subcontractor: "Shapoorji Pallonji Concrete",
    deviationDays: 0
  },
  {
    id: "ph-3",
    name: "Core Columns Reinforcement C1-C12",
    startDate: "01 Jun 2026",
    endDate: "20 Jun 2026",
    progress: 85,
    status: "delayed",
    subcontractor: "Rishabh Steel Fabrication",
    deviationDays: 6
  },
  {
    id: "ph-4",
    name: "First Floor Suspended Slab Casting",
    startDate: "21 Jun 2026",
    endDate: "12 Jul 2026",
    progress: 40,
    status: "active",
    subcontractor: "Shapoorji Pallonji Concrete",
    deviationDays: 4
  },
  {
    id: "ph-5",
    name: "Second Floor Columns & Masonry",
    startDate: "15 Jul 2026",
    endDate: "10 Aug 2026",
    progress: 0,
    status: "pending",
    subcontractor: "Star Masonry Builders",
    deviationDays: 0
  },
  {
    id: "ph-6",
    name: "MEP Rough-Ins (Plumbing, Fire Safety)",
    startDate: "12 Aug 2026",
    endDate: "15 Sep 2026",
    progress: 0,
    status: "pending",
    subcontractor: "Sterling & Wilson MEP",
    deviationDays: 0
  }
];

export default function SchedulesView() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="schedules-view">
      
      {/* Overview stats block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg shrink-0">
            <Milestone className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Milestones</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">18 Events</span>
            <p className="text-[10px] text-slate-400 mt-0.5">12 completed, 6 remaining</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Critical Path Delay</span>
            <span className="text-xl font-extrabold text-red-600 font-mono">+6 Days</span>
            <p className="text-[10px] text-red-400 mt-0.5">Driven by C3 Column misalignment</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Schedule Adherence Rate</span>
            <span className="text-xl font-extrabold text-emerald-600 font-mono">94.2%</span>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Excellent compliance vs RERA limits</p>
          </div>
        </div>

      </div>

      {/* Main Gantt-style Phase Listing */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Phase Progress Gantt Matrix</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Calculated using live automated drone photogrammetry syncing with the 4D BIM schedule.</p>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 font-semibold">
            Last Updated: 2 hours ago
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {CONSTRUCTION_PHASES.map(phase => {
            return (
              <div 
                key={phase.id}
                className={`p-4 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  phase.status === "delayed" 
                    ? "bg-red-50/20 border-red-200/60" 
                    : (phase.status === "active" ? "bg-indigo-50/10 border-indigo-200/60" : "bg-white border-slate-200/80")
                }`}
              >
                
                {/* Phase Info */}
                <div className="space-y-1 md:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                      phase.status === "completed" 
                        ? "bg-emerald-50 text-emerald-700" 
                        : (phase.status === "delayed" ? "bg-red-50 text-red-700 animate-pulse" : (phase.status === "active" ? "bg-indigo-50 text-indigo-700" : "bg-slate-50 text-slate-500"))
                    }`}>
                      {phase.status}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold font-mono">Subcon: {phase.subcontractor}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{phase.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {phase.startDate} <span className="text-slate-300">→</span> {phase.endDate}
                  </p>
                </div>

                {/* Progress bar (1/3 cols) */}
                <div className="space-y-1.5 w-full md:w-1/3">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Physical Quantity Verified</span>
                    <span className="font-bold font-mono text-slate-700">{phase.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        phase.status === "completed" 
                          ? "bg-emerald-500" 
                          : (phase.status === "delayed" ? "bg-red-500" : "bg-indigo-600")
                      }`}
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions & Deviations */}
                <div className="text-right flex md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-1/4 gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                  {phase.deviationDays > 0 ? (
                    <div className="text-left md:text-right">
                      <span className="text-[9px] text-red-500 font-bold uppercase tracking-wide block">RERA LIMIT OVERRUN</span>
                      <span className="text-xs font-extrabold text-red-600 font-mono">+{phase.deviationDays} days deviation</span>
                    </div>
                  ) : (
                    <div className="text-left md:text-right">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wide">Target Variance</span>
                      <span className="text-xs font-bold text-slate-500 font-mono">On schedule</span>
                    </div>
                  )}
                  {phase.status === "delayed" && (
                    <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 bg-white border border-indigo-200 px-2 py-1 rounded shadow-sm hover:bg-slate-50">
                      <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span>Gemini Advise</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
