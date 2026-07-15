import React, { useState } from "react";
import { 
  Layers, 
  Flame, 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  MapPin, 
  Clock, 
  HelpCircle,
  Sparkles,
  Info
} from "lucide-react";
import { useHazards, useIncidents } from "./useSafetyHooks";
import { Incident, Hazard } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function SafetyHeatmapTab() {
  const { hazards } = useHazards();
  const { incidents } = useIncidents();

  const [activeOverlay, setActiveOverlay] = useState<"unsafe" | "restricted" | "ppe" | "incident">("unsafe");
  const [selectedZone, setSelectedZone] = useState<string | null>("Zone B");

  // Mock layout zones coordinates
  const zones = [
    { name: "Zone A", label: "Facade Scaffolding", x: "10%", y: "15%", w: "25%", h: "40%", risk: "Critical", activePPEViolations: 1, desc: "Level 3 perimeter external frame scaffolding." },
    { name: "Zone B", label: "Elevator Core Openings", x: "40%", y: "20%", w: "20%", h: "35%", risk: "Critical", activePPEViolations: 0, desc: "West and East elevator shafts structural openings." },
    { name: "Zone C", label: "Main MEP Risers Gallery", x: "10%", y: "60%", w: "45%", h: "30%", risk: "Medium", activePPEViolations: 2, desc: "Core piping corridors, distribution conduit rails." },
    { name: "Zone D", label: "Server Room Substation", x: "65%", y: "15%", w: "30%", h: "40%", risk: "High", activePPEViolations: 0, desc: "Temporary DB boards and cable trench lines." },
    { name: "Zone E", label: "Mechanical Plant Area", x: "60%", y: "60%", w: "35%", h: "30%", risk: "Low", activePPEViolations: 0, desc: "Air handling equipment foundation pads." }
  ];

  // Incidents mapped to zone
  const getIncidentsForZone = (zoneName: string) => {
    return incidents.filter(inc => {
      const isZone = inc.room.includes(zoneName);
      return isZone;
    });
  };

  // Hazards mapped to zone
  const getHazardsForZone = (zoneName: string) => {
    return hazards.filter(haz => {
      const isZone = haz.location.includes(zoneName);
      return isZone;
    });
  };

  const getOverlayColor = (risk: string) => {
    if (activeOverlay === "restricted") return "bg-red-500/20 border-red-500/80";
    if (activeOverlay === "ppe") return "bg-rose-500/15 border-rose-500/70";
    if (activeOverlay === "incident") return "bg-amber-500/20 border-amber-500/70";
    
    // Unsafe Risk zones default color
    switch (risk) {
      case "Critical": return "bg-rose-500/25 border-rose-500/80";
      case "High": return "bg-amber-500/20 border-amber-500/70";
      case "Medium": return "bg-yellow-500/15 border-yellow-500/50";
      default: return "bg-emerald-500/10 border-emerald-500/30";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
      
      {/* Left map layout canvas */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div className="space-y-4 flex-1 flex flex-col">
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono">Digital Twin overlay</span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-0.5">Level 2 Spatial Safety Heatmap</h4>
            </div>

            {/* Overlays configuration buttons */}
            <div className="flex gap-1.5 flex-wrap">
              {[
                { id: "unsafe", label: "Unsafe Zones", color: "text-rose-600 bg-rose-50" },
                { id: "restricted", label: "Restricted Areas", color: "text-red-650 bg-red-50" },
                { id: "ppe", label: "PPE Violations", color: "text-amber-600 bg-amber-50" },
                { id: "incident", label: "Incident Density", color: "text-indigo-650 bg-indigo-50" }
              ].map((ov) => (
                <button
                  key={ov.id}
                  onClick={() => setActiveOverlay(ov.id as any)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold uppercase tracking-wider transition ${
                    activeOverlay === ov.id 
                      ? "bg-slate-900 border-slate-900 text-white" 
                      : "bg-white text-slate-650 hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  {ov.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Spatial Grid Floorplan */}
          <div className="flex-1 bg-slate-950 border border-slate-900 rounded-xl min-h-[300px] relative overflow-hidden select-none">
            
            {/* Grid blueprint background */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Title / Compass overlay */}
            <div className="absolute top-3 left-3 bg-slate-900/80 border border-slate-800 text-[9px] font-mono p-1.5 rounded text-slate-400">
              BUILDING FLOOR: LEVEL 2 PLAN • NORTH ↑
            </div>

            {/* Heatmap overlay markers */}
            {zones.map((zone) => (
              <button
                key={zone.name}
                onClick={() => setSelectedZone(zone.name)}
                style={{
                  position: "absolute",
                  left: zone.x,
                  top: zone.y,
                  width: zone.w,
                  height: zone.h,
                }}
                className={`border rounded-lg p-2 flex flex-col justify-between text-left transition-all ${getOverlayColor(zone.risk)} ${
                  selectedZone === zone.name 
                    ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-[1.01]" 
                    : "hover:bg-slate-500/10"
                }`}
              >
                <div className="flex justify-between items-start gap-1 font-mono">
                  <span className="text-[10px] font-bold text-white bg-slate-950/70 px-1 py-0.2 rounded shrink-0">{zone.name}</span>
                  <span className={`text-[8px] font-bold uppercase px-1 rounded ${
                    zone.risk === "Critical" ? "bg-red-650 text-white" : "bg-amber-500 text-white"
                  }`}>
                    {zone.risk} Risk
                  </span>
                </div>

                <div className="bg-slate-950/80 p-1 rounded font-mono text-[8px] text-slate-300">
                  <span className="font-bold block text-white truncate">{zone.label}</span>
                  {activeOverlay === "ppe" && (
                    <span className="text-amber-400 block mt-0.5">PPE Violations: {zone.activePPEViolations}</span>
                  )}
                  {activeOverlay === "restricted" && (
                    <span className="text-red-400 block mt-0.5">RESTRICTED ZONE</span>
                  )}
                </div>
              </button>
            ))}

          </div>

        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-sans">
          <span>Click on any highlighted spatial zone (Zone A - E) to inspect its related site incidents and hazards list.</span>
        </div>
      </div>

      {/* Right details drawer tab */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between h-[500px]">
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Zone Details</span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-0.5">Spatial Analysis</h4>
            </div>
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
          </div>

          <AnimatePresence mode="wait">
            {selectedZone ? (
              <motion.div
                key={selectedZone}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4 flex-1 flex flex-col min-h-0 text-slate-700"
              >
                {/* Zone Info card */}
                <div className="bg-slate-50 border p-3 rounded-lg space-y-1.5 shrink-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{selectedZone} - {zones.find(z => z.name === selectedZone)?.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {zones.find(z => z.name === selectedZone)?.desc}
                  </p>
                </div>

                {/* Related Incidents */}
                <div className="flex-1 flex flex-col min-h-0 space-y-2">
                  <span className="text-[10px] text-slate-450 font-mono font-bold uppercase shrink-0">Zone Incident reports</span>
                  
                  <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                    {getIncidentsForZone(selectedZone).length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">No recent safety incidents recorded in this zone.</p>
                    ) : (
                      getIncidentsForZone(selectedZone).map((inc) => (
                        <div key={inc.id} className="p-2 border rounded-lg bg-slate-50 text-[11px] space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 uppercase truncate">{inc.title}</span>
                            <span className="text-[9px] font-mono text-indigo-600">{inc.id}</span>
                          </div>
                          <p className="text-[10px] text-slate-550 leading-relaxed line-clamp-2">{inc.description}</p>
                          <span className="text-[9px] text-slate-400 block font-mono">Status: {inc.status} | CAPA Active</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Related Hazards */}
                <div className="flex-1 flex flex-col min-h-0 space-y-2 border-t border-slate-100 pt-2 shrink-0 h-40">
                  <span className="text-[10px] text-slate-450 font-mono font-bold uppercase shrink-0">Active Hazards Checklist</span>
                  
                  <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                    {getHazardsForZone(selectedZone).length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">No active structural safety hazards flagged.</p>
                    ) : (
                      getHazardsForZone(selectedZone).map((haz) => (
                        <div key={haz.id} className="p-2 border rounded-lg bg-slate-50 text-[11px] space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 uppercase">{haz.hazardType}</span>
                            <span className="text-[9px] font-mono font-bold text-rose-500">{haz.riskLevel}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">{haz.mitigation}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-[11px] italic">
                Select an architectural grid segment to query location logs.
              </div>
            )}
          </AnimatePresence>

        </div>

        <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono shrink-0">
          Spatial Resolution: Grid 0.5m CV Accuracy
        </div>
      </div>

    </div>
  );
}
