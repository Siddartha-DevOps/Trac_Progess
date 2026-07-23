import React, { useState } from "react";
import { 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  Download, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  ArrowUpRight, 
  ShieldCheck, 
  Building2, 
  Wrench, 
  Zap, 
  ChevronRight,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Sliders
} from "lucide-react";

interface MicroStageStep {
  stepNumber: number;
  name: string;
  weight: number; // percentage weight towards total trade completion
}

interface TradeConfig {
  id: string;
  tradeName: string;
  contractor: string;
  claimedProgress: number; // Subcontractor claimed %
  aiVerifiedProgress: number; // AI visual reality verified %
  totalQuantity: string;
  unit: string;
  claimedAmount: string;
  aiApprovedAmount: string;
  discrepancyAmount: string;
  stages: MicroStageStep[];
}

interface RoomElementStatus {
  id: string;
  roomName: string;
  zone: string;
  currentStepIndex: number; // index in stages array
  status: "completed" | "in_progress" | "blocked" | "not_started";
  blockerReason?: string;
  lastCapturedDate: string;
  claimedBySub: number;
  aiVerified: number;
}

const TRADE_CONFIGS: TradeConfig[] = [
  {
    id: "drywall",
    tradeName: "Drywall & Partition Systems",
    contractor: "Shapoorji Finishing & Drywall Corp",
    claimedProgress: 88,
    aiVerifiedProgress: 64,
    totalQuantity: "4,250 m²",
    unit: "m²",
    claimedAmount: "₹38,25,000",
    aiApprovedAmount: "₹27,84,000",
    discrepancyAmount: "₹10,41,000",
    stages: [
      { stepNumber: 1, name: "Layout & Floor/Ceiling Track", weight: 10 },
      { stepNumber: 2, name: "Metal Stud Framing", weight: 15 },
      { stepNumber: 3, name: "In-Wall Backing & Blocking", weight: 10 },
      { stepNumber: 4, name: "One-Side Boarding", weight: 15 },
      { stepNumber: 5, name: "In-Wall Insulation & MEP Signoff", weight: 10 },
      { stepNumber: 6, name: "Two-Side Boarding Closeout", weight: 15 },
      { stepNumber: 7, name: "Joint Taping & First Coat Mudding", weight: 10 },
      { stepNumber: 8, name: "Second & Third Coat Mudding", weight: 5 },
      { stepNumber: 9, name: "Sanding & Wall Preparation", weight: 5 },
      { stepNumber: 10, name: "Primer & Final Finish Coat", weight: 5 }
    ]
  },
  {
    id: "hvac",
    tradeName: "MEP Mechanical & HVAC Ducts",
    contractor: "Voltas MEP Solutions Ltd",
    claimedProgress: 75,
    aiVerifiedProgress: 72,
    totalQuantity: "1,850 m",
    unit: "meters",
    claimedAmount: "₹52,10,000",
    aiApprovedAmount: "₹50,01,600",
    discrepancyAmount: "₹2,08,400",
    stages: [
      { stepNumber: 1, name: "Ceiling Hanger Rods & Anchors", weight: 10 },
      { stepNumber: 2, name: "Main Duct Trunk Line Assembly", weight: 25 },
      { stepNumber: 3, name: "Branch Ducting & Flex Runouts", weight: 20 },
      { stepNumber: 4, name: "Fire Damper & VAV Box Mounting", weight: 15 },
      { stepNumber: 5, name: "Thermal Duct Insulation Wrap", weight: 15 },
      { stepNumber: 6, name: "Diffusers & Grille Installation", weight: 10 },
      { stepNumber: 7, name: "TAB Airflow Balancing & Signoff", weight: 5 }
    ]
  },
  {
    id: "electrical",
    tradeName: "MEP Electrical & Cable Trays",
    contractor: "L&T Electrical & Automation",
    claimedProgress: 92,
    aiVerifiedProgress: 81,
    totalQuantity: "3,100 m",
    unit: "meters",
    claimedAmount: "₹44,50,000",
    aiApprovedAmount: "₹39,18,000",
    discrepancyAmount: "₹5,32,000",
    stages: [
      { stepNumber: 1, name: "Overhead Cable Tray Installation", weight: 20 },
      { stepNumber: 2, name: "In-Wall Conduit Rough-in", weight: 20 },
      { stepNumber: 3, name: "Junction Box & Panel Mounting", weight: 15 },
      { stepNumber: 4, name: "Cable Pulling & Wiring", weight: 25 },
      { stepNumber: 5, name: "Switch & Receptacle Trim-out", weight: 10 },
      { stepNumber: 6, name: "Continuity & Megger Testing", weight: 10 }
    ]
  }
];

const ROOM_ELEMENTS: Record<string, RoomElementStatus[]> = {
  drywall: [
    { id: "R301", roomName: "Room 301 - Conference Hall", zone: "Zone A", currentStepIndex: 6, status: "in_progress", lastCapturedDate: "Today 09:30 AM", claimedBySub: 90, aiVerified: 75 },
    { id: "R302", roomName: "Room 302 - Executive Suite", zone: "Zone A", currentStepIndex: 2, status: "blocked", blockerReason: "Missing Timber Backing for TV Mount", lastCapturedDate: "Today 09:32 AM", claimedBySub: 60, aiVerified: 25 },
    { id: "R303", roomName: "Room 303 - Open Workspace", zone: "Zone B", currentStepIndex: 9, status: "completed", lastCapturedDate: "Yesterday 04:15 PM", claimedBySub: 100, aiVerified: 100 },
    { id: "R304", roomName: "Room 304 - Server Room", zone: "Zone B", currentStepIndex: 4, status: "in_progress", lastCapturedDate: "Today 09:40 AM", claimedBySub: 80, aiVerified: 50 },
    { id: "R305", roomName: "Room 305 - Plant Room Corridor", zone: "Zone C", currentStepIndex: 1, status: "in_progress", lastCapturedDate: "Today 09:45 AM", claimedBySub: 40, aiVerified: 10 }
  ],
  hvac: [
    { id: "H301", roomName: "Corridor 3A Trunk Run", zone: "Zone A", currentStepIndex: 5, status: "completed", lastCapturedDate: "Today 09:15 AM", claimedBySub: 100, aiVerified: 100 },
    { id: "H302", roomName: "Plant Room 3B - VAV Branch", zone: "Zone B", currentStepIndex: 3, status: "blocked", blockerReason: "Fire Damper FD-302 missing in physical capture", lastCapturedDate: "Today 09:20 AM", claimedBySub: 85, aiVerified: 55 },
    { id: "H303", roomName: "Zone 308 - Workstation Bay", zone: "Zone C", currentStepIndex: 4, status: "in_progress", lastCapturedDate: "Today 09:25 AM", claimedBySub: 70, aiVerified: 70 }
  ],
  electrical: [
    { id: "E301", roomName: "Lobby B Cable Tray", zone: "Zone A", currentStepIndex: 5, status: "completed", lastCapturedDate: "Today 08:50 AM", claimedBySub: 100, aiVerified: 100 },
    { id: "E302", roomName: "Server Room Power Feeder", zone: "Zone B", currentStepIndex: 3, status: "in_progress", lastCapturedDate: "Today 08:55 AM", claimedBySub: 85, aiVerified: 65 }
  ]
};

export default function GranularTradeMicroStageEngine() {
  const [selectedTradeId, setSelectedTradeId] = useState<string>("drywall");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const activeTrade = TRADE_CONFIGS.find((t) => t.id === selectedTradeId) || TRADE_CONFIGS[0];
  const roomList = ROOM_ELEMENTS[selectedTradeId] || [];

  const filteredRooms = roomList.filter((room) => {
    const matchesSearch = room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) || room.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-cyan-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                GRANULAR TRADE MICRO-STAGE ENGINE
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-indigo-500/30">
                BUILDOTS PARITY LEVEL 5
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Layers className="w-8 h-8 text-cyan-400 shrink-0" />
              Granular Construction Trade Micro-Stage Tracking
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Breaks down each construction trade into 6–10 precise micro-stage milestones. Automatically verifies physical installation against subcontractor progress billing claims to prevent overbilling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => alert(`Exported ${activeTrade.tradeName} Micro-Stage Audit Report to Excel/PDF.`)}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Trade Audit Claim Sheet
            </button>
          </div>
        </div>
      </div>

      {/* TRADE CATEGORY TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {TRADE_CONFIGS.map((trade) => (
          <button
            key={trade.id}
            onClick={() => setSelectedTradeId(trade.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
              selectedTradeId === trade.id
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            {trade.tradeName}
          </button>
        ))}
      </div>

      {/* TRADE OVERVIEW & CLAIM DISCREPANCY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CONTRACTOR INFO */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Assigned Subcontractor</div>
          <div className="text-sm font-bold text-white mt-1 truncate">{activeTrade.contractor}</div>
          <div className="text-xs text-indigo-400 font-mono mt-1">Total Scope: {activeTrade.totalQuantity}</div>
        </div>

        {/* CLAIMED VS VERIFIED PROGRESS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Progress Comparison</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-black text-rose-400">{activeTrade.claimedProgress}%</span>
            <span className="text-xs text-slate-400 font-mono">Claimed</span>
            <span className="text-slate-600">|</span>
            <span className="text-lg font-black text-emerald-400">{activeTrade.aiVerifiedProgress}%</span>
            <span className="text-xs text-slate-400 font-mono">AI Reality</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: `${activeTrade.aiVerifiedProgress}%` }} />
            <div className="bg-rose-500 h-full" style={{ width: `${activeTrade.claimedProgress - activeTrade.aiVerifiedProgress}%` }} />
          </div>
        </div>

        {/* CLAIMED BILLING AMOUNT */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Claimed Bill Amount</div>
          <div className="text-lg font-black text-white mt-1">{activeTrade.claimedAmount}</div>
          <div className="text-xs text-emerald-400 font-mono mt-1">AI Approved: {activeTrade.aiApprovedAmount}</div>
        </div>

        {/* FINANCIAL DISCREPANCY OVERCLAIM */}
        <div className="bg-slate-900 border border-rose-500/30 bg-rose-500/5 rounded-xl p-4 shadow-sm">
          <div className="text-[10px] text-rose-400 font-mono uppercase font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Prevented Overbilling
          </div>
          <div className="text-lg font-black text-rose-400 mt-1">{activeTrade.discrepancyAmount}</div>
          <div className="text-[11px] text-rose-300/80 mt-1">Held back until physical closeout verification</div>
        </div>

      </div>

      {/* MICRO-STAGE STEP PIPELINE VISUALIZER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            10-Step Micro-Stage Sequence for {activeTrade.tradeName}
          </h3>
          <span className="text-xs text-slate-400 font-mono">Sequential Milestone Sequence</span>
        </div>

        {/* PIPELINE HORIZONTAL STEPS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {activeTrade.stages.map((stage) => (
            <div 
              key={stage.stepNumber}
              className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-between text-center relative group hover:border-indigo-500/50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold font-mono mx-auto flex items-center justify-center">
                {stage.stepNumber}
              </div>
              <div className="text-[10px] font-bold text-slate-200 mt-2 leading-tight min-h-[28px] flex items-center justify-center">
                {stage.name}
              </div>
              <div className="text-[9px] font-mono text-cyan-400 font-bold mt-1">
                Weight: {stage.weight}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROOM & ELEMENT MICRO-STAGE PROGRESS MATRIX TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        
        {/* TABLE FILTER & SEARCH */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Zone & Room Micro-Stage Matrix
            </h3>
            <span className="bg-slate-800 text-slate-300 text-xs font-mono font-bold px-2 py-0.5 rounded">
              {filteredRooms.length} Locations
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search location or zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 w-48"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked / Discrepancy</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* DETAILED MATRIX ROWS */}
        <div className="space-y-3">
          {filteredRooms.map((room) => {
            const currentStageObj = activeTrade.stages[room.currentStepIndex] || activeTrade.stages[0];

            return (
              <div 
                key={room.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                {/* LOCATION INFO */}
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{room.roomName}</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {room.zone}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>Captured: {room.lastCapturedDate}</span>
                  </div>
                </div>

                {/* MICRO-STAGE STEP PROGRESS BADGE */}
                <div className="flex-1 max-w-md">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      Step {room.currentStepIndex + 1}/{activeTrade.stages.length}: {currentStageObj.name}
                    </span>
                    <span className="font-bold text-emerald-400">{room.aiVerified}% AI Verified</span>
                  </div>

                  {/* Micro-Stage Step Indicator Circles */}
                  <div className="flex items-center gap-1">
                    {activeTrade.stages.map((st, idx) => {
                      const isCompleted = idx < room.currentStepIndex;
                      const isCurrent = idx === room.currentStepIndex;
                      const isBlocked = isCurrent && room.status === "blocked";

                      return (
                        <div
                          key={st.stepNumber}
                          title={`Step ${st.stepNumber}: ${st.name}`}
                          className={`h-2 flex-1 rounded-full transition-all ${
                            isBlocked ? "bg-rose-500 animate-pulse" :
                            isCompleted ? "bg-emerald-500" :
                            isCurrent ? "bg-indigo-500 animate-pulse" :
                            "bg-slate-800"
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* BLOCKER WARNING IF ANY */}
                  {room.status === "blocked" && (
                    <div className="mt-2 text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/30 p-1.5 rounded flex items-center gap-1.5 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>BLOCKER: {room.blockerReason}</span>
                    </div>
                  )}
                </div>

                {/* CLAIMED VS VERIFIED % PILLS */}
                <div className="flex items-center gap-3 text-right">
                  <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-mono uppercase">Claimed</div>
                    <div className="text-xs font-bold text-rose-400">{room.claimedBySub}%</div>
                  </div>

                  <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-400 font-mono uppercase">AI Reality</div>
                    <div className="text-xs font-bold text-emerald-400">{room.aiVerified}%</div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase shrink-0 ${
                    room.status === "completed" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                    room.status === "blocked" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                    "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  }`}>
                    {room.status}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
