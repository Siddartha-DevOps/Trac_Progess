import React, { useState } from "react";
import { Anomaly, BIMElement } from "./types";
import { Sparkles, Send, AlertTriangle, CheckCircle2, RotateCcw, HelpCircle, Loader2 } from "lucide-react";

interface AIAnomalyCenterProps {
  anomalies: Anomaly[];
  selectedElement: BIMElement | null;
  onSelectAnomaly: (anomaly: Anomaly) => void;
  selectedAnomaly: Anomaly | null;
}

export default function AIAnomalyCenter({
  anomalies,
  selectedElement,
  onSelectAnomaly,
  selectedAnomaly,
}: AIAnomalyCenterProps) {
  const [customQuestion, setCustomQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>("");

  const presetQuestions = [
    "What are the immediate structural safety risks of this discrepancy?",
    "Generate a structured 3-step physical remediation protocol.",
    "Assess sequencing bottleneck delays for MEP and finishing crews.",
    "Suggest preventive measures to ensure this doesn't repeat on higher levels."
  ];

  // Request the Express server to call Gemini AI securely
  const requestAIAnalysis = async (questionText: string) => {
    if (!selectedAnomaly) return;
    setLoading(true);
    setAiReport(null);

    // Context metadata representing our BIM and photogrammetry alignment parameters
    const context = {
      location: "Bangalore Tech Park, Floor L1, L2-Zone B",
      elementType: selectedAnomaly.elementName,
      elementId: selectedAnomaly.elementId,
    };

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anomaly: selectedAnomaly,
          customQuestion: questionText,
          context: context,
        }),
      });

      const data = await response.json();
      if (data.report) {
        setAiReport(data.report);
        setModelUsed(data.modelUsed || "gemini-3.5-flash");
      } else {
        setAiReport("⚠️ Error: Unable to extract inspection advice from TracProgress AI.");
      }
    } catch (err: any) {
      console.error(err);
      setAiReport("⚠️ API Error: Failed to connect to the TracProgress secure AI pipeline.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || !selectedAnomaly) return;
    requestAIAnalysis(customQuestion);
    setCustomQuestion("");
  };

  // Quick helper to format simple markdown characters (### headings, * bullet points, and strong words)
  const renderFormattedReport = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      // Check for headings
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-900 mt-4 mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
            {trimmed.replace("###", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("####")) {
        return (
          <h5 key={idx} className="text-xs font-semibold text-slate-800 mt-3 mb-1.5">
            {trimmed.replace("####", "").trim()}
          </h5>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="text-base font-bold text-indigo-900 mt-5 mb-2.5">
            {trimmed.replace("##", "").trim()}
          </h3>
        );
      }
      
      // Check for lists
      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        // Parse bold elements inside bullets
        const content = trimmed.substring(1).trim();
        return (
          <li key={idx} className="ml-4 text-xs text-slate-600 list-disc mb-1.5 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }

      // Check for numbered lists
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="ml-4 text-xs text-slate-600 list-decimal mb-2 leading-relaxed">
            {parseBoldText(numMatch[2])}
          </li>
        );
      }

      if (trimmed === "") return <div key={idx} className="h-2" />;

      return (
        <p key={idx} className="text-xs text-slate-600 mb-2 leading-relaxed">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case "critical":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700 animate-pulse">Critical Severity</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700">High Severity</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">Medium Severity</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">Low Severity</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      
      {/* Title & Stats bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-semibold tracking-tight">AI Site Progress Auditor</h3>
            <p className="text-[10px] text-slate-400">Computer Vision + BIM Discrepancy Diagnostics</p>
          </div>
        </div>
        <div className="text-[10px] bg-indigo-900/60 border border-indigo-700/50 px-2 py-1 rounded">
          RERA Compliance Active
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-[450px]">
        
        {/* Left Side: Anomaly List */}
        <div className="w-2/5 border-r border-slate-100 p-3 overflow-y-auto flex flex-col gap-2 bg-slate-50/50">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Detected Site Anomaly Logs
          </h4>
          
          {anomalies.map((anom) => {
            const isSelected = selectedAnomaly && selectedAnomaly.id === anom.id;
            return (
              <button
                key={anom.id}
                onClick={() => {
                  onSelectAnomaly(anom);
                  setAiReport(null); // Clear old report on switch
                }}
                className={`text-left p-3 rounded-lg border transition flex flex-col gap-1.5 ${
                  isSelected
                    ? "bg-indigo-50/70 border-indigo-200 ring-2 ring-indigo-600/10"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1">{anom.title}</span>
                  {anom.status === "resolved" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${anom.level === "critical" ? "text-red-500" : "text-amber-500"}`} />
                  )}
                </div>
                
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-normal">
                  {anom.description}
                </p>

                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="text-slate-400 font-mono">{anom.elementName}</span>
                  {getSeverityBadge(anom.level)}
                </div>
              </button>
            );
          })}
          
          <div className="mt-auto p-2 bg-indigo-50 border border-indigo-100 rounded text-[10px] text-indigo-800 leading-relaxed">
            💡 <strong>Interactive Hint:</strong> Click an anomaly log or select a highlighted amber element in the 3D BIM Canvas above to populate and inspect structural site clashes!
          </div>
        </div>

        {/* Right Side: Gemini Interactive Report Center */}
        <div className="w-3/5 p-4 flex flex-col overflow-y-auto bg-white">
          {selectedAnomaly ? (
            <div className="flex flex-col h-full">
              
              {/* Selected anomaly stats block */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3 text-xs flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-sm">{selectedAnomaly.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                    ID: {selectedAnomaly.elementId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-500 mt-2">
                  <div><span className="font-semibold text-slate-700">Scan Deviation:</span> {selectedAnomaly.deviation}</div>
                  <div><span className="font-semibold text-slate-700">Root Cause:</span> {selectedAnomaly.possibleCause}</div>
                  <div><span className="font-semibold text-slate-700">BIM Layer:</span> {selectedAnomaly.category}</div>
                  <div><span className="font-semibold text-slate-700">First Detected:</span> {selectedAnomaly.detectedAt}</div>
                </div>
              </div>

              {/* Action Prompt selection */}
              {!aiReport && !loading && (
                <div className="flex-1 flex flex-col justify-center items-center p-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/20">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">
                    Query TracProgress AI Auditor
                  </h4>
                  <p className="text-xs text-slate-500 text-center max-w-sm mb-4">
                    Send a custom question or select one of the core construction site inspection templates below to generate a Gemini analysis:
                  </p>

                  <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                    {presetQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => requestAIAnalysis(q)}
                        className="text-left p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 hover:text-indigo-600 font-medium transition leading-snug"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loader */}
              {loading && (
                <div className="flex-1 flex flex-col justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                  <div className="text-xs font-semibold text-slate-700 text-center animate-pulse">
                    Analyzing site photogrammetry parameters...
                  </div>
                  <p className="text-[10px] text-slate-400 text-center mt-1 max-w-xs">
                    TracProgress is aligning the IFC model vertices with drone surface grids. Formulating Gemini inspection report...
                  </p>
                </div>
              )}

              {/* AI Report Viewer */}
              {aiReport && !loading && (
                <div className="flex-1 border border-slate-100 rounded-lg p-4 bg-slate-50/40 relative">
                  
                  {/* Floating badge for model citation */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full font-medium">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    Powered by {modelUsed}
                  </div>

                  <h3 className="text-sm font-bold text-indigo-950 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Gemini AI Engineering Assessment & Action Protocol
                  </h3>

                  <div className="prose max-w-none">
                    {renderFormattedReport(aiReport)}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                    <span>Audit Time: {new Date().toLocaleDateString()}</span>
                    <button
                      onClick={() => setAiReport(null)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" /> Re-examine Anomaly
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Input form */}
              <form onSubmit={handleSendCustom} className="mt-3 flex gap-1.5">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Ask Gemini AI site specific technical questions (e.g., procurement alternatives, concrete curing risk)..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-slate-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3 flex items-center justify-center transition"
                  disabled={loading || !customQuestion.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-slate-400">
              <HelpCircle className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="font-semibold text-slate-700 text-sm mb-1">Audit Center Idle</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-normal">
                No construction discrepancy is currently loaded for deep inspection. Please select an anomaly on the left or click an highlighted structure on the 3D model.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
