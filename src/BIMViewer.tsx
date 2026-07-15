import React, { useRef, useEffect, useState } from "react";
import { 
  Upload, Scissors, RefreshCw, Layers, Database, Cpu, Sparkles, 
  Sliders, Info, ShieldCheck, Check, ZoomIn, ZoomOut, Move, 
  Ruler, Eye, EyeOff, Maximize, Minimize, Trash2, Compass, 
  ShieldAlert, CheckCircle
} from "lucide-react";
import { BIMElement, Anomaly } from "./types";
import { IBIMViewerEngine, BIMElementMetadata } from "./lib/bim/BIMViewerAbstraction";
import { IFCJsViewerEngine } from "./lib/bim/IFCJsViewerEngine";
import { useAppStore } from "./store";
import { BIM_ELEMENTS_LOOKUP } from "./data";

interface BIMViewerProps {
  onSelectElement: (element: BIMElement | null) => void;
  selectedElement: BIMElement | null;
  anomalies: Anomaly[];
  currentWeek: number;
}

export default function BIMViewer({ onSelectElement, selectedElement, anomalies, currentWeek }: BIMViewerProps) {
  const { activeProject } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerWrapperRef = useRef<HTMLDivElement>(null);
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

  // New States for Custom Viewer Toolbar
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);
  const [measurePoint1, setMeasurePoint1] = useState<[number, number, number] | null>(null);
  const [measurePoint2, setMeasurePoint2] = useState<[number, number, number] | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hiddenElementIds, setHiddenElementIds] = useState<string[]>([]);
  const [visibleTrades, setVisibleTrades] = useState<{ Structure: boolean; MEP: boolean; Arch: boolean }>({
    Structure: true,
    MEP: true,
    Arch: true,
  });
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(true);

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
            anomalyId: BIM_ELEMENTS_LOOKUP.find(lookup => lookup.id === found.id)?.anomalyId
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

    // Custom Camera coordination listeners
    const handleCameraCmd = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === "zoom-in") {
        engine.zoom("in");
      } else if (customEvent.detail === "zoom-out") {
        engine.zoom("out");
      } else if (customEvent.detail === "reset") {
        engine.resetCamera();
      }
    };
    window.addEventListener("bim-viewer-camera-cmd", handleCameraCmd);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("bim-viewer-camera-cmd", handleCameraCmd);
      engine.destroy();
      engineRef.current = null;
    };
  }, [activeProject.id]);

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

  // New Interactive Toolbar Handlers
  const handleZoom = (direction: "in" | "out") => {
    engineRef.current?.zoom(direction);
  };

  const handleResetCamera = () => {
    engineRef.current?.resetCamera();
  };

  const toggleMeasurementMode = () => {
    const nextMode = !isMeasuring;
    setIsMeasuring(nextMode);
    setMeasuredDistance(null);
    setMeasurePoint1(null);
    setMeasurePoint2(null);
    engineRef.current?.setMeasurementMode(nextMode, (distance, p1, p2) => {
      setMeasuredDistance(distance);
      if (p1) setMeasurePoint1(p1);
      if (p2) setMeasurePoint2(p2);
    });
  };

  const handleClearMeasurements = () => {
    engineRef.current?.clearMeasurements();
    setMeasuredDistance(null);
    setMeasurePoint1(null);
    setMeasurePoint2(null);
  };

  const handleToggleElementVisibility = (elementId: string) => {
    const isCurrentlyHidden = hiddenElementIds.includes(elementId);
    const nextVisible = isCurrentlyHidden; 
    
    engineRef.current?.toggleElementVisibility(elementId, nextVisible);
    
    if (isCurrentlyHidden) {
      setHiddenElementIds(prev => prev.filter(id => id !== elementId));
    } else {
      setHiddenElementIds(prev => [...prev, elementId]);
      if (selectedElement?.id === elementId) {
        onSelectElement(null);
      }
    }
  };

  const handleHideSelected = () => {
    if (!selectedElement) return;
    handleToggleElementVisibility(selectedElement.id);
  };

  const handleShowAll = () => {
    engineRef.current?.showAllElements();
    // Re-apply trade filters
    Object.entries(visibleTrades).forEach(([trade, visible]) => {
      elements.forEach(elem => {
        if (elem.category === trade) {
          engineRef.current?.toggleElementVisibility(elem.id, visible);
        }
      });
    });
    setHiddenElementIds([]);
  };

  const handleToggleTradeLayer = (trade: "Structure" | "MEP" | "Arch") => {
    const nextVisible = !visibleTrades[trade];
    setVisibleTrades(prev => ({ ...prev, [trade]: nextVisible }));
    
    elements.forEach(elem => {
      if (elem.category === trade) {
        const isIndividuallyHidden = hiddenElementIds.includes(elem.id);
        const shouldBeVisible = nextVisible && !isIndividuallyHidden;
        engineRef.current?.toggleElementVisibility(elem.id, shouldBeVisible);
      }
    });

    if (selectedElement && selectedElement.category === trade && !nextVisible) {
      onSelectElement(null);
    }
  };

  const toggleFullscreen = () => {
    if (!viewerWrapperRef.current) return;
    
    const element = viewerWrapperRef.current;
    if (!document.fullscreenElement) {
      element.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Error enabling fullscreen", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error("Error exiting fullscreen", err));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleFocusOnElement = (elementId: string) => {
    engineRef.current?.zoomToElement(elementId);
    const found = elements.find(e => e.id === elementId);
    if (found) {
      setHighlightedElement(found);
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
  };

  return (
    <div 
      ref={viewerWrapperRef}
      className={`relative w-full h-full bg-slate-900 flex flex-col overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "rounded-xl border border-slate-800 shadow-2xl"
      }`}
    >
      
      {/* Dynamic Overlay Messages (like upload notification) */}
      {uploadMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 border border-indigo-500 text-indigo-300 font-semibold px-4 py-2.5 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] text-xs flex items-center gap-2 animate-bounce">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span>{uploadMessage}</span>
        </div>
      )}

      {/* Primary BIM Viewer Navigation / Header bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-3 flex flex-wrap justify-between items-center gap-4 z-20">
        
        {/* Modular Active Engine Abstraction Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active BIM Layer</span>
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveEngineName("ifc")}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  activeEngineName === "ifc" 
                    ? "bg-indigo-600 text-white shadow-md font-bold" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                IFC.js WebEngine
              </button>
              <button
                onClick={() => setActiveEngineName("aps")}
                className="px-2.5 py-1 rounded text-[11px] font-semibold text-slate-500 cursor-not-allowed flex items-center gap-1"
                title="Autodesk Platform Services plug-in placeholder"
              >
                Autodesk APS
                <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-bold uppercase">Plug-in</span>
              </button>
              <button
                onClick={() => setActiveEngineName("xeokit")}
                className="px-2.5 py-1 rounded text-[11px] font-semibold text-slate-500 cursor-not-allowed flex items-center gap-1"
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
          <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition duration-150">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Load IFC Model File</span>
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
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Level:</span>
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => handleFloorChange(null)}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition ${selectedFloor === null ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              All Floors
            </button>
            {["Ground Floor", "First Floor", "Second Floor", "Roof"].map(flr => (
              <button
                key={flr}
                onClick={() => handleFloorChange(flr)}
                className={`px-2 py-1 rounded text-[10px] font-semibold transition ${selectedFloor === flr ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
              >
                {flr.split(" ")[0]} Lvl
              </button>
            ))}
          </div>
        </div>

        {/* Section Views Control (Clipping planes) */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5 text-slate-400" />
            Section Cut:
          </span>
          <div className="flex gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => handleSectionAxisChange(null)}
              className={`w-8 h-6 rounded text-[10px] font-semibold transition flex items-center justify-center ${clippingAxis === null ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
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
                className="w-20 accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{clippingPercentage}%</span>
            </div>
          )}
        </div>

        {/* AI Integration - Auto Highlight Elements */}
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
        <div className="flex-1 h-full relative bg-slate-950 flex flex-col min-w-0">
          
          <div ref={containerRef} className="flex-1 h-full cursor-grab active:cursor-grabbing relative" id="ifcjs-canvas-container" />

          {/* FLOATING PRIMARY WORKSPACE TOOLBAR (10 essential CAD utilities) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            
            {/* Zoom In / Out */}
            <button 
              onClick={() => handleZoom("in")}
              title="Zoom In"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleZoom("out")}
              title="Zoom Out"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

            {/* Reset View */}
            <button 
              onClick={handleResetCamera}
              title="Reset Camera Target"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <Compass className="w-4 h-4" />
            </button>

            {/* Pan & Rotate Helper Descriptors */}
            <button 
              disabled
              title="Rotate Mode (Left Click + Drag)"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 transition cursor-default"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              disabled
              title="Pan Mode (Shift + Drag or Right Click)"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 transition cursor-default"
            >
              <Move className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

            {/* Measurement Ruler Tool */}
            <button 
              onClick={toggleMeasurementMode}
              title={isMeasuring ? "Disable Measuring" : "Measure 3D Distances"}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                isMeasuring 
                  ? "bg-pink-600 text-white shadow-md animate-pulse" 
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Ruler className="w-4 h-4" />
            </button>

            {/* Clear Measurement Laser */}
            {(isMeasuring || measuredDistance !== null) && (
              <button 
                onClick={handleClearMeasurements}
                title="Clear Laser Measurements"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-pink-400 hover:text-pink-300 hover:bg-pink-950/20 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

            {/* Element Hide / Show */}
            <button 
              onClick={handleHideSelected}
              disabled={!selectedElement}
              title={selectedElement ? `Hide selected element: ${selectedElement.name}` : "Select element to hide"}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                selectedElement 
                  ? "text-red-400 hover:bg-red-950/20" 
                  : "text-slate-600 cursor-not-allowed"
              }`}
            >
              <EyeOff className="w-4 h-4" />
            </button>

            {hiddenElementIds.length > 0 && (
              <button 
                onClick={handleShowAll}
                title={`Show all elements (${hiddenElementIds.length} hidden)`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-950/20 transition relative"
              >
                <Eye className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-[8px] text-slate-950 font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-900">
                  {hiddenElementIds.length}
                </span>
              </button>
            )}

            <div className="w-[1px] h-5 bg-slate-800 mx-1" />

            {/* Toggle Layers list */}
            <button 
              onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
              title={isLayersPanelOpen ? "Collapse Hierarchy Panel" : "Expand Hierarchy Panel"}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                isLayersPanelOpen ? "text-indigo-400 bg-slate-800" : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button 
              onClick={toggleFullscreen}
              title="Toggle Fullscreen View"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

          </div>

          {/* ACTIVE NEON MEASUREMENT HUD OVERLAY */}
          {isMeasuring && (
            <div className="absolute top-20 left-4 z-10 bg-slate-950/90 backdrop-blur-md border border-pink-500/40 p-3.5 rounded-xl text-xs text-slate-300 shadow-2xl w-64 flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="font-extrabold text-pink-400 uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                  3D Laser Measuring Tool
                </span>
                <span className="text-[8px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded border border-pink-500/20 font-bold">ACTIVE</span>
              </div>

              <div className="flex flex-col gap-1.5 text-[10px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Node A Coordinates:</span>
                  <span className={measurePoint1 ? "text-pink-300" : "text-slate-500 italic"}>
                    {measurePoint1 ? `(${measurePoint1[0].toFixed(1)}, ${measurePoint1[1].toFixed(1)}, ${measurePoint1[2].toFixed(1)})` : "Click element..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Node B Coordinates:</span>
                  <span className={measurePoint2 ? "text-pink-300" : "text-slate-500 italic"}>
                    {measurePoint2 ? `(${measurePoint2[0].toFixed(1)}, ${measurePoint2[1].toFixed(1)}, ${measurePoint2[2].toFixed(1)})` : "Click target..."}
                  </span>
                </div>
              </div>

              {measuredDistance !== null ? (
                <div className="bg-pink-950/20 border border-pink-500/30 rounded-lg p-2.5 flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Calculated Span:</span>
                  <span className="text-sm font-extrabold text-pink-400 font-mono tracking-wide">
                    {measuredDistance.toFixed(3)} meters
                  </span>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic bg-slate-900/50 p-2 rounded-lg text-center">
                  Select any two object surfaces on the model canvas to capture laser length.
                </p>
              )}
            </div>
          )}

          {/* Double click or keyboard instructions Overlay */}
          <div className="absolute bottom-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-relaxed max-w-[210px] pointer-events-none">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              Canvas Navigation Guide:
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
              <div>• <span className="text-slate-300 font-medium">Orbit:</span> Drag Left Click</div>
              <div>• <span className="text-slate-300 font-medium">Pan:</span> Shift + Drag / Right Click</div>
              <div>• <span className="text-slate-300 font-medium">Zoom:</span> Scroll Wheel</div>
              <div>• <span className="text-slate-300 font-medium">Select:</span> Click element geometries</div>
            </div>
          </div>

          {/* Interactive Legend (Fully detailed) */}
          <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5 bg-slate-950/90 backdrop-blur-md px-3 py-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 min-w-[150px]">
            <span className="font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 mb-1">AI Progress Status</span>
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
              <span>Delayed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span>Not Started / Hidden</span>
            </div>
          </div>

        </div>

        {/* COLLAPSIBLE STRUCTURE AND LAYER SIDEBAR */}
        {isLayersPanelOpen && (
          <div className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col z-10 shrink-0 h-full overflow-y-auto">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div>
                <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  BIM Layers & Trees
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Discipline visibility matrix</p>
              </div>
              <span className="text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-slate-400 font-mono rounded">
                IFC4 Schema
              </span>
            </div>

            {/* Discipline Layers Section */}
            <div className="p-4 border-b border-slate-800 flex flex-col gap-3 bg-slate-950/40">
              <span className="font-bold text-[9px] text-slate-400 uppercase tracking-wider block">Discipline Layers</span>
              <div className="flex flex-col gap-2">
                
                {/* Structural Layer */}
                <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800/85">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                    <span className="text-[11px] font-semibold text-slate-300">Structural Skeleton</span>
                  </div>
                  <button 
                    onClick={() => handleToggleTradeLayer("Structure")}
                    title="Toggle Visibility"
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  >
                    {visibleTrades.Structure ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                  </button>
                </div>

                {/* Architectural Layer */}
                <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800/85">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-300">Architectural Shell</span>
                  </div>
                  <button 
                    onClick={() => handleToggleTradeLayer("Arch")}
                    title="Toggle Visibility"
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  >
                    {visibleTrades.Arch ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                  </button>
                </div>

                {/* MEP Services Layer */}
                <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-800/85">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-yellow-500" />
                    <span className="text-[11px] font-semibold text-slate-300">MEP Core Services</span>
                  </div>
                  <button 
                    onClick={() => handleToggleTradeLayer("MEP")}
                    title="Toggle Visibility"
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  >
                    {visibleTrades.MEP ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                  </button>
                </div>

              </div>
            </div>

            {/* Elements tree selection hierarchy */}
            <div className="p-4 flex flex-col gap-2.5 flex-1 min-h-0 bg-slate-950">
              <span className="font-bold text-[9px] text-slate-400 uppercase tracking-wider block">Model Element Tree</span>
              
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] scrollbar-thin pr-1">
                {elements.map(elem => {
                  const isHidden = hiddenElementIds.includes(elem.id);
                  const isSelected = selectedElement?.id === elem.id;
                  
                  return (
                    <div 
                      key={elem.id}
                      className={`group flex items-center justify-between p-2 rounded-lg border transition ${
                        isSelected 
                          ? "bg-indigo-600/10 border-indigo-500 text-white" 
                          : "bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700/60"
                      }`}
                    >
                      <button 
                        onClick={() => handleFocusOnElement(elem.id)}
                        className="flex-1 flex flex-col text-left items-start overflow-hidden pr-2"
                      >
                        <span className={`text-[10px] font-extrabold truncate leading-tight ${isSelected ? "text-indigo-300" : "text-slate-200 group-hover:text-slate-100"}`}>
                          {elem.name}
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono mt-0.5">
                          {elem.category} • {elem.floor}
                        </span>
                      </button>

                      <div className="flex items-center gap-1">
                        {/* Focus element */}
                        <button 
                          onClick={() => handleFocusOnElement(elem.id)}
                          title="Focus 3D Viewport on object"
                          className="w-5.5 h-5.5 rounded flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition"
                        >
                          <Compass className="w-3 h-3" />
                        </button>
                        
                        {/* Hide element */}
                        <button 
                          onClick={() => handleToggleElementVisibility(elem.id)}
                          title={isHidden ? "Show Element" : "Hide Element"}
                          className={`w-5.5 h-5.5 rounded flex items-center justify-center transition ${
                            isHidden 
                              ? "text-red-400 hover:bg-red-950/20" 
                              : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                          }`}
                        >
                          {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

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
