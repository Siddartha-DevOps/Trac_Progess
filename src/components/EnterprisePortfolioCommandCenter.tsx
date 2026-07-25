import React, { useState } from "react";
import Markdown from "react-markdown";
import { 
  Building2, 
  Globe, 
  TrendingUp, 
  Award, 
  Leaf, 
  BarChart2, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  Clock, 
  MapPin, 
  DollarSign, 
  FileSpreadsheet, 
  Layers, 
  ChevronRight,
  X
} from "lucide-react";
import { useAppStore } from "../store";

interface ProjectSite {
  id: string;
  name: string;
  location: string;
  type: string;
  budget: string;
  completionPercent: number;
  spi: number;
  activeDefects: number;
  esgScore: number;
  co2SavedTons: number;
  topTrade: string;
  status: "On Schedule" | "Slight Delay" | "Critical Focus";
}

const PORTFOLIO_SITES: ProjectSite[] = [
  {
    id: "PRJ-TOWER-A",
    name: "Skyline Financial Tower A (52 Floors)",
    location: "New York, NY",
    type: "High-Rise Commercial",
    budget: "$210,000,000",
    completionPercent: 68.4,
    spi: 0.96,
    activeDefects: 14,
    esgScore: 94,
    co2SavedTons: 6.8,
    topTrade: "VoltTech Electrical",
    status: "On Schedule"
  },
  {
    id: "PRJ-HOSPITAL-B",
    name: "Metro Health Regional Hospital Wing B",
    location: "Chicago, IL",
    type: "Healthcare & Cleanrooms",
    budget: "$145,000,000",
    completionPercent: 52.1,
    spi: 0.91,
    activeDefects: 23,
    esgScore: 91,
    co2SavedTons: 4.2,
    topTrade: "ThermalShield HVAC",
    status: "Slight Delay"
  },
  {
    id: "PRJ-DATACENTER-C",
    name: "Apex HyperScale AI Data Center C",
    location: "Ashburn, VA",
    type: "Critical Infrastructure",
    budget: "$130,000,000",
    completionPercent: 81.7,
    spi: 1.04,
    activeDefects: 6,
    esgScore: 98,
    co2SavedTons: 3.2,
    topTrade: "Apex Drywall Corp",
    status: "On Schedule"
  }
];

interface SubcontractorVelocity {
  tradeName: string;
  specialty: string;
  crossSiteSites: number;
  overallVelocityPace: number; // percentage
  onTimeSignoffPercent: number;
  rank: number;
}

const SUBCONTRACTOR_RANKINGS: SubcontractorVelocity[] = [
  {
    tradeName: "VoltTech Electrical",
    specialty: "High-Voltage & Low-Voltage Smart Distribution",
    crossSiteSites: 3,
    overallVelocityPace: 98.2,
    onTimeSignoffPercent: 97.4,
    rank: 1
  },
  {
    tradeName: "Apex Drywall Corp",
    specialty: "Framing, Sheathing & Acoustic Ceilings",
    crossSiteSites: 3,
    overallVelocityPace: 94.6,
    onTimeSignoffPercent: 92.1,
    rank: 2
  },
  {
    tradeName: "ThermalShield HVAC",
    specialty: "Mechanical Piping & Cleanroom Ductwork",
    crossSiteSites: 2,
    overallVelocityPace: 89.3,
    onTimeSignoffPercent: 86.5,
    rank: 3
  },
  {
    tradeName: "FireSafe Systems",
    specialty: "Sprinkler Drops & Elastomeric Firestop",
    crossSiteSites: 3,
    overallVelocityPace: 87.1,
    onTimeSignoffPercent: 84.8,
    rank: 4
  }
];

export default function EnterprisePortfolioCommandCenter() {
  const { setActiveTab } = useAppStore();
  const [sites, setSites] = useState<ProjectSite[]>(PORTFOLIO_SITES);
  const [rankings] = useState<SubcontractorVelocity[]>(SUBCONTRACTOR_RANKINGS);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("PRJ-TOWER-A");

  // AI Briefing State
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState<boolean>(false);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);

  const handleGenerateAiBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      const res = await fetch("/api/ai/portfolio-executive-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectsCount: sites.length,
          topTrade: rankings[0].tradeName,
          esgScore: "94/100 (Grade A)",
          totalValue: "485,000,000"
        })
      });

      const data = await res.json();
      setAiBriefing(data.briefing || "No executive brief generated.");
    } catch (err) {
      console.error("Failed to generate portfolio briefing:", err);
      setAiBriefing(`### 🌐 ENTERPRISE PORTFOLIO EXECUTIVE PERFORMANCE BRIEFING\n\n- **Active Capital Portfolio**: $485,000,000 across 3 active sites.\n- **Cross-Site SPI Average**: **0.96** (Data Center C leading at 1.04 SPI).\n- **Cross-Project Subcontractor Velocity**: **VoltTech Electrical** ranked #1 with 98.2% on-time pace.\n- **ESG & Sustainability Impact**: **14.2 Tons CO2e avoided** through zero-rework photogrammetry defect detection.`);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const selectedSite = sites.find(s => s.id === selectedSiteId) || sites[0];

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-indigo-500/30 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                BUILDOTS ENTERPRISE PORTFOLIO COMMAND CENTER
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                CORPORATE ESG SCORE: 94/100
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-400 shrink-0" />
              Global Multi-Project Portfolio Performance & ESG Analytics
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Provides C-suite executives and VP Directors real-time visibility across all active capital construction projects, cross-site subcontractor velocity leaderboards, and embodied carbon waste reduction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateAiBriefing}
              disabled={isGeneratingBriefing}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingBriefing ? "animate-spin" : ""}`} />
              <span>{isGeneratingBriefing ? "AI Generating Executive Brief..." : "Run AI Portfolio Executive Briefing"}</span>
            </button>

            <button
              onClick={() => setActiveTab("subcontractor-velocity-scorecards")}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <span>Trade Scorecards</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* EXECUTIVE AI BRIEFING OUTPUT */}
      {aiBriefing && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>BUILDOTS AI MULTI-PROJECT PORTFOLIO EXECUTIVE SUMMARY</span>
            </div>
            <button onClick={() => setAiBriefing(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="markdown-body text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            <Markdown>{aiBriefing}</Markdown>
          </div>
        </div>
      )}

      {/* PORTFOLIO METRICS METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ACTIVE ENTERPRISE PORTFOLIO</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">$485,000,000</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            <span>3 Active Job Sites Under AI Monitoring</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PORTFOLIO SCHEDULE INDEX (SPI)</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-1">0.96 SPI</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Data Center C (+4%) Leading Pace</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>EMBODIED CO2 REWORK SAVINGS</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">14.2 Tons CO2e</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Zero Rework via 360° Early Defect AI</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOP CROSS-SITE TRADE</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-black text-white mt-1">VoltTech Electrical</div>
          <div className="text-[11px] text-amber-400 font-mono mt-1">
            <span>98.2% Velocity Across All 3 Sites</span>
          </div>
        </div>
      </div>

      {/* JOB SITE COMPARISON CARDS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Active Job Site Performance Comparison Matrix
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Comparative progress, SPI variance, active defects, and carbon reduction metrics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <div
              key={site.id}
              onClick={() => setSelectedSiteId(site.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedSiteId === site.id 
                  ? "bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg" 
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <span className="text-xs font-mono font-bold text-indigo-400">{site.id}</span>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                  site.status === "On Schedule"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {site.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{site.name}</h3>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {site.location} | {site.type}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Completion:</span>
                  <span className="font-bold text-white">{site.completionPercent}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${site.completionPercent}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">SPI Index:</span>
                  <strong className={site.spi >= 1.0 ? "text-emerald-400" : "text-amber-400"}>{site.spi}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">ESG Score:</span>
                  <strong className="text-emerald-400">{site.esgScore}/100</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Active Defects:</span>
                  <strong className="text-rose-400">{site.activeDefects}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">CO2 Saved:</span>
                  <strong className="text-emerald-400">{site.co2SavedTons} t</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CROSS-PROJECT SUBCONTRACTOR LEADERBOARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
          <Award className="w-5 h-5 text-amber-400" />
          Cross-Project Subcontractor Velocity & Reliability Leaderboard
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="p-3">Rank</th>
                <th className="p-3">Subcontractor Trade</th>
                <th className="p-3">Specialty</th>
                <th className="p-3">Active Sites</th>
                <th className="p-3">Cross-Site Velocity Pace</th>
                <th className="p-3">On-Time Quality Sign-offs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {rankings.map((rk) => (
                <tr key={rk.tradeName} className="hover:bg-slate-950/50 transition-colors">
                  <td className="p-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center justify-center">
                      #{rk.rank}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">{rk.tradeName}</td>
                  <td className="p-3 text-slate-400">{rk.specialty}</td>
                  <td className="p-3 text-indigo-400 font-bold">{rk.crossSiteSites} Projects</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-emerald-500 h-full" style={{ width: `${rk.overallVelocityPace}%` }} />
                      </div>
                      <span className="font-bold text-emerald-400">{rk.overallVelocityPace}%</span>
                    </div>
                  </td>
                  <td className="p-3 font-bold text-indigo-300">{rk.onTimeSignoffPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
