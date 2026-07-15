import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Eye, 
  Tv, 
  Play, 
  Zap, 
  Activity, 
  Compass, 
  ShieldCheck, 
  TrendingUp, 
  Camera, 
  MapPin, 
  Cpu, 
  FileText, 
  ChevronRight,
  Info,
  ExternalLink,
  Table,
  Check,
  Smartphone,
  CheckCircle,
  HelpCircle,
  Video,
  Database,
  Users,
  ChevronDown,
  AlertTriangle,
  Clock,
  Shield,
  ArrowUpRight,
  Sliders,
  DollarSign,
  Briefcase,
  Calendar,
  ThumbsUp,
  Ruler,
  Target,
  X,
  Linkedin,
  Instagram,
  Facebook,
  Youtube
} from "lucide-react";
import { useAppStore } from "../store";
import AIProgressPlayground from "./AIProgressPlayground";
import InteractiveComparison from "./InteractiveComparison";
import EnterpriseROICalculator from "./EnterpriseROICalculator";
import DigitalTwinProgressMap from "./DigitalTwinProgressMap";
import DelayPredictionDashboard from "./DelayPredictionDashboard";

// tracprogress Core Feature breakdown list
const TRAC_PROGRES_PRODUCTS = [
  {
    id: "capture",
    title: "On-Site Walkthrough Capture",
    subtitle: "One 360° camera. One hardhat. Zero training.",
    desc: "Simply mount a standard, commercially available 360° camera to any hardhat. Project engineers or superintendents carry out routine site walks. The system captures video frame-by-frame with zero manual mapping needed.",
    metric: "100% automated frame placement",
    icon: Camera,
    color: "from-amber-500 to-orange-600"
  },
  {
    id: "mapping",
    title: "AI BIM-to-Site Auto-Mapping",
    subtitle: "Automatic spatial overlay of reality vs. IFC design files.",
    desc: "Proprietary deep learning algorithms analyze the walk footage. It automatically segments, identifies, and registers every installed physical component (drywall, pipes, outlets) directly against your 3D BIM (Revit/IFC) model coordinate space.",
    metric: "Accuracy within centimeter tolerances",
    icon: Cpu,
    color: "from-indigo-500 to-blue-600"
  },
  {
    id: "tracking",
    title: "Granular Subcontractor Matrix",
    subtitle: "Continuous tracking of trade progress down to individual units.",
    desc: "Get an objective, quantitative percentage of completion for every trade and sector. Track the exact status of drywall sheets, electrical faceplates, HVAC dampers, plumbing runs, and structural steel connections without manual counting.",
    metric: "4x increase in checklist density",
    icon: Table,
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: "discrepancies",
    title: "Deviation & Omission Alerts",
    subtitle: "Identify critical deviations before they are covered up.",
    desc: "Instantly detect when installed components deviate from BIM design tolerances, or when required items (like sleeve blockouts or reinforcement brackets) are omitted entirely, saving thousands in downstream rework.",
    metric: "90% reduction in late deviation dispute cycles",
    icon: ShieldCheck,
    color: "from-rose-500 to-pink-600"
  }
];

// Interactive slider-based ROI data calculation helper
function calculateROI(projectValue: number, monthlyReworkCost: number, floorsCount: number) {
  const annualSavings = Math.round((projectValue * 0.012) + (monthlyReworkCost * 12 * 0.45));
  const hoursSavedPerWeek = Math.round(floorsCount * 2.2 + 6);
  const disputesAvoided = Math.round(floorsCount * 1.5 + 4);
  return { annualSavings, hoursSavedPerWeek, disputesAvoided };
}

const DIAGRAM_NODES = [
  // Top Inputs (Purple / Indigo Style)
  {
    id: "bim",
    label: "BIM",
    icon: Layers,
    angle: 235,
    type: "input",
    desc: "3D digital design model of all MEP, architectural, and structural trades synced directly inside tracprogress®."
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: Calendar,
    angle: 270,
    type: "input",
    desc: "Baseline schedule files (Primavera P6, MS Project) providing chronological phase-by-phase target parameters."
  },
  {
    id: "site-capture",
    label: "Site Capture",
    icon: Camera,
    angle: 305,
    type: "input",
    desc: "High-resolution 360° helmet walkthrough video streams, captured automatically during standard project site walks."
  },
  {
    id: "workforce",
    label: "Workforce Insights",
    icon: Users,
    angle: 340,
    type: "input",
    desc: "Trade crew counting and presence metrics cross-referenced with regional worker capacity and daily output targets."
  },

  // Bottom Outputs / Insights (Yellow-Green / Slate style)
  {
    id: "schedule-risk",
    label: "Schedule risk detection",
    icon: AlertTriangle,
    angle: 20,
    type: "output",
    desc: "Early detection of activities and deviations that could delay major construction milestones."
  },
  {
    id: "plan-monitoring",
    label: "Plan creation and monitoring",
    icon: FileText,
    angle: 50,
    type: "output",
    desc: "Comprehensive feedback loops to build, monitor, and refine the daily and weekly work plans of on-site trades."
  },
  {
    id: "trade-performance",
    label: "Trade performance data",
    icon: Sliders,
    angle: 80,
    type: "output",
    desc: "Subcontractor pace evaluation reports based entirely on neutral, quantitative on-site progress realities."
  },
  {
    id: "deviation",
    label: "Deviation detection",
    icon: Target,
    angle: 110,
    type: "output",
    desc: "Automated identification of misplaced components, structural omissions, or electrical outlet installation deviations."
  },
  {
    id: "delay-risk",
    label: "Delay Risk detection",
    icon: Clock,
    angle: 140,
    type: "output",
    desc: "Proactive bottleneck prediction outlining trade congestion or scheduling dependencies that endanger critical paths."
  },
  {
    id: "completion-data",
    label: "Completion Data",
    icon: CheckCircle2,
    angle: 170,
    type: "output",
    desc: "Rigorous percent-complete records enabling objective monthly progress billing calculations and prompt subcontractor sign-offs."
  },
  {
    id: "site-docs",
    label: "Site Documentation",
    icon: Briefcase,
    angle: 200,
    type: "output",
    desc: "A true, historical database of built stages mapping high-definition captures to precise elements on your timelines."
  }
];

export default function TracProgressLandingView() {
  const { setShowLandingPage, isTracProgressMode, setIsTracProgressMode } = useAppStore();
  
  // Interactive States
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [activeTab, setActiveTab] = useState<"platform" | "calculator" | "how-it-works" | "use-cases" | "ai-lab">("platform");
  const [activeLabDemo, setActiveLabDemo] = useState<string>("playground");
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  
  // Interactive diagram node state
  const [activeNode, setActiveNode] = useState<string>("bim");
  const activeNodeInfo = DIAGRAM_NODES.find(n => n.id === activeNode);
  
  // Interactive Swipe Slider simulator ("Reality vs BIM" drag position 0 to 100)
  const [swipePosition, setSwipePosition] = useState<number>(50);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const swipeContainerRef = useRef<HTMLDivElement>(null);

  // Interactive ROI Calculator State
  const [projectVal, setProjectVal] = useState<number>(45); // Millions
  const [reworkCost, setReworkCost] = useState<number>(15000); // Dollars per month
  const [floors, setFloors] = useState<number>(12); // Count of floors

  // Demo request form states
  const [demoRequested, setDemoRequested] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    projectType: "Commercial Residential",
    projectSize: "Over $50M"
  });

  const { annualSavings, hoursSavedPerWeek, disputesAvoided } = calculateROI(projectVal, reworkCost, floors);

  // Handle Swipe/Drag comparison bar
  const handleSwipeMove = (clientX: number) => {
    if (!swipeContainerRef.current) return;
    const rect = swipeContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSwipePosition(pct);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSwipeMove(e.touches[0].clientX);
    }
  };

  const enterWorkspace = (useTracProgressTheme: boolean) => {
    setIsTracProgressMode(useTracProgressTheme);
    setShowLandingPage(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.company) return;
    setDemoRequested(true);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#1e293b] font-sans selection:bg-amber-400 selection:text-slate-900 overflow-x-hidden antialiased">
      
      {/* TOP PROMO BANNER */}
      {showPromoBanner && (
        <div className="bg-[#daff00] text-slate-950 px-6 py-2.5 flex items-center justify-between border-b border-[#c8eb00] relative z-50 transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black tracking-wider text-[10px] bg-slate-950 text-[#daff00] px-1.5 py-0.5 rounded leading-none shrink-0">LAB</span>
            <span className="text-[11px] md:text-xs font-bold leading-tight">
              THE TRAC PROGRESS® INTELLIGENCE LAB <span className="font-normal opacity-90 hidden md:inline ml-1.5 border-l border-slate-950/20 pl-1.5">Introducing the industry's first AI-powered research hub</span>
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[11px] md:text-xs font-black underline hover:no-underline transition flex items-center gap-1.5"
            >
              <span>Explore the Lab</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
            <button 
              onClick={() => setShowPromoBanner(false)}
              className="p-1 hover:bg-slate-950/10 rounded transition text-slate-950 cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* 1. BRAND PLATFORM HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#0b0e14]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          {/* Authentic tracprogress® Styled Wordmark Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-950 shadow-md">
              <Building2 className="w-5 h-5 stroke-[2.5] text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1 leading-none">
                trac<span className="text-amber-400 font-extrabold">progres</span> <span className="text-amber-400 text-xs font-mono tracking-widest uppercase">®</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase font-mono mt-0.5">PERFORMANCE ENGINE</span>
            </div>
          </div>

          {/* Interactive Navigation Menu with Hover Indicator dropdown hints */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-slate-300">
            <div 
              className="relative py-2 group cursor-pointer"
              onMouseEnter={() => setHoveredNav("platform")}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <span className="flex items-center gap-1 hover:text-white transition duration-150">
                Platform <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </span>
              <AnimatePresence>
                {hoveredNav === "platform" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 w-80 bg-[#121620] border border-white/10 rounded-xl p-4 shadow-2xl mt-1 z-50"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="text-[11px] font-bold text-amber-400 uppercase font-mono tracking-wider">Capabilities</div>
                      <div className="grid gap-2">
                        <button onClick={() => { setActiveTab("platform"); }} className="text-left text-xs p-2 rounded-lg hover:bg-white/5 transition flex items-start gap-2.5 cursor-pointer">
                          <Camera className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-white">Helmet Capture Walks</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Capture with standard 360° cameras</div>
                          </div>
                        </button>
                        <button onClick={() => { setActiveTab("platform"); }} className="text-left text-xs p-2 rounded-lg hover:bg-white/5 transition flex items-start gap-2.5 cursor-pointer">
                          <Cpu className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-white">AI BIM Auto-Mapping</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Compare physical installs vs IFC model</div>
                          </div>
                        </button>
                        <button onClick={() => { setActiveTab("platform"); }} className="text-left text-xs p-2 rounded-lg hover:bg-white/5 transition flex items-start gap-2.5 cursor-pointer">
                          <Table className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-white">Granular Trade Sheets</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Quantified weekly performance scores</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setActiveTab("how-it-works")} 
              className={`hover:text-white transition py-2 cursor-pointer ${activeTab === "how-it-works" ? "text-amber-400 font-bold" : ""}`}
            >
              How It Works
            </button>
            <button 
              onClick={() => setActiveTab("calculator")} 
              className={`hover:text-white transition py-2 cursor-pointer ${activeTab === "calculator" ? "text-amber-400 font-bold" : ""}`}
            >
              ROI Estimator
            </button>
            <button 
              onClick={() => setActiveTab("use-cases")} 
              className={`hover:text-white transition py-2 cursor-pointer ${activeTab === "use-cases" ? "text-amber-400 font-bold" : ""}`}
            >
              Use Cases
            </button>
          </nav>
        </div>

        {/* Action Controls & External Link indicators */}
        <div className="flex items-center gap-4">
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
          >
            <span>Official tracprogress® Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Core Workspace Switch button */}
          <button
            onClick={() => enterWorkspace(true)}
            className="text-xs font-bold px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-lg shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch Platform Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>
      </header>

      {/* 2. PREMIUM ENTERPRISE HERO SECTION */}
      <section className="relative bg-[#0b0e14] pt-16 pb-24 px-6 md:px-12 overflow-hidden border-b border-white/10">
        
        {/* Subtle dot grid backdrop matching buildots.com style exactly */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:2rem_2rem] opacity-[0.04] pointer-events-none" />
        
        {/* Beautiful high-tech radial gradient glow backdrops */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Authentic Typography & Content */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            
            {/* Outline tag badge exactly like the screenshot */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-white/20 rounded text-[11px] font-mono font-bold tracking-[0.25em] text-white uppercase mb-6 shadow-sm">
              KNOW. ACT. OUTPERFORM.
            </div>

            <h1 className="text-4xl md:text-5xl xl:text-[56px] font-black tracking-tight text-white leading-[1.08] max-w-xl">
              Construction intelligence <br />
              to track your project <br />
              real-time.
            </h1>

            <p className="text-sm md:text-base text-slate-300 mt-6 max-w-lg leading-relaxed font-sans">
              tracprogress® gives leaders the data, insights, and workflows they need to achieve operational excellence.
            </p>

            {/* Lime Yellow Button CTA */}
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => {
                  const el = document.getElementById("demo-request-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-7 py-3.5 bg-[#daff00] hover:bg-[#c6e600] text-slate-950 font-black text-sm rounded transition duration-150 shadow-lg shadow-lime-500/10 cursor-pointer font-bold"
              >
                Get a demo
              </button>

              <button
                onClick={() => enterWorkspace(true)}
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-sm rounded transition flex items-center gap-2 cursor-pointer"
              >
                <Tv className="w-4 h-4 text-amber-400" />
                <span>Launch Simulator</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 font-mono mt-5">
              *Features automated tracking and high-fidelity 3D model overlays.
            </p>

          </div>

          {/* Right Column: High-Tech Computer Vision 3D HUD Overlay of Aerial Site walk */}
          <div className="lg:col-span-7 flex justify-center relative">
            <div className="relative w-full max-w-2xl aspect-[16/10] md:aspect-video rounded-xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl shadow-black/90 group">
              
              {/* Actual Generated High-Res Aerial Drone Site Walk Image */}
              <img 
                src="/src/assets/images/construction_aerial_dusk_1783965012821.jpg" 
                alt="High-rise construction aerial screenshot" 
                className="w-full h-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Dotted grid matching HUD scanning scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.25)_50%,rgba(0,0,0,0.45)_50%)] bg-[size:100%_4px] pointer-events-none mix-blend-overlay" />
              
              {/* Radial gradient shadow framing */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

              {/* Glowing High-Tech Neon SVG 3D Bounding Overlays */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 1000 625">
                {/* Golden/Yellow 3D Wireframe overlays tracing high rises */}
                {/* Tower 1 (Right Center) */}
                <path 
                  d="M 520 280 L 590 190 L 710 190 L 800 240 L 800 520 L 720 560 L 590 560 L 520 500 Z" 
                  fill="rgba(245,158,11,0.03)" 
                  stroke="rgba(245,158,11,0.8)" 
                  strokeWidth="2" 
                  strokeDasharray="4 4 animate-dash" 
                  className="animate-pulse"
                />
                <path 
                  d="M 590 190 L 590 560 M 710 190 L 710 560 M 800 240 L 720 280 L 520 280 M 720 280 L 720 560" 
                  stroke="rgba(245,158,11,0.5)" 
                  strokeWidth="1.5" 
                />
                
                {/* Tower 2 (Far Right Back) */}
                <path 
                  d="M 750 220 L 810 160 L 910 160 L 940 190 L 940 380 L 880 410 L 750 350 Z" 
                  fill="rgba(245,158,11,0.01)" 
                  stroke="rgba(245,158,11,0.4)" 
                  strokeWidth="1.5" 
                />
                
                {/* Tower 3 (Left Front Structure) */}
                <path 
                  d="M 120 400 L 220 320 L 380 320 L 440 370 L 440 580 L 340 610 L 120 520 Z" 
                  fill="rgba(245,158,11,0.02)" 
                  stroke="rgba(245,158,11,0.6)" 
                  strokeWidth="1.5" 
                />
                
                {/* High tech tracking markers (Lines connecting labels to nodes) */}
                {/* Harbor Point Tower connecting line */}
                <line x1="650" y1="280" x2="520" y2="240" stroke="rgba(245,158,11,0.7)" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx="650" cy="280" r="4" fill="#f59e0b" />
                
                {/* Tech Valley Campus connecting line */}
                <line x1="840" y1="320" x2="720" y2="350" stroke="rgba(245,158,11,0.7)" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx="840" cy="320" r="4" fill="#f59e0b" />

                {/* Greenfield Park connecting line */}
                <line x1="300" y1="420" x2="420" y2="450" stroke="rgba(245,158,11,0.7)" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx="300" cy="420" r="4" fill="#f59e0b" />
              </svg>

              {/* Glowing Coordinate Nodes (+ signs matching screenshot) */}
              <div className="absolute top-[28%] right-[32%] z-20 text-lime-400 font-extrabold text-2xl drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-ping pointer-events-none select-none">
                +
              </div>
              <div className="absolute top-[28%] right-[32%] z-20 text-[#daff00] font-black text-2xl drop-shadow-[0_0_4px_rgba(218,255,0,0.8)] pointer-events-none select-none">
                +
              </div>

              <div className="absolute top-[48%] right-[15%] z-20 text-lime-400 font-extrabold text-xl drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse pointer-events-none select-none">
                +
              </div>
              <div className="absolute top-[48%] right-[15%] z-20 text-[#daff00] font-black text-xl drop-shadow-[0_0_4px_rgba(218,255,0,0.8)] pointer-events-none select-none">
                +
              </div>

              {/* Interactive B2B HUD Labels/Overlay Cards exactly like the screenshot */}
              {/* Label 1: HARBOR POINT TOWER (94%) */}
              <div className="absolute top-[18%] right-[12%] z-30 scale-90 sm:scale-100 transition-transform duration-300 hover:scale-105 pointer-events-auto">
                <div className="bg-[#0b0e14]/85 backdrop-blur-md border border-white/10 rounded px-3 py-2 shadow-2xl min-w-[200px]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#daff00] flex items-center justify-center text-slate-950 text-[9px] font-black leading-none">✓</span>
                      <span className="text-[10px] font-bold text-white font-mono tracking-wide uppercase">HARBOR POINT TOWER</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-300 font-mono">94%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full w-[94%]" />
                  </div>
                </div>
              </div>

              {/* Label 2: TECH VALLEY CAMPUS (82%) */}
              <div className="absolute top-[40%] right-[3%] z-30 scale-90 sm:scale-100 transition-transform duration-300 hover:scale-105 pointer-events-auto">
                <div className="bg-[#0b0e14]/85 backdrop-blur-md border border-white/10 rounded px-3 py-2 shadow-2xl min-w-[200px]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#daff00] flex items-center justify-center text-slate-950 text-[9px] font-black leading-none">✓</span>
                      <span className="text-[10px] font-bold text-white font-mono tracking-wide uppercase">TECH VALLEY CAMPUS</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-300 font-mono">82%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full w-[82%]" />
                  </div>
                </div>
              </div>

              {/* Label 3: GREENFIELD PARK (68%) */}
              <div className="absolute bottom-[28%] left-[8%] z-30 scale-90 sm:scale-100 transition-transform duration-300 hover:scale-105 pointer-events-auto">
                <div className="bg-[#0b0e14]/85 backdrop-blur-md border border-white/10 rounded px-3 py-2 shadow-2xl min-w-[200px]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#daff00] flex items-center justify-center text-slate-950 text-[9px] font-black leading-none">✓</span>
                      <span className="text-[10px] font-bold text-white font-mono tracking-wide uppercase">GREENFIELD PARK</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-300 font-mono">68%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full w-[68%]" />
                  </div>
                </div>
              </div>

              {/* Real-time scanning HUD overlay text */}
              <div className="absolute bottom-3 right-4 z-20 bg-black/60 backdrop-blur-sm border border-white/10 rounded px-2.5 py-1 text-[9px] text-lime-400 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
                <span>AI OBJECT MAPPER ACTIVE • SITES_STITCHED: 3/3</span>
              </div>

            </div>
          </div>

        </div>

        {/* Brand Credibility / Logo Section like buildots.com */}
        <div className="mt-16 w-full border-t border-white/10 pt-8 pb-4 relative z-10">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-6 text-center">Trusted by Leading Global Builders</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60 grayscale hover:opacity-100 transition-opacity">
            <span className="text-xs font-black text-slate-300 tracking-wider font-mono">WATES GROUP</span>
            <span className="text-xs font-black text-slate-300 tracking-wider font-mono">NCC CONSTRUCTION</span>
            <span className="text-xs font-black text-slate-300 tracking-wider font-mono">BUILD GROUP</span>
            <span className="text-xs font-black text-slate-300 tracking-wider font-mono">POMERLEAU</span>
            <span className="text-xs font-black text-slate-300 tracking-wider font-mono">L&T INFRASTRUCTURE</span>
            <span className="text-xs font-black text-slate-300 tracking-wider font-mono">DLF CAPITAL</span>
          </div>
        </div>

      </section>

      {/* 2.5. KNOW SOONER PRODUCT FOCUS SECTION (As requested, styled exactly like buildots.com) */}
      <section className="bg-white py-24 px-6 md:px-12 border-b border-slate-100 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Authentic Typography & Content */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            
            {/* Outline Tag Badge matching buildots.com style exactly */}
            <div className="inline-flex items-center px-3.5 py-1.5 border border-[#4f46e5]/40 rounded text-[11px] font-mono font-extrabold tracking-[0.2em] text-[#4f46e5] uppercase mb-6 bg-[#4f46e5]/5">
              DATA
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.05] max-w-md">
              Know sooner.
            </h2>

            <p className="text-sm md:text-base lg:text-lg text-slate-600 mt-6 max-w-md leading-relaxed font-sans">
              Uncover what’s really happening on your site. See what’s built and when compared to your plan.
            </p>

          </div>

          {/* Right Column: High-Tech Computer Vision 3D HUD Overlay of Interior Site */}
          <div className="lg:col-span-7 flex justify-center relative">
            <div className="relative w-full max-w-2xl aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-200/50 group">
              
              {/* Actual Generated High-Res Interior Image with yellow CV wireframe mapping */}
              <img 
                src="/src/assets/images/construction_interior_cv_grid_1783965712694.jpg" 
                alt="Construction site interior with computer vision 3D grid line mapping" 
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />

              {/* Dotted grid matching HUD scanning scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.15)_50%,rgba(0,0,0,0.35)_50%)] bg-[size:100%_4px] pointer-events-none mix-blend-overlay" />
              
              {/* Radial gradient shadow framing */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Status Scanning Label at top right */}
              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded border border-white/10 text-[9px] font-mono text-[#daff00] flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#daff00] animate-pulse" />
                <span>AI COMPUTER VISION CALIBRATED</span>
              </div>

              {/* Interactive B2B HUD Labels/Overlay Cards exactly like the screenshot */}
              {/* Label: ACTUAL PROGRESS with colorful HUD progress meter */}
              <div className="absolute bottom-6 left-6 z-30 transition-transform duration-300 hover:scale-[1.02] pointer-events-auto">
                <div className="bg-[#0b0e14]/90 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-2xl min-w-[260px]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center">
                      <Table className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-[10px] font-mono font-black text-white tracking-[0.1em] uppercase">ACTUAL PROGRESS</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* SVG circular progress indicator matching the screenshot wheel */}
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="transparent" />
                        <circle 
                          cx="24" 
                          cy="24" 
                          r="20" 
                          stroke="#daff00" 
                          strokeWidth="3.5" 
                          fill="transparent" 
                          strokeDasharray="125.6" 
                          strokeDashoffset="37.6" // 70% Progress
                        />
                      </svg>
                      <span className="absolute text-[11px] font-mono font-black text-white">70%</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-white tracking-wide uppercase font-sans">Metal Stud Framing</span>
                      <span className="text-[9px] font-mono text-slate-400 mt-1">Stitching complete • 0% deviation</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2.5.5. ACT FASTER INSIGHT FOCUS SECTION (As requested, styled exactly like buildots.com) */}
      <section className="bg-slate-50 py-24 px-6 md:px-12 border-b border-slate-100 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Authentic Typography & Content */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            
            {/* Outline Tag Badge matching buildots.com INSIGHT badge */}
            <div className="inline-flex items-center px-3.5 py-1.5 border border-[#4f46e5]/40 rounded text-[11px] font-mono font-extrabold tracking-[0.2em] text-[#4f46e5] uppercase mb-6 bg-[#4f46e5]/5">
              INSIGHT
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.05] max-w-md">
              Act faster.
            </h2>

            <p className="text-sm md:text-base lg:text-lg text-slate-600 mt-6 max-w-md leading-relaxed font-sans">
              Use data to anticipate and address risks before they cause delays.
            </p>

            {/* Dark Learn More button exactly matching the layout */}
            <button 
              onClick={() => {
                const el = document.getElementById("demo-request-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-8 px-8 py-3.5 bg-[#18181b] hover:bg-black text-white font-bold text-sm rounded transition duration-150 shadow-md cursor-pointer"
            >
              Learn more
            </button>

          </div>

          {/* Right Column: Line of Balance Graph Mockup with Yellow Highlight and Tooltip Alert */}
          <div className="lg:col-span-7 flex justify-center relative">
            {/* Glowing background container representing the warm/green gradient block from buildots */}
            <div className="relative w-full max-w-2xl aspect-[4/3] rounded-3xl bg-gradient-to-tr from-[#f8fafc] via-[#f1f5f9] to-[#fefce8] p-6 md:p-10 flex items-center justify-center border border-slate-200/50 overflow-hidden shadow-sm">
              
              {/* Internal subtle yellow/green light source radiating from top right */}
              <div className="absolute right-[-10%] top-[-10%] w-80 h-80 bg-yellow-100/60 rounded-full blur-3xl pointer-events-none" />
              
              {/* Line of Balance Dark Card UI block */}
              <div className="relative w-full bg-[#121620] border border-white/5 rounded-2xl p-6 shadow-2xl z-10 select-none">
                
                {/* Card Header: Title & Legends */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <span className="text-[11px] font-mono font-black text-slate-400 tracking-[0.15em] uppercase">
                    LINE OF BALANCE
                  </span>
                  
                  {/* Legend bullets exactly as screenshot */}
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-slate-500 rounded-sm" />
                      <span>MEP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#4f46e5] rounded-sm" />
                      <span>Curtain Wall</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#a78bfa] rounded-sm" />
                      <span>Blockwork</span>
                    </div>
                  </div>
                </div>

                {/* Main Graph SVG visualization */}
                <div className="relative w-full aspect-[16/10]">
                  <svg className="w-full h-full" viewBox="0 0 600 350">
                    {/* Y Axis percentage markers & subtle horizontal grid lines */}
                    {[
                      { label: "100%", y: 40 },
                      { label: "75%", y: 107.5 },
                      { label: "50%", y: 175 },
                      { label: "25%", y: 242.5 },
                      { label: "0%", y: 310 }
                    ].map((grid, idx) => (
                      <g key={idx}>
                        {/* Horizontal gridline */}
                        <line 
                          x1="50" 
                          y1={grid.y} 
                          x2="570" 
                          y2={grid.y} 
                          stroke="rgba(255,255,255,0.05)" 
                          strokeWidth="1" 
                        />
                        {/* Y-axis text label */}
                        <text 
                          x="15" 
                          y={grid.y + 4} 
                          fill="rgba(255,255,255,0.35)" 
                          fontSize="9" 
                          fontFamily="monospace"
                        >
                          {grid.label}
                        </text>
                      </g>
                    ))}

                    {/* X-axis date markings */}
                    {[
                      { label: "Mar 25", x: 50 },
                      { label: "Apr 25", x: 154 },
                      { label: "May 25", x: 258 },
                      { label: "Jun 25", x: 362 },
                      { label: "Jul 25", x: 466 },
                      { label: "Aug 25", x: 570 }
                    ].map((date, idx) => (
                      <text 
                        key={idx}
                        x={date.x} 
                        y="335" 
                        fill="rgba(255,255,255,0.35)" 
                        fontSize="9" 
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {date.label}
                      </text>
                    ))}

                    {/* "Today" Vertical Dashed Indicator Line */}
                    {/* Positioned at x = 295 (approx late-May/early-June) */}
                    <line 
                      x1="295" 
                      y1="40" 
                      x2="295" 
                      y2="310" 
                      stroke="rgba(255,255,255,0.4)" 
                      strokeWidth="1.5"
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x="295" 
                      y="32" 
                      fill="rgba(255,255,255,0.6)" 
                      fontSize="10" 
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      Today
                    </text>

                    {/* 1. MEP curve (Grey solid line) */}
                    <path 
                      d="M 50 310 Q 170 240, 295 150 T 570 40" 
                      fill="none" 
                      stroke="#64748b" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />

                    {/* 2. Curtain Wall curve (Purple-blue solid before Today, dashed after) */}
                    {/* Begins mid-April (X=130), climbs to Y=180 at Today (X=295), then climbs to Y=80 at Aug 25 */}
                    {/* Path 1: Solid (past progress) */}
                    <path 
                      d="M 130 310 Q 220 250, 295 180" 
                      fill="none" 
                      stroke="#4f46e5" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />
                    {/* Path 2: Dashed (future forecast) */}
                    <path 
                      d="M 295 180 Q 370 110, 570 80" 
                      fill="none" 
                      stroke="#4f46e5" 
                      strokeWidth="2.5" 
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />

                    {/* 3. Blockwork curve (Light purple solid before Today, dashed after) */}
                    {/* Starts late-April (X=190), climbs to Y=230 at Today (X=295), climbs steeply to cross Curtain Wall at X=414, Y=140 */}
                    {/* Path 1: Solid (past progress) */}
                    <path 
                      d="M 190 310 Q 250 280, 295 230" 
                      fill="none" 
                      stroke="#a78bfa" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />
                    {/* Path 2: Dashed (future forecast - crosses curtain wall) */}
                    <path 
                      d="M 295 230 C 350 170, 390 150, 414 138 C 450 120, 500 90, 570 60" 
                      fill="none" 
                      stroke="#a78bfa" 
                      strokeWidth="2.5" 
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />

                    {/* Yellow focus/highlight circle at intersection (X=414, Y=138) */}
                    <circle 
                      cx="414" 
                      cy="138" 
                      r="18" 
                      fill="rgba(218,255,0,0.15)" 
                      stroke="#daff00" 
                      strokeWidth="2" 
                    />
                    <circle 
                      cx="414" 
                      cy="138" 
                      r="26" 
                      fill="transparent" 
                      stroke="#daff00" 
                      strokeWidth="1" 
                      strokeDasharray="4 4" 
                      className="animate-spin"
                      style={{ transformOrigin: "414px 138px", animationDuration: "12s" }}
                    />
                    <circle 
                      cx="414" 
                      cy="138" 
                      r="4" 
                      fill="#daff00" 
                    />
                  </svg>

                  {/* Warning overlay tooltip aligned perfectly with the intersection circle */}
                  <div className="absolute top-[44%] left-[64%] z-30 transition-transform duration-300 hover:scale-105 pointer-events-auto">
                    <div className="bg-white border border-slate-200 rounded px-3.5 py-2.5 shadow-2xl flex items-center gap-2.5 whitespace-nowrap">
                      <div className="w-5 h-5 bg-[#eef2ff] text-[#4f46e5] rounded flex items-center justify-center font-extrabold text-xs shadow-inner">
                        !
                      </div>
                      <span className="text-[11px] font-black text-slate-900 tracking-wide font-sans">
                        On course for bottleneck.
                      </span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2.5.6. OUTPERFORM ACTION FOCUS SECTION (As requested, styled exactly like buildots.com) */}
      <section className="bg-white py-24 px-6 md:px-12 border-b border-slate-100 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Authentic Typography & Content */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            
            {/* Outline Tag Badge matching buildots.com ACTION badge */}
            <div className="inline-flex items-center px-3.5 py-1.5 border border-[#4f46e5]/40 rounded text-[11px] font-mono font-extrabold tracking-[0.2em] text-[#4f46e5] uppercase mb-6 bg-[#4f46e5]/5">
              ACTION
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.05] max-w-md">
              Outperform.
            </h2>

            <p className="text-sm md:text-base lg:text-lg text-slate-600 mt-6 max-w-md leading-relaxed font-sans">
              Keep trades aligned, approvals moving, and decisions fast – and improve every time you deliver a project.
            </p>

            {/* Dark Learn More button exactly matching the layout */}
            <button 
              onClick={() => {
                const el = document.getElementById("demo-request-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-8 px-8 py-3.5 bg-[#18181b] hover:bg-black text-white font-bold text-sm rounded transition duration-150 shadow-md cursor-pointer"
            >
              Learn more
            </button>

          </div>

          {/* Right Column: High-Quality Engineer Image with "SCHEDULE STATUS" HUD overlay */}
          <div className="lg:col-span-7 flex justify-center relative">
            <div className="relative w-full max-w-2xl aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-200/50 group">
              
              {/* Actual Generated High-Res Engineer Image */}
              <img 
                src="/src/assets/images/construction_engineer_tablet_1783966167775.jpg" 
                alt="Female construction engineer looking at progress with hardhat and safety vest" 
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />

              {/* Dotted grid matching HUD scanning scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.12)_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] pointer-events-none mix-blend-overlay" />
              
              {/* Radial gradient shadow framing */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Status Scanning Label at top right */}
              <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded border border-white/10 text-[9px] font-mono text-[#a78bfa] flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
                <span>TRADE ALIGNMENT ENGINE ACTIVE</span>
              </div>

              {/* Interactive B2B HUD Labels/Overlay Cards exactly like the screenshot */}
              {/* Label: SCHEDULE STATUS card with massive 8 days ahead */}
              <div className="absolute top-[20%] left-[6%] z-30 transition-transform duration-300 hover:scale-[1.02] pointer-events-auto">
                <div className="bg-[#272626]/90 backdrop-blur-md border border-white/10 rounded-lg p-5 shadow-2xl min-w-[280px]">
                  <div className="flex items-center gap-2 mb-3 text-slate-300">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-mono font-black tracking-[0.1em] uppercase text-white">SCHEDULE STATUS</span>
                  </div>

                  <div className="flex items-baseline gap-2 text-white">
                    <span className="text-5xl font-extrabold font-sans leading-none">8</span>
                    <span className="text-lg font-bold font-sans tracking-tight text-slate-100">days ahead</span>
                  </div>

                  {/* Purple/Indigo Pill beneath with Thumbs up icon */}
                  <div className="mt-4 bg-[#8b5cf6] rounded-md py-1.5 px-3 flex items-center gap-2">
                    <ThumbsUp className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] font-sans font-bold text-white tracking-wide">
                      Improved by 3 days from last week
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2.5.7. DELIVERING PROVEN RESULTS SECTION (As requested, styled exactly like buildots.com) */}
      <section className="bg-white py-24 px-6 md:px-12 border-b border-slate-100 relative z-20">
        <div className="max-w-7xl mx-auto">
          {/* Centered Large Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.05]">
              Delivering proven results.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Authentic Typography & Content */}
            <div className="lg:col-span-5 flex flex-col items-start text-left">
              
              {/* Outline Tag Badge matching buildots.com PROVEN RESULTS badge */}
              <div className="inline-flex items-center px-3.5 py-1.5 border border-[#4f46e5]/40 rounded text-[11px] font-mono font-extrabold tracking-[0.2em] text-[#4f46e5] uppercase mb-6 bg-[#4f46e5]/5">
                PROVEN RESULTS
              </div>

              <h3 className="text-3xl md:text-4xl lg:text-[44px] font-black tracking-tight text-slate-900 leading-[1.1] max-w-md">
                Reduce delays by up to 50%.
              </h3>

              <p className="text-sm md:text-base lg:text-lg text-slate-600 mt-6 max-w-md leading-relaxed font-sans">
                Projects using tracprogress® and a performance-driven approach have been proven to reduce delays by up to 50%. This is equivalent to 2-3 months of delays prevented on an average project.
              </p>

            </div>

            {/* Right Column: High-Quality Bar Chart Visualization */}
            <div className="lg:col-span-7 flex justify-center relative w-full">
              <div className="w-full max-w-2xl aspect-[16/11] relative select-none pl-12 md:pl-16 pr-8 pb-16 pt-8 flex flex-col">
                
                {/* Y-Axis Label */}
                <div className="absolute left-0 top-[40%] -translate-y-1/2 -rotate-90 text-[10px] font-mono text-slate-400 font-black tracking-[0.15em] uppercase">
                  % Project delay
                </div>

                {/* Inner Chart Box */}
                <div className="relative w-full h-full">
                  
                  {/* Grid lines & Y Axis Ticks */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[40, 30, 20, 10, 0].map((val, idx) => (
                      <div key={idx} className="w-full flex items-center relative h-0">
                        <span className="absolute -left-10 text-[10px] font-mono font-bold text-slate-400">
                          {val}%
                        </span>
                        <div className="w-full border-t border-slate-200/50" />
                      </div>
                    ))}
                  </div>

                  {/* Bars Area */}
                  <div className="absolute inset-0 flex justify-around items-end z-10 px-4">
                    
                    {/* Bar 1: Baseline (35%) */}
                    <div className="relative flex flex-col items-center w-[24%] h-full justify-end">
                      <div 
                        className="w-full bg-[#18181b] rounded-t hover:bg-black transition duration-300 flex items-start justify-center pt-4 shadow-md"
                        style={{ height: "87.5%" /* 35/40 */ }}
                      >
                        <span className="text-base md:text-2xl font-black text-white font-sans tracking-tight">35%</span>
                      </div>
                      <div className="absolute top-[105%] text-center text-[10px] md:text-xs font-semibold text-slate-500 max-w-[110px] leading-snug">
                        Baseline <br className="hidden sm:inline" />average delay
                      </div>
                    </div>

                    {/* Bar 2: With tracprogress® (28%) */}
                    <div className="relative flex flex-col items-center w-[24%] h-full justify-end">
                      <div 
                        className="w-full bg-[#a78bfa] rounded-t hover:bg-[#8b5cf6] transition duration-300 flex items-start justify-center pt-4 shadow-md"
                        style={{ height: "70%" /* 28/40 */ }}
                      >
                        <span className="text-base md:text-2xl font-black text-white font-sans tracking-tight">28%</span>
                      </div>
                      <div className="absolute top-[105%] text-center text-[10px] md:text-xs font-semibold text-slate-500 max-w-[110px] leading-snug">
                        With tracprogress®
                      </div>
                    </div>

                    {/* Bar 3: With tracprogress® and approach (17%) */}
                    <div className="relative flex flex-col items-center w-[24%] h-full justify-end">
                      <div 
                        className="w-full bg-[#daff00] rounded-t hover:bg-[#c6e600] transition duration-300 flex items-start justify-center pt-4 shadow-md"
                        style={{ height: "42.5%" /* 17/40 */ }}
                      >
                        <span className="text-base md:text-2xl font-black text-slate-900 font-sans tracking-tight">17%</span>
                      </div>
                      <div className="absolute top-[105%] text-center text-[10px] md:text-xs font-black text-slate-900 max-w-[140px] leading-tight">
                        With tracprogress® and a performance driven approach
                      </div>
                    </div>

                  </div>

                  {/* Dashed Indicator Line for Delay Halved */}
                  <div 
                    className="absolute left-0 right-[-8px] border-t-2 border-dashed border-slate-950 z-20 flex items-center justify-end"
                    style={{ bottom: "43.75%" }}
                  >
                    <div className="bg-white border border-slate-950 rounded px-2 py-1 text-[9px] md:text-[10px] font-black text-slate-950 uppercase tracking-wider translate-x-2 md:translate-x-4 shadow-md font-sans">
                      Delay halved
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
      
      {/* 2.5.8. INTELLIGENCE FROM THE SITE TO THE BOARDROOM SECTION (As requested, styled exactly like buildots.com) */}
      <section className="bg-[#11151e] py-28 px-6 md:px-12 border-b border-slate-900 relative z-20">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          
          {/* Large Centered Title */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight text-white leading-[1.05]">
              Intelligence from the site to the boardroom.
            </h2>
          </div>

          {/* 2x2 Clean Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-16 max-w-5xl mx-auto">
            
            {/* Item 1: Ground Truth */}
            <div className="flex gap-6 items-start">
              <div className="shrink-0 w-14 h-14 rounded-full border-2 border-[#daff00]/30 bg-[#daff00]/5 flex items-center justify-center text-[#daff00] shadow-[0_0_15px_rgba(218,255,0,0.12)]">
                <Ruler className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left">
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Up-to-date ground truth
                </h3>
                <p className="text-sm md:text-base text-slate-400 mt-3 leading-relaxed font-sans font-medium">
                  Unlock timely, accurate progress reports detailing exactly what is complete compared to your plan. Get a view of the entire project, even if the model is incomplete.
                </p>
              </div>
            </div>

            {/* Item 2: Risk Detection */}
            <div className="flex gap-6 items-start">
              <div className="shrink-0 w-14 h-14 rounded-full border-2 border-[#daff00]/30 bg-[#daff00]/5 flex items-center justify-center text-[#daff00] shadow-[0_0_15px_rgba(218,255,0,0.12)]">
                <Target className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left">
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Advanced risk detection
                </h3>
                <p className="text-sm md:text-base text-slate-400 mt-3 leading-relaxed font-sans font-medium">
                  Identify activities and deviations that could put your delivery date at risk.
                </p>
              </div>
            </div>

            {/* Item 3: Contractor and Trade Management */}
            <div className="flex gap-6 items-start">
              <div className="shrink-0 w-14 h-14 rounded-full border-2 border-[#daff00]/30 bg-[#daff00]/5 flex items-center justify-center text-[#daff00] shadow-[0_0_15px_rgba(218,255,0,0.12)]">
                <Users className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left">
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Contractor and trade management
                </h3>
                <p className="text-sm md:text-base text-slate-400 mt-3 leading-relaxed font-sans font-medium">
                  Manage contractors and trades based on objective data and actual site performance rather than subjective reporting.
                </p>
              </div>
            </div>

            {/* Item 4: Complete Site Documentation */}
            <div className="flex gap-6 items-start">
              <div className="shrink-0 w-14 h-14 rounded-full border-2 border-[#daff00]/30 bg-[#daff00]/5 flex items-center justify-center text-[#daff00] shadow-[0_0_15px_rgba(218,255,0,0.12)]">
                <FileText className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left">
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Complete site documentation
                </h3>
                <p className="text-sm md:text-base text-slate-400 mt-3 leading-relaxed font-sans font-medium">
                  Get a true record of what was built and when. Unlock full transparency and defensible documentation in the event of questions or disputes.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2.5.9. WE SUPPORT ALMOST EVERY TYPE OF PROJECT SECTION (As requested, styled exactly like buildots.com) */}
      <section className="bg-white py-24 px-6 md:px-12 border-b border-slate-100 relative z-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.05]">
              We support almost every type of project.
            </h2>
          </div>

          {/* Grid Layout of Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Card 1: Data Centers */}
            <div className="group bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-200 flex flex-col h-full">
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-100">
                <img
                  src="/src/assets/images/datacenter_cv_construction_1783966688524.jpg"
                  alt="Data centers"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 flex items-end justify-between gap-4 bg-[#f8fafc]/40 border-t border-slate-50 flex-1">
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                    Data centers
                  </h3>
                  <p className="text-sm md:text-base text-slate-500 leading-relaxed font-sans font-medium">
                    Accelerate time-to-capacity and protect margins.
                  </p>
                </div>
                <div className="shrink-0 w-11 h-11 rounded-lg border border-slate-200 bg-white group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white flex items-center justify-center text-slate-700 transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Card 2: Commercial */}
            <div className="group bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-200 flex flex-col h-full">
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-100">
                <img
                  src="/src/assets/images/commercial_cv_construction_1783966706371.jpg"
                  alt="Commercial"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 flex items-end justify-between gap-4 bg-[#f8fafc]/40 border-t border-slate-50 flex-1">
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                    Commercial
                  </h3>
                  <p className="text-sm md:text-base text-slate-500 leading-relaxed font-sans font-medium">
                    Deliver on time, on budget, and continually raise the bar.
                  </p>
                </div>
                <div className="shrink-0 w-11 h-11 rounded-lg border border-slate-200 bg-white group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white flex items-center justify-center text-slate-700 transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Card 3: Multifamily */}
            <div className="group bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-200 flex flex-col h-full">
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-100">
                <img
                  src="/src/assets/images/multifamily_cv_construction_1783966723985.jpg"
                  alt="Multifamily"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 flex items-end justify-between gap-4 bg-[#f8fafc]/40 border-t border-slate-50 flex-1">
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                    Multifamily
                  </h3>
                  <p className="text-sm md:text-base text-slate-500 leading-relaxed font-sans font-medium">
                    Deliver new homes without delays or surprises.
                  </p>
                </div>
                <div className="shrink-0 w-11 h-11 rounded-lg border border-slate-200 bg-white group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white flex items-center justify-center text-slate-700 transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Card 4: Healthcare */}
            <div className="group bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-200 flex flex-col h-full">
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-100">
                <img
                  src="/src/assets/images/healthcare_cv_construction_1783966738922.jpg"
                  alt="Healthcare"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 flex items-end justify-between gap-4 bg-[#f8fafc]/40 border-t border-slate-50 flex-1">
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                    Healthcare
                  </h3>
                  <p className="text-sm md:text-base text-slate-500 leading-relaxed font-sans font-medium">
                    Build like lives depend on it.
                  </p>
                </div>
                <div className="shrink-0 w-11 h-11 rounded-lg border border-slate-200 bg-white group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white flex items-center justify-center text-slate-700 transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Card 5: Industrial */}
            <div className="group bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-200 flex flex-col h-full">
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-100">
                <img
                  src="/src/assets/images/industrial_cv_construction_1783966754295.jpg"
                  alt="Industrial"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 flex items-end justify-between gap-4 bg-[#f8fafc]/40 border-t border-slate-50 flex-1">
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                    Industrial
                  </h3>
                  <p className="text-sm md:text-base text-slate-500 leading-relaxed font-sans font-medium">
                    Get production online, on time.
                  </p>
                </div>
                <div className="shrink-0 w-11 h-11 rounded-lg border border-slate-200 bg-white group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white flex items-center justify-center text-slate-700 transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Card 6: Education */}
            <div className="group bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-200 flex flex-col h-full">
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-100">
                <img
                  src="/src/assets/images/education_cv_construction_1783966769867.jpg"
                  alt="Education"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 flex items-end justify-between gap-4 bg-[#f8fafc]/40 border-t border-slate-50 flex-1">
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                    Education
                  </h3>
                  <p className="text-sm md:text-base text-slate-500 leading-relaxed font-sans font-medium">
                    Build spaces that communities can rely on.
                  </p>
                </div>
                <div className="shrink-0 w-11 h-11 rounded-lg border border-slate-200 bg-white group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white flex items-center justify-center text-slate-700 transition-all duration-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2.5.10. THE HIGHEST LEVEL OF SERVICE SECTION (As requested from buildots.com) */}
      <section className="bg-[#fcfdfd] py-24 px-6 md:px-12 border-b border-slate-100 relative z-20">
        <div className="max-w-7xl mx-auto">
          {/* Centered Heading */}
          <div className="text-center mb-20 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.05]">
              The highest level of service.
            </h2>
          </div>

          {/* Three columns of services */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            
            {/* Hands-on onboarding */}
            <div className="flex flex-col items-start text-left group">
              <div className="w-14 h-14 rounded-2xl bg-[#e0e7ff]/60 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Sparkles className="w-7 h-7 stroke-[2]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">
                Hands-on onboarding
              </h3>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed font-sans font-medium">
                Dedicated experts with in-the-field construction expertise work directly with your teams to drive fast, effective adoption.
              </p>
            </div>

            {/* Forward-deployed support */}
            <div className="flex flex-col items-start text-left group">
              <div className="w-14 h-14 rounded-2xl bg-[#e0e7ff]/60 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Building2 className="w-7 h-7 stroke-[2]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">
                Forward-deployed support
              </h3>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed font-sans font-medium">
                On major projects, we deploy on-the-ground specialists to work with your team, ensuring the platform delivers immediate value.
              </p>
            </div>

            {/* Ongoing partnership */}
            <div className="flex flex-col items-start text-left group">
              <div className="w-14 h-14 rounded-2xl bg-[#e0e7ff]/60 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Users className="w-7 h-7 stroke-[2]" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">
                Ongoing partnership
              </h3>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed font-sans font-medium">
                Continuous guidance and optimization to help you manage change and get the most out of your data.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 2.5.11. FROM DATA TO DECISIVE ACTION SECTION (As requested from buildots.com) */}
      <section className="bg-slate-50 py-24 px-6 md:px-12 border-b border-slate-100 relative z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Heading, Subheadings, and Active Info */}
            <div className="lg:col-span-5 flex flex-col items-start text-left">
              <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 leading-[1.05] mb-8">
                From data to decisive action.
              </h2>
              
              <p className="text-sm md:text-base lg:text-lg text-slate-600 mb-4 leading-relaxed font-sans font-medium">
                Connect your BIM, schedule, site data, and workforce insights into one coordinated system.
              </p>
              
              <p className="text-sm md:text-base lg:text-lg text-slate-600 mb-10 leading-relaxed font-sans font-medium">
                Turn fragmented data into clear priorities, aligned teams, and measurable performance improvements across your entire portfolio.
              </p>

              {/* Dynamic node detail highlight panel */}
              <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-6 mb-8 shadow-sm text-left transition-all duration-300 min-h-[140px] flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] uppercase font-mono font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                    INTEGRATION EXPLORER
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Hover or click nodes on the right</span>
                </div>
                {activeNodeInfo ? (
                  <div className="animate-fade-in">
                    <h4 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <activeNodeInfo.icon className={`w-5 h-5 ${activeNodeInfo.type === 'input' ? 'text-indigo-600' : 'text-slate-800'}`} />
                      {activeNodeInfo.label}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 font-sans leading-relaxed">
                      {activeNodeInfo.desc}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-base font-bold text-slate-800 tracking-tight">tracprogress® Platform Map</h4>
                    <p className="text-xs text-slate-400 mt-1 font-sans">
                      Select any node on the circular layout to trace raw inputs converting into decisive operational workflows.
                    </p>
                  </div>
                )}
              </div>

              <button className="px-8 py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:translate-y-[-1px]">
                Get a demo
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right Column: Platform Capabilities Navigator */}
            <div className="lg:col-span-7 w-full flex flex-col gap-8">
              
              {/* Inputs Group */}
              <div>
                <h3 className="text-xs font-mono font-black tracking-widest text-[#4f46e5] uppercase mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
                  Ingest & Align (Inputs)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DIAGRAM_NODES.filter(n => n.type === "input").map((node) => {
                    const Icon = node.icon;
                    const isSelected = activeNode === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setActiveNode(node.id)}
                        onMouseEnter={() => setActiveNode(node.id)}
                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none flex items-start gap-3.5 group
                          ${isSelected 
                            ? "bg-white border-indigo-600 shadow-md ring-2 ring-indigo-600/5 translate-y-[-2px]" 
                            : "bg-white/80 border-slate-200/80 hover:border-slate-300 hover:shadow-sm"}`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 transition-colors duration-300
                          ${isSelected ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100"}`}>
                          <Icon className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                            {node.label}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5 block">
                            Platform Input
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Outputs Group */}
              <div>
                <h3 className="text-xs font-mono font-black tracking-widest text-slate-900 uppercase mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  Analyze & Optimize (Insights)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DIAGRAM_NODES.filter(n => n.type === "output").map((node) => {
                    const Icon = node.icon;
                    const isSelected = activeNode === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setActiveNode(node.id)}
                        onMouseEnter={() => setActiveNode(node.id)}
                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none flex items-start gap-3.5 group
                          ${isSelected 
                            ? "bg-white border-slate-900 shadow-md ring-2 ring-slate-950/5 translate-y-[-2px]" 
                            : "bg-white/80 border-slate-200/80 hover:border-slate-300 hover:shadow-sm"}`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 transition-colors duration-300
                          ${isSelected ? "bg-slate-950 text-[#daff00]" : "bg-slate-50 text-slate-700 group-hover:bg-slate-100"}`}>
                          <Icon className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                            {node.label}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold font-sans mt-0.5 block">
                            Operational Insight
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2.6. PROVEN B2B CUSTOMER SUCCESS & TESTIMONIALS SECTION */}
      <section className="bg-slate-50 py-24 px-6 md:px-12 border-b border-slate-200 relative z-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center px-3.5 py-1.5 border border-[#4f46e5]/40 rounded text-[11px] font-mono font-extrabold tracking-[0.2em] text-[#4f46e5] uppercase mb-6 bg-[#4f46e5]/5">
              CASE STUDIES
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
              Trusted by the world's leading general contractors.
            </h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-sans font-medium">
              See how major builders eliminate construction blind spots, resolve subcontractor disputes, and protect project timelines with objective AI-powered tracking.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-300">
              <div className="flex flex-col gap-6">
                <span className="text-xs font-mono font-black text-indigo-600 tracking-widest uppercase">
                  NCC CONSTRUCTION
                </span>
                <p className="text-sm text-slate-700 leading-relaxed font-sans italic">
                  "tracprogress® has completely transformed how we run our weekly site meetings. Having continuous, objective data means we spend zero time arguing about what's done, and all of our time solving actual site bottlenecks."
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-950 font-sans">
                    Production Director
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    NCC Stockholm
                  </p>
                </div>
                <div className="text-right bg-[#4f46e5]/5 px-3 py-1.5 rounded-lg border border-[#4f46e5]/10">
                  <span className="text-xs font-mono font-black text-[#4f46e5] block leading-none">98%</span>
                  <span className="text-[8px] font-mono text-[#4f46e5] tracking-wide uppercase font-bold mt-0.5 block">Billing Acc.</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-300">
              <div className="flex flex-col gap-6">
                <span className="text-xs font-mono font-black text-indigo-600 tracking-widest uppercase">
                  POMERLEAU
                </span>
                <p className="text-sm text-slate-700 leading-relaxed font-sans italic">
                  "The speed of automated insights allows our project managers to stay ahead of drywall and MEP trade delays. tracprogress® gives us a level of portfolio visibility we never thought possible."
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-950 font-sans">
                    VP of Digital Innovation
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Pomerleau Montreal
                  </p>
                </div>
                <div className="text-right bg-[#4f46e5]/5 px-3 py-1.5 rounded-lg border border-[#4f46e5]/10">
                  <span className="text-xs font-mono font-black text-[#4f46e5] block leading-none">40%</span>
                  <span className="text-[8px] font-mono text-[#4f46e5] tracking-wide uppercase font-bold mt-0.5 block">Less Rework</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-300">
              <div className="flex flex-col gap-6">
                <span className="text-xs font-mono font-black text-indigo-600 tracking-widest uppercase">
                  WATES GROUP
                </span>
                <p className="text-sm text-slate-700 leading-relaxed font-sans italic">
                  "By comparing reality walking tracks directly against our Revit coordinate designs, we discovered and resolved 15 critical geometry clashes before they became expensive on-site issues."
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-950 font-sans">
                    Senior MEP Coordinator
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Wates Group London
                  </p>
                </div>
                <div className="text-right bg-[#4f46e5]/5 px-3 py-1.5 rounded-lg border border-[#4f46e5]/10">
                  <span className="text-xs font-mono font-black text-[#4f46e5] block leading-none">2.5x</span>
                  <span className="text-[8px] font-mono text-[#4f46e5] tracking-wide uppercase font-bold mt-0.5 block">Faster Delivery</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE SECTION TABS */}
      <section className="bg-slate-50 border-y border-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight">
              Analyse the tracprogress Platform Capabilities
            </h2>
            <p className="text-slate-600 text-sm mt-3 max-w-2xl mx-auto">
              Explore why top general contractors and real estate developers replace manual checklist inspections with high-fidelity, autonomous computer vision.
            </p>

            {/* Segment Controls */}
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {[
                { id: "platform", label: "Core Products", icon: Layers },
                { id: "how-it-works", label: "Workflow (Step-by-Step)", icon: Compass },
                { id: "calculator", label: "Interactive ROI Estimator", icon: DollarSign },
                { id: "ai-lab", label: "AI Innovation Lab (Demos)", icon: Sparkles },
                { id: "use-cases", label: "Use Cases", icon: Briefcase }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                      activeTab === tab.id 
                        ? "bg-slate-900 text-white border-slate-800 shadow-md" 
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: PRODUCT MATRIX DEEP DIVE */}
          {activeTab === "platform" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TRAC_PROGRES_PRODUCTS.map((prod) => {
                const Icon = prod.icon;
                return (
                  <div key={prod.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-amber-500/40 hover:shadow-lg transition flex flex-col justify-between gap-5 group">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${prod.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                          <Icon className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors">{prod.title}</h3>
                          <p className="text-[11px] text-amber-600 font-bold font-mono tracking-wide uppercase mt-0.5">{prod.subtitle}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{prod.desc}</p>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">Benchmark:</span>
                      <span className="font-bold text-slate-800 font-mono flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                        {prod.metric}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP PROGRESS PIPELINE */}
          {activeTab === "how-it-works" && (
            <div className="relative border border-slate-200 bg-white rounded-xl p-8 shadow-md">
              
              <div className="absolute top-0 right-0 p-3 bg-amber-500/10 text-amber-800 border-b border-l border-slate-200 rounded-tr-xl rounded-bl-xl text-[10px] font-mono font-bold">
                PLATFORM WORKFLOW PIPELINE
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                
                {/* Step 1 */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-5 border border-amber-400 text-amber-700 flex items-center justify-center font-mono font-black text-sm shadow-sm">
                      01
                    </div>
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-400 to-slate-200 hidden md:block" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Inspections on the Go</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Simply secure a standard GoPro or high-grade commercial 360° camera to any project engineer's hardhat. Conduct routine walkabouts without modifying your day.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-5 border border-indigo-400 text-indigo-700 flex items-center justify-center font-mono font-black text-sm shadow-sm">
                      02
                    </div>
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-400 to-slate-200 hidden md:block" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Deep Neural Network Sync</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Our secure cloud servers extract and stitch frames. Computers automatically match geographic positions to coordinates inside your IFC/Revit models, identifying individual drywall elements, HVAC valves, and plumbing lines.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-5 border border-emerald-400 text-emerald-700 flex items-center justify-center font-mono font-black text-sm shadow-sm">
                      03
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Discrepancies & Worksheets</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Instant discrepancy alerts, schedule-to-progress alignment graphs, subtrade progress metrics, and automatically updated spreadsheets are pushed directly to project dashboards.
                    </p>
                  </div>
                </div>

              </div>

              <div className="mt-8 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 leading-normal flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  By eliminating manual checklist audits, tracprogress® users report saving up to <span className="text-slate-900 font-bold">4 hours per walk</span> per inspector while boosting the data resolution of subtrade payout tracking sheets.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: SLIDER ROI CALCULATOR */}
          {activeTab === "calculator" && (
            <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-md">
              
              <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs font-mono">
                <span className="text-amber-700 font-bold uppercase tracking-wider">PROJECTED ROI CALCULATOR MATRIX</span>
                <span className="text-slate-500">Formulated on actual industry metrics</span>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Sliders Input Side */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  
                  {/* Slider 1 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700">PROJECT CONSTRUCTION VALUE</span>
                      <span className="text-sm font-black text-amber-600 font-mono">${projectVal} Million USD</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="200" 
                      step="5"
                      value={projectVal}
                      onChange={(e) => setProjectVal(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>$5M</span>
                      <span>$200M+</span>
                    </div>
                  </div>

                  {/* Slider 2 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700">TYPICAL MONTHLY REWORK / DISPUTE COSTS</span>
                      <span className="text-sm font-black text-amber-600 font-mono">${reworkCost.toLocaleString()} USD</span>
                    </div>
                    <input 
                      type="range" 
                      min="2000" 
                      max="100000" 
                      step="2000"
                      value={reworkCost}
                      onChange={(e) => setReworkCost(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>$2,000</span>
                      <span>$100,000+</span>
                    </div>
                  </div>

                  {/* Slider 3 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700">TOTAL FLOORS MONITORING CAPACITY</span>
                      <span className="text-sm font-black text-amber-600 font-mono">{floors} Floors</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="60" 
                      value={floors}
                      onChange={(e) => setFloors(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>1 Floor</span>
                      <span>60 Floors</span>
                    </div>
                  </div>

                </div>

                {/* Calculation Outputs Side */}
                <div className="lg:col-span-5 bg-slate-900 p-6 rounded-xl flex flex-col justify-between gap-6">
                  
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block mb-1">Estimated Annual Savings</span>
                    <div className="text-3xl md:text-4xl font-black text-amber-400 font-mono tracking-tight">
                      ${annualSavings.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                      Formulated based on saving an estimated 45% of unnecessary trade disputes, late deviation overhauls, and manual tracking overhead.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Hours Saved / Wk</span>
                      <span className="text-lg font-bold text-white">{hoursSavedPerWeek} Hours</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Late Errors Blocked</span>
                      <span className="text-lg font-bold text-white">{disputesAvoided} / floor</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const el = document.getElementById("demo-request-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition text-center flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
                  >
                    <span>Request Detailed ROI Blueprint</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* TAB 4: USE-CASES */}
          {activeTab === "use-cases" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="w-9 h-9 rounded bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base mt-1">General Contractors (GCs)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    tracprogress® replaces subjective visual checks on site. GC engineers log into objective, granular trade tracking sheets. Eliminate late trade coordination disputes, speed up payment certifications, and verify completion before subtrades leave the site.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-amber-800 flex items-center gap-1.5 bg-amber-50/50 p-2.5 rounded border border-amber-100 mt-2">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Saves ~12 hours of field inspection paperwork per team per week.
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="w-9 h-9 rounded bg-amber-5 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base mt-1">Real Estate Owners & Developers</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Maintain direct, unbiased, visual proof of multi-billion dollar capital programs. Monitor project schedule velocity indices, audit subcontractor completion percentages instantly, and safeguard schedule deadlines from hidden downstream delays.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-amber-800 flex items-center gap-1.5 bg-amber-50/50 p-2.5 rounded border border-amber-100 mt-2">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Unlocks absolute tracking fidelity for regulatory compliance.
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: AI INNOVATION LAB (DEMOS) */}
          {activeTab === "ai-lab" && (
            <div className="flex flex-col gap-8 w-full animate-fadeIn">
              {/* Sub-tabs/Sub-menu for the 5 live demos */}
              <div className="flex flex-wrap justify-center gap-2 p-2 bg-slate-950/80 rounded-2xl border border-slate-800/80 w-full max-w-5xl mx-auto shadow-xl">
                {[
                  { id: "playground", label: "AI Progress Detector", icon: Cpu, desc: "Segment wall structures" },
                  { id: "comparison", label: "BIM vs Site Reality", icon: Layers, desc: "Split-screen swiper" },
                  { id: "roi", label: "Capital ROI Engine", icon: DollarSign, desc: "Animate timeline gains" },
                  { id: "twin-map", label: "2D Digital Twin Floor Plan", icon: Compass, desc: "Clickable unit zones" },
                  { id: "prediction", label: "AI Delay Prediction HUD", icon: Activity, desc: "Critical path analysis" }
                ].map((demo) => {
                  const DemoIcon = demo.icon;
                  const isActive = activeLabDemo === demo.id;
                  return (
                    <button
                      key={demo.id}
                      onClick={() => setActiveLabDemo(demo.id)}
                      className={`flex-1 min-w-[160px] md:min-w-[180px] p-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 text-center cursor-pointer border ${
                        isActive 
                          ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/10" 
                          : "bg-slate-900/40 text-slate-400 border-transparent hover:text-white hover:bg-slate-900/80 hover:border-slate-800"
                      }`}
                    >
                      <DemoIcon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-amber-500"}`} />
                      <span className="font-mono text-[11px] uppercase tracking-wide">{demo.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Render Selected Interactive Demo */}
              <div className="w-full">
                {activeLabDemo === "playground" && <AIProgressPlayground />}
                {activeLabDemo === "comparison" && <InteractiveComparison />}
                {activeLabDemo === "roi" && <EnterpriseROICalculator />}
                {activeLabDemo === "twin-map" && <DigitalTwinProgressMap />}
                {activeLabDemo === "prediction" && <DelayPredictionDashboard />}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 4. EXCLUSIVE PERFORMANCE STATISTICS GRID (BENTO BOX) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[11px] text-amber-600 uppercase tracking-widest font-mono font-bold">PROJECT OUTCOMES AT SCALE</span>
          <h2 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight mt-1">
            Proven Benchmarks Across Capital Builds
          </h2>
          <p className="text-slate-600 text-sm mt-3 max-w-xl mx-auto">
            tracprogress® converts site walk video pixels into robust executive metrics, delivering direct savings in time, materials, and schedule delays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white border border-slate-200 p-8 rounded-xl flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-amber-500/40 hover:shadow-lg transition">
            <div className="absolute top-0 right-0 p-3 text-slate-100 font-mono text-5xl font-black select-none pointer-events-none group-hover:text-amber-500/10 transition">
              15%
            </div>
            <div>
              <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-mono text-amber-600">15%</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mt-3">Trade Pace Efficiency</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-4">
              Identifies suboptimal micro-scheduling trends early, unlocking average trade coordination pacing gains through objective progress alignment.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-xl flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-amber-500/40 hover:shadow-lg transition">
            <div className="absolute top-0 right-0 p-3 text-slate-100 font-mono text-5xl font-black select-none pointer-events-none group-hover:text-amber-500/10 transition">
              2-4H
            </div>
            <div>
              <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-mono text-amber-600">2-4h</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mt-3">Daily Time Saved</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-4">
              Replaces manual visual logs with autonomous AI mapping, saving project engineers hours of checklist compilation and verification work.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-xl flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-amber-500/40 hover:shadow-lg transition">
            <div className="absolute top-0 right-0 p-3 text-slate-100 font-mono text-5xl font-black select-none pointer-events-none group-hover:text-amber-500/10 transition">
              0.0%
            </div>
            <div>
              <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-mono text-amber-600">0%</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mt-3">Late Omissions</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-4">
              Guarantees that mechanical blockouts and structural anchors are located correctly prior to succeeding concrete pours.
            </p>
          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE LEAD CAPTURE FORM / BOOK A DEMO */}
      <section id="demo-request-section" className="bg-slate-50 border-t border-slate-200 py-20 px-6">
        <div className="max-w-4xl mx-auto border border-slate-200 rounded-2xl bg-white overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-xl">
          
          {/* Left panel instructions */}
          <div className="md:col-span-5 bg-slate-50/50 p-8 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r border-slate-200">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest">GET A PERSONAL BLUEPRINT</span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Experience the tracprogress Solution For Your Site
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect with our structural implementation team to set up a digital twin trial project, analyze raw BIM tolerances, or build custom ROI projection briefs.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 text-[11px] text-slate-700 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>1-on-1 IFC coordination trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Custom ROI estimation blueprint</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Pre-loaded trial workspace access</span>
              </div>
            </div>
          </div>

          {/* Right form container */}
          <div className="md:col-span-7 p-8 flex flex-col justify-center">
            {demoRequested ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 flex flex-col items-center gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-500 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Demo Request Submitted!</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm">
                    Thank you, <span className="text-slate-900 font-semibold">{formData.fullName}</span>. An enterprise integration manager will contact you at <span className="text-slate-900 font-semibold">{formData.email}</span> within 2 hours.
                  </p>
                </div>
                <button
                  onClick={() => enterWorkspace(true)}
                  className="mt-4 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  Enter Instant App Workspace
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Business Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. rajesh@lntcorp.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Company Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Larsen & Toubro Construction"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Project Sector</label>
                    <select 
                      value={formData.projectType}
                      onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                    >
                      <option value="Commercial Residential">Commercial Residential</option>
                      <option value="Infrastructure Logistics">Infrastructure & Logistics</option>
                      <option value="Industrial Mega Build">Industrial Mega-Build</option>
                      <option value="Specialist Sub-Trade">Specialist Sub-Trade Scope</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-500">Est. Portfolio Budget</label>
                    <select 
                      value={formData.projectSize}
                      onChange={(e) => setFormData({...formData, projectSize: e.target.value})}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                    >
                      <option value="Under $10M">Under $10M USD</option>
                      <option value="$10M to $50M">$10M to $50M USD</option>
                      <option value="Over $50M">Over $50M USD</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg uppercase tracking-wider font-mono transition shadow-md hover:shadow-lg cursor-pointer"
                >
                  Request Personalized Demo & Blueprint
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* 2.5.12. READY TO BUILD WITHOUT BLIND SPOTS BANNER SECTION */}
      <section className="bg-slate-950 p-6 md:p-12 relative z-20">
        <div className="max-w-7xl mx-auto rounded-[32px] overflow-hidden relative min-h-[440px] md:min-h-[520px] flex flex-col justify-end p-8 md:p-16 shadow-2xl group">
          
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/crane_silhouette_construction_1783967213376.jpg"
              alt="Ready to build without blind spots"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Dark gradient overlay from left-to-right to guarantee text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent md:hidden" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-2xl text-left flex flex-col items-start gap-8">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-black tracking-tight text-white leading-[1.05] drop-shadow-md">
              Ready to build <br />
              without blind spots?
            </h2>
            
            <button className="px-8 py-4 bg-[#daff00] hover:bg-[#c9eb00] text-slate-950 font-bold text-sm sm:text-base rounded-lg transition duration-300 shadow-lg hover:shadow-xl hover:translate-y-[-1px] cursor-pointer">
              Get a demo
            </button>
          </div>
        </div>
      </section>

      {/* 6. AUTHENTIC ENTERPRISE FOOTER (Fully matching buildots.com) */}
      <footer className="bg-[#1c1c1c] text-slate-300 py-16 px-6 md:px-12 border-t border-[#2d2d2d] relative z-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Logo Divider Row */}
          <div className="flex items-center gap-6 mb-16">
            <div className="shrink-0 flex items-center select-none">
              {/* Custom stylized tracprogress® Logo with yellow-green borders */}
              <div className="relative flex items-center px-4 py-2 border-l border-r border-[#daff00] h-11">
                {/* Top border corners */}
                <div className="absolute top-0 left-0 w-3.5 h-[2px] bg-[#daff00]" />
                <div className="absolute top-0 right-0 w-3.5 h-[2px] bg-[#daff00]" />
                {/* Bottom border corners */}
                <div className="absolute bottom-0 left-0 w-3.5 h-[2px] bg-[#daff00]" />
                <div className="absolute bottom-0 right-0 w-3.5 h-[2px] bg-[#daff00]" />
                
                <span className="text-xl sm:text-2xl font-black text-white tracking-tighter">TRAC PROGRESS®</span>
                
                {/* Top right '+' symbol */}
                <span className="absolute -top-1.5 -right-2 text-2xl font-black text-[#daff00] select-none">+</span>
              </div>
            </div>
            <div className="h-[1px] bg-[#2d2d2d] flex-1 rounded-full" />
          </div>

          {/* 5-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 text-left">
            
            {/* Column 1: Product */}
            <div className="flex flex-col">
              <h4 className="text-base font-bold text-white tracking-tight mb-5">Product</h4>
              <div className="flex flex-col gap-3">
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Construction intelligence platform
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  tracprogress®
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Genda
                </a>
              </div>
            </div>

            {/* Column 2: Solutions */}
            <div className="flex flex-col">
              <h4 className="text-base font-bold text-white tracking-tight mb-5">Solutions</h4>
              
              <div className="flex flex-col gap-3">
                {/* BY ROLE Group */}
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase font-mono mb-1">
                  By Role
                </span>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Project teams
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Executives
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Owners
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Construction management services
                </a>

                {/* BY PROJECT TYPE Group */}
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase font-mono mt-4 mb-1">
                  By Project Type
                </span>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Data centers
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Industrial
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Commercial
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Multifamily
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Healthcare
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Education
                </a>
              </div>
            </div>

            {/* Column 3: Resources */}
            <div className="flex flex-col">
              <h4 className="text-base font-bold text-white tracking-tight mb-5">Resources</h4>
              <div className="flex flex-col gap-3">
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Resource center
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Whitepapers
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Webinars
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Case studies
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Newsroom
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Blog
                </a>
              </div>
            </div>

            {/* Column 4: Company */}
            <div className="flex flex-col">
              <h4 className="text-base font-bold text-white tracking-tight mb-5">Company</h4>
              <div className="flex flex-col gap-3">
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  About us
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Careers
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                  Contact us
                </a>
              </div>
            </div>

            {/* Column 5: Stay up to date */}
            <div className="flex flex-col">
              <h4 className="text-base font-bold text-white tracking-tight mb-5">Stay up to date</h4>
              
              {/* Form container */}
              <form onSubmit={(e) => { e.preventDefault(); alert("Successfully signed up for updates!"); }} className="flex flex-col gap-3">
                
                {/* First & Last Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First name*"
                    required
                    className="w-full bg-[#2a2a2a] border border-[#3d3d3d] rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#daff00] transition duration-200"
                  />
                  <input
                    type="text"
                    placeholder="Last name*"
                    required
                    className="w-full bg-[#2a2a2a] border border-[#3d3d3d] rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#daff00] transition duration-200"
                  />
                </div>

                {/* Email and Button Row */}
                <div className="flex items-stretch w-full mt-1">
                  <input
                    type="email"
                    placeholder="Company email*"
                    required
                    className="flex-1 bg-[#2a2a2a] border border-[#3d3d3d] rounded-l-lg px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#daff00] transition duration-200 h-11"
                  />
                  <button 
                    type="submit" 
                    className="bg-white hover:bg-slate-100 text-[#1c1c1c] font-bold text-xs px-4 rounded-r-lg whitespace-nowrap transition duration-200 h-11"
                  >
                    Sign me up
                  </button>
                </div>

                {/* Subtext info */}
                <p className="text-[10px] text-slate-500 leading-normal mt-2">
                  By submitting you agree to receive marketing communications from tracprogress®. See our{" "}
                  <a href="#" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition duration-200">
                    Privacy policy
                  </a>
                  .
                </p>
              </form>

              {/* Social Icons row (Squircle squares) */}
              <div className="flex gap-2.5 mt-8">
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 bg-[#2a2a2a] hover:bg-[#3d3d3d] hover:text-[#daff00] text-slate-300 rounded-lg flex items-center justify-center transition-all duration-300"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 bg-[#2a2a2a] hover:bg-[#3d3d3d] hover:text-[#daff00] text-slate-300 rounded-lg flex items-center justify-center transition-all duration-300"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 bg-[#2a2a2a] hover:bg-[#3d3d3d] hover:text-[#daff00] text-slate-300 rounded-lg flex items-center justify-center transition-all duration-300"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 bg-[#2a2a2a] hover:bg-[#3d3d3d] hover:text-[#daff00] text-slate-300 rounded-lg flex items-center justify-center transition-all duration-300"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>

            </div>

          </div>

          {/* Direct Workspace Back-to-Top Area */}
          <div className="border-t border-[#2d2d2d] mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-sans">
            <span>© 2026 tracprogress® Ltd • All Rights Reserved. Aligned with modern enterprise BIM standards.</span>
            <div className="flex gap-4">
              <button onClick={() => enterWorkspace(true)} className="hover:text-white transition cursor-pointer font-bold text-[#daff00]">
                Direct Workspace Mode
              </button>
              <span>•</span>
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-white transition cursor-pointer">
                Back to Top
              </button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
