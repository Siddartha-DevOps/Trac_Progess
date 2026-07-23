import React, { useState } from "react";
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  Box, 
  Compass, 
  Sliders, 
  ShieldAlert, 
  FileText, 
  Check, 
  Clock, 
  ChevronRight, 
  RefreshCw, 
  Sparkles, 
  Activity, 
  Maximize2, 
  Crosshair,
  Ruler,
  Maximize,
  ArrowRight
} from "lucide-react";

interface TradePipelineStep {
  step: number;
  name: string;
  code: string;
  description: string;
}

interface TradeCategory {
  id: "mep" | "drywall" | "concrete";
  title: string;
  subtitle: string;
  icon: string;
  steps: TradePipelineStep[];
}

const TRADE_CATEGORIES: TradeCategory[] = [
  {
    id: "mep",
    title: "MEP / Electrical & Piping",
    subtitle: "Backbox -> Conduit -> Cable -> Faceplate",
    icon: "Zap",
    steps: [
      { step: 1, name: "Backbox Fitted", code: "BB-01", description: "In-wall junction backbox anchored to wall stud or concrete" },
      { step: 2, name: "Conduit Run Completed", code: "CD-02", description: "PVC/GI conduit pipe routed to main DB panel" },
      { step: 3, name: "Cable Pulled & Labeled", code: "CB-03", description: "Armored cable pulled, insulated, and circuit tagged" },
      { step: 4, name: "Faceplate & Trim Installed", code: "FP-04", description: "Final modular switch plate mounted and voltage tested" }
    ]
  },
  {
    id: "drywall",
    title: "Drywall / Interior Partitioning",
    subtitle: "Framing -> Insulation -> Board A/B -> Taping -> Paint",
    icon: "Layers",
    steps: [
      { step: 1, name: "Metal Framing Layout", code: "MF-01", description: "Floor/ceiling tracks & vertical C-studs aligned to grid" },
      { step: 2, name: "Acoustic Insulation Batt", code: "IN-02", description: "50mm Rockwool insulation stuffed into stud cavities" },
      { step: 3, name: "Board Side A (First Face)", code: "BA-03", description: "12.5mm Gypsum board screwed onto Stud Side A" },
      { step: 4, name: "Board Side B (Second Face)", code: "BB-04", description: "MEP signoff completed, board closed on Stud Side B" },
      { step: 5, name: "Taping & Joint Compound", code: "TJ-05", description: "Mesh tape and 3 coats of joint compound applied" },
      { step: 6, name: "Paint Coat 1 (Primer)", code: "PC-06", description: "Sanded smooth and high-build primer coat applied" }
    ]
  },
  {
    id: "concrete",
    title: "Concrete Structural",
    subtitle: "Formwork -> Rebar -> Pour -> Stripping -> Curing",
    icon: "Box",
    steps: [
      { step: 1, name: "Formwork Shuttering", code: "FW-01", description: "Plywood shuttering panels erected and braced" },
      { step: 2, name: "Rebar Cage Tied", code: "RB-02", description: "Steel reinforcement cage tied, cover blocks placed" },
      { step: 3, name: "Concrete Pouring", code: "CP-03", description: "M35 grade concrete poured, vibrated, and leveled" },
      { step: 4, name: "Formwork Stripping", code: "ST-04", description: "Deshuttering after 7-day initial strength gain" },
      { step: 5, name: "Moist Curing", code: "CR-05", description: "Hessian cloth moist curing maintained for 14 days" }
    ]
  }
];

interface ElementDetectionItem {
  id: string;
  name: string;
  bimGuid: string;
  location: string;
  tradeId: "mep" | "drywall" | "concrete";
  currentStepIndex: number; // 0-based index in steps array
  isCompleted: boolean;
  spatialDisalignment: {
    hasOffset: boolean;
    offsetCm: number;
    direction: string;
    toleranceCm: number;
    clashTarget?: string;
    severity: "none" | "minor" | "critical";
  };
  lastInspected: string;
}

const SAMPLE_ELEMENTS: ElementDetectionItem[] = [
  {
    id: "ELEM-101",
    name: "Conduit Trunk Line C-304",
    bimGuid: "BIM-ELE-9821-4A",
    location: "Corridor 3-A East",
    tradeId: "mep",
    currentStepIndex: 2, // Cable Pulled
    isCompleted: false,
    spatialDisalignment: {
      hasOffset: true,
      offsetCm: 15,
      direction: "South-East (+15cm Y-axis)",
      toleranceCm: 2,
      clashTarget: "HVAC Main Trunk Duct D-12",
      severity: "critical"
    },
    lastInspected: "Today 10:14 AM"
  },
  {
    id: "ELEM-102",
    name: "Partition Wall Boarding P-208",
    bimGuid: "BIM-DRY-3310-9B",
    location: "Executive Suite 312",
    tradeId: "drywall",
    currentStepIndex: 3, // Board Side B
    isCompleted: false,
    spatialDisalignment: {
      hasOffset: true,
      offsetCm: 4,
      direction: "West (-4cm X-axis)",
      toleranceCm: 1.5,
      clashTarget: "Plumbing Riser Pipe R-04",
      severity: "minor"
    },
    lastInspected: "Today 09:45 AM"
  },
  {
    id: "ELEM-103",
    name: "Column Concrete C-14",
    bimGuid: "BIM-CONC-0014-C",
    location: "Lobby Entrance Grid E-4",
    tradeId: "concrete",
    currentStepIndex: 4, // Curing
    isCompleted: true,
    spatialDisalignment: {
      hasOffset: false,
      offsetCm: 0.2,
      direction: "Plumb (0.2cm nominal)",
      toleranceCm: 1.0,
      severity: "none"
    },
    lastInspected: "Yesterday 04:30 PM"
  },
  {
    id: "ELEM-104",
    name: "Switch Backbox Module B-12",
    bimGuid: "BIM-ELE-1042-12",
    location: "Server Room 304",
    tradeId: "mep",
    currentStepIndex: 1, // Conduit Run
    isCompleted: false,
    spatialDisalignment: {
      hasOffset: false,
      offsetCm: 0.8,
      direction: "Nominal",
      toleranceCm: 1.5,
      severity: "none"
    },
    lastInspected: "Today 11:02 AM"
  }
];

export default function MultiStageTradeDetectionMatrix() {
  const [activeTradeId, setActiveTradeId] = useState<"mep" | "drywall" | "concrete">("mep");
  const [selectedElement, setSelectedElement] = useState<ElementDetectionItem>(SAMPLE_ELEMENTS[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const currentTradeCategory = TRADE_CATEGORIES.find(t => t.id === activeTradeId) || TRADE_CATEGORIES[0];
  const filteredElements = SAMPLE_ELEMENTS.filter(e => e.tradeId === activeTradeId && (
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                MULTI-STAGE TRADE & SUB-COMPONENT MATRIX
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-emerald-500/30">
                MICRO-LEVEL DETECTION ENGINE
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Layers className="w-8 h-8 text-indigo-400 shrink-0" />
              Trade Sub-Component Detection & Spatial Clash Matrix
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Replaces vague macro percentages with granular sub-component state machines (Backbox → Conduit → Cable → Faceplate). Automatically detects 3D spatial misalignments and trade clashes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => alert(`Generated BIM Spatial Alignment & Clash RFI for ${selectedElement.name}`)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              Dispatch Spatial Clash RFI
            </button>
          </div>
        </div>
      </div>

      {/* TRADE CATEGORY SELECTOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TRADE_CATEGORIES.map((cat) => {
          const isActive = activeTradeId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTradeId(cat.id);
                const firstElem = SAMPLE_ELEMENTS.find(e => e.tradeId === cat.id);
                if (firstElem) setSelectedElement(firstElem);
              }}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                isActive 
                  ? "bg-slate-900 border-indigo-500 shadow-xl ring-2 ring-indigo-500/30" 
                  : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  isActive ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                }`}>
                  {cat.steps.length} MICRO-STAGES
                </span>
                <ChevronRight className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-600"}`} />
              </div>

              <h3 className="text-sm font-bold text-white mt-3">{cat.title}</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">{cat.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ELEMENT STATE MACHINE INSPECTOR (6 COLS) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                {currentTradeCategory.title} Elements
              </h3>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search element..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white pl-7 pr-2 py-1 rounded-lg focus:outline-none focus:border-indigo-500 w-36"
              />
            </div>
          </div>

          {/* ELEMENT SELECTION CARDS */}
          <div className="space-y-3">
            {filteredElements.map((elem) => {
              const isSelected = selectedElement.id === elem.id;

              return (
                <div
                  key={elem.id}
                  onClick={() => setSelectedElement(elem)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-slate-950 border-indigo-500 shadow-md ring-1 ring-indigo-500/50" 
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">{elem.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {elem.bimGuid}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center justify-between mb-3">
                    <span>Location: <span className="text-indigo-300 font-semibold">{elem.location}</span></span>
                    <span className="text-[10px] font-mono text-slate-500">{elem.lastInspected}</span>
                  </div>

                  {/* MICRO-STAGE STEP PROGRESSION BAR */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-300 font-bold">
                        Stage {elem.currentStepIndex + 1}/{currentTradeCategory.steps.length}: {currentTradeCategory.steps[elem.currentStepIndex]?.name}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {Math.round(((elem.currentStepIndex + 1) / currentTradeCategory.steps.length) * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {currentTradeCategory.steps.map((st, i) => {
                        const isDone = i <= elem.currentStepIndex;
                        const isCurrent = i === elem.currentStepIndex;

                        return (
                          <div
                            key={st.step}
                            title={`${st.step}. ${st.name}`}
                            className={`h-2 flex-1 rounded-full transition-all ${
                              isCurrent ? "bg-indigo-500 animate-pulse" :
                              isDone ? "bg-emerald-500" :
                              "bg-slate-800"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* ANOMALY BADGE IF ANY */}
                  {elem.spatialDisalignment.hasOffset && (
                    <div className={`mt-3 p-2 rounded text-xs flex items-center justify-between font-mono ${
                      elem.spatialDisalignment.severity === "critical"
                        ? "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                        : "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                    }`}>
                      <span className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Spatial Offset: {elem.spatialDisalignment.offsetCm}cm ({elem.spatialDisalignment.direction})
                      </span>
                      <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-current">
                        {elem.spatialDisalignment.severity}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SPATIAL MISALIGNMENT & CLASH ENGINE (6 COLS) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5 flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  3D Spatial Misalignment & Trade Clash Engine
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                LiDAR / Computer Vision Vector Match
              </span>
            </div>

            {/* SELECTED ELEMENT DETAILS HEADER */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">{selectedElement.name}</h4>
                  <p className="text-xs text-indigo-400 font-mono mt-0.5">BIM GUID: {selectedElement.bimGuid} • {selectedElement.location}</p>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase ${
                  selectedElement.spatialDisalignment.severity === "critical" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                  selectedElement.spatialDisalignment.severity === "minor" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                  "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}>
                  {selectedElement.spatialDisalignment.severity === "none" ? "POSITION ACCURATE" : `${selectedElement.spatialDisalignment.severity} CLASH`}
                </span>
              </div>

              {/* STEP PIPELINE BREAKDOWN FOR SELECTED ELEMENT */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Sub-Component State Machine Sequence:
                </div>

                <div className="space-y-1.5">
                  {currentTradeCategory.steps.map((st, idx) => {
                    const isPassed = idx <= selectedElement.currentStepIndex;
                    const isCurrent = idx === selectedElement.currentStepIndex;

                    return (
                      <div 
                        key={st.step}
                        className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                          isCurrent ? "bg-indigo-950/60 border-indigo-500 text-white font-bold" :
                          isPassed ? "bg-slate-900/60 border-slate-800 text-slate-300" :
                          "bg-slate-950/40 border-slate-900 text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] text-slate-500 font-mono">
                              {st.step}
                            </div>
                          )}
                          <span>{st.name}</span>
                        </div>

                        <span className="text-[10px] font-mono text-slate-400">{st.code}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3D VECTOR SPATIAL OFFSET ANALYSIS BOX */}
            <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-2">
                <Ruler className="w-4 h-4 text-cyan-400" />
                Geometric Tolerances & Clash Target Vector
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Measured 3D Deviation</div>
                  <div className={`text-sm font-bold mt-0.5 ${
                    selectedElement.spatialDisalignment.hasOffset ? "text-rose-400" : "text-emerald-400"
                  }`}>
                    {selectedElement.spatialDisalignment.offsetCm} cm
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1">Vector: {selectedElement.spatialDisalignment.direction}</div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Allowed BIM Tolerance</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    ±{selectedElement.spatialDisalignment.toleranceCm} cm
                  </div>
                  <div className="text-[9px] text-indigo-400 mt-1">Status: {
                    selectedElement.spatialDisalignment.offsetCm > selectedElement.spatialDisalignment.toleranceCm ? "EXCEEDED" : "PASS"
                  }</div>
                </div>
              </div>

              {selectedElement.spatialDisalignment.clashTarget && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Inter-Trade Physical Spatial Clash
                  </div>
                  <p className="text-rose-200/80 text-[11px] leading-relaxed">
                    Element offsets directly into the volume reserved for <span className="font-bold text-white">{selectedElement.spatialDisalignment.clashTarget}</span>. Requires field adjustment before drywall closing.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Auto-linked to Autodesk Revit / Navisworks Clash Matrix
            </span>
            <button 
              onClick={() => alert(`Sent 3D Spatial Adjustment Work Order to site team for ${selectedElement.name}`)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors shadow"
            >
              Issue Site Vector Adjustment Ticket
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
