import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, 
  MapPin, 
  Layers, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Activity, 
  User, 
  History, 
  Ruler, 
  Compass,
  ArrowRight
} from "lucide-react";

interface RoomData {
  id: string;
  name: string;
  trade: string;
  subcontractor: string;
  progress: number;
  status: "completed" | "in_progress" | "delayed" | "not_started";
  riskLevel: "none" | "low" | "medium" | "high";
  delayDays: number;
  reraUnitId: string;
  inspectionWalks: { date: string; inspector: string; walkNo: number; status: string }[];
}

interface FloorData {
  id: string;
  label: string;
  totalRooms: number;
  avgProgress: number;
  rooms: RoomData[];
}

const FLOOR_SCHEMATICS: FloorData[] = [
  {
    id: "level-3",
    label: "Level 3 - Office Suites",
    totalRooms: 6,
    avgProgress: 42.8,
    rooms: [
      {
        id: "r301",
        name: "Suite 301 - Wing A Executive",
        trade: "Finishes (Drywall)",
        subcontractor: "L&T Finishes Division",
        progress: 85,
        status: "in_progress",
        riskLevel: "low",
        delayDays: 2,
        reraUnitId: "KA-R301-EXE",
        inspectionWalks: [
          { date: "2026-07-10", inspector: "S. Rao", walkNo: 12, status: "Partitions Approved" },
          { date: "2026-07-13", inspector: "M. Kumar", walkNo: 15, status: "Joint Compound Applied" }
        ]
      },
      {
        id: "r302",
        name: "Suite 302 - Wing A Conference",
        trade: "MEP Conduit & Ducting",
        subcontractor: "Sterling & Wilson MEP",
        progress: 35,
        status: "delayed",
        riskLevel: "high",
        delayDays: 14,
        reraUnitId: "KA-R302-CON",
        inspectionWalks: [
          { date: "2026-07-08", inspector: "S. Rao", walkNo: 11, status: "Duct Clash Logged" }
        ]
      },
      {
        id: "r303",
        name: "Suite 303 - Wing B Workspace",
        trade: "Concrete Slab Floor Curing",
        subcontractor: "Ahluwalia Contractors",
        progress: 100,
        status: "completed",
        riskLevel: "none",
        delayDays: 0,
        reraUnitId: "KA-R303-WS",
        inspectionWalks: [
          { date: "2026-07-02", inspector: "J. Sharma", walkNo: 8, status: "Curing Completed" },
          { date: "2026-07-05", inspector: "M. Kumar", walkNo: 10, status: "Core Drills Approved" }
        ]
      },
      {
        id: "r304",
        name: "Suite 304 - Wing B Lounge",
        trade: "Structural Steel Frame",
        subcontractor: "Ahluwalia Contractors",
        progress: 100,
        status: "completed",
        riskLevel: "none",
        delayDays: 0,
        reraUnitId: "KA-R304-LNG",
        inspectionWalks: [
          { date: "2026-07-04", inspector: "J. Sharma", walkNo: 9, status: "Bolts Torqued & Signed Off" }
        ]
      },
      {
        id: "r305",
        name: "Suite 305 - Core Utilities",
        trade: "MEP Pluvial Piping",
        subcontractor: "Sterling & Wilson MEP",
        progress: 10,
        status: "in_progress",
        riskLevel: "medium",
        delayDays: 5,
        reraUnitId: "KA-R305-UTIL",
        inspectionWalks: [
          { date: "2026-07-11", inspector: "M. Kumar", walkNo: 13, status: "Sleeve Blockouts Checked" }
        ]
      },
      {
        id: "r306",
        name: "Suite 306 - Wing C Elevator Lobby",
        trade: "Masonry Walls Construction",
        subcontractor: "L&T Finishes Division",
        progress: 0,
        status: "not_started",
        riskLevel: "none",
        delayDays: 0,
        reraUnitId: "KA-R306-LOBY",
        inspectionWalks: []
      }
    ]
  },
  {
    id: "level-2",
    label: "Level 2 - Commercial Gym & Retail",
    totalRooms: 5,
    avgProgress: 88.5,
    rooms: [
      {
        id: "r201",
        name: "Room 201 - Fitness Center A",
        trade: "Finishes (Flooring)",
        subcontractor: "L&T Finishes Division",
        progress: 100,
        status: "completed",
        riskLevel: "none",
        delayDays: 0,
        reraUnitId: "KA-R201-FIT",
        inspectionWalks: [
          { date: "2026-06-25", inspector: "S. Rao", walkNo: 5, status: "Screed Approved" },
          { date: "2026-06-30", inspector: "M. Kumar", walkNo: 7, status: "Hardwood Inspected" }
        ]
      },
      {
        id: "r202",
        name: "Room 202 - Cafeteria Kitchen B",
        trade: "MEP Exhaust Canopy",
        subcontractor: "Sterling & Wilson MEP",
        progress: 95,
        status: "in_progress",
        riskLevel: "low",
        delayDays: 1,
        reraUnitId: "KA-R202-KTC",
        inspectionWalks: [
          { date: "2026-07-01", inspector: "J. Sharma", walkNo: 8, status: "Exhaust Plenum Mounted" }
        ]
      },
      {
        id: "r203",
        name: "Room 203 - Retail Shop 1",
        trade: "Drywall Priming",
        subcontractor: "L&T Finishes Division",
        progress: 100,
        status: "completed",
        riskLevel: "none",
        delayDays: 0,
        reraUnitId: "KA-R203-RET1",
        inspectionWalks: [
          { date: "2026-06-28", inspector: "M. Kumar", walkNo: 6, status: "Primer Coating Inspected" }
        ]
      },
      {
        id: "r204",
        name: "Room 204 - Retail Shop 2",
        trade: "Electrical Service Outlets",
        subcontractor: "Sterling & Wilson MEP",
        progress: 80,
        status: "in_progress",
        riskLevel: "medium",
        delayDays: 3,
        reraUnitId: "KA-R204-RET2",
        inspectionWalks: [
          { date: "2026-07-12", inspector: "S. Rao", walkNo: 14, status: "First-fix wiring completed" }
        ]
      },
      {
        id: "r205",
        name: "Room 205 - Utility Shaft",
        trade: "Plumbing Riser Installation",
        subcontractor: "Sterling & Wilson MEP",
        progress: 68,
        status: "in_progress",
        riskLevel: "low",
        delayDays: 0,
        reraUnitId: "KA-R205-SHAFT",
        inspectionWalks: [
          { date: "2026-07-09", inspector: "J. Sharma", walkNo: 11, status: "Stack Pipe Pressure Tested" }
        ]
      }
    ]
  }
];

export default function DigitalTwinProgressMap() {
  const [selectedFloor, setSelectedFloor] = useState<FloorData>(FLOOR_SCHEMATICS[0]);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(FLOOR_SCHEMATICS[0].rooms[1]);

  const handleFloorChange = (floorId: string) => {
    const found = FLOOR_SCHEMATICS.find(f => f.id === floorId);
    if (found) {
      setSelectedFloor(found);
      setSelectedRoom(found.rooms[0] || null);
    }
  };

  const getStatusColor = (status: RoomData["status"]) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/20";
      case "in_progress": return "bg-blue-500/10 border-blue-500/60 text-blue-400 hover:bg-blue-500/20";
      case "delayed": return "bg-red-500/10 border-red-500/60 text-red-400 hover:bg-red-500/20 animate-pulse";
      default: return "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800/60";
    }
  };

  const getRiskBadge = (risk: RoomData["riskLevel"]) => {
    switch (risk) {
      case "high": return "bg-red-950/40 text-red-400 border border-red-900/30";
      case "medium": return "bg-amber-950/40 text-amber-400 border border-amber-900/30";
      case "low": return "bg-blue-950/40 text-blue-400 border border-blue-900/30";
      default: return "bg-slate-950 text-slate-500 border border-slate-800";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="digital-twin-progress-map">
      {/* Header Info */}
      <div className="bg-[#121620]/80 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#daff00]/10 text-[#daff00] font-mono text-[10px] font-bold border border-[#daff00]/20 uppercase">Module D-4</span>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#daff00]" />
              Digital Twin 2D Floor Plan Progress Map
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Navigate through construction sectors. Click any zone inside the floor schematic to inspect subtrade schedules and RERA units.
          </p>
        </div>
        
        {/* Floor Switch Tab Controls */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 self-start md:self-center">
          {FLOOR_SCHEMATICS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFloorChange(f.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition font-mono ${
                selectedFloor.id === f.id
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {f.id.toUpperCase().replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Floor schematic stage (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>FLOOR SCHEMATIC OVERVIEW • LEVEL AVERAGE PROGRESS:</span>
            <span className="font-bold text-[#daff00]">{selectedFloor.avgProgress}%</span>
          </div>

          {/* Floor Grid Drawing Area */}
          <div className="h-[320px] md:h-[380px] w-full rounded-xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden group select-none">
            {/* Visual Blueprint Grid overlay */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(white 1px, transparent 1px),
                  linear-gradient(90deg, white 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px"
              }}
            />

            {/* Room Blueprint layout matrix */}
            <div className="grid grid-cols-3 grid-rows-2 gap-4 h-full relative z-10">
              {selectedFloor.rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const activeColorClass = getStatusColor(room.status);

                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between text-left relative overflow-hidden group/room cursor-pointer ${activeColorClass} ${
                      isSelected 
                        ? "ring-2 ring-white border-white scale-[1.02] shadow-2xl z-20" 
                        : "hover:scale-[1.01]"
                    }`}
                  >
                    {/* Top metadata row */}
                    <div className="flex justify-between items-start gap-1 w-full">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate max-w-[80%]">
                        {room.reraUnitId}
                      </span>
                      {room.status === "delayed" && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" />
                      )}
                      {room.status === "completed" && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>

                    {/* Room Name */}
                    <div className="mt-2">
                      <h4 className="text-xs font-black text-white leading-snug truncate group-hover/room:text-[#daff00] transition-colors">
                        {room.name.split("-")[0]}
                      </h4>
                      <p className="text-[9px] text-slate-500 font-mono tracking-wide mt-0.5 truncate uppercase">
                        {room.trade.split(" ")[0]}
                      </p>
                    </div>

                    {/* Progress slider bar inside room card */}
                    <div className="w-full mt-3">
                      <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-1 leading-none">
                        <span>Progress</span>
                        <span className="font-bold text-slate-200">{room.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${room.progress}%` }}
                          className={`h-full rounded-full ${
                            room.status === "completed" 
                              ? "bg-emerald-500" 
                              : room.status === "delayed" ? "bg-red-500" : "bg-blue-500"
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Stage bottom HUD text */}
            <div className="absolute bottom-3 left-4 z-10 text-[9px] font-mono text-slate-600">
              RECONSTRUCTED SPATIAL MAPPING • COMPLIANCE STANDARD: ISO 19650 BIM
            </div>
          </div>
        </div>

        {/* Selected Zone Detail Sidebar (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-500" />
              Zone Inspector Ledger
            </h4>
          </div>

          <AnimatePresence mode="wait">
            {selectedRoom ? (
              <motion.div
                key={selectedRoom.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-2xl relative"
              >
                {/* Header Room Info */}
                <div className="border-b border-slate-800/80 pb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                      RERA UNIT: {selectedRoom.reraUnitId}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getRiskBadge(selectedRoom.riskLevel)}`}>
                      RISK: {selectedRoom.riskLevel}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white leading-snug">{selectedRoom.name}</h4>
                </div>

                {/* KPI metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Active Trade</span>
                    <span className="font-bold text-slate-200 mt-0.5 block truncate" title={selectedRoom.trade}>{selectedRoom.trade}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Subcontractor</span>
                    <span className="font-bold text-slate-200 mt-0.5 block truncate" title={selectedRoom.subcontractor}>{selectedRoom.subcontractor}</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Measured Delay</span>
                    <span className={`font-mono font-bold mt-0.5 block ${selectedRoom.delayDays > 0 ? "text-red-400 animate-pulse" : "text-slate-400"}`}>
                      {selectedRoom.delayDays > 0 ? `+${selectedRoom.delayDays} days lag` : "On schedule"}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Room Progress</span>
                    <span className="font-bold text-[#daff00] font-mono mt-0.5 block">{selectedRoom.progress}%</span>
                  </div>
                </div>

                {/* Inspection Walk Log Trail */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    Inspection Walk History
                  </span>
                  
                  {selectedRoom.inspectionWalks.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {selectedRoom.inspectionWalks.map((walk, idx) => (
                        <div key={idx} className="bg-slate-900 p-2.5 rounded-lg border border-slate-850 text-[11px] flex justify-between items-start">
                          <div>
                            <span className="font-bold text-white block">Walk #{walk.walkNo} • {walk.inspector}</span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Walked on {walk.date}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono text-right">{walk.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-850 border-dashed text-center text-[11px] text-slate-500 leading-normal">
                      No inspection walks registered for this sector yet. Scheduling routine walkthrough walk is recommended.
                    </div>
                  )}
                </div>

                {/* Subtrade dispute indicator if delayed */}
                {selectedRoom.status === "delayed" && (
                  <div className="bg-red-950/25 border border-red-900/40 p-3 rounded-lg flex items-start gap-2.5 text-[11px] text-red-400 leading-normal">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500 animate-pulse" />
                    <p>
                      <strong>Subtrade Schedule Bottleneck:</strong> Delay of {selectedRoom.delayDays} days due to trade sequencing. Drywall sheeting depends on completed MEP first-fix inspect logs. Sterling & Wilson MEP has been alerted.
                    </p>
                  </div>
                )}

              </motion.div>
            ) : (
              <div className="bg-slate-950/40 border border-slate-800 border-dashed rounded-xl p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5">
                <Layers className="w-6 h-6 text-slate-600" />
                <span>Select any room zone on the schematic plan to populate detailed schedule inspection logs.</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
