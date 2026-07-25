import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { 
  Wifi, 
  WifiOff, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Save, 
  Database, 
  Layers, 
  ShieldCheck, 
  FileText, 
  Clock, 
  Brain,
  Volume2,
  Trash2,
  CheckSquare
} from "lucide-react";
import { useAppStore } from "../store";

interface InspectionItem {
  id: string;
  gridLocation: string;
  trade: string;
  task: string;
  status: "Passed" | "Failed" | "Conditional Pass" | "Pending";
  voiceNote?: string;
  structuredNotes?: string;
  syncedToCloud: boolean;
  timestamp: string;
}

const INITIAL_INSPECTIONS: InspectionItem[] = [
  {
    id: "INSP-801",
    gridLocation: "Floor 3 East (Grid C-4)",
    trade: "Apex Drywall Corp",
    task: "Corridor Metal Stud Alignment & Top Track Fireseal",
    status: "Conditional Pass",
    voiceNote: "Checked grid C4 studs are aligned but missing top track firesafe sealant. Approved framing conditionally, board installation held until sealant verified tomorrow.",
    structuredNotes: "### 🎙️ AI Voice Field Inspection Log\n- **Status**: Conditional Pass\n- **Defect**: Missing elastomeric firestop caulking on top track.\n- **Action**: Firestop application required before drywall board mounting.",
    syncedToCloud: true,
    timestamp: "2026-07-25 08:30"
  },
  {
    id: "INSP-802",
    gridLocation: "Floor 2 Central Plant",
    trade: "ThermalShield HVAC",
    task: "Chilled Water Pipe Branch Insulation Sleeve Check",
    status: "Failed",
    voiceNote: "Chilled water supply line uninsulated near junction valve B2. Risk of condensation drip on main electrical conduit tray below.",
    structuredNotes: "### 🎙️ AI Voice Field Inspection Log\n- **Status**: Failed\n- **NCR Category**: Material / Quality\n- **Action**: Immediate thermal insulation sleeve wrapping required.",
    syncedToCloud: false,
    timestamp: "2026-07-25 09:15"
  },
  {
    id: "INSP-803",
    gridLocation: "Floor 3 Executive Suites (Grid B-2)",
    trade: "FireSafe Systems",
    task: "Sprinkler Branch Drop Head Alignment",
    status: "Passed",
    voiceNote: "Sprinkler head drops verified at 2.85m ceiling height. Pressure test passed at 175 PSI.",
    structuredNotes: "### 🎙️ AI Voice Field Inspection Log\n- **Status**: Passed\n- **Quality Check**: Standard pressure test certified.",
    syncedToCloud: true,
    timestamp: "2026-07-25 09:40"
  }
];

export default function OfflineFieldInspector() {
  const { setActiveTab } = useAppStore();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [deviceFrame, setDeviceFrame] = useState<"Tablet" | "Smartphone" | "Full">("Tablet");
  const [inspections, setInspections] = useState<InspectionItem[]>(INITIAL_INSPECTIONS);
  const [selectedGrid, setSelectedGrid] = useState<string>("Floor 3 East (Grid C-4)");
  const [selectedTrade, setSelectedTrade] = useState<string>("Apex Drywall Corp");
  const [activeTask, setActiveTask] = useState<string>("Corridor Metal Stud Framing & Boarding");
  const [inspectionStatus, setInspectionStatus] = useState<"Passed" | "Failed" | "Conditional Pass">("Passed");

  // Speech to text states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isProcessingVoice, setIsProcessingVoice] = useState<boolean>(false);
  const [voiceAiOutput, setVoiceAiOutput] = useState<string | null>(null);
  const [isSyncingOfflineQueue, setIsSyncingOfflineQueue] = useState<boolean>(false);

  // Simulated browser voice recording
  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      if (!transcript) {
        setTranscript("Inspected Corridor 3A stud framing. Stud spacing is compliant at 400mm centers. Drywall screw pattern verified. Firestop acoustic seal completed at top deflection track.");
      }
    } else {
      setIsRecording(true);
      setTranscript("");
      const timer = setTimeout(() => {
        setTranscript("Checked grid C4 studs are aligned but missing top track firesafe sealant. Approved framing conditionally, board installation held until sealant verified tomorrow.");
      }, 2500);
      return () => clearTimeout(timer);
    }
  };

  const handleProcessVoiceWithAi = async () => {
    if (!transcript) return;
    setIsProcessingVoice(true);

    try {
      const res = await fetch("/api/ai/voice-field-transcription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceTranscript: transcript,
          locationGrid: selectedGrid,
          trade: selectedTrade,
          inspectorName: "Dave Miller (Site Superintendent)"
        })
      });

      const data = await res.json();
      setVoiceAiOutput(data.structuredInspection || "Structured notes generated.");
    } catch (err) {
      console.error("Voice processing error:", err);
      setVoiceAiOutput(`### 🎙️ AI Voice Field Inspection Log\n- **Location**: ${selectedGrid}\n- **Trade**: ${selectedTrade}\n- **Note**: "${transcript}"`);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleSaveFieldInspection = () => {
    const newItem: InspectionItem = {
      id: `INSP-${Math.floor(800 + Math.random() * 100)}`,
      gridLocation: selectedGrid,
      trade: selectedTrade,
      task: activeTask,
      status: inspectionStatus,
      voiceNote: transcript || undefined,
      structuredNotes: voiceAiOutput || undefined,
      syncedToCloud: isOnline, // if online syncs immediately, if offline stays unsynced
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " ")
    };

    setInspections([newItem, ...inspections]);
    setTranscript("");
    setVoiceAiOutput(null);
  };

  const handleSyncOfflineQueue = () => {
    setIsSyncingOfflineQueue(true);
    setTimeout(() => {
      setInspections(prev => prev.map(i => ({ ...i, syncedToCloud: true })));
      setIsSyncingOfflineQueue(false);
    }, 1500);
  };

  const unsyncedCount = inspections.filter(i => !i.syncedToCloud).length;

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-cyan-500/30 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                BUILDOTS MOBILE FIELD INSPECTOR APP
              </span>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                isOnline 
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
              }`}>
                {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
                {isOnline ? "ONLINE - CLOUD SYNC ACTIVE" : "OFFLINE MODE - LOCAL INDEXEDDB STORAGE"}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Tablet className="w-8 h-8 text-cyan-400 shrink-0" />
              Offline Mobile Field Inspector & Voice-to-Text Sign-Off
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Equips site engineers and trade foremen to perform instant visual quality sign-offs, record hands-free voice notes, and review AI 360° photogrammetry defects directly on site floorplans without cellular connection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 border transition-all ${
                isOnline 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
              }`}
            >
              {isOnline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{isOnline ? "Simulate Offline Network" : "Restore Online Network"}</span>
            </button>

            {unsyncedCount > 0 && (
              <button
                onClick={handleSyncOfflineQueue}
                disabled={isSyncingOfflineQueue || !isOnline}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOfflineQueue ? "animate-spin" : ""}`} />
                <span>Sync {unsyncedCount} Offline Logs to Cloud</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DEVICE FRAME SWITCHER */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Mobile Device Mode:</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDeviceFrame("Smartphone")}
            className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
              deviceFrame === "Smartphone" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            iPhone / Phone (375px)
          </button>
          <button
            onClick={() => setDeviceFrame("Tablet")}
            className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
              deviceFrame === "Tablet" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            iPad / Tablet (768px)
          </button>
          <button
            onClick={() => setDeviceFrame("Full")}
            className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
              deviceFrame === "Full" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Expanded Field Desktop
          </button>
        </div>
      </div>

      {/* MOBILE CONTAINER WRAPPER */}
      <div className={`mx-auto transition-all ${
        deviceFrame === "Smartphone" ? "max-w-md" : deviceFrame === "Tablet" ? "max-w-3xl" : "w-full"
      }`}>
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6">
          {/* FIELD STATUS SUMMARY BAR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-slate-300">Local Offline Queue:</span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                unsyncedCount > 0 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300"
              }`}>
                {unsyncedCount} Pending Syncs
              </span>
            </div>

            <div className="text-slate-400 font-mono text-[11px]">
              Last Photogrammetry Mesh: <strong className="text-slate-200">Today 07:30 AM</strong>
            </div>
          </div>

          {/* NEW FIELD SIGN-OFF & VOICE RECORDER FORM */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-cyan-400" />
                New Field Quality Inspection Sign-off
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                OFFLINE READY
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">BIM Location Grid:</label>
                <select
                  value={selectedGrid}
                  onChange={(e) => setSelectedGrid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Floor 3 East (Grid C-4)">Floor 3 East (Grid C-4)</option>
                  <option value="Floor 2 Central Plant">Floor 2 Central Plant</option>
                  <option value="Floor 3 Executive Suites (Grid B-2)">Floor 3 Executive Suites (Grid B-2)</option>
                  <option value="Floor 4 Exterior West Facade">Floor 4 Exterior West Facade</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Responsible Trade:</label>
                <select
                  value={selectedTrade}
                  onChange={(e) => setSelectedTrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Apex Drywall Corp">Apex Drywall Corp</option>
                  <option value="ThermalShield HVAC">ThermalShield HVAC</option>
                  <option value="VoltTech Electrical">VoltTech Electrical</option>
                  <option value="FireSafe Systems">FireSafe Systems</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-mono text-xs mb-1">Inspection Task Name:</label>
              <input
                type="text"
                value={activeTask}
                onChange={(e) => setActiveTask(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* STATUS SELECTOR BUTTONS */}
            <div>
              <label className="block text-slate-400 font-mono text-xs mb-1.5">Sign-off Decision:</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold font-mono">
                <button
                  type="button"
                  onClick={() => setInspectionStatus("Passed")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    inspectionStatus === "Passed"
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectionStatus("Conditional Pass")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    inspectionStatus === "Conditional Pass"
                      ? "bg-amber-600 text-white border-amber-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Conditional</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectionStatus("Failed")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    inspectionStatus === "Failed"
                      ? "bg-rose-600 text-white border-rose-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Rejected</span>
                </button>
              </div>
            </div>

            {/* VOICE TO TEXT FIELD MIC ENGINE */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-cyan-400" />
                  Voice-to-Text Field Note Recorder
                </span>

                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                    isRecording 
                      ? "bg-rose-600 text-white animate-pulse" 
                      : "bg-cyan-600 hover:bg-cyan-500 text-white"
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? "Stop Recording..." : "Tap to Record Voice"}</span>
                </button>
              </div>

              {/* TRANSCRIPT TEXT AREA */}
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Spoken field notes will automatically dictate here... or type field remarks manually."
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-500"
              />

              {transcript && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleProcessVoiceWithAi}
                    disabled={isProcessingVoice}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 font-mono"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isProcessingVoice ? "animate-spin" : ""}`} />
                    <span>{isProcessingVoice ? "AI Structuring Voice..." : "AI Process Voice Note"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setTranscript(""); setVoiceAiOutput(null); }}
                    className="text-slate-500 hover:text-slate-300 text-xs font-mono"
                  >
                    Clear Audio
                  </button>
                </div>
              )}

              {/* STRUCTURED VOICE OUTPUT PREVIEW */}
              {voiceAiOutput && (
                <div className="bg-slate-900 border border-indigo-500/40 p-3 rounded-xl text-xs text-slate-200 leading-relaxed font-mono">
                  <Markdown>{voiceAiOutput}</Markdown>
                </div>
              )}
            </div>

            {/* SAVE INSPECTION ACTION BUTTON */}
            <button
              type="button"
              onClick={handleSaveFieldInspection}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all font-mono"
            >
              <Save className="w-4 h-4" />
              <span>Save Inspection ({isOnline ? "Cloud Sync Instant" : "Store to Local Offline Queue"})</span>
            </button>
          </div>

          {/* FIELD INSPECTIONS AUDIT HISTORY */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Recent Field Sign-offs & Offline Queue ({inspections.length})
              </span>
              <span className="text-xs font-mono text-slate-400">
                {unsyncedCount} Pending Sync
              </span>
            </h3>

            <div className="space-y-3">
              {inspections.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    !item.syncedToCloud 
                      ? "bg-amber-950/10 border-amber-500/40" 
                      : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="font-bold text-slate-300">{item.id}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        item.status === "Passed" 
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : item.status === "Conditional Pass"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-slate-400">| {item.gridLocation}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="text-slate-500">{item.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded ${
                        item.syncedToCloud 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}>
                        {item.syncedToCloud ? "Synced to Cloud" : "Offline Pending"}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1">{item.task}</h4>
                  <p className="text-[11px] text-slate-400 font-mono mb-2">Trade: {item.trade}</p>

                  {item.voiceNote && (
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono space-y-1">
                      <div className="text-[10px] text-cyan-400 flex items-center gap-1">
                        <Mic className="w-3 h-3" /> Voice Field Note:
                      </div>
                      <p>"{item.voiceNote}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
