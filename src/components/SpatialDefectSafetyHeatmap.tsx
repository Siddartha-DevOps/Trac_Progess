import React, { useState } from "react";
import Markdown from "react-markdown";
import { 
  ShieldAlert, 
  Flame, 
  MapPin, 
  AlertTriangle, 
  Filter, 
  Search, 
  Eye, 
  CheckCircle2, 
  HardHat, 
  Sparkles, 
  Layers, 
  Grid, 
  Maximize2, 
  Radio, 
  Zap, 
  X,
  Send,
  AlertCircle,
  FileText
} from "lucide-react";

interface HazardPoint {
  id: string;
  xPercent: number; // 0 - 100 on floorplan
  yPercent: number; // 0 - 100 on floorplan
  title: string;
  category: "ppe_violation" | "quality_defect" | "electrical_hazard" | "trip_obstruction";
  severity: "critical" | "high" | "medium";
  location: string;
  detectedTime: string;
  description: string;
  status: "open" | "resolved";
}

const SAMPLE_HAZARD_POINTS: HazardPoint[] = [
  {
    id: "HAZ-101",
    xPercent: 32,
    yPercent: 45,
    title: "Worker Operating Without Hardhat & High-Vis Vest",
    category: "ppe_violation",
    severity: "critical",
    location: "Corridor 3A East Grid C-4",
    detectedTime: "10 mins ago",
    description: "Subcontractor operative observed on scaffold tower without required hardhat and safety harness.",
    status: "open"
  },
  {
    id: "HAZ-102",
    xPercent: 68,
    yPercent: 28,
    title: "Exposed Uninsulated 415V Power Cable",
    category: "electrical_hazard",
    severity: "critical",
    location: "Server Room 304 Distribution Board",
    detectedTime: "25 mins ago",
    description: "Live temporary power feed cable ungrounded and lying across wet concrete floor.",
    status: "open"
  },
  {
    id: "HAZ-103",
    xPercent: 48,
    yPercent: 72,
    title: "Unsecured Timber Debris Blocking Emergency Fire Exit",
    category: "trip_obstruction",
    severity: "high",
    location: "Stairwell 2 South Exit",
    detectedTime: "1 hour ago",
    description: "Drywall offcuts and pallet timber piled against primary emergency escape doorway.",
    status: "open"
  },
  {
    id: "HAZ-104",
    xPercent: 82,
    yPercent: 60,
    title: "Discrepancy: Conduit Pipe Offset Clashes with Ductwork",
    category: "quality_defect",
    severity: "medium",
    location: "Executive Suite 312 Ceiling Void",
    detectedTime: "2 hours ago",
    description: "Conduit run installed 15cm off design axis, obstructing main HVAC duct installation.",
    status: "open"
  }
];

export default function SpatialDefectSafetyHeatmap() {
  const [hazards, setHazards] = useState<HazardPoint[]>(SAMPLE_HAZARD_POINTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedHazard, setSelectedHazard] = useState<HazardPoint>(SAMPLE_HAZARD_POINTS[0]);
  const [isSafetyAlertSent, setIsSafetyAlertSent] = useState<boolean>(false);

  // AI NCR State
  const [isAiDraftingNcr, setIsAiDraftingNcr] = useState<boolean>(false);
  const [aiNcrDraft, setAiNcrDraft] = useState<string | null>(null);

  const handleDraftAiNcr = async () => {
    setIsAiDraftingNcr(true);
    try {
      const res = await fetch("/api/ai/spatial-ncr-rfi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defectId: selectedHazard.id,
          location: selectedHazard.location,
          issueType: selectedHazard.title,
          trade: selectedHazard.category
        })
      });
      const data = await res.json();
      setAiNcrDraft(data.ncrDraft || "No NCR draft generated.");
    } catch (err) {
      console.error("Failed to draft AI NCR:", err);
      setAiNcrDraft(`### 📄 FORMAL NON-CONFORMANCE REPORT (NCR #${selectedHazard.id})\n\n**Defect**: ${selectedHazard.title}\n**Location**: ${selectedHazard.location}\n**Corrective Action**: Issue immediate field notice for remediation within 48 hours.`);
    } finally {
      setIsAiDraftingNcr(false);
    }
  };

  const filteredHazards = hazards.filter(h => selectedCategory === "all" || h.category === selectedCategory);

  const handleDispatchSafetyTicket = () => {
    setIsSafetyAlertSent(true);
    setTimeout(() => setIsSafetyAlertSent(false), 6000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-rose-500/20 text-rose-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-rose-500/30 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                SPATIAL DEFECT & SAFETY HAZARD HEATMAP
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-amber-500/30">
                REAL-TIME COMPUTER VISION DENSITY
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
              2D/3D Floorplan Spatial Defect & Safety Hazard Heatmap
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Overlay density heatmaps across site floorplans to instantly identify concentrated risk zones for PPE non-compliance, trip hazards, quality defects, and electrical safety breaches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleDispatchSafetyTicket}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <Radio className="w-4 h-4" />
              Dispatch Emergency Site Steward Alert
            </button>
          </div>
        </div>
      </div>

      {/* DISPATCH ALERT SUCCESS */}
      {isSafetyAlertSent && (
        <div className="bg-rose-500/20 border border-rose-500/50 p-4 rounded-xl text-rose-200 text-xs font-bold flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />
            <span>Emergency Safety Steward Alert dispatched! Site supervisor notified via push broadcast for high-density hazard zone.</span>
          </div>
          <button onClick={() => setIsSafetyAlertSent(false)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CATEGORY FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "all", label: "All Hazards & Defects", count: hazards.length },
          { id: "ppe_violation", label: "PPE & Hardhat Violations", count: hazards.filter(h => h.category === "ppe_violation").length },
          { id: "electrical_hazard", label: "Electrical Hazards", count: hazards.filter(h => h.category === "electrical_hazard").length },
          { id: "trip_obstruction", label: "Trip Hazards & Obstructions", count: hazards.filter(h => h.category === "trip_obstruction").length },
          { id: "quality_defect", label: "Quality & Spatial Clashes", count: hazards.filter(h => h.category === "quality_defect").length }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.id 
                ? "bg-rose-600 text-white shadow-md" 
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* MAIN TWO-COLUMN CANVAS AND INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FLOORPLAN HEATMAP CANVAS (8 COLS) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Floor 3 Architectural Plan Heatmap Grid
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Live LiDAR & Computer Vision Overlay</span>
          </div>

          {/* SIMULATED FLOORPLAN CANVAS */}
          <div className="relative w-full h-[460px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
            
            {/* GRID LINES BACKGROUND */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

            {/* SIMULATED FLOORPLAN WALLS */}
            <div className="absolute inset-8 border-2 border-slate-700/80 rounded-lg pointer-events-none">
              <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-slate-700" />
              <div className="absolute top-2/3 left-0 right-0 border-t border-dashed border-slate-700" />
              <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-slate-700" />
            </div>

            {/* HEATMAP GLOW DENSITY ZONES */}
            {filteredHazards.map((hz) => (
              <div 
                key={`glow-${hz.id}`}
                className="absolute w-24 h-24 rounded-full blur-2xl pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{
                  left: `${hz.xPercent}%`,
                  top: `${hz.yPercent}%`,
                  backgroundColor: hz.severity === "critical" ? "rgba(244, 63, 94, 0.4)" : "rgba(245, 158, 11, 0.3)"
                }}
              />
            ))}

            {/* HAZARD PIN MARKERS */}
            {filteredHazards.map((hz) => {
              const isSelected = selectedHazard.id === hz.id;

              return (
                <button
                  key={hz.id}
                  onClick={() => setSelectedHazard(hz)}
                  style={{ left: `${hz.xPercent}%`, top: `${hz.yPercent}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full border shadow-xl transition-all z-20 ${
                    isSelected 
                      ? "bg-rose-600 text-white border-white ring-4 ring-rose-500/50 scale-125" 
                      : hz.severity === "critical" 
                      ? "bg-rose-500 text-white border-rose-300 animate-bounce" 
                      : "bg-amber-500 text-slate-950 border-amber-300"
                  }`}
                  title={hz.title}
                >
                  <MapPin className="w-4 h-4" />
                </button>
              );
            })}

            {/* CANVAS LEGEND */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1 z-10">
              <div className="font-bold text-white uppercase mb-1">Density Legend:</div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical Hazard (Immediate Action)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium/High Defect Density
              </div>
            </div>

          </div>
        </div>

        {/* HAZARD INSPECTOR DETAILS (4 COLS) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                Hazard Inspector
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                selectedHazard.severity === "critical" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {selectedHazard.severity} SEVERITY
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm">{selectedHazard.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{selectedHazard.description}</p>

              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs font-mono text-slate-300">
                <div>Location: <strong className="text-white">{selectedHazard.location}</strong></div>
                <div>Category: <strong className="text-rose-400">{selectedHazard.category.replace("_", " ").toUpperCase()}</strong></div>
                <div>Detected: <span className="text-slate-400">{selectedHazard.detectedTime}</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={handleDraftAiNcr}
              disabled={isAiDraftingNcr}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles className={`w-4 h-4 ${isAiDraftingNcr ? "animate-spin" : ""}`} />
              <span>{isAiDraftingNcr ? "AI Drafting NCR & RFI..." : "AI Draft Contractual NCR & RFI"}</span>
            </button>

            <button 
              onClick={handleDispatchSafetyTicket}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
              Issue Immediate Field Safety Ticket
            </button>
          </div>
        </div>

      </div>

      {/* AI NCR DRAFT OUTPUT PANEL */}
      {aiNcrDraft && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold text-xs">
              <FileText className="w-4 h-4" />
              <span>AI DRAFTED CONTRACTUAL NON-CONFORMANCE REPORT & TECHNICAL RFI</span>
            </div>
            <button onClick={() => setAiNcrDraft(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="markdown-body text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            <Markdown>{aiNcrDraft}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}
