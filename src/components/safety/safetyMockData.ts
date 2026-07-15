import { WorkerPPEState, Incident, NearMiss, Hazard, SafetyAudit, CameraStream, VideoEvent } from "./types";

export const MOCK_WORKERS: WorkerPPEState[] = [
  {
    id: "WRK-101",
    name: "Vikram Dev",
    trade: "Steel Fixer",
    contractor: "Tata Projects",
    location: "Level 2 - West Wing",
    floor: "Level 2",
    room: "Zone B",
    ppeStatus: "Compliant",
    confidenceScore: 98.6,
    lastInspection: "2026-07-15 08:30",
    violationCount: 0,
    compliancePct: 100,
    helmet: "Wearing",
    vest: "Wearing",
    shoes: "Wearing",
    harness: "N/A",
    gloves: "Wearing",
    eyeProtection: "Wearing",
    faceShield: "N/A",
    respirator: "N/A",
    earProtection: "N/A"
  },
  {
    id: "WRK-102",
    name: "Ananya Sen",
    trade: "Scaffolder",
    contractor: "L&T Construction",
    location: "Level 3 - Facade Edge",
    floor: "Level 3",
    room: "Zone A",
    ppeStatus: "Violated",
    confidenceScore: 94.2,
    lastInspection: "2026-07-15 09:15",
    violationCount: 4,
    compliancePct: 60,
    helmet: "Wearing",
    vest: "Wearing",
    shoes: "Wearing",
    harness: "Missing", // Violated at height!
    gloves: "Missing",
    eyeProtection: "Wearing",
    faceShield: "N/A",
    respirator: "N/A",
    earProtection: "N/A"
  },
  {
    id: "WRK-103",
    name: "Sanjay Kumar",
    trade: "Electrician",
    contractor: "Sterling & Wilson",
    location: "Level 2 - Server Corridor",
    floor: "Level 2",
    room: "Zone D",
    ppeStatus: "Compliant",
    confidenceScore: 99.1,
    lastInspection: "2026-07-15 08:45",
    violationCount: 0,
    compliancePct: 100,
    helmet: "Wearing",
    vest: "Wearing",
    shoes: "Wearing",
    harness: "N/A",
    gloves: "Wearing",
    eyeProtection: "Wearing",
    faceShield: "N/A",
    respirator: "N/A",
    earProtection: "Wearing"
  },
  {
    id: "WRK-104",
    name: "Rajesh Prasad",
    trade: "Mason",
    contractor: "Tata Projects",
    location: "Level 1 - Core Block",
    floor: "Level 1",
    room: "Lobby",
    ppeStatus: "Warning",
    confidenceScore: 89.4,
    lastInspection: "2026-07-15 10:05",
    violationCount: 1,
    compliancePct: 88,
    helmet: "Wearing",
    vest: "Wearing",
    shoes: "Wearing",
    harness: "N/A",
    gloves: "Missing", // Minor violation
    eyeProtection: "Wearing",
    faceShield: "N/A",
    respirator: "Wearing",
    earProtection: "N/A"
  },
  {
    id: "WRK-105",
    name: "Karan Singh",
    trade: "Welder",
    contractor: "Shapoorji Pallonji",
    location: "Level 2 - Mechanical Room",
    floor: "Level 2",
    room: "Zone E",
    ppeStatus: "Compliant",
    confidenceScore: 97.8,
    lastInspection: "2026-07-15 09:30",
    violationCount: 0,
    compliancePct: 100,
    helmet: "Wearing",
    vest: "Wearing",
    shoes: "Wearing",
    harness: "N/A",
    gloves: "Wearing",
    eyeProtection: "Wearing",
    faceShield: "Wearing",
    respirator: "Wearing",
    earProtection: "Wearing"
  },
  {
    id: "WRK-106",
    name: "Amit Patel",
    trade: "Plumber",
    contractor: "L&T Construction",
    location: "Level 2 - Shaft Area",
    floor: "Level 2",
    room: "Zone C",
    ppeStatus: "Violated",
    confidenceScore: 91.5,
    lastInspection: "2026-07-15 10:20",
    violationCount: 2,
    compliancePct: 75,
    helmet: "Missing", // Critical ppe missing
    vest: "Wearing",
    shoes: "Wearing",
    harness: "N/A",
    gloves: "Missing",
    eyeProtection: "Wearing",
    faceShield: "N/A",
    respirator: "N/A",
    earProtection: "N/A"
  },
  {
    id: "WRK-107",
    name: "Sunita Roy",
    trade: "Safety Inspector",
    contractor: "TracProgress Admin",
    location: "Level 2 - East Wing",
    floor: "Level 2",
    room: "Zone A",
    ppeStatus: "Compliant",
    confidenceScore: 99.8,
    lastInspection: "2026-07-15 11:00",
    violationCount: 0,
    compliancePct: 100,
    helmet: "Wearing",
    vest: "Wearing",
    shoes: "Wearing",
    harness: "N/A",
    gloves: "Wearing",
    eyeProtection: "Wearing",
    faceShield: "N/A",
    respirator: "N/A",
    earProtection: "N/A"
  },
  {
    id: "WRK-108",
    name: "Gaurav Mehta",
    trade: "Concrete Pourer",
    contractor: "Tata Projects",
    location: "Level 1 - Core Block",
    floor: "Level 1",
    room: "Lobby",
    ppeStatus: "Warning",
    confidenceScore: 87.2,
    lastInspection: "2026-07-15 11:15",
    violationCount: 1,
    compliancePct: 90,
    helmet: "Wearing",
    vest: "Wearing",
    shoes: "Wearing",
    harness: "N/A",
    gloves: "Wearing",
    eyeProtection: "Missing", // Warning
    faceShield: "N/A",
    respirator: "N/A",
    earProtection: "N/A"
  },
  {
    id: "WRK-109",
    name: "Prem Chand",
    trade: "Rigger",
    contractor: "Shapoorji Pallonji",
    location: "Level 3 - Crane Loading",
    floor: "Level 3",
    room: "Loading Platform",
    ppeStatus: "Compliant",
    confidenceScore: 96.5,
    lastInspection: "2026-07-15 08:15",
    violationCount: 0,
    compliancePct: 100,
    helmet: "Wearing",
    vest: "Wearing",
    shoes: "Wearing",
    harness: "Wearing",
    gloves: "Wearing",
    eyeProtection: "Wearing",
    faceShield: "N/A",
    respirator: "N/A",
    earProtection: "N/A"
  },
  {
    id: "WRK-110",
    name: "Harish Rao",
    trade: "HVAC Installer",
    contractor: "Sterling & Wilson",
    location: "Level 2 - West Wing",
    floor: "Level 2",
    room: "Zone B",
    ppeStatus: "Violated",
    confidenceScore: 92.4,
    lastInspection: "2026-07-15 09:50",
    violationCount: 1,
    compliancePct: 85,
    helmet: "Wearing",
    vest: "Missing", // Violated
    shoes: "Wearing",
    harness: "N/A",
    gloves: "Wearing",
    eyeProtection: "Wearing",
    faceShield: "N/A",
    respirator: "N/A",
    earProtection: "N/A"
  }
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "INC-2026-001",
    title: "Slab Opening Edge Fall Hazard near West Elevator Shaft",
    category: "Fall from Height",
    severity: "Critical",
    date: "2026-07-12",
    time: "14:15",
    project: "Bangalore Tech Park - Block B",
    building: "Block B",
    floor: "Level 2",
    room: "Zone B",
    worker: "Amit Patel (WRK-106)",
    contractor: "L&T Construction",
    description: "Worker observed working within 0.5 meters of an un-barricaded edge near the core slab opening without securing a safety harness. Edge protection toe-boards had been removed to clear brick debris.",
    photos: ["https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400"],
    videos: [],
    witness: "Sunita Roy (Safety Inspector)",
    status: "Actioned",
    rootCause: "Temporary removal of standard floor safety barriers by scaffolding subcontractors without installing visual warning signs, combined with lack of direct supervision in High Risk Zone.",
    correctiveAction: "Re-installed standard wood railing barriers, cleared surrounding masonry trash, and suspended the area scaffold foreman for 2 shifts pending training verification.",
    preventiveAction: "Mandate digital Permit-to-Work release for any safety barrier dismantle, requiring photographic verification of alternative fall arrest nets.",
    approval: {
      status: "Approved",
      by: "V. Rangan (HSE Manager)",
      date: "2026-07-13"
    },
    history: [
      {
        status: "Open",
        updatedBy: "Sunita Roy",
        timestamp: "2026-07-12 14:20",
        comment: "AI alert generated and manually verified: scaffolding edge unguarded."
      },
      {
        status: "Investigating",
        updatedBy: "Sunita Roy",
        timestamp: "2026-07-12 15:00",
        comment: "Incident investigation logged, witness statement attached."
      },
      {
        status: "Actioned",
        updatedBy: "Amit Patel",
        timestamp: "2026-07-13 11:30",
        comment: "Subcontractor completed barrier repairs; HSE review requested."
      }
    ]
  },
  {
    id: "INC-2026-002",
    title: "Crane Cable Sway Near Structural Columns B4-B6",
    category: "Equipment Collision",
    severity: "High",
    date: "2026-07-14",
    time: "10:05",
    project: "Bangalore Tech Park - Block B",
    building: "Block B",
    floor: "Level 3",
    room: "Facade Shell C",
    worker: "Prem Chand (WRK-109)",
    contractor: "Shapoorji Pallonji",
    description: "Tower Crane hook-load experienced severe yaw sway due to sudden wind gusting. The concrete bucket package swerved within 1.2 meters of recently casted concrete columns.",
    photos: ["https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400"],
    status: "Investigating",
    rootCause: "Anemometer data was ignored by rigger team. Lifting continued when wind speeds exceeded the maximum authorized 18 knots ceiling.",
    correctiveAction: "Halt crane operations immediately. Disconnected bucket package and re-anchored crane boom.",
    preventiveAction: "Configure automated telemetry triggers that shut off crane hydraulics when weather station reports sustained wind speeds over 16 knots for 3 consecutive minutes.",
    approval: {
      status: "Pending"
    },
    history: [
      {
        status: "Open",
        updatedBy: "System AI",
        timestamp: "2026-07-14 10:06",
        comment: "Automatic telemetry alert: high speed lift swaying."
      }
    ]
  },
  {
    id: "INC-2026-003",
    title: "Exposed Electrical Cables in Substation Cable Trench",
    category: "Electrical",
    severity: "High",
    date: "2026-07-10",
    time: "16:40",
    project: "Bangalore Tech Park - Block B",
    building: "Block B",
    floor: "Level 1",
    room: "Substation",
    contractor: "Sterling & Wilson",
    description: "415V distribution lines found sitting in standing puddle water within the unsealed underground cable trench due to heavy pre-monsoon showers leaking through the temporary ply roof cover.",
    photos: [],
    status: "Closed",
    rootCause: "Poor site drainage path and faulty cable tray layouts combined with slow response of substation mechanical cover team.",
    correctiveAction: "Power deactivated, puddle pumped out with portable non-conducting dewatering pumps, and waterproof cement base applied to trench walls.",
    preventiveAction: "Sealed all trench conduit sleeves with expansive polyurethane foam sealant before monsoon cycle.",
    approval: {
      status: "Approved",
      by: "V. Rangan (HSE Manager)",
      date: "2026-07-11"
    },
    history: [
      {
        status: "Open",
        updatedBy: "Sanjay Kumar",
        timestamp: "2026-07-10 16:45",
        comment: "Reported during evening patrol. Red tags issued."
      },
      {
        status: "Closed",
        updatedBy: "V. Rangan",
        timestamp: "2026-07-11 14:00",
        comment: "Mitigation verified by safety department. Close-out form signed."
      }
    ]
  }
];

export const MOCK_NEAR_MISSES: NearMiss[] = [
  {
    id: "MS-001",
    title: "Rebar Shear Plate Slid off Loading Dock Platform",
    reporter: "Vikram Dev",
    contractor: "Tata Projects",
    date: "2026-07-14",
    time: "15:20",
    location: "Level 2 - Loading Platform B",
    description: "A 12kg carbon steel plate slipped off the unchained loading dock lip when forklift halted abruptly. The plate fell 6 meters, landing on an empty debris dumpster below. No worker was in the landing zone.",
    potentialSeverity: "High",
    rootCause: "Failure to lock the safety chain gate on the loading dock platform during rigging operations.",
    status: "Mitigated",
    assignedTo: "K. Reddy (Tata Projects)",
    mitigationAction: "Welded additional 150mm safety toe-guards on the steel loading dock lip and implemented mandatory forklift guide person."
  },
  {
    id: "MS-002",
    title: "Scaffold Coupling Bolt Failed on Level 3 Bracket",
    reporter: "Ananya Sen",
    contractor: "L&T Construction",
    date: "2026-07-13",
    time: "11:10",
    location: "Level 3 - External Facade",
    description: "During pipe scaffolding assembly, an oxidation-damaged coupling pin sheared under standard labor weight. The ledger bar dropped 400mm but stayed caught inside safety secondary ropes. Scaffolder remained secured to independent life line.",
    potentialSeverity: "Critical",
    rootCause: "Corroded scaffolding hardware was reused from old storage bins without undergoing QC inspection.",
    status: "Closed",
    assignedTo: "M. Fernandes (L&T)",
    mitigationAction: "Scraped the entire container lot of zinc couplings. Subcontractor issued 100% replacement using certified hot-dip galvanized coupler parts."
  },
  {
    id: "MS-003",
    title: "Drill Tool Dropped from Pipe Gallery Hanger",
    reporter: "Sanjay Kumar",
    contractor: "Sterling & Wilson",
    date: "2026-07-11",
    time: "09:30",
    location: "Level 2 - Corridor Zone D",
    description: "Pneumatic impact wrench slid from a cable tray hanger when worker reached for anchor bolts. The tool dangled on its rubber pressure hose, missing an passing helper's head by 30 centimeters.",
    potentialSeverity: "Medium",
    rootCause: "Tool tether was not attached to the worker's safety vest or scaffolding harness ring.",
    status: "Closed",
    assignedTo: "S. Murthy (MEP Lead)",
    mitigationAction: "Conducted mandatory tool-tethering box talks; issued retracting steel-wire tool lanyards to all high-level pipefitting crews."
  }
];

export const MOCK_HAZARDS: Hazard[] = [
  {
    id: "HAZ-001",
    hazardType: "Open Edge Slab Opening",
    riskLevel: "Critical",
    probability: "High",
    impact: "High",
    owner: "K. Reddy (Tata Projects)",
    mitigation: "Install high-visibility metal perimeter screens with double mid-rails and 150mm steel toe-boards.",
    reviewDate: "2026-07-20",
    status: "Open",
    location: "Level 2 - West Wing Corridor B",
    detectedBy: "AI Camera"
  },
  {
    id: "HAZ-002",
    hazardType: "Exposed Steel Rebar Starters",
    riskLevel: "High",
    probability: "High",
    impact: "Medium",
    owner: "M. Fernandes (L&T)",
    mitigation: "Cap all starter bars with high-visibility mushroom-style protective PVC strip caps.",
    reviewDate: "2026-07-17",
    status: "Mitigating",
    location: "Level 3 - Facade Column Starters",
    detectedBy: "Manual Audit"
  },
  {
    id: "HAZ-003",
    hazardType: "Combustible Ply Deck Stacking",
    riskLevel: "Medium",
    probability: "Low",
    impact: "High",
    owner: "K. Reddy (Tata Projects)",
    mitigation: "Re-locate ply stack at least 15 meters away from hot-work welding stations; deploy active 9kg CO2 dry powder extinguishers.",
    reviewDate: "2026-07-16",
    status: "Resolved",
    location: "Level 2 - Mechanical Room",
    detectedBy: "Drone Scan"
  },
  {
    id: "HAZ-004",
    hazardType: "Inadequate Lighting in Emergency Staircase B",
    riskLevel: "High",
    probability: "High",
    impact: "Medium",
    owner: "S. Murthy (Sterling & Wilson)",
    mitigation: "Install heavy-duty waterproof 24V LED strip lights powered by local battery backup panels.",
    reviewDate: "2026-07-18",
    status: "Open",
    location: "Staircase Core B - Level 1 to 3",
    detectedBy: "Manual Audit"
  },
  {
    id: "HAZ-005",
    hazardType: "Excavation Pit Missing Guardrails",
    riskLevel: "High",
    probability: "Medium",
    impact: "High",
    owner: "D. Roy (Excavation Contractor)",
    mitigation: "Erect standard heavy chain-link site barriers and place reflective solar caution flashers around pit perimeter.",
    reviewDate: "2026-07-16",
    status: "Mitigating",
    location: "Main Entry Road - Trench Block",
    detectedBy: "Drone Scan"
  }
];

export const MOCK_AUDITS: SafetyAudit[] = [
  {
    id: "AUD-001",
    auditType: "Scaffold Structural Safety Audit",
    auditor: "Sunita Roy (Certified Lead Auditor)",
    date: "2026-07-14",
    score: 82,
    status: "Passed",
    checklist: [
      { id: "Q1", question: "Scaffold foundation base-plates rest on solid, level mudsills without voids.", status: "Pass" },
      { id: "Q2", question: "Couplers and structural pipe bracing are tightly torqued to specified limits (35-50 Nm).", status: "Pass" },
      { id: "Q3", question: "Perimeter standard double handrails and steel toe-boards are fully installed.", status: "Fail", notes: "Zone B missing middle safety rails." },
      { id: "Q4", question: "Independent safety lifelines are rigged for all personnel working above 1.8m.", status: "Pass" },
      { id: "Q5", question: "Scaffold green tags are active and digitally signed within the past 7 days.", status: "Pass" }
    ],
    photos: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400"],
    comments: "Generally compliant scaffolding structure. Main issues found at Level 2 Zone B where subcontractors dismantled mid-rail tubes to accept plastering pallets. Remediation executed during the audit.",
    signatures: ["Auditor: Sunita Roy", "Scaffold Rep: M. Fernandes"],
    recommendations: "Perform daily shift briefings reminding teams that handrails must never be removed for material receipt without safety harness secondary ties."
  },
  {
    id: "AUD-002",
    auditType: "Electrical Temporary Power Installation Audit",
    auditor: "H. S. Sharma (Principal Electrical Assessor)",
    date: "2026-07-10",
    score: 64,
    status: "Failed",
    checklist: [
      { id: "Q1", question: "Temporary DB boards are weatherproof, enclosed, and locked with warning signs.", status: "Pass" },
      { id: "Q2", question: "Residual Current Devices (RCD / RCCB) 30mA protection is installed and tested.", status: "Fail", notes: "Substation DB-2 RCCB bypass jumpered." },
      { id: "Q3", question: "Power cables are elevated on hangers or safely sleeved under pedestrian ramps.", status: "Fail", notes: "Cables sitting in standing puddle water near core." },
      { id: "Q4", question: "Double earth loop rods are installed and verified under 2 ohms.", status: "Pass" },
      { id: "Q5", question: "Industrial plugs (IP67) are used for all hand tools and site machinery.", status: "Pass" }
    ],
    photos: [],
    comments: "Extremely serious safety findings regarding RCCB bypasses and water logging of power cords. Power suspended at DB-2 until contractor resolves items.",
    signatures: ["Auditor: H. S. Sharma", "Electrical Rep: S. Murthy"],
    recommendations: "RCCB bypasses constitute an automatic subcontractor warning penalty. Immediate audit of all other temporary distribution boards required."
  }
];

export const MOCK_CAMERAS: CameraStream[] = [
  {
    id: "CAM-L2-01",
    name: "CCTV Dome #204 - West Wing",
    location: "Level 2 - Zone B Work Area",
    status: "Online",
    activeViolationsCount: 1,
    liveFeedUrl: "https://example.com/stream/l2-01",
    feedType: "360 Video",
    resolution: "4K UHD @ 30fps"
  },
  {
    id: "CAM-L2-02",
    name: "CCTV Bullet #112 - Staircase Core",
    location: "Level 2 - Elevator Shaft Entrance",
    status: "Online",
    activeViolationsCount: 0,
    liveFeedUrl: "https://example.com/stream/l2-02",
    feedType: "Static Stream",
    resolution: "1080p FHD"
  },
  {
    id: "CAM-EXT-01",
    name: "Drone Quad-Stream #1 - External Shell",
    location: "Level 3 - External Scaffolding",
    status: "Online",
    activeViolationsCount: 2,
    liveFeedUrl: "https://example.com/stream/ext-01",
    feedType: "Drone Ortho",
    resolution: "4K UHD @ 60fps"
  },
  {
    id: "CAM-MCH-01",
    name: "CCTV Dome #401 - Mechanical Plant Room",
    location: "Level 2 - Mechanical HVAC Zone",
    status: "Maintenance",
    activeViolationsCount: 0,
    liveFeedUrl: "https://example.com/stream/mch-01",
    feedType: "Static Stream",
    resolution: "1080p FHD"
  }
];

export const MOCK_VIDEO_EVENTS: VideoEvent[] = [
  {
    id: "EVT-001",
    timestamp: 12,
    timestampStr: "00:12",
    type: "Missing Harness",
    severity: "Critical",
    description: "Worker detected on L3 Facade Scaffold Platform within 0.4 meters of open edge without a secure harness connection.",
    workerId: "WRK-102",
    confidence: 96.4,
    boundingBox: [220, 110, 120, 240],
    objectType: "Worker_At_Height",
    status: "Flagged"
  },
  {
    id: "EVT-002",
    timestamp: 28,
    timestampStr: "00:28",
    type: "Unsafe Scaffold Entry",
    severity: "High",
    description: "Worker climbed outer scaffold standards instead of utilizing the internal ladder hatch.",
    workerId: "WRK-102",
    confidence: 92.1,
    boundingBox: [240, 150, 110, 210],
    objectType: "Climbing_Scaffold",
    status: "Verified"
  },
  {
    id: "EVT-003",
    timestamp: 45,
    timestampStr: "00:45",
    type: "Missing Vest",
    severity: "Medium",
    description: "Subcontractor helper working without safety hi-visibility vest inside structural cage Zone B.",
    workerId: "WRK-110",
    confidence: 98.7,
    boundingBox: [550, 310, 130, 280],
    objectType: "Helper_No_Vest",
    status: "Resolved"
  },
  {
    id: "EVT-004",
    timestamp: 62,
    timestampStr: "01:02",
    type: "Worker Too Close to Crane",
    severity: "High",
    description: "Two steel fixers entered active crane boom radius while concrete bucket load was in dynamic descent.",
    workerId: "WRK-101",
    confidence: 89.2,
    boundingBox: [110, 220, 140, 260],
    objectType: "Crane_Proximity_Alert",
    status: "Verified"
  },
  {
    id: "EVT-005",
    timestamp: 80,
    timestampStr: "01:20",
    type: "Missing Helmet",
    severity: "Critical",
    description: "Plumber observed inside Core Lift lobby without protective hard helmet shell.",
    workerId: "WRK-106",
    confidence: 99.4,
    boundingBox: [410, 180, 100, 220],
    objectType: "Plumber_No_Helmet",
    status: "Flagged"
  },
  {
    id: "EVT-006",
    timestamp: 95,
    timestampStr: "01:35",
    type: "Confined Space Entry Violation",
    severity: "Critical",
    description: "Worker crawled inside underground cable trench without authorized permit to work scan.",
    workerId: "WRK-106",
    confidence: 95.8,
    boundingBox: [640, 200, 90, 150],
    objectType: "Confined_Space",
    status: "Flagged"
  }
];
