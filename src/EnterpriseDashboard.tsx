import React, { useState, useEffect } from "react";
import {
  // Navigation Icons
  LayoutDashboard,
  HeartPulse,
  TrendingUp,
  AlertOctagon,
  Users2,
  Box,
  FileBarChart,
  LineChart,
  Cpu,
  Bell,
  Settings,
  // Interaction Icons
  Info,
  Calendar,
  Clock,
  Download,
  Mail,
  Send,
  Plus,
  Trash2,
  Play,
  RotateCw,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  FileSpreadsheet,
  Printer,
  X,
  Sliders,
  ChevronRight,
  UserCheck,
  Zap,
  MapPin,
  FlameKindling,
  Sparkles,
  CloudLightning,
  RefreshCw,
  Workflow
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from "recharts";

// TypeScript typings for interactive settings and schedule logs
interface DistributionSchedule {
  id: string;
  reportType: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  recipient: string;
  format: "PDF" | "Excel" | "Both";
  timeOfDay: string;
  active: boolean;
}

interface CustomTriggerRule {
  id: string;
  metric: string;
  operator: "Less Than" | "Greater Than";
  value: number;
  channel: "Email" | "SMS" | "Both";
  recipient: string;
}

export default function EnterpriseDashboard() {
  // 11 Core Navigation Modules State
  const [activeModule, setActiveModule] = useState<
    "overview" | "health" | "progress" | "delay" | "trades" | "bim" | "reports" | "analytics" | "insights" | "notifications" | "settings"
  >("overview");

  // Interactive local states
  const [currentBimFilter, setCurrentBimFilter] = useState<"All" | "Structure" | "MEP" | "Arch">("All");
  const [selectedBimElement, setSelectedBimElement] = useState<string | null>("col_c4");
  const [is3DRotating, setIs3DRotating] = useState(false);
  const [modelPitch, setModelPitch] = useState(15);
  const [modelYaw, setModelYaw] = useState(45);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1000);
  const [remediationStep, setRemediationStep] = useState(0);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);

  // Export states
  const [exportType, setExportType] = useState<"PDF" | "Excel" | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState("");
  const [emailSenderInput, setEmailSenderInput] = useState("sidduchitiki@gmail.com");
  const [emailProgress, setEmailProgress] = useState(false);
  const [emailSuccessToast, setEmailSuccessToast] = useState(false);

  // Settings form states
  const [reraIdSetting, setReraIdSetting] = useState("KA-RERA-2026-0389");
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [autoEmailAlerts, setAutoEmailAlerts] = useState(true);
  const [fastApiHost, setFastApiHost] = useState("https://fastapi.buildtrace.in/v1");

  // Interactive Schedules database state
  const [schedules, setSchedules] = useState<DistributionSchedule[]>([
    { id: "sch-1", reportType: "Executive Program Dashboard", frequency: "Weekly", recipient: "sidduchitiki@gmail.com", format: "PDF", timeOfDay: "08:00 AM", active: true },
    { id: "sch-2", reportType: "Daily Progress Log", frequency: "Daily", recipient: "site-leads@buildtrace.in", format: "Both", timeOfDay: "06:30 PM", active: true },
    { id: "sch-3", reportType: "Trade Productivity Matrix", frequency: "Monthly", recipient: "directors@buildtrace.in", format: "Excel", timeOfDay: "09:00 AM", active: false }
  ]);
  const [newSchType, setNewSchType] = useState("Daily Progress Log");
  const [newSchFreq, setNewSchFreq] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [newSchRecipient, setNewSchRecipient] = useState("");
  const [newSchFormat, setNewSchFormat] = useState<"PDF" | "Excel" | "Both">("PDF");
  const [newSchTime, setNewSchTime] = useState("08:00 AM");

  // Custom trigger rules database
  const [triggerRules, setTriggerRules] = useState<CustomTriggerRule[]>([
    { id: "rule-1", metric: "Schedule Index (SPI)", operator: "Less Than", value: 0.95, channel: "Both", recipient: "sidduchitiki@gmail.com" },
    { id: "rule-2", metric: "Cost Index (CPI)", operator: "Less Than", value: 0.98, channel: "Email", recipient: "finance-alert@buildtrace.in" }
  ]);
  const [newRuleMetric, setNewRuleMetric] = useState("Schedule Index (SPI)");
  const [newRuleOperator, setNewRuleOperator] = useState<"Less Than" | "Greater Than">("Less Than");
  const [newRuleVal, setNewRuleVal] = useState(0.95);
  const [newRuleChan, setNewRuleChan] = useState<"Email" | "SMS" | "Both">("Both");
  const [newRuleRec, setNewRuleRec] = useState("");

  // Static constant project telemetry
  const projectStats = {
    name: "Bangalore Tech Park - Block B",
    location: "Whitefield, Bengaluru, Karnataka, India",
    totalBudget: "₹18.5 Crores",
    elapsedWeeks: 12,
    overallProgress: 72.4,
    safetyDays: 245,
    criticalDelay: "3 days",
    registeredRera: "KA-RERA-2026-0389"
  };

  // Recharts Real Datasets (conforming to Project Health & Progress parameters)
  const healthEvmData = [
    { week: "Wk 1", PV: 1.2, EV: 1.2, AC: 1.1 },
    { week: "Wk 2", PV: 2.5, EV: 2.4, AC: 2.3 },
    { week: "Wk 3", PV: 4.1, EV: 3.9, AC: 3.8 },
    { week: "Wk 4", PV: 5.8, EV: 5.6, AC: 5.5 },
    { week: "Wk 5", PV: 7.4, EV: 7.2, AC: 7.1 },
    { week: "Wk 6", PV: 9.0, EV: 8.8, AC: 8.5 },
    { week: "Wk 7", PV: 10.6, EV: 10.3, AC: 10.1 },
    { week: "Wk 8", PV: 12.2, EV: 11.9, AC: 11.6 },
    { week: "Wk 9", PV: 13.8, EV: 13.4, AC: 13.1 },
    { week: "Wk 10", PV: 15.4, EV: 14.9, AC: 14.6 },
    { week: "Wk 11", PV: 17.0, EV: 16.4, AC: 16.2 },
    { week: "Wk 12", PV: 18.5, EV: 17.9, AC: 17.6 }
  ];

  const sCurveProgressData = [
    { week: "Wk 1", Baseline: 10, Actual: 10, Forecast: 10 },
    { week: "Wk 2", Baseline: 20, Actual: 19, Forecast: 19 },
    { week: "Wk 3", Baseline: 30, Actual: 28, Forecast: 28 },
    { week: "Wk 4", Baseline: 38, Actual: 35, Forecast: 35 },
    { week: "Wk 5", Baseline: 45, Actual: 43, Forecast: 43 },
    { week: "Wk 6", Baseline: 52, Actual: 50, Forecast: 50 },
    { week: "Wk 7", Baseline: 58, Actual: 56, Forecast: 56 },
    { week: "Wk 8", Baseline: 63, Actual: 61, Forecast: 61 },
    { week: "Wk 9", Baseline: 68, Actual: 66, Forecast: 66 },
    { week: "Wk 10", Baseline: 73, Actual: 70, Forecast: 70 },
    { week: "Wk 11", Baseline: 77, Actual: 72, Forecast: 73 },
    { week: "Wk 12", Baseline: 81, Actual: 76, Forecast: 77 },
    { week: "Wk 13", Baseline: 85, Actual: null, Forecast: 81 },
    { week: "Wk 14", Baseline: 89, Actual: null, Forecast: 85 },
    { week: "Wk 15", Baseline: 94, Actual: null, Forecast: 90 },
    { week: "Wk 16", Baseline: 100, Actual: null, Forecast: 96 }
  ];

  const delayMonteCarloDistribution = [
    { delayDays: -5, probability: 1.2 },
    { delayDays: -3, probability: 3.5 },
    { delayDays: -1, probability: 8.4 },
    { delayDays: 1, probability: 15.6 },
    { delayDays: 3, probability: 28.4 }, // Critical Peak
    { delayDays: 5, probability: 22.1 },
    { delayDays: 7, probability: 12.8 },
    { delayDays: 10, probability: 5.6 },
    { delayDays: 13, probability: 2.1 },
    { delayDays: 16, probability: 0.3 }
  ];

  const tradePerformers = [
    { name: "Sree Civil Infra", efficiency: 94, headcount: 22, required: 20, rating: 4.8 },
    { name: "Nutech MEP Eng", efficiency: 86, headcount: 14, required: 16, rating: 4.2 },
    { name: "Kalyani Glass", efficiency: 72, headcount: 8, required: 14, rating: 3.5 }
  ];

  const weatherCorrelationData = [
    { rainfall: 0, speed: 45, size: 50 },
    { rainfall: 5, speed: 42, size: 45 },
    { rainfall: 12, speed: 38, size: 40 },
    { rainfall: 18, speed: 30, size: 35 },
    { rainfall: 25, speed: 20, size: 30 },
    { rainfall: 35, speed: 8, size: 25 },
    { rainfall: 42, speed: 2, size: 10 }
  ];

  const notificationAlerts = [
    { id: "not-1", date: "2026-07-09 06:45 AM", type: "Safety", title: "Drone Perimeter Enclosure Check Passed", body: "L1 safety mesh has been verified along column axis C1 to C8 with 100% compliance.", read: true, priority: "low" },
    { id: "not-2", date: "2026-07-09 08:30 AM", type: "Deviation", title: "Column C4 Stirrups Spacing Warning", body: "Rebar stirrups are detected at 285mm intervals vs specified 200mm standard. Initiating RERA mitigation step.", read: false, priority: "critical" },
    { id: "not-3", date: "2026-07-09 10:15 AM", type: "Coordination", title: "HVAC to Sprinkler spatial clash resolved in BIM", body: "Architectural drawings updated. Sprinkler coordinate offset has been shifted 18.5cm left.", read: false, priority: "high" }
  ];

  // BIM element catalog
  const bimElements = [
    { id: "col_c4", name: "Column C4 (Concrete)", category: "Structure", type: "Column", progress: 85, status: "delayed", material: "M35 Rein. Concrete", volume: "4.2 m³", path: "Foundation > L1 Columns" },
    { id: "slab_l1", name: "Floor Slab Level 1", category: "Structure", type: "Slab", progress: 100, status: "completed", material: "M30 Tension Concrete", volume: "124.0 m³", path: "Foundation > Ground Slab" },
    { id: "mep_duct_branch", name: "Branch HVAC Duct B2", category: "MEP", type: "Duct", progress: 75, status: "in_progress", material: "Galvanized Steel Plate", volume: "48.0 running meters", path: "MEP Conduits > HVAC" },
    { id: "fire_sprinkler", name: "Sprinkler Pipe Main", category: "MEP", type: "Pipe", progress: 95, status: "in_progress", material: "CPVC Pipe", volume: "18.5 m", path: "MEP Conduits > Firefighting" }
  ];

  // Active notifications count
  const unreadNotificationsCount = notificationAlerts.filter(n => !n.read).length;

  // Simulate Rotator for 3D model
  useEffect(() => {
    let timer: any;
    if (is3DRotating) {
      timer = setInterval(() => {
        setModelYaw(prev => (prev + 3) % 360);
      }, 50);
    }
    return () => clearInterval(timer);
  }, [is3DRotating]);

  // Export Progress Simulator
  const triggerExportSimulation = (type: "PDF" | "Excel") => {
    setExportType(type);
    setExportProgress(0);
    setExportStatusText("Initializing data export compiler...");
    
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setExportType(null);
            setExportStatusText("");
            alert(`Report downloaded successfully: BTP_BlockB_${activeModule}_Report.${type.toLowerCase() === 'pdf' ? 'pdf' : 'xlsx'}`);
          }, 600);
          return 100;
        }
        
        // Progress text updates
        if (prev === 20) setExportStatusText("Compiling RERA historical timelines...");
        if (prev === 50) setExportStatusText("Syncing high-res YOLO drone segmentation frames...");
        if (prev === 85) setExportStatusText("Constructing spreadsheet schemas...");
        
        return prev + 10;
      });
    }, 150);
  };

  // Email transmission simulator
  const sendEmailSimulator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSenderInput) return;
    setEmailProgress(true);

    setTimeout(() => {
      setEmailProgress(false);
      setEmailSuccessToast(true);
      setTimeout(() => setEmailSuccessToast(false), 4000);
    }, 1500);
  };

  // Add Schedule Handler
  const addScheduleHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchRecipient) return;
    const item: DistributionSchedule = {
      id: `sch-${Date.now()}`,
      reportType: newSchType,
      frequency: newSchFreq,
      recipient: newSchRecipient,
      format: newSchFormat,
      timeOfDay: newSchTime,
      active: true
    };
    setSchedules([...schedules, item]);
    setNewSchRecipient("");
  };

  // Delete Schedule
  const deleteScheduleHandler = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  // Add Rule Handler
  const addRuleHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleRec) return;
    const rule: CustomTriggerRule = {
      id: `rule-${Date.now()}`,
      metric: newRuleMetric,
      operator: newRuleOperator,
      value: newRuleVal,
      channel: newRuleChan,
      recipient: newRuleRec
    };
    setTriggerRules([...triggerRules, rule]);
    setNewRuleRec("");
  };

  // Delete Rule
  const deleteRuleHandler = (id: string) => {
    setTriggerRules(triggerRules.filter(r => r.id !== id));
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-lg flex flex-col w-full min-h-[850px] overflow-hidden text-slate-800 font-sans">
      
      {/* 1. TOP ENTERPRISE SUITE BANNER */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-400">
            <LayoutDashboard className="w-6 h-6 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight">BUILDTRACE Enterprise Dashboard</h1>
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[9px] font-bold rounded uppercase tracking-wider font-mono">
                RERA-INTEGRATED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live photogrammetry audit and deep sequence delay predictors for <strong className="text-slate-200">Bangalore Tech Park - Block B</strong>
            </p>
          </div>
        </div>

        {/* Global Stats HUD */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Safe Workdays</span>
            <span className="font-bold text-emerald-400">245 Days</span>
          </div>
          <div className="bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 text-right relative">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Unresolved Risks</span>
            <span className="font-bold text-rose-400 flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              2 Critical
            </span>
          </div>
          <button
            onClick={() => setActiveModule("notifications")}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 relative transition"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-[9px] font-bold text-white flex items-center justify-center rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. SUB-BAR WITH METADATA INFORMATION & NAVIGATION PATH */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Workspace Context:</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-500" />
            Whitefield, Bengaluru
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-600">{reraIdSetting}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono">
            <strong>Active Operator:</strong> sidduchitiki@gmail.com
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono">
            <strong>System Time:</strong> 2026-07-09 14:59:53 UTC
          </span>
        </div>
      </div>

      {/* 3. CORE WORKSPACE LAYOUT (11-Item Sidebar + Screen Stage) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        
        {/* LEFT COMPACT SIDEBAR (2.5 Columns) */}
        <div className="lg:col-span-3 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-5 justify-between">
          
          {/* Module group list */}
          <div className="flex flex-col gap-4">
            
            {/* Nav Group 1: General HUD */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block px-2 mb-1.5">
                Program HUD
              </span>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveModule("overview")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition ${
                    activeModule === "overview"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:bg-slate-850 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Overview Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveModule("health")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition ${
                    activeModule === "health"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:bg-slate-850 hover:text-white"
                  }`}
                >
                  <HeartPulse className="w-4 h-4 shrink-0" />
                  <div className="flex-1 flex justify-between items-center">
                    <span>Project Health</span>
                    <span className="text-[9px] px-1.5 bg-emerald-500/10 text-emerald-400 rounded font-mono font-bold">
                      SPI:0.96
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Nav Group 2: Core Engineering & BIM */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block px-2 mb-1.5">
                Spatial & Volumetric Progress
              </span>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveModule("progress")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition ${
                    activeModule === "progress"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:bg-slate-850 hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>Physical S-Curve</span>
                </button>

                <button
                  onClick={() => setActiveModule("delay")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition ${
                    activeModule === "delay"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:bg-slate-850 hover:text-white"
                  }`}
                >
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  <div className="flex-1 flex justify-between items-center">
                    <span>Delay & Predictors</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                </button>

                <button
                  onClick={() => setActiveModule("trades")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition ${
                    activeModule === "trades"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:bg-slate-850 hover:text-white"
                  }`}
                >
                  <Users2 className="w-4 h-4 shrink-0" />
                  <span>Trades & Labor HUD</span>
                </button>

                <button
                  onClick={() => setActiveModule("bim")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition ${
                    activeModule === "bim"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:bg-slate-850 hover:text-white"
                  }`}
                >
                  <Box className="w-4 h-4 shrink-0" />
                  <span>3D BIM Model Viewer</span>
                </button>
              </div>
            </div>

            {/* Nav Group 3: Document Suite & Stats */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block px-2 mb-1.5">
                Reporting & Analytics
              </span>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveModule("reports")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition ${
                    activeModule === "reports"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:bg-slate-850 hover:text-white"
                  }`}
                >
                  <FileBarChart className="w-4 h-4 shrink-0" />
                  <span>Reports Compiler</span>
                </button>

                <button
                  onClick={() => setActiveModule("analytics")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition ${
                    activeModule === "analytics"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:bg-slate-850 hover:text-white"
                  }`}
                >
                  <LineChart className="w-4 h-4 shrink-0" />
                  <span>Statistical Regressors</span>
                </button>
              </div>
            </div>

            {/* Nav Group 4: Advanced Engine */}
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono block px-2 mb-1.5">
                Cognitive Services
              </span>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveModule("insights")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition ${
                    activeModule === "insights"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:bg-slate-850 hover:text-white"
                  }`}
                >
                  <Cpu className="w-4 h-4 shrink-0 text-amber-400" />
                  <div className="flex-1 flex justify-between items-center">
                    <span>AI Insights & YOLO</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  </div>
                </button>
              </div>
            </div>

          </div>

          {/* Sidebar Foot: Quick Settings & Alerts triggers */}
          <div className="flex flex-col gap-1 border-t border-slate-800 pt-4">
            <button
              onClick={() => setActiveModule("notifications")}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition ${
                activeModule === "notifications"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-850 hover:text-white"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Event Stream Logs</span>
            </button>
            <button
              onClick={() => setActiveModule("settings")}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition ${
                activeModule === "settings"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-850 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>System Settings</span>
            </button>
          </div>

        </div>

        {/* RIGHT FLEXIBLE SCREEN STAGE (9.5 Columns) */}
        <div className="lg:col-span-9 p-6 flex flex-col gap-6 overflow-y-auto max-h-[850px] bg-slate-50/50">
          
          {/* Simulated Export Action Overlay */}
          {exportType && (
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center gap-4 animate-fade-in">
              <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
              <div className="flex-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Enterprise Output Generator</span>
                <span className="text-sm font-black">{exportStatusText} ({exportProgress}%)</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-700">
                  <div style={{ width: `${exportProgress}%` }} className="bg-indigo-500 h-full transition-all duration-150" />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              MODULE 1: OVERVIEW DASHBOARD
              ======================================================== */}
          {activeModule === "overview" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Program Overview Dashboard</h2>
                  <p className="text-[11px] text-slate-500">Consolidated executive interface for the Bangalore Tech Park - Block B investment suite.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2.5 py-1 rounded-md uppercase">
                    3 Days Critical Delay Identified
                  </span>
                </div>
              </div>

              {/* HUD Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-mono">Physical Completion</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono mt-1">{projectStats.overallProgress}%</span>
                  <span className="text-[9px] text-slate-500 font-semibold mt-1">Target RERA Target: 71.8%</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-mono">Schedule Index (SPI)</span>
                  <span className="text-2xl font-black text-amber-500 font-mono mt-1">0.96</span>
                  <span className="text-[9px] text-rose-600 font-bold mt-1">0.04 Under Baseline</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-mono">Cost Index (CPI)</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono mt-1">1.02</span>
                  <span className="text-[9px] text-emerald-600 font-bold mt-1">Within Budget</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-mono">Capital Drawn</span>
                  <span className="text-2xl font-black text-slate-900 font-mono mt-1">₹13.3 Cr</span>
                  <span className="text-[9px] text-slate-500 mt-1">of {projectStats.totalBudget} Limit</span>
                </div>
              </div>

              {/* Split view: Structural Status + Activity Log */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Level Track (7 Columns) */}
                <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                      <Box className="w-4 h-4 text-indigo-500" />
                      Block B Levels & Physical Handover Progress
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Click to view BIM</span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {/* Level 4 */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs transition hover:bg-slate-100/50">
                      <div>
                        <span className="font-bold text-slate-700">Level 4 Roof Slab</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Pour schedule pending floor 3 handover</p>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] uppercase font-mono font-bold rounded">
                        Not Started
                      </span>
                    </div>

                    {/* Level 2 */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs transition hover:bg-slate-100/50">
                      <div>
                        <span className="font-bold text-slate-700">Level 2 Column Formworks</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Scaffolding and rebar framing active</p>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] uppercase font-mono font-bold rounded">
                        35% In Progress
                      </span>
                    </div>

                    {/* Level 1 */}
                    <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 flex items-center justify-between text-xs transition hover:bg-red-50">
                      <div>
                        <span className="font-bold text-red-900">Level 1 Slab & Shear Core</span>
                        <p className="text-[10px] text-red-700 mt-0.5">Anomaly detected on Axis C4 stirrups spacing</p>
                      </div>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 text-[9px] uppercase font-mono font-bold rounded">
                        Delayed (85%)
                      </span>
                    </div>

                    {/* Ground */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs transition hover:bg-slate-100/50">
                      <div>
                        <span className="font-bold text-slate-700">Ground Level Columns & Slab</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Fully RERA certified and checked via photogrammetry</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] uppercase font-mono font-bold rounded">
                        100% Completed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Staggered Activity logs (5 Columns) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                  <h4 className="text-xs font-black uppercase text-slate-700 border-b border-slate-100 pb-2">
                    Verified Drone Capture Logs
                  </h4>
                  
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800">Drone sweep #104 executed</span>
                        <p className="text-[10px] text-slate-400">Captured 120 high-res orthomosaics of Column Axis C4-D8.</p>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">2026-07-09 11:20 AM</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800">BIM core coordinates aligned</span>
                        <p className="text-[10px] text-slate-400">Resolved spatial discrepancy of Level 1 slab thickness offset.</p>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">2026-07-08 04:15 PM</span>
                      </div>
                    </div>

                    <div className="flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800">M35 Compressive strength logged</span>
                        <p className="text-[10px] text-slate-400">7-day concrete cube crush test yielded 24.8 MPa.</p>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">2026-07-06 09:30 AM</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Explanatory Educational Callout */}
              <div className="bg-slate-900 text-white p-4.5 rounded-xl border border-slate-800 flex gap-3 text-xs leading-relaxed">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-300 block">How to Navigate & Interpret:</span>
                  <p className="text-slate-300 text-[11px] mt-1">
                    Each module in the sidebar loads dedicated data structures. The <strong>3D BIM Model Viewer</strong> matches physical drone scans with the design. Use the <strong>Reports Compiler</strong> to distribute automated PDF or Excel files to stakeholders. Use the <strong>AI Insights & YOLO</strong> module to analyze rebar density deviations.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              MODULE 2: PROJECT HEALTH (EVM Metrics)
              ======================================================== */}
          {activeModule === "health" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Project Health & Earned Value</h2>
                  <p className="text-[11px] text-slate-500">Earned Value Management (EVM) ledger, SPI/CPI tracking curves, and quality metrics.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => triggerExportSimulation("Excel")}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold rounded-lg flex items-center gap-1 text-[11px] transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Export Ledger
                  </button>
                </div>
              </div>

              {/* EVM Indicator HUD */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Planned Value (PV)</span>
                  <span className="text-xl font-black text-slate-900 mt-1">₹18.5 Crores</span>
                  <p className="text-[10px] text-slate-400 mt-1">Authorized budget allocated for scheduled tasks to date.</p>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Earned Value (EV)</span>
                  <span className="text-xl font-black text-indigo-600 mt-1">₹17.9 Crores</span>
                  <p className="text-[10px] text-slate-400 mt-1">Value of completed physical work measured via spatial photogrammetry.</p>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Actual Cost (AC)</span>
                  <span className="text-xl font-black text-slate-800 mt-1">₹17.6 Crores</span>
                  <p className="text-[10px] text-slate-400 mt-1">Sum of contractor billing outlays and materials invoices logged.</p>
                </div>
              </div>

              {/* Recharts Real EVM Line Chart */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Cumulative Earned Value Curves (PV vs. EV vs. AC)</h3>
                  <p className="text-[11px] text-slate-400">Visualizing cost variance (CV = EV - AC) and schedule variance (SV = EV - PV) over 12 elapsed weeks.</p>
                </div>

                <div className="h-60 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={healthEvmData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} fontClassName="font-mono" />
                      <YAxis stroke="#94a3b8" fontSize={10} fontClassName="font-mono" />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="PV" stroke="#6366f1" name="Planned Value (PV)" strokeWidth={2} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="EV" stroke="#f59e0b" name="Earned Value (EV)" strokeWidth={2} />
                      <Line type="monotone" dataKey="AC" stroke="#10b981" name="Actual Cost (AC)" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quality & Tolerance KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                    Structural Tolerance Checklist
                  </h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Column Verticality Alignment Offset</span>
                      <span className="font-mono font-bold text-emerald-600">2.2 mm <span className="text-[10px] text-slate-400">(Limit 5mm)</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Reinforcement Clear Cover Depth</span>
                      <span className="font-mono font-bold text-emerald-600">42 mm <span className="text-[10px] text-slate-400">(Spec 40mm)</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Concrete Core Compressive Strength (M35)</span>
                      <span className="font-mono font-bold text-emerald-600">38.5 MPa <span className="text-[10px] text-slate-400">(Req 35)</span></span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                    RERA Governance Threshold Alerts
                  </h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Schedule Slippage Penalty Threshold</span>
                      <span className="font-mono text-rose-500 font-bold">&gt; 15 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">RERA Schedule Variance Buffer</span>
                      <span className="font-mono text-slate-500">10 Days Allocated</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Structural Safety Ratio Compliance</span>
                      <span className="font-mono text-emerald-600 font-bold">100% Certified</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              MODULE 3: PROGRESS (S-Curve & Volumes)
              ======================================================== */}
          {activeModule === "progress" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Physical S-Curve Progress Engine</h2>
                  <p className="text-[11px] text-slate-500">S-Curve cumulative progress comparison (BIM baseline vs actual CV measurements).</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-semibold border border-slate-200">
                    Week 12 of 16
                  </span>
                </div>
              </div>

              {/* Progress Index S-Curve widget */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Project Completion Curve (Planned vs. Actual vs. Forecast)</h3>
                  <p className="text-[11px] text-slate-400">Dashed line indicates forecasted projection to Week 16 based on current trade efficiency coefficients.</p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sCurveProgressData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="baselineColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="actualColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} fontClassName="font-mono" />
                      <YAxis stroke="#94a3b8" fontSize={10} fontClassName="font-mono" />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="Baseline" stroke="#6366f1" fillOpacity={1} fill="url(#baselineColor)" name="Baseline Curve (Planned)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Actual" stroke="#10b981" fillOpacity={1} fill="url(#actualColor)" name="Actual Curve (CV drone)" strokeWidth={2} />
                      <Line type="monotone" dataKey="Forecast" stroke="#f59e0b" name="Forecast Curve" strokeDasharray="4 4" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Volumetric Materials Ledger */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                  Volumetric Concrete & Finishes Inventory
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px] text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold">
                        <th className="py-2">Material Structure</th>
                        <th className="py-2">Planned Design Vol</th>
                        <th className="py-2">Actual Poured (CV verified)</th>
                        <th className="py-2">Deviation Range</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-900 font-bold">M35 Ready Mix Concrete</td>
                        <td>1,800.0 m³</td>
                        <td className="font-bold">1,450.0 m³</td>
                        <td className="text-slate-500">0.0%</td>
                        <td>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">Optimal</span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-900 font-bold">Structural Rebar Fe 550D</td>
                        <td>120.0 Metric Tons</td>
                        <td className="font-bold">95.0 Tons</td>
                        <td className="text-rose-500 font-bold">-4.2% (Shortage)</td>
                        <td>
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[9px] font-bold">Intervention</span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-900 font-bold">GI Sprinkler/HVAC Conduit</td>
                        <td>6,000.0 m</td>
                        <td className="font-bold">4,820.0 m</td>
                        <td className="text-slate-500">0.0%</td>
                        <td>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">Optimal</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              MODULE 4: DELAY (Monte Carlo & Critical Path)
              ======================================================== */}
          {activeModule === "delay" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Delay Analysis & Monte Carlo Simulator</h2>
                  <p className="text-[11px] text-slate-500">Probabilistic timeline prediction based on 10,000 randomized Monte Carlo simulations.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono">
                  <Play className="w-3.5 h-3.5 text-indigo-400" />
                  <span>N_iterations = 10,000</span>
                </div>
              </div>

              {/* Delay KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase font-mono">Critical Path Slippage</span>
                  <span className="text-2xl font-black text-rose-600 mt-1 font-mono">+3 Days</span>
                  <span className="text-[10px] text-rose-600 font-bold mt-1">Slab L1 Casting is driving date</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase font-mono">Prob. of On-Time RERA</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 font-mono">84.2%</span>
                  <span className="text-[10px] text-slate-500 mt-1">Required confidence index is &gt;80%</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase font-mono">Calculated Mean Duration</span>
                  <span className="text-2xl font-black text-indigo-600 mt-1 font-mono">112 Days</span>
                  <span className="text-[10px] text-slate-500 mt-1">Variance deviation is ±4.5 days</span>
                </div>
              </div>

              {/* Monte Carlo Area Chart */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Project Completion Probability Density (Beta Distribution)</h3>
                  <p className="text-[11px] text-slate-400">Peaks indicate the highest probability completion variance relative to the baseline design date.</p>
                </div>

                <div className="h-52 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={delayMonteCarloDistribution} margin={{ top: 10, right: 20, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pdfColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="delayDays" name="Variance Days" stroke="#94a3b8" fontSize={10} fontClassName="font-mono" unit="d" />
                      <YAxis stroke="#94a3b8" fontSize={10} fontClassName="font-mono" unit="%" />
                      <Tooltip />
                      <Area type="monotone" dataKey="probability" stroke="#4f46e5" fillOpacity={1} fill="url(#pdfColor)" name="Probability" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Critical Path dependent list */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                  Critical Chain Handover Progression
                </h4>

                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-[9px]">1</span>
                      <span className="font-bold text-slate-800">Ground Level Excavation & Foundations</span>
                    </div>
                    <span className="font-mono text-emerald-600 font-bold">100% (Completed)</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white font-bold text-[9px] animate-pulse">2</span>
                      <span className="font-bold text-slate-800">Level 1 Columns Concrete Pouring</span>
                    </div>
                    <span className="font-mono text-rose-500 font-bold">85% (3 days delay impact)</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs opacity-50">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-slate-400 rounded-full flex items-center justify-center text-white font-bold text-[9px]">3</span>
                      <span className="font-bold text-slate-800">Level 2 Structural Tension slab cast</span>
                    </div>
                    <span className="font-mono text-slate-500">Scheduled: July 24</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              MODULE 5: TRADES & LABOR HUD
              ======================================================== */}
          {activeModule === "trades" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Trades & Sub-Contractor Management</h2>
                  <p className="text-[11px] text-slate-500">Track labor ratios, work productivity, and coordination quality metrics.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-1 rounded">
                    Total Crew Size: 44 Workers
                  </span>
                </div>
              </div>

              {/* Trade Performers comparison chart */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Labor Productivity vs. Safety Ratings</h3>
                  <p className="text-[11px] text-slate-400">Comparing active subcontractor workforce metrics compiled from shift logs.</p>
                </div>

                <div className="h-52 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tradePerformers} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} fontClassName="font-mono" />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="efficiency" fill="#6366f1" name="Productivity Efficiency (%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="headcount" fill="#34d399" name="Active Headcount" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed trade coordinator table */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                  Contractor Ratios Ledger
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px] text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold">
                        <th className="py-2">Sub-Contractor Name</th>
                        <th className="py-2">Active Trade Category</th>
                        <th className="py-2 text-center">Labor Headcount Ratio</th>
                        <th className="py-2 text-center">Safety Compliance Index</th>
                        <th className="py-2 text-right font-bold text-indigo-600">Productivity (Units/man-hr)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradePerformers.map((trade, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-2.5 font-bold text-slate-950">{trade.name}</td>
                          <td>{i === 0 ? "Structural Civil" : (i === 1 ? "Electrical/Plumbing" : "Exterior Glazing")}</td>
                          <td className="text-center">
                            <span className={trade.headcount < trade.required ? "text-rose-500 font-bold" : "text-emerald-600 font-bold"}>
                              {trade.headcount} / {trade.required}
                            </span>
                          </td>
                          <td className="text-center font-bold text-slate-900">{trade.rating} / 5.0</td>
                          <td className="text-right text-indigo-600 font-bold">{trade.efficiency}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              MODULE 6: 3D BIM MODEL VIEWER (Simulated Viewport)
              ======================================================= */}
          {activeModule === "bim" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">3D BIM Spatial Coordination</h2>
                  <p className="text-[11px] text-slate-500">Cross-reference real-time computer vision bounding data with IFC CAD schemas.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIs3DRotating(!is3DRotating)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      is3DRotating ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${is3DRotating ? "animate-spin" : ""}`} />
                    <span>Auto-Rotate {is3DRotating ? "ON" : "OFF"}</span>
                  </button>
                </div>
              </div>

              {/* 3D simulated canvas layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Simulated WebGL Viewport (8 Columns) */}
                <div className="lg:col-span-8 bg-slate-950 h-96 rounded-xl border border-slate-900 relative overflow-hidden flex flex-col justify-between p-4 text-white">
                  
                  {/* Viewport controls bar */}
                  <div className="flex justify-between items-start z-10">
                    <div className="flex gap-1.5">
                      <span className="px-2 py-0.5 bg-slate-900/95 text-emerald-400 border border-slate-800 text-[9px] font-mono font-bold rounded">
                        FOV: 45°
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900/95 text-indigo-300 border border-slate-800 text-[9px] font-mono font-bold rounded">
                        PITCH: {modelPitch}°
                      </span>
                      <span className="px-2 py-0.5 bg-slate-900/95 text-indigo-300 border border-slate-800 text-[9px] font-mono font-bold rounded">
                        YAW: {modelYaw}°
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => { setModelPitch(p => Math.min(p + 15, 90)); }}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-[9px] font-bold"
                      >
                        Pitch +
                      </button>
                      <button
                        onClick={() => { setModelPitch(p => Math.max(p - 15, -90)); }}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-[9px] font-bold"
                      >
                        Pitch -
                      </button>
                    </div>
                  </div>

                  {/* Majestic Simulated 3D Structure using absolute CSS transforms or animated isometric blocks */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      style={{
                        transform: `rotateX(${modelPitch}deg) rotateY(${modelYaw}deg)`,
                        transformStyle: "preserve-3d",
                        transition: "transform 150ms ease-out"
                      }}
                      className="w-48 h-48 relative flex items-center justify-center"
                    >
                      {/* Level 3 */}
                      <div className="absolute w-36 h-8 bg-indigo-500/10 border-2 border-indigo-400/40 rounded flex items-center justify-center font-mono text-[8px]" style={{ transform: "translateY(-45px)" }}>
                        <span>L3: FORMWORKS ACTIVE</span>
                      </div>

                      {/* Level 2 */}
                      <div className="absolute w-36 h-8 bg-indigo-500/25 border-2 border-indigo-500/50 rounded flex items-center justify-center font-mono text-[8px]" style={{ transform: "translateY(-15px)" }}>
                        <span>L2: POUR SCHEDULED</span>
                      </div>

                      {/* Level 1 (Anomaly highlighted in RED) */}
                      <div className={`absolute w-36 h-8 border-2 rounded flex items-center justify-center font-mono text-[8px] transition duration-300 ${
                        selectedBimElement === "col_c4" ? "bg-rose-900/40 border-rose-500 text-rose-300 animate-pulse" : "bg-indigo-500/20 border-indigo-500"
                      }`} style={{ transform: "translateY(15px)" }}>
                        <span>L1: REBAR DEVIATION C4</span>
                      </div>

                      {/* Ground */}
                      <div className="absolute w-36 h-8 bg-emerald-500/10 border-2 border-emerald-500/60 rounded flex items-center justify-center font-mono text-[8px]" style={{ transform: "translateY(45px)" }}>
                        <span>L0: RERA COMPLIANT</span>
                      </div>
                    </div>
                  </div>

                  {/* Compass/Axes indicators in bottom corner */}
                  <div className="flex justify-between items-end z-10 text-[9px] font-mono text-slate-500">
                    <div className="flex flex-col">
                      <span>X-Axis: Structure Grid</span>
                      <span>Y-Axis: Mechanical Core</span>
                      <span>Z-Axis: Building Height</span>
                    </div>
                    <span>WebGL context initialized</span>
                  </div>

                </div>

                {/* Object Inspector Sidebar Panel (4 Columns) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block border-b border-slate-100 pb-1.5">
                      IFC Object Spec Inspector
                    </span>

                    <div className="flex flex-col gap-3 mt-3">
                      {bimElements.map(el => (
                        <button
                          key={el.id}
                          onClick={() => setSelectedBimElement(el.id)}
                          className={`w-full text-left p-2 rounded border text-xs flex justify-between items-center transition ${
                            selectedBimElement === el.id
                              ? "bg-indigo-50 border-indigo-200 text-indigo-900 font-bold"
                              : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              el.status === "completed" ? "bg-emerald-500" : (el.status === "delayed" ? "bg-rose-500" : "bg-blue-500")
                            }`} />
                            <span>{el.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono">{el.category}</span>
                        </button>
                      ))}
                    </div>

                    {/* Selected element spec details drawer */}
                    {selectedBimElement && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 mt-4 text-[11px] font-mono flex flex-col gap-2">
                        <span className="font-bold text-slate-800 uppercase block border-b border-slate-200 pb-1 mb-1">
                          {bimElements.find(e => e.id === selectedBimElement)?.name} Parameters
                        </span>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Category:</span>
                          <span className="font-bold">{bimElements.find(e => e.id === selectedBimElement)?.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Material Grade:</span>
                          <span className="font-bold">{bimElements.find(e => e.id === selectedBimElement)?.material}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Volume/Size:</span>
                          <span className="font-bold">{bimElements.find(e => e.id === selectedBimElement)?.volume}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">BIM Hierarchy:</span>
                          <span className="font-bold text-slate-500">{bimElements.find(e => e.id === selectedBimElement)?.path}</span>
                        </div>
                      </div>
                    )}

                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal mt-4 bg-slate-50 p-2 rounded">
                    Selecting elements in this list loads IFC parameters and highlights the corresponding bounding box overlay inside the WebGL canvas.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================
              MODULE 7: REPORTS COMPILER (With Schedule Form)
              ======================================================== */}
          {activeModule === "reports" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Reports Compiler & Automation Engine</h2>
                  <p className="text-[11px] text-slate-500">Generate on-demand RERA reports and manage automated email schedules.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold font-mono rounded">
                    Schedules Active: {schedules.filter(s => s.active).length}
                  </span>
                </div>
              </div>

              {/* Instant Output Controls */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">1. On-Demand Program Document Compilation</h3>
                <p className="text-slate-500 text-[11px]">Select output target and RERA format parameters. The compiler will pull live drone metrics.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between items-start gap-3">
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">Daily Shift Log Report</span>
                      <p className="text-[10px] text-slate-400 mt-1">Today's materials, worker ratios, weather constraints, and photo proofs.</p>
                    </div>
                    <button
                      onClick={() => triggerExportSimulation("PDF")}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Build PDF
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between items-start gap-3">
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">Executive Program Audit</span>
                      <p className="text-[10px] text-slate-400 mt-1">EVM parameters, SPI/CPI curves, critical milestones, and budget burndowns.</p>
                    </div>
                    <div className="flex gap-1 w-full">
                      <button
                        onClick={() => triggerExportSimulation("PDF")}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold flex items-center gap-1.5 transition"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => triggerExportSimulation("Excel")}
                        className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold flex items-center gap-1.5 transition"
                      >
                        Excel
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between items-start gap-3">
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">Delay & Monte Carlo Diagnostic</span>
                      <p className="text-[10px] text-slate-400 mt-1">Critical path sequences, float variances, and probability curve spreads.</p>
                    </div>
                    <button
                      onClick={() => triggerExportSimulation("Excel")}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold flex items-center gap-1.5 transition"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Build XLSX
                    </button>
                  </div>
                </div>
              </div>

              {/* Automated distribution compiler */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Active schedule database (7 Columns) */}
                <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                    Automated Email Distribution Schedules
                  </h4>

                  <div className="flex flex-col gap-3">
                    {schedules.map(sch => (
                      <div key={sch.id} className="p-3 bg-slate-50 rounded-lg border border-slate-150 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{sch.reportType}</span>
                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-mono font-bold rounded">
                              {sch.frequency}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1 font-mono">{sch.recipient} | {sch.timeOfDay}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSchedules(schedules.map(s => s.id === sch.id ? { ...s, active: !s.active } : s));
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold ${
                              sch.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {sch.active ? "Active" : "Paused"}
                          </button>
                          <button
                            onClick={() => deleteScheduleHandler(sch.id)}
                            className="p-1 bg-slate-100 hover:bg-rose-50 text-rose-600 rounded border border-slate-200 hover:border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Setup new schedule form (5 Columns) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                    Configure New Distribution
                  </h4>

                  <form onSubmit={addScheduleHandler} className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Report Target</label>
                      <select
                        value={newSchType}
                        onChange={(e) => setNewSchType(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                      >
                        <option>Daily Progress Log</option>
                        <option>Executive Program Dashboard</option>
                        <option>Delay Monte Carlo Diagnostic</option>
                        <option>Trade Productivity Matrix</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Frequency</label>
                        <select
                          value={newSchFreq}
                          onChange={(e: any) => setNewSchFreq(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                        >
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Format</label>
                        <select
                          value={newSchFormat}
                          onChange={(e: any) => setNewSchFormat(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                        >
                          <option>PDF</option>
                          <option>Excel</option>
                          <option>Both</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Recipient Email</label>
                      <input
                        type="email"
                        placeholder="recipient@domain.com"
                        value={newSchRecipient}
                        onChange={(e) => setNewSchRecipient(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add Distribution
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================
              MODULE 8: STATISTICAL REGRESSORS
              ======================================================== */}
          {activeModule === "analytics" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Statistical Regressors & Analytics</h2>
                  <p className="text-[11px] text-slate-500">Cross-reference weather, rebar supply, and worker density factors with installation speed.</p>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400">
                  <span>Engine: XGBoost Regressor Pipeline</span>
                </div>
              </div>

              {/* Analytics HUD metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase font-mono">Model Variance R²</span>
                  <span className="text-2xl font-black text-indigo-600 mt-1 font-mono">0.915</span>
                  <span className="text-[10px] text-slate-500 mt-1">Trained on 120,000 shift logs</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase font-mono">Active Covariates</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 font-mono">18 Factors</span>
                  <span className="text-[10px] text-slate-500 mt-1">Auto-adjusted for seasonality</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase font-mono">Calculated Beta (Rainfall)</span>
                  <span className="text-2xl font-black text-rose-500 mt-1 font-mono">-0.42</span>
                  <span className="text-[10px] text-rose-600 font-bold mt-1">High precipitation reduces pour rate</span>
                </div>
              </div>

              {/* Weather vs Pour rate scatter chart */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Precipitation Correlation Matrix (Rainfall vs. Pour Speed)</h3>
                  <p className="text-[11px] text-slate-400">Each node matches a historical shift sequence. Trend outlines physical pour retardation during monsoon seasons.</p>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" dataKey="rainfall" name="Precipitation" stroke="#94a3b8" fontSize={10} unit="mm" />
                      <YAxis type="number" dataKey="speed" name="Pour Rate" stroke="#94a3b8" fontSize={10} unit="m³/d" />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter name="Concrete Pour Runs" data={weatherCorrelationData} fill="#4f46e5" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Correlation checklist description */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                  Top Volumetric Covariance Factors (Feature Importance)
                </h4>

                <div className="flex flex-col gap-2.5 font-mono text-[11px] text-slate-600">
                  <div className="flex justify-between border-b border-slate-50 pb-1.5">
                    <span className="font-bold text-slate-800">1. Subcontractor Labor Headcount Ratio</span>
                    <span className="text-indigo-600 font-bold">Relative Weight: 42.4%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-1.5">
                    <span className="font-bold text-slate-800">2. Severe Precipitation (W_risk_t)</span>
                    <span className="text-indigo-600 font-bold">Relative Weight: 22.8%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-1.5">
                    <span className="font-bold text-slate-800">3. Steel Reinforcement Supply Lead-time</span>
                    <span className="text-indigo-600 font-bold">Relative Weight: 15.5%</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              MODULE 9: AI INSIGHTS & YOLO DRONE METRICS
              ======================================================== */}
          {activeModule === "insights" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">AI Cognitive Insights & YOLO Drone Analytics</h2>
                  <p className="text-[11px] text-slate-500">FastAPI computer vision stream tracking rebar mesh spacings and generating RERA remediations.</p>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded font-bold font-mono">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>YOLO-v8 ONLINE</span>
                </div>
              </div>

              {/* AI Precision stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase font-mono">Drone Image Align Precision</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono mt-1">98.6%</span>
                  <span className="text-[10px] text-slate-500 mt-1">Confidence tolerance matches RERA standard</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase font-mono">CV Inference Speed</span>
                  <span className="text-2xl font-black text-slate-900 font-mono mt-1">420 ms / frame</span>
                  <span className="text-[10px] text-slate-500 mt-1">Processed on NVIDIA Tesla T4 backend</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[9px] text-slate-400 font-black uppercase font-mono">YOLO Precision (MAP@0.5)</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono mt-1">0.965</span>
                  <span className="text-[10px] text-slate-500 mt-1">Trained on structural concrete datasets</span>
                </div>
              </div>

              {/* YOLO Real-time computer vision detection bounding boxes */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Camera Feed Simulator (7 Columns) */}
                <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-900 p-4 flex flex-col justify-between h-80 text-white relative overflow-hidden">
                  
                  {/* Camera overlays */}
                  <div className="flex justify-between items-start z-10 text-[9px] font-mono">
                    <span className="bg-rose-600/90 text-white px-2 py-0.5 rounded uppercase font-bold animate-pulse">
                      Live Drone Inspection Feed #104
                    </span>
                    <span className="bg-slate-900/90 text-slate-400 px-2 py-0.5 rounded">
                      2026-07-09 11:24 AM
                    </span>
                  </div>

                  {/* Bounding box graphics */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-56 h-40 border-2 border-rose-500 rounded relative">
                      <span className="absolute -top-5 left-0 bg-rose-500 text-white text-[9px] font-mono font-bold px-1 py-0.5 uppercase">
                        Reinforcement Stirrup Spacing Deviation (Confidence: 94.2%)
                      </span>
                      <div className="w-full h-full border border-dashed border-rose-500/50 flex flex-col justify-between p-2">
                        <span className="text-rose-400 text-[8px] font-mono">Offset: +85mm spacing stretch</span>
                        <span className="text-rose-400 text-[8px] font-mono self-end">Rebar Fe 550D detected</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end z-10 text-[9px] font-mono text-slate-500">
                    <span>GPS Align: 12.9716° N, 77.7512° E</span>
                    <span>Altitude: 14.5m</span>
                  </div>

                </div>

                {/* AI Gemini Remediation Plan Generator (5 Columns) */}
                <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between h-80">
                  <div>
                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-3">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-slate-800 text-xs uppercase tracking-wide">Gemini Mitigation Assistant</span>
                    </div>

                    {isGeneratingPlan ? (
                      <div className="flex flex-col gap-2 py-4 text-center items-center justify-center text-slate-500">
                        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                        <span className="font-bold text-xs">Assembling custom structural remediation plan...</span>
                        <p className="text-[10px] leading-relaxed max-w-[180px]">Querying RERA compliance rules and structural reinforcement manuals.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 text-xs">
                        {remediationStep === 0 && (
                          <>
                            <span className="font-bold text-slate-800">Active Alert: Column C4 Spacing deviation</span>
                            <p className="text-slate-500 text-[11px] leading-normal">
                              The YOLO-v8 instance segmentation model has identified that stirrups in Column C4 exceed maximum structural spacing requirements by 85mm.
                            </p>
                            <button
                              onClick={() => {
                                setIsGeneratingPlan(true);
                                setTimeout(() => {
                                  setIsGeneratingPlan(false);
                                  setRemediationStep(1);
                                }, 1200);
                              }}
                              className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition flex items-center justify-center gap-1.5 text-[11px]"
                            >
                              <Cpu className="w-4 h-4 text-amber-300" />
                              Generate Remediation Plan
                            </button>
                          </>
                        )}

                        {remediationStep === 1 && (
                          <div className="flex flex-col gap-2.5">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                              <span className="font-bold text-indigo-700 text-[11px]">RERA-Compliant Plan</span>
                              <button onClick={() => setRemediationStep(0)} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold">
                                Back
                              </button>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded text-[11px] text-slate-700 max-h-40 overflow-y-auto font-mono leading-relaxed">
                              <strong>1. Structural Action:</strong> Deploy rebar technician to insert additional cross-ties within 48 hours.<br />
                              <strong>2. Supervision:</strong> Senior engineer to execute physical check cover test prior to pouring concrete.<br />
                              <strong>3. Regulatory:</strong> Log photogrammetry alignment correction proof into KA-RERA ledger portal to avoid compliance penalization.
                            </div>
                            <div className="flex justify-between gap-2 mt-1">
                              <button
                                onClick={() => {
                                  alert("Mitigation action sent successfully to site leads!");
                                  setRemediationStep(0);
                                }}
                                className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold"
                              >
                                Disseminate Plan
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2">
                    Our backend triggers automated remediation instructions directly aligned with Karnataka RERA safety clauses.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================
              MODULE 10: NOTIFICATIONS STREAM
              ======================================================== */}
          {activeModule === "notifications" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Event Stream Logs & Alerts</h2>
                  <p className="text-[11px] text-slate-500">Real-time alerts triggered by drone inspections, compliance checks, or schedule offsets.</p>
                </div>
                <button
                  onClick={() => {
                    alert("All system alerts cleared.");
                  }}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded font-bold transition text-[11px]"
                >
                  Clear Logs
                </button>
              </div>

              {/* Setup alert logic form */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  Configure Automated Threshold Trigger Rules
                </h3>
                <p className="text-slate-500 text-[11px]">Specify exact criteria. If the project metrics violate these thresholds, BuildTrace will dispatch immediate SMS/email alerts.</p>

                <form onSubmit={addRuleHandler} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Target Project Metric</label>
                    <select
                      value={newRuleMetric}
                      onChange={(e) => setNewRuleMetric(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                    >
                      <option>Schedule Index (SPI)</option>
                      <option>Cost Index (CPI)</option>
                      <option>Unresolved Anomaly Count</option>
                      <option>Column Verticality Offset (mm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Condition</label>
                    <select
                      value={newRuleOperator}
                      onChange={(e: any) => setNewRuleOperator(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs"
                    >
                      <option>Less Than</option>
                      <option>Greater Than</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Value Limit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newRuleVal}
                      onChange={(e) => setNewRuleVal(parseFloat(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                      required
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Rule
                    </button>
                  </div>
                </form>

                {/* Active Rules List */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {triggerRules.map(rule => (
                    <div key={rule.id} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono text-[10px]">
                      <span className="font-bold text-slate-700">{rule.metric}</span>
                      <span className="text-indigo-600 font-bold">{rule.operator === "Less Than" ? "<" : ">"} {rule.value}</span>
                      <button
                        onClick={() => deleteRuleHandler(rule.id)}
                        className="text-rose-500 hover:text-rose-700 font-bold border-l border-slate-200 pl-1.5 ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event alert logs feed */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                  Recent Alarms (YOLO-v8 & Site Controllers)
                </h4>

                <div className="flex flex-col gap-3">
                  {notificationAlerts.map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setActiveNotificationId(alert.id);
                        setShowNotificationModal(true);
                      }}
                      className={`p-3.5 rounded-lg border flex gap-3 cursor-pointer transition ${
                        alert.priority === "critical"
                          ? "bg-rose-50/75 border-rose-200 hover:bg-rose-50"
                          : (alert.priority === "high" ? "bg-amber-50/75 border-amber-200 hover:bg-amber-50" : "bg-slate-50 border-slate-150 hover:bg-slate-100/50")
                      }`}
                    >
                      <AlertTriangle className={`w-5 h-5 shrink-0 ${
                        alert.priority === "critical" ? "text-rose-600 animate-pulse" : (alert.priority === "high" ? "text-amber-500" : "text-slate-400")
                      }`} />

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900 text-xs">{alert.title}</span>
                          <span className="font-mono text-[9px] text-slate-400">{alert.date}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-normal mt-1">{alert.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              MODULE 11: SYSTEM SETTINGS
              ======================================================== */}
          {activeModule === "settings" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-lg font-black text-slate-900">Enterprise System Settings</h2>
                <p className="text-[11px] text-slate-500">Configure RERA compliance identifiers, FastAPI connections, and YOLO model thresholds.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* General Settings Card */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-1.5">
                    Regulatory & Compliance Coordinates
                  </h3>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">KA-RERA Registration ID</label>
                      <input
                        type="text"
                        value={reraIdSetting}
                        onChange={(e) => setReraIdSetting(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">FastAPI Backend Endpoint</label>
                      <input
                        type="text"
                        value={fastApiHost}
                        onChange={(e) => setFastApiHost(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Project Site Location Tag</label>
                      <input
                        type="text"
                        defaultValue="Whitefield, Bengaluru"
                        disabled
                        className="w-full p-2 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Computer Vision Model Settings Card */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-100 pb-1.5">
                    YOLO-v8 Drone Vision Configuration
                  </h3>

                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Object Detection Confidence Threshold</label>
                        <span className="font-mono font-bold text-indigo-600">{confidenceThreshold}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="95"
                        value={confidenceThreshold}
                        onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Lower values increase sensitivity but may introduce bounding box noise.</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">Automated Email Alerts on Deviations</span>
                        <p className="text-[10px] text-slate-400">Directly dispatch email to operators upon YOLO anomaly detection.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoEmailAlerts}
                        onChange={(e) => setAutoEmailAlerts(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Settings Action Controls */}
              <div className="bg-slate-900 text-white p-4.5 rounded-xl border border-slate-800 flex justify-between items-center">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  These changes directly adjust local browser states. For physical production deployment, ensure credentials match environment variables.
                </p>
                <button
                  onClick={() => {
                    alert("System configuration successfully saved!");
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-xs shadow-md shrink-0"
                >
                  Save Coordinates
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 4. EXPLANATION FLOATING DRAWER (Navigation Flow Overview) */}
      <div className="bg-indigo-900 text-white p-6 border-t border-indigo-950">
        <h3 className="text-sm font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 mb-2">
          <Workflow className="w-5 h-5 text-amber-400" />
          Enterprise Navigation Flow & Architectural Specifications
        </h3>
        
        <p className="text-xs text-indigo-100 leading-relaxed">
          The <strong>BUILDTRACE Enterprise Dashboard</strong> is architected with a clean sidebar routing framework. Each navigation tab accesses a distinct sub-view designed for different site personas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-[11px]">
          <div className="bg-indigo-950/60 p-3 rounded-lg border border-indigo-800/40">
            <span className="font-bold text-amber-300 block">1. Executive HUD Flow</span>
            <p className="text-indigo-200 mt-1">
              Select <strong>Overview</strong> or <strong>Project Health</strong> to review financial cashflows, SPI/CPI Earned Value curves, and RERA safety compliance markers.
            </p>
          </div>

          <div className="bg-indigo-950/60 p-3 rounded-lg border border-indigo-800/40">
            <span className="font-bold text-amber-300 block">2. Volumetric Flow</span>
            <p className="text-indigo-200 mt-1">
              Select <strong>Physical S-Curve</strong> or <strong>Delay & Predictors</strong> to review materials pour logs, Critical Path slippages, and Monte Carlo probability dates.
            </p>
          </div>

          <div className="bg-indigo-950/60 p-3 rounded-lg border border-indigo-800/40">
            <span className="font-bold text-amber-300 block">3. Cognitive Flow</span>
            <p className="text-indigo-200 mt-1">
              Select <strong>AI Insights & YOLO</strong> or <strong>3D BIM Model</strong> to run computer vision rebar spacing tests and generate RERA-compliant remediation plans.
            </p>
          </div>

          <div className="bg-indigo-950/60 p-3 rounded-lg border border-indigo-800/40">
            <span className="font-bold text-amber-300 block">4. Output Flow</span>
            <p className="text-indigo-200 mt-1">
              Select <strong>Reports Compiler</strong> or <strong>Event Stream Logs</strong> to configure email distributions, compile on-demand PDF/Excel, and build trigger alerts.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
