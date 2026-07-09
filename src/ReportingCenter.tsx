import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Clock,
  Download,
  Mail,
  Send,
  Sliders,
  Database,
  Cpu,
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
  Info
} from "lucide-react";

// Initial Report Distribution Schedule Data
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
  const [activeSubTab, setActiveSubTab] = useState<
    "daily" | "weekly" | "monthly" | "executive" | "client" | "delay" | "trade" | "productivity" | "scheduler" | "architecture"
  >("executive");

  // State for interactive elements
  const [exportingType, setExportingType] = useState<"PDF" | "Excel" | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSuccessMessage, setExportSuccessMessage] = useState("");
  
  const [emailInput, setEmailInput] = useState("sidduchitiki@gmail.com");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // New schedule form state
  const [schedules, setSchedules] = useState<ReportSchedule[]>([
    { id: "sch-1", reportType: "Executive Dashboard Report", frequency: "Weekly", recipient: "sidduchitiki@gmail.com", format: "PDF", timeOfDay: "08:00 AM", active: true },
    { id: "sch-2", reportType: "Daily Progress Report", frequency: "Daily", recipient: "site-leads@buildtrace.in", format: "Both", timeOfDay: "06:30 PM", active: true },
    { id: "sch-3", reportType: "Productivity & Trade Performance", frequency: "Monthly", recipient: "directors@buildtrace.in", format: "Excel", timeOfDay: "09:00 AM", active: false }
  ]);
  const [newRepType, setNewRepType] = useState("Daily Progress Report");
  const [newFreq, setNewFreq] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [newRecipient, setNewRecipient] = useState("");
  const [newFormat, setNewFormat] = useState<"PDF" | "Excel" | "Both">("PDF");
  const [newTime, setNewTime] = useState("08:00 AM");

  // Simulation parameters (connected to Bengaluru Whitefield context)
  const projectInfo = {
    name: "Bangalore Tech Park - Block B",
    location: "Whitefield, Bengaluru",
    overallProgress: 72.4,
    elapsedWeeks: 12,
    totalBudget: "₹18.5 Crores",
    spi: 0.96,
    cpi: 1.02,
    safetyDays: 245,
    criticalDelay: "3 days"
  };

  // Run mock export animation
  const handleTriggerExport = (type: "PDF" | "Excel") => {
    setExportingType(type);
    setExportProgress(0);
    setExportSuccessMessage("");
    
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setExportingType(null);
            setExportSuccessMessage(`Successfully compiled and exported: BTP_BlockB_${activeSubTab}_Report.${type.toLowerCase() === 'pdf' ? 'pdf' : 'xlsx'}`);
          }, 600);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  // Run mock email transmission
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setEmailSending(true);
    setEmailSuccess(false);

    setTimeout(() => {
      setEmailSending(false);
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 4000);
    }, 1500);
  };

  // Add new schedule
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

  // Delete schedule
  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  // Toggle schedule status
  const handleToggleSchedule = (id: string) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col w-full overflow-hidden text-slate-800">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/15 border border-indigo-500/25 rounded-lg text-indigo-400">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">Reporting & Analytics Center</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate and schedule comprehensive, RERA-compliant PDF and Excel reports using AI photogrammetry metrics and BIM IFC metadata.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleTriggerExport("PDF")}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            Export PDF
          </button>
          <button
            onClick={() => handleTriggerExport("Excel")}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Export Excel
          </button>
        </div>
      </div>

      {/* WORKSPACE LAYOUT (Sub Tabs Sidebar + Live Preview Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* SIDEBAR NAVIGATION (3 Columns) */}
        <div className="lg:col-span-3 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-4">
          
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block mb-2 px-1">
              Dashboards & KPIs
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveSubTab("executive")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                  activeSubTab === "executive"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <span>Executive Dashboard</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveSubTab("client")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                  activeSubTab === "client"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Client Dashboard</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block mb-2 px-1">
              Standardized Reports
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveSubTab("daily")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                  activeSubTab === "daily"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Daily Progress Report</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveSubTab("weekly")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                  activeSubTab === "weekly"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Weekly Report</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveSubTab("monthly")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                  activeSubTab === "monthly"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Monthly Milestone Report</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block mb-2 px-1">
              Risk & Metrics Analytics
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveSubTab("delay")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                  activeSubTab === "delay"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Delay Incident Report</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveSubTab("trade")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                  activeSubTab === "trade"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>Trade Performance Log</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveSubTab("productivity")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                  activeSubTab === "productivity"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span>Productivity Report</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block mb-2 px-1">
              Distribution & Engine
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveSubTab("scheduler")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                  activeSubTab === "scheduler"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>Schedules & Emails</span>
                </div>
                <span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                  {schedules.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSubTab("architecture")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                  activeSubTab === "architecture"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-indigo-500" />
                  <span>Reporting Architecture</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

        </div>

        {/* LIVE CONTENT PREVIEW SPACE (9 Columns) */}
        <div className="lg:col-span-9 p-6 flex flex-col gap-6 bg-slate-50/35 overflow-y-auto max-h-[800px]">
          
          {/* Notifications and Overlays */}
          {exportingType && (
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center gap-4 animate-pulse">
              <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
              <div className="flex-1">
                <span className="text-xs font-mono font-bold uppercase text-slate-400 block">Compiling Report Stream</span>
                <span className="text-sm font-bold">Assembling {exportingType} from spatial schemas... {exportProgress}%</span>
                <div className="w-full bg-slate-850 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div style={{ width: `${exportProgress}%` }} className="bg-indigo-500 h-full transition-all duration-150" />
                </div>
              </div>
            </div>
          )}

          {exportSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-fade-in shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{exportSuccessMessage}</span>
              </div>
              <button
                onClick={() => setExportSuccessMessage("")}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ========================================================
              VIEW 1: EXECUTIVE DASHBOARD (High Level KPIs)
              ======================================================== */}
          {activeSubTab === "executive" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">Executive Program Dashboard</h3>
                  <p className="text-[11px] text-slate-500">Block B high-level indicators and investment governance summary.</p>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 uppercase font-semibold">
                  Nov 2026 Milestone Target
                </span>
              </div>

              {/* Grid HUD KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono">Program Progress</span>
                  <span className="text-2xl font-black text-indigo-600 font-mono mt-1">{projectInfo.overallProgress}%</span>
                  <span className="text-[9px] text-slate-500 font-semibold mt-1">72.1% Baseline target</span>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono">Schedule Index (SPI)</span>
                  <span className="text-2xl font-black text-rose-500 font-mono mt-1">{projectInfo.spi}</span>
                  <span className="text-[9px] text-rose-600 font-semibold mt-1">0.04 Under-performing</span>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono">Cost Index (CPI)</span>
                  <span className="text-2xl font-black text-emerald-600 font-mono mt-1">{projectInfo.cpi}</span>
                  <span className="text-[9px] text-emerald-600 font-semibold mt-1">Under baseline budget</span>
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono">Critical Delay</span>
                  <span className="text-2xl font-black text-amber-500 font-mono mt-1">{projectInfo.criticalDelay}</span>
                  <span className="text-[9px] text-slate-500 font-semibold mt-1">Slab 1 Cast core path</span>
                </div>
              </div>

              {/* Progress vs Budget chart card */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                  Budget Burndown vs Schedule Baseline Progress
                </h4>
                
                {/* Visual SVG chart to represent baseline progress curve vs actual */}
                <div className="h-44 relative bg-slate-50/50 rounded-lg p-2 flex flex-col justify-between border border-slate-100">
                  <svg className="w-full h-full absolute inset-0 text-indigo-100" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Baseline path */}
                    <path d="M0 90 L20 80 L40 60 L60 40 L80 20 L100 5" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="3,3" />
                    {/* Actual progress path */}
                    <path d="M0 90 L20 82 L40 65 L60 44 L72 35" fill="none" stroke="#4f46e5" strokeWidth="3" />
                    {/* Actual path points */}
                    <circle cx="20" cy="82" r="2" fill="#4f46e5" />
                    <circle cx="40" cy="65" r="2" fill="#4f46e5" />
                    <circle cx="60" cy="44" r="2" fill="#4f46e5" />
                    <circle cx="72" cy="35" r="3" fill="#6366f1" />
                  </svg>

                  {/* Chart legends */}
                  <div className="z-10 flex justify-between items-start text-[10px] text-slate-400 font-mono">
                    <span>Q1 2026</span>
                    <span>Q2 2026 (Elapsed)</span>
                    <span>Q3 2026</span>
                    <span>Q4 2026 (Target)</span>
                  </div>

                  <div className="z-10 flex justify-end gap-4 text-[10px] font-mono font-semibold">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-indigo-500 border border-dashed border-indigo-500" />
                      <span className="text-slate-500">Planned (IFC4)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-indigo-600" />
                      <span className="text-slate-900">Actual (BuildTrace CV)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Program Level Critical Risk Alerts */}
              <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col gap-3">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                  Executive Program Interventions Needed
                </span>

                <div className="flex flex-col gap-2 text-xs">
                  <div className="bg-slate-850 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-300">Whitefield Steel Supply Shortage Alert</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Rebar procurement delays of structural steel Grade Fe 550D.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-900 uppercase font-mono font-bold">
                      Critical Path
                    </span>
                  </div>

                  <div className="bg-slate-850 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-300">RERA Schedule Variance Notice</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">L1 structure is currently trending 3 days behind our registered KA-RERA baseline.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-900 uppercase font-mono font-bold">
                      Medium Alert
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 2: CLIENT DASHBOARD (Simplified Status)
              ======================================================== */}
          {activeSubTab === "client" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-black text-slate-900">Client Transparency Dashboard</h3>
                <p className="text-[11px] text-slate-500">Accessible project progress metrics for Whitefield block buyers and investors.</p>
              </div>

              {/* Greeting Header */}
              <div className="bg-indigo-900 text-white p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-bold text-sm">Dear Investor / Client</h4>
                  <p className="text-indigo-200 text-[11px] mt-1 max-w-md leading-relaxed">
                    Welcome to your BuildTrace progress dashboard. Below you will find simplified, verified site tracking data synchronised directly from our drone camera scans.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-indigo-300 font-mono font-bold block uppercase">Verified RERA Status</span>
                  <span className="text-lg font-black font-mono">KA-RERA COMPLIANT</span>
                </div>
              </div>

              {/* Client Timeline HUD */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-black uppercase font-mono">Concrete Shell Stage</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Level 1 Slab Cast</span>
                    <span className="text-emerald-600 font-bold font-mono">Completed</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-full" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-black uppercase font-mono">MEP Services Stage</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Floor Conduit Mains</span>
                    <span className="text-indigo-600 font-bold font-mono">75% Complete</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-3/4" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-black uppercase font-mono">Masonry & Framing Stage</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Internal Drywalls</span>
                    <span className="text-slate-400 font-bold font-mono">Pending Structure</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-slate-300 h-full w-0" />
                  </div>
                </div>
              </div>

              {/* 3D Sync Verification Gallery */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Verified Photogrammetry Proof Stream
                </span>
                <p className="text-slate-500 text-[11px]">
                  Actual site imagery compared directly against the BIM design schema to ensure transparency.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                  <div className="bg-slate-50 p-2 border border-slate-100 rounded-lg">
                    <div className="aspect-video bg-slate-900 rounded flex items-center justify-center text-slate-500 text-[10px] font-mono relative overflow-hidden">
                      <span className="absolute left-2 top-2 bg-slate-950/80 text-[8px] text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold">
                        BIM Design Projection
                      </span>
                      <Building2 className="w-8 h-8 text-indigo-500/20" />
                      <span className="absolute bottom-2 text-[9px] text-slate-400">Column C4 Wireframe CAD Overlay</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2 border border-slate-100 rounded-lg">
                    <div className="aspect-video bg-slate-900 rounded flex items-center justify-center text-slate-500 text-[10px] font-mono relative overflow-hidden">
                      <span className="absolute left-2 top-2 bg-indigo-600 text-[8px] text-white px-1.5 py-0.5 rounded uppercase font-bold">
                        Drone Capture Week 3
                      </span>
                      <CloudLightning className="w-8 h-8 text-amber-500/20" />
                      <span className="absolute bottom-2 text-[9px] text-slate-400">YOLO-v8 Instance Seg. Photo Overlay</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 3: DAILY PROGRESS REPORT
              ======================================================== */}
          {activeSubTab === "daily" && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-5 animate-fade-in text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Shift Log: Daily</span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">Daily Progress Report</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Shift: Day Shift | Date: 2026-07-09</p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>Report ID: BTP-DR-4958</span>
                </div>
              </div>

              {/* Day Quick Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Weather Constraint</span>
                  <span className="font-bold text-slate-700 block mt-1">Light Wet Rain / Intermittent</span>
                  <span className="text-[10px] text-slate-500">26°C | Winds 14 km/h</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Labor Headcount On Site</span>
                  <span className="font-bold text-slate-700 block mt-1">44 active workers</span>
                  <span className="text-[10px] text-rose-500 font-semibold">Shortage of 6 crew members</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Safety Metrics</span>
                  <span className="font-bold text-emerald-700 block mt-1">0 Incidents / Perfect compliance</span>
                  <span className="text-[10px] text-slate-500">PPE check 100% compliant</span>
                </div>
              </div>

              {/* Daily Quantities Installed */}
              <div className="flex flex-col gap-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Material Quantities Poured & Installed (Today)
                </span>
                
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-150 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[11px] font-mono border-b border-slate-200 pb-1.5">
                    <span className="font-bold text-slate-600">Material Type</span>
                    <span className="font-bold text-slate-600">Quantity Poured</span>
                    <span className="font-bold text-slate-600">BIM Variance</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-700">
                    <span>M35 Ready Mix Concrete (L1 Shear Walls)</span>
                    <span className="font-bold">45.0 m³</span>
                    <span className="text-emerald-600 font-bold">+1.5 m³ (Ahead)</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-700">
                    <span>Galvanized Steel Conduit (MEP service runs)</span>
                    <span className="font-bold">120.0 running meters</span>
                    <span className="text-slate-400">0.0 (On track)</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-700">
                    <span>Double Glazed Curtain Wall Units (Exterior)</span>
                    <span className="font-bold">0 units</span>
                    <span className="text-rose-500 font-bold">-4 units (Delayed)</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 4: WEEKLY REPORT
              ======================================================== */}
          {activeSubTab === "weekly" && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-5 animate-fade-in text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Weekly Program Audit</span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">Weekly Progress Report</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Week 12 | Date Range: July 02 - July 09, 2026</p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>Report ID: BTP-WR-012</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col gap-2">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono">Cumulative Weekly Variance</span>
                  <span className="text-xl font-bold text-indigo-900 leading-tight">3 Days Behindregistered RERA Timeline</span>
                  <p className="text-slate-600 text-[11px]">
                    Although rainfall impacted exterior glazing installation, core concrete horizontal cast works regained 1.5 days due to second-shift overtime deployment.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Subcontractor Coordination Status</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-700">88.5% Aligned</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold rounded">Optimal</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Central coordination index remains resilient. Clash solver resolved structural conflicts prior to installation handover.
                  </p>
                </div>
              </div>

              {/* Weekly milestone outcomes */}
              <div className="flex flex-col gap-2.5">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Weekly Milestone Breakdown
                </span>

                <div className="flex flex-col gap-2">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="font-bold text-slate-700">Slab cast Level 1 Area A</span>
                    </div>
                    <span className="font-mono text-slate-500">Achieved: July 05</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      <span className="font-bold text-slate-700">MEP conduit containment routing L1 Zone B</span>
                    </div>
                    <span className="font-mono text-amber-600 font-semibold">Active In Progress</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-slate-400 rounded-full" />
                      <span className="font-bold text-slate-400">Glazing unit installation L1 West Façade</span>
                    </div>
                    <span className="font-mono text-rose-500 font-semibold">Postponed (Storm warning)</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 5: MONTHLY REPORT
              ======================================================== */}
          {activeSubTab === "monthly" && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-5 animate-fade-in text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Monthly Program Ledger</span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">Monthly Milestone & Financial Report</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Month: July 2026 | Financial Year: FY 2026-27</p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>Report ID: BTP-MR-2026-07</span>
                </div>
              </div>

              {/* Financial billing Drawdown summary */}
              <div className="bg-indigo-950 text-white p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase">Monthly Cashflow billing Drawdown</span>
                  <span className="text-2xl font-black font-mono block text-white mt-1">₹1.45 Crores</span>
                  <span className="text-[10px] text-slate-400">Audited against physical spatial volume verification</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2 rounded text-[11px] font-mono">
                  <span className="text-slate-500 block">Total Project Billing to Date:</span>
                  <span className="font-bold text-emerald-400">₹13.3 Crores / ₹18.5 Crores</span>
                </div>
              </div>

              {/* RERA Milestone Alignment */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-mono">
                  RERA Legal Compliance & Milestone Alignment
                </span>

                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Overall Foundation Works</span>
                    <span className="text-emerald-600 font-bold">100% Certified</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-full" />
                  </div>

                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="font-bold text-slate-700">L1 - L4 Structural Frame Extrusion</span>
                    <span className="text-indigo-600 font-bold">68% Complete</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-2/3" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 6: DELAY INCIDENT REPORT
              ======================================================== */}
          {activeSubTab === "delay" && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-5 animate-fade-in text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Incident Registry</span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">Active Delay Report</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Incident diagnostics, calculated critical float impact, and mitigations.</p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>Report ID: BTP-DL-008</span>
                </div>
              </div>

              {/* Table list of delay incidents */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase font-mono text-[9px] pb-2">
                      <th className="pb-2">Incident / Code</th>
                      <th className="pb-2">Root Cause</th>
                      <th className="pb-2 text-center">Delay Impact</th>
                      <th className="pb-2">Mitigation Action Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="py-2.5">
                        <span className="font-bold text-slate-900 block text-xs">Rebar Spacing Discrepancy</span>
                        <span className="text-[10px] text-slate-400">#INC-REBAR-04</span>
                      </td>
                      <td className="py-2.5 text-slate-600 text-[11px]">Sub-contractor structural draw misinterpret.</td>
                      <td className="py-2.5 text-center text-rose-600 font-bold">+2.5 Days</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold uppercase text-[9px]">
                          Mitigation Active
                        </span>
                      </td>
                    </tr>

                    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="py-2.5">
                        <span className="font-bold text-slate-900 block text-xs">HVAC Branch Duct Collision</span>
                        <span className="text-[10px] text-slate-400">#INC-MEP-09</span>
                      </td>
                      <td className="py-2.5 text-slate-600 text-[11px]">MEP 3D spatial collision with sprinkler pipe.</td>
                      <td className="py-2.5 text-center text-rose-600 font-bold">+1.5 Days</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold uppercase text-[9px]">
                          Resolved in BIM
                        </span>
                      </td>
                    </tr>

                    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="py-2.5">
                        <span className="font-bold text-slate-900 block text-xs">Storm/Rain Outage L1 Core</span>
                        <span className="text-[10px] text-slate-400">#INC-WTH-02</span>
                      </td>
                      <td className="py-2.5 text-slate-600 text-[11px]">Safety lockout during severe wind alert.</td>
                      <td className="py-2.5 text-center text-rose-600 font-bold">+4.0 Days</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded font-bold uppercase text-[9px]">
                          Monitored
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 7: TRADE PERFORMANCE LOG
              ======================================================== */}
          {activeSubTab === "trade" && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-5 animate-fade-in text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Contractor Audits</span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">Trade Performance Report</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Assessment of sub-contractor headcounts, schedule compliance, and safety ratings.</p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>Report ID: BTP-TP-048</span>
                </div>
              </div>

              {/* Subcontractor Cards Leaderboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2.5">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-bold text-slate-800 text-xs">Vajra Concrete Corp.</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Concrete & Structural Shell works</span>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[9px] font-bold rounded-full">
                      Primary Trade
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                    <div>Crew strength: <strong className="text-slate-800">18/20</strong></div>
                    <div>Schedule sync: <strong className="text-slate-800">92%</strong></div>
                    <div>Incident rate: <strong className="text-emerald-600">0.0</strong></div>
                    <div>Audit Rating: <strong className="text-indigo-600">4.8/5.0</strong></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2.5">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-bold text-slate-800 text-xs">Sterling MEP Projects</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Electrical, Fire & HVAC Piping</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold rounded-full">
                      Primary Trade
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                    <div>Crew strength: <strong className="text-slate-800">14/14</strong></div>
                    <div>Schedule sync: <strong className="text-slate-800">96%</strong></div>
                    <div>Incident rate: <strong className="text-emerald-600">0.0</strong></div>
                    <div>Audit Rating: <strong className="text-indigo-600">4.9/5.0</strong></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2.5">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-bold text-slate-800 text-xs">Falcon Architectural Exterior</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Glazing, cladding & exterior paint</span>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-mono text-[9px] font-bold rounded-full">
                      Struggling
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                    <div>Crew strength: <strong className="text-slate-800">6/10</strong></div>
                    <div>Schedule sync: <strong className="text-rose-600 font-bold">54%</strong></div>
                    <div>Incident rate: <strong className="text-emerald-600">0.0</strong></div>
                    <div>Audit Rating: <strong className="text-rose-600 font-bold">3.2/5.0</strong></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2.5">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-bold text-slate-800 text-xs">Apex Interiors & Finishes</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Drywall, framing, tiling</span>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-mono text-[9px] font-bold rounded-full">
                      Not Started
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                    <div>Crew strength: <strong className="text-slate-800">0/0</strong></div>
                    <div>Schedule sync: <strong className="text-slate-400">0%</strong></div>
                    <div>Incident rate: <strong className="text-slate-400">0.0</strong></div>
                    <div>Audit Rating: <strong className="text-slate-400">N/A</strong></div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 8: PRODUCTIVITY REPORT
              ======================================================== */}
          {activeSubTab === "productivity" && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-5 animate-fade-in text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Resource Metrics</span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">Crew Productivity Analysis</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Analysis of active man-hours, idle multipliers, and work-front utilization factors.</p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>Report ID: BTP-PR-9392</span>
                </div>
              </div>

              {/* Productivity Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Installed concrete / man-hour</span>
                  <span className="text-lg font-bold text-slate-700 block mt-1">2.1 m³ / man-hour</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">+8% above standard baseline</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Average Conduit runs / man-hour</span>
                  <span className="text-lg font-bold text-slate-700 block mt-1">5.8 meters / man-hour</span>
                  <span className="text-[10px] text-slate-500">Matches planned engineering model speed</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Average Glazing / man-hour</span>
                  <span className="text-lg font-bold text-slate-400 block mt-1">0.0 meters (Outage delay)</span>
                  <span className="text-[10px] text-rose-500 font-semibold">Rain related delays on exterior scaffolding</span>
                </div>
              </div>

              {/* Idle Time Root Causes Breakdown */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 flex flex-col gap-3">
                <span className="text-[10px] text-slate-400 font-black uppercase font-mono tracking-wider">
                  Measured Crew Idle Time Factor (Weekly Aggregate)
                </span>
                
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Weather delay stand-down:</span>
                    <span className="font-mono font-bold text-rose-500">14.5% (Severe wind & precipitation)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[14.5%]" />
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <span className="font-semibold text-slate-700">MEP Spatial Clash adjustment wait:</span>
                    <span className="font-mono font-bold text-amber-500">6.2% (Sub-contractor coordination gap)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[6.2%]" />
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <span className="font-semibold text-slate-700">Material re-supply lag:</span>
                    <span className="font-mono font-bold text-slate-500">3.1% (Late delivery of drywall metal studs)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-slate-500 h-full w-[3.1%]" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 9: REPORT DISTRIBUTION CONFIGURATION (Scheduler & Emails)
              ======================================================== */}
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
                      <option value="Daily Progress Report">Daily Progress Report</option>
                      <option value="Weekly Report">Weekly Report</option>
                      <option value="Monthly Milestone Report">Monthly Milestone Report</option>
                      <option value="Executive Dashboard Report">Executive Dashboard Report</option>
                      <option value="Incident & Delay Report">Incident & Delay Report</option>
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
                      className="bg-slate-50 border border-slate-200 rounded p-2 text-xs font-semibold text-slate-700 focus:outline-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add Distribution Schedule
                    </button>
                  </div>
                </form>
              </div>

              {/* Active list section */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Scheduled Automation Tasks
                </span>

                <div className="flex flex-col gap-2.5">
                  {schedules.map(sch => (
                    <div key={sch.id} className="bg-slate-50 border border-slate-150 p-3 rounded-lg flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md border ${sch.active ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-slate-200 text-slate-500 border-slate-300"}`}>
                          <Clock3 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 text-xs">{sch.reportType}</span>
                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-bold font-mono">
                              {sch.frequency}
                            </span>
                          </div>
                          <p className="text-slate-500 mt-0.5">To: <span className="font-semibold text-slate-700">{sch.recipient}</span> | Format: <span className="font-bold">{sch.format}</span> | Dispatch Time: <span className="font-semibold text-slate-700">{sch.timeOfDay}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Toggle switch */}
                        <button
                          onClick={() => handleToggleSchedule(sch.id)}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border transition ${
                            sch.active 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}
                        >
                          {sch.active ? "Active" : "Paused"}
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(sch.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instant Email Tester */}
              <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col gap-4">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono">Diagnostics & Trigger</span>
                  <h4 className="font-bold text-sm mt-0.5">Manual SMTP Distribution Trigger</h4>
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
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 font-bold text-white rounded-lg transition text-xs flex items-center gap-1.5"
                  >
                    <Send className={`w-3.5 h-3.5 ${emailSending ? "animate-spin" : ""}`} />
                    {emailSending ? "Transmitting..." : "Send Test Report"}
                  </button>
                </form>

                {emailSuccess && (
                  <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 p-2.5 rounded-lg text-[11px] leading-relaxed flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Success! Daily Progress Report transmission dispatched successfully to {emailInput} via SMTP (SES Pipeline ID #SMTP-BTP-93).</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              VIEW 10: REPORTING ARCHITECTURE (System Design)
              ======================================================== */}
          {activeSubTab === "architecture" && (
            <div className="flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] uppercase font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-mono">
                  Engine specifications
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">End-to-End Reporting Architecture</h3>
                <p className="text-xs text-slate-500 mt-1">
                  How our system captures spatial photogrammetry drone telemetry, aligns it over PostgreSQL/PostGIS, runs Monte Carlo estimators, and compiles automated PDFs.
                </p>
              </div>

              {/* System architecture flowchart (vector-styled bento block) */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Data Pipelines & Event Flow
                </span>

                <div className="flex flex-col gap-4">
                  {/* Step 1 */}
                  <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                      01
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">Drone & Photogrammetry Ingestion</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Weekly high-res aerial drone mapping uploads orthomosaics. YOLO-v8 instance segmentation algorithms label actual spatial concrete volume blocks and layout boundaries.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                      02
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">PostgreSQL Spatial Alignment (TimescaleDB)</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Spatial metadata is persisted in relational PostgreSQL database. Progress logs are written to high-performance timeseries tables to record daily crew counts, weather alerts, and trade installation speeds.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                      03
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">Stochastic & ML-Inspired Calculations</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Celery background tasks ingest actual timelines, evaluate meteorological alerts via forecast APIs, calculate Critical Path floats, and execute Monte Carlo simulations to model delay distributions.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                      04
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">Weasyprint HTML-to-PDF Compiling</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        A headless Python microservice triggers on distribution cron loops. It pulls template layouts, injects Recharts metrics as high-fidelity SVG graphics, compiles CSS, and formats final RERA compliant report attachments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
