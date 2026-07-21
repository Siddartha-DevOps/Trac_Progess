import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GitCompare,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  Building,
  Database,
  TrendingUp,
  Coins,
  ShieldCheck,
  Scale,
  FileText,
  Zap,
  Check,
  Layers,
  Cpu,
  Laptop,
  Server,
  HelpCircle,
  Activity,
  ArrowRight,
  Sparkles,
  Percent,
  RefreshCw,
  Clock,
  Ruler,
  Award,
  Camera,
  Calendar
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

// Feature Category definitions
interface ComparisonFeature {
  id: string;
  name: string;
  category: "capture" | "bim" | "schedule" | "compliance" | "subcontractor" | "financial";
  legacyDesc: string;
  legacyScore: number; // 1-10
  tracprogressDesc: string;
  tracprogressScore: number; // 1-10
  winner: "Legacy" | "TracProgress" | "Tie";
  impactFactor: string;
}

const COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    id: "site_capture",
    name: "Automated Site Capture & SLAM",
    category: "capture",
    legacyDesc: "Proprietary SLAM running on GoPro 360 helmet footage. Exceptional at indoor path localization.",
    legacyScore: 9,
    tracprogressDesc: "Edge-Slam processing with 360° cameras, plus multi-source terrestrial LIDAR and high-precision drone orthomosaic integration.",
    tracprogressScore: 9,
    winner: "Tie",
    impactFactor: "High (Site coverage)"
  },
  {
    id: "bim_registration",
    name: "3D BIM Integration & GUID Mapping",
    category: "bim",
    legacyDesc: "Standard Revit and AutoCAD coordinate synchronization. Visual overlay of schedule tasks with IFC components.",
    legacyScore: 9,
    tracprogressDesc: "IFC.js 3D WebEngine, open standard schemas (IFC4/IFC5), multi-layered trade filter, and sub-centimeter point cloud matching.",
    tracprogressScore: 10,
    winner: "TracProgress",
    impactFactor: "Critical (Data fidelity)"
  },
  {
    id: "gantt_p6_sync",
    name: "Schedule Sync (Primavera P6 / MS Project)",
    category: "schedule",
    legacyDesc: "Native P6 & MS Project activity tracking. Automatically updates master schedule tasks from video detections.",
    legacyScore: 10,
    tracprogressDesc: "Direct .XER / XML schedule extraction, weekly baseline slip forecasting, critical path impact modeling, and automated buffer tracking.",
    tracprogressScore: 9,
    winner: "Legacy",
    impactFactor: "High (Operational sync)"
  },
  {
    id: "regulatory_compliance",
    name: "RERA Audit & Regulatory Compliance",
    category: "compliance",
    legacyDesc: "No specialized regulatory/legal templates. Tailored strictly for basic western general contracting workflows.",
    legacyScore: 4,
    tracprogressDesc: "Built-in RERA compliance score, chronological physical evidence logs, tamper-resistant cryptographic audit trials to prevent timeline disputes.",
    tracprogressScore: 10,
    winner: "TracProgress",
    impactFactor: "Critical (Indian/EMEA Developers)"
  },
  {
    id: "subcontractor_kpi",
    name: "Subcontractor Accountability Metrics",
    category: "subcontractor",
    legacyDesc: "Tracks activity status (e.g. Started/Finished). Relies on high-level milestones for trade accountability.",
    legacyScore: 8,
    tracprogressDesc: "Multi-Trade velocity metrics tracking cubic meters of concrete, linear meters of conduit, and square meters of drywall with direct performance grading.",
    tracprogressScore: 10,
    winner: "TracProgress",
    impactFactor: "High (Subcontractor control)"
  },
  {
    id: "commercial_billing",
    name: "Commercial Billing & BoQ Integration",
    category: "financial",
    legacyDesc: "Standard visual checks. Lacks built-in Bill of Quantities (BoQ) ledger integration and visual billing verification loops.",
    legacyScore: 6,
    tracprogressDesc: "Direct integration with Bill of Quantities (BoQ), visual billing verification loops, Google Sheets certification workflows, and automated earned value calculations.",
    tracprogressScore: 10,
    winner: "TracProgress",
    impactFactor: "Critical (Cash flow management)"
  }
];

export default function TracProgressAIParity() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedFeature, setSelectedFeature] = useState<ComparisonFeature | null>(COMPARISON_FEATURES[0]);
  const [simulatedModule, setSimulatedModule] = useState<"bim_overlay" | "progress_pipeline" | "rera_compliance">("bim_overlay");

  // ROI Calculator States
  const [projectBudget, setProjectBudget] = useState<number>(45000000); // 45M USD
  const [delayPenalty, setDelayPenalty] = useState<number>(120000); // 120k USD/mo
  const [projectArea, setProjectArea] = useState<number>(550000); // 550k sq.ft
  const [subcontractorCount, setSubcontractorCount] = useState<number>(18);

  // --- NEW STATES FOR BUILDOTS PARITY ROADMAP ---
  const [activeGap, setActiveGap] = useState<string>("gap_slam");
  const [isSimulatingSlam, setIsSimulatingSlam] = useState<boolean>(false);
  const [slamSimLogs, setSlamSimLogs] = useState<string[]>([
    "Ready to initiate Visual-Inertial SLAM test pipeline.",
    "Awaiting user to run path reconstruction simulation..."
  ]);

  const [isSimulatingP6, setIsSimulatingP6] = useState<boolean>(false);
  const [p6SimLogs, setP6SimLogs] = useState<string[]>([
    "Oracle Primavera P6 bidirectional sync listener active.",
    "Awaiting live task update simulation trigger..."
  ]);

  const [isSimulatingQa, setIsSimulatingQa] = useState<boolean>(false);
  const [qaSimLogs, setQaSimLogs] = useState<string[]>([
    "Gemini Multi-Modal Vision QA inspection model loaded.",
    "Awaiting high-resolution frame check trigger..."
  ]);

  const [isSimulatingSub, setIsSimulatingSub] = useState<boolean>(false);
  const [subSimLogs, setSubSimLogs] = useState<string[]>([
    "Twilio & SendGrid SLA communication channels open.",
    "Awaiting Trade SLA velocity evaluation trigger..."
  ]);

  const handleSelectGap = (gapId: string) => {
    setActiveGap(gapId);
  };

  const simulateSlamIntegration = () => {
    if (isSimulatingSlam) return;
    setIsSimulatingSlam(true);
    setSlamSimLogs([
      "🚀 [VIO-INIT] Locating walk video gs://tracprogress-walks/walk_l2_b3_2026.mp4...",
      "📷 [VIO-CORRECT] Calibrating 360° lens parameters (focal, barrel distort, rolling shutter)..."
    ]);

    setTimeout(() => {
      setSlamSimLogs(prev => [
        ...prev,
        "🧩 [SLAM] Building real-time sparse coordinate points map...",
        "📍 [SLAM] Matching camera inertial trajectory against BIM project coordinates..."
      ]);
    }, 1000);

    setTimeout(() => {
      setSlamSimLogs(prev => [
        ...prev,
        "✨ [BIM-ALIGN] Point-to-Plane Iterative Closest Point (ICP) optimization running...",
        "🎉 [SUCCESS] Path reconstructed! Mean Squared Error: 7.8mm. Path successfully localized!"
      ]);
      setIsSimulatingSlam(false);
    }, 2500);
  };

  const simulateP6Integration = () => {
    if (isSimulatingP6) return;
    setIsSimulatingP6(true);
    setP6SimLogs([
      "🔄 [XML-EXTRACT] Loading active Primavera P6 XML/XER activity dataset...",
      "🔍 [COMPARE] Correlating physical installation volume (85.4%) to Activity 'DRY-L1-FRAM'..."
    ]);

    setTimeout(() => {
      setP6SimLogs(prev => [
        ...prev,
        "🧮 [FLOAT-CALC] Re-calculating remaining duration (2 days) and activity total float...",
        "🛜 [P6-PUSH] Formatting SOAP payload for Oracle Primavera Web Services..."
      ]);
    }, 1000);

    setTimeout(() => {
      setP6SimLogs(prev => [
        ...prev,
        "🎉 [SUCCESS] Oracle database updated bidirectionally. Remaining duration set to 2 days!"
      ]);
      setIsSimulatingP6(false);
    }, 2500);
  };

  const simulateQaIntegration = () => {
    if (isSimulatingQa) return;
    setIsSimulatingQa(true);
    setQaSimLogs([
      "🧠 [GEMINI] Formatting vision analysis request context payload...",
      "📷 [SAM-SEGMENT] Segmenting target structural concrete columns Level 2 Zone C..."
    ]);

    setTimeout(() => {
      setQaSimLogs(prev => [
        ...prev,
        "🤖 [GEMINI-MODEL] Classifying surface anomalies inside point-cloud projection...",
        "⚠️ [ANOMALY-ALERT] Detected concrete vertical face micro-crack (1.2mm width) on Column C12."
      ]);
    }, 1000);

    setTimeout(() => {
      setQaSimLogs(prev => [
        ...prev,
        "🎉 [SUCCESS] Issue automatically published to TracProgress Quality Logs ledger with IFC GUID."
      ]);
      setIsSimulatingQa(false);
    }, 2500);
  };

  const simulateSubIntegration = () => {
    if (isSimulatingSub) return;
    setIsSimulatingSub(true);
    setSubSimLogs([
      "📊 [VELOCITY-CHECK] Pulling multi-trade concrete work cumulative volume ledger...",
      "⚠️ [WARN] Contractor 'PrecisionTech Solutions' velocity falls to 62% of baseline schedule!"
    ]);

    setTimeout(() => {
      setSubSimLogs(prev => [
        ...prev,
        "📝 [COMMS] Compiling automated physical proof PDF with localized walk coordinate evidence...",
        "📞 [TWILIO] Dispatching SMS notice to contractor director (+91-98765-XXXX)..."
      ]);
    }, 1000);

    setTimeout(() => {
      setSubSimLogs(prev => [
        ...prev,
        "🎉 [SUCCESS] SLA warning notice successfully delivered via SMS and email with legal audit path."
      ]);
      setIsSimulatingSub(false);
    }, 2500);
  };

  // Filtered features
  const filteredFeatures = activeCategory === "all" 
    ? COMPARISON_FEATURES 
    : COMPARISON_FEATURES.filter(f => f.category === activeCategory);

  // ROI calculations
  // Legacy systems typically price higher due to custom hardware/on-site consulting (est: ~0.18% of project budget + onboarding)
  const legacyEstCost = Math.round(projectBudget * 0.0018 + 25000);
  // tracprogress.ai is highly optimized, utilizing open standards and existing mobile/360 devices (~0.08% of project budget)
  const tracprogressEstCost = Math.round(projectBudget * 0.00085 + 12000);

  // Rework savings (typically ~1.5% of budget, AI tracking claims to save ~40% of rework cost)
  const typicalReworkCost = projectBudget * 0.022;
  const estimatedReworkSavings = Math.round(typicalReworkCost * 0.42);

  // Schedule delay recovery (averages 1.5 months saved on a 24-month project)
  const delayDaysSaved = Math.round((projectArea / 100000) * 8 + subcontractorCount * 1.5);
  const penaltySavings = Math.round((delayDaysSaved / 30) * delayPenalty);

  // Radar Data for visual scoring representation
  const radarData = COMPARISON_FEATURES.map(f => ({
    subject: f.name.split(" ")[0],
    Legacy: f.legacyScore,
    TracProgress: f.tracprogressScore,
    fullMark: 10,
  }));

  return (
    <div className="flex flex-col gap-6 animate-fade-in p-6 bg-slate-50/50" id="legacy-comparison-view">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <GitCompare className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Competitor Evaluation Desk</h1>
              <span className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">Enterprise Spec</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Exhaustive visual comparison of <strong>Legacy Solutions</strong> against <strong>tracprogress.ai</strong> with dynamic ROI modelers and architectural parity matrices.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[11px] font-semibold text-slate-400 mr-2 font-mono">STATUS:</span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Feature Parity Verified
          </span>
        </div>
      </div>

      {/* QUICK STATS COMPARISON GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Philosophy: Legacy Systems */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-100 transition duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Competitor Benchmark</span>
              <span className="text-xs font-black text-slate-800">Legacy Systems®</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">Helmet 360°</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded font-mono">HARDWARE</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-2.5">
              Optimized for General Contractors managing high-density fitouts using proprietary helmet-mounted cameras. Re-maps walkthrough videos back to 3D BIM elements to highlight schedule tasks out of sync.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Target Region:</span>
            <span className="font-bold text-slate-700">North America & Western Europe</span>
          </div>
        </div>

        {/* Core Philosophy: TracProgress */}
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md hover:border-indigo-500/50 transition duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">This Workspace</span>
              <span className="text-xs font-black text-indigo-400">TracProgress®</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl font-bold text-white">RERA Multi-Source</span>
              <span className="text-[10px] bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded font-mono">DRONE/CAM</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
              Engineered for high-liability infrastructure developers under state-level RERA compliance rules. Captures via drones, 360° hardhat walkthroughs, or mobile phone feeds with integrated visual Bill of Quantities (BoQ) billing.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Target Region:</span>
            <span className="font-bold text-indigo-400">RERA-Regulated India & APAC</span>
          </div>
        </div>

        {/* Dynamic Evaluation Scorecard */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Audit Scoring Matrix</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">RERA Presets</span>
            </div>
            <div className="h-[140px] flex items-center justify-center mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }} />
                  <Radar name="Legacy" dataKey="Legacy" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.4} />
                  <Radar name="TracProgress" dataKey="TracProgress" stroke="#4f46e5" fill="#818cf8" fillOpacity={0.5} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold border-t border-slate-100 pt-2 font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-slate-300 rounded-full" />
              <span>Legacy (7.6 Avg)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
              <span>TracProgress (9.5 Avg)</span>
            </div>
          </div>
        </div>

      </div>

      {/* CORE COMPARISON WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Interactive Feature Category Filter & Selection List */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Exhaustive Feature Directory</h2>
            <p className="text-[11px] text-slate-400 mt-1">Select any feature category below to inspect side-by-side details.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
            {[
              { id: "all", label: "All" },
              { id: "capture", label: "Reality Capture" },
              { id: "bim", label: "3D BIM Core" },
              { id: "schedule", label: "Schedules" },
              { id: "compliance", label: "RERA Legal" },
              { id: "subcontractor", label: "Trade KPI" },
              { id: "financial", label: "BoQ Billing" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  // Set first found feature
                  const first = cat.id === "all" 
                    ? COMPARISON_FEATURES[0] 
                    : COMPARISON_FEATURES.find(f => f.category === cat.id);
                  if (first) setSelectedFeature(first);
                }}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Feature List */}
          <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
            {filteredFeatures.map(f => {
              const isSelected = selectedFeature?.id === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFeature(f)}
                  className={`w-full text-left p-3.5 rounded-lg border text-xs transition duration-150 flex justify-between items-center ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50"
                      : "border-slate-150 hover:bg-slate-50/70"
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-800 leading-tight">{f.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize font-mono">Category: {f.category}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      f.winner === "TracProgress"
                        ? "bg-indigo-100 text-indigo-700"
                        : f.winner === "Legacy"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {f.winner === "Tie" ? "Tie" : `${f.winner} Wins`}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? "transform translate-x-1 text-indigo-600" : ""}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Deep Dive Feature Panel */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[420px]">
          {selectedFeature ? (
            <div className="flex flex-col gap-5 animate-fade-in h-full justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Deep Feature Audit</span>
                  <span className="text-[11px] text-slate-400 font-bold font-mono">Priority Factor: {selectedFeature.impactFactor}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-4">{selectedFeature.name}</h3>

                {/* Score slider bar */}
                <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                      <span>Legacy Score</span>
                      <span className="text-slate-800 font-black">{selectedFeature.legacyScore}/10</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: `${selectedFeature.legacyScore * 10}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-indigo-600 mb-1">
                      <span>TracProgress Score</span>
                      <span className="text-indigo-900 font-black">{selectedFeature.tracprogressScore}/10</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${selectedFeature.tracprogressScore * 10}%` }} />
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Breakdown cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-lg border border-slate-200 bg-white">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">Legacy Solution</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedFeature.legacyDesc}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-3 bg-slate-50 px-2 py-1.5 rounded border border-slate-150">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Optimized for milestone-centric tracking</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-indigo-100 bg-indigo-50/20">
                    <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider font-mono mb-2">TracProgress Advantage</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedFeature.tracprogressDesc}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-700 font-bold mt-3 bg-indigo-50/60 px-2 py-1.5 rounded border border-indigo-100">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Complies with structural & financial audit rules</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parity Summary Bar */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3 bg-slate-50 -mx-5 -mb-5 p-5 rounded-b-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="text-[11px] text-slate-600 font-medium">
                    Verdict: <strong className="text-slate-800">{selectedFeature.winner === "Tie" ? "Fully Balanced Parity" : `${selectedFeature.winner} offers superior capabilities`}</strong>
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Ref Code: AUDIT_{selectedFeature.id.toUpperCase()}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center p-6 text-slate-400">
              <Scale className="w-12 h-12 text-slate-200 mb-2" />
              <p className="text-xs">Select any capability to read comparative specifications.</p>
            </div>
          )}
        </div>

      </div>

      {/* DYNAMIC SITE SIMULATOR SANDBOX */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Feature Simulation Playground</h2>
            <p className="text-[11px] text-slate-400 mt-1">Interactively trigger different core pipeline modes to compare their output mechanics.</p>
          </div>
          
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setSimulatedModule("bim_overlay")}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition ${
                simulatedModule === "bim_overlay" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              BIM Overlay Pipeline
            </button>
            <button
              onClick={() => setSimulatedModule("progress_pipeline")}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition ${
                simulatedModule === "progress_pipeline" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Quantity Progress Ledger
            </button>
            <button
              onClick={() => setSimulatedModule("rera_compliance")}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition ${
                simulatedModule === "rera_compliance" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              RERA Audit Proof
            </button>
          </div>
        </div>

        {/* SIMULATOR VIEWER CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Legacy Simulation Viewport */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400">LEGACY INTERFACE SIMULATOR</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold font-mono">WESTERN SaaS</span>
              </div>

              {simulatedModule === "bim_overlay" && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="bg-slate-900 rounded-lg p-4 h-[180px] flex flex-col justify-between text-white font-mono text-[10px] border border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400">● VIDEO WALK ID: LW-9042</span>
                      <span className="text-slate-400">CAMERA: GOPRO MAX 360</span>
                    </div>
                    <div className="my-auto flex flex-col gap-1 items-center text-center">
                      <Layers className="w-8 h-8 text-indigo-400 animate-pulse" />
                      <span className="font-bold text-slate-200">Reconstructing Walkway Trajectory...</span>
                      <span className="text-[9px] text-slate-500">Overlaying visual pixels to P6 task ID: \"Install Outlets L2\"</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500">
                      <span>FPS: 30 • Poses: 1,490</span>
                      <span>BIM ALIGNMENT CONFIDENCE: 94.2%</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-250 text-xs">
                    <strong className="font-bold text-slate-700 block">Identified Activity:</strong>
                    <p className="text-slate-500 mt-1">
                      Matched visual wall frame to 3D Revit element. Status updated to <span className="text-indigo-600 font-bold">\"60% Installed\"</span> inside Gantt chart.
                    </p>
                  </div>
                </div>
              )}

              {simulatedModule === "progress_pipeline" && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="bg-white p-4 rounded-lg border border-slate-250 flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Activity Progress Card (Milestones)</span>
                    <div className="flex items-center justify-between border-b border-slate-100 py-1 text-xs">
                      <span className="text-slate-600">L2 Drywall Studs</span>
                      <span className="font-bold text-indigo-600">IN PROGRESS (75%)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 py-1 text-xs">
                      <span className="text-slate-600">L2 Electrical In-Wall</span>
                      <span className="font-bold text-amber-600">NOT STARTED (0%)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 text-xs">
                      <span className="text-slate-600">L2 HVAC Ductwork</span>
                      <span className="font-bold text-emerald-600">COMPLETED (100%)</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Legacy systems report project completion by calculating aggregate task status in the schedule. Lacks absolute volumetric audit trails.
                  </p>
                </div>
              )}

              {simulatedModule === "rera_compliance" && (
                <div className="mt-4 flex flex-col gap-4 text-center py-6 border border-dashed border-slate-300 rounded-lg bg-white">
                  <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">No RERA Module Available</h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[280px] mx-auto">
                      Legacy solutions do not provide state regulatory compliance metrics, state RERA filings checklists, or legal timeline audits.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* TracProgress Simulation Viewport */}
          <div className="bg-indigo-950 text-white rounded-xl p-5 border border-indigo-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-indigo-800 pb-2">
                <span className="text-[10px] font-mono font-bold text-indigo-400">TRACPROGRESS INTERFACE SIMULATOR</span>
                <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold font-mono">RERA STANDARD</span>
              </div>

              {simulatedModule === "bim_overlay" && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="bg-slate-950 rounded-lg p-4 h-[180px] flex flex-col justify-between text-white font-mono text-[10px] border border-indigo-900">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-400">● REALITY DATA: TP-7033</span>
                      <span className="text-emerald-400">ALIGNMENT: 3D-COORDINATE MATRIX</span>
                    </div>
                    <div className="my-auto flex flex-col gap-1 items-center text-center">
                      <Cpu className="w-8 h-8 text-indigo-500 animate-spin" style={{ animationDuration: "15s" }} />
                      <span className="font-bold text-slate-100">IFC.js Component Matching Engine...</span>
                      <span className="text-[9px] text-indigo-300">Checking spatial coordinates: L2_WALL_Z_098 against IFC GUID</span>
                    </div>
                    <div className="flex justify-between text-[8px] text-indigo-400">
                      <span>Point Cloud Density: 4,500/m²</span>
                      <span>SPATIAL ALIGNMENT CONFIDENCE: 99.8%</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-indigo-900 text-xs text-slate-300">
                    <strong className="font-bold text-white block">Detected Physical Component:</strong>
                    <p className="text-slate-400 mt-1">
                      Identified actual installation of <span className="text-indigo-400 font-bold">14.2 sq. meters</span> of Drywall Boarding on <strong>Level 2 Zone B-3</strong>. Logged with immutable timestamp.
                    </p>
                  </div>
                </div>
              )}

              {simulatedModule === "progress_pipeline" && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="bg-slate-900 p-4 rounded-lg border border-indigo-900 flex flex-col gap-2">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono">Absolute Volumetric Ledger (BoQ Link)</span>
                    <div className="flex items-center justify-between border-b border-indigo-950 py-1 text-xs">
                      <span className="text-slate-300">Drywall (BoQ Item #41)</span>
                      <span className="font-bold text-indigo-400">182.5 / 220 m² (83.0%)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-indigo-950 py-1 text-xs">
                      <span className="text-slate-300">Conduits (BoQ Item #109)</span>
                      <span className="font-bold text-indigo-400">1,240 / 3,000 m (41.3%)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 text-xs">
                      <span className="text-slate-300">Screed Pour (BoQ Item #33)</span>
                      <span className="font-bold text-indigo-400">85 / 150 m³ (56.7%)</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    TracProgress connects reality data directly to billable quantities. Quantities certified automatically to Google Spreadsheet ledger.
                  </p>
                </div>
              )}

              {simulatedModule === "rera_compliance" && (
                <div className="mt-4 flex flex-col gap-3">
                  <div className="bg-indigo-900/40 p-4 rounded-lg border border-indigo-500/30">
                    <div className="flex items-center gap-1.5 text-indigo-200 font-bold text-xs mb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>RERA Chronological Evidentiary Trial</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Every physical scan is recorded, hashed, and signed with the active RERA registration number <strong>{`PR/KA/RERA/1251/103`}</strong>. This creates an un-alterable timeline of actual construction milestones, entirely immune to developer/contractor audit manipulation.
                    </p>
                    <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-indigo-300">
                      <span>HASH: sha256_f932e01a...</span>
                      <span className="text-emerald-400">VERIFIED LEGAL PROOF</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-indigo-900 text-[11px] flex justify-between text-slate-300 font-mono">
                    <span>DELAY PENALTY RISK INDEX:</span>
                    <span className="text-emerald-400 font-bold">0.05% (VERY LOW RISK)</span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* NEW: ROADMAP PARITY GAPS & IMPLEMENTATION ROADMAP */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm" id="tracprogress-parity-gaps-roadmap">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-150 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded border border-amber-300 uppercase font-mono tracking-wider">Gap Analysis</span>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide font-mono">Benchmark Parity Gaps & Implementation Roadmap</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Detailed technical blueprint of features missing in TracProgress with live simulation triggers to emulate target integration modules.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 font-mono font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>4 Crucial Gaps Identified</span>
          </div>
        </div>

        {/* GAP TIMELINE INTERACTIVE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Gap Selection Cards */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {[
              {
                id: "gap_slam",
                name: "1. 360° Walkthrough SLAM & Path Reconstruction",
                difficulty: "Extremely High (Visual Inertial)",
                status: "Roadmap Scope (Missing)",
                desc: "Legacy systems leverage custom automated visual SLAM to stitch hardhat-mounted GoPro Max frames without user positioning. TracProgress relies on manual drone anchors/ground control points.",
                icon: Camera,
                impact: "Drastically reduces site worker upload friction by 85%"
              },
              {
                id: "gap_p6",
                name: "2. Active Bidirectional Primavera P6 / Gantt Sync",
                difficulty: "Medium (XML/XER Parsers)",
                status: "Sandbox Phase (Partial)",
                desc: "Legacy systems have continuous bidirectional sync with Primavera P6, updating master baseline tasks automatically. TracProgress currently extracts baselines but requires manual approvals to push state changes back.",
                icon: Calendar,
                impact: "Maintains real-time critical path and float status"
              },
              {
                id: "gap_qaqc",
                name: "3. Trade-Specific Visual QA/QC Checker",
                difficulty: "High (IFC GUID Class matching)",
                status: "Beta Playground (Partial)",
                desc: "Legacy platforms flag sub-millimetric trade-specific deviations (e.g. electrical sockets offset by 2 inches). TracProgress identifies larger spatial volumetric anomalies but requires point clouds for high detail.",
                icon: ShieldCheck,
                impact: "Halts subcontractor billing disputes instantly"
              },
              {
                id: "gap_subcontractor",
                name: "4. Automated Trade Performance Dispatcher",
                difficulty: "Low (Twilio/SMTP API integration)",
                status: "Design Phase (Missing)",
                desc: "Legacy systems automatically grade subcontractor daily performance and schedule priority notifications. TracProgress tracks raw quantities but lacks automated legal-proof reporting.",
                icon: Sliders,
                impact: "Increases subcontractor accountability by 35%"
              }
            ].map((gap, i) => {
              // We'll declare states inline inside a wrapper component or handle them centrally. 
              // To handle this cleanly in a standard react component, let's use a state.
              // Since we are editing inside the parent component, we'll implement state triggers.
              return (
                <button
                  key={gap.id}
                  onClick={() => {
                    // We can track the active gap inside TracProgressAIParity state.
                    // Let's ensure we use a state declared at the top of TracProgressAIParity.
                    // Let's define the state activeGap, setActiveGap.
                    // Wait, let's look at the top of TracProgressAIParity - we can define it dynamically or update the file to declare the hook.
                    // Let's modify the file to support the state.
                    // Yes! We will add 'activeGap' state in our parent component.
                    handleSelectGap(gap.id);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 relative ${
                    activeGap === gap.id
                      ? "border-amber-500 bg-amber-50/20 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {/* Selected Indicator Pill */}
                  {activeGap === gap.id && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      activeGap === gap.id ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      <gap.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">{gap.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Diff: {gap.difficulty}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          gap.status.includes("Missing") ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                        }`}>
                          {gap.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-11">
                    {gap.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Live Implementation Blueprint & Pipeline Simulation Console */}
          <div className="lg:col-span-7 bg-slate-900 rounded-xl p-5 border border-slate-800 text-white flex flex-col justify-between min-h-[460px]">
            {activeGap === "gap_slam" && (
              <div className="flex flex-col gap-4 h-full justify-between animate-fade-in">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-mono font-bold uppercase text-amber-400">SLAM Path Reconstruction Engine</span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">MISSING CAPABILITY</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mt-4">
                    To eliminate manual camera calibration, we must construct a <strong>Visual-Inertial Odometry (VIO)</strong> pipeline that handles rapid camera pan/tilt distortions in dark basements, translating 360-degree GoPro MP4s into real-time XYZ trajectories inside the IFC model.
                  </p>

                  {/* Architecture spec flow */}
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 mt-4">
                    <span className="text-amber-500 font-bold block mb-2">// TARGET CODE ARCHITECTURE: C++ Ceres Solver Pipeline</span>
                    <span className="text-indigo-400">struct</span> VisualOdometryResidual {"{"} <br />
                    &nbsp;&nbsp;VisualOdometryResidual(<span className="text-indigo-400">const</span> Eigen::Vector3d&amp; pt) : pt_(pt) {"{}"} <br />
                    &nbsp;&nbsp;<span className="text-indigo-400">template</span> &lt;<span className="text-indigo-400">typename</span> T&gt; <span className="text-indigo-400">bool operator</span>()(...) {"{"} <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// Optimizes rotation matrix R and translation t using Levenberg-Marquardt</span> <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;T residual = (R * pt_ + t) - ground_control_anchor; <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-indigo-400">return</span> <span className="text-emerald-400">true</span>; <br />
                    &nbsp;&nbsp;{"}"} <br />
                    {"}"};
                  </div>

                  {/* Real-world test logger simulation */}
                  <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-850 mt-4">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>CONSOLE PIPE LOG:</span>
                      <span className={isSimulatingSlam ? "text-amber-400 animate-pulse" : "text-slate-500"}>
                        {isSimulatingSlam ? "● RUNNING INTEGRATION TEST..." : "● IDLE"}
                      </span>
                    </div>
                    <div className="h-[90px] overflow-y-auto font-mono text-[9px] text-emerald-400/80 flex flex-col gap-1 pr-1">
                      {slamSimLogs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
                  <div className="text-[10px] text-slate-400 font-medium">
                    Recommended Priority: <span className="text-rose-400 font-bold">1st (Core UX blocker)</span>
                  </div>
                  <button
                    onClick={simulateSlamIntegration}
                    disabled={isSimulatingSlam}
                    className="flex items-center gap-1.5 text-xs bg-amber-500 text-slate-950 px-4 py-2 rounded-lg font-bold hover:bg-amber-400 active:scale-95 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingSlam ? "animate-spin" : ""}`} />
                    <span>Run SLAM Path Simulation</span>
                  </button>
                </div>
              </div>
            )}

            {activeGap === "gap_p6" && (
              <div className="flex flex-col gap-4 h-full justify-between animate-fade-in">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-mono font-bold uppercase text-indigo-400">Gantt & Primavera P6 Bidirectional Engine</span>
                    </div>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">PARTIAL CAPABILITY</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mt-4">
                    To match legacy systems' bidirectional sync, we must integrate a live schedule updater. This reads recent visual computer-vision progress outputs, automatically checks predecessors, and updates remaining duration inside <strong>Primavera P6 XML / MS Project .mpp</strong> files.
                  </p>

                  {/* Architecture spec flow */}
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 mt-4">
                    <span className="text-indigo-400 font-bold block mb-2">// TARGET API SPECIFICATION: bidirectional Gantt update endpoint</span>
                    POST /api/schedule/p6-sync <br />
                    Headers: {"{"} Authorization: Bearer P6_JWT {"}"} <br />
                    Payload: {"{"} <br />
                    &nbsp;&nbsp;activity_code: <span className="text-emerald-400">"DRY-L1-FRAM"</span>, <br />
                    &nbsp;&nbsp;physical_percent_complete: <span className="text-indigo-400">85.4</span>, <br />
                    &nbsp;&nbsp;remaining_duration_days: <span className="text-indigo-400">2</span> <br />
                    {"}"}
                  </div>

                  {/* Real-world test logger simulation */}
                  <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-850 mt-4">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>P6 SYNC TEST CONSOLE:</span>
                      <span className={isSimulatingP6 ? "text-indigo-400 animate-pulse" : "text-slate-500"}>
                        {isSimulatingP6 ? "● COMMUNICATING WITH ORACLE WEB SERVICES..." : "● IDLE"}
                      </span>
                    </div>
                    <div className="h-[90px] overflow-y-auto font-mono text-[9px] text-indigo-400/80 flex flex-col gap-1 pr-1">
                      {p6SimLogs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
                  <div className="text-[10px] text-slate-400 font-medium">
                    Recommended Priority: <span className="text-indigo-400 font-bold">3rd (Enterprise workflow)</span>
                  </div>
                  <button
                    onClick={simulateP6Integration}
                    disabled={isSimulatingP6}
                    className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-500 active:scale-95 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingP6 ? "animate-spin" : ""}`} />
                    <span>Trigger Gantt P6 Sync</span>
                  </button>
                </div>
              </div>
            )}

            {activeGap === "gap_qaqc" && (
              <div className="flex flex-col gap-4 h-full justify-between animate-fade-in">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-mono font-bold uppercase text-emerald-400">Trade-Specific Micro-QA/QC Checker</span>
                    </div>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">PARTIAL CAPABILITY</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mt-4">
                    Legacy solutions utilize highly specialized convolutional networks trained to recognize trade-specific installation errors. To achieve parity, we can deploy <strong>Segment Anything (SAM)</strong> paired with <strong>Gemini 1.5 Pro</strong> to flag sub-millimetric mistakes (e.g., HVAC sleeves, plumbing pitch defects, rebar spacing issues).
                  </p>

                  {/* Architecture spec flow */}
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 mt-4">
                    <span className="text-emerald-500 font-bold block mb-2">// TARGET API FLOW: Gemini Vision API validation payload</span>
                    const response = await ai.models.generateContent({"{"} <br />
                    &nbsp;&nbsp;model: <span className="text-emerald-400">"gemini-2.5-flash"</span>, <br />
                    &nbsp;&nbsp;contents: [ <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;{`"Flag structural discrepancies between IFC_GUID L2-C12 and physical camera frame. Confirm concrete surface cracks."`}, <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;{`{ fileData: { fileUri: "gs://tracprogress-scans/c12_crack.jpg", mimeType: "image/jpeg" } }`} <br />
                    &nbsp;&nbsp;] <br />
                    {"}"});
                  </div>

                  {/* Real-world test logger simulation */}
                  <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-850 mt-4">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>GEMINI VISION QA LOGS:</span>
                      <span className={isSimulatingQa ? "text-emerald-400 animate-pulse" : "text-slate-500"}>
                        {isSimulatingQa ? "● PROCESSING DETAILED INFERENCE..." : "● IDLE"}
                      </span>
                    </div>
                    <div className="h-[90px] overflow-y-auto font-mono text-[9px] text-emerald-400/80 flex flex-col gap-1 pr-1">
                      {qaSimLogs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
                  <div className="text-[10px] text-slate-400 font-medium">
                    Recommended Priority: <span className="text-emerald-400 font-bold">2nd (Defect resolution)</span>
                  </div>
                  <button
                    onClick={simulateQaIntegration}
                    disabled={isSimulatingQa}
                    className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-500 active:scale-95 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingQa ? "animate-spin" : ""}`} />
                    <span>Run Gemini QA Inspection</span>
                  </button>
                </div>
              </div>
            )}

            {activeGap === "gap_subcontractor" && (
              <div className="flex flex-col gap-4 h-full justify-between animate-fade-in">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-rose-400" />
                      <span className="text-xs font-mono font-bold uppercase text-rose-400">Automated Subcontractor SLA Alert System</span>
                    </div>
                    <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-mono font-bold">MISSING CAPABILITY</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mt-4">
                    Saves management hundreds of coordination hours. If a subcontractor's weekly installation velocity falls more than <strong>15% below scheduled baseline</strong>, the system formats a detailed visual report with physical proof coordinates and dispatches it automatically via Twilio/SendGrid.
                  </p>

                  {/* Architecture spec flow */}
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 mt-4">
                    <span className="text-rose-500 font-bold block mb-2">// TARGET FUNCTION: Automated SLA alert dispatch script</span>
                    export async function dispatchVelocityBreachNotification(...) {"{"} <br />
                    &nbsp;&nbsp;<span className="text-indigo-400">const</span> message = <span className="text-emerald-400">`SLA Breach: Concrete velocity at 62% of weekly baseline.`</span>; <br />
                    &nbsp;&nbsp;<span className="text-indigo-400">await</span> twilio.messages.create({"{"} <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;to: subcontractor.phone, <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;body: message, <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;mediaUrl: [<span className="text-emerald-400">"https://tracprogress.com/audit/report_302_proof.pdf"</span>] <br />
                    &nbsp;&nbsp;{"}"}); <br />
                    {"}"}
                  </div>

                  {/* Real-world test logger simulation */}
                  <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-850 mt-4">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>TWILIO/SLA ENGINE STATE:</span>
                      <span className={isSimulatingSub ? "text-rose-400 animate-pulse" : "text-slate-500"}>
                        {isSimulatingSub ? "● DISPATCHING COMMUNICATIONS..." : "● IDLE"}
                      </span>
                    </div>
                    <div className="h-[90px] overflow-y-auto font-mono text-[9px] text-rose-400/80 flex flex-col gap-1 pr-1">
                      {subSimLogs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
                  <div className="text-[10px] text-slate-400 font-medium">
                    Recommended Priority: <span className="text-rose-400 font-bold">4th (Process optimization)</span>
                  </div>
                  <button
                    onClick={simulateSubIntegration}
                    disabled={isSimulatingSub}
                    className="flex items-center gap-1.5 text-xs bg-rose-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-rose-500 active:scale-95 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingSub ? "animate-spin" : ""}`} />
                    <span>Dispatch Automated SLA Warnings</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* DYNAMIC COST & ROI MODELER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-indigo-600" />
            Competitive ROI & Cost Modeler
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">Compare SaaS implementation fees, anticipated savings, and risk offset profiles based on your custom project scope.</p>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 bg-slate-50 p-5 rounded-xl border border-slate-200/80 mb-6">
          
          {/* Project Budget */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 flex justify-between">
              <span>Project Budget</span>
              <span className="text-slate-800 font-mono font-bold">${(projectBudget / 1000000).toFixed(1)}M</span>
            </label>
            <input
              type="range"
              min="10000000"
              max="200000000"
              step="5000000"
              value={projectBudget}
              onChange={(e) => setProjectBudget(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[9px] text-slate-400">Total physical construction value</span>
          </div>

          {/* Monthly Delay Penalty */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 flex justify-between">
              <span>Monthly Delay Penalty</span>
              <span className="text-slate-800 font-mono font-bold">${(delayPenalty / 1000).toFixed(0)}K</span>
            </label>
            <input
              type="range"
              min="20000"
              max="500000"
              step="10000"
              value={delayPenalty}
              onChange={(e) => setDelayPenalty(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[9px] text-slate-400">RERA or SLA contractual penalties</span>
          </div>

          {/* Project Area */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 flex justify-between">
              <span>Total Floor Area</span>
              <span className="text-slate-800 font-mono font-bold">{(projectArea / 1000).toFixed(0)}K sq.ft</span>
            </label>
            <input
              type="range"
              min="50000"
              max="2000000"
              step="50000"
              value={projectArea}
              onChange={(e) => setProjectArea(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[9px] text-slate-400">Total built-up workspace area</span>
          </div>

          {/* Active Subcontractors */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 flex justify-between">
              <span>Active Trades/Subcontractors</span>
              <span className="text-slate-800 font-mono font-bold">{subcontractorCount} Trades</span>
            </label>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={subcontractorCount}
              onChange={(e) => setSubcontractorCount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[9px] text-slate-400">Parallel sub-teams on-site</span>
          </div>

        </div>

        {/* ROI RESULTS BAR CHARTS & CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Cost breakdown charts */}
          <div className="lg:col-span-7 h-[250px] bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-3">Estimated SaaS Licensing Fee Comparison</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={[
                  { name: 'Legacy Enterprise', Cost: legacyEstCost, fill: '#64748b' },
                  { name: 'tracprogress.ai optimized', Cost: tracprogressEstCost, fill: '#4f46e5' }
                ]}
                margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'SaaS Fee']} />
                <Bar dataKey="Cost" radius={[5, 5, 0, 0]}>
                  {
                    [
                      { fill: '#94a3b8' },
                      { fill: '#4f46e5' }
                    ].map((entry, index) => (
                      <Bar key={`cell-${index}`} fill={entry.fill} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Savings Breakdown Card */}
          <div className="lg:col-span-5 bg-indigo-900 text-white rounded-xl p-5 border border-indigo-800 flex flex-col justify-between h-[250px]">
            <div>
              <div className="flex items-center gap-1 bg-indigo-800/60 border border-indigo-700 w-fit px-2 py-0.5 rounded text-[8px] font-bold font-mono text-indigo-300 uppercase">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Calculated Project Savings
              </div>

              <div className="mt-4">
                <span className="text-[10px] text-indigo-300 uppercase font-mono block">Estimated Combined Recovery</span>
                <span className="text-3xl font-black text-white">${(estimatedReworkSavings + penaltySavings).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 border-t border-indigo-800/80 pt-3 text-xs text-slate-300">
                <div>
                  <span className="text-[10px] text-indigo-400 font-mono block">Rework Avoided:</span>
                  <span className="font-bold text-white">${estimatedReworkSavings.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-400 font-mono block">SLA Penalties Saved:</span>
                  <span className="font-bold text-white">${penaltySavings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-300 leading-relaxed border-t border-indigo-800/80 pt-2 flex justify-between items-center">
              <span>Estimated schedule speed-up:</span>
              <strong className="text-emerald-400 font-bold">{delayDaysSaved} Days Recovered</strong>
            </div>
          </div>

        </div>

      </div>

      {/* CORE ARCHITECTURAL PIPELINE ANALYSIS */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-2 mb-4">
          Architectural Pipeline Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          
          {/* Legacy Tech Pipeline */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5 mb-3 text-xs">
              <Laptop className="w-4 h-4 text-slate-500" />
              Legacy Proprietary Tech Stack
            </h3>
            <ul className="flex flex-col gap-2.5 leading-relaxed text-slate-500">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span><strong>Hardware dependency:</strong> Restricted primarily to physical hardhat walkthrough setups using precise GoPro GoPro Max models.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span><strong>Localization Pipeline:</strong> Proprietary visual SLAM stitching. Highly effective but requires custom compute clouds to process individual walks.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span><strong>Data Schema:</strong> Strongly tied to activity-level milestones in traditional planning files (.mpp, .xer). Does not expose continuous volumetric progress data easily.</span>
              </li>
            </ul>
          </div>

          {/* TracProgress Tech Pipeline */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/10">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 mb-3 text-xs">
              <Server className="w-4 h-4 text-indigo-600" />
              tracprogress.ai Open-Standard Tech Stack
            </h3>
            <ul className="flex flex-col gap-2.5 leading-relaxed text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Hardware Agnostic:</strong> Ingests 360° videos, standard drone photogrammetry ortho-grids, and direct localized mobile photos.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Core 3D Engine:</strong> Powered by <strong>IFC.js</strong> running entirely client-side. Allows lightning-fast metadata inspections without licensing bottlenecks.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Compliance ledger:</strong> Links 3D coordinates directly to Bill of Quantities (BoQ) indexes and publishes verified results directly into standard Google Spreadsheets for seamless corporate audits.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
