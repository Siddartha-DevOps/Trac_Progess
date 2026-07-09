import React, { useRef, useEffect, useState } from "react";
import { Upload, Scissors, RefreshCw, Layers, Database, Cpu, Sparkles, Sliders, Info, ShieldCheck, Check } from "lucide-react";
import { BIMElement, Anomaly } from "./types";
import { IBIMViewerEngine, BIMElementMetadata } from "./lib/bim/BIMViewerAbstraction";
import { IFCJsViewerEngine } from "./lib/bim/IFCJsViewerEngine";

interface BIMViewerProps {
  onSelectElement: (element: BIMElement | null) => void;
  selectedElement: BIMElement | null;
  anomalies: Anomaly[];
  currentWeek: number;
}

export default function BIMViewer({ onSelectElement, selectedElement, anomalies, currentWeek }: BIMViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<IBIMViewerEngine | null>(null);

  // Active modular engine state (for APS & xeokit modular design requirements)
  const [activeEngineName, setActiveEngineName] = useState<"ifc" | "aps" | "xeokit">("ifc");
  
  // Filtering & View parameters
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<"Structure" | "MEP" | "Arch" | null>(null);
  const [clippingAxis, setClippingAxis] = useState<"x" | "y" | "z" | null>(null);
  const [clippingPercentage, setClippingPercentage] = useState<number>(100);

  // List of active elements and selected details
  const [elements, setElements] = useState<BIMElementMetadata[]>([]);
  const [highlightedElement, setHighlightedElement] = useState<BIMElementMetadata | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // AI Automatic engine highlights state
  const [aiHighlightActive, setAiHighlightActive] = useState(false);

  // 1. Initialize modular BIM Engine (IFC.js Engine as primary MVP)
  useEffect(() => {
    if (!containerRef.current) return;

    // Instantiate primary IFC.js WebEngine MVP
    const engine = new IFCJsViewerEngine();
    engineRef.current = engine;

    // Initialize container and map callback selection
    engine.initialize(containerRef.current, {
      onSelect: (elemId: string | null) => {
        if (!elemId) {
          setHighlightedElement(null);
          onSelectElement(null);
          return;
        }

        const found = engine.getElements().find(e => e.id === elemId);
        if (found) {
          setHighlightedElement(found);
          
          // Map abstract metadata back to parent-expected BIMElement properties for sync
          const mapped: BIMElement = {
            id: found.id,
            name: found.name,
            category: found.category,
            type: found.type as any,
            progress: found.status === "completed" ? 100 : (found.status === "in_progress" ? 60 : (found.status === "delayed" ? 30 : 0)),
            status: found.status === "completed" ? "completed" : (found.status === "delayed" ? "delayed" : (found.status === "in_progress" ? "in_progress" : "not_started")),
            position: found.position,
            size: found.size,
            material: (found.properties["Material"] || found.properties["Material Grade"] || "Gypsum/Concrete Spec") as string,
            installationDate: found.floor === "Ground Floor" ? "Week 1" : (found.floor === "First Floor" ? "Week 3" : "Week 5"),
            anomalyId: found.id === "col_c4" ? "anom_rebar_density" : (found.id === "mep_duct_branch" ? "anom_duct_clash" : undefined)
          };
          onSelectElement(mapped);
        }
      }
    });

    setElements(engine.getElements());

    // Auto-resize handler
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync selected element changes from parent component (e.g., from Anomaly Center selection)
  useEffect(() => {
    if (selectedElement && engineRef.current) {
      const found = engineRef.current.getElements().find(e => e.id === selectedElement.id);
      if (found) {
        setHighlightedElement(found);
        engineRef.current.zoomToElement(found.id);
      }
    } else {
      setHighlightedElement(null);
    }
  }, [selectedElement]);

  // Update filters in underlying engine
  const handleFloorChange = (floor: string | null) => {
    setSelectedFloor(floor);
    engineRef.current?.setFloorFilter(floor);
  };

  const handleTradeChange = (trade: "Structure" | "MEP" | "Arch" | null) => {
    setSelectedTrade(trade);
    engineRef.current?.setTradeFilter(trade);
  };

  const handleSectionAxisChange = (axis: "x" | "y" | "z" | null) => {
    setClippingAxis(axis);
    engineRef.current?.setSectionCut(axis, clippingPercentage);
  };

  const handleSectionSliderChange = (val: number) => {
    setClippingPercentage(val);
    if (clippingAxis) {
      engineRef.current?.setSectionCut(clippingAxis, val);
    }
  };

  // 2. IFC File Upload and Dynamic Processing
  const handleIFCFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !engineRef.current) return;

    setIsProcessingFile(true);
    setUploadMessage("Parsing IFC coordinates, structural elements & metadata properties...");

    try {
      // Execute the model load parsed through our abstract loader
      const parsedElements = await engineRef.current.loadModel(file);
      setElements(parsedElements);
      setUploadMessage(`Successfully parsed & rendered "${file.name}" with ${parsedElements.length} IFC elements!`);
      
      // Clear after timer
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setUploadMessage("Error parsing standard IFC file formats. Generating default fallback views.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  // 3. API - Triggering dynamic highlights from AI engine automatically
  const triggerAIEngineAutoHighlight = () => {
    if (!engineRef.current) return;

    if (aiHighlightActive) {
      // Reset
      engineRef.current.clearHighlights();
      setAiHighlightActive(false);
    } else {
      // Highlight elements automatically based on their custom AI progress statuses
      elements.forEach(elem => {
        // Automatically inject the status to the BIM highlight layer
        engineRef.current?.setHighlight(elem.id, elem.status);
      });
      setAiHighlightActive(true);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900 flex flex-col rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      
      {/* Dynamic Overlay Messages (like upload notification) */}
      {uploadMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-indigo-500 text-indigo-300 font-medium px-4 py-2 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span>{uploadMessage}</span>
        </div>
      )}

      {/* Primary BIM Viewer Navigation / Header bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap justify-between items-center gap-4 z-20">
        
        {/* Modular Active Engine Abstraction Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active BIM Layer</span>
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveEngineName("ifc")}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                  activeEngineName === "ifc" 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                IFC.js WebEngine
              </button>
              <button
                onClick={() => setActiveEngineName("aps")}
                className="px-2 py-1 rounded text-[11px] font-semibold text-slate-500 cursor-not-allowed flex items-center gap-1"
                title="Autodesk Platform Services plug-in placeholder"
              >
                Autodesk APS
                <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-bold uppercase">Plug-in</span>
              </button>
              <button
                onClick={() => setActiveEngineName("xeokit")}
                className="px-2 py-1 rounded text-[11px] font-semibold text-slate-500 cursor-not-allowed flex items-center gap-1"
                title="xeokit plug-in placeholder"
              >
                xeokit
                <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-bold uppercase">Plug-in</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic File Uploader */}
        <div className="flex items-center gap-2">
          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-md border border-indigo-700 flex items-center gap-2 transition duration-150">
            <Upload className="w-4 h-4" />
            <span>Upload IFC File</span>
            <input
              type="file"
              accept=".ifc"
              className="hidden"
              onChange={handleIFCFileUpload}
              disabled={isProcessingFile}
            />
          </label>
        </div>

      </div>

      {/* Secondary Controls Bar: Floor, Trade, Section & AI API */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap justify-between items-center gap-4 z-20 text-xs">
        
        {/* Floor Selection */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Floors:</span>
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => handleFloorChange(null)}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition ${selectedFloor === null ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              All
            </button>
            {["Ground Floor", "First Floor", "Second Floor", "Roof"].map(flr => (
              <button
                key={flr}
                onClick={() => handleFloorChange(flr)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition ${selectedFloor === flr ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                {flr.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Trade Filtering */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Trades:</span>
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => handleTradeChange(null)}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition ${selectedTrade === null ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              All
            </button>
            {(["Structure", "Arch", "MEP"] as const).map(trd => (
              <button
                key={trd}
                onClick={() => handleTradeChange(trd)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition ${selectedTrade === trd ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                {trd === "Structure" ? "Structural" : (trd === "Arch" ? "Architectural" : "MEP")}
              </button>
            ))}
          </div>
        </div>

        {/* Section Views Control (Clipping planes) */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5 text-slate-400" />
            Section Plane:
          </span>
          <div className="flex gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => handleSectionAxisChange(null)}
              className={`w-7 h-6 rounded text-[10px] font-semibold transition flex items-center justify-center ${clippingAxis === null ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              Off
            </button>
            {(["x", "y", "z"] as const).map(axis => (
              <button
                key={axis}
                onClick={() => handleSectionAxisChange(axis)}
                className={`w-7 h-6 rounded text-[10px] font-bold uppercase transition flex items-center justify-center ${clippingAxis === axis ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
              >
                {axis}
              </button>
            ))}
          </div>

          {clippingAxis && (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={clippingPercentage}
                onChange={(e) => handleSectionSliderChange(parseInt(e.target.value))}
                className="w-16 accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 w-6">{clippingPercentage}%</span>
            </div>
          )}
        </div>

        {/* API Integration - Auto Highlight Elements */}
        <button
          onClick={triggerAIEngineAutoHighlight}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition text-[10px] uppercase tracking-wider ${
            aiHighlightActive 
              ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-300" 
              : "bg-indigo-600/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{aiHighlightActive ? "AI Highlights: On" : "AI Sync Highlight"}</span>
        </button>

      </div>

      {/* Main 3D Canvas stage and layout container */}
      <div className="flex-1 relative w-full flex min-h-0">
        
        {/* Canvas viewport (grows to fill left space) */}
        <div ref={containerRef} className="flex-1 h-full cursor-grab active:cursor-grabbing relative" id="ifcjs-canvas-container" />

        {/* Double click or keyboard instructions Overlay */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-relaxed max-w-[200px] pointer-events-none">
          <div className="font-bold text-slate-300 mb-1">Canvas Navigation:</div>
          <div>• Orbit: Drag Left Click</div>
          <div>• Pan: Shift + Drag / Right Click</div>
          <div>• Zoom: Scroll Wheel</div>
          <div>• Select: Click Elements</div>
        </div>

        {/* Interactive Legend (Fully detailed) */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5 bg-slate-950/90 backdrop-blur-md px-3 py-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 min-w-[140px]">
          <span className="font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1 mb-1.5">AI Progress Status</span>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Not Started / Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Not Detected</span>
          </div>
        </div>

      </div>

      {/* Element Metadata Details Panel (Bottom or Side drawer simulation inside view) */}
      {highlightedElement && (
        <div className="absolute top-44 right-4 w-72 max-h-[60%] bg-slate-950/95 backdrop-blur-lg border border-slate-800 rounded-xl p-4 shadow-2xl flex flex-col gap-3 overflow-y-auto text-xs text-slate-300 z-10 animate-fade-in">
          
          <div className="flex justify-between items-start border-b border-slate-800 pb-2 mb-1">
            <div>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-indigo-500/20 block w-max mb-1">
                {highlightedElement.category} - {highlightedElement.type}
              </span>
              <h4 className="font-bold text-slate-100 text-sm leading-tight">{highlightedElement.name}</h4>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-500">IFC GUID:</span>
              <span className="font-mono text-[10px] text-slate-300 select-all">{highlightedElement.guid}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-500">Level/Floor:</span>
              <span>{highlightedElement.floor}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span className="text-slate-500">Execution Status:</span>
              <span className={`font-bold ${
                highlightedElement.status === "completed" ? "text-emerald-400" : (highlightedElement.status === "in_progress" ? "text-yellow-400" : "text-red-400")
              }`}>
                {highlightedElement.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>

          {/* IFC Extracted Properties Grid */}
          <div className="flex flex-col gap-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block mb-1">IFC Attribute Schema</span>
            {Object.entries(highlightedElement.properties).map(([key, value]) => (
              <div key={key} className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-mono">{key}:</span>
                <span className="font-semibold text-slate-200 text-right">{String(value)}</span>
              </div>
            ))}
          </div>

        </div>
      )}



    </div>
  );
}
