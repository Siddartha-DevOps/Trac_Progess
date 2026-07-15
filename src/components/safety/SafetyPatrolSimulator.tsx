import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Video, 
  VideoOff, 
  Cpu, 
  Activity, 
  AlertOctagon, 
  Flame, 
  Clock, 
  Eye, 
  CheckCircle2, 
  FileText, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Send, 
  Volume2, 
  VolumeX, 
  Compass, 
  Grid, 
  Layers, 
  User, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ClipboardCheck,
  Zap,
  Check
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

// Interfaces for our simulator state
interface CVBoundingBox {
  id: string;
  label: string;
  confidence: number;
  type: "PPE-Helmet" | "PPE-Vest" | "PPE-Harness" | "Hazard-Barrier" | "Behavior-Risk" | "Hazard-Material";
  status: "OK" | "WARNING" | "VIOLATION";
  x: number; // percent left
  y: number; // percent top
  w: number; // percent width
  h: number; // percent height
  workerName?: string;
  trade?: string;
}

interface PatrolStream {
  id: string;
  name: string;
  type: "CCTV" | "Drone" | "Wearable" | "Mobile" | "Fixed";
  location: string;
  resolution: string;
  status: "Online" | "Offline" | "Patrolling" | "Critical";
  signalStrength: number; // 0-100
  fps: number;
  inferenceTimeMs: number;
  url: string;
  battery?: number; // for Drone/Wearable
  gpsCoords?: string;
  boxes: CVBoundingBox[];
  complianceScore: number;
  activeViolations: number;
  windSpeed: number;
  checklist: Array<{ id: string; text: string; status: "Pass" | "Fail" }>;
}

const STREAM_REGISTRY: PatrolStream[] = [
  {
    id: "zone-lvl1-foundation",
    name: "Level 1 Foundation",
    type: "Mobile",
    location: "Sector A - Subgrade Slab",
    resolution: "1920x1080 (HD)",
    status: "Online",
    signalStrength: 92,
    fps: 30,
    inferenceTimeMs: 12.5,
    url: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=1200&q=80",
    boxes: [
      { id: "box-f1", label: "Helmet OK", confidence: 98.2, type: "PPE-Helmet", status: "OK", x: 28, y: 22, w: 10, h: 10, workerName: "Anil Sharma", trade: "Concrete Mason" },
      { id: "box-f2", label: "High-Vis Vest OK", confidence: 97.1, type: "PPE-Vest", status: "OK", x: 26, y: 32, w: 14, h: 22, workerName: "Anil Sharma", trade: "Concrete Mason" },
      { id: "box-f3", label: "Trench Boundary Warning", confidence: 94.0, type: "Hazard-Barrier", status: "WARNING", x: 45, y: 60, w: 30, h: 25 }
    ],
    complianceScore: 96.5,
    activeViolations: 0,
    windSpeed: 12,
    checklist: [
      { id: "chk-f1", text: "All shoring struts secured in subgrade excavations", status: "Pass" },
      { id: "chk-f2", text: "Heavy excavating machinery operators licensed", status: "Pass" },
      { id: "chk-f3", text: "Perimeter safety flags installed along deep trench edges", status: "Pass" },
      { id: "chk-f4", text: "Water level monitoring active in subgrade pump shafts", status: "Pass" }
    ]
  },
  {
    id: "zone-lvl2-columns",
    name: "Level 2 Columns",
    type: "CCTV",
    location: "Sector B - Structural Framing",
    resolution: "3840x2160 (4K)",
    status: "Critical",
    signalStrength: 97,
    fps: 30,
    inferenceTimeMs: 9.1,
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    boxes: [
      { id: "box-c1", label: "Exposed Rebar Cap Missing", confidence: 95.4, type: "Hazard-Material", status: "VIOLATION", x: 55, y: 35, w: 15, h: 18 },
      { id: "box-c2", label: "Column Formwork Braced", confidence: 98.9, type: "Hazard-Barrier", status: "OK", x: 15, y: 40, w: 20, h: 45 },
      { id: "box-c3", label: "Helmet Detected", confidence: 99.0, type: "PPE-Helmet", status: "OK", x: 38, y: 15, w: 8, h: 8, workerName: "Amit Sen", trade: "Carpenter" }
    ],
    complianceScore: 92.4,
    activeViolations: 1,
    windSpeed: 15,
    checklist: [
      { id: "chk-c1", text: "Exposed starter-bars capped with high-vis mushrooms", status: "Fail" },
      { id: "chk-c2", text: "Column formwork anchors double-locked", status: "Pass" },
      { id: "chk-c3", text: "Structural bracing angles inspected and certified", status: "Pass" },
      { id: "chk-c4", text: "Concrete mold moisture content levels within limits", status: "Pass" }
    ]
  },
  {
    id: "zone-lvl3-slab",
    name: "Level 3 Slab",
    type: "Wearable",
    location: "Sector A - Deck Concrete Pour",
    resolution: "1920x1080 (HD)",
    status: "Online",
    signalStrength: 89,
    fps: 30,
    inferenceTimeMs: 14.3,
    url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80",
    boxes: [
      { id: "box-s1", label: "Safety Boots Missing", confidence: 96.7, type: "Behavior-Risk", status: "VIOLATION", x: 32, y: 65, w: 12, h: 20, workerName: "Rajesh Kumar", trade: "Concrete Pourer" },
      { id: "box-s2", label: "Concrete Pump Hose OK", confidence: 97.2, type: "Hazard-Material", status: "OK", x: 50, y: 30, w: 15, h: 40 },
      { id: "box-s3", label: "PPE: Helmet OK", confidence: 98.1, type: "PPE-Helmet", status: "OK", x: 34, y: 12, w: 8, h: 8, workerName: "Rajesh Kumar", trade: "Concrete Pourer" }
    ],
    complianceScore: 90.1,
    activeViolations: 1,
    windSpeed: 18,
    checklist: [
      { id: "chk-s1", text: "All wet concrete pour personnel wearing tall steel-toe boots", status: "Fail" },
      { id: "chk-s2", text: "Concrete mixer truck safety backup alarm functional", status: "Pass" },
      { id: "chk-s3", text: "Boom pump safety chain and cable tether installed", status: "Pass" },
      { id: "chk-s4", text: "Sub-deck shoring structure verified load-ready", status: "Pass" }
    ]
  },
  {
    id: "zone-tower-crane",
    name: "Tower Crane",
    type: "Fixed",
    location: "Overhead - Mast & Cabin Deck",
    resolution: "3840x2160 (4K)",
    status: "Online",
    signalStrength: 99,
    fps: 24,
    inferenceTimeMs: 11.2,
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    boxes: [
      { id: "box-tc1", label: "Unsecured Crane Hook Load", confidence: 95.8, type: "Behavior-Risk", status: "WARNING", x: 35, y: 40, w: 25, h: 30 },
      { id: "box-tc2", label: "Wind Vane Sensor OK", confidence: 99.5, type: "Hazard-Material", status: "OK", x: 10, y: 15, w: 10, h: 10 },
      { id: "box-tc3", label: "PPE: Helmet & Harness OK", confidence: 97.8, type: "PPE-Helmet", status: "OK", x: 75, y: 32, w: 8, h: 12, workerName: "Sanjay Dutt", trade: "Crane Rigger" }
    ],
    complianceScore: 95.0,
    activeViolations: 0,
    windSpeed: 32,
    checklist: [
      { id: "chk-tc1", text: "Wind speeds below critical cabin limits (35 km/h)", status: "Pass" },
      { id: "chk-tc2", text: "Dual tag-lines attached to all crane flight loads", status: "Pass" },
      { id: "chk-tc3", text: "Automatic rotation siren warning fully active", status: "Pass" },
      { id: "chk-tc4", text: "Crane hook safety latch latching completely", status: "Pass" }
    ]
  },
  {
    id: "zone-scaffolding",
    name: "Scaffolding",
    type: "CCTV",
    location: "Block A - West Facade Lift",
    resolution: "3840x2160 (4K)",
    status: "Critical",
    signalStrength: 95,
    fps: 30,
    inferenceTimeMs: 8.5,
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    boxes: [
      { id: "box-sc1", label: "PPE: Harness Missing", confidence: 99.1, type: "PPE-Harness", status: "VIOLATION", x: 25, y: 22, w: 12, h: 32, workerName: "Anil Sharma", trade: "Facade Erector" },
      { id: "box-sc2", label: "Unlocked Deck Floorboard", confidence: 93.5, type: "Hazard-Material", status: "WARNING", x: 50, y: 45, w: 30, h: 10 },
      { id: "box-sc3", label: "Structural Anchor OK", confidence: 97.4, type: "Hazard-Barrier", status: "OK", x: 12, y: 10, w: 15, h: 18 }
    ],
    complianceScore: 82.5,
    activeViolations: 1,
    windSpeed: 16,
    checklist: [
      { id: "chk-sc1", text: "Scaffold structural planks fully decked and locked", status: "Fail" },
      { id: "chk-sc2", text: "Workers tethered continuously to life safety line", status: "Fail" },
      { id: "chk-sc3", text: "Base jacks and sole plates leveled on solid soil", status: "Pass" },
      { id: "chk-sc4", text: "Safety toe-boards installed on all operational tiers", status: "Pass" }
    ]
  },
  {
    id: "zone-material-yard",
    name: "Material Yard",
    type: "Drone",
    location: "South Compound - Storage Lot",
    resolution: "1920x1080 (HD)",
    status: "Patrolling",
    signalStrength: 87,
    fps: 60,
    inferenceTimeMs: 13.1,
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    boxes: [
      { id: "box-my1", label: "Unsecured Steel Tube Stack", confidence: 95.0, type: "Hazard-Material", status: "VIOLATION", x: 15, y: 40, w: 25, h: 20 },
      { id: "box-my2", label: "Fire Extinguisher Access Blocked", confidence: 96.2, type: "Hazard-Barrier", status: "VIOLATION", x: 60, y: 55, w: 12, h: 18 },
      { id: "box-my3", label: "High-Vis Vest OK", confidence: 98.4, type: "PPE-Vest", status: "OK", x: 42, y: 25, w: 8, h: 15, workerName: "John Doe", trade: "Logistics Clerk" }
    ],
    complianceScore: 78.8,
    activeViolations: 2,
    windSpeed: 14,
    checklist: [
      { id: "chk-my1", text: "Emergency fire extinguisher paths completely clear", status: "Fail" },
      { id: "chk-my2", text: "Stacked steel materials stable with choke locks", status: "Fail" },
      { id: "chk-my3", text: "Forklift travel lanes marked with high-vis yellow paint", status: "Pass" },
      { id: "chk-my4", text: "Hazardous chemicals isolated in secure locked cages", status: "Pass" }
    ]
  },
  {
    id: "zone-excavation",
    name: "Excavation",
    type: "Drone",
    location: "West Zone - Deep Sewer Trench",
    resolution: "1920x1080 (HD)",
    status: "Patrolling",
    signalStrength: 84,
    fps: 60,
    inferenceTimeMs: 12.8,
    url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80",
    boxes: [
      { id: "box-ex1", label: "Missing Perimeter Guardrail", confidence: 97.9, type: "Hazard-Barrier", status: "VIOLATION", x: 10, y: 48, w: 40, h: 12 },
      { id: "box-ex2", label: "Excavator Swing Swing Circle", confidence: 94.2, type: "Hazard-Barrier", status: "WARNING", x: 55, y: 35, w: 25, h: 30 },
      { id: "box-ex3", label: "PPE: Helmet OK", confidence: 99.0, type: "PPE-Helmet", status: "OK", x: 78, y: 18, w: 8, h: 8, workerName: "Harish Naik", trade: "Excavator Operator" }
    ],
    complianceScore: 85.2,
    activeViolations: 1,
    windSpeed: 11,
    checklist: [
      { id: "chk-ex1", text: "Trench excavation shoring / trench-shield matches depth", status: "Pass" },
      { id: "chk-ex2", text: "Spoils pile positioned at least 1.2m away from trench lip", status: "Pass" },
      { id: "chk-ex3", text: "Protective fall guard barriers fully surrounding pit", status: "Fail" },
      { id: "chk-ex4", text: "Safe egress ladders installed every 7.5m in trench", status: "Pass" }
    ]
  },
  {
    id: "zone-mep-corridor",
    name: "MEP Corridor",
    type: "Wearable",
    location: "Level 1 - HVAC Shaft Corridor",
    resolution: "1920x1080 (HD)",
    status: "Online",
    signalStrength: 91,
    fps: 30,
    inferenceTimeMs: 11.4,
    url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=1200&q=80",
    boxes: [
      { id: "box-mep1", label: "Exposed Electrical Wire Core", confidence: 98.5, type: "Hazard-Material", status: "VIOLATION", x: 25, y: 65, w: 18, h: 12 },
      { id: "box-mep2", label: "High temp pipe insulated", confidence: 93.0, type: "Hazard-Barrier", status: "OK", x: 60, y: 20, w: 20, h: 30 },
      { id: "box-mep3", label: "PPE: Welder Mask OK", confidence: 97.1, type: "PPE-Helmet", status: "OK", x: 42, y: 15, w: 10, h: 10, workerName: "Vijay Yadav", trade: "HSE Welder" }
    ],
    complianceScore: 89.6,
    activeViolations: 1,
    windSpeed: 0,
    checklist: [
      { id: "chk-mep1", text: "Temp electrical cables sleeved & hung overhead", status: "Fail" },
      { id: "chk-mep2", text: "Welding cylinders stood vertically and chain-strapped", status: "Pass" },
      { id: "chk-mep3", text: "Welding heat shields / fire blanket deployed", status: "Pass" },
      { id: "chk-mep4", text: "HVAC duct hanger brackets load tested", status: "Pass" }
    ]
  },
  {
    id: "zone-roof",
    name: "Roof",
    type: "CCTV",
    location: "Level 12 - Deck Edge Perimeter",
    resolution: "3840x2160 (4K)",
    status: "Online",
    signalStrength: 96,
    fps: 30,
    inferenceTimeMs: 8.9,
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
    boxes: [
      { id: "box-r1", label: "Lifeline Harness Hook OK", confidence: 98.9, type: "PPE-Harness", status: "OK", x: 42, y: 40, w: 15, h: 30, workerName: "Rakesh Sen", trade: "Roofer" },
      { id: "box-r2", label: "Rooftop Edge Kick-board Missing", confidence: 96.5, type: "Hazard-Barrier", status: "VIOLATION", x: 70, y: 75, w: 20, h: 10 },
      { id: "box-r3", label: "PPE: Helmet Detected", confidence: 99.3, type: "PPE-Helmet", status: "OK", x: 44, y: 18, w: 8, h: 10, workerName: "Rakesh Sen", trade: "Roofer" }
    ],
    complianceScore: 91.2,
    activeViolations: 1,
    windSpeed: 29,
    checklist: [
      { id: "chk-r1", text: "Perimeter visual warning line and toe-boards present", status: "Fail" },
      { id: "chk-r2", text: "All roofers continuously clipped into 10kN anchors", status: "Pass" },
      { id: "chk-r3", text: "High wind warning active for roofing sheeting tasks", status: "Pass" },
      { id: "chk-r4", text: "Sky-light cutouts securely boarded & labeled", status: "Pass" }
    ]
  },
  {
    id: "zone-parking",
    name: "Parking",
    type: "Mobile",
    location: "Basement L1 - Utility Trench Section",
    resolution: "1920x1080 (HD)",
    status: "Online",
    signalStrength: 88,
    fps: 24,
    inferenceTimeMs: 15.0,
    url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80",
    boxes: [
      { id: "box-p1", label: "Trench Open Floor Conduit", confidence: 97.0, type: "Hazard-Material", status: "VIOLATION", x: 30, y: 65, w: 40, h: 15 },
      { id: "box-p2", label: "Sump Pool Water Spill", confidence: 94.5, type: "Hazard-Material", status: "WARNING", x: 10, y: 45, w: 18, h: 12 },
      { id: "box-p3", label: "PPE: Steel Cap Boots OK", confidence: 98.2, type: "PPE-Vest", status: "OK", x: 65, y: 30, w: 10, h: 30, workerName: "Dinesh Jha", trade: "Conduit Hand" }
    ],
    complianceScore: 92.0,
    activeViolations: 1,
    windSpeed: 0,
    checklist: [
      { id: "chk-p1", text: "Basement temporary power cables suspended off floor", status: "Fail" },
      { id: "chk-p2", text: "Carbon monoxide ventilation systems operational", status: "Pass" },
      { id: "chk-p3", text: "Heavy drainage sump pits fenced & covered", status: "Pass" },
      { id: "chk-p4", text: "Lighting lumens conform to OSHA basement rules", status: "Pass" }
    ]
  },
  {
    id: "zone-warehouse",
    name: "Warehouse",
    type: "Fixed",
    location: "Logistics Sector - Storage Bays",
    resolution: "2560x1440 (2K)",
    status: "Online",
    signalStrength: 94,
    fps: 30,
    inferenceTimeMs: 10.1,
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    boxes: [
      { id: "box-w1", label: "Forklift Beacon Active", confidence: 98.5, type: "Behavior-Risk", status: "OK", x: 15, y: 45, w: 20, h: 35 },
      { id: "box-w2", label: "Top-heavy pallet overhang", confidence: 94.2, type: "Hazard-Material", status: "WARNING", x: 45, y: 20, w: 15, h: 25 },
      { id: "box-w3", label: "HSE Exit Route Marker OK", confidence: 99.3, type: "Hazard-Barrier", status: "OK", x: 75, y: 15, w: 10, h: 12 }
    ],
    complianceScore: 97.4,
    activeViolations: 0,
    windSpeed: 0,
    checklist: [
      { id: "chk-w1", text: "Forklift pedestrian walkways highly visible", status: "Pass" },
      { id: "chk-w2", text: "Industrial storage racks bolted to slab foundation", status: "Pass" },
      { id: "chk-w3", text: "Pallets stacked stable without high lean metrics", status: "Pass" },
      { id: "chk-w4", text: "Automatic loading dock safety lockpins attached", status: "Pass" }
    ]
  }
];

interface SimulatedWorker {
  id: string;
  name: string;
  trade: string;
  helmet: "OK" | "MISSING" | "N/A";
  vest: "OK" | "MISSING" | "N/A";
  harness: "OK" | "MISSING" | "N/A";
  state: "Normal" | "Entering Restricted Zone" | "Near Machinery" | "Working";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
}

const getConfidence = (workerId: string): number => {
  const sum = workerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 95 + (sum % 5); // stable 95% - 99%
};

const getWorkerDistance = (worker: SimulatedWorker): string => {
  const avgX = (worker.startX + worker.endX) / 2;
  const avgY = (worker.startY + worker.endY) / 2;
  const distVal = Math.sqrt(Math.pow(avgX - 50, 2) + Math.pow(avgY - 50, 2)) * 0.15 + 1.2;
  return `${distVal.toFixed(1)}m`;
};

const getWorkerComplianceStatus = (worker: SimulatedWorker) => {
  const hasViolation = worker.helmet === "MISSING" || worker.vest === "MISSING" || worker.harness === "MISSING";
  const isRestricted = worker.state === "Entering Restricted Zone";
  const isMachinery = worker.state === "Near Machinery";

  if (hasViolation || isRestricted) {
    return {
      status: "Violation" as const,
      color: "#ef4444", // Red
      borderClass: "border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse",
      textClass: "text-red-400",
      badgeClass: "bg-red-950/80 border-red-800 text-red-400",
      label: isRestricted ? "Restricted Zone Entry" : "PPE Violation"
    };
  } else if (isMachinery) {
    return {
      status: "Warning" as const,
      color: "#f59e0b", // Yellow
      borderClass: "border-yellow-500 bg-yellow-500/10 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
      textClass: "text-yellow-400",
      badgeClass: "bg-yellow-950/80 border-yellow-800 text-yellow-400",
      label: "Machinery Proximity"
    };
  } else {
    return {
      status: "Compliant" as const,
      color: "#10b981", // Green
      borderClass: "border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
      textClass: "text-emerald-400",
      badgeClass: "bg-emerald-950/80 border-emerald-800 text-emerald-400",
      label: "Compliant Position"
    };
  }
};

const SIMULATED_WORKERS_MAP: Record<string, SimulatedWorker[]> = {
  "zone-lvl1-foundation": [
    {
      id: "worker-f1",
      name: "Anil Sharma",
      trade: "Concrete Mason",
      helmet: "OK",
      vest: "OK",
      harness: "N/A",
      state: "Working",
      startX: 22,
      startY: 28,
      endX: 35,
      endY: 30,
      duration: 10
    },
    {
      id: "worker-f2",
      name: "Vicky Kaushal",
      trade: "Excavator Helper",
      helmet: "MISSING",
      vest: "OK",
      harness: "N/A",
      state: "Entering Restricted Zone",
      startX: 65,
      startY: 55,
      endX: 48,
      endY: 62,
      duration: 8
    }
  ],
  "zone-lvl2-columns": [
    {
      id: "worker-c1",
      name: "Amit Sen",
      trade: "Carpenter",
      helmet: "OK",
      vest: "MISSING",
      harness: "N/A",
      state: "Working",
      startX: 32,
      startY: 45,
      endX: 42,
      endY: 40,
      duration: 12
    },
    {
      id: "worker-c2",
      name: "Rohan Mehra",
      trade: "Steel Fixer",
      helmet: "OK",
      vest: "OK",
      harness: "MISSING",
      state: "Near Machinery",
      startX: 58,
      startY: 48,
      endX: 52,
      endY: 58,
      duration: 9
    }
  ],
  "zone-lvl3-slab": [
    {
      id: "worker-s1",
      name: "Rajesh Kumar",
      trade: "Concrete Pourer",
      helmet: "OK",
      vest: "OK",
      harness: "N/A",
      state: "Working",
      startX: 28,
      startY: 32,
      endX: 36,
      endY: 38,
      duration: 14
    },
    {
      id: "worker-s2",
      name: "Suresh Patil",
      trade: "Laborer",
      helmet: "MISSING",
      vest: "MISSING",
      harness: "N/A",
      state: "Entering Restricted Zone",
      startX: 68,
      startY: 42,
      endX: 52,
      endY: 52,
      duration: 11
    }
  ],
  "zone-tower-crane": [
    {
      id: "worker-tc1",
      name: "Sanjay Dutt",
      trade: "Crane Rigger",
      helmet: "OK",
      vest: "OK",
      harness: "OK",
      state: "Working",
      startX: 72,
      startY: 38,
      endX: 76,
      endY: 34,
      duration: 15
    },
    {
      id: "worker-tc2",
      name: "Vinay Pathak",
      trade: "Assistant Operator",
      helmet: "OK",
      vest: "MISSING",
      harness: "MISSING",
      state: "Near Machinery",
      startX: 24,
      startY: 28,
      endX: 32,
      endY: 35,
      duration: 10
    }
  ],
  "zone-scaffolding": [
    {
      id: "worker-sc1",
      name: "Anil Sharma",
      trade: "Facade Erector",
      helmet: "OK",
      vest: "OK",
      harness: "MISSING",
      state: "Working",
      startX: 24,
      startY: 28,
      endX: 28,
      endY: 24,
      duration: 13
    },
    {
      id: "worker-sc2",
      name: "Pankaj Tripathi",
      trade: "Inspector",
      helmet: "OK",
      vest: "OK",
      harness: "OK",
      state: "Normal",
      startX: 52,
      startY: 48,
      endX: 62,
      endY: 52,
      duration: 12
    }
  ],
  "zone-material-yard": [
    {
      id: "worker-my1",
      name: "John Doe",
      trade: "Logistics Clerk",
      helmet: "MISSING",
      vest: "OK",
      harness: "N/A",
      state: "Near Machinery",
      startX: 38,
      startY: 32,
      endX: 24,
      endY: 38,
      duration: 9
    },
    {
      id: "worker-my2",
      name: "Sarah Connor",
      trade: "Receiving Officer",
      helmet: "OK",
      vest: "MISSING",
      harness: "N/A",
      state: "Entering Restricted Zone",
      startX: 72,
      startY: 58,
      endX: 64,
      endY: 52,
      duration: 11
    }
  ],
  "zone-excavation": [
    {
      id: "worker-ex1",
      name: "Harish Naik",
      trade: "Excavator Operator",
      helmet: "OK",
      vest: "OK",
      harness: "N/A",
      state: "Near Machinery",
      startX: 72,
      startY: 22,
      endX: 76,
      endY: 20,
      duration: 16
    },
    {
      id: "worker-ex2",
      name: "Manoj Bajpayee",
      trade: "Pipelayer",
      helmet: "OK",
      vest: "OK",
      harness: "MISSING",
      state: "Entering Restricted Zone",
      startX: 22,
      startY: 52,
      endX: 42,
      endY: 48,
      duration: 13
    }
  ],
  "zone-mep-corridor": [
    {
      id: "worker-mep1",
      name: "Vijay Yadav",
      trade: "HSE Welder",
      helmet: "OK",
      vest: "OK",
      harness: "N/A",
      state: "Working",
      startX: 40,
      startY: 22,
      endX: 46,
      endY: 18,
      duration: 14
    },
    {
      id: "worker-mep2",
      name: "Nawazuddin Siddiqui",
      trade: "Electrician",
      helmet: "MISSING",
      vest: "OK",
      harness: "N/A",
      state: "Near Machinery",
      startX: 18,
      startY: 52,
      endX: 26,
      endY: 58,
      duration: 8
    }
  ],
  "zone-roof": [
    {
      id: "worker-r1",
      name: "Rakesh Sen",
      trade: "Roofer",
      helmet: "OK",
      vest: "OK",
      harness: "OK",
      state: "Working",
      startX: 40,
      startY: 25,
      endX: 46,
      endY: 34,
      duration: 12
    },
    {
      id: "worker-r2",
      name: "Rajkummar Rao",
      trade: "Supervisor",
      helmet: "MISSING",
      vest: "OK",
      harness: "MISSING",
      state: "Entering Restricted Zone",
      startX: 68,
      startY: 68,
      endX: 74,
      endY: 72,
      duration: 10
    }
  ],
  "zone-parking": [
    {
      id: "worker-p1",
      name: "Dinesh Jha",
      trade: "Conduit Hand",
      helmet: "OK",
      vest: "MISSING",
      harness: "N/A",
      state: "Working",
      startX: 62,
      startY: 38,
      endX: 66,
      endY: 30,
      duration: 11
    },
    {
      id: "worker-p2",
      name: "Abhishek Bachchan",
      trade: "Plumber",
      helmet: "MISSING",
      vest: "MISSING",
      harness: "N/A",
      state: "Near Machinery",
      startX: 16,
      startY: 48,
      endX: 12,
      endY: 44,
      duration: 9
    }
  ],
  "zone-warehouse": [
    {
      id: "worker-w1",
      name: "Bobby Deol",
      trade: "Forklift Driver",
      helmet: "OK",
      vest: "OK",
      harness: "N/A",
      state: "Near Machinery",
      startX: 14,
      startY: 48,
      endX: 20,
      endY: 44,
      duration: 11
    },
    {
      id: "worker-w2",
      name: "Sunny Deol",
      trade: "Loader",
      helmet: "OK",
      vest: "MISSING",
      harness: "N/A",
      state: "Entering Restricted Zone",
      startX: 48,
      startY: 28,
      endX: 40,
      endY: 20,
      duration: 9
    }
  ]
};

export default function SafetyPatrolSimulator() {
  const [selectedStream, setSelectedStream] = useState<PatrolStream>(STREAM_REGISTRY[0]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(STREAM_REGISTRY[0].boxes[0]?.id || null);

  useEffect(() => {
    setComplianceScore(selectedStream.complianceScore);
    setActiveViolations(selectedStream.activeViolations);
    setWindSpeed(selectedStream.windSpeed);
    setChecklist(selectedStream.checklist);

    if (selectedStream.boxes.length > 0) {
      setSelectedBoxId(selectedStream.boxes[0].id);
    } else {
      setSelectedBoxId(null);
    }
  }, [selectedStream]);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);
  const [audioAlertEnabled, setAudioAlertEnabled] = useState(true);
  
  // Custom interactive simulation states
  const [complianceScore, setComplianceScore] = useState(STREAM_REGISTRY[0].complianceScore);
  const [activeViolations, setActiveViolations] = useState(STREAM_REGISTRY[0].activeViolations);
  const [windSpeed, setWindSpeed] = useState(STREAM_REGISTRY[0].windSpeed); // km/h
  const [activeScenario, setActiveScenario] = useState<"none" | "high-wind" | "unauthorized-entry">("none");
  const [isScenarioAlerting, setIsScenarioAlerting] = useState(false);
  const [patrolLogs, setPatrolLogs] = useState<Array<{
    id: string;
    timestamp: string;
    feed: string;
    severity: "Critical" | "Warning" | "Normal";
    event: string;
    status: "Logged" | "Actioned" | "Resolved";
  }>>([
    { id: "LOG-1024", timestamp: "02:18:42", feed: "CCTV Tower 4", severity: "Warning", event: "Exposed vertical rebar hazard on Level 4 structural deck", status: "Logged" },
    { id: "LOG-1023", timestamp: "02:12:15", feed: "Drone Patrol #1", severity: "Critical", event: "Unsecured oxygen-acetylene cylinders in hot work zone Block B", status: "Logged" },
    { id: "LOG-1022", timestamp: "01:54:30", feed: "Supervisor Body-Cam", severity: "Warning", event: "Missing steel-toe boots detected - Subcontractor Masonry crew", status: "Actioned" },
    { id: "LOG-1021", timestamp: "01:10:05", feed: "CCTV Tower 4", severity: "Critical", event: "Active scaffolding work without life-line anchor harness hookup", status: "Resolved" }
  ]);

  // AI Chat Assistant State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; timestamp: string }>>([
    { sender: "ai", text: "Welcome to TracProgress® Safety Co-Pilot. I'm connected to all 11 CV patrol streams. You can ask me to compile safety statistics, outline ISO compliance audits, or check for active hazards.", timestamp: "02:24" }
  ]);

  // Audit checklist signoff state
  const [checklist, setChecklist] = useState(STREAM_REGISTRY[0].checklist);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  // Dynamic charts simulation coordinates
  const [complianceHistory, setComplianceHistory] = useState([
    { time: "01:30", rate: 95.1, alertCount: 1 },
    { time: "01:40", rate: 94.8, alertCount: 2 },
    { time: "01:50", rate: 95.6, alertCount: 1 },
    { time: "02:00", rate: 93.9, alertCount: 3 },
    { time: "02:10", rate: 94.2, alertCount: 2 },
    { time: "02:20", rate: 94.2, alertCount: 2 }
  ]);

  // Handle active scenario updates
  useEffect(() => {
    if (activeScenario === "high-wind") {
      setWindSpeed(42);
      setComplianceScore(81.5);
      setActiveViolations(4);
      setIsScenarioAlerting(true);
      
      // Update checklist to reflect weather failures
      setChecklist(prev => prev.map(c => c.id === "chk-2" ? { ...c, status: "Fail" } : c));

      // Append log
      const newLog = {
        id: `LOG-${Math.floor(Math.random() * 1000) + 1100}`,
        timestamp: new Date().toLocaleTimeString(),
        feed: "Drone Patrol #1",
        severity: "Critical" as const,
        event: "CRITICAL WIND GUSTS DETECTED (42 km/h). Extreme scaffolding lift risk.",
        status: "Logged" as const
      };
      setPatrolLogs(prev => [newLog, ...prev]);

      // Co-pilot proactive suggestion
      setChatMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ HIGH WIND ALARM: Wind speeds have reached 42 km/h. Mobile crane operations and facade cladding are above safety thresholds. Recommended Action: Halt all structural lifts on Wing A scaffolding immediately and anchor loose roof sheeting.",
          timestamp: new Date().toLocaleTimeString().slice(0, 5)
        }
      ]);

    } else if (activeScenario === "unauthorized-entry") {
      setComplianceScore(88.4);
      setActiveViolations(3);
      setIsScenarioAlerting(true);

      const newLog = {
        id: `LOG-${Math.floor(Math.random() * 1000) + 1100}`,
        timestamp: new Date().toLocaleTimeString(),
        feed: "CCTV Tower 4",
        severity: "Critical" as const,
        event: "UNAUTHORIZED PERSONNEL ENTERED: Wing B Concrete Pour Restricted Area without proper sign-in.",
        status: "Logged" as const
      };
      setPatrolLogs(prev => [newLog, ...prev]);

      setChatMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "🚨 RESTRICTED ZONE DETECT: CV Camera 4 spotted an unidentified operator entering the heavy pouring zone behind Column C-12 without induction confirmation. Access control notified.",
          timestamp: new Date().toLocaleTimeString().slice(0, 5)
        }
      ]);
    } else {
      // reset nominals
      setWindSpeed(14);
      setComplianceScore(94.2);
      setActiveViolations(2);
      setIsScenarioAlerting(false);
      setChecklist([
        { id: "chk-1", text: "All personnel on scaffold wear ANSI Z89 helmets", status: "Pass" },
        { id: "chk-2", text: "Edge protection/toeboards installed at slabs higher than 1.8m", status: "Fail" },
        { id: "chk-3", text: "Life-lines anchored correctly with double-action carabiners", status: "Pass" },
        { id: "chk-4", text: "Compressed gas cylinders chained vertically in storage rack", status: "Fail" },
        { id: "chk-5", text: "Dangling electrical extension wiring routed overhead", status: "Pass" }
      ]);
    }
  }, [activeScenario]);

  // Run full CV Patrol Scanning simulation
  const handleStartScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setScanProgress(0);
  };

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanComplete(true);
          
          // Append scan audit log
          const newLog = {
            id: `LOG-${Math.floor(Math.random() * 1000) + 1100}`,
            timestamp: new Date().toLocaleTimeString(),
            feed: selectedStream.name,
            severity: selectedStream.boxes.some(b => b.status === "VIOLATION") ? ("Critical" as const) : ("Normal" as const),
            event: `Autonomous HSE Scan completed. ${selectedStream.boxes.filter(b => b.status === "VIOLATION").length} active violations logged.`,
            status: "Logged" as const
          };
          setPatrolLogs(prevLogs => [newLog, ...prevLogs]);

          // Update compliance history
          setComplianceHistory(prev => [
            ...prev,
            { 
              time: new Date().toLocaleTimeString().slice(0, 5), 
              rate: selectedStream.boxes.some(b => b.status === "VIOLATION") ? 91.5 : 97.4,
              alertCount: selectedStream.boxes.filter(b => b.status === "VIOLATION").length
            }
          ]);

          return 100;
        }
        return prev + 5;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isScanning, selectedStream]);

  // Interactive chatbot responses
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: "user" as const, text: chatInput, timestamp: new Date().toLocaleTimeString().slice(0, 5) };
    setChatMessages(prev => [...prev, userMsg]);
    const query = chatInput.toLowerCase();
    setChatInput("");

    // Simple reactive chat responses matching high quality enterprise AI
    setTimeout(() => {
      let responseText = "I have analyzed the current telemetry. Compliance rate is 94.2%. Scaffolding teams are flagged with fall hazards. Scans show helmet wearing is 96.8% compliant.";
      
      if (query.includes("wind") || query.includes("weather")) {
        responseText = `Current wind speed is measured at ${windSpeed} km/h. Drone patrol #1 indicates stable hovering envelope. Wind safety threshold is set at 35 km/h. If wind exceeds this, scaffold-bound crews must retire immediately.`;
      } else if (query.includes("ppe") || query.includes("helmet") || query.includes("vest")) {
        responseText = "PPE Compliance Audit: 124 workers scanned today. 2 violations logged. Amit Sen (Level 2 corridor) flagged for missing structural helmets; Anil Sharma (Tower 4 facade) verified compliant for all high-risk anchors.";
      } else if (query.includes("scaffold") || query.includes("fall")) {
        responseText = "Scaffolding Scans (CCTV 4): Found edge barrier open on Level 4 structural floor. Lifelines are currently anchored with 95.2% confidence. Subcontractor L&T notified to seal the slab gap.";
      } else if (query.includes("incident") || query.includes("risk")) {
        responseText = `Risk Projection Index is currently at ${activeScenario !== "none" ? "HIGH" : "LOW-MEDIUM"}. Structural slab work holds a 1.2% incident factor, which increases significantly if meteorological hazards are stimulated.`;
      } else if (query.includes("audit") || query.includes("iso")) {
        responseText = "ISO 45001 Compliance Matrix: Active audits are 80% passing. Edge protection failures remain the core bottleneck. Click 'Compile Safety Audit' to generate the signed certification report.";
      }

      setChatMessages(prev => [...prev, {
        sender: "ai",
        text: responseText,
        timestamp: new Date().toLocaleTimeString().slice(0, 5)
      }]);
    }, 700);
  };

  const runTriggerAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setShowAuditModal(true);
    }, 1500);
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "Warning": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default: return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
  };

  const selectedBox = selectedStream.boxes.find(b => b.id === selectedBoxId) || selectedStream.boxes[0] || null;

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-900 overflow-hidden shadow-2xl flex flex-col font-sans" id="safety-patrol-simulator-root">
      
      {/* 1. COMPONENT TITLE BANNER */}
      <div className="bg-[#0b0e14]/90 border-b border-slate-900 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[9px] font-bold border border-amber-500/20 uppercase tracking-widest">
              AI CV-Inference Engine
            </span>
            <span className="text-slate-500 text-[10px] font-mono">• INTEGRATING ISO 45001 / OSHA CRITERIA</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#daff00] animate-pulse" />
            HSE Safety Patrol Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-normal">
            Continuous computer vision analysis of site hazards, worker safety attire, drone flyovers, and predictive environmental incident scoring.
          </p>
        </div>

        {/* Live Status indicator widget */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-2xl flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#daff00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#daff00]"></span>
            </span>
            <div className="font-mono text-[10px] leading-tight">
              <span className="text-slate-400 uppercase block font-bold">Patrol Engine</span>
              <span className="text-[#daff00]">SIMULATOR DEPLOYED</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME TELEMETRY KPI HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-900/30 border-b border-slate-900/60">
        
        {/* Compliance Card */}
        <div className="bg-slate-900/40 border border-slate-850/60 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Compliance Index
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono tracking-tight text-white">{complianceScore}%</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">▲ Target 95%</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${complianceScore >= 92 ? "bg-emerald-500" : (complianceScore >= 85 ? "bg-amber-500" : "bg-red-500")}`}
              style={{ width: `${complianceScore}%` }}
            />
          </div>
        </div>

        {/* Violations Card */}
        <div className="bg-slate-900/40 border border-slate-850/60 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            Active Violations
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-3xl font-black font-mono tracking-tight ${activeViolations > 2 ? "text-red-500 animate-pulse" : "text-white"}`}>
              {activeViolations}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">CV triggers</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-mono">Real-time alert dispatch active</p>
        </div>

        {/* Incident Risk Card */}
        <div className="bg-slate-900/40 border border-slate-850/60 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            Incident Probability
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono uppercase tracking-tight ${complianceScore < 85 ? "text-red-500" : (complianceScore < 92 ? "text-amber-500" : "text-emerald-400")}`}>
              {complianceScore < 85 ? "Critical" : (complianceScore < 92 ? "Elevated" : "Nominal")}
            </span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-mono">
            Calculated on weather &amp; attire
          </p>
        </div>

        {/* Meteorological Card */}
        <div className="bg-slate-900/40 border border-slate-850/60 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            Meteorological Factors
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-black font-mono tracking-tight ${windSpeed >= 35 ? "text-red-400 animate-pulse" : "text-white"}`}>
              {windSpeed} km/h
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Wind Speed</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-mono truncate">
            Scaffold lift threshold: 35 km/h
          </p>
        </div>

      </div>

      {/* 3. SIMULATOR ENVIRONMENT WORKSPACE */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Camera Feed Stream Selector, Main Monitor, and Scenario Controls (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* A. Camera Feed Stream Selector Toolbar / Patrol Zones */}
          <div className="bg-slate-900/40 border border-slate-850/60 rounded-2xl p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#daff00] animate-pulse" />
                  Active Patrol Zones
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">Select a site sector zone to switch live telemetry, CV overlays &amp; HSE compliance logs</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-850 self-start">
                {STREAM_REGISTRY.length} zones online
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {STREAM_REGISTRY.map((cam) => {
                const isSelected = selectedStream.id === cam.id;
                const hasViolation = cam.boxes.some(b => b.status === "VIOLATION");
                let cardBorderClass = "border-slate-850 bg-slate-950/40 text-slate-400 hover:border-slate-750 hover:bg-slate-900/40";
                if (isSelected) {
                  cardBorderClass = "border-[#daff00] bg-slate-900/80 text-white shadow-[0_0_12px_rgba(218,255,0,0.1)]";
                } else if (hasViolation) {
                  cardBorderClass = "border-red-950 bg-red-950/20 text-red-300 hover:border-red-900/50";
                }
                
                return (
                  <button
                    key={cam.id}
                    onClick={() => {
                      setSelectedStream(cam);
                      setScanComplete(true);
                      setIsScanning(false);
                      setActiveScenario("none");
                    }}
                    className={`p-2 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer select-none ${cardBorderClass}`}
                  >
                    <div className="flex justify-between items-center w-full gap-1">
                      <span className="text-[8px] font-mono tracking-wider opacity-60 uppercase font-bold truncate">{cam.type}</span>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cam.status === "Offline" ? "bg-slate-500" : (hasViolation ? "bg-red-500 animate-pulse" : "bg-emerald-500 animate-pulse")}`} />
                    </div>
                    <span className="text-[11px] font-bold truncate mt-1 text-slate-100">{cam.name}</span>
                    <span className="text-[8px] text-slate-500 truncate mt-0.5">{cam.location}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* B. Main Monitor Viewport (Camera Feed & AI Overlay) */}
          <div className="relative h-[360px] md:h-[450px] w-full rounded-2xl bg-slate-950 border border-slate-900 overflow-hidden shadow-inner flex flex-col justify-between group">
            
            {/* Feed Image background */}
            <img 
              src={selectedStream.url} 
              alt={selectedStream.name} 
              className={`absolute inset-0 w-full h-full object-cover select-none transition-all duration-700 ${
                isScanning ? "brightness-35 filter blur-[1.5px]" : "brightness-75 group-hover:brightness-65"
              }`}
              referrerPolicy="no-referrer"
            />

            {/* Scanning Grid Laser Overlay */}
            {isScanning && (
              <>
                <motion.div 
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#daff00] to-transparent shadow-[0_0_15px_rgba(218,255,0,1)] z-15 pointer-events-none"
                />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(218,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(218,255,0,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
                <div className="absolute inset-0 bg-[#daff00]/5 animate-pulse pointer-events-none" />
              </>
            )}

            {/* Scenario Flashing Screen Warnings */}
            {isScenarioAlerting && (
              <div className="absolute inset-0 border-4 border-red-500 animate-pulse pointer-events-none z-15" />
            )}

            {/* Top HUD Row overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-start z-10 font-mono text-[10px]">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
                  <span className="font-extrabold uppercase text-[#daff00] tracking-wider bg-[#daff00]/10 border border-[#daff00]/25 px-1.5 py-0.5 rounded">
                    LIVE AI CORRELATION FEED
                  </span>
                </div>
                <span className="text-white font-bold mt-1 text-xs">{selectedStream.name} • {selectedStream.location}</span>
              </div>

              {/* Technical indicators */}
              <div className="bg-slate-950/85 backdrop-blur-sm border border-slate-900/60 p-2.5 rounded-xl flex flex-col gap-1 text-[9px] text-slate-300">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">RESOL:</span>
                  <span className="font-bold text-white">{selectedStream.resolution}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">SIGNAL:</span>
                  <span className="font-bold text-emerald-400">{selectedStream.signalStrength}% LOCK</span>
                </div>
                {selectedStream.gpsCoords && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">GPS:</span>
                    <span className="font-bold text-slate-350">{selectedStream.gpsCoords}</span>
                  </div>
                )}
                {selectedStream.battery !== undefined && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">BATTERY:</span>
                    <span className={`font-bold ${selectedStream.battery < 30 ? "text-red-500 animate-pulse" : "text-emerald-400"}`}>{selectedStream.battery}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Center screen loading skeleton when scanning */}
            {isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-black/40 backdrop-blur-xs">
                <div className="w-12 h-12 rounded-full border-3 border-t-[#daff00] border-slate-800 animate-spin mb-3" />
                <span className="text-xs font-mono font-bold text-[#daff00] tracking-wider uppercase">Evaluating Image Coordinates...</span>
                <span className="text-[10px] text-slate-400 font-mono mt-1">Checking safety harnesses, edge barriers, and oxygen bottles</span>
                <div className="w-48 bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-800">
                  <div className="bg-[#daff00] h-full" style={{ width: `${scanProgress}%` }} />
                </div>
              </div>
            )}

            {/* Bounding Box AI Overlay Render System */}
            {showOverlays && scanComplete && (
              <div className="absolute inset-0 pointer-events-auto z-5">
                {selectedStream.boxes.map((box) => {
                  let borderClass = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
                  if (box.status === "VIOLATION") {
                    borderClass = "border-red-500 bg-red-500/15 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-pulse";
                  } else if (box.status === "WARNING") {
                    borderClass = "border-amber-500 bg-amber-500/12 text-amber-400";
                  }

                  const isSelected = box.id === selectedBoxId;

                  return (
                    <motion.div
                      key={box.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.w}%`,
                        height: `${box.h}%`
                      }}
                      className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-200 p-1.5 flex flex-col justify-between group/box ${borderClass} ${
                        isSelected ? "ring-2 ring-[#daff00] scale-[1.03] z-20" : ""
                      }`}
                      onClick={() => setSelectedBoxId(box.id)}
                    >
                      {/* Bounding Box Label tag */}
                      <span className="text-[8px] font-mono font-black tracking-wide truncate bg-slate-950/95 px-1 py-0.5 rounded border border-slate-800 leading-none self-start">
                        {box.label} ({Math.round(box.confidence)}%)
                      </span>

                      {box.workerName && (
                        <div className="hidden group-hover/box:flex flex-col bg-slate-950/90 p-1 rounded border border-slate-800 text-[7px] font-mono text-slate-300 self-end">
                          <span>Name: {box.workerName}</span>
                          <span>Trade: {box.trade}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Simulated Animated Workers Overlay */}
                {(SIMULATED_WORKERS_MAP[selectedStream.id] || []).map((worker) => {
                  const comp = getWorkerComplianceStatus(worker);
                  const confidence = getConfidence(worker.id);
                  const distance = getWorkerDistance(worker);
                  const workerIdStr = `WRK-${worker.id.replace('worker-', '').toUpperCase()}`;

                  // The bounding box dimensions
                  const boxWidth = 18;
                  const boxHeight = 32;

                  return (
                    <motion.div
                      key={worker.id}
                      style={{ 
                        position: "absolute",
                        width: `${boxWidth}%`,
                        height: `${boxHeight}%`,
                      }}
                      animate={{
                        left: [`${worker.startX}%`, `${worker.endX}%`, `${worker.startX}%`],
                        top: [`${worker.startY}%`, `${worker.endY}%`, `${worker.startY}%`],
                      }}
                      transition={{
                        duration: worker.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={`group/worker flex flex-col justify-between p-1.5 border-2 rounded-lg z-10 pointer-events-auto transition-all duration-300 ${comp.borderClass} hover:scale-105`}
                    >
                      {/* Bounding Box Corner Brackets for high-tech CV look */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: comp.color }}></div>
                      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2" style={{ borderColor: comp.color }}></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2" style={{ borderColor: comp.color }}></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: comp.color }}></div>

                      {/* Top Label Tag: Class name and Confidence */}
                      <div className="flex justify-between items-center -mt-6 w-full gap-1">
                        <span className="text-[7px] font-mono font-black tracking-wide px-1 py-0.5 rounded bg-slate-950/95 border shadow-sm flex items-center gap-1" style={{ borderColor: comp.color, color: comp.color }}>
                          <span className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: comp.color }} />
                          Worker ({confidence}%)
                        </span>
                        <span className="text-[7px] font-mono font-black text-slate-400 bg-slate-950/95 px-1 py-0.5 rounded border border-slate-850 shadow-sm truncate">
                          {workerIdStr}
                        </span>
                      </div>

                      {/* HUD inside the box */}
                      <div className="flex flex-col gap-1 w-full bg-slate-950/95 border border-slate-850 rounded-md p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.6)] mt-auto">
                        
                        {/* Worker Name & Trade */}
                        <div className="flex flex-col border-b border-slate-900 pb-1">
                          <span className="text-[8.5px] font-black text-white leading-tight truncate">{worker.name}</span>
                          <span className="text-[7px] text-slate-500 font-mono leading-none mt-0.5">{worker.trade}</span>
                        </div>

                        {/* PPE Checklist (Helmet, Vest, Harness) */}
                        <div className="space-y-0.5 text-[7px] font-mono text-left">
                          {/* Helmet */}
                          <div className="flex justify-between items-center bg-slate-900/30 px-1 py-0.5 rounded">
                            <span className="text-slate-400">Helmet:</span>
                            {worker.helmet === "OK" ? (
                              <span className="text-emerald-400 font-bold">✔ OK</span>
                            ) : worker.helmet === "MISSING" ? (
                              <span className="text-red-500 font-bold">❌ MISSING</span>
                            ) : (
                              <span className="text-slate-500">N/A</span>
                            )}
                          </div>

                          {/* Vest */}
                          <div className="flex justify-between items-center bg-slate-900/30 px-1 py-0.5 rounded">
                            <span className="text-slate-400">Vest:</span>
                            {worker.vest === "OK" ? (
                              <span className="text-emerald-400 font-bold">✔ OK</span>
                            ) : worker.vest === "MISSING" ? (
                              <span className="text-red-500 font-bold">❌ MISSING</span>
                            ) : (
                              <span className="text-slate-500">N/A</span>
                            )}
                          </div>

                          {/* Harness */}
                          <div className="flex justify-between items-center bg-slate-900/30 px-1 py-0.5 rounded">
                            <span className="text-slate-400">Harness:</span>
                            {worker.harness === "OK" ? (
                              <span className="text-emerald-400 font-bold">✔ OK</span>
                            ) : worker.harness === "MISSING" ? (
                              <span className="text-red-500 font-bold">❌ MISSING</span>
                            ) : (
                              <span className="text-slate-500">N/A</span>
                            )}
                          </div>
                        </div>

                        {/* Distance & State Row */}
                        <div className="flex justify-between items-center text-[7px] font-mono border-t border-slate-900 pt-1 mt-0.5">
                          <span className="text-slate-500 font-bold">DISTANCE:</span>
                          <span className="text-amber-400 font-extrabold">{distance}</span>
                        </div>

                        {/* Status Label */}
                        <span className="text-center text-[6.5px] font-bold font-mono tracking-wider uppercase px-1 py-0.5 rounded mt-0.5" style={{ backgroundColor: `${comp.color}15`, color: comp.color }}>
                          {comp.status === "Violation" ? "🔴 VIOLATION" : comp.status === "Warning" ? "🟡 WARNING" : "🟢 COMPLIANT"}
                        </span>

                      </div>
                    </motion.div>
                  );
                })}

              </div>
            )}

            {/* Live Camera Bottom HUD Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 to-transparent flex justify-between items-center z-10 font-mono text-[9px] text-slate-400">
              <div className="flex gap-4">
                <span>FPS: {selectedStream.fps}</span>
                <span>INFERENCE TIME: {selectedStream.inferenceTimeMs}ms</span>
                <span>CV ALGORITHMS: YOLOv11x-HSE-3.0</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>CAMERA STATUS: ONLINE</span>
              </div>
            </div>

          </div>

          {/* Controller and simulation scenarios trigger bar */}
          <div className="bg-[#0b0e14]/75 border border-slate-900 rounded-2xl p-5 flex flex-col gap-4">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-900 pb-3">
              <div>
                <h4 className="text-xs font-black text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-amber-500" />
                  Simulator Workspace Panel Controls
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Initialize site-wide computer vision sweeps or inject hazard test scenarios</p>
              </div>

              {/* Bounding box overlays toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">Show Boxes:</span>
                <button
                  onClick={() => setShowOverlays(!showOverlays)}
                  className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition border cursor-pointer ${
                    showOverlays 
                      ? "bg-amber-500 text-slate-950 border-amber-500" 
                      : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {showOverlays ? "ACTIVE" : "HIDDEN"}
                </button>
              </div>
            </div>

            {/* Scenarios Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Trigger Scan */}
              <button
                onClick={handleStartScan}
                disabled={isScanning}
                className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  isScanning 
                    ? "bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed" 
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/5"
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>{isScanning ? `SCANNING FEED... ${scanProgress}%` : "RUN ACTIVE TELEMETRY SCAN"}</span>
              </button>

              {/* Simulate High Wind */}
              <button
                onClick={() => {
                  if (activeScenario === "high-wind") setActiveScenario("none");
                  else setActiveScenario("high-wind");
                }}
                className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition border cursor-pointer ${
                  activeScenario === "high-wind"
                    ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/10"
                    : "bg-slate-900/60 border-slate-850 hover:border-slate-800 text-slate-300"
                }`}
              >
                <Flame className={`w-4 h-4 ${activeScenario === "high-wind" ? "animate-pulse" : "text-red-400"}`} />
                <span>{activeScenario === "high-wind" ? "HALT HIGH WIND SIM" : "SIMULATE HIGH WIND (42km/h)"}</span>
              </button>

              {/* Simulate Restricted Entry */}
              <button
                onClick={() => {
                  if (activeScenario === "unauthorized-entry") setActiveScenario("none");
                  else setActiveScenario("unauthorized-entry");
                }}
                className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition border cursor-pointer ${
                  activeScenario === "unauthorized-entry"
                    ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/10"
                    : "bg-slate-900/60 border-slate-850 hover:border-slate-800 text-slate-300"
                }`}
              >
                <AlertTriangle className={`w-4 h-4 ${activeScenario === "unauthorized-entry" ? "animate-ping" : "text-amber-400"}`} />
                <span>{activeScenario === "unauthorized-entry" ? "HALT ACCESS ALARM" : "SIMULATE ILLEGAL ACCESS"}</span>
              </button>

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Active Detections & Worker Telemetry (4 Cols) - The requested Right Panel */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          <div className="bg-[#0b0e14]/75 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between h-full min-h-[580px] lg:h-[685px] shadow-xl">
            
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              
              {/* Header Title */}
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <span className="text-[10px] text-[#daff00] font-mono font-bold uppercase tracking-wider block">Live Inference Workspace</span>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">Detections Inspector</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#daff00]/10 text-[#daff00] font-mono text-[9px] font-bold border border-[#daff00]/20 animate-pulse">
                  ACTIVE
                </span>
              </div>

              {/* ACTIVE VIOLATIONS */}
              <div className="flex flex-col gap-2 min-h-0">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    Violations ({selectedStream.boxes.filter(b => b.status === "VIOLATION").length})
                  </span>
                </div>
                
                <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                  {selectedStream.boxes.filter(b => b.status === "VIOLATION").length === 0 ? (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-center text-xs text-emerald-400 font-medium">
                      ✓ No active safety violations in this feed
                    </div>
                  ) : (
                    selectedStream.boxes.filter(b => b.status === "VIOLATION").map((box) => (
                      <button
                        key={box.id}
                        onClick={() => setSelectedBoxId(box.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition flex justify-between items-center cursor-pointer ${
                          selectedBoxId === box.id
                            ? "bg-red-950/50 border-red-500 text-white font-bold"
                            : "bg-red-950/20 border-red-900/40 hover:border-red-800 text-red-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="text-xs font-bold">{box.label}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-red-950 px-1.5 py-0.5 rounded border border-red-900 text-red-400 font-bold">
                          {Math.round(box.confidence)}%
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* DETECTED OBJECTS */}
              <div className="flex-1 flex flex-col gap-2 min-h-0">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Detected Objects ({selectedStream.boxes.filter(b => b.status !== "VIOLATION").length})
                </span>
                
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin max-h-[220px]">
                  {selectedStream.boxes.filter(b => b.status !== "VIOLATION").length === 0 ? (
                    <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-xl text-center text-xs text-slate-400">
                      No additional objects detected
                    </div>
                  ) : (
                    selectedStream.boxes.filter(b => b.status !== "VIOLATION").map((box) => (
                      <button
                        key={box.id}
                        onClick={() => setSelectedBoxId(box.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition flex justify-between items-center cursor-pointer ${
                          selectedBoxId === box.id
                            ? "bg-slate-900 border-[#daff00]/50 text-white font-bold"
                            : "bg-slate-950/40 border-slate-900 hover:border-slate-850 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {box.status === "WARNING" ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          <span className="text-xs">{box.label}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          box.status === "WARNING" 
                            ? "bg-amber-950/30 border-amber-900 text-amber-400" 
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}>
                          {Math.round(box.confidence)}%
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* WORKER DETAILS & INSPECTION SUB-CARD */}
            <div className="border-t border-slate-900 pt-4 mt-4">
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                selectedBox?.status === "VIOLATION"
                  ? "bg-red-950/15 border-red-500/30 text-red-300"
                  : selectedBox?.status === "WARNING"
                    ? "bg-amber-950/10 border-amber-500/30 text-amber-300"
                    : "bg-slate-900/40 border-slate-850 text-slate-200"
              }`}>
                <div className="flex justify-between items-start border-b border-white/5 pb-2.5 mb-2.5">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Worker Details</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest ${
                    selectedBox?.status === "VIOLATION"
                      ? "bg-red-500 text-white"
                      : selectedBox?.status === "WARNING"
                        ? "bg-amber-500 text-slate-950"
                        : "bg-emerald-500 text-slate-950"
                  }`}>
                    {selectedBox?.status === "VIOLATION" ? "VIOLATION" : selectedBox?.status === "WARNING" ? "WARNING" : "COMPLIANT"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] font-mono leading-relaxed">
                  
                  {/* Worker details */}
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Worker Details</span>
                    <span className="text-white font-bold block mt-0.5 truncate">{selectedBox?.workerName || "Unidentified"}</span>
                    <span className="text-slate-400 text-[10px] block truncate">{selectedBox?.trade || "General/External"}</span>
                  </div>

                  {/* Confidence */}
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Confidence</span>
                    <span className="text-white font-bold block mt-0.5 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {selectedBox ? `${selectedBox.confidence}%` : "N/A"}
                    </span>
                    <span className="text-slate-400 text-[9px] block">Inference model</span>
                  </div>

                  {/* Time */}
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Time</span>
                    <span className="text-white font-bold block mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {"02:44:12"}
                    </span>
                    <span className="text-slate-400 text-[9px] block">Detection scan</span>
                  </div>

                  {/* Zone */}
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Zone</span>
                    <span className="text-white font-bold block mt-0.5 flex items-center gap-1 truncate" title={selectedStream.location}>
                      <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {selectedStream.location.split(" - ")[0]}
                    </span>
                    <span className="text-slate-400 text-[9px] block truncate" title={selectedStream.location}>
                      {selectedStream.location.split(" - ")[1] || "Active Zone"}
                    </span>
                  </div>

                </div>

              </div>
            </div>

          </div>
          
        </div>

      </div>

      {/* 3.5 AI CO-PILOT & COMPLIANCE CHECKLIST SECTION */}
      <div className="px-6 pb-6 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gemini Safety Co-Pilot AI Chat */}
        <div className="lg:col-span-7 bg-[#0b0e14]/75 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between h-[300px]">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-2">
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Gemini Safety Co-Pilot
            </span>
            <span className="text-[8px] font-mono bg-indigo-950/55 text-indigo-400 border border-indigo-900/40 px-1 py-0.2 rounded">Core v1.5</span>
          </div>

          {/* Messages box */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 mb-2 scrollbar-thin">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-xl text-[11px] leading-relaxed max-w-[85%] ${
                  msg.sender === "ai" 
                    ? "bg-slate-900 text-slate-350 self-start border border-slate-850" 
                    : "bg-[#daff00] text-slate-950 self-end font-bold"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[7px] text-slate-500 block text-right mt-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Input field */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text"
              placeholder="Ask Co-Pilot about PPE stats, wind hazards..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-[#daff00]/50"
            />
            <button 
              type="submit"
              className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
            </button>
          </form>
        </div>

        {/* HSE Compliance Checklist */}
        <div className="lg:col-span-5 bg-[#0b0e14]/75 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between h-[300px]">
          <div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-2">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">HSE Compliance Checklist</span>
              <ClipboardCheck className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[175px] pr-1 scrollbar-thin text-[11.5px]">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 p-2 bg-slate-950/40 rounded-lg border border-slate-900">
                  <span className="text-slate-300 truncate max-w-[240px]" title={item.text}>{item.text}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 border ${
                    item.status === "Pass" 
                      ? "bg-emerald-950/30 border-emerald-900/40 text-emerald-400" 
                      : "bg-red-950/30 border-red-900/40 text-red-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={runTriggerAudit}
            className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-white font-extrabold text-[10px] rounded-lg transition uppercase flex items-center justify-center gap-1.5 cursor-pointer font-mono tracking-wider"
          >
            {isAuditing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling ISO Ledger...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-[#daff00]" />
                <span>Compile Digital Audit Certificate</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* 4. REAL-TIME COMPLIANCE ANALYTICS MATRIX (Bottom full width) */}
      <div className="px-6 pb-6 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recharts safety compliance slope area chart (8 Columns) */}
        <div className="lg:col-span-8 bg-[#0b0e14]/75 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between h-[280px]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">DIAGNOSTIC TIME-SERIES DATA</span>
              <span className="text-xs font-bold text-white uppercase font-mono">Real-Time Compliance Curve</span>
            </div>
            <div className="flex gap-4 text-[9px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 bg-emerald-500/20 border border-emerald-500 rounded" />
                Safety Index %
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2 h-2 bg-red-500/20 border border-red-500 rounded" />
                Alert Triggers
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={complianceHistory}
                margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.25)" 
                  fontSize={9} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.25)" 
                  fontSize={9} 
                  tickLine={false}
                  domain={[70, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0e14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "10px", fontFamily: "monospace" }}
                  labelStyle={{ color: "rgba(255,255,255,0.4)", fontSize: "9px", fontFamily: "monospace" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCompliance)" 
                  name="Safety Index %"
                />
                <Area 
                  type="monotone" 
                  dataKey="alertCount" 
                  stroke="#ef4444" 
                  strokeWidth={1.5}
                  fillOpacity={1} 
                  fill="url(#colorAlerts)" 
                  name="Violations Count"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trade Risk Distribution Bar Chart (4 Columns) */}
        <div className="lg:col-span-4 bg-[#0b0e14]/75 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between h-[280px]">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">SUBCONTRACTOR RISK WEIGHT</span>
            <span className="text-xs font-bold text-white uppercase font-mono">Trade Violation Frequency</span>
          </div>

          <div className="flex-1 min-h-[170px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { trade: "Scaffold", value: activeScenario === "high-wind" ? 8 : 4, color: "#f59e0b" },
                  { trade: "Masonry", value: 2, color: "#10b981" },
                  { trade: "MEP Welder", value: activeScenario === "unauthorized-entry" ? 6 : 1, color: "#ef4444" },
                  { trade: "Concrete", value: 3, color: "#3b82f6" }
                ]}
                layout="vertical"
                margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.2)" fontSize={8} tickLine={false} />
                <YAxis dataKey="trade" type="category" stroke="rgba(255,255,255,0.3)" fontSize={9} width={65} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b0e14", border: "1px solid rgba(255,255,255,0.1)" }}
                  itemStyle={{ fontSize: "10px", color: "#fff" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  <Cell fill="#f59e0b" />
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#3b82f6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 5. HISTORICAL CV INCIDENT LEDGER TABLE */}
      <div className="px-6 pb-6">
        <div className="bg-[#0b0e14]/75 border border-slate-900 rounded-2xl p-5">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
            <div>
              <h4 className="text-xs font-black text-white uppercase font-mono tracking-wider">Historical Patrol &amp; CV Detection Ledger</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Comprehensive audit trail of autonomous scans and manually injected hazard scenarios</p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Showing {patrolLogs.length} active entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                  <th className="py-2.5 font-bold">Log ID</th>
                  <th className="py-2.5 font-bold">Timestamp</th>
                  <th className="py-2.5 font-bold">Stream Source</th>
                  <th className="py-2.5 font-bold">Incident description</th>
                  <th className="py-2.5 font-bold">Severity</th>
                  <th className="py-2.5 font-bold">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {patrolLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/45 transition">
                    <td className="py-3 font-mono text-[10px] text-slate-400 font-bold">{log.id}</td>
                    <td className="py-3 font-mono text-[10px] text-slate-500">{log.timestamp}</td>
                    <td className="py-3 font-bold text-white text-[11px]">{log.feed}</td>
                    <td className="py-3 text-slate-300 pr-4 leading-normal">{log.event}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${getSeverityBadgeColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold font-mono ${
                        log.status === "Resolved" 
                          ? "text-emerald-400" 
                          : (log.status === "Actioned" ? "text-amber-400" : "text-slate-500")
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. MODAL DIALOG: DIGITAL ISO AUDIT CERTIFICATE SIGNOFF */}
      <AnimatePresence>
        {showAuditModal && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0e14] border border-[#daff00]/25 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative flex flex-col gap-4 font-sans"
            >
              
              {/* Gold header decoration */}
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                    ISO 45001 Safety Audit Certificate
                  </h3>
                  <span className="text-[9px] text-slate-400 font-mono block">AUTOMATED PUNCH-LIST SIGN-OFF SYSTEM</span>
                </div>
              </div>

              {/* Certificate layout */}
              <div className="border border-slate-900 bg-slate-950 p-5 rounded-2xl flex flex-col gap-3 font-mono text-[11px]">
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">PROJECT LEDGER:</span>
                  <span className="text-white font-bold">TRACPROGRESS® DELTA REGION</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">AUDIT STANDARDS:</span>
                  <span className="text-[#daff00] font-bold">OSHA 1926.501 &amp; ISO 45001</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">COMPLIANCE METRIC:</span>
                  <span className="text-white font-bold">{complianceScore}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-2">
                  <span className="text-slate-500">ACTIVE HAZARDS:</span>
                  <span className={`font-bold ${activeViolations > 2 ? "text-red-500" : "text-emerald-400"}`}>
                    {activeViolations} Deficiencies logged
                  </span>
                </div>
                
                {/* Specific failures outline */}
                {activeViolations > 0 && (
                  <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-xl flex flex-col gap-1 text-[10px] text-red-400">
                    <span className="font-bold uppercase tracking-wide">Pending Action punch-lists:</span>
                    <ul className="list-disc pl-4 flex flex-col gap-0.5 leading-normal font-sans">
                      <li>Oxygen bottles must be chained vertically under safety harness protocol.</li>
                      <li>Drywall sheeting teams must maintain continuous Level 2 helmet induction locks.</li>
                    </ul>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 leading-relaxed font-sans pt-2">
                  This safety certificate has been evaluated dynamically by YOLOv11 deep-learning pipelines, matching standard site panoramic walk streams. Compliance parameters meet state builder registry codes.
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-900 text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-white font-bold uppercase">M. Kumar</span>
                    <span className="text-slate-500 text-[8px]">HSE PRINCIPAL LEAD</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-white font-bold uppercase">VERIFIED</span>
                    <span className="text-slate-500 text-[8px] font-mono">ID: HSEC-1094-CV</span>
                  </div>
                </div>
              </div>

              {/* Modal controls */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAuditModal(false)}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl border border-slate-800 transition cursor-pointer text-center"
                >
                  Dismiss Ledger
                </button>
                <button
                  onClick={() => {
                    alert("Mock PDF safety audit certificate downloaded successfully!");
                    setShowAuditModal(false);
                  }}
                  className="flex-1 py-3 bg-[#daff00] hover:bg-[#b0cc00] text-slate-950 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Signed PDF</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
