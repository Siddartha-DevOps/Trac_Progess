import React, { useState, useMemo } from "react";
import {
  FileText,
  Calendar,
  Clock,
  Download,
  Mail,
  Send,
  Sliders,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Users,
  Building2,
  ShieldAlert,
  ArrowRight,
  Printer,
  ChevronRight,
  FileSpreadsheet,
  Workflow,
  Wrench,
  Search,
  Plus,
  Trash2,
  MapPin,
  RefreshCw,
  Clock3,
  CloudLightning,
  TrendingDown,
  Info,
  X,
  Check,
  Eye,
  Settings
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

// Import modular data structures and interfaces
import {
  DailyLog,
  WeeklyMilestone,
  MonthlyReraAudit,
  DelayIncident,
  TradePerformance,
  DAILY_LOGS,
  WEEKLY_MILESTONES,
  MONTHLY_RERA_AUDITS,
  DELAY_INCIDENTS,
  TRADE_CONTRACTORS,
  WEEKLY_PROGRESS_SCURVE,
  MONTHLY_CASHFLOW_HISTORY,
  triggerCsvDownload
} from "./reportsData";

interface ReportSchedule {
  id: string;
  reportType: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  recipient: string;
  format: "PDF" | "Excel" | "Both";
  timeOfDay: string;
  active: boolean;
}

export default function ReportingCenter() {
  // Navigation Tabs
  const [activeSubTab, setActiveSubTab] = useState<
    "daily" | "weekly" | "monthly" | "delay" | "trade" | "scheduler" | "architecture"
  >("daily");

  // Global Filters State
  const [selectedBlock, setSelectedBlock] = useState<"All" | "Block A" | "Block B" | "Block C">("All");
  const [selectedTrade, setSelectedTrade] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<"All" | "Day" | "Night">("All");

  // Export & Print States
  const [exportingType, setExportingType] = useState<"PDF" | "Excel" | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSuccessMessage, setExportSuccessMessage] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Email distribution state
  const [schedules, setSchedules] = useState<ReportSchedule[]>([
    { id: "sch-1", reportType: "Weekly Milestone Audit", frequency: "Weekly", recipient: "sidduchitiki@gmail.com", format: "PDF", timeOfDay: "08:00 AM", active: true },
    { id: "sch-2", reportType: "Daily Shift Log", frequency: "Daily", recipient: "site-leads@buildtrace.in", format: "Both", timeOfDay: "06:30 PM", active: true },
    { id: "sch-3", reportType: "Monthly RERA Audit", frequency: "Monthly", recipient: "directors@buildtrace.in", format: "Excel", timeOfDay: "09:00 AM", active: false }
  ]);
  const [newRepType, setNewRepType] = useState("Daily Shift Log");
  const [newFreq, setNewFreq] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [newRecipient, setNewRecipient] = useState("");
  const [newFormat, setNewFormat] = useState<"PDF" | "Excel" | "Both">("PDF");
  const [newTime, setNewTime] = useState("08:00 AM");

  const [emailInput, setEmailInput] = useState("sidduchitiki@gmail.com");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // 1. FILTERING UTILITIES based on global state
  const filteredDailyLogs = useMemo(() => {
    return DAILY_LOGS.filter((log) => {
      const matchBlock = selectedBlock === "All" || log.block === selectedBlock;
      const matchShift = selectedShift === "All" || log.shift === selectedShift;
      const matchTrade = selectedTrade === "All" || log.trade === selectedTrade;
      const matchSearch =
        searchQuery === "" ||
        log.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBlock && matchShift && matchTrade && matchSearch;
    });
  }, [selectedBlock, selectedShift, selectedTrade, searchQuery]);

  const filteredWeeklyMilestones = useMemo(() => {
    return WEEKLY_MILESTONES.filter((ms) => {
      const matchBlock = selectedBlock === "All" || ms.block === selectedBlock;
      const matchSearch =
        searchQuery === "" ||
        ms.milestone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ms.subcontractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ms.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBlock && matchSearch;
    });
  }, [selectedBlock, searchQuery]);

  const filteredReraAudits = useMemo(() => {
    return MONTHLY_RERA_AUDITS.filter((audit) => {
      const matchBlock = selectedBlock === "All" || audit.block === selectedBlock;
      const matchSearch =
        searchQuery === "" ||
        audit.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.clause.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.auditor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.remediation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBlock && matchSearch;
    });
  }, [selectedBlock, searchQuery]);

  const filteredDelayIncidents = useMemo(() => {
    return DELAY_INCIDENTS.filter((inc) => {
      const matchBlock = selectedBlock === "All" || inc.block === selectedBlock;
      const matchSearch =
        searchQuery === "" ||
        inc.incident.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.subcontractor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBlock && matchSearch;
    });
  }, [selectedBlock, searchQuery]);

  const filteredTradePerformance = useMemo(() => {
    return TRADE_CONTRACTORS.filter((trade) => {
      const matchSearch =
        searchQuery === "" ||
        trade.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.trade.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [searchQuery]);

  // Unique list of Trades for dropdown filters
  const uniqueTrades = useMemo(() => {
    const list = new Set(DAILY_LOGS.map((log) => log.trade));
    return ["All", ...Array.from(list)];
  }, []);

  // 2. EXCEL CSV EXPORT TRIGGER
  const handleExcelExport = () => {
    setExportingType("Excel");
    setExportProgress(0);
    setExportSuccessMessage("");

    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setExportingType(null);
            // Dynamic data CSV download based on subtab
            if (activeSubTab === "daily") {
              triggerCsvDownload(filteredDailyLogs, "Daily_Progress_Report");
              setExportSuccessMessage("Successfully generated and downloaded Daily Progress Report CSV.");
            } else if (activeSubTab === "weekly") {
              triggerCsvDownload(filteredWeeklyMilestones, "Weekly_Milestones_Report");
              setExportSuccessMessage("Successfully generated and downloaded Weekly Milestones CSV.");
            } else if (activeSubTab === "monthly") {
              triggerCsvDownload(filteredReraAudits, "Monthly_RERA_Audit_Report");
              setExportSuccessMessage("Successfully generated and downloaded Monthly RERA Audit Checklist CSV.");
            } else if (activeSubTab === "delay") {
              triggerCsvDownload(filteredDelayIncidents, "Delay_Incidents_Report");
              setExportSuccessMessage("Successfully generated and downloaded Delay Incidents Log CSV.");
            } else if (activeSubTab === "trade") {
              triggerCsvDownload(filteredTradePerformance, "Trade_Performance_Report");
              setExportSuccessMessage("Successfully generated and downloaded Trade Performance CSV.");
            } else {
              triggerCsvDownload(schedules, "Automation_Schedules_Report");
              setExportSuccessMessage("Successfully generated and downloaded Scheduled Automations CSV.");
            }
          }, 300);
          return 100;
        }
        return p + 20;
      });
    }, 60);
  };

  // 3. PDF EXPORT COMPILER
  const handlePdfExport = () => {
    setExportingType("PDF");
    setExportProgress(0);
    setExportSuccessMessage("");

    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setExportingType(null);
            setShowPrintModal(true);
          }, 300);
          return 100;
        }
        return p + 20;
      });
    }, 60);
  };

  // Automated Schedule Addition
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient) return;
    const newSch: ReportSchedule = {
      id: `sch-${Date.now()}`,
      reportType: newRepType,
      frequency: newFreq,
      recipient: newRecipient,
      format: newFormat,
      timeOfDay: newTime,
      active: true
    };
    setSchedules([...schedules, newSch]);
    setNewRecipient("");
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  // SMTP Tester
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setEmailSending(true);
    setEmailSuccess(false);

    setTimeout(() => {
      setEmailSending(false);
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 4000);
    }, 1200);
  };

  // Chart Data Preparation
  const dailyChartData = useMemo(() => {
    // Aggregated concrete volume and manpower per Block for Daily Report
    const aggregates: Record<string, { concrete: number; manpower: number }> = {
      "Block A": { concrete: 0, manpower: 0 },
      "Block B": { concrete: 0, manpower: 0 },
      "Block C": { concrete: 0, manpower: 0 }
    };
    filteredDailyLogs.forEach((log) => {
      if (log.trade === "Concrete") {
        aggregates[log.block].concrete += log.quantityVal;
      }
      aggregates[log.block].manpower += log.manpower;
    });
    return Object.keys(aggregates).map((block) => ({
      name: block,
      "Concrete Poured (m³)": aggregates[block].concrete,
      "Crew Members Onsite": aggregates[block].manpower
    }));
  }, [filteredDailyLogs]);

  const delayChartData = useMemo(() => {
    return filteredDelayIncidents.map((inc) => ({
      code: inc.code,
      "Critical Delay Impact (Days)": inc.floatImpact,
      "Subcontractor Responsibility": inc.subcontractor
    }));
  }, [filteredDelayIncidents]);

  const tradeChartData = useMemo(() => {
    return filteredTradePerformance.map((t) => ({
      contractor: t.contractor.split(" ")[0], // abbreviate
      "Active Crew": t.activeCrew,
      "Planned Crew": t.plannedCrew,
      "Audit Score": t.auditScore
    }));
  }, [filteredTradePerformance]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col w-full overflow-hidden text-slate-800" id="reporting-center-root">
      
      {/* HEADER SECTION - Enterprise styling */}
      <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            </span>
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-100">
              BuildTrace progress report terminal
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Generate, filter, and schedule physical site audits, RERA milestones compliance indices, and BIM variances.
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePdfExport}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 flex items-center gap-2 transition cursor-pointer"
            title="Generate print-friendly PDF"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>PDF Export</span>
          </button>
          <button
            onClick={handleExcelExport}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-700 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition cursor-pointer"
            title="Download Excel compatible CSV of filtered table"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Excel Export</span>
          </button>
        </div>
      </div>

      {/* GLOBAL INTERACTIVE FILTER BAR */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Block Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Spatial Block</span>
          <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
            {(["All", "Block A", "Block B", "Block C"] as const).map((block) => (
              <button
                key={block}
                onClick={() => setSelectedBlock(block)}
                className={`flex-1 text-center py-1 text-[11px] font-bold rounded-md transition-all ${
                  selectedBlock === block
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {block === "All" ? "All Blocks" : block}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Search Key Terms</span>
          <div className="relative bg-white rounded-lg border border-slate-200">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by contractor, guid..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-transparent border-0 placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Trade Filter (Conditional/Universal) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">BIM Construction Trade</span>
          <select
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-lg p-2 text-slate-700 font-semibold focus:outline-indigo-500"
          >
            <option value="All">All Trades</option>
            {uniqueTrades.filter(t => t !== "All").map((trade) => (
              <option key={trade} value={trade}>
                {trade}
              </option>
            ))}
          </select>
        </div>

        {/* Status indicator overview */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Active Workspace Indicators</span>
          <div className="bg-slate-100 border border-slate-250 p-2 rounded-lg flex justify-between items-center text-[10.5px]">
            <span className="text-slate-500 font-medium font-mono">Whitefield Phase 2</span>
            <span className="bg-indigo-100 text-indigo-700 font-bold font-mono px-1.5 py-0.5 rounded uppercase text-[9px] border border-indigo-150">
              KA-RERA Regulated
            </span>
          </div>
        </div>
      </div>

      {/* WORKSPACE LAYOUT: Side Subtabs Navigation + Live Screen Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* SUBTABS SIDEBAR (3 Columns) */}
        <aside className="lg:col-span-3 bg-slate-50/75 border-r border-slate-200 p-4 flex flex-col gap-4" aria-label="Report Sub-Tabs Selection">
          
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block mb-2 px-1">
              Standardized Reports
            </span>
            <div className="flex flex-col gap-1">
              {/* Daily progress */}
              <button
                onClick={() => {
                  setActiveSubTab("daily");
                  setSearchQuery("");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition border ${
                  activeSubTab === "daily"
                    ? "bg-white text-indigo-600 border-slate-250 shadow-sm"
                    : "text-slate-600 border-transparent hover:bg-slate-100/50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Daily Progress Report</span>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                  {filteredDailyLogs.length}
                </span>
              </button>

              {/* Weekly report */}
              <button
                onClick={() => {
                  setActiveSubTab("weekly");
                  setSearchQuery("");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition border ${
                  activeSubTab === "weekly"
                    ? "bg-white text-indigo-600 border-slate-250 shadow-sm"
                    : "text-slate-600 border-transparent hover:bg-slate-100/50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Weekly Progress Report</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                  {filteredWeeklyMilestones.length}
                </span>
              </button>

              {/* Monthly report */}
              <button
                onClick={() => {
                  setActiveSubTab("monthly");
                  setSearchQuery("");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition border ${
                  activeSubTab === "monthly"
                    ? "bg-white text-indigo-600 border-slate-250 shadow-sm"
                    : "text-slate-600 border-transparent hover:bg-slate-100/50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <span>Monthly RERA Report</span>
                </div>
                <span className="bg-amber-50 text-amber-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                  {filteredReraAudits.length}
                </span>
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block mb-2 px-1">
              Risk & Audit Ledger
            </span>
            <div className="flex flex-col gap-1">
              {/* Delay report */}
              <button
                onClick={() => {
                  setActiveSubTab("delay");
                  setSearchQuery("");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition border ${
                  activeSubTab === "delay"
                    ? "bg-white text-indigo-600 border-slate-250 shadow-sm"
                    : "text-slate-600 border-transparent hover:bg-slate-100/50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Delay Incident Report</span>
                </div>
                <span className="bg-rose-50 text-rose-600 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                  {filteredDelayIncidents.length}
                </span>
              </button>

              {/* Trade performance */}
              <button
                onClick={() => {
                  setActiveSubTab("trade");
                  setSearchQuery("");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition border ${
                  activeSubTab === "trade"
                    ? "bg-white text-indigo-600 border-slate-250 shadow-sm"
                    : "text-slate-600 border-transparent hover:bg-slate-100/50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>Trade Performance Log</span>
                </div>
                <span className="bg-slate-200 text-slate-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                  {filteredTradePerformance.length}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block mb-2 px-1">
              Distribution & Engine
            </span>
            <div className="flex flex-col gap-1">
              {/* Scheduler */}
              <button
                onClick={() => {
                  setActiveSubTab("scheduler");
                  setSearchQuery("");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition border ${
                  activeSubTab === "scheduler"
                    ? "bg-white text-indigo-600 border-slate-250 shadow-sm"
                    : "text-slate-600 border-transparent hover:bg-slate-100/50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>Automated Schedules</span>
                </div>
                <span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                  {schedules.length}
                </span>
              </button>

              {/* Architecture specs */}
              <button
                onClick={() => {
                  setActiveSubTab("architecture");
                  setSearchQuery("");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition border ${
                  activeSubTab === "architecture"
                    ? "bg-white text-indigo-600 border-slate-250 shadow-sm"
                    : "text-slate-600 border-transparent hover:bg-slate-100/50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-indigo-500" />
                  <span>Reporting Architecture</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

        </aside>

        {/* MAIN PANEL AREA (9 Columns) */}
        <main className="lg:col-span-9 p-6 bg-slate-50/20 flex flex-col gap-6 overflow-y-auto max-h-[820px] scrollbar-thin">
          
          {/* Ongoing Export status overlay */}
          {exportingType && (
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center gap-4 animate-pulse shadow-md">
              <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
              <div className="flex-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Compiling Report Stream</span>
                <span className="text-xs font-bold">Assembling {exportingType} spreadsheet payload... {exportProgress}%</span>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div style={{ width: `${exportProgress}%` }} className="bg-indigo-500 h-full transition-all duration-150" />
                </div>
              </div>
            </div>
          )}

          {exportSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-fade-in shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">{exportSuccessMessage}</span>
              </div>
              <button
                onClick={() => setExportSuccessMessage("")}
                className="text-emerald-700 hover:text-emerald-950 font-extrabold text-xs ml-4 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ==========================================
              SUBTAB 1: DAILY PROGRESS REPORT
              ========================================== */}
          {activeSubTab === "daily" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Daily Summary Header */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold font-mono px-2 py-0.5 rounded uppercase">Shift Log</span>
                    <span className="text-[10px] text-slate-400 font-mono">Report: BTP-DR-4958</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">Daily Construction Progress Statement</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Real-time daily outputs mapped from camera logs against architectural CAD baselines.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-500">Filter Shift:</span>
                  <div className="bg-white border border-slate-200 p-0.5 rounded-lg flex gap-1">
                    {(["All", "Day", "Night"] as const).map((shift) => (
                      <button
                        key={shift}
                        onClick={() => setSelectedShift(shift)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          selectedShift === shift ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {shift}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Stats HUD */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono">Onsite Labor Strength</span>
                  <span className="text-2xl font-black text-slate-900 font-mono mt-1">
                    {filteredDailyLogs.reduce((acc, curr) => acc + curr.manpower, 0)} workers
                  </span>
                  <span className="text-[9.5px] text-indigo-600 font-semibold mt-1">Active across {new Set(filteredDailyLogs.map(l => l.block)).size} blocks</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono">Total Volume Logs</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono mt-1">
                    {filteredDailyLogs.length} items
                  </span>
                  <span className="text-[9.5px] text-slate-500 font-semibold mt-1">Filtered from shift registry</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono">Completed Tasks</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono mt-1">
                    {filteredDailyLogs.filter(l => l.status === "Completed").length} / {filteredDailyLogs.length}
                  </span>
                  <span className="text-[9.5px] text-emerald-600 font-bold font-mono mt-1">
                    {filteredDailyLogs.length ? Math.round((filteredDailyLogs.filter(l => l.status === "Completed").length / filteredDailyLogs.length) * 100) : 0}% success rate
                  </span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono">Total Concrete Poured</span>
                  <span className="text-2xl font-black text-amber-600 font-mono mt-1">
                    {filteredDailyLogs.filter(l => l.trade === "Concrete").reduce((acc, curr) => acc + curr.quantityVal, 0).toFixed(1)} m³
                  </span>
                  <span className="text-[9.5px] text-slate-500 font-semibold mt-1">Ready-mix structural grade</span>
                </div>
              </div>

              {/* Dynamic Recharts Visualization */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Daily Poured Volume & Active Crew distribution
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Values aggregated by spatial block</span>
                </div>
                
                <div className="h-56">
                  {dailyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "1px solid #334155", fontSize: "11px" }} />
                        <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "600" }} />
                        <Bar name="Concrete Poured (m³)" dataKey="Concrete Poured (m³)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar name="Crew Members Onsite" dataKey="Crew Members Onsite" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                      No logs matching filters to display chart data.
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Daily Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filtered Daily Task Log</span>
                  <span className="text-[10px] font-mono text-slate-500">{filteredDailyLogs.length} items logged</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono text-[9px] bg-slate-50/40">
                        <th className="p-3">Log ID & Date</th>
                        <th className="p-3">Block / Shift</th>
                        <th className="p-3">Trade</th>
                        <th className="p-3">Work Item Summary</th>
                        <th className="p-3">Quantity / Crew</th>
                        <th className="p-3">Subcontractor</th>
                        <th className="p-3">Variance Log</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDailyLogs.length > 0 ? (
                        filteredDailyLogs.map((log) => (
                          <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition font-sans">
                            <td className="p-3 whitespace-nowrap">
                              <span className="font-bold text-slate-900 block font-mono">{log.id}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="font-semibold text-slate-800 block">{log.block}</span>
                              <span className="text-[10px] text-slate-400">{log.shift} Shift</span>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                {log.trade}
                              </span>
                            </td>
                            <td className="p-3 font-medium text-slate-800 max-w-[180px] truncate" title={log.item}>
                              {log.item}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="font-bold text-slate-850 block">{log.quantity}</span>
                              <span className="text-[10px] text-slate-400">{log.manpower} workers</span>
                            </td>
                            <td className="p-3 text-slate-600 whitespace-nowrap">{log.contractor}</td>
                            <td className="p-3 font-mono text-[10.5px] text-indigo-600 font-bold">{log.variance}</td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                log.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                                  : log.status === "Delayed"
                                  ? "bg-rose-50 text-rose-700 border-rose-250"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-250 animate-pulse"
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                            No daily shift records found matching your selected filters. Adjust your block or search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              SUBTAB 2: WEEKLY PROGRESS REPORT
              ========================================== */}
          {activeSubTab === "weekly" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold font-mono px-2 py-0.5 rounded uppercase">Earned Value S-Curve</span>
                    <span className="text-[10px] text-slate-400 font-mono">Audit: BTP-WR-012</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">Weekly Program Progress Ledger</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Physical progress analysis S-Curve and weekly milestone compliance metrics.</p>
                </div>
              </div>

              {/* Weekly stats summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-950 text-white p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono">Current Audit Week</span>
                    <span className="text-2xl font-black block mt-1 font-mono">Week 12</span>
                  </div>
                  <span className="text-[10px] text-slate-300 mt-2">Physical photogrammetry cycle completed</span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Cumulative Milestones</span>
                    <span className="text-2xl font-black text-slate-950 block mt-1 font-mono">
                      {filteredWeeklyMilestones.filter(m => m.status === "Achieved").length} / {filteredWeeklyMilestones.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {Math.round((filteredWeeklyMilestones.filter(m => m.status === "Achieved").length / filteredWeeklyMilestones.length) * 100)}% compliance rating
                  </span>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Critical Path Slippage</span>
                    <span className="text-2xl font-black text-rose-600 block mt-1 font-mono">
                      +{filteredWeeklyMilestones.filter(m => m.criticalPath && m.varianceDays > 0).reduce((acc, curr) => acc + curr.varianceDays, 0)} days
                    </span>
                  </div>
                  <span className="text-[10px] text-rose-500 font-bold">Over scheduled baseline milestones</span>
                </div>
              </div>

              {/* Recharts Area S-Curve Progress Chart */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    BIM Schedule Baseline vs Actual Physical Progress S-Curve
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">Whitefield Block B • Week 1 to 12</span>
                </div>

                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={WEEKLY_PROGRESS_SCURVE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="baselineColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="actualColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} unit="%" />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "1px solid #334155" }} />
                      <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "600" }} />
                      <Area type="monotone" name="Scheduled BIM Baseline %" dataKey="Scheduled BIM %" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#baselineColor)" />
                      <Area type="monotone" name="Drone Photogrammetry Actual %" dataKey="Actual Drone %" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#actualColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Milestones Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Weekly Milestones Status Table</span>
                  <span className="text-[10px] font-mono text-slate-500">{filteredWeeklyMilestones.length} milestones tracked</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono text-[9px] bg-slate-50/40">
                        <th className="p-3">Milestone Code</th>
                        <th className="p-3">Block / Week</th>
                        <th className="p-3">Milestone Description</th>
                        <th className="p-3 font-center">Scheduled Target</th>
                        <th className="p-3 font-center">Actual Verified</th>
                        <th className="p-3">Assigned Subcontractor</th>
                        <th className="p-3">RERA Critical Path</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWeeklyMilestones.length > 0 ? (
                        filteredWeeklyMilestones.map((ms) => (
                          <tr key={ms.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition">
                            <td className="p-3 whitespace-nowrap font-mono font-bold text-slate-900">{ms.id}</td>
                            <td className="p-3 whitespace-nowrap text-slate-600">
                              <span className="font-bold text-slate-800 block">{ms.block}</span>
                              <span>Week {ms.week}</span>
                            </td>
                            <td className="p-3 font-medium text-slate-800 max-w-[200px] truncate" title={ms.milestone}>
                              {ms.milestone}
                            </td>
                            <td className="p-3 font-mono text-slate-600 whitespace-nowrap">{ms.targetDate}</td>
                            <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                              {ms.actualDate || <span className="text-slate-400 italic">Pending</span>}
                            </td>
                            <td className="p-3 text-slate-600 whitespace-nowrap">{ms.subcontractor}</td>
                            <td className="p-3">
                              {ms.criticalPath ? (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded font-mono text-[9px] uppercase border border-red-200">
                                  Critical
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono text-[9px] uppercase">
                                  Standard
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                ms.status === "Achieved"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : ms.status === "Delayed"
                                  ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                                  : ms.status === "Active"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : "bg-slate-100 text-slate-400 border-slate-200"
                              }`}>
                                {ms.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                            No milestones matching search queries found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              SUBTAB 3: MONTHLY RERA AUDIT
              ========================================== */}
          {activeSubTab === "monthly" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-amber-50 text-amber-700 font-bold font-mono px-2 py-0.5 rounded uppercase">RERA Compliance</span>
                    <span className="text-[10px] text-slate-400 font-mono">Registry: BTP-MR-2026-07</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">Monthly Milestone & RERA Audit</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Verification checklist and statutory disclosures as per Karnataka RERA Act parameters.</p>
                </div>
              </div>

              {/* Cashflow Burndown Summary */}
              <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                <div className="space-y-1 relative z-10">
                  <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">Aggregate Project Cashflow Billing</span>
                  <span className="text-2xl font-black block font-mono text-indigo-300">₹12.8 Crores Drawdown</span>
                  <p className="text-[10.5px] text-slate-400">Audited against physical orthomosaic volume calculations.</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 relative z-10 text-[11px] font-mono text-right min-w-[200px]">
                  <span className="text-slate-500 block text-[10px]">KA-RERA Baseline Release:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">₹13.3 Cr Budget Target</span>
                </div>
              </div>

              {/* Monthly compliance S-Curve chart */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                  Billing Drawdown and RERA Compliance score index
                </h4>
                
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MONTHLY_CASHFLOW_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "1px solid #334155" }} />
                      <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "600" }} />
                      <Line type="monotone" name="Planned Drawdown (Crores)" dataKey="Planned (Crores)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" />
                      <Line type="monotone" name="Actual Drawdown (Crores)" dataKey="Actual (Crores)" stroke="#4f46e5" strokeWidth={3} />
                      <Line type="monotone" name="KA-RERA Compliance Index" dataKey="RERA Index" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RERA table checklist */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">RERA Statutory Disclosures Audits</span>
                  <span className="text-[10px] font-mono text-slate-500">{filteredReraAudits.length} clauses audited</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono text-[9px] bg-slate-50/40">
                        <th className="p-3">Audit ID</th>
                        <th className="p-3">RERA Statutory Clause</th>
                        <th className="p-3">Scope / Subject Area</th>
                        <th className="p-3 text-center">Score</th>
                        <th className="p-3">Assigned Auditor</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReraAudits.length > 0 ? (
                        filteredReraAudits.map((audit) => (
                          <tr key={audit.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition">
                            <td className="p-3 whitespace-nowrap font-mono font-bold text-slate-900">{audit.id}</td>
                            <td className="p-3 text-indigo-700 font-mono font-bold max-w-[150px] truncate" title={audit.clause}>
                              {audit.clause}
                            </td>
                            <td className="p-3 font-sans">
                              <span className="font-extrabold text-slate-850 block">{audit.subject}</span>
                              <span className="text-[10px] text-slate-400 italic block mt-0.5">Remediation: "{audit.remediation}"</span>
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-slate-800 text-xs">
                              <span className={`px-1.5 py-0.5 rounded ${
                                audit.score >= 90 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800 font-black animate-pulse"
                              }`}>
                                {audit.score}%
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 whitespace-nowrap">{audit.auditor}</td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                audit.status === "Compliant"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : audit.status === "Critical Variance"
                                  ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {audit.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                            No RERA records matching selected filters found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              SUBTAB 4: DELAY INCIDENT REPORT
              ========================================== */}
          {activeSubTab === "delay" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-red-50 text-red-700 font-bold font-mono px-2 py-0.5 rounded uppercase">Delay Logs</span>
                    <span className="text-[10px] text-slate-400 font-mono">Registry: BTP-DL-008</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">Delay Incident Diagnostics Statement</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Active schedule deviations, critical float calculations, and subcontractor mitigation logs.</p>
                </div>
              </div>

              {/* Delay Chart */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                  Calculated float impact in days per incident code
                </h4>

                <div className="h-44">
                  {delayChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={delayChartData} margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={9} label={{ value: 'Days of float delay', position: 'insideBottom', offset: -5, fontSize: 9 }} />
                        <YAxis type="category" dataKey="code" stroke="#94a3b8" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "8px" }} />
                        <Bar name="Float Delay (Days)" dataKey="Critical Delay Impact (Days)" fill="#ef4444" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 italic text-xs">
                      No logs to display chart.
                    </div>
                  )}
                </div>
              </div>

              {/* Delay Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Incident Registry Table</span>
                  <span className="text-[10px] font-mono text-slate-500">{filteredDelayIncidents.length} incidents logged</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono text-[9px] bg-slate-50/40">
                        <th className="p-3">Incident Code</th>
                        <th className="p-3">Date Mapped</th>
                        <th className="p-3">Location Block</th>
                        <th className="p-3">Incident Deviation Summary</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-center">Float Delay</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDelayIncidents.length > 0 ? (
                        filteredDelayIncidents.map((inc) => (
                          <tr key={inc.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition">
                            <td className="p-3 whitespace-nowrap font-mono font-bold text-slate-900">{inc.code}</td>
                            <td className="p-3 whitespace-nowrap font-mono text-slate-500">{inc.date}</td>
                            <td className="p-3 whitespace-nowrap font-bold text-slate-800">{inc.block}</td>
                            <td className="p-3 font-medium text-slate-800 max-w-[220px]">
                              <span className="block">{inc.incident}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">By: {inc.subcontractor}</span>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 bg-slate-150 text-slate-600 rounded text-[9.5px] font-semibold">
                                {inc.category}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono font-extrabold text-rose-600 text-xs whitespace-nowrap">
                              +{inc.floatImpact.toFixed(1)} Days
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                inc.status === "Mitigated"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : inc.status === "Active Remediation"
                                  ? "bg-rose-50 text-rose-700 border-rose-250 animate-pulse"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}>
                                {inc.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                            No delay incidents match selected parameters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              SUBTAB 5: TRADE PERFORMANCE LOG
              ========================================== */}
          {activeSubTab === "trade" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-slate-100 text-slate-700 font-bold font-mono px-2 py-0.5 rounded uppercase">Subcontractors</span>
                    <span className="text-[10px] text-slate-400 font-mono">Registry: BTP-TP-048</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">Contractor Trade Performance Matrix</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Evaluation of active headcounts, safety compliance index, and weekly audit rankings.</p>
                </div>
              </div>

              {/* Trade Chart */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                  Subcontractor Crew strength: Active vs Planned Allocation
                </h4>

                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tradeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="contractor" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "8px" }} />
                      <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "600" }} />
                      <Bar name="Active Onsite Crew" dataKey="Active Crew" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      <Bar name="Planned Baseline Crew" dataKey="Planned Crew" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trade Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subcontractor Audits Ledger</span>
                  <span className="text-[10px] font-mono text-slate-500">{filteredTradePerformance.length} contractors active</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono text-[9px] bg-slate-50/40">
                        <th className="p-3">Trade Specialist</th>
                        <th className="p-3">Contractor Name</th>
                        <th className="p-3 text-center">Crew Allocation</th>
                        <th className="p-3 text-center">Schedule Compliance</th>
                        <th className="p-3 text-center">Safety Rating</th>
                        <th className="p-3 text-center">Audit Score</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTradePerformance.length > 0 ? (
                        filteredTradePerformance.map((t) => (
                          <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition">
                            <td className="p-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                                {t.trade}
                              </span>
                            </td>
                            <td className="p-3 font-extrabold text-slate-900 whitespace-nowrap">{t.contractor}</td>
                            <td className="p-3 text-center font-mono text-slate-700 whitespace-nowrap">
                              <strong>{t.activeCrew}</strong> / {t.plannedCrew}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                              {t.complianceRate}%
                            </td>
                            <td className="p-3 text-center font-mono text-amber-600 font-bold whitespace-nowrap">
                              ★ {t.safetyRating.toFixed(1)} / 5.0
                            </td>
                            <td className="p-3 text-center font-mono text-indigo-600 font-extrabold text-xs whitespace-nowrap">
                              {t.auditScore} / 100
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                t.status === "Optimal"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : t.status === "Critical"
                                  ? "bg-red-50 text-red-700 border-red-200 animate-pulse"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                            No contractors matching filters found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              SUBTAB 6: AUTOMATED DISTRIBUTION SCHEDULES
              ========================================== */}
          {activeSubTab === "scheduler" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              
              {/* Form Section */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    Configure Automated Distribution List
                  </h3>
                  <p className="text-[11px] text-slate-400">Add automatic schedules to distribute RERA & progress logs to clients and executives.</p>
                </div>

                <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Target Report Type</label>
                    <select
                      value={newRepType}
                      onChange={(e) => setNewRepType(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs rounded p-2 text-slate-700 font-semibold focus:outline-indigo-500"
                    >
                      <option value="Daily Shift Log">Daily Shift Log</option>
                      <option value="Weekly Milestone Audit">Weekly Milestone Audit</option>
                      <option value="Monthly RERA Audit">Monthly RERA Audit</option>
                      <option value="Delay Incident Registry">Delay Incident Registry</option>
                      <option value="Trade Performance Log">Trade Performance Log</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Trigger Interval</label>
                    <select
                      value={newFreq}
                      onChange={(e: any) => setNewFreq(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs rounded p-2 text-slate-700 font-semibold focus:outline-indigo-500"
                    >
                      <option value="Daily">Daily Progress</option>
                      <option value="Weekly">Weekly Digest</option>
                      <option value="Monthly">Monthly Statement</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Format</label>
                    <select
                      value={newFormat}
                      onChange={(e: any) => setNewFormat(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs rounded p-2 text-slate-700 font-semibold focus:outline-indigo-500"
                    >
                      <option value="PDF">PDF Only</option>
                      <option value="Excel">Excel Only</option>
                      <option value="Both">Both Formats (Zip)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Recipient Email (Distribution lists allowed)</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sidduchitiki@gmail.com, site-leads@buildtrace.in"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded p-2 text-xs font-semibold text-slate-700 focus:outline-indigo-500 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Dispatch Hour</label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded p-2 text-xs font-semibold text-slate-700 focus:outline-indigo-500 font-mono"
                    />
                  </div>

                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Distribution Schedule
                    </button>
                  </div>
                </form>
              </div>

              {/* Active schedules list */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Scheduled Automation Tasks
                </span>

                <div className="flex flex-col gap-2.5">
                  {schedules.map((sch) => (
                    <div key={sch.id} className="bg-slate-50 border border-slate-150 p-3 rounded-lg flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md border ${sch.active ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-slate-200 text-slate-500 border-slate-300"}`}>
                          <Clock3 className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 text-xs">{sch.reportType}</span>
                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-bold font-mono">
                              {sch.frequency}
                            </span>
                          </div>
                          <p className="text-slate-500 mt-0.5">
                            To: <span className="font-semibold text-slate-700">{sch.recipient}</span> | Format: <span className="font-bold">{sch.format}</span> | Dispatch Time: <span className="font-semibold text-slate-700 font-mono">{sch.timeOfDay}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleSchedule(sch.id)}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border transition cursor-pointer ${
                            sch.active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-250 font-extrabold"
                              : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}
                        >
                          {sch.active ? "Active" : "Paused"}
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(sch.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition rounded hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SMTP Tester */}
              <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col gap-4 shadow-sm">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono">Diagnostics & Trigger</span>
                  <h4 className="font-bold text-sm mt-0.5 text-slate-200">Manual SMTP Distribution Trigger</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Force compile and test email transmission instantly to any address.</p>
                </div>

                <form onSubmit={handleSendEmail} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter recipient email address..."
                    className="bg-slate-950 border border-slate-800 text-white rounded p-2 text-xs font-mono flex-1 focus:outline-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={emailSending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 font-bold text-white rounded-lg transition text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className={`w-3.5 h-3.5 ${emailSending ? "animate-spin" : ""}`} />
                    {emailSending ? "Transmitting..." : "Send Test Report"}
                  </button>
                </form>

                {emailSuccess && (
                  <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 p-2.5 rounded-lg text-[11px] leading-relaxed flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Success! Daily Progress Report transmission dispatched successfully to {emailInput} via SMTP (SES Pipeline ID #SMTP-BTP-93).</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==========================================
              SUBTAB 7: ARCHITECTURE SPECS
              ========================================== */}
          {activeSubTab === "architecture" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] uppercase font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-mono">
                  Engine specifications
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">End-to-End Reporting Architecture</h3>
                <p className="text-xs text-slate-500 mt-1">
                  How our system captures spatial photogrammetry drone telemetry, aligns it over PostgreSQL/PostGIS, runs Monte Carlo estimators, and compiles automated PDFs.
                </p>
              </div>

              {/* Event Flow flowchart card */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Data Pipelines & Event Flow
                </span>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                      01
                    </div>
                    <div>
                      <span className="font-bold text-slate-850 text-xs block">Drone & Photogrammetry Ingestion</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Weekly high-res aerial drone mapping uploads orthomosaics. YOLO-v8 instance segmentation algorithms label actual spatial concrete volume blocks and layout boundaries.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                      02
                    </div>
                    <div>
                      <span className="font-bold text-slate-850 text-xs block">PostgreSQL Spatial Alignment (TimescaleDB)</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Spatial metadata is persisted in relational PostgreSQL database. Progress logs are written to high-performance timeseries tables to record daily crew counts, weather alerts, and trade installation speeds.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                      03
                    </div>
                    <div>
                      <span className="font-bold text-slate-850 text-xs block">Stochastic & ML-Inspired Calculations</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Celery background tasks ingest actual timelines, evaluate meteorological alerts via forecast APIs, calculate Critical Path floats, and execute Monte Carlo simulations to model delay distributions.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                      04
                    </div>
                    <div>
                      <span className="font-bold text-slate-850 text-xs block">Weasyprint HTML-to-PDF Compiling</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        A headless Python microservice triggers on distribution cron loops. It pulls template layouts, injects Recharts metrics as high-fidelity SVG graphics, compiles CSS, and formats final RERA compliant report attachments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* PDF HIGH-FIDELITY PRINT PRE-VISUALIZATION MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up text-slate-800">
            {/* Modal header */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-xs uppercase tracking-wider">BuildTrace PDF Compiler & Print Preview</span>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Sheet Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-100" id="print-sheet-wrapper">
              <div className="bg-white p-8 max-w-2xl mx-auto shadow-sm border border-slate-300 rounded relative" id="printable-area">
                {/* Stamp & Barcode overlay */}
                <div className="absolute top-8 right-8 flex flex-col items-end gap-1 select-none pointer-events-none">
                  <div className="border-4 border-emerald-600/30 text-emerald-600/30 font-black tracking-widest text-[11px] uppercase p-1.5 rotate-12 rounded">
                    Verified CV Scan
                  </div>
                  <div className="text-[8px] font-mono text-slate-300 mt-1">
                    *BTP-L1-4958-VALIDATED*
                  </div>
                </div>

                {/* Print Header */}
                <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">BuildTrace</h1>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider block uppercase font-bold">
                      Bengaluru Whitefield Tech Park Phase 2
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">RERA ID: KA-RERA-2026-BTP09</span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400">
                    <p className="font-bold text-slate-800">Date Compiled: 2026-07-11</p>
                    <p>Operator: sidduchitiki@gmail.com</p>
                    <p className="text-indigo-600 font-bold mt-1">Status: KA-RERA Compliant</p>
                  </div>
                </div>

                {/* Print Title */}
                <div className="mb-6">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Official Progress Report Snapshot</span>
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mt-1">
                    {activeSubTab === "daily" && "Daily Progress Statement"}
                    {activeSubTab === "weekly" && "Weekly Milestone Compliance Audit"}
                    {activeSubTab === "monthly" && "Monthly Statutory RERA Assessment"}
                    {activeSubTab === "delay" && "Critical Path Delay Incident Register"}
                    {activeSubTab === "trade" && "Active Subcontractors Performance Ledger"}
                    {activeSubTab === "scheduler" && "Automated Distribution Schedules"}
                    {activeSubTab === "architecture" && "Reporting Infrastructure Specs"}
                  </h2>
                </div>

                {/* Print Content - Custom render based on active tab */}
                <div className="text-xs space-y-5">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-[11px] leading-relaxed">
                    <strong>Report Summary Statement:</strong> This progress document registers physical site outputs detected via drone camera mapping and validated automatically against the master architectural design specifications.
                  </div>

                  {/* Render summary tables for printing */}
                  {activeSubTab === "daily" && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1">Task Logs Summary</h4>
                      <table className="w-full text-left text-[10px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 font-mono text-[9px] text-slate-500 uppercase">
                            <th className="py-1">ID</th>
                            <th className="py-1">Block</th>
                            <th className="py-1">Trade</th>
                            <th className="py-1">Work Item</th>
                            <th className="py-1">Quantity</th>
                            <th className="py-1 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDailyLogs.slice(0, 6).map((log) => (
                            <tr key={log.id} className="border-b border-slate-100">
                              <td className="py-1.5 font-mono font-bold text-slate-900">{log.id}</td>
                              <td className="py-1.5">{log.block} ({log.shift})</td>
                              <td className="py-1.5 font-semibold text-slate-700">{log.trade}</td>
                              <td className="py-1.5">{log.item}</td>
                              <td className="py-1.5 font-mono">{log.quantity}</td>
                              <td className="py-1.5 text-right font-bold text-slate-800">{log.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeSubTab === "weekly" && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1">Weekly Milestones</h4>
                      <table className="w-full text-left text-[10px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 font-mono text-[9px] text-slate-500 uppercase">
                            <th className="py-1">ID</th>
                            <th className="py-1">Block</th>
                            <th className="py-1">Milestone Description</th>
                            <th className="py-1">Target Date</th>
                            <th className="py-1">Verified Date</th>
                            <th className="py-1 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredWeeklyMilestones.slice(0, 6).map((ms) => (
                            <tr key={ms.id} className="border-b border-slate-100">
                              <td className="py-1.5 font-mono font-bold text-slate-900">{ms.id}</td>
                              <td className="py-1.5">{ms.block}</td>
                              <td className="py-1.5 font-semibold">{ms.milestone}</td>
                              <td className="py-1.5 font-mono">{ms.targetDate}</td>
                              <td className="py-1.5 font-mono">{ms.actualDate || "Pending"}</td>
                              <td className="py-1.5 text-right font-bold text-slate-800">{ms.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeSubTab === "monthly" && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1">RERA Disclosure Audits</h4>
                      <table className="w-full text-left text-[10px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 font-mono text-[9px] text-slate-500 uppercase">
                            <th className="py-1">ID</th>
                            <th className="py-1">RERA Clause</th>
                            <th className="py-1">Subject Area</th>
                            <th className="py-1 text-center">Score</th>
                            <th className="py-1 text-right">Compliance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReraAudits.map((audit) => (
                            <tr key={audit.id} className="border-b border-slate-100">
                              <td className="py-1.5 font-mono font-bold text-slate-900">{audit.id}</td>
                              <td className="py-1.5 font-mono text-indigo-700">{audit.clause}</td>
                              <td className="py-1.5">{audit.subject}</td>
                              <td className="py-1.5 text-center font-bold">{audit.score}%</td>
                              <td className="py-1.5 text-right font-bold text-slate-800">{audit.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeSubTab === "delay" && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1">Delay Incident Register</h4>
                      <table className="w-full text-left text-[10px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 font-mono text-[9px] text-slate-500 uppercase">
                            <th className="py-1">ID Code</th>
                            <th className="py-1">Block</th>
                            <th className="py-1">Incident Summary</th>
                            <th className="py-1">Category</th>
                            <th className="py-1 text-center">Float Delay</th>
                            <th className="py-1 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDelayIncidents.map((inc) => (
                            <tr key={inc.id} className="border-b border-slate-100">
                              <td className="py-1.5 font-mono font-bold text-slate-900">{inc.code}</td>
                              <td className="py-1.5">{inc.block}</td>
                              <td className="py-1.5 font-semibold">{inc.incident}</td>
                              <td className="py-1.5 text-slate-600">{inc.category}</td>
                              <td className="py-1.5 text-center font-bold text-rose-600 font-mono">+{inc.floatImpact.toFixed(1)} Days</td>
                              <td className="py-1.5 text-right font-bold text-slate-800">{inc.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Signature sign-offs */}
                  <div className="pt-8 mt-12 border-t border-slate-300 grid grid-cols-2 gap-8 text-[10px]">
                    <div className="flex flex-col gap-6">
                      <span className="text-slate-400 uppercase font-mono tracking-wider">Certified Chartered Architect</span>
                      <div className="border-b border-slate-400 w-3/4 h-2" />
                      <span className="font-bold text-slate-700 font-mono">Registration: COA-A/2026/842</span>
                    </div>
                    <div className="flex flex-col gap-6 text-right items-end">
                      <span className="text-slate-400 uppercase font-mono tracking-wider">BuildTrace QC Authority</span>
                      <div className="border-b border-slate-400 w-3/4 h-2" />
                      <span className="font-bold text-slate-700 font-mono">Digital Signature Stamp: [VALIDATED]</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                  setExportSuccessMessage("Document snapshot compiled and sent to local printer spool.");
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-700 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Print Official Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
