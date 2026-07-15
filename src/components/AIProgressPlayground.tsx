import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Upload, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  Cpu, 
  Eye, 
  Sparkles, 
  FileText,
  Percent,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface DetectedElement {
  id: string;
  name: string;
  category: "Structural" | "MEP" | "Finishes";
  confidence: number;
  status: "completed" | "in_progress" | "deviation";
  qty: string;
  x: number; // css percentage
  y: number; // css percentage
  width: number;
  height: number;
}

const SAMPLE_IMAGES = [
  {
    id: "drywall-l3",
    label: "Level 3 Drywall Framing",
    category: "Finishes",
    url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=800&q=80",
    elements: [
      { id: "dw-1", name: "Metal Stud Partition S4", category: "Finishes", confidence: 98.4, status: "completed", qty: "12.4 sqm", x: 15, y: 20, width: 30, height: 60 },
      { id: "dw-2", name: "Gypsum Board Face - Left", category: "Finishes", confidence: 95.1, status: "in_progress", qty: "6.2 sqm", x: 50, y: 25, width: 25, height: 55 },
      { id: "dw-3", name: "Rough Opening Support Trim", category: "Finishes", confidence: 88.7, status: "completed", qty: "2 units", x: 80, y: 40, width: 12, height: 45 }
    ] as DetectedElement[]
  },
  {
    id: "mep-ducts",
    label: "MEP Corridor Overhead",
    category: "MEP",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    elements: [
      { id: "duct-1", name: "Galvanized Supply Duct 400x400", category: "MEP", confidence: 99.2, status: "completed", qty: "8.5 m", x: 10, y: 15, width: 75, height: 35 },
      { id: "duct-2", name: "VAV Terminal Damper Box", category: "MEP", confidence: 92.4, status: "deviation", qty: "1 unit (Skewed)", x: 35, y: 50, width: 20, height: 25 },
      { id: "pipe-1", name: "Fire Sprinkler Main 2-inch", category: "MEP", confidence: 94.8, status: "completed", qty: "11.2 m", x: 5, y: 5, width: 85, height: 8 }
    ] as DetectedElement[]
  },
  {
    id: "concrete-columns",
    label: "Pouring Structural Columns B2",
    category: "Structural",
    url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
    elements: [
      { id: "col-1", name: "Reinforced Column C12 Cast", category: "Structural", confidence: 97.6, status: "completed", qty: "4.2 m3", x: 25, y: 10, width: 22, height: 80 },
      { id: "col-2", name: "Formwork Assembly - Column C13", category: "Structural", confidence: 96.3, status: "completed", qty: "1 unit", x: 60, y: 15, width: 24, height: 75 },
      { id: "rebar-1", name: "Exposed Starter Rebar Cage", category: "Structural", confidence: 91.5, status: "deviation", qty: "8 rods (Out of alignment)", x: 10, y: 50, width: 12, height: 30 }
    ] as DetectedElement[]
  }
];

export default function AIProgressPlayground() {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_IMAGES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectedItems, setDetectedItems] = useState<DetectedElement[]>([]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedOverlayElement, setSelectedOverlayElement] = useState<DetectedElement | null>(null);
  const [filterCategory, setFilterCategory] = useState<"All" | "Structural" | "MEP" | "Finishes">("All");

  const runScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setProgress(0);
    setSelectedOverlayElement(null);
    setDetectedItems([]);
  };

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanComplete(true);
          setDetectedItems(selectedSample.elements);
          return 100;
        }
        return prev + 4;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isScanning, selectedSample]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        // Create custom mock scan for uploaded file
        const customSample = {
          id: "custom-upload",
          label: file.name,
          category: "Structural" as const,
          url: reader.result as string,
          elements: [
            { id: "custom-1", name: "User Segment Area A1", category: "Structural" as const, confidence: 94.2, status: "completed" as const, qty: "Detected Region", x: 20, y: 20, width: 40, height: 40 },
            { id: "custom-2", name: "MEP Conduit Clash Check", category: "MEP" as const, confidence: 89.1, status: "deviation" as const, qty: "Exposed Conduit", x: 65, y: 30, width: 25, height: 35 }
          ]
        };
        setSelectedSample(customSample);
        setScanComplete(false);
        setIsScanning(false);
        setProgress(0);
        setDetectedItems([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        const customSample = {
          id: "custom-upload",
          label: file.name,
          category: "Structural" as const,
          url: reader.result as string,
          elements: [
            { id: "custom-1", name: "User Segment Area A1", category: "Structural" as const, confidence: 94.2, status: "completed" as const, qty: "Detected Region", x: 20, y: 20, width: 40, height: 40 },
            { id: "custom-2", name: "MEP Conduit Clash Check", category: "MEP" as const, confidence: 89.1, status: "deviation" as const, qty: "Exposed Conduit", x: 65, y: 30, width: 25, height: 35 }
          ]
        };
        setSelectedSample(customSample);
        setScanComplete(false);
        setIsScanning(false);
        setProgress(0);
        setDetectedItems([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredDetectedItems = detectedItems.filter(
    (item) => filterCategory === "All" || item.category === filterCategory
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="ai-progress-playground">
      {/* Top Banner Title */}
      <div className="bg-[#121620]/80 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#daff00]/10 text-[#daff00] font-mono text-[10px] font-bold border border-[#daff00]/20 uppercase">Module D-1</span>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#daff00]" />
              AI Object Recognition & Progress Scanning
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate real-time pixel segment matching against BIM physical layout coordinates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isScanning && (
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Analyzing Pixels... {progress}%</span>
            </div>
          )}
          {scanComplete && (
            <div className="text-xs text-lime-400 font-mono flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Scan Complete</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Image Area (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-semibold">SELECT TARGET WALK FRAME OR UPLOAD IMAGE:</span>
            {customImage && (
              <button 
                onClick={() => {
                  setCustomImage(null);
                  setSelectedSample(SAMPLE_IMAGES[0]);
                  setScanComplete(false);
                  setProgress(0);
                  setDetectedItems([]);
                }}
                className="text-amber-500 hover:underline hover:text-amber-400 font-bold transition"
              >
                Clear Custom Image
              </button>
            )}
          </div>

          {/* Sample Select Grid */}
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  setSelectedSample(sample);
                  setScanComplete(false);
                  setProgress(0);
                  setDetectedItems([]);
                  setSelectedOverlayElement(null);
                }}
                className={`p-2 rounded-lg border text-left flex flex-col gap-1 transition ${
                  selectedSample.id === sample.id && !customImage
                    ? "border-amber-500 bg-amber-500/5"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sample.category}</span>
                <span className="text-xs font-bold text-white truncate">{sample.label}</span>
              </button>
            ))}
          </div>

          {/* Draggable/Drop upload target wrapper */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative h-[340px] md:h-[400px] w-full rounded-xl bg-slate-950 border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden group select-none"
          >
            {/* The Image */}
            <img 
              src={selectedSample.url} 
              alt={selectedSample.label} 
              className={`w-full h-full object-cover transition-all duration-700 ${
                isScanning ? "brightness-50 filter blur-[1px]" : ""
              }`}
              referrerPolicy="no-referrer"
            />

            {/* Simulated Grid Scan Overlay */}
            {isScanning && (
              <>
                {/* Horizontal laser scan bar */}
                <motion.div 
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(245,158,11,1)] z-10 pointer-events-none"
                />
                
                {/* Visual grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                
                <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none" />
                
                {/* Tech readouts overlay */}
                <div className="absolute top-4 left-4 z-20 font-mono text-[9px] text-amber-400 bg-black/80 px-2 py-1 rounded border border-amber-500/20 flex flex-col gap-0.5">
                  <span>SEGMENTING INSTANCE BOUNDS...</span>
                  <span>LAYERS: L1_STRUCTURAL, L2_MEP, L3_FINISHES</span>
                  <span>CONFIDENCE_THRESHOLD: 85.0%</span>
                  <span>STABILITY: ACTIVE</span>
                </div>
              </>
            )}

            {/* Visual Bounding Boxes overlay */}
            {scanComplete && (
              <div className="absolute inset-0 pointer-events-auto">
                {selectedSample.elements.map((elem) => {
                  const isSelected = selectedOverlayElement?.id === elem.id;
                  let colorClass = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
                  if (elem.status === "deviation") {
                    colorClass = "border-red-500 bg-red-500/10 text-red-400";
                  } else if (elem.status === "in_progress") {
                    colorClass = "border-blue-500 bg-blue-500/10 text-blue-400";
                  }

                  return (
                    <motion.div
                      key={elem.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOverlayElement(elem);
                      }}
                      style={{
                        left: `${elem.x}%`,
                        top: `${elem.y}%`,
                        width: `${elem.width}%`,
                        height: `${elem.height}%`
                      }}
                      className={`absolute border-2 rounded cursor-pointer transition-all duration-200 flex flex-col justify-between p-1.5 group ${colorClass} ${
                        isSelected ? "ring-2 ring-white border-white scale-[1.01] z-20 shadow-2xl" : "hover:scale-[1.005]"
                      }`}
                    >
                      {/* Bounding box corners matching screenshot visual markers */}
                      <span className="text-[9px] font-mono font-black tracking-wide truncate bg-slate-950/80 px-1 py-0.5 rounded backdrop-blur-sm self-start leading-none">
                        {elem.name} ({Math.round(elem.confidence)}%)
                      </span>

                      <div className="flex justify-between items-center bg-slate-950/80 px-1 py-0.5 rounded text-[8px] font-mono self-end">
                        <span className="uppercase">{elem.status.replace("_", " ")}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Prompt when empty / initial state */}
            {!isScanning && !scanComplete && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-amber-400 transition-colors" />
                </div>
                <p className="text-sm font-bold text-white">Drag & drop construction photo or click to browse</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Supports JPEGs, PNGs up to 20MB. Image metadata stays safe on-device.</p>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg border border-slate-700 transition cursor-pointer"
                >
                  Browse Device Photos
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={runScan}
              disabled={isScanning}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
                isScanning 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isScanning ? "RECOGNIZING ELEMENTS..." : (scanComplete ? "RERUN AI ANALYSIS" : "RUN AI SCANNING ENGINE")}</span>
            </button>

            {(scanComplete || customImage) && (
              <button
                onClick={() => {
                  setScanComplete(false);
                  setIsScanning(false);
                  setProgress(0);
                  setDetectedItems([]);
                  setSelectedOverlayElement(null);
                  setCustomImage(null);
                  setSelectedSample(SAMPLE_IMAGES[0]);
                }}
                className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Details/Results Side (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detection Summary</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
              {filteredDetectedItems.length} items found
            </span>
          </div>

          {/* Filter Categories */}
          <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
            {(["All", "Structural", "MEP", "Finishes"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`flex-1 py-1 px-2 rounded font-bold uppercase transition ${
                  filterCategory === cat
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active scanning or result list */}
          <div className="flex-1 min-h-[220px] max-h-[340px] overflow-y-auto pr-1 flex flex-col gap-2.5 scrollbar-thin">
            <AnimatePresence mode="popLayout">
              {isScanning && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-t-amber-500 border-slate-700 animate-spin" />
                  <span className="text-xs font-mono">Comparing coordinates...</span>
                </div>
              )}

              {!isScanning && !scanComplete && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center gap-2 border border-dashed border-slate-800 rounded-lg bg-slate-950/30">
                  <Camera className="w-8 h-8 text-slate-600" />
                  <span className="text-xs">No scan active. Press "Run AI Scanning Engine" to locate physical components in 3D coordinate space.</span>
                </div>
              )}

              {scanComplete && filteredDetectedItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center gap-1">
                  <span className="text-xs font-semibold">No elements match the current filter.</span>
                </div>
              )}

              {scanComplete && filteredDetectedItems.map((item) => {
                const isSelected = selectedOverlayElement?.id === item.id;
                let statusBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                if (item.status === "deviation") statusBadge = "bg-red-500/10 text-red-400 border-red-500/20";
                if (item.status === "in_progress") statusBadge = "bg-blue-500/10 text-blue-400 border-blue-500/20";

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    onClick={() => setSelectedOverlayElement(item)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-slate-800/80 border-amber-500 shadow-lg"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-xs leading-snug">{item.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono tracking-wide mt-0.5 block">{item.category} • Quantity: {item.qty}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border shrink-0 ${statusBadge}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono pt-2 border-t border-slate-800/60">
                      <span className="text-slate-500">Instance Confidence:</span>
                      <span className="font-extrabold text-[#daff00]">{item.confidence}%</span>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Active Overlay Element Detail Panel */}
          {selectedOverlayElement && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 relative"
            >
              <button 
                onClick={() => setSelectedOverlayElement(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-850"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#daff00]" />
                <span className="text-xs font-mono font-bold text-white uppercase">Instance Coordinates Inspector</span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block">Name:</span>
                  <span className="text-slate-200 truncate block font-bold">{selectedOverlayElement.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Classification:</span>
                  <span className="text-slate-200 font-bold">{selectedOverlayElement.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Quantified Value:</span>
                  <span className="text-slate-200 font-bold">{selectedOverlayElement.qty}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Relative Offset:</span>
                  <span className="text-slate-200">X: {selectedOverlayElement.x}%, Y: {selectedOverlayElement.y}%</span>
                </div>
              </div>

              {selectedOverlayElement.status === "deviation" && (
                <div className="bg-red-950/20 border border-red-900/40 p-2.5 rounded-lg flex items-start gap-2 text-[11px] text-red-400 leading-normal">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <p>
                    <strong>Automatic Deviation Alert:</strong> Detected object orientation deviates from design file. Estimated rework cost: $2,450. Adjustments logged inside issues ledger.
                  </p>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
