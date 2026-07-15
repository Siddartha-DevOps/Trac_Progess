import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Cpu,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Activity,
  Layers,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Bell,
  Play,
  Check,
  Compass,
  Database,
  Terminal,
  Clock,
  Briefcase,
  Layers3,
  LineChart,
  HardHat,
  Network
} from "lucide-react";
import {
  LineChart as RechartLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import IntelligenceEngine, {
  IntelligenceRule,
  EnterpriseRecommendation,
  EnterpriseEvent
} from "../lib/IntelligenceEngine";

export default function IntelligenceEngineView() {
  const [activeTab, setActiveTab] = useState<"rules" | "recommendations" | "executive" | "timeline" | "blueprints">("rules");
  const [execTab, setExecTab] = useState<"executive" | "daily" | "weekly" | "risk" | "budget" | "delay" | "project">("executive");
  const [events, setEvents] = useState<EnterpriseEvent[]>([]);
  const [rules, setRules] = useState<IntelligenceRule[]>([]);
  const [recommendations, setRecommendations] = useState<EnterpriseRecommendation[]>([]);
  const [health, setHealth] = useState(IntelligenceEngine.getHealthMetrics());
  const [risks, setRisks] = useState(IntelligenceEngine.getRiskForecast());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Load state and subscribe to event bus
  useEffect(() => {
    setEvents([...IntelligenceEngine.getEventHistory()]);
    setRules([...IntelligenceEngine.getRules()]);
    setRecommendations([...IntelligenceEngine.getRecommendations()]);
    setHealth({ ...IntelligenceEngine.getHealthMetrics() });
    setRisks({ ...IntelligenceEngine.getRiskForecast() });

    // Subscribe to ALL events (*)
    const unsubscribe = IntelligenceEngine.subscribe("*", (event) => {
      // Update local state when event is published
      setEvents([...IntelligenceEngine.getEventHistory()]);
      setRules([...IntelligenceEngine.getRules()]);
      setRecommendations([...IntelligenceEngine.getRecommendations()]);
      setHealth({ ...IntelligenceEngine.getHealthMetrics() });
      setRisks({ ...IntelligenceEngine.getRiskForecast() });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto scroll terminal to top on new events
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [events]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      IntelligenceEngine.publish(
        "DASHBOARD_UPDATED",
        "ManualTrigger",
        { timestamp: new Date().toISOString() },
        "Manual diagnostic check completed. All active systems reporting healthy."
      );
    }, 800);
  };

  const handleToggleRule = (ruleId: string, currentStatus: boolean) => {
    IntelligenceEngine.triggerRule(ruleId, !currentStatus);
  };

  const handleApplyRecommendation = (id: string) => {
    IntelligenceEngine.applyRecommendation(id);
  };

  const handleInjectQualityFailure = () => {
    IntelligenceEngine.publish(
      "QUALITY_FAILURE",
      "DroneCV_Module",
      { anomalyId: `anom-cv-${Math.floor(Math.random() * 1000)}` },
      "CRITICAL: Geometrical shear crack flagged on Column Level 3 West. Spacing deviated by 15%."
    );
  };

  const handleInjectInspectionPassed = () => {
    IntelligenceEngine.publish(
      "INSPECTION_PASSED",
      "CivilQA_Engineer",
      { inspectionId: `ins-pass-${Math.floor(Math.random() * 1000)}` },
      "SUCCESS: Core concrete compressive stress testing passed on Level 2 Slabs (42 MPa verified)."
    );
  };

  const timelineData = IntelligenceEngine.getTimelineForecast();
  const executiveSummaries = IntelligenceEngine.getExecutiveInsights();

  const getAlertBadgeColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "Critical":
      case "P0":
        return "bg-red-100 text-red-800 font-extrabold";
      case "High":
      case "P1":
        return "bg-orange-100 text-orange-800 font-bold";
      case "Medium":
      case "P2":
        return "bg-blue-100 text-blue-800 font-semibold";
      default:
        return "bg-slate-100 text-slate-700 font-medium";
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="intelligence-engine-view">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white uppercase">TracProgress® Intelligence</h1>
                <span className="bg-emerald-500/15 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-mono tracking-wider animate-pulse">Enterprise AI</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Central Construction AI Brain & Real-time Event-driven Orchestrator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg border border-slate-700 text-xs font-bold transition flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Full Diagnostic Sync</span>
            </button>
            <div className="bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-300">RERA Compliance: 100% Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE PROJECT HEALTH ENGINE (STEP 6) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Overall Health Score Card */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Project KPI</div>
          
          <div className="w-full text-left mb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-500" />
              Enterprise Health Score
            </h3>
            <p className="text-[10px] text-slate-400">Combined schedule, quality, safety & budget factors</p>
          </div>

          <div className="my-4 relative flex items-center justify-center">
            {/* Health Radial circle */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="54"
                className="stroke-slate-100 fill-transparent"
                strokeWidth="8"
              />
              <circle
                cx="64"
                cy="64"
                r="54"
                className="stroke-indigo-600 fill-transparent transition-all duration-1000"
                strokeWidth="10"
                strokeDasharray="339.3"
                strokeDashoffset={339.3 - (339.3 * health.overallHealth) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-800 tracking-tighter">{health.overallHealth}%</span>
              <span className="text-[9px] text-emerald-600 font-extrabold uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                {health.overallHealth > 80 ? "On Track" : "At Risk"}
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-left text-[11px] text-slate-500 leading-relaxed flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
            <span>AI assessment suggests allocating 12-man structural steel crew to recover 8-day floor delay.</span>
          </div>
        </div>

        {/* Breakdown scores */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Network className="w-4 h-4 text-indigo-500" />
              Autonomous Engine Sub-System Ratings
            </h3>
            <p className="text-[10px] text-slate-400 mb-4">Granular health evaluations dynamically generated from live construction data points</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            
            {/* Schedule Score */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Schedule Score
                </span>
                <span className="font-bold text-slate-800">{health.scheduleScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${health.scheduleScore}%` }} />
              </div>
            </div>

            {/* Budget Score */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Budget Score
                </span>
                <span className="font-bold text-slate-800">{health.budgetScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${health.budgetScore}%` }} />
              </div>
            </div>

            {/* Quality Score */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-slate-400" /> Quality Rating
                </span>
                <span className="font-bold text-slate-800">{health.qualityScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${health.qualityScore}%` }} />
              </div>
            </div>

            {/* Safety Score */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <HardHat className="w-3.5 h-3.5 text-slate-400" /> Safety Index
                </span>
                <span className="font-bold text-slate-800">{health.safetyScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${health.safetyScore}%` }} />
              </div>
            </div>

            {/* Progress Score */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" /> Progress Pace
                </span>
                <span className="font-bold text-slate-800">{health.progressScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${health.progressScore}%` }} />
              </div>
            </div>

            {/* AI Confidence Score */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400 animate-pulse" /> AI Confidence
                </span>
                <span className="font-bold text-indigo-600 font-mono">{health.aiConfidenceScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${health.aiConfidenceScore}%` }} />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 mt-4 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Commercial Settle</span>
              <span className="font-extrabold text-slate-800 text-sm">{health.commercialScore}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">CDE Documentation</span>
              <span className="font-extrabold text-slate-800 text-sm">{health.documentationScore}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Inspection Audited</span>
              <span className="font-extrabold text-slate-800 text-sm">{health.inspectionScore}%</span>
            </div>
          </div>

        </div>

      </div>

      {/* DYNAMIC TWO-COLUMN WORKSPACE AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COMPONENT DESK (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col flex-1">
            
            {/* Tab Swappers */}
            <div className="flex border-b border-slate-100 pb-3 mb-5 overflow-x-auto gap-1">
              <button
                onClick={() => setActiveTab("rules")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "rules"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>1. AI Rule Engine ({rules.filter(r => r.isTriggered).length} Active)</span>
              </button>

              <button
                onClick={() => setActiveTab("recommendations")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "recommendations"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>2. Recommendation Desk ({recommendations.filter(r => r.status === "pending").length} Pending)</span>
              </button>

              <button
                onClick={() => setActiveTab("executive")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "executive"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>3. Executive Summaries</span>
              </button>

              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "timeline"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <LineChart className="w-4 h-4" />
                <span>4. AI Forecaster Chart</span>
              </button>

              <button
                onClick={() => setActiveTab("blueprints")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "blueprints"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Network className="w-4 h-4" />
                <span>5. Integration Map</span>
              </button>
            </div>

            {/* VIEWPORT AREA */}
            <div className="flex-1">
              
              {/* TAB 1: RULES ENGINE */}
              {activeTab === "rules" && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Active Rule Conditions</span>
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Evaluated every 3.5s via FastAPI</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {rules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`p-4 rounded-xl border transition-all ${
                          rule.isTriggered
                            ? "bg-rose-50/40 border-rose-100 shadow-[0_1px_4px_rgba(239,68,68,0.02)]"
                            : "bg-slate-50/40 border-slate-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-2.5 items-start">
                            <div className={`p-2 rounded-lg mt-0.5 ${
                              rule.isTriggered ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
                            }`}>
                              {rule.isTriggered ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-extrabold text-slate-800 text-xs">{rule.name}</h4>
                                <span className="bg-slate-100 text-slate-500 text-[8px] font-mono font-extrabold px-1 py-0.2 rounded border border-slate-200">
                                  {rule.category}
                                </span>
                                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${getAlertBadgeColor(rule.alertLevel)}`}>
                                  {rule.alertLevel}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{rule.message}</p>
                              
                              {/* Prediction & Suggestions */}
                              {rule.isTriggered && (
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-rose-100/60 text-[11px] leading-relaxed">
                                  <div>
                                    <span className="font-bold text-rose-800 block uppercase text-[8px] tracking-wider mb-0.5">AI Delay Prediction</span>
                                    <span className="text-rose-700">{rule.prediction}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-indigo-800 block uppercase text-[8px] tracking-wider mb-0.5">Remediation Action</span>
                                    <span className="text-indigo-900 font-medium">{rule.suggestedAction}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${getPriorityBadgeColor(rule.priority)}`}>
                              {rule.priority}
                            </span>
                            <button
                              onClick={() => handleToggleRule(rule.id, rule.isTriggered)}
                              className={`px-2.5 py-1 text-[9px] font-bold rounded-md border shadow-sm transition-all ${
                                rule.isTriggered
                                  ? "bg-white hover:bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200"
                              }`}
                            >
                              {rule.isTriggered ? "Deactivate Trigger" : "Simulate Trigger"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: RECOMMENDATIONS */}
              {activeTab === "recommendations" && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Active Remediation Protocols</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Click apply to trigger downstream schedules sync</span>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
                          rec.status === "applied"
                            ? "bg-emerald-50/30 border-emerald-100"
                            : "bg-white hover:border-slate-300 border-slate-150"
                        }`}
                      >
                        {rec.status === "applied" && (
                          <div className="absolute right-0 top-0 bg-emerald-500 text-white text-[8px] font-extrabold px-2 py-0.5 uppercase tracking-wider rounded-bl">
                            Applied & Synced
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-2.5">
                            <div className={`p-2 rounded-lg mt-0.5 ${
                              rec.status === "applied" ? "bg-emerald-100 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                            }`}>
                              {rec.status === "applied" ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-extrabold text-slate-800 text-xs">{rec.title}</h4>
                                <span className="bg-slate-100 text-slate-500 text-[8px] font-mono font-extrabold px-1 py-0.2 rounded">
                                  {rec.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{rec.description}</p>
                              
                              <div className="mt-3 bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex items-start gap-2 text-[11px] text-slate-700">
                                <span className="font-extrabold text-indigo-700 text-[10px] block uppercase tracking-wider">Step:</span>
                                <span className="leading-relaxed font-mono text-[10px]">{rec.actionableStep}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0 pt-0.5">
                            <div className="text-right flex flex-col gap-0.5 font-mono">
                              <span className="text-[10px] font-extrabold text-emerald-600 block">{rec.timeSaving}</span>
                              <span className="text-[9px] text-slate-400">Impact: {rec.costImpact}</span>
                            </div>

                            {rec.status !== "applied" ? (
                              <button
                                onClick={() => handleApplyRecommendation(rec.id)}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-extrabold shadow-sm transition flex items-center gap-1"
                              >
                                <span>Apply Action</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                                <Check className="w-3.5 h-3.5" /> Verified
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: EXECUTIVE BRIEFINGS */}
              {activeTab === "executive" && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  
                  {/* Category Pill select */}
                  <div className="flex bg-slate-100 p-1 rounded-lg gap-1 overflow-x-auto">
                    {(Object.keys(executiveSummaries) as Array<keyof typeof executiveSummaries>).map((key) => (
                      <button
                        key={key}
                        onClick={() => setExecTab(key.replace("Summary", "") as any)}
                        className={`flex-1 py-1 px-2.5 text-[10px] font-bold rounded-md transition-all text-center shrink-0 uppercase tracking-wider ${
                          execTab === key.replace("Summary", "")
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {key.replace("Summary", "")}
                      </button>
                    ))}
                  </div>

                  {/* Markdown Display */}
                  <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 font-sans text-xs leading-relaxed min-h-[180px] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-3">
                        <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5" />
                          Enterprise Executive S-Curve Summarizer
                        </span>
                        <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded font-mono uppercase">
                          Weekly Phase 3
                        </span>
                      </div>

                      {/* Display Selected Summary with simple markup rendering */}
                      <div className="space-y-3 pr-2 select-text selection:bg-indigo-500 selection:text-white">
                        {execTab === "executive" && (
                          <div dangerouslySetInnerHTML={{ __html: executiveSummaries.executiveSummary.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*\s(.*)/g, '• $1') }} />
                        )}
                        {execTab === "project" && (
                          <div dangerouslySetInnerHTML={{ __html: executiveSummaries.projectSummary.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*\s(.*)/g, '• $1') }} />
                        )}
                        {execTab === "daily" && (
                          <div dangerouslySetInnerHTML={{ __html: executiveSummaries.dailySummary.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*\s(.*)/g, '• $1') }} />
                        )}
                        {execTab === "weekly" && (
                          <div dangerouslySetInnerHTML={{ __html: executiveSummaries.weeklySummary.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*\s(.*)/g, '• $1') }} />
                        )}
                        {execTab === "risk" && (
                          <div dangerouslySetInnerHTML={{ __html: executiveSummaries.riskSummary.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*\s(.*)/g, '• $1') }} />
                        )}
                        {execTab === "budget" && (
                          <div dangerouslySetInnerHTML={{ __html: executiveSummaries.budgetSummary.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*\s(.*)/g, '• $1') }} />
                        )}
                        {execTab === "delay" && (
                          <div dangerouslySetInnerHTML={{ __html: executiveSummaries.delaySummary.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*\s(.*)/g, '• $1') }} />
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Source: Compiled from unified site telemetry & RERA database snapshots</span>
                      <span className="font-mono text-emerald-400">Live updated: 100% Synced</span>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 4: TIMELINE FORECAST */}
              {activeTab === "timeline" && (
                <div className="flex flex-col gap-4 animate-fade-in h-[320px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">S-Curve Progress & Capital Forecast</span>
                    <span className="text-[9px] text-slate-400 font-mono">Q4 2026 Milestone projection</span>
                  </div>

                  <div className="flex-1 min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartLineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="plannedProgress" stroke="#475569" strokeDasharray="5 5" name="Baseline Plan (%)" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="actualProgress" stroke="#10b981" strokeWidth={3} name="Verified Actual (%)" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="forecastedProgress" stroke="#6366f1" strokeWidth={2.5} name="AI Projection (%)" dot={{ r: 3 }} />
                      </RechartLineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg flex items-start gap-2.5 text-[11px] leading-relaxed text-indigo-800">
                    <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>AI S-Curve Prediction:</strong> Localized Level 3 slab steel misalignment has delayed progress from 72% to 68%. Direct alignment correction will restore baseline target of 88% by Week 8 without budget slippage.
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 5: INTEGRATION MAP & DIAGRAMS */}
              {activeTab === "blueprints" && (
                <div className="flex flex-col gap-5 animate-fade-in">
                  
                  {/* High Fidelity Visual diagram */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 block">Enterprise Architecture Diagram</span>
                    
                    {/* SVG Diagram styled with Tailwind */}
                    <div className="bg-white p-3 rounded-lg border border-slate-150 flex flex-col gap-4 select-none">
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold font-mono">
                        
                        <div className="p-2 bg-indigo-50 text-indigo-700 rounded border border-indigo-150 flex flex-col gap-1 items-center">
                          <Layers className="w-4.5 h-4.5" />
                          <span>Input Layer</span>
                          <span className="text-[8px] font-normal text-slate-500">Drone / BIM / IoT</span>
                        </div>

                        <div className="p-2 bg-purple-50 text-purple-700 rounded border border-purple-150 flex flex-col gap-1 items-center justify-center animate-pulse">
                          <Cpu className="w-5 h-5" />
                          <span>AI Intelligence Brain</span>
                          <span className="text-[8px] font-normal text-slate-500">Rule & S-Curve engine</span>
                        </div>

                        <div className="p-2 bg-emerald-50 text-emerald-700 rounded border border-emerald-150 flex flex-col gap-1 items-center">
                          <CheckCircle className="w-4.5 h-4.5" />
                          <span>Orchestration Layer</span>
                          <span className="text-[8px] font-normal text-slate-500">Schedules / QMS / Claims</span>
                        </div>

                      </div>

                      <div className="border-t border-dashed border-slate-200 pt-3 flex flex-col gap-1.5 text-[11px] text-slate-600 font-sans">
                        <p className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <strong>Future ML Integration:</strong> Dynamic re-training of YOLO weights from on-site annotated point cloud deviations.
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          <strong>Future Computer Vision:</strong> Depth-estimation camera models on tower crane hook to map physical volume curves.
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <strong>Future LLM Integration:</strong> Gemini API reading PDF drawing notes to auto-generate contract non-conformance.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-50/10 flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Core Services Modified</span>
                      <ul className="text-[10px] space-y-1 font-mono text-slate-500 list-disc pl-4 leading-normal">
                        <li>/src/store.ts</li>
                        <li>/src/App.tsx</li>
                        <li>/src/components/IntelligenceEngineView.tsx</li>
                        <li>/src/lib/IntelligenceEngine.ts</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-50/10 flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Future IoT Sourcing</span>
                      <p className="text-[10px] leading-relaxed text-slate-500 font-sans">
                        Concrete maturity sensors and crane telemetry log directly to the Event Bus, providing high-fidelity spatial telemetry feeds.
                      </p>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* RIGHT SECTION (4 Columns) - EVENT BUS & RISKS */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* AI CONFIDENCE RISK ENGINE (STEP 7) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              AI Risk Predictor Engine
            </h3>
            <p className="text-[10px] text-slate-400 mb-4">Probability of target baseline slippage</p>

            <div className="flex flex-col gap-3.5">
              
              {/* Schedule Delay Risk */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>Schedule Delay Risk</span>
                  <span className={`font-bold font-mono ${risks.scheduleDelayRisk > 60 ? "text-red-600" : "text-amber-600"}`}>
                    {risks.scheduleDelayRisk}% Confidence
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      risks.scheduleDelayRisk > 60 ? "bg-red-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${risks.scheduleDelayRisk}%` }}
                  />
                </div>
              </div>

              {/* Material Sourcing Delay */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>Material Shortage Risk</span>
                  <span className="font-bold text-amber-600 font-mono">{risks.materialDelayRisk}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${risks.materialDelayRisk}%` }} />
                </div>
              </div>

              {/* Quality Failure Risk */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>Quality Defect Risk</span>
                  <span className="font-bold text-amber-600 font-mono">{risks.qualityFailureRisk}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${risks.qualityFailureRisk}%` }} />
                </div>
              </div>

              {/* Weather Interruption */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>Weather Impact Risk</span>
                  <span className="font-bold text-blue-600 font-mono">{risks.weatherDelayRisk}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${risks.weatherDelayRisk}%` }} />
                </div>
              </div>

              {/* Budget Overrun */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>Budget Overrun Risk</span>
                  <span className="font-bold text-emerald-600 font-mono">{risks.budgetOverrunRisk}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${risks.budgetOverrunRisk}%` }} />
                </div>
              </div>

            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-[10px] leading-relaxed text-slate-500 mt-4">
              *Predictions updated real-time using historical trade speed indexes and localized procurement parameters.
            </div>
          </div>

          {/* REAL-TIME ENTERPRISE EVENT BUS (STEP 10) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col flex-1 text-white min-h-[380px]">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Live Event Bus Terminal</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {/* Quick manual injector */}
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg mb-3">
              <span className="text-[8px] font-mono text-slate-400 block mb-1.5 uppercase tracking-wider">Manual Incident Injector (Diagnostic)</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleInjectQualityFailure}
                  className="px-2 py-1.5 bg-rose-950/40 hover:bg-rose-900/30 text-rose-300 border border-rose-500/20 rounded text-[9px] font-bold font-mono transition-all text-center"
                >
                  Trigger QA Failure
                </button>
                <button
                  onClick={handleInjectInspectionPassed}
                  className="px-2 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/30 text-emerald-300 border border-emerald-500/20 rounded text-[9px] font-bold font-mono transition-all text-center"
                >
                  Inject QA Pass
                </button>
              </div>
            </div>

            {/* Scrolling console list */}
            <div className="flex-1 overflow-y-auto max-h-[250px] space-y-2.5 pr-1 font-mono text-[9px] leading-normal scrollbar-thin flex flex-col">
              <div ref={terminalEndRef} />
              
              {events.map((event) => (
                <div key={event.id} className="p-2 bg-slate-900/60 border border-slate-850 rounded text-slate-300 transition-all">
                  <div className="flex items-center justify-between gap-1 mb-1 font-extrabold text-[8px]">
                    <span className={`px-1 rounded uppercase font-mono ${
                      event.type.includes("FAILED") || event.type.includes("FAILURE")
                        ? "bg-red-500/20 text-red-400 border border-red-500/10"
                        : (event.type.includes("PASSED") || event.type.includes("APPROVED") ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400")
                    }`}>
                      {event.type}
                    </span>
                    <span className="text-slate-500 text-[8px]">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{event.description}</p>
                  <div className="mt-1 text-slate-500 text-[8px] flex justify-between">
                    <span>Source: {event.source}</span>
                    <span>ID: {event.id}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
