import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Brain,
  FileText,
  Mic,
  Search,
  Bot,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Play,
  Zap,
  Volume2,
  FileSearch,
  Building2,
  Send,
  Layers,
  ShieldCheck,
  Tag,
  Clock,
  BookOpen
} from "lucide-react";

export const AIServicesSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"ocr" | "stt" | "llm_reports" | "rag" | "assistant">("ocr");

  // OCR state
  const [docType, setDocType] = useState<"engineering_drawing" | "ipc_invoice" | "equipment_tag">("engineering_drawing");
  const [isProcessingOCR, setIsProcessingOCR] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<any>({
    drawingNum: "AEC-B2-HVAC-LEVEL-03-REV4",
    projectName: "AeroSpace Tech Park - Tower B",
    airFlow: "12,500 CFM @ 2.5 in. w.g.",
    stamp: "Voltas MEP Solutions - APPROVED 2026-06-12",
    processingMs: 340.2
  });

  // Speech-to-Text state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [noiseFilter, setNoiseFilter] = useState<boolean>(true);
  const [sttResult, setSttResult] = useState<any>({
    transcript: "Checking level 2 east wing. Drywall framing is finished but electrical conduits behind column C4 are missing junction box covers. Need snag log entry for L&T Electrical.",
    duration: 18.4,
    snrDb: 14.2,
    confidence: 0.982,
    entities: [
      { name: "Level 2 East Wing", tag: "Location Zone" },
      { name: "Drywall framing", tag: "Construction Work Item" },
      { name: "Column C4", tag: "Structural Element" },
      { name: "Junction box covers", tag: "MEP Component" },
      { name: "L&T Electrical", tag: "Subcontractor" }
    ]
  });

  // LLM Reporting state
  const [reportType, setReportType] = useState<"daily_progress" | "delay_attribution" | "ipc_valuation">("daily_progress");
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [reportMarkdown, setReportMarkdown] = useState<string>(
    `# Executive Daily Site Progress Summary - AeroSpace Tech Park\n**Date:** 2026-07-28 | **Overall Project Completion:** 78.4%\n\n### Key Milestones Achieved Today:\n1. **Wall Systems & Drywall:** 78.5% verified AI progress (Contractor claimed 88.0%). Discrepancy of ₹4.89 Lakhs flagged for joint inspection.\n2. **MEP Mechanical & HVAC:** Main trunk line ducting completed on Floor 2. VAV damper installation active in Zone B.\n3. **Structural Concrete:** 28-day cylinder compressive strength test passed 45 MPa for Slab Level 4.\n\n### Critical Action Items:\n- **Electrical Conduits:** Uncapped junction boxes near Column C4 require immediate closing before drywall closing signoff.\n- **Contractor IPC Signoff:** Voltas MEP invoice adjusted by AI verification from ₹52.10L -> ₹48.65L.`
  );

  // RAG Search state
  const [ragQuery, setRagQuery] = useState<string>("What are the hanger rod spacing requirements for supply ducts?");
  const [isSearchingRag, setIsSearchingRag] = useState<boolean>(false);
  const [ragResults, setRagResults] = useState<any[]>([
    {
      doc: "AeroSpace_TechPark_HVAC_Specifications_Rev2.pdf",
      section: "Section 15810 - Ductwork Insulation & Hangers",
      score: 0.942,
      text: "All main supply air ducts exceeding 1200mm width shall be supported by 12mm threaded hanger rods anchored to concrete slab with chemical anchors spaced at maximum 1.8m intervals."
    },
    {
      doc: "NBC_2020_Fire_Safety_Part_4.pdf",
      section: "Clause 4.3.2 - Dampers in Air Conditioned Ducts",
      score: 0.895,
      text: "Motorized fire dampers with 2-hour rating shall be installed at all floor slab penetrations and rated fire wall assemblies."
    },
    {
      doc: "Subcontractor_Agreement_Voltas_MEP.pdf",
      section: "Clause 8.4 - Payment Milestone Terms",
      score: 0.851,
      text: "Progress payments for ductwork shall only be processed upon presentation of AI LiDAR 3D spatial verification logs matching BIM tolerances."
    }
  ]);

  // AI Assistant state
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string; source?: string }>>([
    {
      role: "assistant",
      text: "Hello! I am your TracProgress.AI Project Assistant. Ask me anything about drawings, NBC codes, contractor IPC valuations, or site progress."
    }
  ]);

  const handleRunOCR = () => {
    setIsProcessingOCR(true);
    setTimeout(() => {
      if (docType === "engineering_drawing") {
        setOcrResult({
          drawingNum: "AEC-B2-HVAC-LEVEL-03-REV4",
          projectName: "AeroSpace Tech Park - Tower B",
          airFlow: "12,500 CFM @ 2.5 in. w.g.",
          stamp: "Voltas MEP Solutions - APPROVED 2026-06-12",
          processingMs: 340.2
        });
      } else if (docType === "ipc_invoice") {
        setOcrResult({
          invoiceNum: "INV-2026-SHAPOORJI-04",
          claimedAmount: "₹38,25,000",
          workPackage: "Drywall & Wall Partitions Level 2",
          stamp: "AI VERIFIED - 15.3% Inflation Variance Flagged",
          processingMs: 280.5
        });
      } else {
        setOcrResult({
          tagId: "AHU-L2-04",
          mfr: "Carrier Heavy Duty Series 300",
          capacity: "250 kW Cooling Load",
          stamp: "QR CODE VALIDATED",
          processingMs: 195.0
        });
      }
      setIsProcessingOCR(false);
    }, 1000);
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
      }, 3000);
    }
  };

  const handleRunLLMReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      if (reportType === "daily_progress") {
        setReportMarkdown(
          `# Executive Daily Site Progress Summary - AeroSpace Tech Park\n**Date:** 2026-07-28 | **Overall Project Completion:** 78.4%\n\n### Key Milestones Achieved Today:\n1. **Wall Systems & Drywall:** 78.5% verified AI progress (Contractor claimed 88.0%). Discrepancy of ₹4.89 Lakhs flagged for joint inspection.\n2. **MEP Mechanical & HVAC:** Main trunk line ducting completed on Floor 2. VAV damper installation active in Zone B.\n3. **Structural Concrete:** 28-day cylinder compressive strength test passed 45 MPa for Slab Level 4.\n\n### Critical Action Items:\n- **Electrical Conduits:** Uncapped junction boxes near Column C4 require immediate closing before drywall closing signoff.\n- **Contractor IPC Signoff:** Voltas MEP invoice adjusted by AI verification from ₹52.10L -> ₹48.65L.`
        );
      } else if (reportType === "delay_attribution") {
        setReportMarkdown(
          `# Delay Root-Cause Attribution Report\n**Primary Bottleneck:** Ceiling Grid & Acoustic Tile Installation\n**Impact:** 4-Day Schedule Float Erosion on Critical Path\n**Root Cause:** Overhead MEP inspection signoff delayed by 36 hours due to late duct pressure test submission.`
        );
      } else {
        setReportMarkdown(
          `# Contractor IPC Valuation & Audit Brief\n**Total Claimed Across All Trades:** ₹2,34,35,000\n**AI Verified Approved Amount:** ₹1,98,42,000\n**Net Taxpayer / Developer Savings:** ₹35,93,000 (15.3% Inflation Adjustment)`
        );
      }
      setIsGeneratingReport(false);
    }, 1200);
  };

  const handleRunRagSearch = () => {
    if (!ragQuery.trim()) return;
    setIsSearchingRag(true);
    setTimeout(() => {
      setIsSearchingRag(false);
    }, 800);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: `Based on RAG document search in AeroSpace_TechPark_HVAC_Specifications_Rev2.pdf and active BIM state, supply duct hanger rods must be spaced at max 1.8m intervals. Current progress on Level 2 East Wing is at 78.5%.`,
          source: "AeroSpace_TechPark_HVAC_Specifications_Rev2.pdf (Section 15810)"
        }
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
              TRACPROGRESS.AI MULTI-MODAL AI SERVICES
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              OCR + WHISPER + GEMINI + FAISS RAG ACTIVE
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            AI Services Suite
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Optical Character Recognition, Whisper Speech-to-Text, Automated LLM Site Reporting, Vector RAG Document Search &amp; Multi-modal Assistant
          </p>
        </div>

        {/* Engine Badges */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            PaddleOCR
          </span>
          <span className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            Whisper v3
          </span>
          <span className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            Gemini 1.5
          </span>
          <span className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            FAISS HNSW
          </span>
        </div>
      </div>

      {/* Task Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setActiveTab("ocr")}
          className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
            activeTab === "ocr"
              ? "bg-slate-800 border-purple-500 text-white shadow-lg shadow-purple-500/5"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <FileText className={`w-5 h-5 ${activeTab === "ocr" ? "text-purple-400" : "text-slate-500"}`} />
          <div>
            <div className="text-sm font-bold">1. OCR Engine</div>
            <div className="text-[11px] text-slate-400">Drawings &amp; Invoices</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("stt")}
          className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
            activeTab === "stt"
              ? "bg-slate-800 border-purple-500 text-white shadow-lg shadow-purple-500/5"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <Mic className={`w-5 h-5 ${activeTab === "stt" ? "text-purple-400" : "text-slate-500"}`} />
          <div>
            <div className="text-sm font-bold">2. Speech-to-Text</div>
            <div className="text-[11px] text-slate-400">Whisper Voice Notes</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("llm_reports")}
          className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
            activeTab === "llm_reports"
              ? "bg-slate-800 border-purple-500 text-white shadow-lg shadow-purple-500/5"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <Sparkles className={`w-5 h-5 ${activeTab === "llm_reports" ? "text-purple-400" : "text-slate-500"}`} />
          <div>
            <div className="text-sm font-bold">3. LLM Reporting</div>
            <div className="text-[11px] text-slate-400">Auto Daily Logs</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("rag")}
          className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
            activeTab === "rag"
              ? "bg-slate-800 border-purple-500 text-white shadow-lg shadow-purple-500/5"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <Search className={`w-5 h-5 ${activeTab === "rag" ? "text-purple-400" : "text-slate-500"}`} />
          <div>
            <div className="text-sm font-bold">4. RAG Search</div>
            <div className="text-[11px] text-slate-400">Specs &amp; NBC Codes</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("assistant")}
          className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
            activeTab === "assistant"
              ? "bg-slate-800 border-purple-500 text-white shadow-lg shadow-purple-500/5"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <Bot className={`w-5 h-5 ${activeTab === "assistant" ? "text-purple-400" : "text-slate-500"}`} />
          <div>
            <div className="text-sm font-bold">5. AI Assistant</div>
            <div className="text-[11px] text-slate-400">Multi-Modal Queries</div>
          </div>
        </button>
      </div>

      {/* TAB 1: OCR Engine */}
      {activeTab === "ocr" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Optical Character Recognition (OCR) Engine
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                LayoutLMv3 + PaddleOCR recognition for blueprints, title blocks, equipment nameplates, and contractor IPC claims.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={docType}
                onChange={e => setDocType(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded px-3 py-2 focus:outline-none"
              >
                <option value="engineering_drawing">Engineering Drawing / Title Block</option>
                <option value="ipc_invoice">Contractor IPC Invoice</option>
                <option value="equipment_tag">Equipment Nameplate / Tag</option>
              </select>

              <button
                onClick={handleRunOCR}
                disabled={isProcessingOCR}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessingOCR ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Execute OCR Extraction
              </button>
            </div>
          </div>

          {/* OCR Extracted Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileSearch className="w-4 h-4 text-purple-400" /> Extracted Structured Metadata
              </h4>

              <div className="space-y-2 text-xs font-mono">
                {Object.entries(ocrResult).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-purple-300 font-bold">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Layout Bounds &amp; Bounding Boxes
              </h4>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded h-40 flex flex-col justify-center items-center text-center space-y-2">
                <Tag className="w-8 h-8 text-purple-400 animate-pulse" />
                <span className="text-xs text-slate-300">LayoutLMv3 Spatial Layout Parsing Complete</span>
                <span className="text-[10px] text-slate-500">4 bounding boxes matched with 98.2% average confidence</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Speech-to-Text */}
      {activeTab === "stt" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-400" />
                Whisper v3 Speech-to-Text Field Voice Dictation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time audio transcription with construction site ambient noise suppression and AEC domain vocabulary extraction.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noiseFilter}
                  onChange={e => setNoiseFilter(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-purple-500 focus:ring-0"
                />
                Noise Filter (+14dB SNR)
              </label>

              <button
                onClick={handleToggleRecord}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition flex items-center gap-1.5 ${
                  isRecording ? "bg-rose-600 animate-pulse" : "bg-purple-600 hover:bg-purple-500"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                {isRecording ? "Recording Audio..." : "Start Field Dictation"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Transcript Display */}
            <div className="md:col-span-2 p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-bold text-slate-300">Live Transcript Output</span>
                <span className="font-mono text-purple-400">{sttResult.duration}s Audio</span>
              </div>

              <div className="p-4 bg-slate-900 rounded border border-slate-800 text-sm text-slate-200 font-sans leading-relaxed">
                "{sttResult.transcript}"
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>Confidence: <strong className="text-emerald-400">98.2%</strong></span>
                <span>Noise Filter: <strong className="text-purple-400">Active</strong></span>
              </div>
            </div>

            {/* AEC Domain Entity Extraction */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-purple-400" /> Domain Entities
              </h4>

              <div className="space-y-2">
                {sttResult.entities.map((item: any, idx: number) => (
                  <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-white font-medium">{item.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LLM Reporting */}
      {activeTab === "llm_reports" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Gemini LLM Automated Site Progress Reporting
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generates executive daily summaries, delay root-cause attribution reports, and contractor IPC valuation briefs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded px-3 py-2 focus:outline-none"
              >
                <option value="daily_progress">Daily Site Progress Summary</option>
                <option value="delay_attribution">Delay Root-Cause Attribution</option>
                <option value="ipc_valuation">Contractor IPC Valuation Brief</option>
              </select>

              <button
                onClick={handleRunLLMReport}
                disabled={isGeneratingReport}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGeneratingReport ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Generate LLM Report
              </button>
            </div>
          </div>

          {/* Report Markdown Container */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed">
            {reportMarkdown}
          </div>
        </div>
      )}

      {/* TAB 4: RAG Document Search */}
      {activeTab === "rag" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-400" />
                Retrieval-Augmented Generation (RAG) Document Search
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dense vector search across 142,000 document chunks (Site Specs, NBC 2020 Codes, Submittals, BIM Contracts).
              </p>
            </div>
          </div>

          {/* Query Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              value={ragQuery}
              onChange={e => setRagQuery(e.target.value)}
              placeholder="Ask a technical specification query (e.g. duct hanger rod spacing)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleRunRagSearch}
              disabled={isSearchingRag}
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSearchingRag ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Vector Search
            </button>
          </div>

          {/* RAG Results List */}
          <div className="space-y-3">
            {ragResults.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">{item.doc}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.section})</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Relevance: {(item.score * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded border border-slate-800 leading-relaxed font-sans">
                  "{item.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AI Assistant */}
      {activeTab === "assistant" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              Multi-Modal AI Project Query Assistant
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Grounded in live BIM spatial metrics, contractor claims, OCR metadata, and RAG vector specifications.
            </p>
          </div>

          {/* Chat Messages Log */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg h-80 overflow-y-auto space-y-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-xl ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.source && (
                    <div className="mt-2 text-[10px] text-purple-300 font-mono border-t border-slate-800 pt-1">
                      Source: {msg.source}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask the AI Assistant about project progress, specs, or claims..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
