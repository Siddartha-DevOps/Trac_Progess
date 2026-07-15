import { ProjectStats, Anomaly } from "./types";
import { BIMElementMetadata } from "./lib/bim/BIMViewerAbstraction";

// Enriched Issue interface matching IssuesView.tsx
export interface ConstructionIssue {
  id: string;
  elementId: string;
  title: string;
  category: "Structure" | "MEP" | "Arch" | "Safety";
  priority: "Critical" | "Medium" | "Low";
  status: "Open" | "Resolved";
  assignedTo: string;
  detectedDate: string;
  description: string;
  bimImageLabel: string;
  scanImageLabel: string;
  aiOverlayTitle: string;
  aiOverlayConfidence: number;
  aiOverlayDeviation: string;
  aiRecommendation: string;
  diagramType: "column" | "rebar" | "clash" | "wall" | "custom";
  comments: Array<{
    id: string;
    author: string;
    role: string;
    text: string;
    date: string;
  }>;
  history: Array<{
    id: string;
    event: string;
    user: string;
    date: string;
    details?: string;
  }>;
  uploadedImages: string[];
}

// Construction Phase timeline interface matching SchedulesView.tsx
export interface TimelinePhase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "completed" | "active" | "delayed" | "pending";
  subcontractor: string;
  deviationDays: number;
  startWeek: number;
  durationWeeks: number;
  isCriticalPath: boolean;
  predecessors: string[];
  successors: string[];
  impactNotes: string;
  mitigationStrategy: string;
}

// Activity Shift Log interface matching reportsData.ts
export interface DailyLog {
  id: string;
  date: string;
  shift: "Day" | "Night";
  block: string;
  trade: "Concrete" | "MEP" | "Plumbing" | "HVAC" | "Drywall & Partition" | "Façade & Glazing";
  item: string;
  quantity: string;
  quantityVal: number;
  contractor: string;
  status: "Completed" | "In Progress" | "Delayed";
  variance: string;
  manpower: number;
}

// Interface for unified project workspace context
export interface ProjectWorkspace {
  stats: ProjectStats & {
    id: string;
    client: string;
    status: "active" | "delayed" | "completed";
    anomaliesCount: number;
    safetyRating: number;
    healthScore: number;
    activeTrades: number;
    criticalAlerts: number;
    activeWorkers: number;
  };
  progressTrendData: Array<{ name: string; planned: number; actual: number | null; budget: number | null; laborIndex: number | null }>;
  budgetTradeData: Array<{ name: string; budget: number; actual: number; status: string }>;
  discrepancyData: Array<{ name: string; resolved: number; outstanding: number }>;
  dashboardIssues: Array<{ id: string; title: string; category: string; priority: string; status: "Open" | "Resolved"; assignedTo: string; date: string }>;
  recentUploads: Array<{ id: string; name: string; type: "laser" | "cad" | "video" | "report"; size: string; date: string; uploader: string; status: string }>;
  siteAnomalies: Anomaly[];
  bimElements: BIMElementMetadata[];
  constructionPhases: TimelinePhase[];
  dailyLogs: DailyLog[];
}

// MASTER WORKSPACE CONFIGURATION FOR ALL 4 INDIAN SITES
export const PROJECTS_WORKSPACE_DATA: Record<string, ProjectWorkspace> = {
  "btp-block-b": {
    stats: {
      id: "btp-block-b",
      name: "Bangalore Tech Park - Block B",
      location: "Whitefield, Bengaluru, Karnataka, India",
      client: "InnoSpace Developers India Ltd.",
      totalCost: "₹18.5 Crores",
      reraId: "KA-RERA-2026-0389",
      constructionArea: "45,000 sq ft",
      targetDate: "Q4 2026",
      overallProgress: 72.4,
      status: "active",
      anomaliesCount: 2,
      safetyRating: 4.8,
      healthScore: 89,
      activeTrades: 5,
      criticalAlerts: 1,
      activeWorkers: 142
    },
    progressTrendData: [
      { name: "Week 1", planned: 65, actual: 63, budget: 15, laborIndex: 92 },
      { name: "Week 2", planned: 70, actual: 67, budget: 35, laborIndex: 94 },
      { name: "Week 3", planned: 75, actual: 72.4, budget: 52, laborIndex: 94.2 },
      { name: "Week 4", planned: 82, actual: null, budget: null, laborIndex: null },
      { name: "Week 5", planned: 88, actual: null, budget: null, laborIndex: null }
    ],
    budgetTradeData: [
      { name: "Foundations", budget: 350, actual: 342, status: "Under Budget" },
      { name: "Structure", budget: 680, actual: 710, status: "Over Budget" },
      { name: "MEP / HVAC", budget: 420, actual: 412, status: "Under Budget" },
      { name: "Drywalls & Fin", budget: 280, actual: 120, status: "Under Budget" },
      { name: "Plumbing", budget: 120, actual: 110, status: "Under Budget" }
    ],
    discrepancyData: [
      { name: "Slabs", resolved: 14, outstanding: 2 },
      { name: "Columns", resolved: 28, outstanding: 4 },
      { name: "Plumbing", resolved: 8, outstanding: 5 },
      { name: "HVAC Ducts", resolved: 12, outstanding: 3 },
      { name: "Electrical", resolved: 22, outstanding: 1 }
    ],
    dashboardIssues: [
      { id: "iss-101", title: "Column C4 Concrete Cover Placement Variance", category: "Structure", priority: "Critical", status: "Open", assignedTo: "Rajesh Kumar", date: "July 08" },
      { id: "iss-102", title: "Slab S2 Deflection Out of Tolerance", category: "Structure", priority: "Critical", status: "Open", assignedTo: "Amit Sharma", date: "July 09" },
      { id: "iss-103", title: "Piping Conflict with HVAC Duct Level 1", category: "MEP", priority: "Medium", status: "Open", assignedTo: "Venkatesh Rao", date: "July 10" },
      { id: "iss-104", title: "Corridor Fire-Damper Sleeve Missing", category: "MEP", priority: "High", status: "Open", assignedTo: "Venkatesh Rao", date: "July 11" }
    ],
    recentUploads: [
      { id: "up-101", name: "Drone_Scan_BlockB_L1Slab.las", type: "laser", size: "1.4 GB", date: "Today, 10:14 AM", uploader: "AI Autopilot V4", status: "Processed" },
      { id: "up-102", name: "IFC_Design_Revision_v3.ifc", type: "cad", size: "48.2 MB", date: "Yesterday", uploader: "Venkatesh Rao (BIM Lead)", status: "Processed" },
      { id: "up-103", name: "ZoneB_Thermal_Curing_Scan.mp4", type: "video", size: "215 MB", date: "2 days ago", uploader: "Autobot East Ground Station", status: "Processed" }
    ],
    siteAnomalies: [
      {
        id: "anom_rebar_density",
        elementId: "col_c4",
        elementName: "Column C4",
        category: "Reinforcement",
        title: "Slab Reinforcement Spacing Discrepancy",
        description: "YOLO-v8 analysis of high-res drone image identifies 15% under-reinforcement density in structural Column C4. Stirrups spacing exceeds IFC design parameters by 85mm.",
        level: "critical",
        deviation: "Spacing deviation of +85mm vs. IFC4 standard",
        possibleCause: "Sub-contractor drawing misinterpretation or rebar shortage",
        status: "open",
        detectedAt: "Week 2 - Photo Scan ID #88"
      },
      {
        id: "anom_duct_clash",
        elementId: "mep_duct_branch",
        elementName: "Branch HVAC Duct C4",
        category: "MEP Collision",
        title: "HVAC Duct to Fire Sprinkler Piping Collision",
        description: "3D Spatial clash solver flags L1 branch duct colliding directly with the CPVC sprinkler line. Restricts architectural drywall partition erection in L1 Zone B.",
        level: "high",
        deviation: "18.5cm volumetric structural collision",
        possibleCause: "Central coordination error between MEP and HVAC draftsmen",
        status: "open",
        detectedAt: "Week 4 - Drone Scan ID #92"
      }
    ],
    constructionPhases: [
      {
        id: "ph-1",
        name: "Excavation & Shoring",
        startDate: "Week 1",
        endDate: "Week 1",
        progress: 100,
        status: "completed",
        subcontractor: "L&T GeoStructure",
        deviationDays: 0,
        startWeek: 1,
        durationWeeks: 1,
        isCriticalPath: true,
        predecessors: [],
        successors: ["ph-2"],
        impactNotes: "Foundation soil density matched 100% CAD loading standards.",
        mitigationStrategy: "N/A - Stage Completed on target schedule."
      },
      {
        id: "ph-2",
        name: "Foundation & Basement Slab Casting",
        startDate: "Week 1",
        endDate: "Week 2",
        progress: 100,
        status: "completed",
        subcontractor: "Shapoorji Pallonji Concrete",
        deviationDays: 0,
        startWeek: 1,
        durationWeeks: 2,
        isCriticalPath: true,
        predecessors: ["ph-1"],
        successors: ["ph-3", "ph-4"],
        impactNotes: "Curing integrity checks verified using smart wireless humidity concrete loggers.",
        mitigationStrategy: "N/A - Stage Completed."
      },
      {
        id: "ph-3",
        name: "Core Columns Reinforcement C1-C12",
        startDate: "Week 2",
        endDate: "Week 3",
        progress: 85,
        status: "delayed",
        subcontractor: "Rishabh Steel Fabrication",
        deviationDays: 6,
        startWeek: 2,
        durationWeeks: 2,
        isCriticalPath: true,
        predecessors: ["ph-2"],
        successors: ["ph-5"],
        impactNotes: "Column C4 rebars placed at 185mm intervals vs specified 100mm. Critical path hold enacted.",
        mitigationStrategy: "Insert supplementary T16 spacer bars on side flanks to restore loading distribution."
      },
      {
        id: "ph-4",
        name: "First Floor Suspended Slab Casting",
        startDate: "Week 3",
        endDate: "Week 4",
        progress: 45,
        status: "active",
        subcontractor: "Shapoorji Pallonji Concrete",
        deviationDays: 0,
        startWeek: 3,
        durationWeeks: 2,
        isCriticalPath: false,
        predecessors: ["ph-2"],
        successors: ["ph-6"],
        impactNotes: "Slab concrete curing on track. No deflections detected in formwork structure.",
        mitigationStrategy: "Optimize structural monitoring."
      }
    ],
    dailyLogs: [
      { id: "DL-01", date: "2026-07-11", shift: "Day", block: "Block A", trade: "Concrete", item: "M35 Column Pouring C4-C8", quantity: "45.2 m³", quantityVal: 45.2, contractor: "Vajra Concrete Corp", status: "Completed", variance: "+2.2 m³ ahead", manpower: 18 },
      { id: "DL-02", date: "2026-07-11", shift: "Day", block: "Block A", trade: "MEP", item: "L1 Conduit containment installation", quantity: "110 meters", quantityVal: 110, contractor: "Sterling MEP", status: "In Progress", variance: "On Track", manpower: 12 },
      { id: "DL-03", date: "2026-07-11", shift: "Day", block: "Block B", trade: "Concrete", item: "Level 2 Slab Formwork & Rebar alignment", quantity: "18 tons steel", quantityVal: 18, contractor: "Vajra Concrete Corp", status: "Completed", variance: "On Track", manpower: 24 },
      { id: "DL-04", date: "2026-07-11", shift: "Day", block: "Block B", trade: "Plumbing", item: "Vertical drainage stack sleeve alignment", quantity: "12 sleeves", quantityVal: 12, contractor: "Sterling MEP", status: "Delayed", variance: "Spacial clash", manpower: 6 }
    ],
    bimElements: [
      {
        id: "slab_foundation",
        guid: "3b8s92jaK29s1A8dzLp001",
        name: "Foundation Concrete Slab",
        type: "Slab",
        category: "Structure",
        floor: "Ground Floor",
        status: "completed",
        position: [0, -0.2, 0],
        size: [22, 0.4, 16],
        properties: { "GlobalId": "3b8s92jaK29s1A8dzLp001", "Material": "Reinforced M35 Concrete", "Volume": "140.8 m³", "LoadBearing": "TRUE" }
      },
      {
        id: "col_c1",
        guid: "1b8s92jaK29s1A8dzLp002",
        name: "Structural Column C1",
        type: "Column",
        category: "Structure",
        floor: "Ground Floor",
        status: "completed",
        position: [-8, 2.5, -5],
        size: [0.8, 5, 0.8],
        properties: { "GlobalId": "1b8s92jaK29s1A8dzLp002", "Material": "Reinforced Concrete M35", "Height": "5.0 m" }
      },
      {
        id: "col_c2",
        guid: "1b8s92jaK29s1A8dzLp003",
        name: "Structural Column C2",
        type: "Column",
        category: "Structure",
        floor: "Ground Floor",
        status: "completed",
        position: [8, 2.5, -5],
        size: [0.8, 5, 0.8],
        properties: { "GlobalId": "1b8s92jaK29s1A8dzLp003", "Material": "Concrete M35" }
      },
      {
        id: "col_c4",
        guid: "anom_rebar_density",
        name: "Structural Column C4",
        type: "Column",
        category: "Structure",
        floor: "Ground Floor",
        status: "delayed",
        position: [8, 2.5, 5],
        size: [0.8, 5, 0.8],
        properties: { "GlobalId": "anom_rebar_density", "Material": "M35 Concrete + Stirrups", "RERA Warning": "Stirrup Spacing Deviation (+85mm)" }
      },
      {
        id: "mep_duct_branch",
        guid: "anom_duct_clash",
        name: "HVAC Branch Duct C4",
        type: "Duct",
        category: "MEP",
        floor: "Ground Floor",
        status: "delayed",
        position: [3, 4, 3],
        size: [6, 0.6, 0.6],
        properties: { "GlobalId": "anom_duct_clash", "System": "Mechanical Ventilation", "Clash": "Sprinkler piping collision" }
      }
    ]
  },
  "mumbai-metro-3": {
    stats: {
      id: "mumbai-metro-3",
      name: "Mumbai Metro Line 3 - Underground Station",
      location: "Colaba, Mumbai, Maharashtra, India",
      client: "Mumbai Metro Rail Corporation (MMRC)",
      totalCost: "₹45.0 Crores",
      reraId: "MH-RERA-GOVT-1102",
      constructionArea: "120,000 sq ft",
      targetDate: "Q2 2027",
      overallProgress: 58.1,
      status: "delayed",
      anomaliesCount: 2,
      safetyRating: 4.6,
      healthScore: 74,
      activeTrades: 4,
      criticalAlerts: 2,
      activeWorkers: 310
    },
    progressTrendData: [
      { name: "Week 1", planned: 45, actual: 44, budget: 50, laborIndex: 88 },
      { name: "Week 2", planned: 52, actual: 49.5, budget: 110, laborIndex: 85 },
      { name: "Week 3", planned: 58.1, actual: 54, budget: 180, laborIndex: 82 },
      { name: "Week 4", planned: 64, actual: null, budget: null, laborIndex: null },
      { name: "Week 5", planned: 70, actual: null, budget: null, laborIndex: null }
    ],
    budgetTradeData: [
      { name: "Excavation", budget: 1200, actual: 1280, status: "Over Budget" },
      { name: "Tunnel Slabs", budget: 1500, actual: 1590, status: "Over Budget" },
      { name: "MEP Vent", budget: 800, actual: 780, status: "Under Budget" },
      { name: "Substation", budget: 600, actual: 590, status: "Under Budget" },
      { name: "Drainage", budget: 400, actual: 450, status: "Over Budget" }
    ],
    discrepancyData: [
      { name: "Tunnel Ring", resolved: 4, outstanding: 3 },
      { name: "Dewatering", resolved: 12, outstanding: 2 },
      { name: "Slab Arches", resolved: 6, outstanding: 4 },
      { name: "Ventilation", resolved: 8, outstanding: 1 },
      { name: "Safety Gate", resolved: 15, outstanding: 0 }
    ],
    dashboardIssues: [
      { id: "iss-201", title: "Underground Drainage Sump Grouting Leakage", category: "MEP", priority: "Critical", status: "Open", assignedTo: "Venkatesh Rao", date: "July 07" },
      { id: "iss-202", title: "Tunnel Ring Segment 45B Geometric Shift (+32mm)", category: "Structure", priority: "Critical", status: "Open", assignedTo: "Rajesh Kumar", date: "July 10" },
      { id: "iss-203", title: "Platform 1 Edge-Lighting Duct Clash with HVAC Riser", category: "MEP", priority: "Medium", status: "Open", assignedTo: "Amit Sharma", date: "July 12" }
    ],
    recentUploads: [
      { id: "up-201", name: "Metro_Station_Laser_Scan_Run3.las", type: "laser", size: "3.2 GB", date: "Today, 08:30 AM", uploader: "Site Robot Autocamera 2", status: "Processed" },
      { id: "up-202", name: "Tunnel_Segment_Grouting_Logs.pdf", type: "report", size: "18.5 MB", date: "Yesterday", uploader: "MMRC Auditor", status: "Processed" }
    ],
    siteAnomalies: [
      {
        id: "anom_mumbai_water",
        elementId: "vent_sump_drain",
        elementName: "Drain Sump",
        category: "Geometric Shift",
        title: "Subway Drainage Sump Leakage Risk",
        description: "Laser scan profile registers a +32mm shear boundary variance in structural concrete retaining grout, creating high risk for micro-fractures and groundwater ingress at station Level -2.",
        level: "critical",
        deviation: "Geometric offset of +32mm from coordinates",
        possibleCause: "Sub-grade structural shifting or high soil moisture expansion",
        status: "open",
        detectedAt: "Week 3 - Station Ingress Run #02"
      },
      {
        id: "anom_mumbai_tunnel",
        elementId: "tunnel_ring_45b",
        elementName: "Tunnel Segment Ring 45B",
        category: "MEP Collision",
        title: "Tunnel Ring Segment Segmental Alignment Shift",
        description: "BIM Coordination engine flags Tunnel Segment 45B shifted slightly out of circular tolerance. Volumetric clash with main trackway drainage pipe conduit.",
        level: "high",
        deviation: "12cm alignment variance vs. CAD design",
        possibleCause: "TBM (Tunnel Boring Machine) dynamic thrust imbalance",
        status: "open",
        detectedAt: "Week 3 - Scan ID #104"
      }
    ],
    constructionPhases: [
      {
        id: "ph-201",
        name: "Tunnel Boring & Ring Segment Assembly",
        startDate: "Week 1",
        endDate: "Week 3",
        progress: 100,
        status: "completed",
        subcontractor: "L&T Heavy Civil Infra",
        deviationDays: 4,
        startWeek: 1,
        durationWeeks: 3,
        isCriticalPath: true,
        predecessors: [],
        successors: ["ph-202"],
        impactNotes: "TBM Boring completed; Ring alignment variance of Segment 45B detected but structurally certified.",
        mitigationStrategy: "Apply sealing epoxy along rings."
      },
      {
        id: "ph-202",
        name: "Subgrade Sump Excavation & Dewatering",
        startDate: "Week 2",
        endDate: "Week 3",
        progress: 75,
        status: "delayed",
        subcontractor: "HCC Infrastructure",
        deviationDays: 8,
        startWeek: 2,
        durationWeeks: 2,
        isCriticalPath: true,
        predecessors: ["ph-201"],
        successors: ["ph-203"],
        impactNotes: "Grouting moisture shift at drain sump L-2. High water table ingress active.",
        mitigationStrategy: "Perform PU Injection chemical grouting around structural seam."
      },
      {
        id: "ph-203",
        name: "Underground Platform Concrete Slab Casting",
        startDate: "Week 3",
        endDate: "Week 5",
        progress: 20,
        status: "active",
        subcontractor: "Shapoorji Pallonji Concrete",
        deviationDays: 0,
        startWeek: 3,
        durationWeeks: 3,
        isCriticalPath: false,
        predecessors: ["ph-202"],
        successors: [],
        impactNotes: "Rebar installation for platform zone B on track.",
        mitigationStrategy: "Standard schedule tracking."
      }
    ],
    dailyLogs: [
      { id: "DL-201", date: "2026-07-11", shift: "Day", block: "Block A", trade: "Concrete", item: "Segment Ring 44-48 Grout Injection", quantity: "62 m³", quantityVal: 62, contractor: "L&T Heavy Civil Infra", status: "Completed", variance: "On Track", manpower: 32 },
      { id: "DL-202", date: "2026-07-11", shift: "Night", block: "Block B", trade: "Plumbing", item: "Track drainage conduit pipe assembly", quantity: "24 meters", quantityVal: 24, contractor: "Sterling MEP", status: "Delayed", variance: "Clash detected", manpower: 10 }
    ],
    bimElements: [
      {
        id: "tunnel_base_slab",
        guid: "metro_3a01b",
        name: "Tunnel Bottom Invert Slab",
        type: "Slab",
        category: "Structure",
        floor: "Ground Floor",
        status: "completed",
        position: [0, -1, 0],
        size: [24, 0.6, 12],
        properties: { "GlobalId": "metro_3a01b", "Material": "High-Strength C50 Concrete", "Thrust Standard": "Approved" }
      },
      {
        id: "tunnel_ring_45b",
        guid: "anom_mumbai_tunnel",
        name: "Tunnel Segment Ring 45B",
        type: "Wall",
        category: "Structure",
        floor: "Ground Floor",
        status: "delayed",
        position: [4, 2, -3],
        size: [1, 5, 10],
        properties: { "GlobalId": "anom_mumbai_tunnel", "Formwork Type": "Segmented Tunnel Wall", "Deviation": "+32mm Shift" }
      },
      {
        id: "vent_sump_drain",
        guid: "anom_mumbai_water",
        name: "Station Drainage Sump",
        type: "Pipe",
        category: "MEP",
        floor: "Ground Floor",
        status: "delayed",
        position: [-6, -0.4, 3],
        size: [2, 1, 2],
        properties: { "GlobalId": "anom_mumbai_water", "Component": "Drain Sump #2", "Leakage risk": "High" }
      }
    ]
  },
  "cybercity-ph2": {
    stats: {
      id: "cybercity-ph2",
      name: "Gurgaon CyberCity - Phase II Tower",
      location: "Sector 24, Gurugram, Haryana, India",
      client: "DLF Infrastructure Solutions Ltd.",
      totalCost: "₹32.8 Crores",
      reraId: "HR-RERA-2026-9912",
      constructionArea: "85,000 sq ft",
      targetDate: "Q1 2027",
      overallProgress: 88.5,
      status: "active",
      anomaliesCount: 1,
      safetyRating: 4.9,
      healthScore: 94,
      activeTrades: 6,
      criticalAlerts: 0,
      activeWorkers: 185
    },
    progressTrendData: [
      { name: "Week 1", planned: 80, actual: 81, budget: 100, laborIndex: 96 },
      { name: "Week 2", planned: 84, actual: 85.2, budget: 240, laborIndex: 97 },
      { name: "Week 3", planned: 88.5, actual: 88.5, budget: 310, laborIndex: 98 },
      { name: "Week 4", planned: 92, actual: null, budget: null, laborIndex: null },
      { name: "Week 5", planned: 96, actual: null, budget: null, laborIndex: null }
    ],
    budgetTradeData: [
      { name: "Foundations", budget: 800, actual: 790, status: "Under Budget" },
      { name: "Shear Core", budget: 1400, actual: 1440, status: "Over Budget" },
      { name: "Glass Facade", budget: 600, actual: 580, status: "Under Budget" },
      { name: "MEP Risers", budget: 400, actual: 390, status: "Under Budget" }
    ],
    discrepancyData: [
      { name: "Columns", resolved: 42, outstanding: 1 },
      { name: "Slabs", resolved: 21, outstanding: 0 },
      { name: "Glass Brackets", resolved: 14, outstanding: 0 },
      { name: "Power Conduit", resolved: 11, outstanding: 1 }
    ],
    dashboardIssues: [
      { id: "iss-301", title: "Slab MEP Cable Sleeves Omission L12", category: "MEP", priority: "High", status: "Open", assignedTo: "Amit Sharma", date: "July 12" }
    ],
    recentUploads: [
      { id: "up-301", name: "TowerA_L12_Concrete_Scan.las", type: "laser", size: "2.1 GB", date: "Yesterday", uploader: "Autobot Highrise V1", status: "Processed" }
    ],
    siteAnomalies: [
      {
        id: "anom_gurgaon_sleeves",
        elementId: "hvac_riser_l12",
        elementName: "HVAC Floor Sleeve L12",
        category: "Missing Part",
        title: "Slab MEP Cable Sleeves Omission",
        description: "AI photogrammetry review flags omission of 4 conduit sleeve penetration cavities in structural floor slab Level 12 prior to concrete pouring. Creates risk of post-pour concrete core-drilling.",
        level: "high",
        deviation: "Omission of 4 design layout sleeves",
        possibleCause: "Subcontractor formwork layout mismatch",
        status: "open",
        detectedAt: "Week 3 - Highrise Drone Run #14"
      }
    ],
    constructionPhases: [
      {
        id: "ph-301",
        name: "High-Rise Concrete Shear Core Casting",
        startDate: "Week 1",
        endDate: "Week 2",
        progress: 100,
        status: "completed",
        subcontractor: "L&T Heavy Structures",
        deviationDays: 0,
        startWeek: 1,
        durationWeeks: 2,
        isCriticalPath: true,
        predecessors: [],
        successors: ["ph-302"],
        impactNotes: "Core casted up to floor 15. Standard strength certified.",
        mitigationStrategy: "N/A"
      },
      {
        id: "ph-302",
        name: "MEP Cable Riser Conduit Sleeve Prep",
        startDate: "Week 2",
        endDate: "Week 3",
        progress: 90,
        status: "delayed",
        subcontractor: "Sterling MEP",
        deviationDays: 2,
        startWeek: 2,
        durationWeeks: 1,
        isCriticalPath: true,
        predecessors: ["ph-301"],
        successors: [],
        impactNotes: "Omission of L12 slab sleeves. Formwork must be adjusted before structural concrete pour.",
        mitigationStrategy: "Manually install 4 high-temp PVC sleeves on deck."
      }
    ],
    dailyLogs: [
      { id: "DL-301", date: "2026-07-11", shift: "Day", block: "Block A", trade: "Concrete", item: "Core Wall Pouring Floor 12", quantity: "95 m³", quantityVal: 95, contractor: "Vajra Concrete Corp", status: "Completed", variance: "On Track", manpower: 28 }
    ],
    bimElements: [
      {
        id: "shear_core_foundation",
        guid: "core_fnd_01",
        name: "Shear Core Concrete Slab",
        type: "Slab",
        category: "Structure",
        floor: "Ground Floor",
        status: "completed",
        position: [0, -0.4, 0],
        size: [18, 0.5, 18],
        properties: { "GlobalId": "core_fnd_01", "Material": "High-Grade C40 Concrete" }
      },
      {
        id: "hvac_riser_l12",
        guid: "anom_gurgaon_sleeves",
        name: "HVAC Floor Sleeve L12",
        type: "Duct",
        category: "MEP",
        floor: "Ground Floor",
        status: "delayed",
        position: [4, 4, -4],
        size: [1, 4, 1],
        properties: { "GlobalId": "anom_gurgaon_sleeves", "Floor": "Level 12", "Tolerance": "Critical Omission" }
      }
    ]
  },
  "hyd-it-hub": {
    stats: {
      id: "hyd-it-hub",
      name: "Hyderabad IT Corridor Hub",
      location: "Gachibowli, Hyderabad, Telangana, India",
      client: "Telangana State Industrial Corp",
      totalCost: "₹24.5 Crores",
      reraId: "TS-RERA-2025-0811",
      constructionArea: "60,000 sq ft",
      targetDate: "Q3 2026",
      overallProgress: 100,
      status: "completed",
      anomaliesCount: 0,
      safetyRating: 5.0,
      healthScore: 100,
      activeTrades: 0,
      criticalAlerts: 0,
      activeWorkers: 0
    },
    progressTrendData: [
      { name: "Week 1", planned: 92, actual: 93, budget: 120, laborIndex: 100 },
      { name: "Week 2", planned: 97, actual: 98, budget: 220, laborIndex: 100 },
      { name: "Week 3", planned: 100, actual: 100, budget: 280, laborIndex: 100 },
      { name: "Week 4", planned: 100, actual: null, budget: null, laborIndex: null },
      { name: "Week 5", planned: 100, actual: null, budget: null, laborIndex: null }
    ],
    budgetTradeData: [
      { name: "Foundations", budget: 500, actual: 495, status: "Under Budget" },
      { name: "Steel Frame", budget: 900, actual: 880, status: "Under Budget" },
      { name: "MEP Infrastructure", budget: 600, actual: 590, status: "Under Budget" },
      { name: "Finishing Work", budget: 450, actual: 440, status: "Under Budget" }
    ],
    discrepancyData: [
      { name: "Steel Beams", resolved: 24, outstanding: 0 },
      { name: "Cooling Trays", resolved: 18, outstanding: 0 },
      { name: "Backup Gens", resolved: 6, outstanding: 0 }
    ],
    dashboardIssues: [],
    recentUploads: [
      { id: "up-401", name: "TS_IT_Hub_AsBuilt_Final.ifc", type: "cad", size: "112 MB", date: "July 01", uploader: "BIM System Autopaint", status: "Processed" }
    ],
    siteAnomalies: [],
    constructionPhases: [
      {
        id: "ph-401",
        name: "Datacenter Framing & Shell Erection",
        startDate: "Week 1",
        endDate: "Week 2",
        progress: 100,
        status: "completed",
        subcontractor: "Tata Projects Steel Division",
        deviationDays: -2,
        startWeek: 1,
        durationWeeks: 2,
        isCriticalPath: true,
        predecessors: [],
        successors: [],
        impactNotes: "Steel framing completed 2 days ahead of schedule.",
        mitigationStrategy: "N/A"
      }
    ],
    dailyLogs: [
      { id: "DL-401", date: "2026-07-11", shift: "Day", block: "Block A", trade: "Concrete", item: "Final site boundary clean-up & paint", quantity: "1 lot", quantityVal: 1, contractor: "Tata Projects", status: "Completed", variance: "On Track", manpower: 12 }
    ],
    bimElements: [
      {
        id: "datacenter_base_slab",
        guid: "ts_it_slab_01",
        name: "Datacenter Foundation Slab",
        type: "Slab",
        category: "Structure",
        floor: "Ground Floor",
        status: "completed",
        position: [0, -0.4, 0],
        size: [20, 0.4, 18],
        properties: { "GlobalId": "ts_it_slab_01", "Material": "High-Density Thermal Concrete", "LoadBearing": "TRUE" }
      },
      {
        id: "datacenter_column_frame",
        guid: "ts_it_col_01",
        name: "datacenter Structural Column Frame",
        type: "Column",
        category: "Structure",
        floor: "Ground Floor",
        status: "completed",
        position: [0, 2.5, 0],
        size: [1.2, 5, 1.2],
        properties: { "GlobalId": "ts_it_col_01", "Material": "I-Section Rolled Structural Steel", "Height": "5.0 m" }
      }
    ]
  }
};

// Backwards compatibility list aggregates
export const SITE_ANOMALIES: Anomaly[] = [
  ...PROJECTS_WORKSPACE_DATA["btp-block-b"].siteAnomalies,
  ...PROJECTS_WORKSPACE_DATA["mumbai-metro-3"].siteAnomalies,
  ...PROJECTS_WORKSPACE_DATA["cybercity-ph2"].siteAnomalies
];

export const BIM_ELEMENTS_LOOKUP = [
  { id: "col_c4", name: "Structural Column C4", anomalyId: "anom_rebar_density" },
  { id: "mep_duct_branch", name: "HVAC Branch Duct C4", anomalyId: "anom_duct_clash" },
  { id: "tunnel_ring_45b", name: "Tunnel Segment Ring 45B", anomalyId: "anom_mumbai_tunnel" },
  { id: "vent_sump_drain", name: "Station Drainage Sump", anomalyId: "anom_mumbai_water" },
  { id: "hvac_riser_l12", name: "HVAC Floor Sleeve L12", anomalyId: "anom_gurgaon_sleeves" }
];

// Helper helper functions to fetch scoped project data
export function getProjectWorkspace(id: string): ProjectWorkspace {
  return PROJECTS_WORKSPACE_DATA[id] || PROJECTS_WORKSPACE_DATA["btp-block-b"];
}

export function getProjectStats(id: string): ProjectStats {
  return getProjectWorkspace(id).stats;
}

export function getProjectAnomalies(id: string): Anomaly[] {
  return getProjectWorkspace(id).siteAnomalies;
}

export function getProjectBimElements(id: string): BIMElementMetadata[] {
  return getProjectWorkspace(id).bimElements;
}

export function getProjectPhases(id: string): TimelinePhase[] {
  return getProjectWorkspace(id).constructionPhases;
}
