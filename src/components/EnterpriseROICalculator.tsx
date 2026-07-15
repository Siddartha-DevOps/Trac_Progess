import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar, 
  Activity, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  Layers,
  ArrowRight
} from "lucide-react";

// Smooth Counter component to animate transitions of numerical values
function SmoothCounter({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    
    const duration = 800; // ms
    const startTime = performance.now();

    function updateNumber(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const ease = progress * (2 - progress);
      const current = start + (end - start) * ease;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(end);
      }
    }

    requestAnimationFrame(updateNumber);
  }, [value]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <span className="font-mono font-black tracking-tight text-white transition-all">
      {prefix}{formatted}{suffix}
    </span>
  );
}

export default function EnterpriseROICalculator() {
  // Input parameters
  const [projectValue, setProjectValue] = useState<number>(50); // $50M
  const [weeklyLaborCost, setWeeklyLaborCost] = useState<number>(35000); // $35k per week
  const [numWorkers, setNumWorkers] = useState<number>(120); // workers
  const [projectDuration, setProjectDuration] = useState<number>(24); // months
  const [avgWeeklyDelay, setAvgWeeklyDelay] = useState<number>(1.5); // days delay per week

  // Calculated ROI states
  const [savings, setSavings] = useState(0);
  const [scheduleRecovery, setScheduleRecovery] = useState(0);
  const [productivityImprovement, setProductivityImprovement] = useState(0);
  const [roiPercentage, setRoiPercentage] = useState(0);
  const [reworkReduction, setReworkReduction] = useState(0);

  // Run the enterprise calculations
  useEffect(() => {
    // 1. Calculate Rework Reduction (Usually 40% to 60% with continuous visual capture)
    const baseReworkReduction = 52.5; // percent
    setReworkReduction(baseReworkReduction);

    // 2. Calculate Productivity Improvement
    // Saving 4 hours per walk per inspector + automatic reporting boosts active tool-time/labor efficiency
    const baseProductivity = Math.round(15 + (numWorkers * 0.05) + (avgWeeklyDelay * 1.5));
    setProductivityImprovement(Math.min(32, Math.max(12, baseProductivity)));

    // 3. Calculate Schedule Recovery (weeks saved)
    // Formula: project duration * delays * efficiency mapping coefficient
    const weeksSaved = Math.round((projectDuration * avgWeeklyDelay * 0.85) * 10) / 10;
    setScheduleRecovery(Math.min(12, Math.max(1.5, weeksSaved)));

    // 4. Calculate Annual/Project Savings
    // Saved rework: 1.2% of project construction value
    const savedReworkValue = projectValue * 1000000 * 0.0125;
    // Saved labor overhead: weekly labor cost * weeks saved
    const savedLaborValue = weeklyLaborCost * weeksSaved;
    // Total combined savings
    const totalSavings = Math.round(savedReworkValue + savedLaborValue);
    setSavings(totalSavings);

    // 5. Calculate ROI Percentage
    // TracProgress license fee is modeled around $1,500/month per active project + $200 per floor per month.
    const estimatedLicenseCost = (1500 * projectDuration) + (250 * 12 * (projectValue / 10)); // approximate enterprise quote
    const computedRoi = Math.round((totalSavings / estimatedLicenseCost) * 100);
    setRoiPercentage(Math.max(150, Math.min(1850, computedRoi)));

  }, [projectValue, weeklyLaborCost, numWorkers, projectDuration, avgWeeklyDelay]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="enterprise-roi-calculator">
      {/* Module Title Header */}
      <div className="bg-[#121620]/80 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#daff00]/10 text-[#daff00] font-mono text-[10px] font-bold border border-[#daff00]/20 uppercase">Module D-3</span>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#daff00]" />
              Enterprise Capital ROI Projection Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Determine actual financial, scheduling, and labor productivity gains tailored to your enterprise portfolio parameters.
          </p>
        </div>
        <span className="text-[10px] text-amber-500 font-mono font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
          ALIGNED WITH MEKHARI & ASSOC AUDIT COEFF
        </span>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Slider Controls (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Slider 1: Project construction value */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Project Construction Value
              </span>
              <span className="text-sm font-black text-amber-400 font-mono">${projectValue}M USD</span>
            </div>
            <input 
              type="range"
              min="5"
              max="250"
              step="5"
              value={projectValue}
              onChange={(e) => setProjectValue(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>$5M</span>
              <span>$100M</span>
              <span>$250M+</span>
            </div>
          </div>

          {/* Slider 2: Weekly Labor Cost */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Average Weekly Labor Overhead
              </span>
              <span className="text-sm font-black text-amber-400 font-mono">${weeklyLaborCost.toLocaleString()} USD</span>
            </div>
            <input 
              type="range"
              min="10000"
              max="150000"
              step="5000"
              value={weeklyLaborCost}
              onChange={(e) => setWeeklyLaborCost(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-950 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>$10,000</span>
              <span>$80,000</span>
              <span>$150,000+</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Input 3: Workers count */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wide">Crew Size</span>
                <span className="text-xs font-bold text-white font-mono">{numWorkers} workers</span>
              </div>
              <input 
                type="range"
                min="15"
                max="500"
                step="5"
                value={numWorkers}
                onChange={(e) => setNumWorkers(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 h-1 rounded-lg cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 font-mono">15 to 500+</span>
            </div>

            {/* Input 4: Project duration */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wide">Duration</span>
                <span className="text-xs font-bold text-white font-mono">{projectDuration} months</span>
              </div>
              <input 
                type="range"
                min="6"
                max="48"
                step="2"
                value={projectDuration}
                onChange={(e) => setProjectDuration(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 h-1 rounded-lg cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 font-mono">6 to 48 mo</span>
            </div>

            {/* Input 5: Weekly delay day counts */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wide">Avg Weekly Delay</span>
                <span className="text-xs font-bold text-white font-mono">{avgWeeklyDelay} days/wk</span>
              </div>
              <input 
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={avgWeeklyDelay}
                onChange={(e) => setAvgWeeklyDelay(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 h-1 rounded-lg cursor-pointer"
              />
              <span className="text-[9px] text-slate-500 font-mono">0.5 to 5.0 days</span>
            </div>
          </div>

          <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3 text-xs text-slate-400 leading-normal">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Methodology Blueprint:</strong> TracProgress® replaces manual checklist checks with hardhat panoramic walk sequences. By identifying drywall, MEP conduit, and structural omissions within centimeter tolerance, rework is prevented before sheetrock framing. Schedule compression is modeled on standard CPM (Critical Path Method) lag factors.
            </p>
          </div>

        </div>

        {/* Right Side: Animated KPI Cards Dashboard (5 columns) */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between gap-6 relative">
          
          {/* Top readout */}
          <div>
            <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 block uppercase mb-1">PROJECTED PORTFOLIO SAVINGS</span>
            <div className="text-4xl md:text-5xl font-black text-[#daff00] font-mono tracking-tight flex items-baseline">
              <SmoothCounter value={savings} prefix="$" />
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Calculated on continuous defect alerts, automated payout verification sheets, and structural risk prevention.
            </p>
          </div>

          {/* Core breakdown metrics with animated indicators */}
          <div className="grid grid-cols-2 gap-y-5 gap-x-4 border-t border-b border-slate-800/80 py-5 text-xs">
            
            {/* Week/Schedule Saved */}
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-mono uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Schedule Saved
              </span>
              <span className="text-lg font-extrabold text-white font-mono mt-1 flex items-baseline gap-1">
                <SmoothCounter value={scheduleRecovery} decimals={1} />
                <span className="text-xs font-normal text-slate-400 font-sans">weeks</span>
              </span>
            </div>

            {/* Productivity Increase */}
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-mono uppercase flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                Active Tool-Time
              </span>
              <span className="text-lg font-extrabold text-white font-mono mt-1 flex items-baseline gap-1">
                <SmoothCounter value={productivityImprovement} suffix="%" />
              </span>
            </div>

            {/* Rework Reduction */}
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-mono uppercase flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                Rework Blocked
              </span>
              <span className="text-lg font-extrabold text-white font-mono mt-1 flex items-baseline gap-1">
                <SmoothCounter value={reworkReduction} decimals={1} suffix="%" />
              </span>
            </div>

            {/* Cumulative ROI % */}
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono uppercase font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                Project ROI
              </span>
              <span className="text-lg font-extrabold text-amber-400 font-mono mt-1 flex items-baseline gap-1">
                <SmoothCounter value={roiPercentage} suffix="%" />
              </span>
            </div>

          </div>

          {/* Action Trigger */}
          <button
            onClick={() => {
              const el = document.getElementById("demo-request-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition text-center flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <span>Lock In ROI Guarantee Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
}
