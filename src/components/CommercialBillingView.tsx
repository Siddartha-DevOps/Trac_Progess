import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  ChevronRight, 
  Wifi, 
  WifiOff, 
  Lock, 
  Plus, 
  MessageSquare, 
  Info,
  DollarSign,
  Briefcase,
  History,
  FileCheck,
  Percent,
  RefreshCw,
  Camera,
  Layers,
  ArrowDownToLine,
  UserCheck
} from "lucide-react";
import { useAppStore } from "../store";
import { 
  Heading, 
  Text, 
  Badge, 
  Button, 
  Input, 
  Dropdown, 
  Card, 
  Table, 
  Dialog, 
  Skeleton, 
  EmptyState 
} from "./UI";

// ============================================================================
// 1. DATA TYPES & INTERFACES
// ============================================================================

export interface BOQItem {
  id: string;
  code: string;
  description: string;
  trade: "Structure" | "MEP" | "Drywall" | "Finishes" | "Earthworks";
  unit: string;
  unitRate: number;
  scheduledQty: number;
  totalCost: number;
  previousClaimedQty: number;
  currentClaimedQty: number; // Subcontractor Claim
  aiVerifiedQty: number;      // AI Computer Vision proof
  approvedQty: number;        // Operator finalized approval
  status: "Matched" | "Mismatch" | "Critical_Deviation";
  locationContext: string;
  discrepancyReason?: string;
  bimElementId?: string;
}

export interface BillingAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  boqCode?: string;
  amountImpacted?: string;
}

// ============================================================================
// 2. enterprise INITIAL SEED DATA
// ============================================================================

const INITIAL_BOQ_ITEMS: BOQItem[] = [
  {
    id: "boq-1",
    code: "BOQ-101",
    description: "Subgrade Earthworks & Excavation Shoring",
    trade: "Earthworks",
    unit: "cum",
    unitRate: 850,
    scheduledQty: 4200,
    totalCost: 3570000,
    previousClaimedQty: 4200,
    currentClaimedQty: 4200,
    aiVerifiedQty: 4200,
    approvedQty: 4200,
    status: "Matched",
    locationContext: "Foundation Sump level -2",
    bimElementId: "vent_sump_drain"
  },
  {
    id: "boq-2",
    code: "BOQ-204",
    description: "M35 Reinforcement Concrete Structural Slab",
    trade: "Structure",
    unit: "cum",
    unitRate: 12500,
    scheduledQty: 650,
    totalCost: 8125000,
    previousClaimedQty: 450,
    currentClaimedQty: 550, // Subcontractor claiming 100 cum more
    aiVerifiedQty: 468,      // AI confirms only 18 cum installed in week 3
    approvedQty: 450,        // Starts at previous, waits for certification
    status: "Mismatch",
    locationContext: "Tunnel Ring Segment 45B Alignment",
    discrepancyReason: "Subcontractor claiming 550 cum, but LiDAR ring scan registers radial segment deviation preventing full load validation on Segment 45B.",
    bimElementId: "tunnel_ring_45b"
  },
  {
    id: "boq-3",
    code: "BOQ-308",
    description: "PVC Heavy Duty Cable Sleeves 25mm",
    trade: "MEP",
    unit: "m",
    unitRate: 450,
    scheduledQty: 3200,
    totalCost: 1440000,
    previousClaimedQty: 1200,
    currentClaimedQty: 3000, // Subcontractor claims huge jump to 3000m
    aiVerifiedQty: 1760,      // AI photogrammetry proves only 1760m installed
    approvedQty: 1200,
    status: "Critical_Deviation",
    locationContext: "MEP Cable Riser Duct L12",
    discrepancyReason: "4 critical slab MEP sleeves were entirely omitted during concrete casting on floor slab Level 12. Heavy structural coring required before routing remaining 1240m.",
    bimElementId: "hvac_riser_l12"
  },
  {
    id: "boq-4",
    code: "BOQ-411",
    description: "Drywall Gypsum Partition Panel Walls",
    trade: "Drywall",
    unit: "sqft",
    unitRate: 180,
    scheduledQty: 12000,
    totalCost: 2160000,
    previousClaimedQty: 6000,
    currentClaimedQty: 10800, // Claiming 90%
    aiVerifiedQty: 10800,     // 100% matched with panoramic scans!
    approvedQty: 10800,
    status: "Matched",
    locationContext: "Whitefield-B Corridor Zone A",
    bimElementId: "wall_part_11a"
  },
  {
    id: "boq-5",
    code: "BOQ-522",
    description: "Wet Riser Sprinkler Pipe Distribution Mains",
    trade: "MEP",
    unit: "m",
    unitRate: 1200,
    scheduledQty: 800,
    totalCost: 960000,
    previousClaimedQty: 240,
    currentClaimedQty: 480,   // Subcontractor claims 60%
    aiVerifiedQty: 480,       // 100% match by actual camera proof
    approvedQty: 480,
    status: "Matched",
    locationContext: "Plumbing Corridor C4",
    bimElementId: "sprink_main_5b"
  },
  {
    id: "boq-6",
    code: "BOQ-604",
    description: "Premium Vitrified Ceramic Tiling Works",
    trade: "Finishes",
    unit: "sqft",
    unitRate: 240,
    scheduledQty: 15000,
    totalCost: 3600000,
    previousClaimedQty: 0,
    currentClaimedQty: 3000,  // Claiming 20%
    aiVerifiedQty: 2920,      // AI shows 2920 sqft laid
    approvedQty: 0,
    status: "Mismatch",
    locationContext: "Main Lobby Area Level 1",
    discrepancyReason: "Tile adhesive curing delays on Floor West Corridor caused visual tile offsets; 80 sqft requires tile relaying and leveling.",
    bimElementId: "tiling_lobby_01"
  }
];

const SEED_AUDIT_LOGS: BillingAuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-07-14 09:12:30",
    user: "System AI Core",
    role: "Computer Vision",
    action: "Automatically generated 3D BIM-to-Reality physical quantity matching matrix.",
    amountImpacted: "₹18.5 Cr Scanned"
  },
  {
    id: "log-2",
    timestamp: "2026-07-14 09:15:44",
    user: "Venkatesh Rao",
    role: "MEP Lead",
    action: "Submitted sub-contractor progress claims for whitefield main pipelines.",
    boqCode: "BOQ-522",
    amountImpacted: "₹2,88,000 Verified"
  },
  {
    id: "log-3",
    timestamp: "2026-07-14 09:22:11",
    user: "Amit Sharma",
    role: "BIM Manager",
    action: "Flagged critical sleeve omission on Level 12. MEP billing withheld.",
    boqCode: "BOQ-308",
    amountImpacted: "₹5,58,000 Disputed"
  }
];

// ============================================================================
// 3. MAIN COMPONENT DEFINITION
// ============================================================================

export default function CommercialBillingView() {
  const { activeProject } = useAppStore();

  // Component States
  const [items, setItems] = useState<BOQItem[]>(INITIAL_BOQ_ITEMS);
  const [logs, setLogs] = useState<BillingAuditLog[]>(SEED_AUDIT_LOGS);
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"code" | "rate" | "value" | "variance">("code");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<"MC_PM" | "Client_QS" | "Sub_QS">("MC_PM"); // Roles
  const [selectedDisputeItem, setSelectedDisputeItem] = useState<BOQItem | null>(null); // Dispute sandbox modal state
  const [disputeComment, setDisputeComment] = useState("");
  const [sliderPosition, setSliderPosition] = useState(50); // Split comparison slider
  const [optimisticNotify, setOptimisticNotify] = useState<string | null>(null);

  // Pagination page size
  const pageSize = 4;

  // Optimistic notification trigger
  const showNotification = (message: string) => {
    setOptimisticNotify(message);
    setTimeout(() => setOptimisticNotify(null), 3500);
  };

  // Keyboard navigation for active BOQ items
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);

  // Hardcoded financial conversions (Indian Rupees to Crores / Lakhs)
  const formatCurrency = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹${val.toLocaleString("en-IN")}`;
  };

  // Roles Definition
  const rolesInfo = {
    MC_PM: { label: "Main Contractor Project Manager", icon: <UserCheck className="w-3.5 h-3.5" />, permissions: "Full Edit & Certification Powers" },
    Client_QS: { label: "Client Quantity Surveyor", icon: <Lock className="w-3.5 h-3.5" />, permissions: "Read-Only / Sign-off Auditor" },
    Sub_QS: { label: "Subcontractor Quantity Surveyor", icon: <MessageSquare className="w-3.5 h-3.5" />, permissions: "Claim Submission Mode Only" }
  };

  // Simulated Syncing Action
  const triggerSyncSim = () => {
    setIsLoading(true);
    showNotification("Syncing live coordinate quantities from LiDAR cameras...");
    setTimeout(() => {
      setIsLoading(false);
      showNotification("Quantities successfully synchronized with Whitefield-B Reality scans.");
    }, 1200);
  };

  // Toggle Offline Sandbox Mode
  const toggleOfflineMode = () => {
    setIsOffline(!isOffline);
    showNotification(
      !isOffline 
        ? "Warning: Operating in Offline Sandbox. Calculations will cache locally." 
        : "Reconnected to central cloud. Local progress ledger synchronized!"
    );
  };

  // Verify Single Row With AI-Telemetry Proof
  const applyAIVerification = (id: string) => {
    if (userRole === "Client_QS") {
      showNotification("Permission denied: Client QS role cannot override quantities.");
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const originalApproved = item.approvedQty;
          const targetQty = item.aiVerifiedQty;
          
          if (originalApproved === targetQty) return item;

          // Add audit log
          const deltaCost = (targetQty - originalApproved) * item.unitRate;
          const newLog: BillingAuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
            user: "L&T MC Director (MC_PM)",
            role: "Contract Director",
            action: `Optimistic Overrode approved qty on ${item.code} to match computer-vision verified target.`,
            boqCode: item.code,
            amountImpacted: formatCurrency(Math.abs(deltaCost))
          };
          setLogs(prev => [newLog, ...prev]);

          showNotification(`Optimistic Update: Approved quantity for ${item.code} adjusted to ${targetQty} ${item.unit}.`);
          return {
            ...item,
            approvedQty: targetQty,
            status: "Matched"
          };
        }
        return item;
      })
    );
  };

  // Bulk Apply AI Verification
  const applyBulkAI = () => {
    if (userRole === "Client_QS") {
      showNotification("Permission denied: Client QS cannot perform bulk modifications.");
      return;
    }

    setItems(prevItems => {
      let count = 0;
      const next = prevItems.map(item => {
        if (item.approvedQty !== item.aiVerifiedQty) {
          count++;
          return { ...item, approvedQty: item.aiVerifiedQty, status: "Matched" as const };
        }
        return item;
      });

      if (count > 0) {
        const newLog: BillingAuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          user: "Main Contractor PM",
          role: "PM Admin",
          action: `Bulk certified ${count} discrepancies using TracProgress® AI computer-vision proof.`,
          amountImpacted: "Dispute Resolved"
        };
        setLogs(prev => [newLog, ...prev]);
        showNotification(`Bulk Match Successful: Certified ${count} quantities against reality records.`);
      } else {
        showNotification("All items are already fully matched with AI reality records.");
      }
      return next;
    });
  };

  // Adjust Approved Percentage Manually
  const handleApprovedPercentageChange = (id: string, value: string) => {
    if (userRole === "Client_QS") {
      showNotification("Permission denied: Read-Only mode.");
      return;
    }

    const percentage = Math.max(0, Math.min(100, parseFloat(value) || 0));
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const targetQty = (percentage / 100) * item.scheduledQty;
          return {
            ...item,
            approvedQty: parseFloat(targetQty.toFixed(2))
          };
        }
        return item;
      })
    );
  };

  // Handle Dispute Submission Form
  const submitDisputeResolution = () => {
    if (!selectedDisputeItem) return;
    
    // Optimistic Update
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === selectedDisputeItem.id) {
          // Adjust to AI-verified target
          return {
            ...item,
            approvedQty: item.aiVerifiedQty,
            status: "Matched"
          };
        }
        return item;
      })
    );

    const adjustmentAmount = (selectedDisputeItem.currentClaimedQty - selectedDisputeItem.aiVerifiedQty) * selectedDisputeItem.unitRate;

    // Log the event
    const newLog: BillingAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: "Quantity Surveyor PM",
      role: rolesInfo[userRole].label,
      action: `Resolved billing dispute for ${selectedDisputeItem.code}. Comment: ${disputeComment || "Adhered to camera photogrammetry proof."}`,
      boqCode: selectedDisputeItem.code,
      amountImpacted: `Reduced by ${formatCurrency(adjustmentAmount)}`
    };

    setLogs(prev => [newLog, ...prev]);
    showNotification(`Dispute Resolved: Certified ${selectedDisputeItem.code} at AI quantities. Deduction applied.`);
    setSelectedDisputeItem(null);
    setDisputeComment("");
  };

  // Calculations for KPI Cards
  const kpis = useMemo(() => {
    let totalScheduled = 0;
    let totalSubClaimed = 0;
    let totalApproved = 0;
    let totalAIValue = 0;
    let disputedDelta = 0;

    items.forEach(item => {
      totalScheduled += item.totalCost;
      
      const claimedVal = item.currentClaimedQty * item.unitRate;
      totalSubClaimed += claimedVal;

      const approvedVal = item.approvedQty * item.unitRate;
      totalApproved += approvedVal;

      const aiVal = item.aiVerifiedQty * item.unitRate;
      totalAIValue += aiVal;

      // Subcontractor overclaimed cost compared to AI-verified quantity
      if (claimedVal > aiVal) {
        disputedDelta += (claimedVal - aiVal);
      }
    });

    // Match rate represents % of items where approved = AI verified
    const matchedCount = items.filter(item => item.approvedQty === item.aiVerifiedQty).length;
    const matchRate = (matchedCount / items.length) * 100;

    return {
      scheduled: totalScheduled,
      claimed: totalSubClaimed,
      approved: totalApproved,
      aiVerified: totalAIValue,
      disputeCost: disputedDelta,
      matchPercentage: matchRate
    };
  }, [items]);

  // Filter & Sort Items
  const processedItems = useMemo(() => {
    let result = items.filter(item => {
      const matchQuery = 
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.locationContext.toLowerCase().includes(search.toLowerCase());
      
      const matchTrade = tradeFilter === "All" || item.trade === tradeFilter;
      const matchStatus = statusFilter === "All" || 
        (statusFilter === "Matched" && item.status === "Matched") ||
        (statusFilter === "Discrepancy" && item.status !== "Matched");

      return matchQuery && matchTrade && matchStatus;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "code") {
        return a.code.localeCompare(b.code);
      }
      if (sortBy === "rate") {
        return b.unitRate - a.unitRate;
      }
      if (sortBy === "value") {
        return (b.currentClaimedQty * b.unitRate) - (a.currentClaimedQty * a.unitRate);
      }
      if (sortBy === "variance") {
        const varA = Math.abs(a.currentClaimedQty - a.aiVerifiedQty) * a.unitRate;
        const varB = Math.abs(b.currentClaimedQty - b.aiVerifiedQty) * b.unitRate;
        return varB - varA;
      }
      return 0;
    });

    return result;
  }, [items, search, tradeFilter, statusFilter, sortBy]);

  // Paginated Items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedItems.slice(startIndex, startIndex + pageSize);
  }, [processedItems, currentPage]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, tradeFilter, statusFilter, sortBy]);

  // Handle keyboard row selection
  const handleKeyDown = (e: React.KeyboardEvent, index: number, boqItem: BOQItem) => {
    if (e.key === "Enter") {
      setSelectedDisputeItem(boqItem);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedRowIndex(prev => Math.min(paginatedItems.length - 1, prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedRowIndex(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="commercial-billing-view-root">
      
      {/* 1. TOP HEADER SUMMARY & CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <Heading level={2} className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                Commercial Claims & BOQ Valuation Ledger
                {isOffline && (
                  <Badge variant="amber" type="solid" className="ml-2 py-0.5 px-1.5 text-[8px] animate-pulse">
                    OFFLINE CACHE
                  </Badge>
                )}
              </Heading>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically reconciliation of sub-contractor monthly payment applications against LiDAR camera photogrammetry.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
          
          {/* Role Changer Simulator */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold font-mono uppercase px-1.5">Role:</span>
            {(["MC_PM", "Client_QS", "Sub_QS"] as const).map((role) => (
              <button
                key={role}
                onClick={() => {
                  setUserRole(role);
                  showNotification(`Role changed to: ${role === "MC_PM" ? "Contractor PM" : role === "Client_QS" ? "Client QS" : "Subcontractor QS"}`);
                }}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-md font-mono transition ${
                  userRole === role 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {role === "MC_PM" ? "MC PM" : role === "Client_QS" ? "Auditor" : "Sub QS"}
              </button>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleOfflineMode}
            leftIcon={isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-500" /> : <Wifi className="w-3.5 h-3.5 text-emerald-500" />}
          >
            {isOffline ? "Go Online" : "Simulate Offline"}
          </Button>

          <Button 
            variant="secondary" 
            size="sm" 
            onClick={triggerSyncSim}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Sync Reality Quantities
          </Button>
        </div>
      </div>

      {/* OPTIMISTIC REAL-TIME NOTIFICATION NOTIFIER BANNER */}
      <AnimatePresence>
        {optimisticNotify && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-between text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{optimisticNotify}</span>
            </div>
            <span className="text-[9px] font-mono opacity-80 uppercase bg-indigo-700 px-1.5 py-0.5 rounded">Real-Time Sync</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HIGH-FIDELITY KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: Contract Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Total Contract Value</span>
            <span className="p-1 rounded bg-slate-100 text-slate-500"><Briefcase className="w-4 h-4" /></span>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-black text-slate-900 font-mono">{formatCurrency(kpis.scheduled)}</span>
            <div className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">Project: {activeProject.name}</div>
          </div>
        </div>

        {/* KPI 2: Subcontractor Claim */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Submitted Claim Value</span>
            <span className="p-1 rounded bg-amber-50 text-amber-600"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-black text-slate-900 font-mono">{formatCurrency(kpis.claimed)}</span>
            <div className="text-[10px] text-amber-600 font-bold font-mono mt-0.5">
              +{((kpis.claimed / kpis.scheduled) * 100).toFixed(1)}% Claimed rate
            </div>
          </div>
        </div>

        {/* KPI 3: AI Verified Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">AI Verified Value</span>
            <span className="p-1 rounded bg-emerald-50 text-emerald-600"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-black text-emerald-600 font-mono">{formatCurrency(kpis.aiVerified)}</span>
            <div className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              LiDAR Reality Match
            </div>
          </div>
        </div>

        {/* KPI 4: Disputed Delta (Payment Leakage Prevented) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Prevented Leakage</span>
            <span className="p-1 rounded bg-rose-50 text-rose-600 animate-pulse"><DollarSign className="w-4 h-4" /></span>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-black text-rose-600 font-mono">{formatCurrency(kpis.disputeCost)}</span>
            <div className="text-[10px] text-rose-500 font-bold font-mono mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              Subcontractor Mismatch
            </div>
          </div>
        </div>

        {/* KPI 5: Certified & Approved */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Certified Approved</span>
            <span className="p-1 rounded bg-indigo-50 text-indigo-600"><FileCheck className="w-4 h-4" /></span>
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-black text-indigo-600 font-mono">{formatCurrency(kpis.approved)}</span>
            <div className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">
              Approved Rate: {((kpis.approved / kpis.claimed) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

      </div>

      {/* 3. INTERACTIVE SEARCH & MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: BOQ Valuation Matrix Sheet (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          <Card 
            radius="xl"
            header={
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                    Bill of Quantities Claim Reconciliation Matrix
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Click on items with discrepancies to load visual 3D coordination proofs.</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="xs" 
                    onClick={applyBulkAI}
                    leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
                  >
                    Bulk Resolve Discrepancies
                  </Button>
                </div>
              </div>
            }
          >
            {/* Search, Filter, Sort Controls bar */}
            <div className="flex flex-wrap gap-3 pb-4 mb-2 border-b border-slate-100">
              
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <Input 
                  placeholder="Search BOQ code or description..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>

              {/* Trade Filter */}
              <div className="w-40">
                <Dropdown 
                  label=""
                  placeholder="Trade Filter"
                  value={tradeFilter}
                  onChange={(val) => setTradeFilter(val)}
                  options={[
                    { value: "All", label: "All Trades" },
                    { value: "Earthworks", label: "Earthworks" },
                    { value: "Structure", label: "Structure" },
                    { value: "MEP", label: "MEP Works" },
                    { value: "Drywall", label: "Drywall Wall" },
                    { value: "Finishes", label: "Finishes / Tiling" }
                  ]}
                />
              </div>

              {/* Status Filter */}
              <div className="w-40">
                <Dropdown 
                  label=""
                  placeholder="Status Filter"
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  options={[
                    { value: "All", label: "All Statuses" },
                    { value: "Matched", label: "Matched" },
                    { value: "Discrepancy", label: "Discrepancy Delta" }
                  ]}
                />
              </div>

              {/* Sorting Switcher */}
              <div className="w-44">
                <Dropdown 
                  label=""
                  placeholder="Sort Ledger By"
                  value={sortBy}
                  onChange={(val) => setSortBy(val as any)}
                  options={[
                    { value: "code", label: "Sort: BOQ Code" },
                    { value: "rate", label: "Sort: Unit Rate" },
                    { value: "value", label: "Sort: Claimed Value" },
                    { value: "variance", label: "Sort: Mismatch Delta" }
                  ]}
                />
              </div>

            </div>

            {/* Matrix Table */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Skeleton variant="card" height="150px" />
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </div>
            ) : paginatedItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                      <th className="p-3">Item Spec</th>
                      <th className="p-3 text-right">Unit Rate</th>
                      <th className="p-3 text-right">Subcontractor Claim</th>
                      <th className="p-3 text-right bg-indigo-50/20 text-indigo-700">AI Verified</th>
                      <th className="p-3 text-right">Valuation Approved</th>
                      <th className="p-3 text-center">Status Proof</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedItems.map((item, index) => {
                      const isFocused = focusedRowIndex === index;
                      const hasMismatch = item.currentClaimedQty !== item.aiVerifiedQty;
                      const mismatchValue = (item.currentClaimedQty - item.aiVerifiedQty) * item.unitRate;
                      const approvedPct = ((item.approvedQty / item.scheduledQty) * 100).toFixed(0);

                      return (
                        <tr 
                          key={item.id}
                          tabIndex={0}
                          onKeyDown={(e) => handleKeyDown(e, index, item)}
                          onFocus={() => setFocusedRowIndex(index)}
                          className={`transition ${isFocused ? "bg-indigo-50/20 ring-1 ring-indigo-500" : "hover:bg-slate-50/50"}`}
                        >
                          {/* Item Code & Description */}
                          <td className="p-3 max-w-[200px]">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                                {item.code}
                                <Badge variant={
                                  item.trade === "Structure" ? "indigo" : 
                                  item.trade === "MEP" ? "orange" : 
                                  item.trade === "Drywall" ? "sky" : "slate"
                                } className="text-[8px] py-0 px-1">{item.trade}</Badge>
                              </span>
                              <span className="font-bold text-slate-700 truncate block">{item.description}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{item.locationContext}</span>
                            </div>
                          </td>

                          {/* Unit Rate */}
                          <td className="p-3 text-right font-mono text-slate-500">
                            {formatCurrency(item.unitRate)} <span className="text-[9px]">/{item.unit}</span>
                          </td>

                          {/* Subcontractor Claim Qty & Value */}
                          <td className="p-3 text-right">
                            <div className="flex flex-col">
                              <span className="font-mono font-bold text-slate-800">
                                {item.currentClaimedQty.toLocaleString()} {item.unit}
                              </span>
                              <span className="text-[10px] text-amber-600 font-bold font-mono">
                                {formatCurrency(item.currentClaimedQty * item.unitRate)}
                              </span>
                            </div>
                          </td>

                          {/* AI Verified Qty & Value */}
                          <td className="p-3 text-right bg-indigo-50/10">
                            <div className="flex flex-col">
                              <span className="font-mono font-bold text-indigo-700">
                                {item.aiVerifiedQty.toLocaleString()} {item.unit}
                              </span>
                              <span className="text-[10px] text-indigo-600 font-bold font-mono">
                                {formatCurrency(item.aiVerifiedQty * item.unitRate)}
                              </span>
                            </div>
                          </td>

                          {/* Approved Qty & Percentage Input */}
                          <td className="p-3 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1.5 justify-end">
                                <input 
                                  type="number"
                                  disabled={userRole === "Client_QS"}
                                  value={approvedPct}
                                  onChange={(e) => handleApprovedPercentageChange(item.id, e.target.value)}
                                  className="w-12 bg-slate-100 border border-slate-200 rounded p-1 text-[10px] font-mono font-bold text-right outline-none focus:border-indigo-500"
                                />
                                <span className="text-[10px] font-mono text-slate-400">%</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({item.approvedQty.toLocaleString()} {item.unit})
                              </span>
                            </div>
                          </td>

                          {/* Status Badge with Deviation Tooltip */}
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                              {item.status === "Matched" ? (
                                <Badge variant="emerald" type="soft" className="text-[8px] flex items-center gap-0.5">
                                  <CheckCircle className="w-2.5 h-2.5" /> Matched
                                </Badge>
                              ) : item.status === "Mismatch" ? (
                                <Badge variant="amber" type="solid" className="text-[8px] flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Mismatch
                                </Badge>
                              ) : (
                                <Badge variant="rose" type="solid" className="text-[8px] flex items-center gap-0.5 animate-pulse">
                                  <AlertTriangle className="w-2.5 h-2.5 animate-bounce" /> CRITICAL DELTA
                                </Badge>
                              )}
                              {hasMismatch && (
                                <span className="text-[9px] text-rose-500 font-bold font-mono">
                                  -{formatCurrency(mismatchValue)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Resolve Dispute sandbox trigger */}
                              <button 
                                onClick={() => setSelectedDisputeItem(item)}
                                className="p-1 hover:bg-slate-100 border border-slate-200 rounded text-slate-500 hover:text-slate-900 transition flex items-center gap-1 text-[9px] font-mono font-bold"
                                title="Inspect photogrammetry comparison"
                              >
                                <Camera className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Inspect</span>
                              </button>

                              {/* Instantly apply AI Match */}
                              {hasMismatch && (
                                <button 
                                  onClick={() => applyAIVerification(item.id)}
                                  disabled={userRole === "Client_QS"}
                                  className="p-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-emerald-700 transition"
                                  title="Approve AI quantity value"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState 
                title="No BOQ Ledger Rows Found" 
                description="We couldn't find any contract lines matching your filter settings. Clear searching or reset filter trades."
                actionLabel="Reset Filters"
                onAction={() => {
                  setSearch("");
                  setTradeFilter("All");
                  setStatusFilter("All");
                }}
              />
            )}

            {/* Pagination Segment */}
            {processedItems.length > pageSize && (
              <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100 text-xs text-slate-400 select-none">
                <span className="font-mono font-semibold">
                  Showing rows {(currentPage - 1) * pageSize + 1} to {Math.min(processedItems.length, currentPage * pageSize)} of {processedItems.length}
                </span>

                <div className="flex gap-1.5">
                  <Button 
                    variant="outline" 
                    size="xs" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="xs" 
                    disabled={currentPage * pageSize >= processedItems.length}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* AI-Powered Contractual Advice Center */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3.5 mb-4">
              <div>
                <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-widest block mb-0.5">Gemini Contractual Risk Analyst</span>
                <Heading level={3} className="text-xs text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Disputed Billing Liability & Risk Warnings
                </Heading>
              </div>
              <Badge variant="indigo" type="solid" className="text-[9px] py-0.5 px-1.5 font-mono">
                Model: 1.5 PRO
              </Badge>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 leading-relaxed font-mono">
                <span className="text-amber-400 font-bold block mb-1">⚠️ [Alert-MEP-04] Over-Claim Liability on BOQ-308 (PVC Cable Sleeves):</span>
                Subcontractor claims <strong>3,000m</strong> installed, representing a jump of 1,800m. Computer Vision scans detect that 4 sleeves were omitted in structural Floor Slab Level 12. Proceeding with certification represents a overpayment risk of <strong className="text-white">₹5,58,000</strong>. We advise withholding payment until missing sleeves are completed via structural cores.
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 leading-relaxed font-mono">
                <span className="text-emerald-400 font-bold block mb-1">✓ [Compliance-DRY-01] Matching Approved Drywall Partition:</span>
                BOQ-411 matches design coordinate Whitefield-B at <strong>10,800 sqft</strong> with 100% confidence. Payment of <strong className="text-white">₹8,64,000</strong> is completely validated and cleared for progress release.
              </div>
            </div>
          </div>

        </div>

        {/* Right Section: Real-Time Audit Logs & Role Permissions Panel (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Active Operator Context Card */}
          <Card 
            radius="xl"
            header={
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider mb-0.5">Current Session Authorization</span>
                <Heading level={4} className="text-xs font-mono font-bold uppercase text-slate-800">
                  Permissions Guard
                </Heading>
              </div>
            }
          >
            <div className="flex flex-col gap-3">
              <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg flex items-start gap-2.5">
                <span className="p-1 rounded bg-indigo-100 text-indigo-600 mt-0.5 shrink-0">
                  {rolesInfo[userRole].icon}
                </span>
                <div className="flex-1 text-xs leading-relaxed">
                  <span className="font-black text-indigo-900 block font-mono uppercase text-[10px]">{rolesInfo[userRole].label}</span>
                  <span className="text-slate-500 font-medium font-mono text-[9.5px]">Clearance: {rolesInfo[userRole].permissions}</span>
                </div>
              </div>

              {userRole === "Client_QS" ? (
                <div className="text-[11px] leading-relaxed text-rose-600 bg-rose-50/30 border border-rose-100 p-3 rounded-lg font-mono">
                  🔒 Audit Mode Active: Manual adjustment of percentage cells is restricted to Contractor PM role. Use comments to flag disputations.
                </div>
              ) : (
                <div className="text-[11.5px] leading-relaxed text-indigo-700 bg-indigo-50/30 border border-indigo-100/50 p-3 rounded-lg">
                  💡 PM Mode Active: You can write directly inside the Approved % column or click the AI checkbox to reconcile quantities.
                </div>
              )}
            </div>
          </Card>

          {/* Chronological Billing Audit Trail Logs */}
          <Card 
            radius="xl"
            header={
              <div className="flex justify-between items-center w-full">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-500" />
                  Dispute & Valuation Audit trail
                </h3>
                <span className="text-[9px] text-slate-400 font-mono">Real-Time Ledger</span>
              </div>
            }
          >
            <div className="flex flex-col gap-3">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3 bg-slate-50 border border-slate-150 rounded-lg flex flex-col gap-1 text-[11px] animate-fade-in"
                >
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>{log.timestamp}</span>
                    <span className="text-indigo-600 font-bold">{log.role}</span>
                  </div>
                  <span className="font-bold text-slate-800 text-[11px] leading-snug">
                    {log.user}: {log.action}
                  </span>
                  <div className="flex justify-between items-center text-[9.5px] font-mono mt-1 text-slate-500">
                    {log.boqCode ? (
                      <span className="bg-slate-200/60 px-1 py-0.5 rounded font-bold">{log.boqCode}</span>
                    ) : (
                      <span />
                    )}
                    <span className="font-bold text-slate-700">{log.amountImpacted}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

      {/* ============================================================================
          4. SPLIT-PANEL 3D CO-ORDINATE DISPUTE SANDBOX MODAL (BIM-Reality Comparison)
          ============================================================================ */}
      <Dialog 
        isOpen={selectedDisputeItem !== null} 
        onClose={() => setSelectedDisputeItem(null)} 
        title={`Disputed Valuation Sandbox: ${selectedDisputeItem?.code}`}
        description="Verify subcontractor payment applications using direct spatial computer vision photographs and design models."
      >
        {selectedDisputeItem && (
          <div className="flex flex-col gap-4">
            
            {/* KPI mismatch delta box */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-150">
              <div className="text-left">
                <span className="text-[9px] text-slate-400 block uppercase font-mono">Contractor Claim</span>
                <span className="text-xs font-black text-slate-800 font-mono">
                  {selectedDisputeItem.currentClaimedQty} {selectedDisputeItem.unit}
                </span>
                <span className="text-[9px] text-amber-600 font-bold block font-mono">
                  ({formatCurrency(selectedDisputeItem.currentClaimedQty * selectedDisputeItem.unitRate)})
                </span>
              </div>
              <div className="text-left">
                <span className="text-[9px] text-slate-400 block uppercase font-mono">AI Verified Proof</span>
                <span className="text-xs font-black text-indigo-700 font-mono">
                  {selectedDisputeItem.aiVerifiedQty} {selectedDisputeItem.unit}
                </span>
                <span className="text-[9px] text-indigo-600 font-bold block font-mono">
                  ({formatCurrency(selectedDisputeItem.aiVerifiedQty * selectedDisputeItem.unitRate)})
                </span>
              </div>
              <div className="text-left border-l border-slate-200 pl-3">
                <span className="text-[9px] text-slate-400 block uppercase font-mono">Claim Overdraft Risk</span>
                <span className="text-xs font-black text-rose-600 font-mono">
                  -{formatCurrency((selectedDisputeItem.currentClaimedQty - selectedDisputeItem.aiVerifiedQty) * selectedDisputeItem.unitRate)}
                </span>
                <span className="text-[9.5px] text-rose-500 font-bold font-mono">Discrepancy</span>
              </div>
            </div>

            {/* Core discrepancy explanation description */}
            <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-lg text-rose-900 text-xs leading-relaxed font-mono">
              <strong>Deviations Reason:</strong> {selectedDisputeItem.discrepancyReason || "Subcontractor claiming uninstalled quantities. Panoramic photogrammetry shows incomplete work packages in this section."}
            </div>

            {/* Split Screen Slider Simulation */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider flex justify-between">
                <span>Model Design Twin (Left {100 - sliderPosition}%)</span>
                <span>Reality Walk proof (Right {sliderPosition}%)</span>
              </span>
              
              <div className="h-44 bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden flex items-center justify-center">
                
                {/* Left Visual side (BIM Wireframe simulation) */}
                <div 
                  className="absolute inset-y-0 left-0 bg-slate-950 flex flex-col items-center justify-center border-r border-indigo-500 transition-all text-center p-3"
                  style={{ width: `${100 - sliderPosition}%` }}
                >
                  <Layers className="w-8 h-8 text-indigo-500 opacity-60 mb-2" />
                  <span className="text-[8px] uppercase font-mono text-indigo-400 font-bold truncate block w-full">Revit Coordinate Twin</span>
                  <span className="text-[10px] text-white font-mono font-black truncate block w-full">{selectedDisputeItem.code} Design</span>
                </div>

                {/* Right Visual side (Reality photogrammetry) */}
                <div 
                  className="absolute inset-y-0 right-0 bg-slate-900 flex flex-col items-center justify-center transition-all text-center p-3"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <Camera className="w-8 h-8 text-emerald-500 opacity-60 mb-2" />
                  <span className="text-[8px] uppercase font-mono text-emerald-400 font-bold truncate block w-full">Field Scan Photo ID #992</span>
                  <span className="text-[10px] text-white font-mono font-black truncate block w-full">Verified Reality</span>
                </div>

                {/* Split indicator handle bar */}
                <div 
                  className="absolute inset-y-0 bg-indigo-500 w-1 pointer-events-none"
                  style={{ left: `${100 - sliderPosition}%` }}
                />
              </div>

              {/* Slider Controller */}
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={sliderPosition} 
                onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
              />
            </div>

            {/* Comment Area with Input validation check */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 font-mono">Dispute Decision Commentary</label>
              <textarea 
                placeholder="Enter formal reasons for withholding payment claims or approving customized percentages..."
                value={disputeComment}
                onChange={(e) => setDisputeComment(e.target.value)}
                maxLength={200}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-indigo-500 font-sans h-16 resize-none"
              />
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Adheres to TracProgress contract regulations</span>
                <span>{disputeComment.length}/200 characters</span>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex justify-end gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedDisputeItem(null)}
              >
                Close Viewport
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={submitDisputeResolution}
                disabled={userRole === "Client_QS"}
              >
                Apply AI Deduction & certify
              </Button>
            </div>

          </div>
        )}
      </Dialog>

    </div>
  );
}
