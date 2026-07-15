import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Layers, 
  Upload, 
  Cpu, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Hammer, 
  UserCheck, 
  FileSpreadsheet, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw,
  Plus,
  Play,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Send,
  Sparkles,
  ClipboardCheck,
  ChevronRight,
  Database,
  DollarSign,
  Briefcase,
  Users,
  Search,
  Filter,
  Sliders,
  ChevronDown,
  Info,
  Calendar,
  ThumbsUp,
  Ruler,
  BadgeAlert,
  HardHat,
  Share2,
  FileDown
} from "lucide-react";
import { useAppStore } from "../store";
import { db } from "../services/db";

export default function InteractiveWorkflows() {
  const [activeWorkflow, setActiveWorkflow] = useState<1 | 2 | 3>(1);
  const { activeProject, currentWeek } = useAppStore();

  // ---------------------------------------------------------
  // WORKFLOW 1 STATES: Site Engineer Walkthrough & Primavera Sync
  // ---------------------------------------------------------
  const [wf1Step, setWf1Step] = useState<number>(1);
  const [wf1File, setWf1File] = useState<string | null>(null);
  const [wf1Uploading, setWf1Uploading] = useState<boolean>(false);
  const [wf1Progress, setWf1Progress] = useState<number>(0);
  const [wf1BimAligning, setWf1BimAligning] = useState<boolean>(false);
  const [wf1AlignProgress, setWf1AlignProgress] = useState<number>(0);
  const [wf1DetectedProgress, setWf1DetectedProgress] = useState<any>(null);
  const [wf1ScheduleUpdating, setWf1ScheduleUpdating] = useState<boolean>(false);
  const [wf1ScheduleUpdated, setWf1ScheduleUpdated] = useState<boolean>(false);
  const [wf1ReportGenerating, setWf1ReportGenerating] = useState<boolean>(false);
  const [wf1ReportUrl, setWf1ReportUrl] = useState<boolean>(false);
  const [wf1Certified, setWf1Certified] = useState<boolean>(false);
  const [wf1ExportingPrimavera, setWf1ExportingPrimavera] = useState<boolean>(false);
  const [wf1Exported, setWf1Exported] = useState<boolean>(false);

  // ---------------------------------------------------------
  // WORKFLOW 2 STATES: Project Director Delay Analyzer
  // ---------------------------------------------------------
  const [wf2Tab, setWf2Tab] = useState<"bim" | "schedule" | "images" | "ai" | "progress" | "subcontractor" | "reports">("ai");
  const [wf2AiQuerying, setWf2AiQuerying] = useState<boolean>(false);
  const [wf2AiAnswer, setWf2AiAnswer] = useState<string | null>(null);
  const [wf2MitigationApplied, setWf2MitigationApplied] = useState<boolean>(false);

  // ---------------------------------------------------------
  // WORKFLOW 3 STATES: Commercial Manager Subcontractor Invoice
  // ---------------------------------------------------------
  const [wf3SelectedInvoice, setWf3SelectedInvoice] = useState<string>("inv-voltsparks-01");
  const [wf3Verified, setWf3Verified] = useState<boolean>(false);
  const [wf3Verifying, setWf3Verifying] = useState<boolean>(false);
  const [wf3Recommended, setWf3Recommended] = useState<boolean>(false);
  const [wf3CertificationUrl, setWf3CertificationUrl] = useState<boolean>(false);

  // Reset helper when swapping workflows
  useEffect(() => {
    // Just a clean visual log in standard console or storage if desired
  }, [activeWorkflow]);

  // Actions for Workflow 1
  const startWf1Upload = () => {
    setWf1Uploading(true);
    setWf1Progress(0);
    const interval = setInterval(() => {
      setWf1Progress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setWf1Uploading(false);
          setWf1File("SiteWalk_TowerB_Level3_15072026.mp4");
          setWf1Step(2); // Auto move or let user click
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const startWf1BimAlign = () => {
    setWf1BimAligning(true);
    setWf1AlignProgress(0);
    const interval = setInterval(() => {
      setWf1AlignProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setWf1BimAligning(false);
          // Set progress detection results
          setWf1DetectedProgress({
            elementsChecked: 145,
            matchingTolerance: "98.4%",
            clashesFound: 1,
            tradesMatched: [
              { name: "Concrete Structural Work", completion: "94%", plan: "92%", deviation: "+2% (Ahead)" },
              { name: "Drywall & Masonry Partitioning", completion: "60%", plan: "75%", deviation: "-15% (Delayed)" },
              { name: "HVAC Ductwork & Plumbing", completion: "45%", plan: "65%", deviation: "-20% (Delayed)" },
            ]
          });
          setWf1Step(3);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const updateWf1Schedule = () => {
    setWf1ScheduleUpdating(true);
    setTimeout(() => {
      setWf1ScheduleUpdating(false);
      setWf1ScheduleUpdated(true);
      setWf1Step(4);
    }, 1200);
  };

  const generateWf1Report = () => {
    setWf1ReportGenerating(true);
    setTimeout(() => {
      setWf1ReportGenerating(false);
      setWf1ReportUrl(true);
      setWf1Step(5);
    }, 1200);
  };

  const certifyWf1Progress = () => {
    setWf1Certified(true);
    setWf1Step(6);
  };

  const exportWf1Primavera = () => {
    setWf1ExportingPrimavera(true);
    setTimeout(() => {
      setWf1ExportingPrimavera(false);
      setWf1Exported(true);
      setWf1Step(7);
    }, 1500);
  };

  const resetWf1 = () => {
    setWf1Step(1);
    setWf1File(null);
    setWf1Uploading(false);
    setWf1Progress(0);
    setWf1BimAligning(false);
    setWf1AlignProgress(0);
    setWf1DetectedProgress(null);
    setWf1ScheduleUpdating(false);
    setWf1ScheduleUpdated(false);
    setWf1ReportGenerating(false);
    setWf1ReportUrl(false);
    setWf1Certified(false);
    setWf1ExportingPrimavera(false);
    setWf1Exported(false);
  };

  // Actions for Workflow 2
  const runWf2AiAnalysis = () => {
    setWf2AiQuerying(true);
    setTimeout(() => {
      setWf2AiQuerying(false);
      setWf2AiAnswer(
        "Tower B Level 3 is delayed by 14 days due to a critical coordination clash between the Structural Concrete partition walls and the HVAC distribution pipeline. Subcontractor VoltSparks failed to coordinate structural sleeves with FlowPlumb prior to column concrete pouring. Physical inspection from July 14 site-walk confirms drywall framing is completely halted on Room B-304 due to this un-plumbed ductwork."
      );
    }, 1500);
  };

  // Actions for Workflow 3
  const invoices = {
    "inv-voltsparks-01": {
      subcontractor: "VoltSparks MEP Solutions",
      trade: "HVAC & Electrical Ducting",
      location: "Tower B - Level 3",
      amountClaimed: "$18,000",
      progressClaimed: "90%",
      plannedProgress: "75%",
      aiVerifiedProgress: "60%",
      aiVerifiedValue: "$12,000",
      discrepancyAmount: "+$6,000 Over-claim",
      visualProof: "360° Walkthrough photo confirms HVAC runs terminate prematurely at Grid Col C4.",
      bimExpectedLength: "320 meters",
      realityFoundLength: "192 meters (60% physical installation complete)",
      boqCode: "BOQ-HVAC-302",
      status: "Discrepancy Detected"
    },
    "inv-flowplumb-02": {
      subcontractor: "FlowPlumb Systems",
      trade: "Plumbing & Sanitary Runs",
      location: "Tower A - Level 2",
      amountClaimed: "$24,500",
      progressClaimed: "85%",
      plannedProgress: "80%",
      aiVerifiedProgress: "85%",
      aiVerifiedValue: "$24,500",
      discrepancyAmount: "$0 (Matched)",
      visualProof: "Orthomosaic model confirms layout is fully aligned to engineering design with zero pending sleeves.",
      bimExpectedLength: "450 meters",
      realityFoundLength: "450 meters (100% completed according to sub-schedule)",
      boqCode: "BOQ-PLUMB-201",
      status: "Perfect Match"
    }
  };

  const handleWf3Verify = () => {
    setWf3Verifying(true);
    setTimeout(() => {
      setWf3Verifying(false);
      setWf3Verified(true);
    }, 1200);
  };

  const handleWf3Recommend = () => {
    setWf3Recommended(true);
    setTimeout(() => {
      setWf3CertificationUrl(true);
    }, 800);
  };

  const resetWf3 = () => {
    setWf3Verified(false);
    setWf3Verifying(false);
    setWf3Recommended(false);
    setWf3CertificationUrl(false);
  };

  const activeInv = invoices[wf3SelectedInvoice as keyof typeof invoices];

  return (
    <div className="flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                TracProgress Sandbox
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-100 mt-1">
              Interactive Scenario Playbook
            </h1>
            <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
              Experience the end-to-end power of TracProgress. Click through the real operational workflows requested by executives and verify the physical reality of on-site project management.
            </p>
          </div>
        </div>
      </div>

      {/* THREE WORKFLOW SWITCHER CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WORKFLOW 1 SWITCHER */}
        <button
          onClick={() => { setActiveWorkflow(1); resetWf1(); }}
          className={`text-left p-5 rounded-xl border transition-all flex flex-col justify-between h-40 ${
            activeWorkflow === 1
              ? "bg-slate-900 border-indigo-500 text-white shadow-md ring-2 ring-indigo-500/20"
              : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg text-xs font-bold font-mono ${activeWorkflow === 1 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>WF-01</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Site Walk Pipeline</span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider mt-2 line-clamp-1">Site Walk to Primavera Sync</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">Capture 360° walks, auto-align with BIM geometry, update baseline schedules, and export P6 schedules.</p>
          </div>
          <span className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 mt-2">
            Launch Simulation <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* WORKFLOW 2 SWITCHER */}
        <button
          onClick={() => { setActiveWorkflow(2); setWf2AiAnswer(null); setWf2MitigationApplied(false); }}
          className={`text-left p-5 rounded-xl border transition-all flex flex-col justify-between h-40 ${
            activeWorkflow === 2
              ? "bg-slate-900 border-indigo-500 text-white shadow-md ring-2 ring-indigo-500/20"
              : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg text-xs font-bold font-mono ${activeWorkflow === 2 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>WF-02</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Delay root-cause</span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider mt-2 line-clamp-1">"Why is Tower B Delayed?"</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">Cross-reference 3D BIM layers, images, scheduling sequences, subcontractor metrics, and AI recommendations.</p>
          </div>
          <span className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 mt-2">
            Launch Simulation <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* WORKFLOW 3 SWITCHER */}
        <button
          onClick={() => { setActiveWorkflow(3); resetWf3(); }}
          className={`text-left p-5 rounded-xl border transition-all flex flex-col justify-between h-40 ${
            activeWorkflow === 3
              ? "bg-slate-900 border-indigo-500 text-white shadow-md ring-2 ring-indigo-500/20"
              : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg text-xs font-bold font-mono ${activeWorkflow === 3 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>WF-03</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Commercial billing</span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider mt-2 line-clamp-1">Subcontractor Invoice Audit</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">Audit claims against photogrammetry volumes, model expectations, and BOQ line items without manual excel sheets.</p>
          </div>
          <span className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 mt-2">
            Launch Simulation <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>

      {/* ACTIVE WORKFLOW VIEWER SPACE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        
        {/* ========================================================================= */}
        {/* WORKFLOW 1 PANEL: Site Engineer Walkthrough & Primavera Sync */}
        {/* ========================================================================= */}
        {activeWorkflow === 1 && (
          <div className="p-6 flex flex-col lg:flex-row gap-6">
            
            {/* Left Column: Interactive Actions Pipeline */}
            <div className="flex-1 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">Workflow 1: Site Walk, Detect, & Sync with Primavera P6</h2>
                <p className="text-xs text-slate-400 mt-0.5">site walk capture → upload walkthrough → align BIM → update schedule → generate report → certify → export to Primavera.</p>
              </div>

              {/* Progress Indicator Steps */}
              <div className="grid grid-cols-7 gap-2">
                {[
                  { label: "1. Upload Walk", done: wf1Step >= 2, act: wf1Step === 1 },
                  { label: "2. Align BIM", done: wf1Step >= 3, act: wf1Step === 2 },
                  { label: "3. Progress", done: wf1Step >= 4, act: wf1Step === 3 },
                  { label: "4. Schedule", done: wf1Step >= 5, act: wf1Step === 4 },
                  { label: "5. Report", done: wf1Step >= 6, act: wf1Step === 5 },
                  { label: "6. Certify", done: wf1Step >= 7, act: wf1Step === 6 },
                  { label: "7. Primavera", done: wf1Step === 7, act: wf1Step === 7 }
                ].map((s, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className={`h-1.5 rounded-full ${s.done ? "bg-emerald-500" : s.act ? "bg-indigo-600 animate-pulse" : "bg-slate-200"}`} />
                    <span className={`text-[9px] font-bold text-center truncate ${s.done ? "text-emerald-600" : s.act ? "text-indigo-600 font-extrabold" : "text-slate-400"}`}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Step View Switcher */}
              <div className="bg-slate-50 p-5 border border-slate-150 rounded-xl min-h-[220px] flex flex-col justify-between">
                
                {wf1Step === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-indigo-500" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase">Step 1: Capture Walkthrough & Upload Walkthrough Video</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Project Engineer mounts a GoPro Hero Max 360° camera on their hardhat and walks the project sector (Tower B, Floor 3). Upload the captured video to let TracProgress map the spatial trajectory.
                    </p>
                    
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center flex flex-col items-center justify-center bg-white hover:border-indigo-400 transition">
                      {wf1Uploading ? (
                        <div className="space-y-2 w-full max-w-xs">
                          <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                          <div className="flex justify-between text-[10px] font-mono text-slate-500">
                            <span>Uploading video chunks...</span>
                            <span>{wf1Progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1">
                            <div className="bg-indigo-600 h-1 rounded-full transition-all duration-150" style={{ width: `${wf1Progress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                          <div>
                            <p className="text-[11px] font-bold text-slate-700">Drag & Drop Walkthrough Video here</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">MP4, MOV, or raw 360° stitched stream up to 5GB</p>
                          </div>
                          <button
                            onClick={startWf1Upload}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-sm"
                          >
                            Upload SiteWalk_TowerB_Level3.mp4
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {wf1Step === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-500" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase">Step 2: Align Reality Walkthrough with BIM IFC Coordinates</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Now, the TracProgress computer vision engine segments the video, extracts visual spatial coordinates, and registers the walkthrough directly against the active IFC design file.
                    </p>

                    <div className="bg-white p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                      {wf1BimAligning ? (
                        <div className="flex items-center gap-3">
                          <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">Calculating ICP Matrix Registration...</span>
                            <span className="text-[10px] text-slate-400">Mean squared error convergence at {wf1AlignProgress}%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold font-mono text-xs">IFC</div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">SiteWalk_TowerB_Level3.mp4 Ingested</span>
                            <span className="text-[10px] font-mono text-slate-400">File size: 318.5 MB • 24.1k frames extracted</span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={startWf1BimAlign}
                        disabled={wf1BimAligning}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all"
                      >
                        {wf1BimAligning ? "Aligning..." : "Run BIM Alignment Engine"}
                      </button>
                    </div>
                  </div>
                )}

                {wf1Step === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase">Step 3: Auto-Detect Installation Progress</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Alignment complete! TracProgress automatically calculated physical installation percentages against model specifications. Click below to update the central milestone schedule database with these findings.
                    </p>

                    <div className="bg-white p-4 border border-slate-200 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-700">CV Registration Accuracy:</span>
                        <span className="font-mono text-emerald-600 font-bold">98.4% Confidence</span>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Drywall partition framing:</span>
                          <span className="font-bold text-red-600">60% Complete (Target: 75%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Concrete Core Columns L3:</span>
                          <span className="font-bold text-emerald-600">94% Complete (Target: 92%)</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={updateWf1Schedule}
                        disabled={wf1ScheduleUpdating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg mt-2 flex items-center justify-center gap-2"
                      >
                        {wf1ScheduleUpdating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Updating schedule database...</span>
                          </>
                        ) : (
                          <>
                            <span>Update Internal Schedule</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {wf1Step === 4 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-500" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase">Step 4: Update Internal Gantt & Predict Float</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Schedule updated! TracProgress has recalculated the critical path. Real-time float updated and milestone slippage forecasted. Now, generate a cryptographically sealed compliance report.
                    </p>

                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold">Internal Gantt Sync Succeeded</p>
                        <p className="text-[10px] mt-0.5 leading-relaxed">
                          Drywall partition and HVAC activity progress has been pushed into the project timeline. Anomaly warnings have triggered mitigation proposals.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={generateWf1Report}
                      disabled={wf1ReportGenerating}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2"
                    >
                      {wf1ReportGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating report...</span>
                        </>
                      ) : (
                        <>
                          <span>Generate Dynamic Site Report</span>
                          <FileText className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                {wf1Step === 5 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase">Step 5: Review & Cryptographically Seal Compliance Report</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      A daily site walk compliance report has been generated. The report compiles visual photogrammetry proofs, BIM alignment coordinate matrices, and milestone risk updates. Certify the report now.
                    </p>

                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">TracProgress_DailyReport_TowerB.pdf</span>
                          <span className="text-[9px] text-slate-400 font-mono">SHA-256: 7f4d2a...19e5</span>
                        </div>
                      </div>
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded border border-indigo-100 font-mono">COMPILED</span>
                    </div>

                    <button
                      onClick={certifyWf1Progress}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2"
                    >
                      <span>Certify Progress & Authorize Sign-Off</span>
                      <UserCheck className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {wf1Step === 6 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-emerald-500" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase">Step 6: Certified Progress & Authorized Audit Trail</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Verification signed! The progress is officially sealed on the tamper-proof ledger. Export this verified state to Primavera P6 without ever leaving TracProgress.
                    </p>

                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold">Milestone Verified & Certified</p>
                        <p className="text-[10px] mt-0.5 leading-relaxed">
                          Progress values signed by Project Engineer, Site Auditor, and Project Director. RERA audit trail logged in PostgreSQL ledger.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={exportWf1Primavera}
                      disabled={wf1ExportingPrimavera}
                      className="bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 border border-slate-800 shadow-md"
                    >
                      {wf1ExportingPrimavera ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>P6 File Exporting...</span>
                        </>
                      ) : (
                        <>
                          <span>Export to Primavera P6 (XER)</span>
                          <FileSpreadsheet className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                {wf1Step === 7 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-bounce" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase">Step 7: Primavera P6 File Ready!</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Success! The verified project progress has been successfully formatted and is ready for P6 synchronization. You have completed the entire pipeline without leaving TracProgress.
                    </p>

                    <div className="bg-white border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">TracProgress_P6_Import_TowerB.xer</span>
                          <span className="text-[9px] text-slate-400 font-mono">Format: Primavera P6 XER Database</span>
                        </div>
                      </div>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-2 rounded font-mono uppercase"
                      >
                        Download XER
                      </a>
                    </div>

                    <button
                      onClick={resetWf1}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold self-start flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Restart Simulation</span>
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Visual State Feed */}
            <div className="w-full lg:w-96 bg-slate-900 rounded-xl p-5 border border-slate-800 text-white flex flex-col justify-between h-[420px] shrink-0 font-mono text-xs">
              <div className="space-y-4 overflow-y-auto pr-1">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Live Telemetry Terminal</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="space-y-2.5 text-[11px] font-mono leading-relaxed">
                  <div className="text-slate-400">
                    [03:28:17] Connecting to In-Memory Core...
                  </div>
                  <div className="text-slate-300 font-semibold">
                    [03:28:18] GPS Coordinates matched: 18.5204° N, 73.8567° E (Pune)
                  </div>
                  {wf1Step >= 2 && (
                    <div className="text-indigo-300">
                      [03:28:25] Ingested raw video file: site_walk_tB_L3.mp4 (Size: 318.5 MB)
                    </div>
                  )}
                  {wf1Step >= 3 && (
                    <div className="text-amber-400">
                      [03:28:35] CV Alignment Engine loaded. MSE Residual Converged: 0.043
                    </div>
                  )}
                  {wf1Step >= 3 && wf1DetectedProgress && (
                    <div className="text-emerald-400">
                      [03:28:40] Verified quantities: Drywall partitions at 60%, Concrete column structures at 94%.
                    </div>
                  )}
                  {wf1Step >= 5 && (
                    <div className="text-indigo-300">
                      [03:28:50] PDF report compiled with SHA-256 seal. Verified RERA compliance ledger updated.
                    </div>
                  )}
                  {wf1Step >= 7 && (
                    <div className="text-emerald-300 font-bold">
                      [03:29:10] Exported state file to Primavera format. Baseline schedule is 100% in sync!
                    </div>
                  )}
                </div>
              </div>

              {/* Live interactive visual representation based on active step */}
              <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Platform State</span>
                  <span className="text-white font-extrabold text-[11px]">
                    {wf1Step === 1 && "WALKTHROUGH INGEST"}
                    {wf1Step === 2 && "BIM COORDINATE ALIGNMENT"}
                    {wf1Step === 3 && "QUANTITY DETECTION HUD"}
                    {wf1Step === 4 && "CRITICAL PATH BASING"}
                    {wf1Step === 5 && "REPORT COMPILATION"}
                    {wf1Step === 6 && "AUTHORIZED AUDIT SIGN-OFF"}
                    {wf1Step === 7 && "PRIMAVERA FILE READY"}
                  </span>
                </div>
                <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[9px] font-mono font-bold text-indigo-400 uppercase">
                  ACTIVE
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* WORKFLOW 2 PANEL: Project Director Delay Analyzer */}
        {/* ========================================================================= */}
        {activeWorkflow === 2 && (
          <div className="p-6 flex flex-col gap-6">
            
            {/* Top Area: The executive query context */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[9px] bg-red-50 text-red-700 border border-red-200/60 font-bold px-2 py-0.5 rounded font-mono uppercase">Critical Delay Query</span>
                <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">Project Director Scenario: "Why is Tower B delayed?"</h3>
                <p className="text-xs text-slate-500">Cross-examine the exact root cause of the Tower B milestone slip using 7 integrated perspectives in one seamless workspace.</p>
              </div>

              <button
                onClick={runWf2AiAnalysis}
                disabled={wf2AiQuerying}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all shadow-sm shrink-0 flex items-center gap-2"
              >
                {wf2AiQuerying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Querying integrated engine...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Ask TracProgress AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Split Panel Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Side: 7 Integrated Sources Panel (8 Cols) */}
              <div className="lg:col-span-8 border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[450px]">
                
                {/* 7 tabs switcher representing the sources */}
                <div className="bg-slate-100 border-b border-slate-200 p-1 flex overflow-x-auto gap-1">
                  {[
                    { id: "ai", label: "1. AI Insights", icon: Sparkles },
                    { id: "bim", label: "2. BIM Models", icon: Layers },
                    { id: "schedule", label: "3. P6 Schedule", icon: Calendar },
                    { id: "images", label: "4. Site Imagery", icon: Camera },
                    { id: "progress", label: "5. Physical Progress", icon: TrendingUp },
                    { id: "subcontractor", label: "6. Trades Data", icon: HardHat },
                    { id: "reports", label: "7. Daily Reports", icon: FileText }
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setWf2Tab(t.id as any)}
                        className={`px-3 py-2 rounded-lg text-[10px] font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                          wf2Tab === t.id
                            ? "bg-white text-indigo-600 shadow-sm font-black"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Main source content body */}
                <div className="flex-1 p-5 overflow-y-auto bg-white text-xs leading-relaxed">
                  
                  {wf2Tab === "ai" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase">Integrated AI Reasoning Report</h4>
                      </div>

                      {wf2AiAnswer ? (
                        <div className="space-y-3">
                          <p className="text-slate-600 leading-relaxed text-xs">
                            {wf2AiAnswer}
                          </p>
                          <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl text-amber-800 space-y-2">
                            <span className="font-bold flex items-center gap-1.5 text-xs text-amber-950">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              Clash Identification Alert
                            </span>
                            <p className="text-[11px] leading-relaxed">
                              Computer Vision geometry matching detected an HVAC layout collision on Column C4. Subcontractor <strong>VoltSparks MEP</strong> failed to leave structural blockout openings prior to column pours on Tower B Level 3, introducing a 14-day delay chain for drywall partition activities.
                            </p>
                          </div>

                          {!wf2MitigationApplied ? (
                            <button
                              onClick={() => setWf2MitigationApplied(true)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 self-start mt-2"
                            >
                              <Hammer className="w-4 h-4 text-white" />
                              <span>Dispatch Automated Mitigation Order</span>
                            </button>
                          ) : (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="font-bold text-[11px]">Mitigation dispatched: Drywall sequencing adjusted to bypass column C4 HVAC segment temporarily. Flow margin restored!</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                          <Sparkles className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                          <p className="font-bold text-slate-700 text-xs">AI Reasoning Engine Ready</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">Click "Ask TracProgress AI" above to combine all 7 data sources and explain the Tower B delay.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {wf2Tab === "bim" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Layers className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase">3D BIM spatial Clash overlay</h4>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        The virtual 3D IFC structural model (Revit coordinate space) showing the exact location of the collision at Tower B, Level 3 column C4.
                      </p>
                      
                      <div className="bg-slate-900 h-48 rounded-lg flex flex-col justify-center items-center text-center p-4 border border-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 to-slate-950/40" />
                        <div className="z-10 space-y-2">
                          <Layers className="w-8 h-8 text-indigo-400 mx-auto animate-bounce" />
                          <p className="text-slate-200 font-bold font-mono text-xs">TowerB_HVAC_Sleeve_Clash.ifc</p>
                          <p className="text-[10px] text-red-400 font-mono">CRITICAL CLASH: MEP Duct vs Structural Column C4 (GUID: col_c4_tB)</p>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded text-[9px] font-mono text-red-300">
                          COORDINATES: X: 142.54m, Y: 84.12m, Z: 12.4m
                        </div>
                      </div>
                    </div>
                  )}

                  {wf2Tab === "schedule" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase">Primavera P6 baseline Timeline Comparison</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex justify-between text-xs border-b border-slate-150 pb-1.5">
                            <span className="font-bold text-slate-700">Primavera baseline:</span>
                            <span className="font-mono text-red-600 font-bold">-14 Days Slip forecasted</span>
                          </div>
                          <div className="space-y-1 text-[11px] text-slate-600">
                            <div className="flex justify-between">
                              <span>Planned Drywall Start:</span>
                              <span className="font-mono font-semibold">June 25, 2026</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Actual Drywall Start:</span>
                              <span className="font-mono font-semibold text-red-500">July 9, 2026</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Float Remaining:</span>
                              <span className="font-mono font-semibold text-red-500">-2 Days (Critical Path affected)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {wf2Tab === "images" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Camera className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase">Visual Site walk Photogrammetry Compare</h4>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Side-by-side comparison of the design BIM model coordinates vs. the actual photogrammetry scan photo taken during the daily walkthrough on Level 3.
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-100 border border-slate-200 p-3 rounded-lg text-center">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase block mb-1">Design BIM Expectations</span>
                          <div className="h-28 bg-slate-850 rounded flex items-center justify-center text-slate-300 font-mono text-[9px]">
                            [ 3D HVAC sleeve model present ]
                          </div>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 p-3 rounded-lg text-center">
                          <span className="text-[10px] font-bold text-red-600 uppercase block mb-1">Reality Walkthrough Photo</span>
                          <div className="h-28 bg-slate-900 rounded flex items-center justify-center text-red-300 font-mono text-[9px] relative overflow-hidden">
                            <div className="absolute top-2 right-2 bg-red-600 text-white font-black text-[8px] px-1 py-0.2 rounded">OMISSION DETECTED</div>
                            [ Column poured solid without duct opening ]
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {wf2Tab === "progress" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <TrendingDown className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase">Physical Completion Velocity Index</h4>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Physical completion velocity of the partition wall trade in Tower B.
                      </p>
                      
                      <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold uppercase">Installation Velocity Drop</span>
                          <span className="text-lg font-black block text-rose-950">-15% physical speed</span>
                        </div>
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-1 rounded font-mono">CRITICAL DEVIATION</span>
                      </div>
                    </div>
                  )}

                  {wf2Tab === "subcontractor" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <HardHat className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase">Subcontractor Manpower & Performance metrics</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3.5 border border-slate-250 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">VoltSparks MEP (HVAC)</span>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-slate-500">Active head count:</span>
                            <span className="font-bold text-red-600">12 workers (Planned: 40)</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Open spatial issues:</span>
                            <span className="font-bold text-red-600">3 critical clashes</span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3.5 border border-slate-250 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">DryMason Partitions (Drywall)</span>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-slate-500">Active head count:</span>
                            <span className="font-bold text-slate-700">35 workers (Planned: 30)</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Open spatial issues:</span>
                            <span className="font-bold text-emerald-600">0 clashes (Blocked by HVAC)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {wf2Tab === "reports" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase">Compiled daily inspection reports</h4>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Access raw daily logs, contractor attendance sheets, and material verification manifests relating to Tower B Level 3.
                      </p>

                      <div className="space-y-2">
                        {[
                          { name: "Daily Site Log - Tower B - July 14", size: "12.4 KB", tag: "Walkthrough Signed" },
                          { name: "Material Delivery Voucher - HVAC Sleeves", size: "45.1 KB", tag: "Verified Omission" }
                        ].map((doc, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-indigo-500" />
                              <span className="font-bold text-[11px] text-slate-700">{doc.name}</span>
                            </div>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono uppercase">{doc.tag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Right Side: Visual summary checklist (4 Cols) */}
              <div className="lg:col-span-4 bg-slate-900 rounded-xl p-5 border border-slate-800 text-white flex flex-col justify-between h-[450px]">
                <div className="space-y-5">
                  <div className="border-b border-slate-800 pb-2.5">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider font-mono">Unified Executive Feed</span>
                    <h4 className="text-xs font-black uppercase mt-1">7 Integrated Sources</h4>
                  </div>

                  <div className="flex flex-col gap-3">
                    {[
                      { label: "BIM Layer Check", desc: "Found physical HVAC clash on col_c4", ok: true },
                      { label: "P6 Schedule Comparison", desc: "Detected 14-day delay on baseline activity", ok: true },
                      { label: "Reality Video Comparison", desc: "Verified un-poured sleeve visual proof", ok: true },
                      { label: "AI Reasoning Report", desc: "Gemini cross-referenced 7 databases", ok: wf2AiAnswer !== null },
                      { label: "Trade Progress Metrics", desc: "Identified Drymason drywall blockage", ok: true },
                      { label: "Subcontractor Labor Metrics", desc: "Flagged VoltSparks manpower drop", ok: true },
                      { label: "Daily Site Log Archive", desc: "Indexed previous Daily site diaries", ok: true }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-500 border border-slate-700"}`}>
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold block leading-none">{item.label}</span>
                          <span className="text-[9px] text-slate-400 leading-relaxed font-mono mt-0.5 block">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>Engine: TracProgress Core v1.4</span>
                  <span className="text-indigo-400 font-bold">100% UNIFIED</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* WORKFLOW 3 PANEL: Commercial Manager Subcontractor Invoice */}
        {/* ========================================================================= */}
        {activeWorkflow === 3 && (
          <div className="p-6 flex flex-col gap-6 animate-fade-in">
            
            {/* Split panel workspace layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Subcontractor Claim Auditor (8 Cols) */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                
                {/* Selector Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">Workflow 3: Commercial Claim & BOQ Invoice Auditor</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Audit claims visually, cross-check BIM geometry, compare with BOQ item unit rates, and recommend certified payment values.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Select Invoice:</span>
                    <select
                      value={wf3SelectedInvoice}
                      onChange={(e) => { setWf3SelectedInvoice(e.target.value); resetWf3(); }}
                      className="border border-slate-200 text-xs font-bold px-3 py-1.5 bg-slate-50 rounded-lg focus:outline-none"
                    >
                      <option value="inv-voltsparks-01">VoltSparks HVAC Claim (Tower B - L3)</option>
                      <option value="inv-flowplumb-02">FlowPlumb Piping Claim (Tower A - L2)</option>
                    </select>
                  </div>
                </div>

                {/* Subcontractor Claim Metrics Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Subcontractor</span>
                    <span className="text-xs font-extrabold text-slate-800 block truncate">{activeInv.subcontractor}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Trade Invoice Claim</span>
                    <span className="text-xs font-black text-slate-900 block text-indigo-600">{activeInv.amountClaimed} ({activeInv.progressClaimed} progress)</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">BOQ Target planned</span>
                    <span className="text-xs font-extrabold text-slate-800 block">{activeInv.plannedProgress} complete</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">BOQ Item Reference</span>
                    <span className="text-xs font-mono font-bold text-indigo-600 block bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 self-start">{activeInv.boqCode}</span>
                  </div>
                </div>

                {/* Three Core comparison audits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Audit 1: Visual Verification */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">1. Visual Proof</span>
                        <Camera className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        360° walk photogrammetry compares unplastered sector images to confirm installed linear metrics.
                      </p>
                    </div>
                    {wf3Verified ? (
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-150 text-[10px] text-slate-600 font-mono leading-relaxed">
                        {activeInv.visualProof}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold italic text-center py-2">Click Audit below to verify</span>
                    )}
                  </div>

                  {/* Audit 2: BIM Model Quantity Check */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">2. BIM Geometry Check</span>
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Spatial database counts individual segments in Revit file vs. reality point clouds.
                      </p>
                    </div>
                    {wf3Verified ? (
                      <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between text-slate-500">
                          <span>Model expects:</span>
                          <span className="font-bold text-slate-700">{activeInv.bimExpectedLength}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Reality scan:</span>
                          <span className="font-bold text-slate-700">{activeInv.realityFoundLength}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold italic text-center py-2">Click Audit below to verify</span>
                    )}
                  </div>

                  {/* Audit 3: Bill of Quantities Valuation */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">3. BOQ Valuation Check</span>
                        <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Calculates certified contract value based purely on physical model detection.
                      </p>
                    </div>
                    {wf3Verified ? (
                      <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between text-slate-500">
                          <span>Claimed progress:</span>
                          <span className="font-bold text-indigo-600">{activeInv.progressClaimed}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>AI physical:</span>
                          <span className="font-bold text-emerald-600">{activeInv.aiVerifiedProgress}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold italic text-center py-2">Click Audit below to verify</span>
                    )}
                  </div>
                </div>

                {/* Audit Trigger & Recommendations buttons */}
                <div className="flex gap-4">
                  {!wf3Verified ? (
                    <button
                      onClick={handleWf3Verify}
                      disabled={wf3Verifying}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-lg flex items-center gap-2 transition"
                    >
                      {wf3Verifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Auditing claim data...</span>
                        </>
                      ) : (
                        <>
                          <span>Audit Claim visually against BIM & BOQ</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex gap-4 w-full">
                      <button
                        onClick={handleWf3Recommend}
                        disabled={wf3Recommended}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-lg flex items-center gap-1.5 transition"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Recommend Payment ({activeInv.aiVerifiedValue})</span>
                      </button>
                      
                      {wf3CertificationUrl && (
                        <div className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg flex justify-between items-center animate-fade-in text-xs font-bold font-mono">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Payment certification PDF ready!</span>
                          </div>
                          <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            className="bg-slate-900 text-white px-3 py-1 text-[10px] rounded hover:bg-slate-800 transition"
                          >
                            Download Certificate
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Visual valuation report details (4 Cols) */}
              <div className="lg:col-span-4 bg-slate-900 rounded-xl p-5 border border-slate-800 text-white flex flex-col justify-between h-[450px]">
                
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2.5">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider font-mono">Valuation Auditor</span>
                    <h4 className="text-xs font-black uppercase mt-1">Audit Ledger</h4>
                  </div>

                  {wf3Verified ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-1 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Subcontractor Claimed Value</span>
                        <span className="text-base font-black text-slate-100">{activeInv.amountClaimed}</span>
                      </div>

                      <div className="space-y-1 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">AI Verified Value</span>
                        <span className="text-base font-black text-emerald-400">{activeInv.aiVerifiedValue}</span>
                      </div>

                      <div className="space-y-1 bg-red-950/40 p-3 rounded-lg border border-red-900/40">
                        <span className="text-[10px] text-red-400 font-bold block uppercase">Discrepancy Detected</span>
                        <span className={`text-base font-black font-mono ${activeInv.discrepancyAmount.includes("Over-claim") ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
                          {activeInv.discrepancyAmount}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
                      <FileSpreadsheet className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="font-bold text-slate-400 text-[11px]">Audit Pending</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Click "Audit Claim visually against BIM & BOQ" on the left to verify physical metrics.</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>Audit Mode: Automated BOQ Match</span>
                  <span className="text-emerald-400 font-bold">100% AUDITED</span>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
