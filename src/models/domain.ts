export interface Organization {
  id: string;
  name: string;
  type: string;
  licenseNo: string;
  domain: string;
  establishedDate: string;
  headquarters: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  totalCost: string;
  reraId: string;
  constructionArea: string;
  targetDate: string;
  overallProgress: number;
  status: "active" | "completed" | "delayed" | "planning";
}

export interface Building {
  id: string;
  projectId: string;
  name: string;
  totalFloors: number;
  status: "completed" | "under_construction" | "planning";
  footprintArea: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  name: string;
  status: "completed" | "in_progress" | "delayed" | "not_started";
  completionPercentage: number;
  sequence: number;
}

export interface Room {
  id: string;
  floorId: string;
  name: string;
  type: string;
  progress: number;
  status: "completed" | "in_progress" | "not_started";
}

export interface Trade {
  id: string;
  name: string;
  code: string;
  activeWorkers: number;
  contractor: string;
  headCount: number;
}

export interface Schedule {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "completed" | "in_progress" | "delayed" | "not_started";
  criticalPath: boolean;
  assignedTradeId?: string;
  dependsOn?: string[];
}

export interface Issue {
  id: string;
  elementId: string;
  elementName: string;
  category: "Reinforcement" | "MEP Collision" | "Geometric Shift" | "Missing Part";
  title: string;
  description: string;
  level: "low" | "medium" | "high" | "critical";
  deviation: string;
  possibleCause: string;
  status: "open" | "resolved" | "monitoring";
  detectedAt: string;
  assignedTradeId?: string;
  remediationPlan?: string;
}

export interface Document {
  id: string;
  name: string;
  type: "video" | "laser" | "cad" | "report";
  size: string;
  date: string;
  uploader: string;
  status: string;
}

export interface Photo {
  id: string;
  url: string;
  capturedAt: string;
  caption: string;
  tag: string;
  projectId: string;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: "active" | "inactive";
  streamUrl?: string;
}

export interface Inspection {
  id: string;
  projectId: string;
  date: string;
  inspector: string;
  passed: boolean;
  checklistCount: number;
  comments: string;
}

export interface Worker {
  id: string;
  name: string;
  tradeId: string;
  role: string;
  contact: string;
  status: "active" | "on_leave" | "inactive";
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "alert" | "warning" | "info";
  read: boolean;
}

export interface Analytics {
  id: string;
  projectId: string;
  category: "progress" | "cost" | "safety" | "quality";
  metrics: Record<string, number | string | any>;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: "active" | "inactive";
}

export interface Permission {
  id: string;
  role: string;
  resource: string;
  actions: ("create" | "read" | "update" | "delete")[];
}
