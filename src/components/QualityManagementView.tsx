import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ClipboardCheck, 
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
  History,
  FileCheck,
  RefreshCw,
  Camera,
  Layers,
  Award,
  BookOpen,
  UserCheck,
  Trash2,
  FileText,
  Thermometer,
  Sparkles,
  Signature
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
// 1. DATA TYPES & INTERFACES FOR QMS
// ============================================================================

export interface InspectionRequest {
  id: string;
  code: string;
  title: string;
  discipline: "Structure" | "MEP" | "Waterproofing" | "Finishes";
  location: string;
  checklistName: string;
  checklistItems: { label: string; checked: boolean }[];
  requestedDate: string;
  status: "Pending" | "Approved" | "Rejected";
  inspector: string;
  contractorRepresentative: string;
  photoUrl?: string;
  signatureData?: string; // Digital signature indicator
  refBimElementId?: string;
}

export interface NCRReport {
  id: string;
  code: string;
  title: string;
  severity: "Critical" | "Major" | "Minor";
  status: "Open" | "In_Remediation" | "Closed";
  rootCause: string;
  loggedDate: string;
  correctiveAction: string;
  preventiveAction: string;
  photoUrl: string;
  aiRiskMultiplier: number; // Multicast threat level
  assignedTo: string;
  location: string;
}

export interface ConcreteCubeTest {
  id: string;
  castDate: string;
  cubeBatchCode: string;
  mixGrade: "M30" | "M35" | "M40" | "M50";
  pourLocation: string;
  slumpValue: number; // in mm (e.g. 110mm)
  strength7Day: number; // in N/mm² (Target ~70% of characteristic strength)
  strength28Day: number; // in N/mm² (Target >= 100%)
  status: "Pending" | "Pass" | "Fail";
  testedBy: string;
}

export interface QMSAuditLog {
  id: string;
  timestamp: string;
  operator: string;
  role: string;
  action: string;
  refCode?: string;
}

// ============================================================================
// 2. SEED DATA
// ============================================================================

const SEED_INSPECTIONS: InspectionRequest[] = [
  {
    id: "ir-1",
    code: "IR-STR-104",
    title: "Level 14 Column Rebar Reinforcement Placement",
    discipline: "Structure",
    location: "Core Wall Zone B, Floor 14",
    checklistName: "Column Rebar Cast Checklist",
    checklistItems: [
      { label: "Main vertical bars spacing and alignment compliant with design specs", checked: true },
      { label: "Links (stirrups) spaced at 150mm c/c spacing with hook angle at 135°", checked: true },
      { label: "Concrete spacer blocks (40mm cover) securely tied to reinforcement", checked: true },
      { label: "Lapping zone checked and rebar surfaces free of loose rust or oil", checked: true },
      { label: "Formwork layout plumbness and internal cleanout pocket certified", checked: false }
    ],
    requestedDate: "2026-07-12",
    status: "Pending",
    inspector: "Mr. Rajan Deshmukh (Client QS / PM)",
    contractorRepresentative: "Vikas Sharma (MC Lead Engineer)",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop",
    signatureData: "Digitally Signed by V.S.",
    refBimElementId: "col_L14_A2"
  },
  {
    id: "ir-2",
    code: "IR-WP-310",
    title: "Terrace Waterproofing Polyurethane Membrane Coating",
    discipline: "Waterproofing",
    location: "Block B Terrace Roof Zone C",
    checklistName: "PU Elastomeric Membrane Waterproofing Inspection",
    checklistItems: [
      { label: "Surface prepared, fully scrubbed, and all structural cracks sealed with PU sealant", checked: true },
      { label: "Primer coat cured with zero bubbles, pinholes, or surface delamination", checked: true },
      { label: "Double coat applied perpendicular with corners detailed using reinforcing mesh geotextile", checked: true },
      { label: "24-hour pond test done: Water leveled at 50mm height with zero ceiling dampness on floor below", checked: true }
    ],
    requestedDate: "2026-07-10",
    status: "Approved",
    inspector: "Amit Kulkarni (L&T Senior QS)",
    contractorRepresentative: "Gaurav Malhotra (Waterproofing Lead)",
    photoUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop",
    signatureData: "Digitally Signed by A.K.",
    refBimElementId: "slab_L18_roof"
  },
  {
    id: "ir-3",
    code: "IR-MEP-211",
    title: "Core Riser Drainage Main Sleeve Embedments",
    discipline: "MEP",
    location: "Slab Opening level 12, Shaft 4",
    checklistName: "MEP Casting Penetration Protocol",
    checklistItems: [
      { label: "Sleeve size matches isometric schematic layouts perfectly", checked: false },
      { label: "Waterstop collar installed and structural blockouts positioned", checked: true },
      { label: "Sleeves rigidly secured to formwork to prevent flotation during pour", checked: true }
    ],
    requestedDate: "2026-07-14",
    status: "Rejected",
    inspector: "Amit Kulkarni (L&T Senior QS)",
    contractorRepresentative: "Vikas Sharma (MC Lead Engineer)",
    photoUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=600&auto=format&fit=crop",
    refBimElementId: "hvac_riser_l12"
  }
];

const SEED_NCRS: NCRReport[] = [
  {
    id: "ncr-1",
    code: "NCR-STR-012",
    title: "Structural Honeycombing in Lift Core shear Wall",
    severity: "Critical",
    status: "In_Remediation",
    rootCause: "Poor consolidation and shuttering vibration failure at Level 10 lift wall core pour.",
    loggedDate: "2026-07-05",
    correctiveAction: "Chipping loose concrete, exposing rebars, and pouring micro-concrete (non-shrink grout grade GP2) under pressure.",
    preventiveAction: "Mandate auxiliary external high-frequency vibrators for lift core formwork and increase slump to 120mm.",
    photoUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
    aiRiskMultiplier: 4.8,
    assignedTo: "Vikas Sharma (MC Lead)",
    location: "Service Lift Lift-Core, Level 10"
  },
  {
    id: "ncr-2",
    code: "NCR-FIN-004",
    title: "Hollow Tiles Sound and Unlevelled Tiling in West Corridor",
    severity: "Minor",
    status: "Open",
    rootCause: "Inadequate bed trowel ridge coverage and pre-cure foot traffic.",
    loggedDate: "2026-07-13",
    correctiveAction: "De-grout hollow tiles using pneumatic handheld grout saws, apply premium elastic tile adhesive, and level-set.",
    preventiveAction: "Install physical barricades with wet floor curing notices on corridors for 48 hours post-installation.",
    photoUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
    aiRiskMultiplier: 1.2,
    assignedTo: "Ganesh Rao (Finishes contractor)",
    location: "West Corridor Area, Level 2"
  }
];

const SEED_CUBE_TESTS: ConcreteCubeTest[] = [
  {
    id: "cube-1",
    castDate: "2026-06-16",
    cubeBatchCode: "BATCH-M35-102",
    mixGrade: "M35",
    pourLocation: "Level 11 Structural Floor Slab Part A",
    slumpValue: 115,
    strength7Day: 26.5, // 26.5 N/mm2 (passes > 24.5)
    strength28Day: 39.8, // 39.8 N/mm2 (passes > 35)
    status: "Pass",
    testedBy: "Lab Tech Subhash"
  },
  {
    id: "cube-2",
    castDate: "2026-06-18",
    cubeBatchCode: "BATCH-M40-089",
    mixGrade: "M40",
    pourLocation: "Level 12 Lift Core Retaining Wall Section 4",
    slumpValue: 110,
    strength7Day: 29.4,
    strength28Day: 43.1,
    status: "Pass",
    testedBy: "Lab Tech Subhash"
  },
  {
    id: "cube-3",
    castDate: "2026-07-01",
    cubeBatchCode: "BATCH-M35-115",
    mixGrade: "M35",
    pourLocation: "Level 14 Column C12 Casting",
    slumpValue: 125,
    strength7Day: 25.1,
    strength28Day: 0, // Not matured yet
    status: "Pending",
    testedBy: "Lab Tech Subhash"
  }
];

const SEED_QMS_AUDITS: QMSAuditLog[] = [
  {
    id: "qlog-1",
    timestamp: "2026-07-14 09:30:12",
    operator: "Amit Kulkarni",
    role: "L&T Senior QS",
    action: "Logged Material Non-Conformance Report (NCR) for Hollow Corridor tiling.",
    refCode: "NCR-FIN-004"
  },
  {
    id: "qlog-2",
    timestamp: "2026-07-14 10:15:33",
    operator: "System AI Monitor",
    role: "Computer Vision",
    action: "Automatically ran Concrete Strength Maturity Prediction algorithms. 28-day safety factor estimated high at 1.12x.",
    refCode: "BATCH-M35-115"
  }
];

// ============================================================================
// 3. MAIN COMPONENT DEFINITION
// ============================================================================

export default function QualityManagementView() {
  const { activeProject } = useAppStore();

  // Navigation states
  const [activeSubTab, setActiveSubTab] = useState<"ir" | "ncr" | "cube" | "statements">("ir");

  // Domain States with local seeds
  const [inspections, setInspections] = useState<InspectionRequest[]>(SEED_INSPECTIONS);
  const [ncrs, setNcrs] = useState<NCRReport[]>(SEED_NCRS);
  const [cubeTests, setCubeTests] = useState<ConcreteCubeTest[]>(SEED_CUBE_TESTS);
  const [logs, setLogs] = useState<QMSAuditLog[]>(SEED_QMS_AUDITS);

  // Common Search & Filters
  const [search, setSearch] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"MC_PM" | "Client_QS" | "Sub_QS">("MC_PM");

  // Pagination page sizes
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  // New item creators state
  const [selectedInspection, setSelectedInspection] = useState<InspectionRequest | null>(null);
  const [selectedNCR, setSelectedNCR] = useState<NCRReport | null>(null);
  const [isCreateIRModalOpen, setIsCreateIRModalOpen] = useState(false);
  const [isCreateNCRModalOpen, setIsCreateNCRModalOpen] = useState(false);
  const [isCreateCubeModalOpen, setIsCreateCubeModalOpen] = useState(false);

  // Form Fields - IR
  const [newIRCode, setNewIRCode] = useState("IR-STR-105");
  const [newIRTitle, setNewIRTitle] = useState("");
  const [newIRDiscipline, setNewIRDiscipline] = useState<"Structure" | "MEP" | "Waterproofing" | "Finishes">("Structure");
  const [newIRLocation, setNewIRLocation] = useState("");
  const [newIRChecklistName, setNewIRChecklistName] = useState("Reinforcement Cover Inspection");
  const [newIRChecklist, setNewIRChecklist] = useState<string[]>([
    "Check rebar grade and spacing as per structural drawings",
    "Ensure concrete clear cover (at least 40mm) with spacer blocks",
    "Cleanout pocket certified and formwork oil applied"
  ]);

  // Form Fields - NCR
  const [newNCRCode, setNewNCRCode] = useState("NCR-MEP-015");
  const [newNCRTitle, setNewNCRTitle] = useState("");
  const [newNCRSeverity, setNewNCRSeverity] = useState<"Critical" | "Major" | "Minor">("Major");
  const [newNCRRootCause, setNewNCRRootCause] = useState("");
  const [newNCRLocation, setNewNCRLocation] = useState("");

  // Form Fields - Cube
  const [newCubeCode, setNewCubeCode] = useState("BATCH-M35-120");
  const [newCubeGrade, setNewCubeGrade] = useState<"M30" | "M35" | "M40" | "M50">("M35");
  const [newCubeSlump, setNewCubeSlump] = useState(115);
  const [newCubePour, setNewCubePour] = useState("");

  // Keyboard Navigation Index
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // --------------------------------------------------------------------------
  // CALCULATED AI QUALITY SCORE & KPI METRICS
  // --------------------------------------------------------------------------
  const qmsSummary = useMemo(() => {
    const totalIR = inspections.length;
    const approvedIR = inspections.filter(i => i.status === "Approved").length;
    const irPassRate = totalIR > 0 ? (approvedIR / totalIR) * 100 : 100;

    const totalOpenNCRs = ncrs.filter(n => n.status !== "Closed").length;
    
    // Cube failures
    const failedCubes = cubeTests.filter(c => c.status === "Fail").length;
    const cubePassCount = cubeTests.filter(c => c.status === "Pass").length;
    const totalTestedCubes = cubeTests.filter(c => c.status !== "Pending").length;
    const cubeCompliance = totalTestedCubes > 0 ? (cubePassCount / totalTestedCubes) * 100 : 100;

    // AI Quality Score calculation logic
    // Deduct points for open NCRs (10pts per critical, 5pts major, 2pts minor)
    let ncrDeductions = 0;
    ncrs.forEach(n => {
      if (n.status !== "Closed") {
        if (n.severity === "Critical") ncrDeductions += 12;
        else if (n.severity === "Major") ncrDeductions += 6;
        else ncrDeductions += 3;
      }
    });

    // Failing concrete cubes heavily impacts the structure score
    let cubeDeductions = failedCubes * 15;

    // Reject IR percentage impact
    let irDeductions = inspections.filter(i => i.status === "Rejected").length * 5;

    let computedScore = 100 - ncrDeductions - cubeDeductions - irDeductions;
    computedScore = Math.max(40, Math.min(100, computedScore));

    return {
      score: parseFloat(computedScore.toFixed(1)),
      openNCRs: totalOpenNCRs,
      pendingInspections: inspections.filter(i => i.status === "Pending").length,
      cubeCompliance: parseFloat(cubeCompliance.toFixed(1)),
      irPassRate: parseFloat(irPassRate.toFixed(1))
    };
  }, [inspections, ncrs, cubeTests]);

  // --------------------------------------------------------------------------
  // LIST PROCESSORS (Search, Filter, Sort)
  // --------------------------------------------------------------------------
  const processedInspections = useMemo(() => {
    return inspections.filter(item => {
      const matchSearch = item.code.toLowerCase().includes(search.toLowerCase()) || 
                          item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.location.toLowerCase().includes(search.toLowerCase());
      const matchDiscipline = disciplineFilter === "All" || item.discipline === disciplineFilter;
      const matchStatus = statusFilter === "All" || item.status === statusFilter;
      return matchSearch && matchDiscipline && matchStatus;
    });
  }, [inspections, search, disciplineFilter, statusFilter]);

  const processedNCRs = useMemo(() => {
    return ncrs.filter(item => {
      const matchSearch = item.code.toLowerCase().includes(search.toLowerCase()) || 
                          item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.location.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || item.status === statusFilter;
      const matchDiscipline = disciplineFilter === "All" || 
                              (disciplineFilter === "Structure" && item.code.includes("STR")) ||
                              (disciplineFilter === "Finishes" && item.code.includes("FIN")) ||
                              (disciplineFilter === "MEP" && item.code.includes("MEP"));
      return matchSearch && matchStatus && matchDiscipline;
    });
  }, [ncrs, search, statusFilter, disciplineFilter]);

  const processedCubes = useMemo(() => {
    return cubeTests.filter(item => {
      const matchSearch = item.cubeBatchCode.toLowerCase().includes(search.toLowerCase()) || 
                          item.pourLocation.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || item.status === statusFilter;
      const matchDiscipline = disciplineFilter === "All" || 
                              (disciplineFilter === "Structure" && item.mixGrade !== "M30") ||
                              (disciplineFilter === "Finishes" && item.mixGrade === "M30");
      return matchSearch && matchStatus && matchDiscipline;
    });
  }, [cubeTests, search, statusFilter, disciplineFilter]);

  // Handle active sub-tab switching & resetting page
  useEffect(() => {
    setCurrentPage(1);
    setSearch("");
    setDisciplineFilter("All");
    setStatusFilter("All");
  }, [activeSubTab]);

  // --------------------------------------------------------------------------
  // ACTIONS & BUSINESS OPERATIONS
  // --------------------------------------------------------------------------
  
  // Submit New Inspection Request (IR)
  const submitCreateIR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIRTitle || !newIRLocation) {
      triggerNotification("Error: Please provide a valid title and location context.");
      return;
    }

    const newIR: InspectionRequest = {
      id: `ir-${Date.now()}`,
      code: newIRCode,
      title: newIRTitle,
      discipline: newIRDiscipline,
      location: newIRLocation,
      checklistName: newIRChecklistName,
      checklistItems: newIRChecklist.map(label => ({ label, checked: false })),
      requestedDate: new Date().toISOString().substring(0, 10),
      status: "Pending",
      inspector: "Amit Kulkarni (L&T Senior QS)",
      contractorRepresentative: "Vikas Sharma (MC Lead Engineer)",
      photoUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop"
    };

    setInspections(prev => [newIR, ...prev]);

    // Audit log
    const newAudit: QMSAuditLog = {
      id: `qlog-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      operator: "Vikas Sharma",
      role: "MC Lead Engineer",
      action: `Created new Inspection Request (IR) for review.`,
      refCode: newIRCode
    };
    setLogs(prev => [newAudit, ...prev]);

    triggerNotification(`Optimistic Update: logged ${newIRCode} into the live QMS database.`);
    setIsCreateIRModalOpen(false);
    setNewIRTitle("");
    setNewIRLocation("");
  };

  // Submit New Non-Conformance Report (NCR)
  const submitCreateNCR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNCRTitle || !newNCRLocation) {
      triggerNotification("Error: Title and location are required structural fields.");
      return;
    }

    const newNcr: NCRReport = {
      id: `ncr-${Date.now()}`,
      code: newNCRCode,
      title: newNCRTitle,
      severity: newNCRSeverity,
      status: "Open",
      rootCause: newNCRRootCause || "Awaiting physical laboratory root cause breakdown.",
      loggedDate: new Date().toISOString().substring(0, 10),
      correctiveAction: "Contractor PM to supply corrective plan within 48 hours.",
      preventiveAction: "Requires method statement compliance update.",
      photoUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
      aiRiskMultiplier: newNCRSeverity === "Critical" ? 4.5 : (newNCRSeverity === "Major" ? 2.5 : 1.1),
      assignedTo: "Vikas Sharma (MC Lead)",
      location: newNCRLocation
    };

    setNcrs(prev => [newNcr, ...prev]);

    const newAudit: QMSAuditLog = {
      id: `qlog-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      operator: "Amit Kulkarni",
      role: "L&T Senior QS",
      action: `Logged severe non-conformance warning on reality mismatch.`,
      refCode: newNCRCode
    };
    setLogs(prev => [newAudit, ...prev]);

    triggerNotification(`Warning: logged Non-Conformance Report ${newNCRCode}. Score recalculated.`);
    setIsCreateNCRModalOpen(false);
    setNewNCRTitle("");
    setNewNCRLocation("");
    setNewNCRRootCause("");
  };

  // Submit New Concrete cube Cast test record
  const submitCreateCube = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCubePour) {
      triggerNotification("Error: Pour location context is mandatory.");
      return;
    }

    const newCube: ConcreteCubeTest = {
      id: `cube-${Date.now()}`,
      castDate: new Date().toISOString().substring(0, 10),
      cubeBatchCode: newCubeCode,
      mixGrade: newCubeGrade,
      pourLocation: newCubePour,
      slumpValue: newCubeSlump,
      strength7Day: 0,
      strength28Day: 0,
      status: "Pending",
      testedBy: "Lab Tech Subhash"
    };

    setCubeTests(prev => [newCube, ...prev]);

    const newAudit: QMSAuditLog = {
      id: `qlog-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      operator: "Lab Assistant Subhash",
      role: "Concrete Quality Auditor",
      action: `Logged fresh concrete batch casting records into pour logs.`,
      refCode: newCubeCode
    };
    setLogs(prev => [newAudit, ...prev]);

    triggerNotification(`Success: Concrete batch ${newCubeCode} pour registered.`);
    setIsCreateCubeModalOpen(false);
    setNewCubePour("");
  };

  // Approve Inspection Request (Form clearance)
  const approveInspection = (id: string) => {
    if (role === "Sub_QS") {
      triggerNotification("Security block: Subcontractor role has read-only submission clearance.");
      return;
    }

    setInspections(prev => prev.map(item => {
      if (item.id === id) {
        const newAudit: QMSAuditLog = {
          id: `qlog-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          operator: "Amit Kulkarni",
          role: "L&T Senior QS",
          action: `Certified and signed off Inspection Request: ${item.code}`,
          refCode: item.code
        };
        setLogs(logs => [newAudit, ...logs]);

        return { ...item, status: "Approved", signatureData: "Signed by Auditor Amit" };
      }
      return item;
    }));
    triggerNotification(`Inspection certified successfully!`);
    setSelectedInspection(null);
  };

  // Reject Inspection Request (Requires remediation)
  const rejectInspection = (id: string) => {
    if (role === "Sub_QS") {
      triggerNotification("Security block: Subcontractor cannot reject inspection.");
      return;
    }

    setInspections(prev => prev.map(item => {
      if (item.id === id) {
        const newAudit: QMSAuditLog = {
          id: `qlog-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          operator: "Amit Kulkarni",
          role: "L&T Senior QS",
          action: `Rejected and flagged Inspection Request: ${item.code}`,
          refCode: item.code
        };
        setLogs(logs => [newAudit, ...logs]);

        return { ...item, status: "Rejected" };
      }
      return item;
    }));
    triggerNotification(`Inspection rejected. Workorder returned for re-shuttering.`);
    setSelectedInspection(null);
  };

  // Toggle Checklist item in inspection detail popup
  const toggleChecklistItem = (insId: string, itemIdx: number) => {
    setInspections(prev => prev.map(ins => {
      if (ins.id === insId) {
        const updatedChecklist = ins.checklistItems.map((chk, idx) => {
          if (idx === itemIdx) return { ...chk, checked: !chk.checked };
          return chk;
        });
        return { ...ins, checklistItems: updatedChecklist };
      }
      return ins;
    }));
  };

  // Trigger 28-Day Strength Test Simulation
  const simulate28DayTest = (id: string, pass: boolean) => {
    setCubeTests(prev => prev.map(cube => {
      if (cube.id === id) {
        const finalStrength = pass ? (cube.mixGrade === "M35" ? 38.4 : 44.5) : (cube.mixGrade === "M35" ? 31.2 : 36.8);
        const finalStatus = pass ? "Pass" as const : "Fail" as const;

        const newAudit: QMSAuditLog = {
          id: `qlog-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          operator: "Lab Tech Subhash",
          role: "Concrete Quality Auditor",
          action: `Conducted 28-Day Compressive Strength crush. Status: ${finalStatus}`,
          refCode: cube.cubeBatchCode
        };
        setLogs(logs => [newAudit, ...logs]);

        return {
          ...cube,
          strength7Day: cube.strength7Day === 0 ? (pass ? 25.4 : 20.1) : cube.strength7Day,
          strength28Day: finalStrength,
          status: finalStatus
        };
      }
      return cube;
    }));

    triggerNotification(`Simulated crushing complete. Record updated.`);
  };

  // Simulate Cloud Sync action
  const runLiveQMSAudit = () => {
    setIsLoading(true);
    triggerNotification("Computing digital twin anomalies with laser-mesh models...");
    setTimeout(() => {
      setIsLoading(false);
      triggerNotification("Audit complete: 2 minor tiling anomalies synced to QMS issues ledger.");
    }, 1500);
  };

  // Keyboard navigation helpers
  const itemsCount = useMemo(() => {
    if (activeSubTab === "ir") return processedInspections.length;
    if (activeSubTab === "ncr") return processedNCRs.length;
    return processedCubes.length;
  }, [activeSubTab, processedInspections, processedNCRs, processedCubes]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(itemsCount - 1, prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(0, prev - 1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      if (activeSubTab === "ir") {
        setSelectedInspection(processedInspections[focusedIndex]);
      } else if (activeSubTab === "ncr") {
        setSelectedNCR(processedNCRs[focusedIndex]);
      }
    }
  };

  return (
    <div 
      className="flex flex-col gap-6 animate-fade-in text-slate-700 font-sans" 
      id="quality-management-module-root"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      
      {/* 1. TOP HEADER BRANDING & GLOBAL ACTIONS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <ClipboardCheck className="w-5 h-5" />
            </span>
            <div>
              <Heading level={2} className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                Enterprise Quality Management System (QMS)
                <Badge variant="indigo" type="solid" className="py-0.5 px-2 text-[8px]">
                  ISO 9001:2015
                </Badge>
              </Heading>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Comprehensive site quality control, concrete cube register, and digital inspection sign-offs integrated with LiDAR twin analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
          
          {/* Role Switching Simulator */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[9px] text-slate-400 font-bold font-mono uppercase px-1.5">Authority:</span>
            {(["MC_PM", "Client_QS", "Sub_QS"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  triggerNotification(`Authorized role: ${r === "MC_PM" ? "Contractor PM" : r === "Client_QS" ? "Client QS" : "Sub QS"}`);
                }}
                className={`px-2.5 py-1 text-[9px] font-bold rounded-md font-mono transition ${
                  role === r 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {r === "MC_PM" ? "Contractor" : r === "Client_QS" ? "L&T Auditor" : "Sub QS"}
              </button>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsOffline(!isOffline)}
            leftIcon={isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-500" /> : <Wifi className="w-3.5 h-3.5 text-emerald-500" />}
          >
            {isOffline ? "Offline Sandbox" : "Online Sync"}
          </Button>

          <Button 
            variant="secondary" 
            size="sm" 
            onClick={runLiveQMSAudit}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Run LiDAR QA Audit
          </Button>
        </div>
      </div>

      {/* REAL-TIME OPTIMISTIC NOTIFICATION BANNER */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-between text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              <span>{notification}</span>
            </div>
            <span className="text-[9px] font-mono text-indigo-400 uppercase bg-slate-950 px-2 py-0.5 rounded">QMS Secure Sync</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HIGH-FIDELITY KPI QMS METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Real-time AI Quality Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10">
            <Award className="w-24 h-24 text-indigo-400" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-indigo-300 font-mono uppercase font-bold tracking-wider">AI Quality Score</span>
            <Badge variant="indigo" type="solid" className="text-[8px] flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Core Grade
            </Badge>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-white font-mono">{qmsSummary.score}%</span>
            <div className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-400" /> Level A Rating
            </div>
          </div>
        </div>

        {/* Metric 2: Open Non-Conformance Reports (NCR) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Open NCR / CAR / PAR</span>
            <span className="p-1 rounded bg-rose-50 text-rose-600"><AlertTriangle className="w-4 h-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-rose-600 font-mono">{qmsSummary.openNCRs}</span>
            <div className="text-[10px] text-rose-500 font-bold font-mono mt-0.5">
              Requires immediate action
            </div>
          </div>
        </div>

        {/* Metric 3: Pending Inspection Requests (IR) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Pending IR Approvals</span>
            <span className="p-1 rounded bg-amber-50 text-amber-600"><FileText className="w-4 h-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-600 font-mono">{qmsSummary.pendingInspections}</span>
            <div className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">
              Awaiting L&T signoff
            </div>
          </div>
        </div>

        {/* Metric 4: Concrete Cube Test Compliance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Concrete Compliance Rate</span>
            <span className="p-1 rounded bg-emerald-50 text-emerald-600"><Thermometer className="w-4 h-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-600 font-mono">{qmsSummary.cubeCompliance}%</span>
            <div className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5">
              Passed 28-day target crush
            </div>
          </div>
        </div>

        {/* Metric 5: Inspection Request Pass Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">IR Approval Pass Rate</span>
            <span className="p-1 rounded bg-indigo-50 text-indigo-600"><CheckCircle className="w-4 h-4" /></span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-indigo-600 font-mono">{qmsSummary.irPassRate}%</span>
            <div className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">
              First-time clearance
            </div>
          </div>
        </div>

      </div>

      {/* 3. SUB-NAVIGATION FOR QMS MODULE */}
      <div className="flex bg-slate-100 p-1 rounded-xl self-start border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveSubTab("ir")}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === "ir" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Inspection Requests (IR)</span>
          <Badge variant="indigo" type="soft" className="text-[8px] py-0 px-1">{inspections.length}</Badge>
        </button>

        <button
          onClick={() => setActiveSubTab("ncr")}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === "ncr" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>NCR / CAR / PAR Ledger</span>
          <Badge variant="rose" type="soft" className="text-[8px] py-0 px-1">{ncrs.length}</Badge>
        </button>

        <button
          onClick={() => setActiveSubTab("cube")}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === "cube" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Thermometer className="w-4 h-4" />
          <span>Concrete Lab Register</span>
          <Badge variant="emerald" type="soft" className="text-[8px] py-0 px-1">{cubeTests.length}</Badge>
        </button>

        <button
          onClick={() => setActiveSubTab("statements")}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeSubTab === "statements" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Method Statements & Handover</span>
        </button>
      </div>

      {/* 4. WORKSPACE MATRIX AND SIDE ACTIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left main matrix screen (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          <Card 
            radius="xl"
            header={
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse" />
                    {activeSubTab === "ir" ? "Site Works Inspection Requests" : 
                     activeSubTab === "ncr" ? "Non-Conformance & Corrective Actions" : 
                     activeSubTab === "cube" ? "Compressive Cube Crush Register" : "Standard Quality Method Statements"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Click on items to inspect documentation, edit check-lists, or apply digital sign-offs.</p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  {activeSubTab === "ir" && (
                    <Button 
                      variant="primary" 
                      size="xs" 
                      onClick={() => setIsCreateIRModalOpen(true)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      New Inspection Request
                    </Button>
                  )}
                  {activeSubTab === "ncr" && (
                    <Button 
                      variant="primary" 
                      size="xs" 
                      onClick={() => setIsCreateNCRModalOpen(true)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Log Deviation NCR
                    </Button>
                  )}
                  {activeSubTab === "cube" && (
                    <Button 
                      variant="primary" 
                      size="xs" 
                      onClick={() => setIsCreateCubeModalOpen(true)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Register Cube Batch
                    </Button>
                  )}
                </div>
              </div>
            }
          >
            {/* SEARCH AND FILTERS TOOLBAR */}
            <div className="flex flex-wrap gap-3 pb-4 mb-2 border-b border-slate-100">
              <div className="flex-1 min-w-[200px]">
                <Input 
                  placeholder="Search code, location, or parameter..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="w-40">
                <Dropdown 
                  label=""
                  placeholder="Discipline"
                  value={disciplineFilter}
                  onChange={(val) => setDisciplineFilter(val)}
                  options={[
                    { value: "All", label: "All Disciplines" },
                    { value: "Structure", label: "Structural Works" },
                    { value: "MEP", label: "MEP Services" },
                    { value: "Finishes", label: "Interior Finishes" },
                    { value: "Waterproofing", label: "Waterproofing" }
                  ]}
                />
              </div>

              <div className="w-40">
                <Dropdown 
                  label=""
                  placeholder="Status"
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  options={[
                    { value: "All", label: "All Statuses" },
                    { value: "Pending", label: "Pending" },
                    { value: "Approved", label: "Approved / Pass" },
                    { value: "Rejected", label: "Rejected / Fail" },
                    { value: "Open", label: "Open NCR" },
                    { value: "In_Remediation", label: "In Remediation" }
                  ]}
                />
              </div>
            </div>

            {/* TAB-SPECIFIC CONTENT LAYOUTS */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Skeleton variant="card" height="150px" />
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </div>
            ) : (
              <>
                {/* 1. INSPECTIONS VIEW */}
                {activeSubTab === "ir" && (
                  processedInspections.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs select-none">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                            <th className="p-3">IR Code</th>
                            <th className="p-3">Request Title</th>
                            <th className="p-3">Location Context</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-right">Requested Date</th>
                            <th className="p-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {processedInspections.map((item, index) => {
                            const isFocused = focusedIndex === index;
                            return (
                              <tr 
                                key={item.id}
                                className={`transition ${isFocused ? "bg-indigo-50/20 ring-1 ring-indigo-500" : "hover:bg-slate-50/50"}`}
                              >
                                <td className="p-3 font-mono font-bold text-slate-900">{item.code}</td>
                                <td className="p-3">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-700">{item.title}</span>
                                    <span className="text-[10px] text-indigo-500 font-mono mt-0.5">{item.discipline} • {item.checklistName}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-slate-500 font-mono text-[10.5px]">{item.location}</td>
                                <td className="p-3 text-center">
                                  <Badge 
                                    variant={
                                      item.status === "Approved" ? "emerald" : 
                                      (item.status === "Rejected" ? "rose" : "amber")
                                    } 
                                    type={item.status === "Pending" ? "soft" : "solid"}
                                    className="text-[9px] font-mono font-black"
                                  >
                                    {item.status}
                                  </Badge>
                                </td>
                                <td className="p-3 text-right font-mono text-slate-400">{item.requestedDate}</td>
                                <td className="p-3 text-center">
                                  <div className="flex justify-center gap-2">
                                    <button 
                                      onClick={() => setSelectedInspection(item)}
                                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded text-[10px] font-mono transition"
                                    >
                                      Inspect & Sign
                                    </button>
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
                      title="No Inspections Found" 
                      description="No structural or MEP inspection requests match your selection tags. Modify filters to view."
                    />
                  )
                )}

                {/* 2. NCR LEDGER VIEW */}
                {activeSubTab === "ncr" && (
                  processedNCRs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {processedNCRs.map((ncr) => (
                        <div 
                          key={ncr.id} 
                          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-200 transition shadow-xs"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-mono font-bold text-slate-900 text-xs">{ncr.code}</span>
                              <div className="flex gap-1">
                                <Badge variant={ncr.severity === "Critical" ? "rose" : (ncr.severity === "Major" ? "orange" : "slate")} type="solid" className="text-[8px] py-0">
                                  {ncr.severity}
                                </Badge>
                                <Badge variant={ncr.status === "Open" ? "rose" : (ncr.status === "In_Remediation" ? "amber" : "emerald")} type="soft" className="text-[8px] py-0">
                                  {ncr.status.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>

                            <h4 className="font-bold text-slate-800 text-xs mb-1.5 leading-snug">{ncr.title}</h4>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3"><strong>Root Cause:</strong> {ncr.rootCause}</p>

                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3 text-[10.5px] leading-snug">
                              <span className="text-rose-600 font-bold block mb-0.5">Corrective Action Request (CAR):</span>
                              <p className="text-slate-600 font-mono text-[9.5px]">{ncr.correctiveAction}</p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-mono">Assigned: <strong className="text-slate-600 font-sans">{ncr.assignedTo}</strong></span>
                            <button 
                              onClick={() => setSelectedNCR(ncr)}
                              className="text-indigo-600 hover:text-indigo-900 font-bold font-mono"
                            >
                              Details & Photos →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      title="No Active NCRs Logged" 
                      description="Clean record: No active non-conformance structural risks logged against current floor elevations."
                    />
                  )
                )}

                {/* 3. CONCRETE LAB REGISTER VIEW */}
                {activeSubTab === "cube" && (
                  processedCubes.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs select-none">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                            <th className="p-3">Cube Batch Code</th>
                            <th className="p-3">Pour Location</th>
                            <th className="p-3 text-right">Slump Value</th>
                            <th className="p-3 text-right">7-Day Crush</th>
                            <th className="p-3 text-right">28-Day Crush</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-center">Crush Tests</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {processedCubes.map((cube) => {
                            const isFailed = cube.status === "Fail";
                            return (
                              <tr key={cube.id} className="hover:bg-slate-50/50">
                                <td className="p-3">
                                  <div className="flex flex-col">
                                    <span className="font-mono font-bold text-slate-950">{cube.cubeBatchCode}</span>
                                    <span className="text-[10px] text-indigo-500 font-mono">Grade: {cube.mixGrade} • Cast: {cube.castDate}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-slate-600 max-w-[200px] font-medium leading-snug">{cube.pourLocation}</td>
                                <td className="p-3 text-right font-mono text-slate-500">{cube.slumpValue} mm</td>
                                <td className="p-3 text-right font-mono font-bold">
                                  {cube.strength7Day > 0 ? `${cube.strength7Day} N/mm²` : <span className="text-slate-300 font-normal">Awaiting 7d</span>}
                                </td>
                                <td className="p-3 text-right font-mono font-bold">
                                  {cube.strength28Day > 0 ? (
                                    <span className={isFailed ? "text-rose-600" : "text-emerald-600"}>
                                      {cube.strength28Day} N/mm²
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 font-normal">Awaiting 28d</span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <Badge 
                                    variant={
                                      cube.status === "Pass" ? "emerald" : 
                                      (cube.status === "Fail" ? "rose" : "amber")
                                    }
                                    type="solid"
                                    className="text-[9px]"
                                  >
                                    {cube.status}
                                  </Badge>
                                </td>
                                <td className="p-3 text-center">
                                  {cube.status === "Pending" ? (
                                    <div className="flex justify-center gap-1">
                                      <button 
                                        onClick={() => simulate28DayTest(cube.id, true)}
                                        className="p-1 hover:bg-emerald-50 border border-emerald-200 text-emerald-600 rounded"
                                        title="Simulate Crush Pass"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => simulate28DayTest(cube.id, false)}
                                        className="p-1 hover:bg-rose-50 border border-rose-200 text-rose-600 rounded"
                                        title="Simulate Crush Fail"
                                      >
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-mono">Crushed</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState 
                      title="No Concrete Batches Logged" 
                      description="Zero concrete cube cast tests detected in current selection parameters."
                    />
                  )
                )}

                {/* 4. METHOD STATEMENTS & HANDOVER */}
                {activeSubTab === "statements" && (
                  <div className="flex flex-col gap-4 mt-2">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] text-indigo-500 font-mono font-bold uppercase tracking-widest block">Approved Method Statement</span>
                          <Badge variant="emerald" type="solid" className="text-[8.5px] py-0 px-1.5">Approved</Badge>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs mb-1.5">MS-ST-WP-201: Crystalline Waterproofing for Basements</h4>
                        <p className="text-[11.5px] text-slate-400 leading-relaxed mb-4">
                          Comprehensive sequence of waterproofing application, surface scrubbing parameters, and mechanical anchor embedments. Reconciles directly with Level -2 foundation sumps.
                        </p>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200/60 pt-3">
                          <span>Revision: <strong>v3.2</strong></span>
                          <span>Author: <strong>L&T Engineering Design</strong></span>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] text-indigo-500 font-mono font-bold uppercase tracking-widest block">Approved Method Statement</span>
                          <Badge variant="emerald" type="solid" className="text-[8.5px] py-0 px-1.5">Approved</Badge>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs mb-1.5">MS-MEP-RE-402: Fire Sprinkler Riser Vertical Casting Protocol</h4>
                        <p className="text-[11.5px] text-slate-400 leading-relaxed mb-4">
                          Detailed method statements for embedding wet riser sleeves into vertical wall castings, concrete grade M40 minimum with 40mm spacer offsets.
                        </p>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono border-t border-slate-200/60 pt-3">
                          <span>Revision: <strong>v1.0</strong></span>
                          <span>Author: <strong>MC Quality Control</strong></span>
                        </div>
                      </div>

                    </div>

                    {/* Handover Checklist Section */}
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mt-2">
                      <div className="flex justify-between items-center border-b border-indigo-100 pb-2.5 mb-3">
                        <h4 className="text-xs font-black text-indigo-950 uppercase font-mono flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-indigo-600" />
                          Tower Block B Handover Checklists
                        </h4>
                        <span className="text-[10px] text-indigo-600 font-mono bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                          Milestone Target: Q4 2026
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-700 font-mono">
                        <div className="bg-white p-3 rounded-lg border border-indigo-100 flex justify-between items-center">
                          <span>1. Structural stability certificate & slab cube verification</span>
                          <Badge variant="emerald" type="solid">Cleared</Badge>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-indigo-100 flex justify-between items-center">
                          <span>2. Fire hydrant pressure test report and sleeve clearance</span>
                          <Badge variant="emerald" type="solid">Cleared</Badge>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-indigo-100 flex justify-between items-center">
                          <span>3. Lift lobby finishes & leveling deviation checking</span>
                          <Badge variant="amber" type="solid">92% Progress</Badge>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-indigo-100 flex justify-between items-center">
                          <span>4. Terrace PU waterproofing flood pond clearance</span>
                          <Badge variant="emerald" type="solid">Cleared</Badge>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </>
            )}
          </Card>

          {/* AI anomalies coordination and Twin warning advisory */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3.5 mb-4">
              <div>
                <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-widest block mb-0.5">Gemini Quality Risk Advisory</span>
                <Heading level={3} className="text-xs text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Twin Scan Anomalies & Downstream rebar Placement Blockers
                </Heading>
              </div>
              <Badge variant="indigo" type="solid" className="text-[9px] py-0.5 px-1.5 font-mono">
                Model: 1.5 FLASH
              </Badge>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 leading-relaxed font-mono">
                <span className="text-rose-400 font-bold block mb-1">⚠️ [Severity High - MEP Penetration Failure - L12 Shaft]:</span>
                Digital Twin overlay reveals that 4 core sleeve penetrations were completely omitted during level 12 casting. Concrete coring must be executed before fire riser placement can progress. DOWNSTREAM DELAY ESTIMATED: <strong className="text-white">12 Days</strong>. NCR-MEP-015 logged.
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 leading-relaxed font-mono">
                <span className="text-amber-400 font-bold block mb-1">💡 [Proactive Optimization - Column rebar L14 Plumbness]:</span>
                Column col_L14_A2 registers vertical alignment within tolerance, but steel cover spacer block offset is close to design minimum limits (35mm versus 40mm required). We advise reinforcing the shutter placement before concrete pour.
              </div>
            </div>
          </div>

        </div>

        {/* Right Pane: Chronological Audit Trail & Perms Guide (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Permissions & Security Authority Box */}
          <Card 
            radius="xl"
            header={
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider mb-0.5">Clearance Authority</span>
                <Heading level={4} className="text-xs font-mono font-bold uppercase text-slate-800">
                  Role Authorization Security
                </Heading>
              </div>
            }
          >
            <div className="flex flex-col gap-3">
              <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg flex items-start gap-2.5">
                <span className="p-1 rounded bg-indigo-100 text-indigo-600 mt-0.5 shrink-0">
                  <UserCheck className="w-4 h-4" />
                </span>
                <div className="flex-1 text-xs">
                  <span className="font-black text-indigo-950 block font-mono uppercase text-[9.5px]">
                    {role === "MC_PM" ? "Contractor PM (Vikas Sharma)" : role === "Client_QS" ? "Client PM (Amit Kulkarni)" : "Sub-Contractor Surveyor"}
                  </span>
                  <span className="text-slate-400 font-mono text-[9px] mt-0.5 block">
                    Permissions: {role === "Sub_QS" ? "Awaiting inspections submission. Cannot certify." : "Full digital signature and approval authority."}
                  </span>
                </div>
              </div>

              {role === "Sub_QS" ? (
                <div className="text-[11px] leading-relaxed text-rose-600 bg-rose-50/30 border border-rose-100 p-3 rounded-lg font-mono">
                  🔒 Audit Lock Active: You can create new Inspection Requests but final sign-off is restricted to Main Contractor or Client PM.
                </div>
              ) : (
                <div className="text-[11px] leading-relaxed text-indigo-700 bg-indigo-50/30 border border-indigo-100 p-3 rounded-lg font-mono">
                  ✓ Sign-off Privilege Enabled: Use the "Inspect & Sign" buttons to certify formwork and reinforcement.
                </div>
              )}
            </div>
          </Card>

          {/* QMS CHRONOLOGICAL ACTIVITY LOG */}
          <Card 
            radius="xl"
            header={
              <div className="flex justify-between items-center w-full">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-500" />
                  QMS History & Sign-off Audits
                </h3>
                <span className="text-[9px] text-slate-400 font-mono">ISO Audit Ledger</span>
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
                    <span className="text-indigo-600 font-bold font-mono">{log.role}</span>
                  </div>
                  <span className="font-bold text-slate-800 text-[11px] leading-snug">
                    {log.operator}: {log.action}
                  </span>
                  <div className="flex justify-between items-center text-[9.5px] font-mono mt-1 text-slate-500">
                    {log.refCode ? (
                      <span className="bg-slate-200/60 px-1 py-0.5 rounded font-bold font-mono text-[9px]">{log.refCode}</span>
                    ) : (
                      <span />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

      {/* ============================================================================
          5. DETAILS POPUPS / INTERACTIVE DIALOGS
          ============================================================================ */}

      {/* A. Inspection Request detail popup */}
      <Dialog
        isOpen={selectedInspection !== null}
        onClose={() => setSelectedInspection(null)}
        title={`Inspection sign-off: ${selectedInspection?.code}`}
        description="Review checklist compliance criteria, inspect panoramic photo evidence, and supply digital authorization."
      >
        {selectedInspection && (
          <div className="flex flex-col gap-4">
            
            {/* Meta attributes */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[10.5px]">
              <div>
                <span className="text-slate-400 block uppercase font-bold">Pour Location</span>
                <span className="font-bold text-slate-800">{selectedInspection.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold">Rep Engineer</span>
                <span className="font-bold text-slate-800">{selectedInspection.contractorRepresentative}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold">BIM Coordinate Ref</span>
                <span className="font-bold text-indigo-600 underline">{selectedInspection.refBimElementId || "col_L14_A2"}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold">Inspection Status</span>
                <span className="font-bold text-slate-800">
                  <Badge variant={selectedInspection.status === "Approved" ? "emerald" : "amber"} type="solid" className="py-0">
                    {selectedInspection.status}
                  </Badge>
                </span>
              </div>
            </div>

            {/* Checklist criteria (Checkboxes) */}
            <div className="flex flex-col gap-2 border border-slate-150 p-3 rounded-xl bg-white">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mb-1 block">Checklist Items Compliance:</span>
              {selectedInspection.checklistItems.map((chk, index) => (
                <label 
                  key={index}
                  className="flex items-start gap-2.5 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer text-xs select-none transition"
                >
                  <input 
                    type="checkbox"
                    checked={chk.checked}
                    onChange={() => toggleChecklistItem(selectedInspection.id, index)}
                    disabled={role === "Sub_QS"}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span className={`text-slate-700 leading-tight ${chk.checked ? "line-through text-slate-400 font-medium" : "font-semibold"}`}>
                    {chk.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Digital signature mock block */}
            <div className="border border-slate-150 p-3 rounded-xl bg-slate-50/50 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Authorized Sign-off Stamp:</span>
              <div className="bg-white border border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center gap-1 min-h-[90px]">
                {selectedInspection.signatureData ? (
                  <div className="flex flex-col items-center gap-1 text-indigo-600">
                    <Signature className="w-8 h-8 opacity-70" />
                    <span className="font-serif font-bold text-sm italic">{selectedInspection.signatureData}</span>
                    <span className="text-[9px] text-slate-400 font-mono">Timestamped: {selectedInspection.requestedDate}</span>
                  </div>
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-1">
                    <Signature className="w-6 h-6 text-slate-300" />
                    <span className="text-[10px] font-mono">No Digital Signature Applied</span>
                    <span className="text-[9px] text-slate-400 font-semibold">Checks must be fully completed to enable signature stamps</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions panel */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedInspection(null)}
              >
                Close
              </Button>
              {selectedInspection.status === "Pending" && role !== "Sub_QS" && (
                <>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => rejectInspection(selectedInspection.id)}
                  >
                    Reject Work
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => approveInspection(selectedInspection.id)}
                    leftIcon={<Signature className="w-3.5 h-3.5" />}
                  >
                    Approve & Sign
                  </Button>
                </>
              )}
            </div>

          </div>
        )}
      </Dialog>

      {/* B. Create New IR Modal */}
      <Dialog
        isOpen={isCreateIRModalOpen}
        onClose={() => setIsCreateIRModalOpen(false)}
        title="Submit New Inspection Request (IR)"
        description="Generate a fresh QA checklist for field structural, waterproofing, or finishes casting works."
      >
        <form onSubmit={submitCreateIR} className="flex flex-col gap-4 text-xs font-mono">
          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">Inspection ID Code</label>
            <Input 
              value={newIRCode} 
              onChange={e => setNewIRCode(e.target.value)} 
              placeholder="e.g. IR-STR-105" 
              required
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">Inspection Title Description</label>
            <Input 
              value={newIRTitle} 
              onChange={e => setNewIRTitle(e.target.value)} 
              placeholder="e.g. Level 15 Rebar & shuttering check" 
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-bold uppercase mb-1 font-mono text-[10px]">Discipline Works</label>
              <select 
                value={newIRDiscipline} 
                onChange={e => setNewIRDiscipline(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:border-indigo-500"
              >
                <option value="Structure">Structural Core</option>
                <option value="MEP">MEP Sleeves & Pipes</option>
                <option value="Waterproofing">Roof Waterproofing</option>
                <option value="Finishes">Tile / Wall Finishes</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-bold uppercase mb-1 font-mono text-[10px]">Casting Location</label>
              <Input 
                value={newIRLocation} 
                onChange={e => setNewIRLocation(e.target.value)} 
                placeholder="e.g. Corridor Level 15 Zone B" 
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">Checklist Standard Protocol Name</label>
            <Input 
              value={newIRChecklistName} 
              onChange={e => setNewIRChecklistName(e.target.value)} 
              placeholder="e.g. Standard Column Pour Check" 
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-150">
            <Button variant="outline" size="sm" onClick={() => setIsCreateIRModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Request (IR)
            </Button>
          </div>
        </form>
      </Dialog>

      {/* C. Create New NCR Modal */}
      <Dialog
        isOpen={isCreateNCRModalOpen}
        onClose={() => setIsCreateNCRModalOpen(false)}
        title="Log Deviation Non-Conformance Report (NCR)"
        description="Flag structural or finishes discrepancies observed in computer-vision scans."
      >
        <form onSubmit={submitCreateNCR} className="flex flex-col gap-4 text-xs font-mono">
          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">NCR Warning Code</label>
            <Input 
              value={newNCRCode} 
              onChange={e => setNewNCRCode(e.target.value)} 
              placeholder="e.g. NCR-MEP-015" 
              required
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1 font-mono text-[10px]">Deviation Description</label>
            <Input 
              value={newNCRTitle} 
              onChange={e => setNewNCRTitle(e.target.value)} 
              placeholder="e.g. Fire riser shaft misalignment" 
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-bold uppercase mb-1 font-mono text-[10px]">Threat Severity</label>
              <select 
                value={newNCRSeverity} 
                onChange={e => setNewNCRSeverity(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:border-indigo-500"
              >
                <option value="Critical">Critical Structural Block</option>
                <option value="Major">Major Downstream Delay</option>
                <option value="Minor">Minor Visual Deviation</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-bold uppercase mb-1 font-mono text-[10px]">Pour Location</label>
              <Input 
                value={newNCRLocation} 
                onChange={e => setNewNCRLocation(e.target.value)} 
                placeholder="e.g. Lift wall core Floor 12" 
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">Observed Root Cause</label>
            <textarea 
              value={newNCRRootCause} 
              onChange={e => setNewNCRRootCause(e.target.value)} 
              rows={3}
              placeholder="Supply re-bar or shutter failure context..."
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:border-indigo-500 font-sans outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-150">
            <Button variant="outline" size="sm" onClick={() => setIsCreateNCRModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit">
              Log NCR Warning
            </Button>
          </div>
        </form>
      </Dialog>

      {/* D. Register Concrete Cube batch */}
      <Dialog
        isOpen={isCreateCubeModalOpen}
        onClose={() => setIsCreateCubeModalOpen(false)}
        title="Register Concrete Cube Cast batch"
        description="Log site delivery parameters, slump tests, and batch pouring metadata."
      >
        <form onSubmit={submitCreateCube} className="flex flex-col gap-4 text-xs font-mono">
          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">Batch Code</label>
            <Input 
              value={newCubeCode} 
              onChange={e => setNewCubeCode(e.target.value)} 
              placeholder="e.g. BATCH-M35-120" 
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-bold uppercase mb-1 font-mono text-[10px]">Mix Grade Design</label>
              <select 
                value={newCubeGrade} 
                onChange={e => setNewCubeGrade(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:border-indigo-500"
              >
                <option value="M30">M30 Grade (Finishes / Screed)</option>
                <option value="M35">M35 Grade (General Floor Slab)</option>
                <option value="M40">M40 Grade (Columns & Retaining)</option>
                <option value="M50">M50 Grade (Post-tension Core)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-bold uppercase mb-1 font-mono text-[10px]">Slump Value (mm)</label>
              <Input 
                type="number"
                value={newCubeSlump} 
                onChange={e => setNewCubeSlump(parseInt(e.target.value) || 110)} 
                placeholder="e.g. 115" 
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">Pour Location Context</label>
            <Input 
              value={newCubePour} 
              onChange={e => setNewCubePour(e.target.value)} 
              placeholder="e.g. Block B Level 15 Central Core pour" 
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-150">
            <Button variant="outline" size="sm" onClick={() => setIsCreateCubeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Register Cast Batch
            </Button>
          </div>
        </form>
      </Dialog>

      {/* E. NCR Details and photo panel popup */}
      <Dialog
        isOpen={selectedNCR !== null}
        onClose={() => setSelectedNCR(null)}
        title={`NCR Inspection Proof: ${selectedNCR?.code}`}
        description="Analyze direct spatial coordinates and micro-concrete correctives."
      >
        {selectedNCR && (
          <div className="flex flex-col gap-4">
            
            <div className="relative h-[200px] w-full rounded-lg overflow-hidden border border-slate-200">
              <img 
                src={selectedNCR.photoUrl} 
                alt="Deviation screenshot" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="rose" type="solid" className="text-[9px] font-mono">
                  Reality Photo Evidence
                </Badge>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 font-mono text-[10.5px]">
              <span className="text-slate-400 block uppercase font-bold mb-0.5">Deviation Title</span>
              <span className="font-bold text-slate-900 block mb-2">{selectedNCR.title}</span>

              <span className="text-slate-400 block uppercase font-bold mb-0.5">Assigned Remediation Contractor</span>
              <span className="font-bold text-slate-900 block mb-2">{selectedNCR.assignedTo}</span>

              <span className="text-slate-400 block uppercase font-bold mb-0.5">Threat Multiplier Index</span>
              <span className="font-bold text-rose-600 block">{selectedNCR.aiRiskMultiplier}x Structural Impact</span>
            </div>

            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-150 font-mono text-[10.5px]">
              <span className="text-indigo-900 font-bold block mb-1">⚡ Preventive Action Plan (PAR):</span>
              <p className="text-slate-700 font-sans leading-relaxed">{selectedNCR.preventiveAction || "Mandate physical mockups of shutter anchor setups before pouring floor lifts."}</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-150">
              <Button variant="outline" size="sm" onClick={() => setSelectedNCR(null)}>
                Close
              </Button>
              {selectedNCR.status !== "Closed" && role !== "Sub_QS" && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => {
                    setNcrs(prev => prev.map(n => n.id === selectedNCR.id ? { ...n, status: "Closed" as const } : n));
                    triggerNotification(`NCR ${selectedNCR.code} marked closed. Compliance index restored.`);
                    setSelectedNCR(null);
                  }}
                  leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                >
                  Close NCR Record
                </Button>
              )}
            </div>

          </div>
        )}
      </Dialog>

    </div>
  );
}
