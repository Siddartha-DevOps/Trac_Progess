import React, { useState } from "react";
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
  Gauge
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
  const [auditMode, setAuditMode] = useState<"codebase" | "buildots">("codebase");
  const [expandedIssue, setExpandedIssue] = useState<string | null>("architecture");
  const [expandedFeature, setExpandedFeature] = useState<string | null>("spatial");

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
      feature: "BIM Coordinate Odometry Alignment",
      buildotsLevel: "Automatic 360° visual SLAM mapping inside 3D CAD coordinate space down to millimeter precision.",
      tracProgressLevel: "Manually registered keyframe captures mapped to static spatial zones with manual delay tagging.",
      status: "gap",
      description: "Buildots tracks a walking superintendent's path in 3D space by matching the 360° video keyframes directly to coordinates of the BIM design model.",
      actionPlan: "Integrate PyTorch-based DSO/SLAM pipeline. Expose gRPC endpoints for frame-by-frame camera trajectory alignment with the master coordination file."
    },
    scheduling: {
      id: "scheduling",
      module: "Schedule Synchronization",
      feature: "Primavera P6 & MS Project Integration",
      buildotsLevel: "Bidirectional .XER XML synchronizer that updates schedule activities & computes downstream floats dynamically.",
      tracProgressLevel: "Static JSON-based local Gantt schedule with manual simulation toggles and client-only recalculations.",
      status: "gap",
      description: "Direct integrations with scheduling software allow progress claims to automatically consume task floats and re-forecast final completion targets.",
      actionPlan: "Build Go-based Primavera parser. Map physical installation rates directly to task sequences, rendering delay impacts live on the project Gantt."
    },
    commercial: {
      id: "commercial",
      module: "Commercial Valuations",
      feature: "Bill of Quantities (BoQ) Progress Claims",
      buildotsLevel: "Integrates visual progress verification with contract line items, releasing subcontractor payments automatically.",
      tracProgressLevel: "Progress is tracked visually on high-level percentages, decoupled from corporate ERP ledger contracts.",
      status: "gap",
      description: "Subcontractor payout sheets are verified automatically by comparing actual installation records against contract agreements.",
      actionPlan: "Integrate with SAP and Oracle Financial systems. Map completed physical quantities to contract lines and automate progressive ledger releases."
    },
    visual_analytics: {
      id: "visual_analytics",
      module: "Vision AI & Quality Auditing",
      feature: "Multi-Trade Defect Classifiers",
      buildotsLevel: "Classifies distinct installation states (drywalls, piping, structural rebars, MEP brackets) with custom trained models.",
      tracProgressLevel: "Relying on manual checklist logs and basic classification of issues with generalized status attributes.",
      status: "partial",
      description: "Buildots leverages custom-trained computer vision classifiers to detect trade-specific installation errors and safety code violations.",
      actionPlan: "Enforce custom trade segmentations using trained YOLOv11 detectors. Map detected installation failures to structural elements automatically."
    },
    helmet_calib: {
      id: "helmet_calib",
      module: "On-site Capture HUD",
      feature: "Smart Helmet Camera APIs",
      buildotsLevel: "On-site mobile application that auto-calibrates camera settings, tracks active coverage zones, and manages battery health.",
      tracProgressLevel: "Videos are uploaded manually as raw MP4/MOV files with no camera calibration API connections.",
      status: "gap",
      description: "Direct camera APIs ensure superintendents capture complete zones with optimized lighting and exposure settings.",
      actionPlan: "Build companion mobile app (React Native) with integrated Wi-Fi/Bluetooth protocols for camera settings and automated video uploads."
    },
    rag_agents: {
      id: "rag_agents",
      module: "Cognitive Intelligence",
      feature: "Generative AI RFI & Punch Scribes",
      buildotsLevel: "Basic static issue checklists. Lacks generative AI reasoning engines for automatic resolution workflows.",
      tracProgressLevel: "Generative AI pipelines that auto-draft professional RFIs, punch lists, and notifications from raw defects.",
      status: "aligned",
      description: "TracProgress holds a significant competitive advantage by using Gemini models to generate actionable resolutions directly from visual captures.",
      actionPlan: "Keep optimizing GenAI context loops by supplying high-fidelity spatial descriptions, CAD models, and contract rules."
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
    <div className="flex flex-col gap-8 animate-fade-in text-slate-100 font-sans">
      
      {/* 1. AUDIT PORTAL HERO */}
      <div className="bg-slate-900 border border-red-500/30 rounded-xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-400 font-mono font-bold text-xs rounded uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <Flame className="w-4 h-4" /> audit portal
              </span>
              <span className="text-xs text-slate-400 font-mono">LATEST RE-AUDIT: JULY 2026</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mt-3 text-white">
              The Brutal Competitive Audit
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Evaluating the TracProgress codebase and capabilities against rigorous engineering standards and the official enterprise feature set of **www.buildots.com**.
            </p>
          </div>

          <div className="flex flex-col items-center bg-slate-950 border border-red-500/25 p-5 rounded-xl shrink-0 min-w-[150px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Overall Parity Score</span>
            <span className="text-5xl font-black text-red-500 mt-1">2.4</span>
            <span className="text-[10px] text-red-400 font-mono mt-1 font-bold">SIGNIFICANT GAP</span>
          </div>
        </div>
      </div>

      {/* VIEW SELECTOR TOGGLE (Segmented Control) */}
      <div className="flex border-b border-slate-800 pb-1">
        <button
          onClick={() => setAuditMode("codebase")}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold transition-all relative ${
            auditMode === "codebase" 
              ? "text-red-500 border-b-2 border-red-500" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          1. Systems & Codebase Audit
        </button>
        <button
          onClick={() => setAuditMode("buildots")}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold transition-all relative ${
            auditMode === "buildots" 
              ? "text-red-500 border-b-2 border-red-500" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          2. Buildots Feature Parity Matrix
        </button>
      </div>

      {/* MODE 1: CODEBASE & SYSTEMS AUDIT (Original Google Staff Engineer Audit) */}
      {auditMode === "codebase" && (
        <div className="flex flex-col gap-8">
          
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
                      <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 flex flex-col gap-4 text-xs animate-fade-in leading-relaxed text-slate-300">
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
                    <td className="px-6 py-4 text-slate-400">Integrate React Three Fiber dynamically streaming Draco-compressed glTF meshes.</td>
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

      {/* MODE 2: BUILDOTS FEATURE PARITY MATRIX (www.buildots.com Gap Analysis) */}
      {auditMode === "buildots" && (
        <div className="flex flex-col gap-8 animate-fade-in">
          
          {/* FEATURE PARITY HERO SUMMARY */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="max-w-xl">
              <span className="px-2.5 py-0.5 bg-red-500/10 border border-red-500/35 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded">
                COMPETITIVE MOAT OVERVIEW
              </span>
              <h3 className="text-lg font-black text-white mt-3 uppercase tracking-tight">Feature Gap vs. Buildots Commercial Platform</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                While TracProgress's **Generative AI RFIs & punch-list automation** are superior, we lack Buildots' proprietary **3D visual SLAM alignment**, direct **Primavera XML integration**, and automated **SAP Bill of Quantities valuations**.
              </p>
            </div>

            <div className="flex gap-4 shrink-0 font-mono">
              <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-lg text-center min-w-[100px]">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Gaps Found</span>
                <span className="text-xl font-black text-red-500 mt-1 block">4</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-lg text-center min-w-[100px]">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Aligned</span>
                <span className="text-xl font-black text-emerald-500 mt-1 block">1</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-lg text-center min-w-[100px]">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Partial</span>
                <span className="text-xl font-black text-amber-500 mt-1 block">1</span>
              </div>
            </div>
          </div>

          {/* CORE PARITY GRID */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-red-500" />
              Buildots Official Platform Feature Comparison
            </h3>

            <div className="flex flex-col gap-3">
              {Object.entries(parityFeatures).map(([key, item]) => {
                const isExpanded = expandedFeature === key;
                return (
                  <div
                    key={key}
                    className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                      isExpanded ? "bg-slate-900 border-red-500/35 shadow-lg" : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900"
                    }`}
                  >
                    {/* Header bar */}
                    <button
                      onClick={() => setExpandedFeature(isExpanded ? null : key)}
                      className="w-full px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left"
                    >
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">{item.module}</span>
                        <h4 className="font-black text-sm text-white mt-1">{item.feature}</h4>
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
                      <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 flex flex-col gap-4 text-xs animate-fade-in leading-relaxed text-slate-300">
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

                        {/* Action Scribe */}
                        <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/10 flex items-start gap-3 mt-1">
                          <Zap className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-red-400 font-mono font-bold uppercase">Engineering Path to Feature Parity</span>
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
                <span className="font-mono text-indigo-400 font-bold text-[10px] uppercase">Generative AI Scribe</span>
                <p className="text-slate-400 leading-relaxed">
                  Buildots relies on rigid schedules and manual spreadsheets. TracProgress dynamically generates RFIs, action summaries, and notifications automatically.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="font-mono text-indigo-400 font-bold text-[10px] uppercase">Flexible Schema Architecture</span>
                <p className="text-slate-400 leading-relaxed">
                  Open REST/gRPC API structures allowing third-party developers to integrate custom sensors with ease, compared to closed commercial portals.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-2">
                <span className="font-mono text-indigo-400 font-bold text-[10px] uppercase">Minimal Cognitive Load</span>
                <p className="text-slate-400 leading-relaxed">
                  Modern, fluid dashboards styled with micro-animations make the app highly intuitive and rapid to adopt for on-site crew members.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
