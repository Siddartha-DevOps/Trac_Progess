import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Layers, 
  Maximize, 
  Minimize, 
  Sliders, 
  ZoomIn, 
  ZoomOut, 
  MapPin, 
  Info, 
  Eye, 
  Move,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from "lucide-react";

interface Hotspot {
  id: string;
  title: string;
  bimStatus: string;
  siteStatus: string;
  discrepancy: boolean;
  desc: string;
  x: number; // percentage coordinate
  y: number; // percentage coordinate
}

const SAMPLE_HOTSPOTS: Hotspot[] = [
  {
    id: "pin-hvac",
    title: "Overhead Supply Duct Junction L2",
    bimStatus: "Galvanized Steel Duct, 400x400 mm",
    siteStatus: "Correctly Installed (Within ±5mm tolerance)",
    discrepancy: false,
    desc: "AI verified cross-section mapping against BIM models. Air balance damper is aligned with local building code.",
    x: 45,
    y: 28
  },
  {
    id: "pin-conduit",
    title: "Electrical Outlet Conduit Box L2",
    bimStatus: "Dual Recessed Box (Structural Core)",
    siteStatus: "OMITTED (Drywall sheet covered without outlet)",
    discrepancy: true,
    desc: "Critical omission alert: Drywall crew sheeted this sector before conduit termination was finished. Immediate punch-list issue issued.",
    x: 72,
    y: 64
  },
  {
    id: "pin-column",
    title: "Concrete Structural Column C-24",
    bimStatus: "Vertical Core Cast, Grade M40 Concrete",
    siteStatus: "Deviated (Rotated 4.2° off-axis)",
    discrepancy: true,
    desc: "Laser scan alignment warning. Rotational misalignment detected. Structural engineering sign-off required.",
    x: 24,
    y: 52
  }
];

export default function InteractiveComparison() {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
  const [zoom, setZoom] = useState<number>(1); // 1x to 2.5x
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(100); // Overlay layer opacity
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(SAMPLE_HOTSPOTS[1]);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef<boolean>(false);
  const isPanning = useRef<boolean>(false);
  const startPanX = useRef<number>(0);
  const startPanY = useRef<number>(0);

  // Handle middle slider dragging
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleMouseDownSlider = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingSlider.current = true;
    document.addEventListener("mousemove", handleMouseMoveGlobal);
    document.addEventListener("mouseup", handleMouseUpGlobal);
  };

  const handleMouseMoveGlobal = (e: MouseEvent) => {
    if (isDraggingSlider.current) {
      handleSliderMove(e.clientX);
    } else if (isPanning.current) {
      const dx = e.clientX - startPanX.current;
      const dy = e.clientY - startPanY.current;
      setPanX(dx);
      setPanY(dy);
    }
  };

  const handleMouseUpGlobal = () => {
    isDraggingSlider.current = false;
    isPanning.current = false;
    document.removeEventListener("mousemove", handleMouseMoveGlobal);
    document.removeEventListener("mouseup", handleMouseUpGlobal);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  // Panning control
  const handleMouseDownViewport = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement || isDraggingSlider.current) return;
    isPanning.current = true;
    startPanX.current = e.clientX - panX;
    startPanY.current = e.clientY - panY;
    document.addEventListener("mousemove", handleMouseMoveGlobal);
    document.addEventListener("mouseup", handleMouseUpGlobal);
  };

  const resetViewport = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setSliderPos(50);
  };

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col" id="interactive-bim-comparison">
      {/* Header Info */}
      <div className="bg-[#121620]/80 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#daff00]/10 text-[#daff00] font-mono text-[10px] font-bold border border-[#daff00]/20 uppercase">Module D-2</span>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#daff00]" />
              Interactive 3D BIM vs Site Reality Comparison
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Drag the slider to sweep between the digital twin CAD model and standard panoramic site photos.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#daff00] animate-pulse" />
          <span>COORD_GRID_ALIGNED • OFFSET: 3.5mm</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Swiper Viewport (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          
          {/* Swiper Stage */}
          <div 
            ref={containerRef}
            onMouseDown={handleMouseDownViewport}
            className={`h-[400px] md:h-[480px] w-full bg-slate-950 rounded-xl relative overflow-hidden select-none cursor-grab ${
              isPanning.current ? "cursor-grabbing" : ""
            }`}
          >
            {/* The Pan-and-Zoom Wrapper container */}
            <div 
              style={{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isPanning.current ? "none" : "transform 0.1s ease-out"
              }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {/* Left Viewport Side: BIM WIREFRAME (Shows when slider is on the right) */}
              <div className="absolute inset-0 w-full h-full">
                {/* Visual BIM grid / vector lines */}
                <div 
                  className="absolute inset-0 opacity-80"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(34,197,94,0.15) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(34,197,94,0.15) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px"
                  }}
                />
                {/* 3D wireframe render styled structure */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600">
                  {/* Styled BIM Wireframe geometry lines matching the actual construction photos */}
                  {/* Beam structures */}
                  <path d="M 50,50 L 950,50 M 50,550 L 950,550 M 50,50 L 50,550 M 950,50 L 950,550" stroke="rgba(34,197,94,0.4)" strokeWidth="3" fill="none" />
                  <path d="M 50,200 L 950,200 M 50,380 L 950,380" stroke="rgba(34,197,94,0.3)" strokeWidth="2" fill="none" />
                  {/* Columns */}
                  <line x1="250" y1="50" x2="250" y2="550" stroke="rgba(34,197,94,0.5)" strokeWidth="4" />
                  <line x1="750" y1="50" x2="750" y2="550" stroke="rgba(34,197,94,0.5)" strokeWidth="4" />
                  {/* HVAC ducting (MEP Overlay) */}
                  <rect x="300" y="100" width="400" height="80" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.7)" strokeWidth="2" strokeDasharray="5 5" />
                  <line x1="300" y1="140" x2="700" y2="140" stroke="rgba(59,130,246,0.5)" strokeWidth="1" />
                  
                  {/* BIM metadata tags */}
                  <text x="320" y="130" fill="rgba(59,130,246,0.8)" fontSize="10" fontFamily="monospace">BIM_SPEC: DUCT_HVAC_400x400</text>
                  <text x="70" y="90" fill="rgba(34,197,94,0.8)" fontSize="10" fontFamily="monospace">BIM_SPEC: COLUMN_M40_REBAR_C12</text>
                </svg>
              </div>

              {/* Right Viewport Side: ACTUAL SITE IMAGE (Clipped by current slider index) */}
              <div 
                className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
                style={{
                  clipPath: `polygon(${sliderPos}% 0%, 100% 0%, 100% 100%, ${sliderPos}% 100%)`
                }}
              >
                {/* Background high-resolution construction photo */}
                <img 
                  src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=85" 
                  alt="Actual site reality progress" 
                  className="w-full h-full object-cover select-none"
                  style={{ opacity: opacity / 100 }}
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay details that represent real physical installations */}
                <div className="absolute inset-0 bg-slate-950/10 pointer-events-none" />
              </div>

              {/* Hotspot Marks (Drawn relative to zoom/pan) */}
              {showHotspots && (
                <div className="absolute inset-0 w-full h-full pointer-events-auto">
                  {SAMPLE_HOTSPOTS.map((pin) => {
                    const isSelected = selectedHotspot?.id === pin.id;
                    return (
                      <button
                        key={pin.id}
                        onClick={() => setSelectedHotspot(pin)}
                        style={{
                          left: `${pin.x}%`,
                          top: `${pin.y}%`
                        }}
                        className={`absolute w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                          isSelected
                            ? "bg-amber-400 text-slate-950 scale-125 shadow-lg shadow-amber-400/50 ring-4 ring-white"
                            : pin.discrepancy
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-emerald-500 text-white"
                        }`}
                      >
                        {pin.discrepancy ? (
                          <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Draggable vertical divider bar */}
            <div 
              style={{ left: `${sliderPos}%` }}
              onMouseDown={handleMouseDownSlider}
              onTouchMove={handleTouchMove}
              className="absolute top-0 bottom-0 w-1 bg-amber-400 cursor-ew-resize z-30 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.5)] pointer-events-auto"
            >
              <div className="w-6 h-6 rounded-full bg-amber-400 hover:bg-amber-300 border border-slate-950 shadow-md flex items-center justify-center">
                <Move className="w-3.5 h-3.5 text-slate-900" />
              </div>
            </div>

            {/* Label hints on top of viewport */}
            <div className="absolute top-3 left-3 z-20 bg-slate-950/75 border border-slate-800 px-2.5 py-1 rounded text-[10px] font-mono text-emerald-400 pointer-events-none font-bold uppercase tracking-wide">
              ◀ BIM (Design)
            </div>
            <div className="absolute top-3 right-3 z-20 bg-slate-950/75 border border-slate-800 px-2.5 py-1 rounded text-[10px] font-mono text-amber-400 pointer-events-none font-bold uppercase tracking-wide">
              Site Reality (Walkphoto) ▶
            </div>

            {/* In-viewport Toolbars */}
            <div className="absolute bottom-3 left-3 z-20 bg-slate-950/80 border border-slate-800 p-1.5 rounded-lg flex items-center gap-1.5 pointer-events-auto">
              <button 
                onClick={() => setZoom(prev => Math.min(2.5, prev + 0.25))}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoom(prev => Math.max(1, prev - 0.25))}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={resetViewport}
                className="text-[9px] font-mono font-bold px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
              >
                RESET VIEW
              </button>
            </div>

            {/* Right side controls */}
            <div className="absolute bottom-3 right-3 z-20 bg-slate-950/80 border border-slate-800 p-1.5 rounded-lg flex items-center gap-3 pointer-events-auto text-[10px] text-slate-300 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Hotspots:</span>
                <button
                  onClick={() => setShowHotspots(!showHotspots)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    showHotspots ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {showHotspots ? "ON" : "OFF"}
                </button>
              </div>
              <button 
                onClick={toggleFullscreen}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                title="Fullscreen Toggle"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Hotspot Inspector Side (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-500" />
              Overlay Parameters & Inspector
            </h4>
          </div>

          {/* Opacity slider */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wide">Site Photo Opacity</span>
              <span className="font-mono text-amber-400 font-bold">{opacity}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-900 h-1 rounded cursor-pointer"
            />
            <span className="text-[9px] text-slate-500 mt-0.5">Control visual overlay balance. Fade the reality capture entirely out to see the pure IFC spatial coordinate structure.</span>
          </div>

          {/* Current selected hotspot description panel */}
          {selectedHotspot ? (
            <motion.div 
              key={selectedHotspot.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`border rounded-xl p-4 flex flex-col gap-3.5 relative shadow-lg ${
                selectedHotspot.discrepancy 
                  ? "bg-red-950/15 border-red-900/40" 
                  : "bg-slate-950 border-slate-800"
              }`}
            >
              <div className="flex items-start gap-2">
                <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${selectedHotspot.discrepancy ? "text-red-500" : "text-emerald-500"}`} />
                <div>
                  <h4 className="text-xs font-extrabold text-white leading-tight">{selectedHotspot.title}</h4>
                  <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wide mt-1 block">Hotspot ID: {selectedHotspot.id}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-[11px] font-mono bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/60">
                <div className="flex justify-between border-b border-slate-800/40 pb-1">
                  <span className="text-slate-500">BIM DESIGN SPEC:</span>
                  <span className="text-slate-300 font-bold text-right truncate max-w-[150px]" title={selectedHotspot.bimStatus}>{selectedHotspot.bimStatus}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">SITE REALITY:</span>
                  <span className={`font-bold text-right truncate max-w-[150px] ${selectedHotspot.discrepancy ? "text-red-400" : "text-emerald-400"}`} title={selectedHotspot.siteStatus}>
                    {selectedHotspot.siteStatus}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedHotspot.desc}
              </div>

              {selectedHotspot.discrepancy && (
                <div className="bg-red-500/10 text-red-400 text-[10px] p-2.5 rounded border border-red-500/20 flex gap-2 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1 animate-ping" />
                  <span>ACTION REQUIRED: Discrepancy sent directly to Subcontractor punch-list portal.</span>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-slate-950/40 border border-slate-800 border-dashed rounded-xl p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5">
              <Info className="w-6 h-6 text-slate-600" />
              <span>Select an animated hotspot pin on the stage layout to view physical discrepancy details.</span>
            </div>
          )}

          {/* Quick Hotspot Select buttons */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Platform Hotspot Directory:</span>
            {SAMPLE_HOTSPOTS.map((pin) => (
              <button
                key={pin.id}
                onClick={() => setSelectedHotspot(pin)}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between border cursor-pointer ${
                  selectedHotspot?.id === pin.id
                    ? "bg-slate-800 text-white border-amber-500"
                    : "bg-slate-900/40 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                <span className="truncate max-w-[180px]">{pin.title}</span>
                <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded border uppercase shrink-0 ${
                  pin.discrepancy ? "bg-red-950/20 text-red-400 border-red-900/30" : "bg-emerald-950/20 text-emerald-400 border-emerald-900/30"
                }`}>
                  {pin.discrepancy ? "WARN" : "OK"}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
