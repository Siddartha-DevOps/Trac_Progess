import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Mic, 
  MicOff, 
  Building2, 
  Layers, 
  Clock, 
  ShieldAlert, 
  DollarSign, 
  BarChart3, 
  RefreshCw, 
  ChevronRight, 
  Download, 
  ArrowRight,
  Filter,
  CheckCircle2,
  HelpCircle,
  Zap,
  Activity
} from "lucide-react";
import { useAppStore } from "../store";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  modelUsed?: string;
  quickActions?: { label: string; tabTarget: string }[];
}

const QUICK_PROMPT_SUGGESTIONS = [
  {
    text: "Which trade is causing the biggest Primavera schedule delay on Floor 3?",
    icon: Clock,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30"
  },
  {
    text: "What is the certified earned value and IPC deduction for Cable Trays?",
    icon: DollarSign,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
  },
  {
    text: "Show all critical PPE violations and spatial safety hazards today.",
    icon: ShieldAlert,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/30"
  },
  {
    text: "Summarize Subcontractor Velocity Scorecards for the weekly site meeting.",
    icon: BarChart3,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30"
  }
];

export default function BuildotsAiAssistant() {
  const { setActiveTab } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "assistant",
      text: `Hello! I am your **Buildots AI Natural Language Site Assistant**. I am synchronized with your **4D BIM Digital Twin**, **360° Photogrammetry Scans**, **Primavera P6 Schedule**, and **Commercial IPC Valuation Ledgers**.\n\nHow can I assist your site management team today?`,
      timestamp: "Just now",
      modelUsed: "gemini-3.5-flash",
      quickActions: [
        { label: "View 4D BIM Time-Lapse", tabTarget: "4d-bim-timelapse" },
        { label: "Open IPC Valuation Ledger", tabTarget: "commercial-ipc-valuation" },
        { label: "Inspect Safety Heatmap", tabTarget: "spatial-defect-heatmap" }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFloor, setSelectedFloor] = useState<string>("Floor 3");
  const [selectedTrade, setSelectedTrade] = useState<string>("All Trades");
  const [isMicActive, setIsMicActive] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          filterContext: {
            floor: selectedFloor,
            trade: selectedTrade
          }
        })
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: data.answer || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || "gemini-3.5-flash",
        quickActions: [
          { label: "Open Primavera Schedule", tabTarget: "primavera-schedule-integration" },
          { label: "View Subcontractor Scorecards", tabTarget: "subcontractor-velocity-scorecards" }
        ]
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Failed to query AI assistant:", err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: "⚠️ Apologies, an unexpected network glitch occurred. Please try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: "local-fallback"
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    setIsMicActive(!isMicActive);
    if (!isMicActive) {
      setInputQuery("Which trade is causing the biggest Primavera schedule delay on Floor 3?");
    }
  };

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
                BUILDOTS AI NATURAL LANGUAGE SITE ASSISTANT
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-emerald-500/30">
                GEMINI 3.5 FLASH REASONING
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Bot className="w-8 h-8 text-indigo-400 shrink-0" />
              Buildots AI Site Operations Assistant
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Ask natural language queries regarding project progress, trade delays, 4D BIM variances, commercial IPC payouts, and spatial safety hazards across all project sectors.
            </p>
          </div>

          {/* SITE CONTEXT FILTERS */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">Floor:</span>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="All Floors">All Floors</option>
                <option value="Floor 1">Floor 1</option>
                <option value="Floor 2">Floor 2</option>
                <option value="Floor 3">Floor 3 (Active)</option>
                <option value="Roof Level">Roof Level</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400">Trade:</span>
              <select
                value={selectedTrade}
                onChange={(e) => setSelectedTrade(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="All Trades">All Trades</option>
                <option value="Drywall & Partition">Drywall & Partition</option>
                <option value="MEP Electrical">MEP Electrical</option>
                <option value="HVAC Ductwork">HVAC Ductwork</option>
                <option value="Concrete Structure">Concrete Structure</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK SUGGESTION PILLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_PROMPT_SUGGESTIONS.map((sug, i) => {
          const Icon = sug.icon;
          return (
            <button
              key={i}
              onClick={() => handleSendMessage(sug.text)}
              className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] flex items-start gap-3 shadow-sm ${sug.color}`}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold leading-snug">{sug.text}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN CHAT CONVERSATION CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[580px] overflow-hidden">
        
        {/* CHAT MESSAGES SCROLL AREA */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* AVATAR ICON */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                  isUser 
                    ? "bg-indigo-600 text-white" 
                    : "bg-slate-800 border border-slate-700 text-indigo-400"
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* MESSAGE BUBBLE */}
                <div className={`max-w-2xl rounded-2xl p-4 text-xs space-y-3 shadow-md ${
                  isUser 
                    ? "bg-indigo-600 text-white font-medium" 
                    : "bg-slate-950 border border-slate-800 text-slate-200"
                }`}>
                  <div className="flex items-center justify-between gap-4 text-[10px] font-mono opacity-60 border-b border-slate-800/60 pb-1.5">
                    <span>{isUser ? "Project Director" : "Buildots AI Site Assistant"}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* MARKDOWN RENDERED CONTENT */}
                  <div className="markdown-body leading-relaxed text-xs">
                    <Markdown>{msg.text}</Markdown>
                  </div>

                  {/* QUICK ACTION BUTTONS */}
                  {!isUser && msg.quickActions && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                      {msg.quickActions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTab(act.tabTarget as any)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded-lg border border-slate-700 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-indigo-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* LOADING TYPING INDICATOR */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center text-xs shadow-md">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 font-mono flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Buildots AI reasoning across 4D BIM & 360° Site Photogrammetry...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT CONTROL FOOTER BAR */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-xl border transition-all ${
              isMicActive 
                ? "bg-rose-600 text-white border-rose-500 animate-pulse" 
                : "bg-slate-900 text-slate-400 hover:text-white border-slate-800"
            }`}
            title="Hands-free Helmet Mic Mode"
          >
            {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask anything about 4D BIM, schedule delays, IPC billing, or site safety..."
            className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-mono"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isLoading}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
