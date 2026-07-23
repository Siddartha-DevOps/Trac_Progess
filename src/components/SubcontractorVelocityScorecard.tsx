import React, { useState } from "react";
import { 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Send, 
  Download, 
  Sparkles, 
  Zap, 
  Layers, 
  Search, 
  Filter, 
  ShieldAlert, 
  BarChart3, 
  Ruler, 
  Building2, 
  Check, 
  X,
  FileSpreadsheet,
  Printer
} from "lucide-react";

interface SubcontractorPerformance {
  id: string;
  tradeName: string;
  contractorName: string;
  grade: "A+" | "A" | "B" | "C" | "F";
  unitMetric: string; // e.g. "m²/day", "m/day", "m³/day"
  plannedVelocity: number;
  actualVelocity: number;
  reworkFrequencyPercent: number;
  openDefectsCount: number;
  activeNtcCount: number;
  complianceScore: number; // 0 - 100
  recentBreaches: {
    id: string;
    title: string;
    location: string;
    dateCaptured: string;
    description: string;
    photoFrameId: string;
  }[];
}

const SUBCONTRACTORS: SubcontractorPerformance[] = [
  {
    id: "sub-01",
    tradeName: "Drywall & Partition Systems",
    contractorName: "Shapoorji Finishing & Drywall Corp",
    grade: "C",
    unitMetric: "m²/day",
    plannedVelocity: 180,
    actualVelocity: 110,
    reworkFrequencyPercent: 14.2,
    openDefectsCount: 8,
    activeNtcCount: 2,
    complianceScore: 68,
    recentBreaches: [
      {
        id: "BREACH-301",
        title: "Drywall Closing Without In-Wall Insulation & MEP Signoff",
        location: "Executive Suite 312 Wall Partition P-04",
        dateCaptured: "2026-07-22 10:15 AM",
        description: "Board Side B closed out prior to acoustic insulation batt placement and MEP cable tray inspection signoff.",
        photoFrameId: "FRAME-2026-0722-104"
      },
      {
        id: "BREACH-302",
        title: "Missing Timber Backing for Heavy TV Wall Mount",
        location: "Conference Room 301 East Wall",
        dateCaptured: "2026-07-21 02:40 PM",
        description: "Drywall board mounted without timber backing plate as specified in BIM architectural drawing sheet A-402.",
        photoFrameId: "FRAME-2026-0721-098"
      }
    ]
  },
  {
    id: "sub-02",
    tradeName: "MEP Mechanical & HVAC",
    contractorName: "Voltas MEP Solutions Ltd",
    grade: "A",
    unitMetric: "meters/day",
    plannedVelocity: 95,
    actualVelocity: 92,
    reworkFrequencyPercent: 3.1,
    openDefectsCount: 2,
    activeNtcCount: 0,
    complianceScore: 94,
    recentBreaches: [
      {
        id: "BREACH-303",
        title: "Fire Damper FD-302 Missing in Plant Room 3B",
        location: "Plant Room 3B Main Trunk Opening",
        dateCaptured: "2026-07-23 09:30 AM",
        description: "Duct opening unsealed; motorized fire damper unit absent during 360° helmet walk capture.",
        photoFrameId: "FRAME-2026-0723-202"
      }
    ]
  },
  {
    id: "sub-03",
    tradeName: "MEP Electrical & Trays",
    contractorName: "L&T Electrical & Automation",
    grade: "A+",
    unitMetric: "meters/day",
    plannedVelocity: 120,
    actualVelocity: 135,
    reworkFrequencyPercent: 1.2,
    openDefectsCount: 0,
    activeNtcCount: 0,
    complianceScore: 98,
    recentBreaches: []
  }
];

export default function SubcontractorVelocityScorecard() {
  const [selectedSub, setSelectedSub] = useState<SubcontractorPerformance>(SUBCONTRACTORS[0]);
  const [selectedBreach, setSelectedBreach] = useState<any>(SUBCONTRACTORS[0].recentBreaches[0] || null);
  const [isNtcModalOpen, setIsNtcModalOpen] = useState<boolean>(false);
  const [ntcSuccessMessage, setNtcSuccessMessage] = useState<string | null>(null);

  const handleDispatchNtc = () => {
    setNtcSuccessMessage(`Formal Notice to Comply (NTC #${Math.floor(1000 + Math.random() * 9000)}) dispatched to ${selectedSub.contractorName}. 48-hour cure period initiated.`);
    setIsNtcModalOpen(false);
    setTimeout(() => setNtcSuccessMessage(null), 7000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-amber-500/30 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                SUBCONTRACTOR VELOCITY & SCORECARD ENGINE
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-emerald-500/30">
                AUTOMATED CONTRACT NTC GENERATOR
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-amber-400 shrink-0" />
              Subcontractor Velocity Leaderboards & Notice to Comply (NTC)
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Measures contractor daily installation velocity (m²/day, meters/day) vs planned velocity, grades quality output, and dispatches legally binding Notice to Comply (NTC) notices with 360° photo evidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => {
                if (selectedSub.recentBreaches.length > 0) {
                  setSelectedBreach(selectedSub.recentBreaches[0]);
                  setIsNtcModalOpen(true);
                } else {
                  alert("No active breaches recorded for this contractor!");
                }
              }}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              Generate Notice to Comply (NTC)
            </button>
          </div>
        </div>
      </div>

      {/* DISPATCH SUCCESS ALERT */}
      {ntcSuccessMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{ntcSuccessMessage}</span>
          </div>
          <button onClick={() => setNtcSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LEADERBOARD & PERFORMANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUBCONTRACTORS.map((sub) => {
          const isSelected = selectedSub.id === sub.id;

          let gradeBadge = "bg-emerald-500 text-slate-950 border-emerald-300";
          if (sub.grade === "B") gradeBadge = "bg-indigo-500 text-white border-indigo-300";
          if (sub.grade === "C") gradeBadge = "bg-amber-500 text-slate-950 border-amber-300";
          if (sub.grade === "F") gradeBadge = "bg-rose-500 text-white border-rose-300";

          return (
            <div
              key={sub.id}
              onClick={() => {
                setSelectedSub(sub);
                if (sub.recentBreaches.length > 0) setSelectedBreach(sub.recentBreaches[0]);
                else setSelectedBreach(null);
              }}
              className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all space-y-4 ${
                isSelected 
                  ? "border-amber-500 shadow-xl ring-2 ring-amber-500/30" 
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  {sub.tradeName}
                </span>
                <span className={`w-8 h-8 rounded-full font-black text-sm flex items-center justify-center border shadow ${gradeBadge}`}>
                  {sub.grade}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{sub.contractorName}</h3>
                <div className="text-xs text-emerald-400 font-mono mt-1">
                  Compliance Rating: {sub.complianceScore}%
                </div>
              </div>

              {/* VELOCITY METRICS */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[9px] text-slate-400">Planned Output</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    {sub.plannedVelocity} <span className="text-[10px] font-normal text-slate-400">{sub.unitMetric}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[9px] text-slate-400">Actual Velocity</div>
                  <div className={`text-sm font-bold mt-0.5 ${
                    sub.actualVelocity >= sub.plannedVelocity ? "text-emerald-400" : "text-amber-400"
                  }`}>
                    {sub.actualVelocity} <span className="text-[10px] font-normal text-slate-400">{sub.unitMetric}</span>
                  </div>
                </div>
              </div>

              {/* REWORK & BREACH STATS */}
              <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
                <span className="text-slate-400">Rework Rate: <strong className="text-rose-400">{sub.reworkFrequencyPercent}%</strong></span>
                <span className="text-slate-400">Active NTCs: <strong className="text-amber-400">{sub.activeNtcCount}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED CONTRACTOR INSPECTION & BREACHES LIST */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">
              Contractor Audit Inspector
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {selectedSub.contractorName} — Quality Defect & Non-Compliance Log
            </h3>
          </div>

          <button 
            onClick={() => {
              if (selectedSub.recentBreaches.length > 0) {
                setSelectedBreach(selectedSub.recentBreaches[0]);
                setIsNtcModalOpen(true);
              } else {
                alert("No active breaches recorded for this contractor!");
              }
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Issue Notice to Comply (NTC)
          </button>
        </div>

        {/* BREACH LIST */}
        {selectedSub.recentBreaches.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">Pristine Quality Record</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No non-compliance breaches recorded for {selectedSub.contractorName}. All site captures match 4D BIM design.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedSub.recentBreaches.map((breach) => (
              <div 
                key={breach.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                      {breach.id}
                    </span>
                    <span className="text-xs font-bold text-white">{breach.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{breach.description}</p>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Location: {breach.location} • Captured: {breach.dateCaptured} • Photo Frame: {breach.photoFrameId}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedBreach(breach);
                    setIsNtcModalOpen(true);
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Generate NTC Notice
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FORMAL NOTICE TO COMPLY (NTC) GENERATOR MODAL */}
      {isNtcModalOpen && selectedBreach && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base font-mono uppercase">
                  FORMAL CONTRACTUAL NOTICE TO COMPLY (NTC)
                </h3>
              </div>
              <button 
                onClick={() => setIsNtcModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMAL NTC LETTER BODY */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs leading-relaxed text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2 text-[10px] text-slate-400">
                <span>ISSUED TO: {selectedSub.contractorName}</span>
                <span>DATE: 2026-07-23</span>
              </div>

              <div>
                <strong className="text-amber-300">SUBJECT: FORMAL DEFICIENCY CURE NOTICE — {selectedBreach.title}</strong>
              </div>

              <p>
                During the 360° visual reality site capture conducted on <span className="text-white font-bold">{selectedBreach.dateCaptured}</span> at location <span className="text-white font-bold">{selectedBreach.location}</span>, computer vision algorithms detected a material contractual breach:
              </p>

              <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-slate-200">
                "{selectedBreach.description}"
              </div>

              <p>
                As per Contract Clause 14.2 (Defective Work & Unapproved Acceleration Claims), you are hereby granted a <strong className="text-rose-400">48-Hour Cure Period</strong> to rectify this non-compliance prior to drywall boarding or progress billing approval.
              </p>

              <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 flex justify-between">
                <span>EVIDENCE ATTACHED: {selectedBreach.photoFrameId}.JPG</span>
                <span>VERIFIED BY: TRACPROGRESS AI ENGINE</span>
              </div>
            </div>

            {/* MODAL ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => setIsNtcModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>

              <button 
                onClick={handleDispatchNtc}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Formal NTC & Log Penalty Clause
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
