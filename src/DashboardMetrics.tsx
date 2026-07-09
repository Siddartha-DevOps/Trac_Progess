import React from "react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { BIMElement, Anomaly, ProjectStats } from "./types";
import { Play, Pause, Calendar, Building, ShieldCheck, AlertCircle, TrendingUp, IndianRupee } from "lucide-react";

interface DashboardMetricsProps {
  stats: ProjectStats;
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  elements: BIMElement[];
  anomalies: Anomaly[];
}

export default function DashboardMetrics({
  stats,
  currentWeek,
  setCurrentWeek,
  elements,
  anomalies,
}: DashboardMetricsProps) {
  
  // Simulated historic trend analytics (Week 1 to Week 5)
  const progressHistoryData = [
    { name: "Week 1", "BIM Target %": 20, "Actual (CV Scan) %": 20, "Open Anomalies": 0, "Cost Impact (₹)": 0 },
    { name: "Week 2", "BIM Target %": 45, "Actual (CV Scan) %": 42, "Open Anomalies": 1, "Cost Impact (₹)": 15000 },
    { name: "Week 3", "BIM Target %": 70, "Actual (CV Scan) %": 62, "Open Anomalies": 2, "Cost Impact (₹)": 55000 },
    { name: "Week 4", "BIM Target %": 90, "Actual (CV Scan) %": 78, "Open Anomalies": 2, "Cost Impact (₹)": 120000 },
    { name: "Week 5", "BIM Target %": 100, "Actual (CV Scan) %": 92, "Open Anomalies": 1, "Cost Impact (₹)": 60000 },
  ];

  // Group anomalies by severity level for site reporting
  const severityDistribution = [
    { name: "Critical", count: anomalies.filter(a => a.level === "critical").length, fill: "#ef4444" },
    { name: "High", count: anomalies.filter(a => a.level === "high").length, fill: "#f97316" },
    { name: "Medium", count: anomalies.filter(a => a.level === "medium").length, fill: "#f59e0b" },
    { name: "Low", count: anomalies.filter(a => a.level === "low").length, fill: "#3b82f6" },
  ];

  // Statistics summaries based on active week selection
  const totalElementsForWeek = elements.filter(e => {
    const installWeek = parseInt(e.installationDate?.replace("Week ", "") || "1");
    return installWeek <= currentWeek;
  }).length;

  const completedElementsForWeek = elements.filter(e => {
    const installWeek = parseInt(e.installationDate?.replace("Week ", "") || "1");
    return installWeek <= currentWeek && e.status === "completed";
  }).length;

  const activeProgress = Math.round((completedElementsForWeek / elements.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Project Stage</span>
            <span className="text-sm font-bold text-slate-800 line-clamp-1">{stats.name}</span>
            <span className="text-[10px] text-slate-500 block font-mono">{stats.reraId}</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">AI Computed Progress</span>
            <span className="text-xl font-bold text-emerald-600">{activeProgress}%</span>
            <span className="text-[10px] text-slate-500 block">Vs 90% Central Plan</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CV Anomalies</span>
            <span className="text-xl font-bold text-red-600">{anomalies.filter(a => a.status === "open").length} Open</span>
            <span className="text-[10px] text-slate-500 block">1 Safety Critical Clashes</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">RERA Delay Risk</span>
            <span className="text-sm font-bold text-slate-800">₹1,20,000</span>
            <span className="text-[10px] text-red-500 block font-semibold">High Sequencing Penalty</span>
          </div>
        </div>

      </div>

      {/* Timeline Controls Segment */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Site Timeline Schedule Re-player</h4>
            <p className="text-[10px] text-slate-500">Slide to view actual photogrammetry point cloud alignment progression</p>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="flex-1 max-w-lg w-full flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Week 1</span>
          <input
            type="range"
            min="1"
            max="5"
            value={currentWeek}
            onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <span className="text-xs font-bold text-indigo-700 shrink-0 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
            Week {currentWeek} (Active)
          </span>
        </div>
      </div>

      {/* Main Charts Block (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Chart 1: BIM Baseline Vs actual photogrammetry Progress (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Cumulative Site Progress Track (BIM vs Scan)
              </h4>
              <p className="text-[10px] text-slate-400">Drone alignment computed progress over scheduled project lifecycle</p>
            </div>
            <div className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-md">
              Target Finish: {stats.targetDate}
            </div>
          </div>

          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: 10, fontFamily: "monospace" }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: 10, fontFamily: "monospace" }} unit="%" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="BIM Target %" stroke="#475569" strokeWidth={2} activeDot={{ r: 8 }} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="Actual (CV Scan) %" stroke="#4f46e5" strokeWidth={3.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: CV Anomalies Severity distribution (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between text-slate-800">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h4 className="text-xs font-bold text-slate-800">
              Anomalies Severity Log
            </h4>
            <p className="text-[10px] text-slate-400">Computer Vision automated audit grouping</p>
          </div>

          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityDistribution} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 p-2 rounded leading-relaxed text-center">
            ⚠️ <strong>Predictive Analytics Warning:</strong> High spatial clash rate on L1 Zone B risks delaying ceiling drywalls by 8 days.
          </div>
        </div>

      </div>

    </div>
  );
}
