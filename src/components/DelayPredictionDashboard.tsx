import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  Wrench, 
  Sparkles, 
  Layers, 
  Calendar, 
  CloudRain, 
  Users, 
  CheckCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";

interface RiskCard {
  id: string;
  discipline: "Structural" | "MEP" | "Finishes" | "Exterior";
  completion: number;
  predictedDelay: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  trend: "up" | "down" | "stable";
  recommendedAction: string;
  icon: any;
}

export default function DelayPredictionDashboard() {
  // Simulator inputs
  const [weatherRisk, setWeatherRisk] = useState<number>(30); // percentage impact (e.g. rain/monsoon)
  const [laborShortage, setLaborShortage] = useState<number>(15); // percentage labor gap

  // Computed metrics
  const [overallDelay, setOverallDelay] = useState(4.8);
  const [overallRisk, setOverallRisk] = useState<"Medium" | "High" | "Critical">("High");
  const [riskCards, setRiskCards] = useState<RiskCard[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // Smooth calculator simulation
  useEffect(() => {
    // 1. Calculate overall delay in weeks based on weather risk and labor gaps
    const baseDelay = 3.2; // nominal baseline delay in weeks
    const addedDelay = (weatherRisk * 0.05) + (laborShortage * 0.12);
    const totalDelayWeeks = Math.round((baseDelay + addedDelay) * 10) / 10;
    setOverallDelay(totalDelayWeeks);

    // Risk assessment thresholds
    if (totalDelayWeeks >= 7.5) {
      setOverallRisk("Critical");
    } else if (totalDelayWeeks >= 4.5) {
      setOverallRisk("High");
    } else {
      setOverallRisk("Medium");
    }

    // 2. Generate detailed risk cards for trades
    const trades: RiskCard[] = [
      {
        id: "rc-struct",
        discipline: "Structural",
        completion: 92,
        predictedDelay: Math.round((0.5 + weatherRisk * 0.04) * 10) / 10,
        riskLevel: weatherRisk > 50 ? "High" : "Low",
        trend: weatherRisk > 40 ? "up" : "stable",
        recommendedAction: "Authorize dry curing accelerators to counter heavy humidity delays on Level 4 concrete cast.",
        icon: Layers
      },
      {
        id: "rc-mep",
        discipline: "MEP",
        completion: 64,
        predictedDelay: Math.round((1.8 + laborShortage * 0.08) * 10) / 10,
        riskLevel: laborShortage > 20 ? "High" : "Medium",
        trend: laborShortage > 15 ? "up" : "stable",
        recommendedAction: "Reprioritize electrical first-fix technicians from Block C to expedite Wing B corridor branches.",
        icon: Wrench
      },
      {
        id: "rc-finishes",
        discipline: "Finishes",
        completion: 35,
        predictedDelay: Math.round((1.2 + laborShortage * 0.09) * 10) / 10,
        riskLevel: laborShortage > 30 ? "Critical" : "Medium",
        trend: "up",
        recommendedAction: "Pre-approve partition drywall subcontractor overtime to recover lost schedule pacing on suites.",
        icon: Sparkles
      },
      {
        id: "rc-exterior",
        discipline: "Exterior",
        completion: 15,
        predictedDelay: Math.round((2.5 + weatherRisk * 0.12 + laborShortage * 0.05) * 10) / 10,
        riskLevel: (weatherRisk + laborShortage) > 60 ? "Critical" : "High",
        trend: "up",
        recommendedAction: "Delay non-critical scaffolding erection. Seal window envelopes during light morning hours.",
        icon: Calendar
      }
    ];
    setRiskCards(trades);

    // 3. Generate chart data (Gantt schedule tracking weeks)
    const baseChart = [
      { week: "Wk 1", baseline: 12, predicted: 12 },
      { week: "Wk 2", baseline: 28, predicted: 27 },
      { week: "Wk 3", baseline: 45, predicted: 41 },
      { week: "Wk 4", baseline: 62, predicted: 54 },
      { week: "Wk 5", baseline: 78, predicted: 67 },
      { week: "Wk 6", baseline: 90, predicted: 76 },
      { week: "Wk 7", baseline: 100, predicted: 84 },
      { week: "Wk 8", baseline: 100, predicted: 92 },
      { week: "Wk 9", baseline: 100, predicted: 100 }
    ];

    // Adjust predicted slope based on calculated delay
    const scaleFactor = 1 - (totalDelayWeeks / 20);
    const adjustedChart = baseChart.map(point => {
      if (point.week === "Wk 1") return point;
      const adjustedPredicted = Math.round(point.baseline * scaleFactor);
      return {
        ...point,
        predicted: Math.min(point.baseline, Math.max(5, adjustedPredicted))
      };
    });

    // Make sure it eventually reaches 100% on a longer horizontal line if delay is large
    if (totalDelayWeeks > 4) {
      adjustedChart.push({ week: "Wk 10", baseline: 100, predicted: 96 });
      adjustedChart.push({ week: "Wk 11", baseline: 100, predicted: 100 });
    }

    setChartData(adjustedChart);

  }, [weatherRisk, laborShortage]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="delay-prediction-dashboard">
      {/* Title Header */}
      <div className="bg-[#121620]/80 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#daff00]/10 text-[#daff00] font-mono text-[10px] font-bold border border-[#daff00]/20 uppercase">Module D-5</span>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#daff00]" />
              AI Delay Prediction & Critical Path Pacing Dashboard
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Predict potential activity slippage before it impacts milestone delivery dates using historical walk data.
          </p>
        </div>
        
        {/* Overall Indicator HUD */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-slate-500 uppercase">PREDICTED PORTFOLIO LAG:</span>
            <span className="font-extrabold text-[#daff00]">{overallDelay} weeks</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-slate-500 uppercase">PORTFOLIO RISK PROFILE:</span>
            <span className={`font-extrabold ${overallRisk === "Critical" ? "text-red-500 animate-pulse" : (overallRisk === "High" ? "text-orange-400" : "text-amber-400")}`}>
              {overallRisk.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Interactive controls & Chart (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Quick Simulators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-950 p-4 rounded-xl border border-slate-850">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  Simulate Weather Interference (Precipitation)
                </span>
                <span className="font-bold text-white">{weatherRisk}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                value={weatherRisk}
                onChange={(e) => setWeatherRisk(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-900 h-1 rounded cursor-pointer"
              />
              <span className="text-[9px] text-slate-500">Models concrete cure curing speeds, rain delays, and glazing safety margins.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Simulate Labor Capacity Deficit
                </span>
                <span className="font-bold text-white">{laborShortage}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                value={laborShortage}
                onChange={(e) => setLaborShortage(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-900 h-1 rounded cursor-pointer"
              />
              <span className="text-[9px] text-slate-500">Models subtrade subcontractor availability gaps and crew pacing curves.</span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 h-[300px] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">PROJECT PROGRESS COMPLETION SLOPE (BASELINE VS AI PREDICTION)</span>
              <div className="flex gap-4 text-[9px] font-mono">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-2 h-2 bg-indigo-500/20 border border-indigo-500 rounded" />
                  BASELINE SCHEDULE
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 animate-pulse">
                  <span className="w-2 h-2 bg-amber-500/20 border border-amber-500 rounded" />
                  AI PREDICTED REAL PATH
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="week" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickLine={false}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0b0e14", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff", fontSize: "11px", fontFamily: "monospace" }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontFamily: "monospace" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="baseline" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorBaseline)" 
                    name="Target Baseline %"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPredicted)" 
                    name="AI Predicted %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Side: Discipline Risk Cards (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Pacing by Construction discipline:</span>
          
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
            {riskCards.map((card) => {
              const IconComp = card.icon;
              let badgeColor = "bg-emerald-950/20 text-emerald-400 border-emerald-900/30";
              if (card.riskLevel === "Critical") badgeColor = "bg-red-950/20 text-red-500 border-red-900/30 animate-pulse";
              if (card.riskLevel === "High") badgeColor = "bg-orange-950/20 text-orange-400 border-orange-900/30";
              if (card.riskLevel === "Medium") badgeColor = "bg-amber-950/20 text-amber-400 border-amber-900/30";

              return (
                <div key={card.id} className="bg-slate-950 border border-slate-850 hover:border-slate-700 transition p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2.5">
                      <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                        <IconComp className="w-4.5 h-4.5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs leading-snug">{card.discipline}</h4>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{card.completion}% Completed</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 text-right">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border leading-none ${badgeColor}`}>
                        {card.riskLevel}
                      </span>
                      <span className="text-[9px] text-red-400 font-mono font-bold mt-1.5 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3 shrink-0" />
                        +{card.predictedDelay} days delay
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 leading-normal font-sans pt-2 border-t border-slate-900">
                    {card.recommendedAction}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
