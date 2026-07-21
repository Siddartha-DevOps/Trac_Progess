import React, { useEffect, useState } from "react";
import BIMViewer from "./BIMViewer";
import AIAnomalyCenter from "./AIAnomalyCenter";
import TechArchitecture from "./TechArchitecture";
import DashboardMetrics from "./DashboardMetrics";
import PRDViewer from "./PRDViewer";
import RoadmapViewer from "./RoadmapViewer";
import ReportingCenter from "./ReportingCenter";
import NotificationCenter from "./NotificationCenter";
import AuditTrailViewer from "./AuditTrailViewer";
import ArchitectureExplorer from "./components/ArchitectureExplorer";
import BIMAnalyticsPanel from "./components/BIMAnalyticsPanel";
import BIMTimelineComponent from "./components/BIMTimelineComponent";

// Import new tracprogress®-inspired modular workspace views
import DashboardView from "./components/DashboardView";
import ProjectsView from "./components/ProjectsView";
import SchedulesView from "./components/SchedulesView";
import IssuesView from "./components/IssuesView";
import UsersView from "./components/UsersView";
import SettingsView from "./components/SettingsView";
import PremiumTopNavigation from "./components/PremiumTopNavigation";
import DesignSystemView from "./components/DesignSystemView";
import TracProgressLandingView from "./components/TracProgressLandingView";
import OperationsWorkflow from "./components/OperationsWorkflow";
import CommercialBillingView from "./components/CommercialBillingView";
import QualityManagementView from "./components/QualityManagementView";
import IntelligenceEngineView from "./components/IntelligenceEngineView";
import RealityCaptureWorkspace from "./components/RealityCaptureWorkspace";
import SafetyIntelligenceView from "./components/SafetyIntelligenceView";
import InteractiveWorkflows from "./components/InteractiveWorkflows";
import BrutalAuditView from "./components/BrutalAuditView";
import FuturisticACOSView from "./components/FuturisticACOSView";
import TracProgressAIEngine from "./components/TracProgressAIEngine";
import Phase1SlamCapabilitiesEngine from "./components/Phase1SlamCapabilitiesEngine";
import ImageToBimRegistrationEngine from "./components/ImageToBimRegistrationEngine";
import CVProgressEngine from "./components/CVProgressEngine";
import DatasetManagement from "./components/DatasetManagement";
import ImageAnnotationPlatform from "./components/ImageAnnotationPlatform";
import ActiveLearningPlatform from "./components/ActiveLearningPlatform";
import SyntheticDatasetGenerator from "./components/SyntheticDatasetGenerator";
import ModelRegistry from "./components/ModelRegistry";
import ExperimentTracker from "./components/ExperimentTracker";
import AIEvaluationDashboard from "./components/AIEvaluationDashboard";
import TracProgressAIParity from "./components/TracProgressAIParity";
import { Camera, Brain, Sparkles as SparkleIcon, TrendingUp, Gauge, GitCompare } from "lucide-react";

import { BIMElement, Anomaly } from "./types";
import { useAppStore, TabType } from "./store";
import { SITE_ANOMALIES, BIM_ELEMENTS_LOOKUP, getProjectBimElements } from "./data";
import { 
  Building2, 
  MapPin, 
  Layers, 
  Sparkles, 
  Activity, 
  Database, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  FileText,
  Milestone,
  Bell,
  FileSpreadsheet,
  History,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldAlert,
  Sliders,
  ShieldCheck,
  Orbit,
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  Calendar,
  Hammer,
  Cpu,
  ClipboardCheck,
  Shield,
  Compass
} from "lucide-react";

export default function App() {
  const {
    activeTab,
    setActiveTab,
    isSidebarExpanded,
    toggleSidebar,
    currentWeek,
    setCurrentWeek,
    activeProject,
    selectedElement,
    setSelectedElement,
    selectedAnomaly,
    setSelectedAnomaly,
    selectElementById,
    selectAnomalyById,
    searchQuery,
    setSearchQuery,
    showLandingPage,
    setShowLandingPage,
    isTracProgressMode,
    setIsTracProgressMode
  } = useAppStore();

  const [rightPanelTab, setRightPanelTab] = useState<"analytics" | "inspector">("analytics");

  const mappedBimElements: BIMElement[] = getProjectBimElements(activeProject.id).map(found => ({
    id: found.id,
    name: found.name,
    category: found.category,
    type: found.type as any,
    progress: found.status === "completed" ? 100 : (found.status === "in_progress" ? 60 : (found.status === "delayed" ? 30 : 0)),
    status: found.status === "completed" ? "completed" : (found.status === "delayed" ? "delayed" : (found.status === "in_progress" ? "in_progress" : "not_started")),
    position: found.position,
    size: found.size,
    anomalyId: BIM_ELEMENTS_LOOKUP.find(l => l.id === found.id)?.anomalyId
  }));

  // Handle synchronized selection from the 3D BIM Viewer
  const handleSelectElement = (element: BIMElement | null) => {
    if (element) {
      selectElementById(element.id);
      setRightPanelTab("inspector");
    } else {
      setSelectedElement(null);
      setSelectedAnomaly(null);
    }
  };

  // Handle synchronized selection from anomalies panel
  const handleSelectAnomalyDirect = (anomaly: Anomaly) => {
    selectAnomalyById(anomaly.id);
  };

  // Filter site anomalies based on search query or current selected elements
  const filteredAnomalies = SITE_ANOMALIES.filter(a => {
    if (!searchQuery) return true;
    return (
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.elementName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (showLandingPage) {
    return <TracProgressLandingView />;
  }

  return (
    <div className={`h-screen w-screen flex overflow-hidden font-sans antialiased selection:bg-indigo-600 selection:text-white ${isTracProgressMode ? "bg-slate-950 text-slate-100" : "bg-slate-50/60 text-slate-800"}`}>
      
      {/* 1. COLLAPSIBLE LEFT SIDEBAR: tracprogress® Enterprise Navigation */}
      <aside 
        id="tracprogress-sidebar"
        aria-label="Main Navigation Sidebar"
        className={`flex flex-col justify-between shrink-0 transition-all duration-300 z-30 select-none ${
          isSidebarExpanded ? "w-64" : "w-16"
        } ${isTracProgressMode ? "bg-slate-900 border-r border-slate-800 text-slate-200" : "bg-white border-r border-slate-200 text-slate-800"}`}
      >
        <div className="flex flex-col overflow-y-auto overflow-x-hidden flex-1 scrollbar-thin">
          
          {/* Logo & Platform Context */}
          <div className={`h-16 flex items-center gap-3 px-4 shrink-0 ${isTracProgressMode ? "border-b border-slate-800 bg-slate-900" : "border-b border-slate-100 bg-white"}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm ${isTracProgressMode ? "bg-indigo-600" : "bg-slate-900"}`}>
              <Building2 className={`w-5 h-5 ${isTracProgressMode ? "text-white" : "text-indigo-500"}`} />
            </div>
            {isSidebarExpanded && (
              <div className="flex flex-col">
                <span className={`text-xs font-bold tracking-tight leading-none ${isTracProgressMode ? "text-white" : "text-slate-900"}`}>
                  {isTracProgressMode ? "tracprogress® Portal" : "tracprogress"}
                </span>
                <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mt-1">Enterprise Suite</span>
              </div>
            )}
          </div>

          {/* Project Details context (Only if expanded) */}
          {isSidebarExpanded && (
            <div className={`p-4 flex flex-col gap-2 shrink-0 ${isTracProgressMode ? "bg-slate-900/60 border-b border-slate-800" : "bg-slate-50/50 border-b border-slate-100"}`}>
              <div className={`flex items-center gap-1.5 text-xs ${isTracProgressMode ? "text-slate-300" : "text-slate-500"}`}>
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isTracProgressMode ? "text-indigo-400" : "text-slate-400"}`} />
                <span className="font-semibold truncate">{activeProject.name}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono mt-0.5">
                <span className={`${isTracProgressMode ? "text-slate-400" : "text-slate-400"}`}>RERA ID:</span>
                <span className={`px-1.5 py-0.5 rounded border font-semibold ${isTracProgressMode ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"}`}>{activeProject.reraId}</span>
              </div>
            </div>
          )}

          {/* Navigation Menu Links */}
          <nav role="navigation" className="p-3 flex flex-col gap-5 mt-2">
            
            {/* Section 1: Portfolio HUD */}
            <div>
              {isSidebarExpanded && (
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider px-3 block mb-1.5 font-mono">
                  Portfolio HUD
                </span>
              )}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  aria-current={activeTab === "dashboard" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "dashboard"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Portfolio Overview Dashboard"
                >
                  <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === "dashboard" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && <span>Dashboard</span>}
                </button>

                <button
                  onClick={() => setActiveTab("workflow-engine")}
                  aria-current={activeTab === "workflow-engine" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "workflow-engine"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Construction Operations Workflow Engine"
                >
                  <Cpu className={`w-4 h-4 shrink-0 ${activeTab === "workflow-engine" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Operations Workflow</span>
                      <span className="bg-indigo-50 text-indigo-600 text-[8px] font-bold px-1 py-0.5 rounded border border-indigo-100">NEW</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("live-playbook")}
                  aria-current={activeTab === "live-playbook" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "live-playbook"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Interactive Scenario Playbook"
                >
                  <Sliders className={`w-4 h-4 shrink-0 ${activeTab === "live-playbook" ? "text-indigo-400 animate-pulse" : "text-slate-400"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Live Playbook</span>
                      <span className="bg-amber-50 text-amber-600 text-[8px] font-bold px-1 py-0.5 rounded border border-amber-100 font-mono">SCENARIOS</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("commercial-billing")}
                  aria-current={activeTab === "commercial-billing" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "commercial-billing"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Commercial claims & Progress Valuation"
                >
                  <FileSpreadsheet className={`w-4 h-4 shrink-0 ${activeTab === "commercial-billing" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Commercial Claims</span>
                      <span className="bg-emerald-50 text-emerald-600 text-[8px] font-bold px-1 py-0.5 rounded border border-emerald-100">BOQ</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("projects")}
                  aria-current={activeTab === "projects" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "projects"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Indian Projects Portfolio"
                >
                  <Briefcase className={`w-4 h-4 shrink-0 ${activeTab === "projects" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && <span>Projects</span>}
                </button>
              </div>
            </div>

            {/* Section 2: BIM Construction */}
            <div>
              {isSidebarExpanded && (
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider px-3 block mb-1.5 font-mono">
                  BIM Construction
                </span>
              )}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveTab("bim-models")}
                  aria-current={activeTab === "bim-models" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "bim-models"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="3D BIM Viewer"
                >
                  <Layers className={`w-4 h-4 shrink-0 ${activeTab === "bim-models" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && <span>BIM Models</span>}
                </button>

                <button
                  onClick={() => setActiveTab("reality-capture")}
                  aria-current={activeTab === "reality-capture" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "reality-capture"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Reality Capture Intelligence Platform"
                >
                  <Camera className={`w-4 h-4 shrink-0 ${activeTab === "reality-capture" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Reality Capture</span>
                      <span className="bg-indigo-50 text-indigo-600 text-[8px] font-bold px-1 py-0.5 rounded border border-indigo-100 uppercase font-mono">ACTIVE</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("image-to-bim")}
                  aria-current={activeTab === "image-to-bim" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "image-to-bim"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-55 hover:text-slate-900"
                  }`}
                  title="Image-to-BIM Registration Engine"
                >
                  <Compass className={`w-4 h-4 shrink-0 ${activeTab === "image-to-bim" ? "text-white animate-spin" : "text-indigo-400"}`} style={{ animationDuration: activeTab === "image-to-bim" ? "12s" : "0s" }} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Image-To-BIM CV</span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1 py-0.5 rounded border border-emerald-500/30">ENGINE</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("cv-progress-engine")}
                  aria-current={activeTab === "cv-progress-engine" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "cv-progress-engine"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Computer Vision Site Progress Engine"
                >
                  <Cpu className={`w-4 h-4 shrink-0 ${activeTab === "cv-progress-engine" ? "text-white animate-pulse" : "text-purple-400"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>CV Progress</span>
                      <span className="bg-purple-500/20 text-purple-400 text-[8px] font-bold px-1 py-0.5 rounded border border-purple-500/30">PROGRESS</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("dataset-management")}
                  aria-current={activeTab === "dataset-management" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "dataset-management"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Enterprise Dataset Management Platform"
                >
                  <Database className={`w-4 h-4 shrink-0 ${activeTab === "dataset-management" ? "text-white animate-pulse" : "text-indigo-400"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Dataset Hub</span>
                      <span className="bg-blue-500/20 text-blue-400 text-[8px] font-bold px-1 py-0.5 rounded border border-blue-500/30">MLOPS</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("image-annotation")}
                  aria-current={activeTab === "image-annotation" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "image-annotation"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Enterprise Annotation Studio (CVAT / Scale AI)"
                >
                  <Layers className={`w-4 h-4 shrink-0 ${activeTab === "image-annotation" ? "text-white animate-pulse" : "text-emerald-500"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Annotation Studio</span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1 py-0.5 rounded border border-emerald-500/30">STUDIO</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("active-learning")}
                  aria-current={activeTab === "active-learning" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "active-learning"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Active Learning & Hard Example Mining"
                >
                  <Brain className={`w-4 h-4 shrink-0 ${activeTab === "active-learning" ? "text-white animate-pulse" : "text-indigo-500"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Active Learning</span>
                      <span className="bg-indigo-500/20 text-indigo-400 text-[8px] font-bold px-1 py-0.5 rounded border border-indigo-500/30">LOOP</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("synthetic-generator")}
                  aria-current={activeTab === "synthetic-generator" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "synthetic-generator"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Synthetic Dataset Generator"
                >
                  <SparkleIcon className={`w-4 h-4 shrink-0 ${activeTab === "synthetic-generator" ? "text-white animate-pulse" : "text-emerald-500"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Synthetic Generator</span>
                      <span className="bg-emerald-500/25 text-emerald-400 text-[8px] font-bold px-1 py-0.5 rounded border border-emerald-500/30">SYNTH</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("model-registry")}
                  aria-current={activeTab === "model-registry" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "model-registry"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="AI Model Registry"
                >
                  <Brain className={`w-4 h-4 shrink-0 ${activeTab === "model-registry" ? "text-white animate-pulse" : "text-violet-500"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Model Registry</span>
                      <span className="bg-violet-500/25 text-violet-400 text-[8px] font-bold px-1 py-0.5 rounded border border-violet-500/30">MLFLOW</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("experiment-tracker")}
                  aria-current={activeTab === "experiment-tracker" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "experiment-tracker"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="W&B / MLflow Experiment Tracker"
                >
                  <TrendingUp className={`w-4 h-4 shrink-0 ${activeTab === "experiment-tracker" ? "text-white animate-pulse" : "text-indigo-500"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Experiment Tracker</span>
                      <span className="bg-indigo-500/20 text-indigo-400 text-[8px] font-bold px-1 py-0.5 rounded border border-indigo-500/30">W&B</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("ai-evaluation")}
                  aria-current={activeTab === "ai-evaluation" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "ai-evaluation"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="AI Evaluation Dashboard"
                >
                  <Gauge className={`w-4 h-4 shrink-0 ${activeTab === "ai-evaluation" ? "text-white animate-pulse" : "text-emerald-500"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Evaluation Suite</span>
                      <span className="bg-emerald-500/20 text-emerald-600 text-[8px] font-bold px-1 py-0.5 rounded border border-emerald-500/30">EVAL</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("tracprogress-ai-parity")}
                  aria-current={activeTab === "tracprogress-ai-parity" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "tracprogress-ai-parity"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Benchmark & Parity Feature Comparison"
                >
                  <GitCompare className={`w-4 h-4 shrink-0 ${activeTab === "tracprogress-ai-parity" ? "text-white animate-pulse" : "text-amber-500"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Benchmark Parity</span>
                      <span className="bg-amber-500/20 text-amber-600 text-[8px] font-bold px-1 py-0.5 rounded border border-amber-500/30">VS</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("site-progress")}
                  aria-current={activeTab === "site-progress" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "site-progress"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Earned Value Site Progress"
                >
                  <Activity className={`w-4 h-4 shrink-0 ${activeTab === "site-progress" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && <span>Site Progress</span>}
                </button>

                 <button
                  onClick={() => setActiveTab("ai-analysis")}
                  aria-current={activeTab === "ai-analysis" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "ai-analysis"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Computer Vision Discrepancy Analyzer"
                >
                  <Sparkles className={`w-4 h-4 shrink-0 ${activeTab === "ai-analysis" ? "text-white" : "text-indigo-500 animate-pulse"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>AI Analysis</span>
                      <span className="bg-red-50 text-red-600 text-[8px] font-bold px-1 py-0.5 rounded border border-red-100">AI</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("intelligence-engine")}
                  aria-current={activeTab === "intelligence-engine" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "intelligence-engine"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Enterprise Construction Intelligence Engine"
                >
                  <Cpu className={`w-4 h-4 shrink-0 ${activeTab === "intelligence-engine" ? "text-white" : "text-indigo-500 animate-pulse"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Intelligence Brain</span>
                      <span className="bg-indigo-50 text-indigo-600 text-[8px] font-bold px-1 py-0.5 rounded border border-indigo-100 uppercase font-mono">Engine</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("quality-management")}
                  aria-current={activeTab === "quality-management" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "quality-management"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Quality Management System (QMS)"
                >
                  <ClipboardCheck className={`w-4 h-4 shrink-0 ${activeTab === "quality-management" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Quality (QMS)</span>
                      <span className="bg-emerald-50 text-emerald-600 text-[8px] font-bold px-1 py-0.5 rounded border border-emerald-100 font-mono">ISO</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Section 3: Scheduling & Ops */}
            <div>
              {isSidebarExpanded && (
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider px-3 block mb-1.5 font-mono">
                  Scheduling & Ops
                </span>
              )}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveTab("schedules")}
                  aria-current={activeTab === "schedules" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "schedules"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Construction Milestones & Gantt"
                >
                  <Calendar className={`w-4 h-4 shrink-0 ${activeTab === "schedules" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && <span>Schedules</span>}
                </button>

                <button
                  onClick={() => setActiveTab("activities")}
                  aria-current={activeTab === "activities" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "activities"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Physical Site Logs & Audit Trail"
                >
                  <History className={`w-4 h-4 shrink-0 ${activeTab === "activities" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && <span>Activities</span>}
                </button>

                <button
                  onClick={() => setActiveTab("issues")}
                  aria-current={activeTab === "issues" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "issues"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Quality Deviations Ledger"
                >
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${activeTab === "issues" ? "text-white" : "text-red-500"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Issues</span>
                      <span className="bg-red-50 text-red-600 text-[9px] font-bold px-1.5 py-0.2 rounded-full">4</span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("safety-intelligence")}
                  aria-current={activeTab === "safety-intelligence" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "safety-intelligence"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Enterprise Safety Intelligence Hub"
                >
                  <Shield className={`w-4 h-4 shrink-0 ${activeTab === "safety-intelligence" ? "text-white" : "text-emerald-500"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Safety Intelligence</span>
                      <span className="bg-emerald-50 text-emerald-600 text-[8px] font-bold px-1 py-0.5 rounded border border-emerald-100 font-mono">HSE</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Section 4: Reporting & Admin */}
            <div>
              {isSidebarExpanded && (
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider px-3 block mb-1.5 font-mono">
                  Reporting & Admin
                </span>
              )}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveTab("reports")}
                  aria-current={activeTab === "reports" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "reports"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Report Compiler & Downloader"
                >
                  <FileSpreadsheet className={`w-4 h-4 shrink-0 ${activeTab === "reports" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && <span>Reports</span>}
                </button>

                <button
                  onClick={() => setActiveTab("notifications")}
                  aria-current={activeTab === "notifications" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "notifications"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Real-time System Warning Streams"
                >
                  <Bell className={`w-4 h-4 shrink-0 ${activeTab === "notifications" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && (
                    <div className="flex-1 flex justify-between items-center">
                      <span>Notifications</span>
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("users")}
                  aria-current={activeTab === "users" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "users"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Operator Permissions Directory"
                >
                  <Users className={`w-4 h-4 shrink-0 ${activeTab === "users" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && <span>Users</span>}
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  aria-current={activeTab === "settings" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "settings"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="System Cache & API Parameters"
                >
                  <Settings className={`w-4 h-4 shrink-0 ${activeTab === "settings" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && <span>Settings</span>}
                </button>
              </div>
            </div>

            {/* Section 5: Developer Specifications */}
            <div>
              {isSidebarExpanded && (
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider px-3 block mb-1.5 font-mono">
                  Developer Specs
                </span>
              )}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveTab("architecture")}
                  aria-current={activeTab === "architecture" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "architecture"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Next.js & Zustand Architectural Blueprints"
                >
                  <Database className={`w-4 h-4 shrink-0 ${activeTab === "architecture" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && <span>Blueprints</span>}
                </button>

                <button
                  onClick={() => setActiveTab("prd")}
                  aria-current={activeTab === "prd" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "prd"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Compliance Product Specs"
                >
                  <FileText className={`w-4 h-4 shrink-0 ${activeTab === "prd" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && <span>Product Spec</span>}
                </button>

                <button
                  onClick={() => setActiveTab("roadmap")}
                  aria-current={activeTab === "roadmap" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "roadmap"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="v1.0 Production Roadmap"
                >
                  <Milestone className={`w-4 h-4 shrink-0 ${activeTab === "roadmap" ? "text-white" : "text-slate-400"}`} />
                  {isSidebarExpanded && <span>v1.0 Roadmap</span>}
                </button>

                <button
                  onClick={() => setActiveTab("audit")}
                  aria-current={activeTab === "audit" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "audit"
                      ? "bg-red-600 text-white shadow-sm font-bold"
                      : "text-red-600/90 hover:bg-red-500/10 hover:text-red-400"
                  }`}
                  title="Brutal Codebase Audit"
                >
                  <ShieldAlert className={`w-4 h-4 shrink-0 ${activeTab === "audit" ? "text-white" : "text-red-500"}`} />
                  {isSidebarExpanded && (
                    <span className="flex-1 flex justify-between items-center">
                      <span>Brutal Audit</span>
                      <span className="bg-red-500/20 text-red-500 text-[8px] font-bold px-1 py-0.5 rounded border border-red-500/30">CRITICAL</span>
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("enterprise-engine")}
                  aria-current={activeTab === "enterprise-engine" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "enterprise-engine"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
                  }`}
                  title="tracprogress.ai Enterprise Capabilities Engine"
                >
                  <Cpu className={`w-4 h-4 shrink-0 ${activeTab === "enterprise-engine" ? "text-white" : "text-indigo-400"}`} />
                  {isSidebarExpanded && (
                    <span className="flex-1 flex justify-between items-center">
                      <span>AI Engine Suite</span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1 py-0.5 rounded border border-emerald-500/30">READY</span>
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("phase1-slam")}
                  aria-current={activeTab === "phase1-slam" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "phase1-slam"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
                  }`}
                  title="Phase 1 SLAM & Trajectory Engine Specifications"
                >
                  <Activity className={`w-4 h-4 shrink-0 ${activeTab === "phase1-slam" ? "text-white" : "text-indigo-400"}`} />
                  {isSidebarExpanded && (
                    <span className="flex-1 flex justify-between items-center">
                      <span>Phase 1 SLAM</span>
                      <span className="bg-indigo-500/20 text-indigo-400 text-[8px] font-bold px-1 py-0.5 rounded border border-indigo-500/30">SPECS</span>
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("acos")}
                  aria-current={activeTab === "acos" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "acos"
                      ? "bg-cyan-600 text-white shadow-sm font-bold"
                      : "text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                  }`}
                  title="Next-Gen ACOS Operating System"
                >
                  <Orbit className={`w-4 h-4 shrink-0 ${activeTab === "acos" ? "text-white" : "text-cyan-400"}`} />
                  {isSidebarExpanded && (
                    <span className="flex-1 flex justify-between items-center">
                      <span>ACOS 2035</span>
                      <span className="bg-cyan-500/20 text-cyan-400 text-[8px] font-bold px-1 py-0.5 rounded border border-cyan-500/30">AI-NATIVE</span>
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("design-system")}
                  aria-current={activeTab === "design-system" ? "page" : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${
                    activeTab === "design-system"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  title="Interactive Design System Showcase"
                >
                  <Sparkles className={`w-4 h-4 shrink-0 ${activeTab === "design-system" ? "text-white animate-pulse" : "text-indigo-500 animate-pulse"}`} />
                  {isSidebarExpanded && <span>Design System</span>}
                </button>
              </div>
            </div>

          </nav>
        </div>

        {/* Collapsible drawer bottom action */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button 
            onClick={toggleSidebar} 
            aria-expanded={isSidebarExpanded}
            aria-label="Toggle Navigation Sidebar"
            className="w-full py-2 hover:bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
          >
            {isSidebarExpanded ? (
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </div>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

      </aside>

      {/* 2. MAIN WORKING PLATFORM: Right Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP NAVIGATION BAR */}
        <PremiumTopNavigation />

        {/* 3. SCROLLABLE WORKSPACE SCREEN STAGE */}
        <main className="flex-1 overflow-y-auto bg-slate-50/55 p-6 md:p-8 flex flex-col gap-6 scrollbar-thin">
          
          {/* TAB 1: Dashboard View */}
          {activeTab === "dashboard" && (
            <DashboardView />
          )}

          {/* TAB 1b: Operations Workflow View */}
          {activeTab === "workflow-engine" && (
            <OperationsWorkflow />
          )}

          {/* TAB 1bb: Live Playbook View */}
          {activeTab === "live-playbook" && (
            <InteractiveWorkflows />
          )}

          {/* TAB 1c: Commercial Progress Claims View */}
          {activeTab === "commercial-billing" && (
            <CommercialBillingView />
          )}

          {/* TAB 1d: Quality Management System View */}
          {activeTab === "quality-management" && (
            <QualityManagementView />
          )}

          {/* TAB 1e: Enterprise Construction Intelligence View */}
          {activeTab === "intelligence-engine" && (
            <IntelligenceEngineView />
          )}

          {/* TAB 2: Projects Portfolio View */}
          {activeTab === "projects" && (
            <ProjectsView />
          )}

          {/* TAB 3: BIM Models View */}
          {activeTab === "bim-models" && (
            <div className="flex flex-col gap-6 animate-fade-in" id="bim-models-tab">
              
              {/* UPPER SECTION: 3D BIM Viewer & Object Inspector */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* 3D Model Viewer & Timeline System Card (8 Cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="h-[550px] bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200/60 relative flex flex-col">
                    <BIMViewer 
                      onSelectElement={handleSelectElement} 
                      selectedElement={selectedElement}
                      anomalies={SITE_ANOMALIES}
                      currentWeek={currentWeek}
                    />
                  </div>

                  {/* High-Fidelity Enterprise Timeline System */}
                  <BIMTimelineComponent 
                    currentWeek={currentWeek}
                    setCurrentWeek={setCurrentWeek}
                    selectedElement={selectedElement}
                    onSelectElement={handleSelectElement}
                  />
                </div>

                {/* Right Interactive Sidebar Container (4 Cols) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-[550px]">
                  
                  {/* Top Segmented Tab Switcher */}
                  <div className="flex bg-slate-100 p-1 rounded-lg mb-4 shrink-0">
                    <button
                      onClick={() => setRightPanelTab("analytics")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                        rightPanelTab === "analytics"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Live Analytics</span>
                    </button>
                    <button
                      onClick={() => setRightPanelTab("inspector")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 relative ${
                        rightPanelTab === "inspector"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Element Inspector</span>
                      {selectedElement && (
                        <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                      )}
                    </button>
                  </div>

                  {/* Scrollable Tab Content Viewport */}
                  <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                    {rightPanelTab === "analytics" ? (
                      <BIMAnalyticsPanel 
                        onSelectElement={(elem) => {
                          handleSelectElement(elem);
                          setRightPanelTab("inspector");
                        }}
                        selectedElement={selectedElement}
                        currentWeek={currentWeek}
                      />
                    ) : (
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
                            <div>
                              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                                <Activity className="w-4 h-4 text-indigo-500 shrink-0" />
                                Spatial Inspector
                              </h3>
                              <p className="text-[10px] text-slate-400 mt-0.5">Physical property alignment ledger</p>
                            </div>
                            <span className="text-[9px] bg-slate-100 text-slate-500 font-mono font-bold px-1.5 py-0.5 rounded uppercase border border-slate-200/50">IFC 4.0</span>
                          </div>

                          {selectedElement ? (
                            <div className="flex flex-col gap-4 text-xs animate-fade-in">
                              
                              {/* Status Header */}
                              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-slate-800 text-sm leading-tight">{selectedElement.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">GUID: {selectedElement.id}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  selectedElement.status === "completed" 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                                    : (selectedElement.status === "delayed" ? "bg-red-50 text-red-700 border border-red-200/60" : "bg-blue-50 text-blue-700 border border-blue-200/60")
                                }`}>
                                  {selectedElement.status.replace("_", " ")}
                                </span>
                              </div>

                              {/* Specs Metadata */}
                              <div className="grid grid-cols-2 gap-3 bg-slate-50/30 p-3 rounded-lg border border-slate-150">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">BIM Domain</span>
                                  <span className="font-bold text-slate-700 text-[11px]">{selectedElement.category} ({selectedElement.type})</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Material Grade</span>
                                  <span className="font-bold text-slate-700 text-[11px]">{selectedElement.material || "M35 Rein. Concrete"}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target Stage</span>
                                  <span className="font-bold text-slate-700 text-[11px]">{selectedElement.installationDate}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Calculated Progress</span>
                                  <span className="font-bold text-indigo-600 text-[11px]">{selectedElement.progress}% Verified</span>
                                </div>
                              </div>

                              {/* Anomaly Sync Block if applicable */}
                              {selectedElement.anomalyId && selectedAnomaly && (
                                <div className="bg-red-50/50 p-4 rounded-lg border border-red-100 flex flex-col gap-2">
                                  <div className="flex items-center gap-1.5 text-red-800 font-bold">
                                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                                    <span className="text-xs">Computer Vision Dev Variance</span>
                                  </div>
                                  <p className="text-[11px] text-red-700 leading-relaxed">
                                    {selectedAnomaly.title}. {selectedAnomaly.deviation}. This is currently introducing downstream delays for higher floor rebar placement.
                                  </p>
                                  <button
                                    onClick={() => setActiveTab("ai-analysis")}
                                    className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 mt-1 flex items-center justify-center gap-1 bg-white border border-indigo-200 px-3 py-2 rounded-md shadow-sm transition"
                                  >
                                    <span>Trigger Gemini Remediation Advice</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}

                              {!selectedElement.anomalyId && (
                                <div className="bg-emerald-50/40 p-3.5 rounded-lg border border-emerald-100/60 flex items-start gap-2.5 text-emerald-800 text-[11px] leading-relaxed">
                                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>Physical scan matches model. Design geometry verified with zero deviations detected.</span>
                                </div>
                              )}

                            </div>
                          ) : (
                            <div className="h-[250px] flex flex-col justify-center items-center text-center p-4 border border-dashed border-slate-200 rounded-lg text-slate-400">
                              <Layers className="w-8 h-8 text-slate-300 mb-2" />
                              <h4 className="font-bold text-slate-700 text-xs mb-0.5">No IFC Component Loaded</h4>
                              <p className="text-[11px] leading-relaxed max-w-[200px] text-slate-400">
                                Use your mouse to hover or click on columns, slabs, or piping inside the 3D model viewport.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Informational Callout matching tracprogress® quality */}
                        <div className="p-3.5 bg-slate-900 text-white rounded-lg flex flex-col gap-1 text-[10px] leading-relaxed mt-4 font-sans shrink-0">
                          <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[8px] font-mono">Photogrammetry sync engine</span>
                          <p className="text-slate-300">
                            tracprogress compares orthomosaics with standard design coordinates using instance-segmentation to log physical quantities.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* LOWER SECTION: Timeline slider & Earned Value Charts */}
              <DashboardMetrics 
                stats={activeProject} 
                currentWeek={currentWeek} 
                setCurrentWeek={setCurrentWeek} 
                elements={mappedBimElements}
                anomalies={SITE_ANOMALIES}
              />

            </div>
          )}

          {/* TAB 3b: Reality Capture Workspace */}
          {activeTab === "reality-capture" && (
            <RealityCaptureWorkspace />
          )}

          {/* TAB 3c: Image-to-BIM Registration Engine */}
          {activeTab === "image-to-bim" && (
            <ImageToBimRegistrationEngine />
          )}

          {/* TAB 3d: CV Progress Engine */}
          {activeTab === "cv-progress-engine" && (
            <CVProgressEngine />
          )}

          {/* TAB 3e: Dataset Management Platform */}
          {activeTab === "dataset-management" && (
            <DatasetManagement />
          )}

          {/* TAB 3f: Annotation Studio Platform */}
          {activeTab === "image-annotation" && (
            <ImageAnnotationPlatform />
          )}

          {/* TAB 3g: Active Learning Platform */}
          {activeTab === "active-learning" && (
            <ActiveLearningPlatform />
          )}

          {/* TAB 3h: Synthetic Construction Dataset Generator */}
          {activeTab === "synthetic-generator" && (
            <SyntheticDatasetGenerator />
          )}

          {/* TAB 3i: AI Model Registry (MLflow-like platform) */}
          {activeTab === "model-registry" && (
            <ModelRegistry />
          )}

          {/* TAB 3j: Experiment Tracker Platform (W&B / MLflow-like platform) */}
          {activeTab === "experiment-tracker" && (
            <ExperimentTracker />
          )}

          {/* TAB 3k: AI Evaluation Dashboard */}
          {activeTab === "ai-evaluation" && (
            <AIEvaluationDashboard />
          )}

          {/* TAB 3l: tracprogress.ai Parity & Competitor Comparison */}
          {activeTab === "tracprogress-ai-parity" && (
            <TracProgressAIParity />
          )}

          {/* TAB 4: Site Progress Details View */}
          {activeTab === "site-progress" && (
            <div className="flex flex-col gap-6 animate-fade-in" id="site-progress-tab">
              <DashboardMetrics 
                stats={activeProject} 
                currentWeek={currentWeek} 
                setCurrentWeek={setCurrentWeek} 
                elements={mappedBimElements}
                anomalies={SITE_ANOMALIES}
              />
            </div>
          )}

          {/* TAB 5: AI Computer Vision Analysis */}
          {activeTab === "ai-analysis" && (
            <AIAnomalyCenter 
              anomalies={filteredAnomalies}
              selectedElement={selectedElement}
              onSelectAnomaly={handleSelectAnomalyDirect}
              selectedAnomaly={selectedAnomaly}
            />
          )}

          {/* TAB 6: Gantt milestone schedules */}
          {activeTab === "schedules" && (
            <SchedulesView />
          )}

          {/* TAB 7: Activities (Physical audit trail logs) */}
          {activeTab === "activities" && (
            <AuditTrailViewer />
          )}

          {/* TAB 8: Customizable template reporting desk */}
          {activeTab === "reports" && (
            <ReportingCenter />
          )}

          {/* TAB 9: Quality Issues Ledger */}
          {activeTab === "issues" && (
            <IssuesView />
          )}

          {/* TAB 10: Warning notifications telemetry feed */}
          {activeTab === "notifications" && (
            <NotificationCenter />
          )}

          {/* TAB 11: Authorized users & Roles directory */}
          {activeTab === "users" && (
            <UsersView />
          )}

          {/* TAB 12: System preferences and API configs */}
          {activeTab === "settings" && (
            <SettingsView />
          )}

          {/* TAB 13: System Specs & Dev blueprints */}
          {activeTab === "architecture" && (
            <div className="flex flex-col gap-6 animate-fade-in" id="dev-blueprints-tab">
              <TechArchitecture />
              <ArchitectureExplorer />
            </div>
          )}

          {/* TAB 14: Product Requirements specs */}
          {activeTab === "prd" && (
            <PRDViewer />
          )}

          {/* TAB 15: Version 1.0 roadmap timelines */}
          {activeTab === "roadmap" && (
            <RoadmapViewer />
          )}

          {/* TAB 16: Interactive Design System Showcase */}
          {activeTab === "design-system" && (
            <DesignSystemView />
          )}

          {/* TAB 17: Enterprise Safety Intelligence Platform */}
          {activeTab === "safety-intelligence" && (
            <SafetyIntelligenceView />
          )}

          {/* TAB 18: Brutal Codebase Audit */}
          {activeTab === "audit" && (
            <BrutalAuditView />
          )}

          {/* TAB 18b: tracprogress.ai Enterprise Capabilities Engine */}
          {activeTab === "enterprise-engine" && (
            <TracProgressAIEngine />
          )}

          {/* TAB 18c: Phase 1 SLAM & Trajectory Specifications */}
          {activeTab === "phase1-slam" && (
            <Phase1SlamCapabilitiesEngine />
          )}

          {/* TAB 19: Next-Gen ACOS Operating System */}
          {activeTab === "acos" && (
            <FuturisticACOSView />
          )}

        </main>

        {/* COMPACT CLEAN FOOTER */}
        <footer className="h-11 bg-white border-t border-slate-200 flex items-center justify-between px-6 text-[10px] text-slate-400 shrink-0 font-mono select-none">
          <span>© 2026 tracprogress • Enterprise SaaS Platform</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Fast-API Connected</span>
            <span>RERA Tracker: Active</span>
          </div>
        </footer>

      </div>

    </div>
  );
}
