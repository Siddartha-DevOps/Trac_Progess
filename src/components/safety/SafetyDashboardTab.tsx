import React from "react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck,
  Users, 
  Flame, 
  AlertOctagon, 
  CheckCircle, 
  TrendingUp, 
  Sparkles, 
  FileText,
  Clock,
  AlertTriangle,
  Activity,
  Award,
  ThumbsUp,
  UserCheck,
  UserMinus,
  HelpCircle
} from "lucide-react";
import { motion } from "motion/react";
import { useSafety } from "./useSafetyHooks";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SafetyDashboardTab() {
  const { kpis, insights, trends, alerts, markAlertRead } = useSafety();

  // Safety Score Color
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 75) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    return "text-rose-500 border-rose-500/20 bg-rose-500/5";
  };

  // Helper colors for different KPI blocks
  const getPpeMissingColor = (count: number) => {
    return count > 0 
      ? "text-rose-500 border-rose-200 bg-rose-50/50" 
      : "text-slate-500 border-slate-100 bg-white";
  };

  const getAlertsColor = (count: number, activeClass: string, zeroClass: string) => {
    return count > 0 ? activeClass : zeroClass;
  };

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Live Warnings HUD Banner */}
      {alerts.filter(a => !a.read).length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-rose-500/10 text-rose-600 font-bold px-2 py-0.5 rounded font-mono border border-rose-500/20 animate-pulse">
              LIVE ANOMALY WARNINGS
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Real-time Computer Vision telemetry feed</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.filter(a => !a.read).slice(0, 2).map((alert) => (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-xl p-3.5 flex justify-between items-start gap-3 transition shadow-xs ${
                  alert.severity === "Critical" 
                    ? "bg-rose-50 border-rose-200/80 text-rose-900" 
                    : "bg-amber-50 border-amber-200/80 text-amber-900"
                }`}
              >
                <div className="flex gap-2.5">
                  <div className={`p-2 rounded-lg shrink-0 ${alert.severity === "Critical" ? "bg-rose-600 text-white" : "bg-amber-500 text-white"}`}>
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-tight">{alert.title}</h5>
                    <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{alert.message}</p>
                    <span className="text-[9px] opacity-75 font-mono block mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.timestamp}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => markAlertRead(alert.id)}
                  className="px-2 py-1 bg-white/80 hover:bg-white text-[10px] font-bold rounded border shadow-xs text-slate-700 shrink-0 uppercase tracking-wider"
                >
                  Clear Hook
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Row 1: Primary Score & Weekly Trends */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
      >
        {/* Today's Safety Score Card */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className={`lg:col-span-4 border rounded-2xl p-6 flex flex-col justify-between shadow-xs transition duration-200 ${getScoreColor(kpis.todaysSafetyScore)}`}
        >
          <div className="flex justify-between items-start border-b border-current/15 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase font-mono tracking-wider block opacity-70">Today's Safety Score</span>
              <span className="text-[9px] font-mono block opacity-60">Calculated from site-wide active threats</span>
            </div>
            <Award className="w-6 h-6" />
          </div>

          <div className="my-6 text-center">
            <span className="text-6xl font-black font-mono tracking-tight">{kpis.todaysSafetyScore}</span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest block mt-2">HSE INDEX RATIO</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono opacity-85">
              <span>MIN THRESHOLD: 75%</span>
              <span>RATING: {kpis.todaysSafetyScore >= 90 ? "EXCELLENT" : kpis.todaysSafetyScore >= 75 ? "GOOD" : "CRITICAL"}</span>
            </div>
            <div className="w-full bg-slate-200/40 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-current rounded-full transition-all duration-500" style={{ width: `${kpis.todaysSafetyScore}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Weekly Safety Trend Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono tracking-wider">HSE Analytics Engine</span>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-0.5">Weekly Safety Trend</h4>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>+2.4% THIS WEEK</span>
              </div>
            </div>

            <div className="h-[155px] mt-4 w-full font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" stroke="#94a3b8" />
                  <YAxis domain={[80, 100]} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#f8fafc" }}
                    labelClassName="text-[10px] font-bold text-slate-400"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#complianceGradient)" 
                    name="Compliance %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[10.5px] text-slate-400 leading-normal font-sans pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Weekly standard safety compliance continues consistent incline of +4.8% following AI drone patrols.</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Workforce & PPE Compliance Matrix Header */}
      <div className="border-b border-slate-100 pb-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Workforce &amp; PPE Compliance Matrix</h4>
      </div>

      {/* Row 2: Personnel & Attire Metrics */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {/* Total Workers */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-350 transition duration-150"
        >
          <div className="flex justify-between items-start border-b border-slate-100 pb-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider">Total Workers</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 font-mono">{kpis.totalWorkers}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Operators Active On-site</span>
          </div>
          <div className="text-[9.5px] font-mono text-indigo-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            <span>Across {kpis.activeSubcontractors} Subcontractors</span>
          </div>
        </motion.div>

        {/* Workers Wearing PPE */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-350 transition duration-150"
        >
          <div className="flex justify-between items-start border-b border-slate-100 pb-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider">Workers Wearing PPE</span>
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 font-mono">{kpis.workersWearingPPE}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">100% Attire Compliant</span>
          </div>
          <div className="text-[9.5px] font-mono text-emerald-600 flex items-center gap-0.5">
            <ThumbsUp className="w-3 h-3 text-emerald-500 mr-0.5" />
            <span>{kpis.ppeCompliancePct}% Compliance Ratio</span>
          </div>
        </motion.div>

        {/* Workers Without Helmet */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition duration-150 ${getPpeMissingColor(kpis.workersWithoutHelmet)}`}
        >
          <div className="flex justify-between items-start border-b border-current/10 pb-2">
            <span className="text-[9px] text-current/80 font-bold uppercase font-mono tracking-wider">Workers Without Helmet</span>
            <UserMinus className="w-4.5 h-4.5" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black font-mono">{kpis.workersWithoutHelmet}</span>
            <span className="text-[10px] opacity-75 block mt-0.5">Helmet Violations Detected</span>
          </div>
          <div className="text-[9.5px] font-mono opacity-80">
            {kpis.workersWithoutHelmet > 0 ? "⚠️ IMMEDIATE SUSPENSION" : "✓ Head protection clear"}
          </div>
        </motion.div>

        {/* Workers Without Vest */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition duration-150 ${getPpeMissingColor(kpis.workersWithoutVest)}`}
        >
          <div className="flex justify-between items-start border-b border-current/10 pb-2">
            <span className="text-[9px] text-current/80 font-bold uppercase font-mono tracking-wider">Workers Without Vest</span>
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black font-mono">{kpis.workersWithoutVest}</span>
            <span className="text-[10px] opacity-75 block mt-0.5">Hi-Vis Apparel Absences</span>
          </div>
          <div className="text-[9.5px] font-mono opacity-80">
            {kpis.workersWithoutVest > 0 ? "⚠️ Visual tag missing" : "✓ High-visibility clear"}
          </div>
        </motion.div>

        {/* Workers Without Harness */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition duration-150 ${getPpeMissingColor(kpis.workersWithoutHarness)}`}
        >
          <div className="flex justify-between items-start border-b border-current/10 pb-2">
            <span className="text-[9px] text-current/80 font-bold uppercase font-mono tracking-wider">Workers Without Harness</span>
            <ShieldAlert className="w-4.5 h-4.5 animate-bounce" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black font-mono">{kpis.workersWithoutHarness}</span>
            <span className="text-[10px] opacity-75 block mt-0.5">Height Fall Arrest Risks</span>
          </div>
          <div className="text-[9.5px] font-mono opacity-80 font-bold">
            {kpis.workersWithoutHarness > 0 ? "🚨 FATAL RISK EXPOSURE" : "✓ Fall arrest standard safe"}
          </div>
        </motion.div>
      </motion.div>

      {/* Operational Risks & Incident Reports Header */}
      <div className="border-b border-slate-100 pb-2 pt-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Risk Controls &amp; Incident Ledger</h4>
      </div>

      {/* Row 3: Risk Controls & Incidents Metrics */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {/* Active Violations */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition duration-150 ${getAlertsColor(kpis.activeViolations, "bg-rose-50/50 border-rose-250 text-rose-600", "bg-white border-slate-200 text-slate-500")}`}
        >
          <div className="flex justify-between items-start border-b border-current/10 pb-2">
            <span className="text-[9px] text-current/80 font-bold uppercase font-mono tracking-wider">Active Violations</span>
            <AlertOctagon className="w-4.5 h-4.5" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black font-mono text-slate-900">{kpis.activeViolations}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Total infraction alerts</span>
          </div>
          <div className="text-[9.5px] font-mono opacity-90">
            {kpis.activeViolations > 0 ? "⚠️ Requires immediate patrol" : "✓ No active alerts"}
          </div>
        </motion.div>

        {/* Critical Risks */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition duration-150 ${getAlertsColor(kpis.criticalRisks, "bg-red-50/50 border-red-250 text-red-600", "bg-white border-slate-200 text-slate-500")}`}
        >
          <div className="flex justify-between items-start border-b border-current/10 pb-2">
            <span className="text-[9px] text-current/80 font-bold uppercase font-mono tracking-wider">Critical Risks</span>
            <Flame className="w-4.5 h-4.5 text-red-500 animate-pulse" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black font-mono text-slate-900">{kpis.criticalRisks}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">High level safety threats</span>
          </div>
          <div className="text-[9.5px] font-mono opacity-90">
            {kpis.criticalRisks > 0 ? "🔥 Red-Zone Alerts" : "✓ Risks mitigated to low"}
          </div>
        </motion.div>

        {/* Near Misses Today */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-350 transition duration-150"
        >
          <div className="flex justify-between items-start border-b border-slate-100 pb-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider">Near Misses Today</span>
            <Activity className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 font-mono">{kpis.nearMissesToday}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Incidents averted in 24hr</span>
          </div>
          <div className="text-[9.5px] font-mono text-slate-500">
            {kpis.nearMissesToday > 0 ? "🚨 Incident investigation filed" : "✓ None logged today"}
          </div>
        </motion.div>

        {/* Open Incidents */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className={`border rounded-xl p-4 flex flex-col justify-between shadow-xs transition duration-150 ${getAlertsColor(kpis.openIncidents, "bg-amber-50 border-amber-200 text-amber-600", "bg-white border-slate-200 text-slate-500")}`}
        >
          <div className="flex justify-between items-start border-b border-current/10 pb-2">
            <span className="text-[9px] text-current/80 font-bold uppercase font-mono tracking-wider">Open Incidents</span>
            <ShieldAlert className="w-4.5 h-4.5" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black font-mono text-slate-900">{kpis.openIncidents}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Active CAPA workflows</span>
          </div>
          <div className="text-[9.5px] font-mono opacity-90">
            {kpis.openIncidents > 0 ? "⚠️ Action review pending" : "✓ Zero open incidents"}
          </div>
        </motion.div>

        {/* Resolved Incidents */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -2 }}
          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-350 transition duration-150"
        >
          <div className="flex justify-between items-start border-b border-slate-100 pb-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider">Resolved Incidents</span>
            <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 font-mono">{kpis.resolvedIncidents}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">HSE signoffs certified</span>
          </div>
          <div className="text-[9.5px] font-mono text-emerald-600 flex items-center gap-0.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Actions fully verified</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Row 4: AI Recommendations & Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
        <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono tracking-wider">Predictive Brain</span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">AI Safety Predictions &amp; Recommendations</h4>
              </div>
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-4 space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">Real-time Summary</span>
                  <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">{insights.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="text-slate-400 block uppercase text-[8px] tracking-wider">HIGHEST RISK TRADE</span>
                    <span className="text-white font-bold block mt-1 leading-tight text-indigo-300">{insights.highestRiskTrade}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="text-slate-400 block uppercase text-[8px] tracking-wider">RISK FORECAST</span>
                    <span className="text-emerald-400 font-bold block mt-1 leading-tight">{insights.riskForecast}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-2">
                <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-wider block">Actionable AI Remediation Directives</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {insights.recommendations.map((rec, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex gap-2 items-start text-[11px] leading-relaxed text-slate-300">
                      <span className="w-4 h-4 bg-indigo-950 text-indigo-400 rounded-full flex items-center justify-center font-bold text-[9px] font-mono mt-0.5 shrink-0">
                        {i + 1}
                      </span>
                      <p className="font-sans leading-normal">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
