import React, { useState } from "react";
import { 
  Sparkles, 
  MapPin, 
  Info, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  TrendingUp, 
  Target,
  BarChart2
} from "lucide-react";

interface HeatmapZone {
  id: string;
  name: string;
  location: string;
  metrics: {
    inspectionDensity: number; // scans/sqm
    qualityScore: number; // %
    safetyScore: number; // %
    productivityIndex: number; // %
    scheduleSlipDays: number;
  };
  reasons: string;
  remedy: string;
}

const HEAT_MAP_ZONES: HeatmapZone[] = [
  {
    id: "ZONE-A",
    name: "Zone A (East Wing)",
    location: "Level 2 structural core",
    metrics: {
      inspectionDensity: 92,
      qualityScore: 96,
      safetyScore: 98,
      productivityIndex: 94,
      scheduleSlipDays: 0
    },
    reasons: "Main columns casted 3 days ahead of schedule with flawless dimensional compliance.",
    remedy: "Authorize Level 3 vertical starter bar placements."
  },
  {
    id: "ZONE-B",
    name: "Zone B (West Wing)",
    location: "Level 2 HVAC & electrical lines",
    metrics: {
      inspectionDensity: 88,
      qualityScore: 68,
      safetyScore: 90,
      productivityIndex: 45,
      scheduleSlipDays: 6.2
    },
    reasons: "Severe spacing deviations on L2 Column rebar cages and collision between sprinkler & HVAC lines.",
    remedy: "Immediate physical stop-work. Adjust sprinkler placement offset coordinates by 15cm South."
  },
  {
    id: "ZONE-C",
    name: "Zone C (Core Lift Lobby)",
    location: "Level 2 shaft wall masonry",
    metrics: {
      inspectionDensity: 74,
      qualityScore: 84,
      safetyScore: 94,
      productivityIndex: 82,
      scheduleSlipDays: 1.5
    },
    reasons: "Minor delay in AAC block deliveries from local Whitefield yard, slightly slowing lift shaft cladding.",
    remedy: "Re-route supply from backup Hosur yard; double labor team shift size."
  },
  {
    id: "ZONE-D",
    name: "Zone D (Server Room Area)",
    location: "Level 2 service corridors",
    metrics: {
      inspectionDensity: 60,
      qualityScore: 92,
      safetyScore: 88,
      productivityIndex: 78,
      scheduleSlipDays: 0.8
    },
    reasons: "Conduit layout complete. Low photogrammetry inspection density due to dust build-up interfering with lens alignment.",
    remedy: "Deploy air-sweep protocol; perform handheld smartphone scan on Corridor 2D."
  },
  {
    id: "ZONE-E",
    name: "Zone E (Mechanical Room)",
    location: "Level 2 AHU & piping zones",
    metrics: {
      inspectionDensity: 45,
      qualityScore: 78,
      safetyScore: 82,
      productivityIndex: 60,
      scheduleSlipDays: 3.5
    },
    reasons: "Supply line chilled piping installation delayed by 4 days due to valve manifold back-orders.",
    remedy: "Prioritize fabrication of pipe supports while manifold is in transit from Mumbai."
  },
  {
    id: "ZONE-F",
    name: "Zone F (Facade Glazing)",
    location: "Block B external shell",
    metrics: {
      inspectionDensity: 96,
      qualityScore: 95,
      safetyScore: 96,
      productivityIndex: 90,
      scheduleSlipDays: 0
    },
    reasons: "Excellent drone orthomosaic alignment. Anchor bolts matched 3D BIM coordinate margins within 3mm.",
    remedy: "Authorize release of Phase 1 double-glazed unit panels."
  }
];

export default function RealityHeatmapView() {
  const [activeMetric, setActiveMetric] = useState<"inspectionDensity" | "qualityScore" | "safetyScore" | "productivityIndex" | "scheduleSlipDays">("scheduleSlipDays");
  const [selectedZone, setSelectedZone] = useState<HeatmapZone>(HEAT_MAP_ZONES[1]); // Default to Zone B

  const getMetricColor = (zone: HeatmapZone) => {
    const val = zone.metrics[activeMetric];
    
    if (activeMetric === "scheduleSlipDays") {
      if (val === 0) return "bg-emerald-500 text-emerald-950 border-emerald-600";
      if (val < 2) return "bg-amber-400 text-amber-950 border-amber-500";
      return "bg-rose-500 text-white border-rose-600 animate-pulse";
    }

    if (activeMetric === "qualityScore" || activeMetric === "safetyScore" || activeMetric === "productivityIndex") {
      if (val >= 90) return "bg-emerald-500 text-white border-emerald-600";
      if (val >= 75) return "bg-amber-400 text-amber-950 border-amber-500";
      return "bg-rose-500 text-white border-rose-600";
    }

    // inspectionDensity
    if (val >= 80) return "bg-indigo-600 text-white border-indigo-700";
    if (val >= 60) return "bg-indigo-400 text-indigo-950 border-indigo-500";
    return "bg-indigo-200 text-indigo-900 border-indigo-300";
  };

  const getMetricLabel = (val: number) => {
    if (activeMetric === "scheduleSlipDays") return `${val} Days Slip`;
    if (activeMetric === "inspectionDensity") return `${val} Scans/m²`;
    return `${val}% Rate`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      {/* Interactive Map Visualizer (8 Cols) */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-100 flex flex-col gap-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono tracking-wider">Spatial Density Maps</span>
            <h3 className="text-sm font-bold uppercase tracking-tight text-white mt-0.5">Reality Capture Heat Matrix</h3>
          </div>

          {/* Metric selector tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-950 rounded-lg text-xs font-mono">
            <button
              onClick={() => setActiveMetric("scheduleSlipDays")}
              className={`px-2.5 py-1 rounded transition ${activeMetric === "scheduleSlipDays" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
            >
              Schedule Risk
            </button>
            <button
              onClick={() => setActiveMetric("qualityScore")}
              className={`px-2.5 py-1 rounded transition ${activeMetric === "qualityScore" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
            >
              Quality Score
            </button>
            <button
              onClick={() => setActiveMetric("safetyScore")}
              className={`px-2.5 py-1 rounded transition ${activeMetric === "safetyScore" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
            >
              Safety Score
            </button>
            <button
              onClick={() => setActiveMetric("productivityIndex")}
              className={`px-2.5 py-1 rounded transition ${activeMetric === "productivityIndex" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
            >
              Productivity
            </button>
            <button
              onClick={() => setActiveMetric("inspectionDensity")}
              className={`px-2.5 py-1 rounded transition ${activeMetric === "inspectionDensity" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"}`}
            >
              Scan Density
            </button>
          </div>
        </div>

        {/* 2D Grid Representation of the Floor */}
        <div className="relative h-[250px] bg-slate-950 rounded-lg border border-slate-850 p-4 flex flex-col justify-between">
          
          <div className="text-[9px] text-slate-500 font-mono flex justify-between uppercase">
            <span>Grid Plane: Level 2 Plan View</span>
            <span>Total Inspected Area: 14,200 sq ft</span>
          </div>

          {/* Grid Blueprint representation with overlay color regions */}
          <div className="grid grid-cols-3 gap-4 my-auto h-40">
            {HEAT_MAP_ZONES.map((zone) => {
              const isSelected = selectedZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`relative rounded-lg p-3 border transition-all flex flex-col justify-between text-left ${getMetricColor(zone)} ${
                    isSelected ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 scale-102 shadow-lg" : "hover:scale-101 hover:brightness-105"
                  }`}
                >
                  <div className="flex justify-between items-start font-mono text-[9px]">
                    <span className="font-extrabold tracking-wider">{zone.id}</span>
                    <MapPin className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-[10px] font-black tracking-tight leading-tight block">{zone.name}</span>
                    <span className="text-[8px] opacity-75 font-semibold font-mono block mt-0.5">{zone.location}</span>
                  </div>

                  <div className="mt-3 text-right">
                    <span className="text-[10px] font-bold font-mono bg-black/20 px-1.5 py-0.5 rounded border border-black/10">
                      {getMetricLabel(zone.metrics[activeMetric])}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
            <span>Color Scale: Green (Optimal) • Yellow (Moderate deviation) • Red (Severe warning)</span>
            <span>*Based on drone orthomosaics & LiDAR point clouds</span>
          </div>

        </div>

      </div>

      {/* Localized Telemetry Inspector Panel (4 Cols) */}
      <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between text-slate-100 shadow-xl">
        
        <div className="flex flex-col gap-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-indigo-400 font-bold uppercase font-mono tracking-wider">Zone Telemetry</span>
              <h4 className="text-xs font-bold uppercase mt-0.5">{selectedZone.name}</h4>
            </div>
            <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-indigo-300 px-1.5 py-0.5 rounded uppercase font-bold">
              {selectedZone.id}
            </span>
          </div>

          {/* Quick Metrics values */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-850">
              <span className="text-slate-400 block uppercase">Quality Score</span>
              <span className={`text-sm font-black block mt-0.5 ${selectedZone.metrics.qualityScore >= 90 ? "text-emerald-400" : (selectedZone.metrics.qualityScore >= 75 ? "text-amber-400" : "text-red-400")}`}>
                {selectedZone.metrics.qualityScore}% Rated
              </span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-850">
              <span className="text-slate-400 block uppercase">Schedule Slip</span>
              <span className={`text-sm font-black block mt-0.5 ${selectedZone.metrics.scheduleSlipDays === 0 ? "text-emerald-400" : (selectedZone.metrics.scheduleSlipDays < 2 ? "text-amber-400" : "text-red-400 animate-pulse")}`}>
                {selectedZone.metrics.scheduleSlipDays} Days
              </span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-850">
              <span className="text-slate-400 block uppercase">Inspection Density</span>
              <span className="text-white text-sm font-black block mt-0.5">
                {selectedZone.metrics.inspectionDensity} Scans
              </span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-850">
              <span className="text-slate-400 block uppercase">Safety Index</span>
              <span className="text-white text-sm font-black block mt-0.5">
                {selectedZone.metrics.safetyScore}% Rated
              </span>
            </div>
          </div>

          {/* Descriptive text block */}
          <div className="bg-slate-900 p-3 rounded border border-slate-850 flex flex-col gap-1 text-[11px] leading-relaxed">
            <span className="font-bold text-indigo-400 block uppercase font-mono tracking-wider text-[8px]">Anomaly Audit Summary</span>
            <p className="text-slate-300">{selectedZone.reasons}</p>
          </div>

          <div className="bg-indigo-950/20 p-3 rounded border border-indigo-500/10 flex flex-col gap-1 text-[11px] leading-relaxed">
            <span className="font-bold text-emerald-400 block uppercase font-mono tracking-wider text-[8px]">Prescriptive AI Remediation</span>
            <p className="text-slate-300">{selectedZone.remedy}</p>
          </div>

        </div>

        <div className="p-3 bg-slate-900/60 rounded border border-slate-850 text-[10px] text-slate-400 leading-relaxed font-sans mt-4">
          <span className="font-bold text-slate-300 block uppercase font-mono tracking-wider text-[8px] mb-1">Reality Capture Integration</span>
          Selecting zones maps telemetry triggers directly into your <strong>Issues Ledger</strong> & <strong>Quality QMS ISO Protocols</strong>.
        </div>

      </div>

    </div>
  );
}
