export interface WorkerPPEState {
  id: string;
  name: string;
  trade: string;
  contractor: string;
  location: string;
  floor: string;
  room: string;
  ppeStatus: "Compliant" | "Violated" | "Warning";
  confidenceScore: number;
  lastInspection: string;
  violationCount: number;
  compliancePct: number;
  helmet: "Wearing" | "Missing" | "N/A";
  vest: "Wearing" | "Missing" | "N/A";
  shoes: "Wearing" | "Missing" | "N/A";
  harness: "Wearing" | "Missing" | "N/A";
  gloves: "Wearing" | "Missing" | "N/A";
  eyeProtection: "Wearing" | "Missing" | "N/A";
  faceShield: "Wearing" | "Missing" | "N/A";
  respirator: "Wearing" | "Missing" | "N/A";
  earProtection: "Wearing" | "Missing" | "N/A";
}

export interface Incident {
  id: string;
  title: string;
  category: "Fall from Height" | "Struck by Object" | "Equipment Collision" | "Electrical" | "Fire" | "Excavation" | "Confined Space" | "Hazardous Material" | "Other";
  severity: "Critical" | "High" | "Medium" | "Low";
  date: string;
  time: string;
  project: string;
  building: string;
  floor: string;
  room: string;
  worker?: string;
  contractor: string;
  description: string;
  photos: string[];
  videos?: string[];
  witness?: string;
  status: "Open" | "Investigating" | "Actioned" | "Approved" | "Closed";
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  approval: {
    status: "Pending" | "Approved" | "Rejected";
    by?: string;
    date?: string;
  };
  history: Array<{
    status: string;
    updatedBy: string;
    timestamp: string;
    comment: string;
  }>;
}

export interface NearMiss {
  id: string;
  title: string;
  reporter: string;
  contractor: string;
  date: string;
  time: string;
  location: string;
  description: string;
  potentialSeverity: "Critical" | "High" | "Medium" | "Low";
  rootCause: string;
  status: "Reported" | "Under Investigation" | "Mitigated" | "Closed";
  assignedTo?: string;
  mitigationAction?: string;
}

export interface Hazard {
  id: string;
  hazardType: string;
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  probability: "High" | "Medium" | "Low";
  impact: "High" | "Medium" | "Low";
  owner: string;
  mitigation: string;
  reviewDate: string;
  status: "Open" | "Mitigating" | "Resolved";
  location: string;
  detectedBy: "AI Camera" | "Manual Audit" | "Drone Scan";
}

export interface SafetyAudit {
  id: string;
  auditType: string;
  auditor: string;
  date: string;
  score: number;
  status: "Draft" | "Submitted" | "Passed" | "Failed";
  checklist: Array<{
    id: string;
    question: string;
    status: "Pass" | "Fail" | "N/A";
    notes?: string;
  }>;
  photos: string[];
  comments: string;
  signatures: string[];
  recommendations: string;
}

export interface CameraStream {
  id: string;
  name: string;
  location: string;
  status: "Online" | "Offline" | "Maintenance";
  activeViolationsCount: number;
  liveFeedUrl?: string;
  feedType: "360 Video" | "Static Stream" | "Drone Ortho";
  resolution: string;
}

export interface VideoEvent {
  id: string;
  timestamp: number;
  timestampStr: string;
  type: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  workerId?: string;
  confidence: number;
  boundingBox?: [number, number, number, number];
  objectType: string;
  status: "Flagged" | "Verified" | "Ignored" | "Resolved";
}
