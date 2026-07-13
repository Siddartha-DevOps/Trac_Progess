import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Bell, 
  Sparkles, 
  ChevronDown, 
  Check, 
  HelpCircle, 
  Sun, 
  Moon, 
  Building2, 
  User, 
  Settings, 
  LogOut, 
  Command, 
  Globe, 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  BookOpen, 
  Terminal,
  HelpCircle as HelpIcon,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Info,
  Smartphone,
  Home
} from "lucide-react";
import { useAppStore } from "../store";
import { motion, AnimatePresence } from "motion/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import * as Dialog from "@radix-ui/react-dialog";

// Project Database for switching
const PROJECTS_DB = [
  {
    id: "btp-block-b",
    name: "Bangalore Tech Park - Block B",
    location: "Whitefield, Bengaluru, Karnataka, India",
    totalCost: "₹18.5 Crores",
    reraId: "KA-RERA-2026-0389",
    constructionArea: "45,000 sq ft",
    targetDate: "Q4 2026",
    overallProgress: 72.4,
  },
  {
    id: "mumbai-metro-3",
    name: "Mumbai Metro Line 3 - Underground",
    location: "Colaba, Mumbai, Maharashtra, India",
    totalCost: "₹45.0 Crores",
    reraId: "MH-RERA-GOVT-1102",
    constructionArea: "120,000 sq ft",
    targetDate: "Q2 2027",
    overallProgress: 58.1,
  },
  {
    id: "cybercity-ph2",
    name: "Gurgaon CyberCity - Phase II Tower",
    location: "Sector 24, Gurugram, Haryana, India",
    totalCost: "₹32.8 Crores",
    reraId: "HR-RERA-2026-9912",
    constructionArea: "85,000 sq ft",
    targetDate: "Q1 2027",
    overallProgress: 88.5,
  },
  {
    id: "hyd-it-hub",
    name: "Hyderabad IT Corridor Hub",
    location: "Gachibowli, Hyderabad, Telangana, India",
    totalCost: "₹24.5 Crores",
    reraId: "TS-RERA-2025-0811",
    constructionArea: "60,000 sq ft",
    targetDate: "Q3 2026",
    overallProgress: 100.0,
  }
];

// Organizations List
const ORGANIZATIONS = [
  { id: "buildtrace", name: "tracprogress India Ltd", logo: "TP", type: "Parent Developer" },
  { id: "innospace", name: "InnoSpace Infra Corp", logo: "IS", type: "Joint Venture Partner" },
  { id: "dlf-partner", name: "DLF Project Management", logo: "DP", type: "General Contractor" }
];

export default function PremiumTopNavigation() {
  const { 
    activeProject, 
    setActiveProject, 
    searchQuery, 
    setSearchQuery,
    activeTab,
    setActiveTab,
    isTracProgressMode,
    setIsTracProgressMode,
    showLandingPage,
    setShowLandingPage
  } = useAppStore();

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || 
             document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const [activeOrg, setActiveOrg] = useState(ORGANIZATIONS[0]);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Keyboard shortcut listener for Ctrl+K search focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Handle AI Consultation
  const handleConsultGemini = async (promptText: string = aiPrompt) => {
    if (!promptText.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customQuestion: promptText,
          context: {
            location: activeProject.location,
            elementType: "Structural Concrete & BIM Coordination",
          }
        })
      });
      const data = await res.json();
      setAiResponse(data.report);
    } catch (err: any) {
      setAiResponse(`Failed to contact tracprogress AI Assistant: ${err.message || err}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Preset Questions
  const PRESETS = [
    "Assess RERA project slippage risks for " + activeProject.name,
    "How to synchronize custom IFC parameters with laser point-clouds?",
    "Generate concrete pouring quality control protocol",
    "List typical compliance penalties for delay in milestone updates"
  ];

  // Dummy notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: "error", title: "Structural Rebar Spacing Discrepancy", desc: "Drone Photo Scan #88 flagged critical deviation in Column C4.", time: "10 mins ago", read: false },
    { id: 2, type: "warning", title: "HVAC Conduit Collision Detected", desc: "3D Clash Solver flagged a collision on Floor 1, Zone B.", time: "2 hours ago", read: false },
    { id: 3, type: "success", title: "RERA Milestone Approved", desc: "Foundation slab photogrammetry logs accepted by compliance office.", time: "1 day ago", read: true },
    { id: 4, type: "info", title: "S-Curve Metric Recalculated", desc: "Overall progress variance updated based on structural concrete volumes.", time: "2 days ago", read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className={`h-16 border-b shrink-0 flex items-center justify-between px-6 z-30 transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
      isTracProgressMode 
        ? "bg-slate-900 border-slate-800 text-slate-100" 
        : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800"
    }`}>
      
      {/* LEFT SECTION: Organization & Project Selector */}
      <div className="flex items-center gap-3">
        
        {/* Organization Switcher Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button 
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition duration-200 cursor-pointer ${
                isTracProgressMode 
                  ? "bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-900" 
                  : "bg-slate-50/50 hover:bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-800/40 dark:border-slate-800 dark:hover:bg-slate-800"
              }`}
              aria-label="Switch Organization"
            >
              <div className="w-5 h-5 rounded bg-indigo-600 dark:bg-indigo-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-sm select-none">
                {activeOrg.logo}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-none">
                  {activeOrg.name}
                </span>
                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                  {activeOrg.type}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-1" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="w-56 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 animate-fade-in"
              sideOffset={5}
              align="start"
            >
              <DropdownMenu.Label className="px-2.5 py-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider">
                Select Workspace Enterprise
              </DropdownMenu.Label>
              {ORGANIZATIONS.map(org => (
                <DropdownMenu.Item 
                  key={org.id}
                  onClick={() => setActiveOrg(org)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer outline-none transition"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5.5 h-5.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {org.logo}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">{org.name}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">{org.type}</span>
                    </div>
                  </div>
                  {activeOrg.id === org.id && (
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Divider */}
        <span className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Project Selector Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition duration-200 cursor-pointer bg-indigo-50/40 hover:bg-indigo-50/90 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/40 max-w-[200px] sm:max-w-[280px]"
              aria-label="Switch Project"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 truncate leading-none font-mono">
                  {activeProject.name}
                </span>
                <span className="text-[8px] text-indigo-500 dark:text-indigo-400 truncate mt-0.5 font-sans">
                  {activeProject.location.split(",")[0]}, India
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-500 ml-1 shrink-0" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="w-72 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 animate-fade-in"
              sideOffset={5}
              align="start"
            >
              <DropdownMenu.Label className="px-2.5 py-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider">
                Active Construction Twins (RERA)
              </DropdownMenu.Label>
              {PROJECTS_DB.map(proj => (
                <DropdownMenu.Item 
                  key={proj.id}
                  onClick={() => setActiveProject(proj)}
                  className="flex items-start justify-between p-2.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer outline-none transition mb-1"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-xs block truncate">
                      {proj.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      {proj.location}
                    </span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-500 dark:text-slate-400 border border-slate-150 dark:border-slate-700">
                        Budget: {proj.totalCost}
                      </span>
                      <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold">
                        {proj.overallProgress}% Done
                      </span>
                    </div>
                  </div>
                  {activeProject.id === proj.id && (
                    <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
                  )}
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />
              <DropdownMenu.Item 
                onClick={() => setActiveTab("projects")}
                className="flex items-center justify-center p-2 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 cursor-pointer text-center font-mono uppercase tracking-wide transition"
              >
                View Infrastructure Portfolio Directory →
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* MIDDLE SECTION: Search Box */}
      <div className="flex-1 max-w-sm mx-8 hidden md:block">
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search elements, anomalies, logs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:focus:bg-slate-900 dark:focus:border-indigo-500 transition-all font-sans"
            aria-label="Search Workspace"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-150 border border-slate-200/60 rounded text-[9px] font-mono font-bold text-slate-400 dark:bg-slate-800 dark:border-slate-700/80 dark:text-slate-500 select-none">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* RIGHT SECTION: Controls, Notifications, Help, Dark Mode, AI Assistant, Profile */}
      <div className="flex items-center gap-2.5">
        
        {/* Dynamic tracprogress® Mode Switcher */}
        <button 
          onClick={() => setIsTracProgressMode(!isTracProgressMode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wide flex items-center gap-1.5 transition border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
            isTracProgressMode 
              ? "bg-slate-950 border-indigo-500/50 text-indigo-400 hover:bg-slate-900" 
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800/20 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          }`}
          title="Toggle UI/UX between tracprogress & tracprogress®"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{isTracProgressMode ? "TRACPROGRESS® PRO LAYOUT" : "TRACPROGRESS® CORE LAYOUT"}</span>
          <span className="lg:hidden">{isTracProgressMode ? "TRACPROGRESS® PRO" : "TRACPROGRESS®"}</span>
        </button>

        {/* Return to marketing homepage */}
        <button 
          onClick={() => setShowLandingPage(true)}
          className={`w-8.5 h-8.5 rounded-lg border flex items-center justify-center transition cursor-pointer ${
            isTracProgressMode
              ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"
              : "text-slate-600 dark:text-slate-350 bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800/20 dark:border-slate-800 dark:hover:bg-slate-800"
          }`}
          title="Return to tracprogress.com marketing page"
        >
          <Home className="w-4 h-4" />
        </button>

        {/* AI Assistant Trigger Button (Glow Accent) */}
        <button 
          onClick={() => setAiAssistantOpen(true)}
          className="relative px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-black font-mono tracking-wide shadow-md hover:bg-indigo-700 transition flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0 fill-yellow-300 animate-pulse" />
          <span>BUILDTRACE AI</span>
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
        </button>

        {/* Dark Mode Toggle */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="w-8.5 h-8.5 rounded-lg border flex items-center justify-center transition cursor-pointer text-slate-600 dark:text-slate-350 bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800/20 dark:border-slate-800 dark:hover:bg-slate-800"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Help Popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button 
              className="w-8.5 h-8.5 rounded-lg border flex items-center justify-center transition cursor-pointer text-slate-600 dark:text-slate-350 bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800/20 dark:border-slate-800 dark:hover:bg-slate-800"
              aria-label="View Help Articles"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </Popover.Trigger>
          
          <Popover.Portal>
            <Popover.Content 
              className="w-80 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 animate-fade-in text-xs text-slate-700 dark:text-slate-300"
              sideOffset={5}
              align="end"
            >
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-850">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wide text-xs">Help Desk & Knowledge Base</span>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px] mb-1">🔍 Photogrammetry Accuracy</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                    BuildTrace utilizes DJI UAV drone orthomosaics synchronized with the coordinate system (UTM Zone 43N) matching precision margins to ±15mm.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px] mb-1">📝 RERA Safe Guards</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                    Under Indian Real Estate Regulatory Authority laws, actual progress audits must align strictly with approved quarterly schedules.
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800 flex flex-col gap-1">
                  <span className="font-bold text-[9px] text-indigo-600 dark:text-indigo-400 font-mono uppercase">System Hotkeys</span>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>Focus Search</span>
                    <kbd className="bg-white dark:bg-slate-800 border px-1 rounded font-sans font-bold">Ctrl + K</kbd>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Ask Gemini</span>
                    <kbd className="bg-white dark:bg-slate-800 border px-1 rounded font-sans font-bold">Click AI Button</kbd>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 text-center">
                <button 
                  onClick={() => setActiveTab("prd")}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Read Platform Specs & PRD Documentation →
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Notifications Popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button 
              className="w-8.5 h-8.5 rounded-lg border flex items-center justify-center relative transition cursor-pointer text-slate-600 dark:text-slate-350 bg-white border-slate-200 hover:bg-slate-50 dark:bg-slate-800/20 dark:border-slate-800 dark:hover:bg-slate-800"
              aria-label="View Notifications Feed"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-sm select-none">
                  {unreadCount}
                </span>
              )}
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content 
              className="w-80 p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in"
              sideOffset={5}
              align="end"
            >
              <div className="p-3.5 border-b border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono uppercase tracking-wide">Telemetry Warnings Feed</span>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                {notifications.map(n => (
                  <div 
                    key={n.id}
                    className={`p-3 text-xs leading-relaxed transition ${n.read ? "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400" : "bg-indigo-50/20 dark:bg-indigo-950/10 text-slate-800 dark:text-slate-200"}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {n.type === "error" && <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                      {n.type === "warning" && <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      {n.type === "success" && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      {n.type === "info" && <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{n.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
                      {n.desc}
                    </p>
                    <div className="flex justify-between items-center mt-1.5 pl-5">
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono">{n.time}</span>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-center">
                <button 
                  onClick={() => setActiveTab("notifications")}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline w-full py-1 block"
                >
                  View Full Stream Telemetry Logs
                </button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Profile Avatar Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button 
              className="flex items-center gap-2 pl-1 cursor-pointer focus:outline-none"
              aria-label="User Profile Options"
            >
              <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center border-2 border-white dark:border-slate-850 shadow-md select-none">
                SC
              </div>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="w-60 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 animate-fade-in"
              sideOffset={5}
              align="end"
            >
              <div className="px-2.5 py-3 border-b border-slate-100 dark:border-slate-850 flex flex-col gap-0.5">
                <span className="font-black text-slate-900 dark:text-slate-100 text-xs">Siddharth Chitiki</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono truncate">sidduchitiki@gmail.com</span>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/40 px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase tracking-wide">
                    Staff Operator
                  </span>
                  <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[8px] font-bold font-mono">
                    L3 Admin
                  </span>
                </div>
              </div>

              <div className="p-1">
                <DropdownMenu.Item 
                  onClick={() => setActiveTab("settings")}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer outline-none transition"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Workspace Preferences</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  onClick={() => setActiveTab("users")}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer outline-none transition"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Authorization Matrix</span>
                </DropdownMenu.Item>
              </div>

              <DropdownMenu.Separator className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />
              
              <div className="p-1">
                <DropdownMenu.Item 
                  onClick={() => alert("Enterprise session secured. Local token cleared.")}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer outline-none transition"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span className="font-semibold">Clear Session Cache</span>
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* --- AI ASSISTANT SHEET DIALOG --- */}
      <Dialog.Root open={aiAssistantOpen} onOpenChange={setAiAssistantOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50" />
          
          <Dialog.Content className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-6 flex flex-col gap-4 focus:outline-none animate-slide-in">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 dark:bg-indigo-950/60 p-1.5 rounded-lg">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400 animate-pulse fill-indigo-100 dark:fill-indigo-950/60" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wide">
                    BuildTrace AI Expert Desk
                  </h2>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono leading-none">
                    Powered by Google Gemini 3.5 Flash
                  </span>
                </div>
              </div>
              <Dialog.Close asChild>
                <button 
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-md text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 cursor-pointer transition"
                  aria-label="Close Assistant Panel"
                >
                  ESC CLOSE
                </button>
              </Dialog.Close>
            </div>

            {/* Scrollable Response Container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin text-xs text-slate-700 dark:text-slate-300">
              
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800/80">
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono tracking-wider">Contextual Project Anchor</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 font-mono text-[11.5px]">
                  {activeProject.name}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Area: {activeProject.constructionArea}</span>
                  <span>•</span>
                  <span>Target: {activeProject.targetDate}</span>
                  <span>•</span>
                  <span>Overall S-Curve: {activeProject.overallProgress}%</span>
                </div>
              </div>

              {/* Chat Log */}
              <div className="space-y-4">
                
                {/* System Greeting */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
                    AI
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 max-w-[85%] leading-relaxed">
                    <p className="font-semibold text-slate-850 dark:text-slate-200 text-[11px]">
                      Greetings Siddharth! I am your BuildTrace AI compliance and engineering companion.
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-[10.5px]">
                      I have analyzed the photogrammetry orthomosaics and RERA milestone scheduling. You can ask me to compile safety protocols, audit risk factors, or advice on spatial clash remediations.
                    </p>
                  </div>
                </div>

                {/* Interactive Consultation Results */}
                {aiResponse && (
                  <div className="flex items-start gap-2.5 mt-4">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
                      AI
                    </div>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-xl max-w-[85%] leading-relaxed font-sans shadow-xl border border-indigo-950">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                        <span className="text-[8px] font-bold text-indigo-400 font-mono uppercase tracking-widest">Inference Response</span>
                        <span className="text-[8px] text-slate-500 font-mono">Gemini-3.5-Flash</span>
                      </div>
                      <div className="text-[11px] space-y-2 whitespace-pre-wrap font-sans text-slate-200">
                        {aiResponse}
                      </div>
                    </div>
                  </div>
                )}

                {aiLoading && (
                  <div className="flex items-center gap-2 justify-center py-8 text-slate-400 font-mono text-[10px]">
                    <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span>Inference query active on Gemini...</span>
                  </div>
                )}

              </div>

            </div>

            {/* Quick Questions Pre-sets */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider block mb-2">
                Quick Consult Presets
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAiPrompt(preset);
                      handleConsultGemini(preset);
                    }}
                    className="text-left text-[10.5px] p-2 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-850 dark:hover:bg-indigo-950/20 rounded-lg text-slate-700 dark:text-slate-350 hover:text-indigo-900 dark:hover:text-indigo-300 border border-slate-200/40 hover:border-indigo-200 dark:border-slate-800 cursor-pointer transition truncate font-mono"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Input Area */}
            <div className="border-t border-slate-150 dark:border-slate-800 pt-3 flex gap-2">
              <input
                type="text"
                placeholder="Ask BuildTrace AI compliance guidelines..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConsultGemini();
                }}
                className="flex-1 px-3 py-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition"
              />
              <button
                onClick={() => handleConsultGemini()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer transition flex items-center justify-center gap-1 shrink-0"
              >
                <span>Ask AI</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </header>
  );
}
