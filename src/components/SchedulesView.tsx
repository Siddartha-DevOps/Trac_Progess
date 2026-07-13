import React, { useState } from "react";
import { 
  Milestone as MilestoneIcon, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  GitCommit,
  GitBranch,
  ShieldCheck,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  HelpCircle,
  Play
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
  startWeek: number; // 1-indexed start week
  durationWeeks: number;
  isCriticalPath: boolean;
  predecessors: string[];
  successors: string[];
  impactNotes: string;
  mitigationStrategy: string;
}

const CONSTRUCTION_PHASES: TimelinePhase[] = [
  {
    id: "ph-1",
    name: "Excavation & Shoring",
    startDate: "Week 1",
    endDate: "Week 1",
    progress: 100,
    status: "completed",
    subcontractor: "L&T GeoStructure",
    deviationDays: 0,
    startWeek: 1,
    durationWeeks: 1,
    isCriticalPath: true,
    predecessors: [],
    successors: ["ph-2"],
    impactNotes: "Foundation soil density matched 100% CAD loading standards.",
    mitigationStrategy: "N/A - Stage Completed on target schedule."
  },
  {
    id: "ph-2",
    name: "Foundation & Basement Slab Casting",
    startDate: "Week 1",
    endDate: "Week 2",
    progress: 100,
    status: "completed",
    subcontractor: "Shapoorji Pallonji Concrete",
    deviationDays: 0,
    startWeek: 1,
    durationWeeks: 2,
    isCriticalPath: true,
    predecessors: ["ph-1"],
    successors: ["ph-3", "ph-4"],
    impactNotes: "Curing integrity checks verified using smart wireless humidity concrete loggers.",
    mitigationStrategy: "N/A - Stage Completed."
  },
  {
    id: "ph-3",
    name: "Core Columns Reinforcement C1-C12",
    startDate: "Week 2",
    endDate: "Week 3",
    progress: 85,
    status: "delayed",
    subcontractor: "Rishabh Steel Fabrication",
    deviationDays: 6,
    startWeek: 2,
    durationWeeks: 2,
    isCriticalPath: true, // RED ALERT CRITICAL PATH
    predecessors: ["ph-2"],
    successors: ["ph-5"],
    impactNotes: "Column C4 rebars placed at 185mm intervals vs specified 100mm. Critical path hold enacted.",
    mitigationStrategy: "Insert supplementary T16 spacer bars on side flanks to restore loading distribution."
  },
  {
    id: "ph-4",
    name: "First Floor Suspended Slab Casting",
    startDate: "Week 3",
    endDate: "Week 4",
    progress: 45,
    status: "active",
    subcontractor: "Shapoorji Pallonji Concrete",
    deviationDays: 3,
    startWeek: 3,
    durationWeeks: 2,
    isCriticalPath: false,
    predecessors: ["ph-2"],
    successors: ["ph-6"],
    impactNotes: "Slab framework matches geometric limits but dependent column casting must dry first.",
    mitigationStrategy: "Accelerate scaffolding setup using early strength admixture components."
  },
  {
    id: "ph-5",
    name: "Second Floor Columns & Brick Masonry",
    startDate: "Week 4",
    endDate: "Week 5",
    progress: 0,
    status: "pending",
    subcontractor: "Star Masonry Builders",
    deviationDays: 0,
    startWeek: 4,
    durationWeeks: 2,
    isCriticalPath: true,
    predecessors: ["ph-3"],
    successors: [],
    impactNotes: "Blocked until week 3 core columns pass RERA compliance certification.",
    mitigationStrategy: "Deploy double shifts once column remediation is finalized."
  },
  {
    id: "ph-6",
    name: "MEP Rough-Ins (Plumbing, Fire Safety)",
    startDate: "Week 4",
    endDate: "Week 5",
    progress: 0,
    status: "pending",
    subcontractor: "Sterling & Wilson MEP",
    deviationDays: 0,
    startWeek: 4,
    durationWeeks: 2,
    isCriticalPath: false,
    predecessors: ["ph-4"],
    successors: [],
    impactNotes: "Physical routing clash identified in sprinkler zone; CAD adjustment pending.",
    mitigationStrategy: "Reroute 40mm sprinkler pipe branch around the structural beam flange."
  }
];

export default function SchedulesView() {
  const [selectedPhase, setSelectedPhase] = useState<TimelinePhase>(CONSTRUCTION_PHASES[2]); // Default to the delayed column phase
  const [showOnlyCriticalPath, setShowOnlyCriticalPath] = useState(false);

  const filteredPhases = showOnlyCriticalPath 
    ? CONSTRUCTION_PHASES.filter(p => p.isCriticalPath)
    : CONSTRUCTION_PHASES;

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="schedules-view">
      
      {/* 1. KEY METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left">
          <div className="p-2.5 bg-indigo-50 rounded-lg shrink-0">
            <MilestoneIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Milestones</span>
            <span className="text-lg font-black text-slate-850 font-mono">18 Events Logged</span>
            <p className="text-[9px] text-slate-400 mt-0.5">12 Completed • 6 Remaining</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left">
          <div className="p-2.5 bg-red-50 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Critical Path Delay</span>
            <span className="text-lg font-black text-red-600 font-mono">+6 Days Slippage</span>
            <p className="text-[9px] text-red-500 font-semibold mt-0.5">Driven by Column C4 Rebar Spacing</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left">
          <div className="p-2.5 bg-emerald-50 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Schedule Adherence (SPI)</span>
            <span className="text-lg font-black text-emerald-600 font-mono">0.94 SPI</span>
            <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">Excellent vs. 0.85 RERA threshold</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left">
          <div className="p-2.5 bg-indigo-950 text-indigo-100 rounded-lg shrink-0">
            <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 font-bold block uppercase tracking-wider">RERA Safe Status</span>
            <span className="text-lg font-black text-white font-mono">Compliant</span>
            <p className="text-[9px] text-indigo-300 mt-0.5">Quarterly progress logs in green zones</p>
          </div>
        </div>

      </div>

      {/* 2. THE VISUAL INTERACTIVE GANTT TIMELINE CHART */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        
        {/* Header and Filter Action Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-5">
          <div className="text-left">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-600" />
              4D BIM Construction Gantt Matrix
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Live photogrammetry scanning overlaid on planned IFC stage durations. Click tasks to inspect dependencies and mitigation protocols.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOnlyCriticalPath(!showOnlyCriticalPath)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                showOnlyCriticalPath 
                  ? "bg-red-50 text-red-600 border-red-200" 
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Show Critical Path Only</span>
            </button>
            <span className="text-[9px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded border border-slate-250 font-mono font-bold">
              PLANNER VERSION 4.0
            </span>
          </div>
        </div>

        {/* The Gantt Grid container */}
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[800px] flex flex-col">
            
            {/* Timeline Grid Header (5 Weeks layout) */}
            <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/50 p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              <div className="col-span-4 text-left pl-2">Construction Work Phase</div>
              <div className="col-span-1 border-l border-slate-200 text-center">Week 1</div>
              <div className="col-span-2 border-l border-slate-200 text-center">Week 2</div>
              <div className="col-span-2 border-l border-slate-200 text-center">Week 3</div>
              <div className="col-span-2 border-l border-slate-200 text-center">Week 4</div>
              <div className="col-span-1 border-l border-slate-200 text-center">Week 5</div>
            </div>

            {/* Gantt Rows */}
            <div className="divide-y divide-slate-100 border-b border-slate-200">
              {filteredPhases.map((phase) => {
                const isSelected = selectedPhase.id === phase.id;
                
                return (
                  <div 
                    key={phase.id}
                    onClick={() => setSelectedPhase(phase)}
                    className={`grid grid-cols-12 p-3 items-center cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? "bg-indigo-50/30 ring-1 ring-inset ring-indigo-100" 
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    
                    {/* Column 1: Task Details (Left 4 columns) */}
                    <div className="col-span-4 flex flex-col pr-4 text-left">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          phase.status === "completed" ? "bg-emerald-500" : phase.status === "delayed" ? "bg-red-500" : "bg-indigo-500"
                        }`} />
                        <span className="text-[9px] font-mono text-slate-400 font-bold block truncate max-w-[200px]">
                          {phase.subcontractor}
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold leading-tight ${isSelected ? "text-indigo-950" : "text-slate-800"}`}>
                        {phase.name}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9.5px] font-mono text-slate-400">{phase.startDate} to {phase.endDate}</span>
                        {phase.isCriticalPath && (
                          <span className="bg-red-50 text-red-600 text-[8px] font-extrabold uppercase font-mono px-1 py-0.2 rounded border border-red-200">
                            Critical Path
                          </span>
                        )}
                        {phase.deviationDays > 0 && (
                          <span className="bg-amber-50 text-amber-700 text-[8px] font-extrabold uppercase font-mono px-1 py-0.2 rounded border border-amber-200">
                            +{phase.deviationDays}d delay
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Columns 2-12: The Grid Timeline Bars */}
                    <div className="col-span-8 grid grid-cols-8 h-8 relative items-center">
                      
                      {/* Background grid line helper divisions */}
                      <div className="absolute inset-0 grid grid-cols-8 pointer-events-none divide-x divide-slate-100" />
                      
                      {/* Gantt Bar spanning across the corresponding week blocks */}
                      {/* Calculation:
                        Week 1: Column index 0 (Col-span 1)
                        Week 2: Column index 1 (Col-span 2)
                        Week 3: Column index 3 (Col-span 2)
                        Week 4: Column index 5 (Col-span 2)
                        Week 5: Column index 7 (Col-span 1)
                        So:
                        Wk 1 start = grid col 1
                        Wk 2 start = grid col 2
                        Wk 3 start = grid col 4
                        Wk 4 start = grid col 6
                        Wk 5 start = grid col 8
                      */}
                      <div 
                        style={{
                          gridColumnStart: phase.startWeek === 1 ? 1 : phase.startWeek === 2 ? 2 : phase.startWeek === 3 ? 4 : 6,
                          gridColumnEnd: `span ${phase.durationWeeks === 1 ? 1 : phase.durationWeeks === 2 ? 2 : 2}`
                        }}
                        className={`h-6 rounded-lg relative overflow-hidden group/bar transition-all duration-300 shadow-sm border ${
                          phase.status === "completed"
                            ? "bg-emerald-500 border-emerald-600 text-white"
                            : phase.status === "delayed"
                            ? "bg-red-500 border-red-600 text-white"
                            : phase.status === "active"
                            ? "bg-indigo-600 border-indigo-700 text-white"
                            : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}
                      >
                        {/* Progress fill bar inside */}
                        <div 
                          className="absolute inset-y-0 left-0 bg-black/10 transition-all duration-500" 
                          style={{ width: `${phase.progress}%` }}
                        />

                        {/* Text and stats layer inside */}
                        <div className="absolute inset-0 flex items-center justify-between px-2 text-[9px] font-extrabold font-mono pointer-events-none select-none">
                          <span className="truncate">{phase.progress}% Done</span>
                          <span className="opacity-90">{phase.startDate}</span>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* 3. BOTTOM EXPANDED TASK DETAILS & DEEP ANALYSIS CARD */}
      {selectedPhase && (
        <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in text-left">
          
          {/* Phase Identity & Progress */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                  selectedPhase.status === "completed" 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                    : (selectedPhase.status === "delayed" ? "bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse" : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30")
                }`}>
                  {selectedPhase.status} stage
                </span>
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                  GUID: {selectedPhase.id}
                </span>
              </div>
              <h4 className="text-sm font-black text-white">{selectedPhase.name}</h4>
              <p className="text-xs text-slate-400 mt-1">Contractor: <strong>{selectedPhase.subcontractor}</strong></p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Verification Metric:</span>
                <span className="font-bold text-white">{selectedPhase.progress}% volume matched</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    selectedPhase.status === "completed" ? "bg-emerald-500" : selectedPhase.status === "delayed" ? "bg-red-500" : "bg-indigo-500"
                  }`} 
                  style={{ width: `${selectedPhase.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dependencies / Connections */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6 flex flex-col gap-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
              Dependency Linking Network
            </span>

            <div className="flex flex-col gap-2">
              <div className="bg-slate-950/45 p-2 rounded border border-slate-800 flex flex-col gap-1 text-[10px]">
                <div className="flex items-center gap-1 text-indigo-400 font-bold">
                  <GitCommit className="w-3.5 h-3.5 shrink-0" />
                  <span>Predecessors (Must finish first)</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedPhase.predecessors.map(predId => {
                    const found = CONSTRUCTION_PHASES.find(p => p.id === predId);
                    return (
                      <span key={predId} className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[8.5px] font-semibold text-slate-300">
                        {found ? found.name : predId}
                      </span>
                    );
                  })}
                  {selectedPhase.predecessors.length === 0 && (
                    <span className="text-slate-500 italic text-[9px]">None (Starts project sequence)</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-950/45 p-2 rounded border border-slate-800 flex flex-col gap-1 text-[10px]">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <GitBranch className="w-3.5 h-3.5 shrink-0" />
                  <span>Successors (Dependent downstream)</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedPhase.successors.map(succId => {
                    const found = CONSTRUCTION_PHASES.find(p => p.id === succId);
                    return (
                      <span key={succId} className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[8.5px] font-semibold text-slate-300">
                        {found ? found.name : succId}
                      </span>
                    );
                  })}
                  {selectedPhase.successors.length === 0 && (
                    <span className="text-slate-500 italic text-[9px]">None (Final milestone of target branch)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Advisor / Action Center */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 block font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-300" />
                BuildTrace AI Schedule Advisor
              </span>
              <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                <strong>Deviation Impact:</strong> {selectedPhase.impactNotes}
              </p>
              <div className="bg-indigo-950 border border-indigo-900 p-2.5 rounded-lg text-[10px] text-indigo-200 mt-1 leading-normal text-left">
                <strong>Recommended Mitigation:</strong> {selectedPhase.mitigationStrategy}
              </div>
            </div>

            {selectedPhase.status === "delayed" && (
              <button className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-[10px] uppercase tracking-wider py-2 rounded-lg shadow-md transition flex items-center justify-center gap-1 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 shrink-0" />
                <span>Simulate remedial re-scheduling</span>
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
