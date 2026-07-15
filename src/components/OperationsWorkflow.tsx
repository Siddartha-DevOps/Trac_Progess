import React, { useState, useEffect } from "react";
import { useAppStore } from "../store";
import EnterpriseAutomationCenter from "./EnterpriseAutomationCenter";
import { 
  useProjects, 
  useIssues, 
  useSchedules, 
  useDocuments, 
  useNotifications,
  useAnalytics 
} from "../hooks/enterpriseHooks";
import { 
  Building2, 
  Layers, 
  Upload, 
  Cpu, 
  Eye, 
  AlertTriangle, 
  Hammer, 
  CheckCircle, 
  FileSpreadsheet, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw,
  Plus,
  Play,
  UserCheck,
  TrendingDown,
  Clock,
  ShieldCheck,
  Send,
  Sparkles,
  ClipboardCheck,
  Flame,
  Check
} from "lucide-react";
import { db } from "../services/db";
import { Issue, Document, Schedule } from "../models/domain";

export default function OperationsWorkflow() {
  const [workflowTab, setWorkflowTab] = useState<"operations-wizard" | "automation-center">("automation-center");
  const { activeProject, setActiveProject, currentWeek, setCurrentWeek } = useAppStore();
  const { projects } = useProjects();
  const { issues, updateIssueStatus } = useIssues({ projectId: activeProject.id });
  const { schedules, updateScheduleProgress } = useSchedules(activeProject.id);
  const { documents, uploadDocument } = useDocuments();
  const { notifications } = useNotifications();

  // Workflow Steps Configuration
  const steps = [
    { id: 1, name: "Project Setup", desc: "Select project and setup organization context", icon: Building2 },
    { id: 2, name: "BIM IFC Upload", desc: "Ingest and parse engineering spatial models", icon: Layers },
    { id: 3, name: "Site Walk Upload", desc: "Orthomosaic drone scan and footage ingest", icon: Upload },
    { id: 4, name: "AI Variance Engine", desc: "Run Computer Vision geometric matching", icon: Cpu },
    { id: 5, name: "Discrepancy Review", desc: "Examine deviance tolerances & confidence", icon: Eye },
    { id: 6, name: "Issue Ledger Ingest", desc: "Log quality ticket and raise anomaly alerts", icon: AlertTriangle },
    { id: 7, name: "Subcontractor Dispatch", desc: "Assign trades, crew size, and dispatch orders", icon: Hammer },
    { id: 8, name: "Schedule Re-routing", desc: "Reschedule timeline delays and mitigation", icon: Clock },
    { id: 9, name: "Approval Sign-off", desc: "Sign digital audit trail with role ledger", icon: UserCheck },
    { id: 10, name: "Executive Report", desc: "Generate compliance PDF and export specs", icon: FileSpreadsheet },
  ];

  const [activeStep, setActiveStep] = useState(1);
  const [logs, setLogs] = useState<string[]>([
    "System Initialized. Connected to In-Memory PostgreSQL Core Engine.",
    "Redis Cache warm. Ready for operational dispatch pipeline."
  ]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  // State managers for interactive workflow forms
  // Step 2
  const [ifcFile, setIfcFile] = useState<File | null>(null);
  const [isUploadingIFC, setIsUploadingIFC] = useState(false);
  const [ifcUploaded, setIfcUploaded] = useState(false);

  // Step 3
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  // Step 4
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiCompleted, setAiCompleted] = useState(false);

  // Step 5
  const [selectedReviewIssue, setSelectedReviewIssue] = useState<any>(null);

  // Step 6
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [issueCreatedSuccess, setIssueCreatedSuccess] = useState(false);
  const [newIssueForm, setNewIssueForm] = useState({
    title: "MEP Conduit Alignment Offset",
    category: "MEP Collision" as any,
    level: "high" as any,
    deviation: "24cm axial displacement",
    description: "Main MEP HVAC branch collides with pre-stressed structural beam column. Downstream HVAC plumbing delayed by 6 days.",
    possibleCause: "Pre-assembly structural columns loaded 12cm off design axis coordinate grid."
  });

  // Step 7
  const [selectedTrade, setSelectedTrade] = useState("Concrete Structural Work");
  const [manpowerCount, setManpowerCount] = useState(35);
  const [isDispatched, setIsDispatched] = useState(false);

  // Step 8
  const [mitigationStrategy, setMitigationStrategy] = useState("Introduce parallel shift schedule and increase crew head count by 15.");
  const [isRescheduled, setIsRescheduled] = useState(false);

  // Step 9
  const [approvedByOperator, setApprovedByOperator] = useState(false);
  const [approvedByPM, setApprovedByPM] = useState(false);
  const [approvedByOwner, setApprovedByOwner] = useState(false);
  const [signatureLogs, setSignatureLogs] = useState<string[]>([]);

  // Step 10
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportDownloadUrl, setReportDownloadUrl] = useState<string | null>(null);

  // Synchronization Hook - when project changes, reset step-states
  useEffect(() => {
    addLog(`Switched active workspace context: ${activeProject.name}`);
  }, [activeProject.id]);

  // Step actions
  const handleIFCUpload = async () => {
    setIsUploadingIFC(true);
    addLog("Ingesting IFC structural model into BIM cloud buckets...");
    setTimeout(async () => {
      setIsUploadingIFC(false);
      setIfcUploaded(true);
      await uploadDocument({
        name: `${activeProject.name.replace(/\s+/g, "_")}_BIM_v5.ifc`,
        type: "cad",
        size: "142.4 MB",
        date: "Just now",
        uploader: "Staff Operator (You)",
        status: "Active"
      });
      addLog("IFC file processed. Registered in PostgreSQL Document Table. Geometry indexed successfully.");
    }, 1500);
  };

  const handlePhotoUpload = async () => {
    setIsUploadingPhoto(true);
    addLog("Uploading high-resolution site-walk photogrammetry scan file...");
    setTimeout(async () => {
      setIsUploadingPhoto(false);
      setPhotoUploaded(true);
      await uploadDocument({
        name: `SiteWalk_Scan_Grid_B4_Orthomosaic.mp4`,
        type: "video",
        size: "318.5 MB",
        date: "Just now",
        uploader: "Staff Operator (You)",
        status: "Analyzed"
      });
      addLog("Site walk footage uploaded and registered. Metadata synced with AI ingress stream.");
    }, 1500);
  };

  const runAIEngine = () => {
    setAiProcessing(true);
    setAiProgress(0);
    addLog("Booting TracProgress® Computer Vision AI Alignment Engine...");
    
    const interval = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAiProcessing(false);
          setAiCompleted(true);
          addLog("AI Geometric mismatch calculation completed! 1 core MEP collision found.");
          
          // Inject notification
          db.addNotification({
            id: `notif-${Date.now()}`,
            title: "AI Analysis: Discrepancy Found",
            message: "CV matching detected a critical 24cm offset on column C4.",
            timestamp: "Just now",
            type: "alert",
            read: false
          });
          
          return 100;
        }
        const next = prev + 25;
        addLog(`Processing orthomosaic grid comparison: ${next}% complete...`);
        return next;
      });
    }, 500);
  };

  const handleCreateIssue = async () => {
    setIsCreatingIssue(true);
    addLog("Inserting new quality ticket anomaly directly into database...");
    
    setTimeout(() => {
      const generatedIssue: Issue = {
        id: `anom_offset_${Date.now()}`,
        elementId: "col_c4",
        elementName: "Column C4 (Concrete Structure)",
        category: newIssueForm.category,
        title: newIssueForm.title,
        description: newIssueForm.description,
        level: newIssueForm.level,
        deviation: newIssueForm.deviation,
        possibleCause: newIssueForm.possibleCause,
        status: "open",
        detectedAt: "Just now",
        assignedTradeId: "trade-con",
        remediationPlan: "Adjust structural beam coordinate mapping in subsequent pours."
      };
      
      db.addIssue(generatedIssue);
      setIsCreatingIssue(false);
      setIssueCreatedSuccess(true);
      addLog(`Discrepancy registered with ID ${generatedIssue.id}. Live metrics and dashboard synced.`);
    }, 1200);
  };

  const handleDispatch = () => {
    setIsDispatched(true);
    addLog(`Dispatched trade instructions to subcontractor. Personnel crew set to ${manpowerCount}.`);
    
    // Update trade worker count in database
    const trades = db.getTrades();
    const tradeToUpdate = trades.find(t => t.name === selectedTrade);
    if (tradeToUpdate) {
      tradeToUpdate.activeWorkers = manpowerCount;
    }
  };

  const handleReschedule = async () => {
    setIsRescheduled(true);
    addLog("Recalculating Critical Path with adjusted mitigation baseline...");
    
    // Update schedules to simulate timeline recovery
    const currentSchedules = db.getSchedules();
    const targetSchedule = currentSchedules.find(s => s.status === "delayed");
    if (targetSchedule) {
      targetSchedule.progress = 60;
      targetSchedule.status = "in_progress";
      addLog(`Updated schedule ${targetSchedule.name} progress to 60%. Status restored to In Progress.`);
    }
  };

  const handleSignOff = (role: "operator" | "pm" | "owner") => {
    const timestamp = new Date().toLocaleTimeString();
    if (role === "operator") {
      setApprovedByOperator(true);
      setSignatureLogs(prev => [...prev, `[${timestamp}] Operator verified BIM alignment audit`]);
      addLog("Operator signature committed.");
    } else if (role === "pm") {
      setApprovedByPM(true);
      setSignatureLogs(prev => [...prev, `[${timestamp}] PM authorized workforce adjustments`]);
      addLog("Project Manager authorization signature committed.");
    } else if (role === "owner") {
      setApprovedByOwner(true);
      setSignatureLogs(prev => [...prev, `[${timestamp}] Owner signed-off milestone compliance audit`]);
      addLog("Owner final sign-off committed. Project health restored.");
    }
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    addLog("Compiling dynamic compliance report from live telemetry tables...");
    
    setTimeout(() => {
      setIsGeneratingReport(false);
      setReportDownloadUrl("#");
      addLog("Report PDF compiled successfully. SHA-256 cryptographically sealed.");
    }, 1500);
  };

  const navigateNext = () => {
    if (activeStep < 10) setActiveStep(prev => prev + 1);
  };

  const navigatePrev = () => {
    if (activeStep > 1) setActiveStep(prev => prev - 1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Workflow Navigation Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl self-start gap-1 border border-slate-200/80 shadow-sm">
        <button
          onClick={() => setWorkflowTab("automation-center")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            workflowTab === "automation-center"
              ? "bg-white text-indigo-600 shadow-sm font-extrabold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-indigo-500" />
          Enterprise Automation Center
        </button>
        <button
          onClick={() => setWorkflowTab("operations-wizard")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            workflowTab === "operations-wizard"
              ? "bg-white text-indigo-600 shadow-sm font-extrabold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          Guided Field Operations Pipeline
        </button>
      </div>

      {workflowTab === "automation-center" ? (
        <EnterpriseAutomationCenter />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col lg:flex-row h-[720px]" id="workflow-engine-tab">
      
      {/* SIDEBAR NAVIGATION OF STEPS */}
      <div className="w-full lg:w-80 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 animate-spin text-indigo-400" />
              Workflow Control
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Guided Site Operations dispatch loop</p>
          </div>

          <div className="flex flex-col gap-1.5">
            {steps.map((s) => {
              const Icon = s.icon;
              const isCompleted = s.id < activeStep;
              const isActive = s.id === activeStep;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-all border ${
                    isActive 
                      ? "bg-indigo-600 border-indigo-500 text-white" 
                      : isCompleted 
                        ? "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/60" 
                        : "bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/20"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                    isActive 
                      ? "bg-indigo-500 text-white" 
                      : isCompleted 
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : "bg-slate-800 text-slate-500"
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : s.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block truncate">{s.name}</span>
                    <span className={`text-[9px] block truncate mt-0.5 ${isActive ? "text-indigo-200" : "text-slate-500"}`}>
                      {s.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* COMPACT BRAND CALLOUT */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>PIPELINE ENGINE: ACTIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* CORE WORKSPACE VIEWPORT */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        
        {/* VIEW HEADER */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-indigo-200 font-mono uppercase">
                Step {activeStep} of 10
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase font-mono">TRACPROGRESS ENGINE v1.0</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">{steps[activeStep - 1].name}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={navigatePrev}
              disabled={activeStep === 1}
              className="p-2 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={navigateNext}
              disabled={activeStep === 10}
              className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 text-xs font-bold px-3.5"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* INTERACTIVE WORKFLOW FORMS */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
          
          {/* STEP 1: Project Setup */}
          {activeStep === 1 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect your operational timeline to a designated regional project workspace. This synchronizes all CAD baselines, site camera streams, and drone flight boundaries.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-[10px] text-slate-400 block uppercase font-mono font-bold mb-1.5">Active Project</label>
                  <select
                    value={activeProject.id}
                    onChange={(e) => {
                      const selected = projects.find(p => p.id === e.target.value);
                      if (selected) {
                        setActiveProject({
                          id: selected.id,
                          name: selected.name,
                          location: selected.location,
                          totalCost: selected.totalCost,
                          reraId: selected.reraId,
                          constructionArea: selected.constructionArea,
                          targetDate: selected.targetDate,
                          overallProgress: selected.overallProgress
                        });
                      }
                    }}
                    className="w-full text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-lg"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="text-[10px] text-slate-400 block uppercase font-mono font-bold mb-1.5">RERA Registration Status</label>
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-xs font-extrabold text-slate-700">{activeProject.reraId}</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-emerald-200/50">Verified</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3 mt-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <div className="text-xs text-indigo-900 leading-relaxed">
                  <span className="font-extrabold block">License Verification Status</span>
                  Database handshake with RERA Karnataka confirmed. All operational models initialized under compliance permit.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BIM IFC Upload */}
          {activeStep === 2 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload your engineering spatial model (IFC format). The pipeline engine will isolate physical element GUIDs, material matrices, and coordinate boundaries.
              </p>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50">
                <Layers className="w-12 h-12 text-slate-300 mb-3" />
                <span className="text-xs font-bold text-slate-700">Drag & Drop BIM IFC File</span>
                <span className="text-[10px] text-slate-400 mt-1">Supports standard .ifc schema specifications (max 200MB)</span>
                
                <button
                  onClick={handleIFCUpload}
                  disabled={isUploadingIFC}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition"
                >
                  {isUploadingIFC ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{isUploadingIFC ? "Parsing model..." : "Simulate IFC Upload"}</span>
                </button>
              </div>

              {ifcUploaded && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold text-emerald-800">{activeProject.name.replace(/\s+/g, "_")}_BIM_v5.ifc successfully parsed and cached!</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] px-2 py-0.5 rounded">142 MB</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Site Walk Upload */}
          {activeStep === 3 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <p className="text-xs text-slate-500 leading-relaxed">
                Ingest daily photogrammetry drone walks or 360 camera captures to feed the AI spatial alignment engine.
              </p>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50">
                <Upload className="w-12 h-12 text-slate-300 mb-3" />
                <span className="text-xs font-bold text-slate-700">Drag & Drop 3D Drone Footage or Orthophotos</span>
                <span className="text-[10px] text-slate-400 mt-1">Supports geotagged MP4, JPG, or Point Cloud files</span>

                <button
                  onClick={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition"
                >
                  {isUploadingPhoto ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isUploadingPhoto ? "Syncing walk..." : "Simulate Photo Upload"}</span>
                </button>
              </div>

              {photoUploaded && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold text-emerald-800">SiteWalk_Scan_Grid_B4_Orthomosaic.mp4 ingested!</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] px-2 py-0.5 rounded">318 MB</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: AI Variance Engine */}
          {activeStep === 4 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <p className="text-xs text-slate-500 leading-relaxed">
                Initialize neural mesh projection algorithms. This compares actual physical coordinates from orthophotos with CAD design coordinates to compute geometric displacement.
              </p>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Cpu className={`w-5 h-5 text-indigo-500 ${aiProcessing ? "animate-spin" : ""}`} />
                    <span className="text-xs font-bold text-slate-800">CV Core Execution Pipeline</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">MODEL: TRACALIGN-V1.4</span>
                </div>

                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Status: {aiProcessing ? "Comparing structural nodes..." : aiCompleted ? "Execution Complete" : "Ready"}</span>
                  <span>{aiProgress}%</span>
                </div>

                <button
                  onClick={runAIEngine}
                  disabled={aiProcessing || aiCompleted}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-indigo-400 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition uppercase font-mono tracking-wider border border-slate-800"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>{aiProcessing ? "Executing Align..." : aiCompleted ? "Inference Complete" : "Start Spatial Alignment Inference"}</span>
                </button>
              </div>

              {aiCompleted && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs animate-fade-in flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-red-800 font-bold">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>Computer Vision Variance Alert!</span>
                  </div>
                  <p className="text-[11px] text-red-700 leading-relaxed">
                    Detected a structural component deviation on Column C4. Structural design geometry matches but actual construction has a 24cm axial offset.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Discrepancy Review */}
          {activeStep === 5 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <p className="text-xs text-slate-500 leading-relaxed">
                Review the calculated structural variations. Tolerance limits represent safety criteria; deviations exceeding 5% demand immediate remediation.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
                <div className="border-b border-slate-200 pb-2 mb-2 flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-800 uppercase tracking-wider">Candidate Discrepancy List</span>
                  <span className="bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded text-[9px]">1 Critical Deviation</span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-50 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">Critical</span>
                      <span className="text-xs font-bold text-slate-800">Column C4 Axial Offset</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Detected deviation: 24cm alignment offset from design baseline coordinates.</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] block text-slate-400 font-mono">Confidence</span>
                    <span className="text-xs font-extrabold text-indigo-600 block">94.6% Match</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col gap-2 font-mono text-[11px] border border-slate-800 leading-relaxed">
                <span className="text-indigo-400 font-bold uppercase tracking-widest text-[9px]">Neural Projection Debug Logs</span>
                <div>&gt; Loading camera matrix and lens calibration data... OK</div>
                <div>&gt; Comparing point-clouds matching spatial GUID C4...</div>
                <div>&gt; 24cm Euclidean delta measured. Threshold 5cm exceeded.</div>
              </div>
            </div>
          )}

          {/* STEP 6: Issue Ledger Ingest */}
          {activeStep === 6 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <p className="text-xs text-slate-500 leading-relaxed">
                Log the identified CV variance as a formal, high-priority quality issue. This registers the anomaly in the primary issues ledger to notify trades.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono font-bold">Issue Title</label>
                    <input
                      type="text"
                      value={newIssueForm.title}
                      onChange={(e) => setNewIssueForm(prev => ({ ...prev, title: e.target.value }))}
                      className="text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono font-bold">Category</label>
                    <select
                      value={newIssueForm.category}
                      onChange={(e) => setNewIssueForm(prev => ({ ...prev, category: e.target.value as any }))}
                      className="text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="Reinforcement">Reinforcement (Rebar)</option>
                      <option value="MEP Collision">MEP Collision</option>
                      <option value="Geometric Shift">Geometric Shift</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono font-bold">Deviation Specs</label>
                  <input
                    type="text"
                    value={newIssueForm.deviation}
                    onChange={(e) => setNewIssueForm(prev => ({ ...prev, deviation: e.target.value }))}
                    className="text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono font-bold">Description</label>
                  <textarea
                    rows={2}
                    value={newIssueForm.description}
                    onChange={(e) => setNewIssueForm(prev => ({ ...prev, description: e.target.value }))}
                    className="text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg resize-none"
                  />
                </div>

                <button
                  onClick={handleCreateIssue}
                  disabled={isCreatingIssue || issueCreatedSuccess}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  {isCreatingIssue ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{isCreatingIssue ? "Ingesting ticket..." : issueCreatedSuccess ? "Ingested in Database" : "Commit Issue to Enterprise Ledger"}</span>
                </button>
              </div>

              {issueCreatedSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold">Database updated successfully. "Issues" Tab and "AI Analysis" views are now perfectly synchronized.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: Subcontractor Dispatch */}
          {activeStep === 7 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <p className="text-xs text-slate-500 leading-relaxed">
                Dispatch concrete structural trades to Grid C4 with explicit engineering repair workflows and adjust the site manpower head count.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono font-bold">Assigned Trade</label>
                    <select
                      value={selectedTrade}
                      onChange={(e) => setSelectedTrade(e.target.value)}
                      className="text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="Concrete Structural Work">Concrete Structural Work (L&T)</option>
                      <option value="Mechanical & Electrical Plinth">Mechanical & Electrical Plinth (Sterling & Wilson)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono font-bold">Crew Head Count</label>
                    <input
                      type="number"
                      value={manpowerCount}
                      onChange={(e) => setManpowerCount(Number(e.target.value))}
                      className="text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDispatch}
                  disabled={isDispatched}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-indigo-400 font-bold rounded-lg text-xs font-mono tracking-wider transition border border-slate-800"
                >
                  {isDispatched ? "DISPATCH ORDER SENT" : "TRANSMIT DISPATCH INSTRUCTIONS VIA SMS & WORKSPACE API"}
                </button>
              </div>

              {isDispatched && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold">Real-time team sync achieved. Selected Trade active personnel updated in the database.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 8: Schedule Re-routing */}
          {activeStep === 8 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <p className="text-xs text-slate-500 leading-relaxed">
                Mitigate the column delay by re-routing the Critical Path timeline. Adjust the progress of downstream milestones to absorb the delay.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase font-mono font-bold">Timeline Mitigation Strategy</label>
                  <textarea
                    rows={2}
                    value={mitigationStrategy}
                    onChange={(e) => setMitigationStrategy(e.target.value)}
                    className="text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg resize-none"
                  />
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-red-800">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span>Current Delay Impact: <strong>+4 Days</strong></span>
                  </div>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">Critical Path</span>
                </div>

                <button
                  onClick={handleReschedule}
                  disabled={isRescheduled}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition"
                >
                  {isRescheduled ? "Timeline Re-baselined" : "Recalculate & Re-baseline Project Timeline"}
                </button>
              </div>

              {isRescheduled && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold">Schedule model updated. GANTT schedules view recalculated with zero downstream pipeline friction.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 9: Approval Sign-off */}
          {activeStep === 9 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <p className="text-xs text-slate-500 leading-relaxed">
                Collect digital cryptographic sign-offs from all stakeholders to formalize structural pour compliance before setting concrete.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Operator Signature */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between h-36">
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Verification Node 1</span>
                    <span className="text-xs font-bold text-slate-700 block mt-1">Lead Field Operator</span>
                  </div>
                  {approvedByOperator ? (
                    <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> SECURELY SIGNED</span>
                  ) : (
                    <button
                      onClick={() => handleSignOff("operator")}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold"
                    >
                      Approve & Sign
                    </button>
                  )}
                </div>

                {/* PM Signature */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between h-36">
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Verification Node 2</span>
                    <span className="text-xs font-bold text-slate-700 block mt-1">Project Manager</span>
                  </div>
                  {approvedByPM ? (
                    <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> SECURELY SIGNED</span>
                  ) : (
                    <button
                      onClick={() => handleSignOff("pm")}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold"
                    >
                      Approve & Sign
                    </button>
                  )}
                </div>

                {/* Owner Signature */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between h-36">
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono font-bold uppercase block">Verification Node 3</span>
                    <span className="text-xs font-bold text-slate-700 block mt-1">Client/Owner Sign-off</span>
                  </div>
                  {approvedByOwner ? (
                    <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> SECURELY SIGNED</span>
                  ) : (
                    <button
                      onClick={() => handleSignOff("owner")}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold"
                    >
                      Approve & Sign
                    </button>
                  )}
                </div>
              </div>

              {signatureLogs.length > 0 && (
                <div className="bg-slate-900 text-white p-3 rounded-lg font-mono text-[10px] border border-slate-800 leading-relaxed">
                  <span className="text-indigo-400 font-bold block uppercase mb-1">Cryptographic Ledger Registry</span>
                  {signatureLogs.map((log, idx) => (
                    <div key={idx}>&gt; {log}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 10: Executive Reporting */}
          {activeStep === 10 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate the final executive RERA-compliant PDF report outlining the captured anomalies, mitigations, rescheduled Gantt stages, and sign-off ledger records.
              </p>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
                <FileSpreadsheet className="w-12 h-12 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">RERA Compliance Report Builder</span>
                <span className="text-[10px] text-slate-400 mt-1">Generates encrypted PDFs with cryptographical verification tokens</span>

                <button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="mt-4 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-indigo-400 rounded-lg text-xs font-mono font-extrabold tracking-wider border border-slate-800 uppercase flex items-center gap-1.5"
                >
                  {isGeneratingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                  <span>{isGeneratingReport ? "Compiling PDF..." : "Compile Executive Report PDF"}</span>
                </button>
              </div>

              {reportDownloadUrl && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold">Compliance Report ready for export!</span>
                  </div>
                  <a 
                    href="#" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-extrabold shadow-sm transition"
                  >
                    Download Report PDF
                  </a>
                </div>
              )}
            </div>
          )}

        </div>

        {/* COMPACT REAL-TIME SYSTEM LOGGER CONSOLE */}
        <div className="p-4 bg-slate-950 text-white h-40 shrink-0 border-t border-slate-900 font-mono text-[10px] overflow-y-auto flex flex-col-reverse gap-1 select-all select-none">
          {logs.map((log, index) => (
            <div key={index} className={`leading-relaxed ${log.includes("Warning") || log.includes("Variance") || log.includes("offset") ? "text-amber-400" : log.includes("Complete") || log.includes("success") || log.includes("synced") ? "text-emerald-400" : "text-slate-300"}`}>
              {log}
            </div>
          ))}
          <div className="text-[9px] text-indigo-400 border-b border-slate-900 pb-1 mb-1 font-bold uppercase tracking-wider flex justify-between items-center">
            <span>Enterprise Pipeline Sync Telemetry Log</span>
            <span>ID: pipeline_eng_892</span>
          </div>
        </div>

      </div>

    </div>
      )}
    </div>
  );
}
