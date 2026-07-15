export interface CaptureSession {
  id: string;
  date: string;
  operator: string;
  project: string;
  building: string;
  floor: string;
  room: string;
  coordinates: string;
  duration: string;
  device: "360° Helmet Walk" | "Drone Mission" | "LiDAR Scan" | "Mobile Scan" | "Panorama Upload" | "Photogrammetry Session";
  weather: string;
  status: "Completed" | "Processing" | "Pending" | "Failed";
  alignmentConfidence: number;
  filesize: string;
  anomalyDetected: boolean;
}

export interface AlignmentCheckpoint {
  name: string;
  category: "Point Cloud" | "IFC Alignment" | "Coordinate Registration" | "Camera Pose" | "Mesh Registration";
  status: "Aligned" | "Optimizing" | "Calibrating" | "Failed";
  confidence: number;
  errorMarginMm: number;
  unresolvedClashes: number;
}

export interface ChangeDetectionItem {
  id: string;
  category: "Wall" | "Door" | "Window" | "Concrete" | "Rebar" | "HVAC" | "Electrical Conduit" | "Piping" | "Paint" | "Ceiling" | "Flooring";
  name: string;
  qtyBim: string;
  qtyPhysical: string;
  completionPct: number;
  missingWork: string;
  incorrectInstallation: string;
  trade: "Structural" | "Finishing" | "MEP" | "Facade";
  confidence: number;
  status: "Completed" | "In Progress" | "Deviation" | "Not Started";
  zone: string;
}

export interface TimelineDay {
  day: string;
  label: string;
  date: string;
  overallCompletion: number;
  structuralPct: number;
  mepPct: number;
  finishingPct: number;
  notableMilestone: string;
  scansCount: number;
  capturedBy: string;
  stats: {
    wallsCreated: number;
    pipesInstalled: number;
    concretePouredM3: number;
    issuesFlagged: number;
  };
}

export const CAPTURE_SESSIONS: CaptureSession[] = [
  {
    id: "CAP-001",
    date: "2026-07-12 09:30 AM",
    operator: "Rajesh Kumar",
    project: "Bangalore Tech Park - Block B",
    building: "Block B",
    floor: "Level 2",
    room: "Zone B (West Wing)",
    coordinates: "12.9716° N, 77.5946° E",
    duration: "42 min",
    device: "360° Helmet Walk",
    weather: "Clear, 28°C",
    status: "Completed",
    alignmentConfidence: 98.4,
    filesize: "4.2 GB",
    anomalyDetected: true
  },
  {
    id: "CAP-002",
    date: "2026-07-14 08:15 AM",
    operator: "Ananya Sen",
    project: "Bangalore Tech Park - Block B",
    building: "Block B",
    floor: "Roof & Facade",
    room: "Facade Shell C",
    coordinates: "12.9718° N, 77.5950° E",
    duration: "25 min",
    device: "Drone Mission",
    weather: "Sunny, 26°C, Wind 12km/h",
    status: "Completed",
    alignmentConfidence: 99.1,
    filesize: "12.8 GB",
    anomalyDetected: false
  },
  {
    id: "CAP-003",
    date: "2026-07-14 11:00 AM",
    operator: "Vikram Dev",
    project: "Bangalore Tech Park - Block B",
    building: "Block B",
    floor: "Level 1",
    room: "Server Room A & B",
    coordinates: "12.9715° N, 77.5942° E",
    duration: "55 min",
    device: "LiDAR Scan",
    weather: "Indoor (N/A)",
    status: "Processing",
    alignmentConfidence: 85.2,
    filesize: "18.5 GB",
    anomalyDetected: false
  },
  {
    id: "CAP-004",
    date: "2026-07-13 03:45 PM",
    operator: "Rohan Gupta",
    project: "Bangalore Tech Park - Block B",
    building: "Block B",
    floor: "Level 2",
    room: "Central Corridor",
    coordinates: "12.9716° N, 77.5944° E",
    duration: "18 min",
    device: "Mobile Scan",
    weather: "Indoor (N/A)",
    status: "Completed",
    alignmentConfidence: 94.6,
    filesize: "1.1 GB",
    anomalyDetected: true
  },
  {
    id: "CAP-005",
    date: "2026-07-11 10:20 AM",
    operator: "Karan Johar",
    project: "Bangalore Tech Park - Block B",
    building: "Block B",
    floor: "Level 3",
    room: "Mechanical Room 3C",
    coordinates: "12.9717° N, 77.5947° E",
    duration: "30 min",
    device: "Photogrammetry Session",
    weather: "Overcast, 24°C",
    status: "Completed",
    alignmentConfidence: 92.0,
    filesize: "6.7 GB",
    anomalyDetected: false
  },
  {
    id: "CAP-006",
    date: "2026-07-14 11:25 AM",
    operator: "Ananya Sen",
    project: "Bangalore Tech Park - Block B",
    building: "Block B",
    floor: "Level 2",
    room: "Zone C Structural Core",
    coordinates: "12.9719° N, 77.5949° E",
    duration: "15 min",
    device: "Panorama Upload",
    weather: "Indoor (N/A)",
    status: "Pending",
    alignmentConfidence: 0,
    filesize: "850 MB",
    anomalyDetected: false
  }
];

export const ALIGNMENT_CHECKPOINTS: AlignmentCheckpoint[] = [
  {
    name: "ICP Surface Point Cloud Match",
    category: "Point Cloud",
    status: "Aligned",
    confidence: 97.8,
    errorMarginMm: 4.2,
    unresolvedClashes: 0
  },
  {
    name: "IFC Component Mapping (L2 Slab)",
    category: "IFC Alignment",
    status: "Aligned",
    confidence: 96.5,
    errorMarginMm: 6.1,
    unresolvedClashes: 1
  },
  {
    name: "GPS & Control Points Anchor",
    category: "Coordinate Registration",
    status: "Aligned",
    confidence: 99.4,
    errorMarginMm: 1.8,
    unresolvedClashes: 0
  },
  {
    name: "Camera Pose Bundle Adjustment",
    category: "Camera Pose",
    status: "Optimizing",
    confidence: 91.2,
    errorMarginMm: 12.4,
    unresolvedClashes: 2
  },
  {
    name: "Mesh-to-BIM Shell Registration",
    category: "Mesh Registration",
    status: "Calibrating",
    confidence: 88.7,
    errorMarginMm: 18.5,
    unresolvedClashes: 4
  }
];

export const CHANGE_DETECTION_ITEMS: ChangeDetectionItem[] = [
  {
    id: "DET-101",
    category: "Rebar",
    name: "L2 Column Structural Rebar Cage",
    qtyBim: "1200 kg Fe550D",
    qtyPhysical: "1150 kg Fe550D",
    completionPct: 95.8,
    missingWork: "2 column stirrups missing in Zone B",
    incorrectInstallation: "Spacing deviation exceeding 25mm on L2-C04",
    trade: "Structural",
    confidence: 98.2,
    status: "Deviation",
    zone: "Level 2 Zone B"
  },
  {
    id: "DET-102",
    category: "Concrete",
    name: "Level 2 Floor Slab Pour",
    qtyBim: "450 m³ M35",
    qtyPhysical: "450 m³ M35",
    completionPct: 100,
    missingWork: "None",
    incorrectInstallation: "None",
    trade: "Structural",
    confidence: 99.5,
    status: "Completed",
    zone: "Level 2 Zone A & B"
  },
  {
    id: "DET-103",
    category: "Wall",
    name: "Internal AAC Block Masonry Partition",
    qtyBim: "340 m² Walls",
    qtyPhysical: "280 m² Walls",
    completionPct: 82.3,
    missingWork: "60 m² remaining in Server Room B corridor",
    incorrectInstallation: "None",
    trade: "Finishing",
    confidence: 94.7,
    status: "In Progress",
    zone: "Level 2 Server Room Corridor"
  },
  {
    id: "DET-104",
    category: "HVAC",
    name: "Primary Ducting & VAV Dampers",
    qtyBim: "85 linear meters",
    qtyPhysical: "52 linear meters",
    completionPct: 61.1,
    missingWork: "33 meters ducting run to West Wing terminal boxes",
    incorrectInstallation: "Collision detected with Fire Sprinkler Line 2B-FS-12",
    trade: "MEP",
    confidence: 96.1,
    status: "Deviation",
    zone: "Level 2 West Wing"
  },
  {
    id: "DET-105",
    category: "Electrical Conduit",
    name: "Slab Embedded PVC Conduits",
    qtyBim: "1200 meters",
    qtyPhysical: "1200 meters",
    completionPct: 100,
    missingWork: "None",
    incorrectInstallation: "None",
    trade: "MEP",
    confidence: 97.4,
    status: "Completed",
    zone: "Level 2 Ceiling Slab Core"
  },
  {
    id: "DET-106",
    category: "Piping",
    name: "Chilled Water Pipe Lines",
    qtyBim: "45 linear meters",
    qtyPhysical: "10 linear meters",
    completionPct: 22.2,
    missingWork: "35 meters supply and return piping remaining",
    incorrectInstallation: "None",
    trade: "MEP",
    confidence: 93.8,
    status: "In Progress",
    zone: "Level 2 Mechanical Room"
  }
];

export const TIMELINE_HISTORY: TimelineDay[] = [
  {
    day: "Day 1",
    label: "Excavation & Footing",
    date: "2026-04-10",
    overallCompletion: 5.2,
    structuralPct: 12.0,
    mepPct: 0,
    finishingPct: 0,
    notableMilestone: "Footing excavation complete, PCC poured.",
    scansCount: 4,
    capturedBy: "Drone Flight 1",
    stats: {
      wallsCreated: 0,
      pipesInstalled: 0,
      concretePouredM3: 45,
      issuesFlagged: 0
    }
  },
  {
    day: "Day 7",
    label: "Foundation Casting",
    date: "2026-04-17",
    overallCompletion: 14.5,
    structuralPct: 35.2,
    mepPct: 2.1,
    finishingPct: 0,
    notableMilestone: "Foundation rafts casted, earthing system verified.",
    scansCount: 6,
    capturedBy: "Drone + Mobile Walk",
    stats: {
      wallsCreated: 0,
      pipesInstalled: 12,
      concretePouredM3: 310,
      issuesFlagged: 1
    }
  },
  {
    day: "Day 15",
    label: "Level 1 Columns",
    date: "2026-05-02",
    overallCompletion: 28.0,
    structuralPct: 62.1,
    mepPct: 8.5,
    finishingPct: 0,
    notableMilestone: "Level 1 structural columns poured and cured.",
    scansCount: 9,
    capturedBy: "360 Walk + Drone",
    stats: {
      wallsCreated: 0,
      pipesInstalled: 45,
      concretePouredM3: 150,
      issuesFlagged: 2
    }
  },
  {
    day: "Day 30",
    label: "Level 1 Slab & Level 2 Rebar",
    date: "2026-05-17",
    overallCompletion: 42.1,
    structuralPct: 81.4,
    mepPct: 18.0,
    finishingPct: 2.5,
    notableMilestone: "Level 1 ceiling slab poured, Level 2 column reinforcement initiated.",
    scansCount: 12,
    capturedBy: "Drone + Helmet",
    stats: {
      wallsCreated: 15,
      pipesInstalled: 120,
      concretePouredM3: 280,
      issuesFlagged: 3
    }
  },
  {
    day: "Month 2",
    label: "Level 2 Slab Pour & MEP",
    date: "2026-06-10",
    overallCompletion: 58.4,
    structuralPct: 94.0,
    mepPct: 38.2,
    finishingPct: 12.0,
    notableMilestone: "Level 2 ceiling slab poured, MEP vertical riser lines aligned.",
    scansCount: 18,
    capturedBy: "Multi-operator Scan",
    stats: {
      wallsCreated: 48,
      pipesInstalled: 320,
      concretePouredM3: 450,
      issuesFlagged: 5
    }
  },
  {
    day: "Month 6",
    label: "Masonry & Core Utilities",
    date: "2026-07-14",
    overallCompletion: 72.4,
    structuralPct: 100,
    mepPct: 68.4,
    finishingPct: 45.1,
    notableMilestone: "Internal AAC blocks 90% completed, main HVAC ducts 80% run.",
    scansCount: 24,
    capturedBy: "Daily Reality Capture",
    stats: {
      wallsCreated: 142,
      pipesInstalled: 580,
      concretePouredM3: 120,
      issuesFlagged: 4
    }
  },
  {
    day: "Year 1",
    label: "Target Completion (RERA Audit)",
    date: "2026-10-30",
    overallCompletion: 100,
    structuralPct: 100,
    mepPct: 100,
    finishingPct: 100,
    notableMilestone: "Commercial handover, RERA certification clearance.",
    scansCount: 0,
    capturedBy: "Final Handover Audit",
    stats: {
      wallsCreated: 310,
      pipesInstalled: 1200,
      concretePouredM3: 0,
      issuesFlagged: 0
    }
  }
];
