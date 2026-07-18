import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ShieldAlert, 
  XCircle, 
  Terminal, 
  AlertTriangle, 
  Flame, 
  TrendingDown, 
  Cpu, 
  Server, 
  Database, 
  FileCode2, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Award,
  AlertCircle,
  Radio,
  BarChart3,
  Settings,
  Sliders,
  ChevronRight,
  Zap,
  Layers,
  Bot,
  Gauge,
  Play,
  RotateCcw,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Compass,
  Link,
  Shield,
  Activity,
  User,
  Check,
  MapPin,
  ClipboardCheck,
  Hammer
} from "lucide-react";

interface AuditMetric {
  title: string;
  score: number; // 0-10
  status: "critical" | "warning" | "acceptable";
  critique: string;
  impact: string;
  refactoringTarget: string;
}

interface ParityFeature {
  id: string;
  module: string;
  feature: string;
  buildotsLevel: string;
  tracProgressLevel: string;
  status: "gap" | "partial" | "aligned";
  description: string;
  actionPlan: string;
}

export default function BrutalAuditView() {
  const [auditMode, setAuditMode] = useState<"codebase" | "buildots">("buildots");
  const [expandedIssue, setExpandedIssue] = useState<string | null>("architecture");
  const [expandedFeature, setExpandedFeature] = useState<string | null>("spatial");

  // --- 1. SPATIAL PLAYGROUND STATES ---
  const [spatialTx, setSpatialTx] = useState<number>(12.5);
  const [spatialTy, setSpatialTy] = useState<number>(-8.2);
  const [spatialTz, setSpatialTz] = useState<number>(4.1);
  const [spatialYaw, setSpatialYaw] = useState<number>(15.0);
  const [isSpatialRunning, setIsSpatialRunning] = useState<boolean>(false);
  const [spatialMSE, setSpatialMSE] = useState<number>(18.4);

  // --- 2. SCHEDULING CASCADE STATES ---
  const [primaryDelay, setPrimaryDelay] = useState<number>(4);

  // --- 3. COMMERCIAL DISPUTE STATES ---
  const [disputeStep, setDisputeStep] = useState<"initial" | "examining" | "analyzing" | "resolved">("initial");
  const [verifiedPct, setVerifiedPct] = useState<number>(65);

  // --- 4. YOLO ACTIVE LEARNING STATES ---
  const [selectedYoloLabel, setSelectedYoloLabel] = useState<string>("Piping");
  const [isTrainingYolo, setIsTrainingYolo] = useState<boolean>(false);
  const [yoloProgress, setYoloProgress] = useState<number>(0);
  const [yolomAP, setYolomAP] = useState<number>(0.64);
  const [yoloConfidence, setYoloConfidence] = useState<number>(35);
  const [hasDrawnBox, setHasDrawnBox] = useState<boolean>(false);

  // --- 5. HELMET LENS CALIBRATION STATES ---
  const [radialK1, setRadialK1] = useState<number>(0.35);
  const [tangentialP1, setTangentialP1] = useState<number>(-0.18);
  const [isCalibratingHelmet, setIsCalibratingHelmet] = useState<boolean>(false);

  // --- SPATIAL ALIGNMENT CONTROLS ---
  const runICPCalibration = () => {
    if (isSpatialRunning) return;
    setIsSpatialRunning(true);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setSpatialTx(prev => {
        const next = prev - prev / 5;
        return Math.abs(next) < 0.1 ? 0 : next;
      });
      setSpatialTy(prev => {
        const next = prev - prev / 5;
        return Math.abs(next) < 0.1 ? 0 : next;
      });
      setSpatialTz(prev => {
        const next = prev - prev / 5;
        return Math.abs(next) < 0.1 ? 0 : next;
      });
      setSpatialYaw(prev => {
        const next = prev - prev / 5;
        return Math.abs(next) < 0.2 ? 0 : next;
      });
      setSpatialMSE(prev => {
        const nextVal = prev - (prev - 0.08) / 5;
        return parseFloat(nextVal.toFixed(3));
      });

      if (step >= 18) {
        clearInterval(interval);
        setSpatialTx(0);
        setSpatialTy(0);
        setSpatialTz(0);
        setSpatialYaw(0);
        setSpatialMSE(0.08);
        setIsSpatialRunning(false);
      }
    }, 100);
  };

  const resetICPCalibration = () => {
    setSpatialTx(12.5);
    setSpatialTy(-8.2);
    setSpatialTz(4.1);
    setSpatialYaw(15.0);
    setSpatialMSE(18.4);
    setIsSpatialRunning(false);
  };

  // --- AI DISPUTE ADJUDICATION CONTROLS ---
  const startDisputeResolution = () => {
    if (disputeStep !== "initial") return;
    setDisputeStep("examining");
    setTimeout(() => {
      setDisputeStep("analyzing");
      let progress = 65;
      const interval = setInterval(() => {
        progress += 3;
        if (progress >= 95) {
          clearInterval(interval);
          setVerifiedPct(95);
          setDisputeStep("resolved");
        } else {
          setVerifiedPct(progress);
        }
      }, 70);
    }, 1800);
  };

  const resetDisputeResolution = () => {
    setDisputeStep("initial");
    setVerifiedPct(65);
  };

  // --- YOLO RETRAINING CONTROLS ---
  const runYoloTraining = () => {
    if (!hasDrawnBox || isTrainingYolo) return;
    setIsTrainingYolo(true);
    setYoloProgress(0);
    const interval = setInterval(() => {
      setYoloProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTrainingYolo(false);
          setYolomAP(0.98);
          setYoloConfidence(97.8);
          return 100;
        }
        const nextVal = prev + 4;
        setYolomAP(parseFloat((0.64 + (nextVal / 100) * 0.34).toFixed(2)));
        setYoloConfidence(parseFloat((35 + (nextVal / 100) * 62.8).toFixed(1)));
        return nextVal;
      });
    }, 100);
  };

  const resetYoloTraining = () => {
    setSelectedYoloLabel("Piping");
    setIsTrainingYolo(false);
    setYoloProgress(0);
    setYolomAP(0.64);
    setYoloConfidence(35);
    setHasDrawnBox(false);
  };

  // --- HELMET LENS CALIBRATION CONTROLS ---
  const runHelmetCalibration = () => {
    if (isCalibratingHelmet) return;
    setIsCalibratingHelmet(true);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setRadialK1(prev => {
        const next = prev - prev / 6;
        return Math.abs(next) < 0.01 ? 0 : next;
      });
      setTangentialP1(prev => {
        const next = prev - prev / 6;
        return Math.abs(next) < 0.01 ? 0 : next;
      });

      if (step >= 18) {
        clearInterval(interval);
        setRadialK1(0);
        setTangentialP1(0);
        setIsCalibratingHelmet(false);
      }
    }, 100);
  };

  const resetHelmetCalibration = () => {
    setRadialK1(0.35);
    setTangentialP1(-0.18);
    setIsCalibratingHelmet(false);
  };

  const metrics: Record<string, AuditMetric> = {
    architecture: {
      title: "System Architecture",
      score: 2.0,
      status: "critical",
      critique: "A classic monolithic, simulated frontend acting as a facade for a heavy backend infrastructure. The tight coupling of data structures directly into state layers without API abstraction layers means changing a database column will instantly break the frontend view. No microservices partition, no event-driven message queuing, and absolutely no horizontal scaling readiness.",
      impact: "Zero scalability. Under real load with 10,000 active projects uploading high-throughput drone video assets, the browser memory will crash instantly, and server threads will choke due to synchronous blocking operations.",
      refactoringTarget: "Deconstruct into a decoupled Event-Driven Microservices topology. Move spatial analytics, schedule synchronization, and billing valuations into dedicated Go/NestJS microservices communicating asynchronously via Apache Kafka."
    },
    ux: {
      title: "User Experience (UX)",
      score: 3.5,
      status: "critical",
      critique: "The application overflows the browser window with an overwhelming volume of complex dashboards, settings, and tables without a clear hierarchical focus. Navigation sidebars are excessively long, confusing enterprise users who only need actionable visual reports. Core flows lack micro-animations and smooth layout transitions, leading to a rigid and heavy visual feel.",
      impact: "High user cognitive load, excessive onboarding duration, and high drop-off rates from field personnel who cannot operate complex dashboards in high-stress job sites.",
      refactoringTarget: "Implement a strict single-focus visual hierarchy. Move secondary telemetry and administration dashboards into deep, searchable, lazy-loaded workspaces."
    },
    folder: {
      title: "Folder & Code Structure",
      score: 4.0,
      status: "warning",
      critique: "The codebase is plagued by file bloating, particularly around App.tsx (approaching 1,000 lines). Sub-components and heavy data arrays are declared directly within route views. The directory structure is flat and unmodularized, mixing presentation layers, data stores, and heavy mathematical calculations without separate boundary contexts.",
      impact: "Extreme maintenance friction. High possibility of code regression. New developers face a steep learning curve to locate core functions amidst a sea of rendering files.",
      refactoringTarget: "Adopt a strict Feature-Based Monorepo layout. Separate layout components, hooks, domain types, and data mocks into explicit sub-directories (e.g., /src/features/bim/components, /src/features/analytics/hooks)."
    },
    apis: {
      title: "API Design & Payload Contract",
      score: 1.5,
      status: "critical",
      critique: "The APIs are entirely simulated client-side. The mock service layer returns inconsistent payloads and fails to leverage formal REST constraints or gRPC protocols. Error handling is non-existent, simply swallowing raw network errors within generic try/catch blocks without returning standardized RFC-7807 problem details.",
      impact: "Silent API failures in production. Complete lack of traceability. Front-end state remains stale or broken while silent backend crashes occur.",
      refactoringTarget: "Enforce strict OpenAPI specs. Generate type-safe API client SDKs using OpenAPI Generator. Standardize on unified error payloads with Sentry reporting handles."
    },
    scalability: {
      title: "Data Scalability",
      score: 2.0,
      status: "critical",
      critique: "Relational project definitions and complex CAD IFC models are processed and structured client-side inside standard browser memory pools. There is no pagination, cursor indexing, or server-side compression mechanisms. Complex spatial queries lack PostGIS geometry partitioning.",
      impact: "Browser memory leaks and immediate crashes when loading actual construction coordination models exceeding 1GB in size.",
      refactoringTarget: "Decompress and stream decimated CAD metadata in light binary formats (such as Draco-compressed glTF) chunk-by-chunk. Offload spatial analysis to PostgreSQL PostGIS databases with GIST coordinates indexing."
    },
    state: {
      title: "State Management Engine",
      score: 3.0,
      status: "warning",
      critique: "Deep nested React component state is spread across files without a robust centralized reactive engine. Local state properties are being mutated directly, violating standard immutability rules. Heavy recalculations are triggered on every minor mouse click due to missing state selector memoization.",
      impact: "Unpredictable race-conditioned data overwrites, sluggish UI response times, and highly complex debugging processes.",
      refactoringTarget: "Migrate core states to highly optimized Zustand slice stores. Use strict immutable actions and memoized selectors to restrict re-renders to target elements."
    },
    security: {
      title: "Security & IAM Guardrails",
      score: 0.5,
      status: "critical",
      critique: "Absolutely zero authentication, JWT validation, or Row-Level Security (RLS) policies implemented. Physical security and compliance data can be queried by any user simply by modifying client-side URL queries. API keys are declared directly in static text fields.",
      impact: "Catastrophic security risk. Competitor data exposure, complete violation of customer data privacy regulations (GDPR), and immediate vulnerability to white-box pen tests.",
      refactoringTarget: "Implement strict OpenID Connect (OIDC) identity providers with Keycloak or Auth0. Enforce strict database-level Row Level Security policies based on JWT tenant payloads."
    }
  };

  const parityFeatures: Record<string, ParityFeature> = {
    spatial: {
      id: "spatial",
      module: "3D Spatial Registration",
      feature: "BIM Coordinate Odometry & LiDAR Point Cloud Registration",
      buildotsLevel: "Automatic 360° visual SLAM mapping inside 3D CAD coordinate space down to millimeter precision using continuous ICP point cloud fitting.",
      tracProgressLevel: "Relying on hand-clicked spatial tags mapped to static blueprint frames with manual coordinate corrections.",
      status: "gap",
      description: "Buildots tracks a walking superintendent's path in 3D space by matching the 360° video keyframes directly to coordinates of the BIM design model.",
      actionPlan: "Integrate WebGL/ICP alignment. Expose Rust/WebAssembly points fitting pipelines to align raw point clouds with master coordination wireframes on-the-fly."
    },
    scheduling: {
      id: "scheduling",
      module: "Schedule Synchronization",
      feature: "P6/MSP Delay Cascade & Float Risk Propagation",
      buildotsLevel: "Bidirectional .XER XML synchronizer that automatically updates activity durations and computes downstream critical path floats.",
      tracProgressLevel: "Static JSON Gantt schedule with manual simulation toggles and local state updates.",
      status: "gap",
      description: "Direct integrations with Primavera P6 allow visual progress delays to propagate into subsequent task sequences, automatically recalculating project buffers.",
      actionPlan: "Build Go-based Primavera schedule parser. Connect visual completion rates to schedule predecessors, forecasting exact handover impacts live."
    },
    commercial: {
      id: "commercial",
      module: "Commercial Valuations",
      feature: "Subcontractor Smart-Dispute & Collaborative Adjudication",
      buildotsLevel: "Visual proof ledger mapped directly to subcontractor line contracts, allowing automatic progress claims release and dispute portals.",
      tracProgressLevel: "Commercial reports are tracked on visual percentages, fully decoupled from corporate contractual claims.",
      status: "gap",
      description: "A collaborative portal where subcontractors can log in, view visually disputed sectors, and upload high-resolution counter-evidence verified by secondary AI.",
      actionPlan: "Integrate with SAP Ariba and Oracle Finance. Create secure vendor-facing dashboards to negotiate and adjudicate contested quantities with digital audits."
    },
    visual_analytics: {
      id: "visual_analytics",
      module: "Vision AI & Quality Auditing",
      feature: "YOLO Active Learning & Continuous Training Feedback Loop",
      buildotsLevel: "Classifies distinct installation states (drywalls, piping, structural rebars, MEP brackets) with custom trained models.",
      tracProgressLevel: "Checks and classifies deviations using static categories, lacking manual annotation interfaces to retrain models.",
      status: "partial",
      description: "Allows field engineers to manually annotate false-positives or add new structural categories, directly retraining YOLO weights in real-time.",
      actionPlan: "Deploy active learning loops using PyTorch on AWS SageMaker. Build web-based coordinate annotators to submit custom masks."
    },
    helmet_calib: {
      id: "helmet_calib",
      module: "On-site Capture HUD",
      feature: "Wide-Angle Fish-eye Camera Lens Calibration Matrix",
      buildotsLevel: "Mobile app with custom intrinsic camera APIs that auto-correct fish-eye distortion, manage brightness, and map battery diagnostics.",
      tracProgressLevel: "Videos are processed from raw manual MP4 uploads, ignoring optical distortion matrices or focal length offsets.",
      status: "gap",
      description: "Camera calibration pipelines that dynamically calculate radial/tangential coefficients, ensuring visual matches line up flat with the BIM grid.",
      actionPlan: "Deploy OpenCV-based calibration script in-app. Map radial coefficients on hardware profiles to straighten spherical frames."
    }
  };

  const getStatusColor = (status: "critical" | "warning" | "acceptable") => {
    switch (status) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "warning": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 3) return "text-red-500";
    if (score < 7) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in text-slate-100 font-sans" id="parity-main-view">
      
      {/* 1. AUDIT PORTAL HERO */}
      <div className="bg-slate-900 border border-red-500/30 rounded-xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-400 font-mono font-bold text-xs rounded uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <Flame className="w-4 h-4" /> COMPREHENSIVE PARITY AUDIT
              </span>
              <span className="text-xs text-slate-400 font-mono">LATEST RE-EVALUATION: CURRENT CYCLE</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mt-3 text-white uppercase">
              Buildots vs TracProgress Parity Matrix
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Analyzing the absolute feature parity limits between **TracProgress** and the market pioneer **Buildots** (www.buildots.com). Find out what deep engineering capabilities are missing and play with real-time implementation sandboxes below.
            </p>
          </div>

          <div className="flex flex-col items-center bg-slate-950 border border-red-500/25 p-5 rounded-xl shrink-0 min-w-[150px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Overall Parity Gap</span>
            <span className="text-5xl font-black text-red-500 mt-1">92%</span>
            <span className="text-[10px] text-red-400 font-mono mt-1 font-bold uppercase">Closer than ever</span>
          </div>
        </div>
      </div>

      {/* VIEW SELECTOR TOGGLE (Segmented Control) */}
      <div className="flex border-b border-slate-800 pb-1">
        <button
          onClick={() => setAuditMode("buildots")}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold transition-all relative ${
            auditMode === "buildots" 
              ? "text-indigo-400 border-b-2 border-indigo-500" 
              : "text-slate-400 hover:text-white"
          }`}
          id="toggle-buildots-parity"
        >
          1. Buildots Feature Parity & Interactive Sandboxes
        </button>
        <button
          onClick={() => setAuditMode("codebase")}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold transition-all relative ${
            auditMode === "codebase" 
              ? "text-red-500 border-b-2 border-red-500" 
              : "text-slate-400 hover:text-white"
          }`}
          id="toggle-systems-audit"
        >
          2. Systems & Codebase Audit
        </button>
      </div>

      {/* MODE 1: BUILDOTS FEATURE PARITY MATRIX (with Interactive Sandboxes) */}
      {auditMode === "buildots" && (
        <div className="flex flex-col gap-8 animate-fade-in" id="buildots-mode-content">
          
          {/* FEATURE PARITY HERO SUMMARY */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="max-w-xl">
              <span className="px-2.5 py-0.5 bg-indigo-500/15 border border-indigo-500/35 text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                COMPETITIVE GAP DEFINITION
              </span>
              <h3 className="text-lg font-black text-white mt-3 uppercase tracking-tight">Interactive Gaps Resolution Studio</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Although TracProgress equals Buildots in high-level visual tracking and beats it with **Generative AI RFIs & automated punch scribe lists**, key technical layers remain. Adjust values below to calibrate SLAM odometry, propagate floats, or resolve disputes instantly!
              </p>
            </div>

            <div className="flex gap-4 shrink-0 font-mono">
              <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-lg text-center min-w-[100px]">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Primary Gaps</span>
                <span className="text-xl font-black text-red-500 mt-1 block">4</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-lg text-center min-w-[100px]">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Aligned</span>
                <span className="text-xl font-black text-emerald-500 mt-1 block">2</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-lg text-center min-w-[100px]">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">In Sandbox</span>
                <span className="text-xl font-black text-indigo-400 mt-1 block">5</span>
              </div>
            </div>
          </div>

          {/* CORE PARITY GRID */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-indigo-500" />
              Buildots Official Platform Feature Comparison
            </h3>

            <div className="flex flex-col gap-3">
              {Object.entries(parityFeatures).map(([key, item]) => {
                const isExpanded = expandedFeature === key;
                return (
                  <div
                    key={key}
                    className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                      isExpanded ? "bg-slate-900 border-indigo-500/35 shadow-lg" : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900"
                    }`}
                  >
                    {/* Header bar */}
                    <button
                      onClick={() => setExpandedFeature(isExpanded ? null : key)}
                      className="w-full px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left"
                    >
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">{item.module}</span>
                        <h4 className="font-black text-sm text-white mt-1 flex items-center gap-2">
                          <span>{item.feature}</span>
                          <span className="bg-indigo-500/10 text-indigo-400 text-[8px] px-1 py-0.2 rounded font-mono border border-indigo-500/20">SANDBOX</span>
                        </h4>
                      </div>

                      <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                          item.status === "gap" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          item.status === "partial" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        }`}>
                          {item.status === "gap" ? "MISSING FEATURE" : item.status === "partial" ? "PARTIAL ALIGNMENT" : "FULL ALIGNMENT"}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {/* Expandable Panel */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 flex flex-col gap-5 text-xs leading-relaxed text-slate-300">
                        <p className="text-slate-300 text-xs">{item.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-red-400 uppercase font-bold font-mono block">Buildots Standard (www.buildots.com)</span>
                            <p className="mt-1.5 text-slate-300">{item.buildotsLevel}</p>
                          </div>

                          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                            <span className="text-[10px] text-amber-400 uppercase font-bold font-mono block">TracProgress Current State</span>
                            <p className="mt-1.5 text-slate-400">{item.tracProgressLevel}</p>
                          </div>
                        </div>

                        {/* ========================================== */}
                        {/* THE LIVE INTERACTIVE SIMULATION PLAYGROUND */}
                        {/* ========================================== */}
                        <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl flex flex-col gap-4 mt-2">
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-200">
                                Feature Playground: Real-Time Verification Sandbox
                              </span>
                            </div>
                            <span className="text-[8px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase">
                              Active Client Model
                            </span>
                          </div>

                          {/* 1. SPATIAL ALIGNMENT SIMULATION */}
                          {item.id === "spatial" && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch" id="spatial-sandbox">
                              {/* Left Control Sliders */}
                              <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
                                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                                  Manual Drift Parameters
                                </span>
                                
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                    <span>Translation X (tx):</span>
                                    <span className="text-white font-bold">{spatialTx.toFixed(1)} cm</span>
                                  </div>
                                  <input 
                                    type="range" min="-30" max="30" step="0.5"
                                    value={spatialTx} 
                                    disabled={isSpatialRunning}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      setSpatialTx(val);
                                      setSpatialMSE(parseFloat((Math.sqrt(val*val + spatialTy*spatialTy + spatialTz*spatialTz) + 0.08).toFixed(3)));
                                    }}
                                    className="w-full accent-indigo-500 cursor-pointer"
                                  />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                    <span>Translation Y (ty):</span>
                                    <span className="text-white font-bold">{spatialTy.toFixed(1)} cm</span>
                                  </div>
                                  <input 
                                    type="range" min="-30" max="30" step="0.5"
                                    value={spatialTy} 
                                    disabled={isSpatialRunning}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      setSpatialTy(val);
                                      setSpatialMSE(parseFloat((Math.sqrt(spatialTx*spatialTx + val*val + spatialTz*spatialTz) + 0.08).toFixed(3)));
                                    }}
                                    className="w-full accent-indigo-500 cursor-pointer"
                                  />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                    <span>Translation Z (tz):</span>
                                    <span className="text-white font-bold">{spatialTz.toFixed(1)} cm</span>
                                  </div>
                                  <input 
                                    type="range" min="-15" max="15" step="0.2"
                                    value={spatialTz} 
                                    disabled={isSpatialRunning}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value);
                                      setSpatialTz(val);
                                      setSpatialMSE(parseFloat((Math.sqrt(spatialTx*spatialTx + spatialTy*spatialTy + val*val) + 0.08).toFixed(3)));
                                    }}
                                    className="w-full accent-indigo-500 cursor-pointer"
                                  />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                    <span>Rotational Yaw (R):</span>
                                    <span className="text-white font-bold">{spatialYaw.toFixed(1)}°</span>
                                  </div>
                                  <input 
                                    type="range" min="-45" max="45" step="0.5"
                                    value={spatialYaw} 
                                    disabled={isSpatialRunning}
                                    onChange={(e) => setSpatialYaw(parseFloat(e.target.value))}
                                    className="w-full accent-indigo-500 cursor-pointer"
                                  />
                                </div>
                              </div>

                              {/* Right Visualization Grid */}
                              <div className="lg:col-span-7 flex flex-col gap-3">
                                <div className="relative h-44 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                                  {/* Coordinate Grid lines */}
                                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-25" />
                                  
                                  {/* Center axis cross */}
                                  <div className="absolute w-full h-[1px] bg-slate-800" />
                                  <div className="absolute h-full w-[1px] bg-slate-800" />

                                  {/* BIM Frame Reference Box */}
                                  <div className="absolute w-28 h-16 border border-emerald-500/40 bg-emerald-500/5 flex items-center justify-center rounded-sm text-center">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[7px] font-mono text-emerald-400 font-extrabold uppercase tracking-widest leading-none">BIM IFC REF</span>
                                      <span className="text-[6px] text-emerald-400/60 font-mono mt-0.5">X: 0.0 Y: 0.0 Z: 0.0</span>
                                    </div>
                                  </div>

                                  {/* Simulated ICP Point Cloud Cluster (Warped dynamically) */}
                                  <div 
                                    className={`absolute w-28 h-16 border border-indigo-400/80 bg-indigo-500/10 flex items-center justify-center rounded-sm transition-all duration-300 ease-out`}
                                    style={{
                                      transform: `translate(${spatialTx * 2.5}px, ${spatialTy * 2.5}px) rotate(${spatialYaw}deg) scale(${1 + spatialTz * 0.015})`,
                                      opacity: 0.85
                                    }}
                                  >
                                    <span className="text-[7px] font-mono text-indigo-300 font-bold absolute bottom-1 right-1 uppercase tracking-wider">WALK CLOUD</span>
                                    <div className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                    <div className="absolute top-2 right-4 w-1 h-1 rounded-full bg-indigo-400" />
                                    <div className="absolute bottom-3 left-6 w-1 h-1 rounded-full bg-indigo-400" />
                                    <div className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    <div className="absolute top-6 left-8 w-1 h-1 rounded-full bg-cyan-300" />
                                  </div>
                                </div>

                                {/* Diagnostic Bar */}
                                <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono">
                                  <div className="flex items-center gap-1.5">
                                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-slate-400">Alignment Mean Squared Error (MSE):</span>
                                    <span className={`font-bold ${spatialMSE <= 0.1 ? "text-emerald-400 animate-pulse" : "text-red-400"}`}>
                                      {spatialMSE.toFixed(3)} m
                                    </span>
                                  </div>
                                  <span className={`font-bold uppercase px-1.5 py-0.5 rounded ${
                                    spatialMSE <= 0.1 
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                                  }`}>
                                    {spatialMSE <= 0.1 ? "● LOCKED" : "▲ DRIFTED"}
                                  </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={runICPCalibration}
                                    disabled={isSpatialRunning || spatialMSE <= 0.1}
                                    className="flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                    <span>{isSpatialRunning ? "Running ICP Fits..." : "Run Visual SLAM ICP Alignment"}</span>
                                  </button>
                                  <button
                                    onClick={resetICPCalibration}
                                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 font-bold text-xs"
                                    title="Reset coordinate offsets"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. SCHEDULING DELAY CASCADE SIMULATION */}
                          {item.id === "scheduling" && (
                            <div className="flex flex-col gap-4" id="scheduling-sandbox">
                              {/* Sliders and Overview */}
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                                <div className="flex-1 w-full">
                                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                                    <span>Primary Activity Delay: <strong>Structural Rebar Pour L3</strong></span>
                                    <span className="text-red-400 font-bold font-mono">{primaryDelay} Days Slipped</span>
                                  </div>
                                  <input 
                                    type="range" min="0" max="12" step="1"
                                    value={primaryDelay}
                                    onChange={(e) => setPrimaryDelay(parseInt(e.target.value))}
                                    className="w-full accent-indigo-500 cursor-pointer"
                                  />
                                </div>
                                <div className="bg-slate-950 px-4 py-2 rounded border border-slate-800 text-center shrink-0 min-w-[140px]">
                                  <span className="text-[8px] text-slate-500 uppercase block font-mono">Total float buffer</span>
                                  <span className={`text-sm font-black font-mono ${
                                    8 - primaryDelay < 0 ? "text-red-500" : (8 - primaryDelay <= 3 ? "text-amber-500" : "text-emerald-400")
                                  }`}>
                                    {8 - primaryDelay} Days Left
                                  </span>
                                </div>
                              </div>

                              {/* Interactive Cascade Map */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px] leading-snug">
                                {/* Node 1 */}
                                <div className="bg-slate-900/80 p-3 rounded-lg border border-red-500/25 flex flex-col justify-between">
                                  <div>
                                    <span className="text-[8px] font-mono font-bold text-red-400 block uppercase mb-1">ACT 101 (Critical Path)</span>
                                    <h4 className="font-extrabold text-white text-[11px]">Slab Rebar Pour L3</h4>
                                    <p className="text-[10px] text-slate-400 mt-1">Free Float: 0 days</p>
                                  </div>
                                  <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[10px] font-mono">
                                    <span className="text-slate-500">Delay:</span>
                                    <span className="text-red-400 font-bold">{primaryDelay}d Slipped</span>
                                  </div>
                                </div>

                                {/* Node 2 */}
                                <div className={`p-3 rounded-lg border flex flex-col justify-between transition-colors duration-250 ${
                                  primaryDelay > 3 ? "bg-red-500/5 border-red-500/25" : "bg-slate-900/80 border-slate-800"
                                }`}>
                                  <div>
                                    <span className="text-[8px] font-mono font-bold text-slate-500 block uppercase mb-1">ACT 102 (Successor)</span>
                                    <h4 className="font-extrabold text-white text-[11px]">MEP Conduit Rough-ins</h4>
                                    <p className="text-[10px] text-slate-400 mt-1">Baseline Float: 3 days</p>
                                  </div>
                                  <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[10px] font-mono">
                                    <span className="text-slate-500">New Float / Slip:</span>
                                    <span className={primaryDelay > 3 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                                      {primaryDelay > 3 ? `+ ${primaryDelay - 3}d slip` : `${3 - primaryDelay}d float`}
                                    </span>
                                  </div>
                                </div>

                                {/* Node 3 */}
                                <div className={`p-3 rounded-lg border flex flex-col justify-between transition-colors duration-250 ${
                                  primaryDelay > 5 ? "bg-red-500/5 border-red-500/25" : "bg-slate-900/80 border-slate-800"
                                }`}>
                                  <div>
                                    <span className="text-[8px] font-mono font-bold text-slate-500 block uppercase mb-1">ACT 103 (Successor)</span>
                                    <h4 className="font-extrabold text-white text-[11px]">Drywall Partitioning</h4>
                                    <p className="text-[10px] text-slate-400 mt-1">Baseline Float: 5 days</p>
                                  </div>
                                  <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[10px] font-mono">
                                    <span className="text-slate-500">New Float / Slip:</span>
                                    <span className={primaryDelay > 5 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                                      {primaryDelay > 5 ? `+ ${primaryDelay - 5}d slip` : `${5 - primaryDelay}d float`}
                                    </span>
                                  </div>
                                </div>

                                {/* Node 4 */}
                                <div className={`p-3 rounded-lg border flex flex-col justify-between transition-all duration-250 ${
                                  primaryDelay > 8 ? "bg-red-600/10 border-red-500/40 animate-pulse" : "bg-slate-900/80 border-slate-800"
                                }`}>
                                  <div>
                                    <span className="text-[8px] font-mono font-bold text-slate-500 block uppercase mb-1">HANDOVER MILESTONE</span>
                                    <h4 className="font-extrabold text-white text-[11px]">Substantial Handover L3</h4>
                                    <p className="text-[10px] text-slate-400 mt-1">Critical Buffer: 8 days</p>
                                  </div>
                                  <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[10px] font-mono">
                                    <span className="text-slate-500">Milestone Impact:</span>
                                    <span className={primaryDelay > 8 ? "text-red-400 font-black animate-pulse" : "text-emerald-400 font-bold"}>
                                      {primaryDelay > 8 ? `DELAYED BY ${primaryDelay - 8}d` : "SECURE & INTACT"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Live Risk Chart/Monte Carlo representation */}
                              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono flex flex-col md:flex-row justify-between gap-3 leading-normal">
                                <div className="flex-1">
                                  <span className="text-indigo-400 block font-bold uppercase tracking-wider mb-1 text-[8px]">
                                    AI Risk-Propagation Forecasting (Monte Carlo Output)
                                  </span>
                                  <p className="text-slate-300">
                                    P6 critical sequence calculation maps delay probability curves. Current settings yield a <strong className="text-indigo-300">{primaryDelay > 8 ? "96.4%" : (primaryDelay > 4 ? "48.2%" : "8.5%")} probability</strong> of liquidated damages claims from asset developers due to downstream subcontractor overlaps.
                                  </p>
                                </div>
                                <div className="flex items-center justify-center shrink-0">
                                  <div className="flex flex-col text-right">
                                    <span className="text-slate-500 text-[8px] uppercase font-bold">Primavera status</span>
                                    <span className={`font-bold mt-0.5 uppercase px-2 py-0.5 rounded text-[9px] border ${
                                      primaryDelay > 8 
                                        ? "bg-red-500/10 text-red-400 border-red-500/20" 
                                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    }`}>
                                      {primaryDelay > 8 ? "CRITICAL RISK OUTOFBOUNDS" : "COMPLIANT STATUS"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. SUBCONTRACTOR COLLABORATIVE DISPUTES */}
                          {item.id === "commercial" && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch" id="commercial-sandbox">
                              {/* Left Evidence Box */}
                              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                                <div>
                                  <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                                    Subcontractor Evidence Locker
                                  </span>
                                  <h4 className="font-extrabold text-white text-xs">Drywall Sheet L2-Sector B</h4>
                                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                    &quot;Our drywalls are 100% sheeted on sector B. TracProgress's automatic walking capture missed the corner behind the newly installed HVAC supply duct bulkheads which were blocking line-of-sight.&quot;
                                  </p>

                                  {/* Interactive Evidence Snapshot Box */}
                                  <div 
                                    onClick={startDisputeResolution}
                                    className={`h-24 rounded border border-dashed flex flex-col items-center justify-center text-center p-2.5 mt-3 transition cursor-pointer select-none ${
                                      disputeStep === "initial" 
                                        ? "bg-slate-950/60 border-slate-700 hover:border-indigo-500 hover:bg-slate-900" 
                                        : "bg-slate-950 border-emerald-500/20"
                                    }`}
                                  >
                                    {disputeStep === "initial" && (
                                      <>
                                        <Eye className="w-5 h-5 text-indigo-400 mb-1 animate-pulse" />
                                        <span className="text-[10px] font-bold text-indigo-300 uppercase">Load subcontractor phone upload</span>
                                        <span className="text-[8px] text-slate-500 font-mono">HVAC_void_backside.jpeg</span>
                                      </>
                                    )}

                                    {disputeStep === "examining" && (
                                      <div className="flex flex-col items-center">
                                        <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin mb-1" />
                                        <span className="text-[9px] font-mono text-slate-400 uppercase">Decompressing optical payload...</span>
                                      </div>
                                    )}

                                    {(disputeStep === "analyzing" || disputeStep === "resolved") && (
                                      <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded bg-slate-900">
                                        <span className="absolute top-1 left-1.5 text-[7px] font-mono bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded font-bold border border-emerald-500/20 uppercase">
                                          L2 Sect-B Void
                                        </span>
                                        {/* Bounding box outline */}
                                        <div className="absolute border-2 border-emerald-500 w-16 h-12 rounded animate-pulse" />
                                        <span className="text-[9px] text-emerald-400 font-bold font-mono uppercase bg-slate-950/80 px-1.5 py-0.5 rounded shadow z-10">
                                          Drywall Detected
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="text-[8px] font-mono text-slate-500 mt-2 flex justify-between">
                                  <span>UUID: d901-b841</span>
                                  <span>GPS Coordinates Verified</span>
                                </div>
                              </div>

                              {/* Right Dispute Billing Table & Solver */}
                              <div className="lg:col-span-7 flex flex-col justify-between gap-3">
                                <div className="overflow-x-auto text-[10px] font-mono leading-normal bg-slate-900 border border-slate-800 rounded-lg">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[8px] uppercase tracking-wider font-bold">
                                        <th className="px-3 py-2">Billing Domain</th>
                                        <th className="px-3 py-2">Sub Claim</th>
                                        <th className="px-3 py-2 text-right">AI Vision Audited</th>
                                        <th className="px-3 py-2 text-right">Disputed Sum</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                      <tr>
                                        <td className="px-3 py-2.5 font-bold">Drywall Sector B</td>
                                        <td className="px-3 py-2.5 text-indigo-300 font-bold">100% ($14,500)</td>
                                        <td className="px-3 py-2.5 text-right font-bold text-amber-400">
                                          {verifiedPct}% (${(14500 * (verifiedPct / 100)).toFixed(2)})
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-bold text-red-400 font-mono">
                                          -${(14500 * (1 - verifiedPct / 100)).toFixed(2)}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>

                                {/* Status Diagnostics */}
                                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-[10px] leading-relaxed font-mono flex flex-col gap-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Claims Resolution Stage:</span>
                                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] border ${
                                      disputeStep === "resolved" 
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                        : "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                                    }`}>
                                      {disputeStep === "initial" && "Claims Contested"}
                                      {disputeStep === "examining" && "Extracting Frame metadata..."}
                                      {disputeStep === "analyzing" && "Secondary AI Pixel Sweep"}
                                      {disputeStep === "resolved" && "Approved - Payout Released"}
                                    </span>
                                  </div>
                                  <p className="text-slate-400 mt-1">
                                    {disputeStep !== "resolved" 
                                      ? "Subcontractor's payment claim of $5,075 is withheld pending visual confirmation of hidden framing studs." 
                                      : "Approved drywalls behind HVAC detected successfully. verified quantities set to 95%. Ledger updated on corporate ERP ledger!"}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={startDisputeResolution}
                                    disabled={disputeStep !== "initial"}
                                    className="flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>
                                      {disputeStep === "initial" && "Run AI Secondary Cross-Verification"}
                                      {disputeStep === "examining" && "Examining Frame..."}
                                      {disputeStep === "analyzing" && `Re-processing... ${verifiedPct}%`}
                                      {disputeStep === "resolved" && "Verification Concluded"}
                                    </span>
                                  </button>
                                  <button
                                    onClick={resetDisputeResolution}
                                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 font-bold text-xs"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. YOLOv11 VISION AI RETRAINING LOOP */}
                          {item.id === "visual_analytics" && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch" id="vision-sandbox">
                              {/* Left Image annotator canvas */}
                              <div className="lg:col-span-6 flex flex-col gap-2">
                                <div className="relative h-44 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                                  {/* Simulated ceiling piping capture */}
                                  <div className="absolute inset-0 bg-slate-950 flex flex-col justify-center items-center opacity-40">
                                    <div className="w-40 h-[2px] bg-slate-700 rotate-12 mb-4" />
                                    <div className="w-40 h-[3px] bg-slate-700 rotate-12" />
                                  </div>

                                  {/* Misclassified pipe element */}
                                  <div 
                                    onClick={() => setHasDrawnBox(true)}
                                    className={`absolute w-32 h-8 border-2 border-dashed rounded transition flex items-center justify-center cursor-pointer select-none ${
                                      hasDrawnBox 
                                        ? "border-emerald-500 bg-emerald-500/10" 
                                        : "border-indigo-500/60 bg-indigo-500/5 hover:bg-indigo-500/15"
                                    }`}
                                  >
                                    {hasDrawnBox ? (
                                      <div className="flex flex-col items-center">
                                        <span className="text-[7px] font-mono text-emerald-400 uppercase font-black tracking-wider leading-none">
                                          {selectedYoloLabel} Class
                                        </span>
                                        <span className="text-[8px] text-emerald-300 font-mono mt-0.5">{yoloConfidence.toFixed(1)}% Conf.</span>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center text-center p-1">
                                        <span className="text-[8px] font-mono text-indigo-400 font-bold uppercase tracking-wider animate-pulse">
                                          [Click to Label Target Pipe]
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[9px] text-slate-500 font-mono text-center">
                                  Click on the central cylinder area to draw bounding box
                                </span>
                              </div>

                              {/* Right Pipeline Training Stats */}
                              <div className="lg:col-span-6 flex flex-col justify-between gap-3">
                                <div>
                                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Annotation Class Label Select
                                  </span>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {["Piping", "Drywall Stud", "Conduit", "Valves"].map((lbl) => (
                                      <button
                                        key={lbl}
                                        onClick={() => setSelectedYoloLabel(lbl)}
                                        disabled={!hasDrawnBox || isTrainingYolo}
                                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition ${
                                          selectedYoloLabel === lbl 
                                            ? "bg-indigo-600 text-white border-indigo-500" 
                                            : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                                        } disabled:opacity-40`}
                                      >
                                        {lbl}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Active Progress Bar */}
                                {isTrainingYolo && (
                                  <div className="flex flex-col gap-1 animate-fade-in font-mono text-[9px]">
                                    <div className="flex justify-between text-indigo-400 font-bold uppercase">
                                      <span>SGD Weight Optimization pipeline...</span>
                                      <span>{yoloProgress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                                      <div className="bg-indigo-500 h-full transition-all duration-100" style={{ width: `${yoloProgress}%` }} />
                                    </div>
                                  </div>
                                )}

                                {/* Loss / mAP Stats */}
                                <div className="grid grid-cols-2 gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[9px] font-mono leading-tight">
                                  <div>
                                    <span className="text-slate-500 block uppercase font-bold text-[8px]">Mean Avg Precision (mAP50)</span>
                                    <span className="text-white font-bold text-xs">{yolomAP.toFixed(2)}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block uppercase font-bold text-[8px]">Optimized Network Loss</span>
                                    <span className="text-white font-bold text-xs">{(1.42 * (1 - yoloProgress / 100)).toFixed(4)}</span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={runYoloTraining}
                                    disabled={!hasDrawnBox || isTrainingYolo || yolomAP > 0.9}
                                    className="flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
                                  >
                                    <Cpu className="w-3.5 h-3.5" />
                                    <span>{isTrainingYolo ? "Epoch Gradient Stepping..." : "Train Model weights (Active learning)"}</span>
                                  </button>
                                  <button
                                    onClick={resetYoloTraining}
                                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 font-bold text-xs"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 5. CAMERA GRID FISH-EYE CALIBRATION */}
                          {item.id === "helmet_calib" && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch" id="helmet-calib-sandbox">
                              {/* Left distortion sliders */}
                              <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
                                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                                  Intrinsic Distortions
                                </span>

                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                    <span>Radial Coefficient (k1):</span>
                                    <span className="text-white font-bold">{radialK1.toFixed(3)}</span>
                                  </div>
                                  <input 
                                    type="range" min="0.0" max="0.8" step="0.01"
                                    value={radialK1} 
                                    disabled={isCalibratingHelmet}
                                    onChange={(e) => setRadialK1(parseFloat(e.target.value))}
                                    className="w-full accent-indigo-500 cursor-pointer"
                                  />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                                    <span>Tangential Coefficient (p1):</span>
                                    <span className="text-white font-bold">{tangentialP1.toFixed(3)}</span>
                                  </div>
                                  <input 
                                    type="range" min="-0.4" max="0.4" step="0.01"
                                    value={tangentialP1} 
                                    disabled={isCalibratingHelmet}
                                    onChange={(e) => setTangentialP1(parseFloat(e.target.value))}
                                    className="w-full accent-indigo-500 cursor-pointer"
                                  />
                                </div>
                              </div>

                              {/* Right Grid Calibration Canvas */}
                              <div className="lg:col-span-7 flex flex-col gap-3">
                                <div className="relative h-44 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center p-3">
                                  {/* Interactive SVG distortion grid */}
                                  <svg className="w-full h-full text-indigo-500/60" viewBox="0 0 300 160">
                                    {/* Generate 5 horizontal warped paths based on radialK1 */}
                                    {[20, 50, 80, 110, 140].map((y) => {
                                      // Curve midpoints based on k1 and p1
                                      const curveY = y + radialK1 * 60 * (1.1 - Math.abs(y - 80) / 80) + tangentialP1 * 30;
                                      return (
                                        <path 
                                          key={`h-${y}`}
                                          d={`M 15,${y} Q 150,${curveY} 285,${y}`} 
                                          stroke="currentColor" 
                                          strokeWidth="1.5" 
                                          fill="none" 
                                          className="transition-all duration-350 ease-out"
                                        />
                                      );
                                    })}

                                    {/* Generate 7 vertical warped paths based on radialK1 */}
                                    {[30, 70, 110, 150, 190, 230, 270].map((x) => {
                                      const curveX = x + radialK1 * 60 * (1.1 - Math.abs(x - 150) / 150) + tangentialP1 * 30;
                                      return (
                                        <path 
                                          key={`v-${x}`}
                                          d={`M ${x},10 Q ${curveX},80 ${x},150`} 
                                          stroke="currentColor" 
                                          strokeWidth="1.5" 
                                          fill="none" 
                                          className="transition-all duration-350 ease-out"
                                        />
                                      );
                                    })}
                                  </svg>

                                  <div className="absolute top-2 right-2 bg-slate-950/80 px-2 py-0.5 border border-slate-800 text-[8px] font-mono font-bold uppercase rounded text-slate-400">
                                    {radialK1 === 0 && tangentialP1 === 0 ? "● CORRECTED FLAT" : "▲ LENS WARP ACTIVE"}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={runHelmetCalibration}
                                    disabled={isCalibratingHelmet || (radialK1 === 0 && tangentialP1 === 0)}
                                    className="flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
                                  >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    <span>{isCalibratingHelmet ? "Solving Camera Matrix..." : "Auto-Calibrate Intrinsic Lens"}</span>
                                  </button>
                                  <button
                                    onClick={resetHelmetCalibration}
                                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 font-bold text-xs"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Action Scribe */}
                        <div className="bg-indigo-500/5 p-4 rounded-lg border border-indigo-500/10 flex items-start gap-3 mt-1">
                          <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase">Engineering Path to Feature Parity</span>
                            <p className="text-slate-300 mt-1 leading-relaxed">{item.actionPlan}</p>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SPECIAL SECTION: TRACPROGRESS PROPRIETARY COMPETITIVE ADVANTAGES */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden flex flex-col gap-4">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">TracProgress Core Moats over Buildots</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Where TracProgress currently dominates the market.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-2">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="font-mono text-indigo-400 font-bold text-[10px] uppercase">Generative AI RFI & Punch Scribe</span>
                <p className="text-slate-400 leading-relaxed">
                  Buildots relies on rigid manual spreadsheets and email templates. TracProgress dynamically generates legally compliant contractor RFIs, punch-lists, and client summaries using Gemini models.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="font-mono text-indigo-400 font-bold text-[10px] uppercase">Flexible API Architecture</span>
                <p className="text-slate-400 leading-relaxed">
                  Open gRPC schema definitions allow hardware suppliers and third-party developers to easily integrate alternative captures, compared to Buildots&apos; closed and proprietary hardware ecosystem.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="font-mono text-indigo-400 font-bold text-[10px] uppercase">Fluid UX and Responsive Performance</span>
                <p className="text-slate-400 leading-relaxed">
                  A high-contrast, beautiful visual environment configured with premium micro-animations makes onboarding on-site construction superintendents fast and seamless.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODE 2: CODEBASE & SYSTEMS AUDIT */}
      {auditMode === "codebase" && (
        <div className="flex flex-col gap-8 animate-fade-in" id="codebase-mode-content">
          
          {/* SUMMARY OF REJECTED MOCKS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Mock Ingestion</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Videos do not upload or chunk process. The system uses client-side intervals with simulated scores, hiding the physical complexity of 10GB+ 4K videos.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Zero Security Controls</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Zero JWT auth, zero multi-tenancy validation, and absolute lack of row-level security. Client data is fully exposed.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Performance Bottlenecks</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Lack of state memoization and occlusion culling inside 3D models. Standard DOM items will choke browser rendering.
                </p>
              </div>
            </div>
          </div>

          {/* INDEPENDENT MODULE AUDIT GRID */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Module-by-Module Codebase Breakdown
            </h3>

            <div className="flex flex-col gap-3">
              {Object.entries(metrics).map(([key, metric]) => {
                const isExpanded = expandedIssue === key;
                return (
                  <div 
                    key={key} 
                    className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                      isExpanded ? "bg-slate-900 border-red-500/35 shadow-lg" : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-800"
                    }`}
                  >
                    {/* Header Row */}
                    <button
                      onClick={() => setExpandedIssue(isExpanded ? null : key)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="font-mono text-sm text-slate-500 font-bold">
                          {metric.score < 3 ? "FAIL" : "WARN"}
                        </span>
                        <h4 className="font-black text-sm text-white truncate">{metric.title}</h4>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getStatusColor(metric.status)}`}>
                          {metric.status}
                        </span>
                        <span className={`font-mono text-lg font-black min-w-[32px] text-right ${getScoreColor(metric.score)}`}>
                          {metric.score.toFixed(1)}/10
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {/* Expanded Content View */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 flex flex-col gap-4 text-xs leading-relaxed text-slate-300">
                        <div>
                          <span className="text-[10px] text-red-400 uppercase font-bold font-mono block">The Engineering Critique</span>
                          <p className="mt-1 text-slate-200">{metric.critique}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div className="bg-slate-950 p-4 rounded-lg border border-red-500/10">
                            <span className="text-[10px] text-red-400 uppercase font-bold font-mono block flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> High-Severity Impact
                            </span>
                            <p className="mt-1.5 text-slate-400">{metric.impact}</p>
                          </div>

                          <div className="bg-slate-950 p-4 rounded-lg border border-emerald-500/10">
                            <span className="text-[10px] text-emerald-400 uppercase font-bold font-mono block flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Google Staff Refactoring Path
                            </span>
                            <p className="mt-1.5 text-slate-400">{metric.refactoringTarget}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TECHNICAL DEBT REGISTRY */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  Technical Debt Registry
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">High-impact development bottlenecks</p>
              </div>
              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono rounded font-bold uppercase">
                6 High-Impact Items
              </span>
            </div>

            <div className="overflow-x-auto text-xs leading-relaxed">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-3.5">Debt Domain</th>
                    <th className="px-6 py-3.5">Identified Vulnerability / Code Smell</th>
                    <th className="px-6 py-3.5">Production Threat Level</th>
                    <th className="px-6 py-3.5">Architectural Remediation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">State Management</td>
                    <td className="px-6 py-4">Direct component state coupling with zero useMemo/useCallback boundaries.</td>
                    <td className="px-6 py-4"><span className="text-red-500 font-black">HIGH</span></td>
                    <td className="px-6 py-4 text-slate-400">Migrate states into centralized Zustand slice files.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">WebGL 3D Rendering</td>
                    <td className="px-6 py-4">Render mock 2D charts to simulate real millimetric 3D CAD meshes.</td>
                    <td className="px-6 py-4"><span className="text-red-500 font-black">HIGH</span></td>
                    <td className="px-6 py-4 text-slate-400 font-sans">Integrate React Three Fiber dynamically streaming Draco-compressed glTF meshes.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">Security Architecture</td>
                    <td className="px-6 py-4">Completely missing Row Level Security (RLS) policies or token authorization.</td>
                    <td className="px-6 py-4"><span className="text-red-500 font-black">CRITICAL</span></td>
                    <td className="px-6 py-4 text-slate-400">Enforce OIDC / JWT authentications and map tenant checks directly on database rows.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">API Design</td>
                    <td className="px-6 py-4">Tight coupling of endpoint calls with views, missing standardized error envelopes.</td>
                    <td className="px-6 py-4"><span className="text-amber-500 font-bold">MEDIUM</span></td>
                    <td className="px-6 py-4 text-slate-400">Generate type-safe service client SDKs utilizing OpenAPI schema contracts.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">Accessibility</td>
                    <td className="px-6 py-4">Interactive nodes lack ARIA-friendly elements or keyboard-accessible focus paths.</td>
                    <td className="px-6 py-4"><span className="text-amber-500 font-bold">MEDIUM</span></td>
                    <td className="px-6 py-4 text-slate-400">Adopt Radix UI primitives and validate visual contrast boundaries.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* THE TARGET ARCHITECTURE */}
          <div className="bg-slate-900 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden flex flex-col gap-4">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-600/10 blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">The Ideal Enterprise Target Architecture</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Standardization blueprint required to transform this prototype into a global construction intelligence giant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-2">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="font-mono text-indigo-400 font-bold text-[10px] uppercase">Kong API Gateway Layer</span>
                <p className="text-slate-400 leading-relaxed">
                  Acts as the secure entrance portal, handling OAuth validation, rate limiting, and mTLS verification before passing queries to internal resources.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="font-mono text-indigo-400 font-bold text-[10px] uppercase">Kafka Async Queue Broker</span>
                <p className="text-slate-400 leading-relaxed">
                  Decouples heavy file transfers from API threads, distributing drone video frames to isolated EKS GPU node pools automatically.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="font-mono text-indigo-400 font-bold text-[10px] uppercase">Postgres RLS Partitioning</span>
                <p className="text-slate-400 leading-relaxed">
                  Protects sensitive construction indices and telemetry logs by mapping multi-tenant query controls directly inside database tables.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
