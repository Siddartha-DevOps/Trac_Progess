import React, { useState, useRef } from "react";
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  ArrowUpRight, 
  Briefcase, 
  Zap, 
  Sparkles,
  Layers,
  ChevronRight,
  Activity,
  Upload,
  FileCode,
  FileText,
  Video,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock3,
  RefreshCw,
  Search,
  Check,
  Percent,
  Plus,
  Compass,
  ArrowDownRight,
  Sparkle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { useAppStore } from "../store";
import AIInsightsComponent from "./AIInsightsComponent";
import TracProgressDashboardView from "./TracProgressDashboardView";
import { getProjectWorkspace } from "../data";

export default function DashboardView() {
  const { activeProject, setActiveTab, currentWeek, isTracProgressMode } = useAppStore();

  if (isTracProgressMode) {
    return <TracProgressDashboardView />;
  }

  const workspace = getProjectWorkspace(activeProject.id);
  const PROGRESS_TREND_DATA = workspace.progressTrendData;
  const BUDGET_TRADE_DATA = workspace.budgetTradeData;
  const DISCREPANCY_DATA = workspace.discrepancyData;

  const [filterTrade, setFilterTrade] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Interactive Upload Simulator states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentUploads, setRecentUploads] = useState(workspace.recentUploads);

  // Interactive local issue list state to allow users to "resolve" directly on the dashboard
  const [dashboardIssues, setDashboardIssues] = useState(workspace.dashboardIssues);

  // Sync state when active project changes
  React.useEffect(() => {
    setRecentUploads(workspace.recentUploads);
    setDashboardIssues(workspace.dashboardIssues);
  }, [activeProject.id]);

  // Handle local simulation of resolving issues
  const resolveIssueLocally = (id: string) => {
    setDashboardIssues(prev => prev.map(issue => 
      issue.id === id ? { ...issue, status: "Resolved" } : issue
    ));
  };

  // Simulated file upload triggers
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setIsUploading(true);
      setUploadProgress(10);
      
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsUploading(false);
              const newFile: { id: string; name: string; type: "video" | "laser" | "cad" | "report"; size: string; date: string; uploader: string; status: string } = {
                id: `up-${Date.now()}`,
                name: file.name,
                type: (file.name.endsWith(".ifc") ? "cad" : file.name.endsWith(".mp4") ? "video" : file.name.match(/\.(jpg|jpeg|png)$/i) ? "video" : "laser") as "video" | "laser" | "cad" | "report",
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                date: "Just now",
                uploader: "Staff Operator (You)",
                status: "Processed"
              };
              setRecentUploads(prevUploads => [newFile, ...prevUploads]);
            }, 500);
            return 100;
          }
          return prev + 15;
        });
      }, 150);
    }
  };

  // Filter issues based on trade selection & search
  const filteredIssues = dashboardIssues.filter(issue => {
    const matchesTrade = filterTrade === "All" || issue.category === filterTrade;
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrade && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-slate-800" id="project-dashboard">
      
      {/* 1. Header Welcome & Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden">
        {/* Abstract design elements in backdrop */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
              TracProgress Enterprise Center
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
              RERA Compliant
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {activeProject.name} Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Current Stage: <span className="text-slate-200 font-semibold">Level 1 Structural Slab Curing</span> • Location: <span className="text-slate-200">{activeProject.location}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10 shrink-0">
          <button 
            onClick={() => setActiveTab("bim-models")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-[0_2px_4px_rgba(79,70,229,0.25)] border border-indigo-500 hover:scale-[1.02]"
          >
            <span>Launch IFC BIM Viewer</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setActiveTab("site-progress")}
            className="px-4 py-2 bg-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-bold hover:bg-slate-750 transition-all flex items-center gap-1.5 border border-slate-700 hover:scale-[1.02]"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Historical Drone Player</span>
          </button>
        </div>
      </div>

      {/* 2. PRIMARY ENTERPRISE KPI CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Physical Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between relative group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Physical Progress</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{activeProject.overallProgress}%</span>
                <span className="text-[10px] text-emerald-600 font-bold font-mono">Wk {currentWeek}</span>
              </div>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          
          {/* Progress Mini Visual Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3.5">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${activeProject.overallProgress}%` }} />
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              +4.8% <span className="text-slate-400 font-normal">vs target threshold</span>
            </span>
            <span className="text-slate-400 font-mono">Stage 3 of 12</span>
          </div>
        </div>

        {/* KPI 2: Predicted Delay */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Predicted Delay Slip</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-red-600 font-mono tracking-tight">8 Days</span>
                <span className="text-[9px] bg-red-50 text-red-700 px-1.5 py-0.2 rounded border border-red-200 font-bold uppercase tracking-wide">Critical</span>
              </div>
            </div>
            <div className="p-2.5 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-all">
              <Clock className="w-4 h-4 animate-spin-slow" />
            </div>
          </div>

          {/* Forecast alignment deviation ticker */}
          <p className="text-[10.5px] text-slate-500 leading-snug mt-3">
            L2 Structural Concrete Column cast lagging schedule.
          </p>

          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
            <span className="text-red-600 font-semibold">2 Critical Slabs Blocked</span>
            <button 
              onClick={() => setActiveTab("ai-analysis")}
              className="text-indigo-600 font-extrabold hover:underline flex items-center gap-0.5"
            >
              <span>Remediate</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 3: RERA Compliance / Project Health */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Project Health Index</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">96.5%</span>
                <span className="text-[9px] text-emerald-600 font-bold">Stable</span>
              </div>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* RERA info */}
          <div className="flex items-center gap-1.5 mt-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10.5px] font-mono text-slate-600 font-bold">{activeProject.reraId}</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
            <span className="text-emerald-600 font-bold">100% Audit Complete</span>
            <span className="text-slate-400 font-mono">Next Audit: July 15</span>
          </div>
        </div>

        {/* KPI 4: Financial Budget */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Committed Capital</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">₹13.4 Cr</span>
                <span className="text-[10px] text-slate-400 font-mono">spent</span>
              </div>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>

          {/* Total Budget Meter Progress */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3.5">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: "72.4%" }} />
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
            <span className="text-slate-500">Contract Ceiling: <strong className="text-slate-800">{activeProject.totalCost}</strong></span>
            <span className="text-emerald-600 font-bold font-mono">On Budget</span>
          </div>
        </div>

      </div>

      {/* 3. CORE ANALYTICS CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Earned Value Progress & Schedule Curve (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Earned Value Progress Curve (Planned vs Scan Actual)
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Continuous integration comparing planned CAD Gantt dates with computerized photogrammetry scan results.</p>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-200" /> Planned Curve</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600" /> Scan Actual</span>
            </div>
          </div>

          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PROGRESS_TREND_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c7d2fe" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#c7d2fe" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="%" domain={[40, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155", color: "#fff" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Area type="monotone" name="Planned Progress" dataKey="planned" stroke="#a5b4fc" strokeWidth={2} fillOpacity={1} fill="url(#plannedGrad)" />
                <Area type="monotone" name="Scan Actual" dataKey="actual" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#actualGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg flex justify-between items-center text-[10.5px] mt-4 font-mono text-slate-500">
            <span>Overall Variance: <strong className="text-red-500">-2.6% (Behind Schedule)</strong></span>
            <span>Scan Confidence Index: <strong className="text-emerald-600">99.42% Verified</strong></span>
          </div>
        </div>

        {/* Right: Discrepancy Matrix by Trade (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-indigo-500" />
              Computer Vision Variance Matrix
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Open vs Resolved physical site defects mapped by computer vision.</p>
          </div>

          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISCREPANCY_DATA} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155", color: "#fff" }} />
                <Legend verticalAlign="top" height={36} iconType="square" wrapperStyle={{ fontSize: "10px", fontWeight: "600" }} />
                <Bar name="Resolved Items" dataKey="resolved" stackId="a" fill="#10b981" />
                <Bar name="Outstanding Discrepancy" dataKey="outstanding" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-[9.5px] text-center font-bold text-indigo-600 mt-4 uppercase tracking-wider">
            Average Resolution Speed: 1.8 Days / Issue
          </div>
        </div>

      </div>

      {/* 4. BUDGET ALLOCATION VS SPENT CHART */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              Budget Performance & Trade Cash Flow (₹ in Lakhs)
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Compares budgeted contractual thresholds with actual committed/spent accounts per major project trade.</p>
          </div>
          <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-500 uppercase font-bold">
            Audit Grade Reports
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-center">
          <div className="lg:col-span-8 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BUDGET_TRADE_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155", color: "#fff" }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "10px", fontWeight: "600" }} />
                <Bar name="Budget Allocation" dataKey="budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar name="Actual Committed" dataKey="actual" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3">
            <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">Financial Compliance Health</span>
            
            <div className="space-y-2">
              <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg flex justify-between items-center text-xs">
                <span className="text-slate-500">Cost Variance (CV):</span>
                <span className="font-mono font-bold text-emerald-600">-₹16 Lakhs (Under ceiling)</span>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg flex justify-between items-center text-xs">
                <span className="text-slate-500">Cost Performance Index (CPI):</span>
                <span className="font-mono font-bold text-indigo-600">1.03 CPI (Optimal)</span>
              </div>
              <div className="bg-red-50 border border-red-200/50 p-2.5 rounded-lg text-[10px] text-red-800 flex items-start gap-1.5 leading-normal">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Structure Trade Slip:</strong> Concrete overruns on Level 1 columns have incurred +₹30 Lakhs vs estimated cost due to re-pour tasks on Column C4 alignment issues.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI COMPUTER VISION & PREDICTIVE INSIGHTS COMPONENT */}
      <AIInsightsComponent />

      {/* 5. MULTI-TAB GRID: TRADES LEDGER & RECENT SITE ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Trades Ledger Panel (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-500" />
                Active Site Trades Ledger
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Operational headcount and performance rate maps calculated via daily site entry logs.</p>
            </div>
            <span className="text-[10px] font-mono text-indigo-600 font-extrabold bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">
              342 Workers Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase text-[9px] font-mono">
                  <th className="py-2.5">Trade Sector</th>
                  <th className="py-2.5">Subcontractor</th>
                  <th className="py-2.5">Headcount</th>
                  <th className="py-2.5">Weekly Output Rate</th>
                  <th className="py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 font-semibold text-slate-950 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Structural Concrete
                  </td>
                  <td className="py-3">L&T Infrastructure</td>
                  <td className="py-3 font-mono font-bold text-slate-800">142 men</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span>96%</span>
                      <div className="w-12 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[96%]" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Optimal</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 font-semibold text-slate-950 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    MEP & Firefighting
                  </td>
                  <td className="py-3">Sterling & Wilson</td>
                  <td className="py-3 font-mono font-bold text-slate-800">88 men</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-red-500">62%</span>
                      <div className="w-12 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full w-[62%]" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">Behind</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 font-semibold text-slate-950 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    HVAC Ducting Services
                  </td>
                  <td className="py-3">Voltas Ltd</td>
                  <td className="py-3 font-mono font-bold text-slate-800">45 men</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-amber-500">78%</span>
                      <div className="w-12 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-[78%]" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">Warning</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 font-semibold text-slate-950 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Interior Drywalls
                  </td>
                  <td className="py-3">Gyproc Saint-Gobain</td>
                  <td className="py-3 font-mono font-bold text-slate-800">67 men</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-400">15%</span>
                      <div className="w-12 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-slate-400 h-full w-[15%]" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200">Idle</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Chronological Site Activities Stream (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-500" />
              Chronological Audit Activity Log
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Continuous ledger of drone orthomosaics and IFC file revisions.</p>
          </div>

          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Log item 1 */}
            <div className="flex gap-3 text-xs">
              <div className="flex flex-col items-center">
                <span className="p-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-150">
                  <Upload className="w-3 h-3" />
                </span>
                <div className="w-0.5 bg-slate-200 flex-1 my-1" />
              </div>
              <div>
                <span className="font-extrabold text-slate-850 block">New Drone Flight Photogrammetry Synced</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">By Autobot autonomous station • 10:14 AM</span>
              </div>
            </div>

            {/* Log item 2 */}
            <div className="flex gap-3 text-xs">
              <div className="flex flex-col items-center">
                <span className="p-1 rounded bg-red-50 text-red-600 border border-red-150">
                  <AlertTriangle className="w-3 h-3" />
                </span>
                <div className="w-0.5 bg-slate-200 flex-1 my-1" />
              </div>
              <div>
                <span className="font-extrabold text-slate-850 block">Critical Spatial Defect Logged on C4</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Shift of +42mm detected on Level 1 structural columns • Yesterday</span>
              </div>
            </div>

            {/* Log item 3 */}
            <div className="flex gap-3 text-xs">
              <div className="flex flex-col items-center">
                <span className="p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-150">
                  <CheckCircle2 className="w-3 h-3" />
                </span>
                <div className="w-0.5 bg-slate-200 flex-1 my-1" />
              </div>
              <div>
                <span className="font-extrabold text-slate-850 block">RERA Compliant Stage 1 Approved</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Certified by Lead structural inspector • 3 days ago</span>
              </div>
            </div>

          </div>

          <button 
            onClick={() => setActiveTab("activities")}
            className="text-center w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition mt-4 uppercase tracking-wider"
          >
            Open All Activities Logs
          </button>
        </div>

      </div>

      {/* 6. RECENT RAW SCANS UPLOAD AND DROPZONE COMPONENT */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-5">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-150 pb-3">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-500" />
              Site Scan Raw Data Upload center
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Simulate uploading Point Cloud LAS datasets, orthophotos, thermal telemetry, or CAD IFC revisions.
            </p>
          </div>
          
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              isUploading 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-indigo-600 text-white hover:bg-indigo-750 shadow-sm"
            }`}
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing... {uploadProgress}%</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Simulate Upload</span>
              </>
            )}
          </button>

          {/* Hidden HTML input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".las,.laz,.ifc,.pdf,.mp4,.png,.jpg"
          />
        </div>

        {/* Dropzone mockup */}
        <div 
          onClick={handleUploadClick}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-8 bg-slate-50/50 hover:bg-slate-50 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="p-3 bg-white rounded-full shadow-sm border border-slate-150 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-indigo-600" />
          </div>
          <h4 className="text-xs font-bold text-slate-800">
            Click to select or drag and drop raw files
          </h4>
          <p className="text-[10px] text-slate-400 max-w-sm">
            Supports computer-vision photogrammetry LAS, LAZ point clouds, BIM IFC schemas, MP4 video streams, or PDF site compliance journals (Max 5GB)
          </p>
        </div>

        {/* Recent Uploaded Files List */}
        <div className="space-y-2.5">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">
            Process Logs ({recentUploads.length} files tracked)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recentUploads.map((file) => (
              <div 
                key={file.id} 
                className="bg-white border border-slate-150 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-350 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-150 text-slate-500 shrink-0">
                    {file.type === "laser" && <Compass className="w-4 h-4 text-emerald-600" />}
                    {file.type === "cad" && <FileCode className="w-4 h-4 text-indigo-600" />}
                    {file.type === "video" && <Video className="w-4 h-4 text-amber-600" />}
                    {file.type === "report" && <FileText className="w-4 h-4 text-slate-600" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate block group-hover:text-indigo-600 transition-colors">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {file.size} • Uploaded {file.date} by <strong className="text-slate-600 font-normal">{file.uploader}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase ${
                    file.status === "Processed" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}>
                    {file.status}
                  </span>
                  
                  <button 
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded"
                    title="Download Raw File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 7. RECENT QUALITY ISSUES TRACKER TABLE WITH RESOLUTIONS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-150 pb-3.5 mb-4">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-indigo-500" />
              Critical Quality Deviations Tracker
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Physical discrepancies mapped from recent scans. Filter by Trade or search for resolved items.
            </p>
          </div>

          {/* Quick controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issue or engineer..."
                className="pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-44"
              />
            </div>
            
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {["All", "Structure", "MEP"].map((trade) => (
                <button
                  key={trade}
                  onClick={() => setFilterTrade(trade)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                    filterTrade === trade 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {trade}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Issues List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase text-[9px] font-mono">
                <th className="py-2.5 pl-1">Issue ID</th>
                <th className="py-2.5">Deviation Title</th>
                <th className="py-2.5">Trade</th>
                <th className="py-2.5">Assigned To</th>
                <th className="py-2.5">Severity</th>
                <th className="py-2.5 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pl-1 font-bold font-mono text-slate-900 uppercase">
                      {issue.id}
                    </td>
                    <td className="py-3">
                      <div>
                        <span className={`font-semibold block ${issue.status === "Resolved" ? "line-through text-slate-400" : "text-slate-950"}`}>
                          {issue.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Detected on {issue.date}, 2026
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-slate-100 border border-slate-200 text-slate-500">
                        {issue.category}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">
                      {issue.assignedTo}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                        issue.priority === "Critical" 
                          ? "bg-red-50 text-red-700 border-red-200" 
                          : issue.priority === "High"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-1">
                      {issue.status === "Resolved" ? (
                        <span className="text-emerald-600 font-bold text-[10px] flex items-center justify-end gap-1 font-mono">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          RESOLVED
                        </span>
                      ) : (
                        <button
                          onClick={() => resolveIssueLocally(issue.id)}
                          className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 hover:text-white border border-indigo-200 hover:bg-indigo-600 hover:border-indigo-700 rounded transition shadow-sm"
                        >
                          Resolve Issue
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No active quality issues found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 pt-3.5 mt-4.5 flex justify-between items-center">
          <span className="text-[10px] text-slate-400 font-mono">
            *Resolving issues automatically updates RERA compliance indices.
          </span>
          
          <button 
            onClick={() => setActiveTab("issues")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Open All Site Issues ({dashboardIssues.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
