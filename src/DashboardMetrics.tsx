import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { BIMElement, Anomaly, ProjectStats } from "./types";
import { 
  Building2, 
  Building, 
  Layers, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Compass, 
  Sliders, 
  ChevronRight, 
  Check, 
  Activity, 
  Search, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpRight, 
  CheckCircle2, 
  ShieldCheck, 
  LayoutGrid, 
  HelpCircle,
  HardHat,
  DoorOpen,
  Sparkles,
  Play,
  Pause,
  AlertCircle
} from "lucide-react";

interface DashboardMetricsProps {
  stats: ProjectStats;
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  elements: BIMElement[];
  anomalies: Anomaly[];
}

export default function DashboardMetrics({
  stats,
  currentWeek,
  setCurrentWeek,
  elements,
  anomalies,
}: DashboardMetricsProps) {
  // Navigation / Filter States
  const [activeBlock, setActiveBlock] = useState<"Block A" | "Block B" | "Block C">("Block A");
  const [activeFloor, setActiveFloor] = useState<string>("Level 1");
  const [timeTab, setTimeTab] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [roomSearch, setRoomSearch] = useState<string>("");

  // Simulated Building/Block levels progress
  const buildingBlocks = [
    { name: "Block A", role: "Superstructure & MEP", progress: 84, totalSlabs: 5, completedSlabs: 4, tradeCount: 6, status: "Active" },
    { name: "Block B", role: "Formwork & Columns", progress: 68, totalSlabs: 5, completedSlabs: 3, tradeCount: 5, status: "Active" },
    { name: "Block C", role: "Foundations & Excavation", progress: 42, totalSlabs: 5, completedSlabs: 1, tradeCount: 3, status: "Under Review" },
  ];

  // Simulated Floor Level Progress mapping for the active block
  const floorsData = [
    { name: "Roof Level", progress: 5, target: 10, concrete: 10, mep: 0, finishing: 0, status: "Not Started" },
    { name: "Level 2", progress: 45, target: 55, concrete: 78, mep: 35, finishing: 10, status: "Delayed" },
    { name: "Level 1", progress: 88, target: 90, concrete: 100, mep: 84, finishing: 45, status: "Optimal" },
    { name: "Ground Floor", progress: 100, target: 100, concrete: 100, mep: 100, finishing: 98, status: "Completed" },
    { name: "Basement Floor", progress: 100, target: 100, concrete: 100, mep: 100, finishing: 100, status: "Completed" },
  ];

  // Dynamic Room Completion Data mapped under the active floor
  const [roomsProgress, setRoomsProgress] = useState<Record<string, Array<{
    id: string;
    name: string;
    progress: number;
    trades: { structure: boolean; electrical: boolean; plumbing: boolean; hvac: boolean; finishing: boolean };
    comments: string;
  }>>>({
    "Level 1": [
      { id: "R101", name: "Premium Unit 101", progress: 95, trades: { structure: true, electrical: true, plumbing: true, hvac: true, finishing: false }, comments: "Drywalls installed, final paint coat pending." },
      { id: "R102", name: "Premium Unit 102", progress: 90, trades: { structure: true, electrical: true, plumbing: true, hvac: true, finishing: false }, comments: "Tiling ongoing, photogrammetry verified." },
      { id: "R103", name: "Premium Unit 103", progress: 65, trades: { structure: true, electrical: true, plumbing: false, hvac: false, finishing: false }, comments: "Wall studs aligned. MEP sleeve clash on sprinkler lines." },
      { id: "R104", name: "Central Corridor B", progress: 40, trades: { structure: true, electrical: false, plumbing: false, hvac: false, finishing: false }, comments: "Concrete columns cured, cable trays unaligned." },
      { id: "R105", name: "Mechanical Room L1", progress: 98, trades: { structure: true, electrical: true, plumbing: true, hvac: true, finishing: true }, comments: "Fully verified. Ready for occupancy handover certificate." }
    ],
    "Level 2": [
      { id: "R201", name: "Premium Unit 201", progress: 50, trades: { structure: true, electrical: false, plumbing: false, hvac: false, finishing: false }, comments: "Slab cured, interior partition layout approved." },
      { id: "R202", name: "Premium Unit 202", progress: 30, trades: { structure: true, electrical: false, plumbing: false, hvac: false, finishing: false }, comments: "Formwork stripped, scan logs pending QC audit." },
      { id: "R203", name: "Central Corridor A", progress: 15, trades: { structure: false, electrical: false, plumbing: false, hvac: false, finishing: false }, comments: "Rebar installation on column cages lagging schedule." },
      { id: "R204", name: "Electrical Shaft L2", progress: 0, trades: { structure: false, electrical: false, plumbing: false, hvac: false, finishing: false }, comments: "Pending structural floor sleeve casing release." }
    ],
    "Roof Level": [
      { id: "R501", name: "Terrace Deck", progress: 5, trades: { structure: false, electrical: false, plumbing: false, hvac: false, finishing: false }, comments: "Parapet wall foundation layout started." }
    ],
    "Ground Floor": [
      { id: "R001", name: "Main Reception Lobby", progress: 100, trades: { structure: true, electrical: true, plumbing: true, hvac: true, finishing: true }, comments: "Handed over to finishing contractor." },
      { id: "R002", name: "Business Center Office", progress: 100, trades: { structure: true, electrical: true, plumbing: true, hvac: true, finishing: true }, comments: "Scan matches BIM geometry with zero variance." }
    ]
  });

  // Toggle Room Trade checkbox to let the user simulate real-time QA updating progress
  const handleToggleRoomTrade = (floor: string, roomId: string, tradeKey: "structure" | "electrical" | "plumbing" | "hvac" | "finishing") => {
    setRoomsProgress(prev => {
      const floorRooms = prev[floor] || [];
      const updatedRooms = floorRooms.map(room => {
        if (room.id === roomId) {
          const updatedTrades = { ...room.trades, [tradeKey]: !room.trades[tradeKey] };
          // Calculate new progress percentage
          const checkedCount = Object.values(updatedTrades).filter(Boolean).length;
          const newProgress = Math.round((checkedCount / 5) * 100);
          return {
            ...room,
            trades: updatedTrades,
            progress: newProgress,
            comments: `Simulated Update: ${tradeKey} status toggled. Verification in progress.`
          };
        }
        return room;
      });
      return { ...prev, [floor]: updatedRooms };
    });
  };

  // 1. Trade Progress Data
  const tradeProgressData = [
    { name: "Structural Concrete", planned: 100, actual: 98, activeWorkers: 142, status: "Stable" },
    { name: "MEP Coordination", planned: 85, actual: 76, activeWorkers: 88, status: "Alert" },
    { name: "Plumbing Sleeves", planned: 90, actual: 88, activeWorkers: 32, status: "Stable" },
    { name: "HVAC Ducting", planned: 75, actual: 68, activeWorkers: 45, status: "Warning" },
    { name: "Drywalls & Studs", planned: 50, actual: 42, activeWorkers: 67, status: "Idle" },
    { name: "External Glazing", planned: 20, actual: 15, activeWorkers: 18, status: "Critical" },
  ];

  // 2. Daily Progress Data (Point cloud matches + Poured volume)
  const dailyProgressData = [
    { day: "Mon", "Concrete Poured (m³)": 42, "Scan Alignment Match %": 96 },
    { day: "Tue", "Concrete Poured (m³)": 48, "Scan Alignment Match %": 97 },
    { day: "Wed", "Concrete Poured (m³)": 38, "Scan Alignment Match %": 94 },
    { day: "Thu", "Concrete Poured (m³)": 40, "Scan Alignment Match %": 95 },
    { day: "Fri", "Concrete Poured (m³)": 52, "Scan Alignment Match %": 98 },
    { day: "Sat", "Concrete Poured (m³)": 30, "Scan Alignment Match %": 96 },
    { day: "Sun", "Concrete Poured (m³)": 0, "Scan Alignment Match %": 99 },
  ];

  // 3. Weekly Progress Data (Earned Value Trend S-Curve)
  const weeklyProgressHistory = [
    { week: "Wk 1", "Scheduled BIM Baseline": 12, "Physical CV Scan Actual": 12, "Velocity Index": 1.0 },
    { week: "Wk 2", "Scheduled BIM Baseline": 25, "Physical CV Scan Actual": 24, "Velocity Index": 0.98 },
    { week: "Wk 3", "Scheduled BIM Baseline": 38, "Physical CV Scan Actual": 36, "Velocity Index": 0.95 },
    { week: "Wk 4", "Scheduled BIM Baseline": 52, "Physical CV Scan Actual": 49, "Velocity Index": 0.94 },
    { week: "Wk 5", "Scheduled BIM Baseline": 65, "Physical CV Scan Actual": 62, "Velocity Index": 0.95 },
    { week: "Wk 6", "Scheduled BIM Baseline": 78, "Physical CV Scan Actual": 74.2, "Velocity Index": 0.95 },
    { week: "Wk 7", "Scheduled BIM Baseline": 90, "Physical CV Scan Actual": 85.8, "Velocity Index": 0.95 },
  ];

  // 4. Monthly Progress Data (Project milestones tracking)
  const monthlyProgressData = [
    { month: "May", "Milestone Target": 25, "Milestones Achieved": 25, "RERA Compliance Score": 98 },
    { month: "Jun", "Milestone Target": 55, "Milestones Achieved": 51, "RERA Compliance Score": 96 },
    { month: "Jul (Est)", "Milestone Target": 85, "Milestones Achieved": 80, "RERA Compliance Score": 95 },
    { month: "Aug (Fct)", "Milestone Target": 100, "Milestones Achieved": 95, "RERA Compliance Score": 92 },
  ];

  // Calculate dynamic stats for currently displayed rooms
  const activeRooms = roomsProgress[activeFloor] || [];
  const filteredRooms = activeRooms.filter(room => 
    room.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
    room.id.toLowerCase().includes(roomSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-slate-800" id="progress-dashboard-root">
      
      {/* ENTERPRISE TITLE CONTROL PANEL */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Compass className="w-5 h-5 text-indigo-600 animate-spin-slow" />
            </span>
            <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
              BuildTrace Progress Control Room
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Automated photogrammetry tracking against native CAD models. Last drone audit: Today 10:14 AM.
          </p>
        </div>

        {/* Interactive Block/Building Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          {buildingBlocks.map((block) => (
            <button
              key={block.name}
              onClick={() => setActiveBlock(block.name as any)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                activeBlock === block.name
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>{block.name}</span>
              <span className={`text-[9px] px-1 rounded-full ${activeBlock === block.name ? "bg-indigo-50 text-indigo-600 font-extrabold" : "bg-slate-200 text-slate-600"}`}>
                {block.progress}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* BLOCK HEADLINE DETAILS HERO CARD */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-xl border border-slate-800 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          
          <div className="md:col-span-1 border-r border-slate-800/80 pr-4 flex flex-col justify-between">
            <div>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-bold uppercase tracking-wider font-mono">
                {activeBlock} Spotlight
              </span>
              <h3 className="text-lg font-black mt-2 tracking-tight">Active Zone Tracking</h3>
              <p className="text-xs text-slate-400 mt-1">
                Currently scanning structural reinforcements and drywall sleeve alignment.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center text-[11px] text-indigo-300">
              <span className="font-semibold">RERA Stage Compliance:</span>
              <strong className="text-emerald-400 font-mono">₹4.8L Safe</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-4">
            {/* KPI: Building Progress */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block font-mono">
                Building Progress
              </span>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono">
                  {activeBlock === "Block A" ? "84" : activeBlock === "Block B" ? "68" : "42"}%
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">+2.4% MoM</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
                <div 
                  className="bg-indigo-400 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${activeBlock === "Block A" ? 84 : activeBlock === "Block B" ? 68 : 42}%` }} 
                />
              </div>
            </div>

            {/* KPI: Floor Completion */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block font-mono">
                Floor Completion
              </span>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono">
                  {activeBlock === "Block A" ? "4" : activeBlock === "Block B" ? "3" : "1"} / 5
                </span>
                <span className="text-[10px] text-slate-400">Slabs poured</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-2.5 line-clamp-1">
                Next Pour: Roof Slab (Plan: Wk 8)
              </p>
            </div>

            {/* KPI: Room Verification */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block font-mono">
                Room Handover Rate
              </span>
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono">
                  {activeBlock === "Block A" ? "76" : activeBlock === "Block B" ? "52" : "15"}%
                </span>
                <span className="text-[10px] text-indigo-300 font-bold font-mono">Verified</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-700" 
                  style={{ width: `${activeBlock === "Block A" ? 76 : activeBlock === "Block B" ? 52 : 15}%` }} 
                />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* CORE SPATIAL PROGRESS PANEL: BUILDING -> FLOOR -> ROOM DRILL-DOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Floor Level Selector Progress Map (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" />
              Floor-by-Floor Construction Map
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Select a floor plate below to review detailed spatial CAD coordinate matching.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {floorsData.map((floor) => {
              const isSelected = activeFloor === floor.name;
              
              return (
                <div
                  key={floor.name}
                  onClick={() => setActiveFloor(floor.name)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col gap-2 ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-50"
                      : "border-slate-150 bg-slate-50/30 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg text-xs font-mono font-bold ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                        F{floor.name === "Roof Level" ? "5" : floor.name === "Level 2" ? "2" : floor.name === "Level 1" ? "1" : floor.name === "Ground Floor" ? "0" : "B1"}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">{floor.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="text-slate-400">Scan Match:</span>
                      <strong className="text-slate-800 font-black">{floor.progress}%</strong>
                      <span className="text-slate-300">|</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[8px] ${
                        floor.status === "Completed" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                          : floor.status === "Delayed"
                          ? "bg-red-50 text-red-700 border border-red-150"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-150"
                      }`}>
                        {floor.status}
                      </span>
                    </div>
                  </div>

                  {/* Progressive Slabs concrete/MEP indicators */}
                  <div className="grid grid-cols-3 gap-2 text-[9px] mt-1 pt-2 border-t border-slate-100 font-mono">
                    <div>
                      <span className="text-slate-400 block uppercase">Concrete</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${floor.concrete}%` }} />
                        </div>
                        <span className="font-bold text-slate-700">{floor.concrete}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase">MEP / HVAC</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full" style={{ width: `${floor.mep}%` }} />
                        </div>
                        <span className="font-bold text-slate-700">{floor.mep}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase">Finishing</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: `${floor.finishing}%` }} />
                        </div>
                        <span className="font-bold text-slate-700">{floor.finishing}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Unit / Room Level Verification Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-indigo-500" />
                Room / Unit Detail verification Matrix
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Physical elements mapping for <span className="font-bold text-slate-800">{activeFloor}</span>. Click trades to simulate QA approval.
              </p>
            </div>

            {/* Simple Room Search */}
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                placeholder="Find Room Unit..."
                className="pl-6 pr-2.5 py-1 text-[10px] bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-36"
              />
            </div>
          </div>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <div key={room.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3 group hover:border-slate-350 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black font-mono text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">
                          {room.id}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900">{room.name}</h4>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1 italic">
                        "{room.comments}"
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-950 font-mono block">
                        {room.progress}%
                      </span>
                      <span className="text-[8.5px] text-slate-400 uppercase font-bold">Matching BIM</span>
                    </div>
                  </div>

                  {/* Specific Trade Checkboxes */}
                  <div className="grid grid-cols-5 gap-2 border-t border-slate-100/80 pt-3">
                    {/* Structure */}
                    <button
                      onClick={() => handleToggleRoomTrade(activeFloor, room.id, "structure")}
                      className={`py-1 rounded text-[8.5px] font-extrabold uppercase border text-center transition ${
                        room.trades.structure
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-white text-slate-400 border-slate-150 hover:border-slate-350"
                      }`}
                      title="Toggle structural curing verification"
                    >
                      Structure
                    </button>

                    {/* Electrical */}
                    <button
                      onClick={() => handleToggleRoomTrade(activeFloor, room.id, "electrical")}
                      className={`py-1 rounded text-[8.5px] font-extrabold uppercase border text-center transition ${
                        room.trades.electrical
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-white text-slate-400 border-slate-150 hover:border-slate-350"
                      }`}
                      title="Toggle electrical routing verification"
                    >
                      Electric
                    </button>

                    {/* Plumbing */}
                    <button
                      onClick={() => handleToggleRoomTrade(activeFloor, room.id, "plumbing")}
                      className={`py-1 rounded text-[8.5px] font-extrabold uppercase border text-center transition ${
                        room.trades.plumbing
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-white text-slate-400 border-slate-150 hover:border-slate-350"
                      }`}
                      title="Toggle plumbing sleeve verification"
                    >
                      Plumbing
                    </button>

                    {/* HVAC */}
                    <button
                      onClick={() => handleToggleRoomTrade(activeFloor, room.id, "hvac")}
                      className={`py-1 rounded text-[8.5px] font-extrabold uppercase border text-center transition ${
                        room.trades.hvac
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-white text-slate-400 border-slate-150 hover:border-slate-350"
                      }`}
                      title="Toggle HVAC duct verification"
                    >
                      HVAC
                    </button>

                    {/* Finishing */}
                    <button
                      onClick={() => handleToggleRoomTrade(activeFloor, room.id, "finishing")}
                      className={`py-1 rounded text-[8.5px] font-extrabold uppercase border text-center transition ${
                        room.trades.finishing
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-white text-slate-400 border-slate-150 hover:border-slate-350"
                      }`}
                      title="Toggle finishing and partition verification"
                    >
                      Finishing
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400">
                No rooms found matching "{roomSearch}".
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 mt-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>Verify status is synchronized directly from drone photogrammetry.</span>
            <span>RERA Compliant Log #842</span>
          </div>
        </div>

      </div>

      {/* TRADE PROGRESS LEDGER & SPATIAL DEVIATIONS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-indigo-500" />
              Subcontractor Trade Progress Matrix
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Comparison of scheduled CAD planned percentages with active physical photogrammetry matches per major trade.
            </p>
          </div>
          <span className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono text-indigo-600 font-bold">
            342 active personnel
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
          
          <div className="lg:col-span-8 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tradeProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155", color: "#fff" }} />
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: "10px", fontWeight: "600" }} />
                <Bar name="Scheduled Plan" dataKey="planned" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
                <Bar name="Actual Verified Progress" dataKey="actual" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3.5">
            <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">
              Trade Performance Ledger
            </span>

            <div className="space-y-2.5">
              {tradeProgressData.map((trade) => (
                <div key={trade.name} className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      trade.status === "Stable" ? "bg-emerald-500" : trade.status === "Warning" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    <span className="font-semibold text-slate-800">{trade.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-slate-400">{trade.activeWorkers} workers</span>
                    <strong className="text-slate-900">{trade.actual}% / {trade.planned}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* TIME-SERIES PROGRESS ANALYSIS: DAILY vs WEEKLY vs MONTHLY S-CURVE */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-3 mb-5">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
              Time-Series Chronological Progress Stream
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Compare actual concrete castings and RERA milestones on daily, weekly, and monthly dimensions.
            </p>
          </div>

          {/* Time Series Tab Toggles */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setTimeTab("daily")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                timeTab === "daily" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Daily Output
            </button>
            <button
              onClick={() => setTimeTab("weekly")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                timeTab === "weekly" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Weekly S-Curve
            </button>
            <button
              onClick={() => setTimeTab("monthly")}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition ${
                timeTab === "monthly" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Monthly Deliverables
            </button>
          </div>
        </div>

        {/* Dynamic Recharts Viewport based on timeTab */}
        <div className="h-64">
          {timeTab === "daily" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155", color: "#fff" }} />
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: "10px", fontWeight: "600" }} />
                <Bar name="Concrete Cast Quantity (m³)" dataKey="Concrete Poured (m³)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar name="Scan Match Coordinates %" dataKey="Scan Alignment Match %" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {timeTab === "weekly" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgressHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c7d2fe" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#c7d2fe" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="actualScanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155", color: "#fff" }} />
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: "10px", fontWeight: "600" }} />
                <Area type="monotone" name="Scheduled BIM Baseline" dataKey="Scheduled BIM Baseline" stroke="#a5b4fc" strokeWidth={2} fillOpacity={1} fill="url(#baselineGrad)" />
                <Area type="monotone" name="Physical CV Scan Actual" dataKey="Physical CV Scan Actual" stroke="#4f46e5" strokeWidth={3.5} fillOpacity={1} fill="url(#actualScanGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {timeTab === "monthly" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "1px solid #334155", color: "#fff" }} />
                <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: "10px", fontWeight: "600" }} />
                <Line type="monotone" name="Milestone Target" dataKey="Milestone Target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" />
                <Line type="monotone" name="Milestones Achieved" dataKey="Milestones Achieved" stroke="#10b981" strokeWidth={3.5} />
                <Line type="monotone" name="RERA Compliance Index" dataKey="RERA Compliance Score" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-3 text-xs mt-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </span>
            <span>
              <strong>RERA Risk Trigger:</strong> Level 2 column mismatch created an 8-day schedule hazard. Daily remediation advised.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono text-[10px]">Critical path delay buffer: 14 days</span>
            <button
              onClick={() => setCurrentWeek(Math.min(currentWeek + 1, 5))}
              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-750 transition"
            >
              Simulate Next Scan Cycle
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
