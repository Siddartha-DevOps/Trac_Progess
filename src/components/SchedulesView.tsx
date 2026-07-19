import React, { useState, useEffect, useRef } from "react";
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
  Activity as ActivityIcon,
  GitCommit,
  GitBranch,
  ShieldCheck,
  ChevronLeft,
  HelpCircle,
  Play,
  Upload,
  FileCode,
  Sliders,
  CloudRain,
  Users,
  Gauge,
  Activity
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from "recharts";
import { useAppStore } from "../store";
import { 
  ScheduleDelayEngineTS, 
  ScheduleProject, 
  Activity as ScheduleActivity, 
  Relationship as ScheduleRelationship,
  MonteCarloResult
} from "../lib/scheduleEngine";
import { MOCK_P6_XML_BANGALORE, MOCK_MSP_XML_DELHI } from "../data/mockSchedules";

export default function SchedulesView() {
  const { activeProject } = useAppStore();

  // --- STATE MANAGEMENT ---
  const [activeSchedule, setActiveSchedule] = useState<ScheduleProject | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ScheduleActivity | null>(null);
  const [showOnlyCriticalPath, setShowOnlyCriticalPath] = useState(false);
  
  // Simulation config state
  const [iterations, setIterations] = useState<number>(500);
  const [weatherSeverity, setWeatherSeverity] = useState<number>(1.0);
  const [laborShortage, setLaborShortage] = useState<number>(1.0);
  
  // Simulation result state
  const [simulationResult, setSimulationResult] = useState<MonteCarloResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadLog, setUploadLog] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize schedule with mock data on load or when project changes
  useEffect(() => {
    // For Bangalore, load the P6 Bangalore XML. For other projects, default to MS Project template
    const xmlToLoad = activeProject.id === "proj-blr-02" ? MOCK_P6_XML_BANGALORE : MOCK_MSP_XML_DELHI;
    handleParseXmlContent(xmlToLoad, "auto");
    setUploadLog([
      `[SYSTEM] Initialized default timeline matrix for ${activeProject.name}.`,
      `[SYSTEM] Double-threat CPM Engine loaded: WebAssembly and Python fallbacks online.`
    ]);
  }, [activeProject.id]);

  // Run a default Monte Carlo on schedule load/change to populate charts
  useEffect(() => {
    if (activeSchedule) {
      runStochasticSimulation(false);
    }
  }, [activeSchedule?.project_id]);

  // --- HELPER HANDLERS ---
  const handleParseXmlContent = (content: string, format: string) => {
    try {
      let parsedProj: ScheduleProject;
      const isP6 = format === "p6" || (format === "auto" && (content.includes("<Activities>") || content.includes("<APGProject>")));
      
      if (isP6) {
        parsedProj = ScheduleDelayEngineTS.parseP6XML(content);
        addLog(`[SUCCESS] Parsed Primavera P6 XML format. Found ${parsedProj.activities.length} tasks and ${parsedProj.relationships.length} links.`);
      } else {
        parsedProj = ScheduleDelayEngineTS.parseMSPXML(content);
        addLog(`[SUCCESS] Parsed MS Project XML format. Found ${parsedProj.activities.length} tasks and ${parsedProj.relationships.length} links.`);
      }

      // Execute Forward & Backward CPM pass
      const cpmProj = ScheduleDelayEngineTS.calculateCPM(parsedProj);
      setActiveSchedule(cpmProj);
      
      // Select first delayed or critical task, or fallback to first task
      const targetAct = cpmProj.activities.find(a => a.status === "delayed") || cpmProj.activities[0];
      setSelectedActivity(targetAct || null);
      
      addLog(`[CPM COMPLETE] Early start/finish and floats calculated. Total float margin verified.`);
    } catch (err: any) {
      addLog(`[ERROR] Failed to parse schedule: ${err.message}`);
    }
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setUploadLog(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    addLog(`Reading file: ${file.name} (${Math.round(file.size / 1024)} KB)...`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleParseXmlContent(text, "auto");
      setIsUploading(false);
    };
    reader.onerror = () => {
      addLog(`[ERROR] Failed to read uploaded file.`);
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const loadMockTemplate = (type: "p6" | "msp") => {
    setIsUploading(true);
    setTimeout(() => {
      if (type === "p6") {
        handleParseXmlContent(MOCK_P6_XML_BANGALORE, "p6");
        addLog(`[DEMO] Imported Primavera P6 XML Template: Bangalore Cyber Hub`);
      } else {
        handleParseXmlContent(MOCK_MSP_XML_DELHI, "msp");
        addLog(`[DEMO] Imported MS Project XML Template: Delhi Airport T3 Terminal`);
      }
      setIsUploading(false);
    }, 400);
  };

  // Run Monte Carlo Simulation
  const runStochasticSimulation = (showLog = true) => {
    if (!activeSchedule) return;
    setIsSimulating(true);
    if (showLog) {
      addLog(`[SIMULATION START] Initializing Monte Carlo stochastics. Iterations: ${iterations}...`);
    }

    setTimeout(() => {
      try {
        const result = ScheduleDelayEngineTS.runMonteCarlo(
          activeSchedule,
          iterations,
          weatherSeverity,
          laborShortage
        );
        setSimulationResult(result);
        if (showLog) {
          addLog(`[SIMULATION COMPLETE] Risk score calculated: ${result.risk_score}%. p90 delay forecast is +${result.p90_delay_days} days.`);
        }
      } catch (err: any) {
        if (showLog) {
          addLog(`[SIMULATION ERROR] Monte Carlo calculation failed: ${err.message}`);
        }
      } finally {
        setIsSimulating(false);
      }
    }, 300);
  };

  // Filter activities based on toggle
  const displayedActivities = activeSchedule
    ? showOnlyCriticalPath
      ? activeSchedule.activities.filter(a => a.is_critical_path)
      : activeSchedule.activities
    : [];

  // Calculate some aggregate stats
  const totalTasks = activeSchedule?.activities.length || 0;
  const completedTasks = activeSchedule?.activities.filter(a => a.actual_progress === 100).length || 0;
  const remainingTasks = totalTasks - completedTasks;
  const totalSlippage = activeSchedule?.total_delay_variance_days || 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="predictive-schedules-dashboard">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-mono px-2.5 py-1 rounded uppercase font-black tracking-widest">
            Primavera &amp; MS Project CPM Engine
          </span>
          <h2 className="text-xl font-black mt-2 leading-tight flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-indigo-400" />
            Predictive Schedule Delay &amp; Risk Engine
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Import project XML, construct network dependency graphs, compute forward/backward float logic, and run stochastic Monte Carlo forecasts to predict downstream timeline slippage.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xml" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm border border-slate-200 transition flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Upload XML File</span>
          </button>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-1 flex">
            <button
              onClick={() => loadMockTemplate("p6")}
              className="px-2.5 py-1.5 text-[10px] font-mono font-bold text-slate-300 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
              title="Load Mock Primavera P6 XML"
            >
              Load P6 Demo
            </button>
            <button
              onClick={() => loadMockTemplate("msp")}
              className="px-2.5 py-1.5 text-[10px] font-mono font-bold text-slate-300 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
              title="Load Mock Microsoft Project XML"
            >
              Load MSP Demo
            </button>
          </div>
        </div>
      </div>

      {/* 2. CORE METRIC CARDS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Card 1: Active Schedule Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left relative overflow-hidden group">
          <div className="p-2.5 bg-indigo-50 rounded-lg shrink-0">
            <MilestoneIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Active File &amp; Scope</span>
            <span className="text-sm font-extrabold text-slate-800 block truncate leading-snug">
              {activeSchedule ? activeSchedule.name : "Loading project..."}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
              {totalTasks} Tasks parsed • {remainingTasks} pending
            </p>
          </div>
        </div>

        {/* Card 2: Critical Delay Variance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left">
          <div className="p-2.5 bg-red-50 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Schedule Slip (CPM)</span>
            <span className="text-lg font-black text-red-600 font-mono">
              {totalSlippage > 0 ? `+${totalSlippage.toFixed(1)} Days` : "On Target"}
            </span>
            <p className={`text-[10px] font-semibold mt-0.5 ${totalSlippage > 10 ? "text-red-500" : "text-amber-600"}`}>
              {activeSchedule?.critical_path_status === "CRITICAL_DELAY" ? "Critical Path Hold Enacted" : "At Risk - Watch Closely"}
            </p>
          </div>
        </div>

        {/* Card 3: Schedule Performance Index (SPI) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left">
          <div className="p-2.5 bg-emerald-50 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Performance Index (SPI)</span>
            <span className="text-lg font-black text-emerald-600 font-mono">
              {(1.0 - (totalSlippage / 100)).toFixed(2)} SPI
            </span>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              Target RERA Margin: &gt;0.85
            </p>
          </div>
        </div>

        {/* Card 4: Monte Carlo Risk Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left">
          <div className="p-2.5 bg-slate-900 text-white rounded-lg shrink-0">
            <Gauge className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Stochastic Risk Score</span>
            <span className={`text-lg font-black font-mono ${
              simulationResult ? (simulationResult.risk_score > 70 ? "text-red-500" : "text-indigo-600") : "text-slate-500"
            }`}>
              {simulationResult ? `${simulationResult.risk_score}%` : "Calculating..."}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              On-Time Prob: {simulationResult ? `${simulationResult.completion_probability_by_baseline}%` : "Computing..."}
            </p>
          </div>
        </div>

      </div>

      {/* 3. MIDDLE AREA: GANTT CHART & SIMULATION PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: The Visual Interactive Gantt timeline (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
            
            {/* Header / Actions Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-5">
              <div className="text-left">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ActivityIcon className="w-4 h-4 text-indigo-600" />
                  BIM-Linked 4D Gantt Scheduling Matrix
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Visualizing Early Start, Late Start, and Float margins from network dependency analysis. Red tasks are critical path.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
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
                <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded border border-indigo-200 font-mono font-bold uppercase tracking-wider">
                  CPM Solved
                </span>
              </div>
            </div>

            {/* Gantt Matrix viewport */}
            <div className="overflow-x-auto scrollbar-thin">
              <div className="min-w-[700px] flex flex-col">
                
                {/* Timeline Grid Header (Week blocks) */}
                <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/50 p-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <div className="col-span-5 text-left pl-2">Construction Work Phase</div>
                  <div className="col-span-7 grid grid-cols-7 text-center divide-x divide-slate-200/40">
                    <div>Days 1-5</div>
                    <div>Days 6-10</div>
                    <div>Days 11-15</div>
                    <div>Days 16-20</div>
                    <div>Days 21-25</div>
                    <div>Days 26-30</div>
                    <div>Days 31+</div>
                  </div>
                </div>

                {/* Gantt Rows */}
                <div className="divide-y divide-slate-100 border-b border-slate-200 max-h-[420px] overflow-y-auto">
                  {displayedActivities.length > 0 ? (
                    displayedActivities.map((phase) => {
                      const isSelected = selectedActivity?.id === phase.id;
                      
                      // Calculate width and column placement dynamically
                      // Max timeline is around 35 days for mock files
                      const startDay = phase.early_start;
                      const duration = phase.baseline_duration_days;
                      
                      // Normalize to fits inside 7 columns (35 days total, 5 days per col)
                      const startPercent = Math.min(95, (startDay / 35) * 100);
                      const widthPercent = Math.min(100 - startPercent, (duration / 35) * 100);

                      return (
                        <div 
                          key={phase.id}
                          onClick={() => setSelectedActivity(phase)}
                          className={`grid grid-cols-12 p-3 items-center cursor-pointer transition-all duration-150 ${
                            isSelected 
                              ? "bg-indigo-50/30 ring-1 ring-inset ring-indigo-100" 
                              : "hover:bg-slate-50/60"
                          }`}
                        >
                          
                          {/* Left Activity details */}
                          <div className="col-span-5 flex flex-col pr-4 text-left">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                phase.status === "completed" 
                                  ? "bg-emerald-500" 
                                  : phase.status === "delayed" 
                                  ? "bg-red-500 animate-pulse" 
                                  : phase.status === "active" 
                                  ? "bg-indigo-500" 
                                  : "bg-slate-300"
                              }`} />
                              <span className="text-[9px] font-mono text-slate-400 font-bold block truncate max-w-[200px]">
                                {phase.trade} • {phase.id}
                              </span>
                            </div>
                            <h4 className={`text-xs font-bold leading-tight truncate ${isSelected ? "text-indigo-950" : "text-slate-800"}`} title={phase.name}>
                              {phase.name}
                            </h4>
                            
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                              <span className="text-[9px] font-mono text-slate-400">
                                Start: {Math.round(phase.early_start)}d • Dur: {Math.round(phase.baseline_duration_days)}d
                              </span>
                              {phase.is_critical_path && (
                                <span className="bg-red-50 text-red-600 text-[8px] font-extrabold uppercase font-mono px-1.5 py-0.2 rounded border border-red-200">
                                  Critical Path
                                </span>
                              )}
                              {phase.total_float > 0 && !phase.is_critical_path && (
                                <span className="bg-indigo-50 text-indigo-600 text-[8px] font-bold font-mono px-1 py-0.2 rounded border border-indigo-150">
                                  Float: {phase.total_float}d
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right Gantt Bar Grid */}
                          <div className="col-span-7 h-8 relative flex items-center">
                            
                            {/* Background Divisions */}
                            <div className="absolute inset-0 grid grid-cols-7 pointer-events-none divide-x divide-slate-100" />
                            
                            {/* The Floating Gantt Bar */}
                            <div 
                              style={{
                                marginLeft: `${startPercent}%`,
                                width: `${Math.max(8, widthPercent)}%`
                              }}
                              className={`h-5.5 rounded relative overflow-hidden group/bar transition-all duration-300 shadow-sm border text-white font-mono font-bold text-[8.5px] flex items-center justify-between px-1.5 select-none ${
                                phase.status === "completed"
                                  ? "bg-emerald-500 border-emerald-600"
                                  : phase.status === "delayed"
                                  ? "bg-red-500 border-red-600 ring-2 ring-red-300 ring-offset-1"
                                  : phase.status === "active"
                                  ? "bg-indigo-600 border-indigo-700"
                                  : "bg-slate-100 border-slate-200 text-slate-400"
                              }`}
                            >
                              {/* Progress bar inside */}
                              <div 
                                className="absolute inset-y-0 left-0 bg-black/15 transition-all duration-500" 
                                style={{ width: `${phase.actual_progress}%` }}
                              />
                              
                              {/* Left & Right Text indicators inside bar */}
                              <span className="relative truncate">{phase.actual_progress}%</span>
                              <span className="relative opacity-80 shrink-0">{Math.round(phase.baseline_duration_days)}d</span>
                            </div>

                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-xs">
                      No activities meet the selected filter criteria.
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Stochastic Risk Control & Monte Carlo Results (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
            
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center text-left">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
                    Stochastic Risk Simulator
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Define site constraints and run Monte Carlo</p>
                </div>
                <span className="text-[9px] bg-slate-100 text-slate-500 font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
                  PERT/Beta
                </span>
              </div>

              {/* Simulation Params Controls */}
              <div className="flex flex-col gap-4 text-xs text-left">
                
                {/* Param 1: Weather Risk severity */}
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-150 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
                      Weather/Monsoon Delay Index
                    </span>
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 text-[10px]">
                      {weatherSeverity === 1.0 ? "None" : weatherSeverity === 1.3 ? "Moderate" : "Severe"}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {[1.0, 1.3, 1.7].map((val) => (
                      <button
                        key={val}
                        onClick={() => setWeatherSeverity(val)}
                        className={`flex-1 py-1.5 rounded font-mono font-bold text-[10px] border transition cursor-pointer ${
                          weatherSeverity === val
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {val === 1.0 ? "1.0x (Dry)" : val === 1.3 ? "1.3x (Rain)" : "1.7x (Monsoon)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Param 2: Labor Availability Shortage */}
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-150 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      Labor Availability Factor
                    </span>
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 text-[10px]">
                      {laborShortage === 1.0 ? "Fully Staffed" : laborShortage === 1.25 ? "Lacking 20%" : "Critical Shift"}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {[1.0, 1.25, 1.5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setLaborShortage(val)}
                        className={`flex-1 py-1.5 rounded font-mono font-bold text-[10px] border transition cursor-pointer ${
                          laborShortage === val
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {val === 1.0 ? "1.0x (Normal)" : val === 1.25 ? "1.25x (Slippage)" : "1.5x (Severe)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Param 3: Iteration count selection */}
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-150 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      Simulation Iterations
                    </span>
                    <span className="font-mono font-bold text-slate-600 text-[10px]">{iterations} Runs</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="100"
                    value={iterations}
                    onChange={(e) => setIterations(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none"
                  />
                </div>

              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={() => runStochasticSimulation(true)}
              disabled={isSimulating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs uppercase py-3 rounded-lg shadow-md transition flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>{isSimulating ? "Recalculating..." : "Run Monte Carlo Forecast"}</span>
            </button>

          </div>
        </div>

      </div>

      {/* 4. LOWER SECTION: MONTE CARLO HISTOGRAM & ACTIVE ELEMENT INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Recharts Monte Carlo Risk Distribution Graph (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-left">
          
          <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Stochastic Project Completion Risk Curves
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Probability density of overall project delays. High spikes represent the most likely delay size.
              </p>
            </div>
            {simulationResult && (
              <div className="flex gap-3 text-[10px] font-mono">
                <span className="text-blue-600">p10: +{simulationResult.p10_delay_days}d</span>
                <span className="text-indigo-600 font-extrabold">p50: +{simulationResult.p50_delay_days}d</span>
                <span className="text-red-600">p90: +{simulationResult.p90_delay_days}d</span>
              </div>
            )}
          </div>

          <div className="h-[250px] w-full">
            {simulationResult && simulationResult.probability_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={simulationResult.probability_distribution}
                  margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="delay_days" 
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: "Delay Days (Variance From Baseline)", position: "insideBottom", offset: -2, fontSize: 10, fill: "#64748b" }}
                  />
                  <YAxis 
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip 
                    contentStyle={{ fontSize: "11px", backgroundColor: "#0f172a", color: "#fff", borderRadius: "8px", border: "none" }}
                    labelFormatter={(label) => `Delay: +${label} Days`}
                    formatter={(value) => [`${value} iterations`, "Frequency"]}
                  />
                  
                  {/* Histogram bars */}
                  <Bar 
                    dataKey="frequency" 
                    fill="#6366f1" 
                    radius={[3, 3, 0, 0]} 
                    maxBarSize={45}
                  />
                  
                  {/* Vertical guide lines representing confidence thresholds */}
                  <ReferenceLine 
                    x={simulationResult.p50_delay_days} 
                    stroke="#4f46e5" 
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    label={{ value: "p50 (Median)", fill: "#4f46e5", fontSize: 9, position: "top", fontWeight: "bold" }} 
                  />
                  <ReferenceLine 
                    x={simulationResult.p90_delay_days} 
                    stroke="#dc2626" 
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    label={{ value: "p90 (Critical Bound)", fill: "#dc2626", fontSize: 9, position: "top", fontWeight: "bold" }} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No simulation data loaded. Click 'Run Monte Carlo Forecast' to compute.
              </div>
            )}
          </div>
        </div>

        {/* Selected Task Details & Predecessor Linking (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md text-left flex flex-col justify-between">
          
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Task Dependency &amp; Float Ledger
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Physical link constraints parsed from file</p>
              </div>
              {selectedActivity?.is_critical_path && (
                <span className="bg-red-500/25 text-red-300 border border-red-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase animate-pulse">
                  Critical Path
                </span>
              )}
            </div>

            {selectedActivity ? (
              <div className="flex flex-col gap-4 text-xs">
                {/* Info block */}
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-black text-white text-sm truncate max-w-[200px]" title={selectedActivity.name}>
                      {selectedActivity.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">UID: {selectedActivity.id}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    selectedActivity.status === "completed" 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                      : selectedActivity.status === "delayed" 
                      ? "bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse" 
                      : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  }`}>
                    {selectedActivity.status}
                  </span>
                </div>

                {/* Specs grids */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950/20 p-3 rounded-lg border border-slate-800/60 font-mono text-[10.5px]">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Total Float Margin</span>
                    <span className={`font-black text-xs ${selectedActivity.is_critical_path ? "text-red-400" : "text-indigo-400"}`}>
                      {selectedActivity.total_float} Days
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Free Float Margin</span>
                    <span className="font-black text-xs text-slate-200">
                      {selectedActivity.free_float} Days
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Early Start / Finish</span>
                    <span className="font-bold text-slate-300">
                      Day {Math.round(selectedActivity.early_start)} → Day {Math.round(selectedActivity.early_finish)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase font-sans">Late Start / Finish</span>
                    <span className="font-bold text-slate-300">
                      Day {Math.round(selectedActivity.late_start)} → Day {Math.round(selectedActivity.late_finish)}
                    </span>
                  </div>
                </div>

                {/* Network Predecessors / Successors representation */}
                <div className="flex flex-col gap-2">
                  <div className="bg-slate-950/45 p-2 rounded border border-slate-800/80 flex flex-col gap-1 text-[10px]">
                    <div className="flex items-center gap-1 text-indigo-400 font-bold">
                      <GitCommit className="w-3.5 h-3.5 shrink-0" />
                      <span>Predecessors (Must finish first)</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activeSchedule?.relationships
                        .filter(r => r.successor_id === selectedActivity.id)
                        .map(rel => {
                          const pred = activeSchedule.activities.find(a => a.id === rel.predecessor_id);
                          return (
                            <span 
                              key={rel.predecessor_id} 
                              className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[8.5px] text-slate-300 cursor-pointer hover:border-slate-600 transition"
                              onClick={() => setSelectedActivity(pred || null)}
                            >
                              {pred ? pred.name : rel.predecessor_id} ({rel.type})
                            </span>
                          );
                        })}
                      {activeSchedule?.relationships.filter(r => r.successor_id === selectedActivity.id).length === 0 && (
                        <span className="text-slate-500 italic text-[9px]">None (Starts project sequence)</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/45 p-2 rounded border border-slate-800/80 flex flex-col gap-1 text-[10px]">
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <GitBranch className="w-3.5 h-3.5 shrink-0" />
                      <span>Successors (Dependent downstream)</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activeSchedule?.relationships
                        .filter(r => r.predecessor_id === selectedActivity.id)
                        .map(rel => {
                          const succ = activeSchedule.activities.find(a => a.id === rel.successor_id);
                          return (
                            <span 
                              key={rel.successor_id} 
                              className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[8.5px] text-slate-300 cursor-pointer hover:border-slate-600 transition"
                              onClick={() => setSelectedActivity(succ || null)}
                            >
                              {succ ? succ.name : rel.successor_id} ({rel.type})
                            </span>
                          );
                        })}
                      {activeSchedule?.relationships.filter(r => r.predecessor_id === selectedActivity.id).length === 0 && (
                        <span className="text-slate-500 italic text-[9px]">None (Final milestone of target branch)</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs">
                Select an activity in the Gantt list to inspect network links.
              </div>
            )}
          </div>

          <div className="p-3 bg-indigo-950 border border-indigo-900/60 rounded-lg text-[10.5px] leading-relaxed text-indigo-200 mt-4 text-left">
            <span className="font-bold text-indigo-300 block uppercase tracking-wider text-[8px] font-mono mb-1">
              Active CV Reality Capture Overlays
            </span>
            <p>
              Actual progress percentages are validated automatically from weekly 360-degree high-fidelity photographic runs mapped to 3D designs.
            </p>
          </div>

        </div>

      </div>

      {/* 5. LOG CONSOLE FOOTER */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800 text-left">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-2">
          FastAPI &amp; CPM Processing Output Stream
        </span>
        <div className="h-28 overflow-y-auto font-mono text-[10px] text-emerald-400 bg-slate-950/60 p-3 rounded-lg border border-slate-850 space-y-1.5 scrollbar-thin">
          {uploadLog.map((log, i) => (
            <div key={i} className="leading-normal break-all">
              {log}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
