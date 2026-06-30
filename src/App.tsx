import React, { useState } from "react";
import BIMViewer from "./components/BIMViewer";
import AIAnomalyCenter from "./components/AIAnomalyCenter";
import TechArchitecture from "./components/TechArchitecture";
import DashboardMetrics from "./components/DashboardMetrics";
import { BIMElement, Anomaly, ProjectStats } from "./types";
import { 
  Building2, 
  MapPin, 
  Layers, 
  Sparkles, 
  HelpCircle, 
  Activity, 
  Database, 
  TrendingUp, 
  FlameKindling,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";

// Project Master Stats
const PROJECT_STATS: ProjectStats = {
  name: "Bangalore Tech Park - Block B",
  location: "Whitefield, Bengaluru, India",
  overallProgress: 72,
  totalCost: "₹18.5 Crores",
  constructionArea: "45,000 sq ft",
  targetDate: "Nov 2026",
  reraId: "KA-RERA-2026-0389"
};

// Site Anomalies matched with our 3D elements
const SITE_ANOMALIES: Anomaly[] = [
  {
    id: "anom_rebar_density",
    elementId: "col_c4",
    elementName: "Column C4",
    category: "Reinforcement",
    title: "Slab Reinforcement Spacing Discrepancy",
    description: "YOLO-v8 analysis of high-res drone image identifies 15% under-reinforcement density in structural Column C4. Stirrups spacing exceeds IFC design parameters by 85mm.",
    level: "critical",
    deviation: "Spacing deviation of +85mm vs. IFC4 standard",
    possibleCause: "Sub-contractor drawing misinterpretation or rebar shortage",
    status: "open",
    detectedAt: "Week 2 - Photo Scan ID #88"
  },
  {
    id: "anom_duct_clash",
    elementId: "mep_duct_branch",
    elementName: "Branch HVAC Duct C4",
    category: "MEP Collision",
    title: "HVAC Duct to Fire Sprinkler Piping Collision",
    description: "3D Spatial clash solver flags L1 branch duct colliding directly with the CPVC sprinkler line. Restricts architectural drywall partition erection in L1 Zone B.",
    level: "high",
    deviation: "18.5cm volumetric structural collision",
    possibleCause: "Central coordination error between MEP and HVAC draftsmen",
    status: "open",
    detectedAt: "Week 4 - Drone Scan ID #92"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"tracker" | "ai" | "architecture">("tracker");
  const [currentWeek, setCurrentWeek] = useState<number>(3); // Default to Week 3
  const [selectedElement, setSelectedElement] = useState<BIMElement | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  // Syncing selection from 3D model to active anomaly
  const handleSelectElement = (element: BIMElement | null) => {
    setSelectedElement(element);
    if (element && element.anomalyId) {
      const matchedAnom = SITE_ANOMALIES.find(a => a.id === element.anomalyId);
      if (matchedAnom) {
        setSelectedAnomaly(matchedAnom);
      } else {
        setSelectedAnomaly(null);
      }
    } else {
      setSelectedAnomaly(null);
    }
  };

  const handleSelectAnomalyDirect = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
    // Find the associated elements to highlight
    const matchedElem = BIM_ELEMENTS_LOOKUP.find(e => e.id === anomaly.elementId);
    if (matchedElem) {
      setSelectedElement(matchedElem);
    }
  };

  // Helper dictionary to lookup elements in App.tsx
  const BIM_ELEMENTS_LOOKUP = [
    { id: "col_c4", name: "Structural Column C4", anomalyId: "anom_rebar_density" },
    { id: "mep_duct_branch", name: "HVAC Branch Duct C4", anomalyId: "anom_duct_clash" }
  ] as any[];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Upper Navigation / Control Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">BuildTrace India</h1>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full border border-indigo-100">
                  Buildots Alternative
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {PROJECT_STATS.location}
              </p>
            </div>
          </div>

          {/* Quick RERA & Budget HUD */}
          <div className="hidden lg:flex gap-6 items-center text-xs">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">RERA Registration</span>
              <span className="font-semibold text-slate-700">{PROJECT_STATS.reraId}</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">BIM Baseline Budget</span>
              <span className="font-semibold text-slate-700">{PROJECT_STATS.totalCost}</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Construction Stage</span>
              <span className="font-semibold text-slate-700">L1 Structure + Finishing</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 text-xs">
            <button
              onClick={() => setActiveTab("tracker")}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                activeTab === "tracker" 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4" />
              3D Site Tracker
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                activeTab === "ai" 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Anomaly Center
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                activeTab === "architecture" 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Database className="w-4 h-4" />
              Architecture Spec
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* TAB 1: 3D Site Tracker & Dashboard */}
        {activeTab === "tracker" && (
          <div className="flex flex-col gap-6">
            
            {/* Top Workspace Grid (3D model + Inspection Panel) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
              
              {/* 3D Model Viewer (8 Cols) */}
              <div className="lg:col-span-8 h-[550px] relative">
                <BIMViewer 
                  onSelectElement={handleSelectElement} 
                  selectedElement={selectedElement}
                  anomalies={SITE_ANOMALIES}
                  currentWeek={currentWeek}
                />
              </div>

              {/* Elements Specs Inspection Panel (4 Cols) */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                
                <div>
                  <div className="border-b border-slate-100 pb-3.5 mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                      <Activity className="w-4 h-4 text-indigo-500" />
                      Spatial Object Inspector
                    </h3>
                    <p className="text-[11px] text-slate-400">Click elements inside the 3D canvas above to load IFC parameters</p>
                  </div>

                  {selectedElement ? (
                    <div className="flex flex-col gap-4 text-xs">
                      
                      {/* Status Header */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">{selectedElement.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          selectedElement.status === "completed" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : (selectedElement.status === "delayed" ? "bg-red-50 text-red-700 border border-red-200" : "bg-blue-50 text-blue-700 border border-blue-200")
                        }`}>
                          {selectedElement.status}
                        </span>
                      </div>

                      {/* Specs Metadata */}
                      <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">BIM Domain</span>
                          <span className="font-bold text-slate-700">{selectedElement.category} ({selectedElement.type})</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Material Grade</span>
                          <span className="font-bold text-slate-700">{selectedElement.material || "IFC Custom Spec"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target Week</span>
                          <span className="font-bold text-slate-700">{selectedElement.installationDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Computed Progress</span>
                          <span className="font-bold text-indigo-600">{selectedElement.progress}% Complete</span>
                        </div>
                      </div>

                      {/* Anomaly Sync Block if applicable */}
                      {selectedElement.anomalyId && selectedAnomaly && (
                        <div className="bg-red-50/70 p-3.5 rounded-lg border border-red-100 flex flex-col gap-2">
                          <div className="flex items-center gap-1.5 text-red-800 font-bold">
                            <FlameKindling className="w-4 h-4 text-red-500 animate-pulse" />
                            <span>BuildTrace Computer Vision Alert</span>
                          </div>
                          <p className="text-[11px] text-red-700 leading-relaxed">
                            {selectedAnomaly.title}. {selectedAnomaly.deviation}. This is triggering scheduling delay warnings for upper floors.
                          </p>
                          <button
                            onClick={() => {
                              setActiveTab("ai");
                            }}
                            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 mt-1 flex items-center gap-1 bg-white border border-indigo-200 px-3 py-1.5 rounded-md shadow-sm transition"
                          >
                            Generate Gemini Remediation Plan <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {!selectedElement.anomalyId && (
                        <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100 flex items-center gap-2 text-emerald-800 text-[11px]">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Spatial coordinates match virtual BIM specifications. No computer vision discrepancies detected.</span>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="h-[250px] flex flex-col justify-center items-center text-center p-4 border border-dashed border-slate-200 rounded-lg text-slate-400">
                      <Layers className="w-10 h-10 text-slate-300 mb-2" />
                      <h4 className="font-semibold text-slate-700 text-xs mb-0.5">No Object Loaded</h4>
                      <p className="text-[11px] leading-relaxed max-w-[200px]">
                        Rotate the 3D model with your cursor and click on any column, duct, or slab to inspect CAD specifications and photogrammetry overlays.
                      </p>
                    </div>
                  )}
                </div>

                {/* Educational specs card (RERA / India-conforming) */}
                <div className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-col gap-1.5 text-[11px] mt-4">
                  <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[9px]">How BuildTrace Works:</span>
                  <p className="text-slate-300 leading-relaxed">
                    Drone cameras capture ultra-high resolution orthomosaics. Our backend FastAPI aligns these scans over 3D BIM coordinate models, using instance segmentation to check progress against RERA schedules.
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom Dashboard Metrics & Timeline Player */}
            <DashboardMetrics 
              stats={PROJECT_STATS} 
              currentWeek={currentWeek} 
              setCurrentWeek={setCurrentWeek} 
              elements={BIM_ELEMENTS_LOOKUP}
              anomalies={SITE_ANOMALIES}
            />

          </div>
        )}

        {/* TAB 2: AI Anomaly Center */}
        {activeTab === "ai" && (
          <AIAnomalyCenter 
            anomalies={SITE_ANOMALIES}
            selectedElement={selectedElement}
            onSelectAnomaly={handleSelectAnomalyDirect}
            selectedAnomaly={selectedAnomaly}
          />
        )}

        {/* TAB 3: Technical Architecture & Python Pipeline Logs */}
        {activeTab === "architecture" && (
          <TechArchitecture />
        )}

      </main>

      {/* Styled Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 BuildTrace India - AI-driven Site Progress Monitoring Platform for Indian Infrastructure development.</p>
          <div className="flex gap-4 font-mono text-[10px]">
            <span>FastAPI: Online</span>
            <span>PyTorch CUDA: Connected</span>
            <span>RERA Tracker: Aligned</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
